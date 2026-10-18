import React from 'react';
import { InvoicesModule } from '../invoices/InvoicesModule.tsx';

interface PaymentsModuleProps {
  onNavigateToOrder?: (orderId: string) => void;
}

export const PaymentsModule: React.FC<PaymentsModuleProps> = ({ onNavigateToOrder }) => {
  return <InvoicesModule initialTab="payments" onNavigateToOrder={onNavigateToOrder} />;
};
