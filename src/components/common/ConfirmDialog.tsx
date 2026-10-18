import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal.tsx';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  requireReason?: boolean;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'primary',
  requireReason = false,
  reasonPlaceholder = 'Préciser le motif obligatoire...',
  onConfirm,
  onCancel
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('Veuillez indiquer un motif avant de continuer.');
      return;
    }
    setError('');
    onConfirm(reason.trim());
    setReason('');
  };

  const colors = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500'
  }[variant];

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {variant === 'danger' && (
            <div className="p-2 bg-rose-100 text-rose-600 rounded-full shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
          )}
          {variant === 'warning' && (
            <div className="p-2 bg-amber-100 text-amber-600 rounded-full shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
          )}
          {variant === 'success' && (
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          )}
          {variant === 'primary' && (
            <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          )}
          <p className="text-slate-600 leading-relaxed text-sm pt-1">{message}</p>
        </div>

        {requireReason && (
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motif de l'opération <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={reasonPlaceholder}
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-xs ${colors}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
