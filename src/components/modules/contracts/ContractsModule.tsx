import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Percent,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { Contract } from '../../../types/index.ts';
import { formatCurrency, formatDate } from '../../../services/i18n.ts';

export const ContractsModule: React.FC = () => {
  const { contracts, invoices } = useData();
  const [search, setSearch] = useState('');

  const filteredContracts = contracts.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Contrats Partenaires, IPM & Assurances</h2>
          <p className="text-xs text-slate-500">
            Conventions de tiers-payant, taux de couverture et tarifications préférentielles ({contracts.length} contrats actifs)
          </p>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContracts.map(c => {
          const contractInvoices = invoices.filter(i => i.contractId === c.id);
          const totalInvoiced = contractInvoices.reduce((acc, i) => acc + i.total, 0);

          return (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                    {c.type}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{c.name}</h3>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Convention Actif
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                <p>
                  Contact référent : <strong>{c.contactPerson}</strong>
                </p>
                <p>Téléphone : {c.phone}</p>
                {c.email && <p>Email : {c.email}</p>}
                <p>
                  Validité : du {formatDate(c.startDate)} au {formatDate(c.endDate)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Taux Prise en Charge</span>
                  <p className="text-base font-extrabold text-blue-800">{c.coveragePercentage}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Remise Conventionnelle</span>
                  <p className="text-base font-extrabold text-emerald-700">{c.discount}%</p>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200/60 flex justify-between">
                  <span className="text-slate-500">Plafond Crédit autorisé :</span>
                  <strong className="text-slate-800">{formatCurrency(c.creditLimit)}</strong>
                </div>
              </div>

              <div className="pt-2 text-xs flex justify-between text-slate-500">
                <span>Dossiers facturés :</span>
                <strong>{contractInvoices.length} ({formatCurrency(totalInvoiced)})</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
