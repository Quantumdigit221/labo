export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    // App
    'app.name': 'EXTREMELAB NEXT',
    'app.slogan': 'Votre laboratoire, simplement et intelligemment.',
    'app.subtitle': 'Système de Gestion de Laboratoire Médical (LIS/LIMS)',

    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.patients_section': 'PATIENTS',
    'nav.patient_search': 'Recherche de Patient',
    'nav.patients': 'Dossiers Patients',
    'nav.doctors': 'Médecins prescripteurs',
    'nav.home_visits': 'Visites à domicile',
    'nav.lab_section': 'LABORATOIRE',
    'nav.orders': 'Demandes d\'examens',
    'nav.samples': 'Prélèvements',
    'nav.tests': 'Catalogue d\'examens',
    'nav.cultures': 'Cultures & Germes',
    'nav.antibiotics': 'Antibiotiques',
    'nav.antibiograms': 'Antibiogrammes',
    'nav.group_tests': 'Bilans & Groupes',
    'nav.results': 'Saisie des Résultats',
    'nav.validation': 'Validation Biologique',
    'nav.management_section': 'GESTION & FINANCE',
    'nav.price_list': 'Grille tarifaire',
    'nav.contracts': 'Contrats & IPM / Assurances',
    'nav.invoices': 'Facturation & Caisse',
    'nav.payments': 'Caisse & Paiements',
    'nav.accounting': 'Comptabilité & Dépenses',
    'nav.communication_section': 'COMMUNICATION',
    'nav.chat': 'Chat interne',
    'nav.whatsapp': 'Module WhatsApp',
    'nav.sms': 'Module SMS',
    'nav.emails': 'Module Emails',
    'nav.reports_section': 'RAPPORTS & STATS',
    'nav.reports': 'Rapports Médicaux (PDF)',
    'nav.daily_report': 'Rapport Journalier Caisse',
    'nav.statistics': 'Statistiques & Performance',
    'nav.admin_section': 'ADMINISTRATION',
    'nav.users': 'Utilisateurs & Rôles',
    'nav.settings': 'Paramètres du Laboratoire',
    'nav.translations': 'Langues & Traductions',
    'nav.activity_logs': 'Journal d\'Activité (Audit)',
    'nav.analyzers': 'Passerelle Automates (LIS)',
    'nav.ai_assistant': 'Aide à la Décision IA',
    'nav.quality_control': 'Contrôle Qualité (CQI)',
    'nav.inventory': 'Réactifs & Stocks',
    'nav.portal': 'Portail Patient',
    'nav.backup': 'Sauvegardes & Restauration',

    // Common actions
    'action.new': 'Nouveau',
    'action.add': 'Ajouter',
    'action.edit': 'Modifier',
    'action.delete': 'Supprimer',
    'action.cancel': 'Annuler',
    'action.save': 'Enregistrer',
    'action.confirm': 'Confirmer',
    'action.search': 'Rechercher...',
    'action.filter': 'Filtrer',
    'action.export': 'Exporter',
    'action.print': 'Imprimer',
    'action.validate': 'Valider',
    'action.send_whatsapp': 'Envoyer par WhatsApp',
    'action.send_email': 'Envoyer par Email',
    'action.view_file': 'Voir dossier',
    'action.close': 'Fermer',
    'action.reset': 'Réinitialiser',
    'action.refresh': 'Actualiser',
    'action.receive': 'Réceptionner',
    'action.submit': 'Soumettre',

    // Dashboard
    'dashboard.patients_today': 'Patients aujourd\'hui',
    'dashboard.new_patients': 'Nouveaux patients',
    'dashboard.orders_today': 'Demandes du jour',
    'dashboard.samples_pending': 'Prélèvements en attente',
    'dashboard.analyses_running': 'Analyses en cours',
    'dashboard.results_to_validate': 'Résultats à valider',
    'dashboard.reports_ready': 'Rapports disponibles',
    'dashboard.revenue_today': 'Recettes du jour',
    'dashboard.expenses_today': 'Dépenses du jour',
    'dashboard.unpaid_balance': 'Créances & Impayés',
    'dashboard.todo_title': 'À FAIRE (URGENCES)',
    'dashboard.lab_activity': 'Activité du laboratoire (7 derniers jours)',
    'dashboard.popular_tests': 'Examens les plus demandés',
    'dashboard.quick_actions': 'Actions rapides',

    // Status
    'status.all': 'Tous les statuts',
    'status.pending': 'En attente',
    'status.in_progress': 'En cours',
    'status.completed': 'Terminé',
    'status.validated': 'Validé',
    'status.cancelled': 'Annulé',
    'status.paid': 'Payé',
    'status.unpaid': 'Impayé',
    'status.partial': 'Acompte / Partiel',
    'status.waiting': 'À prélever',
    'status.collected': 'Prélevé',
    'status.received': 'Réceptionné',
    'status.processing': 'En analyse',
    'status.rejected': 'Rejeté',

    // Currency & date
    'currency': 'FCFA',
    'timezone': 'Africa/Dakar'
  },
  en: {
    // App
    'app.name': 'EXTREMELAB NEXT',
    'app.slogan': 'Your laboratory, simply and smartly.',
    'app.subtitle': 'Laboratory Information Management System (LIS/LIMS)',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.patients_section': 'PATIENTS',
    'nav.patient_search': 'Patient Search',
    'nav.patients': 'Patient Files',
    'nav.doctors': 'Referring Doctors',
    'nav.home_visits': 'Home Visits',
    'nav.lab_section': 'LABORATORY',
    'nav.orders': 'Test Orders',
    'nav.samples': 'Specimens / Samples',
    'nav.tests': 'Test Catalog',
    'nav.cultures': 'Cultures & Organisms',
    'nav.antibiotics': 'Antibiotics',
    'nav.antibiograms': 'Antibiograms',
    'nav.group_tests': 'Test Panels & Profiles',
    'nav.results': 'Result Entry',
    'nav.validation': 'Biologist Validation',
    'nav.management_section': 'MANAGEMENT & FINANCE',
    'nav.price_list': 'Price List',
    'nav.contracts': 'Contracts & Insurance / IPM',
    'nav.invoices': 'Invoicing',
    'nav.payments': 'Cash & Payments',
    'nav.accounting': 'Accounting & Expenses',
    'nav.communication_section': 'COMMUNICATION',
    'nav.chat': 'Internal Chat',
    'nav.whatsapp': 'WhatsApp Gateway',
    'nav.sms': 'SMS Gateway',
    'nav.emails': 'Email Gateway',
    'nav.reports_section': 'REPORTS & STATS',
    'nav.reports': 'Medical Reports (PDF)',
    'nav.daily_report': 'Daily Cash Report',
    'nav.statistics': 'Analytics & Performance',
    'nav.admin_section': 'ADMINISTRATION',
    'nav.users': 'Users & Roles',
    'nav.settings': 'Laboratory Settings',
    'nav.translations': 'Languages & Translations',
    'nav.activity_logs': 'Activity Logs (Audit)',
    'nav.analyzers': 'Analyzer Gateway (LIS)',
    'nav.ai_assistant': 'AI Decision Support',
    'nav.quality_control': 'Internal Quality Control (IQC)',
    'nav.inventory': 'Reagents & Inventory',
    'nav.portal': 'Patient Portal',
    'nav.backup': 'Backups & Recovery',

    // Common actions
    'action.new': 'New',
    'action.add': 'Add',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.cancel': 'Cancel',
    'action.save': 'Save',
    'action.confirm': 'Confirm',
    'action.search': 'Search...',
    'action.filter': 'Filter',
    'action.export': 'Export',
    'action.print': 'Print',
    'action.validate': 'Validate',
    'action.send_whatsapp': 'Send via WhatsApp',
    'action.send_email': 'Send via Email',
    'action.view_file': 'View file',
    'action.close': 'Close',
    'action.reset': 'Reset',
    'action.refresh': 'Refresh',
    'action.receive': 'Receive',
    'action.submit': 'Submit',

    // Dashboard
    'dashboard.patients_today': 'Patients today',
    'dashboard.new_patients': 'New patients',
    'dashboard.orders_today': 'Orders today',
    'dashboard.samples_pending': 'Pending samples',
    'dashboard.analyses_running': 'Analyses in progress',
    'dashboard.results_to_validate': 'Results to validate',
    'dashboard.reports_ready': 'Reports ready',
    'dashboard.revenue_today': 'Today\'s revenue',
    'dashboard.expenses_today': 'Today\'s expenses',
    'dashboard.unpaid_balance': 'Unpaid balance',
    'dashboard.todo_title': 'TO-DO (URGENT)',
    'dashboard.lab_activity': 'Laboratory activity (last 7 days)',
    'dashboard.popular_tests': 'Most requested tests',
    'dashboard.quick_actions': 'Quick actions',

    // Status
    'status.all': 'All statuses',
    'status.pending': 'Pending',
    'status.in_progress': 'In progress',
    'status.completed': 'Completed',
    'status.validated': 'Validated',
    'status.cancelled': 'Cancelled',
    'status.paid': 'Paid',
    'status.unpaid': 'Unpaid',
    'status.partial': 'Partial / Deposit',
    'status.waiting': 'Waiting for collection',
    'status.collected': 'Collected',
    'status.received': 'Received',
    'status.processing': 'Processing',
    'status.rejected': 'Rejected',

    // Currency & date
    'currency': 'FCFA',
    'timezone': 'Africa/Dakar'
  }
};

export function getTranslation(key: string, lang: Language = 'fr'): string {
  const dict = translations[lang] || translations.fr;
  return (dict as Record<string, string>)[key] || key;
}

export function formatCurrency(amount: number, currency = 'FCFA'): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0
  }).format(amount) + ' ' + currency;
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return '-';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return isoDate;
  }
}

export function formatDateTime(isoDate: string): string {
  if (!isoDate) return '-';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoDate;
  }
}
