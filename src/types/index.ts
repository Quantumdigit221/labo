export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'BIOLOGIST'
  | 'TECHNICIAN'
  | 'RECEPTION'
  | 'ACCOUNTANT'
  | 'DOCTOR';

export type Permission =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'VALIDATE'
  | 'PRINT'
  | 'SEND'
  | 'EXPORT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  specialty?: string;
  avatar?: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
}

export type Gender = 'M' | 'F' | 'OTHER';

export interface Patient {
  id: string;
  patientNumber: string; // PAT-2026-000001
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string; // YYYY-MM-DD
  age?: number;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  city: string;
  country: string;
  emergencyContact?: string;
  notes?: string;
  bloodGroup?: string;
  nationalId?: string; // NIN / CNI / Passeport
  insuranceNumber?: string; // N° Affiliation IPM / Mutuelle
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  doctorNumber: string; // DOC-2026-000001
  firstName: string;
  lastName: string;
  specialty: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  facility: string; // Hôpital Principal, Clinique de la Madeleine, etc.
  address?: string;
  notes?: string;
  commissionRate?: number; // %
  active: boolean;
  createdAt: string;
}

export type TestCategory =
  | 'Hématologie'
  | 'Biochimie'
  | 'Immunologie'
  | 'Sérologie'
  | 'Microbiologie'
  | 'Parasitologie'
  | 'Hormonologie'
  | 'Bactériologie'
  | 'Virologie'
  | 'Autres';

export type ResultType = 'NUMERIC' | 'TEXT' | 'POSITIVE_NEGATIVE' | 'SELECT' | 'BOOLEAN';

export interface TestParameter {
  id: string;
  testId: string;
  code: string;
  name: string;
  unit: string;
  resultType: ResultType;
  referenceMin?: number;
  referenceMax?: number;
  referenceMaleMin?: number;
  referenceMaleMax?: number;
  referenceFemaleMin?: number;
  referenceFemaleMax?: number;
  referenceText?: string;
  criticalMin?: number;
  criticalMax?: number;
  options?: string[]; // for SELECT
  displayOrder: number;
  active: boolean;
}

export interface MedicalTest {
  id: string;
  code: string;
  name: string;
  category: TestCategory;
  description?: string;
  sampleType: string; // Sang total, Sérum, Plasma, Urine, Selles, LCR, Écouvillon
  container: string; // Tube EDTA (Violet), Tube Sec (Rouge), Tube Héparine (Vert), Tube Citrate (Bleu), Flacon stérile
  method: string; // Automate, ELISA, Microscopie, Coloration Gram, PCR
  turnaroundTime: string; // 2h, 4h, 24h, 48h
  price: number; // en FCFA
  active: boolean;
  parameters: TestParameter[];
  createdAt: string;
  updatedAt: string;
}

export interface TestGroup {
  id: string;
  code: string;
  name: string;
  description?: string;
  testIds: string[];
  discountedPrice?: number;
  active: boolean;
  createdAt: string;
}

export type OrderPriority = 'ROUTINE' | 'URGENT' | 'STAT';
export type OrderStatus =
  | 'WAITING_RECEIPT'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'PARTIALLY_VALIDATED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  testId: string;
  testName: string;
  category: TestCategory;
  price: number;
  discount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
}

export interface Order {
  id: string;
  orderNumber: string; // ORD-2026-000001
  patientId: string;
  patientName: string;
  patientNumber: string;
  doctorId?: string;
  doctorName?: string;
  orderDate: string;
  priority: OrderPriority;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  balance: number;
  contractId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceValidated?: boolean; // Facturation validée en premier
  acknowledgedBy?: string; // Technicien accusé de réception
  acknowledgedAt?: string;
  isEmergency?: boolean;
  hasPartialReport?: boolean;
}

