import os
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.preprocessing import PreprocessingPipeline, FEATURE_NAMES
from app.ml_service import (
    predict_single_customer,
    determine_risk_level,
    determine_segment,
    clear_ml_cache,
)
import importlib

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

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_pipeline(tmp_path_factory):
    """Ensure data is generated and models are trained for test session"""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    raw_path = os.path.join(base_dir, "data", "raw", "test_customers.csv")
    proc_path = os.path.join(base_dir, "data", "processed", "customers_cleaned.csv")
    model_dir = os.path.join(base_dir, "model")
    scaler_path = os.path.join(model_dir, "scaler.pkl")

    # Generate synthetic data
    generate_synthetic_data(500, raw_path)
    
    # Preprocess
    preprocess_dataset(raw_path, proc_path, scaler_path)
    
    # Train & Evaluate
    train_models(proc_path, model_dir)
    evaluate_models(model_dir)
    run_global_shap_analysis(model_dir)
    
    clear_ml_cache()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_validation_script():
    df = pd.DataFrame({
        "customer_id": ["C1", "C2", "C3"],
        "age": [30, 45, 29],
        "plan": ["Basic", "Standard", "Premium"],
        "tenure_months": [12, 6, 24],
        "monthly_bill": [499.0, 899.0, 1499.0],
        "monthly_usage_hours": [40.0, 50.0, 60.0],
        "usage_change_pct": [-10.0, 5.0, 0.0],
        "login_frequency": [5, 7, 8],
        "complaint_count": [1, 0, 2],
        "open_complaints": [0, 0, 1],
        "avg_resolution_days": [2.5, 1.0, 3.0],
        "payment_delay_days": [0, 2, 5],
        "payment_failures": [0, 0, 1],
        "plan_changes": [0, 1, 0],
        "engagement_score": [75.0, 80.0, 60.0],
        "satisfaction_score": [4.0, 5.0, 3.0],
        "churn": [0, 0, 1]
    })
    report = validate_dataset(df)
    assert report["data_quality_score"] > 90
    assert report["total_rows"] == 3
    assert report["duplicate_count"] == 0

def test_preprocessing_pipeline():
    df = pd.DataFrame({
        "customer_id": ["C1"],
        "age": [35],
        "plan": ["Enterprise"],
        "tenure_months": [18],
        "monthly_bill": [2999.0],
        "monthly_usage_hours": [85.0],
        "usage_change_pct": [-35.0],
        "login_frequency": [10],
        "complaint_count": [4],
        "open_complaints": [1],
        "avg_resolution_days": [6.0],
        "payment_delay_days": [14],
        "payment_failures": [2],
        "plan_changes": [1],
        "engagement_score": [30.0],
        "satisfaction_score": [2.0],
    })
    pipe = PreprocessingPipeline()
    X = pipe.fit_transform(df)
    assert X.shape == (1, 15)

def test_predict_single_customer():
    sample_customer = {
        "customer_id": "C9999",
        "age": 42,
        "plan": "Enterprise",
        "tenure_months": 8,
        "monthly_bill": 2400.0,
        "monthly_usage_hours": 30.0,
        "usage_change_pct": -45.0,
        "login_frequency": 2,
        "complaint_count": 4,
        "open_complaints": 2,
        "avg_resolution_days": 8.5,
        "payment_delay_days": 18,
        "payment_failures": 2,
        "plan_changes": 2,
        "engagement_score": 25.0,
        "satisfaction_score": 1.5,
    }
    
    result = predict_single_customer(sample_customer)
    
    assert result.customer_id == "C9999"
    assert 0.0 <= result.churn_probability <= 100.0
    assert result.risk_level in ["Low", "Medium", "High"]
    assert result.segment in ["Loyal", "At Risk", "High Risk", "High Value", "New"]
    assert len(result.top_drivers) >= 3
    assert len(result.recommendations) >= 1
    assert result.top_drivers[0].direction in ["risk_increasing", "risk_decreasing"]

def test_api_predict_endpoint():
    sample_payload = {
        "customer_id": "C1024",
        "age": 34,
        "plan": "Premium",
        "tenure_months": 15,
        "monthly_bill": 1499.0,
        "monthly_usage_hours": 42.0,
        "usage_change_pct": -15.0,
        "login_frequency": 6,
        "complaint_count": 1,
        "open_complaints": 0,
        "avg_resolution_days": 2.5,
        "payment_delay_days": 3,
        "payment_failures": 0,
        "plan_changes": 0,
        "engagement_score": 68.0,
        "satisfaction_score": 4.0,
    }
    response = client.post("/predict", json=sample_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "C1024"
    assert "churn_probability" in data
    assert "top_drivers" in data
    assert "recommendations" in data

def test_api_model_metrics():
    response = client.get("/model-metrics")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert len(data["models"]) >= 3
    assert "confusionMatrix" in data
    assert "selectedModel" in data
    
    # Check that at least one model is selected
    selected = [m for m in data["models"] if m.get("isSelected")]
    assert len(selected) == 1
