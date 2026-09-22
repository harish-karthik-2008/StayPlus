import os
import io
import json
import shutil
from datetime import datetime, timezone
from typing import List, Dict, Any, Union, Optional
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    CustomerRecord,
    ChurnPredictionResponse,
    UploadResponse,
    DataQualityReport,
    ModelMetricsResponse,
    RevenueAtRiskResponse,
)
from .ml_service import (
    predict_single_customer,
    predict_batch_customers,
    clear_ml_cache,
    determine_risk_level,
)
import importlib

# Dynamic imports for numbered script modules
validate_mod = importlib.import_module("scripts.01_validate")
validate_dataset = validate_mod.validate_dataset

preprocess_mod = importlib.import_module("scripts.02_preprocess")
preprocess_dataset = preprocess_mod.preprocess_dataset

train_mod = importlib.import_module("scripts.04_train")
train_models = train_mod.train_models

evaluate_mod = importlib.import_module("scripts.05_evaluate")
evaluate_models = evaluate_mod.evaluate_models

shap_mod = importlib.import_module("scripts.06_shap_analysis")
run_global_shap_analysis = shap_mod.run_global_shap_analysis

synth_mod = importlib.import_module("scripts.00_generate_synthetic")
generate_synthetic_data = synth_mod.generate_synthetic_data

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODEL_DIR = os.path.join(BASE_DIR, "model")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(RAW_DATA_DIR, exist_ok=True)
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

app = FastAPI(
    title="StayPlus ChurnGuard AI Backend",
    description="ML-powered customer churn prediction and retention engine with SHAP explainability",
    version="1.0.0",
)

# Enable CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for recent batch prediction cache (for revenue-at-risk endpoint)
_LATEST_BATCH_CACHE: List[Dict[str, Any]] = []

def get_latest_processed_csv() -> str:
    cleaned_file = os.path.join(PROCESSED_DATA_DIR, "customers_cleaned.csv")
    if os.path.exists(cleaned_file):
        return cleaned_file

    # Fallback to any raw file or synthetic
    raw_files = [os.path.join(RAW_DATA_DIR, f) for f in os.listdir(RAW_DATA_DIR) if f.endswith(".csv")]
    if raw_files:
        latest_raw = max(raw_files, key=os.path.getmtime)
        return preprocess_dataset(
            latest_raw,
            output_csv_path=cleaned_file,
            scaler_output_path=os.path.join(MODEL_DIR, "scaler.pkl")
        )
    
    # Generate synthetic if empty
    synth_path = os.path.join(RAW_DATA_DIR, "stayplus_synthetic_3000.csv")
    generate_synthetic_data(3000, synth_path)
    preprocess_dataset(
        synth_path,
        output_csv_path=cleaned_file,
        scaler_output_path=os.path.join(MODEL_DIR, "scaler.pkl")
    )
    return cleaned_file

