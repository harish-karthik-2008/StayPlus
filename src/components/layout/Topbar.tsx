import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Download,
  ChevronDown,
  Building2,
  Plus,
  Check,
  Sparkles,
} from 'lucide-react';
import { Company, NotificationItem } from '../../types';

interface TopbarProps {
  onOpenMobileNav: () => void;
  companies: Company[];
  activeCompany: Company;
  onSelectCompany: (companyId: string) => void;
  onOpenAddCompany: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenExport: () => void;
  notifications: NotificationItem[];
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileNav,
  companies,
  activeCompany,
  onSelectCompany,
  onOpenAddCompany,
  onOpenSearch,
  onOpenNotifications,
  onOpenExport,
  notifications,
}) => {
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const companyMenuRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyMenuRef.current && !companyMenuRef.current.contains(event.target as Node)) {
        setIsCompanyMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-4 lg:px-6 bg-white border-b border-coral-200 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0 w-full">
      {/* Left: Mobile menu toggle + Company Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 text-gray-500 hover:text-coral-600 rounded-lg hover:bg-coral-50"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Company Switcher Dropdown */}
        <div className="relative" ref={companyMenuRef}>
          <button
            onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-coral-200 bg-coral-50/50 hover:bg-coral-50 text-[#252525] font-semibold text-xs sm:text-sm transition-colors shadow-xs group"
          >
            <Building2 className="w-4 h-4 text-coral-600" />
            <div className="flex items-center gap-1.5 max-w-[140px] sm:max-w-[200px] truncate">
              <span className="text-gray-500 font-normal hidden md:inline">Company:</span>
              <span className="truncate font-bold">{activeCompany.name}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isCompanyMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isCompanyMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-coral-200 py-2 z-50 animate-fadeIn">
              <div className="px-3 py-1.5 border-b border-coral-100 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Switch Organization
                </span>
                <span className="text-[10px] text-coral-600 font-medium">
                  {companies.length} connected
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                {companies.map(comp => {
                  const isSelected = comp.id === activeCompany.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => {
                        onSelectCompany(comp.id);
                        setIsCompanyMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-coral-50/60 transition-colors ${
                        isSelected ? 'bg-coral-50/80' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-coral-700' : 'text-[#252525]'}`}>
                          {comp.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {comp.industry} • {comp.customerCount.toLocaleString()} users • {comp.churnRate}% churn
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-coral-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-coral-100 mt-1">
                <button
                  onClick={() => {
                    setIsCompanyMenuOpen(false);
                    onOpenAddCompany();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-coral-50 hover:bg-coral-100/70 text-coral-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-coral-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Company Dataset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Ready Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>ML Model Active: {activeCompany.selectedModel}</span>
        </div>
      </div>

      {/* Right: Search, Notifications, Export */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Bar Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-coral-200 bg-gray-50/80 hover:bg-white text-gray-400 hover:text-gray-600 text-xs sm:text-sm transition-all shadow-2xs group"
          title="Search anything (Cmd + K)"
        >
          <Search className="w-4 h-4 text-gray-400 group-hover:text-coral-600 transition-colors" />
          <span className="hidden sm:inline">Search customer, company, ID...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-gray-200 rounded text-gray-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-gray-500 hover:text-coral-600 hover:bg-coral-50 border border-transparent hover:border-coral-200 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-coral-500 text-white text-[10px] font-bold flex items-center justify-center animate-subtle-pulse">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Export Report CTA */}
        <button
          onClick={onOpenExport}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold transition-all shadow-sm shadow-coral-500/20 active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
};
