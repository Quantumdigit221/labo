import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Patient,
  Doctor,
  MedicalTest,
  TestParameter,
  TestCategory,
  TestGroup,
  Order,
  Sample,
  TestResult,
  MedicalReport,
  Invoice,
  Payment,
  PaymentMethod,
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
  LabSettings,
  AppNotification,
  OrderItem,
  ResultValue,
  Supplier,
  ReagentItem,
  StockMovement,
  QcControlMaterial,
  QcRun
} from '../types/index.ts';
import { dbService } from '../services/database.ts';
import { useAuth } from './AuthContext.tsx';
import QRCode from 'qrcode';

export interface CreateBillingFirstParams {
  patientId: string;
  doctorId?: string;
  testIds: string[];
  groupIds?: string[];
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  discountAmount?: number;
  contractId?: string;
  notes?: string;
  initialPayment?: {
    amount: number;
    method: PaymentMethod;
    reference?: string;
  };
  validateImmediately?: boolean; // Facturation validée au comptoir (défaut true)
}

export interface CreateOrderParams {
  patientId: string;
  doctorId?: string;
  testIds: string[];
  groupIds?: string[];
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  discountAmount?: number;
  contractId?: string;
  notes?: string;
  initialPayment?: {
    amount: number;
    method: PaymentMethod;
    reference?: string;
  };
}

interface DataContextType {
  // Collections
  patients: Patient[];
  doctors: Doctor[];
  tests: MedicalTest[];
  testGroups: TestGroup[];
  orders: Order[];
  samples: Sample[];
  results: TestResult[];
  reports: MedicalReport[];
  invoices: Invoice[];
  payments: Payment[];
  contracts: Contract[];
  expenses: Expense[];
  cultures: Culture[];
  antibiotics: Antibiotic[];
  antibiograms: Antibiogram[];
  homeVisits: HomeVisit[];
  activityLogs: ActivityLog[];
  chatMessages: ChatMessage[];
  whatsappTemplates: WhatsAppTemplate[];
  whatsappLogs: WhatsAppLog[];
  settings: LabSettings;
  notifications: AppNotification[];
  suppliers: Supplier[];
  reagents: ReagentItem[];
  stockMovements: StockMovement[];
  qcMaterials: QcControlMaterial[];
  qcRuns: QcRun[];

  // Mutations
  addPatient: (patient: Omit<Patient, 'id' | 'patientNumber' | 'createdAt' | 'updatedAt' | 'active'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;

  addDoctor: (doc: Omit<Doctor, 'id' | 'doctorNumber' | 'createdAt' | 'active'>) => Doctor;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;

  addTest: (test: Omit<MedicalTest, 'id' | 'createdAt' | 'updatedAt' | 'active'>) => MedicalTest;
  updateTest: (id: string, updates: Partial<MedicalTest>) => void;
  deleteTest: (id: string) => void;
  addTestParameter: (testId: string, param: Omit<TestParameter, 'id' | 'testId' | 'displayOrder' | 'active'>) => TestParameter;
  updateTestParameter: (testId: string, parameterId: string, updates: Partial<TestParameter>) => void;
  deleteTestParameter: (testId: string, parameterId: string) => void;

  createBillingFirstWorkflow: (params: CreateBillingFirstParams) => Promise<{ invoice: Invoice; order?: Order; sample?: Sample }>;
  createOrderWithWorkflow: (params: CreateOrderParams) => Promise<{ order: Order; invoice: Invoice; sample: Sample }>;
  validateExistingInvoiceAndCreateOrder: (invoiceId: string, initialPayment?: { amount: number; method: PaymentMethod; reference?: string }) => Promise<Order | null>;
  acknowledgeOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  updateSampleStatus: (sampleId: string, status: Sample['status'], rejectionReason?: string) => void;

  saveResultValues: (resultId: string, values: ResultValue[]) => void;
  emergencyPartialValidateResult: (resultId: string, comment?: string) => Promise<MedicalReport | null>;
  validateResult: (resultId: string, comment?: string) => Promise<MedicalReport | null>;

  addPayment: (params: { invoiceId: string; amount: number; method: Payment['method']; reference?: string; notes?: string }) => Payment;
  cancelPayment: (paymentId: string, reason: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt' | 'createdBy'>) => Expense;

  addCulture: (culture: Omit<Culture, 'id' | 'createdAt' | 'status'>) => Culture;
  updateCulture: (id: string, updates: Partial<Culture>) => void;

  addAntibiogram: (anti: Omit<Antibiogram, 'id' | 'createdAt'>) => Antibiogram;
  updateAntibiogram: (id: string, updates: Partial<Antibiogram>) => void;

  addHomeVisit: (visit: Omit<HomeVisit, 'id' | 'createdAt'>) => HomeVisit;
  updateHomeVisit: (id: string, updates: Partial<HomeVisit>) => void;

  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  addReagent: (item: Omit<ReagentItem, 'id' | 'status'>) => ReagentItem;
  updateReagent: (id: string, updates: Partial<ReagentItem>) => void;
  adjustReagentStock: (reagentId: string, type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'EXPIRED_SCRAP', deltaQuantity: number, reason: string, performedBy: string) => void;

  addQcMaterial: (material: Omit<QcControlMaterial, 'id'>) => QcControlMaterial;
  addQcRun: (run: Omit<QcRun, 'id' | 'deviationSd' | 'status' | 'violatedRule'>) => QcRun;
  validateQcRun: (id: string, comment?: string) => void;

  sendChatMessage: (message: string, recipientId?: string) => void;
  saveSettings: (settings: LabSettings) => void;
  updateWhatsAppTemplate: (id: string, content: string) => void;
  markNotificationAsRead: (id: string) => void;
  resetAllDemoData: () => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [tests, setTests] = useState<MedicalTest[]>([]);
  const [testGroups, setTestGroups] = useState<TestGroup[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [antibiotics, setAntibiotics] = useState<Antibiotic[]>([]);
  const [antibiograms, setAntibiograms] = useState<Antibiogram[]>([]);
  const [homeVisits, setHomeVisits] = useState<HomeVisit[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>([]);
  const [settings, setSettings] = useState<LabSettings>(dbService.getSettings());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [reagents, setReagents] = useState<ReagentItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [qcMaterials, setQcMaterials] = useState<QcControlMaterial[]>([]);
  const [qcRuns, setQcRuns] = useState<QcRun[]>([]);

  const refreshData = () => {
    setPatients(dbService.getPatients());
    setDoctors(dbService.getDoctors());
    setTests(dbService.getTests());
    setTestGroups(dbService.getTestGroups());
    setOrders(dbService.getOrders());
    setSamples(dbService.getSamples());
    setResults(dbService.getResults());
    setReports(dbService.getReports());
    setInvoices(dbService.getInvoices());
    setPayments(dbService.getPayments());
    setContracts(dbService.getContracts());
    setExpenses(dbService.getExpenses());
    setCultures(dbService.getCultures());
    setAntibiotics(dbService.getAntibiotics());
    setAntibiograms(dbService.getAntibiograms());
    setHomeVisits(dbService.getHomeVisits());
    setActivityLogs(dbService.getActivityLogs());
    setChatMessages(dbService.getChatMessages());
    setWhatsappTemplates(dbService.getWhatsAppTemplates());
    setWhatsappLogs(dbService.getWhatsAppLogs());
    setSettings(dbService.getSettings());
    setNotifications(dbService.getNotifications());
    setSuppliers(dbService.getSuppliers());
    setReagents(dbService.getReagents());
    setStockMovements(dbService.getStockMovements());
    setQcMaterials(dbService.getQcMaterials());
    setQcRuns(dbService.getQcRuns());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addPatient = (patientData: Omit<Patient, 'id' | 'patientNumber' | 'createdAt' | 'updatedAt' | 'active'>): Patient => {
    const list = dbService.getPatients();
    const patientNumber = dbService.generateNextNumber('PAT');
    const newPatient: Patient = {
      ...patientData,
      id: 'pat-' + Date.now(),
      patientNumber,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newPatient);
    dbService.savePatients(list);
    setPatients([...list]);

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Système',
      userRole: currentUser?.role || 'RECEPTION',
      action: 'PATIENT_CREATED',
      module: 'PATIENTS',
      recordId: newPatient.id,
      recordIdentifier: `${newPatient.patientNumber} (${newPatient.firstName} ${newPatient.lastName})`,
      newValue: `Nouveau patient créé avec numéro ${patientNumber}`
    });

    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    const list = dbService.getPatients();
    const index = list.findIndex(p => p.id === id);
    if (index >= 0) {
      const old = list[index];
      list[index] = { ...old, ...updates, updatedAt: new Date().toISOString() };
      dbService.savePatients(list);
      setPatients([...list]);

      dbService.addActivityLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Système',
        userRole: currentUser?.role || 'RECEPTION',
        action: 'PATIENT_UPDATED',
        module: 'PATIENTS',
        recordId: id,
        recordIdentifier: `${old.patientNumber} (${old.firstName} ${old.lastName})`,
        oldValue: JSON.stringify(old),
        newValue: JSON.stringify(updates)
      });
    }
  };

  const deletePatient = (id: string) => {
    const list = dbService.getPatients().filter(p => p.id !== id);
    dbService.savePatients(list);
    setPatients(list);
  };

  const addDoctor = (docData: Omit<Doctor, 'id' | 'doctorNumber' | 'createdAt' | 'active'>): Doctor => {
    const list = dbService.getDoctors();
    const doctorNumber = dbService.generateNextNumber('DOC');
    const newDoc: Doctor = {
      ...docData,
      id: 'doc-' + Date.now(),
      doctorNumber,
      active: true,
      createdAt: new Date().toISOString()
    };
    list.unshift(newDoc);
    dbService.saveDoctors(list);
    setDoctors([...list]);

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Système',
      userRole: currentUser?.role || 'RECEPTION',
      action: 'DOCTOR_CREATED',
      module: 'DOCTORS',
      recordId: newDoc.id,
      recordIdentifier: `${newDoc.doctorNumber} (Dr. ${newDoc.firstName} ${newDoc.lastName})`,
      newValue: `Nouveau médecin référent ajouté`
    });

