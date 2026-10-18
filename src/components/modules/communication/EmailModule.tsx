import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Settings,
  Paperclip,
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { formatDateTime } from '../../../services/i18n.ts';

export const EmailModule: React.FC = () => {
  const { settings, saveSettings, reports } = useData();

  const [smtpConfig, setSmtpConfig] = useState({
    host: settings.smtpHost || 'smtp.extremelab-next.sn',
    port: settings.smtpPort || 587,
    senderEmail: settings.smtpSenderEmail || 'resultats@extremelab-next.sn',
    senderName: settings.name,
    encryption: 'TLS'
  });

  const [emailLogs, setEmailLogs] = useState([
    {
      id: 'elog-1',
      recipient: 'moussa.diallo@gmail.com',
      patientName: 'Moussa Diallo',
      subject: 'Compte-rendu d\'analyses médicales — RPT-2026-000001',
      attachment: 'RPT-2026-000001.pdf (Certifié)',
      status: 'SENT',
      timestamp: new Date().toISOString()
    }
  ]);

  const [testRecipient, setTestRecipient] = useState('patient@orange.sn');
  const [testSubject, setTestSubject] = useState('Vos résultats de laboratoire ExtremeLab');
  const [sendNotice, setSendNotice] = useState('');

  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      ...settings,
      smtpHost: smtpConfig.host,
      smtpPort: Number(smtpConfig.port),
      smtpSenderEmail: smtpConfig.senderEmail
    });
    setSendNotice('Configuration SMTP enregistrée avec succès.');
    setTimeout(() => setSendNotice(''), 3000);
  };

  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLogs([
      {
        id: 'elog-' + Date.now(),
        recipient: testRecipient,
        patientName: 'Patient Destinataire',
        subject: testSubject,
        attachment: 'Rapport_Synthese.pdf',
        status: 'SENT',
        timestamp: new Date().toISOString()
      },
      ...emailLogs
    ]);
    setSendNotice(`Email expédié avec succès à ${testRecipient}.`);
    setTimeout(() => setSendNotice(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Passerelle Email & Serveur SMTP</h2>
          <p className="text-xs text-slate-500">
            Envoi automatisé des comptes-rendus PDF certifiés et factures électroniques
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-700">Serveur SMTP Connecté (Port {smtpConfig.port})</span>
        </div>
      </div>

      {sendNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{sendNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left SMTP Config */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Paramètres du Serveur SMTP</h3>
            <form onSubmit={handleSaveSmtp} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Serveur SMTP Hôte</label>
                <input
                  type="text"
                  required
                  value={smtpConfig.host}
                  onChange={e => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Port</label>
                  <input
                    type="number"
                    required
                    value={smtpConfig.port}
                    onChange={e => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chiffrement</label>
                  <select
                    value={smtpConfig.encryption}
                    onChange={e => setSmtpConfig({ ...smtpConfig, encryption: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  >
                    <option value="TLS">STARTTLS (587)</option>
                    <option value="SSL">SSL / TLS (465)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Expéditeur Officiel</label>
                <input
                  type="email"
                  required
                  value={smtpConfig.senderEmail}
                  onChange={e => setSmtpConfig({ ...smtpConfig, senderEmail: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                Sauvegarder Configuration SMTP
              </button>
            </form>
          </div>

          {/* Test Sender */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 text-sm">Tester l'Envoi d'un Rapport par Email</h3>
            <form onSubmit={handleSendTestEmail} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Destinataire</label>
                <input
                  type="email"
                  required
                  value={testRecipient}
                  onChange={e => setTestRecipient(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Objet de l'email</label>
                <input
                  type="text"
                  required
                  value={testSubject}
                  onChange={e => setTestSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Paperclip className="h-3.5 w-3.5 text-blue-600" />
                  Pièce jointe PDF jointe automatiquement
                </span>
                <span className="font-mono text-slate-400">Rapport_A4.pdf</span>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md transition-all active:scale-95"
              >
                Envoyer Email avec PDF Attaché
              </button>
            </form>
          </div>
        </div>

        {/* Right Logs */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-800 text-sm">Registre d'Envoi des Emails Médicaux</h3>
          <div className="divide-y divide-slate-100">
            {emailLogs.map(log => (
              <div key={log.id} className="py-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{log.recipient}</span>
                  <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2">
                    {log.status}
                  </span>
                </div>
                <p className="text-slate-700 font-medium">{log.subject}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    {log.attachment}
                  </span>
                  <span>{formatDateTime(log.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
