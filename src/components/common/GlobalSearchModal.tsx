import React, { useState } from 'react';
import { Search, User, FileText, FlaskConical, Stethoscope, Receipt, ShieldCheck, X, Package } from 'lucide-react';
import { useData } from '../../context/DataContext.tsx';
import { Modal } from './Modal.tsx';
import { formatCurrency, formatDate } from '../../services/i18n.ts';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const { patients, doctors, orders, samples, tests, invoices, reports, reagents } = useData();

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const qCleanPhone = q.replace(/[^0-9]/g, '');

  const matchedPatients = q
    ? patients.filter(p => {
        const full1 = `${p.firstName} ${p.lastName}`.toLowerCase();
        const full2 = `${p.lastName} ${p.firstName}`.toLowerCase();
        const pCleanPhone = p.phone.replace(/[^0-9]/g, '');
        const pCleanWhatsapp = p.whatsapp.replace(/[^0-9]/g, '');
        return (
          full1.includes(q) ||
          full2.includes(q) ||
          p.patientNumber.toLowerCase().includes(q) ||
          (p.nationalId && p.nationalId.toLowerCase().includes(q)) ||
          p.city.toLowerCase().includes(q) ||
          (qCleanPhone && (pCleanPhone.includes(qCleanPhone) || pCleanWhatsapp.includes(qCleanPhone)))
        );
      }).slice(0, 6)
    : [];

  const matchedDoctors = q
    ? doctors.filter(
        d =>
          d.firstName.toLowerCase().includes(q) ||
          d.lastName.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.facility.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedOrders = q
    ? orders.filter(
        o =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.patientName.toLowerCase().includes(q) ||
          (o.doctorName && o.doctorName.toLowerCase().includes(q))
      ).slice(0, 5)
    : [];

  const matchedSamples = q
    ? samples.filter(
        s =>
          s.sampleNumber.toLowerCase().includes(q) ||
          s.patientName.toLowerCase().includes(q) ||
          s.sampleType.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedTests = q
    ? tests.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedInvoices = q
    ? invoices.filter(
        i =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.patientName.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedReports = q
    ? reports.filter(
        r =>
          r.reportNumber.toLowerCase().includes(q) ||
          r.patientName.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedReagents = q
    ? reagents.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.lotNumber.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const totalResults =
    matchedPatients.length +
    matchedDoctors.length +
    matchedOrders.length +
    matchedSamples.length +
    matchedTests.length +
    matchedInvoices.length +
    matchedReports.length +
    matchedReagents.length;

  const handleSelect = (module: string, itemId?: string) => {
    onNavigate(module, itemId);
    onClose();
    setQuery('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recherche Globale du Laboratoire" maxWidth="4xl">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher par nom, téléphone, N° patient (PAT-...), commande (ORD-...), facture (FAC-...), examen..."
            autoFocus
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-11 pr-10 text-base focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {query.length > 0 && totalResults === 0 && (
          <div className="py-12 text-center text-slate-500">
            <Search className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-700">Aucun résultat trouvé pour « {query} »</p>
            <p className="text-xs text-slate-400 mt-1">
              Vérifiez l'orthographe ou saisissez un mot-clé plus court.
            </p>
          </div>
        )}

        {totalResults > 0 && (
          <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
            {/* Patients */}
            {matchedPatients.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-blue-600" />
                    <span>Dossiers Patients ({matchedPatients.length})</span>
                  </div>
                  <button
                    onClick={() => handleSelect('patient-search')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline normal-case"
                  >
                    Ouvrir la Recherche Avancée Patient →
                  </button>
                </div>
                <div className="space-y-1.5">
                  {matchedPatients.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelect('patients', p.id)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-200 cursor-pointer transition-all"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <span>{p.firstName} {p.lastName}</span>
                          {p.bloodGroup && (
                            <span className="rounded bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.2 text-[10px] font-bold">
                              {p.bloodGroup}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          N° {p.patientNumber} • Tél : {p.phone} • {p.city}
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelect('orders', p.id)}
                          className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        >
                          + Demande
                        </button>
                        <button
                          onClick={() => handleSelect('patients', p.id)}
                          className="text-[11px] font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Dossier →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demandes */}
            {matchedOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span>Demandes d'examens ({matchedOrders.length})</span>
                </div>
                <div className="space-y-1.5">
                  {matchedOrders.map(o => (
                    <div
                      key={o.id}
                      onClick={() => handleSelect('orders', o.id)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-emerald-50/70 hover:border-emerald-200 cursor-pointer transition-all"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          {o.orderNumber} — {o.patientName}
                        </div>
                        <div className="text-xs text-slate-500">
                          Date : {formatDate(o.orderDate)} • Total : {formatCurrency(o.total)} • Statut : {o.status}
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Voir Demande →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Factures */}
            {matchedInvoices.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <Receipt className="h-4 w-4 text-purple-600" />
                  <span>Factures & Caisse ({matchedInvoices.length})</span>
                </div>
                <div className="space-y-1.5">
                  {matchedInvoices.map(inv => (
                    <div
                      key={inv.id}
                      onClick={() => handleSelect('invoices', inv.id)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-purple-50/70 hover:border-purple-200 cursor-pointer transition-all"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          {inv.invoiceNumber} — {inv.patientName}
                        </div>
                        <div className="text-xs text-slate-500">
                          Montant : {formatCurrency(inv.total)} • Payé : {formatCurrency(inv.paidAmount)} • Reste : {formatCurrency(inv.balance)}
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                        Voir Facture →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rapports */}
            {matchedReports.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>Rapports Médicaux Validés ({matchedReports.length})</span>
                </div>
                <div className="space-y-1.5">
                  {matchedReports.map(rpt => (
                    <div
                      key={rpt.id}
                      onClick={() => handleSelect('reports', rpt.id)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-teal-50/70 hover:border-teal-200 cursor-pointer transition-all"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          {rpt.reportNumber} — {rpt.patientName}
                        </div>
                        <div className="text-xs text-slate-500">
                          Validé par : {rpt.validatedBy} • Date : {formatDate(rpt.validatedAt)}
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-700">
                        Ouvrir Rapport PDF →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Médecins */}
            {matchedDoctors.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <Stethoscope className="h-4 w-4 text-cyan-600" />
                  <span>Médecins Référents ({matchedDoctors.length})</span>
                </div>
                <div className="space-y-1.5">
                  {matchedDoctors.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => handleSelect('doctors', doc.id)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-cyan-50/70 hover:border-cyan-200 cursor-pointer transition-all"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          Dr. {doc.firstName} {doc.lastName} ({doc.specialty})
                        </div>
                        <div className="text-xs text-slate-500">
                          Établissement : {doc.facility} • Tél : {doc.phone}
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-100 text-cyan-700">
                        Voir Fiche →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tests */}
            {matchedTests.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <FlaskConical className="h-4 w-4 text-indigo-600" />
                  <span>Examens du Catalogue ({matchedTests.length})</span>
                </div>
                <div className="space-y-1.5">
                  {matchedTests.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleSelect('tests', t.id)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/70 hover:border-indigo-200 cursor-pointer transition-all"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          [{t.code}] {t.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Catégorie : {t.category} • Échantillon : {t.sampleType} • Tarif : {formatCurrency(t.price)}
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        Voir Examen →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reagents & Consumables */}
            {matchedReagents.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                  <span>Réactifs & Consommables en Stock ({matchedReagents.length})</span>
                </div>
                <div className="space-y-1.5">
                  {matchedReagents.map(r => (
                    <div
                      key={r.id}
                      onClick={() => handleSelect('inventory', r.id)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-emerald-50/70 hover:border-emerald-200 cursor-pointer transition-all"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          [{r.code}] {r.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Lot : {r.lotNumber} • Stock : {r.currentQuantity} {r.unit} • Pér. : {r.expirationDate}
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Voir Stock →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
