import {
  Patient,
  Doctor,
  MedicalTest,
  TestGroup,
  Order,
  Sample,
  TestResult,
  MedicalReport,
  Invoice,
  Payment,
  Contract,
  Expense,
  Culture,
  Antibiotic,
  Antibiogram,
  HomeVisit,
  ActivityLog,
  ChatMessage,
  WhatsAppTemplate,
  WhatsAppLog,
  SmsLog,
  LabSettings,
  User,
  AppNotification,
  Supplier,
  ReagentItem,
  StockStatus,
  StockMovement,
  QcControlMaterial,
  QcRun
} from '../types/index.ts';

const STORAGE_KEY_PREFIX = 'extremelab_';

export const DEFAULT_SETTINGS: LabSettings = {
  name: 'Laboratoire Médical ExtremeLab Next',
  slogan: 'Votre laboratoire, simplement et intelligemment.',
  address: '14, Avenue Cheikh Anta Diop, Fann-Point E',
  city: 'Dakar',
  country: 'Sénégal',
  phone: '+221 33 825 40 40',
  whatsapp: '+221 77 654 32 10',
  email: 'contact@extremelab-next.sn',
  website: 'https://extremelab-next.sn',
  taxNumber: 'SN-DKR-2024-B-8942 / NINEA: 009845123',
  currency: 'FCFA',
  timezone: 'Africa/Dakar',
  leadBiologist: 'Dr. Mariama Ba-Diallo',
  biologistTitle: 'Pharmacienne Biologiste - CES d\'Hématologie & Biochimie',
  signatureText: 'Signé électroniquement par Dr. M. Ba-Diallo',
  stampText: 'Cachet Officiel - Laboratoire d\'Analyses Médicales Agrée',
  enableWhatsApp: true,
  whatsappProvider: 'Meta Cloud API (Officiel)',
  whatsappPhoneNumberId: '109823471928374',
  whatsappBusinessId: '827364519283746',
  hasWhatsAppToken: true,
  enableSms: true,
  smsProvider: 'Orange SMS API',
  enableEmail: true,
  smtpHost: 'smtp.extremelab-next.sn',
  smtpPort: 587,
  smtpSenderEmail: 'resultats@extremelab-next.sn'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Dr. Mariama Ba-Diallo',
    email: 'biologiste@extremelab.sn',
    phone: '+221 77 654 32 10',
    role: 'BIOLOGIST',
    specialty: 'Biologie Médicale & Hématologie',
    active: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr-2',
    name: 'Mamadou Lamine Ndiaye',
    email: 'admin@extremelab.sn',
    phone: '+221 77 123 45 67',
    role: 'SUPER_ADMIN',
    specialty: 'Direction & Administration',
    active: true,
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'usr-3',
    name: 'Awa Fatou Sow',
    email: 'technicien@extremelab.sn',
    phone: '+221 76 345 67 89',
    role: 'TECHNICIAN',
    specialty: 'Technicienne Supérieure de Laboratoire',
    active: true,
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'usr-4',
    name: 'Fatoumata Binetou Sy',
    email: 'reception@extremelab.sn',
    phone: '+221 78 987 65 43',
    role: 'RECEPTION',
    specialty: 'Accueil & Facturation',
    active: true,
    createdAt: '2026-02-15T08:00:00Z'
  },
  {
    id: 'usr-5',
    name: 'Abdoulaye Wade Cissé',
    email: 'comptable@extremelab.sn',
    phone: '+221 77 555 44 33',
    role: 'ACCOUNTANT',
    specialty: 'Gestion Financière & Recouvrement',
    active: true,
    createdAt: '2026-02-20T08:00:00Z'
  },
  {
    id: 'usr-6',
    name: 'Dr. Ibrahima Diop',
    email: 'dr.diop@hopital-principal.sn',
    phone: '+221 77 234 56 78',
    role: 'DOCTOR',
    specialty: 'Médecin Prescripteur Partenaire',
    active: true,
    createdAt: '2026-02-22T08:00:00Z'
  },
  {
    id: 'usr-7',
    name: 'Sokhna Fall',
    email: 'qualite@extremelab.sn',
    phone: '+221 77 444 88 99',
    role: 'MANAGER',
    specialty: 'Responsable Qualité & Opérations',
    active: true,
    createdAt: '2026-02-25T08:00:00Z'
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    doctorNumber: 'DOC-2026-000001',
    firstName: 'Ibrahima',
    lastName: 'Diop',
    specialty: 'Médecine Générale',
    phone: '+221 77 234 56 78',
    whatsapp: '+221 77 234 56 78',
    email: 'dr.diop@hopital-principal.sn',
    facility: 'Hôpital Principal de Dakar',
    address: 'Plateau, Dakar',
    commissionRate: 5,
    active: true,
    createdAt: '2026-01-12T09:00:00Z'
  },
  {
    id: 'doc-2',
    doctorNumber: 'DOC-2026-000002',
    firstName: 'Aminata',
    lastName: 'Fall',
    specialty: 'Cardiologie',
    phone: '+221 76 876 54 32',
    whatsapp: '+221 76 876 54 32',
    email: 'dr.fall@clinique-madeleine.sn',
    facility: 'Clinique de la Madeleine',
    address: 'Avenue Pasteur, Dakar',
    commissionRate: 0,
    active: true,
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'doc-3',
    doctorNumber: 'DOC-2026-000003',
    firstName: 'Cheikh Tidiane',
    lastName: 'Gueye',
    specialty: 'Pédiatrie',
    phone: '+221 78 456 12 34',
    whatsapp: '+221 78 456 12 34',
    facility: 'Centre de Santé Gaspard Kamara',
    address: 'Grand Dakar',
    active: true,
    createdAt: '2026-02-01T11:00:00Z'
  },
  {
    id: 'doc-4',
    doctorNumber: 'DOC-2026-000004',
    firstName: 'Ousmane',
    lastName: 'Sarr',
    specialty: 'Gynécologie Obstétrique',
    phone: '+221 77 912 34 56',
    facility: 'Clinique Pasteur',
    active: true,
    createdAt: '2026-02-10T14:00:00Z'
  },
  {
    id: 'doc-5',
    doctorNumber: 'DOC-2026-000005',
    firstName: 'Khadija',
    lastName: 'Touré',
    specialty: 'Endocrinologie / Diabétologie',
    phone: '+221 77 345 67 11',
    facility: 'CHU Fann Dakar',
    active: true,
    createdAt: '2026-02-25T08:30:00Z'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    patientNumber: 'PAT-2026-000001',
    firstName: 'Moussa',
    lastName: 'Diallo',
    gender: 'M',
    dateOfBirth: '1984-06-15',
    age: 42,
    phone: '+221 77 654 11 22',
    whatsapp: '+221 77 654 11 22',
    email: 'moussa.diallo@gmail.com',
    address: 'Cité Keur Gorgui, Immeuble A',
    city: 'Dakar',
    country: 'Sénégal',
    emergencyContact: 'Aïssatou Diallo (Épouse) - 77 123 99 88',
    bloodGroup: 'O+',
    active: true,
    createdAt: '2026-10-10T08:30:00Z',
    updatedAt: '2026-10-10T08:30:00Z'
  },
  {
    id: 'pat-2',
    patientNumber: 'PAT-2026-000002',
    firstName: 'Fatou',
    lastName: 'Badiane',
    gender: 'F',
    dateOfBirth: '1992-11-03',
    age: 33,
    phone: '+221 76 543 21 00',
    whatsapp: '+221 76 543 21 00',
    email: 'fatou.badiane@orange.sn',
    address: 'Almadies, Villa 142',
    city: 'Dakar',
    country: 'Sénégal',
    bloodGroup: 'A+',
    active: true,
    createdAt: '2026-10-12T09:15:00Z',
    updatedAt: '2026-10-12T09:15:00Z'
  },
  {
    id: 'pat-3',
    patientNumber: 'PAT-2026-000003',
    firstName: 'Babacar',
    lastName: 'Ndao',
    gender: 'M',
    dateOfBirth: '1970-03-24',
    age: 56,
    phone: '+221 78 890 12 34',
    whatsapp: '+221 78 890 12 34',
    address: 'Guédiawaye, Hamo 4',
    city: 'Guédiawaye',
    country: 'Sénégal',
    bloodGroup: 'B+',
    active: true,
    createdAt: '2026-10-13T10:00:00Z',
    updatedAt: '2026-10-13T10:00:00Z'
  },
  {
    id: 'pat-4',
    patientNumber: 'PAT-2026-000004',
    firstName: 'Coumba',
    lastName: 'Thiam',
    gender: 'F',
    dateOfBirth: '2001-08-19',
    age: 25,
    phone: '+221 77 412 85 96',
    whatsapp: '+221 77 412 85 96',
    address: 'Mermoz Pyrotechnie',
    city: 'Dakar',
    country: 'Sénégal',
    bloodGroup: 'O-',
    active: true,
    createdAt: '2026-10-14T11:20:00Z',
    updatedAt: '2026-10-14T11:20:00Z'
  },
  {
    id: 'pat-5',
    patientNumber: 'PAT-2026-000005',
    firstName: 'Amadou',
    lastName: 'Ba',
    gender: 'M',
    dateOfBirth: '1965-01-30',
    age: 61,
    phone: '+221 70 800 23 45',
    whatsapp: '+221 70 800 23 45',
    address: 'Grand Yoff',
    city: 'Dakar',
    country: 'Sénégal',
    bloodGroup: 'AB+',
    active: true,
    createdAt: '2026-10-15T08:10:00Z',
    updatedAt: '2026-10-15T08:10:00Z'
  },
  {
    id: 'pat-6',
    patientNumber: 'PAT-2026-000006',
    firstName: 'Marième',
    lastName: 'Kane',
    gender: 'F',
    dateOfBirth: '1998-05-12',
    age: 28,
    phone: '+221 77 333 22 11',
    whatsapp: '+221 77 333 22 11',
    address: 'Sacré-Cœur 3',
    city: 'Dakar',
    country: 'Sénégal',
    bloodGroup: 'A-',
    active: true,
    createdAt: '2026-10-15T14:40:00Z',
    updatedAt: '2026-10-15T14:40:00Z'
  },
  {
    id: 'pat-7',
    patientNumber: 'PAT-2026-000007',
    firstName: 'Oumar',
    lastName: 'Seck',
    gender: 'M',
    dateOfBirth: '2015-09-04',
    age: 11,
    phone: '+221 76 111 44 77',
    whatsapp: '+221 76 111 44 77',
    address: 'Pikine Tally Boumack',
    city: 'Pikine',
    country: 'Sénégal',
    notes: 'Pédiatrie - Enfant de Mme Seck',
    bloodGroup: 'O+',
    active: true,
    createdAt: '2026-10-16T08:00:00Z',
    updatedAt: '2026-10-16T08:00:00Z'
  }
];