export type SampleStatus = 'WAITING' | 'COLLECTED' | 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface Sample {
  id: string;
  sampleNumber: string; // SMP-2026-000001
  orderId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  sampleType: string;
  container: string;
  collectionDate?: string;
  collectionTime?: string;
  collectorName?: string;
  receivedDate?: string;
  receivedBy?: string;
  status: SampleStatus;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

export type ResultFlag = 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';

export interface ResultValue {
  parameterId: string;
  parameterName: string;
  parameterCode: string;
  unit: string;
  value: string;
  numericValue?: number;
  flag: ResultFlag;
  referenceText: string;
  comment?: string;
}

export interface TestResult {
  id: string;
  orderId: string;
  orderNumber: string;
  testId: string;
  testName: string;
  category: TestCategory;
  patientId: string;
  patientName: string;
  sampleId: string;
  sampleNumber: string;
  technicianName?: string;
  technicianId?: string;
  values: ResultValue[];
  status: 'PENDING' | 'ENTERED' | 'PARTIALLY_VALIDATED' | 'VALIDATED';
  validatedBy?: string;
  validatedAt?: string;
  validationComment?: string;
  partialValidatedBy?: string;
  partialValidatedAt?: string;
  isEmergencyPartial?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalReport {
  id: string;
  reportNumber: string; // RPT-2026-000001
  orderId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  patientDob: string;
  patientGender: Gender;
  doctorName?: string;
  testIds: string[];
  testNames: string[];
  status: 'DRAFT' | 'PARTIALLY_VALIDATED' | 'VALIDATED' | 'DELIVERED';
  validatedBy: string;
  validatedAt: string;
  isPartialEmergency?: boolean; // Rapport partiel d'urgence émis par le technicien
  partialValidatedBy?: string;
  partialValidatedAt?: string;
  biologistValidatedBy?: string;
  biologistValidatedAt?: string;
  signatureUrl?: string;
  qrCodeUrl?: string;
  verificationCode: string;
  publicUrl: string;
  sentViaWhatsApp: boolean;
  sentViaEmail: boolean;
  sentViaSms: boolean;
  createdAt: string;
}

export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  testId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // FAC-2026-000001
  orderId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  invoiceDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  contractId?: string;
  contractName?: string;
  createdBy: string;
  createdAt: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export type PaymentMethod = 'ESPECES' | 'WAVE' | 'ORANGE_MONEY' | 'CARTE_BANCAIRE' | 'VIREMENT' | 'CHEQUE' | 'AUTRE';

export interface Payment {
  id: string;
  paymentNumber: string; // PAY-2026-000001
  invoiceId: string;
  invoiceNumber: string;
  orderId: string;
  patientId: string;
  patientName: string;
  amount: number;
  method: PaymentMethod;
  reference?: string; // TransID Wave, code transaction OM, etc.
  paymentDate: string;
  receivedBy: string;
  notes?: string;
  status: 'VALID' | 'CANCELLED';
  cancelledAt?: string;
  cancelReason?: string;
  cancelledBy?: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  name: string;
  type: 'ASSURANCE' | 'IPM' | 'ENTREPRISE' | 'CLINIQUE' | 'HOPITAL' | 'PARTENAIRE';
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  startDate: string;
  endDate: string;
  discount: number; // %
  coveragePercentage: number; // % prise en charge
  paymentTerms: string; // 30 jours fin de mois
  creditLimit: number; // FCFA
  active: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  expenseNumber: string; // EXP-2026-000001
  category: 'REACTIFS' | 'CONSOMMABLES' | 'MAINTENANCE' | 'LOYER' | 'SALAIRES' | 'SERVICES' | 'AUTRES';
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  expenseDate: string;
  createdBy: string;
  notes?: string;
  createdAt: string;
}

export interface Culture {
  id: string;
  sampleId: string;
  sampleNumber: string;
  patientId: string;
  patientName: string;
  cultureType: string; // Urines (ECBU), Pus, Hémoculture, Coproculture, Gorge
  incubationDate: string;
  durationHours: number;
  result: 'POSITIVE' | 'NEGATIVE' | 'CONTAMINATED';
  organism?: string; // Escherichia coli, Staphylococcus aureus, Klebsiella pneumoniae, etc.
  colonyCount?: string; // > 10^5 UFC/mL
  comments?: string;
  status: 'IN_INCUBATION' | 'IDENTIFIED' | 'VALIDATED';
  validatedBy?: string;
  validatedAt?: string;
  createdAt: string;
}

export interface Antibiotic {
  id: string;
  code: string;
  name: string;
  family: string; // Bêta-lactamines, Céphalosporines, Aminosides, Fluoroquinolones, Macrolides
  dosage?: string;
  route?: string; // Orale, IV, IM
  active: boolean;
  createdAt: string;
}

export type AntibiogramSensitivity = 'S' | 'I' | 'R';

export interface AntibiogramResult {
  id: string;
  antibiogramId: string;
  antibioticId: string;
  antibioticName: string;
  family: string;
  result: AntibiogramSensitivity;
  mic?: string; // CMI ex: <= 0.5 mg/L
  comment?: string;
}

export interface Antibiogram {
  id: string;
  cultureId: string;
  sampleNumber: string;
  patientName: string;
  organism: string;
  method: 'DIFFUSION_DISQUES' | 'E_TEST' | 'AUTOMATE';
  comments?: string;
  results: AntibiogramResult[];
  status: 'DRAFT' | 'VALIDATED';
  validatedBy?: string;
  validatedAt?: string;
  createdAt: string;
}

export type HomeVisitStatus = 'PLANIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface HomeVisit {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  address: string;
  city: string;
  visitDate: string;
  visitTime: string;
  phlebotomistName?: string;
  testNames: string[];
  travelFee: number;
  notes?: string;
  status: HomeVisitStatus;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  recordId?: string;
  recordIdentifier?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId?: string; // null for general room
  message: string;
  attachmentUrl?: string;
  timestamp: string;
  read: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  code: string;
  name: string;
  type: 'RECEIPT' | 'REPORT' | 'REMINDER' | 'ALERT';
  content: string;
  active: boolean;
}

export interface WhatsAppLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  templateType: string;
  messageContent: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  providerResponse?: string;
  referenceNumber?: string;
  sentBy: string;
  timestamp: string;
}

