import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface FaciloopToastProps {
  message: string | null;
  type?: 'error' | 'success' | 'info';
  onClose?: () => void;
  autoCloseDuration?: number;
}

export const FaciloopToast: React.FC<FaciloopToastProps> = ({
  message,
  type = 'error',
  onClose,
  autoCloseDuration = 4000
}) => {
  useEffect(() => {
    if (!message || !onClose || autoCloseDuration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);
    return () => clearTimeout(timer);
  }, [message, onClose, autoCloseDuration]);

  return (
    <AnimatePresence>
      {message && (
        <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`pointer-events-auto w-full max-w-md shadow-2xl p-3.5 px-4 rounded-2xl flex items-center justify-between text-white font-bold text-xs sm:text-sm select-none ${
              type === 'success'
                ? 'bg-emerald-500 shadow-emerald-500/30'
                : 'bg-gradient-faciloop shadow-rose-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 font-extrabold text-xs">
                {type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="leading-snug">{message}</span>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0 ml-2"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
