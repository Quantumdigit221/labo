import React, { useState } from 'react';
import {
  Home,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Car
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { HomeVisit, HomeVisitStatus } from '../../../types/index.ts';
import { Modal } from '../../common/Modal.tsx';
import { formatCurrency, formatDate } from '../../../services/i18n.ts';
import { StatusBadge } from '../../common/StatusBadge.tsx';

export const HomeVisitsModule: React.FC = () => {
  const { homeVisits, patients, addHomeVisit, updateHomeVisit } = useData();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    patientId: patients[0]?.id || '',
    patientName: patients[0] ? `${patients[0].firstName} ${patients[0].lastName}` : '',
    phone: patients[0]?.phone || '+221 ',
    address: 'Dakar, Mermoz',
    city: 'Dakar',
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '10:00',
    phlebotomistName: 'Awa Fatou Sow',
    testNames: ['NFS (Hémogramme)', 'Glycémie à Jeun'],
    travelFee: 5000,
    notes: ''
  });

  const handlePatientSelect = (pId: string) => {
    const p = patients.find(item => item.id === pId);
    if (p) {
      setFormData({
        ...formData,
        patientId: p.id,
        patientName: `${p.firstName} ${p.lastName}`,
        phone: p.phone,
        address: p.address,
        city: p.city
      });
    }
  };

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.address) {
      alert('Veuillez renseigner le patient et l\'adresse.');
      return;
    }
    addHomeVisit({
      ...formData,
      status: 'PLANIFIED'
    });
    setIsModalOpen(false);
  };

  const handleStatusChange = (visitId: string, status: HomeVisitStatus) => {
    updateHomeVisit(visitId, { status });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Prélèvements & Visites à Domicile</h2>
          <p className="text-xs text-slate-500">
            Planning des tournées des préleveurs, recueil à domicile et gestion des frais de déplacement ({homeVisits.length} visites)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          + Planifier une Visite
        </button>
      </div>

      {/* Grid of Visits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {homeVisits.map(hv => (
          <div
            key={hv.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                  {hv.visitDate} à {hv.visitTime}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{hv.patientName}</h3>
              </div>
              <StatusBadge status={hv.status} size="sm" />
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{hv.address}, {hv.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{hv.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Préleveur : <strong>{hv.phlebotomistName}</strong></span>
              </div>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Analyses prévues :</span>
              <p className="font-medium text-slate-700">{hv.testNames.join(', ')}</p>
              <div className="mt-1 text-slate-500 flex justify-between">
                <span>Frais déplacement :</span>
                <strong className="text-slate-800">{formatCurrency(hv.travelFee)}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 text-xs">
              {hv.status === 'PLANIFIED' && (
                <button
                  onClick={() => handleStatusChange(hv.id, 'IN_PROGRESS')}
                  className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Démarrer tournée
                </button>
              )}
              {hv.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusChange(hv.id, 'COMPLETED')}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Prélèvement Terminé
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Plan Visit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Planifier une Visite à Domicile" maxWidth="md">
        <form onSubmit={handleCreateVisit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sélectionner un patient</label>
            <select
              value={formData.patientId}
              onChange={e => handlePatientSelect(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date du passage</label>
              <input
                type="date"
                required
                value={formData.visitDate}
                onChange={e => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Heure de rendez-vous</label>
              <input
                type="time"
                required
                value={formData.visitTime}
                onChange={e => setFormData({ ...formData, visitTime: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Adresse complète</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Préleveur assigné</label>
              <input
                type="text"
                value={formData.phlebotomistName}
                onChange={e => setFormData({ ...formData, phlebotomistName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Frais de déplacement (FCFA)</label>
              <input
                type="number"
                value={formData.travelFee}
                onChange={e => setFormData({ ...formData, travelFee: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
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
              Enregistrer la Visite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