export interface SmsLog {
  id: string;
  recipientPhone: string;
  messageContent: string;
  status: 'SUCCESS' | 'FAILED';
  timestamp: string;
}

export interface LabSettings {
  name: string;
  slogan: string;
  logoUrl?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  taxNumber: string; // NINEA / RCCM
  currency: string; // FCFA
  timezone: string; // Africa/Dakar
  leadBiologist: string;
  biologistTitle: string;
  signatureText: string;
  stampText: string;
  enableWhatsApp: boolean;
  whatsappProvider: string;
  whatsappApiUrl?: string;
  whatsappPhoneNumberId?: string;
  whatsappBusinessId?: string;
  hasWhatsAppToken: boolean; // Never expose raw token
  smsProvider?: string;
  enableSms: boolean;
  enableEmail: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSenderEmail?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  read: boolean;
  timestamp: string;
  link?: string;
}

// -------------------------------------------------------------
// REAGENTS & INVENTORY MANAGEMENT (STOCKS & CONSOMMABLES)
// -------------------------------------------------------------
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  deliveryTimeDays: number;
  active: boolean;
}

export type StockStatus = 'OPTIMAL' | 'LOW' | 'CRITICAL' | 'EXPIRED';

export interface ReagentItem {
  id: string;
  code: string;
  name: string;
  category: 'HÉMATOLOGIE' | 'BIOCHIMIE' | 'MICROBIOLOGIE' | 'CONSOMMABLES' | 'TUBES & AIGUILLES';
  supplierId?: string;
  supplierName?: string;
  lotNumber: string;
  expirationDate: string; // YYYY-MM-DD
  storageTemperature: '+2°C à +8°C' | '-20°C' | 'Température Ambiante (+15 à +25°C)';
  currentQuantity: number;
  unit: 'Kits' | 'Flacons' | 'Tubes' | 'Boîtes' | 'Embouts' | 'Cartouches';
  minThreshold: number; // Alert threshold
  idealStock: number;
  costPerUnit: number; // FCFA
  testsPerUnit?: number; // e.g. 500 tests per kit
  status: StockStatus;
  lastRestockedDate?: string;
}

export interface StockMovement {
  id: string;
  reagentId: string;
  reagentName: string;
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'EXPIRED_SCRAP';
  quantity: number;
  reason: string;
  performedBy: string;
  timestamp: string;
  lotNumber: string;
}

// -------------------------------------------------------------
// QUALITY CONTROL (CONTRÔLE QUALITÉ INTERNE - CQI / WESTGARD)
// -------------------------------------------------------------
export interface QcControlMaterial {
  id: string;
  name: string; // e.g. Eightcheck 3N Normal, Precinorm U
  lotNumber: string;
  manufacturer: string;
  expirationDate: string;
  parameterCode: string; // e.g. 'GB', 'HB', 'GLU', 'CREAT'
  parameterName: string;
  unit: string;
  level: 'LEVEL_1_LOW' | 'LEVEL_2_NORMAL' | 'LEVEL_3_HIGH';
  targetMean: number; // Target average value (µ)
  standardDeviation: number; // SD (σ)
  active: boolean;
}

export interface QcRun {
  id: string;
  materialId: string;
  materialName: string;
  parameterCode: string;
  level: 'LEVEL_1_LOW' | 'LEVEL_2_NORMAL' | 'LEVEL_3_HIGH';
  value: number;
  deviationSd: number; // Calculated (value - targetMean) / standardDeviation
  status: 'ACCEPTED' | 'WARNING_1_2S' | 'REJECTED_WESTGARD';
  violatedRule?: '1_2s' | '1_3s' | '2_2s' | 'R_4s' | '4_1s' | '10_x';
  runDate: string; // YYYY-MM-DD
  technicianName: string;
  biologistValidation?: {
    validated: boolean;
    validatedBy: string;
    validatedAt: string;
    comment?: string;
  };
}
