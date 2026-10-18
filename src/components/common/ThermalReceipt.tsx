import React from 'react';
import { Payment, Invoice, LabSettings } from '../../types/index.ts';
import { formatCurrency, formatDateTime } from '../../services/i18n.ts';
import { Printer } from 'lucide-react';

interface ThermalReceiptProps {
  payment: Payment;
  invoice?: Invoice;
  settings: LabSettings;
  onPrint?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  payment,
  invoice,
  settings,
  onPrint
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 80mm thermal ticket container */}
      <div
        id={`thermal-receipt-${payment.id}`}
        className="w-72 bg-white border border-slate-300 p-4 rounded-lg text-slate-900 font-mono text-[11px] shadow-md space-y-3 print:border-none print:shadow-none print:p-0 print:w-full"
      >
        {/* Lab Header */}
        <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-0.5">
          <p className="font-extrabold text-sm uppercase font-sans tracking-tight text-blue-900">
            {settings.name}
          </p>
          <p className="text-[10px] text-slate-600">{settings.address}</p>
          <p className="text-[10px] text-slate-600">Tél : {settings.phone}</p>
          <p className="text-[9px] text-slate-500 font-sans">{settings.taxNumber}</p>
        </div>

        {/* Receipt info */}
        <div className="space-y-1">
          <div className="flex justify-between font-bold">
            <span>REÇU DE PAIEMENT</span>
            <span>{payment.paymentNumber}</span>
          </div>
          <div className="flex justify-between text-slate-600 text-[10px]">
            <span>Date :</span>
            <span>{formatDateTime(payment.paymentDate)}</span>
          </div>
          <div className="flex justify-between text-slate-600 text-[10px]">
            <span>Réf Facture :</span>
            <span>{payment.invoiceNumber}</span>
          </div>
          <div className="flex justify-between text-slate-600 text-[10px]">
            <span>Caissier :</span>
            <span>{payment.receivedBy}</span>
          </div>
        </div>

        {/* Patient info */}
        <div className="pt-2 border-t border-dashed border-slate-300 space-y-0.5">
          <span className="text-[10px] text-slate-500 block">PATIENT :</span>
          <p className="font-bold text-xs font-sans text-slate-900 uppercase">
            {payment.patientName}
          </p>
          <p className="text-[10px] text-slate-500">N° {payment.patientId}</p>
        </div>

        {/* Payment Amount & Method */}
        <div className="pt-2 border-t-2 border-slate-800 space-y-1">
          <div className="flex justify-between text-xs font-black font-sans">
            <span>MONTANT ENCAISSÉ :</span>
            <span className="text-blue-900">{formatCurrency(payment.amount)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-600">
            <span>Mode :</span>
            <span className="font-bold">{payment.method}</span>
          </div>
          {payment.reference && (
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>TransID / Réf :</span>
              <span className="truncate max-w-[130px]">{payment.reference}</span>
            </div>
          )}
          {invoice && invoice.balance > 0 && (
            <div className="flex justify-between text-[10px] text-rose-600 font-bold pt-1">
              <span>Solde restant dû :</span>
              <span>{formatCurrency(invoice.balance)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-dashed border-slate-400 text-center text-[9px] text-slate-500 font-sans space-y-1">
          <p>Conservez ce ticket pour le retrait de vos résultats.</p>
          <p className="font-bold">Merci de votre confiance.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
      >
        <Printer className="h-3.5 w-3.5" />
        Imprimer Ticket Thermique (80mm)
      </button>
    </div>
  );
};
