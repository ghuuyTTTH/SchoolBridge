/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Brain } from 'lucide-react';
import { cn } from '../../../lib/utils';
import PomodoroTimer from './study/PomodoroTimer';
import AITutor from './study/AITutor';

const StudentStudy: React.FC = () => {
  const [activeSubView, setActiveSubView] = useState<'pomodoro' | 'ai'>('pomodoro');

  return (
    <div className="space-y-8">
      {/* View Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-200 p-1.5 rounded-2xl flex gap-1">
          <button
            onClick={() => setActiveSubView('pomodoro')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all",
              activeSubView === 'pomodoro' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Timer size={18} />
            Pomodoro
          </button>
          <button
            onClick={() => setActiveSubView('ai')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all",
              activeSubView === 'ai' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Brain size={18} />
            AI Tutor
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubView === 'pomodoro' ? <PomodoroTimer /> : <AITutor />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StudentStudy;
