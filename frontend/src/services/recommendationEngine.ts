import { Customer, CustomerRecommendation, ChurnDriverImpact } from '../types';

export function generateCustomerRecommendations(customer: {
  monthly_bill: number;
  churn_probability: number;
  usage_change_pct: number;
  complaint_count: number;
  payment_delay_days: number;
  engagement_score: number;
}): CustomerRecommendation[] {
  const recommendations: CustomerRecommendation[] = [];

  // Rule 1: High Complaints
  if (customer.complaint_count >= 3) {
    recommendations.push({
      id: 'rec_support',
      title: 'Dedicated Priority Support Concierge',
      category: 'Priority Support',
      description: `Customer logged ${customer.complaint_count} complaints. Assign a senior success manager and resolve unresolved tickets within 24 hours.`,
      impactEstimate: '-18% Churn Risk reduction',
      icon: 'Headphones',
      urgency: 'Immediate',
    });
  }

  // Rule 2: Usage Decline
  if (customer.usage_change_pct <= -30) {
    recommendations.push({
      id: 'rec_usage',
      title: 'Feature Re-engagement & Onboarding Audit',
      category: 'Re-engagement Campaign',
      description: `Service usage dropped by ${Math.abs(customer.usage_change_pct)}%. Trigger in-app workflow guide and highlight new premium integrations.`,
      impactEstimate: '-15% Churn Risk reduction',
      icon: 'Sparkles',
      urgency: 'Within 48h',
    });
  }

  // Rule 3: Payment Delay / Billing friction
  if (customer.payment_delay_days >= 10) {
    recommendations.push({
      id: 'rec_payment',
      title: 'Flexible Billing Schedule & Payment Grace Plan',
      category: 'Payment Assistance',
      description: `Average payment delay of ${customer.payment_delay_days} days. Offer split billing or switch payment gateway with zero penalty.`,
      impactEstimate: '-12% Churn Risk reduction',
      icon: 'CreditCard',
      urgency: 'Within 48h',
    });
  }

  // Rule 4: High Value + High Churn Risk
  if (customer.monthly_bill >= 1200 && customer.churn_probability >= 70) {
    recommendations.push({
      id: 'rec_offer',
      title: 'VIP 25% Loyalty Renewal Discount',
      category: 'Retention Offer',
      description: `High monthly revenue customer (₹${customer.monthly_bill.toLocaleString('en-IN')}) showing severe flight risk. Issue an exclusive 3-month fee waiver.`,
      impactEstimate: '-24% Churn Risk reduction',
      icon: 'Gift',
      urgency: 'Immediate',
    });
  }

  // Rule 5: Low Engagement
  if (customer.engagement_score < 40) {
    recommendations.push({
      id: 'rec_campaign',
      title: 'Personalized Executive Outreach Campaign',
      category: 'Re-engagement Campaign',
      description: `Engagement index at ${customer.engagement_score}%. Send curated product value digest and invite to an exclusive roadmap consultation.`,
      impactEstimate: '-10% Churn Risk reduction',
      icon: 'Mail',
      urgency: 'Next Billing Cycle',
    });
  }

  // Fallback if no specific condition met
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec_general',
      title: 'Proactive Health Check-in Survey',
      category: 'Priority Support',
      description: 'Customer in healthy range. Send automated NPS survey and reward continuous active tenure.',
      impactEstimate: '-4% Churn Risk reduction',
      icon: 'Smile',
      urgency: 'Next Billing Cycle',
    });
  }

  return recommendations;
}

export function calculateChurnDrivers(customer: {
  usage_change_pct: number;
  complaint_count: number;
  payment_delay_days: number;
  engagement_score: number;
  tenure_months: number;
}): ChurnDriverImpact[] {
  const drivers: ChurnDriverImpact[] = [];

  // Usage Decline driver
  if (customer.usage_change_pct < 0) {
    const impact = Math.min(45, Math.round(Math.abs(customer.usage_change_pct) * 0.75));
    drivers.push({
      driver: 'Usage Decline',
      impact,
      description: `Usage dropped by ${Math.abs(customer.usage_change_pct)}% over past 30 days`,
      direction: 'risk_increasing',
    });
  }

  // Complaints driver
  if (customer.complaint_count > 0) {
    const impact = Math.min(35, Math.round(customer.complaint_count * 8.5));
    drivers.push({
      driver: 'Support Complaints',
      impact,
      description: `${customer.complaint_count} support tickets filed with average 5+ day turnaround`,
      direction: 'risk_increasing',
    });
  }

  // Payment Delays
  if (customer.payment_delay_days > 0) {
    const impact = Math.min(30, Math.round(customer.payment_delay_days * 1.5));
    drivers.push({
      driver: 'Payment Delay',
      impact,
      description: `${customer.payment_delay_days} days delay in invoice settlement`,
      direction: 'risk_increasing',
    });
  }

  // Low Engagement
  if (customer.engagement_score < 60) {
    const impact = Math.min(25, Math.round((60 - customer.engagement_score) * 0.7));
    drivers.push({
      driver: 'Low Engagement',
      impact,
      description: `Platform engagement index is ${customer.engagement_score}% (healthy is >75%)`,
      direction: 'risk_increasing',
    });
  }

  // Short Tenure
  if (customer.tenure_months < 12) {
    drivers.push({
      driver: 'Short Tenure',
      impact: 14,
      description: `Customer is in early lifecycle stage (${customer.tenure_months} months active)`,
      direction: 'risk_increasing',
    });
  }

  // Sort descending by impact
  return drivers.sort((a, b) => b.impact - a.impact);
}

