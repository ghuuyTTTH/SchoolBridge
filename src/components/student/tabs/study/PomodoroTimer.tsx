/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, CheckCircle2, History, Target, Trophy } from 'lucide-react';
import { useApp } from '../../../../context/AppContext';
import { cn } from '../../../../lib/utils';

const PomodoroTimer: React.FC = () => {
  const { addPomodoroSession, pomodoroSessions, currentUser } = useApp();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [task, setTask] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = isBreak ? 5 * 60 : 25 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    if (!isBreak) {
      addPomodoroSession({
        userId: currentUser!.id,
        duration: 25,
        task: task || 'Focus session'
      });
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
    setIsBreak(!isBreak);
    setTimeLeft(isBreak ? 25 * 60 : 5 * 60);
    setTask('');
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const userHistory = pomodoroSessions
    .filter(s => s.userId === currentUser?.id)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Timer Circle */}
      <div className="relative w-64 h-64">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            className="stroke-slate-100"
            strokeWidth="4"
            fill="transparent"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            className={cn("transition-colors duration-500", isBreak ? "stroke-emerald-400" : "stroke-indigo-600")}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 120}
            animate={{ strokeDashoffset: (2 * Math.PI * 120) * (1 - progress / 100) }}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
            {isBreak ? 'BREAK' : 'FOCUS'}
          </p>
          <h2 className="text-5xl font-bold text-slate-900 font-mono tracking-tighter">
            {formatTime(timeLeft)}
          </h2>
          {isActive && (
             <motion.div
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-4 w-1 h-1 bg-indigo-600 rounded-full"
            />
          )}
        </div>
      </div>

      {/* Task Input */}
      {!isBreak && !isActive && timeLeft === 25*60 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs space-y-1"
        >
          <div className="flex items-center gap-2 text-slate-400 ml-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest">CURRENT FOCUS</span>
          </div>
          <input
            type="text"
            placeholder="What's your goal?"
            className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm"
            value={task}
            onChange={e => setTask(e.target.value)}
          />
        </motion.div>
      )}

      {isActive && !isBreak && task && (
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 text-[11px] font-bold uppercase tracking-wider">
           <Target size={12} />
           {task}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-8">
        <button
          onClick={resetTimer}
          className="p-3 text-slate-300 hover:text-slate-500 transition-colors"
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimer}
          className={cn(
            "w-20 h-20 rounded-full shadow-lg transition-all flex items-center justify-center",
            isActive ? "bg-white text-slate-600 border border-slate-200" : "bg-indigo-600 text-white shadow-indigo-100"
          )}
        >
          {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </motion.button>
        
        <div className="w-[44px]" /> {/* Spacer for symmetry */}
      </div>

      {/* History */}
      <div className="w-full max-w-sm mt-4">
        <div className="flex items-center gap-2 mb-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">History</h3>
        </div>
        {userHistory.length > 0 ? (
          <div className="space-y-2">
            {userHistory.map((s) => (
              <div key={s.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-800 tracking-tight">{s.task}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                    {s.duration} mins • {new Date(s.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <CheckCircle2 size={12} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No sessions yet</p>
          </div>
        )}
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 text-center flex flex-col items-center gap-6 max-w-sm"
            >
              <div className="w-16 h-16 bg-amber-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
                <Trophy size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">FOCUS COMPLETE</h2>
                <p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">+20 XP EARNED</p>
              </div>
              <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                Great work! Take a few minutes to stretch and recharge.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PomodoroTimer;
