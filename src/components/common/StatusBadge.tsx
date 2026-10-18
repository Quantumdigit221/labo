import React from 'react';
import { ResultFlag, SampleStatus, OrderStatus, InvoiceStatus } from '../../types/index.ts';

interface StatusBadgeProps {
  status: string | ResultFlag | SampleStatus | OrderStatus | InvoiceStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  switch (status) {
    // Flags
    case 'NORMAL':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Normal';
      break;
    case 'LOW':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Bas ↓';
      break;
    case 'HIGH':
      bg = 'bg-orange-50 text-orange-700 border-orange-200';
      label = 'Élevé ↑';
      break;
    case 'CRITICAL':
      bg = 'bg-rose-100 text-rose-800 border-rose-300 font-semibold animate-pulse';
      label = 'Critique ⚠️';
      break;

    // Samples
    case 'WAITING':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'À prélever';
      break;
    case 'COLLECTED':
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Prélevé';
      break;
    case 'RECEIVED':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      label = 'Réceptionné';
      break;
    case 'PROCESSING':
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      label = 'En analyse';
      break;
    case 'REJECTED':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Rejeté';
      break;

    // Orders / Invoices / Results
    case 'PENDING':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'En attente';
      break;
    case 'ENTERED':
      bg = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      label = 'Saisi (À valider)';
      break;
    case 'IN_PROGRESS':
      bg = 'bg-sky-50 text-sky-700 border-sky-200';
      label = 'En cours';
      break;
    case 'VALIDATED':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Validé';
      break;
    case 'COMPLETED':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Terminé';
      break;
    case 'DELIVERED':
      bg = 'bg-teal-50 text-teal-700 border-teal-200';
      label = 'Transmis';
      break;
    case 'PAID':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Payé';
      break;
    case 'PARTIAL':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Acompte';
      break;
    case 'UNPAID':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Impayé';
      break;
    case 'CANCELLED':
      bg = 'bg-slate-100 text-slate-500 border-slate-200 line-through';
      label = 'Annulé';
      break;
    case 'VALID':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Valide';
      break;
    case 'ROUTINE':
      bg = 'bg-slate-50 text-slate-700 border-slate-200';
      label = 'Routine';
      break;
    case 'URGENT':
      bg = 'bg-rose-50 text-rose-700 border-rose-200 font-medium';
      label = 'Urgent';
      break;
    case 'STAT':
      bg = 'bg-red-100 text-red-800 border-red-300 font-bold';
      label = 'URGENT STAT';
      break;
    case 'SUCCESS':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Succès';
      break;
    case 'FAILED':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Échec';
      break;
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${px} ${bg} transition-colors`}
    >
      {label}
    </span>
  );
};
