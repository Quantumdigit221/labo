import React, { useState } from 'react';
import {
  FileText,
  Search,
  Printer,
  Send,
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  ExternalLink,
  QrCode,
  Building,
  Mail,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { MedicalReport, TestResult } from '../../../types/index.ts';
import { formatDate, formatDateTime, formatCurrency } from '../../../services/i18n.ts';
import { WhatsAppService } from '../../../services/whatsappService.ts';
import { Modal } from '../../common/Modal.tsx';

interface ReportsModuleProps {
  initialReportId?: string;
  onNavigateToPublicVerify?: (reportNumber: string) => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  initialReportId,
  onNavigateToPublicVerify
}) => {
  const { reports, results, settings, orders, samples, invoices } = useData();
  const { currentUser, canPrintReport } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(
    initialReportId ? reports.find(r => r.id === initialReportId) || reports[0] || null : reports[0] || null
  );

  const [waSending, setWaSending] = useState(false);
  const [waNotice, setWaNotice] = useState<string>('');
  const [printFormat, setPrintFormat] = useState<'A4' | 'THERMAL'>('A4');

  const filteredReports = reports.filter(
    r =>
      r.reportNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  // Associated detailed results for selected report (including partial emergency results)
  const currentResults: TestResult[] = selectedReport
    ? results.filter(
        r =>
          r.orderId === selectedReport.orderId &&
          (r.status === 'VALIDATED' || r.status === 'PARTIALLY_VALIDATED')
      )
    : [];

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = async () => {
    if (!selectedReport) return;
    setWaSending(true);
    setWaNotice('Préparation et transmission du message WhatsApp...');

    const res = await WhatsAppService.sendMessage({
      recipientPhone: '+221 77 654 11 22',
      recipientName: selectedReport.patientName,
      templateType: 'REPORT',
      messageText: `Bonjour ${selectedReport.patientName},\n\nVos résultats d'analyses médicales sont validés et disponibles auprès du laboratoire *${settings.name}*.\n\n📑 *Rapport N° :* ${selectedReport.reportNumber}\n🔬 *Prescription :* ${selectedReport.orderNumber}\n👩‍⚕️ *Biologiste :* ${selectedReport.validatedBy}\n\nConsultez votre rapport officiel avec vérification QR : \n🔗 ${selectedReport.publicUrl}\n\nMerci de votre confiance.`,
      referenceNumber: selectedReport.reportNumber,
      sentBy: currentUser?.name || 'Biologiste'
    });

    setWaSending(false);
    if (res.success) {
      setWaNotice('✅ Message WhatsApp transmis avec succès au patient !');
      setTimeout(() => setWaNotice(''), 3000);
    } else {
      setWaNotice('⚠️ Échec : ' + (res.error || 'Erreur passerelle'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Comptes-Rendus & Rapports Médicaux</h2>
          <p className="text-xs text-slate-500">
            Édition certifiée des résultats, signature biologique, vérification QR code et export PDF ({reports.length} rapports)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPrintFormat(printFormat === 'A4' ? 'THERMAL' : 'A4')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Format d'impression : <strong>{printFormat}</strong>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Printer className="h-4 w-4" />
            Imprimer {printFormat}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Reports */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par N° rapport, patient..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {filteredReports.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">Aucun rapport validé disponible.</p>
            ) : (
              filteredReports.map(rp => {
                const isSelected = selectedReport?.id === rp.id;
                return (
                  <div
                    key={rp.id}
                    onClick={() => setSelectedReport(rp)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-700">{rp.reportNumber}</span>
                      {rp.isPartialEmergency || rp.status === 'PARTIALLY_VALIDATED' ? (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                          URGENCE (PARTIEL)
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          OFFICIEL COMPLET
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-800 text-xs mt-1">{rp.patientName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                      <span>Demande : {rp.orderNumber}</span>
                      <span>{formatDate(rp.validatedAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Preview of Official Medical Report (Requirement 17, 18, 58) */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="space-y-4">
              {/* Report Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Actions sur ce rapport :</span>
                  {waNotice && (
                    <span className="text-xs font-semibold text-emerald-700">{waNotice}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={waSending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Envoyer WhatsApp
                  </button>

                  {onNavigateToPublicVerify && (
                    <button
                      onClick={() => onNavigateToPublicVerify(selectedReport.reportNumber)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <QrCode className="h-3.5 w-3.5 text-blue-600" />
                      Portail Public Vérification QR
                    </button>
                  )}
                </div>
              </div>

              {/* Printable Medical Sheet (Styled like authentic medical report) */}
              <div
                id="printable-report"
                className={`bg-white border border-slate-300 rounded-xl shadow-lg p-8 sm:p-10 space-y-6 text-slate-900 ${
                  printFormat === 'THERMAL' ? 'max-w-xs mx-auto text-[11px] p-4' : 'max-w-3xl'
                }`}
              >
                {/* 1. Letterhead / En-tête officiel */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-6 border-b-2 border-slate-800 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        XL
                      </div>
                      <h1 className="text-xl font-extrabold uppercase tracking-tight text-blue-900">
                        {settings.name}
                      </h1>
                    </div>
                    <p className="text-xs text-slate-600 italic mt-0.5">{settings.slogan}</p>
                    <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                      <p>{settings.address} — {settings.city} ({settings.country})</p>
                      <p>Tél : {settings.phone} • WhatsApp : {settings.whatsapp}</p>
                      <p>Email : {settings.email} • {settings.taxNumber}</p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="inline-block rounded-md bg-blue-50 border border-blue-200 px-3 py-1 font-mono font-bold text-blue-800 text-xs">
                      {selectedReport.reportNumber}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Délivré le {formatDateTime(selectedReport.validatedAt)}</p>
                    <p className="text-[10px] font-mono text-slate-400">Réf : {selectedReport.verificationCode}</p>
                  </div>
                </div>

                {/* Emergency Partial Alert Banner */}
                {(selectedReport.isPartialEmergency || selectedReport.status === 'PARTIALLY_VALIDATED') && (
                  <div className="p-3.5 bg-amber-50 border-2 border-amber-400 rounded-xl text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-extrabold text-xs uppercase tracking-wider text-amber-950">
                          🚨 RAPPORT MÉDICAL PARTIEL D'URGENCE (TECHNICIEN)
                        </div>
                        <div className="text-[11px] text-amber-800 mt-0.5">
                          Émis et validé en urgence par le technicien <strong>{selectedReport.partialValidatedBy || selectedReport.validatedBy}</strong> pour décision clinique rapide. Le visa biologique définitif reste requis.
                        </div>
                      </div>
                    </div>
                    <span className="rounded bg-amber-200 text-amber-900 px-2.5 py-1 text-[10px] font-bold shrink-0">
                      PARTIEL
                    </span>
                  </div>
                )}

                {/* 2. Patient & Prescriber Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                      Renseignements Patient
                    </span>
                    <p className="text-sm font-bold text-slate-900">{selectedReport.patientName}</p>
                    <p className="text-slate-600">
                      N° Patient : <strong className="font-mono">{selectedReport.patientNumber}</strong>
                    </p>
                    <p className="text-slate-600">
                      Sexe : <strong>{selectedReport.patientGender === 'F' ? 'Féminin' : 'Masculin'}</strong> • Né(e) le :{' '}
                      <strong>{formatDate(selectedReport.patientDob)}</strong>
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                      Prescription Médicale
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedReport.doctorName || 'Prescription Directe au Laboratoire'}
                    </p>
                    <p className="text-slate-600">
                      Dossier Demande N° : <strong className="font-mono text-blue-700">{selectedReport.orderNumber}</strong>
                    </p>
                    <p className="text-slate-600">
                      Statut :{' '}
                      {selectedReport.isPartialEmergency || selectedReport.status === 'PARTIALLY_VALIDATED' ? (
                        <span className="text-amber-700 font-bold">Rapport Partiel d'Urgence</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">Rapport Biologique Définitif Validé</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* 3. Results Tables by Test (Requirement 17) */}
                <div className="space-y-6 pt-2">
                  {currentResults.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">Aucun résultat à afficher.</p>
                  ) : (
                    currentResults.map(res => (
                      <div key={res.id} className="space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                          <h3 className="font-bold text-sm text-blue-900 uppercase tracking-wide">
                            {res.testName} ({res.category})
                          </h3>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Échantillon : {res.sampleNumber}
                          </span>
                        </div>

                        <table className="w-full text-left text-xs">
                          <thead className="text-[11px] text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-1.5 font-bold">PARAMÈTRE ANALYSÉ</th>
                              <th className="py-1.5 font-bold text-center">RÉSULTAT</th>
                              <th className="py-1.5 font-bold text-center">UNITÉ</th>
                              <th className="py-1.5 font-bold text-right">VALEURS DE RÉFÉRENCE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {res.values.map(val => {
                              const isAbnormal = val.flag !== 'NORMAL';
                              return (
                                <tr key={val.parameterId} className={isAbnormal ? 'bg-amber-50/40 font-semibold' : ''}>
                                  <td className="py-2 text-slate-800">{val.parameterName}</td>
                                  <td
                                    className={`py-2 text-center font-mono font-bold ${
                                      val.flag === 'CRITICAL'
                                        ? 'text-rose-700 underline text-sm'
                                        : val.flag === 'HIGH' || val.flag === 'LOW'
                                        ? 'text-amber-800'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    {val.value || '-'}
                                    {val.flag === 'HIGH' && ' ↑'}
                                    {val.flag === 'LOW' && ' ↓'}
                                    {val.flag === 'CRITICAL' && ' ⚠️'}
                                  </td>
                                  <td className="py-2 text-center text-slate-600 font-medium">{val.unit || '-'}</td>
                                  <td className="py-2 text-right text-slate-600">{val.referenceText}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {res.validationComment && (
                          <div className="p-2 bg-slate-50 rounded text-[11px] text-slate-600 italic">
                            Conclusion : {res.validationComment}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* 4. Validation, Signature & QR Code (Requirement 17, 18) */}
                <div className="pt-6 border-t-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* QR Code */}
                  <div className="flex items-center gap-3">
                    {selectedReport.qrCodeUrl ? (
                      <img
                        src={selectedReport.qrCodeUrl}
                        alt="QR Code de vérification du rapport"
                        className="h-24 w-24 border border-slate-300 rounded p-1"
                      />
                    ) : (
                      <div className="h-24 w-24 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <QrCode className="h-10 w-10" />
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500 max-w-xs space-y-0.5">
                      <p className="font-bold text-slate-800 uppercase tracking-tight">
                        Vérification d'Authenticité
                      </p>
                      <p>Scannez ce QR Code pour vérifier l'authenticité de ce rapport médical sur le serveur officiel sécurisé.</p>
                      <p className="font-mono text-blue-700 font-semibold">{selectedReport.verificationCode}</p>
                    </div>
                  </div>

                  {/* Signature & Stamp */}
                  <div className="text-center sm:text-right text-xs">
                    {selectedReport.isPartialEmergency || selectedReport.status === 'PARTIALLY_VALIDATED' ? (
                      <div>
                        <span className="font-bold text-amber-800 block uppercase tracking-wider text-[10px]">
                          Validation Technique d'Urgence (Partielle)
                        </span>
                        <p className="font-extrabold text-amber-950 text-sm mt-1">
                          {selectedReport.partialValidatedBy || selectedReport.validatedBy}
                        </p>
                        <p className="text-[10px] text-slate-500">Technicien Supérieur de Laboratoire</p>

                        <div className="mt-2 inline-block rounded border border-amber-300 bg-amber-50 px-3 py-1.5 text-[10px] font-mono text-amber-900 text-left">
                          <div>⚠️ VALIDATION TECHNIQUE D'URGENCE</div>
                          <div>Date : {formatDateTime(selectedReport.partialValidatedAt || selectedReport.validatedAt)}</div>
                          <div>Statut : Rapport Partiel • Visa Biologiste Requis</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                          Le Biologiste Responsable Validateur
                        </span>
                        <p className="font-extrabold text-blue-900 text-sm mt-1">{selectedReport.validatedBy}</p>
                        <p className="text-[10px] text-slate-500">{settings.biologistTitle}</p>

                        {/* Electronic signature representation */}
                        <div className="mt-2 inline-block rounded border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[10px] font-mono text-emerald-800 text-left">
                          <div>✓ SIGNATURE ÉLECTRONIQUE CONFORME</div>
                          <div>Date : {formatDateTime(selectedReport.validatedAt)}</div>
                          <div>Certificat : SN-BIOMED-SECURE-9842</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer disclaimer */}
                <div className="pt-4 border-t border-slate-200 text-center text-[9px] text-slate-400">
                  Ce document médical est strictement confidentiel, couvert par le secret médical. Seul le médecin prescripteur est habilité à poser un diagnostic clinique.
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              Sélectionnez un rapport dans la liste à gauche pour afficher son aperçu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
