import os
import joblib
import functools
import numpy as np
import pandas as pd
import shap
from typing import List, Dict, Any, Tuple, Optional
from .schemas import (
    CustomerRecord,
    ChurnPredictionResponse,
    ChurnDriverImpact,
    RiskLevel,
    CustomerSegment,
)
from .preprocessing import PreprocessingPipeline, FEATURE_NAMES
from .recommendation_engine import (
    generate_customer_recommendations,
    get_recommended_action_summary,
)

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "model"))
BEST_MODEL_PATH = os.path.join(MODEL_DIR, "best_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")

FEATURE_DESCRIPTIONS: Dict[str, Dict[str, str]] = {
    "usage_change_pct": {
        "increasing": "Usage dropped by {val:.1f}% recently",
        "decreasing": "Usage trend is positive (+{val:.1f}%)",
    },
    "complaint_count": {
        "increasing": "High support complaints logged ({val:.0f} tickets)",
        "decreasing": "Low complaint count ({val:.0f} tickets)",
    },
    "payment_delay_days": {
        "increasing": "{val:.0f} days average payment delay",
        "decreasing": "Timely invoice settlement ({val:.0f} days delay)",
    },
    "engagement_score": {
        "increasing": "Low platform engagement index ({val:.0f}%)",
        "decreasing": "Strong platform engagement ({val:.0f}%)",
    },
    "satisfaction_score": {
        "increasing": "Low satisfaction rating ({val:.1f}/5)",
        "decreasing": "High customer satisfaction rating ({val:.1f}/5)",
    },
    "tenure_months": {
        "increasing": "Early lifecycle stage ({val:.0f} months tenure)",
        "decreasing": "Established long-term customer ({val:.0f} months)",
    },
    "monthly_bill": {
        "increasing": "High monthly billing burden (₹{val:,.0f})",
        "decreasing": "Competitive plan pricing (₹{val:,.0f})",
    },
    "open_complaints": {
        "increasing": "{val:.0f} unresolved support tickets open",
        "decreasing": "Zero open complaints pending",
    },
    "payment_failures": {
        "increasing": "{val:.0f} recent payment failure events",
        "decreasing": "Flawless payment execution",
    },
    "monthly_usage_hours": {
        "increasing": "Low active usage ({val:.1f} hrs/month)",
        "decreasing": "Heavy active usage ({val:.1f} hrs/month)",
    },
    "login_frequency": {
        "increasing": "Low weekly login activity ({val:.0f} logins/week)",
        "decreasing": "Frequent active logins ({val:.0f} logins/week)",
    },
    "avg_resolution_days": {
        "increasing": "Slow ticket resolution time ({val:.1f} days avg)",
        "decreasing": "Fast issue resolution turnaround",
    },
    "plan_changes": {
        "increasing": "Frequent plan modifications ({val:.0f} changes)",
        "decreasing": "Stable plan subscription",
    },
    "age": {
        "increasing": "Demographic risk factor (Age {val:.0f})",
        "decreasing": "Stable customer demographic (Age {val:.0f})",
    },
    "plan": {
        "increasing": "Plan tier vulnerability",
        "decreasing": "Optimal plan alignment",
    },
}

@functools.lru_cache(maxsize=1)
def get_preprocessor() -> PreprocessingPipeline:
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(
            f"Scaler/preprocessor artifact not found at {SCALER_PATH}. Please run training pipeline first."
        )
    return PreprocessingPipeline.load(SCALER_PATH)

@functools.lru_cache(maxsize=1)
def get_model() -> Any:
    if not os.path.exists(BEST_MODEL_PATH):
        # Fallback check for any model in directory
        for fallback in ["xgboost_model.pkl", "random_forest.pkl", "logistic_regression.pkl"]:
            fb_path = os.path.join(MODEL_DIR, fallback)
            if os.path.exists(fb_path):
                return joblib.load(fb_path)
        raise FileNotFoundError(
            f"Best model artifact not found at {BEST_MODEL_PATH}. Please run training pipeline first."
        )
    return joblib.load(BEST_MODEL_PATH)

@functools.lru_cache(maxsize=1)
def get_shap_explainer() -> Any:
    model = get_model()
    # If model is XGBoost or RandomForest, use TreeExplainer
    model_name = type(model).__name__.lower()
    if "xgb" in model_name or "forest" in model_name or "tree" in model_name:
        return shap.TreeExplainer(model)
    else:
        # For linear or other models
        # Create small background sample if possible
        background = np.zeros((1, len(FEATURE_NAMES)))
        return shap.Explainer(model, background)

def clear_ml_cache():
    """Clear cached model and explainer after new training"""
    get_preprocessor.cache_clear()
    get_model.cache_clear()
    get_shap_explainer.cache_clear()

