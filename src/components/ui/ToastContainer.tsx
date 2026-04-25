/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-sm px-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className={cn(
              "p-4 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-sm",
              toast.type === 'success' && "bg-emerald-500/95 text-white shadow-emerald-200",
              toast.type === 'info' && "bg-indigo-600/95 text-white shadow-indigo-200",
              toast.type === 'warning' && "bg-amber-400/95 text-slate-900 shadow-amber-100"
            )}
          >
            {toast.type === 'success' && <CheckCircle2 size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            {toast.type === 'warning' && <AlertCircle size={20} />}
            <span className="font-semibold text-sm">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
