import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  User,
  Stethoscope,
  Building,
  DollarSign,
  Receipt,
  TestTube2,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  Trash2,
  Check,
  X,
  FlaskConical,
  Layers
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { Order, OrderPriority, PaymentMethod, MedicalReport } from '../../../types/index.ts';
import { Modal } from '../../common/Modal.tsx';
import { formatCurrency, formatDate, formatDateTime } from '../../../services/i18n.ts';
import { StatusBadge } from '../../common/StatusBadge.tsx';

interface OrdersModuleProps {
  initialPatientId?: string;
  onNavigateToResults?: (orderId: string) => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
  onNavigateToReports?: (reportId: string) => void;
}

export const OrdersModule: React.FC<OrdersModuleProps> = ({
  initialPatientId,
  onNavigateToResults,
  onNavigateToInvoice,
  onNavigateToReports
}) => {
  const {
    orders,
    patients,
    doctors,
    tests,
    testGroups,
    contracts,
    createOrderWithWorkflow,
    acknowledgeOrder,
    invoices,
    samples,
    reports
  } = useData();

  const { canAcknowledgeOrder, canPrintReport, canCreateOrder, currentUser, currentRole } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Order Form state
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedContractId, setSelectedContractId] = useState('');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<OrderPriority>('ROUTINE');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Initial Payment checkbox & fields
  const [withPayment, setWithPayment] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WAVE');
  const [paymentRef, setPaymentRef] = useState('');

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.patientName.toLowerCase().includes(search.toLowerCase()) ||
      (o.doctorName && o.doctorName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate live total for the new order
  const calculatedSubtotal = selectedTestIds.reduce((acc, tId) => {
    const t = tests.find(item => item.id === tId);
    return acc + (t?.price || 0);
  }, 0);

  const selectedContract = contracts.find(c => c.id === selectedContractId);
  const contractDiscount = selectedContract ? Math.round((calculatedSubtotal * selectedContract.discount) / 100) : 0;
  const effectiveDiscount = discountAmount > 0 ? discountAmount : contractDiscount;
  const calculatedTotal = Math.max(0, calculatedSubtotal - effectiveDiscount);

  const toggleTest = (testId: string) => {
    if (selectedTestIds.includes(testId)) {
      setSelectedTestIds(selectedTestIds.filter(id => id !== testId));
    } else {
      setSelectedTestIds([...selectedTestIds, testId]);
    }
  };

  const addGroupTests = (groupId: string) => {
    const group = testGroups.find(g => g.id === groupId);
    if (!group) return;
    const combined = Array.from(new Set([...selectedTestIds, ...group.testIds]));
    setSelectedTestIds(combined);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Veuillez sélectionner un patient.');
      return;
    }
    if (selectedTestIds.length === 0) {
      alert('Veuillez sélectionner au moins un examen ou bilan.');
      return;
    }

    try {
      const res = await createOrderWithWorkflow({
        patientId: selectedPatientId,
        doctorId: selectedDoctorId || undefined,
        testIds: selectedTestIds,
        priority,
        discountAmount: effectiveDiscount,
        contractId: selectedContractId || undefined,
        notes,
        initialPayment: withPayment
          ? {
              amount: calculatedTotal,
              method: paymentMethod,
              reference: paymentRef.trim() || undefined
            }
          : undefined
      });

      setIsNewModalOpen(false);
      setSelectedOrder(res.order);
      // Reset form
      setSelectedTestIds([]);
      setDiscountAmount(0);
      setNotes('');
      setPaymentRef('');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la demande.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      {/* Workflow Banner */}
      <div className="rounded-2xl border border-teal-200 bg-linear-to-r from-teal-50 via-slate-50 to-blue-50 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <TestTube2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-800 text-sm">Workflow Technique & Rôles Médicaux</h4>
                <span className="rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5">Étape 2 & 3</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                La facturation validée devient une demande d'examen. Le <strong>technicien accuse réception</strong> de la demande pour commencer le travail. Le <strong>biologiste valide les examens</strong> et le rapport final. En cas d'urgence, le technicien peut valider partiellement. Le <strong>réceptionniste ou le technicien</strong> peut imprimer le rapport médical complet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canCreateOrder() && (
              <button
                onClick={() => {
                  if (patients.length > 0 && !selectedPatientId) {
                    setSelectedPatientId(patients[0].id);
                  }
                  setIsNewModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                + NOUVELLE DEMANDE
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par N° demande (ORD-...), patient, médecin..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="COMPLETED">Terminé</option>
          <option value="CANCELLED">Annulé</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">N° Demande</th>
                <th className="py-3 px-4 font-semibold">Date & Heure</th>
                <th className="py-3 px-4 font-semibold">Patient</th>
                <th className="py-3 px-4 font-semibold">Médecin Référent</th>
                <th className="py-3 px-4 font-semibold">Analyses Prescrites</th>
                <th className="py-3 px-4 font-semibold">Montant</th>
                <th className="py-3 px-4 font-semibold">Priorité</th>
                <th className="py-3 px-4 font-semibold">Statut</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Aucune demande d'analyses trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDateTime(o.orderDate)}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{o.patientName}</div>
                      <div className="text-[10px] text-slate-400">{o.patientNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{o.doctorName || 'Prescription directe'}</td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {o.items.length} analyse(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div>{formatCurrency(o.total)}</div>
                      {o.balance > 0 ? (
                        <div className="text-[10px] text-rose-500 font-normal">Reste : {formatCurrency(o.balance)}</div>
                      ) : (
                        <div className="text-[10px] text-emerald-600 font-normal">Payé intégralement</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={o.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={o.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Technician acknowledgment action */}
                        {(o.status === 'WAITING_RECEIPT' || o.status === 'PENDING') && canAcknowledgeOrder() && (
                          <button
                            onClick={() => acknowledgeOrder(o.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-teal-700 shadow-2xs transition-colors shrink-0"
                            title="Accuser réception de la demande et commencer le travail"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Accuser Réception
                          </button>
                        )}

                        {/* Print report action for completed or emergency partial reports */}
                        {(o.status === 'COMPLETED' || o.status === 'PARTIALLY_VALIDATED' || o.hasPartialReport) && canPrintReport() && (
                          <button
                            onClick={() => {
                              const rep = reports.find(r => r.orderId === o.id);
                              if (rep && onNavigateToReports) {
                                onNavigateToReports(rep.id);
                              } else {
                                setSelectedOrder(o);
                              }
                            }}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors shrink-0 ${
                              o.status === 'PARTIALLY_VALIDATED' || o.hasPartialReport
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                            }`}
                            title={
                              o.status === 'PARTIALLY_VALIDATED' || o.hasPartialReport
                                ? "Imprimer Rapport Partiel d'Urgence"
                                : "Imprimer Rapport Médical Complet"
                            }
                          >
                            <Printer className="h-3.5 w-3.5" />
                            {o.status === 'PARTIALLY_VALIDATED' || o.hasPartialReport ? 'Rapport Partiel' : 'Imprimer Rapport'}
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 text-blue-600" />
                          Détails
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Détail de la Demande ${selectedOrder.orderNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Technician acknowledgment prompt if WAITING_RECEIPT */}
            {selectedOrder.status === 'WAITING_RECEIPT' && canAcknowledgeOrder() && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-teal-900 text-xs">Demande en attente de prise en charge laboratoire</h5>
                  <p className="text-teal-700 text-[11px] mt-0.5">
                    Le technicien doit accuser réception de la demande pour valider l'arrivée des échantillons et démarrer les analyses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    acknowledgeOrder(selectedOrder.id);
                    setSelectedOrder({
                      ...selectedOrder,
                      status: 'IN_PROGRESS',
                      acknowledgedBy: currentUser?.name || 'Technicien Supérieur de Labo',
                      acknowledgedAt: new Date().toISOString()
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 font-bold text-white text-xs hover:bg-teal-700 shadow-sm shrink-0 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accuser Réception & Démarrer le Travail
                </button>
              </div>
            )}

            {/* Acknowledgment Stamp */}
            {selectedOrder.acknowledgedBy && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-[11px] font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Prise en charge validée par le technicien <strong>{selectedOrder.acknowledgedBy}</strong> le {formatDateTime(selectedOrder.acknowledgedAt || '')}.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block">Patient :</span>
                <span className="font-bold text-slate-800 text-sm">{selectedOrder.patientName}</span>
                <span className="block text-[10px] text-slate-500 font-mono">{selectedOrder.patientNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Prescripteur :</span>
                <span className="font-semibold text-slate-800">{selectedOrder.doctorName || 'Direct (Sans ordonnance)'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Statut Demande :</span>
                <StatusBadge status={selectedOrder.status} size="sm" />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                Examens prescrits ({selectedOrder.items.length})
              </h4>
              <div className="rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {selectedOrder.items.map(it => (
                  <div key={it.id} className="p-2.5 flex items-center justify-between bg-white">
                    <div>
                      <span className="font-semibold text-slate-800">{it.testName}</span>
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500">
                        {it.category}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700">{formatCurrency(it.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500">Total Facturé :</span>
                <div className="text-base font-extrabold text-blue-900">{formatCurrency(selectedOrder.total)}</div>
                {selectedOrder.invoiceNumber && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Facture : {selectedOrder.invoiceNumber}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-500">Montant payé :</span>
                <div className="font-bold text-emerald-700">{formatCurrency(selectedOrder.paidAmount)}</div>
                {selectedOrder.balance > 0 && (
                  <span className="text-[10px] text-rose-600 font-bold block">
                    Solde dû : {formatCurrency(selectedOrder.balance)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {onNavigateToResults && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedOrder.id;
                      setSelectedOrder(null);
                      onNavigateToResults(id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <TestTube2 className="h-3.5 w-3.5 text-blue-600" />
                    Voir Analyses & Résultats
                  </button>
                )}

                {/* Print medical report button for Receptionist & Technician */}
                {(selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'PARTIALLY_VALIDATED' || selectedOrder.hasPartialReport) && canPrintReport() && (
                  <button
                    type="button"
                    onClick={() => {
                      const rep = reports.find(r => r.orderId === selectedOrder.id);
                      if (rep && onNavigateToReports) {
                        const repId = rep.id;
                        setSelectedOrder(null);
                        onNavigateToReports(repId);
                      } else {
                        window.print();
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-xs ${
                      selectedOrder.status === 'PARTIALLY_VALIDATED' || selectedOrder.hasPartialReport
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    {selectedOrder.status === 'PARTIALLY_VALIDATED' || selectedOrder.hasPartialReport
                      ? "Imprimer Rapport Partiel d'Urgence"
                      : "Imprimer Rapport Médical Complet"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Order Modal (Workflow Complet: Patient, Médecin, Examens, Facturation, Prélèvement, Paiement) */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Nouvelle Demande d'Analyses Médicales"
        subtitle="Création automatique de la prescription, prélèvement et facture"
        maxWidth="4xl"
      >
        <form onSubmit={handleCreateOrder} className="space-y-5 text-xs">
          {/* Step 1: Patient & Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Patient <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="">Sélectionner un patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.patientNumber}) - {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Médecin prescripteur</label>
              <select
                value={selectedDoctorId}
                onChange={e => setSelectedDoctorId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="">Prescription directe (Sans médecin)</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.firstName} {d.lastName} ({d.specialty} - {d.facility})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prise en charge / IPM / Contrat</label>
              <select
                value={selectedContractId}
                onChange={e => setSelectedContractId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="">Aucune (Paiement direct patient 100%)</option>
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type}) — Remise {c.discount}% (PEC {c.coveragePercentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Test Groups Selection (Requirement 14) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block mb-2">
              Ajout Rapide de Bilans Groupés (1 clic) :
            </span>
            <div className="flex flex-wrap gap-2">
              {testGroups.map(grp => (
                <button
                  type="button"
                  key={grp.id}
                  onClick={() => addGroupTests(grp.id)}
                  className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-purple-700 font-semibold hover:bg-purple-100 transition-colors"
                >
                  + {grp.name} ({formatCurrency(grp.discountedPrice || 0)})
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Individual Tests Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Sélectionnez les examens à réaliser ({selectedTestIds.length} sélectionné(s)) :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-2 border border-slate-200 rounded-xl">
              {tests.map(t => {
                const isChecked = selectedTestIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTest(t.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate font-medium">{t.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {t.code} • {t.category}
                      </div>
                    </div>
                    <span className="font-bold shrink-0">{formatCurrency(t.price)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Degré d'urgence</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as OrderPriority)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="ROUTINE">Routine (Normal)</option>
                <option value="URGENT">Urgent (Prioritaire)</option>
                <option value="STAT">STAT (Urgence Vitale Immédiate)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Renseignements cliniques</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Patient à jeun, contrôle diabète, bilan pré-op..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Financial summary */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-slate-400 text-[11px]">Sous-total : {formatCurrency(calculatedSubtotal)}</div>
              {effectiveDiscount > 0 && (
                <div className="text-emerald-400 text-[11px]">Remise appliquée : -{formatCurrency(effectiveDiscount)}</div>
              )}
              <div className="text-lg font-black text-white">Total Net : {formatCurrency(calculatedTotal)}</div>
            </div>

            {/* Payment Checkbox & Method */}
            <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withPayment}
                  onChange={e => setWithPayment(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="font-semibold text-slate-200">Encaisser le paiement immédiatement</span>
              </label>

              {withPayment && (
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-slate-200 text-xs"
                  >
                    <option value="WAVE">Wave Mobile Money</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="ESPECES">Espèces (Caisse)</option>
                    <option value="CARTE_BANCAIRE">Carte Bancaire</option>
                    <option value="VIREMENT">Virement bancaire</option>
                  </select>

                  <input
                    type="text"
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    placeholder="Réf TransID..."
                    className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-slate-200 text-xs w-28"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md"
            >
              Valider la Demande et Générer le Workflow
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
