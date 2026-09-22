import React, { useState } from 'react';
import {
  Headphones,
  Gift,
  Mail,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  Users,
  Search,
  Phone,
  Star,
  TrendingDown,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCheck,
} from 'lucide-react';
import { Company, Customer } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

interface RecommendationsViewProps {
  company: Company;
  onSelectCustomer: (customer: Customer) => void;
  onOpenSimulator: (customer: Customer) => void;
}

type Tip = { icon: React.ElementType; tip: string; action: string; category: 'call' | 'message' | 'offer' };

function getRetentionTips(customer: Customer): Tip[] {
  const tips: Tip[] = [];
  const firstName = customer.name.split(' ')[0];

  if (customer.complaint_count >= 3) {
    tips.push({ icon: Headphones, tip: `${firstName} has raised ${customer.complaint_count} complaints. Unresolved issues are the #1 reason customers leave.`, action: 'Call them today and assign a dedicated support agent.', category: 'call' });
  }
  if (customer.usage_change_pct <= -25) {
    tips.push({ icon: TrendingDown, tip: `Their usage dropped by ${Math.abs(customer.usage_change_pct)}% recently. They may have lost interest or found a competitor.`, action: 'Send a personal email asking what features they need help with.', category: 'message' });
  }
  if (customer.payment_delay_days >= 10) {
    tips.push({ icon: CreditCard, tip: `Payment is delayed by ${customer.payment_delay_days} days. Billing friction often leads to quiet churn.`, action: 'Offer flexible EMI or extend the due date by 2 weeks, no penalty.', category: 'offer' });
  }
  if (customer.engagement_score < 40) {
    tips.push({ icon: Mail, tip: `Engagement score is very low at ${customer.engagement_score}%. They are barely using the product.`, action: 'Invite them to a free 1-on-1 product walkthrough session.', category: 'message' });
  }
  if (customer.monthly_bill >= 1200 && customer.churn_probability >= 65) {
    tips.push({ icon: Gift, tip: `They pay ₹${customer.monthly_bill.toLocaleString('en-IN')}/month and are at high risk. Losing them would hurt revenue significantly.`, action: 'Offer a 20% loyalty discount for the next 3 months to retain them.', category: 'offer' });
  }
  if (customer.tenure_months < 6) {
    tips.push({ icon: Star, tip: `${firstName} is a new customer (only ${customer.tenure_months} months). New customers need extra attention to build loyalty.`, action: 'Schedule a welcome check-in call and share a getting-started guide.', category: 'call' });
  }
  if (tips.length === 0) {
    tips.push({ icon: Phone, tip: `${firstName} looks healthy overall but regular check-ins keep customers happy.`, action: 'Send a quick satisfaction survey or a thank-you message this week.', category: 'message' });
  }
  return tips;
}

