from typing import List, Dict, Any
from .schemas import CustomerRecommendation

def generate_customer_recommendations(customer: Dict[str, Any]) -> List[CustomerRecommendation]:
    """
    Ported directly from StayPlus recommendation engine (src/services/recommendationEngine.ts).
    Evaluates 5 business retention rules based on customer behavioral signals.
    """
    recommendations: List[CustomerRecommendation] = []
    
    monthly_bill = float(customer.get("monthly_bill", 0.0))
    churn_probability = float(customer.get("churn_probability", 0.0))
    usage_change_pct = float(customer.get("usage_change_pct", 0.0))
    complaint_count = int(customer.get("complaint_count", 0))
    payment_delay_days = int(customer.get("payment_delay_days", 0))
    engagement_score = float(customer.get("engagement_score", 0.0))

    # Rule 1: High Complaints
    if complaint_count >= 3:
        recommendations.append(CustomerRecommendation(
            id="rec_support",
            title="Dedicated Priority Support Concierge",
            category="Priority Support",
            description=f"Customer logged {complaint_count} complaints. Assign a senior success manager and resolve unresolved tickets within 24 hours.",
            impactEstimate="-18% Churn Risk reduction",
            icon="Headphones",
            urgency="Immediate"
        ))

    # Rule 2: Usage Decline
    if usage_change_pct <= -30:
        recommendations.append(CustomerRecommendation(
            id="rec_usage",
            title="Feature Re-engagement & Onboarding Audit",
            category="Re-engagement Campaign",
            description=f"Service usage dropped by {abs(usage_change_pct):.0f}%. Trigger in-app workflow guide and highlight new premium integrations.",
            impactEstimate="-15% Churn Risk reduction",
            icon="Sparkles",
            urgency="Within 48h"
        ))

    # Rule 3: Payment Delay / Billing friction
    if payment_delay_days >= 10:
        recommendations.append(CustomerRecommendation(
            id="rec_payment",
            title="Flexible Billing Schedule & Payment Grace Plan",
            category="Payment Assistance",
            description=f"Average payment delay of {payment_delay_days} days. Offer split billing or switch payment gateway with zero penalty.",
            impactEstimate="-12% Churn Risk reduction",
            icon="CreditCard",
            urgency="Within 48h"
        ))

    # Rule 4: High Value + High Churn Risk
    if monthly_bill >= 1200 and churn_probability >= 70:
        recommendations.append(CustomerRecommendation(
            id="rec_offer",
            title="VIP 25% Loyalty Renewal Discount",
            category="Retention Offer",
            description=f"High monthly revenue customer (₹{monthly_bill:,.0f}) showing severe flight risk. Issue an exclusive 3-month fee waiver.",
            impactEstimate="-24% Churn Risk reduction",
            icon="Gift",
            urgency="Immediate"
        ))

    # Rule 5: Low Engagement
    if engagement_score < 40:
        recommendations.append(CustomerRecommendation(
            id="rec_campaign",
            title="Personalized Executive Outreach Campaign",
            category="Re-engagement Campaign",
            description=f"Engagement index at {engagement_score:.0f}%. Send curated product value digest and invite to an exclusive roadmap consultation.",
            impactEstimate="-10% Churn Risk reduction",
            icon="Mail",
            urgency="Next Billing Cycle"
        ))

    # Fallback if no specific condition met
    if not recommendations:
        recommendations.append(CustomerRecommendation(
            id="rec_general",
            title="Proactive Health Check-in Survey",
            category="Priority Support",
            description="Customer in healthy range. Send automated NPS survey and reward continuous active tenure.",
            impactEstimate="-4% Churn Risk reduction",
            icon="Smile",
            urgency="Next Billing Cycle"
        ))

    return recommendations

def get_recommended_action_summary(recommendations: List[CustomerRecommendation]) -> str:
    if not recommendations:
        return "Proactive Health Check-in Survey"
    return recommendations[0].title
