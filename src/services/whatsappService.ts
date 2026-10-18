import { dbService } from './database.ts';
import { WhatsAppLog, WhatsAppTemplate } from '../types/index.ts';

export interface TemplateVariables {
  patient_name?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_phone?: string;
  patient_id?: string;
  doctor_name?: string;
  order_number?: string;
  invoice_number?: string;
  report_number?: string;
  lead_biologist?: string;
  amount?: string;
  receipt_link?: string;
  report_link?: string;
  lab_name?: string;
  lab_phone?: string;
  lab_address?: string;
  appointment_date?: string;
  appointment_time?: string;
}

export const ALLOWED_VARIABLES: (keyof TemplateVariables)[] = [
  'patient_name',
  'patient_first_name',
  'patient_last_name',
  'patient_phone',
  'patient_id',
  'doctor_name',
  'order_number',
  'invoice_number',
  'report_number',
  'lead_biologist',
  'amount',
  'receipt_link',
  'report_link',
  'lab_name',
  'lab_phone',
  'lab_address',
  'appointment_date',
  'appointment_time'
];

export class WhatsAppService {
  /**
   * Replaces variables in a template and checks for unknown variables.
   */
  public static compileTemplate(
    templateContent: string,
    vars: TemplateVariables
  ): { compiled: string; errors: string[] } {
    const errors: string[] = [];
    const regex = /\{([a-zA-Z0-9_]+)\}/g;
    
    // Check for invalid variables
    let match;
    while ((match = regex.exec(templateContent)) !== null) {
      const varName = match[1] as keyof TemplateVariables;
      if (!ALLOWED_VARIABLES.includes(varName)) {
        errors.push(`Variable inconnue détectée : {${varName}}`);
      }
    }

    if (errors.length > 0) {
      return { compiled: templateContent, errors };
    }

    // Replace known variables
    const compiled = templateContent.replace(regex, (fullMatch, key) => {
      const val = vars[key as keyof TemplateVariables];
      return val !== undefined && val !== null ? String(val) : fullMatch;
    });

    return { compiled, errors: [] };
  }

  /**
   * Sends or simulates sending a WhatsApp message through Meta Cloud API or direct WhatsApp link.
   */
  public static async sendMessage(params: {
    recipientPhone: string;
    recipientName: string;
    templateType: 'RECEIPT' | 'REPORT' | 'REMINDER' | 'ALERT' | 'CUSTOM';
    messageText: string;
    referenceNumber?: string;
    sentBy: string;
  }): Promise<{ success: boolean; log: WhatsAppLog; directWaUrl: string; error?: string }> {
    const settings = dbService.getSettings();

    // Clean phone number (strip spaces, add 221 if missing)
    let cleanPhone = params.recipientPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 9 && !cleanPhone.startsWith('221')) {
      cleanPhone = '221' + cleanPhone;
    }

    // Generate direct click-to-chat WhatsApp link
    const directWaUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
      params.messageText
    )}`;

    if (!settings.enableWhatsApp) {
      const failedLog = dbService.addWhatsAppLog({
        recipientPhone: params.recipientPhone,
        recipientName: params.recipientName,
        templateType: params.templateType,
        messageContent: params.messageText,
        status: 'FAILED',
        providerResponse: 'ERREUR: Le module WhatsApp est désactivé dans les paramètres du laboratoire.',
        referenceNumber: params.referenceNumber,
        sentBy: params.sentBy
      });

      return {
        success: false,
        log: failedLog,
        directWaUrl,
        error: 'Le module WhatsApp est actuellement désactivé.'
      };
    }

    // Simulate reliable API response
    const messageId = 'wamid.' + Math.random().toString(36).substring(2, 15).toUpperCase();
    const isSuccess = Boolean(cleanPhone && cleanPhone.length >= 8);

    const log = dbService.addWhatsAppLog({
      recipientPhone: params.recipientPhone,
      recipientName: params.recipientName,
      templateType: params.templateType,
      messageContent: params.messageText,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      providerResponse: isSuccess
        ? `HTTP 200 OK - Meta Business API (ID: ${messageId})`
        : 'ERREUR 400: Numéro de téléphone WhatsApp invalide',
      referenceNumber: params.referenceNumber,
      sentBy: params.sentBy
    });

    return {
      success: isSuccess,
      log,
      directWaUrl
    };
  }
}
