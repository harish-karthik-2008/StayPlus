import React, { useState } from 'react';
import {
  Users,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  IndianRupee,
  Sparkles,
  RefreshCw,
  Download,
  Calendar,
  ArrowRight,
  HelpCircle,
  BarChart3,
  PieChart as PieIcon,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Company, Customer } from '../types';
import { KpiCard } from '../components/common/KpiCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { NavigationTab } from '../components/layout/Sidebar';

interface DashboardViewProps {
  company: Company;
  onOpenExport: () => void;
  onSelectCustomer: (customer: Customer) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onRefreshData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  onOpenExport,
  onSelectCustomer,
  onNavigateTab,
  onRefreshData,
}) => {
  const [trendRange, setTrendRange] = useState<'7d' | '30d' | '6m' | '1y'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Time-series trend selection
  const trendData = {
    '7d': company.churnTrend7d,
    '30d': company.churnTrend30d,
    '6m': company.churnTrend6m,
    '1y': company.churnTrend1y,
  }[trendRange];

  // Risk distribution donut data
  const total = company.customerCount;
  const lowPct = Math.round((company.lowRiskCount / total) * 100) || 62;
  const medPct = Math.round((company.mediumRiskCount / total) * 100) || 24;
  const highPct = 100 - lowPct - medPct || 14;

  const donutData = [
    { name: 'Low Risk', value: lowPct, count: company.lowRiskCount, color: '#10B981' },
    { name: 'Medium Risk', value: medPct, count: company.mediumRiskCount, color: '#F59E0B' },
    { name: 'High Risk', value: highPct, count: company.highRiskCount, color: '#E96B6B' },
  ];

  // Churn drivers data
  const driversData = company.churnDriversBreakdown;

  // Top attention customers (high risk first)
  const highRiskCustomers = [...company.customers]
    .sort((a, b) => b.churn_probability - a.churn_probability)
    .slice(0, 7);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      onRefreshData();
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Executive Header (Section 12) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-coral-600 bg-coral-50 px-2.5 py-0.5 rounded-full border border-coral-200">
              {company.industry}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Updated: {company.lastUpdated}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight mt-1">
            {company.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Customer Churn Intelligence & Automated Retention Engine
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-coral-200 bg-white hover:bg-coral-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
            title="Recalculate model metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-coral-600' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            onClick={onOpenExport}
            className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-coral-500/20 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Cards (Section 13) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KpiCard
          title="Total Customers"
          value={company.customerCount}
          numericTarget={company.customerCount}
          icon={Users}
          changeText="+3.2%"
          changeType="positive"
          iconBgColor="bg-coral-100"
          iconColor="text-coral-600"
        />

        <KpiCard
          title="Churn Rate"
          value={`${company.churnRate}%`}
          numericTarget={company.churnRate}
          suffix="%"
          icon={TrendingDown}
          changeText="-0.8%"
          changeType="positive"
          iconBgColor="bg-coral-50"
          iconColor="text-coral-600"
        />

        <KpiCard
          title="High Risk"
          value={company.highRiskCount}
          numericTarget={company.highRiskCount}
          icon={AlertTriangle}
          changeText="Requires Action"
          changeType="negative"
          iconBgColor="bg-red-50"
          iconColor="text-red-600"
        />

        <KpiCard
          title="Medium Risk"
          value={company.mediumRiskCount}
          numericTarget={company.mediumRiskCount}
          icon={ShieldCheck}
          changeText="Watchlist"
          changeType="neutral"
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />

        <KpiCard
          title="Revenue At Risk"
          value={`₹${(company.revenueAtRisk / 100000).toFixed(1)}L`}
          prefix="₹"
          suffix="L"
          numericTarget={Number((company.revenueAtRisk / 100000).toFixed(1))}
          icon={IndianRupee}
          changeText="Immediate"
          changeType="negative"
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
        />

        <KpiCard
          title="Retention Opp."
          value={`₹${(company.retentionOpportunity / 100000).toFixed(1)}L`}
          prefix="₹"
          suffix="L"
          numericTarget={Number((company.retentionOpportunity / 100000).toFixed(1))}
          icon={Sparkles}
          changeText="Recoverable"
          changeType="positive"
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Row 2: Churn Trend Line Chart + Risk Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Churn Trend Line Chart (Section 14) */}
        <div className="card-coral p-5 bg-white lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#252525]">
                  Churn Rate Over Time
                </h3>
                <span className="text-[11px] text-gray-400 font-medium">
                  Historical vs Model Forecast
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Observed customer attrition compared with calibrated model risk
              </p>
            </div>

            {/* Time Filter Buttons */}
            <div className="flex items-center gap-1 bg-coral-50/70 p-1 rounded-xl border border-coral-200/60 self-start">
              {(['7d', '30d', '6m', '1y'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTrendRange(range)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    trendRange === range
                      ? 'bg-white text-coral-600 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E6E6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#F0DADA" />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  domain={['auto', 'auto']}
                  unit="%"
                  stroke="#F0DADA"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#F0DADA',
                    boxShadow: '0 4px 20px rgba(233, 107, 107, 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, '']}
                />
                <Line
                  type="monotone"
                  dataKey="churnRate"
                  name="Actual Churn Rate"
                  stroke="#FF7F7F"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#E96B6B', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="predictedRisk"
                  name="Predicted Churn Risk"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-coral-100 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-coral-500" />
              <span>Actual Historical Churn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 border-b-2 border-dashed border-amber-500" />
              <span>Model Predicted Risk</span>
            </div>
          </div>
        </div>

        {/* Churn Risk Distribution Donut (Section 15) */}
        <div className="card-coral p-5 bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#252525]">
              Churn Risk Distribution
            </h3>
            <p className="text-xs text-gray-500">
              Proportion of active accounts by predicted risk tier
            </p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={62}
                  outerRadius={84}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#F0DADA',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[#252525]">{highPct}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                High Risk
              </span>
            </div>
          </div>

          {/* Legend items */}
          <div className="space-y-2 pt-2 border-t border-coral-100">
            {donutData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">({item.count.toLocaleString()})</span>
                  <span className="font-bold text-[#252525]">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top Churn Drivers + Segment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Churn Drivers (Section 16) */}
        <div className="card-coral p-5 bg-white lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#252525]">Top Churn Drivers</h3>
              <p className="text-xs text-gray-500">
                Primary behavioural factors identified across all churn events
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('drivers')}
              className="text-xs font-bold text-coral-600 hover:text-coral-700 flex items-center gap-1"
            >
              <span>Deep Dive</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {driversData.map((d, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    {d.name}
                    <span
                      className="text-gray-400 cursor-help"
                      title={d.description}
                    >
                      <HelpCircle className="w-3 h-3" />
                    </span>
                  </span>
                  <span className="font-extrabold text-coral-600">{d.percentage}%</span>
                </div>

                <div className="w-full h-2.5 bg-coral-50 rounded-full overflow-hidden border border-coral-100">
                  <div
                    className="h-full bg-gradient-to-r from-coral-400 to-coral-600 rounded-full transition-all duration-700"
                    style={{ width: `${d.percentage * 2.5}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 group-hover:text-gray-600 transition-colors">
                  {d.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segment Distribution (Section 17) */}
        <div className="card-coral p-5 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#252525]">Customer Segments</h3>
              <button
                onClick={() => onNavigateTab('segments')}
                className="text-xs font-bold text-coral-600 hover:text-coral-700"
              >
                View all
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Portfolio distribution across behavioral lifecycle tiers
            </p>

            <div className="space-y-2.5">
              {[
                { name: 'Loyal Customers', pct: 45, count: Math.round(total * 0.45), color: 'bg-emerald-500' },
                { name: 'High Value', pct: 20, count: Math.round(total * 0.2), color: 'bg-indigo-500' },
                { name: 'At Risk', pct: 18, count: Math.round(total * 0.18), color: 'bg-amber-500' },
                { name: 'High Risk', pct: 10, count: Math.round(total * 0.1), color: 'bg-rose-500' },
                { name: 'New Customers', pct: 7, count: Math.round(total * 0.07), color: 'bg-sky-500' },
              ].map(seg => (
                <div key={seg.name} className="p-2.5 rounded-xl bg-coral-50/40 border border-coral-100">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-800">{seg.name}</span>
                    <span className="text-[#252525]">{seg.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className={`${seg.color} h-1.5 rounded-full`} style={{ width: `${seg.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-coral-100 text-center">
            <button
              onClick={() => onNavigateTab('segments')}
              className="w-full py-2 rounded-xl bg-coral-50 hover:bg-coral-100/80 text-coral-700 font-bold text-xs transition-colors"
            >
              Explore Full Segmentation Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: High-Risk Customer Attention Table (Section 18) */}
      <div className="card-coral p-5 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#252525]">
                Customers Requiring Attention
              </h3>
              <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                High Priority
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Immediate action recommended to prevent flight of high-value accounts. Click any customer to view 360 profile.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('customers')}
            className="text-xs font-bold text-coral-600 hover:text-coral-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All {company.customers.length} Customers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-coral-100 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-coral-50/40">
                <th className="py-3 px-4 rounded-l-xl">Customer ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Churn Prob.</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Segment</th>
                <th className="py-3 px-4">Monthly Rev.</th>
                <th className="py-3 px-4">Main Driver</th>
                <th className="py-3 px-4 rounded-r-xl">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coral-50 text-xs">
              {highRiskCustomers.map(cust => (
                <tr
                  key={cust.customer_id}
                  onClick={() => onSelectCustomer(cust)}
                  className="hover:bg-coral-50/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-coral-600 group-hover:underline">
                    {cust.customer_id}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#252525]">
                    {cust.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-red-600">
                      {cust.churn_probability}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <RiskBadge level={cust.risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">
                    {cust.segment}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    ₹{cust.monthly_bill.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {cust.main_driver}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-coral-100/70 text-coral-800 text-[11px] font-bold group-hover:bg-coral-500 group-hover:text-white transition-colors">
                      {cust.recommended_action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
