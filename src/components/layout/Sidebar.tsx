import React from 'react';
import {
  LayoutDashboard,
  Users,
  PieChart,
  GitFork,
  Lightbulb,
  Sliders,
  Database,
  Cpu,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Company } from '../../types';
import { Logo } from '../common/Logo';

export type NavigationTab =
  | 'dashboard'
  | 'customers'
  | 'segments'
  | 'drivers'
  | 'recommendations'
  | 'simulator'
  | 'data-management'
  | 'model-performance'
  | 'companies'
  | 'settings'
  | 'landing';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeCompany: Company;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  activeCompany,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navSections = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Customer Intelligence',
      items: [
        { id: 'customers' as NavigationTab, label: 'Customers', icon: Users },
        { id: 'segments' as NavigationTab, label: 'Segments', icon: PieChart },
        { id: 'drivers' as NavigationTab, label: 'Churn Drivers', icon: GitFork },
      ],
    },
    {
      group: 'Retention',
      items: [
        { id: 'recommendations' as NavigationTab, label: 'Recommendations', icon: Lightbulb },
        { id: 'simulator' as NavigationTab, label: 'What-if Simulator', icon: Sliders, badge: '⭐' },
      ],
    },
    {
      group: 'Data & AI',
      items: [
        { id: 'data-management' as NavigationTab, label: 'Data Management', icon: Database },
        { id: 'model-performance' as NavigationTab, label: 'Model Performance', icon: Cpu },
      ],
    },
    {
      group: 'Company',
      items: [
        { id: 'companies' as NavigationTab, label: 'Companies', icon: Building2 },
        { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onTabChange(tab);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`h-screen fixed top-0 left-0 z-40 bg-white border-r border-coral-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } shadow-sm`}
      >
        {/* Brand Header */}
        <div className="h-16 px-3 border-b border-coral-100 flex items-center justify-between bg-gradient-to-r from-coral-50/50 to-white relative shrink-0">
          {isCollapsed ? (
            /* Minimized state: StayPlus Logo cleanly centered and never cut off */
            <div className="w-full flex items-center justify-center relative">
              <button
                type="button"
                onClick={() => handleNavClick('landing')}
                className="hover:scale-105 transition-transform shrink-0 flex items-center justify-center"
                title="StayPlus Home"
              >
                <Logo size="sm" />
              </button>

              {/* Expand Toggle Chevron positioned cleanly on the right border */}
              <button
                type="button"
                onClick={onToggleCollapse}
                className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-coral-300 text-gray-600 hover:text-coral-600 shadow-md flex items-center justify-center transition-all hover:scale-110 z-50 cursor-pointer"
                title="Expand sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Expanded state: Full StayPlus logo, brand title and collapse button */
            <>
              <div
                onClick={() => handleNavClick('landing')}
                className="flex items-center gap-2.5 cursor-pointer select-none min-w-0 flex-1"
              >
                <Logo size="md" />

                <div className="flex flex-col min-w-0">
                  <span className="text-lg font-extrabold text-[#252525] tracking-tight truncate flex items-center">
                    Stay<span className="text-coral-500 font-black">Plus</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase truncate">
                    Customer Intelligence
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-coral-600 hover:bg-coral-50 transition-colors shrink-0 ml-auto"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Current Active Company Pill */}
        {!isCollapsed && (
          <div className="px-4 py-3 bg-coral-50/40 border-b border-coral-100/70">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Active Organization
              </span>
              <button
                onClick={() => handleNavClick('companies')}
                className="text-[11px] font-medium text-coral-600 hover:underline flex items-center gap-0.5"
              >
                Switch <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold text-[#252525] truncate">
                {activeCompany.name}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {section.group}
                </p>
              )}

              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-coral-50 text-coral-700 font-bold border border-coral-200/80 shadow-xs'
                        : 'text-gray-600 hover:bg-coral-50/50 hover:text-coral-600'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-coral-600 scale-110' : 'text-gray-400'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="text-xs">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Profile / Quick Info */}
        <div className="p-3 border-t border-coral-100 bg-gray-50/50">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-coral-100 border border-coral-200 text-coral-700 flex items-center justify-center font-bold text-xs shrink-0">
                  VP
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#252525] truncate">Enterprise Admin</p>
                  <p className="text-[10px] text-gray-400 truncate">analytics@stayplus.ai</p>
                </div>
              </div>

              <button
                onClick={() => handleNavClick('settings')}
                title="Account Settings"
                className="p-1.5 text-gray-400 hover:text-coral-600 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-coral-100 border border-coral-200 text-coral-700 flex items-center justify-center font-bold text-xs">
                VP
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
