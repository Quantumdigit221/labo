import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { formatDateTime } from '../../../services/i18n.ts';

interface SmsTemplate {
  id: string;
  name: string;
  content: string;
}

export const SmsModule: React.FC = () => {
  const { settings } = useData();

  const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>([
    {
      id: 'sms-recu',
      name: 'Reçu de Paiement SMS',
      content: 'ExtremeLab : Votre reçu {invoice_number} de {amount} est dispo. Merci pour votre confiance.'
    },
    {
      id: 'sms-rapport',
      name: 'Résultats Validés SMS',
      content: 'ExtremeLab : Vos résultats {report_number} sont validés. Téléchargez sur {report_link}. Tél: {lab_phone}'
    },
    {
      id: 'sms-rappel',
      name: 'Rappel Prélèvement SMS',
      content: 'ExtremeLab : Rappel RDV labo le {appointment_date} à {appointment_time}. Restez à jeun.'
    }
  ]);

  const [smsLogs, setSmsLogs] = useState([
    {
      id: 'slog-1',
      recipient: '+221 77 654 11 22',
      patientName: 'Moussa Diallo',
      content: 'ExtremeLab : Vos résultats RPT-2026-000001 sont validés. Téléchargez sur extremelab-next.sn/verify/RPT-2026-000001',
      status: 'DELIVERED',
      timestamp: new Date().toISOString()
    }
  ]);

  const [testPhone, setTestPhone] = useState('+221 77 654 11 22');
  const [testText, setTestText] = useState('ExtremeLab : Vos résultats d\'analyses sont prêts.');
  const [sendNotice, setSendNotice] = useState('');

  const handleSendTestSms = (e: React.FormEvent) => {
    e.preventDefault();
    setSmsLogs([
      {
        id: 'slog-' + Date.now(),
        recipient: testPhone,
        patientName: 'Destinataire Test',
        content: testText,
        status: 'DELIVERED',
        timestamp: new Date().toISOString()
      },
      ...smsLogs
    ]);
    setSendNotice('SMS transmis avec succès via la passerelle Orange SMS Sénégal.');
    setTimeout(() => setSendNotice(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Passerelle SMS Professionnelle</h2>
          <p className="text-xs text-slate-500">
            Notifications transactionnelles par SMS (Orange SMS API, Moov, MTN, Sonatel)
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-700">Fournisseur : Orange SMS Sénégal (Actif)</span>
        </div>
      </div>

      {sendNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{sendNotice}</span>
        </div>
      )}

      {/* Grid: Left Templates & Tester / Right Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          {/* Templates list */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Modèles SMS Transactionnels (160 car.)</h3>
            <div className="space-y-2">
              {smsTemplates.map(tpl => (
                <div key={tpl.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>{tpl.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{tpl.content.length} car.</span>
                  </div>
                  <p className="text-slate-600 font-mono text-[11px] leading-relaxed">{tpl.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tester Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Tester l'Envoi SMS Immédiat</h3>
            <form onSubmit={handleSendTestSms} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Numéro de téléphone mobile</label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message SMS</label>
                <textarea
                  rows={3}
                  required
                  value={testText}
                  onChange={e => setTestText(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                Délivrer le SMS
              </button>
            </form>
          </div>
        </div>

        {/* Right Logs */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm">Historique des SMS Expédiés</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {smsLogs.map(log => (
              <div key={log.id} className="py-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-800">{log.recipient}</span>
                  <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2">
                    {log.status}
                  </span>
                </div>
                <p className="text-slate-600 font-mono text-[11px]">{log.content}</p>
                <span className="text-[10px] text-slate-400 block">{formatDateTime(log.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
