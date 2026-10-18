import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  ShieldCheck,
  Paperclip
} from 'lucide-react';
import { useData } from '../../../context/DataContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { formatDateTime } from '../../../services/i18n.ts';

export const ChatModule: React.FC = () => {
  const { chatMessages, sendChatMessage } = useData();
  const { currentUser } = useAuth();
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Messagerie Interne du Laboratoire</h2>
          <p className="text-xs text-slate-500">
            Canal de communication en temps réel entre l'accueil, les techniciens et le biologiste
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden flex flex-col h-[650px]">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
              LAB
            </div>
            <div>
              <h3 className="font-bold text-sm">Canal Général Équipe Technique</h3>
              <p className="text-[11px] text-blue-200">
                Connecté en tant que : <strong>{currentUser?.name}</strong> ({currentUser?.role})
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold">
            EN LIGNE
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {chatMessages.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-12">Aucun message pour l'instant.</p>
          ) : (
            chatMessages.map(msg => {
              const isMine = msg.senderId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-1 px-1">
                    {msg.senderName} • {formatDateTime(msg.timestamp)}
                  </span>
                  <div
                    className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Écrivez un message à l'équipe du laboratoire..."
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Send className="h-4 w-4" />
            <span>Envoyer</span>
          </button>
        </form>
      </div>
    </div>
  );
};
