import React, { useState } from 'react';
import {
  PieChart,
  Users,
  IndianRupee,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Star,
  UserPlus,
} from 'lucide-react';
import { Company, Customer, CustomerSegment } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

interface SegmentationViewProps {
  company: Company;
  onSelectCustomer: (customer: Customer) => void;
}

export const SegmentationView: React.FC<SegmentationViewProps> = ({
  company,
  onSelectCustomer,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment>('High Risk');

  const total = company.customerCount;

  const segmentDefinitions: Record<
    CustomerSegment,
    {
      title: string;
      desc: string;
      count: number;
      pct: number;
      avgRevenue: number;
      avgChurnProb: number;
      avgUsage: number;
      complaintRate: string;
      color: string;
      icon: any;
      bg: string;
    }
  > = {
    'Loyal': {
      title: 'Loyal Customers',
      desc: 'High engagement, long tenure, and low predicted churn probability (<20%). High lifetime value.',
      count: Math.round(total * 0.45),
      pct: 45,
      avgRevenue: 1240,
      avgChurnProb: 12,
      avgUsage: 78,
      complaintRate: '0.4 / yr',
      color: 'text-emerald-700 border-emerald-300',
      icon: ShieldCheck,
      bg: 'bg-emerald-50/60',
    },
    'At Risk': {
      title: 'At Risk Cohort',
      desc: 'Declining monthly session frequency and moderate churn signals (35-64% probability).',
      count: Math.round(total * 0.18),
      pct: 18,
      avgRevenue: 890,
      avgChurnProb: 48,
      avgUsage: 36,
      complaintRate: '2.1 / yr',
      color: 'text-amber-700 border-amber-300',
      icon: AlertTriangle,
      bg: 'bg-amber-50/60',
    },
    'High Risk': {
      title: 'High Risk Customers',
      desc: 'Severe flight signals (>=65% churn risk). Sharp usage drop, multiple unresolved complaints, or billing delays.',
      count: Math.round(total * 0.10),
      pct: 10,
      avgRevenue: 1420,
      avgChurnProb: 84,
      avgUsage: 22,
      complaintRate: '4.2 / yr',
      color: 'text-red-700 border-red-300',
      icon: AlertTriangle,
      bg: 'bg-red-50/60',
    },
    'High Value': {
      title: 'High Value Accounts',
      desc: 'Enterprise & Premium tiered clients generating >₹1,299/month. Core ARR contributors.',
      count: Math.round(total * 0.20),
      pct: 20,
      avgRevenue: 2499,
      avgChurnProb: 26,
      avgUsage: 94,
      complaintRate: '1.1 / yr',
      color: 'text-indigo-700 border-indigo-300',
      icon: Star,
      bg: 'bg-indigo-50/60',
    },
    'New': {
      title: 'New Onboardings',
      desc: 'Active for less than 6 months. Sensitive to onboarding hurdles and initial product value realization.',
      count: Math.round(total * 0.07),
      pct: 7,
      avgRevenue: 650,
      avgChurnProb: 31,
      avgUsage: 44,
      complaintRate: '1.4 / yr',
      color: 'text-sky-700 border-sky-300',
      icon: UserPlus,
      bg: 'bg-sky-50/60',
    },
  };

  const currentSegmentData = segmentDefinitions[selectedSegment];

  // Filter sample customers belonging to this segment
  const segmentCustomers = company.customers.filter(c => c.segment === selectedSegment);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">
          Customer Segmentation
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Behavioral and value cohort segmentation tailored for {company.name}.
        </p>
      </div>

      {/* 5 Segment Selector Cards (Section 23) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {(Object.keys(segmentDefinitions) as CustomerSegment[]).map(segKey => {
          const seg = segmentDefinitions[segKey];
          const isSelected = selectedSegment === segKey;
          const Icon = seg.icon;

          return (
            <button
              key={segKey}
              onClick={() => setSelectedSegment(segKey)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-white border-coral-500 ring-2 ring-coral-500 shadow-md scale-[1.02]'
                  : 'bg-white border-coral-100 hover:border-coral-300 hover:bg-coral-50/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-2 rounded-xl ${seg.bg} ${seg.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-gray-400">{seg.pct}%</span>
              </div>
              <h3 className="text-sm font-bold text-[#252525] truncate">{seg.title}</h3>
              <p className="text-lg font-black text-coral-600 mt-0.5">
                {seg.count.toLocaleString()}
              </p>
              <span className="text-[10px] text-gray-400">Accounts mapped</span>
            </button>
          );
        })}
      </div>

      {/* Active Segment Detail Card */}
      <div className="card-coral p-6 bg-white space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-coral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#252525]">
                {currentSegmentData.title}
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-coral-100 text-coral-800">
                {currentSegmentData.count.toLocaleString()} Accounts ({currentSegmentData.pct}% of total)
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              {currentSegmentData.desc}
            </p>
          </div>
        </div>

        {/* 4 Summary Metric Pills (Section 23) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-coral-50/40 border border-coral-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Average Revenue (ARPU)
            </span>
            <p className="text-xl font-black text-[#252525] mt-1">
              ₹{currentSegmentData.avgRevenue.toLocaleString('en-IN')}/mo
            </p>
            <span className="text-[10px] text-gray-400">Recurring monthly rate</span>
          </div>

          <div className="p-4 rounded-2xl bg-coral-50/40 border border-coral-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Average Churn Risk
            </span>
            <p className="text-xl font-black text-coral-600 mt-1">
              {currentSegmentData.avgChurnProb}%
            </p>
            <span className="text-[10px] text-gray-400">Calibrated probability</span>
          </div>

          <div className="p-4 rounded-2xl bg-coral-50/40 border border-coral-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Average Monthly Usage
            </span>
            <p className="text-xl font-black text-gray-800 mt-1">
              {currentSegmentData.avgUsage} Hours
            </p>
            <span className="text-[10px] text-gray-400">Active session duration</span>
          </div>

          <div className="p-4 rounded-2xl bg-coral-50/40 border border-coral-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Complaint Frequency
            </span>
            <p className="text-xl font-black text-red-600 mt-1">
              {currentSegmentData.complaintRate}
            </p>
            <span className="text-[10px] text-gray-400">Support tickets per account</span>
          </div>
        </div>

        {/* Customers in this Segment */}
        <div>
          <h3 className="text-sm font-bold text-[#252525] mb-3">
            Accounts in {currentSegmentData.title}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-coral-100 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-coral-50/40">
                  <th className="py-2.5 px-3">Customer ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Monthly Bill</th>
                  <th className="py-2.5 px-3">Usage Delta</th>
                  <th className="py-2.5 px-3">Churn Prob.</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coral-50 text-xs">
                {segmentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-400">
                      No sample customer records mapped to this segment in the current page preview.
                    </td>
                  </tr>
                ) : (
                  segmentCustomers.map(c => (
                    <tr
                      key={c.customer_id}
                      onClick={() => onSelectCustomer(c)}
                      className="hover:bg-coral-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-coral-600">
                        {c.customer_id}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{c.name}</td>
                      <td className="py-2.5 px-3 text-gray-600">{c.plan}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">
                        ₹{c.monthly_bill.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-coral-600 font-semibold">
                        {c.usage_change_pct}%
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-[#252525]">
                        {c.churn_probability}%
                      </td>
                      <td className="py-2.5 px-3 text-coral-600 font-bold hover:underline">
                        View 360° →
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