export const INITIAL_TESTS: MedicalTest[] = [
  {
    id: 't-nfs',
    code: 'NFS',
    name: 'Numération Formule Sanguine (Hémogramme complet)',
    category: 'Hématologie',
    description: 'Comptage des globules rouges, blancs, plaquettes et formule leucocytaire.',
    sampleType: 'Sang total',
    container: 'Tube EDTA (Bouchon Violet)',
    method: 'Automate Sysmex 5 populations',
    turnaroundTime: '2h',
    price: 8500,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    parameters: [
      {
        id: 'p-gb',
        testId: 't-nfs',
        code: 'GB',
        name: 'Globules Blancs (Leucocytes)',
        unit: '10^3/µL',
        resultType: 'NUMERIC',
        referenceMin: 4.0,
        referenceMax: 10.0,
        criticalMin: 1.5,
        criticalMax: 30.0,
        displayOrder: 1,
        active: true
      },
      {
        id: 'p-gr',
        testId: 't-nfs',
        code: 'GR',
        name: 'Globules Rouges (Érythrocytes)',
        unit: '10^6/µL',
        resultType: 'NUMERIC',
        referenceMaleMin: 4.5,
        referenceMaleMax: 5.9,
        referenceFemaleMin: 4.0,
        referenceFemaleMax: 5.2,
        referenceMin: 4.0,
        referenceMax: 5.9,
        displayOrder: 2,
        active: true
      },
      {
        id: 'p-hb',
        testId: 't-nfs',
        code: 'HB',
        name: 'Hémoglobine',
        unit: 'g/dL',
        resultType: 'NUMERIC',
        referenceMaleMin: 13.0,
        referenceMaleMax: 17.5,
        referenceFemaleMin: 12.0,
        referenceFemaleMax: 15.5,
        referenceMin: 12.0,
        referenceMax: 17.5,
        criticalMin: 7.0,
        criticalMax: 20.0,
        displayOrder: 3,
        active: true
      },
      {
        id: 'p-ht',
        testId: 't-nfs',
        code: 'HT',
        name: 'Hématocrite',
        unit: '%',
        resultType: 'NUMERIC',
        referenceMin: 36.0,
        referenceMax: 52.0,
        displayOrder: 4,
        active: true
      },
      {
        id: 'p-plt',
        testId: 't-nfs',
        code: 'PLT',
        name: 'Plaquettes',
        unit: '10^3/µL',
        resultType: 'NUMERIC',
        referenceMin: 150,
        referenceMax: 450,
        criticalMin: 50,
        criticalMax: 1000,
        displayOrder: 5,
        active: true
      }
    ]
  },
  {
    id: 't-glyc',
    code: 'GLYC',
    name: 'Glycémie à Jeun',
    category: 'Biochimie',
    description: 'Dosage du glucose sérique chez le sujet à jeun depuis au moins 8 heures.',
    sampleType: 'Sérum / Plasma fluoré',
    container: 'Tube Fluorure (Bouchon Gris) ou Tube Sec',
    method: 'Enzymatique Hexokinase / Cobas',
    turnaroundTime: '2h',
    price: 3500,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    parameters: [
      {
        id: 'p-glyc',
        testId: 't-glyc',
        code: 'GLU',
        name: 'Glucose plasmatique à jeun',
        unit: 'g/L',
        resultType: 'NUMERIC',
        referenceMin: 0.70,
        referenceMax: 1.10,
        criticalMin: 0.50,
        criticalMax: 3.50,
        referenceText: '0.70 - 1.10 g/L (3.9 - 6.1 mmol/L)',
        displayOrder: 1,
        active: true
      }
    ]
  },
  {
    id: 't-creat',
    code: 'CREAT',
    name: 'Créatininémie & Clairance (Estimation DFG)',
    category: 'Biochimie',
    description: 'Évaluation de la fonction rénale avec estimation CKD-EPI.',
    sampleType: 'Sérum',
    container: 'Tube Sec avec gel séparateur (Rouge/Jaune)',
    method: 'Jaffé cinétique compensé',
    turnaroundTime: '2h',
    price: 4500,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    parameters: [
      {
        id: 'p-creat',
        testId: 't-creat',
        code: 'CREAT',
        name: 'Créatinine Sérique',
        unit: 'mg/L',
        resultType: 'NUMERIC',
        referenceMaleMin: 7.0,
        referenceMaleMax: 12.0,
        referenceFemaleMin: 5.0,
        referenceFemaleMax: 10.0,
        referenceMin: 5.0,
        referenceMax: 12.0,
        criticalMax: 40.0,
        displayOrder: 1,
        active: true
      },
      {
        id: 'p-dfg',
        testId: 't-creat',
        code: 'DFG',
        name: 'DFG estimé (CKD-EPI)',
        unit: 'mL/min/1.73m²',
        resultType: 'NUMERIC',
        referenceMin: 90,
        referenceMax: 140,
        criticalMin: 30,
        displayOrder: 2,
        active: true
      }
    ]
  },
  {
    id: 't-crp',
    code: 'CRP',
    name: 'Protéine C-Réactive (CRP Ultrasensible)',
    category: 'Biochimie',
    description: 'Marqueur sérique de l\'inflammation aiguë.',
    sampleType: 'Sérum',
    container: 'Tube Sec (Rouge)',
    method: 'Immunoturbidimétrie',
    turnaroundTime: '2h',
    price: 6000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    parameters: [
      {
        id: 'p-crp',
        testId: 't-crp',
        code: 'CRP',
        name: 'Protéine C-Réactive',
        unit: 'mg/L',
        resultType: 'NUMERIC',
        referenceMin: 0,
        referenceMax: 5.0,
        criticalMax: 100.0,
        displayOrder: 1,
        active: true
      }
    ]
  },
  {
    id: 't-lipid',
    code: 'LIPID',
    name: 'Bilan Lipidique Complet (Cholestérol & Triglycérides)',
    category: 'Biochimie',
    description: 'Cholestérol Total, HDL, LDL (calcul Friedewald), Triglycérides.',
    sampleType: 'Sérum à jeun 12h',
    container: 'Tube Sec (Rouge)',
    method: 'Enzymatique colorimétrique',
    turnaroundTime: '3h',
    price: 11000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    parameters: [
      {
        id: 'p-chol-tot',
        testId: 't-lipid',
        code: 'CHOL_T',
        name: 'Cholestérol Total',
        unit: 'g/L',
        resultType: 'NUMERIC',
        referenceMin: 1.50,
        referenceMax: 2.00,
        displayOrder: 1,
        active: true
      },
      {
        id: 'p-trig',
        testId: 't-lipid',
        code: 'TG',
        name: 'Triglycérides',
        unit: 'g/L',
        resultType: 'NUMERIC',
        referenceMin: 0.40,
        referenceMax: 1.50,
        displayOrder: 2,
        active: true
      },
      {
        id: 'p-hdl',
        testId: 't-lipid',
        code: 'HDL',
        name: 'Cholestérol HDL (Protecteur)',
        unit: 'g/L',
        resultType: 'NUMERIC',
        referenceMin: 0.40,
        referenceMax: 0.80,
        displayOrder: 3,
        active: true
      },
      {
        id: 'p-ldl',
        testId: 't-lipid',
        code: 'LDL',
        name: 'Cholestérol LDL (Athérogène)',
        unit: 'g/L',
        resultType: 'NUMERIC',
        referenceMin: 0.0,
        referenceMax: 1.30,
        displayOrder: 4,
        active: true
      }
    ]
  },
  {
    id: 't-palu',
    code: 'GE_PALU',
    name: 'Goutte Épaisse & Frottis Sanguin (Paludisme)',
    category: 'Parasitologie',
    description: 'Recherche et quantification de Plasmodium falciparum / vivax.',
    sampleType: 'Sang capillaire ou EDTA',
    container: 'Tube EDTA ou Lames',
    method: 'Coloration Giemsa & Microscopie optique x1000 immersion',
    turnaroundTime: '1h',
    price: 4000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    parameters: [
      {
        id: 'p-palu-res',
        testId: 't-palu',
        code: 'PLASMODIUM',
        name: 'Recherche de Plasmodium',
        unit: '',
        resultType: 'SELECT',
        options: ['Négatif (Absence d\'hématozoaires)', 'Positif - Plasmodium falciparum', 'Positif - Plasmodium malariae', 'Positif - Plasmodium ovale'],
        referenceText: 'Négatif (Absence d\'hématozoaires)',
        displayOrder: 1,
        active: true
      },
      {
        id: 'p-parasitemie',
        testId: 't-palu',
        code: 'DENSITE',
        name: 'Densité parasitaire',
        unit: 'trophozoïtes/µL',
        resultType: 'TEXT',
        referenceText: '0 /µL',
        displayOrder: 2,
        active: true
      }
    ]
  },
  {
    id: 't-ecbu',
    code: 'ECBU',
    name: 'Examen Cytobactériologique des Urines (ECBU)',
    category: 'Microbiologie',
    description: 'Cytologie quantitative (leucocytes, hématies) et mise en culture 24-48h.',
    sampleType: 'Urines 2ème jet (Milieu de jet)',
    container: 'Flacon stérile bouchon vert/rouge',
    method: 'Cellule de Malassez & Ensemencement Gélose CLED / MacConkey',
    turnaroundTime: '24h - 48h',
    price: 9000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    parameters: [
      {
        id: 'p-leuco-u',
        testId: 't-ecbu',
        code: 'LEUCO_U',
        name: 'Leucocyturie',
        unit: '/mm³',
        resultType: 'NUMERIC',
        referenceMin: 0,
        referenceMax: 10,
        displayOrder: 1,
        active: true
      },
      {
        id: 'p-hema-u',
        testId: 't-ecbu',
        code: 'HEMA_U',
        name: 'Hématurie',
        unit: '/mm³',
        resultType: 'NUMERIC',
        referenceMin: 0,
        referenceMax: 10,
        displayOrder: 2,
        active: true
      },
      {
        id: 'p-culture-u',
        testId: 't-ecbu',
        code: 'CULT_U',
        name: 'Résultat de la Culture',
        unit: '',
        resultType: 'TEXT',
        referenceText: 'Culture Stérile (< 10^3 UFC/mL)',
        displayOrder: 3,
        active: true
      }
    ]
  },
  {
    id: 't-widal',
    code: 'WIDAL',
    name: 'Sérodiagnostic de Widal & Félix (Fièvre Typhoïde)',
    category: 'Sérologie',
    description: 'Agglutination sérique des antigènes somatiques (TO) et flagellaires (TH).',
    sampleType: 'Sérum',
    container: 'Tube Sec (Rouge)',
    method: 'Agglutination sur plaque et en tube',
    turnaroundTime: '4h',
    price: 5000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    parameters: [
      {
        id: 'p-to',
        testId: 't-widal',
        code: 'TO',
        name: 'Titre Antigène TO (Somatique)',
        unit: 'Titre',
        resultType: 'SELECT',
        options: ['Négatif (< 1/100)', '1/100', '1/200', '1/400', '1/800'],
        referenceText: 'Négatif (< 1/100)',
        displayOrder: 1,
        active: true
      },
      {
        id: 'p-th',
        testId: 't-widal',
        code: 'TH',
        name: 'Titre Antigène TH (Flagellaire)',
        unit: 'Titre',
        resultType: 'SELECT',
        options: ['Négatif (< 1/100)', '1/100', '1/200', '1/400', '1/800'],
        referenceText: 'Négatif (< 1/100)',
        displayOrder: 2,
        active: true
      }
    ]
  },
  {
    id: 't-tp-tca',
    code: 'COAG',
    name: 'Bilan d\'Hémostase (TP / INR / TCA)',
    category: 'Hématologie',
    description: 'Taux de prothrombine, INR de surveillance et Temps de Céphaline Activée.',
    sampleType: 'Plasma citraté',
    container: 'Tube Citrate 9NC (Bouchon Bleu Clair)',
    method: 'Chronométrie électromécanique Stago',
    turnaroundTime: '2h',
    price: 8000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    parameters: [
      {
        id: 'p-tp',
        testId: 't-tp-tca',
        code: 'TP',
        name: 'Taux de Prothrombine (TP)',
        unit: '%',
        resultType: 'NUMERIC',
        referenceMin: 70,
        referenceMax: 100,
        criticalMin: 40,
        displayOrder: 1,
        active: true
      },
      {
        id: 'p-inr',
        testId: 't-tp-tca',
        code: 'INR',
        name: 'INR (International Normalized Ratio)',
        unit: '',
        resultType: 'NUMERIC',
        referenceMin: 0.9,
        referenceMax: 1.2,
        criticalMax: 4.5,
        referenceText: '0.9 - 1.2 (Zone thérapeutique sous AVK: 2.0 - 3.0)',
        displayOrder: 2,
        active: true
      },
      {
        id: 'p-tca',
        testId: 't-tp-tca',
        code: 'TCA_RATIO',
        name: 'TCA (Ratio Patient / Témoin)',
        unit: 'Ratio',
        resultType: 'NUMERIC',
        referenceMin: 0.85,
        referenceMax: 1.20,
        displayOrder: 3,
        active: true
      }
    ]
  },
  {
    id: 't-hba1c',
    code: 'HBA1C',
    name: 'Hémoglobine Glyquée (HbA1c)',
    category: 'Biochimie',
    description: 'Suivi de l\'équilibre glycémique des 3 derniers mois.',
    sampleType: 'Sang total EDTA',
    container: 'Tube EDTA (Violet)',
    method: 'HPLC échangeuse de cations certifiée NGSP',
    turnaroundTime: '3h',
    price: 12000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    parameters: [
      {
        id: 'p-hba1c',
        testId: 't-hba1c',
        code: 'HBA1C',
        name: 'HbA1c NGSP',
        unit: '%',
        resultType: 'NUMERIC',
        referenceMin: 4.0,
        referenceMax: 6.0,
        criticalMax: 10.0,
        referenceText: '< 6.0% (Non diabétique), 6.5 - 7.0% (Cible diabète bien équilibré)',
        displayOrder: 1,
        active: true
      }
    ]
  }
];

