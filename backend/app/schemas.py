from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

# Common Types
RiskLevel = Literal["High", "Medium", "Low"]
CustomerSegment = Literal["Loyal", "At Risk", "High Risk", "High Value", "New"]
PlanType = Literal["Basic", "Standard", "Premium", "Enterprise"]

class CustomerRecord(BaseModel):
    customer_id: str = Field(..., description="Unique customer identifier e.g. C1024")
    age: int = Field(..., ge=0, le=120, description="Customer age")
    plan: str = Field(..., description="Subscription plan: Basic, Standard, Premium, Enterprise")
    tenure_months: int = Field(..., ge=0, description="Tenure in months")
    monthly_bill: float = Field(..., ge=0.0, description="Monthly billing amount")
    monthly_usage_hours: float = Field(..., ge=0.0, description="Monthly usage hours")
    usage_change_pct: float = Field(..., description="Usage change % compared to previous period")
    login_frequency: int = Field(..., ge=0, description="Logins per week")
    complaint_count: int = Field(..., ge=0, description="Total complaints raised")
    open_complaints: int = Field(..., ge=0, description="Currently open complaints")
    avg_resolution_days: float = Field(..., ge=0.0, description="Average ticket resolution time in days")
    payment_delay_days: int = Field(..., ge=0, description="Average payment delay in days")
    payment_failures: int = Field(..., ge=0, description="Historical payment failures count")
    plan_changes: int = Field(..., ge=0, description="Number of plan upgrades/downgrades")
    engagement_score: float = Field(..., ge=0.0, le=100.0, description="Engagement index 0-100")
    satisfaction_score: float = Field(..., ge=1.0, le=5.0, description="Customer satisfaction score 1-5")
    churn: Optional[int] = Field(default=None, description="1 if churned, 0 if retained (only in training data)")

    # Optional metadata fields for rich frontend support
    name: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    location: Optional[str] = None

class ChurnDriverImpact(BaseModel):
    driver: str
    impact: float = Field(..., description="Relative impact percentage or SHAP contribution")
    description: str
    direction: Optional[Literal["risk_increasing", "risk_decreasing"]] = "risk_increasing"

class CustomerRecommendation(BaseModel):
    id: str
    title: str
    category: str
    description: str
    impactEstimate: str
    icon: str
    urgency: str

class ChurnPredictionResponse(BaseModel):
    customer_id: str
    churn_probability: float = Field(..., description="Predicted churn risk percentage 0-100")
    risk_level: RiskLevel
    segment: CustomerSegment
    main_driver: str
    top_drivers: List[ChurnDriverImpact]
    recommended_actions: List[str]
    recommendations: List[CustomerRecommendation]
    monthly_bill: Optional[float] = None
    raw_features: Optional[Dict[str, Any]] = None

class DataQualityReport(BaseModel):
    missing_pct: float
    duplicate_pct: float
    invalid_pct: float
    outlier_pct: float
    data_quality_score: float
    total_rows: int
    total_columns: int
    feature_count: int
    missing_values_count: int
    duplicate_count: int
    invalid_values_count: int

class UploadResponse(BaseModel):
    message: str
    filename: str
    row_count: int
    column_count: int
    data_quality_report: DataQualityReport
    preview: List[Dict[str, Any]]

class ModelMetric(BaseModel):
    name: str
    type: str
    accuracy: float
    precision: float
    recall: float
    f1: float
    rocAuc: float
    isSelected: Optional[bool] = False

class ConfusionMatrix(BaseModel):
    truePositive: int
    falsePositive: int
    trueNegative: int
    falseNegative: int

class ModelMetricsResponse(BaseModel):
    models: List[ModelMetric]
    confusionMatrix: ConfusionMatrix
    selectedModel: str
    lastTrained: Optional[str] = None

class RevenueAtRiskResponse(BaseModel):
    revenueAtRisk: float
    retentionOpportunity: float
    highRiskCount: int
    mediumRiskCount: int
    lowRiskCount: int
    totalCustomersEvaluated: int
