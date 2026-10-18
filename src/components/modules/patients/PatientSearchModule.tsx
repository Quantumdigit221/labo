import React, { useState, useMemo } from 'react';
import {
  Search,
  User,
  Phone,
  Calendar,
  MapPin,
  FileSpreadsheet,
  Plus,
  Eye,
  Activity,
  CreditCard,
  Printer,
  MessageCircle,
  FileText,
  Clock,
  Sparkles,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw,
  X,
  Droplet,
  IdCard,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { Patient, Gender, Order, ResultValue } from '../../../types/index.ts';
import { Modal } from '../../common/Modal.tsx';
import { formatCurrency, formatDate } from '../../../services/i18n.ts';
import { StatusBadge } from '../../common/StatusBadge.tsx';
import { generateBarcodeBars } from '../../../utils/barcode.ts';

interface PatientSearchModuleProps {
  onNavigateToPatientDossier: (patientId: string) => void;
  onNavigateToOrder: (patientId: string) => void;
}

export const PatientSearchModule: React.FC<PatientSearchModuleProps> = ({
  onNavigateToPatientDossier,
  onNavigateToOrder
}) => {
  const { patients, orders, results, reports, invoices, tests, addPatient, settings } = useData();

  // Search parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'M' | 'F'>('ALL');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'ALL' | 'PEDIA' | 'ADULT' | 'SENIOR'>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [filterActiveOrders, setFilterActiveOrders] = useState(false);
  const [filterUnpaid, setFilterUnpaid] = useState(false);
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Modals
  const [selectedPatientForCard, setSelectedPatientForCard] = useState<Patient | null>(null);
  const [selectedPatientForAnteriority, setSelectedPatientForAnteriority] = useState<Patient | null>(null);
  const [isQuickNewModalOpen, setIsQuickNewModalOpen] = useState(false);

  // Quick New Patient Form
  const [quickForm, setQuickForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'M' as Gender,
    dateOfBirth: '1990-01-01',
    phone: '+221 77 ',
    whatsapp: '+221 77 ',
    email: '',
    address: '',
    city: 'Dakar',
    country: 'Sénégal',
    bloodGroup: 'O+',
    nationalId: '',
    notes: ''
  });

  // Calculate age from DOB
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  // Helper map: patient financial balance & active orders
  const patientStatsMap = useMemo(() => {
    const map = new Map<string, {
      totalOrders: number;
      activeOrdersCount: number;
      lastOrder: Order | null;
      unpaidBalance: number;
      hasReports: boolean;
    }>();

    patients.forEach(p => {
      const pOrders = orders.filter(o => o.patientId === p.id);
      const activeCount = pOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
      const sortedOrders = [...pOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      
      const pInvoices = invoices.filter(i => i.patientId === p.id);
      const totalBalance = pInvoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);
      const pReports = reports.filter(r => r.patientId === p.id);

      map.set(p.id, {
        totalOrders: pOrders.length,
        activeOrdersCount: activeCount,
        lastOrder: sortedOrders[0] || null,
        unpaidBalance: totalBalance,
        hasReports: pReports.length > 0
      });
    });

    return map;
  }, [patients, orders, invoices, reports]);

  // Clean search helper
  const cleanPhone = (str: string) => str.replace(/[^0-9]/g, '');

  // Filtered patients
  const filteredPatients = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const qCleanPhone = cleanPhone(q);

    return patients.filter(patient => {
      const age = calculateAge(patient.dateOfBirth);
      const stats = patientStatsMap.get(patient.id);

      // Search match
      if (q) {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const reverseName = `${patient.lastName} ${patient.firstName}`.toLowerCase();
        const matchesName = fullName.includes(q) || reverseName.includes(q);
        const matchesNumber = patient.patientNumber.toLowerCase().includes(q);
        const matchesNIN = patient.nationalId ? patient.nationalId.toLowerCase().includes(q) : false;
        const matchesCity = patient.city.toLowerCase().includes(q);
        const matchesEmail = patient.email ? patient.email.toLowerCase().includes(q) : false;
        const matchesNotes = patient.notes ? patient.notes.toLowerCase().includes(q) : false;
        
        const patPhoneClean = cleanPhone(patient.phone);
        const patWhatsappClean = cleanPhone(patient.whatsapp);
        const matchesPhone = qCleanPhone ? (patPhoneClean.includes(qCleanPhone) || patWhatsappClean.includes(qCleanPhone)) : false;

        if (!matchesName && !matchesNumber && !matchesNIN && !matchesCity && !matchesEmail && !matchesPhone && !matchesNotes) {
          return false;
        }
      }

      // Gender filter
      if (selectedGender !== 'ALL' && patient.gender !== selectedGender) {
        return false;
      }

      // Blood group filter
      if (selectedBloodGroup !== 'ALL' && patient.bloodGroup !== selectedBloodGroup) {
        return false;
      }

      // City filter
      if (selectedCity !== 'ALL' && patient.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Age bracket filter
      if (selectedAgeGroup === 'PEDIA' && age >= 15) return false;
      if (selectedAgeGroup === 'ADULT' && (age < 15 || age >= 60)) return false;
      if (selectedAgeGroup === 'SENIOR' && age < 60) return false;

      // Active orders filter
      if (filterActiveOrders && (stats?.activeOrdersCount || 0) === 0) {
        return false;
      }

      // Unpaid balance filter
      if (filterUnpaid && (stats?.unpaidBalance || 0) <= 0) {
        return false;
      }

      return true;
    });
  }, [patients, searchTerm, selectedGender, selectedBloodGroup, selectedAgeGroup, selectedCity, filterActiveOrders, filterUnpaid, patientStatsMap]);

  // Unique cities list for quick filters
  const citiesList = useMemo(() => {
    const set = new Set<string>();
    patients.forEach(p => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set).sort();
  }, [patients]);

  // Summary counts
  const totalWithActiveOrders = useMemo(() => {
    return Array.from(patientStatsMap.values()).filter(s => s.activeOrdersCount > 0).length;
  }, [patientStatsMap]);

  const totalWithUnpaid = useMemo(() => {
    return Array.from(patientStatsMap.values()).filter(s => s.unpaidBalance > 0).length;
  }, [patientStatsMap]);

  // Quick patient submit
  const handleCreateQuickPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickForm.firstName.trim() || !quickForm.lastName.trim() || !quickForm.phone.trim()) {
      alert('Veuillez renseigner le prénom, le nom et le téléphone.');
      return;
    }

    const created = addPatient({
      ...quickForm,
      whatsapp: quickForm.whatsapp.trim() || quickForm.phone.trim()
    });

    setIsQuickNewModalOpen(false);
    setSearchTerm(created.lastName);
    onNavigateToPatientDossier(created.id);
  };

  // WhatsApp click handler
  const handleSendWhatsApp = (patient: Patient) => {
    const rawNumber = cleanPhone(patient.whatsapp || patient.phone);
    const labName = settings.name || 'Laboratoire Médical';
    const msg = encodeURIComponent(
      `Bonjour M./Mme ${patient.firstName} ${patient.lastName},\nIci le ${labName}. Nous sommes à votre disposition pour le suivi de vos analyses et résultats.\nVotre identifiant patient est : ${patient.patientNumber}.`
    );
    window.open(`https://wa.me/${rawNumber}?text=${msg}`, '_blank');
  };

  // Biological Anteriorities calculation for the selected patient
  const anteriorityData = useMemo(() => {
    if (!selectedPatientForAnteriority) return null;
    const pResults = results.filter(r => r.patientId === selectedPatientForAnteriority.id);
    
    // Group results by parameter name or code
    const paramMap = new Map<string, {
      code: string;
      name: string;
      unit?: string;
      referenceRange?: string;
      history: { date: string; value: string; numValue: number | null; flag?: string }[];
    }>();

    pResults.forEach(r => {
      r.values.forEach(v => {
        const num = parseFloat(v.value.replace(',', '.'));
        const entry = {
          date: r.updatedAt || r.createdAt || '2026-10-15',
          value: v.value,
          numValue: isNaN(num) ? null : num,
          flag: v.flag
        };

        if (!paramMap.has(v.parameterCode)) {
          paramMap.set(v.parameterCode, {
            code: v.parameterCode,
            name: v.parameterName,
            unit: v.unit,
            referenceRange: v.referenceText,
            history: [entry]
          });
        } else {
          paramMap.get(v.parameterCode)!.history.push(entry);
        }
      });
    });

    // Sort histories by date
    paramMap.forEach(item => {
      item.history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return Array.from(paramMap.values());
  }, [selectedPatientForAnteriority, results]);

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Recherche de Patient & Antériorités</h2>
            <span className="rounded-full bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 font-bold">
              LIS Rapide
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Moteur de recherche multi-critères : Nom, Téléphone, IPU, NIN, Localité, Historique clinique & caisse
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedGender('ALL');
              setSelectedBloodGroup('ALL');
              setSelectedAgeGroup('ALL');
              setSelectedCity('ALL');
              setFilterActiveOrders(false);
              setFilterUnpaid(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Réinitialiser tous les filtres"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Réinitialiser
          </button>

          <button
            onClick={() => setIsQuickNewModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            + Nouveau Patient
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800">{patients.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Patients Répertoriés</div>
          </div>
        </div>

        <div
          onClick={() => setFilterActiveOrders(!filterActiveOrders)}
          className={`rounded-xl border p-3.5 shadow-2xs flex items-center gap-3 cursor-pointer transition-all ${
            filterActiveOrders ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-200' : 'border-slate-200 bg-white hover:border-amber-300'
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-amber-700">{totalWithActiveOrders}</div>
            <div className="text-[11px] text-slate-500 font-medium">Demandes en cours</div>
          </div>
        </div>

        <div
          onClick={() => setFilterUnpaid(!filterUnpaid)}
          className={`rounded-xl border p-3.5 shadow-2xs flex items-center gap-3 cursor-pointer transition-all ${
            filterUnpaid ? 'border-rose-400 bg-rose-50/70 ring-2 ring-rose-200' : 'border-slate-200 bg-white hover:border-rose-300'
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-rose-700">{totalWithUnpaid}</div>
            <div className="text-[11px] text-slate-500 font-medium">Soldes Impayés</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-emerald-700">{filteredPatients.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Résultats affichés</div>
          </div>
        </div>
      </div>

      {/* Main Search Station Box */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-blue-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par Nom, Prénom, Tél (+221...), IPU (PAT-2026-...), NIN/CNI, Quartier..."
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 py-3 pl-12 pr-10 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Multi-Criteria Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          {/* Gender */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 px-1 uppercase">Sexe :</span>
            <button
              onClick={() => setSelectedGender('ALL')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                selectedGender === 'ALL' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedGender('M')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                selectedGender === 'M' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ♂ Hommes
            </button>
            <button
              onClick={() => setSelectedGender('F')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                selectedGender === 'F' ? 'bg-rose-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ♀ Femmes
            </button>
          </div>

          {/* Blood Group */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <Droplet className="h-3.5 w-3.5 text-rose-500 ml-1" />
            <select
              value={selectedBloodGroup}
              onChange={e => setSelectedBloodGroup(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none pr-1"
            >
              <option value="ALL">Tous Groupes Sanguins</option>
              <option value="O+">O Rhésus +</option>
              <option value="O-">O Rhésus -</option>
              <option value="A+">A Rhésus +</option>
              <option value="A-">A Rhésus -</option>
              <option value="B+">B Rhésus +</option>
              <option value="B-">B Rhésus -</option>
              <option value="AB+">AB Rhésus +</option>
              <option value="AB-">AB Rhésus -</option>
            </select>
          </div>

          {/* Age Bracket */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 px-1 uppercase">Âge :</span>
            <button
              onClick={() => setSelectedAgeGroup('ALL')}
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                selectedAgeGroup === 'ALL' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedAgeGroup('PEDIA')}
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                selectedAgeGroup === 'PEDIA' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Pédiatrie (&lt;15 ans)
            </button>
            <button
              onClick={() => setSelectedAgeGroup('ADULT')}
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                selectedAgeGroup === 'ADULT' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Adultes (15-59)
            </button>
            <button
              onClick={() => setSelectedAgeGroup('SENIOR')}
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                selectedAgeGroup === 'SENIOR' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Seniors (60+)
            </button>
          </div>

          {/* City selector */}
          {citiesList.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <MapPin className="h-3.5 w-3.5 text-slate-500 ml-1" />
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none pr-1"
              >
                <option value="ALL">Toutes les villes</option>
                {citiesList.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="ml-auto flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                viewMode === 'CARDS' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Vue Cartes
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                viewMode === 'TABLE' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Vue Tableau
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          <span>Affichage de </span>
          <strong className="text-slate-800">{filteredPatients.length}</strong>
          <span> patient(s) correspondant à vos critères</span>
          {searchTerm && (
            <span> pour « <strong className="text-blue-600">{searchTerm}</strong> »</span>
          )}
        </div>
        {filteredPatients.length > 0 && (
          <div className="text-[11px] text-slate-400">
            💡 Astuce : Cliquez sur « + Nouvelle Demande » pour prescrire directement.
          </div>
        )}
      </div>

      {/* Results Rendering */}
      {filteredPatients.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Aucun patient trouvé</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Aucun dossier patient ne correspond à votre recherche « {searchTerm} » ou aux filtres sélectionnés. Vous pouvez créer un nouveau dossier en un clic.
          </p>
          <button
            onClick={() => {
              setQuickForm({
                ...quickForm,
                lastName: searchTerm
              });
              setIsQuickNewModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Créer le dossier pour « {searchTerm || 'Nouveau Patient'} »
          </button>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map(patient => {
            const age = calculateAge(patient.dateOfBirth);
            const stats = patientStatsMap.get(patient.id);

            return (
              <div
                key={patient.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar of the Card */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-sm shadow-2xs ${
                          patient.gender === 'F'
                            ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-200'
                            : 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                        }`}
                      >
                        {patient.firstName[0]}
                        {patient.lastName[0]}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors">
                            {patient.firstName} {patient.lastName}
                          </h4>
                          {patient.bloodGroup && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[10px] font-bold">
                              <Droplet className="h-2.5 w-2.5 fill-rose-500" />
                              {patient.bloodGroup}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                            {patient.patientNumber}
                          </span>
                          <span>•</span>
                          <span>
                            {patient.gender === 'F' ? 'Femme' : 'Homme'}, {age} ans
                          </span>
                          <span>•</span>
                          <span className="text-[11px] text-slate-400">
                            Né(e) le {formatDate(patient.dateOfBirth)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {(stats?.activeOrdersCount || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {stats?.activeOrdersCount} en cours
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {stats?.totalOrders || 0} demande(s)
                        </span>
                      )}

                      {(stats?.unpaidBalance || 0) > 0 ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Reste: {formatCurrency(stats?.unpaidBalance || 0)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600">
                          ✓ À jour caisse
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact & Location Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-3 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <a
                        href={`tel:${patient.phone}`}
                        className="hover:text-blue-600 font-semibold truncate"
                      >
                        {patient.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {patient.city || 'Sénégal'} {patient.address ? `(${patient.address})` : ''}
                      </span>
                    </div>

                    {patient.nationalId && (
                      <div className="flex items-center gap-2 col-span-2 text-[11px] text-slate-500">
                        <IdCard className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>NIN / CNI : <strong className="font-mono text-slate-700">{patient.nationalId}</strong></span>
                      </div>
                    )}

                    {stats?.lastOrder && (
                      <div className="col-span-2 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 flex items-center justify-between mt-1">
                        <div>
                          <span className="text-slate-400">Dernière visite : </span>
                          <strong className="text-slate-800">{formatDate(stats.lastOrder.orderDate)}</strong>
                          <span className="text-slate-400"> ({stats.lastOrder.orderNumber})</span>
                        </div>
                        <StatusBadge status={stats.lastOrder.status} size="sm" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Quick Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp */}
                    <button
                      onClick={() => handleSendWhatsApp(patient)}
                      title="Envoyer message WhatsApp"
                      className="p-2 rounded-xl border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>

                    {/* Patient Card / Label */}
                    <button
                      onClick={() => setSelectedPatientForCard(patient)}
                      title="Imprimer Carte Patient / Code-barres Tube"
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <Printer className="h-4 w-4" />
                    </button>

                    {/* Anteriority & Lab History */}
                    <button
                      onClick={() => setSelectedPatientForAnteriority(patient)}
                      title="Consulter les antériorités biologiques"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors"
                    >
                      <Activity className="h-3.5 w-3.5 text-purple-600" />
                      <span>Antériorités</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Full Dossier */}
                    <button
                      onClick={() => onNavigateToPatientDossier(patient.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      <span>Dossier</span>
                    </button>

                    {/* New Order */}
                    <button
                      onClick={() => onNavigateToOrder(patient.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Demande</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Patient / N° IPU</th>
                  <th className="py-3 px-3">Sexe / Âge</th>
                  <th className="py-3 px-3">Groupe</th>
                  <th className="py-3 px-4">Contact & Ville</th>
                  <th className="py-3 px-3">Demandes</th>
                  <th className="py-3 px-3">Situation Caisse</th>
                  <th className="py-3 px-4 text-right">Actions Rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map(patient => {
                  const age = calculateAge(patient.dateOfBirth);
                  const stats = patientStatsMap.get(patient.id);

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                      onClick={() => onNavigateToPatientDossier(patient.id)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                              patient.gender === 'F' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {patient.firstName[0]}
                            {patient.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="font-mono text-[10px] text-blue-700 font-semibold">
                              {patient.patientNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700">
                          {patient.gender === 'F' ? '♀ F' : '♂ M'}, {age} ans
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {patient.bloodGroup ? (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-50 text-rose-700 px-1.5 py-0.5 font-bold text-[10px] border border-rose-200">
                            <Droplet className="h-2.5 w-2.5 fill-rose-500" />
                            {patient.bloodGroup}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{patient.phone}</div>
                        <div className="text-[10px] text-slate-500">{patient.city}</div>
                      </td>

                      <td className="py-3 px-3">
                        {(stats?.activeOrdersCount || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            {stats?.activeOrdersCount} en cours
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">{stats?.totalOrders || 0} dem.</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {(stats?.unpaidBalance || 0) > 0 ? (
                          <span className="font-bold text-rose-600 text-[11px]">
                            {formatCurrency(stats?.unpaidBalance || 0)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 text-[11px] font-semibold">
                            ✓ Soldé
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPatientForAnteriority(patient)}
                            title="Antériorités"
                            className="p-1.5 rounded-lg border border-slate-200 text-purple-600 hover:bg-purple-50"
                          >
                            <Activity className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedPatientForCard(patient)}
                            title="Imprimer Badge / Code-barres"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleSendWhatsApp(patient)}
                            title="WhatsApp"
                            className="p-1.5 rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigateToOrder(patient.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                          >
                            <Plus className="h-3 w-3" />
                            Prescrire
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CARTE PATIENT & ÉTIQUETTE CODE-BARRES TUBE */}
      {selectedPatientForCard && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPatientForCard(null)}
          title={`Carte d'Identification & Code-Barres : ${selectedPatientForCard.firstName} ${selectedPatientForCard.lastName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Support d'identification au prélèvement</p>
                <p className="text-[11px] text-slate-500">
                  Imprimez la carte patient ou l'étiquette thermique pour l'étiquetage sécurisé des tubes et l'accueil.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800"
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </button>
            </div>

            {/* Printable ID Card Container */}
            <div className="flex flex-col items-center">
              <div
                id="patient-printable-card"
                className="w-full max-w-md rounded-2xl border-2 border-slate-800 bg-white p-5 shadow-lg text-slate-900 font-sans print:border-none print:shadow-none"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-3">
                  <div>
                    <h3 className="font-black text-sm tracking-tight uppercase text-blue-900">
                      {settings.name || 'EXTREMELAB MEDICAL'}
                    </h3>
                    <p className="text-[10px] text-slate-500">{settings.address || 'Dakar, Sénégal'} • {settings.phone}</p>
                  </div>
                  <span className="rounded bg-blue-900 text-white font-mono text-[10px] font-bold px-2 py-0.5">
                    CARTE PATIENT LIS
                  </span>
                </div>

                {/* Identity Content */}
                <div className="grid grid-cols-3 gap-3 items-center">
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                    <div className="text-3xl font-black mb-1">
                      {selectedPatientForCard.gender === 'F' ? '♀' : '♂'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">
                      {selectedPatientForCard.gender === 'F' ? 'Féminin' : 'Masculin'}
                    </span>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <div className="font-black text-base uppercase leading-tight text-slate-900">
                      {selectedPatientForCard.lastName}
                    </div>
                    <div className="font-bold text-sm text-blue-700 leading-tight">
                      {selectedPatientForCard.firstName}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span>Né(e) : {formatDate(selectedPatientForCard.dateOfBirth)}</span>
                      <span>•</span>
                      <span>({calculateAge(selectedPatientForCard.dateOfBirth)} ans)</span>
                    </div>
                    <div className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <Droplet className="h-3 w-3 fill-rose-500" />
                      <span>Groupe : {selectedPatientForCard.bloodGroup || 'O+'}</span>
                    </div>
                  </div>
                </div>

                {/* Barcode Section */}
                {(() => {
                  const { bars, totalWidth } = generateBarcodeBars(selectedPatientForCard.patientNumber, 36);
                  return (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col items-center">
                      <svg
                        viewBox={`0 0 ${totalWidth} 40`}
                        className="w-full h-10"
                        preserveAspectRatio="none"
                      >
                        {bars.map((bar, idx) => (
                          <rect
                            key={idx}
                            x={bar.x}
                            y={0}
                            width={bar.width}
                            height={40}
                            fill="#000000"
                          />
                        ))}
                      </svg>
                      <div className="font-mono font-black text-xs tracking-widest text-slate-900 mt-1">
                        {selectedPatientForCard.patientNumber}
                      </div>
                    </div>
                  );
                })()}

                {/* Footer Coordinates */}
                <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
                  <span>Tél : {selectedPatientForCard.phone}</span>
                  <span>Ville : {selectedPatientForCard.city}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedPatientForCard(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: ANTÉRIORITÉS BIOLOGIQUES ET ÉVOLUTION (Delta-Checks) */}
      {selectedPatientForAnteriority && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPatientForAnteriority(null)}
          title={`Antériorités & Évolution Biologique : ${selectedPatientForAnteriority.firstName} ${selectedPatientForAnteriority.lastName}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Comparaison chronologique des résultats d'analyses</span>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  Visualisez les variations des paramètres biologiques au fil du temps pour détecter les anomalies (Delta-Check).
                </p>
              </div>
              <span className="font-mono font-bold text-xs bg-purple-200 text-purple-900 px-2 py-1 rounded">
                IPU : {selectedPatientForAnteriority.patientNumber}
              </span>
            </div>

            {(!anteriorityData || anteriorityData.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aucun résultat historique enregistré pour ce patient dans la base.
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Paramètre</th>
                      <th className="py-2.5 px-2">Unité</th>
                      <th className="py-2.5 px-2">Valeurs Normales</th>
                      <th className="py-2.5 px-3">Historique des Mesures (Chronologique)</th>
                      <th className="py-2.5 px-3 text-right">Tendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {anteriorityData.map(param => {
                      const latest = param.history[param.history.length - 1];
                      const previous = param.history.length > 1 ? param.history[param.history.length - 2] : null;
                      
                      let trend = 'STABLE';
                      if (previous && latest && latest.numValue !== null && previous.numValue !== null) {
                        if (latest.numValue > previous.numValue * 1.05) trend = 'UP';
                        else if (latest.numValue < previous.numValue * 0.95) trend = 'DOWN';
                      }

                      return (
                        <tr key={param.code} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{param.name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{param.code}</div>
                          </td>

                          <td className="py-3 px-2 text-slate-600 font-mono text-[11px]">
                            {param.unit || '-'}
                          </td>

                          <td className="py-3 px-2 text-slate-500 text-[11px]">
                            {param.referenceRange || '-'}
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {param.history.map((h, i) => {
                                const isLatest = i === param.history.length - 1;
                                return (
                                  <div
                                    key={i}
                                    className={`px-2 py-1 rounded text-center border ${
                                      isLatest
                                        ? (h.flag === 'HIGH' || h.flag === 'CRITICAL' || h.flag === 'H')
                                          ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                                          : (h.flag === 'LOW' || h.flag === 'L')
                                          ? 'bg-amber-100 border-amber-300 text-amber-800 font-bold'
                                          : 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                        : 'bg-slate-100 border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    <div className="text-xs">{h.value}</div>
                                    <div className="text-[9px] text-slate-400">{formatDate(h.date)}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right">
                            {trend === 'UP' && (
                              <span className="inline-flex items-center gap-0.5 text-rose-600 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded">
                                <TrendingUp className="h-3.5 w-3.5" />
                                + Hausse
                              </span>
                            )}
                            {trend === 'DOWN' && (
                              <span className="inline-flex items-center gap-0.5 text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded">
                                <TrendingDown className="h-3.5 w-3.5" />
                                - Baisse
                              </span>
                            )}
                            {trend === 'STABLE' && (
                              <span className="inline-flex items-center gap-0.5 text-slate-500 text-xs bg-slate-50 px-2 py-0.5 rounded">
                                <Minus className="h-3 w-3" />
                                Stable
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedPatientForAnteriority(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: NOUVEAU PATIENT RAPIDE */}
      <Modal
        isOpen={isQuickNewModalOpen}
        onClose={() => setIsQuickNewModalOpen(false)}
        title="Créer un Nouveau Dossier Patient"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateQuickPatient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prénom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={quickForm.firstName}
                onChange={e => setQuickForm({ ...quickForm, firstName: e.target.value })}
                placeholder="Ex: Abdoulaye"
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
                value={quickForm.lastName}
                onChange={e => setQuickForm({ ...quickForm, lastName: e.target.value })}
                placeholder="Ex: Ndiaye"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Genre</label>
              <select
                value={quickForm.gender}
                onChange={e => setQuickForm({ ...quickForm, gender: e.target.value as Gender })}
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
                value={quickForm.dateOfBirth}
                onChange={e => setQuickForm({ ...quickForm, dateOfBirth: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Groupe Sanguin</label>
              <select
                value={quickForm.bloodGroup}
                onChange={e => setQuickForm({ ...quickForm, bloodGroup: e.target.value })}
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
                value={quickForm.phone}
                onChange={e => setQuickForm({ ...quickForm, phone: e.target.value })}
                placeholder="+221 77 123 45 67"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIN / CNI / Pièce d'identité
              </label>
              <input
                type="text"
                value={quickForm.nationalId}
                onChange={e => setQuickForm({ ...quickForm, nationalId: e.target.value })}
                placeholder="Ex: 1 123 1990 00123"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse de résidence</label>
              <input
                type="text"
                value={quickForm.address}
                onChange={e => setQuickForm({ ...quickForm, address: e.target.value })}
                placeholder="Quartier, Rue, Cité..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ville</label>
              <input
                type="text"
                value={quickForm.city}
                onChange={e => setQuickForm({ ...quickForm, city: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsQuickNewModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              Enregistrer & Ouvrir Dossier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
