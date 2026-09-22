import React, { useState, useEffect } from 'react';
import {
  getStoredCompanies,
  saveCompanies,
  getActiveCompanyId,
  saveActiveCompanyId,
  getStoredNotifications,
  saveNotifications,
  resetAllToDefaults,
} from './services/companyStorage';
import { Company, Customer, NotificationItem } from './types';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { ExportModal } from './components/common/ExportModal';

// Views
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { CompaniesView } from './views/CompaniesView';
import { UploadWizardView } from './views/UploadWizardView';
import { CustomerRiskView } from './views/CustomerRiskView';
import { Customer360View } from './views/Customer360View';
import { SegmentationView } from './views/SegmentationView';
import { AnalyticsView } from './views/AnalyticsView';
import { RecommendationsView } from './views/RecommendationsView';
import { WhatIfSimulatorView } from './views/WhatIfSimulatorView';
import { DataManagementView } from './views/DataManagementView';
import { ModelPerformanceView } from './views/ModelPerformanceView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  // Companies & active selection
  const [companies, setCompanies] = useState<Company[]>(getStoredCompanies);
  const [activeCompanyId, setActiveCompanyId] = useState<string>(getActiveCompanyId);
  const [notifications, setNotifications] = useState<NotificationItem[]>(getStoredNotifications);

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUploadWizardActive, setIsUploadWizardActive] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Get active company object
  const activeCompany =
    companies.find(c => c.id === activeCompanyId) || companies[0];

  // Save changes to localStorage
  useEffect(() => {
    saveCompanies(companies);
  }, [companies]);

  useEffect(() => {
    saveActiveCompanyId(activeCompanyId);
  }, [activeCompanyId]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Global Keyboard Shortcuts (Ctrl/Cmd + K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Handlers
  const handleSelectCompany = (compId: string) => {
    setActiveCompanyId(compId);
    setSelectedCustomer(null);
    const targetComp = companies.find(c => c.id === compId);
    showToast(`Switched organization to ${targetComp?.name || compId}`);
  };

  const handleCreateCompany = (newCompany: Company) => {
    setCompanies(prev => [newCompany, ...prev]);
    setActiveCompanyId(newCompany.id);
    setIsUploadWizardActive(false);
    setCurrentTab('dashboard');
    showToast(`Successfully created and analyzed ${newCompany.name}!`);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Dataset Ingestion Completed',
      message: `${newCompany.name} dataset analyzed with 96% data quality score.`,
      timeAgo: 'Just now',
      type: 'success',
      read: false,
      companyId: newCompany.id,
      linkTab: 'dashboard',
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleDeleteCompany = (compId: string) => {
    if (companies.length <= 1) {
      alert('Cannot delete the only remaining company.');
      return;
    }
    const filtered = companies.filter(c => c.id !== compId);
    setCompanies(filtered);
    if (activeCompanyId === compId) {
      setActiveCompanyId(filtered[0].id);
    }
    showToast('Company removed from workspace.');
  };

  const handleReanalyzeCompany = (compId: string) => {
    showToast('Re-running ML feature engineering & churn inference...');
    setTimeout(() => {
      showToast('XGBoost model predictions refreshed successfully!');
    }, 1200);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentTab('customers');
  };

  const handleOpenSimulatorWithCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentTab('simulator');
  };

  const handleResetAllData = () => {
    resetAllToDefaults();
    const fresh = getStoredCompanies();
    setCompanies(fresh);
    setActiveCompanyId(fresh[0].id);
    setNotifications(getStoredNotifications());
    setSelectedCustomer(null);
    setCurrentTab('dashboard');
    showToast('All companies reset to hackathon demo baseline.');
  };

  // If on Landing page, render Landing view standalone
  if (currentTab === 'landing') {
    return (
      <>
        <LandingView
          onEnterApp={tab => {
            setCurrentTab(tab || 'dashboard');
          }}
          onOpenUpload={() => {
            setIsUploadWizardActive(true);
            setCurrentTab('companies');
          }}
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-fadeIn">
            {toastMessage}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#FFF7F7] flex overflow-hidden antialiased">
      {/* Responsive SaaS Sidebar (Permanently fixed viewport height) */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={tab => {
          setCurrentTab(tab);
          setIsUploadWizardActive(false);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeCompany={activeCompany}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area: Fixed layout with internal smooth scrolling */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Topbar: Permanently fixed at the top */}
        <Topbar
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          companies={companies}
          activeCompany={activeCompany}
          onSelectCompany={handleSelectCompany}
          onOpenAddCompany={() => {
            setIsUploadWizardActive(true);
            setCurrentTab('companies');
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          notifications={notifications}
        />

        {/* Page Content Container: Scrollable area with smooth scrolling */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl w-full mx-auto">
            {/* If Upload Wizard is active */}
            {isUploadWizardActive ? (
              <UploadWizardView
                onCancel={() => setIsUploadWizardActive(false)}
                onCompanyCreated={handleCreateCompany}
              />
            ) : selectedCustomer && currentTab === 'customers' ? (
              <Customer360View
                customer={selectedCustomer}
                onBack={() => setSelectedCustomer(null)}
                onOpenSimulator={handleOpenSimulatorWithCustomer}
                onActionApplied={actionTitle => {
                  showToast(`Action dispatched: "${actionTitle}"`);
                }}
              />
            ) : (
              <>
                {currentTab === 'dashboard' && (
                  <DashboardView
                    company={activeCompany}
                    onOpenExport={() => setIsExportOpen(true)}
                    onSelectCustomer={handleSelectCustomer}
                    onNavigateTab={tab => setCurrentTab(tab)}
                    onRefreshData={() => {
                      showToast(`Refreshed metrics for ${activeCompany.name}`);
                    }}
                  />
                )}

                {currentTab === 'companies' && (
                  <CompaniesView
                    companies={companies}
                    activeCompany={activeCompany}
                    onSelectCompany={handleSelectCompany}
                    onNavigateTab={tab => setCurrentTab(tab)}
                    onOpenAddCompany={() => setIsUploadWizardActive(true)}
                    onDeleteCompany={handleDeleteCompany}
                    onReanalyzeCompany={handleReanalyzeCompany}
                  />
                )}

                {currentTab === 'customers' && (
                  <CustomerRiskView
                    company={activeCompany}
                    onSelectCustomer={handleSelectCustomer}
                  />
                )}

                {currentTab === 'segments' && (
                  <SegmentationView
                    company={activeCompany}
                    onSelectCustomer={handleSelectCustomer}
                  />
                )}

                {currentTab === 'drivers' && (
                  <AnalyticsView company={activeCompany} />
                )}

                {currentTab === 'recommendations' && (
                  <RecommendationsView
                    company={activeCompany}
                    onSelectCustomer={handleSelectCustomer}
                    onOpenSimulator={handleOpenSimulatorWithCustomer}
                  />
                )}

                {currentTab === 'simulator' && (
                  <WhatIfSimulatorView
                    company={activeCompany}
                    preselectedCustomer={selectedCustomer}
                    onSelectCustomer360={handleSelectCustomer}
                  />
                )}

                {currentTab === 'data-management' && (
                  <DataManagementView
                    company={activeCompany}
                    onOpenUploadWizard={() => setIsUploadWizardActive(true)}
                    onReanalyze={() => {
                      showToast('Re-processing dataset features...');
                    }}
                  />
                )}

                {currentTab === 'model-performance' && (
                  <ModelPerformanceView company={activeCompany} />
                )}

                {currentTab === 'settings' && (
                  <SettingsView
                    company={activeCompany}
                    onUpdateCompany={updated => {
                      setCompanies(prev =>
                        prev.map(c => (c.id === activeCompany.id ? { ...c, ...updated } : c))
                      );
                      showToast('Organization settings updated.');
                    }}
                    onResetAllData={handleResetAllData}
                  />
                )}
              </>
            )}
            </div>
          </main>
        </div>

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        companies={companies}
        activeCompany={activeCompany}
        onSelectCompany={handleSelectCompany}
        onSelectCustomer={handleSelectCustomer}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          showToast('Marked all notifications as read');
        }}
        onClearAll={() => {
          setNotifications([]);
          showToast('Cleared notifications');
        }}
        onNotificationClick={notif => {
          setNotifications(prev =>
            prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
          );
          setIsNotificationsOpen(false);
          if (notif.companyId) {
            setActiveCompanyId(notif.companyId);
          }
          if (notif.linkTab) {
            setCurrentTab(notif.linkTab as NavigationTab);
          }
        }}
      />

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        company={activeCompany}
      />

      {/* Toast Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-fadeIn flex items-center gap-2 border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-coral-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
