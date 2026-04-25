/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Layout } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TeacherSetupProps {
  onComplete: () => void;
}

const TeacherSetup: React.FC<TeacherSetupProps> = ({ onComplete }) => {
  const [className, setClassName] = useState('');
  const { createClass, showToast } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    const newClass = createClass(className.trim());
    if (newClass) {
      showToast(`Class "${className}" created!`, 'success');
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-900/10 border border-indigo-100"
      >
        <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto mb-8 border border-indigo-100/50 shadow-sm">
          <Layout size={32} strokeWidth={2.5} />
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-4">Set up your class</h2>
          <p className="text-sm font-medium text-slate-400 font-serif italic leading-relaxed">
            Create your first workspace to start connecting with your students.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              CLASS NAME
            </label>
            <input
              autoFocus
              placeholder="e.g. Year 10 Advanced Science"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-bold text-slate-900"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={!className.trim()}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
          >
            Create Class
            <Plus size={18} strokeWidth={3} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default TeacherSetup;
