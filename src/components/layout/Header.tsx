import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Shield,
  RotateCcw,
  UserCheck,
  ChevronDown,
  Check,
  Languages,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface HeaderProps {
  onToggleSidebarMobile: () => void;
  onOpenSearch: () => void;
  onQuickAction: (action: 'patient' | 'order' | 'sample' | 'payment') => void;
  setActiveModule: (m: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebarMobile,
  onOpenSearch,
  onQuickAction,
  setActiveModule
}) => {
  const {
    currentUser,
    currentRole,
    roleMetadata,
    switchUser,
    usersList,
    canManagePatients,
    canCreateOrder,
    canManageFinances
  } = useAuth();
  const { notifications, markNotificationAsRead, resetAllDemoData } = useData();
  const { language, setLanguage } = useLanguage();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6">
      {/* Left: Mobile Toggle & Global Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-blue-400 hover:bg-white transition-all w-48 sm:w-80"
        >
          <Search className="h-4 w-4 text-slate-400" />
          <span className="flex-1 text-left truncate">Recherche globale (Patient, Demande, Réf...)...</span>
          <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
            Ctrl+K
          </kbd>
        </button>

        <button
          onClick={() => setActiveModule('patient-search')}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all shadow-2xs"
          title="Ouvrir le moteur de recherche approfondie des patients"
        >
          <User className="h-3.5 w-3.5" />
          <span>Recherche Patient</span>
        </button>
      </div>

      {/* Right: Quick actions, Role Switcher, Notifications, Language */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button Group — Filtered by Role Permissions */}
        <div className="hidden md:flex items-center gap-1.5">
          {canManagePatients() && (
            <button
              onClick={() => onQuickAction('patient')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Patient
            </button>
          )}
          {canCreateOrder() && (
            <button
              onClick={() => onQuickAction('order')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Demande
            </button>
          )}
          {canManageFinances() && (
            <button
              onClick={() => onQuickAction('payment')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Paiement
            </button>
          )}
        </div>

        {/* Demo reset button */}
        <button
          onClick={() => {
            if (confirm('Réinitialiser la base de données avec les données de test médicales ?')) {
              resetAllDemoData();
            }
          }}
          title="Réinitialiser les données de démonstration"
          className="hidden xl:inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Demo
        </button>

        {/* Language switch */}
        <button
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <Languages className="h-3.5 w-3.5 text-slate-400" />
          <span>{language.toUpperCase()}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white py-2 shadow-xl z-30">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Notifications ({unreadNotifs.length})
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">Aucune notification.</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.link) setActiveModule(n.link.replace('/', ''));
                        setNotifDropdownOpen(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="font-semibold text-slate-800">{n.title}</div>
                      <div className="text-slate-600 mt-0.5">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all"
            title={`Session active : ${currentUser?.name} (${roleMetadata.label})`}
          >
            <Shield className="h-4 w-4 text-blue-600" />
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-slate-400 font-normal uppercase leading-tight">
                Rôle & Habilitation
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${roleMetadata.badgeClass}`}>
                  {roleMetadata.label}
                </span>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white py-2 shadow-2xl z-30">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Simulation & Test des Rôles (RBAC)
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Basculez de profil pour vérifier les restrictions de chaque rôle en temps réel.
                </p>
              </div>
              <div className="py-1 max-h-72 overflow-y-auto divide-y divide-slate-100">
                {usersList.map(u => {
                  const isSelected = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-xs hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-800 truncate">{u.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 border border-slate-200">
                            {u.role}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">{u.specialty}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
