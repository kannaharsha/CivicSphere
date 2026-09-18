import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, LogOut, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  type?: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDark?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  type = 'warning',
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDark = true,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl z-10 border ${
              isDark
                ? 'bg-slate-900/95 border-emerald-500/20 text-white'
                : 'bg-white border-amber-500/20 text-slate-900'
            }`}
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-white/10 text-white/60'
                  : 'hover:bg-slate-100 text-slate-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon & Title */}
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl flex-shrink-0 ${
                  type === 'danger'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : type === 'warning'
                    ? isDark
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                    : isDark
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {type === 'danger' ? (
                  <LogOut className="w-6 h-6" />
                ) : type === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p
                  className={`mt-1.5 text-sm leading-relaxed ${
                    isDark ? 'text-white/60' : 'text-slate-600'
                  }`}
                >
                  {description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-white/80'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-lg transition-all flex items-center gap-2 ${
                  type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                    : type === 'warning'
                    ? isDark
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                      : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                    : isDark
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                }`}
              >
                {isLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