export const INITIAL_TEST_GROUPS: TestGroup[] = [
  {
    id: 'grp-preop',
    code: 'BILAN_PREOP',
    name: 'Bilan Pré-Opératoire Standard',
    description: 'Examens indispensables avant toute chirurgie (NFS, TP/TCA, Glycémie, Créatinine).',
    testIds: ['t-nfs', 't-tp-tca', 't-glyc', 't-creat'],
    discountedPrice: 22000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'grp-checkup',
    code: 'CHECKUP_ANNUEL',
    name: 'Bilan de Santé Global (Check-Up)',
    description: 'Bilan complet : Hématologie, Bilan rénal, Métabolique et Lipidique.',
    testIds: ['t-nfs', 't-glyc', 't-creat', 't-lipid', 't-crp'],
    discountedPrice: 30000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'grp-diabete',
    code: 'BILAN_DIABETE',
    name: 'Bilan de Suivi Diabétique',
    description: 'Surveillance glycémie, HbA1c et fonction rénale.',
    testIds: ['t-glyc', 't-hba1c', 't-creat', 't-lipid'],
    discountedPrice: 28000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'grp-fievre',
    code: 'BILAN_FIEVRE',
    name: 'Bilan Syndrome Fébrile Tropical',
    description: 'Recherche Paludisme (GE), Infection bactérienne (NFS, CRP) et Typhoïde (Widal).',
    testIds: ['t-palu', 't-nfs', 't-crp', 't-widal'],
    discountedPrice: 21000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_ANTIBIOTICS: Antibiotic[] = [
  { id: 'ab-1', code: 'AMX', name: 'Amoxicilline', family: 'Pénicillines', dosage: '500mg - 1g', route: 'Orale / IV', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ab-2', code: 'AMC', name: 'Amoxicilline + Acide Clavulanique (Augmentin)', family: 'Pénicillines + Inhibiteur', dosage: '1g', route: 'Orale / IV', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ab-3', code: 'CRO', name: 'Ceftriaxone (Rocéphine)', family: 'Céphalosporines 3G', dosage: '1g - 2g', route: 'IV / IM', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ab-4', code: 'CIP', name: 'Ciprofloxacine', family: 'Fluoroquinolones', dosage: '500mg', route: 'Orale / IV', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ab-5', code: 'GEN', name: 'Gentamicine', family: 'Aminosides', dosage: '80mg - 160mg', route: 'IM / IV', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ab-6', code: 'SXT', name: 'Cotrimoxazole (Bactrim)', family: 'Sulfamides', dosage: '800/160mg', route: 'Orale', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ab-7', code: 'IMI', name: 'Imipénème', family: 'Carbapénèmes', dosage: '500mg', route: 'IV perfusion', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'ab-8', code: 'AZM', name: 'Azithromycine', family: 'Macrolides', dosage: '250mg - 500mg', route: 'Orale', active: true, createdAt: '2026-01-01T00:00:00Z' }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'cnt-1',
    name: 'IPM Sonatel',
    type: 'IPM',
    contactPerson: 'Mme Aïda Diop',
    phone: '+221 33 839 12 00',
    email: 'ipm@sonatel.sn',
    address: 'VDN Mermoz, Dakar',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    discount: 10,
    coveragePercentage: 80,
    paymentTerms: '30 jours fin de mois',
    creditLimit: 5000000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cnt-2',
    name: 'Askia Assurances',
    type: 'ASSURANCE',
    contactPerson: 'M. Jean-Paul Mendy',
    phone: '+221 33 889 77 00',
    email: 'sante@askia-assurances.com',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    discount: 15,
    coveragePercentage: 85,
    paymentTerms: '45 jours',
    creditLimit: 8000000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cnt-3',
    name: 'IPM Port Autonome de Dakar (PAD)',
    type: 'IPM',
    contactPerson: 'Dr. Babacar Diagne',
    phone: '+221 33 849 45 45',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    discount: 10,
    coveragePercentage: 100,
    paymentTerms: '30 jours',
    creditLimit: 10000000,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2026-000001',
    patientId: 'pat-1',
    patientName: 'Moussa Diallo',
    patientNumber: 'PAT-2026-000001',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ibrahima Diop',
    orderDate: '2026-10-15T08:45:00Z',
    priority: 'ROUTINE',
    status: 'COMPLETED',
    subtotal: 16500,
    discount: 0,
    tax: 0,
    total: 16500,
    paidAmount: 16500,
    balance: 0,
    notes: 'Bilan de contrôle annuel demandé par le médecin traitant',
    createdBy: 'Fatoumata Binetou Sy',
    createdAt: '2026-10-15T08:45:00Z',
    updatedAt: '2026-10-15T12:30:00Z',
    items: [
      { id: 'oi-1', orderId: 'ord-1', testId: 't-nfs', testName: 'Numération Formule Sanguine (Hémogramme complet)', category: 'Hématologie', price: 8500, discount: 0, status: 'COMPLETED' },
      { id: 'oi-2', orderId: 'ord-1', testId: 't-glyc', testName: 'Glycémie à Jeun', category: 'Biochimie', price: 3500, discount: 0, status: 'COMPLETED' },
      { id: 'oi-3', orderId: 'ord-1', testId: 't-creat', testName: 'Créatininémie & Clairance (Estimation DFG)', category: 'Biochimie', price: 4500, discount: 0, status: 'COMPLETED' }
    ]
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2026-000002',
    patientId: 'pat-2',
    patientName: 'Fatou Badiane',
    patientNumber: 'PAT-2026-000002',
    doctorId: 'doc-2',
    doctorName: 'Dr. Aminata Fall',
    orderDate: '2026-10-16T08:15:00Z',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    subtotal: 17000,
    discount: 0,
    tax: 0,
    total: 17000,
    paidAmount: 17000,
    balance: 0,
    notes: 'Bilan pré-opératoire urgent intervention programmée demain',
    createdBy: 'Fatoumata Binetou Sy',
    createdAt: '2026-10-16T08:15:00Z',
    updatedAt: '2026-10-16T08:30:00Z',
    items: [
      { id: 'oi-4', orderId: 'ord-2', testId: 't-nfs', testName: 'Numération Formule Sanguine (Hémogramme complet)', category: 'Hématologie', price: 8500, discount: 0, status: 'PROCESSING' },
      { id: 'oi-5', orderId: 'ord-2', testId: 't-tp-tca', testName: 'Bilan d\'Hémostase (TP / INR / TCA)', category: 'Hématologie', price: 8000, discount: 0, status: 'PROCESSING' }
    ]
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-2026-000003',
    patientId: 'pat-3',
    patientName: 'Babacar Ndao',
    patientNumber: 'PAT-2026-000003',
    doctorId: 'doc-3',
    doctorName: 'Dr. Cheikh Tidiane Gueye',
    orderDate: '2026-10-16T09:00:00Z',
    priority: 'ROUTINE',
    status: 'PENDING',
    subtotal: 13000,
    discount: 1300,
    tax: 0,
    total: 11700,
    paidAmount: 5000,
    balance: 6700,
    contractId: 'cnt-1',
    notes: 'Prise en charge IPM Sonatel 80%',
    createdBy: 'Fatoumata Binetou Sy',
    createdAt: '2026-10-16T09:00:00Z',
    updatedAt: '2026-10-16T09:00:00Z',
    items: [
      { id: 'oi-6', orderId: 'ord-3', testId: 't-palu', testName: 'Goutte Épaisse & Frottis Sanguin (Paludisme)', category: 'Parasitologie', price: 4000, discount: 400, status: 'PENDING' },
      { id: 'oi-7', orderId: 'ord-3', testId: 't-ecbu', testName: 'Examen Cytobactériologique des Urines (ECBU)', category: 'Microbiologie', price: 9000, discount: 900, status: 'PENDING' }
    ]
  }
];

export const INITIAL_SAMPLES: Sample[] = [
  {
    id: 'smp-1',
    sampleNumber: 'SMP-2026-000001',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-000001',
    patientId: 'pat-1',
    patientName: 'Moussa Diallo',
    sampleType: 'Sang veineux total',
    container: 'Tube EDTA Violet + Tube Sec Jaune',
    collectionDate: '2026-10-15',
    collectionTime: '08:55',
    collectorName: 'Awa Fatou Sow',
    receivedDate: '2026-10-15T09:10:00Z',
    receivedBy: 'Awa Fatou Sow',
    status: 'COMPLETED',
    createdAt: '2026-10-15T08:50:00Z'
  },
  {
    id: 'smp-2',
    sampleNumber: 'SMP-2026-000002',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-000002',
    patientId: 'pat-2',
    patientName: 'Fatou Badiane',
    sampleType: 'Sang veineux citraté et EDTA',
    container: 'Tube Citrate Bleu + Tube EDTA Violet',
    collectionDate: '2026-10-16',
    collectionTime: '08:25',
    collectorName: 'Awa Fatou Sow',
    receivedDate: '2026-10-16T08:35:00Z',
    receivedBy: 'Awa Fatou Sow',
    status: 'PROCESSING',
    createdAt: '2026-10-16T08:20:00Z'
  },
  {
    id: 'smp-3',
    sampleNumber: 'SMP-2026-000003',
    orderId: 'ord-3',
    orderNumber: 'ORD-2026-000003',
    patientId: 'pat-3',
    patientName: 'Babacar Ndao',
    sampleType: 'Urines du matin',
    container: 'Flacon stérile bouchon vert',
    status: 'WAITING',
    notes: 'Patient en salle de recueil',
    createdAt: '2026-10-16T09:05:00Z'
  }
];

export const INITIAL_RESULTS: TestResult[] = [
  {
    id: 'res-1',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-000001',
    testId: 't-nfs',
    testName: 'Numération Formule Sanguine (Hémogramme complet)',
    category: 'Hématologie',
    patientId: 'pat-1',
    patientName: 'Moussa Diallo',
    sampleId: 'smp-1',
    sampleNumber: 'SMP-2026-000001',
    technicianName: 'Awa Fatou Sow',
    technicianId: 'usr-3',
    status: 'VALIDATED',
    validatedBy: 'Dr. Mariama Ba-Diallo',
    validatedAt: '2026-10-15T11:45:00Z',
    validationComment: 'Hémogramme dans les limites de la normale. Pas d\'anomalie cytologique.',
    createdAt: '2026-10-15T10:15:00Z',
    updatedAt: '2026-10-15T11:45:00Z',
    values: [
      { parameterId: 'p-gb', parameterName: 'Globules Blancs (Leucocytes)', parameterCode: 'GB', unit: '10^3/µL', value: '6.4', numericValue: 6.4, flag: 'NORMAL', referenceText: '4.0 - 10.0' },
      { parameterId: 'p-gr', parameterName: 'Globules Rouges (Érythrocytes)', parameterCode: 'GR', unit: '10^6/µL', value: '4.95', numericValue: 4.95, flag: 'NORMAL', referenceText: '4.5 - 5.9' },
      { parameterId: 'p-hb', parameterName: 'Hémoglobine', parameterCode: 'HB', unit: 'g/dL', value: '14.8', numericValue: 14.8, flag: 'NORMAL', referenceText: '13.0 - 17.5' },
      { parameterId: 'p-ht', parameterName: 'Hématocrite', parameterCode: 'HT', unit: '%', value: '44.2', numericValue: 44.2, flag: 'NORMAL', referenceText: '36.0 - 52.0' },
      { parameterId: 'p-plt', parameterName: 'Plaquettes', parameterCode: 'PLT', unit: '10^3/µL', value: '235', numericValue: 235, flag: 'NORMAL', referenceText: '150 - 450' }
    ]
  },
  {
    id: 'res-2',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-000001',
    testId: 't-glyc',
    testName: 'Glycémie à Jeun',
    category: 'Biochimie',
    patientId: 'pat-1',
    patientName: 'Moussa Diallo',
    sampleId: 'smp-1',
    sampleNumber: 'SMP-2026-000001',
    technicianName: 'Awa Fatou Sow',
    technicianId: 'usr-3',
    status: 'VALIDATED',
    validatedBy: 'Dr. Mariama Ba-Diallo',
    validatedAt: '2026-10-15T11:45:00Z',
    validationComment: 'Glycémie normale.',
    createdAt: '2026-10-15T10:30:00Z',
    updatedAt: '2026-10-15T11:45:00Z',
    values: [
      { parameterId: 'p-glyc', parameterName: 'Glucose plasmatique à jeun', parameterCode: 'GLU', unit: 'g/L', value: '0.94', numericValue: 0.94, flag: 'NORMAL', referenceText: '0.70 - 1.10 g/L' }
    ]
  },
  {
    id: 'res-3',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-000001',
    testId: 't-creat',
    testName: 'Créatininémie & Clairance (Estimation DFG)',
    category: 'Biochimie',
    patientId: 'pat-1',
    patientName: 'Moussa Diallo',
    sampleId: 'smp-1',
    sampleNumber: 'SMP-2026-000001',
    technicianName: 'Awa Fatou Sow',
    technicianId: 'usr-3',
    status: 'VALIDATED',
    validatedBy: 'Dr. Mariama Ba-Diallo',
    validatedAt: '2026-10-15T11:45:00Z',
    validationComment: 'Fonction rénale conservée.',
    createdAt: '2026-10-15T10:45:00Z',
    updatedAt: '2026-10-15T11:45:00Z',
    values: [
      { parameterId: 'p-creat', parameterName: 'Créatinine Sérique', parameterCode: 'CREAT', unit: 'mg/L', value: '9.2', numericValue: 9.2, flag: 'NORMAL', referenceText: '7.0 - 12.0' },
      { parameterId: 'p-dfg', parameterName: 'DFG estimé (CKD-EPI)', parameterCode: 'DFG', unit: 'mL/min/1.73m²', value: '102', numericValue: 102, flag: 'NORMAL', referenceText: '90 - 140' }
    ]
  },
  {
    id: 'res-4',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-000002',
    testId: 't-nfs',
    testName: 'Numération Formule Sanguine (Hémogramme complet)',
    category: 'Hématologie',
    patientId: 'pat-2',
    patientName: 'Fatou Badiane',
    sampleId: 'smp-2',
    sampleNumber: 'SMP-2026-000002',
    technicianName: 'Awa Fatou Sow',
    technicianId: 'usr-3',
    status: 'ENTERED',
    createdAt: '2026-10-16T09:30:00Z',
    updatedAt: '2026-10-16T09:30:00Z',
    values: [
      { parameterId: 'p-gb', parameterName: 'Globules Blancs (Leucocytes)', parameterCode: 'GB', unit: '10^3/µL', value: '11.8', numericValue: 11.8, flag: 'HIGH', referenceText: '4.0 - 10.0' },
      { parameterId: 'p-gr', parameterName: 'Globules Rouges (Érythrocytes)', parameterCode: 'GR', unit: '10^6/µL', value: '3.65', numericValue: 3.65, flag: 'LOW', referenceText: '4.0 - 5.2' },
      { parameterId: 'p-hb', parameterName: 'Hémoglobine', parameterCode: 'HB', unit: 'g/dL', value: '10.5', numericValue: 10.5, flag: 'LOW', referenceText: '12.0 - 15.5' },
      { parameterId: 'p-ht', parameterName: 'Hématocrite', parameterCode: 'HT', unit: '%', value: '32.1', numericValue: 32.1, flag: 'LOW', referenceText: '36.0 - 52.0' },
      { parameterId: 'p-plt', parameterName: 'Plaquettes', parameterCode: 'PLT', unit: '10^3/µL', value: '290', numericValue: 290, flag: 'NORMAL', referenceText: '150 - 450' }
    ]
  }
];

export const INITIAL_REPORTS: MedicalReport[] = [
  {
    id: 'rpt-1',
    reportNumber: 'RPT-2026-000001',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-000001',
    patientId: 'pat-1',
    patientName: 'Moussa Diallo',
    patientNumber: 'PAT-2026-000001',
    patientDob: '1984-06-15',
    patientGender: 'M',
    doctorName: 'Dr. Ibrahima Diop',
    testIds: ['t-nfs', 't-glyc', 't-creat'],
    testNames: ['Hémogramme complet', 'Glycémie à Jeun', 'Créatininémie & DFG'],
    status: 'DELIVERED',
    validatedBy: 'Dr. Mariama Ba-Diallo',
    validatedAt: '2026-10-15T11:45:00Z',
    verificationCode: 'XL-8942-D1',
    publicUrl: 'https://extremelab-next.sn/verify/RPT-2026-000001',
    sentViaWhatsApp: true,
    sentViaEmail: true,
    sentViaSms: false,
    createdAt: '2026-10-15T11:50:00Z'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'FAC-2026-000001',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-000001',
    patientId: 'pat-1',
    patientName: 'Moussa Diallo',
    patientNumber: 'PAT-2026-000001',
    invoiceDate: '2026-10-15',
    subtotal: 16500,
    discount: 0,
    tax: 0,
    total: 16500,
    paidAmount: 16500,
    balance: 0,
    status: 'PAID',
    createdBy: 'Fatoumata Binetou Sy',
    createdAt: '2026-10-15T08:45:00Z'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'FAC-2026-000002',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-000002',
    patientId: 'pat-2',
    patientName: 'Fatou Badiane',
    patientNumber: 'PAT-2026-000002',
    invoiceDate: '2026-10-16',
    subtotal: 17000,
    discount: 0,
    tax: 0,
    total: 17000,
    paidAmount: 17000,
    balance: 0,
    status: 'PAID',
    createdBy: 'Fatoumata Binetou Sy',
    createdAt: '2026-10-16T08:15:00Z'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'FAC-2026-000003',
    orderId: 'ord-3',
    orderNumber: 'ORD-2026-000003',
    patientId: 'pat-3',
    patientName: 'Babacar Ndao',
    patientNumber: 'PAT-2026-000003',
    invoiceDate: '2026-10-16',
    subtotal: 13000,
    discount: 1300,
    tax: 0,
    total: 11700,
    paidAmount: 5000,
    balance: 6700,
    status: 'PARTIAL',
    contractId: 'cnt-1',
    contractName: 'IPM Sonatel',
    createdBy: 'Fatoumata Binetou Sy',
    createdAt: '2026-10-16T09:00:00Z'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    paymentNumber: 'PAY-2026-000001',
    invoiceId: 'inv-1',
    invoiceNumber: 'FAC-2026-000001',
    orderId: 'ord-1',
    patientId: 'pat-1',
    patientName: 'Moussa Diallo',
    amount: 16500,
    method: 'WAVE',
    reference: 'WAVE-SN-98234-A7',
    paymentDate: '2026-10-15T08:48:00Z',
    receivedBy: 'Fatoumata Binetou Sy',
    notes: 'Paiement Wave instantané',
    status: 'VALID',
    createdAt: '2026-10-15T08:48:00Z'
  },
  {
    id: 'pay-2',
    paymentNumber: 'PAY-2026-000002',
    invoiceId: 'inv-2',
    invoiceNumber: 'FAC-2026-000002',
    orderId: 'ord-2',
    patientId: 'pat-2',
    patientName: 'Fatou Badiane',
    amount: 17000,
    method: 'ORANGE_MONEY',
    reference: 'OM-CI-847291',
    paymentDate: '2026-10-16T08:20:00Z',
    receivedBy: 'Fatoumata Binetou Sy',
    notes: 'Reçu via Orange Money',
    status: 'VALID',
    createdAt: '2026-10-16T08:20:00Z'
  },
  {
    id: 'pay-3',
    paymentNumber: 'PAY-2026-000003',
    invoiceId: 'inv-3',
    invoiceNumber: 'FAC-2026-000003',
    orderId: 'ord-3',
    patientId: 'pat-3',
    patientName: 'Babacar Ndao',
    amount: 5000,
    method: 'ESPECES',
    paymentDate: '2026-10-16T09:05:00Z',
    receivedBy: 'Fatoumata Binetou Sy',
    notes: 'Acompte ticket modérateur espèces',
    status: 'VALID',
    createdAt: '2026-10-16T09:05:00Z'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    expenseNumber: 'EXP-2026-000001',
    category: 'REACTIFS',
    description: 'Achat coffret réactifs Sysmex Hématologie Cellpack DCL',
    amount: 85000,
    paymentMethod: 'VIREMENT',
    expenseDate: '2026-10-14',
    createdBy: 'Abdoulaye Wade Cissé',
    notes: 'Fournisseur Bio-Equip Sénégal',
    createdAt: '2026-10-14T11:00:00Z'
  },
  {
    id: 'exp-2',
    expenseNumber: 'EXP-2026-000002',
    category: 'CONSOMMABLES',
    description: 'Tubes sous vide EDTA + Tubes Secs BD Vacutainer (10 boîtes)',
    amount: 45000,
    paymentMethod: 'ESPECES',
    expenseDate: '2026-10-15',
    createdBy: 'Abdoulaye Wade Cissé',
    createdAt: '2026-10-15T14:30:00Z'
  }
];

export const INITIAL_CULTURES: Culture[] = [
  {
    id: 'cul-1',
    sampleId: 'smp-1',
    sampleNumber: 'SMP-2026-000001',
    patientId: 'pat-1',
    patientName: 'Moussa Diallo',
    cultureType: 'Urines (ECBU)',
    incubationDate: '2026-10-14T10:00:00Z',
    durationHours: 24,
    result: 'POSITIVE',
    organism: 'Escherichia coli',
    colonyCount: '> 10^5 UFC/mL',
    comments: 'Colonies lisses, rosées sur gélose MacConkey, lactose (+).',
    status: 'VALIDATED',
    validatedBy: 'Dr. Mariama Ba-Diallo',
    validatedAt: '2026-10-15T12:00:00Z',
    createdAt: '2026-10-14T10:00:00Z'
  }
];

export const INITIAL_ANTIBIOGRAMS: Antibiogram[] = [
  {
    id: 'atb-1',
    cultureId: 'cul-1',
    sampleNumber: 'SMP-2026-000001',
    patientName: 'Moussa Diallo',
    organism: 'Escherichia coli',
    method: 'DIFFUSION_DISQUES',
    comments: 'Souche sensible aux céphalosporines de 3ème génération et aminosides. Résistance à l\'amoxicilline isolée.',
    status: 'VALIDATED',
    validatedBy: 'Dr. Mariama Ba-Diallo',
    validatedAt: '2026-10-15T12:15:00Z',
    createdAt: '2026-10-15T10:00:00Z',
    results: [
      { id: 'ar-1', antibiogramId: 'atb-1', antibioticId: 'ab-1', antibioticName: 'Amoxicilline', family: 'Pénicillines', result: 'R', mic: '> 32 mg/L', comment: 'Résistant (Pénicillinase)' },
      { id: 'ar-2', antibiogramId: 'atb-1', antibioticId: 'ab-2', antibioticName: 'Amoxicilline + Acide Clavulanique', family: 'Pénicillines + Inhibiteur', result: 'S', mic: '4 mg/L' },
      { id: 'ar-3', antibiogramId: 'atb-1', antibioticId: 'ab-3', antibioticName: 'Ceftriaxone', family: 'Céphalosporines 3G', result: 'S', mic: '<= 0.25 mg/L' },
      { id: 'ar-4', antibiogramId: 'atb-1', antibioticId: 'ab-4', antibioticName: 'Ciprofloxacine', family: 'Fluoroquinolones', result: 'S', mic: '0.12 mg/L' },
      { id: 'ar-5', antibiogramId: 'atb-1', antibioticId: 'ab-5', antibioticName: 'Gentamicine', family: 'Aminosides', result: 'S', mic: '1 mg/L' },
      { id: 'ar-6', antibiogramId: 'atb-1', antibioticId: 'ab-6', antibioticName: 'Cotrimoxazole (Bactrim)', family: 'Sulfamides', result: 'I', mic: '2/38 mg/L', comment: 'Sensibilité intermédiaire' }
    ]
  }
];

export const INITIAL_HOME_VISITS: HomeVisit[] = [
  {
    id: 'hv-1',
    patientId: 'pat-4',
    patientName: 'Coumba Thiam',
    phone: '+221 77 412 85 96',
    address: 'Mermoz Pyrotechnie, Villa 42',
    city: 'Dakar',
    visitDate: '2026-10-16',
    visitTime: '15:30',
    phlebotomistName: 'Awa Fatou Sow',
    testNames: ['Hémogramme complet (NFS)', 'Bilan Lipidique'],
    travelFee: 5000,
    notes: 'Patiente alitée convalescente après chirurgie',
    status: 'PLANIFIED',
    createdAt: '2026-10-16T08:00:00Z'
  }
];

export const INITIAL_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-receipt',
    code: 'RECU_PAIEMENT',
    name: 'Reçu de Facturation & Paiement',
    type: 'RECEIPT',
    content: `Bonjour *{patient_name}*,

Votre reçu de paiement est disponible auprès du laboratoire *{lab_name}*.

📄 *Réf Facture :* {invoice_number}
💰 *Montant payé :* {amount}
🏥 *Laboratoire :* {lab_name}

Consultez et téléchargez votre reçu sécurisé :
🔗 {receipt_link}

Pour toute question : {lab_phone}.
Merci pour votre confiance.`,
    active: true
  },
  {
    id: 'tpl-report',
    code: 'RAPPORT_DISPONIBLE',
    name: 'Résultats d\'analyses validés',
    type: 'REPORT',
    content: `Bonjour *{patient_name}*,

Vos résultats d'analyses médicales sont validés par notre biologiste.

🔬 *Demande :* {order_number}
📑 *Rapport N° :* {report_number}
👩‍⚕️ *Biologiste :* {lead_biologist}

Accédez à votre rapport médical officiel avec vérification QR :
🔗 {report_link}

{lab_name} vous souhaite un prompt rétablissement.
Téléphone : {lab_phone}`,
    active: true
  },
  {
    id: 'tpl-reminder',
    code: 'RAPPEL_RDV',
    name: 'Rappel de prélèvement à jeun',
    type: 'REMINDER',
    content: `Bonjour *{patient_name}*,

Nous vous rappelons votre rendez-vous de prélèvement au laboratoire *{lab_name}*.

📅 *Date :* {appointment_date}
⏰ *Heure :* {appointment_time}
📍 *Adresse :* {lab_address}

ℹ️ *Consignes :* Veuillez rester à jeun depuis minuit pour la glycémie et le bilan lipidique. Eau plate autorisée.

À très bientôt !`,
    active: true
  }
];

