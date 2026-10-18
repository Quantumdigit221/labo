import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Building,
  User,
  FlaskConical,
  ArrowLeft
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { MedicalReport } from '../../../types/index.ts';
import { formatDate, formatDateTime } from '../../../services/i18n.ts';

interface VerificationPortalProps {
  reportNumber: string;
  onBackToApp: () => void;
}

export const VerificationPortal: React.FC<VerificationPortalProps> = ({ reportNumber, onBackToApp }) => {
  const { reports, results, settings } = useData();

  const report = reports.find(
    r => r.reportNumber.toLowerCase() === reportNumber.toLowerCase() || r.verificationCode.toLowerCase() === reportNumber.toLowerCase()
  );

  const [dobInput, setDobInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    if (dobInput.trim() === report.patientDob) {
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Date de naissance incorrecte. Accès refusé pour des raisons de confidentialité médicale.');
    }
  };

  const reportResults = report
    ? results.filter(r => r.orderId === report.orderId && r.status === 'VALIDATED')
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100 p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        <button
          onClick={onBackToApp}
          className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au logiciel de gestion
        </button>

        {/* Brand header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-2">
            <FlaskConical className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">
            {settings.name}
          </h1>
          <p className="text-xs text-blue-200">
            Portail Public Officiel de Vérification d'Authenticité des Résultats
          </p>
        </div>

        {/* Verification Card */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
          {report ? (
            <div className="space-y-6">
              {/* Authenticity Seal */}
              <div className="flex items-center gap-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-400 text-sm">
                      RAPPORT MÉDICAL AUTHENTIQUE & CONFORME
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Ce compte-rendu a bien été émis et signé électroniquement par le laboratoire.
                  </p>
                </div>
              </div>

              {/* Public metadata (no private medical values without verification) */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Numéro de Rapport</span>
                  <p className="font-mono font-bold text-white text-sm mt-0.5">{report.reportNumber}</p>
                </div>

                <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date de Validation</span>
                  <p className="font-medium text-white text-xs mt-0.5">{formatDateTime(report.validatedAt)}</p>
                </div>

                <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Biologiste Validateur</span>
                  <p className="font-bold text-white text-xs mt-0.5">{report.validatedBy}</p>
                </div>

                <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Patient (Initiales)</span>
                  <p className="font-bold text-white text-xs mt-0.5">
                    {report.patientName.split(' ').map(n => n[0] + '***').join(' ')}
                  </p>
                </div>
              </div>

              {/* Security Gate (Requirement 18: Never display medical records publicly without authorization) */}
              {!isUnlocked ? (
                <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-blue-300 font-semibold text-xs">
                    <Lock className="h-4 w-4" />
                    <span>Déverrouiller le compte-rendu complet</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Pour accéder aux valeurs d'analyses détaillées, veuillez confirmer la date de naissance du patient titulaire :
                  </p>

                  <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="date"
                      required
                      value={dobInput}
                      onChange={e => setDobInput(e.target.value)}
                      className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none flex-1"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      Consulter les résultats
                    </button>
                  </form>

                  {errorMsg && (
                    <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
                  )}
                </div>
              ) : (
                /* Unlocked Full Results */
                <div className="space-y-4 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Unlock className="h-4 w-4" />
                      Accès Autorisé — Titulaire : {report.patientName}
                    </span>
                    <span className="font-mono text-slate-400">N° {report.patientNumber}</span>
                  </div>

                  <div className="space-y-3">
                    {reportResults.map(res => (
                      <div key={res.id} className="rounded-lg bg-slate-900/80 border border-slate-700 p-3 space-y-2 text-xs">
                        <div className="font-bold text-blue-400 border-b border-slate-800 pb-1">
                          {res.testName}
                        </div>
                        <div className="space-y-1">
                          {res.values.map(v => (
                            <div key={v.parameterId} className="flex items-center justify-between py-1 border-b border-slate-800/40 text-[11px]">
                              <span className="text-slate-300">{v.parameterName}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-white">{v.value} {v.unit}</span>
                                <span className="text-slate-400 text-[10px]">({v.referenceText})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Rapport Introuvable ou Invalide</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Le numéro « {reportNumber} » ne correspond à aucun document authentifié dans les registres officiels de ce laboratoire.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-500">
          Système Sécurisé ExtremeLab Next • Certificat Cryptographique LIS 2026
        </p>
      </div>
    </div>
  );
};
