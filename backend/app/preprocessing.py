import os
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from sklearn.preprocessing import StandardScaler

FEATURE_NAMES: List[str] = [
    "age",
    "plan",
    "tenure_months",
    "monthly_bill",
    "monthly_usage_hours",
    "usage_change_pct",
    "login_frequency",
    "complaint_count",
    "open_complaints",
    "avg_resolution_days",
    "payment_delay_days",
    "payment_failures",
    "plan_changes",
    "engagement_score",
    "satisfaction_score",
]

PLAN_MAPPING: Dict[str, int] = {
    "basic": 0,
    "standard": 1,
    "premium": 2,
    "enterprise": 3,
}

IQR_CLIP_COLUMNS: List[str] = [
    "monthly_bill",
    "monthly_usage_hours",
    "payment_delay_days",
]

class PreprocessingPipeline:
    def __init__(self):
        self.scaler = StandardScaler()
        self.medians: Dict[str, float] = {}
        self.iqr_bounds: Dict[str, Tuple[float, float]] = {}
        self.is_fitted: bool = False

    def _encode_plan(self, val: Any) -> int:
        if pd.isna(val):
            return 0
        s = str(val).strip().lower()
        return PLAN_MAPPING.get(s, 0)

    def clean_dataframe(self, df: pd.DataFrame, is_training: bool = False) -> pd.DataFrame:
        df_clean = df.copy()

        # Remove duplicate rows if training
        if is_training:
            if "customer_id" in df_clean.columns:
                df_clean = df_clean.drop_duplicates(subset=["customer_id"])
            else:
                df_clean = df_clean.drop_duplicates()

        # Fill missing values
        for col in FEATURE_NAMES:
            if col not in df_clean.columns:
                continue
            if col == "plan":
                mode_val = "Basic"
                if is_training:
                    mode_val = df_clean["plan"].dropna().mode().iloc[0] if not df_clean["plan"].dropna().empty else "Basic"
                    self.medians["plan_mode"] = mode_val
                else:
                    mode_val = self.medians.get("plan_mode", "Basic")
                df_clean["plan"] = df_clean["plan"].fillna(mode_val)
            else:
                # Numeric column
                if is_training:
                    median_val = float(df_clean[col].dropna().median()) if not df_clean[col].dropna().empty else 0.0
                    self.medians[col] = median_val
                else:
                    median_val = self.medians.get(col, 0.0)
                df_clean[col] = pd.to_numeric(df_clean[col], errors="coerce").fillna(median_val)

        # IQR outlier clipping for specific continuous features
        for col in IQR_CLIP_COLUMNS:
            if col in df_clean.columns:
                if is_training:
                    q1 = df_clean[col].quantile(0.25)
                    q3 = df_clean[col].quantile(0.75)
                    iqr = q3 - q1
                    lower_bound = float(q1 - 1.5 * iqr)
                    upper_bound = float(q3 + 1.5 * iqr)
                    self.iqr_bounds[col] = (lower_bound, upper_bound)
                else:
                    lower_bound, upper_bound = self.iqr_bounds.get(col, (float("-inf"), float("inf")))
                
                df_clean[col] = df_clean[col].clip(lower=max(0.0, lower_bound), upper=upper_bound)

        return df_clean

    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        features_df = pd.DataFrame(index=df.index)
        for col in FEATURE_NAMES:
            if col == "plan":
                features_df["plan"] = df["plan"].apply(self._encode_plan)
            else:
                features_df[col] = pd.to_numeric(df[col], errors="coerce").fillna(self.medians.get(col, 0.0))
        return features_df[FEATURE_NAMES]

    def fit(self, df: pd.DataFrame) -> "PreprocessingPipeline":
        cleaned = self.clean_dataframe(df, is_training=True)
        features = self.extract_features(cleaned)
        self.scaler.fit(features)
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("PreprocessingPipeline is not fitted yet.")
        cleaned = self.clean_dataframe(df, is_training=False)
        features = self.extract_features(cleaned)
        return self.scaler.transform(features)

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        self.fit(df)
        return self.transform(df)

    def save(self, filepath: str) -> None:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            "scaler": self.scaler,
            "medians": self.medians,
            "iqr_bounds": self.iqr_bounds,
            "is_fitted": self.is_fitted,
            "feature_names": FEATURE_NAMES,
        }, filepath)

    @classmethod
    def load(cls, filepath: str) -> "PreprocessingPipeline":
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Scaler/preprocessor artifact not found at {filepath}")
        data = joblib.load(filepath)
        instance = cls()
        instance.scaler = data["scaler"]
        instance.medians = data.get("medians", {})
        instance.iqr_bounds = data.get("iqr_bounds", {})
        instance.is_fitted = data.get("is_fitted", True)
        return instance