export const INITIAL_WHATSAPP_LOGS: WhatsAppLog[] = [
  {
    id: 'wlog-1',
    recipientPhone: '+221 77 654 11 22',
    recipientName: 'Moussa Diallo',
    templateType: 'REPORT',
    messageContent: 'Bonjour Moussa Diallo, vos résultats d\'analyses sont validés...',
    status: 'SUCCESS',
    providerResponse: 'HTTP 200 - Message ID: wamid.HBgLMjIxNzc2NTQxMTIyFQIAERgSRTI0',
    referenceNumber: 'RPT-2026-000001',
    sentBy: 'Dr. Mariama Ba-Diallo',
    timestamp: '2026-10-15T11:55:00Z'
  },
  {
    id: 'wlog-2',
    recipientPhone: '+221 77 654 11 22',
    recipientName: 'Moussa Diallo',
    templateType: 'RECEIPT',
    messageContent: 'Bonjour Moussa Diallo, votre reçu de 16 500 FCFA est disponible...',
    status: 'SUCCESS',
    providerResponse: 'HTTP 200 - Message ID: wamid.HBgLMjIxNzc2NTQxMTIyFQIAERgSRTI1',
    referenceNumber: 'FAC-2026-000001',
    sentBy: 'Fatoumata Binetou Sy',
    timestamp: '2026-10-15T08:50:00Z'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'usr-3',
    senderName: 'Awa Fatou Sow (Technicienne)',
    senderRole: 'TECHNICIAN',
    message: 'Bonjour Dr. Diallo, les résultats de NFS du patient Moussa Diallo sont saisis et prêts pour validation.',
    timestamp: '2026-10-15T11:30:00Z',
    read: true
  },
  {
    id: 'msg-2',
    senderId: 'usr-1',
    senderName: 'Dr. Mariama Ba-Diallo (Biologiste)',
    senderRole: 'BIOLOGIST',
    message: 'Merci Awa, je viens de contrôler la lame et les constantes érythrocytaires, c\'est validé !',
    timestamp: '2026-10-15T11:46:00Z',
    read: true
  },
  {
    id: 'msg-3',
    senderId: 'usr-4',
    senderName: 'Fatoumata Binetou Sy (Accueil)',
    senderRole: 'RECEPTION',
    message: 'Le patient Babacar Ndao est en salle de recueil d\'urines pour l\'ECBU prescrit par Dr. Gueye.',
    timestamp: '2026-10-16T09:10:00Z',
    read: false
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Résultat en attente de validation',
    message: 'NFS saisie pour Fatou Badiane (ORD-2026-000002). Leucocytes élevés (11.8).',
    type: 'WARNING',
    read: false,
    timestamp: '2026-10-16T09:32:00Z',
    link: '/results'
  },
  {
    id: 'notif-2',
    title: 'Nouveau prélèvement à effectuer',
    message: 'Échantillon d\'urines en attente pour Babacar Ndao (SMP-2026-000003).',
    type: 'INFO',
    read: false,
    timestamp: '2026-10-16T09:05:00Z',
    link: '/samples'
  },
  {
    id: 'notif-3',
    title: 'Paiement partiel enregistré',
    message: 'Facture FAC-2026-000003 : Acompte de 5 000 FCFA reçu (Reste: 6 700 FCFA).',
    type: 'INFO',
    read: true,
    timestamp: '2026-10-16T09:06:00Z',
    link: '/invoices'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    userId: 'usr-4',
    userName: 'Fatoumata Binetou Sy',
    userRole: 'RECEPTION',
    action: 'PATIENT_CREATED',
    module: 'PATIENTS',
    recordId: 'pat-1',
    recordIdentifier: 'PAT-2026-000001 (Moussa Diallo)',
    oldValue: '',
    newValue: 'Création du dossier patient Moussa Diallo',
    ipAddress: '192.168.1.15',
    timestamp: '2026-10-15T08:30:00Z'
  },
  {
    id: 'log-2',
    userId: 'usr-4',
    userName: 'Fatoumata Binetou Sy',
    userRole: 'RECEPTION',
    action: 'ORDER_CREATED',
    module: 'ORDERS',
    recordId: 'ord-1',
    recordIdentifier: 'ORD-2026-000001',
    oldValue: '',
    newValue: 'Création de la demande (NFS, Glycémie, Créatinine - Total 16 500 FCFA)',
    ipAddress: '192.168.1.15',
    timestamp: '2026-10-15T08:45:00Z'
  },
  {
    id: 'log-3',
    userId: 'usr-4',
    userName: 'Fatoumata Binetou Sy',
    userRole: 'RECEPTION',
    action: 'PAYMENT_RECORDED',
    module: 'PAYMENTS',
    recordId: 'pay-1',
    recordIdentifier: 'PAY-2026-000001',
    oldValue: '',
    newValue: 'Paiement Wave de 16 500 FCFA enregistré',
    ipAddress: '192.168.1.15',
    timestamp: '2026-10-15T08:48:00Z'
  },
  {
    id: 'log-4',
    userId: 'usr-3',
    userName: 'Awa Fatou Sow',
    userRole: 'TECHNICIAN',
    action: 'SAMPLE_COLLECTED',
    module: 'SAMPLES',
    recordId: 'smp-1',
    recordIdentifier: 'SMP-2026-000001',
    oldValue: 'WAITING',
    newValue: 'COLLECTED & RECEIVED (Tube EDTA & Sec)',
    ipAddress: '192.168.1.20',
    timestamp: '2026-10-15T09:10:00Z'
  },
  {
    id: 'log-5',
    userId: 'usr-3',
    userName: 'Awa Fatou Sow',
    userRole: 'TECHNICIAN',
    action: 'RESULT_ENTERED',
    module: 'RESULTS',
    recordId: 'res-1',
    recordIdentifier: 'NFS (Moussa Diallo)',
    oldValue: '',
    newValue: 'Saisie des 5 paramètres de la NFS',
    ipAddress: '192.168.1.20',
    timestamp: '2026-10-15T10:15:00Z'
  },
  {
    id: 'log-6',
    userId: 'usr-1',
    userName: 'Dr. Mariama Ba-Diallo',
    userRole: 'BIOLOGIST',
    action: 'RESULT_VALIDATED',
    module: 'VALIDATION',
    recordId: 'res-1',
    recordIdentifier: 'ORD-2026-000001',
    oldValue: 'ENTERED',
    newValue: 'VALIDATED avec signature électronique',
    ipAddress: '192.168.1.10',
    timestamp: '2026-10-15T11:45:00Z'
  },
  {
    id: 'log-7',
    userId: 'usr-1',
    userName: 'Dr. Mariama Ba-Diallo',
    userRole: 'BIOLOGIST',
    action: 'REPORT_GENERATED',
    module: 'REPORTS',
    recordId: 'rpt-1',
    recordIdentifier: 'RPT-2026-000001',
    oldValue: '',
    newValue: 'Génération du rapport PDF officiel avec QR Code',
    ipAddress: '192.168.1.10',
    timestamp: '2026-10-15T11:50:00Z'
  },
  {
    id: 'log-8',
    userId: 'usr-1',
    userName: 'Dr. Mariama Ba-Diallo',
    userRole: 'BIOLOGIST',
    action: 'WHATSAPP_SENT',
    module: 'WHATSAPP',
    recordId: 'wlog-1',
    recordIdentifier: '+221 77 654 11 22',
    oldValue: '',
    newValue: 'Notification WhatsApp envoyée au patient Moussa Diallo',
    ipAddress: '192.168.1.10',
    timestamp: '2026-10-15T11:55:00Z'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'PDAO (Pharmacie & Diagnostics d\'Afrique de l\'Ouest)',
    contactPerson: 'M. Ousmane Dieng',
    phone: '+221 33 832 15 15',
    email: 'commandes@pdao-senegal.com',
    address: 'Km 4, Boulevard du Centenaire de la Commune de Dakar',
    city: 'Dakar',
    deliveryTimeDays: 2,
    active: true
  },
  {
    id: 'sup-2',
    name: 'LaboTech Sénégal SARL',
    contactPerson: 'Mme. Aminata Kane',
    phone: '+221 77 520 80 90',
    email: 'contact@labotech-senegal.sn',
    address: 'Route de l\'Aéroport, Immeuble Horizon, Yoff',
    city: 'Dakar',
    deliveryTimeDays: 1,
    active: true
  },
  {
    id: 'sup-3',
    name: 'Bio-Rad West Africa Hub',
    contactPerson: 'Dr. Jean-Marc Koffi',
    phone: '+221 33 860 44 22',
    email: 'sales-westafrica@bio-rad.com',
    address: 'Point E, Rue 3 x Boulevard de l\'Est',
    city: 'Dakar',
    deliveryTimeDays: 4,
    active: true
  }
];

