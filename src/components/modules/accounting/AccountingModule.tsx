import React, { useState } from 'react';
import {
  Calculator,
  Plus,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { Expense, PaymentMethod } from '../../../types/index.ts';
import { Modal } from '../../common/Modal.tsx';
import { formatCurrency, formatDate } from '../../../services/i18n.ts';

export const AccountingModule: React.FC = () => {
  const { payments, expenses, invoices, orders, samples, results, patients, addExpense, settings } = useData();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EXPENSES' | 'DAILY_REPORT'>('OVERVIEW');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // New Expense form
  const [expenseData, setExpenseData] = useState({
    category: 'REACTIFS' as Expense['category'],
    description: '',
    amount: 15000,
    paymentMethod: 'ESPECES' as PaymentMethod,
    expenseDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Financial aggregates
  const validPayments = payments.filter(p => p.status === 'VALID');
  const totalRevenue = validPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const estimatedProfit = totalRevenue - totalExpenses;
  const totalUnpaid = invoices
    .filter(i => i.status === 'UNPAID' || i.status === 'PARTIAL')
    .reduce((acc, i) => acc + i.balance, 0);

  // Daily report calculations (Requirement 23)
  const patientsToday = patients.filter(p => p.createdAt.startsWith(todayStr)).length;
  const ordersToday = orders.filter(o => o.orderDate.startsWith(todayStr)).length;
  const testsTodayCount = orders
    .filter(o => o.orderDate.startsWith(todayStr))
    .reduce((acc, o) => acc + o.items.length, 0);
  const samplesToday = samples.filter(s => s.createdAt.startsWith(todayStr)).length;
  const resultsEnteredToday = results.filter(r => r.status === 'ENTERED' || r.status === 'VALIDATED').length;
  const resultsValidatedToday = results.filter(r => r.status === 'VALIDATED').length;

  const paymentsToday = validPayments.filter(p => p.paymentDate.startsWith(todayStr));
  const waveToday = paymentsToday.filter(p => p.method === 'WAVE').reduce((a, b) => a + b.amount, 0);
  const omToday = paymentsToday.filter(p => p.method === 'ORANGE_MONEY').reduce((a, b) => a + b.amount, 0);
  const cashToday = paymentsToday.filter(p => p.method === 'ESPECES').reduce((a, b) => a + b.amount, 0);
  const cardToday = paymentsToday.filter(p => p.method === 'CARTE_BANCAIRE').reduce((a, b) => a + b.amount, 0);
  const transferToday = paymentsToday.filter(p => p.method === 'VIREMENT').reduce((a, b) => a + b.amount, 0);
  const revenueToday = paymentsToday.reduce((a, b) => a + b.amount, 0);

  const expensesTodayList = expenses.filter(e => e.expenseDate.startsWith(todayStr));
  const expenseTodayTotal = expensesTodayList.reduce((a, b) => a + b.amount, 0);
  const dailyBalance = revenueToday - expenseTodayTotal;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseData.description.trim() || expenseData.amount <= 0) {
      alert('Veuillez renseigner la description et un montant valide.');
      return;
    }
    addExpense(expenseData);
    setIsExpenseModalOpen(false);
    setExpenseData({
      category: 'REACTIFS',
      description: '',
      amount: 15000,
      paymentMethod: 'ESPECES',
      expenseDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handlePrintDailyReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Comptabilité, Caisse & Bilan Journalier</h2>
          <p className="text-xs text-slate-500">
            Suivi des recettes médicales, dépenses de fonctionnement et compte d'exploitation du laboratoire
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            + Enregistrer une Dépense
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold max-w-md">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'OVERVIEW' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Vue Générale Caisse
        </button>
        <button
          onClick={() => setActiveTab('EXPENSES')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'EXPENSES' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Dépenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('DAILY_REPORT')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'DAILY_REPORT' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rapport Journalier Officiel
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Recettes Encaissées</span>
              <div className="mt-1 text-2xl font-black text-emerald-700">{formatCurrency(totalRevenue)}</div>
              <p className="text-[11px] text-emerald-600 mt-1">Cumul total validé</p>
            </div>

            <div className="rounded-xl border border-rose-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Dépenses Exploitation</span>
              <div className="mt-1 text-2xl font-black text-rose-600">-{formatCurrency(totalExpenses)}</div>
              <p className="text-[11px] text-rose-500 mt-1">Réactifs & Consommables</p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Bénéfice Net Estimé</span>
              <div className="mt-1 text-2xl font-black text-blue-700">{formatCurrency(estimatedProfit)}</div>
              <p className="text-[11px] text-blue-600 mt-1">Solde d'exploitation</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Créances & Impayés</span>
              <div className="mt-1 text-2xl font-black text-amber-700">{formatCurrency(totalUnpaid)}</div>
              <p className="text-[11px] text-amber-600 mt-1">À recouvrer (Patients / IPM)</p>
            </div>
          </div>

          {/* Breakdown by Payment Method */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800">
              Ventilation des Encaissements par Moyen de Paiement
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-800 mb-2">
                  <span>Wave Mobile Money</span>
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                </div>
                <div className="text-xl font-bold text-blue-900">
                  {formatCurrency(
                    validPayments
                      .filter(p => p.method === 'WAVE')
                      .reduce((a, b) => a + b.amount, 0)
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/40">
                <div className="flex items-center justify-between text-xs font-semibold text-orange-800 mb-2">
                  <span>Orange Money</span>
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                </div>
                <div className="text-xl font-bold text-orange-900">
                  {formatCurrency(
                    validPayments
                      .filter(p => p.method === 'ORANGE_MONEY')
                      .reduce((a, b) => a + b.amount, 0)
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-2">
                  <span>Espèces Caisse</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-xl font-bold text-emerald-900">
                  {formatCurrency(
                    validPayments
                      .filter(p => p.method === 'ESPECES')
                      .reduce((a, b) => a + b.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Expenses Table */}
      {activeTab === 'EXPENSES' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">N° Dépense</th>
                  <th className="py-3 px-4 font-semibold">Catégorie</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Montant</th>
                  <th className="py-3 px-4 font-semibold">Moyen Paiement</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Enregistré par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Aucune dépense enregistrée.
                    </td>
                  </tr>
                ) : (
                  expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-rose-600">{exp.expenseNumber}</td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{exp.description}</td>
                      <td className="py-3 px-4 font-bold text-rose-600">-{formatCurrency(exp.amount)}</td>
                      <td className="py-3 px-4 text-slate-600">{exp.paymentMethod}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(exp.expenseDate)}</td>
                      <td className="py-3 px-4 text-slate-600">{exp.createdBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Official Laboratory Daily Report (Requirement 23) */}
      {activeTab === 'DAILY_REPORT' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handlePrintDailyReport}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" />
              Imprimer le Rapport Journalier (A4)
            </button>
          </div>

          <div
            id="daily-cash-sheet"
            className="rounded-2xl border border-slate-300 bg-white p-8 sm:p-10 shadow-lg text-slate-900 max-w-3xl mx-auto space-y-6 text-xs"
          >
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
              <h2 className="text-xl font-black uppercase text-blue-900 tracking-tight">
                {settings.name}
              </h2>
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                RAPPORT JOURNALIER D'ACTIVITÉ & CLÔTURE DE CAISSE
              </p>
              <p className="text-xs text-slate-500">
                Date : <strong>{formatDate(todayStr)}</strong> • Fuseau : {settings.timezone}
              </p>
            </div>

            {/* Section 1: Activité Médicale */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
                1. Activité Médicale & Analyses
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Patients reçus</span>
                  <p className="text-base font-bold text-slate-800">{patientsToday}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Demandes créées</span>
                  <p className="text-base font-bold text-slate-800">{ordersToday}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Examens prescrits</span>
                  <p className="text-base font-bold text-slate-800">{testsTodayCount}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Prélèvements réalisés</span>
                  <p className="text-base font-bold text-slate-800">{samplesToday}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Résultats saisis</span>
                  <p className="text-base font-bold text-blue-600">{resultsEnteredToday}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Résultats validés biologiste</span>
                  <p className="text-base font-bold text-emerald-600">{resultsValidatedToday}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Recettes de la journée */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1">
                2. Recettes & Encaissements de la Journée
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Paiements Espèces (Caisse physique) :</span>
                  <span className="font-bold">{formatCurrency(cashToday)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Wave Mobile Money :</span>
                  <span className="font-bold text-blue-600">{formatCurrency(waveToday)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Orange Money :</span>
                  <span className="font-bold text-orange-600">{formatCurrency(omToday)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Carte Bancaire :</span>
                  <span className="font-bold">{formatCurrency(cardToday)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Virements & Chèques :</span>
                  <span className="font-bold">{formatCurrency(transferToday)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-black text-emerald-800 bg-emerald-50 px-2 rounded">
                  <span>TOTAL DES RECETTES DU JOUR :</span>
                  <span>{formatCurrency(revenueToday)}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Dépenses & Solde Net */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-rose-800 border-b border-slate-200 pb-1">
                3. Dépenses & Clôture Nette
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Total des dépenses de la journée :</span>
                  <span className="font-bold text-rose-600">-{formatCurrency(expenseTodayTotal)}</span>
                </div>
                <div className="flex justify-between py-2.5 text-base font-black text-blue-900 bg-blue-50 px-3 rounded-xl border border-blue-200">
                  <span>SOLDE NET DU JOUR (RECETTES - DÉPENSES) :</span>
                  <span>{formatCurrency(dailyBalance)}</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-2 text-center text-xs">
              <div>
                <p className="font-bold uppercase text-[10px] text-slate-500">Le Responsable Caisse</p>
                <p className="mt-8 font-semibold text-slate-800">Abdoulaye Wade Cissé</p>
                <p className="text-[10px] text-slate-400">Visa & Clôture</p>
              </div>
              <div>
                <p className="font-bold uppercase text-[10px] text-slate-500">La Direction / Biologiste</p>
                <p className="mt-8 font-semibold text-slate-800">{settings.leadBiologist}</p>
                <p className="text-[10px] text-slate-400">Approbation</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Enregistrer une Dépense d'Exploitation"
        maxWidth="md"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catégorie</label>
            <select
              value={expenseData.category}
              onChange={e => setExpenseData({ ...expenseData, category: e.target.value as Expense['category'] })}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="REACTIFS">Réactifs de laboratoire</option>
              <option value="CONSOMMABLES">Consommables (Tubes, aiguilles, gants)</option>
              <option value="MAINTENANCE">Maintenance automate</option>
              <option value="LOYER">Loyer & Charges</option>
              <option value="SALAIRES">Salaires & Primes</option>
              <option value="SERVICES">Électricité / Internet / Téléphone</option>
              <option value="AUTRES">Autres charges diverses</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description de la dépense <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={expenseData.description}
              onChange={e => setExpenseData({ ...expenseData, description: e.target.value })}
              placeholder="Ex: Coffret réactif biochimie Cobas..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Montant (FCFA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={100}
                value={expenseData.amount}
                onChange={e => setExpenseData({ ...expenseData, amount: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mode de règlement</label>
              <select
                value={expenseData.paymentMethod}
                onChange={e => setExpenseData({ ...expenseData, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="ESPECES">Espèces (Caisse)</option>
                <option value="WAVE">Wave</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="VIREMENT">Virement bancaire</option>
                <option value="CHEQUE">Chèque</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
            >
              Enregistrer la dépense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
