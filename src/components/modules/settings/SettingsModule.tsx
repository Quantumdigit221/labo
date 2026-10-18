import React, { useState } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { LabSettings } from '../../../types/index.ts';

export const SettingsModule: React.FC = () => {
  const { settings, saveSettings } = useData();
  const [formData, setFormData] = useState<LabSettings>({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Configuration & Paramètres du Laboratoire</h2>
          <p className="text-xs text-slate-500">
            Coordonnées officielles, en-tête des comptes-rendus, devise FCFA et paramètres de facturation
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="h-4 w-4" />
            Paramètres enregistrés avec succès
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Lab Identification Box (Requirement 68) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            Identité Juridique & Coordonnées (En-tête officiel)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nom du Laboratoire</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Slogan / Sous-titre</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Adresse physique</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ville & Pays</label>
              <input
                type="text"
                value={`${formData.city}, ${formData.country}`}
                onChange={e => {
                  const parts = e.target.value.split(',');
                  setFormData({ ...formData, city: parts[0]?.trim() || 'Dakar', country: parts[1]?.trim() || 'Sénégal' });
                }}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Téléphone standard</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp du Laboratoire</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email de contact</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Immatriculation Fiscale / Agrément (NINEA, RCCM)
            </label>
            <input
              type="text"
              value={formData.taxNumber}
              onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
            />
          </div>
        </div>

        {/* Biologist in Charge & Certification (Requirement 17, 68) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            Direction Médicale & Signature Officielle
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nom du Biologiste Responsable</label>
              <input
                type="text"
                value={formData.leadBiologist}
                onChange={e => setFormData({ ...formData, leadBiologist: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Titre & Spécialité</label>
              <input
                type="text"
                value={formData.biologistTitle}
                onChange={e => setFormData({ ...formData, biologistTitle: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Currency & Localization (Requirements 69, 70) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            Monnaie & Fuseau Horaire
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Devise Principale (UEMOA / Sénégal)</label>
              <input
                type="text"
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Format d'affichage : 1 500 FCFA
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fuseau Horaire</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Heure locale Dakar (GMT)
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-95"
          >
            <Save className="h-4 w-4" />
            Enregistrer les Paramètres
          </button>
        </div>
      </form>
    </div>
  );
};
