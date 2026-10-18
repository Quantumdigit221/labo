import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  Phone,
  Building,
  Mail,
  UserCheck,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { Doctor } from '../../../types/index.ts';
import { Modal } from '../../common/Modal.tsx';
import { formatCurrency, formatDate } from '../../../services/i18n.ts';

export const DoctorsModule: React.FC = () => {
  const { doctors, orders, addDoctor, updateDoctor } = useData();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialty: 'Médecine Générale',
    phone: '+221 ',
    whatsapp: '+221 ',
    email: '',
    facility: 'Hôpital Principal de Dakar',
    address: 'Dakar',
    commissionRate: 0,
    notes: ''
  });

  const filteredDoctors = doctors.filter(
    d =>
      d.firstName.toLowerCase().includes(search.toLowerCase()) ||
      d.lastName.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.facility.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      alert('Veuillez renseigner le nom, prénom et téléphone du médecin.');
      return;
    }
    addDoctor({
      ...formData,
      whatsapp: formData.whatsapp.trim() || formData.phone.trim()
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Médecins Prescripteurs & Partenaires</h2>
          <p className="text-xs text-slate-500">
            Suivi des praticiens référents, cliniques et établissements hospitaliers ({doctors.length} enregistrés)
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              firstName: '',
              lastName: '',
              specialty: 'Médecine Générale',
              phone: '+221 77 ',
              whatsapp: '+221 77 ',
              email: '',
              facility: 'Hôpital Principal de Dakar',
              address: 'Dakar',
              commissionRate: 0,
              notes: ''
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          + AJOUTER UN MÉDECIN
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, spécialité, hôpital..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Grid of Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map(doc => {
          const docOrders = orders.filter(o => o.doctorId === doc.id);
          const revenue = docOrders.reduce((acc, o) => acc + o.total, 0);

          return (
            <div
              key={doc.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                    Dr
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Dr. {doc.firstName} {doc.lastName}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600">{doc.specialty}</p>
                  </div>
                </div>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                  {doc.doctorNumber}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1">
                <div className="flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{doc.facility}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{doc.phone}</span>
                </div>
                {doc.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                )}
              </div>

              {/* Statistics for Doctor (Requirement 6) */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Prescriptions</span>
                  <p className="text-sm font-bold text-slate-800">{docOrders.length}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">CA Généré</span>
                  <p className="text-sm font-bold text-emerald-600">{formatCurrency(revenue)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Doctor Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter un Médecin Référent" maxWidth="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Ex: Ibrahima"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Ex: Diop"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Spécialité</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Médecine Générale, Cardiologie, Pédiatrie..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Établissement / Clinique</label>
              <input
                type="text"
                value={formData.facility}
                onChange={e => setFormData({ ...formData, facility: e.target.value })}
                placeholder="Hôpital Principal, Clinique Madeleine..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Téléphone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+221 77 000 00 00"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+221 77 000 00 00"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="docteur@hopital.sn"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              Enregistrer Médecin
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
