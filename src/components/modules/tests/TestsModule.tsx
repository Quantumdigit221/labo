import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  Edit2,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  FileSpreadsheet,
  Settings,
  Sparkles
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { MedicalTest, TestCategory, TestGroup, TestParameter, ResultType } from '../../../types/index.ts';
import { Modal } from '../../common/Modal.tsx';
import { ConfirmDialog } from '../../common/ConfirmDialog.tsx';
import { formatCurrency } from '../../../services/i18n.ts';

export const TestsModule: React.FC = () => {
  const { tests, testGroups, addTest, updateTest, deleteTest, addTestParameter, updateTestParameter, deleteTestParameter } = useData();
  const { canManageTests } = useAuth();

  const [activeTab, setActiveTab] = useState<'TESTS' | 'PARAMETERS' | 'GROUPS'>('TESTS');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Parameters list filters
  const [paramSearch, setParamSearch] = useState('');
  const [paramTypeFilter, setParamTypeFilter] = useState<string>('ALL');
  const [paramTestFilter, setParamTestFilter] = useState<string>('ALL');

  // Parameter Modal State
  const [isParamModalOpen, setIsParamModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<{ testId: string; param: TestParameter } | null>(null);
  const [paramTestId, setParamTestId] = useState('');
  const [paramCode, setParamCode] = useState('');
  const [paramName, setParamName] = useState('');
  const [paramUnit, setParamUnit] = useState('');
  const [paramResultType, setParamResultType] = useState<ResultType>('NUMERIC');
  const [paramOptions, setParamOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [paramReferenceText, setParamReferenceText] = useState('');
  const [paramRefMin, setParamRefMin] = useState<string>('');
  const [paramRefMax, setParamRefMax] = useState<string>('');
  const [paramCritMin, setParamCritMin] = useState<string>('');
  const [paramCritMax, setParamCritMax] = useState<string>('');

  // Delete Parameter Dialog
  const [deletingParam, setDeletingParam] = useState<{ testId: string; param: TestParameter } | null>(null);

  // New Test Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [testName, setTestName] = useState('');
  const [testCategory, setTestCategory] = useState<TestCategory>('Biochimie');
  const [testDescription, setTestDescription] = useState('');
  const [testSampleType, setTestSampleType] = useState('Sang total');
  const [testContainer, setTestContainer] = useState('Tube Sec (Rouge)');
  const [testMethod, setTestMethod] = useState('Automate');
  const [testTurnaround, setTestTurnaround] = useState('2h');
  const [testPrice, setTestPrice] = useState<number>(5000);

  const categories: (TestCategory | 'ALL')[] = [
    'ALL',
    'Hématologie',
    'Biochimie',
    'Immunologie',
    'Sérologie',
    'Microbiologie',
    'Parasitologie'
  ];

  const filteredTests = tests.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Flat list of all parameters across all tests
  const allParameters = tests.flatMap(t =>
    t.parameters.map(p => ({
      ...p,
      parentTest: t
    }))
  );

  const filteredParameters = allParameters.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(paramSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(paramSearch.toLowerCase()) ||
      p.parentTest.name.toLowerCase().includes(paramSearch.toLowerCase()) ||
      (p.options && p.options.some(opt => opt.toLowerCase().includes(paramSearch.toLowerCase())));
    const matchesType = paramTypeFilter === 'ALL' || p.resultType === paramTypeFilter;
    const matchesTest = paramTestFilter === 'ALL' || p.testId === paramTestFilter;
    return matchesSearch && matchesType && matchesTest;
  });

  // Open Parameter Modal (Create or Edit)
  const handleOpenParamModal = (targetTestId?: string, paramToEdit?: TestParameter) => {
    if (paramToEdit && targetTestId) {
      setEditingParam({ testId: targetTestId, param: paramToEdit });
      setParamTestId(targetTestId);
      setParamCode(paramToEdit.code);
      setParamName(paramToEdit.name);
      setParamUnit(paramToEdit.unit || '');
      setParamResultType(paramToEdit.resultType);
      setParamOptions(paramToEdit.options ? [...paramToEdit.options] : []);
      setParamReferenceText(paramToEdit.referenceText || '');
      setParamRefMin(paramToEdit.referenceMin !== undefined ? String(paramToEdit.referenceMin) : '');
      setParamRefMax(paramToEdit.referenceMax !== undefined ? String(paramToEdit.referenceMax) : '');
      setParamCritMin(paramToEdit.criticalMin !== undefined ? String(paramToEdit.criticalMin) : '');
      setParamCritMax(paramToEdit.criticalMax !== undefined ? String(paramToEdit.criticalMax) : '');
    } else {
      setEditingParam(null);
      setParamTestId(targetTestId || (tests.length > 0 ? tests[0].id : ''));
      setParamCode('');
      setParamName('');
      setParamUnit('');
      setParamResultType('POSITIVE_NEGATIVE');
      setParamOptions(['Négative', 'Positive']);
      setParamReferenceText('Négative');
      setParamRefMin('');
      setParamRefMax('');
      setParamCritMin('');
      setParamCritMax('');
    }
    setNewOptionInput('');
    setIsParamModalOpen(true);
  };

  // Add an option to options list
  const handleAddOption = () => {
    const trimmed = newOptionInput.trim();
    if (!trimmed) return;
    if (paramOptions.includes(trimmed)) {
      alert('Cette option existe déjà.');
      return;
    }
    setParamOptions([...paramOptions, trimmed]);
    setNewOptionInput('');
  };

  // Remove an option
  const handleRemoveOption = (optToRemove: string) => {
    setParamOptions(paramOptions.filter(o => o !== optToRemove));
  };

  // Apply quick presets for options
  const handleApplyPreset = (presetType: 'POS_NEG' | 'POS_NEG_FEM' | 'ABS_PRES' | 'REACTIF' | 'NORMAL') => {
    if (presetType === 'POS_NEG') {
      setParamOptions(['Négatif', 'Positif']);
      setParamReferenceText('Négatif');
    } else if (presetType === 'POS_NEG_FEM') {
      setParamOptions(['Négative', 'Positive']);
      setParamReferenceText('Négative');
    } else if (presetType === 'ABS_PRES') {
      setParamOptions(['Absence', 'Présence']);
      setParamReferenceText('Absence');
    } else if (presetType === 'REACTIF') {
      setParamOptions(['Non réactif', 'Réactif']);
      setParamReferenceText('Non réactif');
    } else if (presetType === 'NORMAL') {
      setParamOptions(['Normal', 'Anormal']);
      setParamReferenceText('Normal');
    }
  };

  // Switch result type handler
  const handleResultTypeChange = (newType: ResultType) => {
    setParamResultType(newType);
    if (newType === 'POSITIVE_NEGATIVE' && paramOptions.length === 0) {
      setParamOptions(['Négative', 'Positive']);
      setParamReferenceText('Négative');
    } else if (newType === 'SELECT' && paramOptions.length === 0) {
      setParamOptions(['Négatif', 'Positif', 'Douteux']);
      setParamReferenceText('Négatif');
    }
  };

  // Save parameter (Create or Edit)
  const handleSaveParameter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paramTestId) {
      alert('Veuillez sélectionner un examen d\'appartenance.');
      return;
    }
    if (!paramName.trim()) {
      alert('Veuillez renseigner le nom du paramètre.');
      return;
    }
    if (!paramCode.trim()) {
      alert('Veuillez renseigner le code du paramètre (ex: GB, VIH, GLU).');
      return;
    }

    if ((paramResultType === 'POSITIVE_NEGATIVE' || paramResultType === 'SELECT') && paramOptions.length < 2) {
      alert('Veuillez définir au moins 2 options pour ce paramètre (ex: Positive et Négative).');
      return;
    }

    const refMinNum = paramRefMin !== '' ? parseFloat(paramRefMin) : undefined;
    const refMaxNum = paramRefMax !== '' ? parseFloat(paramRefMax) : undefined;
    const critMinNum = paramCritMin !== '' ? parseFloat(paramCritMin) : undefined;
    const critMaxNum = paramCritMax !== '' ? parseFloat(paramCritMax) : undefined;

    let computedRefText = paramReferenceText.trim();
    if (!computedRefText && paramResultType === 'NUMERIC') {
      if (refMinNum !== undefined && refMaxNum !== undefined) {
        computedRefText = `${refMinNum} - ${refMaxNum} ${paramUnit}`.trim();
      }
    } else if (!computedRefText && (paramResultType === 'POSITIVE_NEGATIVE' || paramResultType === 'SELECT')) {
      computedRefText = paramOptions[0] || 'Négatif';
    }

    try {
      if (editingParam) {
        updateTestParameter(editingParam.testId, editingParam.param.id, {
          code: paramCode.trim().toUpperCase(),
          name: paramName.trim(),
          unit: paramUnit.trim(),
          resultType: paramResultType,
          options: (paramResultType === 'POSITIVE_NEGATIVE' || paramResultType === 'SELECT') ? paramOptions : undefined,
          referenceMin: refMinNum,
          referenceMax: refMaxNum,
          criticalMin: critMinNum,
          criticalMax: critMaxNum,
          referenceText: computedRefText
        });
        alert('Paramètre modifié avec succès !');
      } else {
        addTestParameter(paramTestId, {
          code: paramCode.trim().toUpperCase(),
          name: paramName.trim(),
          unit: paramUnit.trim(),
          resultType: paramResultType,
          options: (paramResultType === 'POSITIVE_NEGATIVE' || paramResultType === 'SELECT') ? paramOptions : undefined,
          referenceMin: refMinNum,
          referenceMax: refMaxNum,
          criticalMin: critMinNum,
          criticalMax: critMaxNum,
          referenceText: computedRefText
        });
        alert('Nouveau paramètre ajouté avec succès !');
      }
      setIsParamModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'enregistrement du paramètre.');
    }
  };

  // Confirm delete parameter
  const handleConfirmDeleteParam = () => {
    if (deletingParam) {
      try {
        deleteTestParameter(deletingParam.testId, deletingParam.param.id);
        setDeletingParam(null);
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la suppression.');
      }
    }
  };

  // Save new test
  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || !testCode.trim()) {
      alert('Veuillez renseigner le nom et le code de l\'examen.');
      return;
    }

    try {
      addTest({
        code: testCode.trim().toUpperCase(),
        name: testName.trim(),
        category: testCategory,
        description: testDescription.trim(),
        sampleType: testSampleType.trim(),
        container: testContainer.trim(),
        method: testMethod.trim(),
        turnaroundTime: testTurnaround.trim(),
        price: Number(testPrice) || 0,
        parameters: []
      });
      setIsTestModalOpen(false);
      alert('Nouvel examen créé avec succès ! Vous pouvez maintenant lui ajouter des paramètres.');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de l\'examen.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Catalogue des Examens & Gestion des Paramètres</h2>
            <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
              LIS / Paramétrage
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Nomenclature des analyses médicales, définition des paramètres (numériques ou qualitatifs : positif/négatif, options) et normes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageTests() && (
            <>
              <button
                onClick={() => handleOpenParamModal()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                + NOUVEAU PARAMÈTRE
              </button>
              <button
                onClick={() => {
                  setTestCode('');
                  setTestName('');
                  setTestDescription('');
                  setIsTestModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <FlaskConical className="h-4 w-4 text-blue-600" />
                + Nouvel Examen
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold max-w-fit shadow-2xs">
        <button
          onClick={() => setActiveTab('TESTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'TESTS' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="h-4 w-4" />
          <span>Examens individuels ({tests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PARAMETERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'PARAMETERS' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Gestion des Paramètres ({allParameters.length})</span>
          <span className="rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold px-1.5 py-0.2">
            Options & Réf
          </span>
        </button>

        <button
          onClick={() => setActiveTab('GROUPS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'GROUPS' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Bilans & Profils ({testGroups.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXAMENS INDIVIDUELS */}
      {/* ========================================================================= */}
      {activeTab === 'TESTS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par code (NFS, GLYC, PALU...), nom d'analyse..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'ALL' ? 'Toutes catégories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Test Cards List */}
          <div className="space-y-3">
            {filteredTests.map(t => {
              const isExpanded = expandedTestId === t.id;
              return (
                <div
                  key={t.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-xs">
                        {t.code.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-sm">{t.name}</span>
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-800">
                            {t.code}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                          <span>
                            Tube : <strong className="text-slate-700">{t.container}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Délai : <strong className="text-slate-700">{t.turnaroundTime}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Méthode : <strong className="text-slate-700">{t.method}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Tarif Laboratoire</span>
                        <div className="text-base font-bold text-blue-600">{formatCurrency(t.price)}</div>
                      </div>

                      <button
                        onClick={() => setExpandedTestId(isExpanded ? null : t.id)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                          isExpanded
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{t.parameters.length} Paramètre(s)</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Parameters Table */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-blue-600" />
                          Paramètres biologiques mesurés & Intervalles de référence
                        </h4>

                        {canManageTests() && (
                          <button
                            type="button"
                            onClick={() => handleOpenParamModal(t.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            + Ajouter un paramètre à cet examen
                          </button>
                        )}
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3 font-semibold">Paramètre</th>
                              <th className="py-2.5 px-3 font-semibold">Code</th>
                              <th className="py-2.5 px-3 font-semibold">Unité</th>
                              <th className="py-2.5 px-3 font-semibold">Type de Résultat</th>
                              <th className="py-2.5 px-3 font-semibold">Options / Normes de Référence</th>
                              <th className="py-2.5 px-3 font-semibold">Limites Critiques</th>
                              {canManageTests() && (
                                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {t.parameters.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-4 text-center text-slate-400 italic">
                                  Aucun paramètre configuré pour cet examen. Cliquez sur "+ Ajouter un paramètre" pour en créer un.
                                </td>
                              </tr>
                            ) : (
                              t.parameters.map(param => (
                                <tr key={param.id} className="hover:bg-slate-50/70">
                                  <td className="py-2.5 px-3 font-medium text-slate-800">{param.name}</td>
                                  <td className="py-2.5 px-3 font-mono text-slate-600 font-semibold">{param.code}</td>
                                  <td className="py-2.5 px-3 text-slate-600">{param.unit || '-'}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                      param.resultType === 'POSITIVE_NEGATIVE'
                                        ? 'bg-purple-100 text-purple-800'
                                        : param.resultType === 'SELECT'
                                        ? 'bg-sky-100 text-sky-800'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {param.resultType === 'POSITIVE_NEGATIVE'
                                        ? 'Positif / Négatif'
                                        : param.resultType === 'SELECT'
                                        ? 'Options personnalisées'
                                        : param.resultType}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {param.options && param.options.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {param.options.map(opt => (
                                          <span
                                            key={opt}
                                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                              opt.toLowerCase().includes('positif') || opt.toLowerCase().includes('présence') || opt.toLowerCase().includes('réactif')
                                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}
                                          >
                                            {opt}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="font-semibold text-emerald-700">
                                        {param.referenceText ||
                                          (param.referenceMin !== undefined && param.referenceMax !== undefined
                                            ? `${param.referenceMin} - ${param.referenceMax} ${param.unit}`
                                            : '-')}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-rose-600 font-mono text-[11px]">
                                    {param.criticalMin !== undefined || param.criticalMax !== undefined
                                      ? `< ${param.criticalMin ?? '-'} ou > ${param.criticalMax ?? '-'}`
                                      : '-'}
                                  </td>
                                  {canManageTests() && (
                                    <td className="py-2.5 px-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenParamModal(t.id, param)}
                                          className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                                          title="Modifier ce paramètre"
                                        >
                                          <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeletingParam({ testId: t.id, param })}
                                          className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                                          title="Supprimer ce paramètre"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GESTION CENTRALISÉE DES PARAMÈTRES (Requirement: Gestion des paramètres) */}
      {/* ========================================================================= */}
      {activeTab === 'PARAMETERS' && (
        <div className="space-y-4">
          {/* Information Banner */}
          <div className="rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50 via-sky-50 to-indigo-50 p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  Gestion Complète des Paramètres d'Examens & Options
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Configurez ici chaque paramètre mesuré : type de saisie (numérique ou qualitatif), options pré-définies (<strong>Positive, Négative</strong>, Présence, Absence, Réactif...), valeurs de référence et seuils critiques d'alarme.
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={paramSearch}
                onChange={e => setParamSearch(e.target.value)}
                placeholder="Rechercher par nom de paramètre, code, examen parent ou option..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={paramTypeFilter}
              onChange={e => setParamTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none w-full sm:w-auto"
            >
              <option value="ALL">Tous les types de résultats</option>
              <option value="POSITIVE_NEGATIVE">Positif / Négatif (Qualitatif)</option>
              <option value="SELECT">Options personnalisées (Select)</option>
              <option value="NUMERIC">Numérique (Intervalles)</option>
              <option value="TEXT">Texte libre</option>
              <option value="BOOLEAN">Booléen</option>
            </select>

            <select
              value={paramTestFilter}
              onChange={e => setParamTestFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none w-full sm:w-auto max-w-xs truncate"
            >
              <option value="ALL">Tous les examens ({tests.length})</option>
              {tests.map(t => (
                <option key={t.id} value={t.id}>
                  {t.code} - {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Parameters Central Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Paramètre & Code</th>
                    <th className="py-3 px-4 font-semibold">Examen Rattaché</th>
                    <th className="py-3 px-4 font-semibold">Unité</th>
                    <th className="py-3 px-4 font-semibold">Type de Résultat</th>
                    <th className="py-3 px-4 font-semibold">Options Configurées (Pills)</th>
                    <th className="py-3 px-4 font-semibold">Normes & Référence</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParameters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        Aucun paramètre ne correspond à votre recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredParameters.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                            {p.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-700">{p.parentTest.name}</div>
                          <span className="text-[10px] text-slate-400">
                            {p.parentTest.code} • {p.parentTest.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {p.unit || <span className="text-slate-400 italic">Sans unité</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            p.resultType === 'POSITIVE_NEGATIVE'
                              ? 'bg-purple-100 text-purple-800'
                              : p.resultType === 'SELECT'
                              ? 'bg-sky-100 text-sky-800'
                              : p.resultType === 'NUMERIC'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.resultType === 'POSITIVE_NEGATIVE' && 'Positif / Négatif'}
                            {p.resultType === 'SELECT' && 'Options configurables'}
                            {p.resultType === 'NUMERIC' && 'Numérique (min/max)'}
                            {p.resultType === 'TEXT' && 'Texte libre'}
                            {p.resultType === 'BOOLEAN' && 'Booléen'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {p.options && p.options.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {p.options.map(opt => (
                                <span
                                  key={opt}
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                    opt.toLowerCase().includes('positif') || opt.toLowerCase().includes('présence') || opt.toLowerCase().includes('réactif')
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Aucune liste (valeur libre)</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-emerald-700">
                            {p.referenceText ||
                              (p.referenceMin !== undefined && p.referenceMax !== undefined
                                ? `${p.referenceMin} - ${p.referenceMax} ${p.unit}`
                                : '-')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenParamModal(p.testId, p)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-3 w-3 text-blue-600" />
                              <span>Modifier</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingParam({ testId: p.testId, param: p })}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BILANS & GROUPES */}
      {/* ========================================================================= */}
      {activeTab === 'GROUPS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testGroups.map(grp => {
            const includedTests = tests.filter(t => grp.testIds.includes(t.id));
            const sumOriginalPrice = includedTests.reduce((acc, t) => acc + t.price, 0);

            return (
              <div
                key={grp.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700 font-bold text-sm">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{grp.name}</h3>
                      <span className="font-mono text-xs text-purple-600 font-semibold">{grp.code}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-purple-700">
                      {formatCurrency(grp.discountedPrice || sumOriginalPrice)}
                    </div>
                    {grp.discountedPrice && grp.discountedPrice < sumOriginalPrice && (
                      <div className="text-[11px] text-slate-400 line-through">
                        {formatCurrency(sumOriginalPrice)}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500">{grp.description}</p>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">
                    Examens inclus ({includedTests.length}) :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {includedTests.map(it => (
                      <span
                        key={it.id}
                        className="rounded-md bg-slate-100 border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700"
                      >
                        {it.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AJOUTER / MODIFIER UN PARAMÈTRE */}
      {/* ========================================================================= */}
      {isParamModalOpen && (
        <Modal
          isOpen={isParamModalOpen}
          onClose={() => setIsParamModalOpen(false)}
          title={editingParam ? `Modifier le Paramètre : ${editingParam.param.name}` : "Nouveau Paramètre d'Examen"}
          subtitle="Définition du code, type de résultat, options (positive/négative ou personnalisées) et valeurs de référence"
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveParameter} className="space-y-4 text-xs">
            {/* Examen parent */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Examen médical de rattachement <span className="text-rose-500">*</span>
              </label>
              <select
                value={paramTestId}
                onChange={e => setParamTestId(e.target.value)}
                disabled={!!editingParam}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                required
              >
                <option value="">Sélectionnez un examen...</option>
                {tests.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.code} - {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nom du paramètre */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nom du paramètre <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={paramName}
                  onChange={e => setParamName(e.target.value)}
                  placeholder="ex: Sérologie VIH 1 & 2, Antigène HBs, Glycémie..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Code paramètre */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Code interne <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={paramCode}
                  onChange={e => setParamCode(e.target.value)}
                  placeholder="ex: VIH, HBS, GLU, GB..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-mono font-bold uppercase focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Type de Résultat */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Type de résultat <span className="text-rose-500">*</span>
                </label>
                <select
                  value={paramResultType}
                  onChange={e => handleResultTypeChange(e.target.value as ResultType)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                >
                  <option value="POSITIVE_NEGATIVE">Positif / Négatif (Qualitatif)</option>
                  <option value="SELECT">Liste d'options personnalisées (Select)</option>
                  <option value="NUMERIC">Numérique (Intervalle min / max)</option>
                  <option value="TEXT">Texte libre / Commentaire</option>
                  <option value="BOOLEAN">Booléen (Oui / Non)</option>
                </select>
              </div>

              {/* Unité */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Unité de mesure (si applicable)
                </label>
                <input
                  type="text"
                  value={paramUnit}
                  onChange={e => setParamUnit(e.target.value)}
                  placeholder="ex: g/L, mg/L, 10^3/µL, % ou vide"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* OPTIONS MANAGEMENT SECTION (When POSITIVE_NEGATIVE or SELECT) */}
            {(paramResultType === 'POSITIVE_NEGATIVE' || paramResultType === 'SELECT') && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <span>Options de résultats disponibles lors de la saisie</span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded">
                    {paramOptions.length} option(s) configurée(s)
                  </span>
                </div>

                <p className="text-[11px] text-slate-600">
                  Ces options s'afficheront sous forme de boutons cliquables rapides pour le technicien lors de la saisie des résultats.
                </p>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Modèles rapides :</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('POS_NEG')}
                    className="rounded-lg bg-white border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    + Positif / Négatif
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('POS_NEG_FEM')}
                    className="rounded-lg bg-white border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    + Positive / Négative
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('ABS_PRES')}
                    className="rounded-lg bg-white border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    + Absence / Présence
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('REACTIF')}
                    className="rounded-lg bg-white border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    + Réactif / Non réactif
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('NORMAL')}
                    className="rounded-lg bg-white border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    + Normal / Anormal
                  </button>
                </div>

                {/* Option Adder */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newOptionInput}
                    onChange={e => setNewOptionInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    placeholder="Ajouter une option personnalisée (ex: Douteux, Traces, Faiblement positif...)"
                    className="flex-1 rounded-xl border border-slate-300 bg-white py-1.5 px-3 text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="rounded-xl bg-slate-800 text-white px-3 py-1.5 text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
                  >
                    Ajouter l'option
                  </button>
                </div>

                {/* Active Options Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {paramOptions.map((opt, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                    >
                      <span>{opt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt)}
                        className="rounded-full p-0.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                        title="Retirer cette option"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Default / Reference normal choice */}
                <div className="pt-2 border-t border-blue-200/60">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Valeur normale de référence par défaut
                  </label>
                  <select
                    value={paramReferenceText}
                    onChange={e => setParamReferenceText(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-1.5 px-3 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Sélectionnez la valeur normale attendue...</option>
                    {paramOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt} (Norme de santé)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* NUMERIC RANGES SECTION (When NUMERIC) */}
            {paramResultType === 'NUMERIC' && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                <span className="block font-bold text-slate-700 text-xs">
                  Intervalles de référence & Limites critiques (Alertes)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Min Référence</label>
                    <input
                      type="number"
                      step="any"
                      value={paramRefMin}
                      onChange={e => setParamRefMin(e.target.value)}
                      placeholder="ex: 0.70"
                      className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Max Référence</label>
                    <input
                      type="number"
                      step="any"
                      value={paramRefMax}
                      onChange={e => setParamRefMax(e.target.value)}
                      placeholder="ex: 1.10"
                      className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-rose-600 font-semibold mb-0.5">Min Critique (Urgence)</label>
                    <input
                      type="number"
                      step="any"
                      value={paramCritMin}
                      onChange={e => setParamCritMin(e.target.value)}
                      placeholder="ex: 0.50"
                      className="w-full rounded-lg border border-rose-300 bg-white p-1.5 text-xs focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-rose-600 font-semibold mb-0.5">Max Critique (Urgence)</label>
                    <input
                      type="number"
                      step="any"
                      value={paramCritMax}
                      onChange={e => setParamCritMax(e.target.value)}
                      placeholder="ex: 3.50"
                      className="w-full rounded-lg border border-rose-300 bg-white p-1.5 text-xs focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">
                    Libellé personnalisé imprimé sur le rapport médical (optionnel)
                  </label>
                  <input
                    type="text"
                    value={paramReferenceText}
                    onChange={e => setParamReferenceText(e.target.value)}
                    placeholder="ex: 0.70 - 1.10 g/L (3.9 - 6.1 mmol/L)"
                    className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* FREE TEXT REFERENCE SECTION */}
            {paramResultType === 'TEXT' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Valeur de référence textuelle
                </label>
                <input
                  type="text"
                  value={paramReferenceText}
                  onChange={e => setParamReferenceText(e.target.value)}
                  placeholder="ex: Flore polymorphe équilibrée, absence de germes..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsParamModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {editingParam ? 'Enregistrer les modifications' : 'Créer le paramètre'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOUVEL EXAMEN MÉDICAL */}
      {/* ========================================================================= */}
      {isTestModalOpen && (
        <Modal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          title="Nouvel Examen Médical"
          subtitle="Ajoutez une nouvelle analyse au catalogue général du laboratoire"
          maxWidth="xl"
        >
          <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Code Examen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={testCode}
                  onChange={e => setTestCode(e.target.value)}
                  placeholder="ex: TROPONINE, SERO_COVID..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-mono font-bold uppercase focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Catégorie d'analyse <span className="text-rose-500">*</span>
                </label>
                <select
                  value={testCategory}
                  onChange={e => setTestCategory(e.target.value as TestCategory)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                >
                  <option value="Hématologie">Hématologie</option>
                  <option value="Biochimie">Biochimie</option>
                  <option value="Immunologie">Immunologie</option>
                  <option value="Sérologie">Sérologie</option>
                  <option value="Microbiologie">Microbiologie</option>
                  <option value="Parasitologie">Parasitologie</option>
                  <option value="Hormonologie">Hormonologie</option>
                  <option value="Autres">Autres</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Nom complet de l'examen <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={testName}
                onChange={e => setTestName(e.target.value)}
                placeholder="ex: Troponine I Ultrasensible, Sérologie Hépatite C..."
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Description / Indications</label>
              <textarea
                value={testDescription}
                onChange={e => setTestDescription(e.target.value)}
                rows={2}
                placeholder="Description clinique, conditions de prélèvement..."
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tube / Contenant</label>
                <input
                  type="text"
                  value={testContainer}
                  onChange={e => setTestContainer(e.target.value)}
                  placeholder="ex: Tube Sec (Rouge), Tube EDTA (Violet)..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tarif (FCFA) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  value={testPrice}
                  onChange={e => setTestPrice(Number(e.target.value))}
                  placeholder="ex: 8000"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-bold text-blue-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Enregistrer l'Examen
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE PARAMETER DIALOG */}
      {deletingParam && (
        <ConfirmDialog
          isOpen={!!deletingParam}
          title="Supprimer le paramètre"
          message={`Êtes-vous sûr de vouloir supprimer définitivement le paramètre "${deletingParam.param.name}" (${deletingParam.param.code}) de l'analyse ?`}
          confirmLabel="Supprimer définitivement"
          cancelLabel="Conserver"
          variant="danger"
          onConfirm={handleConfirmDeleteParam}
          onCancel={() => setDeletingParam(null)}
        />
      )}
    </div>
  );
};
