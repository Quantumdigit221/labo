import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { formatDateTime } from '../../../services/i18n.ts';

export const ActivityLogsModule: React.FC = () => {
  const { activityLogs } = useData();

  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      (log.recordIdentifier && log.recordIdentifier.toLowerCase().includes(search.toLowerCase())) ||
      (log.newValue && log.newValue.toLowerCase().includes(search.toLowerCase()));
    const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const modules = ['ALL', 'PATIENTS', 'ORDERS', 'SAMPLES', 'RESULTS', 'VALIDATION', 'PAYMENTS', 'ACCOUNTING', 'WHATSAPP', 'SETTINGS'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Journal d'Activité & Traçabilité (Audit Trail)</h2>
          <p className="text-xs text-slate-500">
            Enregistrement immuable des créations, modifications, validations et transactions financières ({activityLogs.length} événements)
          </p>
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
            placeholder="Rechercher par utilisateur, action, patient, N°..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={e => setModuleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
        >
          {modules.map(m => (
            <option key={m} value={m}>
              {m === 'ALL' ? 'Tous les modules' : m}
            </option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Horodatage</th>
                <th className="py-3 px-4 font-semibold">Utilisateur</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Module</th>
                <th className="py-3 px-4 font-semibold">Élément / Référence</th>
                <th className="py-3 px-4 font-semibold">Détails de l'opération</th>
                <th className="py-3 px-4 font-semibold">Adresse IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun journal correspondant.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{log.userName}</div>
                      <div className="text-[10px] text-slate-400">{log.userRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-bold text-blue-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {log.recordIdentifier || '-'}
                    </td>
                    <td className="py-3 px-4 max-w-sm truncate text-slate-600">
                      {log.newValue || log.oldValue || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[10px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
