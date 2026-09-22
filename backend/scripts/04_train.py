import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.preprocessing import PreprocessingPipeline, FEATURE_NAMES

def train_models(
    processed_csv_path: str,
    model_dir: str = None
) -> dict:
    if not os.path.exists(processed_csv_path):
        raise FileNotFoundError(f"Cleaned dataset not found at {processed_csv_path}")

    if model_dir is None:
        model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "model"))
    os.makedirs(model_dir, exist_ok=True)

    df = pd.read_csv(processed_csv_path)
    if "churn" not in df.columns:
        raise ValueError("Dataset does not contain target column 'churn'.")

    # Clean and split features / target
    X_raw = df.drop(columns=["churn", "customer_id"], errors="ignore")
    y = df["churn"].values.astype(int)

    # Train / Test split (Stratified 80/20)
    X_train_df, X_test_df, y_train, y_test = train_test_split(
        df, y, test_size=0.20, random_state=42, stratify=y
    )

    # Fit PreprocessingPipeline on training split
    preprocessor = PreprocessingPipeline()
    preprocessor.fit(X_train_df)
    
    # Save fitted scaler/preprocessor
    scaler_path = os.path.join(model_dir, "scaler.pkl")
    preprocessor.save(scaler_path)

    # Transform train and test
    X_train = preprocessor.transform(X_train_df)
    X_test = preprocessor.transform(X_test_df)

    # Calculate class imbalance ratio for XGBoost
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    scale_pos_weight = float(neg_count / max(pos_count, 1))

    print(f"Training on {len(X_train)} samples (Class 0: {neg_count}, Class 1: {pos_count}, scale_pos_weight: {scale_pos_weight:.2f})")

    # 1. Logistic Regression (Baseline)
    print("Training Logistic Regression...")
    lr_model = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
    lr_model.fit(X_train, y_train)
    lr_path = os.path.join(model_dir, "logistic_regression.pkl")
    joblib.dump(lr_model, lr_path)

    # 2. Random Forest Classifier
    print("Training Random Forest...")
    rf_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    rf_path = os.path.join(model_dir, "random_forest.pkl")
    joblib.dump(rf_model, rf_path)

    # 3. XGBoost Classifier
    print("Training XGBoost Classifier...")
    xgb_model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=2,
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=42
    )
    xgb_model.fit(X_train, y_train)
    xgb_path = os.path.join(model_dir, "xgboost_model.pkl")
    joblib.dump(xgb_model, xgb_path)

    # Save test dataset arrays for evaluation script
    test_data_path = os.path.join(model_dir, "test_data.pkl")
    joblib.dump({
        "X_test": X_test,
        "y_test": y_test,
        "X_test_df": X_test_df,
    }, test_data_path)

    print("All models and scaler saved successfully.")
    return {
        "lr_model": lr_model,
        "rf_model": rf_model,
        "xgb_model": xgb_model,
        "X_test": X_test,
        "y_test": y_test,
        "scaler_path": scaler_path,
    }

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    clean_csv = os.path.join(base_dir, "data", "processed", "customers_cleaned.csv")
    if os.path.exists(clean_csv):
        train_models(clean_csv)
