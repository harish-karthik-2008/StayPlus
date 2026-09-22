import { Company, Customer, NotificationItem } from '../types';
import { generateCustomerRecommendations, calculateChurnDrivers } from './recommendationEngine';

// Customer C1024 Arun Kumar - Featured customer from specification
export const ARUN_KUMAR_CUSTOMER: Customer = {
  customer_id: 'C1024',
  name: 'Arun Kumar',
  email: 'arun.kumar@enterprise-tech.in',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  plan: 'Premium',
  age: 38,
  tenure_months: 14,
  monthly_bill: 1299,
  monthly_usage_hours: 35,
  usage_change_pct: -43,
  login_frequency: 4,
  complaint_count: 4,
  open_complaints: 1,
  avg_resolution_days: 5.2,
  payment_delay_days: 15,
  payment_failures: 2,
  plan_changes: 1,
  engagement_score: 38,
  satisfaction_score: 2.1,
  churn_probability: 87,
  risk_level: 'High',
  segment: 'High Value',
  main_driver: 'Usage Decline',
  location: 'Bengaluru, India',
  recommended_action: 'Priority Support',
  timeline: [
    {
      id: 'tl_1',
      timeAgo: 'Today',
      title: 'Service usage decreased',
      detail: 'Weekly active session duration dropped below threshold (-43% 30-day drop)',
      type: 'danger',
    },
    {
      id: 'tl_2',
      timeAgo: '2 days ago',
      title: 'Payment delayed',
      detail: 'September recurring subscription auto-debit pending for 15 days',
      type: 'billing',
    },
    {
      id: 'tl_3',
      timeAgo: '4 days ago',
      title: 'Complaint raised',
      detail: 'Ticket #TK-8491: Latency degradation during peak working hours',
      type: 'warning',
    },
    {
      id: 'tl_4',
      timeAgo: '7 days ago',
      title: 'Subscription downgrade',
      detail: 'Downgraded add-on cloud analytics seats from 5 to 1',
      type: 'info',
    },
  ],
  churn_drivers: [
    { driver: 'Usage Decline', impact: 43, description: 'Usage dropped 43% in the last 30 days', direction: 'risk_increasing' },
    { driver: 'Complaints', impact: 32, description: '4 complaints filed with 5.2 avg resolution turnaround', direction: 'risk_increasing' },
    { driver: 'Payment Delay', impact: 22, description: '15-day payment delay and 2 transaction retry failures', direction: 'risk_increasing' },
    { driver: 'Low Engagement', impact: 16, description: 'Engagement score fallen to 38% compared to industry average of 72%', direction: 'risk_increasing' },
  ],
  recommendations: [
    {
      id: 'rec_1024_1',
      title: 'Assign Dedicated Priority Support Concierge',
      category: 'Priority Support',
      description: 'Resolve open complaint #TK-8491 immediately with senior technician callback and SLA guarantee.',
      impactEstimate: '-18% Churn Risk reduction',
      icon: 'Headphones',
      urgency: 'Immediate',
    },
    {
      id: 'rec_1024_2',
      title: 'Personalized Retention Offer: 25% Off 3-Month Extension',
      category: 'Retention Offer',
      description: 'High Value customer spending ₹1,299/mo. Issue customized discount code to protect annual ARR.',
      impactEstimate: '-22% Churn Risk reduction',
      icon: 'Gift',
      urgency: 'Immediate',
    },
    {
      id: 'rec_1024_3',
      title: 'Product Value & Re-engagement Campaign',
      category: 'Re-engagement Campaign',
      description: 'Send automated email course highlighting recently launched features and best practice workflows.',
      impactEstimate: '-12% Churn Risk reduction',
      icon: 'Mail',
      urgency: 'Within 48h',
    },
  ],
};

