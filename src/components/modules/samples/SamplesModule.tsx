import React, { useState } from 'react';
import {
  TestTube2,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  User,
  Calendar,
  XCircle,
  FileSpreadsheet,
  QrCode,
  Tag,
  Barcode
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { Sample, SampleStatus } from '../../../types/index.ts';
import { StatusBadge } from '../../common/StatusBadge.tsx';
import { formatDate } from '../../../services/i18n.ts';
import { ConfirmDialog } from '../../common/ConfirmDialog.tsx';
import { Modal } from '../../common/Modal.tsx';
import { TubeBarcodeLabel } from '../../common/TubeBarcodeLabel.tsx';

export const SamplesModule: React.FC = () => {
  const { samples, updateSampleStatus, settings } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Dialog state for sample rejection
  const [rejectingSample, setRejectingSample] = useState<Sample | null>(null);
  const [printingSample, setPrintingSample] = useState<Sample | null>(null);

  const filteredSamples = samples.filter(s => {
    const matchesSearch =
      s.sampleNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.patientName.toLowerCase().includes(search.toLowerCase()) ||
      s.sampleType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCollect = (sample: Sample) => {
    updateSampleStatus(sample.id, 'COLLECTED');
  };

  const handleReceive = (sample: Sample) => {
    updateSampleStatus(sample.id, 'RECEIVED');
  };

  const handleStartProcessing = (sample: Sample) => {
    updateSampleStatus(sample.id, 'PROCESSING');
  };

  const handleConfirmReject = (reason?: string) => {
    if (rejectingSample) {
      updateSampleStatus(rejectingSample.id, 'REJECTED', reason || 'Échantillon non conforme');
      setRejectingSample(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestion des Échantillons & Prélèvements</h2>
          <p className="text-xs text-slate-500">
            Traçabilité des tubes, recueil des échantillons et conformité pré-analytique ({samples.length} prélèvements)
          </p>
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
            placeholder="Rechercher par N° tube (SMP-...), N° demande (ORD-...), patient..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="WAITING">À prélever (En attente)</option>
          <option value="COLLECTED">Prélevé</option>
          <option value="RECEIVED">Réceptionné au laboratoire</option>
          <option value="PROCESSING">En cours d'analyse</option>
          <option value="COMPLETED">Analyses terminées</option>
          <option value="REJECTED">Échantillon rejeté</option>
        </select>
      </div>

      {/* Samples Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">N° Échantillon</th>
                <th className="py-3 px-4 font-semibold">N° Demande</th>
                <th className="py-3 px-4 font-semibold">Patient</th>
                <th className="py-3 px-4 font-semibold">Type de Matrice</th>
                <th className="py-3 px-4 font-semibold">Contenant / Tube</th>
                <th className="py-3 px-4 font-semibold">Statut Prélèvement</th>
                <th className="py-3 px-4 font-semibold">Préleveur / Date</th>
                <th className="py-3 px-4 font-semibold text-right">Workflow & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucun échantillon ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                filteredSamples.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{s.sampleNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.orderNumber}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{s.patientName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{s.sampleType}</td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        {s.container}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.status} size="sm" />
                      {s.rejectionReason && (
                        <div className="text-[10px] text-rose-600 mt-0.5 font-medium">
                          Motif : {s.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {s.collectorName ? (
                        <>
                          <div className="font-medium text-slate-700">{s.collectorName}</div>
                          <div>{s.collectionDate} à {s.collectionTime}</div>
                        </>
                      ) : (
                        <span className="italic text-slate-400">Non prélevé</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.status === 'WAITING' && (
                          <button
                            onClick={() => handleCollect(s)}
                            className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            Valider Prélèvement
                          </button>
                        )}

                        {s.status === 'COLLECTED' && (
                          <button
                            onClick={() => handleReceive(s)}
                            className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                          >
                            Réceptionner au Labo
                          </button>
                        )}

                        {s.status === 'RECEIVED' && (
                          <button
                            onClick={() => handleStartProcessing(s)}
                            className="rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                          >
                            Lancer Analyse
                          </button>
                        )}

                        {/* Print Barcode Label Button */}
                        <button
                          onClick={() => setPrintingSample(s)}
                          title="Imprimer étiquette code-barres tube"
                          className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1 text-[11px] font-semibold border border-slate-200"
                        >
                          <Barcode className="h-4 w-4" />
                          <span className="hidden sm:inline">Étiquette</span>
                        </button>

                        {s.status !== 'REJECTED' && s.status !== 'COMPLETED' && (
                          <button
                            onClick={() => setRejectingSample(s)}
                            title="Rejeter l'échantillon (non conforme)"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
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

      {/* Reject Confirmation Dialog with Reason */}
      <ConfirmDialog
        isOpen={!!rejectingSample}
        title="Rejet de l'échantillon médical"
        message={`Êtes-vous certain de vouloir rejeter le prélèvement ${rejectingSample?.sampleNumber} (${rejectingSample?.patientName}) ? Cette non-conformité sera tracée dans le journal d'activité.`}
        confirmLabel="Confirmer le rejet"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Préciser la non-conformité : tube hémolysé, caillot présent, volume insuffisant..."
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectingSample(null)}
      />

      {/* Tube Barcode Label Print Modal */}
      {printingSample && (
        <Modal
          isOpen={!!printingSample}
          onClose={() => setPrintingSample(null)}
          title={`Étiquette Thermique de Prélèvement — ${printingSample.sampleNumber}`}
          subtitle={`Patient : ${printingSample.patientName} • Contenant : ${printingSample.container}`}
          maxWidth="md"
        >
          <div className="py-2 space-y-4">
            <TubeBarcodeLabel
              sample={printingSample}
              labName={settings.name}
              testCodes={['NFS', 'GLYC', 'CREAT']}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
