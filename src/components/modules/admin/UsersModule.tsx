import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Check,
  X,
  UserCheck,
  Lock,
  Plus,
  ShieldCheck,
  Stethoscope,
  FlaskConical,
  Calculator,
  Briefcase,
  HeartPulse,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  useAuth,
  ROLE_PERMISSIONS,
  ROLE_ALLOWED_MODULES,
  ROLE_METADATA
} from '../../../context/AuthContext.tsx';
import { UserRole, Permission } from '../../../types/index.ts';
import { Modal } from '../../common/Modal.tsx';

export const UsersModule: React.FC = () => {
  const { usersList, currentUser, switchUser, addUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'USERS' | 'MODULES' | 'PERMISSIONS' | 'COMPLIANCE'>('USERS');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'TECHNICIAN' as UserRole,
    specialty: ''
  });

  const allRoles: UserRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'MANAGER',
    'BIOLOGIST',
    'TECHNICIAN',
    'RECEPTION',
    'ACCOUNTANT',
    'DOCTOR'
  ];

  const allPermissions: Permission[] = [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE',
    'VALIDATE',
    'PRINT',
    'SEND',
    'EXPORT'
  ];

  const permissionLabels: Record<Permission, string> = {
    VIEW: 'Consulter (Lecture seule)',
    CREATE: 'Créer (Nouveaux enregistrements)',
    EDIT: 'Modifier (Mise à jour des données)',
    DELETE: 'Supprimer (Archivage sécurisé)',
    VALIDATE: 'Valider (Signature Biologique officielle)',
    PRINT: 'Imprimer (Comptes-rendus & Reçus de caisse)',
    SEND: 'Envoyer (WhatsApp, SMS & Email)',
    EXPORT: 'Exporter (Fichiers Excel / Comptables)'
  };

  const keyFunctionalModules = [
    { id: 'dashboard', name: 'Tableau de bord général' },
    { id: 'patient-search', name: 'Recherche Avancée & Antériorités' },
    { id: 'patients', name: 'Dossiers Patients & Identités' },
    { id: 'orders', name: 'Demandes & Prescriptions' },
    { id: 'samples', name: 'Gestion & Réception Échantillons' },
    { id: 'tests', name: 'Catalogue des Examens & Valeurs Réf.' },
    { id: 'cultures', name: 'Microbiologie & Antibiogrammes' },
    { id: 'results', name: 'Saisie Technique des Résultats' },
    { id: 'validate_action', name: 'Signature & Validation Biologique (Visa Légal)' },
    { id: 'quality-control', name: 'Contrôle Qualité (Levey-Jennings)' },
    { id: 'analyzers', name: 'Automates & Interfaces HL7' },
    { id: 'invoices', name: 'Facturation & IPM / Assurances' },
    { id: 'payments', name: 'Caisse & Encaissements Quotidiens' },
    { id: 'accounting', name: 'Comptabilité & Clôture Caisse' },
    { id: 'inventory', name: 'Gestion des Réactifs & Consommables' },
    { id: 'users', name: 'Gestion Utilisateurs & Rôles' },
    { id: 'settings', name: 'Configuration Système & Entêtes' },
    { id: 'backup', name: 'Sauvegardes & Restauration' }
  ];

  const isModuleGrantedForRole = (role: UserRole, modId: string): boolean => {
    if (modId === 'validate_action') {
      return role === 'BIOLOGIST' || role === 'SUPER_ADMIN' || role === 'ADMIN';
    }
    const allowed = ROLE_ALLOWED_MODULES[role] || [];
    return allowed.includes(modId);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) return;

    addUser({
      name: newUserData.name,
      email: newUserData.email,
      phone: newUserData.phone || '+221 77 000 00 00',
      role: newUserData.role,
      specialty: newUserData.specialty || ROLE_METADATA[newUserData.role]?.label,
      active: true
    });

    setIsAddUserModalOpen(false);
    setNewUserData({
      name: '',
      email: '',
      phone: '',
      role: 'TECHNICIAN',
      specialty: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">
              Gestion des Utilisateurs & Droits d'Accès (RBAC)
            </h2>
            <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
              Conforme ISO 15189 / GBEA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Contrôle d'accès basé sur les rôles (RBAC), séparation des tâches pré-analytiques, techniques, biologiques et financières.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Ajouter un Collaborateur
        </button>
      </div>

      {/* Role Testing Quick Banner */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>Session active de test :</span>
                <span className="font-extrabold text-blue-700">{currentUser?.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ROLE_METADATA[currentUser?.role || 'BIOLOGIST'].badgeClass}`}>
                  {ROLE_METADATA[currentUser?.role || 'BIOLOGIST'].label} ({currentUser?.role})
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Cliquez sur n'importe quel profil ci-dessous pour basculer instantanément de rôle et constater en direct l'adaptation du menu et des actions autorisées.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-blue-100/80 flex flex-wrap gap-2">
          {usersList.map(u => {
            const isSelected = currentUser?.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
                }`}
              >
                <span>{u.name.split(' ')[0]} {u.name.split(' ')[1] || ''}</span>
                <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {u.role}
                </span>
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'USERS'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          Personnel & Comptes Utilisateurs ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('MODULES')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'MODULES'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="h-4 w-4" />
          Matrice d'Accès aux Modules
        </button>
        <button
          onClick={() => setActiveTab('PERMISSIONS')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'PERMISSIONS'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Matrice des Opérations (CRUD & Signature)
        </button>
        <button
          onClick={() => setActiveTab('COMPLIANCE')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'COMPLIANCE'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Info className="h-4 w-4" />
          Règles Métier & Sécurité Médicale
        </button>
      </div>

      {/* TAB 1: USERS LIST */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Nom & Prénom</th>
                    <th className="py-3 px-4 font-semibold">Rôle Métier</th>
                    <th className="py-3 px-4 font-semibold">Fonction & Spécialité</th>
                    <th className="py-3 px-4 font-semibold">Coordonnées</th>
                    <th className="py-3 px-4 font-semibold text-center">Signature Biologique</th>
                    <th className="py-3 px-4 font-semibold text-center">Accès Caisse</th>
                    <th className="py-3 px-4 font-semibold text-right">Action Simulation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map(u => {
                    const isCurrent = currentUser?.id === u.id;
                    const meta = ROLE_METADATA[u.role] || ROLE_METADATA.BIOLOGIST;
                    return (
                      <tr
                        key={u.id}
                        className={
                          isCurrent
                            ? 'bg-blue-50/60 font-medium'
                            : 'hover:bg-slate-50/80 transition-colors'
                        }
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="rounded bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2">
                                VOUS
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded px-2.5 py-0.5 text-[10px] font-bold border ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{u.specialty}</td>
                        <td className="py-3 px-4 text-slate-500">
                          <div>{u.email}</div>
                          <div className="text-[10px] text-slate-400">{u.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {meta.canValidateBiologically ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Check className="h-3 w-3" /> Habilité
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                              <X className="h-3 w-3 text-slate-300" /> Non
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {meta.canManageFinances ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Check className="h-3 w-3" /> Autorisé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                              <X className="h-3 w-3 text-slate-300" /> Non
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isCurrent ? (
                            <span className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 shadow-2xs">
                              <Check className="h-3.5 w-3.5" /> Session Active
                            </span>
                          ) : (
                            <button
                              onClick={() => switchUser(u.id)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-blue-400 transition-all shadow-2xs"
                            >
                              Tester ce profil
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODULES ACCESS MATRIX */}
      {activeTab === 'MODULES' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Matrice de Contrôle d'Accès aux Modules (Navigation & Écrans)
            </h3>
            <p className="text-xs text-slate-500">
              Chaque rôle ne voit dans son menu que les modules pour lesquels il est habilité. Toute tentative d'accès direct est bloquée par l'écran de restriction de sécurité.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-3 px-4 font-semibold">Module Fonctionnel</th>
                  {allRoles.map(r => (
                    <th key={r} className="py-3 px-2 text-center text-[10px] font-mono">
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {keyFunctionalModules.map(mod => (
                  <tr key={mod.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {mod.name}
                    </td>
                    {allRoles.map(r => {
                      const granted = isModuleGrantedForRole(r, mod.id);
                      return (
                        <td key={r} className="py-2.5 px-2 text-center">
                          {granted ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-300 mx-auto">
                              <X className="h-3 w-3" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CRUD & OPERATIONS MATRIX */}
      {activeTab === 'PERMISSIONS' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Matrice des Privilèges d'Opérations (CRUD & Actes Médicaux)
            </h3>
            <p className="text-xs text-slate-500">
              Définition fine des actions réalisables au sein des modules autorisés.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-3 px-4 font-semibold">Opération Métier</th>
                  {allRoles.map(r => (
                    <th key={r} className="py-3 px-2 text-center text-[10px] font-mono">
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allPermissions.map(perm => (
                  <tr key={perm} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {permissionLabels[perm]}
                    </td>
                    {allRoles.map(r => {
                      const hasPerm = ROLE_PERMISSIONS[r]?.includes(perm);
                      return (
                        <td key={r} className="py-2.5 px-2 text-center">
                          {hasPerm ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-300 mx-auto">
                              <X className="h-3 w-3" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE & CLINICAL RULES */}
      {activeTab === 'COMPLIANCE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>Validation Biologique & Responsabilité Légale</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              En accord avec le Guide de Bonne Exécution des Analyses (GBEA) et la norme ISO 15189, la signature des comptes-rendus d'examens est un acte médicalement engageant. Seuls les <strong>Biologistes Médicaux</strong> (Médecins ou Pharmaciens Biologistes) et la Direction Technique habilitée peuvent valider définitivement un résultat.
            </p>
            <div className="rounded-lg bg-blue-50 p-3 text-[11px] text-blue-900 font-medium">
              ✓ Un technicien peut saisir et modifier les valeurs brutes mais ne peut jamais signer le compte-rendu définitif.
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Calculator className="h-5 w-5" />
              <span>Séparation des Flux Financiers & Administratifs</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pour assurer l'intégrité comptable et éviter les fraudes, la gestion des encaissements et des tarifs est cloisonnée. Les techniciens et médecins n'ont pas accès à la comptabilité générale ou aux clôtures de caisse.
            </p>
            <div className="rounded-lg bg-emerald-50 p-3 text-[11px] text-emerald-900 font-medium">
              ✓ La Réception enregistre les règlements au comptoir ; le Comptable effectue le rapprochement et les états financiers.
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <AlertTriangle className="h-5 w-5" />
              <span>Traçabilité & Piste d'Audit Immuable</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Toute action de saisie, modification, validation ou basculement de session est systématiquement horodatée et enregistrée dans le journal d'activité (Audit Trail) avec l'identifiant et le rôle de l'opérateur.
            </p>
            <div className="rounded-lg bg-amber-50 p-3 text-[11px] text-amber-900 font-medium">
              ✓ Les suppressions de données sont strictement réservées aux Administrateurs Système avec motif obligatoire.
            </div>
          </div>

          <div className="rounded-xl border border-purple-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
              <HeartPulse className="h-5 w-5" />
              <span>Confidentialité Médicale & Secret Professionnel</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Les médecins prescripteurs externes ont un accès ciblé restreint exclusivement à la consultation de leurs propres prescriptions et des comptes-rendus validés, garantissant le respect absolu du secret médical.
            </p>
            <div className="rounded-lg bg-purple-50 p-3 text-[11px] text-purple-900 font-medium">
              ✓ Les résultats non encore validés ne sont jamais diffusés aux praticiens ou aux patients.
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <Modal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          title="Ajouter un Collaborateur"
          subtitle="Création d'un nouveau compte personnel avec attribution de rôle RBAC"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nom complet & Titre</label>
              <input
                type="text"
                required
                value={newUserData.name}
                onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder="Ex: Dr. Ousmane Diagne"
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email professionnel</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="nom@extremelab.sn"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={newUserData.phone}
                  onChange={e => setNewUserData({ ...newUserData, phone: e.target.value })}
                  placeholder="+221 77 123 45 67"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Rôle Métier & Habilitation</label>
              <select
                value={newUserData.role}
                onChange={e => {
                  const role = e.target.value as UserRole;
                  setNewUserData({
                    ...newUserData,
                    role,
                    specialty: ROLE_METADATA[role]?.label || ''
                  });
                }}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                {allRoles.map(r => (
                  <option key={r} value={r}>
                    {ROLE_METADATA[r]?.label} ({r})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1 italic">
                {ROLE_METADATA[newUserData.role]?.description}
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Spécialité / Fonction affichée</label>
              <input
                type="text"
                value={newUserData.specialty}
                onChange={e => setNewUserData({ ...newUserData, specialty: e.target.value })}
                placeholder="Ex: Technicien d'Hématologie & Banque de Sang"
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
              >
                Enregistrer l'Utilisateur
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
