import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission } from '../types/index.ts';
import { dbService, INITIAL_USERS } from '../services/database.ts';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'VALIDATE', 'PRINT', 'SEND', 'EXPORT'],
  ADMIN: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'VALIDATE', 'PRINT', 'SEND', 'EXPORT'],
  MANAGER: ['VIEW', 'CREATE', 'EDIT', 'PRINT', 'SEND', 'EXPORT'],
  BIOLOGIST: ['VIEW', 'CREATE', 'EDIT', 'VALIDATE', 'PRINT', 'SEND', 'EXPORT'],
  TECHNICIAN: ['VIEW', 'CREATE', 'EDIT', 'PRINT'],
  RECEPTION: ['VIEW', 'CREATE', 'EDIT', 'PRINT', 'SEND'],
  ACCOUNTANT: ['VIEW', 'CREATE', 'EDIT', 'PRINT', 'EXPORT'],
  DOCTOR: ['VIEW', 'CREATE', 'PRINT']
};

export const ROLE_ALLOWED_MODULES: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    'dashboard',
    'patient-search',
    'patients',
    'doctors',
    'home-visits',
    'portal',
    'orders',
    'samples',
    'tests',
    'group-tests',
    'cultures',
    'antibiotics',
    'antibiograms',
    'results',
    'reports',
    'quality-control',
    'analyzers',
    'ai-assistant',
    'inventory',
    'price-list',
    'contracts',
    'invoices',
    'payments',
    'accounting',
    'daily-report',
    'statistics',
    'chat',
    'whatsapp',
    'sms',
    'emails',
    'users',
    'settings',
    'translations',
    'activity-logs',
    'backup'
  ],
  ADMIN: [
    'dashboard',
    'patient-search',
    'patients',
    'doctors',
    'home-visits',
    'portal',
    'orders',
    'samples',
    'tests',
    'group-tests',
    'cultures',
    'antibiotics',
    'antibiograms',
    'results',
    'reports',
    'quality-control',
    'analyzers',
    'ai-assistant',
    'inventory',
    'price-list',
    'contracts',
    'invoices',
    'payments',
    'accounting',
    'daily-report',
    'statistics',
    'chat',
    'whatsapp',
    'sms',
    'emails',
    'users',
    'settings',
    'translations',
    'activity-logs',
    'backup'
  ],
  MANAGER: [
    'dashboard',
    'patient-search',
    'patients',
    'doctors',
    'home-visits',
    'portal',
    'orders',
    'samples',
    'tests',
    'group-tests',
    'results',
    'reports',
    'inventory',
    'price-list',
    'contracts',
    'invoices',
    'payments',
    'accounting',
    'daily-report',
    'statistics',
    'chat',
    'whatsapp',
    'sms',
    'emails',
    'activity-logs'
  ],
  BIOLOGIST: [
    'dashboard',
    'patient-search',
    'patients',
    'doctors',
    'home-visits',
    'portal',
    'orders',
    'samples',
    'tests',
    'group-tests',
    'cultures',
    'antibiotics',
    'antibiograms',
    'results',
    'reports',
    'quality-control',
    'analyzers',
    'ai-assistant',
    'inventory',
    'price-list',
    'contracts',
    'statistics',
    'chat',
    'whatsapp',
    'sms',
    'emails'
  ],
  TECHNICIAN: [
    'dashboard',
    'patient-search',
    'patients',
    'home-visits',
    'portal',
    'orders',
    'samples',
    'tests',
    'group-tests',
    'cultures',
    'antibiotics',
    'antibiograms',
    'results',
    'reports',
    'quality-control',
    'analyzers',
    'ai-assistant',
    'inventory',
    'chat'
  ],
  RECEPTION: [
    'dashboard',
    'patient-search',
    'patients',
    'doctors',
    'home-visits',
    'portal',
    'orders',
    'samples',
    'price-list',
    'contracts',
    'invoices',
    'payments',
    'reports',
    'chat',
    'whatsapp',
    'sms',
    'emails'
  ],
  ACCOUNTANT: [
    'dashboard',
    'patient-search',
    'patients',
    'price-list',
    'contracts',
    'invoices',
    'payments',
    'accounting',
    'daily-report',
    'statistics',
    'chat'
  ],
  DOCTOR: [
    'dashboard',
    'patient-search',
    'patients',
    'orders',
    'results',
    'reports',
    'price-list',
    'chat'
  ]
};

export interface RoleMetadata {
  role: UserRole;
  label: string;
  category: 'DIRECTION' | 'BIOLOGIE' | 'TECHNIQUE' | 'ACCUEIL' | 'FINANCE' | 'CLINIQUE';
  description: string;
  badgeClass: string;
  borderClass: string;
  canValidateBiologically: boolean;
  canEnterResults: boolean;
  canManageFinances: boolean;
  canConfigureSystem: boolean;
}

