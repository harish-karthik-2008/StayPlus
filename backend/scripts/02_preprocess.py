import os
import sys
import pandas as pd

# Add parent directory to path to allow importing from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.preprocessing import PreprocessingPipeline, FEATURE_NAMES

def preprocess_dataset(
    raw_csv_path: str,
    output_csv_path: str = None,
    scaler_output_path: str = None
) -> pd.DataFrame:
    if not os.path.exists(raw_csv_path):
        raise FileNotFoundError(f"Raw CSV not found at {raw_csv_path}")

    df = pd.read_csv(raw_csv_path)
    preprocessor = PreprocessingPipeline()
    
    # Clean dataset
    df_clean = preprocessor.clean_dataframe(df, is_training=True)
    
    # Fit preprocessor on feature columns
    preprocessor.fit(df_clean)
    
    # Save scaler/preprocessor artifact if path provided
    if scaler_output_path:
        os.makedirs(os.path.dirname(scaler_output_path), exist_ok=True)
        preprocessor.save(scaler_output_path)
        print(f"Scaler/preprocessor artifact saved to {scaler_output_path}")

    # Output processed dataset
    if output_csv_path:
        os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
        df_clean.to_csv(output_csv_path, index=False)
        print(f"Cleaned dataset saved to {output_csv_path} ({len(df_clean)} rows)")

    return df_clean

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    raw_dir = os.path.join(base_dir, "data", "raw")
    raw_files = [os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if f.endswith(".csv")]
    latest_raw = max(raw_files, key=os.path.getmtime) if raw_files else os.path.join(raw_dir, "stayplus_synthetic_5000.csv")
    out_csv = os.path.join(base_dir, "data", "processed", "customers_cleaned.csv")
    scaler_out = os.path.join(base_dir, "model", "scaler.pkl")
    if os.path.exists(latest_raw):
        preprocess_dataset(latest_raw, out_csv, scaler_out)
