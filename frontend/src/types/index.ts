export type RiskLevel = 'High' | 'Medium' | 'Low';
export type CustomerSegment = 'Loyal' | 'At Risk' | 'High Risk' | 'High Value' | 'New';
export type CompanyStatus = 'Ready' | 'Analyzing' | 'Needs Attention' | 'Error';

export interface ChurnDriverImpact {
  driver: string;
  impact: number; // percentage or relative SHAP weight
  description: string;
  direction?: 'risk_increasing' | 'risk_decreasing';
}

export interface CustomerTimelineItem {
  id: string;
  timeAgo: string;
  title: string;
  detail: string;
  type: 'danger' | 'warning' | 'info' | 'billing';
}

export interface CustomerRecommendation {
  id: string;
  title: string;
  category: 'Priority Support' | 'Retention Offer' | 'Re-engagement Campaign' | 'Payment Assistance';
  description: string;
  impactEstimate: string;
  icon: string;
  urgency: 'Immediate' | 'Within 48h' | 'Next Billing Cycle';
}

export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
  age: number;
  tenure_months: number;
  monthly_bill: number;
  monthly_usage_hours: number;
  usage_change_pct: number;
  login_frequency: number; // logins per week
  complaint_count: number;
  open_complaints: number;
  avg_resolution_days: number;
  payment_delay_days: number;
  payment_failures: number;
  plan_changes: number;
  engagement_score: number; // 0-100
  satisfaction_score: number; // 1-5
  churn_probability: number; // 0-100%
  risk_level: RiskLevel;
  segment: CustomerSegment;
  main_driver: string;
  churn_drivers: ChurnDriverImpact[];
  recommended_action: string;
  recommendations: CustomerRecommendation[];
  timeline: CustomerTimelineItem[];
  location: string;
}

export interface ChurnTrendPoint {
  date: string;
  churnRate: number;
  predictedRisk: number;
  retainedCustomers: number;
}

export interface SegmentSummary {
  segment: CustomerSegment;
  count: number;
  percentage: number;
  avgRevenue: number;
  avgChurnProb: number;
  avgUsage: number;
  complaintRate: number;
  description: string;
}

export interface ModelMetric {
  name: string;
  type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  isSelected?: boolean;
}

export interface ConfusionMatrix {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  description: string;
  website?: string;
  countryRegion: string;
  customerCount: number;
  churnRate: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  revenueAtRisk: number; // in INR
  retentionOpportunity: number; // in INR
  lastUpdated: string;
  datasetName: string;
  status: CompanyStatus;
  dataQualityScore: number;
  missingValuesPct: number;
  duplicateCount: number;
  invalidValuesCount: number;
  invalidDatesCount: number;
  featureCount: number;
  selectedModel: string;
  models: ModelMetric[];
  confusionMatrix: ConfusionMatrix;
  churnDriversBreakdown: { name: string; percentage: number; description: string }[];
  churnTrend7d: ChurnTrendPoint[];
  churnTrend30d: ChurnTrendPoint[];
  churnTrend6m: ChurnTrendPoint[];
  churnTrend1y: ChurnTrendPoint[];
  customers: Customer[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  read: boolean;
  linkTab?: string;
  companyId?: string;
}