export const INITIAL_REAGENTS: ReagentItem[] = [
  {
    id: 'rea-1',
    code: 'SYS-DCL-20L',
    name: 'Sysmex Cellpack DCL (Diluant Hématologie 20L)',
    category: 'HÉMATOLOGIE',
    supplierId: 'sup-1',
    supplierName: 'PDAO (Sysmex)',
    lotNumber: 'CP2604A',
    expirationDate: '2027-04-30',
    storageTemperature: 'Température Ambiante (+15 à +25°C)',
    currentQuantity: 8,
    unit: 'Flacons',
    minThreshold: 3,
    idealStock: 12,
    costPerUnit: 68000,
    testsPerUnit: 800,
    status: 'OPTIMAL',
    lastRestockedDate: '2026-10-01'
  },
  {
    id: 'rea-2',
    code: 'SYS-WDF-3L',
    name: 'Sysmex Fluorocell WDF (Lyse Leucocytaire)',
    category: 'HÉMATOLOGIE',
    supplierId: 'sup-1',
    supplierName: 'PDAO (Sysmex)',
    lotNumber: 'FC9912B',
    expirationDate: '2026-12-15',
    storageTemperature: '+2°C à +8°C',
    currentQuantity: 2,
    unit: 'Flacons',
    minThreshold: 3,
    idealStock: 6,
    costPerUnit: 145000,
    testsPerUnit: 1200,
    status: 'LOW',
    lastRestockedDate: '2026-09-15'
  },
  {
    id: 'rea-3',
    code: 'ROB-GLUC-600',
    name: 'Roche Cobas GLUC3 (Cassette Glucose HK)',
    category: 'BIOCHIMIE',
    supplierId: 'sup-1',
    supplierName: 'PDAO (Roche)',
    lotNumber: 'GL8821C',
    expirationDate: '2027-01-20',
    storageTemperature: '+2°C à +8°C',
    currentQuantity: 4,
    unit: 'Kits',
    minThreshold: 2,
    idealStock: 8,
    costPerUnit: 82000,
    testsPerUnit: 600,
    status: 'OPTIMAL',
    lastRestockedDate: '2026-09-28'
  },
  {
    id: 'rea-4',
    code: 'ROB-CREA-500',
    name: 'Roche Cobas CREAJ2 (Créatinine Jaffé Compensée)',
    category: 'BIOCHIMIE',
    supplierId: 'sup-1',
    supplierName: 'PDAO (Roche)',
    lotNumber: 'CR7411D',
    expirationDate: '2026-11-10',
    storageTemperature: '+2°C à +8°C',
    currentQuantity: 1,
    unit: 'Kits',
    minThreshold: 2,
    idealStock: 5,
    costPerUnit: 94000,
    testsPerUnit: 500,
    status: 'CRITICAL',
    lastRestockedDate: '2026-08-20'
  },
  {
    id: 'rea-5',
    code: 'TUB-EDTA-4ML',
    name: 'Tubes sous vide EDTA K2 4mL (Bouchon Lavande)',
    category: 'TUBES & AIGUILLES',
    supplierId: 'sup-2',
    supplierName: 'LaboTech Sénégal',
    lotNumber: 'ED2610X',
    expirationDate: '2027-08-31',
    storageTemperature: 'Température Ambiante (+15 à +25°C)',
    currentQuantity: 650,
    unit: 'Tubes',
    minThreshold: 200,
    idealStock: 1000,
    costPerUnit: 120,
    status: 'OPTIMAL',
    lastRestockedDate: '2026-10-10'
  },
  {
    id: 'rea-6',
    code: 'TUB-SEC-5ML',
    name: 'Tubes sous vide Sérum Gel Séparateur 5mL (Bouchon Rouge)',
    category: 'TUBES & AIGUILLES',
    supplierId: 'sup-2',
    supplierName: 'LaboTech Sénégal',
    lotNumber: 'SC5510Z',
    expirationDate: '2027-09-30',
    storageTemperature: 'Température Ambiante (+15 à +25°C)',
    currentQuantity: 820,
    unit: 'Tubes',
    minThreshold: 250,
    idealStock: 1200,
    costPerUnit: 140,
    status: 'OPTIMAL',
    lastRestockedDate: '2026-10-10'
  },
  {
    id: 'rea-7',
    code: 'BR-CIPRO-5UG',
    name: 'Bio-Rad Disques Ciprofloxacine 5µg (Antibiogramme)',
    category: 'MICROBIOLOGIE',
    supplierId: 'sup-3',
    supplierName: 'Bio-Rad West Africa',
    lotNumber: 'CP5012B',
    expirationDate: '2027-03-31',
    storageTemperature: '-20°C',
    currentQuantity: 5,
    unit: 'Flacons',
    minThreshold: 2,
    idealStock: 10,
    costPerUnit: 18500,
    status: 'OPTIMAL',
    lastRestockedDate: '2026-09-05'
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    reagentId: 'rea-5',
    reagentName: 'Tubes sous vide EDTA K2 4mL (Bouchon Lavande)',
    type: 'ENTRY',
    quantity: 500,
    reason: 'Livraison Bon Commande BC-2026-10',
    performedBy: 'Awa Fatou Sow',
    timestamp: '2026-10-10T11:00:00Z',
    lotNumber: 'ED2610X'
  },
  {
    id: 'mov-2',
    reagentId: 'rea-1',
    reagentName: 'Sysmex Cellpack DCL (Diluant Hématologie 20L)',
    type: 'EXIT',
    quantity: 1,
    reason: 'Mise en place sur automate Sysmex XN-550',
    performedBy: 'Awa Fatou Sow',
    timestamp: '2026-10-14T08:30:00Z',
    lotNumber: 'CP2604A'
  },
  {
    id: 'mov-3',
    reagentId: 'rea-4',
    reagentName: 'Roche Cobas CREAJ2 (Créatinine Jaffé Compensée)',
    type: 'EXIT',
    quantity: 1,
    reason: 'Chargement carrousel réactif Cobas c311',
    performedBy: 'Awa Fatou Sow',
    timestamp: '2026-10-15T09:00:00Z',
    lotNumber: 'CR7411D'
  }
];

