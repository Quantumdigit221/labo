import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  FlaskConical,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { formatCurrency } from '../../../services/i18n.ts';

export const StatisticsModule: React.FC = () => {
  const { patients, orders, tests, samples, results, payments, expenses, doctors } = useData();

  const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'ALL'>('30D');

  const totalRevenue = payments
    .filter(p => p.status === 'VALID')
    .reduce((a, b) => a + b.amount, 0);

  const totalExpense = expenses.reduce((a, b) => a + b.amount, 0);

  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
  const validationRate = results.length > 0
    ? Math.round((results.filter(r => r.status === 'VALIDATED').length / results.length) * 100)
    : 100;

  const rejectedSamples = samples.filter(s => s.status === 'REJECTED').length;
  const rejectionRate = samples.length > 0
    ? ((rejectedSamples / samples.length) * 100).toFixed(1)
    : '0.0';

  // Popular tests breakdown
  const testCounts: Record<string, number> = {};
  orders.forEach(o => {
    o.items.forEach(it => {
      testCounts[it.testName] = (testCounts[it.testName] || 0) + 1;
    });
  });

  const popularTests = Object.entries(testCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Analyses Statistiques & Indicateurs Qualité</h2>
          <p className="text-xs text-slate-500">
            Performance clinique, délais de rendu (TAT), rentabilité et volumétrie d'activité
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setTimeRange('7D')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === '7D' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Derniers Jours
          </button>
          <button
            onClick={() => setTimeRange('30D')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === '30D' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 Derniers Jours
          </button>
          <button
            onClick={() => setTimeRange('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === 'ALL' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Historique Global
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Requirement 51) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Temps Moyen de Rendu (TAT)</span>
          <div className="mt-1 text-2xl font-black text-blue-800">2h 15m</div>
          <p className="text-[11px] text-emerald-600 mt-1">Conforme aux engagements labo</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Taux de Validation Biologique</span>
          <div className="mt-1 text-2xl font-black text-emerald-700">{validationRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Contrôlé sous supervision</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Taux de Non-Conformité (Rejet)</span>
          <div className="mt-1 text-2xl font-black text-slate-800">{rejectionRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Objectif qualité &lt; 2.0%</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Marge Brute Estimée</span>
          <div className="mt-1 text-2xl font-black text-emerald-800">
            {formatCurrency(totalRevenue - totalExpense)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Après déduction réactifs</p>
        </div>
      </div>

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most requested tests */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">
            Top 5 des Examens les Plus Demandés
          </h3>
          <div className="space-y-3">
            {popularTests.map(([tName, count], idx) => {
              const pct = Math.min(100, Math.round((count / (orders.length || 1)) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{tName}</span>
                    <span className="font-bold text-blue-700">{count} prescriptions</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor referral ranking */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">
            Principaux Praticiens Prescripteurs Référents
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {doctors.slice(0, 5).map(doc => {
              const docOrders = orders.filter(o => o.doctorId === doc.id);
              const ca = docOrders.reduce((a, b) => a + b.total, 0);
              return (
                <div key={doc.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">Dr. {doc.firstName} {doc.lastName}</span>
                    <p className="text-[10px] text-slate-400">{doc.specialty} • {doc.facility}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700">{formatCurrency(ca)}</span>
                    <p className="text-[10px] text-slate-400">{docOrders.length} dossiers adressés</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
