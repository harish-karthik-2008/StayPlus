import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingDown,
  Users,
} from 'lucide-react';
import { Company } from '../types';
import { NavigationTab } from '../components/layout/Sidebar';

interface CompaniesViewProps {
  companies: Company[];
  activeCompany: Company;
  onSelectCompany: (companyId: string) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenAddCompany: () => void;
  onDeleteCompany: (companyId: string) => void;
  onReanalyzeCompany: (companyId: string) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  companies,
  activeCompany,
  onSelectCompany,
  onNavigateTab,
  onOpenAddCompany,
  onDeleteCompany,
  onReanalyzeCompany,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'customers' | 'churn' | 'recent'>('recent');

  const industries = ['All', ...Array.from(new Set(companies.map(c => c.industry)))];

  // Filter & Sort
  const filteredCompanies = companies
    .filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.datasetName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = selectedIndustry === 'All' || c.industry === selectedIndustry;
      return matchesSearch && matchesIndustry;
    })
    .sort((a, b) => {
      if (sortBy === 'customers') return b.customerCount - a.customerCount;
      if (sortBy === 'churn') return b.churnRate - a.churnRate;
      return 0; // default recent
    });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">
            Companies
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage customer datasets and analytics for all your organizations.
          </p>
        </div>

        <button
          onClick={onOpenAddCompany}
          className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-coral-500/25 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Company</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="card-coral p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company name, industry, or dataset..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-coral-200 rounded-xl text-xs sm:text-sm text-[#252525] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-coral-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0">
          {/* Industry Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
            <Filter className="w-3.5 h-3.5 text-coral-600" />
            <select
              value={selectedIndustry}
              onChange={e => setSelectedIndustry(e.target.value)}
              className="bg-gray-50/60 border border-coral-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-coral-500"
            >
              {industries.map(ind => (
                <option key={ind} value={ind}>
                  {ind === 'All' ? 'All Industries' : ind}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-coral-600" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-gray-50/60 border border-coral-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-coral-500"
            >
              <option value="recent">Sort: Latest Upload</option>
              <option value="customers">Sort: Customer Count</option>
              <option value="churn">Sort: Highest Churn Rate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="card-coral p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-coral-50 text-coral-500 flex items-center justify-center mx-auto mb-4 border border-coral-200">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#252525]">No organizations found</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
            {searchQuery
              ? `No companies matched "${searchQuery}". Clear your search or add a new organization.`
              : 'Upload your first customer dataset to start analyzing churn.'}
          </p>
          <button
            onClick={onOpenAddCompany}
            className="mt-5 px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Company
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCompanies.map(comp => {
            const isCurrentActive = comp.id === activeCompany.id;

            return (
              <div
                key={comp.id}
                className={`card-coral p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                  isCurrentActive
                    ? 'ring-2 ring-coral-500 shadow-coral-glow'
                    : 'hover:border-coral-300'
                }`}
              >
                {/* Active Indicator Ribbon */}
                {isCurrentActive && (
                  <div className="absolute top-0 right-0 bg-coral-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
                    Current Active
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div className="flex items-start gap-3 mb-3 pr-12">
                    <div className="w-11 h-11 rounded-xl bg-coral-100 text-coral-700 flex items-center justify-center font-extrabold text-sm shrink-0 border border-coral-200">
                      {comp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[#252525] truncate">
                        {comp.name}
                      </h3>
                      <p className="text-xs text-coral-600 font-medium">{comp.industry}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                    {comp.description}
                  </p>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-coral-50/50 border border-coral-100 mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Customers
                      </span>
                      <p className="text-sm font-extrabold text-[#252525]">
                        {comp.customerCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Churn Rate
                      </span>
                      <p className="text-sm font-extrabold text-coral-600">
                        {comp.churnRate}%
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        High Risk
                      </span>
                      <p className="text-sm font-extrabold text-red-600">
                        {comp.highRiskCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        REVENUE
                      </span>
                      <p className="text-sm font-extrabold text-gray-800">
                        ₹{(comp.revenueAtRisk / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>

                  {/* Dataset metadata */}
                  <div className="space-y-1 text-xs text-gray-500 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Dataset File:</span>
                      <span className="font-mono text-gray-700 font-medium truncate max-w-[150px]">
                        {comp.datasetName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Last Updated:</span>
                      <span>{comp.lastUpdated}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Status:</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {comp.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons (Section 7 specs) */}
                <div className="pt-3 border-t border-coral-100 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onSelectCompany(comp.id);
                        onNavigateTab('dashboard');
                      }}
                      className="py-2 px-3 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectCompany(comp.id);
                        onNavigateTab('data-management');
                      }}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-coral-50 border border-coral-200 text-gray-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Database className="w-3.5 h-3.5 text-coral-600" />
                      <span>View Data</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onReanalyzeCompany(comp.id)}
                      className="text-xs text-gray-500 hover:text-coral-600 flex items-center gap-1 transition-colors"
                      title="Re-run ML Churn Pipeline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-analyze</span>
                    </button>

                    {companies.length > 1 && (
                      <button
                        onClick={() => onDeleteCompany(comp.id)}
                        className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                        title="Delete Company Dataset"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
