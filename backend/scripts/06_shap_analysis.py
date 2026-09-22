import os
import sys
import json
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.preprocessing import FEATURE_NAMES

def run_global_shap_analysis(model_dir: str = None, reports_dir: str = None) -> dict:
    if model_dir is None:
        model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "model"))
    if reports_dir is None:
        reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "reports"))

    os.makedirs(reports_dir, exist_ok=True)

    best_model_path = os.path.join(model_dir, "best_model.pkl")
    test_data_path = os.path.join(model_dir, "test_data.pkl")

    if not os.path.exists(best_model_path) or not os.path.exists(test_data_path):
        raise FileNotFoundError("Best model or test data not found. Run training first.")

    best_model = joblib.load(best_model_path)
    test_data = joblib.load(test_data_path)
    X_test = test_data["X_test"]

    # Sample subset if test set is large
    sample_size = min(len(X_test), 300)
    X_sample = X_test[:sample_size]

    model_name = type(best_model).__name__.lower()
    if "xgb" in model_name or "forest" in model_name or "tree" in model_name:
        explainer = shap.TreeExplainer(best_model)
    else:
        background = np.zeros((1, len(FEATURE_NAMES)))
        explainer = shap.Explainer(best_model, background)

    shap_values = explainer.shap_values(X_sample)

    if isinstance(shap_values, list) and len(shap_values) == 2:
        shap_matrix = np.array(shap_values[1])
    elif hasattr(shap_values, "values"):
        v = shap_values.values
        if len(v.shape) == 3 and v.shape[2] == 2:
            shap_matrix = v[:, :, 1]
        else:
            shap_matrix = v
    else:
        shap_matrix = np.array(shap_values)

    # Mean absolute SHAP value per feature
    mean_abs_shap = np.mean(np.abs(shap_matrix), axis=0)
    total_shap = np.sum(mean_abs_shap) + 1e-6
    shap_percentages = (mean_abs_shap / total_shap) * 100.0

    shap_summary = []
    for i, name in enumerate(FEATURE_NAMES):
        shap_summary.append({
            "feature": name,
            "mean_abs_shap": round(float(mean_abs_shap[i]), 4),
            "importance_pct": round(float(shap_percentages[i]), 2),
        })

    # Sort descending
    shap_summary = sorted(shap_summary, key=lambda x: x["mean_abs_shap"], reverse=True)

    # Save to JSON
    json_path = os.path.join(model_dir, "shap_summary.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(shap_summary, f, indent=2)
    print(f"SHAP summary saved to {json_path}")

    # Plot Global Feature Importance Bar Chart
    plt.figure(figsize=(10, 6))
    features = [s["feature"] for s in shap_summary[::-1]]
    importances = [s["importance_pct"] for s in shap_summary[::-1]]

    plt.barh(features, importances, color="#6366F1")
    plt.title("Global Feature Importance (SHAP % Contribution)")
    plt.xlabel("Importance (%)")
    plt.tight_layout()

    plot_path = os.path.join(reports_dir, "shap_feature_importance.png")
    plt.savefig(plot_path, dpi=150)
    plt.close()

    print(f"SHAP plot saved to {plot_path}")
    return {"features": shap_summary, "plot_path": plot_path}

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    run_global_shap_analysis(
        model_dir=os.path.join(base_dir, "model"),
        reports_dir=os.path.join(base_dir, "reports")
    )
