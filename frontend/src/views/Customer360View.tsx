import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  AlertTriangle,
  CreditCard,
  Activity,
  MessageSquare,
  Sparkles,
  Sliders,
  Calendar,
  MapPin,
  Clock,
  ShieldAlert,
  Headphones,
  Gift,
  Mail,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { Customer } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskGauge } from '../components/common/RiskGauge';

interface Customer360ViewProps {
  customer: Customer;
  onBack: () => void;
  onOpenSimulator: (customer: Customer) => void;
  onActionApplied?: (title: string) => void;
}

export const Customer360View: React.FC<Customer360ViewProps> = ({
  customer,
  onBack,
  onOpenSimulator,
  onActionApplied,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'behaviour' | 'billing' | 'complaints'>('overview');
  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());

  const handleApplyAction = (actionId: string, actionTitle: string) => {
    setAppliedActions(prev => new Set(prev).add(actionId));
    if (onActionApplied) {
      onActionApplied(actionTitle);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-coral-600 transition-colors bg-white px-3 py-1.5 rounded-xl border border-coral-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </button>

        <button
          onClick={() => onOpenSimulator(customer)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs shadow-md shadow-coral-500/20 transition-all active:scale-95"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Open in What-if Simulator</span>
        </button>
      </div>

      {/* Customer Header Card (Section 20) */}
      <div className="card-coral p-6 bg-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Customer Avatar & Basic Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-coral-100 border border-coral-200 text-coral-700 flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
              {customer.name.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-[#252525]">
                  {customer.name}
                </h1>
                <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                  {customer.customer_id}
                </span>
                <RiskBadge level={customer.risk_level} size="md" />
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  {customer.segment} Segment
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> {customer.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {customer.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> {customer.tenure_months} months tenure
                </span>
              </p>
            </div>
          </div>

          {/* Risk Gauge Header Widget */}
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-coral-50/50 border border-coral-200 self-stretch lg:self-auto justify-between lg:justify-start">
            <div className="text-left min-w-[140px]">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Predicted Flight Risk
              </span>
              <p className={`text-3xl font-black mt-0.5 ${
                customer.risk_level === 'High'
                  ? 'text-red-600'
                  : customer.risk_level === 'Medium'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}>
                {customer.churn_probability}%
              </p>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-block mt-1 ${
                customer.risk_level === 'High'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : customer.risk_level === 'Medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {customer.risk_level.toUpperCase()} RISK CUSTOMER
              </span>
            </div>
            <div className="shrink-0">
              <RiskGauge score={customer.churn_probability} size={120} label="" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-coral-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Customer Overview & SHAP', icon: User },
          { id: 'behaviour', label: 'Behaviour & Activity', icon: Activity },
          { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
          { id: 'complaints', label: 'Support & Tickets', icon: MessageSquare },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-coral-500 text-white shadow-sm shadow-coral-500/25'
                  : 'text-gray-600 hover:bg-coral-50 hover:text-coral-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & SHAP Explainability (Sections 20, 22) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 Quick Attribute Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-coral p-4 bg-white">
              <p className="text-[11px] font-semibold text-gray-500 uppercase">Subscription Plan</p>
              <p className="text-lg font-bold text-[#252525] mt-1">{customer.plan}</p>
              <span className="text-[11px] text-gray-400">Monthly recurring</span>
            </div>

            <div className="card-coral p-4 bg-white">
              <p className="text-[11px] font-semibold text-gray-500 uppercase">Monthly Revenue</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                ₹{customer.monthly_bill.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-gray-400">ARR: ₹{(customer.monthly_bill * 12).toLocaleString('en-IN')}</span>
            </div>

            <div className="card-coral p-4 bg-white">
              <p className="text-[11px] font-semibold text-gray-500 uppercase">Usage Trend (30d)</p>
              <p className={`text-lg font-bold mt-1 ${customer.usage_change_pct < 0 ? 'text-coral-600' : 'text-emerald-600'}`}>
                {customer.usage_change_pct > 0 ? `+${customer.usage_change_pct}%` : `${customer.usage_change_pct}%`}
              </p>
              <span className={`text-[11px] font-semibold ${customer.usage_change_pct < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {customer.usage_change_pct < 0 ? 'Activity decline' : 'Healthy activity'}
              </span>
            </div>

            <div className="card-coral p-4 bg-white">
              <p className="text-[11px] font-semibold text-gray-500 uppercase">Logged Complaints</p>
              <p className={`text-lg font-bold mt-1 ${customer.complaint_count >= 3 ? 'text-red-600' : 'text-gray-900'}`}>
                {customer.complaint_count} {customer.complaint_count === 1 ? 'Ticket' : 'Tickets'}
              </p>
              <span className="text-[11px] text-amber-600 font-semibold">
                {customer.open_complaints} {customer.open_complaints === 1 ? 'open ticket' : 'open tickets'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Churn Explainability Section (Section 22) */}
            <div className="card-coral p-5 bg-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-coral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#252525]">
                      Why is this customer at risk?
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-coral-600 bg-coral-100 px-2 py-0.5 rounded">
                      Model Explanation
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    SHAP feature contributions driving the XGBoost churn prediction
                  </p>
                </div>
              </div>

              {/* Explicit Causation Disclaimer from Section 22 */}
              <div className="p-3 bg-coral-50/60 border border-coral-200 rounded-xl text-xs text-gray-600 leading-relaxed">
                <span className="font-bold text-coral-700">Note: </span>
                Factors contributing to the model&apos;s prediction. Shows relative feature weights, not direct causal guarantees.
              </div>

              {/* SHAP-Style Horizontal Bars */}
              <div className="space-y-4 pt-2">
                {customer.churn_drivers.map((driver, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-coral-100 text-coral-700 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {driver.driver}
                      </span>
                      <span className="text-coral-600 font-black">+{driver.impact}% Risk Impact</span>
                    </div>

                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-coral-100">
                      <div
                        className="h-full bg-gradient-to-r from-coral-400 to-coral-600 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, driver.impact * 2.1)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500">{driver.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Activity Timeline (Section 21) */}
            <div className="card-coral p-5 bg-white space-y-4">
              <div className="pb-3 border-b border-coral-100">
                <h3 className="text-base font-bold text-[#252525]">
                  Customer Activity Timeline
                </h3>
                <p className="text-xs text-gray-500">
                  Chronological event trail illustrating the emergence of flight signals
                </p>
              </div>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-coral-200">
                {customer.timeline.map((item, idx) => {
                  const dotColor = {
                    danger: 'bg-red-500 ring-red-100',
                    warning: 'bg-amber-500 ring-amber-100',
                    billing: 'bg-coral-500 ring-coral-100',
                    info: 'bg-blue-500 ring-blue-100',
                  }[item.type];

                  return (
                    <div key={item.id} className="relative group">
                      <div
                        className={`absolute -left-6 top-1 w-3 h-3 rounded-full ring-4 ${dotColor}`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-coral-600">
                            {item.timeAgo}
                          </span>
                          <span className="text-xs text-gray-400">• Event</span>
                        </div>
                        <p className="text-sm font-bold text-[#252525] mt-0.5">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Targeted Retention Recommendations (Sections 25, 26) */}
          <div className="card-coral p-5 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-coral-100">
              <div>
                <h3 className="text-base font-bold text-[#252525]">
                  Prescribed Retention Interventions
                </h3>
                <p className="text-xs text-gray-500">
                  Automated rule-based actions personalized for {customer.name}
                </p>
              </div>
              <span className="text-xs font-bold text-coral-600 bg-coral-50 px-2.5 py-1 rounded-lg border border-coral-200">
                {customer.recommendations.length} Active Recommendations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customer.recommendations.map(rec => {
                const isApplied = appliedActions.has(rec.id);
                return (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl border border-coral-200 bg-coral-50/40 hover:bg-coral-50/70 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-coral-700 bg-white border border-coral-200 px-2 py-0.5 rounded-md">
                          {rec.category}
                        </span>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          {rec.urgency}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#252525] leading-snug">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-coral-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700">
                        {rec.impactEstimate}
                      </span>

                      <button
                        onClick={() => handleApplyAction(rec.id, rec.title)}
                        disabled={isApplied}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isApplied
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-coral-500 hover:bg-coral-600 text-white shadow-2xs active:scale-95'
                        }`}
                      >
                        {isApplied ? '✓ Executed' : 'Execute Action'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Behaviour Metrics */}
      {activeTab === 'behaviour' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Usage</p>
            <p className="text-2xl font-black text-[#252525] mt-1">{customer.monthly_usage_hours} Hours</p>
            <p className="text-xs text-coral-600 mt-1">Dropped {Math.abs(customer.usage_change_pct)}% from baseline</p>
          </div>

          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Weekly Login Frequency</p>
            <p className="text-2xl font-black text-[#252525] mt-1">{customer.login_frequency} Logins / Wk</p>
            <p className="text-xs text-gray-500 mt-1">Average user in tier logs 8.4 times/wk</p>
          </div>

          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Engagement Score</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{customer.engagement_score} / 100</p>
            <p className="text-xs text-gray-500 mt-1">Calculated across 8 core feature modules</p>
          </div>

          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Plan Downgrades</p>
            <p className="text-2xl font-black text-[#252525] mt-1">{customer.plan_changes} Changes</p>
            <p className="text-xs text-coral-600 mt-1">1 seat contraction logged in last 30d</p>
          </div>

          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Satisfaction Score</p>
            <p className="text-2xl font-black text-red-600 mt-1">{customer.satisfaction_score} / 5.0</p>
            <p className="text-xs text-gray-500 mt-1">CSAT score from recent support interaction</p>
          </div>

          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tenure Age</p>
            <p className="text-2xl font-black text-[#252525] mt-1">{customer.tenure_months} Months</p>
            <p className="text-xs text-gray-500 mt-1">Account active since August 2025</p>
          </div>
        </div>
      )}

      {/* Tab 3: Billing & Payments */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Bill</p>
            <p className="text-2xl font-black text-[#252525] mt-1">₹{customer.monthly_bill.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500 mt-1">Billed on the 1st of every calendar month</p>
          </div>

          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Payment Delay</p>
            <p className="text-2xl font-black text-red-600 mt-1">{customer.payment_delay_days} Days Overdue</p>
            <p className="text-xs text-red-500 mt-1">Invoice overdue alert triggered</p>
          </div>

          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Payment Failures</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{customer.payment_failures} Failures</p>
            <p className="text-xs text-gray-500 mt-1">Gateway card charge retries registered</p>
          </div>
        </div>
      )}

      {/* Tab 4: Complaints */}
      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Support Tickets</p>
            <p className="text-2xl font-black text-red-600 mt-1">{customer.complaint_count}</p>
            <p className="text-xs text-gray-500 mt-1">Lifetime support escalation requests</p>
          </div>

          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Open Tickets</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{customer.open_complaints}</p>
            <p className="text-xs text-amber-600 mt-1">Pending engineering investigation</p>
          </div>

          <div className="card-coral p-5 bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Avg. Resolution Turnaround</p>
            <p className="text-2xl font-black text-[#252525] mt-1">{customer.avg_resolution_days} Days</p>
            <p className="text-xs text-gray-500 mt-1">SLA benchmark target is &lt;2.0 days</p>
          </div>
        </div>
      )}
    </div>
  );
};
