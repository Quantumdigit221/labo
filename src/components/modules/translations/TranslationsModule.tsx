import React, { useState } from 'react';
import { Languages, Check, Globe, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import { translations } from '../../../services/i18n.ts';

export const TranslationsModule: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [filterKey, setFilterKey] = useState('');

  const currentDict = translations[language];
  const keys = Object.keys(translations.fr).filter(k =>
    k.toLowerCase().includes(filterKey.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestion des Langues & Dictionnaires (i18n)</h2>
          <p className="text-xs text-slate-500">
            Externalisation complète des chaînes de caractères (Français / English)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage('fr')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              language === 'fr'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            🇫🇷 Français (Défaut)
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Dictionary viewer table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Table des Clés de Traduction ({keys.length} chaînes)
          </h3>
          <input
            type="text"
            value={filterKey}
            onChange={e => setFilterKey(e.target.value)}
            placeholder="Filtrer par clé (ex: nav., action., dashboard.)..."
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs w-64 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Clé Externalisée</th>
                <th className="py-2.5 px-3 font-semibold">Français (FR)</th>
                <th className="py-2.5 px-3 font-semibold">English (EN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {keys.map(k => (
                <tr key={k} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-blue-700 font-bold">{k}</td>
                  <td className="py-2 px-3 text-slate-800 font-sans">
                    {(translations.fr as Record<string, string>)[k] || '-'}
                  </td>
                  <td className="py-2 px-3 text-slate-600 font-sans">
                    {(translations.en as Record<string, string>)[k] || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
