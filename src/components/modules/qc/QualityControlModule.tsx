import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronDown,
  RotateCcw,
  Info,
  FileCheck2,
  Cpu
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { QcControlMaterial, QcRun } from '../../../types/index.ts';
import { formatDate } from '../../../services/i18n.ts';
import { Modal } from '../../common/Modal.tsx';

export const QualityControlModule: React.FC = () => {
  const { qcMaterials, qcRuns, addQcRun, validateQcRun, addQcMaterial } = useData();
  const { currentUser, currentRole } = useAuth();

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(qcMaterials[0]?.id || '');
  const [isAddRunModalOpen, setIsAddRunModalOpen] = useState<boolean>(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState<boolean>(false);

  // New run form state
  const [runValue, setRunValue] = useState<number>(7.15);
  const [runDate, setRunDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Selected material
  const activeMaterial = qcMaterials.find(m => m.id === selectedMaterialId) || qcMaterials[0];

  // Runs for the selected material
  const materialRuns = qcRuns
    .filter(r => r.materialId === activeMaterial?.id)
    .sort((a, b) => new Date(a.runDate).getTime() - new Date(b.runDate).getTime());

  // Recent 15 points for Levey-Jennings plot
  const chartPoints = materialRuns.slice(-15);

  const handleCreateRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMaterial) return;

    addQcRun({
      materialId: activeMaterial.id,
      materialName: activeMaterial.name,
      parameterCode: activeMaterial.parameterCode,
      level: activeMaterial.level,
      value: runValue,
      runDate,
      technicianName: currentUser?.name || 'Awa Fatou Sow'
    });

    setIsAddRunModalOpen(false);
  };

  const handleValidateRun = (runId: string) => {
    validateQcRun(runId, 'Validé conforme par le biologiste médical');
  };

  // Helper coordinate mapper for Levey-Jennings SVG (-3.5 SD to +3.5 SD)
  const svgHeight = 220;
  const svgWidth = 600;
  const paddingLeft = 60;
  const paddingRight = 30;
  const usableWidth = svgWidth - paddingLeft - paddingRight;
  const yCenter = svgHeight / 2;
  const sdPixelScale = 25; // 25 pixels per 1 SD

  const getSvgY = (deviationSd: number) => {
    // Invert because SVG y increases downwards
    return yCenter - deviationSd * sdPixelScale;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-100 text-purple-800 px-2 py-0.5 text-xs font-bold mb-1">
            <Activity className="h-3.5 w-3.5" />
            Assurance Qualité & Conformité ISO 15189
          </div>
          <h2 className="text-xl font-bold text-slate-800">Contrôle Qualité Interne (CQI & Levey-Jennings)</h2>
          <p className="text-xs text-slate-500">
            Surveillance analytique continue, cartes de contrôle Levey-Jennings et validation des règles de Westgard
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeMaterial) {
                setRunValue(activeMaterial.targetMean);
              }
              setIsAddRunModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Saisir un Contrôle CQI
          </button>
        </div>
      </div>

      {/* Material Selector Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Matériel de Contrôle & Paramètre :</span>
          <select
            value={selectedMaterialId}
            onChange={e => setSelectedMaterialId(e.target.value)}
            className="rounded-lg border border-slate-300 p-2 font-bold text-slate-900 focus:border-purple-500 focus:outline-none"
          >
            {qcMaterials.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.parameterName} ({m.parameterCode}) [Lot: {m.lotNumber}]
              </option>
            ))}
          </select>
        </div>

        {activeMaterial && (
          <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px]">
            <span>
              Moyenne Cible (µ) : <strong className="text-slate-900">{activeMaterial.targetMean} {activeMaterial.unit}</strong>
            </span>
            <span>
              Écart-Type (1σ) : <strong className="text-slate-900">± {activeMaterial.standardDeviation} {activeMaterial.unit}</strong>
            </span>
            <span className="rounded bg-purple-50 text-purple-700 px-2 py-0.5 font-bold">
              Lot {activeMaterial.lotNumber} (Pér. {formatDate(activeMaterial.expirationDate)})
            </span>
          </div>
        )}
      </div>

      {/* LEVEY-JENNINGS INTERACTIVE CHART */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span>Carte de Levey-Jennings : {activeMaterial?.parameterName} ({activeMaterial?.parameterCode})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Graphique de déviation standardisée (en SD) des 15 derniers passages
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 bg-emerald-100 text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Conforme (≤ 2 SD)
            </span>
            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 bg-amber-100 text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span> Alerte 1-2s (2 à 3 SD)
            </span>
            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 bg-rose-100 text-rose-800">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span> Rejet 1-3s (&gt; 3 SD)
            </span>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="w-full overflow-x-auto bg-slate-950/95 rounded-xl p-4 shadow-inner">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 text-slate-400 select-none">
            {/* Background Grid Lines for Standard Deviations */}
            {/* +3 SD */}
            <line x1={paddingLeft} y1={getSvgY(3)} x2={svgWidth - paddingRight} y2={getSvgY(3)} stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 2" />
            <text x={paddingLeft - 8} y={getSvgY(3) + 3} textAnchor="end" fill="#f43f5e" fontSize="9" fontWeight="bold">+3 SD</text>

            {/* +2 SD */}
            <line x1={paddingLeft} y1={getSvgY(2)} x2={svgWidth - paddingRight} y2={getSvgY(2)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" />
            <text x={paddingLeft - 8} y={getSvgY(2) + 3} textAnchor="end" fill="#f59e0b" fontSize="9" fontWeight="bold">+2 SD</text>

            {/* +1 SD */}
            <line x1={paddingLeft} y1={getSvgY(1)} x2={svgWidth - paddingRight} y2={getSvgY(1)} stroke="#64748b" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x={paddingLeft - 8} y={getSvgY(1) + 3} textAnchor="end" fill="#94a3b8" fontSize="8">+1 SD</text>

            {/* Mean (0 SD) */}
            <line x1={paddingLeft} y1={getSvgY(0)} x2={svgWidth - paddingRight} y2={getSvgY(0)} stroke="#10b981" strokeWidth="1.5" />
            <text x={paddingLeft - 8} y={getSvgY(0) + 3} textAnchor="end" fill="#10b981" fontSize="9" fontWeight="bold">Cible µ</text>

            {/* -1 SD */}
            <line x1={paddingLeft} y1={getSvgY(-1)} x2={svgWidth - paddingRight} y2={getSvgY(-1)} stroke="#64748b" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x={paddingLeft - 8} y={getSvgY(-1) + 3} textAnchor="end" fill="#94a3b8" fontSize="8">-1 SD</text>

            {/* -2 SD */}
            <line x1={paddingLeft} y1={getSvgY(-2)} x2={svgWidth - paddingRight} y2={getSvgY(-2)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" />
            <text x={paddingLeft - 8} y={getSvgY(-2) + 3} textAnchor="end" fill="#f59e0b" fontSize="9" fontWeight="bold">-2 SD</text>

            {/* -3 SD */}
            <line x1={paddingLeft} y1={getSvgY(-3)} x2={svgWidth - paddingRight} y2={getSvgY(-3)} stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 2" />
            <text x={paddingLeft - 8} y={getSvgY(-3) + 3} textAnchor="end" fill="#f43f5e" fontSize="9" fontWeight="bold">-3 SD</text>

            {/* Connecting lines between points */}
            {chartPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
                points={chartPoints
                  .map((p, idx) => {
                    const step = chartPoints.length > 1 ? usableWidth / (chartPoints.length - 1) : 0;
                    const x = paddingLeft + idx * step;
                    const y = getSvgY(p.deviationSd);
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}

            {/* Data points */}
            {chartPoints.map((p, idx) => {
              const step = chartPoints.length > 1 ? usableWidth / (chartPoints.length - 1) : 0;
              const x = paddingLeft + idx * step;
              const y = getSvgY(p.deviationSd);
              const isReject = Math.abs(p.deviationSd) > 3;
              const isWarn = Math.abs(p.deviationSd) > 2 && !isReject;
              const color = isReject ? '#f43f5e' : isWarn ? '#f59e0b' : '#10b981';

              return (
                <g key={p.id}>
                  <circle cx={x} cy={y} r="5" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                  <text x={x} y={svgHeight - 6} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                    {p.runDate.slice(5)}
                  </text>
                  <text x={x} y={y - 8} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    {p.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Westgard Rules Diagnostic Reference */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
            <Info className="h-4 w-4 text-purple-600" />
            <span>Règles d'Interprétation Multirègles de Westgard :</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-600">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <strong className="text-amber-800 block">Règle 1₂s (Avertissement)</strong>
              Un point dépasse la limite de ± 2 SD. Examiner la tendance sans nécessairement rejeter la série.
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <strong className="text-rose-800 block">Règle 1₃s (Rejet Aléatoire)</strong>
              Un point dépasse la limite de ± 3 SD. Série rejetée : calibrage ou réactif corrompu.
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <strong className="text-rose-800 block">Règle 2₂s & R₄s (Rejet Systématique)</strong>
              Deux points consécutifs hors ± 2 SD ou écart de 4 SD. Signe d'un biais systématique de l'appareil.
            </div>
          </div>
        </div>
      </div>

      {/* CQI RUNS TABLE WITH BIOLOGIST SIGN-OFF */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-x-auto">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Historique des Passages & Validation Biologique ({materialRuns.length} passages)
          </h3>
          <span className="text-xs text-slate-500">Conformité métrologique et traçabilité</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-4">Date du Contrôle</th>
              <th className="py-3 px-3">Matériel CQI</th>
              <th className="py-3 px-3">Paramètre</th>
              <th className="py-3 px-3 text-right">Valeur Mesurée</th>
              <th className="py-3 px-3 text-right">Déviation (SD)</th>
              <th className="py-3 px-3">Statut Westgard</th>
              <th className="py-3 px-3">Technicien</th>
              <th className="py-3 px-4">Visa Biologiste</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {materialRuns.slice().reverse().map(run => (
              <tr key={run.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-800">
                  {formatDate(run.runDate)}
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900">{run.materialName}</td>
                <td className="py-3 px-3 font-mono font-bold text-purple-700">{run.parameterCode}</td>
                <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                  {run.value}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  <span className={run.deviationSd > 0 ? 'text-blue-600' : 'text-slate-700'}>
                    {run.deviationSd > 0 ? `+${run.deviationSd}` : run.deviationSd} SD
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      run.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : run.status === 'WARNING_1_2S'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {run.status === 'ACCEPTED'
                      ? '✓ CONFORME'
                      : run.status === 'WARNING_1_2S'
                      ? '⚠️ ALERTE 1-2S'
                      : '⛔ REJET WESTGARD'}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-500">{run.technicianName}</td>
                <td className="py-3 px-4">
                  {run.biologistValidation?.validated ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{run.biologistValidation.validatedBy}</span>
                    </div>
                  ) : (
                    (currentRole === 'BIOLOGIST' || currentRole === 'SUPER_ADMIN') ? (
                      <button
                        onClick={() => handleValidateRun(run.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-xs"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        Viser la série
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-semibold">En attente de visa</span>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: Saisie Contrôle CQI */}
      <Modal
        isOpen={isAddRunModalOpen}
        onClose={() => setIsAddRunModalOpen(false)}
        title="Enregistrer une Mesure de Contrôle Qualité (CQI)"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRun} className="space-y-4 text-xs">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
            <span className="font-bold text-purple-900 block">{activeMaterial?.name}</span>
            <p className="text-[11px] text-purple-700 mt-0.5">
              Paramètre : <strong>{activeMaterial?.parameterName} ({activeMaterial?.parameterCode})</strong> • Moyenne cible : <strong>{activeMaterial?.targetMean} {activeMaterial?.unit}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date du Passage</label>
              <input
                type="date"
                required
                value={runDate}
                onChange={e => setRunDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Valeur Obtenue ({activeMaterial?.unit})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={runValue}
                onChange={e => setRunValue(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 p-2 font-black text-slate-900 text-sm"
              />
            </div>
          </div>

          {activeMaterial && (
            <div className="p-3 bg-slate-50 rounded-lg text-slate-600 text-[11px] space-y-1">
              <span className="font-bold text-slate-700 block">Calcul de Déviation instantané :</span>
              {(() => {
                const dev = parseFloat(((runValue - activeMaterial.targetMean) / activeMaterial.standardDeviation).toFixed(2));
                const isRej = Math.abs(dev) > 3;
                const isWarn = Math.abs(dev) > 2 && !isRej;
                return (
                  <p className={`font-mono font-bold ${isRej ? 'text-rose-600' : isWarn ? 'text-amber-600' : 'text-emerald-600'}`}>
                    Écart : {dev > 0 ? `+${dev}` : dev} SD — {isRej ? 'DÉVIATION CRITIQUE (> 3 SD)' : isWarn ? 'ATTENTION (2 à 3 SD)' : 'CONFORME (≤ 2 SD)'}
                  </p>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddRunModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-md"
            >
              Enregistrer le Contrôle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
