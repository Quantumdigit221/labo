import React, { useState } from 'react';
import {
  Bug,
  Pill,
  Grid,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { Culture, Antibiotic, Antibiogram, AntibiogramResult, AntibiogramSensitivity } from '../../../types/index.ts';
import { Modal } from '../../common/Modal.tsx';
import { formatDate } from '../../../services/i18n.ts';

export const MicrobiologyModule: React.FC = () => {
  const { cultures, antibiotics, antibiograms, addCulture, updateCulture, addAntibiogram, samples } = useData();
  const { canValidateResults, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'CULTURES' | 'ANTIBIOGRAMS' | 'ANTIBIOTICS'>('CULTURES');

  // New Culture state
  const [isCultureModalOpen, setIsCultureModalOpen] = useState(false);
  const [cultureForm, setCultureForm] = useState({
    sampleId: '',
    sampleNumber: '',
    patientId: '',
    patientName: '',
    cultureType: 'Urines (ECBU)',
    incubationDate: new Date().toISOString(),
    durationHours: 24,
    result: 'POSITIVE' as Culture['result'],
    organism: 'Escherichia coli',
    colonyCount: '> 10^5 UFC/mL',
    comments: ''
  });

  // Antibiogram fast editor state
  const [selectedAtb, setSelectedAtb] = useState<Antibiogram | null>(null);

  const handleCreateCulture = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSample = samples.find(s => s.id === cultureForm.sampleId) || samples[0];
    if (!targetSample) {
      alert('Veuillez sélectionner un échantillon.');
      return;
    }

    addCulture({
      ...cultureForm,
      sampleId: targetSample.id,
      sampleNumber: targetSample.sampleNumber,
      patientId: targetSample.patientId,
      patientName: targetSample.patientName
    });

    setIsCultureModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Microbiologie, Bactériologie & Antibiogrammes</h2>
          <p className="text-xs text-slate-500">
            Isolement de germes, antibiogrammes par diffusion / CMI et suivi des résistances bactériennes
          </p>
        </div>

        <button
          onClick={() => {
            if (samples.length > 0) {
              setCultureForm(prev => ({
                ...prev,
                sampleId: samples[0].id,
                sampleNumber: samples[0].sampleNumber,
                patientId: samples[0].patientId,
                patientName: samples[0].patientName
              }));
            }
            setIsCultureModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          + Nouvelle Culture
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold max-w-md">
        <button
          onClick={() => setActiveTab('CULTURES')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'CULTURES' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cultures ({cultures.length})
        </button>
        <button
          onClick={() => setActiveTab('ANTIBIOGRAMS')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'ANTIBIOGRAMS' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Antibiogrammes ({antibiograms.length})
        </button>
        <button
          onClick={() => setActiveTab('ANTIBIOTICS')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'ANTIBIOTICS' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Antibiotiques ({antibiotics.length})
        </button>
      </div>

      {/* Cultures View (Requirement 11) */}
      {activeTab === 'CULTURES' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">N° Échantillon</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Nature du Prélèvement</th>
                  <th className="py-3 px-4 font-semibold">Incubation</th>
                  <th className="py-3 px-4 font-semibold">Résultat Culture</th>
                  <th className="py-3 px-4 font-semibold">Germe Identifié</th>
                  <th className="py-3 px-4 font-semibold">Numération Colonie</th>
                  <th className="py-3 px-4 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cultures.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Aucune culture en cours.
                    </td>
                  </tr>
                ) : (
                  cultures.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.sampleNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{c.patientName}</td>
                      <td className="py-3 px-4 text-slate-700">{c.cultureType}</td>
                      <td className="py-3 px-4 text-slate-500">{c.durationHours}h ({formatDate(c.incubationDate)})</td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            c.result === 'POSITIVE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {c.result === 'POSITIVE' ? 'POSITIVE' : 'STÉRILE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold italic text-purple-900">
                        {c.organism || <span className="text-slate-400 not-italic">Absence de flore pathogène</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{c.colonyCount || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-semibold">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Antibiograms View (Requirement 13) */}
      {activeTab === 'ANTIBIOGRAMS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {antibiograms.map(atb => (
              <div
                key={atb.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Antibiogramme</span>
                    <h3 className="font-bold text-slate-900 text-base italic">{atb.organism}</h3>
                    <p className="text-xs text-slate-500">
                      Patient : <strong>{atb.patientName}</strong> • Tube : {atb.sampleNumber}
                    </p>
                  </div>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    VALIDÉ
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                      <tr>
                        <th className="py-2 px-3">Antibiotique</th>
                        <th className="py-2 px-3 text-center">Sensibilité</th>
                        <th className="py-2 px-3 text-right">CMI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {atb.results.map(r => (
                        <tr key={r.id}>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            <div>{r.antibioticName}</div>
                            <span className="text-[10px] text-slate-400">{r.family}</span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-block w-6 py-0.5 rounded text-center font-bold text-xs ${
                                r.result === 'S'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.result === 'I'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.result}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">{r.mic || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {atb.comments && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {atb.comments}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Antibiotics Catalog (Requirement 12) */}
      {activeTab === 'ANTIBIOTICS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {antibiotics.map(ab => (
            <div key={ab.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-purple-700">{ab.code}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500 font-medium">
                  {ab.route || 'Orale'}
                </span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{ab.name}</h4>
              <p className="text-xs text-purple-900 font-semibold">{ab.family}</p>
              <p className="text-[11px] text-slate-400">{ab.dosage || 'Dosage standard'}</p>
            </div>
          ))}
        </div>
      )}

      {/* New Culture Modal */}
      <Modal isOpen={isCultureModalOpen} onClose={() => setIsCultureModalOpen(false)} title="Nouvelle Culture Bactériologique" maxWidth="lg">
        <form onSubmit={handleCreateCulture} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Échantillon prélevé</label>
            <select
              required
              value={cultureForm.sampleId}
              onChange={e => setCultureForm({ ...cultureForm, sampleId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
            >
              {samples.map(s => (
                <option key={s.id} value={s.id}>
                  {s.sampleNumber} — {s.patientName} ({s.sampleType})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Type d'examen</label>
              <input
                type="text"
                value={cultureForm.cultureType}
                onChange={e => setCultureForm({ ...cultureForm, cultureType: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Durée incubation</label>
              <input
                type="number"
                value={cultureForm.durationHours}
                onChange={e => setCultureForm({ ...cultureForm, durationHours: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Résultat</label>
              <select
                value={cultureForm.result}
                onChange={e => setCultureForm({ ...cultureForm, result: e.target.value as Culture['result'] })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="POSITIVE">Culture Positive</option>
                <option value="NEGATIVE">Culture Stérile</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Germe / Bactérie identifiée</label>
              <input
                type="text"
                value={cultureForm.organism}
                onChange={e => setCultureForm({ ...cultureForm, organism: e.target.value })}
                placeholder="Ex: Escherichia coli, S. aureus..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Numération de colonies</label>
            <input
              type="text"
              value={cultureForm.colonyCount}
              onChange={e => setCultureForm({ ...cultureForm, colonyCount: e.target.value })}
              placeholder="Ex: > 10^5 UFC/mL"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCultureModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-sm"
            >
              Enregistrer la Culture
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
