import React, { useState } from 'react';
import {
  Lightbulb,
  Headphones,
  Gift,
  Mail,
  CreditCard,
  CheckCircle2,
  Filter,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
} from 'lucide-react';
import { Company, Customer } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

interface RecommendationsViewProps {
  company: Company;
  onSelectCustomer: (customer: Customer) => void;
  onOpenSimulator: (customer: Customer) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  company,
  onSelectCustomer,
  onOpenSimulator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [executedActions, setExecutedActions] = useState<Set<string>>(new Set());

  // Aggregate all customer recommendations
  const allRecommendations = company.customers.flatMap(cust =>
    cust.recommendations.map(rec => ({
      ...rec,
      customer: cust,
    }))
  );

  const filteredRecommendations = allRecommendations.filter(item => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  const handleExecuteAction = (key: string) => {
    setExecutedActions(prev => new Set(prev).add(key));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-100 text-coral-700 text-xs font-bold mb-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Prescriptive Retention AI Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">
            Retention Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Rule-based and ML-triggered retention playbooks designed to recover flight-risk accounts across {company.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white px-3 py-2 rounded-xl border border-coral-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>
            Total Retention Opportunity: <strong className="text-emerald-700">₹{(company.retentionOpportunity / 100000).toFixed(1)}L</strong>
          </span>
        </div>
      </div>

      {/* Strategy Category Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: 'All', label: 'All Playbooks', count: allRecommendations.length, icon: Lightbulb },
          { id: 'Priority Support', label: 'Priority Support', count: allRecommendations.filter(r => r.category === 'Priority Support').length, icon: Headphones },
          { id: 'Retention Offer', label: 'VIP Retention Offers', count: allRecommendations.filter(r => r.category === 'Retention Offer').length, icon: Gift },
          { id: 'Re-engagement Campaign', label: 'Re-engagement', count: allRecommendations.filter(r => r.category === 'Re-engagement Campaign').length, icon: Mail },
          { id: 'Payment Assistance', label: 'Payment Grace', count: allRecommendations.filter(r => r.category === 'Payment Assistance').length, icon: CreditCard },
        ].map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-white border-coral-500 ring-2 ring-coral-500 shadow-md scale-[1.02]'
                  : 'bg-white border-coral-100 hover:border-coral-200 hover:bg-coral-50/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-coral-600' : 'text-gray-400'}`} />
                <span className="text-xs font-bold text-coral-600">{cat.count}</span>
              </div>
              <p className="text-xs font-bold text-[#252525] truncate">{cat.label}</p>
            </button>
          );
        })}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecommendations.map((rec, idx) => {
          const actionKey = `${rec.customer.customer_id}_${rec.id}`;
          const isDone = executedActions.has(actionKey);

          return (
            <div
              key={idx}
              className="card-coral p-5 bg-white flex flex-col justify-between hover:border-coral-300 transition-all"
            >
              <div>
                {/* Customer Snapshot */}
                <div className="flex items-start justify-between pb-3 border-b border-coral-100 mb-3">
                  <div
                    onClick={() => onSelectCustomer(rec.customer)}
                    className="cursor-pointer group flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-coral-100 text-coral-700 flex items-center justify-center font-bold text-xs">
                      {rec.customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#252525] group-hover:text-coral-600 transition-colors">
                        {rec.customer.name}
                      </p>
                      <span className="text-[10px] font-mono text-gray-400">
                        {rec.customer.customer_id} • {rec.customer.plan}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <RiskBadge level={rec.customer.risk_level} size="sm" />
                    <span className="text-[11px] font-bold text-coral-600 block mt-0.5">
                      {rec.customer.churn_probability}% risk
                    </span>
                  </div>
                </div>

                {/* Recommendation Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-coral-700 bg-coral-50 border border-coral-200 px-2 py-0.5 rounded-md">
                      {rec.category}
                    </span>
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                      {rec.urgency}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#252525] leading-snug">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-coral-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">
                  {rec.impactEstimate}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenSimulator(rec.customer)}
                    className="p-1.5 rounded-lg border border-coral-200 text-gray-500 hover:text-coral-600 hover:bg-coral-50 transition-colors"
                    title="Test in What-if Simulator"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleExecuteAction(actionKey)}
                    disabled={isDone}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-coral-500 hover:bg-coral-600 text-white shadow-2xs active:scale-95'
                    }`}
                  >
                    {isDone ? '✓ Triggered' : 'Execute Playbook'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