def determine_segment(
    churn_probability: float,
    tenure_months: int,
    monthly_bill: float
) -> CustomerSegment:
    """
    Segmentation rules:
    - New: tenure < 3 months
    - High Risk: churn >= 70%
    - High Value: monthly_bill >= 1200 and churn < 70%
    - At Risk: 35 <= churn < 70%
    - Loyal: churn < 35%
    """
    if tenure_months < 3:
        return "New"
    if churn_probability >= 70:
        return "High Risk"
    if monthly_bill >= 1200:
        return "High Value"
    if churn_probability >= 35:
        return "At Risk"
    return "Loyal"

def determine_risk_level(churn_probability: float) -> RiskLevel:
    if churn_probability >= 70:
        return "High"
    if churn_probability >= 35:
        return "Medium"
    return "Low"

def format_driver_name(feature_name: str) -> str:
    name_map = {
        "usage_change_pct": "Usage Decline",
        "complaint_count": "Support Complaints",
        "payment_delay_days": "Payment Delay",
        "engagement_score": "Low Engagement",
        "satisfaction_score": "Customer Satisfaction",
        "tenure_months": "Customer Tenure",
        "monthly_bill": "Monthly Bill",
        "open_complaints": "Open Complaints",
        "payment_failures": "Payment Failures",
        "monthly_usage_hours": "Usage Volume",
        "login_frequency": "Login Frequency",
        "avg_resolution_days": "Resolution Speed",
        "plan_changes": "Plan Fluctuations",
        "age": "Customer Age",
        "plan": "Subscription Plan",
    }
    return name_map.get(feature_name, feature_name.replace("_", " ").title())

def format_driver_description(feature_name: str, raw_val: Any, is_risk_increasing: bool) -> str:
    desc_template = FEATURE_DESCRIPTIONS.get(feature_name, {})
    key = "increasing" if is_risk_increasing else "decreasing"
    template = desc_template.get(key, f"{feature_name}: {raw_val}")
    try:
        if isinstance(raw_val, (int, float)):
            return template.format(val=abs(raw_val))
        return template.format(val=raw_val)
    except Exception:
        return f"{feature_name}: {raw_val}"

def predict_single_customer(
    customer_data: Dict[str, Any]
) -> ChurnPredictionResponse:
    preprocessor = get_preprocessor()
    model = get_model()
    explainer = get_shap_explainer()

    # Create 1-row DataFrame
    df = pd.DataFrame([customer_data])
    customer_id = str(customer_data.get("customer_id", "C-UNKNOWN"))
    tenure_months = int(customer_data.get("tenure_months", 12))
    monthly_bill = float(customer_data.get("monthly_bill", 0.0))

    # Transform features
    X_scaled = preprocessor.transform(df)

    # Predict churn probability
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X_scaled)
        churn_prob = float(probs[0][1] * 100.0)
    else:
        # Decision function or prediction
        churn_prob = float(model.predict(X_scaled)[0] * 100.0)

    churn_prob = max(0.0, min(100.0, churn_prob))
    risk_level = determine_risk_level(churn_prob)
    segment = determine_segment(churn_prob, tenure_months, monthly_bill)

    # Compute SHAP values
    try:
        shap_vals = explainer.shap_values(X_scaled)
        if isinstance(shap_vals, list) and len(shap_vals) == 2:
            # Binary classification (take positive class shap values)
            shap_array = np.array(shap_vals[1][0])
        elif hasattr(shap_vals, "values"):
            # shap.Explanation object
            v = shap_vals.values[0]
            if len(v.shape) == 2 and v.shape[1] == 2:
                shap_array = np.array(v[:, 1])
            else:
                shap_array = np.array(v)
        else:
            shap_array = np.array(shap_vals[0]) if len(np.array(shap_vals).shape) > 1 else np.array(shap_vals)
    except Exception:
        # Fallback to feature importance proxy if SHAP computation encounters runtime issue
        if hasattr(model, "feature_importances_"):
            shap_array = model.feature_importances_
        else:
            shap_array = np.ones(len(FEATURE_NAMES))

    # Calculate relative driver impacts
    total_abs_shap = np.sum(np.abs(shap_array)) + 1e-6
    driver_impacts: List[ChurnDriverImpact] = []

    # Sort indices by absolute SHAP impact descending
    sorted_indices = np.argsort(np.abs(shap_array))[::-1]

    # Select top 3 to 5 drivers
    top_k = min(5, len(FEATURE_NAMES))
    for idx in sorted_indices[:top_k]:
        feat_name = FEATURE_NAMES[idx]
        shap_v = float(shap_array[idx])
        raw_val_item = df[feat_name].iloc[0] if feat_name in df.columns else 0.0
        try:
            raw_val_num = float(raw_val_item)
        except (ValueError, TypeError):
            raw_val_num = raw_val_item
        impact_pct = round(float(abs(shap_v) / total_abs_shap) * 100.0, 1)
        is_risk_increasing = shap_v >= 0

        driver_impacts.append(ChurnDriverImpact(
            driver=format_driver_name(feat_name),
            impact=impact_pct,
            description=format_driver_description(feat_name, raw_val_num, is_risk_increasing),
            direction="risk_increasing" if is_risk_increasing else "risk_decreasing"
        ))

    main_driver = driver_impacts[0].driver if driver_impacts else "Behavioral Score"

    # Business recommendations
    customer_dict_for_rec = {
        **customer_data,
        "churn_probability": churn_prob,
    }
    recommendations = generate_customer_recommendations(customer_dict_for_rec)
    recommended_action_titles = [r.title for r in recommendations]

    return ChurnPredictionResponse(
        customer_id=customer_id,
        churn_probability=round(churn_prob, 2),
        risk_level=risk_level,
        segment=segment,
        main_driver=main_driver,
        top_drivers=driver_impacts,
        recommended_actions=recommended_action_titles,
        recommendations=recommendations,
        monthly_bill=monthly_bill,
        raw_features=customer_data,
    )

