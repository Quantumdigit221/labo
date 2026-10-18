import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Download,
  Calendar,
  Building,
  RotateCcw,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Thermometer,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { ReagentItem, StockMovement, Supplier, StockStatus } from '../../../types/index.ts';
import { formatCurrency, formatDate } from '../../../services/i18n.ts';
import { Modal } from '../../common/Modal.tsx';

export const InventoryModule: React.FC = () => {
  const { reagents, stockMovements, suppliers, addReagent, adjustReagentStock, addSupplier } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'REAGENTS' | 'MOVEMENTS' | 'SUPPLIERS'>('REAGENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals
  const [isAddReagentModalOpen, setIsAddReagentModalOpen] = useState(false);
  const [isStockEntryModalOpen, setIsStockEntryModalOpen] = useState(false);
  const [isStockExitModalOpen, setIsStockExitModalOpen] = useState(false);
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);

  // Form states for adding reagent
  const [newReagent, setNewReagent] = useState({
    code: '',
    name: '',
    category: 'HÉMATOLOGIE' as ReagentItem['category'],
    supplierId: suppliers[0]?.id || '',
    lotNumber: '',
    expirationDate: '',
    storageTemperature: '+2°C à +8°C' as ReagentItem['storageTemperature'],
    currentQuantity: 1,
    unit: 'Kits' as ReagentItem['unit'],
    minThreshold: 2,
    idealStock: 5,
    costPerUnit: 50000,
    testsPerUnit: 500
  });

  // Stock movement form state
  const [selectedReagentForMovement, setSelectedReagentForMovement] = useState<ReagentItem | null>(reagents[0] || null);
  const [movementQty, setMovementQty] = useState<number>(1);
  const [movementReason, setMovementReason] = useState<string>('Réapprovisionnement fournisseur');
  const [movementType, setMovementType] = useState<'ENTRY' | 'EXIT'>('ENTRY');

  // Filtered reagents
  const filteredReagents = reagents.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.lotNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // KPI Calculations
  const totalStockValue = reagents.reduce((acc, r) => acc + r.currentQuantity * r.costPerUnit, 0);
  const criticalStockCount = reagents.filter(r => r.status === 'CRITICAL' || r.status === 'LOW').length;
  
  const today = new Date();
  const expiringSoonCount = reagents.filter(r => {
    const exp = new Date(r.expirationDate);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 60 && diffDays > 0;
  }).length;

  const handleCreateReagent = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === newReagent.supplierId);
    addReagent({
      ...newReagent,
      supplierName: sup?.name || 'Fournisseur Agréé'
    });
    setIsAddReagentModalOpen(false);
  };

  const handleStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReagentForMovement) return;
    adjustReagentStock(
      selectedReagentForMovement.id,
      movementType,
      movementQty,
      movementReason,
      currentUser?.name || 'Technicien'
    );
    if (movementType === 'ENTRY') setIsStockEntryModalOpen(false);
    else setIsStockExitModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold mb-1">
            <Package className="h-3.5 w-3.5" />
            Gestion des Stocks & Consommables
          </div>
          <h2 className="text-xl font-bold text-slate-800">Réactifs, Consommables & Fournisseurs</h2>
          <p className="text-xs text-slate-500">
            Traçabilité des lots, alertes de péremption, gestion des seuils critiques et réapprovisionnement
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPurchaseOrderModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Bon de Commande
          </button>

          <button
            onClick={() => {
              setMovementType('ENTRY');
              setMovementReason('Livraison Bon de Commande');
              setIsStockEntryModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 shadow-xs"
          >
            <ArrowDownRight className="h-4 w-4 text-blue-600" />
            Entrée de Stock
          </button>

          <button
            onClick={() => {
              setMovementType('EXIT');
              setMovementReason('Chargement sur automate / consommation paillasse');
              setIsStockExitModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 shadow-xs"
          >
            <ArrowUpRight className="h-4 w-4 text-amber-600" />
            Sortie de Stock
          </button>

          <button
            onClick={() => setIsAddReagentModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Nouveau Réactif
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Références Actives</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-800">{reagents.length}</p>
          <span className="text-[11px] text-slate-400">Catalogue complet de réactifs</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Alertes Stock Bas / Critique</span>
            <div className={`rounded-lg p-2 ${criticalStockCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-800">{criticalStockCount}</p>
          <span className={`text-[11px] font-semibold ${criticalStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {criticalStockCount > 0 ? 'Réapprovisionnement urgent requis' : 'Tous les stocks sont optimaux'}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Péremptions &lt; 60 Jours</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-800">{expiringSoonCount}</p>
          <span className="text-[11px] text-amber-700">À écouler en priorité (FEFO)</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Valeur Globale du Stock</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-800">{formatCurrency(totalStockValue)}</p>
          <span className="text-[11px] text-slate-400">Valorisation au coût d'achat</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold max-w-md">
        <button
          onClick={() => setActiveTab('REAGENTS')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'REAGENTS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          État des Stocks ({reagents.length})
        </button>
        <button
          onClick={() => setActiveTab('MOVEMENTS')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'MOVEMENTS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Mouvements & Traçabilité ({stockMovements.length})
        </button>
        <button
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'SUPPLIERS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Fournisseurs ({suppliers.length})
        </button>
      </div>

      {/* TAB 1: REAGENTS TABLE */}
      {activeTab === 'REAGENTS' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, code ou lot..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
              {['ALL', 'HÉMATOLOGIE', 'BIOCHIMIE', 'MICROBIOLOGIE', 'TUBES & AIGUILLES'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'Tous' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Code & Désignation</th>
                  <th className="py-3 px-3">Catégorie</th>
                  <th className="py-3 px-3">N° de Lot</th>
                  <th className="py-3 px-3">Péremption</th>
                  <th className="py-3 px-3">Conservation</th>
                  <th className="py-3 px-3 text-right">Quantité</th>
                  <th className="py-3 px-3">Seuil Min</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredReagents.map(rea => {
                  const isExpiringSoon = new Date(rea.expirationDate).getTime() - today.getTime() <= 60 * 24 * 3600 * 1000;
                  return (
                    <tr key={rea.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] text-blue-600 font-bold block">{rea.code}</span>
                        <span className="font-bold text-slate-900">{rea.name}</span>
                        {rea.supplierName && (
                          <span className="text-[10px] text-slate-400 block">{rea.supplierName}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {rea.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 text-[11px]">
                        {rea.lotNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-mono text-[11px] ${isExpiringSoon ? 'font-bold text-rose-600' : 'text-slate-600'}`}>
                          {formatDate(rea.expirationDate)}
                        </span>
                        {isExpiringSoon && (
                          <span className="block text-[9px] font-bold text-rose-500 uppercase">Alerte Proche</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Thermometer className="h-3 w-3 text-cyan-600" />
                          {rea.storageTemperature}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-black text-slate-900 text-sm">
                          {rea.currentQuantity}
                        </span>{' '}
                        <span className="text-[10px] text-slate-500">{rea.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {rea.minThreshold} {rea.unit}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            rea.status === 'OPTIMAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rea.status === 'LOW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rea.status === 'OPTIMAL' ? 'OPTIMAL' : rea.status === 'LOW' ? 'STOCK BAS' : 'CRITIQUE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedReagentForMovement(rea);
                              setMovementType('ENTRY');
                              setMovementQty(1);
                              setMovementReason('Réapprovisionnement rapide');
                              setIsStockEntryModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Entrée de stock"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReagentForMovement(rea);
                              setMovementType('EXIT');
                              setMovementQty(1);
                              setMovementReason('Consommation paillasse');
                              setIsStockExitModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Sortie de stock"
                          >
                            <TrendingDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK MOVEMENTS AUDIT LOG */}
      {activeTab === 'MOVEMENTS' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-4">Réactif</th>
                <th className="py-3 px-3">N° Lot</th>
                <th className="py-3 px-3 text-right">Quantité</th>
                <th className="py-3 px-4">Motif & Justificatif</th>
                <th className="py-3 px-3">Opérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {stockMovements.map(mov => (
                <tr key={mov.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {formatDate(mov.timestamp)} {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                        mov.type === 'ENTRY'
                          ? 'bg-blue-100 text-blue-800'
                          : mov.type === 'EXIT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {mov.type === 'ENTRY' ? (
                        <>
                          <ArrowDownRight className="h-3 w-3" />
                          ENTRÉE
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-3 w-3" />
                          SORTIE
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{mov.reagentName}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{mov.lotNumber}</td>
                  <td className="py-3 px-3 text-right font-black text-slate-900">
                    {mov.type === 'ENTRY' ? `+${mov.quantity}` : `-${mov.quantity}`}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{mov.reason}</td>
                  <td className="py-3 px-3 text-slate-500 font-medium">{mov.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SUPPLIERS DIRECTORY */}
      {activeTab === 'SUPPLIERS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map(sup => (
            <div key={sup.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{sup.name}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">{sup.city}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-600 pt-2 border-t border-slate-100">
                <p>👤 <strong>Contact :</strong> {sup.contactPerson}</p>
                <p>📞 <strong>Téléphone :</strong> {sup.phone}</p>
                <p>✉️ <strong>Email :</strong> {sup.email}</p>
                <p>📍 <strong>Adresse :</strong> {sup.address}</p>
                <p>⏱️ <strong>Délai moyen de livraison :</strong> {sup.deliveryTimeDays} jours ouvrés</p>
              </div>

              <div className="pt-2">
                <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                  ✓ FOURNISSEUR AGRÉÉ
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD REAGENT */}
      <Modal
        isOpen={isAddReagentModalOpen}
        onClose={() => setIsAddReagentModalOpen(false)}
        title="Ajouter une Référence de Réactif au Catalogue"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateReagent} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Code Référence</label>
              <input
                type="text"
                required
                value={newReagent.code}
                onChange={e => setNewReagent({ ...newReagent, code: e.target.value })}
                placeholder="Ex: SYS-DCL-20L"
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catégorie</label>
              <select
                value={newReagent.category}
                onChange={e => setNewReagent({ ...newReagent, category: e.target.value as any })}
                className="w-full rounded-lg border border-slate-300 p-2"
              >
                <option value="HÉMATOLOGIE">Hématologie</option>
                <option value="BIOCHIMIE">Biochimie</option>
                <option value="MICROBIOLOGIE">Microbiologie</option>
                <option value="TUBES & AIGUILLES">Tubes & Aiguilles</option>
                <option value="CONSOMMABLES">Consommables divers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Désignation complète du Réactif</label>
            <input
              type="text"
              required
              value={newReagent.name}
              onChange={e => setNewReagent({ ...newReagent, name: e.target.value })}
              placeholder="Ex: Sysmex Cellpack DCL 20L"
              className="w-full rounded-lg border border-slate-300 p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fournisseur</label>
              <select
                value={newReagent.supplierId}
                onChange={e => setNewReagent({ ...newReagent, supplierId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Température de Stockage</label>
              <select
                value={newReagent.storageTemperature}
                onChange={e => setNewReagent({ ...newReagent, storageTemperature: e.target.value as any })}
                className="w-full rounded-lg border border-slate-300 p-2"
              >
                <option value="+2°C à +8°C">+2°C à +8°C (Réfrigérateur)</option>
                <option value="-20°C">-20°C (Congélateur)</option>
                <option value="Température Ambiante (+15 à +25°C)">Température Ambiante (+15 à +25°C)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Numéro de Lot</label>
              <input
                type="text"
                required
                value={newReagent.lotNumber}
                onChange={e => setNewReagent({ ...newReagent, lotNumber: e.target.value })}
                placeholder="Ex: CP2604A"
                className="w-full rounded-lg border border-slate-300 p-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date de Péremption</label>
              <input
                type="date"
                required
                value={newReagent.expirationDate}
                onChange={e => setNewReagent({ ...newReagent, expirationDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantité Initiale</label>
              <input
                type="number"
                min="0"
                required
                value={newReagent.currentQuantity}
                onChange={e => setNewReagent({ ...newReagent, currentQuantity: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Seuil d'Alerte Min</label>
              <input
                type="number"
                min="1"
                required
                value={newReagent.minThreshold}
                onChange={e => setNewReagent({ ...newReagent, minThreshold: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Coût Unitaire (FCFA)</label>
              <input
                type="number"
                min="0"
                required
                value={newReagent.costPerUnit}
                onChange={e => setNewReagent({ ...newReagent, costPerUnit: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddReagentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md"
            >
              Enregistrer le Réactif
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2 & 3: STOCK MOVEMENT (ENTRY / EXIT) */}
      <Modal
        isOpen={isStockEntryModalOpen || isStockExitModalOpen}
        onClose={() => {
          setIsStockEntryModalOpen(false);
          setIsStockExitModalOpen(false);
        }}
        title={movementType === 'ENTRY' ? 'Enregistrer une Entrée de Stock' : 'Enregistrer une Sortie de Stock'}
        maxWidth="md"
      >
        <form onSubmit={handleStockAdjustment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sélectionner le Réactif</label>
            <select
              value={selectedReagentForMovement?.id || ''}
              onChange={e => {
                const found = reagents.find(r => r.id === e.target.value);
                setSelectedReagentForMovement(found || null);
              }}
              className="w-full rounded-lg border border-slate-300 p-2 font-medium"
            >
              {reagents.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} (Lot: {r.lotNumber}) — Actuel: {r.currentQuantity} {r.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {movementType === 'ENTRY' ? 'Quantité Reçue' : 'Quantité Sortie'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={movementQty}
                onChange={e => setMovementQty(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-slate-300 p-2 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Opérateur</label>
              <input
                type="text"
                disabled
                value={currentUser?.name || 'Technicien'}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Motif / Justificatif</label>
            <input
              type="text"
              required
              value={movementReason}
              onChange={e => setMovementReason(e.target.value)}
              placeholder="Ex: Livraison bon de commande N°..., ou Chargement automate XN-550"
              className="w-full rounded-lg border border-slate-300 p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsStockEntryModalOpen(false);
                setIsStockExitModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-bold text-white shadow-md ${
                movementType === 'ENTRY' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              Valider le Mouvement
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: PURCHASE ORDER (BON DE COMMANDE FOURNISSEUR) */}
      <Modal
        isOpen={isPurchaseOrderModalOpen}
        onClose={() => setIsPurchaseOrderModalOpen(false)}
        title="Générer un Bon de Commande Fournisseur"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Laboratoire ExtremeLab Next</h4>
                <p className="text-[11px] text-slate-500">Service Approvisionnement & Gestion des Stocks</p>
              </div>
              <span className="font-mono text-xs font-bold text-blue-700">BC-2026-10-OCT</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Articles recommandés automatiquement selon les seuils minimaux :
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-2 px-3">Article</th>
                  <th className="py-2 px-3">Fournisseur</th>
                  <th className="py-2 px-2 text-right">Stock Actuel</th>
                  <th className="py-2 px-2 text-right">Qté Recommandée</th>
                  <th className="py-2 px-3 text-right">Total Est. (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reagents
                  .filter(r => r.currentQuantity <= r.minThreshold)
                  .map(r => {
                    const toOrder = Math.max(1, r.idealStock - r.currentQuantity);
                    return (
                      <tr key={r.id}>
                        <td className="py-2 px-3 font-bold text-slate-800">{r.name}</td>
                        <td className="py-2 px-3 text-slate-600">{r.supplierName}</td>
                        <td className="py-2 px-2 text-right text-rose-600 font-bold">{r.currentQuantity}</td>
                        <td className="py-2 px-2 text-right font-bold text-blue-700">{toOrder} {r.unit}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(toOrder * r.costPerUnit)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 shadow-md"
            >
              <Printer className="h-4 w-4" />
              Imprimer le Bon de Commande
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
