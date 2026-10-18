import React, { useState } from 'react';
import {
  PhoneCall,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Settings,
  FileText,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { WhatsAppTemplate, WhatsAppLog } from '../../../types/index.ts';
import { WhatsAppService, ALLOWED_VARIABLES } from '../../../services/whatsappService.ts';
import { Modal } from '../../common/Modal.tsx';
import { formatDateTime } from '../../../services/i18n.ts';

export const WhatsAppModule: React.FC = () => {
  const { settings, saveSettings, whatsappTemplates, whatsappLogs, updateWhatsAppTemplate } = useData();

  const [activeTab, setActiveTab] = useState<'TEMPLATES' | 'LOGS' | 'CONFIG'>('TEMPLATES');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(whatsappTemplates[0] || null);
  const [templateContent, setTemplateContent] = useState(whatsappTemplates[0]?.content || '');

  // Live tester modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('+221 77 654 11 22');
  const [testPatientName, setTestPatientName] = useState('Moussa Diallo');
  const [testNotice, setTestNotice] = useState<{ success: boolean; msg: string; directUrl?: string } | null>(null);

  const handleSelectTemplate = (tpl: WhatsAppTemplate) => {
    setSelectedTemplate(tpl);
    setTemplateContent(tpl.content);
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;
    updateWhatsAppTemplate(selectedTemplate.id, templateContent);
    alert('Modèle WhatsApp sauvegardé avec succès.');
  };

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestNotice(null);

    const { compiled, errors } = WhatsAppService.compileTemplate(templateContent, {
      patient_name: testPatientName,
      patient_first_name: testPatientName.split(' ')[0],
      patient_phone: testPhone,
      doctor_name: 'Dr. Ibrahima Diop',
      order_number: 'ORD-2026-000001',
      invoice_number: 'FAC-2026-000001',
      report_number: 'RPT-2026-000001',
      lead_biologist: settings.leadBiologist,
      amount: '16 500 FCFA',
      receipt_link: 'https://extremelab-next.sn/receipt/FAC-2026-000001',
      report_link: 'https://extremelab-next.sn/verify/RPT-2026-000001',
      lab_name: settings.name,
      lab_phone: settings.whatsapp,
      lab_address: settings.address,
      appointment_date: '17/10/2026',
      appointment_time: '08:30'
    });

    if (errors.length > 0) {
      setTestNotice({
        success: false,
        msg: 'Erreur de syntaxe des variables : ' + errors.join(', ')
      });
      return;
    }

    const res = await WhatsAppService.sendMessage({
      recipientPhone: testPhone,
      recipientName: testPatientName,
      templateType: selectedTemplate?.type || 'CUSTOM',
      messageText: compiled,
      referenceNumber: 'TEST-SIMULATION',
      sentBy: 'Administrateur Test'
    });

    if (res.success) {
      setTestNotice({
        success: true,
        msg: 'Message WhatsApp délivré avec succès à la passerelle officielle !',
        directUrl: res.directWaUrl
      });
    } else {
      setTestNotice({
        success: false,
        msg: res.error || 'Échec de transmission'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Passerelle WhatsApp Business</h2>
          <p className="text-xs text-slate-500">
            Envoi automatisé des reçus de paiement, liens sécurisés de rapports d'analyses et rappels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                settings.enableWhatsApp ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="text-slate-700">
              {settings.enableWhatsApp ? 'Passerelle Active' : 'Passerelle Désactivée'}
            </span>
          </div>

          <button
            onClick={() => setIsTestModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
            Tester l'Envoi WhatsApp
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold max-w-md">
        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'TEMPLATES' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Modèles de Messages ({whatsappTemplates.length})
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'LOGS' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Journal des Envois ({whatsappLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('CONFIG')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'CONFIG' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Configuration API
        </button>
      </div>

      {/* Tab 1: Templates Editor (Requirement 25, 26) */}
      {activeTab === 'TEMPLATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Sélectionnez un modèle :
            </span>
            {whatsappTemplates.map(tpl => (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedTemplate?.id === tpl.id
                    ? 'border-emerald-500 bg-emerald-50/60 font-semibold text-emerald-900 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">{tpl.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{tpl.code}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tpl.content}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Éditeur du Modèle : {selectedTemplate?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Modifiez le texte et intégrez les balises dynamiques.
                </p>
              </div>
              <button
                onClick={handleSaveTemplate}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
              >
                Sauvegarder le modèle
              </button>
            </div>

            <textarea
              rows={10}
              value={templateContent}
              onChange={e => setTemplateContent(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs focus:border-emerald-500 focus:outline-none leading-relaxed"
            />

            {/* Allowed variables tag list (Requirement 26) */}
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">
                Variables autorisées (Cliquez pour insérer) :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ALLOWED_VARIABLES.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTemplateContent(prev => prev + ` {${v}}`)}
                    className="rounded bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-600 transition-colors"
                  >
                    {`{${v}}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Logs (Requirement 27, 72) */}
      {activeTab === 'LOGS' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date & Heure</th>
                  <th className="py-3 px-4 font-semibold">Destinataire</th>
                  <th className="py-3 px-4 font-semibold">Téléphone</th>
                  <th className="py-3 px-4 font-semibold">Type de Modèle</th>
                  <th className="py-3 px-4 font-semibold">Extrait Message</th>
                  <th className="py-3 px-4 font-semibold">Statut</th>
                  <th className="py-3 px-4 font-semibold">Réponse Serveur</th>
                  <th className="py-3 px-4 font-semibold">Opérateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {whatsappLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Aucun message dans l'historique WhatsApp.
                    </td>
                  </tr>
                ) : (
                  whatsappLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500">{formatDateTime(log.timestamp)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{log.recipientName}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{log.recipientPhone}</td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {log.templateType}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600">{log.messageContent}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[10px] font-mono text-slate-500 max-w-xs truncate">
                        {log.providerResponse || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{log.sentBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Configuration (Requirement 24) */}
      {activeTab === 'CONFIG' && (
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Passerelle WhatsApp Cloud API</h3>
              <p className="text-slate-400">Paramètres officiels Meta Business pour l'envoi de messages</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableWhatsApp}
                onChange={e => saveSettings({ ...settings, enableWhatsApp: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-0 h-4 w-4"
              />
              <span className="font-bold text-slate-700">Module Activé</span>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fournisseur d'API</label>
              <input
                type="text"
                value={settings.whatsappProvider}
                onChange={e => saveSettings({ ...settings, whatsappProvider: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number ID</label>
                <input
                  type="text"
                  value={settings.whatsappPhoneNumberId || ''}
                  onChange={e => saveSettings({ ...settings, whatsappPhoneNumberId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Business Account ID</label>
                <input
                  type="text"
                  value={settings.whatsappBusinessId || ''}
                  onChange={e => saveSettings({ ...settings, whatsappBusinessId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-[11px] flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Sécurité & Confidentialité (Règle 8) :</strong> Le jeton d'accès permanent est chiffré et stocké côté serveur. Il n'est jamais exposé dans le code client.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Test Modal (Requirement 27) */}
      <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} title="Tester l'Envoi WhatsApp Direct" maxWidth="md">
        <form onSubmit={handleRunTest} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Numéro de téléphone de test</label>
            <input
              type="text"
              required
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nom du patient de test</label>
            <input
              type="text"
              required
              value={testPatientName}
              onChange={e => setTestPatientName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {testNotice && (
            <div
              className={`p-3 rounded-lg border text-xs space-y-2 ${
                testNotice.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <p className="font-semibold">{testNotice.msg}</p>
              {testNotice.directUrl && (
                <a
                  href={testNotice.directUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 underline"
                >
                  Ouvrir la conversation sur WhatsApp Web / App →
                </a>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTestModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              Envoyer Message Test
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