function getCategoryActionKeys(customers: Customer[], category: 'call' | 'message' | 'offer'): string[] {
  const keys: string[] = [];
  customers.forEach(customer => {
    getRetentionTips(customer).forEach((tip, idx) => {
      if (tip.category === category) keys.push(`${customer.customer_id}_${idx}`);
    });
  });
  return keys;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ company, onSelectCustomer, onOpenSimulator }) => {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [executedActions, setExecutedActions] = useState<Set<string>>(new Set());
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const sortedCustomers = [...company.customers].sort((a, b) => b.churn_probability - a.churn_probability);
  const filtered = sortedCustomers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.customer_id.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'All' || c.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleExecute = (key: string) => setExecutedActions(prev => new Set(prev).add(key));
  const handleBulkAction = (category: 'call' | 'message' | 'offer') => {
    const keys = getCategoryActionKeys(company.customers, category);
    setExecutedActions(prev => { const next = new Set(prev); keys.forEach(k => next.add(k)); return next; });
  };
  const isBulkDone = (category: 'call' | 'message' | 'offer') => {
    const keys = getCategoryActionKeys(company.customers, category);
    return keys.length > 0 && keys.every(k => executedActions.has(k));
  };

  const categories: { id: 'call' | 'message' | 'offer'; label: string; desc: string; buttonLabel: string; doneLabel: string; color: string; btnColor: string; icon: React.ElementType; count: number }[] = [
    { id: 'call', label: 'Call Immediately', desc: 'Customers with complaints or very high churn risk', buttonLabel: '📞 Call All & Mark Done', doneLabel: '✓ All Called', color: 'bg-red-50 border-red-200 text-red-700', btnColor: 'bg-red-500 hover:bg-red-600 text-white', icon: Phone, count: company.customers.filter(c => c.complaint_count >= 3 || c.churn_probability >= 65).length },
    { id: 'message', label: 'Send a Message', desc: 'Customers with low engagement or usage drop', buttonLabel: '✉️ Message All & Mark Done', doneLabel: '✓ All Messaged', color: 'bg-amber-50 border-amber-200 text-amber-700', btnColor: 'bg-amber-500 hover:bg-amber-600 text-white', icon: MessageSquare, count: company.customers.filter(c => c.engagement_score < 40 || c.usage_change_pct <= -25).length },
    { id: 'offer', label: 'Give an Offer', desc: 'High-value customers at flight risk', buttonLabel: '🎁 Send Offer to All & Mark Done', doneLabel: '✓ Offers Sent', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', btnColor: 'bg-emerald-500 hover:bg-emerald-600 text-white', icon: Gift, count: company.customers.filter(c => c.monthly_bill >= 1200 && c.churn_probability >= 65).length },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-100 text-coral-700 text-xs font-bold mb-1.5">
            <Zap className="w-3.5 h-3.5" /><span>Customer Retention Playbook</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">How to Keep Each Customer</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Apply bulk actions to entire categories, or handle customers one by one.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white px-3 py-2 rounded-xl border border-coral-200">
          <Users className="w-4 h-4 text-coral-500" />
          <span><strong className="text-red-600">{company.customers.filter(c => c.risk_level === 'High').length}</strong> High &nbsp;|&nbsp;<strong className="text-amber-600">{company.customers.filter(c => c.risk_level === 'Medium').length}</strong> Medium Risk</span>
        </div>
      </div>

      {/* Bulk Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categories.map(cat => {
          const Icon = cat.icon;
          const done = isBulkDone(cat.id);
          return (
            <div key={cat.id} className={`p-4 rounded-2xl border ${cat.color} flex flex-col gap-3`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0"><Icon className="w-4 h-4" /></div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold">{cat.label}</p>
                  <p className="text-xs opacity-80 mt-0.5">{cat.desc}</p>
                  <p className="text-xl font-black mt-1">{cat.count} customers</p>
                </div>
              </div>
              <button
                onClick={() => !done && handleBulkAction(cat.id)}
                disabled={done}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${done ? 'bg-white/60 text-green-700 border border-green-300 cursor-default' : `${cat.btnColor} shadow-sm active:scale-95`}`}
              >
                {done ? <><CheckCheck className="w-3.5 h-3.5" />{cat.doneLabel}</> : <><Send className="w-3.5 h-3.5" />{cat.buttonLabel}</>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 text-xs text-gray-400 font-semibold">
        <div className="flex-1 h-px bg-coral-100" /><span>OR handle customers individually below</span><div className="flex-1 h-px bg-coral-100" />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search customer by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-coral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-coral-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'High', 'Medium', 'Low'].map(level => (
            <button key={level} onClick={() => setRiskFilter(level)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${riskFilter === level ? 'bg-coral-500 text-white border-coral-500 shadow-md' : 'bg-white text-gray-600 border-coral-200 hover:border-coral-300'}`}>{level}</button>
          ))}
        </div>
      </div>

      {/* Per-Customer Cards */}
      <div className="space-y-4">
        {filtered.map(customer => {
          const tips = getRetentionTips(customer);
          const isExpanded = expandedCustomer === customer.customer_id;
          const allDone = tips.every((_, i) => executedActions.has(`${customer.customer_id}_${i}`));
          return (
            <div key={customer.customer_id} className={`bg-white rounded-2xl border transition-all shadow-sm ${allDone ? 'border-emerald-300' : 'border-coral-200 hover:border-coral-300'}`}>
              <div className="flex items-center justify-between p-4 sm:p-5 cursor-pointer" onClick={() => setExpandedCustomer(isExpanded ? null : customer.customer_id)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-coral-100 text-coral-700 flex items-center justify-center font-bold text-sm shrink-0">{customer.name.substring(0, 2).toUpperCase()}</div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-[#252525] text-sm">{customer.name}</p>
                      <span className="text-xs font-mono text-gray-400">{customer.customer_id}</span>
                      {allDone && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ All Done</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{customer.plan} Plan · ₹{customer.monthly_bill.toLocaleString('en-IN')}/mo · {customer.tenure_months} months</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-coral-600">{customer.churn_probability}% risk</p>
                    <p className="text-[10px] text-gray-400">{tips.length} action{tips.length > 1 ? 's' : ''}</p>
                  </div>
                  <RiskBadge level={customer.risk_level} size="sm" />
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-coral-100 px-4 sm:px-5 pb-5 pt-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">What to do to keep {customer.name.split(' ')[0]}</p>
                    <button onClick={() => onOpenSimulator(customer)} className="text-xs font-bold text-coral-600 hover:text-coral-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /><span>What-if Simulator</span>
                    </button>
                  </div>
                  {tips.map((tip, idx) => {
                    const Icon = tip.icon;
                    const actionKey = `${customer.customer_id}_${idx}`;
                    const isDone = executedActions.has(actionKey);
                    return (
                      <div key={idx} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${isDone ? 'bg-emerald-50/60 border-emerald-200' : 'bg-coral-50/40 border-coral-100'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-coral-100 text-coral-600'}`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 leading-relaxed">{tip.tip}</p>
                          <p className={`text-xs font-bold mt-1 ${isDone ? 'text-emerald-700' : 'text-coral-700'}`}>👉 {tip.action}</p>
                        </div>
                        <button onClick={() => handleExecute(actionKey)} disabled={isDone} className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 ${isDone ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-coral-500 hover:bg-coral-600 text-white shadow-sm active:scale-95'}`}>
                          {isDone ? '✓ Done' : 'Mark Done'}
                        </button>
                      </div>
                    );
                  })}
                  <button onClick={() => onSelectCustomer(customer)} className="w-full mt-1 py-2 rounded-xl border border-coral-200 text-xs font-bold text-coral-600 hover:bg-coral-50 transition-colors">
                    View Full Customer Profile →
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No customers match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
