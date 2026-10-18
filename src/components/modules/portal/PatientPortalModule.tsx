import React, { useState } from 'react';
import {
  User,
  FileText,
  Receipt,
  Calendar,
  Lock,
  Unlock,
  Download,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Send,
  FlaskConical
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { Patient, MedicalReport, Invoice } from '../../../types/index.ts';
import { formatDate, formatCurrency } from '../../../services/i18n.ts';

export const PatientPortalModule: React.FC = () => {
  const { patients, reports, invoices, payments, settings, addHomeVisit } = useData();

  // Patient session state
  const [patientInput, setPatientInput] = useState('PAT-2026-000001');
  const [dobInput, setDobInput] = useState('1984-06-15');
  const [authenticatedPatient, setAuthenticatedPatient] = useState<Patient | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'INVOICES' | 'APPOINTMENT'>('REPORTS');

  // Appointment / Home visit form state
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [appointmentAddress, setAppointmentAddress] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = patientInput.trim().toUpperCase();
    const matched = patients.find(
      p =>
        (p.patientNumber.toUpperCase() === cleanId || p.phone.replace(/[^0-9]/g, '').includes(cleanId.replace(/[^0-9]/g, ''))) &&
        p.dateOfBirth === dobInput.trim()
    );

    if (matched) {
      setAuthenticatedPatient(matched);
      setAppointmentAddress(matched.address + ', ' + matched.city);
      setErrorMsg('');
    } else {
      setErrorMsg('Numéro de patient ou date de naissance incorrecte. Veuillez vérifier votre reçu ou contacter le secrétariat.');
    }
  };

  const handleLogout = () => {
    setAuthenticatedPatient(null);
  };

  // Associated patient data
  const myReports = authenticatedPatient ? reports.filter(r => r.patientId === authenticatedPatient.id) : [];
  const myInvoices = authenticatedPatient ? invoices.filter(i => i.patientId === authenticatedPatient.id) : [];
  const myPayments = authenticatedPatient ? payments.filter(p => p.patientId === authenticatedPatient.id) : [];

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedPatient) return;

    addHomeVisit({
      patientId: authenticatedPatient.id,
      patientName: `${authenticatedPatient.firstName} ${authenticatedPatient.lastName}`,
      phone: authenticatedPatient.phone,
      address: appointmentAddress || authenticatedPatient.address,
      city: authenticatedPatient.city,
      visitDate: appointmentDate,
      visitTime: appointmentTime,
      phlebotomistName: 'Équipe Mobile Laboratoire',
      testNames: ['Bilan demandé par le patient'],
      travelFee: 5000,
      status: 'PLANIFIED'
    });

    setAppointmentSuccess(true);
    setTimeout(() => setAppointmentSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold mb-1">
            <User className="h-3.5 w-3.5" />
            Portail Web Patient Sécurisé
          </div>
          <h2 className="text-xl font-bold text-slate-800">Espace Personnel Patient</h2>
          <p className="text-xs text-slate-500">
            Consultation confidentielle des résultats, téléchargement des comptes-rendus et prise de rendez-vous
          </p>
        </div>
      </div>

      {!authenticatedPatient ? (
        /* Patient Login Card */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl max-w-md mx-auto space-y-5">
          <div className="text-center space-y-1">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Connexion à votre Espace Patient</h3>
            <p className="text-xs text-slate-500">
              Saisissez vos identifiants figurant sur votre reçu de laboratoire
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Numéro de Patient (PAT-...) ou Téléphone
              </label>
              <input
                type="text"
                required
                value={patientInput}
                onChange={e => setPatientInput(e.target.value)}
                placeholder="Ex: PAT-2026-000001"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-semibold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date de Naissance du Patient (Sécurité)
              </label>
              <input
                type="date"
                required
                value={dobInput}
                onChange={e => setDobInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Accéder à mes résultats</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Demo quick credential helper */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 block">Identifiants Démo disponibles :</span>
            <p>• Patient : <strong>PAT-2026-000001</strong> (Moussa Diallo) • Date : <strong>1984-06-15</strong></p>
            <p>• Patiente : <strong>PAT-2026-000002</strong> (Fatou Badiane) • Date : <strong>1992-11-03</strong></p>
          </div>
        </div>
      ) : (
        /* Authenticated Patient Dashboard */
        <div className="space-y-6">
          {/* Patient Header Welcome Bar */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs text-blue-200 font-mono">N° {authenticatedPatient.patientNumber}</span>
              <h3 className="text-xl font-bold">
                Bienvenue, {authenticatedPatient.firstName} {authenticatedPatient.lastName}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Né(e) le {formatDate(authenticatedPatient.dateOfBirth)} • {authenticatedPatient.city}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md transition-colors w-fit"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold max-w-md">
            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'REPORTS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mes Résultats ({myReports.length})
            </button>
            <button
              onClick={() => setActiveTab('INVOICES')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'INVOICES' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mes Factures ({myInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab('APPOINTMENT')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'APPOINTMENT' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prélèvement à Domicile
            </button>
          </div>

          {/* Tab 1: Reports */}
          {activeTab === 'REPORTS' && (
            <div className="space-y-3">
              {myReports.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
                  Aucun compte-rendu médical disponible pour le moment. Vos analyses sont peut-être en cours de traitement.
                </div>
              ) : (
                myReports.map(rp => (
                  <div
                    key={rp.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-blue-700">{rp.reportNumber}</span>
                        <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                          ✓ VALIDÉ BIOLOGISTE
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 mt-1">
                        Examens : {rp.testNames.join(', ')}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Délivré le {formatDate(rp.validatedAt)} par {rp.validatedBy}
                      </p>
                    </div>

                    <a
                      href={rp.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs w-fit"
                    >
                      <Download className="h-4 w-4" />
                      Consulter / Télécharger PDF
                    </a>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Invoices */}
          {activeTab === 'INVOICES' && (
            <div className="space-y-3">
              {myInvoices.map(inv => (
                <div
                  key={inv.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</span>
                    <p className="text-slate-500 text-[11px]">{formatDate(inv.invoiceDate)}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 text-sm block">{formatCurrency(inv.total)}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status === 'PAID' ? 'PAYÉ INTÉGRALEMENT' : 'ACOMPTE / RESTE DÛ'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Request Home Phlebotomy Visit */}
          {activeTab === 'APPOINTMENT' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 max-w-lg">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Demande de Prélèvement à Domicile</h3>
                <p className="text-xs text-slate-500">
                  Un infirmier préleveur se déplace chez vous à Dakar et banlieue
                </p>
              </div>

              {appointmentSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Votre demande a été planifiée. Notre équipe vous appellera pour confirmation.</span>
                </div>
              )}

              <form onSubmit={handleBookVisit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date souhaitée</label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={e => setAppointmentDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Heure préférée</label>
                    <input
                      type="time"
                      required
                      value={appointmentTime}
                      onChange={e => setAppointmentTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adresse de passage</label>
                  <input
                    type="text"
                    required
                    value={appointmentAddress}
                    onChange={e => setAppointmentAddress(e.target.value)}
                    placeholder="Quartier, Immeuble, Rue..."
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md"
                >
                  Envoyer la demande de rendez-vous
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