// Realistic mock customers pool
export function createMockCustomers(basePrefix: string, count: number): Customer[] {
  const names = [
    'Priya Sharma', 'Rohan Mehta', 'Vikram Patel', 'Sneha Rao', 'Rajesh Nair',
    'Ananya Sen', 'Kavita Joshi', 'Sunil Verma', 'Deepa Iyer', 'Amitabh Roy',
    'Neha Deshmukh', 'Manoj Kulkarni', 'Pooja Bhatt', 'Gaurav Khanna', 'Swati Reddy',
    'Naveen Pillai', 'Ritu Mathur', 'Farhan Ali', 'Shalini Ghosh', 'Karthik Raja',
  ];

  const plans: Array<'Basic' | 'Standard' | 'Premium' | 'Enterprise'> = ['Basic', 'Standard', 'Premium', 'Enterprise'];
  const locations = ['Mumbai, India', 'Bengaluru, India', 'Delhi NCR, India', 'Hyderabad, India', 'Pune, India', 'Chennai, India'];

  const customers: Customer[] = [];

  // Add Arun Kumar as first item for TechStream
  if (basePrefix === 'C') {
    customers.push(ARUN_KUMAR_CUSTOMER);
  }

  for (let i = 1; i <= count; i++) {
    const cid = `${basePrefix}${1024 + i}`;
    const name = names[i % names.length];
    const plan = plans[i % plans.length];
    const tenure = Math.floor(Math.random() * 36) + 3;
    const monthly_bill = plan === 'Enterprise' ? 2499 : plan === 'Premium' ? 1299 : plan === 'Standard' ? 799 : 499;
    
    // Seed diverse churn probability distributions
    let churnProb = Math.floor(Math.random() * 92) + 8;
    if (i % 5 === 0) churnProb = Math.min(94, Math.floor(Math.random() * 25) + 70); // High risk
    else if (i % 3 === 0) churnProb = Math.floor(Math.random() * 30) + 40; // Medium risk
    else churnProb = Math.floor(Math.random() * 30) + 8; // Low risk

    const risk_level: 'High' | 'Medium' | 'Low' = churnProb >= 65 ? 'High' : churnProb >= 35 ? 'Medium' : 'Low';
    
    let segment: 'Loyal' | 'At Risk' | 'High Risk' | 'High Value' | 'New' = 'Loyal';
    if (tenure < 6) segment = 'New';
    else if (monthly_bill >= 1299 && churnProb < 40) segment = 'High Value';
    else if (risk_level === 'High') segment = 'High Risk';
    else if (risk_level === 'Medium') segment = 'At Risk';
    else segment = 'Loyal';

    const complaints = risk_level === 'High' ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 2);
    const usageChange = risk_level === 'High' ? -(Math.floor(Math.random() * 40) + 20) : Math.floor(Math.random() * 30) - 10;
    const paymentDelay = risk_level === 'High' ? Math.floor(Math.random() * 15) + 6 : Math.floor(Math.random() * 3);
    const engagement = risk_level === 'High' ? Math.floor(Math.random() * 35) + 15 : Math.floor(Math.random() * 40) + 55;

    const drivers = calculateChurnDrivers({
      usage_change_pct: usageChange,
      complaint_count: complaints,
      payment_delay_days: paymentDelay,
      engagement_score: engagement,
      tenure_months: tenure,
    });

    const main_driver = drivers[0]?.driver || (usageChange < 0 ? 'Usage Decline' : 'Low Engagement');
    const recommendations = generateCustomerRecommendations({
      monthly_bill,
      churn_probability: churnProb,
      usage_change_pct: usageChange,
      complaint_count: complaints,
      payment_delay_days: paymentDelay,
      engagement_score: engagement,
    });

    const cust: Customer = {
      customer_id: cid,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      plan,
      age: Math.floor(Math.random() * 35) + 22,
      tenure_months: tenure,
      monthly_bill,
      monthly_usage_hours: Math.floor(Math.random() * 80) + 20,
      usage_change_pct: usageChange,
      login_frequency: Math.floor(Math.random() * 12) + 2,
      complaint_count: complaints,
      open_complaints: complaints > 0 ? 1 : 0,
      avg_resolution_days: Number((Math.random() * 4 + 1.5).toFixed(1)),
      payment_delay_days: paymentDelay,
      payment_failures: complaints > 2 ? 1 : 0,
      plan_changes: Math.floor(Math.random() * 2),
      engagement_score: engagement,
      satisfaction_score: Number((Math.max(1, 5 - (churnProb / 20))).toFixed(1)),
      churn_probability: churnProb,
      risk_level,
      segment,
      main_driver,
      churn_drivers: drivers,
      recommended_action: recommendations[0]?.category || 'Priority Support',
      recommendations,
      location: locations[i % locations.length],
      timeline: [
        {
          id: `tl_${cid}_1`,
          timeAgo: '1 day ago',
          title: risk_level === 'High' ? 'Activity decline detected' : 'Product milestone reached',
          detail: risk_level === 'High' ? 'System logged significant drop in routine actions' : 'Completed 15 consecutive active sessions',
          type: risk_level === 'High' ? 'danger' : 'info',
        },
        {
          id: `tl_${cid}_2`,
          timeAgo: '3 days ago',
          title: complaints > 0 ? 'Customer Support Interaction' : 'Monthly invoice generated',
          detail: complaints > 0 ? `Support case logged for query regarding feature performance` : `Automatic payment cleared seamlessly`,
          type: complaints > 0 ? 'warning' : 'billing',
        },
      ],
    };

    customers.push(cust);
  }

  return customers;
}

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp_techstream',
    name: 'TechStream Services',
    industry: 'Telecommunications',
    description: 'Tier-1 digital telecommunications & broadband services provider serving enterprise and residential clients.',
    website: 'https://techstream.io',
    countryRegion: 'India & South Asia',
    customerCount: 25420,
    churnRate: 18.4,
    highRiskCount: 2381,
    mediumRiskCount: 4120,
    lowRiskCount: 18919,
    revenueAtRisk: 1860000, // ₹18.6 Lakhs
    retentionOpportunity: 3240000, // ₹32.4 Lakhs
    lastUpdated: '22 Sep 2026',
    datasetName: 'customer_churn_data.csv',
    status: 'Ready',
    dataQualityScore: 96,
    missingValuesPct: 1.4,
    duplicateCount: 23,
    invalidValuesCount: 8,
    invalidDatesCount: 4,
    featureCount: 17,
    selectedModel: 'XGBoost',
    models: [
      { name: 'XGBoost (Optimized)', type: 'Gradient Boosted Trees', accuracy: 85.8, precision: 80.6, recall: 82.1, f1: 81.3, rocAuc: 0.89, isSelected: true },
      { name: 'Random Forest', type: 'Ensemble Bagging', accuracy: 82.5, precision: 77.1, recall: 79.2, f1: 78.1, rocAuc: 0.86 },
      { name: 'Logistic Regression', type: 'Baseline Classifier', accuracy: 78.2, precision: 72.4, recall: 75.8, f1: 74.0, rocAuc: 0.81 },
    ],
    confusionMatrix: {
      truePositive: 1955,
      falsePositive: 426,
      trueNegative: 21540,
      falseNegative: 499,
    },
    churnDriversBreakdown: [
      { name: 'Usage Decline', percentage: 32, description: 'Significant reduction in monthly active usage hours' },
      { name: 'Complaints', percentage: 25, description: 'High ticket frequency and unresolved support queries' },
      { name: 'Payment Issues', percentage: 19, description: 'Recurring payment failures and payment settlement delays' },
      { name: 'Low Engagement', percentage: 14, description: 'Low feature adoption and sporadic platform logins' },
      { name: 'Short Tenure', percentage: 10, description: 'New users dropping off within the initial 90-day window' },
    ],
    churnTrend7d: [
      { date: '16 Sep', churnRate: 18.9, predictedRisk: 19.2, retainedCustomers: 410 },
      { date: '17 Sep', churnRate: 18.7, predictedRisk: 19.0, retainedCustomers: 425 },
      { date: '18 Sep', churnRate: 18.8, predictedRisk: 18.9, retainedCustomers: 418 },
      { date: '19 Sep', churnRate: 18.5, predictedRisk: 18.6, retainedCustomers: 432 },
      { date: '20 Sep', churnRate: 18.3, predictedRisk: 18.4, retainedCustomers: 440 },
      { date: '21 Sep', churnRate: 18.4, predictedRisk: 18.5, retainedCustomers: 438 },
      { date: '22 Sep', churnRate: 18.4, predictedRisk: 18.3, retainedCustomers: 450 },
    ],
    churnTrend30d: [
      { date: 'Wk 1 (Aug)', churnRate: 20.2, predictedRisk: 21.0, retainedCustomers: 1200 },
      { date: 'Wk 2 (Aug)', churnRate: 19.8, predictedRisk: 20.1, retainedCustomers: 1350 },
      { date: 'Wk 3 (Sep)', churnRate: 19.1, predictedRisk: 19.4, retainedCustomers: 1520 },
      { date: 'Wk 4 (Sep)', churnRate: 18.4, predictedRisk: 18.4, retainedCustomers: 1680 },
    ],
    churnTrend6m: [
      { date: 'Apr 2026', churnRate: 22.4, predictedRisk: 23.0, retainedCustomers: 4500 },
      { date: 'May 2026', churnRate: 21.6, predictedRisk: 22.1, retainedCustomers: 4800 },
      { date: 'Jun 2026', churnRate: 20.8, predictedRisk: 21.2, retainedCustomers: 5100 },
      { date: 'Jul 2026', churnRate: 19.9, predictedRisk: 20.2, retainedCustomers: 5400 },
      { date: 'Aug 2026', churnRate: 19.1, predictedRisk: 19.4, retainedCustomers: 5800 },
      { date: 'Sep 2026', churnRate: 18.4, predictedRisk: 18.4, retainedCustomers: 6200 },
    ],
    churnTrend1y: [
      { date: 'Q4 2025', churnRate: 24.5, predictedRisk: 25.1, retainedCustomers: 16000 },
      { date: 'Q1 2026', churnRate: 22.8, predictedRisk: 23.4, retainedCustomers: 18500 },
      { date: 'Q2 2026', churnRate: 20.4, predictedRisk: 21.0, retainedCustomers: 21000 },
      { date: 'Q3 2026', churnRate: 18.4, predictedRisk: 18.5, retainedCustomers: 24000 },
    ],
    customers: createMockCustomers('C', 24),
  },
  {
    id: 'comp_cloudserve',
    name: 'CloudServe',
    industry: 'SaaS',
    description: 'Enterprise B2B Cloud infrastructure and devops workflow automation SaaS platform.',
    website: 'https://cloudserve.app',
    countryRegion: 'Global / North America',
    customerCount: 12840,
    churnRate: 11.7,
    highRiskCount: 924,
    mediumRiskCount: 2140,
    lowRiskCount: 9776,
    revenueAtRisk: 1240000,
    retentionOpportunity: 2480000,
    lastUpdated: '21 Sep 2026',
    datasetName: 'cloudserve_activity_q3.csv',
    status: 'Ready',
    dataQualityScore: 98,
    missingValuesPct: 0.8,
    duplicateCount: 12,
    invalidValuesCount: 3,
    invalidDatesCount: 1,
    featureCount: 17,
    selectedModel: 'XGBoost',
    models: [
      { name: 'XGBoost (Optimized)', type: 'Gradient Boosted Trees', accuracy: 88.2, precision: 83.5, recall: 84.1, f1: 83.8, rocAuc: 0.91, isSelected: true },
      { name: 'Random Forest', type: 'Ensemble Bagging', accuracy: 84.1, precision: 79.4, recall: 80.5, f1: 79.9, rocAuc: 0.87 },
      { name: 'Logistic Regression', type: 'Baseline Classifier', accuracy: 79.6, precision: 73.8, recall: 76.2, f1: 75.0, rocAuc: 0.82 },
    ],
    confusionMatrix: {
      truePositive: 775,
      falsePositive: 149,
      trueNegative: 11767,
      falseNegative: 149,
    },
    churnDriversBreakdown: [
      { name: 'Low Engagement', percentage: 38, description: 'Underutilization of assigned cloud worker nodes' },
      { name: 'Payment Issues', percentage: 24, description: 'Corporate card expiries and procurement delays' },
      { name: 'Usage Decline', percentage: 20, description: 'Drop in API pipeline triggers' },
      { name: 'Complaints', percentage: 12, description: 'Latency complaints on European clusters' },
      { name: 'Short Tenure', percentage: 6, description: 'Early churn during proof-of-concept phase' },
    ],
    churnTrend7d: [
      { date: '16 Sep', churnRate: 12.1, predictedRisk: 12.3, retainedCustomers: 280 },
      { date: '17 Sep', churnRate: 12.0, predictedRisk: 12.1, retainedCustomers: 290 },
      { date: '18 Sep', churnRate: 11.9, predictedRisk: 12.0, retainedCustomers: 295 },
      { date: '19 Sep', churnRate: 11.8, predictedRisk: 11.9, retainedCustomers: 305 },
      { date: '20 Sep', churnRate: 11.7, predictedRisk: 11.7, retainedCustomers: 310 },
      { date: '21 Sep', churnRate: 11.7, predictedRisk: 11.8, retainedCustomers: 312 },
      { date: '22 Sep', churnRate: 11.6, predictedRisk: 11.7, retainedCustomers: 315 },
    ],
    churnTrend30d: [
      { date: 'Wk 1 (Aug)', churnRate: 13.2, predictedRisk: 13.5, retainedCustomers: 850 },
      { date: 'Wk 2 (Aug)', churnRate: 12.7, predictedRisk: 12.9, retainedCustomers: 920 },
      { date: 'Wk 3 (Sep)', churnRate: 12.1, predictedRisk: 12.3, retainedCustomers: 1040 },
      { date: 'Wk 4 (Sep)', churnRate: 11.7, predictedRisk: 11.7, retainedCustomers: 1150 },
    ],
    churnTrend6m: [
      { date: 'Apr 2026', churnRate: 14.8, predictedRisk: 15.2, retainedCustomers: 2600 },
      { date: 'May 2026', churnRate: 14.1, predictedRisk: 14.5, retainedCustomers: 2800 },
      { date: 'Jun 2026', churnRate: 13.5, predictedRisk: 13.8, retainedCustomers: 3000 },
      { date: 'Jul 2026', churnRate: 12.8, predictedRisk: 13.0, retainedCustomers: 3300 },
      { date: 'Aug 2026', churnRate: 12.2, predictedRisk: 12.5, retainedCustomers: 3600 },
      { date: 'Sep 2026', churnRate: 11.7, predictedRisk: 11.7, retainedCustomers: 3950 },
    ],
    churnTrend1y: [
      { date: 'Q4 2025', churnRate: 16.2, predictedRisk: 16.8, retainedCustomers: 9500 },
      { date: 'Q1 2026', churnRate: 14.9, predictedRisk: 15.4, retainedCustomers: 10800 },
      { date: 'Q2 2026', churnRate: 13.1, predictedRisk: 13.6, retainedCustomers: 11900 },
      { date: 'Q3 2026', churnRate: 11.7, predictedRisk: 11.7, retainedCustomers: 12840 },
    ],
    customers: createMockCustomers('CS', 20),
  },
  {
    id: 'comp_finconnect',
    name: 'FinConnect',
    industry: 'Fintech & Payments',
    description: 'Omni-channel merchant payment gateway and neo-banking infrastructure provider.',
    website: 'https://finconnect.pay',
    countryRegion: 'India & APAC',
    customerCount: 18220,
    churnRate: 15.2,
    highRiskCount: 1745,
    mediumRiskCount: 3210,
    lowRiskCount: 13265,
    revenueAtRisk: 2180000,
    retentionOpportunity: 3950000,
    lastUpdated: '19 Sep 2026',
    datasetName: 'finconnect_txn_churn.csv',
    status: 'Ready',
    dataQualityScore: 95,
    missingValuesPct: 1.8,
    duplicateCount: 31,
    invalidValuesCount: 11,
    invalidDatesCount: 5,
    featureCount: 17,
    selectedModel: 'XGBoost',
    models: [
      { name: 'XGBoost (Optimized)', type: 'Gradient Boosted Trees', accuracy: 86.4, precision: 81.2, recall: 83.0, f1: 82.1, rocAuc: 0.90, isSelected: true },
      { name: 'Random Forest', type: 'Ensemble Bagging', accuracy: 83.0, precision: 77.8, recall: 79.9, f1: 78.8, rocAuc: 0.86 },
      { name: 'Logistic Regression', type: 'Baseline Classifier', accuracy: 77.9, precision: 71.9, recall: 74.5, f1: 73.2, rocAuc: 0.80 },
    ],
    confusionMatrix: {
      truePositive: 1448,
      falsePositive: 297,
      trueNegative: 16120,
      falseNegative: 355,
    },
    churnDriversBreakdown: [
      { name: 'Payment Issues', percentage: 35, description: 'Merchant settlement delays and refund dispute disputes' },
      { name: 'Usage Decline', percentage: 28, description: 'Drop in daily transactional GMV and API call counts' },
      { name: 'Complaints', percentage: 18, description: 'Chargeback compliance escalation tickets' },
      { name: 'Low Engagement', percentage: 12, description: 'Merchant dashboard not accessed for 14+ days' },
      { name: 'Short Tenure', percentage: 7, description: 'Newly onboarded sellers failing KYC verification' },
    ],
    churnTrend7d: [
      { date: '16 Sep', churnRate: 15.8, predictedRisk: 16.0, retainedCustomers: 340 },
      { date: '17 Sep', churnRate: 15.6, predictedRisk: 15.8, retainedCustomers: 355 },
      { date: '18 Sep', churnRate: 15.5, predictedRisk: 15.6, retainedCustomers: 362 },
      { date: '19 Sep', churnRate: 15.4, predictedRisk: 15.4, retainedCustomers: 370 },
      { date: '20 Sep', churnRate: 15.3, predictedRisk: 15.3, retainedCustomers: 375 },
      { date: '21 Sep', churnRate: 15.2, predictedRisk: 15.2, retainedCustomers: 382 },
      { date: '22 Sep', churnRate: 15.2, predictedRisk: 15.1, retainedCustomers: 390 },
    ],
    churnTrend30d: [
      { date: 'Wk 1 (Aug)', churnRate: 16.9, predictedRisk: 17.2, retainedCustomers: 1100 },
      { date: 'Wk 2 (Aug)', churnRate: 16.3, predictedRisk: 16.6, retainedCustomers: 1210 },
      { date: 'Wk 3 (Sep)', churnRate: 15.7, predictedRisk: 16.0, retainedCustomers: 1340 },
      { date: 'Wk 4 (Sep)', churnRate: 15.2, predictedRisk: 15.2, retainedCustomers: 1480 },
    ],
    churnTrend6m: [
      { date: 'Apr 2026', churnRate: 18.5, predictedRisk: 19.0, retainedCustomers: 3800 },
      { date: 'May 2026', churnRate: 17.8, predictedRisk: 18.2, retainedCustomers: 4100 },
      { date: 'Jun 2026', churnRate: 17.1, predictedRisk: 17.5, retainedCustomers: 4400 },
      { date: 'Jul 2026', churnRate: 16.4, predictedRisk: 16.8, retainedCustomers: 4750 },
      { date: 'Aug 2026', churnRate: 15.8, predictedRisk: 16.1, retainedCustomers: 5100 },
      { date: 'Sep 2026', churnRate: 15.2, predictedRisk: 15.2, retainedCustomers: 5500 },
    ],
    churnTrend1y: [
      { date: 'Q4 2025', churnRate: 20.8, predictedRisk: 21.4, retainedCustomers: 13500 },
      { date: 'Q1 2026', churnRate: 18.9, predictedRisk: 19.5, retainedCustomers: 15200 },
      { date: 'Q2 2026', churnRate: 16.8, predictedRisk: 17.3, retainedCustomers: 16800 },
      { date: 'Q3 2026', churnRate: 15.2, predictedRisk: 15.3, retainedCustomers: 18220 },
    ],
    customers: createMockCustomers('FC', 22),
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'High Risk Spike Detected',
    message: '142 new high-risk customer accounts flagged by XGBoost model in TechStream Services.',
    timeAgo: '15m ago',
    type: 'danger',
    read: false,
    linkTab: 'customers',
    companyId: 'comp_techstream',
  },
  {
    id: 'notif_2',
    title: 'Revenue Protection Alert',
    message: '23 high-value enterprise customers require urgent intervention (₹4.2L revenue at stake).',
    timeAgo: '1h ago',
    type: 'warning',
    read: false,
    linkTab: 'recommendations',
    companyId: 'comp_techstream',
  },
  {
    id: 'notif_3',
    title: 'Dataset Preprocessing Completed',
    message: 'customer_churn_data.csv validated with 96% Data Quality Score and 17 ML features ready.',
    timeAgo: '3h ago',
    type: 'success',
    read: true,
    linkTab: 'data-management',
    companyId: 'comp_techstream',
  },
  {
    id: 'notif_4',
    title: 'Model Retraining Evaluation',
    message: 'XGBoost achieved 81.3% F1 score & 0.89 ROC-AUC on holdout test partition.',
    timeAgo: '1d ago',
    type: 'info',
    read: true,
    linkTab: 'model-performance',
    companyId: 'comp_techstream',
  },
];
