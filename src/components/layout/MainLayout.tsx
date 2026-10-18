import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar.tsx';
import { Header } from './Header.tsx';
import { GlobalSearchModal } from '../common/GlobalSearchModal.tsx';
import { DashboardModule } from '../modules/dashboard/DashboardModule.tsx';
import { PatientsModule } from '../modules/patients/PatientsModule.tsx';
import { PatientSearchModule } from '../modules/patients/PatientSearchModule.tsx';
import { DoctorsModule } from '../modules/doctors/DoctorsModule.tsx';
import { OrdersModule } from '../modules/orders/OrdersModule.tsx';
import { SamplesModule } from '../modules/samples/SamplesModule.tsx';
import { TestsModule } from '../modules/tests/TestsModule.tsx';
import { MicrobiologyModule } from '../modules/microbiology/MicrobiologyModule.tsx';
import { ResultsModule } from '../modules/results/ResultsModule.tsx';
import { ReportsModule } from '../modules/reports/ReportsModule.tsx';
import { InvoicesModule } from '../modules/invoices/InvoicesModule.tsx';
import { PaymentsModule } from '../modules/payments/PaymentsModule.tsx';
import { AccountingModule } from '../modules/accounting/AccountingModule.tsx';
import { ContractsModule } from '../modules/contracts/ContractsModule.tsx';
import { HomeVisitsModule } from '../modules/home-visits/HomeVisitsModule.tsx';
import { ChatModule } from '../modules/communication/ChatModule.tsx';
import { WhatsAppModule } from '../modules/communication/WhatsAppModule.tsx';
import { UsersModule } from '../modules/admin/UsersModule.tsx';
import { ActivityLogsModule } from '../modules/admin/ActivityLogsModule.tsx';
import { SettingsModule } from '../modules/settings/SettingsModule.tsx';
import { TranslationsModule } from '../modules/translations/TranslationsModule.tsx';
import { StatisticsModule } from '../modules/statistics/StatisticsModule.tsx';
import { VerificationPortal } from '../modules/verification/VerificationPortal.tsx';
import { AnalyzersModule } from '../modules/analyzers/AnalyzersModule.tsx';
import { AiAssistantModule } from '../modules/ai-assistant/AiAssistantModule.tsx';
import { PatientPortalModule } from '../modules/portal/PatientPortalModule.tsx';
import { BackupModule } from '../modules/backup/BackupModule.tsx';
import { InventoryModule } from '../modules/inventory/InventoryModule.tsx';
import { QualityControlModule } from '../modules/qc/QualityControlModule.tsx';
import { AccessDeniedView } from '../common/AccessDeniedView.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

