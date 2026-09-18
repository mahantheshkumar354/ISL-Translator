import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import type { ToastMessage } from '@/types';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: FiCheckCircle,
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    progress: 'bg-emerald-500',
  },
  error: {
    icon: FiAlertCircle,
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    progress: 'bg-red-500',
  },
  warning: {
    icon: FiAlertTriangle,
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    progress: 'bg-amber-500',
  },
  info: {
    icon: FiInfo,
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    progress: 'bg-blue-500',
  },
};

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed top-20 right-4 z-[110] flex flex-col gap-3 w-full max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`relative overflow-hidden glass-card ${config.bg} border ${config.border} p-4 pr-10`}
            >
              <div className="flex items-start gap-3">
                <Icon className={config.text} size={20} />
                <p className="text-sm text-white/90">{toast.message}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemove(toast.id)}
                className="absolute top-3 right-3 p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <FiX size={14} className="text-white/50" />
              </motion.button>

              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${config.progress} origin-left`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
