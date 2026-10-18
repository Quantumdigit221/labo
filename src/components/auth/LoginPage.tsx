import React, { useState } from 'react';
import { FlaskConical, Lock, Mail, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';

export const LoginPage: React.FC = () => {
  const { login, usersList } = useAuth();
  const { settings } = useData();

  const [email, setEmail] = useState('biologiste@extremelab.sn');
  const [password, setPassword] = useState('••••••••••••');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usersList.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || usersList[0];
    login(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center space-y-2">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/25 mx-auto">
          <FlaskConical className="h-8 w-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          EXTREMELAB <span className="text-blue-400">NEXT</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Gestion intelligente de votre laboratoire d'analyses médicales
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Adresse Email Professionnelle
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="nom@extremelab.sn"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Mot de Passe
                </label>
                <a
                  href="#forgot"
                  onClick={e => {
                    e.preventDefault();
                    alert('Pour réinitialiser votre mot de passe, contactez l\'administrateur système.');
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>SE CONNECTER</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Fast Switcher for Demo / Evaluation */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5 text-center">
              Accès Rapide par Rôle (Mode Démonstration) :
            </span>
            <div className="grid grid-cols-2 gap-2">
              {usersList.slice(0, 4).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => login(u)}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500 text-left text-xs transition-all"
                >
                  <p className="font-semibold text-white truncate text-[11px]">{u.name}</p>
                  <p className="text-[10px] text-blue-400 font-medium truncate">{u.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-6">
          {settings.name} • Version 2026.4 Next
        </p>
      </div>
    </div>
  );
};
