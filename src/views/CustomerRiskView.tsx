import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Users,
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Company, Customer, RiskLevel, CustomerSegment } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

interface CustomerRiskViewProps {
  company: Company;
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomerRiskView: React.FC<CustomerRiskViewProps> = ({
  company,
  onSelectCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [segmentFilter, setSegmentFilter] = useState<string>('All');
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'churn_desc' | 'churn_asc' | 'revenue_desc' | 'tenure_desc'>('churn_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter logic
  const filteredCustomers = company.customers.filter(cust => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.customer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.main_driver.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter === 'All' || cust.risk_level === riskFilter;
    const matchesSegment = segmentFilter === 'All' || cust.segment === segmentFilter;
    const matchesPlan = planFilter === 'All' || cust.plan === planFilter;

    return matchesSearch && matchesRisk && matchesSegment && matchesPlan;
  });

  // Sort logic
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'churn_desc') return b.churn_probability - a.churn_probability;
    if (sortBy === 'churn_asc') return a.churn_probability - b.churn_probability;
    if (sortBy === 'revenue_desc') return b.monthly_bill - a.monthly_bill;
    if (sortBy === 'tenure_desc') return b.tenure_months - a.tenure_months;
    return 0;
  });

  const totalPages = Math.ceil(sortedCustomers.length / pageSize) || 1;
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">
            Customer Risk Database
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Explore customer risk scores, behavioral drivers, and segmentation across {company.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white px-3 py-2 rounded-xl border border-coral-200 shadow-2xs">
          <Users className="w-4 h-4 text-coral-600" />
          <span>
            Showing <strong className="text-coral-600">{sortedCustomers.length}</strong> of{' '}
            {company.customers.length} Accounts
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-coral p-4 bg-white space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer ID (e.g. C1024), name, email, or driver..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/60 focus:bg-white border border-coral-200 rounded-xl text-xs sm:text-sm text-[#252525] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-coral-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={e => {
                setRiskFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50/60 border border-coral-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-coral-500"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">🔴 High Risk (&gt;65%)</option>
              <option value="Medium">🟡 Medium Risk (35-64%)</option>
              <option value="Low">🟢 Low Risk (&lt;35%)</option>
            </select>

            {/* Segment Filter */}
            <select
              value={segmentFilter}
              onChange={e => {
                setSegmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50/60 border border-coral-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-coral-500"
            >
              <option value="All">All Segments</option>
              <option value="High Value">High Value</option>
              <option value="High Risk">High Risk</option>
              <option value="At Risk">At Risk</option>
              <option value="Loyal">Loyal</option>
              <option value="New">New</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={e => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50/60 border border-coral-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-coral-500"
            >
              <option value="All">All Plans</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
              <option value="Basic">Basic</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-gray-50/60 border border-coral-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-coral-500"
            >
              <option value="churn_desc">Sort: Highest Churn Risk</option>
              <option value="churn_asc">Sort: Lowest Churn Risk</option>
              <option value="revenue_desc">Sort: Highest Revenue</option>
              <option value="tenure_desc">Sort: Longest Tenure</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Risk Table */}
      <div className="card-coral overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-coral-100 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-coral-50/40">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Plan & Tenure</th>
                <th className="py-3.5 px-4">Monthly Rev.</th>
                <th className="py-3.5 px-4">Usage Delta</th>
                <th className="py-3.5 px-4">Complaints</th>
                <th className="py-3.5 px-4">Churn Prob.</th>
                <th className="py-3.5 px-4">Risk Tier</th>
                <th className="py-3.5 px-4">Primary Driver</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coral-50 text-xs">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No customers found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map(cust => (
                  <tr
                    key={cust.customer_id}
                    onClick={() => onSelectCustomer(cust)}
                    className="hover:bg-coral-50/60 cursor-pointer transition-colors group"
                  >
                    {/* Customer Name & ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-coral-100 text-coral-700 flex items-center justify-center font-bold text-xs">
                          {cust.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#252525] group-hover:text-coral-600 transition-colors">
                            {cust.name}
                          </p>
                          <p className="text-[11px] font-mono text-gray-400">
                            {cust.customer_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Plan & Tenure */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800">{cust.plan}</span>
                      <p className="text-[11px] text-gray-400">{cust.tenure_months} mo active</p>
                    </td>

                    {/* Monthly Rev */}
                    <td className="py-3 px-4 font-bold text-gray-900">
                      ₹{cust.monthly_bill.toLocaleString('en-IN')}
                    </td>

                    {/* Usage delta */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          cust.usage_change_pct < 0 ? 'text-coral-600' : 'text-emerald-600'
                        }`}
                      >
                        {cust.usage_change_pct > 0 ? `+${cust.usage_change_pct}%` : `${cust.usage_change_pct}%`}
                      </span>
                    </td>

                    {/* Complaints */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          cust.complaint_count >= 3 ? 'text-red-600' : 'text-gray-700'
                        }`}
                      >
                        {cust.complaint_count} tickets
                      </span>
                      {cust.open_complaints > 0 && (
                        <span className="text-[10px] text-red-500 block">
                          ({cust.open_complaints} open)
                        </span>
                      )}
                    </td>

                    {/* Churn Probability */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#252525]">
                          {cust.churn_probability}%
                        </span>
                        <div className="w-14 bg-gray-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-1.5 rounded-full ${
                              cust.churn_probability >= 65
                                ? 'bg-red-500'
                                : cust.churn_probability >= 35
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${cust.churn_probability}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3 px-4">
                      <RiskBadge level={cust.risk_level} size="sm" />
                    </td>

                    {/* Main Driver */}
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {cust.main_driver}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectCustomer(cust);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 group-hover:text-coral-600 group-hover:bg-coral-100/60 transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                      >
                        <span>360° Profile</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-coral-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedCustomers.length)} of{' '}
            {sortedCustomers.length} records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-coral-200 bg-white text-gray-600 hover:bg-coral-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-coral-200 bg-white text-gray-600 hover:bg-coral-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
