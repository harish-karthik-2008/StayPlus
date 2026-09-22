import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, TrendingUp, Filter } from 'lucide-react';
import { Company } from '../types';

interface AnalyticsViewProps {
  company: Company;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ company }) => {
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('All');

  // Chart 1: Churn by Subscription Plan
  const planData = [
    { plan: 'Basic', churnRate: 24.8, count: 6800, avgBill: 499 },
    { plan: 'Standard', churnRate: 19.2, count: 9400, avgBill: 799 },
    { plan: 'Premium', churnRate: 15.6, count: 6200, avgBill: 1299 },
    { plan: 'Enterprise', churnRate: 9.4, count: 3020, avgBill: 2499 },
  ];

  // Chart 2: Churn by Tenure
  const tenureData = [
    { range: '< 6 Months', churnRate: 34.2, description: 'Early lifecycle hazard' },
    { range: '6-12 Months', churnRate: 22.8, description: 'Contract renewal cliff' },
    { range: '12-24 Months', churnRate: 16.4, description: 'Stabilized usage' },
    { range: '24-36 Months', churnRate: 11.2, description: 'High stickiness' },
    { range: '36+ Months', churnRate: 6.8, description: 'Core champions' },
  ];

  // Chart 3: Churn by Monthly Usage
  const usageData = [
    { range: '0 - 20 hrs', churnRate: 42.6, status: 'Severe Flight' },
    { range: '20 - 50 hrs', churnRate: 26.4, status: 'At Risk' },
    { range: '50 - 80 hrs', churnRate: 14.2, status: 'Healthy' },
    { range: '80+ hrs', churnRate: 7.1, status: 'Power User' },
  ];

  // Chart 4: Churn by Complaints
  const complaintData = [
    { count: '0 Tickets', churnRate: 9.8 },
    { count: '1 Ticket', churnRate: 16.2 },
    { count: '2 Tickets', churnRate: 29.5 },
    { count: '3 Tickets', churnRate: 52.8 },
    { count: '4+ Tickets', churnRate: 78.4 },
  ];

  // Chart 5: Churn by Payment Delay
  const paymentData = [
    { delay: 'On Time (0d)', churnRate: 8.4 },
    { delay: '1 - 5 Days', churnRate: 14.8 },
    { delay: '6 - 15 Days', churnRate: 38.2 },
    { delay: '15+ Days', churnRate: 67.5 },
  ];

  // Chart 6: Churn by Customer Value
  const valueData = [
    { tier: '< ₹500', churnRate: 26.2 },
    { tier: '₹500 - ₹1000', churnRate: 18.7 },
    { tier: '₹1000 - ₹2000', churnRate: 14.5 },
    { tier: '₹2000+', churnRate: 10.1 },
  ];

  // Chart 7: Churn by Engagement Score
  const engagementData = [
    { score: '0 - 25%', churnRate: 58.4 },
    { score: '25 - 50%', churnRate: 34.2 },
    { score: '50 - 75%', churnRate: 15.6 },
    { score: '75 - 100%', churnRate: 5.2 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">
            Behavioral Churn Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Deep dive into attrition dynamics across plans, tenure, usage patterns, and support touchpoints.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white p-2 rounded-xl border border-coral-200">
          <Filter className="w-3.5 h-3.5 text-coral-600" />
          <span>Plan Filter:</span>
          <select
            value={selectedPlanFilter}
            onChange={e => setSelectedPlanFilter(e.target.value)}
            className="bg-coral-50/70 border border-coral-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700"
          >
            <option value="All">All Plans</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Premium">Premium</option>
            <option value="Standard">Standard</option>
            <option value="Basic">Basic</option>
          </select>
        </div>
      </div>

      {/* Grid of 7 Charts (Section 24) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Churn by Subscription Plan */}
        <div className="card-coral p-5 bg-white">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#252525]">
              1. Churn Rate by Subscription Plan
            </h3>
            <p className="text-xs text-gray-500">
              Basic tier displays highest relative attrition due to low initial lock-in
            </p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E6E6" />
                <XAxis dataKey="plan" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <Tooltip
                  formatter={(v: any) => [`${v}% Churn`, 'Rate']}
                  contentStyle={{ borderRadius: '10px', borderColor: '#F0DADA' }}
                />
                <Bar dataKey="churnRate" fill="#FF7F7F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Churn by Tenure */}
        <div className="card-coral p-5 bg-white">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#252525]">
              2. Churn Rate by Tenure Months
            </h3>
            <p className="text-xs text-gray-500">
              Attrition is concentrated in the first 6 months before product habitualization
            </p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tenureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E6E6" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <Tooltip
                  formatter={(v: any) => [`${v}% Churn`, 'Rate']}
                  contentStyle={{ borderRadius: '10px', borderColor: '#F0DADA' }}
                />
                <Line
                  type="monotone"
                  dataKey="churnRate"
                  stroke="#E96B6B"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#E96B6B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Churn by Monthly Usage */}
        <div className="card-coral p-5 bg-white">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#252525]">
              3. Churn by Monthly Usage Hours
            </h3>
            <p className="text-xs text-gray-500">
              Customers logging under 20 hours per month churn at 6x the rate of power users
            </p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E6E6" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <Tooltip
                  formatter={(v: any) => [`${v}% Churn`, 'Rate']}
                  contentStyle={{ borderRadius: '10px', borderColor: '#F0DADA' }}
                />
                <Bar dataKey="churnRate" fill="#E96B6B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Churn by Complaint Count */}
        <div className="card-coral p-5 bg-white">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#252525]">
              4. Churn by Complaint Volume
            </h3>
            <p className="text-xs text-gray-500">
              3 or more unresolved complaints escalates churn probability past 50%
            </p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E6E6" />
                <XAxis dataKey="count" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <Tooltip
                  formatter={(v: any) => [`${v}% Churn`, 'Rate']}
                  contentStyle={{ borderRadius: '10px', borderColor: '#F0DADA' }}
                />
                <Bar dataKey="churnRate" fill="#DC2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Churn by Payment Delay */}
        <div className="card-coral p-5 bg-white">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#252525]">
              5. Churn by Invoice Payment Delay
            </h3>
            <p className="text-xs text-gray-500">
              15+ day settlement delay is an 80% indicator of deliberate contract non-renewal
            </p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E6E6" />
                <XAxis dataKey="delay" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <Tooltip
                  formatter={(v: any) => [`${v}% Churn`, 'Rate']}
                  contentStyle={{ borderRadius: '10px', borderColor: '#F0DADA' }}
                />
                <Bar dataKey="churnRate" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Churn by Customer Value */}
        <div className="card-coral p-5 bg-white">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#252525]">
              6. Churn by Customer Value Tier
            </h3>
            <p className="text-xs text-gray-500">
              Higher value accounts exhibit greater stability due to multi-seat deployment
            </p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E6E6" />
                <XAxis dataKey="tier" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <Tooltip
                  formatter={(v: any) => [`${v}% Churn`, 'Rate']}
                  contentStyle={{ borderRadius: '10px', borderColor: '#F0DADA' }}
                />
                <Bar dataKey="churnRate" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 7: Churn by Engagement Score (Full Width) */}
      <div className="card-coral p-5 bg-white">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#252525]">
            7. Churn by Feature Engagement Index
          </h3>
          <p className="text-xs text-gray-500">
            Accounts with engagement score &gt;75% demonstrate industry-leading retention (&lt;5.2% annual churn)
          </p>
        </div>

        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5E6E6" />
              <XAxis dataKey="score" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
              <YAxis unit="%" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
              <Tooltip
                formatter={(v: any) => [`${v}% Churn`, 'Rate']}
                contentStyle={{ borderRadius: '10px', borderColor: '#F0DADA' }}
              />
              <Bar dataKey="churnRate" fill="#FF7F7F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
