import React from 'react';
import {
  Users,
  FileSpreadsheet,
  TestTube2,
  FileCheck2,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Activity,
  Plus,
  Search
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { formatCurrency, formatDate } from '../../../services/i18n.ts';
import { StatusBadge } from '../../common/StatusBadge.tsx';

interface DashboardModuleProps {
  onNavigate: (module: string) => void;
  onQuickAction: (action: 'patient' | 'order' | 'sample' | 'payment') => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate, onQuickAction }) => {
  const { patients, orders, samples, results, reports, invoices, payments, expenses } = useData();

  // Metrics
  const todayStr = new Date().toISOString().split('T')[0];

  const patientsToday = patients.filter(p => p.createdAt.startsWith(todayStr)).length;
  const ordersToday = orders.filter(o => o.orderDate.startsWith(todayStr)).length;
  const samplesWaiting = samples.filter(s => s.status === 'WAITING').length;
  const samplesProcessing = samples.filter(s => s.status === 'PROCESSING' || s.status === 'COLLECTED').length;
  const resultsToValidate = results.filter(r => r.status === 'ENTERED').length;
  const reportsReady = reports.length;

  const revenueToday = payments
    .filter(p => p.status === 'VALID' && p.paymentDate.startsWith(todayStr))
    .reduce((acc, p) => acc + p.amount, 0);

  const totalRevenue = payments
    .filter(p => p.status === 'VALID')
    .reduce((acc, p) => acc + p.amount, 0);

  const expensesToday = expenses
    .filter(e => e.expenseDate.startsWith(todayStr))
    .reduce((acc, e) => acc + e.amount, 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const totalUnpaid = invoices
    .filter(i => i.status === 'UNPAID' || i.status === 'PARTIAL')
    .reduce((acc, i) => acc + i.balance, 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-blue-500/30 px-2.5 py-1 text-xs font-semibold text-blue-200 backdrop-blur-md mb-2">
              <Activity className="h-3.5 w-3.5 text-blue-300" />
              Plateforme LIS / LIMS Active • Dakar (Sénégal)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tableau de Bord Laboratoire
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
              Vue en temps réel des analyses médicales, validation biologique et caisse.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('patient-search')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600/70 border border-blue-300/40 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition-all active:scale-95"
            >
              <Search className="h-4 w-4 text-blue-200" />
              Recherche Patient
            </button>
            <button
              onClick={() => onQuickAction('patient')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-blue-800 shadow-md hover:bg-blue-50 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 text-blue-700" />
              Nouveau Patient
            </button>
            <button
              onClick={() => onQuickAction('order')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-600 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 text-white" />
              Nouvelle Demande
            </button>
            <button
              onClick={() => onQuickAction('payment')}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 text-white" />
              Encaisser
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('patients')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Patients inscrits</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{patients.length}</div>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600">+{patientsToday}</span> aujourd'hui
          </p>
        </div>

        <div
          onClick={() => onNavigate('orders')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Demandes d'analyses</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{orders.length}</div>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600">{ordersToday}</span> aujourd'hui
          </p>
        </div>

        <div
          onClick={() => onNavigate('results')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-rose-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Résultats à valider</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{resultsToValidate}</div>
          <p className="mt-1 text-xs text-rose-500 font-medium">Contrôle biologiste requis</p>
        </div>

        <div
          onClick={() => onNavigate('payments')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-purple-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Caisse Recettes (Jour)</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{formatCurrency(revenueToday)}</div>
          <p className="mt-1 text-xs text-slate-500">Total encaissé : {formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* "À FAIRE" Urgent Action Cards (Requirement 3) */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
              Bloc « À FAIRE » — Actions Prioritaires
            </h3>
          </div>
          <span className="text-xs text-amber-700 font-medium">Cliquez pour traiter</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigate('results')}
            className="flex items-center justify-between rounded-lg border border-amber-200/80 bg-white p-3 hover:border-amber-400 hover:shadow-xs cursor-pointer transition-all"
          >
            <div>
              <p className="text-xs text-slate-500 font-medium">Résultats à valider</p>
              <p className="text-lg font-extrabold text-rose-600">{resultsToValidate}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </div>

          <div
            onClick={() => onNavigate('samples')}
            className="flex items-center justify-between rounded-lg border border-amber-200/80 bg-white p-3 hover:border-amber-400 hover:shadow-xs cursor-pointer transition-all"
          >
            <div>
              <p className="text-xs text-slate-500 font-medium">Prélèvements en attente</p>
              <p className="text-lg font-extrabold text-amber-600">{samplesWaiting}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </div>

          <div
            onClick={() => onNavigate('invoices')}
            className="flex items-center justify-between rounded-lg border border-amber-200/80 bg-white p-3 hover:border-amber-400 hover:shadow-xs cursor-pointer transition-all"
          >
            <div>
              <p className="text-xs text-slate-500 font-medium">Créances & Impayés</p>
              <p className="text-lg font-extrabold text-slate-800">{formatCurrency(totalUnpaid)}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </div>

          <div
            onClick={() => onNavigate('reports')}
            className="flex items-center justify-between rounded-lg border border-amber-200/80 bg-white p-3 hover:border-amber-400 hover:shadow-xs cursor-pointer transition-all"
          >
            <div>
              <p className="text-xs text-slate-500 font-medium">Rapports prêts / à envoyer</p>
              <p className="text-lg font-extrabold text-teal-600">{reportsReady}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Activity Overview & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Dernières Demandes d'Analyses</h3>
              <p className="text-xs text-slate-500">Flux d'enregistrement des patients au laboratoire</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Voir tout ({orders.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">N° Demande</th>
                  <th className="py-2.5 px-3 font-semibold">Patient</th>
                  <th className="py-2.5 px-3 font-semibold">Médecin</th>
                  <th className="py-2.5 px-3 font-semibold">Montant</th>
                  <th className="py-2.5 px-3 font-semibold">Statut</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-blue-600">{o.orderNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{o.patientName}</div>
                      <div className="text-[10px] text-slate-400">{o.patientNumber}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{o.doctorName || 'Prescription directe'}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{formatCurrency(o.total)}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={o.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('orders')}
                        className="rounded px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 col: Financial & Lab Summary */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Synthèse Financière Caisse</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Recettes Totales :</span>
                <span className="font-bold text-emerald-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Dépenses Réactifs/Consommables :</span>
                <span className="font-bold text-rose-600">-{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Solde Net Estimé :</span>
                <span className="font-bold text-blue-700">{formatCurrency(totalRevenue - totalExpenses)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Créances Clients / IPM :</span>
                <span className="font-bold text-amber-600">{formatCurrency(totalUnpaid)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Modes de Paiement Reçus</h3>
            <p className="text-xs text-slate-500 mb-3">Sénégal & UEMOA</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span> Wave Mobile Money
                </span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(
                    payments
                      .filter(p => p.method === 'WAVE' && p.status === 'VALID')
                      .reduce((a, b) => a + b.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span> Orange Money
                </span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(
                    payments
                      .filter(p => p.method === 'ORANGE_MONEY' && p.status === 'VALID')
                      .reduce((a, b) => a + b.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Espèces
                </span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(
                    payments
                      .filter(p => p.method === 'ESPECES' && p.status === 'VALID')
                      .reduce((a, b) => a + b.amount, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
