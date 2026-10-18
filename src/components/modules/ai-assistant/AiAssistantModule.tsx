import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  Brain,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { TestResult, Patient } from '../../../types/index.ts';

export const AiAssistantModule: React.FC = () => {
  const { results, orders, patients } = useData();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    inconsistencies: string[];
    criticalAlerts: string[];
    clinicalSummary: string;
    recommendations: string[];
  } | null>(null);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientResults = results.filter(r => r.patientId === selectedPatientId);

  const handleRunAiAnalysis = () => {
    setAnalyzing(true);
    setAiAnalysisResult(null);

    setTimeout(() => {
      // Analyze patient results for biological coherence and critical values
      const inconsistencies: string[] = [];
      const criticalAlerts: string[] = [];
      const recommendations: string[] = [];

      let hasAnemia = false;
      let hasLeukocytosis = false;
      let hasHyperglycemia = false;

      patientResults.forEach(res => {
        res.values.forEach(v => {
          if (v.flag === 'CRITICAL') {
            criticalAlerts.push(`Valeur Critique détectée : ${v.parameterName} = ${v.value} ${v.unit} (${v.referenceText}). Contacter le médecin traitant en urgence.`);
          }
          if (v.parameterCode === 'HB' && v.numericValue && v.numericValue < 11.5) {
            hasAnemia = true;
          }
          if (v.parameterCode === 'GB' && v.numericValue && v.numericValue > 10.5) {
            hasLeukocytosis = true;
          }
          if (v.parameterCode === 'GLU' && v.numericValue && v.numericValue > 1.26) {
            hasHyperglycemia = true;
          }
        });
      });

      if (hasAnemia && hasLeukocytosis) {
        inconsistencies.push('Association Anémie + Hyperleucocytose : Suggère un syndrome inflammatoire ou infectieux actif.');
        recommendations.push('Recommander un contrôle de la CRP ou de la VS et un frottis sanguin coloré au MGG.');
      }

      if (hasHyperglycemia) {
        recommendations.push('Glycémie à jeun supérieure au seuil diagnostique de diabète (> 1.26 g/L). Préconiser le dosage de l\'HbA1c pour confirmation.');
      }

      if (inconsistencies.length === 0 && criticalAlerts.length === 0) {
        recommendations.push('Constantes biologiques cohérentes sans discordance technique majeure relevée.');
      }

      const summary = `Patient ${selectedPatient?.firstName} ${selectedPatient?.lastName} (${selectedPatient?.gender}, né(e) le ${selectedPatient?.dateOfBirth}). Dossier comprenant ${patientResults.length} examen(s) analysé(s). ` +
        (hasAnemia ? 'Profil cytologique montrant un abaissement de la charge hémoglobinique. ' : 'Formule hématologique dans les limites attendues. ') +
        (criticalAlerts.length > 0 ? 'ATTENTION : Présence d\'un ou plusieurs paramètres en zone d\'alerte critique.' : 'Pas de valeur critique vitale immédiate.');

      setAiAnalysisResult({
        inconsistencies,
        criticalAlerts,
        clinicalSummary: summary,
        recommendations
      });
      setAnalyzing(false);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-100 text-purple-800 px-2 py-0.5 text-xs font-bold mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            Module d'Aide à la Décision Biologique
          </div>
          <h2 className="text-xl font-bold text-slate-800">Contrôle Qualité & Détection des Incohérences</h2>
          <p className="text-xs text-slate-500">
            Assistance au biologiste : corrélation inter-paramètres, delta checks et détection des valeurs atypiques
          </p>
        </div>
      </div>

      {/* Mandatory Regulatory / Ethical Disclaimer (Requirement 74) */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Avertissement Déontologique Médical & Réglementaire :</p>
          <p className="text-amber-800 leading-relaxed">
            Ce module d'intelligence artificielle est un outil technique d'aide à la décision biologique. Il ne pose aucun diagnostic autonome et ne se substitue en aucun cas à la responsabilité intellectuelle et clinique du biologiste médical ou du médecin prescripteur.
          </p>
        </div>
      </div>

      {/* Patient Selector & Action Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Sélectionner un dossier patient à contrôler :
          </label>
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-purple-500 focus:outline-none"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} ({p.patientNumber})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRunAiAnalysis}
          disabled={analyzing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {analyzing ? 'Analyse en cours...' : 'Lancer le Contrôle Biologique IA'}
        </button>
      </div>

      {/* Results of AI Evaluation */}
      {aiAnalysisResult && (
        <div className="space-y-4">
          {/* Critical alerts */}
          {aiAnalysisResult.criticalAlerts.length > 0 && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Valeurs Critiques (Alerte Panique Biologique) :</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {aiAnalysisResult.criticalAlerts.map((alt, idx) => (
                  <li key={idx} className="font-semibold">{alt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Inconsistencies detected */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span>Cohérence Biologique & Concordance Inter-Examens</span>
            </h3>

            {aiAnalysisResult.inconsistencies.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold p-3 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Aucune discordance physiologique ou analytique détectée sur ce bilan.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {aiAnalysisResult.inconsistencies.map((inc, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-900">
                    {inc}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinical summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2 text-xs">
            <h3 className="font-bold text-slate-800 text-sm">
              Synthèse Biologique Automatisée pour le Médecin Prescripteur
            </h3>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100 font-mono text-[11px]">
              {aiAnalysisResult.clinicalSummary}
            </p>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2 text-xs">
            <h3 className="font-bold text-slate-800 text-sm">
              Recommandations Pratiques de Validation de Paillasse
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              {aiAnalysisResult.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
