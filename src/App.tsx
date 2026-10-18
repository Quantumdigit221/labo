import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { DataProvider } from './context/DataContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { MainLayout } from './components/layout/MainLayout.tsx';
import { LoginPage } from './components/auth/LoginPage.tsx';
import { VerificationPortal } from './components/modules/verification/VerificationPortal.tsx';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [directVerifyReport, setDirectVerifyReport] = useState<string | null>(null);

  useEffect(() => {
    // Check if user directly loaded a /verify/RPT-... URL
    const pathname = window.location.pathname;
    if (pathname.includes('/verify/')) {
      const parts = pathname.split('/verify/');
      if (parts[1]) {
        setDirectVerifyReport(parts[1]);
      }
    }
  }, []);

  if (directVerifyReport) {
    return (
      <VerificationPortal
        reportNumber={directVerifyReport}
        onBackToApp={() => {
          setDirectVerifyReport(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </DataProvider>
    </AuthProvider>
  );
}