export interface SimulationParams {
  usageChangePct: number;
  complaintCount: number;
  paymentDelayDays: number;
  engagementScore: number;
}

export function simulateCustomerRisk(
  baseCustomer: Customer,
  params: SimulationParams
): {
  simulatedRisk: number;
  riskDelta: number;
  simulatedRiskLevel: 'High' | 'Medium' | 'Low';
  factors: { name: string; changeText: string; direction: 'better' | 'worse' | 'neutral' }[];
} {
  let risk = baseCustomer.churn_probability;

  const factors: { name: string; changeText: string; direction: 'better' | 'worse' | 'neutral' }[] = [];

  // Usage delta effect
  const usageDiff = params.usageChangePct - baseCustomer.usage_change_pct;
  if (usageDiff > 0) {
    // Usage improved
    const reduction = (usageDiff / 100) * 32;
    risk -= reduction;
    factors.push({
      name: 'Usage Improvement',
      changeText: `Usage trend improved by +${Math.round(usageDiff)}%`,
      direction: 'better',
    });
  } else if (usageDiff < 0) {
    const increase = (Math.abs(usageDiff) / 100) * 20;
    risk += increase;
    factors.push({
      name: 'Usage Decline',
      changeText: `Usage dropped further by ${Math.round(usageDiff)}%`,
      direction: 'worse',
    });
  }

  // Complaints effect
  const complaintsDiff = params.complaintCount - baseCustomer.complaint_count;
  if (complaintsDiff < 0) {
    const reduction = Math.abs(complaintsDiff) * 6.5;
    risk -= reduction;
    factors.push({
      name: 'Resolved Complaints',
      changeText: `Complaints reduced by ${Math.abs(complaintsDiff)}`,
      direction: 'better',
    });
  } else if (complaintsDiff > 0) {
    const increase = complaintsDiff * 5;
    risk += increase;
    factors.push({
      name: 'Increased Complaints',
      changeText: `Complaints increased by +${complaintsDiff}`,
      direction: 'worse',
    });
  }

  // Payment delay effect
  const delayDiff = params.paymentDelayDays - baseCustomer.payment_delay_days;
  if (delayDiff < 0) {
    const reduction = Math.abs(delayDiff) * 1.1;
    risk -= reduction;
    factors.push({
      name: 'Settled Payments',
      changeText: `Payment delay reduced by ${Math.abs(delayDiff)} days`,
      direction: 'better',
    });
  } else if (delayDiff > 0) {
    const increase = delayDiff * 0.9;
    risk += increase;
    factors.push({
      name: 'Payment Friction',
      changeText: `Payment delayed by additional ${delayDiff} days`,
      direction: 'worse',
    });
  }

  // Engagement effect
  const engDiff = params.engagementScore - baseCustomer.engagement_score;
  if (engDiff > 0) {
    const reduction = (engDiff / 100) * 25;
    risk -= reduction;
    factors.push({
      name: 'Boosted Engagement',
      changeText: `Platform engagement increased to ${params.engagementScore}%`,
      direction: 'better',
    });
  } else if (engDiff < 0) {
    const increase = (Math.abs(engDiff) / 100) * 18;
    risk += increase;
    factors.push({
      name: 'Lower Engagement',
      changeText: `Platform engagement fell to ${params.engagementScore}%`,
      direction: 'worse',
    });
  }

  // Clamp risk between 5% and 98%
  const simulatedRisk = Math.min(98, Math.max(5, Math.round(risk)));
  const riskDelta = simulatedRisk - baseCustomer.churn_probability;

  let simulatedRiskLevel: 'High' | 'Medium' | 'Low' = 'Low';
  if (simulatedRisk >= 65) {
    simulatedRiskLevel = 'High';
  } else if (simulatedRisk >= 35) {
    simulatedRiskLevel = 'Medium';
  }

  return {
    simulatedRisk,
    riskDelta,
    simulatedRiskLevel,
    factors,
  };
}