export const MainLayout: React.FC = () => {
  const { canAccessModule } = useAuth();
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);

  // Deep link or detail target
  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(undefined);
  const [publicVerifyReportNumber, setPublicVerifyReportNumber] = useState<string | null>(null);

  // Global keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (module: string, itemId?: string) => {
    setActiveModule(module);
    setSelectedEntityId(itemId);
    setSidebarMobileOpen(false);
  };

  const handleQuickAction = (action: 'patient' | 'order' | 'sample' | 'payment') => {
    switch (action) {
      case 'patient':
        setActiveModule('patients');
        break;
      case 'order':
        setActiveModule('orders');
        break;
      case 'sample':
        setActiveModule('samples');
        break;
      case 'payment':
        setActiveModule('invoices');
        break;
    }
  };

  // If in Public QR Code verification mode (Requirement 18)
  if (publicVerifyReportNumber) {
    return (
      <VerificationPortal
        reportNumber={publicVerifyReportNumber}
        onBackToApp={() => setPublicVerifyReportNumber(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Mobile Backdrop */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile */}
      <div className={`${sidebarMobileOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar
          activeModule={activeModule}
          setActiveModule={handleNavigate}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onToggleSidebarMobile={() => setSidebarMobileOpen(!sidebarMobileOpen)}
          onOpenSearch={() => setSearchModalOpen(true)}
          onQuickAction={handleQuickAction}
          setActiveModule={handleNavigate}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeModule !== 'dashboard' && !canAccessModule(activeModule) ? (
            <AccessDeniedView
              attemptedModule={activeModule}
              onNavigateHome={() => setActiveModule('dashboard')}
            />
          ) : (
            <>
              {activeModule === 'dashboard' && (
                <DashboardModule onNavigate={handleNavigate} onQuickAction={handleQuickAction} />
              )}

          {activeModule === 'patient-search' && (
            <PatientSearchModule
              onNavigateToPatientDossier={patientId => {
                setSelectedEntityId(patientId);
                setActiveModule('patients');
              }}
              onNavigateToOrder={patientId => {
                setSelectedEntityId(patientId);
                setActiveModule('orders');
              }}
            />
          )}

          {activeModule === 'patients' && (
            <PatientsModule
              initialPatientId={selectedEntityId}
              onNavigateToOrder={patientId => {
                setSelectedEntityId(patientId);
                setActiveModule('orders');
              }}
              onNavigateToSearch={() => setActiveModule('patient-search')}
            />
          )}

          {activeModule === 'doctors' && <DoctorsModule />}

          {activeModule === 'orders' && (
            <OrdersModule
              initialPatientId={selectedEntityId}
              onNavigateToResults={orderId => {
                setSelectedEntityId(orderId);
                setActiveModule('results');
              }}
              onNavigateToInvoice={invId => {
                setSelectedEntityId(invId);
                setActiveModule('invoices');
              }}
              onNavigateToReports={reportId => {
                setSelectedEntityId(reportId);
                setActiveModule('reports');
              }}
            />
          )}

          {activeModule === 'samples' && <SamplesModule />}

          {(activeModule === 'tests' || activeModule === 'group-tests' || activeModule === 'price-list') && (
            <TestsModule />
          )}

          {(activeModule === 'cultures' || activeModule === 'antibiotics' || activeModule === 'antibiograms') && (
            <MicrobiologyModule />
          )}

          {activeModule === 'results' && (
            <ResultsModule
              onNavigateToReports={reportId => {
                setSelectedEntityId(reportId);
                setActiveModule('reports');
              }}
            />
          )}

          {activeModule === 'reports' && (
            <ReportsModule
              initialReportId={selectedEntityId}
              onNavigateToPublicVerify={rptNum => setPublicVerifyReportNumber(rptNum)}
            />
          )}

          {activeModule === 'daily-report' && <AccountingModule />}

          {activeModule === 'invoices' && (
            <InvoicesModule
              onNavigateToOrder={orderId => {
                setSelectedEntityId(orderId);
                setActiveModule('orders');
              }}
            />
          )}

          {activeModule === 'payments' && <PaymentsModule />}

          {activeModule === 'accounting' && <AccountingModule />}

          {activeModule === 'contracts' && <ContractsModule />}

          {activeModule === 'home-visits' && <HomeVisitsModule />}

          {activeModule === 'chat' && <ChatModule />}

          {(activeModule === 'whatsapp' || activeModule === 'sms' || activeModule === 'emails') && (
            <WhatsAppModule />
          )}

          {activeModule === 'users' && <UsersModule />}

          {activeModule === 'settings' && <SettingsModule />}

          {activeModule === 'translations' && <TranslationsModule />}

          {activeModule === 'activity-logs' && <ActivityLogsModule />}

          {activeModule === 'statistics' && <StatisticsModule />}

          {activeModule === 'analyzers' && <AnalyzersModule />}

          {activeModule === 'ai-assistant' && <AiAssistantModule />}

          {activeModule === 'portal' && <PatientPortalModule />}

          {activeModule === 'backup' && <BackupModule />}

          {activeModule === 'inventory' && <InventoryModule />}

          {activeModule === 'quality-control' && <QualityControlModule />}
            </>
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};
