import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  Eye,
  FileText,
  User,
  FlaskConical,
  Printer,
  Sparkles,
  Info
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { TestResult, ResultValue, ResultFlag, MedicalReport } from '../../../types/index.ts';
import { StatusBadge } from '../../common/StatusBadge.tsx';
import { Modal } from '../../common/Modal.tsx';
import { ConfirmDialog } from '../../common/ConfirmDialog.tsx';
import { formatDate, formatDateTime } from '../../../services/i18n.ts';
import { WhatsAppService } from '../../../services/whatsappService.ts';

interface ResultsModuleProps {
  onNavigateToReports?: (reportId: string) => void;
}

export const ResultsModule: React.FC<ResultsModuleProps> = ({ onNavigateToReports }) => {
  const { results, tests, reports, saveResultValues, validateResult, emergencyPartialValidateResult, settings } = useData();
  const { canValidateResults, canEnterResults, canEmergencyValidate, canPrintReport, currentUser, currentRole } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Active result being entered or reviewed
  const [editingResult, setEditingResult] = useState<TestResult | null>(null);
  const [formValues, setFormValues] = useState<ResultValue[]>([]);

  // Biologist validation confirmation
  const [validatingResult, setValidatingResult] = useState<TestResult | null>(null);
  const [validationComment, setValidationComment] = useState('');

  // Emergency Partial Validation Modal (Technician Requirement)
  const [emergencyResultToValidate, setEmergencyResultToValidate] = useState<TestResult | null>(null);
  const [emergencyComment, setEmergencyComment] = useState('Urgence vitale : transmission rapide pour prise en charge clinique.');

  // Post-validation WhatsApp notification / Print prompt
  const [newlyCreatedReport, setNewlyCreatedReport] = useState<MedicalReport | null>(null);
  const [isEmergencyReportModal, setIsEmergencyReportModal] = useState(false);
  const [waSendStatus, setWaSendStatus] = useState<string>('');

  const filteredResults = results.filter(r => {
    const matchesSearch =
      r.testName.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenEditor = (res: TestResult) => {
    setEditingResult(res);
    setFormValues([...res.values]);
  };

  /**
   * Helper to recalculate flags automatically when user inputs a value
   */
  const handleValueChange = (index: number, rawVal: string) => {
    const updated = [...formValues];
    const valObj = { ...updated[index] };
    valObj.value = rawVal;

    const targetTest = tests.find(t => t.id === editingResult?.testId);
    const paramDef = targetTest?.parameters.find(p => p.id === valObj.parameterId);

    const num = parseFloat(rawVal.replace(',', '.'));
    if (!isNaN(num) && paramDef?.resultType === 'NUMERIC') {
      valObj.numericValue = num;

      if (paramDef) {
        if (paramDef.criticalMin !== undefined && num <= paramDef.criticalMin) {
          valObj.flag = 'CRITICAL';
        } else if (paramDef.criticalMax !== undefined && num >= paramDef.criticalMax) {
          valObj.flag = 'CRITICAL';
        } else if (paramDef.referenceMin !== undefined && num < paramDef.referenceMin) {
          valObj.flag = 'LOW';
        } else if (paramDef.referenceMax !== undefined && num > paramDef.referenceMax) {
          valObj.flag = 'HIGH';
        } else {
          valObj.flag = 'NORMAL';
        }
      }
    } else {
      valObj.numericValue = undefined;
      const lower = rawVal.toLowerCase().trim();
      if (
        lower.includes('positif') ||
        lower.includes('positive') ||
        lower.includes('présence') ||
        lower.includes('presence') ||
        lower.includes('réactif') ||
        lower.includes('reactif') ||
        lower.includes('anormal')
      ) {
        valObj.flag = 'HIGH';
      } else {
        valObj.flag = 'NORMAL';
      }
    }

    updated[index] = valObj;
    setFormValues(updated);
  };

  const handleSaveValues = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;
    saveResultValues(editingResult.id, formValues);
    setEditingResult(null);
  };

  /**
   * Biologist Final Validation Handler
   */
  const handleConfirmValidation = async () => {
    if (!validatingResult) return;
    try {
      const generatedReport = await validateResult(validatingResult.id, validationComment);
      setValidatingResult(null);
      setValidationComment('');

      if (generatedReport) {
        setIsEmergencyReportModal(false);
        setNewlyCreatedReport(generatedReport);
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la validation.');
    }
  };

  /**
   * Technician Emergency Partial Validation Handler
   * "Mais en cas d'urgence le technicien pourra valider un rapport mais partiellement."
   */
  const handleConfirmEmergencyPartialValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyResultToValidate) return;

    try {
      // Save current values first if open in editor
      if (editingResult && editingResult.id === emergencyResultToValidate.id) {
        saveResultValues(emergencyResultToValidate.id, formValues);
        setEditingResult(null);
      }

      const partialReport = await emergencyPartialValidateResult(
        emergencyResultToValidate.id,
        emergencyComment
      );

      setEmergencyResultToValidate(null);

      if (partialReport) {
        setIsEmergencyReportModal(true);
        setNewlyCreatedReport(partialReport);
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la validation partielle d\'urgence.');
    }
  };

  const handleSendReportWhatsApp = async (report: MedicalReport) => {
    setWaSendStatus('Envoi en cours...');
    const message = report.isPartialEmergency
      ? `🚨 *RAPPORT PARTIEL D'URGENCE*\nBonjour ${report.patientName},\n\nUn rapport partiel d'urgence pour votre examen (${report.reportNumber}) a été validé techniquement par ${report.partialValidatedBy || 'le technicien'}.\nConsultez le rapport partiel en ligne : ${report.publicUrl}`
      : `Bonjour ${report.patientName},\n\nVos résultats d'analyses complètes (${report.reportNumber}) sont officiellement validés par le biologiste ${report.validatedBy}.\nConsultez votre rapport certifié : ${report.publicUrl}`;

    const res = await WhatsAppService.sendMessage({
      recipientPhone: '+221 77 654 11 22',
      recipientName: report.patientName,
      templateType: 'REPORT',
      messageText: message,
      referenceNumber: report.reportNumber,
      sentBy: currentUser?.name || 'Laboratoire'
    });

    if (res.success) {
      setWaSendStatus('Succès : Notification WhatsApp transmise au patient !');
      setTimeout(() => {
        setNewlyCreatedReport(null);
        setWaSendStatus('');
      }, 2500);
    } else {
      setWaSendStatus('Erreur : ' + (res.error || 'Échec d\'envoi'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Role Permissions Banner */}
      <div className="rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50 via-sky-50 to-indigo-50 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">
                  Saisie Analytique & Validation des Comptes-Rendus
                </h3>
                <span className="rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
                  Étape 3 : Technique & Biologie
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                {currentRole === 'TECHNICIAN' && (
                  <span>
                    🔬 <strong>Rôle Technicien :</strong> Vous saisissez les résultats des automates. <strong>En cas d'urgence</strong>, vous êtes habilité à <strong>valider un rapport mais partiellement</strong> pour transmission immédiate au médecin.
                  </span>
                )}
                {currentRole === 'BIOLOGIST' && (
                  <span>
                    👩‍⚕️ <strong>Rôle Biologiste :</strong> Vous exercez la responsabilité médicale légale : <strong>validation biologique définitive</strong> de chaque paramètre et signature du rapport médical final complet.
                  </span>
                )}
                {currentRole === 'RECEPTION' && (
                  <span>
                    📋 <strong>Rôle Réceptionniste :</strong> Consultation des résultats et <strong>impression des rapports complets ou partiels</strong> validés pour remise aux patients. La saisie des automates et la validation biologique sont strictement réservées au personnel de laboratoire.
                  </span>
                )}
                {(currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN' || currentRole === 'MANAGER' || currentRole === 'ACCOUNTANT' || currentRole === 'DOCTOR') && (
                  <span>
                    Contrôle des analyses, validation biologique et délivrance des comptes-rendus certifiés ({results.length} examens).
                  </span>
                )}
              </p>
            </div>
          </div>
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
            placeholder="Rechercher par examen, N° demande, patient..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">Tous les statuts ({results.length})</option>
          <option value="PENDING">En attente de saisie</option>
          <option value="ENTERED">Saisis (En attente visa)</option>
          <option value="PARTIALLY_VALIDATED">Validés partiellement (Urgence)</option>
          <option value="VALIDATED">Validés biologiquement</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">N° Demande</th>
                <th className="py-3 px-4 font-semibold">Examen Médical</th>
                <th className="py-3 px-4 font-semibold">Discipline</th>
                <th className="py-3 px-4 font-semibold">Patient</th>
                <th className="py-3 px-4 font-semibold">Échantillon</th>
                <th className="py-3 px-4 font-semibold">Technicien</th>
                <th className="py-3 px-4 font-semibold">Statut</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucun résultat trouvé.
                  </td>
                </tr>
              ) : (
                filteredResults.map(r => {
                  const linkedReport = reports.find(rp => rp.orderId === r.orderId);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{r.orderNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{r.testName}</td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{r.patientName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{r.sampleNumber}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {r.technicianName || <span className="italic text-slate-400">Non saisi</span>}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Saisie / Consultation */}
                          {r.status !== 'VALIDATED' && (
                            <button
                              onClick={() => handleOpenEditor(r)}
                              className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              {canEnterResults()
                                ? r.status === 'PENDING'
                                  ? 'Saisir Résultats'
                                  : 'Modifier Valeurs'
                                : 'Consulter Valeurs'}
                            </button>
                          )}

                          {/* Emergency Partial Validation (Technician) */}
                          {(r.status === 'ENTERED' || r.status === 'PENDING') && canEmergencyValidate() && (
                            <button
                              onClick={() => {
                                setEmergencyResultToValidate(r);
                                setEmergencyComment('Urgence vitale : transmission rapide pour prise en charge clinique.');
                              }}
                              className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-amber-700 transition-colors shadow-2xs flex items-center gap-1"
                              title="Validation Partielle d'Urgence par le technicien"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Valider Urgence (Partiel)
                            </button>
                          )}

                          {/* Biologist Final Validation */}
                          {(r.status === 'ENTERED' || r.status === 'PARTIALLY_VALIDATED') && canValidateResults() && (
                            <button
                              onClick={() => setValidatingResult(r)}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {r.status === 'PARTIALLY_VALIDATED' ? 'Valider Définitif (Biologiste)' : 'Valider Résultat'}
                            </button>
                          )}

                          {/* When ENTERED and user is not Biologist nor can emergency validate */}
                          {r.status === 'ENTERED' && !canValidateResults() && !canEmergencyValidate() && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
                              <Clock className="h-3 w-3 text-amber-600" />
                              Visa Biologiste requis
                            </span>
                          )}

                          {/* When PARTIALLY_VALIDATED */}
                          {r.status === 'PARTIALLY_VALIDATED' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                              <AlertTriangle className="h-3 w-3 text-amber-700" />
                              Partiel Urgent ({r.partialValidatedBy?.split(' ')[0] || 'Technicien'})
                            </span>
                          )}

                          {/* When VALIDATED */}
                          {r.status === 'VALIDATED' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Signé par {r.validatedBy?.split(' ')[1] || 'Biologiste'}
                            </span>
                          )}

                          {/* Direct Print Button for Receptionist & Technician */}
                          {(r.status === 'VALIDATED' || r.status === 'PARTIALLY_VALIDATED') && canPrintReport() && (
                            <button
                              onClick={() => {
                                if (linkedReport && onNavigateToReports) {
                                  onNavigateToReports(linkedReport.id);
                                } else {
                                  window.print();
                                }
                              }}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                                r.status === 'PARTIALLY_VALIDATED'
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                              }`}
                              title={
                                r.status === 'PARTIALLY_VALIDATED'
                                  ? "Imprimer le Rapport Partiel d'Urgence"
                                  : "Imprimer le Rapport Médical Complet"
                              }
                            >
                              <Printer className="h-3.5 w-3.5" />
                              {r.status === 'PARTIALLY_VALIDATED' ? 'Imprimer Partiel' : 'Imprimer Rapport'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Value Editor Modal */}
      {editingResult && (
        <Modal
          isOpen={!!editingResult}
          onClose={() => setEditingResult(null)}
          title={`Saisie des Paramètres : ${editingResult.testName}`}
          subtitle={`Demande : ${editingResult.orderNumber} • Patient : ${editingResult.patientName}`}
          maxWidth="4xl"
        >
          <form onSubmit={handleSaveValues} className="space-y-4 text-xs">
            {!canEnterResults() && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Mode Consultation :</strong> En tant que réceptionniste, vous pouvez consulter les valeurs brutes mais la modification est réservée aux techniciens et biologistes.
                </span>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">PARAMÈTRE ANALYSÉ</th>
                    <th className="py-2.5 px-3 font-semibold w-40">RÉSULTAT OBTENU</th>
                    <th className="py-2.5 px-3 font-semibold">UNITÉ</th>
                    <th className="py-2.5 px-3 font-semibold">NORMES DE RÉFÉRENCE</th>
                    <th className="py-2.5 px-3 font-semibold">ALARME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formValues.map((val, idx) => {
                    const targetTest = tests.find(t => t.id === editingResult?.testId);
                    const paramDef = targetTest?.parameters.find(p => p.id === val.parameterId);
                    const options =
                      paramDef?.options && paramDef.options.length > 0
                        ? paramDef.options
                        : paramDef?.resultType === 'POSITIVE_NEGATIVE'
                        ? ['Négative', 'Positive']
                        : [];

                    return (
                      <tr key={val.parameterId} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          <div>{val.parameterName}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">{val.parameterCode}</span>
                            {paramDef?.resultType && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded font-medium">
                                {paramDef.resultType === 'POSITIVE_NEGATIVE'
                                  ? 'Positif / Négatif'
                                  : paramDef.resultType === 'SELECT'
                                  ? 'Options'
                                  : paramDef.resultType}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 min-w-[200px]">
                          {/* Option Chips for Quick Saisie */}
                          {options.length > 0 && canEnterResults() && (
                            <div className="flex flex-wrap gap-1 mb-1.5">
                              {options.map(opt => {
                                const isSelected = val.value.trim().toLowerCase() === opt.trim().toLowerCase();
                                const isPos =
                                  opt.toLowerCase().includes('positif') ||
                                  opt.toLowerCase().includes('positive') ||
                                  opt.toLowerCase().includes('présence') ||
                                  opt.toLowerCase().includes('presence') ||
                                  opt.toLowerCase().includes('réactif') ||
                                  opt.toLowerCase().includes('anormal');

                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleValueChange(idx, opt)}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                      isSelected
                                        ? isPos
                                        : isPos
                                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    } ${
                                      isSelected && isPos
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : isSelected && !isPos
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : ''
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <input
                            type="text"
                            value={val.value}
                            onChange={e => handleValueChange(idx, e.target.value)}
                            placeholder={canEnterResults() ? (options.length > 0 ? 'Choisir ou saisir...' : 'Saisir...') : 'Non renseigné'}
                            disabled={!canEnterResults()}
                            readOnly={!canEnterResults()}
                            className={`w-full rounded-lg border p-1.5 text-xs font-semibold focus:outline-none ${
                              !canEnterResults()
                                ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                                : 'border-slate-300 focus:border-blue-500'
                            }`}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-medium">{val.unit || '-'}</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-semibold">{val.referenceText}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={val.flag} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                {canEnterResults()
                  ? 'Les anomalies et valeurs critiques sont détectées automatiquement.'
                  : 'Consultation seule pour le personnel d\'accueil.'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingResult(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {canEnterResults() ? 'Annuler' : 'Fermer'}
                </button>

                {/* Emergency Partial Validation directly inside Editor */}
                {canEmergencyValidate() && (
                  <button
                    type="button"
                    onClick={() => {
                      const resToValidate = editingResult;
                      setEmergencyResultToValidate(resToValidate);
                      setEmergencyComment('Urgence vitale : transmission rapide pour prise en charge clinique.');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-sm"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Valider Partiellement en Urgence
                  </button>
                )}

                {canEnterResults() && (
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                  >
                    Enregistrer les Résultats
                  </button>
                )}
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Emergency Partial Validation Modal (Technician Requirement) */}
      {emergencyResultToValidate && (
        <Modal
          isOpen={!!emergencyResultToValidate}
          onClose={() => setEmergencyResultToValidate(null)}
          title="Validation Partielle d'Urgence (Technicien)"
          subtitle={`Examen : ${emergencyResultToValidate.testName} • Demande : ${emergencyResultToValidate.orderNumber}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmEmergencyPartialValidation} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <span>Procédure Dérogatoire d'Urgence</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Conformément aux règles du laboratoire, <strong>en cas d'urgence le technicien peut valider un rapport mais partiellement</strong>. Un rapport médical partiel d'urgence sera immédiatement imprimable par le technicien ou la réception. Le biologiste effectuera ensuite la validation finale complète.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <p>
                Patient : <strong>{emergencyResultToValidate.patientName}</strong>
              </p>
              <p>
                Analyste habilité : <strong>{currentUser?.name || 'Technicien Supérieur de Labo'}</strong>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Motif d'urgence / Renseignement clinique <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={emergencyComment}
                onChange={e => setEmergencyComment(e.target.value)}
                placeholder="Ex: Urgence vitale réanimation, glycémie critique, suspicion choc septique..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEmergencyResultToValidate(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-md active:scale-95 transition-all"
              >
                <AlertTriangle className="h-4 w-4" />
                Confirmer la Validation Partielle d'Urgence
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Biologist Validation Confirmation Dialog (Biologist Requirement) */}
      <ConfirmDialog
        isOpen={!!validatingResult}
        title="Validation Biologique Officielle & Signature"
        message={`Êtes-vous certain de vouloir valider définitivement les résultats de l'examen ${validatingResult?.testName} pour le patient ${validatingResult?.patientName} ? Cette action apposera votre signature électronique officielle de biologiste et libérera le compte-rendu médical final pour impression.`}
        confirmLabel="Valider et Signer Électroniquement"
        variant="success"
        requireReason={false}
        onConfirm={handleConfirmValidation}
        onCancel={() => setValidatingResult(null)}
      />

      {/* Post-Validation Report Notification Banner */}
      {newlyCreatedReport && (
        <Modal
          isOpen={!!newlyCreatedReport}
          onClose={() => setNewlyCreatedReport(null)}
          title={
            newlyCreatedReport.isPartialEmergency
              ? "🚨 Rapport Partiel d'Urgence Émis avec Succès"
              : "Rapport Médical Validé et Signé avec Succès"
          }
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs text-center py-2">
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto shadow-xs ${
                newlyCreatedReport.isPartialEmergency
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {newlyCreatedReport.isPartialEmergency ? (
                <AlertTriangle className="h-7 w-7" />
              ) : (
                <ShieldCheck className="h-7 w-7" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800">
                Rapport N° {newlyCreatedReport.reportNumber}
              </h3>
              <p className="text-slate-500 mt-1">
                {newlyCreatedReport.isPartialEmergency
                  ? "Rapport partiel validé par le technicien. Immédiatement imprimable pour urgence vitale."
                  : "Toutes les analyses de la demande sont validées par le biologiste. Le compte-rendu certifié est prêt pour impression."}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
              <div>
                <strong>Patient :</strong> {newlyCreatedReport.patientName} ({newlyCreatedReport.patientNumber})
              </div>
              <div>
                <strong>Validateur :</strong> {newlyCreatedReport.validatedBy}
              </div>
              <div>
                <strong>Lien sécurisé QR :</strong>{' '}
                <span className="font-mono text-blue-600">{newlyCreatedReport.publicUrl}</span>
              </div>
            </div>

            {waSendStatus && (
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs">
                {waSendStatus}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSendReportWhatsApp(newlyCreatedReport)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition-all"
              >
                <Send className="h-4 w-4" />
                Envoyer par WhatsApp
              </button>

              {/* Direct Print Button for Receptionist & Technician */}
              {canPrintReport() && (
                <button
                  type="button"
                  onClick={() => {
                    const rptId = newlyCreatedReport.id;
                    setNewlyCreatedReport(null);
                    if (onNavigateToReports) {
                      onNavigateToReports(rptId);
                    } else {
                      window.print();
                    }
                  }}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-md transition-all ${
                    newlyCreatedReport.isPartialEmergency
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Printer className="h-4 w-4" />
                  {newlyCreatedReport.isPartialEmergency
                    ? "Imprimer Rapport Partiel d'Urgence"
                    : "Imprimer Rapport Médical Complet"}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
