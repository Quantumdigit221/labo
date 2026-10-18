import React from 'react';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Home,
  FileSpreadsheet,
  TestTube2,
  FlaskConical,
  Bug,
  Pill,
  Grid,
  FileCheck2,
  Layers,
  Receipt,
  CreditCard,
  Building2,
  Calculator,
  MessageSquare,
  PhoneCall,
  Mail,
  Send,
  FileText,
  BarChart3,
  ShieldAlert,
  Settings,
  Languages,
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Calendar,
  Cpu,
  Sparkles,
  Globe,
  Database,
  Package,
  Activity,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (m: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  collapsed,
  setCollapsed
}) => {
  const { currentUser, currentRole, roleMetadata, canAccessModule, logout } = useAuth();
  const { results, samples, invoices, reagents } = useData();
  const { t } = useLanguage();

  const toValidateCount = results.filter(r => r.status === 'ENTERED').length;
  const samplesWaitingCount = samples.filter(s => s.status === 'WAITING').length;
  const unpaidInvoicesCount = invoices.filter(i => i.status === 'UNPAID' || i.status === 'PARTIAL').length;
  const criticalStockCount = reagents.filter(r => r.status === 'CRITICAL' || r.status === 'LOW').length;

  const menuSections = [
    {
      title: t('nav.dashboard'),
      items: [
        { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard }
      ]
    },
    {
      title: t('nav.patients_section'),
      items: [
        { id: 'patient-search', label: t('nav.patient_search'), icon: Search },
        { id: 'patients', label: t('nav.patients'), icon: Users },
        { id: 'doctors', label: t('nav.doctors'), icon: Stethoscope },
        { id: 'home-visits', label: t('nav.home_visits'), icon: Home },
        { id: 'portal', label: t('nav.portal'), icon: Globe }
      ]
    },
    {
      title: t('nav.lab_section'),
      items: [
        { id: 'orders', label: t('nav.orders'), icon: FileSpreadsheet },
        {
          id: 'samples',
          label: t('nav.samples'),
          icon: TestTube2,
          badge: samplesWaitingCount > 0 ? samplesWaitingCount : undefined,
          badgeColor: 'bg-amber-500 text-white'
        },
        { id: 'tests', label: t('nav.tests'), icon: FlaskConical },
        { id: 'group-tests', label: t('nav.group_tests'), icon: Layers },
        { id: 'cultures', label: t('nav.cultures'), icon: Bug },
        { id: 'antibiotics', label: t('nav.antibiotics'), icon: Pill },
        { id: 'antibiograms', label: t('nav.antibiograms'), icon: Grid },
        {
          id: 'results',
          label: t('nav.results'),
          icon: FileCheck2,
          badge: toValidateCount > 0 ? toValidateCount : undefined,
          badgeColor: 'bg-rose-500 text-white'
        },
        { id: 'quality-control', label: t('nav.quality_control'), icon: Activity },
        { id: 'analyzers', label: t('nav.analyzers'), icon: Cpu },
        { id: 'ai-assistant', label: t('nav.ai_assistant'), icon: Sparkles }
      ]
    },
    {
      title: t('nav.management_section'),
      items: [
        {
          id: 'inventory',
          label: t('nav.inventory'),
          icon: Package,
          badge: criticalStockCount > 0 ? criticalStockCount : undefined,
          badgeColor: 'bg-rose-500 text-white'
        },
        { id: 'price-list', label: t('nav.price_list'), icon: FileSpreadsheet },
        { id: 'contracts', label: t('nav.contracts'), icon: Building2 },
        {
          id: 'invoices',
          label: t('nav.invoices'),
          icon: Receipt,
          badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
          badgeColor: 'bg-amber-500 text-white'
        },
        { id: 'accounting', label: t('nav.accounting'), icon: Calculator }
      ]
    },
    {
      title: t('nav.communication_section'),
      items: [
        { id: 'chat', label: t('nav.chat'), icon: MessageSquare },
        { id: 'whatsapp', label: t('nav.whatsapp'), icon: PhoneCall },
        { id: 'sms', label: t('nav.sms'), icon: Send },
        { id: 'emails', label: t('nav.emails'), icon: Mail }
      ]
    },
    {
      title: t('nav.reports_section'),
      items: [
        { id: 'reports', label: t('nav.reports'), icon: FileText },
        { id: 'daily-report', label: t('nav.daily_report'), icon: Calendar },
        { id: 'statistics', label: t('nav.statistics'), icon: BarChart3 }
      ]
    },
    {
      title: t('nav.admin_section'),
      items: [
        { id: 'users', label: t('nav.users'), icon: ShieldAlert },
        { id: 'settings', label: t('nav.settings'), icon: Settings },
        { id: 'translations', label: t('nav.translations'), icon: Languages },
        { id: 'activity-logs', label: t('nav.activity_logs'), icon: History },
        { id: 'backup', label: t('nav.backup'), icon: Database }
      ]
    }
  ];

  const filteredSections = menuSections
    .map(sec => ({
      ...sec,
      items: sec.items.filter(item => canAccessModule(item.id))
    }))
    .filter(sec => sec.items.length > 0);

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold shadow-md shadow-blue-500/20">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1">
                EXTREMELAB <span className="text-blue-400 font-extrabold">NEXT</span>
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                LIS / LIMS Médical
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold shadow-md">
            <FlaskConical className="h-6 w-6" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {sec.title}
              </h4>
            )}
            {sec.items.map(item => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 py-0.2 ${
                        item.badgeColor || 'bg-blue-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer Profile & Role Status */}
      <div className="border-t border-slate-800 p-3 bg-slate-950/40">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-semibold text-xs">
                  {currentUser?.name
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('') || 'DR'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">
                    {currentUser?.name || 'Dr. Mariama Ba-Diallo'}
                  </p>
                  <p className="truncate text-[10px] text-slate-400">
                    {currentUser?.specialty || currentRole}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Déconnexion"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Role indicator pill */}
            <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-mono">Rôle actif :</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${roleMetadata.badgeClass}`}>
                {roleMetadata.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-semibold text-xs"
              title={`${currentUser?.name} (${roleMetadata.label})`}
            >
              {currentUser?.name?.[0] || 'U'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
