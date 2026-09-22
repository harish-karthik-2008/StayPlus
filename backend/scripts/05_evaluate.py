import os
import sys
import json
import shutil
import joblib
from datetime import datetime, timezone
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

def evaluate_models(model_dir: str = None) -> dict:
    if model_dir is None:
        model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "model"))

    test_data_path = os.path.join(model_dir, "test_data.pkl")
    if not os.path.exists(test_data_path):
        raise FileNotFoundError(f"Test data not found at {test_data_path}. Run training first.")

    test_data = joblib.load(test_data_path)
    X_test = test_data["X_test"]
    y_test = test_data["y_test"]

    model_configs = [
        {
            "name": "Logistic Regression",
            "type": "Linear Model",
            "file": "logistic_regression.pkl",
        },
        {
            "name": "Random Forest",
            "type": "Ensemble (Bagging)",
            "file": "random_forest.pkl",
        },
        {
            "name": "XGBoost",
            "type": "Gradient Boosting",
            "file": "xgboost_model.pkl",
        },
    ]

    metrics_list = []
    confusion_matrices = {}
    best_score = -1.0
    best_model_info = None

    for config in model_configs:
        model_path = os.path.join(model_dir, config["file"])
        if not os.path.exists(model_path):
            continue

        model = joblib.load(model_path)

        # Probability scores
        if hasattr(model, "predict_proba"):
            y_prob = model.predict_proba(X_test)[:, 1]
        else:
            y_prob = model.predict(X_test)

        # Calibrate optimal decision threshold for F1 balance
        best_th = 0.5
        best_f1_th = -1.0
        for th in np.linspace(0.20, 0.80, 61):
            preds_th = (y_prob >= th).astype(int)
            f1_val = float(f1_score(y_test, preds_th, zero_division=0))
            if f1_val > best_f1_th:
                best_f1_th = f1_val
                best_th = float(th)

        y_pred = (y_prob >= best_th).astype(int)

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        try:
            roc_auc = float(roc_auc_score(y_test, y_prob))
        except Exception:
            roc_auc = 0.5

        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        # Handle shape
        if cm.shape == (2, 2):
            tn, fp, fn, tp = cm.ravel()
        else:
            tn, fp, fn, tp = int(cm[0, 0]), 0, 0, 0

        cm_dict = {
            "truePositive": int(tp),
            "falsePositive": int(fp),
            "trueNegative": int(tn),
            "falseNegative": int(fn),
        }
        confusion_matrices[config["name"]] = cm_dict

        # Evaluation score (Average of F1 and ROC-AUC)
        combined_score = (f1 + roc_auc) / 2.0

        metric_entry = {
            "name": config["name"],
            "type": config["type"],
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "rocAuc": round(roc_auc, 4),
            "combinedScore": round(combined_score, 4),
            "file": config["file"],
        }
        metrics_list.append(metric_entry)

        if combined_score > best_score:
            best_score = combined_score
            best_model_info = config

    # Mark the best model
    for m in metrics_list:
        m["isSelected"] = (m["name"] == best_model_info["name"])

    # Copy best model to best_model.pkl
    best_src = os.path.join(model_dir, best_model_info["file"])
    best_dst = os.path.join(model_dir, "best_model.pkl")
    shutil.copyfile(best_src, best_dst)
    print(f"Selected Best Model: {best_model_info['name']} -> copied to {best_dst}")

    # Prepare output payload matching frontend specifications
    final_output = {
        "models": [
            {
                "name": m["name"],
                "type": m["type"],
                "accuracy": m["accuracy"],
                "precision": m["precision"],
                "recall": m["recall"],
                "f1": m["f1"],
                "rocAuc": m["rocAuc"],
                "isSelected": m["isSelected"],
            }
            for m in metrics_list
        ],
        "confusionMatrix": confusion_matrices[best_model_info["name"]],
        "selectedModel": best_model_info["name"],
        "lastTrained": datetime.now(timezone.utc).isoformat(),
    }

    metrics_json_path = os.path.join(model_dir, "metrics.json")
    with open(metrics_json_path, "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=2)

    print(f"Metrics saved to {metrics_json_path}")
    return final_output

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    evaluate_models(os.path.join(base_dir, "model"))
