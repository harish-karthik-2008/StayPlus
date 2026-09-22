import os
import json
import matplotlib
matplotlib.use("Agg") # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

def run_eda(processed_csv_path: str, reports_dir: str = None) -> dict:
    if not os.path.exists(processed_csv_path):
        raise FileNotFoundError(f"Processed CSV not found at {processed_csv_path}")

    df = pd.read_csv(processed_csv_path)
    if "churn" not in df.columns:
        print("No churn column found for EDA.")
        return {}

    if reports_dir is None:
        reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "reports"))
    os.makedirs(reports_dir, exist_ok=True)

    summary = {}
    
    # 1. Overall Churn Rate
    summary["overall_churn_rate"] = round(float(df["churn"].mean()) * 100.0, 2)
    summary["total_customers"] = int(len(df))

    # 2. Churn Rate by Plan
    if "plan" in df.columns:
        plan_churn = df.groupby("plan")["churn"].agg(["count", "mean"]).reset_index()
        plan_churn["mean"] = (plan_churn["mean"] * 100.0).round(2)
        summary["churn_by_plan"] = plan_churn.to_dict(orient="records")

    # 3. Churn by Tenure Bucket
    if "tenure_months" in df.columns:
        df["tenure_bucket"] = pd.cut(
            df["tenure_months"],
            bins=[0, 3, 12, 24, 48, 100],
            labels=["0-3m (New)", "3-12m (Early)", "1-2yr", "2-4yr", "4yr+"]
        )
        tenure_churn = df.groupby("tenure_bucket", observed=False)["churn"].agg(["count", "mean"]).reset_index()
        tenure_churn["mean"] = (tenure_churn["mean"] * 100.0).round(2)
        summary["churn_by_tenure"] = tenure_churn.to_dict(orient="records")

    # 4. Churn by Complaint Count Bucket
    if "complaint_count" in df.columns:
        df["complaint_bucket"] = pd.cut(
            df["complaint_count"],
            bins=[-1, 0, 1, 3, 20],
            labels=["0 Complaints", "1 Complaint", "2-3 Complaints", "4+ Complaints"]
        )
        comp_churn = df.groupby("complaint_bucket", observed=False)["churn"].agg(["count", "mean"]).reset_index()
        comp_churn["mean"] = (comp_churn["mean"] * 100.0).round(2)
        summary["churn_by_complaints"] = comp_churn.to_dict(orient="records")

    # 5. Correlation with Churn
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    correlations = df[numeric_cols].corr()["churn"].drop("churn").sort_values(ascending=False)
    summary["feature_correlations_with_churn"] = correlations.round(4).to_dict()

    # Save summary JSON
    summary_path = os.path.join(reports_dir, "eda_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"EDA Summary saved to {summary_path}")

    # Generate EDA Visualizations
    plt.figure(figsize=(10, 6))
    top_corr = correlations.head(8).sort_values()
    plt.barh(top_corr.index, top_corr.values, color="#4F46E5")
    plt.title("Top Positive Feature Correlations with Customer Churn")
    plt.xlabel("Pearson Correlation Coefficient")
    plt.tight_layout()
    corr_plot_path = os.path.join(reports_dir, "churn_correlations.png")
    plt.savefig(corr_plot_path, dpi=150)
    plt.close()

    return summary

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    processed_path = os.path.join(base_dir, "data", "processed", "customers_cleaned.csv")
    if os.path.exists(processed_path):
        run_eda(processed_path)
