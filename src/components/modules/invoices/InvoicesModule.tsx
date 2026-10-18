import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Eye,
  CreditCard,
  Printer,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  FlaskConical,
  Sparkles,
  Info,
  DollarSign,
  RotateCcw,
  Calendar,
  Wallet,
  TrendingUp,
  Percent,
  Layers,
  FileSpreadsheet,
  Check,
  X,
  Filter
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { Invoice, Payment, PaymentMethod, OrderPriority } from '../../../types/index.ts';
import { StatusBadge } from '../../common/StatusBadge.tsx';
import { Modal } from '../../common/Modal.tsx';
import { ConfirmDialog } from '../../common/ConfirmDialog.tsx';
import { ThermalReceipt } from '../../common/ThermalReceipt.tsx';
import { formatCurrency, formatDate, formatDateTime } from '../../../services/i18n.ts';
import { WhatsAppService } from '../../../services/whatsappService.ts';

interface InvoicesModuleProps {
  initialTab?: 'invoices' | 'payments' | 'summary';
  onNavigateToOrder?: (orderId: string) => void;
}

export const InvoicesModule: React.FC<InvoicesModuleProps> = ({
  initialTab = 'invoices',
  onNavigateToOrder
}) => {
  const {
    invoices,
    payments,
    patients,
    doctors,
    tests,
    testGroups,
    contracts,
    orders,
    addPayment,
    cancelPayment,
    createBillingFirstWorkflow,
    validateExistingInvoiceAndCreateOrder,
    settings
  } = useData();

  const { canManageFinances, currentRole } = useAuth();

  // Active sub-tab in unified module
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'summary'>(initialTab);

  // Common / Invoices filters
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Payments filters
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [cancellingPayment, setCancellingPayment] = useState<Payment | null>(null);
  const [printingPayment, setPrintingPayment] = useState<Payment | null>(null);

  // Quick Payment Modal
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WAVE');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Workflow Modal: "+ Nouvelle Facturation d'Examen" (Receptionist Billing First)
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [billingPatientId, setBillingPatientId] = useState('');
  const [billingPatientSearch, setBillingPatientSearch] = useState('');
  const [isChangingPatient, setIsChangingPatient] = useState(false);
  const [billingDoctorId, setBillingDoctorId] = useState('');
  const [billingContractId, setBillingContractId] = useState('');
  const [billingTestIds, setBillingTestIds] = useState<string[]>([]);
  const [billingTestSearch, setBillingTestSearch] = useState('');
  const [billingTestCategoryFilter, setBillingTestCategoryFilter] = useState<string>('ALL');
  const [billingPriority, setBillingPriority] = useState<OrderPriority>('ROUTINE');
  const [billingDiscount, setBillingDiscount] = useState<number>(0);
  const [billingNotes, setBillingNotes] = useState('');
  const [billingValidateImmediately, setBillingValidateImmediately] = useState(true);
  const [billingPaymentMethod, setBillingPaymentMethod] = useState<PaymentMethod>('WAVE');
  const [billingPaymentRef, setBillingPaymentRef] = useState('');
  const [billingPaymentType, setBillingPaymentType] = useState<'TOTAL' | 'PARTIAL' | 'PEC'>('TOTAL');
  const [billingPartialAmount, setBillingPartialAmount] = useState<number>(0);

  // Workflow Success Modal
  const [workflowSuccessData, setWorkflowSuccessData] = useState<{
    invoice: Invoice;
    orderNumber?: string;
  } | null>(null);

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.orderNumber.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesStatus = invoiceStatusFilter === 'ALL' || inv.status === invoiceStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered payments
  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.paymentNumber.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.patientName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(paymentSearch.toLowerCase()));
    const matchesMethod = paymentMethodFilter === 'ALL' || p.method === paymentMethodFilter;
    return matchesSearch && matchesMethod;
  });

  // Filtered patients for modal search
  const selectedBillingPatient = patients.find(p => p.id === billingPatientId);
  const filteredBillingPatients = patients.filter(p => {
    if (!billingPatientSearch.trim()) return true;
    const term = billingPatientSearch.toLowerCase().trim();
    return (
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      p.patientNumber.toLowerCase().includes(term) ||
      p.phone.toLowerCase().includes(term) ||
      (p.email && p.email.toLowerCase().includes(term))
    );
  });

  // Filtered tests for modal search & category
  const filteredBillingTests = tests.filter(t => {
    const term = billingTestSearch.toLowerCase().trim();
    const matchesSearch =
      !term ||
      t.name.toLowerCase().includes(term) ||
      t.code.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term) ||
      (t.container && t.container.toLowerCase().includes(term));
    const matchesCategory =
      billingTestCategoryFilter === 'ALL' || t.category === billingTestCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Financial metrics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.status !== 'CANCELLED' ? inv.total : 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.status !== 'CANCELLED' ? inv.paidAmount : 0), 0);
  const totalBalanceDue = invoices.reduce((acc, inv) => acc + (inv.status !== 'CANCELLED' ? inv.balance : 0), 0);
  const recoveryRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 100;

  const validPayments = payments.filter(p => p.status === 'VALID');
  const totalValidPayments = validPayments.reduce((acc, p) => acc + p.amount, 0);

  const waveTotal = validPayments.filter(p => p.method === 'WAVE').reduce((acc, p) => acc + p.amount, 0);
  const omTotal = validPayments.filter(p => p.method === 'ORANGE_MONEY').reduce((acc, p) => acc + p.amount, 0);
  const cashTotal = validPayments.filter(p => p.method === 'ESPECES').reduce((acc, p) => acc + p.amount, 0);
  const cardTotal = validPayments.filter(p => p.method === 'CARTE_BANCAIRE').reduce((acc, p) => acc + p.amount, 0);
  const othersTotal = validPayments
    .filter(p => p.method !== 'WAVE' && p.method !== 'ORANGE_MONEY' && p.method !== 'ESPECES' && p.method !== 'CARTE_BANCAIRE')
    .reduce((acc, p) => acc + p.amount, 0);

  const unpaidInvoicesCount = invoices.filter(inv => inv.status === 'UNPAID' || inv.status === 'PARTIAL').length;

  // Billing calculation
  const calculatedSubtotal = billingTestIds.reduce((acc, tId) => {
    const t = tests.find(item => item.id === tId);
    return acc + (t?.price || 0);
  }, 0);

  const selectedContract = contracts.find(c => c.id === billingContractId);
  const contractDiscount = selectedContract ? Math.round((calculatedSubtotal * selectedContract.discount) / 100) : 0;
  const effectiveDiscount = billingDiscount > 0 ? billingDiscount : contractDiscount;
  const calculatedTotal = Math.max(0, calculatedSubtotal - effectiveDiscount);

  const toggleTest = (testId: string) => {
    if (billingTestIds.includes(testId)) {
      setBillingTestIds(billingTestIds.filter(id => id !== testId));
    } else {
      setBillingTestIds([...billingTestIds, testId]);
    }
  };

  const addGroupTests = (groupId: string) => {
    const group = testGroups.find(g => g.id === groupId);
    if (!group) return;
    const combined = Array.from(new Set([...billingTestIds, ...group.testIds]));
    setBillingTestIds(combined);
  };

  const handleOpenBillingModal = () => {
    setBillingPatientSearch('');
    setIsChangingPatient(!billingPatientId);
    setBillingTestSearch('');
    setBillingTestCategoryFilter('ALL');
    setBillingTestIds([]);
    setBillingDiscount(0);
    setBillingNotes('');
    setBillingPaymentRef('');
    setBillingValidateImmediately(true);
    setBillingPaymentType('TOTAL');
    setIsBillingModalOpen(true);
  };

  const handleCreateBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingPatientId) {
      alert('Veuillez sélectionner un patient.');
      return;
    }
    if (billingTestIds.length === 0) {
      alert('Veuillez sélectionner au moins un examen médical à facturer.');
      return;
    }

    let initialPaymentAmount = 0;
    if (billingPaymentType === 'TOTAL') {
      initialPaymentAmount = calculatedTotal;
    } else if (billingPaymentType === 'PARTIAL') {
      initialPaymentAmount = Math.min(calculatedTotal, billingPartialAmount);
    } else if (billingPaymentType === 'PEC') {
      initialPaymentAmount = 0;
    }

    try {
      const res = await createBillingFirstWorkflow({
        patientId: billingPatientId,
        doctorId: billingDoctorId || undefined,
        testIds: billingTestIds,
        priority: billingPriority,
        discountAmount: effectiveDiscount,
        contractId: billingContractId || undefined,
        notes: billingNotes,
        validateImmediately: billingValidateImmediately,
        initialPayment:
          initialPaymentAmount > 0
            ? {
                amount: initialPaymentAmount,
                method: billingPaymentMethod,
                reference: billingPaymentRef.trim() || undefined
              }
            : undefined
      });

      setIsBillingModalOpen(false);
      setWorkflowSuccessData({
        invoice: res.invoice,
        orderNumber: res.order?.orderNumber
      });
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la facturation.');
    }
  };

  const handleValidateExistingInvoice = async (invoiceId: string) => {
    try {
      const order = await validateExistingInvoiceAndCreateOrder(invoiceId);
      if (order) {
        alert(`Facture validée avec succès ! La demande d'examen ${order.orderNumber} a été créée et transmise au laboratoire.`);
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la validation.');
    }
  };

  const handleOpenPayModal = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPaymentAmount(inv.balance);
    setPaymentRef('');
    setPaymentNotes('');
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    if (paymentAmount <= 0) {
      alert('Veuillez saisir un montant valide supérieur à 0 FCFA.');
      return;
    }
    if (paymentAmount > payingInvoice.balance) {
      alert('Le montant saisi dépasse le solde restant de la facture.');
      return;
    }

    try {
      const newPay = addPayment({
        invoiceId: payingInvoice.id,
        amount: paymentAmount,
        method: paymentMethod,
        reference: paymentRef.trim() || undefined,
        notes: paymentNotes.trim() || undefined
      });
      setPayingInvoice(null);
      setPrintingPayment(newPay);
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'encaissement.");
    }
  };

  const handleConfirmCancelPayment = (reason?: string) => {
    if (cancellingPayment) {
      cancelPayment(cancellingPayment.id, reason || 'Annulation demandée par la caisse');
      setCancellingPayment(null);
    }
  };

  const handleSendReceiptWhatsApp = async (inv: Invoice) => {
    const res = await WhatsAppService.sendMessage({
      recipientPhone: '+221 77 654 11 22',
      recipientName: inv.patientName,
      templateType: 'RECEIPT',
      messageText: `Bonjour ${inv.patientName},\n\nVotre reçu pour la facture *${inv.invoiceNumber}* (Montant total : ${formatCurrency(inv.total)}) est disponible auprès de *${settings.name}*.\n\nMontant payé : ${formatCurrency(inv.paidAmount)}\nReste : ${formatCurrency(inv.balance)}\n\nConsultez votre reçu en ligne : ${window.location.origin}/receipt/${inv.invoiceNumber}\n\nMerci de votre confiance.`,
      referenceNumber: inv.invoiceNumber,
      sentBy: 'Caisse'
    });

    if (res.success) {
      alert('Reçu envoyé avec succès par WhatsApp au patient !');
    } else {
      alert('Échec : ' + (res.error || "Erreur d'envoi WhatsApp"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Module Facturation, Caisse & Règlements</h2>
            <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
              Module Unifié
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Prise en charge financière des patients, facturation d'examens, journal de caisse Wave / OM / Espèces et rapprochements journaliers
          </p>
        </div>

        {canManageFinances() && (
          <button
            onClick={handleOpenBillingModal}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            + NOUVELLE FACTURATION D'EXAMEN
          </button>
        )}
      </div>

      {/* Unified Tab Navigation Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 gap-1 overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Facturation des Examens</span>
          {unpaidInvoicesCount > 0 && (
            <span className="rounded-full bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2">
              {unpaidInvoicesCount} en attente
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Caisse & Journal des Règlements</span>
          <span className="rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold px-1.5 py-0.2">
            {payments.length} reçus
          </span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'summary'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Synthèse & Point de Caisse</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FACTURATION DES EXAMENS */}
      {/* ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Workflow Information Banner */}
          <div className="rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50 via-sky-50 to-indigo-50 p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Workflow Obligatoire : Facturation Préalable
                  </h4>
                  <span className="rounded-md bg-blue-600/10 text-blue-700 text-[10px] font-bold px-2 py-0.5">
                    Étape 1 Réception
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
                  Le réceptionniste fait la facturation en premier au comptoir. Dès que la facturation est validée, elle devient automatiquement une <strong>demande d'examen technique</strong> au laboratoire pour prise en charge immédiate par le technicien.
                </p>
              </div>
            </div>
          </div>

          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
                placeholder="Rechercher par N° facture (FAC-...), patient, N° commande..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={invoiceStatusFilter}
              onChange={e => setInvoiceStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Tous les statuts ({invoices.length})</option>
              <option value="PAID">Payées / Réglées</option>
              <option value="PARTIAL">Partiellement payées</option>
              <option value="UNPAID">Impayées (En attente validation)</option>
              <option value="CANCELLED">Annulées</option>
            </select>
          </div>

          {/* Invoices Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">N° Facture</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Patient</th>
                    <th className="py-3 px-4 font-semibold">Demande d'Examen Labo</th>
                    <th className="py-3 px-4 font-semibold">Total Net</th>
                    <th className="py-3 px-4 font-semibold">Payé</th>
                    <th className="py-3 px-4 font-semibold">Reste Dû</th>
                    <th className="py-3 px-4 font-semibold">Statut</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Aucune facture trouvée.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map(inv => {
                      const hasOrder = Boolean(inv.orderNumber && inv.orderNumber !== '');
                      const linkedOrder = orders.find(o => o.id === inv.orderId || o.orderNumber === inv.orderNumber);

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-blue-600">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{formatDate(inv.invoiceDate)}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{inv.patientName}</div>
                            <div className="text-[10px] text-slate-400">{inv.patientNumber}</div>
                          </td>
                          <td className="py-3 px-4">
                            {hasOrder ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {inv.orderNumber}
                                </span>
                                {linkedOrder && (
                                  <StatusBadge status={linkedOrder.status} size="sm" />
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <Clock className="h-3 w-3 text-amber-600" />
                                En attente validation
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(inv.total)}</td>
                          <td className="py-3 px-4 font-semibold text-emerald-600">{formatCurrency(inv.paidAmount)}</td>
                          <td className="py-3 px-4 font-semibold text-rose-600">
                            {inv.balance > 0 ? formatCurrency(inv.balance) : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={inv.status} size="sm" />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Unlock order action */}
                              {(!hasOrder || inv.status === 'UNPAID') && canManageFinances() && (
                                <button
                                  onClick={() => handleValidateExistingInvoice(inv.id)}
                                  title="Valider Facture & Transmettre Demande au Labo"
                                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs transition-colors flex items-center gap-1 shrink-0"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Valider & Débloquer Labo
                                </button>
                              )}

                              {inv.balance > 0 && inv.status !== 'CANCELLED' && canManageFinances() && (
                                <button
                                  onClick={() => handleOpenPayModal(inv)}
                                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs transition-colors flex items-center gap-1 shrink-0"
                                >
                                  <CreditCard className="h-3.5 w-3.5" />
                                  Encaisser
                                </button>
                              )}

                              <button
                                onClick={() => handleSendReceiptWhatsApp(inv)}
                                title="Envoyer reçu WhatsApp"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <Send className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                title="Voir facture & ticket de caisse"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CAISSE & JOURNAL DES RÈGLEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Cash Summary Cards by Payment Method */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Encaissé Valide</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{formatCurrency(totalValidPayments)}</span>
              <span className="text-[10px] text-emerald-600 font-medium">✓ {validPayments.length} transactions</span>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 shadow-2xs">
              <span className="text-[10px] text-sky-700 uppercase font-bold block">Wave Mobile Money</span>
              <span className="text-base font-extrabold text-sky-900 mt-0.5 block">{formatCurrency(waveTotal)}</span>
              <span className="text-[10px] text-sky-700 font-medium">{validPayments.filter(p => p.method === 'WAVE').length} paiements</span>
            </div>

            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 shadow-2xs">
              <span className="text-[10px] text-orange-700 uppercase font-bold block">Orange Money</span>
              <span className="text-base font-extrabold text-orange-900 mt-0.5 block">{formatCurrency(omTotal)}</span>
              <span className="text-[10px] text-orange-700 font-medium">{validPayments.filter(p => p.method === 'ORANGE_MONEY').length} paiements</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">Espèces (Tiroir Caisse)</span>
              <span className="text-base font-extrabold text-emerald-900 mt-0.5 block">{formatCurrency(cashTotal)}</span>
              <span className="text-[10px] text-emerald-700 font-medium">{validPayments.filter(p => p.method === 'ESPECES').length} paiements</span>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 shadow-2xs">
              <span className="text-[10px] text-purple-700 uppercase font-bold block">Cartes & Autres</span>
              <span className="text-base font-extrabold text-purple-900 mt-0.5 block">{formatCurrency(cardTotal + othersTotal)}</span>
              <span className="text-[10px] text-purple-700 font-medium">CB, Chèques, Virements</span>
            </div>
          </div>

          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={paymentSearch}
                onChange={e => setPaymentSearch(e.target.value)}
                placeholder="Rechercher par N° reçu (PAY-...), N° facture, patient, référence..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={paymentMethodFilter}
              onChange={e => setPaymentMethodFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Tous les modes de règlement</option>
              <option value="WAVE">Wave Mobile Money</option>
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="ESPECES">Espèces</option>
              <option value="CARTE_BANCAIRE">Carte Bancaire</option>
              <option value="VIREMENT">Virement</option>
              <option value="CHEQUE">Chèque</option>
            </select>
          </div>

          {/* Payments Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">N° Reçu Caisse</th>
                    <th className="py-3 px-4 font-semibold">N° Facture</th>
                    <th className="py-3 px-4 font-semibold">Patient</th>
                    <th className="py-3 px-4 font-semibold">Montant</th>
                    <th className="py-3 px-4 font-semibold">Moyen de Règlement</th>
                    <th className="py-3 px-4 font-semibold">Réf Transaction</th>
                    <th className="py-3 px-4 font-semibold">Date & Heure</th>
                    <th className="py-3 px-4 font-semibold">Opérateur Caisse</th>
                    <th className="py-3 px-4 font-semibold">Statut</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        Aucun paiement enregistré dans le journal de caisse.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{p.paymentNumber}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{p.invoiceNumber}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{p.patientName}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                              p.method === 'WAVE'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : p.method === 'ORANGE_MONEY'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : p.method === 'ESPECES'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.method}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{p.reference || '-'}</td>
                        <td className="py-3 px-4 text-slate-500">{formatDateTime(p.paymentDate)}</td>
                        <td className="py-3 px-4 text-slate-600">{p.receivedBy}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={p.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPrintingPayment(p)}
                              title="Imprimer ticket de caisse thermique (80mm)"
                              className="rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Printer className="h-3.5 w-3.5 text-blue-600" />
                              <span>Ticket</span>
                            </button>

                            {p.status === 'VALID' && canManageFinances() && (
                              <button
                                onClick={() => setCancellingPayment(p)}
                                className="rounded px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                Annuler
                              </button>
                            )}

                            {p.status === 'CANCELLED' && (
                              <span className="text-[10px] text-slate-400 italic">Annulé</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SYNTHÈSE & POINT DE CAISSE */}
      {/* ========================================================================= */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase block">Chiffre d'Affaires Facturé</span>
              <div className="text-2xl font-black text-slate-900">{formatCurrency(totalInvoiced)}</div>
              <p className="text-[11px] text-slate-500">{invoices.length} factures émises</p>
            </div>

            <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
              <span className="text-xs text-emerald-800 font-semibold uppercase block">Total Encaissé Réel</span>
              <div className="text-2xl font-black text-emerald-700">{formatCurrency(totalPaid)}</div>
              <p className="text-[11px] text-emerald-700 font-medium">Encaissé au comptoir</p>
            </div>

            <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 shadow-xs space-y-1">
              <span className="text-xs text-rose-800 font-semibold uppercase block">Reste à Recouvrer (Créances)</span>
              <div className="text-2xl font-black text-rose-700">{formatCurrency(totalBalanceDue)}</div>
              <p className="text-[11px] text-rose-700 font-medium">Patients & Prises en charge IPM</p>
            </div>

            <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 shadow-xs space-y-1">
              <span className="text-xs text-blue-800 font-semibold uppercase block">Taux de Recouvrement</span>
              <div className="text-2xl font-black text-blue-700">{recoveryRate}%</div>
              <p className="text-[11px] text-blue-700 font-medium">Ratio encaissements / facturation</p>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Répartition des Encaissements par Canal</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sky-900">Wave Mobile</span>
                  <span className="font-bold text-sky-700">{formatCurrency(waveTotal)}</span>
                </div>
                <div className="w-full bg-sky-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-600 h-full rounded-full"
                    style={{ width: `${totalValidPayments > 0 ? (waveTotal / totalValidPayments) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-orange-900">Orange Money</span>
                  <span className="font-bold text-orange-700">{formatCurrency(omTotal)}</span>
                </div>
                <div className="w-full bg-orange-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full"
                    style={{ width: `${totalValidPayments > 0 ? (omTotal / totalValidPayments) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900">Espèces Caisse</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(cashTotal)}</span>
                </div>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${totalValidPayments > 0 ? (cashTotal / totalValidPayments) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-purple-900">Cartes / Virements</span>
                  <span className="font-bold text-purple-700">{formatCurrency(cardTotal + othersTotal)}</span>
                </div>
                <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${totalValidPayments > 0 ? ((cardTotal + othersTotal) / totalValidPayments) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Workflow Step 1 Modal: Nouvelle Facturation d'Examen */}
      <Modal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        title="Nouvelle Facturation d'Examen Médical"
        subtitle="Étape 1 du workflow : Établir la facture au comptoir pour générer la demande technique"
        maxWidth="4xl"
      >
        <form onSubmit={handleCreateBilling} className="space-y-5 text-xs">
          {/* Header Workflow Note */}
          <div className="flex items-center gap-2 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              La facturation validée ou encaissée sera automatiquement transmise au laboratoire avec le statut <strong>"En attente d'accusé de réception"</strong> par le technicien de garde.
            </span>
          </div>

          {/* Patient Selection with Live Search (Recherche Patient) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 text-xs">
                Patient à Facturer <span className="text-rose-500">*</span>
              </label>
              {selectedBillingPatient && !isChangingPatient && (
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPatient(true);
                    setBillingPatientSearch('');
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  Changer / Rechercher un autre patient
                </button>
              )}
            </div>

            {selectedBillingPatient && !isChangingPatient ? (
              /* Selected Patient Card */
              <div className="rounded-xl border border-blue-200 bg-linear-to-r from-blue-50/80 via-sky-50/50 to-white p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">
                    {selectedBillingPatient.firstName.charAt(0)}{selectedBillingPatient.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {selectedBillingPatient.firstName} {selectedBillingPatient.lastName}
                      </span>
                      <span className="rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold px-1.5 py-0.5">
                        {selectedBillingPatient.patientNumber}
                      </span>
                      <span className="rounded bg-slate-100 text-slate-700 text-[10px] font-medium px-1.5 py-0.5">
                        {selectedBillingPatient.gender === 'M' ? 'Homme' : 'Femme'}, {selectedBillingPatient.age} ans
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 mt-1">
                      <span>Tél : <strong className="text-slate-800">{selectedBillingPatient.phone}</strong></span>
                      {selectedBillingPatient.bloodGroup && (
                        <>
                          <span>•</span>
                          <span>Groupe : <strong className="text-rose-700 font-bold">{selectedBillingPatient.bloodGroup}</strong></span>
                        </>
                      )}
                      {selectedBillingPatient.city && (
                        <>
                          <span>•</span>
                          <span>{selectedBillingPatient.city}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPatient(true);
                    setBillingPatientSearch('');
                  }}
                  className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  Rechercher un autre
                </button>
              </div>
            ) : (
              /* Live Search Patient Input and Dropdown */
              <div className="rounded-xl border border-slate-300 bg-white p-3 shadow-2xs space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={billingPatientSearch}
                    onChange={e => setBillingPatientSearch(e.target.value)}
                    placeholder="Tapez le nom, prénom, N° dossier (PAT-...) ou numéro de téléphone pour rechercher..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-xs focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                  {billingPatientSearch && (
                    <button
                      type="button"
                      onClick={() => setBillingPatientSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Patient Results List */}
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-100">
                  {filteredBillingPatients.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Aucun patient trouvé pour "{billingPatientSearch}".
                    </div>
                  ) : (
                    filteredBillingPatients.map(p => {
                      const isCurrent = p.id === billingPatientId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setBillingPatientId(p.id);
                            setIsChangingPatient(false);
                            setBillingPatientSearch('');
                          }}
                          className={`p-2.5 flex items-center justify-between gap-2 hover:bg-blue-50/70 cursor-pointer transition-colors ${
                            isCurrent ? 'bg-blue-50/90 font-semibold' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                              {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs text-slate-900 font-bold flex items-center gap-1.5">
                                <span>{p.firstName} {p.lastName}</span>
                                <span className="font-mono text-[10px] text-blue-600 font-semibold bg-blue-100/60 px-1.5 py-0.2 rounded">
                                  {p.patientNumber}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Tél : {p.phone} • {p.age} ans ({p.gender === 'M' ? 'H' : 'F'})
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs cursor-pointer"
                          >
                            Sélectionner
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedBillingPatient && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsChangingPatient(false)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                    >
                      Conserver le patient sélectionné ({selectedBillingPatient.firstName} {selectedBillingPatient.lastName})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Doctor & Coverage Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Médecin Prescripteur</label>
              <select
                value={billingDoctorId}
                onChange={e => setBillingDoctorId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="">Prescription directe au laboratoire</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.firstName} {d.lastName} ({d.specialty} - {d.facility})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prise en charge / IPM / Mutuelle</label>
              <select
                value={billingContractId}
                onChange={e => setBillingContractId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="">Aucune (Particulier 100%)</option>
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type}) — Remise {c.discount}% (PEC {c.coveragePercentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Medical Tests Selection Grid with Live Search & Category Filter */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <FlaskConical className="h-4 w-4 text-blue-600" />
                  Sélection des Analyses Médicales à Facturer ({billingTestIds.length} sélectionnée(s)) <span className="text-rose-500">*</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Recherchez et cochez les examens prescrits pour ce patient
                </p>
              </div>

              <div className="flex items-center gap-2">
                {filteredBillingTests.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const idsToAdd = filteredBillingTests.map(t => t.id);
                      setBillingTestIds(Array.from(new Set([...billingTestIds, ...idsToAdd])));
                    }}
                    className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Tout cocher ({filteredBillingTests.length})
                  </button>
                )}
                {billingTestIds.length > 0 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setBillingTestIds([])}
                      className="text-[11px] text-rose-600 font-semibold hover:underline cursor-pointer"
                    >
                      Désélectionner tout
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Search & Category Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={billingTestSearch}
                  onChange={e => setBillingTestSearch(e.target.value)}
                  placeholder="Rechercher une analyse par nom (ex: NFS, Glycémie...), code (GLU, CRP...), tube..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-8 text-xs focus:border-blue-500 focus:outline-none"
                />
                {billingTestSearch && (
                  <button
                    type="button"
                    onClick={() => setBillingTestSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {['ALL', 'Hématologie', 'Biochimie', 'Sérologie', 'Microbiologie', 'Parasitologie'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBillingTestCategoryFilter(cat)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      billingTestCategoryFilter === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'ALL' ? 'Tous' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Fast Packs (Bilans & Profils Rapides) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Layers className="h-3 w-3 text-purple-600" />
                Packs rapides :
              </span>
              {testGroups.map(g => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => addGroupTests(g.id)}
                  className="rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 transition-colors cursor-pointer"
                >
                  + {g.name} ({g.testIds.length} examens)
                </button>
              ))}
            </div>

            {/* Selected Tests Chips Bar */}
            {billingTestIds.length > 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-900">
                    Analyses sélectionnées ({billingTestIds.length}) :
                  </span>
                  <span className="font-bold text-blue-700">
                    Sous-total : {formatCurrency(calculatedSubtotal)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {billingTestIds.map(id => {
                    const t = tests.find(x => x.id === id);
                    if (!t) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-md bg-white border border-blue-300 px-2 py-0.5 text-[11px] font-medium text-slate-800 shadow-2xs"
                      >
                        <span className="font-mono text-blue-600 font-bold text-[10px]">{t.code}</span>
                        <span>{t.name}</span>
                        <span className="text-slate-400 font-semibold">({formatCurrency(t.price)})</span>
                        <button
                          type="button"
                          onClick={() => toggleTest(id)}
                          className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                          title="Retirer cette analyse"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Medical Tests Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/40">
              {filteredBillingTests.length === 0 ? (
                <div className="col-span-full py-6 text-center text-xs text-slate-400 italic">
                  Aucune analyse médicale ne correspond à votre recherche "{billingTestSearch}".
                </div>
              ) : (
                filteredBillingTests.map(t => {
                  const isSelected = billingTestIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTest(t.id)}
                      className={`cursor-pointer rounded-xl border p-2.5 flex items-start justify-between gap-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/90 font-bold text-blue-950 shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white hover:border-blue-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs leading-snug">{t.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-blue-600 font-bold">{t.code}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{t.category}</span>
                          </div>
                          {t.container && (
                            <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                              Tube : {t.container}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-bold text-slate-900 shrink-0">
                        {formatCurrency(t.price)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Priority & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Degré de Priorité Clinique</label>
              <select
                value={billingPriority}
                onChange={e => setBillingPriority(e.target.value as OrderPriority)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="ROUTINE">Routine (Normal)</option>
                <option value="URGENT">🚨 URGENT (Priorité laboratoire)</option>
                <option value="STAT">⚡ STAT (Urgence Vitale Immédiate)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notes / Renseignements cliniques</label>
              <input
                type="text"
                value={billingNotes}
                onChange={e => setBillingNotes(e.target.value)}
                placeholder="Ex: Patient à jeun, suspicion infection, réanimation..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Billing & Settlement Options */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
              <div>
                <span className="text-slate-500">Sous-total brut :</span>{' '}
                <strong>{formatCurrency(calculatedSubtotal)}</strong>
                {effectiveDiscount > 0 && (
                  <span className="text-emerald-700 ml-2">
                    (Remise : -{formatCurrency(effectiveDiscount)})
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-600 font-medium">Net à Facturer :</span>
                <span className="text-base font-extrabold text-blue-900 ml-2">
                  {formatCurrency(calculatedTotal)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Modalité de Règlement</label>
                <select
                  value={billingPaymentType}
                  onChange={e => setBillingPaymentType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="TOTAL">Règlement Intégral Immédiat (100%)</option>
                  <option value="PARTIAL">Acompte Partiel</option>
                  <option value="PEC">Prise en charge IPM / Facturation Tiers</option>
                </select>
              </div>

              {billingPaymentType === 'PARTIAL' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant Acompte (FCFA)</label>
                  <input
                    type="number"
                    min={1}
                    max={calculatedTotal}
                    value={billingPartialAmount}
                    onChange={e => setBillingPartialAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
              )}

              {billingPaymentType !== 'PEC' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Moyen de Paiement</label>
                  <select
                    value={billingPaymentMethod}
                    onChange={e => setBillingPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="WAVE">Wave Mobile Money</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="ESPECES">Espèces (Caisse)</option>
                    <option value="CARTE_BANCAIRE">Carte Bancaire</option>
                    <option value="CHEQUE">Chèque</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Réf Transaction (Optionnel)</label>
                <input
                  type="text"
                  value={billingPaymentRef}
                  onChange={e => setBillingPaymentRef(e.target.value)}
                  placeholder="Code Wave / OM..."
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Validation Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="validateImmediately"
                checked={billingValidateImmediately}
                onChange={e => setBillingValidateImmediately(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="validateImmediately" className="text-xs font-medium text-slate-700 cursor-pointer">
                <strong>Valider la facturation immédiatement</strong> et créer la demande d'examen technique (recommandé pour déclencher le travail du technicien).
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBillingModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md active:scale-95 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              Établir Facturation & Transmettre Demande
            </button>
          </div>
        </form>
      </Modal>

      {/* Workflow Success Modal */}
      {workflowSuccessData && (
        <Modal
          isOpen={!!workflowSuccessData}
          onClose={() => setWorkflowSuccessData(null)}
          title="Facturation Établie et Demande Débloquée"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-center py-2">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800">
                Facture {workflowSuccessData.invoice.invoiceNumber} Validée
              </h3>
              <p className="text-slate-500 mt-1">
                Le workflow a bien été respecté. La demande d'examen a été générée pour le laboratoire.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient :</span>
                <span className="font-bold text-slate-800">{workflowSuccessData.invoice.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Montant total :</span>
                <span className="font-bold text-slate-900">{formatCurrency(workflowSuccessData.invoice.total)}</span>
              </div>
              {workflowSuccessData.orderNumber && (
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-blue-700 font-semibold">Demande d'examen générée :</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {workflowSuccessData.orderNumber}
                  </span>
                </div>
              )}
              <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                ⏳ Statut : <strong>En attente d'accusé de réception</strong> par le technicien pour débuter les analyses.
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWorkflowSuccessData(null)}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
              >
                Terminer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Facture Officielle ${selectedInvoice.invoiceNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <p className="font-bold text-slate-900 text-sm">{settings.name}</p>
                <p className="text-slate-500">{settings.address} — {settings.city}</p>
                <p className="text-slate-500">{settings.taxNumber}</p>
              </div>
              <div className="sm:text-right">
                <span className="font-mono font-bold text-blue-700 text-sm">{selectedInvoice.invoiceNumber}</span>
                <p className="text-slate-500">Date : {formatDate(selectedInvoice.invoiceDate)}</p>
                <StatusBadge status={selectedInvoice.status} size="sm" />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Facturé à :</span>
                <p className="font-bold text-slate-800 text-sm">{selectedInvoice.patientName}</p>
                <p className="text-slate-600">N° Patient : {selectedInvoice.patientNumber}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Réf Demande Labo :</span>
                <p className="font-mono font-bold text-blue-700">{selectedInvoice.orderNumber || 'En attente validation'}</p>
                <p className="text-slate-500">Opérateur : {selectedInvoice.createdBy}</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Montant Total Facturé :</span>
                <div className="text-lg font-black text-blue-900">{formatCurrency(selectedInvoice.total)}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Total Encaissé :</span>
                <div className="font-bold text-emerald-700">{formatCurrency(selectedInvoice.paidAmount)}</div>
                {selectedInvoice.balance > 0 && (
                  <span className="text-rose-600 font-bold block text-xs">
                    Reste à payer : {formatCurrency(selectedInvoice.balance)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimer Facture
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Payment Entry Modal */}
      {payingInvoice && (
        <Modal
          isOpen={!!payingInvoice}
          onClose={() => setPayingInvoice(null)}
          title={`Encaisser un Paiement — Facture ${payingInvoice.invoiceNumber}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <p>
                Patient : <strong>{payingInvoice.patientName}</strong>
              </p>
              <p>
                Reste à régler : <strong className="text-rose-600 text-sm">{formatCurrency(payingInvoice.balance)}</strong>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Montant à encaisser (FCFA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={payingInvoice.balance}
                value={paymentAmount}
                onChange={e => setPaymentAmount(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Moyen de paiement</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="WAVE">Wave Mobile Money</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="ESPECES">Espèces (Caisse)</option>
                <option value="CARTE_BANCAIRE">Carte Bancaire</option>
                <option value="VIREMENT">Virement bancaire</option>
                <option value="CHEQUE">Chèque</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Référence transaction (Optionnel)</label>
              <input
                type="text"
                value={paymentRef}
                onChange={e => setPaymentRef(e.target.value)}
                placeholder="Ex: WAVE-SN-98234, Code OM..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
              >
                Enregistrer l'encaissement
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Payment Cancellation Dialog */}
      <ConfirmDialog
        isOpen={!!cancellingPayment}
        title="Annulation de Paiement (Règle Caisse)"
        message={`Confirmez-vous l'annulation du paiement ${cancellingPayment?.paymentNumber} d'un montant de ${cancellingPayment ? formatCurrency(cancellingPayment.amount) : ''} pour le patient ${cancellingPayment?.patientName} ? Cette opération réajustera le solde de la facture ${cancellingPayment?.invoiceNumber} et sera enregistrée dans les journaux d'audit.`}
        confirmLabel="Annuler ce paiement"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Préciser le motif obligatoire : Erreur de saisie, remboursement patient..."
        onConfirm={handleConfirmCancelPayment}
        onCancel={() => setCancellingPayment(null)}
      />

      {/* Thermal Receipt Print Modal */}
      {printingPayment && (
        <Modal
          isOpen={!!printingPayment}
          onClose={() => setPrintingPayment(null)}
          title={`Ticket de Caisse — ${printingPayment.paymentNumber}`}
          subtitle={`Facture : ${printingPayment.invoiceNumber} • Patient : ${printingPayment.patientName}`}
          maxWidth="md"
        >
          <div className="py-2 space-y-4">
            <ThermalReceipt
              payment={printingPayment}
              invoice={invoices.find(i => i.id === printingPayment.invoiceId)}
              settings={settings}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
