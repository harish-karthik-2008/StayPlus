import os
import numpy as np
import pandas as pd

def generate_synthetic_data(num_samples: int = 5000, output_path: str = None) -> pd.DataFrame:
    np.random.seed(42)
    
    customer_ids = [f"C{1000 + i}" for i in range(num_samples)]
    ages = np.random.randint(18, 75, size=num_samples)
    plans = np.random.choice(["Basic", "Standard", "Premium", "Enterprise"], size=num_samples, p=[0.35, 0.35, 0.20, 0.10])
    plan_tier_map = {"Basic": 0, "Standard": 1, "Premium": 2, "Enterprise": 3}
    plan_tiers = np.array([plan_tier_map[p] for p in plans])

    # Tenure in months (mixture of new and established accounts)
    tenure_months = np.random.exponential(scale=20, size=num_samples).astype(int)
    tenure_months = np.clip(tenure_months, 1, 72)
    
    # Monthly bill tailored by plan
    base_bills = {"Basic": 499.0, "Standard": 899.0, "Premium": 1499.0, "Enterprise": 2999.0}
    monthly_bill = np.array([
        base_bills[p] + np.random.normal(0, 40) for p in plans
    ])
    monthly_bill = np.clip(monthly_bill, 299.0, 4500.0)
    
    # Monthly usage hours
    monthly_usage_hours = np.random.gamma(shape=15, scale=3, size=num_samples) # Mean ~45 hrs
    monthly_usage_hours = np.clip(monthly_usage_hours, 2.0, 150.0)
    
    # Usage change pct (-80% to +80%)
    usage_change_pct = np.random.normal(-5, 25, size=num_samples)
    usage_change_pct = np.clip(usage_change_pct, -85.0, 95.0)
    
    # Login frequency (per week)
    login_frequency = np.random.poisson(lam=7, size=num_samples)
    login_frequency = np.clip(login_frequency, 0, 35)
    
    # Complaint count
    complaint_count = np.random.poisson(lam=1.2, size=num_samples)
    complaint_count = np.clip(complaint_count, 0, 10)
    
    # Open complaints
    open_complaints = np.array([
        np.random.randint(0, min(c + 1, 4)) if c > 0 else 0 for c in complaint_count
    ])
    
    avg_resolution_days = np.random.exponential(scale=3.5, size=num_samples)
    avg_resolution_days = np.clip(avg_resolution_days, 0.5, 20.0)
    
    # Payment delay days
    payment_delay_days = np.random.exponential(scale=4.0, size=num_samples).astype(int)
    payment_delay_days = np.clip(payment_delay_days, 0, 45)
    
    # Payment failures
    payment_failures = np.random.poisson(lam=0.4, size=num_samples)
    payment_failures = np.clip(payment_failures, 0, 6)
    
    # Plan changes
    plan_changes = np.random.poisson(lam=0.5, size=num_samples)
    plan_changes = np.clip(plan_changes, 0, 5)
    
    # Engagement score (0-100)
    engagement_score = np.random.normal(65, 18, size=num_samples)
    engagement_score = np.clip(engagement_score, 5.0, 98.0)
    
    # Satisfaction score (1.0 - 5.0)
    satisfaction_score = np.random.normal(3.8, 0.9, size=num_samples)
    satisfaction_score = np.clip(satisfaction_score, 1.0, 5.0)

    # -------------------------------------------------------------
    # Deterministic Feature Weighting (Z-score normalized)
    # -------------------------------------------------------------
    def zscore(arr):
        s = np.std(arr)
        return (arr - np.mean(arr)) / (s if s > 1e-6 else 1.0)

    z_usage = zscore(usage_change_pct)
    z_eng = zscore(engagement_score)
    z_sat = zscore(satisfaction_score)
    z_tenure = zscore(tenure_months)
    z_comp = zscore(complaint_count)
    z_delay = zscore(payment_delay_days)
    z_fail = zscore(payment_failures)
    z_login = zscore(login_frequency)
    z_open_comp = zscore(open_complaints)
    z_plan_chg = zscore(plan_changes)
    z_res_days = zscore(avg_resolution_days)
    z_bill = zscore(monthly_bill)
    z_usage_hrs = zscore(monthly_usage_hours)
    z_plan = zscore(plan_tiers)
    z_age = zscore(ages)

    # Linear combination
    linear_risk = (
        - 1.40 * z_usage      # Strongest: negative usage = higher risk
        - 1.15 * z_eng        # Strong: low engagement = higher risk
        - 1.05 * z_sat        # Strong: low satisfaction = higher risk
        - 0.70 * z_tenure     # Moderate: short tenure = higher risk
        + 0.85 * z_comp       # Moderate: high complaints = higher risk
        + 0.75 * z_delay      # Moderate: payment delay = higher risk
        + 0.75 * z_fail       # Moderate: payment failures = higher risk
        - 0.60 * z_login      # Moderate: low logins = higher risk
        + 0.40 * z_open_comp  # Minor
        + 0.30 * z_plan_chg   # Minor
        + 0.30 * z_res_days   # Minor
        + 0.25 * z_bill       # Weak
        - 0.25 * z_usage_hrs  # Minor
        - 0.20 * z_plan       # Minor
        + 0.10 * z_age        # Weak
    )

    # Non-linear Interaction terms (enables Tree models like XGBoost/RF to capture interaction patterns)
    interaction_risk = np.zeros(num_samples)
    
    # 1. Severe usage drop + complaints
    interaction_risk += np.where((usage_change_pct < -30.0) & (complaint_count >= 2), 1.2, 0.0)
    
    # 2. High bill + low engagement (flight risk for premium/enterprise)
    interaction_risk += np.where((monthly_bill >= 1200.0) & (engagement_score < 40.0), 1.0, 0.0)
    
    # 3. Severe payment delay + payment failures
    interaction_risk += np.where((payment_delay_days >= 10) & (payment_failures >= 1), 0.9, 0.0)
    
    # 4. Early lifecycle drop (New accounts with immediate negative trend)
    interaction_risk += np.where((tenure_months <= 3) & (usage_change_pct < -20.0), 0.8, 0.0)

    total_risk = linear_risk + interaction_risk

    # Add small controlled Gaussian noise (~15% of total_risk std)
    noise_std = 0.15 * np.std(total_risk)
    noise = np.random.normal(0, noise_std, size=num_samples)
    risk_with_noise = total_risk + noise

    # Calibrate intercept so churn rate lands around ~20%
    # Search for intercept that gives ~20% mean probability
    target_churn_rate = 0.20
    intercept = np.percentile(risk_with_noise, (1.0 - target_churn_rate) * 100)
    
    # Scale sharpness
    scaled_logit = (risk_with_noise - intercept) * 0.85
    churn_prob = 1.0 / (1.0 + np.exp(-scaled_logit))
    
    # Sample Bernoulli draw
    churn = np.random.binomial(1, churn_prob)

    df = pd.DataFrame({
        "customer_id": customer_ids,
        "age": ages,
        "plan": plans,
        "tenure_months": tenure_months,
        "monthly_bill": np.round(monthly_bill, 2),
        "monthly_usage_hours": np.round(monthly_usage_hours, 1),
        "usage_change_pct": np.round(usage_change_pct, 1),
        "login_frequency": login_frequency,
        "complaint_count": complaint_count,
        "open_complaints": open_complaints,
        "avg_resolution_days": np.round(avg_resolution_days, 1),
        "payment_delay_days": payment_delay_days,
        "payment_failures": payment_failures,
        "plan_changes": plan_changes,
        "engagement_score": np.round(engagement_score, 1),
        "satisfaction_score": np.round(satisfaction_score, 1),
        "churn": churn,
    })

    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Synthetic dataset saved to {output_path} ({len(df)} rows, Churn rate: {churn.mean()*100:.1f}%)")

    return df

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    out = os.path.join(base_dir, "data", "raw", "stayplus_synthetic_5000.csv")
    generate_synthetic_data(5000, out)