export const ROLE_METADATA: Record<UserRole, RoleMetadata> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    label: 'Super Administrateur',
    category: 'DIRECTION',
    description: 'Accès sans restriction à tous les modules, configurations système, gestion des utilisateurs et validation biologique de secours.',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    borderClass: 'border-rose-400',
    canValidateBiologically: true,
    canEnterResults: true,
    canManageFinances: true,
    canConfigureSystem: true
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'Administrateur',
    category: 'DIRECTION',
    description: 'Gestion globale du laboratoire, audit, sécurité, tarification et habilitations.',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    borderClass: 'border-indigo-400',
    canValidateBiologically: true,
    canEnterResults: true,
    canManageFinances: true,
    canConfigureSystem: true
  },
  MANAGER: {
    role: 'MANAGER',
    label: 'Manager & Qualité',
    category: 'DIRECTION',
    description: 'Supervision des flux, indicateurs d\'activité, contrats et audits de traçabilité.',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    borderClass: 'border-sky-400',
    canValidateBiologically: false,
    canEnterResults: false,
    canManageFinances: true,
    canConfigureSystem: false
  },
  BIOLOGIST: {
    role: 'BIOLOGIST',
    label: 'Pharmacien / Médecin Biologiste',
    category: 'BIOLOGIE',
    description: 'Responsabilité médicale légale : validation biologique officielle, signature électronique des comptes-rendus, interprétation et alertes critiques.',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    borderClass: 'border-blue-500',
    canValidateBiologically: true,
    canEnterResults: true,
    canManageFinances: false,
    canConfigureSystem: false
  },
  TECHNICIAN: {
    role: 'TECHNICIAN',
    label: 'Technicien Supérieur de Labo',
    category: 'TECHNIQUE',
    description: 'Phase analytique : saisie des résultats bruts, gestion des automates, contrôles qualité et antibiogrammes. (Validation biologique interdite).',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    borderClass: 'border-teal-400',
    canValidateBiologically: false,
    canEnterResults: true,
    canManageFinances: false,
    canConfigureSystem: false
  },
  RECEPTION: {
    role: 'RECEPTION',
    label: 'Réceptionniste & Caisse',
    category: 'ACCUEIL',
    description: 'Phase pré-analytique : accueil des patients, enregistrement des demandes, étiquetage des tubes, encaissement immédiat et remise des résultats.',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    borderClass: 'border-amber-400',
    canValidateBiologically: false,
    canEnterResults: false,
    canManageFinances: true,
    canConfigureSystem: false
  },
  ACCOUNTANT: {
    role: 'ACCOUNTANT',
    label: 'Comptable & Facturation',
    category: 'FINANCE',
    description: 'Facturation des organismes tiers (IPM, mutuelles), encaissements, rapprochements bancaires, journal de caisse et rapports journaliers.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderClass: 'border-emerald-400',
    canValidateBiologically: false,
    canEnterResults: false,
    canManageFinances: true,
    canConfigureSystem: false
  },
  DOCTOR: {
    role: 'DOCTOR',
    label: 'Médecin Prescripteur',
    category: 'CLINIQUE',
    description: 'Prescription en ligne d\'analyses médicales pour ses patients, consultation des résultats validés et téléchargement des comptes-rendus.',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    borderClass: 'border-purple-400',
    canValidateBiologically: false,
    canEnterResults: false,
    canManageFinances: false,
    canConfigureSystem: false
  }
};

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  roleMetadata: RoleMetadata;
  login: (userOrRole: User | UserRole) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  canAccessModule: (moduleId: string) => boolean;
  canEnterResults: () => boolean;
  canValidateResults: () => boolean;
  canCreateOrder: () => boolean;
  canManagePatients: () => boolean;
  canDeleteData: () => boolean;
  canManageFinances: () => boolean;
  canAccessAccounting: () => boolean;
  canAdminister: () => boolean;
  canManageInventory: () => boolean;
  canManageQualityControl: () => boolean;
  canSendReports: () => boolean;
  canExportData: () => boolean;
  canEmergencyValidate: () => boolean;
  canPrintReport: () => boolean;
  canAcknowledgeOrder: () => boolean;
  canManageTests: () => boolean;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  usersList: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadedUsers = dbService.getUsers();
    setUsersList(loadedUsers);

    // Default logged in user: Dr. Mariama Ba-Diallo (Biologiste)
    const savedUserId = localStorage.getItem('extremelab_current_user_id');
    const matched =
      loadedUsers.find(u => u.id === savedUserId) ||
      loadedUsers.find(u => u.role === 'BIOLOGIST') ||
      loadedUsers[0];
    if (matched) {
      setCurrentUser(matched);
    }
  }, []);

  const switchUser = (userId: string) => {
    const user = usersList.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('extremelab_current_user_id', user.id);
      dbService.addActivityLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'SWITCH_USER',
        module: 'AUTH',
        newValue: `Session basculée sur : ${user.name} (${user.role})`
      });
    }
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
  };

  const login = (target: User | UserRole) => {
    if (typeof target === 'string') {
      const userWithRole = usersList.find(u => u.role === target) || usersList[0];
      if (userWithRole) switchUser(userWithRole.id);
    } else {
      switchUser(target.id);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('extremelab_current_user_id');
  };

  const currentRole: UserRole = currentUser?.role || 'BIOLOGIST';

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    const allowed = ROLE_PERMISSIONS[currentUser.role] || [];
    return allowed.includes(permission);
  };

  const canAccessModule = (moduleId: string): boolean => {
    if (!currentUser) return false;
    // Super admin and admin can access anything
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') return true;
    const allowed = ROLE_ALLOWED_MODULES[currentUser.role] || [];
    return allowed.includes(moduleId);
  };

  const canEnterResults = (): boolean => {
    return (
      currentRole === 'TECHNICIAN' ||
      currentRole === 'BIOLOGIST' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN'
    );
  };

  const canValidateResults = (): boolean => {
    return (
      currentRole === 'BIOLOGIST' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN'
    );
  };

  const canCreateOrder = (): boolean => {
    return (
      currentRole === 'RECEPTION' ||
      currentRole === 'BIOLOGIST' ||
      currentRole === 'DOCTOR' ||
      currentRole === 'MANAGER' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN'
    );
  };

  const canManagePatients = (): boolean => {
    return (
      currentRole === 'RECEPTION' ||
      currentRole === 'BIOLOGIST' ||
      currentRole === 'MANAGER' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN'
    );
  };

  const canDeleteData = (): boolean => {
    return currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN';
  };

  const canManageFinances = (): boolean => {
    return (
      currentRole === 'ACCOUNTANT' ||
      currentRole === 'RECEPTION' ||
      currentRole === 'MANAGER' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN'
    );
  };

  const canAccessAccounting = (): boolean => {
    return (
      currentRole === 'ACCOUNTANT' ||
      currentRole === 'MANAGER' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN'
    );
  };

  const canAdminister = (): boolean => {
    return currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN';
  };

  const canManageInventory = (): boolean => {
    return (
      currentRole === 'TECHNICIAN' ||
      currentRole === 'BIOLOGIST' ||
      currentRole === 'MANAGER' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN'
    );
  };

  const canManageQualityControl = (): boolean => {
    return (
      currentRole === 'TECHNICIAN' ||
      currentRole === 'BIOLOGIST' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN'
    );
  };

  const canSendReports = (): boolean => {
    return (
      currentRole === 'BIOLOGIST' ||
      currentRole === 'RECEPTION' ||
      currentRole === 'MANAGER' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN'
    );
  };

  const canExportData = (): boolean => {
    return (
      currentRole === 'SUPER_ADMIN' ||
      currentRole === 'ADMIN' ||
      currentRole === 'MANAGER' ||
      currentRole === 'BIOLOGIST' ||
      currentRole === 'ACCOUNTANT'
    );
  };

  const canEmergencyValidate = (): boolean => {
    return (
      currentRole === 'TECHNICIAN' ||
      currentRole === 'BIOLOGIST' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN'
    );
  };

  const canPrintReport = (): boolean => {
    return (
      currentRole === 'RECEPTION' ||
      currentRole === 'TECHNICIAN' ||
      currentRole === 'BIOLOGIST' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN' ||
      currentRole === 'MANAGER' ||
      currentRole === 'DOCTOR'
    );
  };

  const canAcknowledgeOrder = (): boolean => {
    return (
      currentRole === 'TECHNICIAN' ||
      currentRole === 'BIOLOGIST' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN'
    );
  };

  const canManageTests = (): boolean => {
    return (
      currentRole === 'BIOLOGIST' ||
      currentRole === 'TECHNICIAN' ||
      currentRole === 'ADMIN' ||
      currentRole === 'SUPER_ADMIN' ||
      currentRole === 'MANAGER'
    );
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [...usersList, newUser];
    setUsersList(updated);
    dbService.saveUsers(updated);
  };

  const roleMetadata = ROLE_METADATA[currentRole] || ROLE_METADATA.BIOLOGIST;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated: !!currentUser,
        roleMetadata,
        login,
        logout,
        switchUser,
        switchRole,
        hasPermission,
        canAccessModule,
        canEnterResults,
        canValidateResults,
        canCreateOrder,
        canManagePatients,
        canDeleteData,
        canManageFinances,
        canAccessAccounting,
        canAdminister,
        canManageInventory,
        canManageQualityControl,
        canSendReports,
        canExportData,
        canEmergencyValidate,
        canPrintReport,
        canAcknowledgeOrder,
        canManageTests,
        addUser,
        usersList
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
