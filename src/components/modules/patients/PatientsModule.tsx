import React, { useState } from 'react';
import {
  User,
  Plus,
  Search,
  Phone,
  Calendar,
  MapPin,
  FileSpreadsheet,
  Receipt,
  FileText,
  Clock,
  Printer,
  Edit2,
  Trash2,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { Patient, Gender } from '../../../types/index.ts';
import { Modal } from '../../common/Modal.tsx';
import { formatCurrency, formatDate } from '../../../services/i18n.ts';
import { StatusBadge } from '../../common/StatusBadge.tsx';

interface PatientsModuleProps {
  initialPatientId?: string;
  onNavigateToOrder?: (patientId: string) => void;
  onNavigateToSearch?: () => void;
}

export const PatientsModule: React.FC<PatientsModuleProps> = ({
  initialPatientId,
  onNavigateToOrder,
  onNavigateToSearch
}) => {
  const { patients, orders, samples, results, reports, invoices, payments, addPatient, updatePatient, deletePatient } = useData();
  const { canManagePatients, canCreateOrder, canDeleteData } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [activePatient, setActivePatient] = useState<Patient | null>(
    initialPatientId ? patients.find(p => p.id === initialPatientId) || null : null
  );
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'INFO' | 'DEMANDES' | 'RESULTATS' | 'FACTURES' | 'HISTORIQUE'>('INFO');

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'M' as Gender,
    dateOfBirth: '1990-01-01',
    phone: '+221 ',
    whatsapp: '+221 ',
    email: '',
    address: '',
    city: 'Dakar',
    country: 'Sénégal',
    emergencyContact: '',
    bloodGroup: 'O+',
    notes: ''
  });

  const filteredPatients = patients.filter(p => {
    const q = searchTerm.trim().toLowerCase();
    const qCleanPhone = q.replace(/[^0-9]/g, '');
    const pCleanPhone = p.phone.replace(/[^0-9]/g, '');
    const pCleanWhatsapp = p.whatsapp ? p.whatsapp.replace(/[^0-9]/g, '') : '';
    const fullName1 = `${p.firstName} ${p.lastName}`.toLowerCase();
    const fullName2 = `${p.lastName} ${p.firstName}`.toLowerCase();

    const matchesSearch =
      !q ||
      fullName1.includes(q) ||
      fullName2.includes(q) ||
      p.patientNumber.toLowerCase().includes(q) ||
      (p.nationalId && p.nationalId.toLowerCase().includes(q)) ||
      (qCleanPhone && (pCleanPhone.includes(qCleanPhone) || pCleanWhatsapp.includes(qCleanPhone))) ||
      p.city.toLowerCase().includes(q);
    const matchesGender = selectedGender === 'ALL' || p.gender === selectedGender;
    return matchesSearch && matchesGender;
  });

  const handleOpenNew = () => {
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'M',
      dateOfBirth: '1990-01-01',
      phone: '+221 77 ',
      whatsapp: '+221 77 ',
      email: '',
      address: '',
      city: 'Dakar',
      country: 'Sénégal',
      emergencyContact: '',
      bloodGroup: 'O+',
      notes: ''
    });
    setIsNewModalOpen(true);
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      alert('Veuillez remplir au minimum le nom, le prénom et le numéro de téléphone.');
      return;
    }

    const created = addPatient({
      ...formData,
      whatsapp: formData.whatsapp.trim() || formData.phone.trim()
    });

    setIsNewModalOpen(false);
    setActivePatient(created);
  };

  const handleOpenEdit = (p: Patient) => {
    setFormData({
      firstName: p.firstName,
      lastName: p.lastName,
      gender: p.gender,
      dateOfBirth: p.dateOfBirth,
      phone: p.phone,
      whatsapp: p.whatsapp,
      email: p.email || '',
      address: p.address,
      city: p.city,
      country: p.country,
      emergencyContact: p.emergencyContact || '',
      bloodGroup: p.bloodGroup || 'O+',
      notes: p.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    updatePatient(activePatient.id, formData);
    setActivePatient({ ...activePatient, ...formData });
    setIsEditModalOpen(false);
  };

  // Associated patient records
  const patientOrders = activePatient ? orders.filter(o => o.patientId === activePatient.id) : [];
  const patientResults = activePatient ? results.filter(r => r.patientId === activePatient.id) : [];
  const patientReports = activePatient ? reports.filter(r => r.patientId === activePatient.id) : [];
  const patientInvoices = activePatient ? invoices.filter(i => i.patientId === activePatient.id) : [];
  const patientPayments = activePatient ? payments.filter(p => p.patientId === activePatient.id) : [];

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestion des Dossiers Patients</h2>
          <p className="text-xs text-slate-500">
            Fichiers administratifs et historiques médicaux des patients ({patients.length} enregistrés)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToSearch && (
            <button
              onClick={onNavigateToSearch}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all shadow-2xs"
            >
              <Search className="h-4 w-4" />
              Recherche Multi-critères & Antériorités
            </button>
          )}

          {canManagePatients() && (
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              + NOUVEAU PATIENT
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left List / Right Selected Patient Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Patients Table / List */}
        <div className={`${activePatient ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, tél, N° patient..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Tous les genres</option>
              <option value="M">Hommes</option>
              <option value="F">Femmes</option>
            </select>
          </div>

          {/* List items */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aucun patient trouvé avec ces critères.
              </div>
            ) : (
              filteredPatients.map(p => {
                const isSelected = activePatient?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActivePatient(p)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                        {p.gender === 'F' ? '♀' : '♂'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600">
                            {p.patientNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{p.phone}</span>
                          <span>•</span>
                          <span>{p.city}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setActivePatient(p);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Patient File / Dossier (Requirement 5) */}
        {activePatient && (
          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white shadow-md p-5 space-y-5">
            {/* Dossier Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-base">
                  {activePatient.firstName[0]}
                  {activePatient.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {activePatient.firstName} {activePatient.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-mono font-semibold text-blue-600">{activePatient.patientNumber}</span>
                    <span>•</span>
                    <span>Groupe : {activePatient.bloodGroup || 'Non renseigné'}</span>
                    <span>•</span>
                    <span>Né(e) le {formatDate(activePatient.dateOfBirth)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToOrder && canCreateOrder() && (
                  <button
                    onClick={() => onNavigateToOrder(activePatient.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nouvelle Demande
                  </button>
                )}
                {canManagePatients() && (
                  <button
                    onClick={() => handleOpenEdit(activePatient)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                    title="Modifier dossier"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                {canDeleteData() && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Êtes-vous sûr de vouloir supprimer définitivement le patient ${activePatient.firstName} ${activePatient.lastName} ? Cette action administrative est irréversible.`
                        )
                      ) {
                        deletePatient(activePatient.id);
                        setActivePatient(null);
                      }
                    }}
                    className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                    title="Supprimer dossier (Administrateur)"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Dossier Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-semibold gap-4 overflow-x-auto">
              {(['INFO', 'DEMANDES', 'RESULTATS', 'FACTURES', 'HISTORIQUE'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'INFO' && 'Identité & Contact'}
                  {tab === 'DEMANDES' && `Demandes (${patientOrders.length})`}
                  {tab === 'RESULTATS' && `Résultats & Rapports (${patientReports.length})`}
                  {tab === 'FACTURES' && `Factures (${patientInvoices.length})`}
                  {tab === 'HISTORIQUE' && 'Chronologie Médicale'}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'INFO' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 space-y-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Coordonnées & Contact
                  </span>
                  <div>
                    <span className="text-slate-400">Téléphone :</span>
                    <p className="font-semibold text-slate-800">{activePatient.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">WhatsApp :</span>
                    <p className="font-semibold text-emerald-600">{activePatient.whatsapp || activePatient.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Email :</span>
                    <p className="font-semibold text-slate-800">{activePatient.email || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Adresse :</span>
                    <p className="font-semibold text-slate-800">
                      {activePatient.address}, {activePatient.city} ({activePatient.country})
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 space-y-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Données Médicales & Urgence
                  </span>
                  <div>
                    <span className="text-slate-400">Contact d'urgence :</span>
                    <p className="font-semibold text-slate-800">{activePatient.emergencyContact || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Groupe Sanguin / Rhésus :</span>
                    <p className="font-semibold text-rose-600">{activePatient.bloodGroup || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Notes & Antécédents :</span>
                    <p className="text-slate-700 italic">{activePatient.notes || 'Aucune note particulière.'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Créé le :</span>
                    <p className="text-slate-600">{formatDate(activePatient.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'DEMANDES' && (
              <div className="space-y-3">
                {patientOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Aucune demande enregistrée.</p>
                ) : (
                  patientOrders.map(o => (
                    <div key={o.id} className="rounded-lg border border-slate-200 p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600">{o.orderNumber}</span>
                        <StatusBadge status={o.status} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Date : {formatDate(o.orderDate)}</span>
                        <span>Prescripteur : {o.doctorName || 'Direct'}</span>
                        <span className="font-bold text-slate-800">{formatCurrency(o.total)}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                        {o.items.map(it => it.testName).join(', ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'RESULTATS' && (
              <div className="space-y-3">
                {patientReports.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Aucun rapport validé disponible pour l'instant.</p>
                ) : (
                  patientReports.map(rp => (
                    <div key={rp.id} className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-700">{rp.reportNumber}</span>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          VALIDÉ BIOLOGISTE
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Validé par : <strong>{rp.validatedBy}</strong> le {formatDate(rp.validatedAt)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Examens inclus : {rp.testNames.join(', ')}
                      </p>
                      <div className="pt-2 flex items-center justify-between border-t border-emerald-100">
                        <span className="text-[10px] font-mono text-slate-400">Code vérif : {rp.verificationCode}</span>
                        <a
                          href={rp.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Vérifier en ligne (QR) →
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'FACTURES' && (
              <div className="space-y-3">
                {patientInvoices.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Aucune facture émise.</p>
                ) : (
                  patientInvoices.map(inv => (
                    <div key={inv.id} className="rounded-lg border border-slate-200 p-3 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</div>
                        <div className="text-slate-500 text-[11px]">{formatDate(inv.invoiceDate)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800">{formatCurrency(inv.total)}</div>
                        <StatusBadge status={inv.status} size="sm" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'HISTORIQUE' && (
              <div className="relative pl-4 border-l-2 border-blue-200 space-y-4 text-xs">
                <div className="relative">
                  <div className="absolute -left-[21px] top-0 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-white" />
                  <p className="font-bold text-slate-800">Dossier créé au laboratoire</p>
                  <p className="text-slate-500 text-[11px]">{formatDate(activePatient.createdAt)}</p>
                </div>
                {patientOrders.map(o => (
                  <div key={o.id} className="relative">
                    <div className="absolute -left-[21px] top-0 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                    <p className="font-bold text-slate-800">Demande {o.orderNumber}</p>
                    <p className="text-slate-500 text-[11px]">
                      {formatDate(o.orderDate)} • {o.items.length} analyses prescrites • Statut : {o.status}
                    </p>
                  </div>
                ))}
                {patientReports.map(rp => (
                  <div key={rp.id} className="relative">
                    <div className="absolute -left-[21px] top-0 h-3 w-3 rounded-full bg-teal-500 ring-4 ring-white" />
                    <p className="font-bold text-slate-800">Rapport d'analyses {rp.reportNumber} validé</p>
                    <p className="text-slate-500 text-[11px]">
                      {formatDate(rp.validatedAt)} par {rp.validatedBy}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Patient Modal */}
      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="Enregistrer un Nouveau Patient" maxWidth="2xl">
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prénom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Ex: Moussa"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom de famille <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Ex: Diallo"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Genre</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="M">Masculin (Homme)</option>
                <option value="F">Féminin (Femme)</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date de naissance</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Groupe Sanguin</label>
              <select
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="O+">O Rhésus Positif (O+)</option>
                <option value="O-">O Rhésus Négatif (O-)</option>
                <option value="A+">A Rhésus Positif (A+)</option>
                <option value="A-">A Rhésus Négatif (A-)</option>
                <option value="B+">B Rhésus Positif (B+)</option>
                <option value="B-">B Rhésus Négatif (B-)</option>
                <option value="AB+">AB Rhésus Positif (AB+)</option>
                <option value="AB-">AB Rhésus Négatif (AB-)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Téléphone principal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+221 77 123 45 67"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro WhatsApp (pour envoi des rapports)
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+221 77 123 45 67"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse de résidence</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Quartier, Rue, Cité..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact d'urgence / Tuteur</label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="Ex: Aïssatou Diallo (Épouse) - 77 000 00 00"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Renseignements cliniques</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Antécédents, traitements en cours, allergies..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              Enregistrer le Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le Dossier Patient" maxWidth="2xl">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nom</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              Sauvegarder les modifications
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