def predict_batch_customers(
    df: pd.DataFrame
) -> List[ChurnPredictionResponse]:
    """Vectorized batch prediction processing for maximum speed"""
    if df.empty:
        return []

    preprocessor = get_preprocessor()
    model = get_model()
    explainer = get_shap_explainer()

    # Preprocess all rows in one vectorized call
    X_scaled = preprocessor.transform(df)

    # Vectorized probabilities
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X_scaled)
        churn_probs = probs[:, 1] * 100.0
    else:
        churn_probs = model.predict(X_scaled) * 100.0

    churn_probs = np.clip(churn_probs, 0.0, 100.0)

    # Vectorized SHAP computation
    try:
        shap_vals = explainer.shap_values(X_scaled)
        if isinstance(shap_vals, list) and len(shap_vals) == 2:
            shap_matrix = np.array(shap_vals[1])
        elif hasattr(shap_vals, "values"):
            v = shap_vals.values
            if len(v.shape) == 3 and v.shape[2] == 2:
                shap_matrix = v[:, :, 1]
            else:
                shap_matrix = v
        else:
            shap_matrix = np.array(shap_vals)
    except Exception:
        if hasattr(model, "feature_importances_"):
            shap_matrix = np.tile(model.feature_importances_, (len(df), 1))
        else:
            shap_matrix = np.ones((len(df), len(FEATURE_NAMES)))

    predictions: List[ChurnPredictionResponse] = []
    records = df.to_dict(orient="records")

    for i, row in enumerate(records):
        cust_id = str(row.get("customer_id", f"C-{i+1}"))
        tenure_m = int(row.get("tenure_months", 12))
        bill = float(row.get("monthly_bill", 0.0))
        c_prob = float(churn_probs[i])
        r_level = determine_risk_level(c_prob)
        seg = determine_segment(c_prob, tenure_m, bill)

        # Extract top 3-5 SHAP drivers for this customer
        row_shap = shap_matrix[i]
        total_abs_shap = np.sum(np.abs(row_shap)) + 1e-6
        sorted_indices = np.argsort(np.abs(row_shap))[::-1]

        driver_impacts: List[ChurnDriverImpact] = []
        top_k = min(5, len(FEATURE_NAMES))
        for idx in sorted_indices[:top_k]:
            feat_name = FEATURE_NAMES[idx]
            shap_v = float(row_shap[idx])
            raw_val_item = row.get(feat_name, 0.0)
            try:
                raw_val_num = float(raw_val_item)
            except (ValueError, TypeError):
                raw_val_num = raw_val_item
            impact_pct = round(float(abs(shap_v) / total_abs_shap) * 100.0, 1)
            is_risk_increasing = shap_v >= 0

            driver_impacts.append(ChurnDriverImpact(
                driver=format_driver_name(feat_name),
                impact=impact_pct,
                description=format_driver_description(feat_name, raw_val_num, is_risk_increasing),
                direction="risk_increasing" if is_risk_increasing else "risk_decreasing"
            ))

        main_driver = driver_impacts[0].driver if driver_impacts else "Behavioral Score"

        # Recommendations
        row_rec_dict = {**row, "churn_probability": c_prob}
        recommendations = generate_customer_recommendations(row_rec_dict)
        recommended_action_titles = [r.title for r in recommendations]

        predictions.append(ChurnPredictionResponse(
            customer_id=cust_id,
            churn_probability=round(c_prob, 2),
            risk_level=r_level,
            segment=seg,
            main_driver=main_driver,
            top_drivers=driver_impacts,
            recommended_actions=recommended_action_titles,
            recommendations=recommendations,
            monthly_bill=bill,
            raw_features=row,
        ))

    return predictions