export const INITIAL_QC_MATERIALS: QcControlMaterial[] = [
  {
    id: 'qcm-1',
    name: 'Sysmex Eightcheck-3N Normal (Hématologie)',
    lotNumber: '8N-6101',
    manufacturer: 'Sysmex Corporation',
    expirationDate: '2026-12-31',
    parameterCode: 'GB',
    parameterName: 'Globules Blancs (GB / WBC)',
    unit: '10^3/µL',
    level: 'LEVEL_2_NORMAL',
    targetMean: 7.10,
    standardDeviation: 0.35,
    active: true
  },
  {
    id: 'qcm-2',
    name: 'Sysmex Eightcheck-3N Normal (Hématologie)',
    lotNumber: '8N-6101',
    manufacturer: 'Sysmex Corporation',
    expirationDate: '2026-12-31',
    parameterCode: 'HB',
    parameterName: 'Hémoglobine (Hb)',
    unit: 'g/dL',
    level: 'LEVEL_2_NORMAL',
    targetMean: 13.5,
    standardDeviation: 0.30,
    active: true
  },
  {
    id: 'qcm-3',
    name: 'Roche Precinorm U (Biochimie Générale)',
    lotNumber: 'PN-9921',
    manufacturer: 'Roche Diagnostics',
    expirationDate: '2027-02-28',
    parameterCode: 'GLU',
    parameterName: 'Glucose Plasmatique',
    unit: 'g/L',
    level: 'LEVEL_2_NORMAL',
    targetMean: 1.02,
    standardDeviation: 0.04,
    active: true
  },
  {
    id: 'qcm-4',
    name: 'Roche Precinorm U (Biochimie Générale)',
    lotNumber: 'PN-9921',
    manufacturer: 'Roche Diagnostics',
    expirationDate: '2027-02-28',
    parameterCode: 'CREAT',
    parameterName: 'Créatinine Sérique',
    unit: 'mg/L',
    level: 'LEVEL_2_NORMAL',
    targetMean: 11.2,
    standardDeviation: 0.45,
    active: true
  }
];

