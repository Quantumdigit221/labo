import React from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  UserCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth, ROLE_ALLOWED_MODULES } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';

interface AccessDeniedViewProps {
  attemptedModule: string;
  onNavigateHome: () => void;
  onOpenRoleSwitcher?: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  attemptedModule,
  onNavigateHome,
  onOpenRoleSwitcher
}) => {
  const { currentUser, currentRole, roleMetadata, switchUser, usersList } = useAuth();

  // Find roles that CAN access this module
  const authorizedRoles = (Object.keys(ROLE_ALLOWED_MODULES) as UserRole[]).filter(role =>
    ROLE_ALLOWED_MODULES[role].includes(attemptedModule)
  );

  // Friendly name for attempted module
  const moduleLabels: Record<string, string> = {
    users: 'Gestion des Utilisateurs & Habilitations',
    settings: 'Paramètres Système du Laboratoire',
    backup: 'Sauvegarde & Restauration Système',
    translations: 'Gestion des Traductions & Langues',
    accounting: 'Comptabilité Générale & Clôture de Caisse',
    'daily-report': 'Rapport Financier Journalier',
    invoices: 'Facturation & Règlements',
    payments: 'Caisse & Encaissements',
    contracts: 'Conventions & Organismes Tiers (IPM)',
    results: 'Saisie & Validation Biologique des Résultats',
    'quality-control': 'Contrôle Qualité (Levey-Jennings / Westgard)',
    analyzers: 'Automates de Laboratoire & Interfaces HL7',
    cultures: 'Bactériologie & Cultures',
    antibiotics: 'Antibiotiques & Familles Thérapeutiques',
    antibiograms: 'Antibiogrammes & Interprétation CASFM / EUCAST',
    inventory: 'Gestion des Stocks de Réactifs & Consommables'
  };

  const moduleDisplayName = moduleLabels[attemptedModule] || attemptedModule;

  // Alternate user that has access to this module
  const authorizedSampleUser = usersList.find(u => authorizedRoles.includes(u.role));

  return (
    <div className="py-12 px-4 max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="rounded-2xl border border-rose-200 bg-white p-8 shadow-xl shadow-rose-500/5 relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-rose-50/70 pointer-events-none" />

        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-inner">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
              <Lock className="h-3.5 w-3.5" />
              Accès Restreint par les Droits d'Accès (RBAC)
            </div>

            <h2 className="text-2xl font-black tracking-tight text-slate-800">
              Permissions Insuffisantes
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Le module <span className="font-bold text-slate-900 underline decoration-rose-300">« {moduleDisplayName} »</span> est restreint par la politique de sécurité du laboratoire. Votre rôle métier actuel ne dispose pas des privilèges nécessaires pour y accéder.
            </p>
          </div>
        </div>

        {/* Current User & Role Status */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">
              Profil utilisateur en cours :
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleMetadata.badgeClass}`}>
              {roleMetadata.label} ({currentRole})
            </span>
          </div>

          <div className="text-xs text-slate-700 font-medium flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span>{currentUser?.name || 'Utilisateur'}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{currentUser?.specialty || 'Personnel de santé'}</span>
          </div>

          <p className="text-[11px] text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-200/80">
            « {roleMetadata.description} »
          </p>
        </div>

        {/* Who has access */}
        <div className="mt-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-blue-500" />
            Rôles habilités pour ce module :
          </div>
          <div className="flex flex-wrap gap-1.5">
            {authorizedRoles.map(r => (
              <span
                key={r}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-900 transition-all active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Retourner au Tableau de Bord
          </button>

          {authorizedSampleUser && (
            <button
              onClick={() => switchUser(authorizedSampleUser.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95"
              title={`Tester avec le profil de ${authorizedSampleUser.name} (${authorizedSampleUser.role})`}
            >
              <span>Basculer sur {authorizedSampleUser.name} ({authorizedSampleUser.role})</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