@app.get("/health")
def health_check():
    """Health check endpoint confirming API service status"""
    return {
        "status": "healthy",
        "service": "StayPlus ChurnGuard AI Engine",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@app.post("/upload-dataset", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...), company_id: Optional[str] = "comp_default"):
    """
    Multipart CSV dataset upload endpoint:
    - Saves raw CSV as {company_id}_{timestamp}.csv
    - Runs 01_validate to generate data quality score
    - Runs 02_preprocess to clean and prepare dataset
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV file: {str(e)}")

    timestamp = int(datetime.now(timezone.utc).timestamp())
    raw_filename = f"{company_id}_{timestamp}.csv"
    raw_save_path = os.path.join(RAW_DATA_DIR, raw_filename)
    df.to_csv(raw_save_path, index=False)

    # 1. Validation & Data Quality Report
    report_dict = validate_dataset(df)

    # 2. Preprocess
    processed_save_path = os.path.join(PROCESSED_DATA_DIR, "customers_cleaned.csv")
    scaler_save_path = os.path.join(MODEL_DIR, "scaler.pkl")
    preprocess_dataset(raw_save_path, processed_save_path, scaler_save_path)

    # Data preview (first 5 rows)
    preview_rows = df.head(5).to_dict(orient="records")

    return UploadResponse(
        message="Dataset uploaded, validated, and preprocessed successfully.",
        filename=raw_filename,
        row_count=len(df),
        column_count=len(df.columns),
        data_quality_report=DataQualityReport(**report_dict),
        preview=preview_rows,
    )

@app.post("/train", response_model=ModelMetricsResponse)
def train_pipeline():
    """
    Triggers complete model training and evaluation:
    - Stratified 80/20 train/test split
    - Trains Logistic Regression, Random Forest, and XGBoost with class-weighting
    - Evaluates accuracy, precision, recall, f1, rocAuc, confusion matrix
    - Automatically marks best model and generates global SHAP analysis
    """
    processed_path = get_latest_processed_csv()
    
    # Train
    train_models(processed_path, model_dir=MODEL_DIR)
    
    # Evaluate
    metrics = evaluate_models(model_dir=MODEL_DIR)
    
    # SHAP Analysis
    run_global_shap_analysis(model_dir=MODEL_DIR, reports_dir=REPORTS_DIR)
    
    # Clear cached model in ml_service
    clear_ml_cache()

    return ModelMetricsResponse(**metrics)

@app.get("/model-metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    """Returns the latest evaluated model metrics and confusion matrix"""
    metrics_path = os.path.join(MODEL_DIR, "metrics.json")
    if not os.path.exists(metrics_path):
        # Trigger quick initial training if metrics.json does not exist
        return train_pipeline()

    with open(metrics_path, "r", encoding="utf-8") as f:
        metrics = json.load(f)
    return ModelMetricsResponse(**metrics)

@app.post("/predict", response_model=ChurnPredictionResponse)
def predict_churn(customer: CustomerRecord):
    """
    Real-time single customer churn prediction:
    - Returns churn risk probability (0-100%)
    - Risk level (Low / Medium / High)
    - Top 3-5 SHAP churn drivers with impact and direction
    - Segment (Loyal, At Risk, High Risk, High Value, New)
    - Tailored business recommendations
    """
    try:
        cust_dict = customer.model_dump()
        result = predict_single_customer(cust_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

from fastapi import Request

@app.post("/predict-batch", response_model=List[ChurnPredictionResponse])
async def predict_batch(request: Request):
    """
    Batch prediction endpoint supporting:
    - Raw JSON array of customer records: `[{...}, {...}]`
    - JSON payload with customers key: `{"customers": [...]}`
    - Multipart CSV upload with field 'file'
    """
    global _LATEST_BATCH_CACHE

    df = None
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        if uploaded_file and hasattr(uploaded_file, "read"):
            contents = await uploaded_file.read()
            try:
                df = pd.read_csv(io.BytesIO(contents))
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid CSV file: {str(e)}")
    else:
        try:
            body_json = await request.json()
            if isinstance(body_json, list):
                df = pd.DataFrame(body_json)
            elif isinstance(body_json, dict) and "customers" in body_json:
                df = pd.DataFrame(body_json["customers"])
            elif isinstance(body_json, dict):
                df = pd.DataFrame([body_json])
        except Exception:
            pass

    if df is None or df.empty:
        raise HTTPException(
            status_code=400,
            detail="Must provide either a JSON array of customer records or a multipart CSV file."
        )

    try:
        predictions = predict_batch_customers(df)
        _LATEST_BATCH_CACHE = [p.model_dump() for p in predictions]
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

@app.get("/revenue-at-risk", response_model=RevenueAtRiskResponse)
def get_revenue_at_risk():
    """
    Calculates total Monthly Bill revenue at risk from High + Medium risk customers
    based on the latest batch predictions or processed dataset.
    """
    global _LATEST_BATCH_CACHE

    if not _LATEST_BATCH_CACHE:
        # Generate batch from current processed dataset
        processed_path = get_latest_processed_csv()
        df = pd.read_csv(processed_path)
        predictions = predict_batch_customers(df.head(500))
        _LATEST_BATCH_CACHE = [p.model_dump() for p in predictions]

    total_revenue_at_risk = 0.0
    retention_opp = 0.0
    high_count = 0
    med_count = 0
    low_count = 0

    for pred in _LATEST_BATCH_CACHE:
        bill = float(pred.get("monthly_bill") or 0.0)
        risk = pred.get("risk_level", "Low")
        churn_p = float(pred.get("churn_probability", 0.0))

        if risk == "High":
            high_count += 1
            total_revenue_at_risk += bill
            retention_opp += bill * (churn_p / 100.0) * 0.70
        elif risk == "Medium":
            med_count += 1
            total_revenue_at_risk += bill * 0.60
            retention_opp += bill * (churn_p / 100.0) * 0.50
        else:
            low_count += 1

    return RevenueAtRiskResponse(
        revenueAtRisk=round(total_revenue_at_risk, 2),
        retentionOpportunity=round(retention_opp, 2),
        highRiskCount=high_count,
        mediumRiskCount=med_count,
        lowRiskCount=low_count,
        totalCustomersEvaluated=len(_LATEST_BATCH_CACHE),
    )