export const INITIAL_QC_RUNS: QcRun[] = [
  {
    id: 'qcr-1',
    materialId: 'qcm-1',
    materialName: 'Sysmex Eightcheck-3N Normal',
    parameterCode: 'GB',
    level: 'LEVEL_2_NORMAL',
    value: 7.15,
    deviationSd: 0.14,
    status: 'ACCEPTED',
    runDate: '2026-10-14',
    technicianName: 'Awa Fatou Sow',
    biologistValidation: {
      validated: true,
      validatedBy: 'Dr. Mariama Ba-Diallo',
      validatedAt: '2026-10-14T08:15:00Z',
      comment: 'Contrôle conforme, série validée.'
    }
  },
  {
    id: 'qcr-2',
    materialId: 'qcm-2',
    materialName: 'Sysmex Eightcheck-3N Normal',
    parameterCode: 'HB',
    level: 'LEVEL_2_NORMAL',
    value: 13.6,
    deviationSd: 0.33,
    status: 'ACCEPTED',
    runDate: '2026-10-14',
    technicianName: 'Awa Fatou Sow',
    biologistValidation: {
      validated: true,
      validatedBy: 'Dr. Mariama Ba-Diallo',
      validatedAt: '2026-10-14T08:15:00Z',
      comment: 'Conforme.'
    }
  },
  {
    id: 'qcr-3',
    materialId: 'qcm-3',
    materialName: 'Roche Precinorm U',
    parameterCode: 'GLU',
    level: 'LEVEL_2_NORMAL',
    value: 1.03,
    deviationSd: 0.25,
    status: 'ACCEPTED',
    runDate: '2026-10-15',
    technicianName: 'Awa Fatou Sow',
    biologistValidation: {
      validated: true,
      validatedBy: 'Dr. Mariama Ba-Diallo',
      validatedAt: '2026-10-15T08:20:00Z',
      comment: 'Parfait.'
    }
  },
  {
    id: 'qcr-4',
    materialId: 'qcm-1',
    materialName: 'Sysmex Eightcheck-3N Normal',
    parameterCode: 'GB',
    level: 'LEVEL_2_NORMAL',
    value: 7.22,
    deviationSd: 0.34,
    status: 'ACCEPTED',
    runDate: '2026-10-16',
    technicianName: 'Awa Fatou Sow',
    biologistValidation: {
      validated: true,
      validatedBy: 'Dr. Mariama Ba-Diallo',
      validatedAt: '2026-10-16T08:10:00Z',
      comment: 'Série autorisée.'
    }
  },
  {
    id: 'qcr-5',
    materialId: 'qcm-3',
    materialName: 'Roche Precinorm U',
    parameterCode: 'GLU',
    level: 'LEVEL_2_NORMAL',
    value: 1.09,
    deviationSd: 1.75,
    status: 'WARNING_1_2S',
    violatedRule: '1_2s',
    runDate: '2026-10-16',
    technicianName: 'Awa Fatou Sow',
    biologistValidation: {
      validated: true,
      validatedBy: 'Dr. Mariama Ba-Diallo',
      validatedAt: '2026-10-16T08:25:00Z',
      comment: 'Avertissement 1-2s (déviation +1.75 SD). Série acceptée sous surveillance.'
    }
  }
];

