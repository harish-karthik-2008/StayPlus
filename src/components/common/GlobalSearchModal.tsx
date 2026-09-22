import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, User, ArrowRight } from 'lucide-react';
import { Company, Customer } from '../../types';
import { RiskBadge } from './RiskBadge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  activeCompany: Company;
  onSelectCompany: (companyId: string) => void;
  onSelectCustomer: (customer: Customer) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  companies,
  activeCompany,
  onSelectCompany,
  onSelectCustomer,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // toggle if handled by parent
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  // Search Companies
  const matchingCompanies = cleanQuery
    ? companies.filter(
        c =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.industry.toLowerCase().includes(cleanQuery)
      )
    : [];

  // Search Customers in current company
  const matchingCustomers = cleanQuery
    ? activeCompany.customers.filter(
        c =>
          c.customer_id.toLowerCase().includes(cleanQuery) ||
          c.name.toLowerCase().includes(cleanQuery) ||
          c.email.toLowerCase().includes(cleanQuery)
      )
    : activeCompany.customers.slice(0, 4); // show recent/high risk when empty

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-coral-200 w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-coral-100 flex items-center gap-3 bg-coral-50/50">
          <Search className="w-5 h-5 text-coral-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search customer by ID (e.g. C1024), name, or search company..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-[#252525] placeholder-gray-400 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-white border border-coral-200 px-2 py-1 rounded text-gray-500 font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* Companies Section */}
          {matchingCompanies.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-coral-500" /> Organizations
              </p>
              <div className="space-y-1">
                {matchingCompanies.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCompany(c.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-coral-50/80 transition-colors text-left group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#252525] group-hover:text-coral-600 transition-colors">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {c.industry} • {c.customerCount.toLocaleString()} customers • {c.churnRate}% churn
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-coral-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers Section */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-coral-500" /> Customers in {activeCompany.name}
            </p>
            {matchingCustomers.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">No customers found matching "{query}"</p>
            ) : (
              <div className="space-y-1">
                {matchingCustomers.map(cust => (
                  <button
                    key={cust.customer_id}
                    onClick={() => {
                      onSelectCustomer(cust);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-coral-50/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-coral-100 text-coral-700 flex items-center justify-center font-bold text-xs">
                        {cust.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#252525] group-hover:text-coral-600 transition-colors">
                            {cust.name}
                          </span>
                          <span className="text-xs font-mono text-gray-400">
                            {cust.customer_id}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {cust.plan} Plan • ₹{cust.monthly_bill.toLocaleString('en-IN')}/mo • {cust.main_driver}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-coral-600">
                          {cust.churn_probability}% risk
                        </span>
                      </div>
                      <RiskBadge level={cust.risk_level} size="sm" />
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-coral-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-coral-100 flex items-center justify-between text-xs text-gray-500">
          <span>Pro tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono">⌘K</kbd> to search anytime</span>
          <span>Showing data for {activeCompany.name}</span>
        </div>
      </div>
    </div>
  );
};
