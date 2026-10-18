import React, { useState } from 'react';
import {
  Cpu,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  ArrowRight,
  Database,
  Terminal,
  Activity,
  Play
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { formatCurrency, formatDateTime } from '../../../services/i18n.ts';

interface AnalyzerDevice {
  id: string;
  name: string;
  model: string;
  discipline: string;
  protocol: 'ASTM 1394' | 'HL7 v2.5' | 'RS232 / Serial';
  ipAddress: string;
  port: number;
  status: 'ONLINE' | 'TRANSFERRING' | 'STANDBY';
  lastSync: string;
}

export const AnalyzersModule: React.FC = () => {
  const { samples, results, saveResultValues } = useData();
  const { currentUser } = useAuth();

  const [analyzers, setAnalyzers] = useState<AnalyzerDevice[]>([
    {
      id: 'an-1',
      name: 'Sysmex XN-550',
      model: 'Automate d\'Hématologie 5 populations',
      discipline: 'Hématologie (NFS)',
      protocol: 'ASTM 1394',
      ipAddress: '192.168.1.101',
      port: 5100,
      status: 'ONLINE',
      lastSync: new Date().toISOString()
    },
    {
      id: 'an-2',
      name: 'Roche Cobas c311',
      model: 'Analyseur de Biochimie Clinique & Turbidimétrie',
      discipline: 'Biochimie (Glycémie, Urée, Créat, Lipides)',
      protocol: 'HL7 v2.5',
      ipAddress: '192.168.1.102',
      port: 5200,
      status: 'ONLINE',
      lastSync: new Date().toISOString()
    },
    {
      id: 'an-3',
      name: 'Stago STA Satellite Max',
      model: 'Automate de Coagulation',
      discipline: 'Hémostase (TP, TCA, Fibrinogène)',
      protocol: 'ASTM 1394',
      ipAddress: '192.168.1.103',
      port: 5300,
      status: 'STANDBY',
      lastSync: new Date().toISOString()
    }
  ]);

  const [selectedDevice, setSelectedDevice] = useState<AnalyzerDevice>(analyzers[0]);
  const [simulatorOutput, setSimulatorOutput] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ count: number; message: string } | null>(null);

  // Pending samples waiting for run on analyzers
  const pendingSamples = samples.filter(s => s.status === 'RECEIVED' || s.status === 'PROCESSING' || s.status === 'COLLECTED');

  // Generate ASTM Worklist file representation (Requirement 73)
  const generateAstmWorklist = () => {
    let content = `H|\\^&|||ExtremeLabNext^LIS|||||||P|1394-97|${new Date().toISOString()}\n`;
    pendingSamples.forEach((s, idx) => {
      content += `P|${idx + 1}||${s.patientId}||${s.patientName}||||||||||||||||\n`;
      content += `O|1|${s.sampleNumber}||^^^NFS\\GLYC\\CREAT|R||||||A||||||||||||||Q\n`;
    });
    content += `L|1|N\n`;

    // Trigger download of text worklist
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WORKLIST_${selectedDevice.name.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.astm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Run automated analyzer batch import simulation:
   * Maps instrument test codes to pending TestResults in database
   */
  const handleSimulateBatchImport = () => {
    setSimulatorOutput('Connexion socket TCP/IP établie avec ' + selectedDevice.name + ' (' + selectedDevice.ipAddress + ':' + selectedDevice.port + ')...\n');
    setTimeout(() => {
      setSimulatorOutput(prev => prev + `[REC] Envoi de la trame <ENQ> ... <ACK> reçu\n`);
      setSimulatorOutput(prev => prev + `[ASTM] Lecture trames résultats d'hémogramme & biochimie automatisée...\n`);

      // Find pending results in database
      const pendingResults = results.filter(r => r.status === 'PENDING');
      let updatedCount = 0;

      pendingResults.forEach(res => {
        if (res.testId === 't-nfs') {
          // Fill Sysmex hematology values
          const updatedValues = res.values.map(v => {
            if (v.parameterCode === 'GB') return { ...v, value: '7.2', numericValue: 7.2, flag: 'NORMAL' as const };
            if (v.parameterCode === 'GR') return { ...v, value: '4.80', numericValue: 4.80, flag: 'NORMAL' as const };
            if (v.parameterCode === 'HB') return { ...v, value: '14.1', numericValue: 14.1, flag: 'NORMAL' as const };
            if (v.parameterCode === 'HT') return { ...v, value: '42.5', numericValue: 42.5, flag: 'NORMAL' as const };
            if (v.parameterCode === 'PLT') return { ...v, value: '260', numericValue: 260, flag: 'NORMAL' as const };
            return v;
          });
          saveResultValues(res.id, updatedValues);
          updatedCount++;
        } else if (res.testId === 't-glyc') {
          // Fill Cobas glucose
          const updatedValues = res.values.map(v => {
            if (v.parameterCode === 'GLU') return { ...v, value: '0.98', numericValue: 0.98, flag: 'NORMAL' as const };
            return v;
          });
          saveResultValues(res.id, updatedValues);
          updatedCount++;
        }
      });

      setSimulatorOutput(prev => prev + `[SUCCÈS] ${updatedCount} examens mappés et enregistrés dans la base LIS !\n`);
      setImportStatus({
        count: updatedCount,
        message: `${updatedCount} résultats d'analyses importés et vérifiés automatiquement.`
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Passerelle Analyseurs & Feuilles de Paillasse (LIS Middleware)</h2>
          <p className="text-xs text-slate-500">
            Connexion bidirectionnelle ASTM 1394 / HL7 v2.5, génération de worklists et télétransmission automatique des résultats
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generateAstmWorklist}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="h-4 w-4 text-blue-600" />
            Exporter Worklist ASTM ({pendingSamples.length} tubes)
          </button>
          <button
            onClick={handleSimulateBatchImport}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-95"
          >
            <Play className="h-4 w-4" />
            Lancer Récupération Automatique
          </button>
        </div>
      </div>

      {/* Analyzer Instruments Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analyzers.map(dev => (
          <div
            key={dev.id}
            onClick={() => setSelectedDevice(dev)}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${
              selectedDevice.id === dev.id
                ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{dev.name}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">{dev.protocol}</span>
                </div>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  dev.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {dev.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-2">{dev.model}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{dev.discipline}</p>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{dev.ipAddress}:{dev.port}</span>
              <span>Sync : {formatDateTime(dev.lastSync)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Simulator Terminal Console */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 p-5 shadow-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Console Liaison Série / TCP Middleware — {selectedDevice.name}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Protocole {selectedDevice.protocol}</span>
        </div>

        <div className="bg-slate-900/90 rounded-lg p-3 min-h-[140px] max-h-56 overflow-y-auto space-y-1 text-slate-300">
          {simulatorOutput ? (
            <pre className="whitespace-pre-wrap font-mono text-[11px] text-emerald-400 leading-relaxed">
              {simulatorOutput}
            </pre>
          ) : (
            <p className="text-slate-500 text-center py-8">
              En attente d'instruction. Cliquez sur « Lancer Récupération Automatique » pour interroger l'automate et charger les analyses prêtes.
            </p>
          )}
        </div>

        {importStatus && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* ASTM / HL7 Format Mapping Reference (Requirement 73) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-slate-800 text-sm">Table de Mapping Automates ↔ Catalogue LIS</h3>
        <p className="text-slate-500">
          Correspondance entre les codes canaux automates et les paramètres d'analyses du laboratoire
        </p>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="py-2 px-3">Automate</th>
                <th className="py-2 px-3">Code Machine (Instrument ID)</th>
                <th className="py-2 px-3">Paramètre LIS ExtremeLab</th>
                <th className="py-2 px-3">Unité Standard</th>
                <th className="py-2 px-3">Contrôle Qualité (CQ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="py-2 px-3 text-slate-800 font-sans">Sysmex XN-550</td>
                <td className="py-2 px-3 font-bold text-blue-700">WBC</td>
                <td className="py-2 px-3 font-sans">Globules Blancs (GB)</td>
                <td className="py-2 px-3">10^3/µL</td>
                <td className="py-2 px-3 text-emerald-600 font-sans font-semibold">Validé 2 Niveaux</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-800 font-sans">Sysmex XN-550</td>
                <td className="py-2 px-3 font-bold text-blue-700">HGB</td>
                <td className="py-2 px-3 font-sans">Hémoglobine (HB)</td>
                <td className="py-2 px-3">g/dL</td>
                <td className="py-2 px-3 text-emerald-600 font-sans font-semibold">Validé 2 Niveaux</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-800 font-sans">Roche Cobas c311</td>
                <td className="py-2 px-3 font-bold text-purple-700">GLUC3</td>
                <td className="py-2 px-3 font-sans">Glucose plasmatique à jeun</td>
                <td className="py-2 px-3">g/L</td>
                <td className="py-2 px-3 text-emerald-600 font-sans font-semibold">Precinorm U Validé</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-800 font-sans">Roche Cobas c311</td>
                <td className="py-2 px-3 font-bold text-purple-700">CREAJ2</td>
                <td className="py-2 px-3 font-sans">Créatinine Sérique</td>
                <td className="py-2 px-3">mg/L</td>
                <td className="py-2 px-3 text-emerald-600 font-sans font-semibold">Precipath U Validé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
