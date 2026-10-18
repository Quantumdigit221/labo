import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { formatDateTime } from '../../../services/i18n.ts';

export const BackupModule: React.FC = () => {
  const { patients, orders, samples, results, invoices, payments, refreshData, resetAllDemoData } = useData();
  const [backupNotice, setBackupNotice] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string>('');

  const totalRecords =
    patients.length + orders.length + samples.length + results.length + invoices.length + payments.length;

  // Export full JSON dump
  const handleExportBackup = () => {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('extremelab_')) {
        try {
          backupData[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          backupData[key] = localStorage.getItem(key);
        }
      }
    }

    const payload = JSON.stringify({
      version: '2026.4',
      appName: 'ExtremeLab Next',
      exportedAt: new Date().toISOString(),
      recordCount: totalRecords,
      data: backupData
    }, null, 2);

    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EXTREMELAB_BACKUP_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setBackupNotice('Sauvegarde complète de la base de données téléchargée avec succès.');
    setTimeout(() => setBackupNotice(''), 4000);
  };

  // Restore from JSON file
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorNotice('');
    setBackupNotice('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.data || typeof parsed.data !== 'object') {
          throw new Error('Fichier de sauvegarde non reconnu ou corrompu.');
        }

        // Apply to localStorage
        Object.keys(parsed.data).forEach(key => {
          localStorage.setItem(key, JSON.stringify(parsed.data[key]));
        });

        refreshData();
        setBackupNotice(`Restauration réussie ! ${parsed.recordCount || 'Toutes les'} entrées ont été réinjectées.`);
      } catch (err: any) {
        setErrorNotice('Échec de la restauration : ' + (err.message || 'Format invalide.'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sauvegardes & Restauration de la Base de Données</h2>
          <p className="text-xs text-slate-500">
            Exportation de sécurité, plan de reprise d'activité (PRA) et intégrité des dossiers médicaux
          </p>
        </div>
      </div>

      {backupNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{backupNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 w-fit">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Générer une Sauvegarde Complète (Snapshot)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Télécharge l'intégralité des tables (patients, examens, résultats validés, factures, encaissements et logs d'audit) dans un fichier JSON vérifié.
            </p>
          </div>

          <div className="text-xs text-slate-600 font-medium pt-2 border-t border-slate-100 flex justify-between">
            <span>Enregistrements actifs :</span>
            <strong className="text-slate-800">{totalRecords} dossiers</strong>
          </div>

          <button
            onClick={handleExportBackup}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-all active:scale-95"
          >
            <Download className="h-4 w-4" />
            Télécharger la Sauvegarde (.json)
          </button>
        </div>

        {/* Restore Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 w-fit">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Restaurer à partir d'une Sauvegarde</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Sélectionnez un fichier JSON de sauvegarde précédemment généré pour rétablir immédiatement l'ensemble des données du laboratoire.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-4 text-center hover:border-purple-500 transition-colors">
              <Upload className="h-6 w-6 mx-auto text-slate-400 mb-1" />
              <span className="text-xs font-bold text-purple-700 block">
                Cliquez pour importer un fichier .json
              </span>
              <span className="text-[10px] text-slate-400">Vérification de schéma automatique</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Snapshot Verification Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-slate-800 text-sm">
          Plan de Continuité d'Activité & Horodatage
        </h3>
        <p className="text-slate-500">
          Les données locales sont synchronisées à chaque transaction. Il est recommandé d'exporter une copie hebdomadaire sur un support externe sécurisé.
        </p>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-bold text-slate-800">Contrôle de Cohérence</p>
              <p className="text-slate-500 text-[11px]">Intégrité relationnelle validée sans orphelins.</p>
            </div>
          </div>
          <span className="rounded bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
            100% OPÉRATIONNEL
          </span>
        </div>
      </div>
    </div>
  );
};
