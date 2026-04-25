/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinClassModal: React.FC<JoinClassModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { joinClass, classes, classJoinRequests, currentUser } = useApp();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalCode = code.join('');
    if (finalCode.length !== 6) return;
    
    // Logic check
    const targetClass = classes.find(c => c.classCode === finalCode && !c.isArchived);
    if (!targetClass) {
      setError("We couldn't find that code. Double-check with your teacher.");
      return;
    }

    if (targetClass.studentIds.includes(currentUser?.id || '')) {
      setError("You're already in this class.");
      return;
    }

    joinClass(finalCode);
    
    // Check if it was instant or pending
    const updatedClass = classes.find(c => c.id === targetClass.id);
    const hasRequest = classJoinRequests.some(r => r.classId === targetClass.id && r.studentId === currentUser?.id && r.status === 'pending');
    
    if (hasRequest || updatedClass?.studentIds.includes(currentUser?.id || '')) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setCode(['', '', '', '', '', '']);
        }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100"
      >
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-black text-slate-900 leading-none uppercase tracking-tight">Join a Class</h2>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
              <X size={20} />
           </button>
        </div>

        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10 leading-relaxed">
          Ask your teacher for their 6-character class code.
        </p>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-10 space-y-4"
          >
             <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm">
                <CheckCircle2 size={32} />
             </div>
             <p className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">Success!</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex justify-between gap-2">
              {code.map((char, index) => (
                <input
                  key={index}
                  ref={el => inputs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={char}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className={cn(
                    "w-12 h-14 border-1.5 rounded-xl font-mono text-xl font-bold text-center outline-none transition-all",
                    char ? "border-indigo-600 bg-indigo-50/30 text-indigo-700" : "border-slate-200 bg-slate-50 text-slate-400",
                    "focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
                  )}
                />
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.1, repeat: 3, repeatType: 'reverse' } }}
                  className="text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center leading-relaxed"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              disabled={code.join('').length !== 6}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 disabled:opacity-30 transition-all active:scale-95 text-xs uppercase tracking-widest"
            >
              Join Class
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default JoinClassModal;