    return newDoc;
  };

  const updateDoctor = (id: string, updates: Partial<Doctor>) => {
    const list = dbService.getDoctors();
    const index = list.findIndex(d => d.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updates };
      dbService.saveDoctors(list);
      setDoctors([...list]);
    }
  };

  const addTest = (testData: Omit<MedicalTest, 'id' | 'createdAt' | 'updatedAt' | 'active'>): MedicalTest => {
    const list = dbService.getTests();
    const newTest: MedicalTest = {
      ...testData,
      id: 't-' + (testData.code ? testData.code.toLowerCase().replace(/[^a-z0-9]/g, '-') : Date.now()),
      active: true,
      parameters: testData.parameters || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newTest);
    dbService.saveTests(list);
    setTests([...list]);

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Biologiste',
      userRole: currentUser?.role || 'BIOLOGIST',
      action: 'TEST_CREATED',
      module: 'CATALOG',
      recordId: newTest.id,
      recordIdentifier: `${newTest.code} - ${newTest.name}`,
      newValue: `Nouvel examen ajouté au catalogue avec ${newTest.parameters.length} paramètre(s)`
    });

    return newTest;
  };

  const updateTest = (id: string, updates: Partial<MedicalTest>) => {
    const list = dbService.getTests();
    const index = list.findIndex(t => t.id === id);
    if (index >= 0) {
      list[index] = {
        ...list[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      dbService.saveTests(list);
      setTests([...list]);

      dbService.addActivityLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Biologiste',
        userRole: currentUser?.role || 'BIOLOGIST',
        action: 'TEST_UPDATED',
        module: 'CATALOG',
        recordId: id,
        recordIdentifier: list[index].code,
        newValue: `Examen ${list[index].name} mis à jour`
      });
    }
  };

  const deleteTest = (id: string) => {
    const list = dbService.getTests();
    const target = list.find(t => t.id === id);
    const filtered = list.filter(t => t.id !== id);
    dbService.saveTests(filtered);
    setTests([...filtered]);

    if (target) {
      dbService.addActivityLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Biologiste',
        userRole: currentUser?.role || 'BIOLOGIST',
        action: 'TEST_DELETED',
        module: 'CATALOG',
        recordId: id,
        recordIdentifier: target.code,
        newValue: `Examen ${target.name} supprimé du catalogue`
      });
    }
  };

  const addTestParameter = (testId: string, param: Omit<TestParameter, 'id' | 'testId' | 'displayOrder' | 'active'>): TestParameter => {
    const list = dbService.getTests();
    const testIndex = list.findIndex(t => t.id === testId);
    if (testIndex < 0) throw new Error('Examen introuvable.');

    const newParam: TestParameter = {
      ...param,
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      testId,
      displayOrder: (list[testIndex].parameters?.length || 0) + 1,
      active: true,
      options: param.options && param.options.length > 0
        ? param.options
        : (param.resultType === 'POSITIVE_NEGATIVE' ? ['Négatif', 'Positif'] : undefined)
    };

    list[testIndex].parameters = [...(list[testIndex].parameters || []), newParam];
    list[testIndex].updatedAt = new Date().toISOString();
    dbService.saveTests(list);
    setTests([...list]);

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Biologiste',
      userRole: currentUser?.role || 'BIOLOGIST',
      action: 'PARAMETER_CREATED',
      module: 'CATALOG',
      recordId: newParam.id,
      recordIdentifier: `${newParam.code} (${list[testIndex].name})`,
      newValue: `Paramètre ${newParam.name} ajouté à l'examen ${list[testIndex].name} (${newParam.resultType})`
    });

    return newParam;
  };

  const updateTestParameter = (testId: string, parameterId: string, updates: Partial<TestParameter>) => {
    const list = dbService.getTests();
    const testIndex = list.findIndex(t => t.id === testId);
    if (testIndex < 0) throw new Error('Examen introuvable.');

    const paramIndex = list[testIndex].parameters.findIndex(p => p.id === parameterId);
    if (paramIndex < 0) throw new Error('Paramètre introuvable.');

    list[testIndex].parameters[paramIndex] = {
      ...list[testIndex].parameters[paramIndex],
      ...updates
    };
    list[testIndex].updatedAt = new Date().toISOString();
    dbService.saveTests(list);
    setTests([...list]);

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Biologiste',
      userRole: currentUser?.role || 'BIOLOGIST',
      action: 'PARAMETER_UPDATED',
      module: 'CATALOG',
      recordId: parameterId,
      recordIdentifier: `${list[testIndex].parameters[paramIndex].code}`,
      newValue: `Paramètre ${list[testIndex].parameters[paramIndex].name} modifié`
    });
  };

  const deleteTestParameter = (testId: string, parameterId: string) => {
    const list = dbService.getTests();
    const testIndex = list.findIndex(t => t.id === testId);
    if (testIndex < 0) throw new Error('Examen introuvable.');

    const param = list[testIndex].parameters.find(p => p.id === parameterId);
    list[testIndex].parameters = list[testIndex].parameters.filter(p => p.id !== parameterId);
    list[testIndex].updatedAt = new Date().toISOString();
    dbService.saveTests(list);
    setTests([...list]);

    if (param) {
      dbService.addActivityLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Biologiste',
        userRole: currentUser?.role || 'BIOLOGIST',
        action: 'PARAMETER_DELETED',
        module: 'CATALOG',
        recordId: parameterId,
        recordIdentifier: param.code,
        newValue: `Paramètre ${param.name} supprimé de l'examen ${list[testIndex].name}`
      });
    }
  };

  /**
   * Complete end-to-end lab workflow starting with BILLING FIRST:
   * 1. Receptionist creates Invoice first
   * 2. Validated Invoice generates Order in WAITING_RECEIPT state
   * 3. Creates Sample (WAITING) and pending TestResults
   */
  const createBillingFirstWorkflow = async (params: CreateBillingFirstParams) => {
    const allTests = dbService.getTests();
    const patient = dbService.getPatients().find(p => p.id === params.patientId);
    if (!patient) throw new Error('Patient introuvable.');

    const doctor = params.doctorId ? dbService.getDoctors().find(d => d.id === params.doctorId) : undefined;
    const invoiceNumber = dbService.generateNextNumber('FAC');
    const orderNumber = dbService.generateNextNumber('ORD');
    const sampleNumber = dbService.generateNextNumber('SMP');

    // Resolve selected tests
    const selectedTestIds = Array.from(new Set(params.testIds));
    const items: OrderItem[] = selectedTestIds.map(testId => {
      const t = allTests.find(x => x.id === testId);
      return {
        id: 'oi-' + Math.random().toString(36).substring(2, 9),
        orderId: '',
        testId,
        testName: t?.name || 'Examen',
        category: t?.category || 'Biochimie',
        price: t?.price || 0,
        discount: 0,
        status: 'PENDING'
      };
    });

    const subtotal = items.reduce((acc, it) => acc + it.price, 0);
    const discount = params.discountAmount || 0;
    const total = Math.max(0, subtotal - discount);
    const initialPaid = params.initialPayment ? Math.min(params.initialPayment.amount, total) : 0;
    const balance = total - initialPaid;

    const isCoveredByContract = Boolean(params.contractId);
    const isPaid = balance === 0 || isCoveredByContract;
    const shouldValidateNow = params.validateImmediately !== false || isPaid;

    // 1. Create Invoice FIRST (Requirement 1: Le réceptionniste fait la facturation en premier)
    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber,
      orderId: '',
      orderNumber: '',
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientNumber: patient.patientNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      subtotal,
      discount,
      tax: 0,
      total,
      paidAmount: initialPaid,
      balance,
      status: balance === 0 ? 'PAID' : initialPaid > 0 ? 'PARTIAL' : isCoveredByContract ? 'PAID' : 'UNPAID',
      contractId: params.contractId,
      createdBy: currentUser?.name || 'Réceptionniste',
      createdAt: new Date().toISOString()
    };

    let newOrder: Order | undefined = undefined;
    let newSample: Sample | undefined = undefined;

    // 2. Facturation validée devient une demande d'examen
    if (shouldValidateNow) {
      newOrder = {
        id: 'ord-' + Date.now(),
        orderNumber,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientNumber: patient.patientNumber,
        doctorId: doctor?.id,
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : undefined,
        orderDate: new Date().toISOString(),
        priority: params.priority,
        status: 'WAITING_RECEIPT', // En attente de l'accusé de réception du technicien
        subtotal,
        discount,
        tax: 0,
        total,
        paidAmount: initialPaid,
        balance,
        contractId: params.contractId,
        notes: params.notes,
        createdBy: currentUser?.name || 'Réceptionniste',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: items.map(it => ({ ...it, orderId: 'ord-' + Date.now() })),
        invoiceId: newInvoice.id,
        invoiceNumber,
        invoiceValidated: true,
        isEmergency: params.priority === 'URGENT' || params.priority === 'STAT'
      };

      newInvoice.orderId = newOrder.id;
      newInvoice.orderNumber = orderNumber;

      // Save order
      const orderList = dbService.getOrders();
      orderList.unshift(newOrder);
      dbService.saveOrders(orderList);

      // Create Sample (Prélèvement)
      newSample = {
        id: 'smp-' + Date.now(),
        sampleNumber,
        orderId: newOrder.id,
        orderNumber,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        sampleType: selectedTestIds.some(id => id.includes('ecbu') || id.includes('urine')) ? 'Urines & Sang' : 'Sang total EDTA / Sec',
        container: 'Tube EDTA Violet / Tube Sec / Flacon',
        status: 'WAITING',
        createdAt: new Date().toISOString()
      };
      const sampleList = dbService.getSamples();
      sampleList.unshift(newSample);
      dbService.saveSamples(sampleList);

      // Create pending TestResults for technicians
      const resultsList = dbService.getResults();
      selectedTestIds.forEach(testId => {
        const t = allTests.find(x => x.id === testId);
        if (t) {
          const defaultValues: ResultValue[] = t.parameters.map(param => ({
            parameterId: param.id,
            parameterName: param.name,
            parameterCode: param.code,
            unit: param.unit,
            value: '',
            flag: 'NORMAL',
            referenceText: param.referenceText || `${param.referenceMin ?? '-'} - ${param.referenceMax ?? '-'}`
          }));

          const newResult: TestResult = {
            id: 'res-' + Math.random().toString(36).substring(2, 9),
            orderId: newOrder!.id,
            orderNumber,
            testId: t.id,
            testName: t.name,
            category: t.category,
            patientId: patient.id,
            patientName: `${patient.firstName} ${patient.lastName}`,
            sampleId: newSample!.id,
            sampleNumber,
            status: 'PENDING',
            values: defaultValues,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          resultsList.unshift(newResult);
        }
      });
      dbService.saveResults(resultsList);
    }

    // Save invoice
    const invoiceList = dbService.getInvoices();
    invoiceList.unshift(newInvoice);
    dbService.saveInvoices(invoiceList);

    // If payment recorded
    if (params.initialPayment && params.initialPayment.amount > 0) {
      const paymentNumber = dbService.generateNextNumber('PAY');
      const newPayment: Payment = {
        id: 'pay-' + Date.now(),
        paymentNumber,
        invoiceId: newInvoice.id,
        invoiceNumber,
        orderId: newOrder?.id || '',
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        amount: params.initialPayment.amount,
        method: params.initialPayment.method,
        reference: params.initialPayment.reference,
        paymentDate: new Date().toISOString(),
        receivedBy: currentUser?.name || 'Réceptionniste',
        status: 'VALID',
        createdAt: new Date().toISOString()
      };
      const payList = dbService.getPayments();
      payList.unshift(newPayment);
      dbService.savePayments(payList);
    }

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Réception',
      userRole: currentUser?.role || 'RECEPTION',
      action: 'BILLING_FIRST_CREATED',
      module: 'INVOICES',
      recordId: newInvoice.id,
      recordIdentifier: invoiceNumber,
      newValue: `Facturation ${invoiceNumber} enregistrée en premier pour ${patient.firstName} ${patient.lastName}.${newOrder ? ` Demande ${newOrder.orderNumber} générée (En attente d'accusé de réception technicien).` : ''}`
    });

    refreshData();
    return { invoice: newInvoice, order: newOrder, sample: newSample };
  };

  const createOrderWithWorkflow = async (params: CreateOrderParams) => {
    // Forward to billing-first flow with immediate validation
    const res = await createBillingFirstWorkflow({
      ...params,
      validateImmediately: true
    });
    return {
      order: res.order!,
      invoice: res.invoice,
      sample: res.sample!
    };
  };

  const validateExistingInvoiceAndCreateOrder = async (
    invoiceId: string,
    initialPayment?: { amount: number; method: PaymentMethod; reference?: string }
  ): Promise<Order | null> => {
    const invoiceList = dbService.getInvoices();
    const invoice = invoiceList.find(i => i.id === invoiceId);
    if (!invoice) return null;

    if (initialPayment && initialPayment.amount > 0) {
      invoice.paidAmount = Math.min(invoice.total, invoice.paidAmount + initialPayment.amount);
      invoice.balance = Math.max(0, invoice.total - invoice.paidAmount);
      invoice.status = invoice.balance === 0 ? 'PAID' : 'PARTIAL';

      const paymentNumber = dbService.generateNextNumber('PAY');
      const newPay: Payment = {
        id: 'pay-' + Date.now(),
        paymentNumber,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        patientId: invoice.patientId,
        patientName: invoice.patientName,
        amount: initialPayment.amount,
        method: initialPayment.method,
        reference: initialPayment.reference,
        paymentDate: new Date().toISOString(),
        receivedBy: currentUser?.name || 'Réceptionniste',
        status: 'VALID',
        createdAt: new Date().toISOString()
      };
      const payList = dbService.getPayments();
      payList.unshift(newPay);
      dbService.savePayments(payList);
    } else {
      invoice.status = 'PAID';
    }

    const orderList = dbService.getOrders();
    let order = orderList.find(o => o.id === invoice.orderId || o.invoiceId === invoice.id);

    if (!order) {
      const patient = dbService.getPatients().find(p => p.id === invoice.patientId);
      if (!patient) return null;

      const orderNumber = dbService.generateNextNumber('ORD');
      const sampleNumber = dbService.generateNextNumber('SMP');
      const allTests = dbService.getTests();

      const defaultTest = allTests[0] || { id: 't-nfs', name: 'NFS', category: 'Hématologie', price: 8500 };

      order = {
        id: 'ord-' + Date.now(),
        orderNumber,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientNumber: patient.patientNumber,
        orderDate: new Date().toISOString(),
        priority: 'ROUTINE',
        status: 'WAITING_RECEIPT',
        subtotal: invoice.subtotal,
        discount: invoice.discount,
        tax: invoice.tax,
        total: invoice.total,
        paidAmount: invoice.paidAmount,
        balance: invoice.balance,
        contractId: invoice.contractId,
        createdBy: currentUser?.name || 'Réceptionniste',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceValidated: true,
        items: [
          {
            id: 'oi-' + Math.random().toString(36).substring(2, 9),
            orderId: 'ord-' + Date.now(),
            testId: defaultTest.id,
            testName: defaultTest.name,
            category: defaultTest.category as TestCategory,
            price: defaultTest.price,
            discount: 0,
            status: 'PENDING'
          }
        ]
      };

      orderList.unshift(order);
      dbService.saveOrders(orderList);

      const newSample: Sample = {
        id: 'smp-' + Date.now(),
        sampleNumber,
        orderId: order.id,
        orderNumber,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        sampleType: 'Sang veineux total / Tube EDTA / Sec',
        container: 'Tube EDTA Violet / Tube Sec Jaune',
        status: 'WAITING',
        createdAt: new Date().toISOString()
      };
      const sampleList = dbService.getSamples();
      sampleList.unshift(newSample);
      dbService.saveSamples(sampleList);

      const resList = dbService.getResults();
      resList.unshift({
        id: 'res-' + Math.random().toString(36).substring(2, 9),
        orderId: order.id,
        orderNumber,
        testId: defaultTest.id,
        testName: defaultTest.name,
        category: defaultTest.category as TestCategory,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        sampleId: newSample.id,
        sampleNumber,
        status: 'PENDING',
        values: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      dbService.saveResults(resList);

      invoice.orderId = order.id;
      invoice.orderNumber = order.orderNumber;
    } else {
      order.invoiceValidated = true;
      if (order.status === 'PENDING') {
        order.status = 'WAITING_RECEIPT';
      }
      dbService.saveOrders(orderList);
    }

    dbService.saveInvoices(invoiceList);
    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Réception',
      userRole: currentUser?.role || 'RECEPTION',
      action: 'INVOICE_VALIDATED_WORKFLOW',
      module: 'INVOICES',
      recordId: invoice.id,
      recordIdentifier: invoice.invoiceNumber,
      newValue: `Facture ${invoice.invoiceNumber} validée. Demande d'examen ${order.orderNumber} débloquée au laboratoire.`
    });

    refreshData();
    return order;
  };

  /**
   * Requirement 2: Le technicien accuse réception de la demande et commence le travail
   */
  const acknowledgeOrder = (orderId: string) => {
    const list = dbService.getOrders();
    const item = list.find(o => o.id === orderId);
    if (!item) return;

    item.status = 'IN_PROGRESS';
    item.acknowledgedBy = currentUser?.name || 'Technicien Supérieur de Labo';
    item.acknowledgedAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    dbService.saveOrders(list);
    setOrders([...list]);

    // Transition associated samples to RECEIVED
    const samplesList = dbService.getSamples();
    samplesList.forEach(s => {
      if (s.orderId === orderId && s.status === 'WAITING') {
        s.status = 'RECEIVED';
        s.receivedDate = new Date().toISOString();
        s.receivedBy = currentUser?.name || 'Technicien';
      }
    });
    dbService.saveSamples(samplesList);
    setSamples([...samplesList]);

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Technicien',
      userRole: currentUser?.role || 'TECHNICIAN',
      action: 'ORDER_ACKNOWLEDGED',
      module: 'ORDERS',
      recordId: orderId,
      recordIdentifier: item.orderNumber,
      newValue: `Accusé de réception effectué par le technicien ${item.acknowledgedBy}. Démarrage des analyses.`
    });

    refreshData();
  };

  const createOldOrderWorkflow = async (params: CreateOrderParams) => {
    const allTests = dbService.getTests();
    const patient = dbService.getPatients().find(p => p.id === params.patientId);
    if (!patient) throw new Error('Patient introuvable.');

    const doctor = params.doctorId ? dbService.getDoctors().find(d => d.id === params.doctorId) : undefined;
    const orderNumber = dbService.generateNextNumber('ORD');
    const invoiceNumber = dbService.generateNextNumber('FAC');
    const sampleNumber = dbService.generateNextNumber('SMP');

    // Resolve selected tests
    const selectedTestIds = Array.from(new Set(params.testIds));
    const items: OrderItem[] = selectedTestIds.map(testId => {
      const t = allTests.find(x => x.id === testId);
      return {
        id: 'oi-' + Math.random().toString(36).substring(2, 9),
        orderId: '',
        testId,
        testName: t?.name || 'Examen',
        category: t?.category || 'Biochimie',
        price: t?.price || 0,
        discount: 0,
        status: 'PENDING'
      };
    });

    const subtotal = items.reduce((acc, it) => acc + it.price, 0);
    const discount = params.discountAmount || 0;
    const total = Math.max(0, subtotal - discount);
    const initialPaid = params.initialPayment ? Math.min(params.initialPayment.amount, total) : 0;
    const balance = total - initialPaid;

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientNumber: patient.patientNumber,
      doctorId: doctor?.id,
      doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : undefined,
      orderDate: new Date().toISOString(),
      priority: params.priority,
      status: 'PENDING',
      subtotal,
      discount,
      tax: 0,
      total,
      paidAmount: initialPaid,
      balance,
      contractId: params.contractId,
      notes: params.notes,
      createdBy: currentUser?.name || 'Réception',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: items.map(it => ({ ...it, orderId: 'ord-' + Date.now() }))
    };

    // Save order
    const orderList = dbService.getOrders();
    orderList.unshift(newOrder);
    dbService.saveOrders(orderList);

    // Create Invoice
    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber,
      orderId: newOrder.id,
      orderNumber,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientNumber: patient.patientNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      subtotal,
      discount,
      tax: 0,
      total,
      paidAmount: initialPaid,
      balance,
      status: balance === 0 ? 'PAID' : initialPaid > 0 ? 'PARTIAL' : 'UNPAID',
      contractId: params.contractId,
      createdBy: currentUser?.name || 'Réception',
      createdAt: new Date().toISOString()
    };
    const invoiceList = dbService.getInvoices();
    invoiceList.unshift(newInvoice);
    dbService.saveInvoices(invoiceList);

    // Create Sample
    const newSample: Sample = {
      id: 'smp-' + Date.now(),
      sampleNumber,
      orderId: newOrder.id,
      orderNumber,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      sampleType: selectedTestIds.some(id => id.includes('ecbu') || id.includes('urine')) ? 'Urines & Sang' : 'Sang total EDTA / Sec',
      container: 'Tube EDTA Violet / Tube Sec / Flacon',
      status: 'WAITING',
      createdAt: new Date().toISOString()
    };
    const sampleList = dbService.getSamples();
    sampleList.unshift(newSample);
    dbService.saveSamples(sampleList);

    // Create pending TestResults for each test
    const resultsList = dbService.getResults();
    selectedTestIds.forEach(testId => {
      const t = allTests.find(x => x.id === testId);
      if (t) {
        const defaultValues: ResultValue[] = t.parameters.map(param => ({
          parameterId: param.id,
          parameterName: param.name,
          parameterCode: param.code,
          unit: param.unit,
          value: '',
          flag: 'NORMAL',
          referenceText: param.referenceText || `${param.referenceMin ?? '-'} - ${param.referenceMax ?? '-'}`
        }));

        const newResult: TestResult = {
          id: 'res-' + Math.random().toString(36).substring(2, 9),
          orderId: newOrder.id,
          orderNumber,
          testId: t.id,
          testName: t.name,
          category: t.category,
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          sampleId: newSample.id,
          sampleNumber,
          status: 'PENDING',
          values: defaultValues,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        resultsList.unshift(newResult);
      }
    });
    dbService.saveResults(resultsList);

    // If initial payment provided, record Payment
    if (params.initialPayment && params.initialPayment.amount > 0) {
      const paymentNumber = dbService.generateNextNumber('PAY');
      const newPayment: Payment = {
        id: 'pay-' + Date.now(),
        paymentNumber,
        invoiceId: newInvoice.id,
        invoiceNumber,
        orderId: newOrder.id,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        amount: initialPaid,
        method: params.initialPayment.method,
        reference: params.initialPayment.reference,
        paymentDate: new Date().toISOString(),
        receivedBy: currentUser?.name || 'Réception',
        status: 'VALID',
        createdAt: new Date().toISOString()
      };
      const paymentsList = dbService.getPayments();
      paymentsList.unshift(newPayment);
      dbService.savePayments(paymentsList);
    }

    // Add Audit Log
    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Système',
      userRole: currentUser?.role || 'RECEPTION',
      action: 'ORDER_WORKFLOW_CREATED',
      module: 'ORDERS',
      recordId: newOrder.id,
      recordIdentifier: orderNumber,
      newValue: `Demande ${orderNumber} créée pour ${patient.firstName} ${patient.lastName} (${items.length} examens, Total: ${total} FCFA). Facture ${invoiceNumber} et Prélèvement ${sampleNumber} générés.`
    });

    refreshData();
    return { order: newOrder, invoice: newInvoice, sample: newSample };
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const list = dbService.getOrders();
    const item = list.find(o => o.id === orderId);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      dbService.saveOrders(list);
      setOrders([...list]);
    }
  };

  const updateSampleStatus = (sampleId: string, status: Sample['status'], rejectionReason?: string) => {
    const list = dbService.getSamples();
    const item = list.find(s => s.id === sampleId);
    if (item) {
      const oldStatus = item.status;
      item.status = status;
      if (status === 'COLLECTED') {
        item.collectionDate = new Date().toISOString().split('T')[0];
        item.collectionTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        item.collectorName = currentUser?.name || 'Technicien';
      } else if (status === 'RECEIVED') {
        item.receivedDate = new Date().toISOString();
        item.receivedBy = currentUser?.name || 'Laboratoire';
      } else if (status === 'REJECTED') {
        item.rejectionReason = rejectionReason || 'Échantillon non conforme (hémolysé ou coagulé)';
      }
      dbService.saveSamples(list);
      setSamples([...list]);

      dbService.addActivityLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Système',
        userRole: currentUser?.role || 'TECHNICIAN',
        action: 'SAMPLE_STATUS_CHANGED',
        module: 'SAMPLES',
        recordId: sampleId,
        recordIdentifier: item.sampleNumber,
        oldValue: oldStatus,
        newValue: `${status}${rejectionReason ? ' (' + rejectionReason + ')' : ''}`
      });
    }
  };

  const saveResultValues = (resultId: string, values: ResultValue[]) => {
    const list = dbService.getResults();
    const item = list.find(r => r.id === resultId);
    if (item) {
      item.values = values;
      item.status = 'ENTERED';
      item.technicianId = currentUser?.id;
      item.technicianName = currentUser?.name || 'Technicien';
      item.updatedAt = new Date().toISOString();
      dbService.saveResults(list);
      setResults([...list]);

      dbService.addActivityLog({
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Système',
        userRole: currentUser?.role || 'TECHNICIAN',
        action: 'RESULT_VALUES_SAVED',
        module: 'RESULTS',
        recordId: resultId,
        recordIdentifier: `${item.testName} (${item.orderNumber})`,
        newValue: `Saisie de ${values.length} paramètres`
      });
    }
  };

  /**
   * Biologist Validation:
   * 1. Validates the TestResult
   * 2. Checks if all results for this order are validated
   * 3. If so, creates official MedicalReport with verification code & QR Code
   */
  const validateResult = async (resultId: string, comment?: string): Promise<MedicalReport | null> => {
    const list = dbService.getResults();
    const res = list.find(r => r.id === resultId);
    if (!res) return null;

    res.status = 'VALIDATED';
    res.validatedBy = currentUser?.name || 'Dr. Mariama Ba-Diallo';
    res.validatedAt = new Date().toISOString();
    res.validationComment = comment || 'Résultats contrôlés et validés conformes.';
    res.updatedAt = new Date().toISOString();
    dbService.saveResults(list);
    setResults([...list]);

    // Check if order can be marked COMPLETED and report generated
    const orderResults = list.filter(r => r.orderId === res.orderId);
    const allValidated = orderResults.every(r => r.status === 'VALIDATED');

    let createdReport: MedicalReport | null = null;

    if (allValidated) {
      const order = dbService.getOrders().find(o => o.id === res.orderId);
      const patient = order ? dbService.getPatients().find(p => p.id === order.patientId) : undefined;
      const reportsList = dbService.getReports();

      // Check if report already exists for this order
      let report = reportsList.find(rp => rp.orderId === res.orderId);
      if (report && order) {
        report.status = 'VALIDATED';
        report.isPartialEmergency = false;
        report.biologistValidatedBy = currentUser?.name || 'Dr. Mariama Ba-Diallo';
        report.biologistValidatedAt = new Date().toISOString();
        report.validatedBy = currentUser?.name || 'Dr. Mariama Ba-Diallo';
        report.validatedAt = new Date().toISOString();
        report.testIds = orderResults.map(r => r.testId);
        report.testNames = orderResults.map(r => r.testName);
        dbService.saveReports(reportsList);
        setReports([...reportsList]);

        updateOrderStatus(order.id, 'COMPLETED');
        createdReport = report;
      } else if (!report && order && patient) {
        const reportNumber = dbService.generateNextNumber('RPT');
        const verificationCode = 'XL-' + Math.floor(1000 + Math.random() * 9000);
        const publicUrl = `${window.location.origin}/verify/${reportNumber}`;

        // Generate QR code data URL
        let qrDataUrl = '';
        try {
          qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 180, margin: 1 });
        } catch (e) {
          console.warn('Could not generate QR code', e);
        }

        report = {
          id: 'rpt-' + Date.now(),
          reportNumber,
          orderId: order.id,
          orderNumber: order.orderNumber,
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientNumber: patient.patientNumber,
          patientDob: patient.dateOfBirth,
          patientGender: patient.gender,
          doctorName: order.doctorName,
          testIds: orderResults.map(r => r.testId),
          testNames: orderResults.map(r => r.testName),
          status: 'VALIDATED',
          isPartialEmergency: false,
          biologistValidatedBy: currentUser?.name || 'Dr. Mariama Ba-Diallo',
          biologistValidatedAt: new Date().toISOString(),
          validatedBy: currentUser?.name || 'Dr. Mariama Ba-Diallo',
          validatedAt: new Date().toISOString(),
          verificationCode,
          publicUrl,
          qrCodeUrl: qrDataUrl,
          sentViaWhatsApp: false,
          sentViaEmail: false,
          sentViaSms: false,
          createdAt: new Date().toISOString()
        };

        reportsList.unshift(report);
        dbService.saveReports(reportsList);
        setReports([...reportsList]);

        // Update order status to COMPLETED
        updateOrderStatus(order.id, 'COMPLETED');
        createdReport = report;
      }
    }

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Biologiste',
      userRole: currentUser?.role || 'BIOLOGIST',
      action: 'RESULT_VALIDATED',
      module: 'VALIDATION',
      recordId: resultId,
      recordIdentifier: `${res.testName} (${res.orderNumber})`,
      newValue: `Résultat validé définitivement par le biologiste ${res.validatedBy}`
    });

    return createdReport;
  };

  /**
   * Requirement 2 & Urgences :
   * "Mais en cas d'urgence le technicien pourra valider un rapport mais partiellement."
   */
  const emergencyPartialValidateResult = async (resultId: string, comment?: string): Promise<MedicalReport | null> => {
    const list = dbService.getResults();
    const res = list.find(r => r.id === resultId);
    if (!res) return null;

    res.status = 'PARTIALLY_VALIDATED';
    res.isEmergencyPartial = true;
    res.partialValidatedBy = currentUser?.name || 'Technicien Supérieur de Labo';
    res.partialValidatedAt = new Date().toISOString();
    res.validationComment = comment || 'Validation partielle d\'URGENCE par le technicien pour transmission rapide.';
    res.updatedAt = new Date().toISOString();
    dbService.saveResults(list);
    setResults([...list]);

    // Update order status to PARTIALLY_VALIDATED
    const orderList = dbService.getOrders();
    const order = orderList.find(o => o.id === res.orderId);
    if (order) {
      order.status = 'PARTIALLY_VALIDATED';
      order.isEmergency = true;
      order.hasPartialReport = true;
      order.updatedAt = new Date().toISOString();
      dbService.saveOrders(orderList);
      setOrders([...orderList]);
    }

    // Create or update MedicalReport as PARTIALLY_VALIDATED
    const patient = order ? dbService.getPatients().find(p => p.id === order.patientId) : undefined;
    const reportsList = dbService.getReports();
    let report = reportsList.find(rp => rp.orderId === res.orderId);

    const reportNumber = report ? report.reportNumber : dbService.generateNextNumber('RPT');
    const verificationCode = report ? report.verificationCode : 'XL-' + Math.floor(1000 + Math.random() * 9000);
    const publicUrl = `${window.location.origin}/verify/${reportNumber}`;

    let qrDataUrl = report?.qrCodeUrl || '';
    if (!qrDataUrl) {
      try {
        qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 180, margin: 1 });
      } catch (e) {
        console.warn('Could not generate QR code', e);
      }
    }

    if (report) {
      report.status = 'PARTIALLY_VALIDATED';
      report.isPartialEmergency = true;
      report.partialValidatedBy = currentUser?.name || 'Technicien Supérieur de Labo';
      report.partialValidatedAt = new Date().toISOString();
      report.validatedBy = `${currentUser?.name || 'Technicien'} (Validation Partielle d'Urgence)`;
      report.validatedAt = new Date().toISOString();
    } else if (order && patient) {
      report = {
        id: 'rpt-' + Date.now(),
        reportNumber,
        orderId: order.id,
        orderNumber: order.orderNumber,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientNumber: patient.patientNumber,
        patientDob: patient.dateOfBirth,
        patientGender: patient.gender,
        doctorName: order.doctorName,
        testIds: [res.testId],
        testNames: [res.testName],
        status: 'PARTIALLY_VALIDATED',
        isPartialEmergency: true,
        partialValidatedBy: currentUser?.name || 'Technicien Supérieur de Labo',
        partialValidatedAt: new Date().toISOString(),
        validatedBy: `${currentUser?.name || 'Technicien'} (Validation Partielle d'Urgence)`,
        validatedAt: new Date().toISOString(),
        verificationCode,
        publicUrl,
        qrCodeUrl: qrDataUrl,
        sentViaWhatsApp: false,
        sentViaEmail: false,
        sentViaSms: false,
        createdAt: new Date().toISOString()
      };
      reportsList.unshift(report);
    }

    if (report) {
      dbService.saveReports(reportsList);
      setReports([...reportsList]);
    }

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Technicien',
      userRole: currentUser?.role || 'TECHNICIAN',
      action: 'EMERGENCY_PARTIAL_VALIDATION',
      module: 'RESULTS',
      recordId: resultId,
      recordIdentifier: `${res.testName} (${res.orderNumber})`,
      newValue: `Validation partielle d'urgence effectuée par le technicien ${res.partialValidatedBy}. Rapport partiel prêt pour impression.`
    });

    refreshData();
    return report || null;
  };

  const addPayment = (params: {
    invoiceId: string;
    amount: number;
    method: Payment['method'];
    reference?: string;
    notes?: string;
  }): Payment => {
    const invoicesList = dbService.getInvoices();
    const invoice = invoicesList.find(i => i.id === params.invoiceId);
    if (!invoice) throw new Error('Facture introuvable.');

    const paymentNumber = dbService.generateNextNumber('PAY');
    const newPayment: Payment = {
      id: 'pay-' + Date.now(),
      paymentNumber,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.orderId,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      amount: params.amount,
      method: params.method,
      reference: params.reference,
      paymentDate: new Date().toISOString(),
      receivedBy: currentUser?.name || 'Caisse',
      notes: params.notes,
      status: 'VALID',
      createdAt: new Date().toISOString()
    };

    // Update invoice balance
    invoice.paidAmount += params.amount;
    invoice.balance = Math.max(0, invoice.total - invoice.paidAmount);
    invoice.status = invoice.balance <= 0 ? 'PAID' : 'PARTIAL';
    dbService.saveInvoices(invoicesList);
    setInvoices([...invoicesList]);

    // Update order balance
    const ordersList = dbService.getOrders();
    const order = ordersList.find(o => o.id === invoice.orderId);
    if (order) {
      order.paidAmount += params.amount;
      order.balance = Math.max(0, order.total - order.paidAmount);
      dbService.saveOrders(ordersList);
      setOrders([...ordersList]);
    }

    const paymentsList = dbService.getPayments();
    paymentsList.unshift(newPayment);
    dbService.savePayments(paymentsList);
    setPayments([...paymentsList]);

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Caisse',
      userRole: currentUser?.role || 'ACCOUNTANT',
      action: 'PAYMENT_RECORDED',
      module: 'PAYMENTS',
      recordId: newPayment.id,
      recordIdentifier: paymentNumber,
      newValue: `Paiement de ${params.amount} FCFA enregistré par ${params.method} pour facture ${invoice.invoiceNumber}`
    });

    return newPayment;
  };

  const cancelPayment = (paymentId: string, reason: string) => {
    const paymentsList = dbService.getPayments();
    const payment = paymentsList.find(p => p.id === paymentId);
    if (!payment || payment.status === 'CANCELLED') return;

    payment.status = 'CANCELLED';
    payment.cancelledAt = new Date().toISOString();
    payment.cancelReason = reason;
    payment.cancelledBy = currentUser?.name || 'Responsable Caisse';
    dbService.savePayments(paymentsList);
    setPayments([...paymentsList]);

    // Recalculate invoice
    const invoicesList = dbService.getInvoices();
    const invoice = invoicesList.find(i => i.id === payment.invoiceId);
    if (invoice) {
      invoice.paidAmount = Math.max(0, invoice.paidAmount - payment.amount);
      invoice.balance = Math.max(0, invoice.total - invoice.paidAmount);
      invoice.status = invoice.paidAmount === 0 ? 'UNPAID' : 'PARTIAL';
      dbService.saveInvoices(invoicesList);
      setInvoices([...invoicesList]);
    }

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Système',
      userRole: currentUser?.role || 'ACCOUNTANT',
      action: 'PAYMENT_CANCELLED',
      module: 'PAYMENTS',
      recordId: paymentId,
      recordIdentifier: payment.paymentNumber,
      newValue: `Annulation du paiement (${payment.amount} FCFA). Motif: ${reason}`
    });
  };

  const addExpense = (data: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt' | 'createdBy'>): Expense => {
    const list = dbService.getExpenses();
    const expenseNumber = dbService.generateNextNumber('EXP');
    const newExp: Expense = {
      ...data,
      id: 'exp-' + Date.now(),
      expenseNumber,
      createdBy: currentUser?.name || 'Comptabilité',
      createdAt: new Date().toISOString()
    };
    list.unshift(newExp);
    dbService.saveExpenses(list);
    setExpenses([...list]);

    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Comptabilité',
      userRole: currentUser?.role || 'ACCOUNTANT',
      action: 'EXPENSE_RECORDED',
      module: 'ACCOUNTING',
      recordId: newExp.id,
      recordIdentifier: expenseNumber,
      newValue: `Dépense de ${data.amount} FCFA (${data.description})`
    });

    return newExp;
  };

  const addCulture = (data: Omit<Culture, 'id' | 'createdAt' | 'status'>): Culture => {
    const list = dbService.getCultures();
    const newCulture: Culture = {
      ...data,
      id: 'cul-' + Date.now(),
      status: 'IN_INCUBATION',
      createdAt: new Date().toISOString()
    };
    list.unshift(newCulture);
    dbService.saveCultures(list);
    setCultures([...list]);
    return newCulture;
  };

  const updateCulture = (id: string, updates: Partial<Culture>) => {
    const list = dbService.getCultures();
    const index = list.findIndex(c => c.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updates };
      dbService.saveCultures(list);
      setCultures([...list]);
    }
  };

  const addAntibiogram = (data: Omit<Antibiogram, 'id' | 'createdAt'>): Antibiogram => {
    const list = dbService.getAntibiograms();
    const newAtb: Antibiogram = {
      ...data,
      id: 'atb-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newAtb);
    dbService.saveAntibiograms(list);
    setAntibiograms([...list]);
    return newAtb;
  };

  const updateAntibiogram = (id: string, updates: Partial<Antibiogram>) => {
    const list = dbService.getAntibiograms();
    const index = list.findIndex(a => a.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updates };
      dbService.saveAntibiograms(list);
      setAntibiograms([...list]);
    }
  };

  const addHomeVisit = (data: Omit<HomeVisit, 'id' | 'createdAt'>): HomeVisit => {
    const list = dbService.getHomeVisits();
    const newVisit: HomeVisit = {
      ...data,
      id: 'hv-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newVisit);
    dbService.saveHomeVisits(list);
    setHomeVisits([...list]);
    return newVisit;
  };

  const updateHomeVisit = (id: string, updates: Partial<HomeVisit>) => {
    const list = dbService.getHomeVisits();
    const index = list.findIndex(v => v.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updates };
      dbService.saveHomeVisits(list);
      setHomeVisits([...list]);
    }
  };

  const sendChatMessage = (message: string, recipientId?: string) => {
    if (!currentUser || !message.trim()) return;
    const list = dbService.getChatMessages();
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: currentUser.id,
      senderName: `${currentUser.name} (${currentUser.role})`,
      senderRole: currentUser.role,
      recipientId,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };
    list.push(newMsg);
    dbService.saveChatMessages(list);
    setChatMessages([...list]);
  };

  const saveSettings = (newSettings: LabSettings) => {
    dbService.saveSettings(newSettings);
    setSettings(newSettings);
    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Administrateur',
      userRole: currentUser?.role || 'SUPER_ADMIN',
      action: 'SETTINGS_UPDATED',
      module: 'SETTINGS',
      newValue: 'Mise à jour des coordonnées et paramètres du laboratoire'
    });
  };

  const updateWhatsAppTemplate = (id: string, content: string) => {
    const list = dbService.getWhatsAppTemplates();
    const tpl = list.find(t => t.id === id);
    if (tpl) {
      tpl.content = content;
      dbService.saveWhatsAppTemplates(list);
      setWhatsappTemplates([...list]);
    }
  };

  const markNotificationAsRead = (id: string) => {
    const list = dbService.getNotifications();
    const notif = list.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      dbService.saveNotifications(list);
      setNotifications([...list]);
    }
  };

  const resetAllDemoData = () => {
    dbService.resetToDemo();
    refreshData();
  };

  const addSupplier = (supData: Omit<Supplier, 'id'>) => {
    const created = dbService.addSupplier(supData);
    setSuppliers(dbService.getSuppliers());
    return created;
  };

  const addReagent = (itemData: Omit<ReagentItem, 'id' | 'status'>) => {
    const created = dbService.addReagent(itemData);
    setReagents(dbService.getReagents());
    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Technicien',
      userRole: currentUser?.role || 'TECHNICIAN',
      action: 'REAGENT_ADDED' as any,
      module: 'STOCK' as any,
      recordId: created.id,
      recordIdentifier: `${created.name} (Lot: ${created.lotNumber})`,
      newValue: `Enregistrement du réactif ${created.name} (${created.currentQuantity} ${created.unit})`
    });
    return created;
  };

  const updateReagent = (id: string, updates: Partial<ReagentItem>) => {
    dbService.updateReagent(id, updates);
    setReagents(dbService.getReagents());
  };

  const adjustReagentStock = (
    reagentId: string, 
    type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'EXPIRED_SCRAP', 
    deltaQuantity: number, 
    reason: string, 
    performedBy: string
  ) => {
    dbService.adjustReagentStock(reagentId, type, deltaQuantity, reason, performedBy);
    setReagents(dbService.getReagents());
    setStockMovements(dbService.getStockMovements());
    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || performedBy,
      userRole: currentUser?.role || 'TECHNICIAN',
      action: 'STOCK_MOVEMENT' as any,
      module: 'STOCK' as any,
      recordId: reagentId,
      newValue: `Mouvement de stock ${type} : ${deltaQuantity} unités - Motif: ${reason}`
    });
  };

  const addQcMaterial = (matData: Omit<QcControlMaterial, 'id'>) => {
    const created = dbService.addQcMaterial(matData);
    setQcMaterials(dbService.getQcMaterials());
    return created;
  };

  const addQcRun = (runData: Omit<QcRun, 'id' | 'deviationSd' | 'status' | 'violatedRule'>) => {
    const created = dbService.addQcRun(runData);
    setQcRuns(dbService.getQcRuns());
    if (created.status === 'REJECTED_WESTGARD') {
      const notifs = dbService.getNotifications();
      notifs.unshift({
        id: 'notif-' + Date.now(),
        title: 'Alerte CQI : Règle de Westgard violée',
        message: `Contrôle qualité ${created.materialName} (${created.parameterCode}) rejeté : valeur ${created.value} hors limites (> 3 SD).`,
        type: 'ERROR',
        read: false,
        timestamp: new Date().toISOString(),
        link: '/quality-control'
      });
      dbService.saveNotifications(notifs);
      setNotifications([...notifs]);
    }
    return created;
  };

  const validateQcRun = (id: string, comment?: string) => {
    dbService.validateQcRun(id, currentUser?.name || 'Dr. Mariama Ba-Diallo', comment);
    setQcRuns(dbService.getQcRuns());
    dbService.addActivityLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Biologiste',
      userRole: currentUser?.role || 'BIOLOGIST',
      action: 'QC_VALIDATED' as any,
      module: 'QUALITY_CONTROL' as any,
      recordId: id,
      newValue: `Validation biologique du CQI : ${comment || 'Conforme'}`
    });
  };

  return (
    <DataContext.Provider
      value={{
        patients,
        doctors,
        tests,
        testGroups,
        orders,
        samples,
        results,
        reports,
        invoices,
        payments,
        contracts,
        expenses,
        cultures,
        antibiotics,
        antibiograms,
        homeVisits,
        activityLogs,
        chatMessages,
        whatsappTemplates,
        whatsappLogs,
        settings,
        notifications,
        suppliers,
        reagents,
        stockMovements,
        qcMaterials,
        qcRuns,
        addPatient,
        updatePatient,
        deletePatient,
        addDoctor,
        updateDoctor,
        addTest,
        updateTest,
        deleteTest,
        addTestParameter,
        updateTestParameter,
        deleteTestParameter,
        createBillingFirstWorkflow,
        createOrderWithWorkflow,
        validateExistingInvoiceAndCreateOrder,
        acknowledgeOrder,
        updateOrderStatus,
        updateSampleStatus,
        saveResultValues,
        emergencyPartialValidateResult,
        validateResult,
        addPayment,
        cancelPayment,
        addExpense,
        addCulture,
        updateCulture,
        addAntibiogram,
        updateAntibiogram,
        addHomeVisit,
        updateHomeVisit,
        addSupplier,
        addReagent,
        updateReagent,
        adjustReagentStock,
        addQcMaterial,
        addQcRun,
        validateQcRun,
        sendChatMessage,
        saveSettings,
        updateWhatsAppTemplate,
        markNotificationAsRead,
        resetAllDemoData,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