class DatabaseService {
  private load<T>(table: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + table);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(`Error reading ${table} from localStorage`, e);
    }
    return fallback;
  }

  private save<T>(table: string, data: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + table, JSON.stringify(data));
    } catch (e) {
      console.warn(`Error writing ${table} to localStorage`, e);
    }
  }

  // Numbering system: PAT-2026-000001, ORD-2026-000001, etc.
  public generateNextNumber(prefix: string): string {
    const key = `counter_${prefix}`;
    const current = Number(localStorage.getItem(STORAGE_KEY_PREFIX + key) || '0') + 1;
    localStorage.setItem(STORAGE_KEY_PREFIX + key, current.toString());
    const year = new Date().getFullYear();
    const formattedNum = String(current).padStart(6, '0');
    return `${prefix}-${year}-${formattedNum}`;
  }

  // Table getters
  public getSettings(): LabSettings {
    return this.load<LabSettings>('settings', DEFAULT_SETTINGS);
  }
  public saveSettings(settings: LabSettings): void {
    this.save('settings', settings);
  }

  public getUsers(): User[] {
    const loaded = this.load<User[]>('users', INITIAL_USERS);
    const missing = INITIAL_USERS.filter(iu => !loaded.some(u => u.id === iu.id));
    if (missing.length > 0) {
      const merged = [...loaded, ...missing];
      this.save('users', merged);
      return merged;
    }
    return loaded;
  }
  public saveUsers(users: User[]): void {
    this.save('users', users);
  }

  public getDoctors(): Doctor[] {
    return this.load<Doctor[]>('doctors', INITIAL_DOCTORS);
  }
  public saveDoctors(doctors: Doctor[]): void {
    this.save('doctors', doctors);
  }

  public getPatients(): Patient[] {
    return this.load<Patient[]>('patients', INITIAL_PATIENTS);
  }
  public savePatients(patients: Patient[]): void {
    this.save('patients', patients);
  }

  public getTests(): MedicalTest[] {
    return this.load<MedicalTest[]>('tests', INITIAL_TESTS);
  }
  public saveTests(tests: MedicalTest[]): void {
    this.save('tests', tests);
  }

  public getTestGroups(): TestGroup[] {
    return this.load<TestGroup[]>('test_groups', INITIAL_TEST_GROUPS);
  }
  public saveTestGroups(groups: TestGroup[]): void {
    this.save('test_groups', groups);
  }

  public getOrders(): Order[] {
    return this.load<Order[]>('orders', INITIAL_ORDERS);
  }
  public saveOrders(orders: Order[]): void {
    this.save('orders', orders);
  }

  public getSamples(): Sample[] {
    return this.load<Sample[]>('samples', INITIAL_SAMPLES);
  }
  public saveSamples(samples: Sample[]): void {
    this.save('samples', samples);
  }

  public getResults(): TestResult[] {
    return this.load<TestResult[]>('results', INITIAL_RESULTS);
  }
  public saveResults(results: TestResult[]): void {
    this.save('results', results);
  }

  public getReports(): MedicalReport[] {
    return this.load<MedicalReport[]>('reports', INITIAL_REPORTS);
  }
  public saveReports(reports: MedicalReport[]): void {
    this.save('reports', reports);
  }

  public getInvoices(): Invoice[] {
    return this.load<Invoice[]>('invoices', INITIAL_INVOICES);
  }
  public saveInvoices(invoices: Invoice[]): void {
    this.save('invoices', invoices);
  }

  public getPayments(): Payment[] {
    return this.load<Payment[]>('payments', INITIAL_PAYMENTS);
  }
  public savePayments(payments: Payment[]): void {
    this.save('payments', payments);
  }

  public getContracts(): Contract[] {
    return this.load<Contract[]>('contracts', INITIAL_CONTRACTS);
  }
  public saveContracts(contracts: Contract[]): void {
    this.save('contracts', contracts);
  }

  public getExpenses(): Expense[] {
    return this.load<Expense[]>('expenses', INITIAL_EXPENSES);
  }
  public saveExpenses(expenses: Expense[]): void {
    this.save('expenses', expenses);
  }

  public getCultures(): Culture[] {
    return this.load<Culture[]>('cultures', INITIAL_CULTURES);
  }
  public saveCultures(cultures: Culture[]): void {
    this.save('cultures', cultures);
  }

  public getAntibiotics(): Antibiotic[] {
    return this.load<Antibiotic[]>('antibiotics', INITIAL_ANTIBIOTICS);
  }
  public saveAntibiotics(antibiotics: Antibiotic[]): void {
    this.save('antibiotics', antibiotics);
  }

  public getAntibiograms(): Antibiogram[] {
    return this.load<Antibiogram[]>('antibiograms', INITIAL_ANTIBIOGRAMS);
  }
  public saveAntibiograms(antibiograms: Antibiogram[]): void {
    this.save('antibiograms', antibiograms);
  }

  public getHomeVisits(): HomeVisit[] {
    return this.load<HomeVisit[]>('home_visits', INITIAL_HOME_VISITS);
  }
  public saveHomeVisits(visits: HomeVisit[]): void {
    this.save('home_visits', visits);
  }

  public getActivityLogs(): ActivityLog[] {
    return this.load<ActivityLog[]>('activity_logs', INITIAL_ACTIVITY_LOGS);
  }
  public addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep max 500 recent logs
    this.save('activity_logs', logs.slice(0, 500));
  }

  public getChatMessages(): ChatMessage[] {
    return this.load<ChatMessage[]>('chat_messages', INITIAL_CHAT_MESSAGES);
  }
  public saveChatMessages(msgs: ChatMessage[]): void {
    this.save('chat_messages', msgs);
  }

  public getWhatsAppTemplates(): WhatsAppTemplate[] {
    return this.load<WhatsAppTemplate[]>('whatsapp_templates', INITIAL_WHATSAPP_TEMPLATES);
  }
  public saveWhatsAppTemplates(templates: WhatsAppTemplate[]): void {
    this.save('whatsapp_templates', templates);
  }

  public getWhatsAppLogs(): WhatsAppLog[] {
    return this.load<WhatsAppLog[]>('whatsapp_logs', INITIAL_WHATSAPP_LOGS);
  }
  public saveWhatsAppLogs(logs: WhatsAppLog[]): void {
    this.save('whatsapp_logs', logs);
  }
  public addWhatsAppLog(log: Omit<WhatsAppLog, 'id' | 'timestamp'>): WhatsAppLog {
    const logs = this.getWhatsAppLogs();
    const newLog: WhatsAppLog = {
      ...log,
      id: 'wlog-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.save('whatsapp_logs', logs);
    return newLog;
  }

  public getNotifications(): AppNotification[] {
    return this.load<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
  }
  public saveNotifications(notifications: AppNotification[]): void {
    this.save('notifications', notifications);
  }

  // Suppliers
  public getSuppliers(): Supplier[] {
    return this.load<Supplier[]>('suppliers', INITIAL_SUPPLIERS);
  }
  public saveSuppliers(suppliers: Supplier[]): void {
    this.save('suppliers', suppliers);
  }
  public addSupplier(supplier: Omit<Supplier, 'id'>): Supplier {
    const suppliers = this.getSuppliers();
    const newSupplier: Supplier = {
      ...supplier,
      id: 'sup-' + (suppliers.length + 1)
    };
    suppliers.push(newSupplier);
    this.saveSuppliers(suppliers);
    return newSupplier;
  }

  // Reagents & Inventory
  public getReagents(): ReagentItem[] {
    return this.load<ReagentItem[]>('reagents', INITIAL_REAGENTS);
  }
  public saveReagents(reagents: ReagentItem[]): void {
    this.save('reagents', reagents);
  }
  public addReagent(item: Omit<ReagentItem, 'id' | 'status'>): ReagentItem {
    const reagents = this.getReagents();
    const status: StockStatus = item.currentQuantity <= 0 
      ? 'CRITICAL' 
      : item.currentQuantity <= item.minThreshold 
        ? 'LOW' 
        : 'OPTIMAL';
    const newReagent: ReagentItem = {
      ...item,
      id: 'rea-' + (reagents.length + 1),
      status
    };
    reagents.push(newReagent);
    this.saveReagents(reagents);
    return newReagent;
  }
  public updateReagent(id: string, updates: Partial<ReagentItem>): ReagentItem | null {
    const reagents = this.getReagents();
    const idx = reagents.findIndex(r => r.id === id);
    if (idx === -1) return null;
    const current = reagents[idx];
    const qty = updates.currentQuantity !== undefined ? updates.currentQuantity : current.currentQuantity;
    const min = updates.minThreshold !== undefined ? updates.minThreshold : current.minThreshold;
    const status: StockStatus = qty <= 0 ? 'CRITICAL' : qty <= min ? 'LOW' : 'OPTIMAL';
    reagents[idx] = { ...current, ...updates, currentQuantity: qty, status };
    this.saveReagents(reagents);
    return reagents[idx];
  }
  public adjustReagentStock(
    reagentId: string, 
    type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'EXPIRED_SCRAP', 
    deltaQuantity: number, 
    reason: string, 
    performedBy: string
  ): void {
    const reagents = this.getReagents();
    const reagent = reagents.find(r => r.id === reagentId);
    if (!reagent) return;

    let newQuantity = reagent.currentQuantity;
    if (type === 'ENTRY') {
      newQuantity += deltaQuantity;
    } else {
      newQuantity = Math.max(0, newQuantity - deltaQuantity);
    }
    this.updateReagent(reagentId, { currentQuantity: newQuantity, lastRestockedDate: type === 'ENTRY' ? new Date().toISOString().split('T')[0] : reagent.lastRestockedDate });

    // Record stock movement
    this.addStockMovement({
      reagentId,
      reagentName: reagent.name,
      type,
      quantity: deltaQuantity,
      reason,
      performedBy,
      lotNumber: reagent.lotNumber
    });
  }

  // Stock Movements
  public getStockMovements(): StockMovement[] {
    return this.load<StockMovement[]>('stock_movements', INITIAL_STOCK_MOVEMENTS);
  }
  public saveStockMovements(movements: StockMovement[]): void {
    this.save('stock_movements', movements);
  }
  public addStockMovement(mov: Omit<StockMovement, 'id' | 'timestamp'>): StockMovement {
    const movements = this.getStockMovements();
    const newMovement: StockMovement = {
      ...mov,
      id: 'mov-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    movements.unshift(newMovement);
    this.saveStockMovements(movements);
    return newMovement;
  }

  // Quality Control (CQI / Levey-Jennings)
  public getQcMaterials(): QcControlMaterial[] {
    return this.load<QcControlMaterial[]>('qc_materials', INITIAL_QC_MATERIALS);
  }
  public saveQcMaterials(materials: QcControlMaterial[]): void {
    this.save('qc_materials', materials);
  }
  public addQcMaterial(material: Omit<QcControlMaterial, 'id'>): QcControlMaterial {
    const materials = this.getQcMaterials();
    const newMaterial: QcControlMaterial = {
      ...material,
      id: 'qcm-' + (materials.length + 1)
    };
    materials.push(newMaterial);
    this.saveQcMaterials(materials);
    return newMaterial;
  }

  public getQcRuns(): QcRun[] {
    return this.load<QcRun[]>('qc_runs', INITIAL_QC_RUNS);
  }
  public saveQcRuns(runs: QcRun[]): void {
    this.save('qc_runs', runs);
  }
  public addQcRun(run: Omit<QcRun, 'id' | 'deviationSd' | 'status' | 'violatedRule'>): QcRun {
    const materials = this.getQcMaterials();
    const mat = materials.find(m => m.id === run.materialId);
    const runs = this.getQcRuns();

    let deviationSd = 0;
    let status: QcRun['status'] = 'ACCEPTED';
    let violatedRule: QcRun['violatedRule'] = undefined;

    if (mat && mat.standardDeviation > 0) {
      deviationSd = parseFloat(((run.value - mat.targetMean) / mat.standardDeviation).toFixed(2));
      const absSd = Math.abs(deviationSd);

      if (absSd > 3) {
        status = 'REJECTED_WESTGARD';
        violatedRule = '1_3s';
      } else if (absSd > 2) {
        status = 'WARNING_1_2S';
        violatedRule = '1_2s';
      } else {
        status = 'ACCEPTED';
      }
    }

    const newRun: QcRun = {
      ...run,
      id: 'qcr-' + Date.now(),
      deviationSd,
      status,
      violatedRule
    };
    runs.unshift(newRun);
    this.saveQcRuns(runs);
    return newRun;
  }

  public validateQcRun(id: string, biologistName: string, comment?: string): void {
    const runs = this.getQcRuns();
    const idx = runs.findIndex(r => r.id === id);
    if (idx !== -1) {
      runs[idx].biologistValidation = {
        validated: true,
        validatedBy: biologistName,
        validatedAt: new Date().toISOString(),
        comment: comment || 'Validation biologique conforme.'
      };
      this.saveQcRuns(runs);
    }
  }

  // Reset to initial demo database
  public resetToDemo(): void {
    localStorage.clear();
    // Re-initialize
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveUsers(INITIAL_USERS);
    this.saveDoctors(INITIAL_DOCTORS);
    this.savePatients(INITIAL_PATIENTS);
    this.saveTests(INITIAL_TESTS);
    this.saveTestGroups(INITIAL_TEST_GROUPS);
    this.saveOrders(INITIAL_ORDERS);
    this.saveSamples(INITIAL_SAMPLES);
    this.saveResults(INITIAL_RESULTS);
    this.saveReports(INITIAL_REPORTS);
    this.saveInvoices(INITIAL_INVOICES);
    this.savePayments(INITIAL_PAYMENTS);
    this.saveExpenses(INITIAL_EXPENSES);
    this.saveCultures(INITIAL_CULTURES);
    this.saveAntibiotics(INITIAL_ANTIBIOTICS);
    this.saveAntibiograms(INITIAL_ANTIBIOGRAMS);
    this.saveHomeVisits(INITIAL_HOME_VISITS);
    this.saveChatMessages(INITIAL_CHAT_MESSAGES);
    this.saveWhatsAppTemplates(INITIAL_WHATSAPP_TEMPLATES);
    this.saveWhatsAppLogs(INITIAL_WHATSAPP_LOGS);
    this.save('activity_logs', INITIAL_ACTIVITY_LOGS);
    this.saveNotifications(INITIAL_NOTIFICATIONS);
    this.saveSuppliers(INITIAL_SUPPLIERS);
    this.saveReagents(INITIAL_REAGENTS);
    this.saveStockMovements(INITIAL_STOCK_MOVEMENTS);
    this.saveQcMaterials(INITIAL_QC_MATERIALS);
    this.saveQcRuns(INITIAL_QC_RUNS);
  }
}

export const dbService = new DatabaseService();
