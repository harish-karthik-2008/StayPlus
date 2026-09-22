import os
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

REQUIRED_COLUMNS = [
    "customer_id",
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

def validate_dataset(df: pd.DataFrame, output_report_path: str = None) -> Dict[str, Any]:
    total_rows = len(df)
    total_cols = len(df.columns)
    
    if total_rows == 0:
        report = {
            "missing_pct": 100.0,
            "duplicate_pct": 0.0,
            "invalid_pct": 100.0,
            "outlier_pct": 0.0,
            "data_quality_score": 0.0,
            "total_rows": 0,
            "total_columns": total_cols,
            "feature_count": total_cols,
            "missing_values_count": 0,
            "duplicate_count": 0,
            "invalid_values_count": 0,
        }
        return report

    # 1. Missing Values
    missing_cells = df.isnull().sum().sum()
    total_cells = total_rows * max(total_cols, 1)
    missing_pct = round((missing_cells / total_cells) * 100.0, 2)
    
    # 2. Duplicates
    if "customer_id" in df.columns:
        duplicate_rows = df.duplicated(subset=["customer_id"]).sum()
    else:
        duplicate_rows = df.duplicated().sum()
    duplicate_pct = round((duplicate_rows / total_rows) * 100.0, 2)
    
    # 3. Invalid Values Checks
    invalid_count = 0
    
    if "age" in df.columns:
        invalid_count += ((df["age"] < 10) | (df["age"] > 120)).sum()
    if "monthly_bill" in df.columns:
        invalid_count += (df["monthly_bill"] < 0).sum()
    if "satisfaction_score" in df.columns:
        invalid_count += ((df["satisfaction_score"] < 1.0) | (df["satisfaction_score"] > 5.0)).sum()
    if "engagement_score" in df.columns:
        invalid_count += ((df["engagement_score"] < 0.0) | (df["engagement_score"] > 100.0)).sum()
    if "tenure_months" in df.columns:
        invalid_count += (df["tenure_months"] < 0).sum()
    if "payment_delay_days" in df.columns:
        invalid_count += (df["payment_delay_days"] < 0).sum()
    if "complaint_count" in df.columns:
        invalid_count += (df["complaint_count"] < 0).sum()

    invalid_pct = round((invalid_count / total_rows) * 100.0, 2)

    # 4. Outliers (IQR Method on continuous fields)
    outlier_count = 0
    numeric_cols = ["monthly_bill", "monthly_usage_hours", "payment_delay_days"]
    for col in numeric_cols:
        if col in df.columns:
            s = pd.to_numeric(df[col], errors="coerce").dropna()
            if len(s) > 0:
                q1 = s.quantile(0.25)
                q3 = s.quantile(0.75)
                iqr = q3 - q1
                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr
                outliers = ((s < lower) | (s > upper)).sum()
                outlier_count += outliers

    outlier_pct = round((outlier_count / (total_rows * len(numeric_cols))) * 100.0, 2)

    # 5. Data Quality Score (0 - 100)
    # Deduct penalties for missing, duplicates, invalid values, outliers
    penalty = (missing_pct * 0.4) + (duplicate_pct * 0.3) + (invalid_pct * 0.2) + (outlier_pct * 0.1)
    quality_score = max(0.0, min(100.0, round(100.0 - penalty, 1)))

    report = {
        "missing_pct": float(missing_pct),
        "duplicate_pct": float(duplicate_pct),
        "invalid_pct": float(invalid_pct),
        "outlier_pct": float(outlier_pct),
        "data_quality_score": float(quality_score),
        "total_rows": int(total_rows),
        "total_columns": int(total_cols),
        "feature_count": int(total_cols),
        "missing_values_count": int(missing_cells),
        "duplicate_count": int(duplicate_rows),
        "invalid_values_count": int(invalid_count),
    }

    if output_report_path:
        os.makedirs(os.path.dirname(output_report_path), exist_ok=True)
        with open(output_report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        print(f"Data quality report saved to {output_report_path}")

    return report

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    raw_path = os.path.join(base_dir, "data", "raw", "stayplus_synthetic_3000.csv")
    if os.path.exists(raw_path):
        df = pd.read_csv(raw_path)
        out_report = os.path.join(base_dir, "data", "processed", "data_quality_report.json")
        res = validate_dataset(df, out_report)
        print("Validation Result:", res)
