/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Star, MoreVertical, X, TrendingUp } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/utils';

const StudentProgress: React.FC = () => {
  const { currentUser, updateUser, moodLogs } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  const subjects = currentUser?.subjects || [];

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    
    const updatedUser = {
      ...currentUser!,
      subjects: [
        ...subjects,
        { id: crypto.randomUUID(), name: newSubject.trim(), confidence: 3 }
      ]
    };
    updateUser(updatedUser);
    setNewSubject('');
    setIsAdding(false);
  };

  const updateConfidence = (id: string, confidence: number) => {
    const updatedUser = {
      ...currentUser!,
      subjects: subjects.map(s => s.id === id ? { ...s, confidence } : s)
    };
    updateUser(updatedUser);
  };

  const lastMoods = useMemo(() => {
    return moodLogs
      .filter(m => m.userId === currentUser?.id)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .reverse();
  }, [moodLogs, currentUser]);

  const moodColors = {
    1: 'bg-rose-400',
    2: 'bg-amber-400',
    3: 'bg-indigo-400',
    4: 'bg-emerald-400',
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">PROGRESS</h2>
        <p className="text-xs text-slate-500 font-medium">Keep going — consistency is key.</p>
      </section>

      {/* Mood History Mini Dots */}
      {lastMoods.length > 0 && (
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Wellbeing</h3>
          </div>
          <div className="flex items-center gap-2">
            {lastMoods.map((mood) => (
              <div 
                key={mood.id} 
                className={cn("w-2.5 h-2.5 rounded-full shadow-sm", moodColors[mood.mood as keyof typeof moodColors])} 
                title={new Date(mood.timestamp).toLocaleDateString()}
              />
            ))}
          </div>
        </section>
      )}

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {subjects.map((subject) => (
            <motion.div
              key={subject.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{subject.name}</h3>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase flex items-center gap-1 mt-0.5 tracking-wider">
                    <TrendingUp size={10} /> Active
                  </p>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest leading-none">Confidence</p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateConfidence(subject.id, star)}
                      className={cn(
                        "transition-all",
                        star <= subject.confidence ? "text-amber-400" : "text-slate-100 hover:text-amber-200"
                      )}
                    >
                      <Star size={20} fill={star <= subject.confidence ? "currentColor" : "none"} strokeWidth={2.5} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          layout
          onClick={() => setIsAdding(true)}
          className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-white transition-all group min-h-[120px]"
        >
          <Plus size={24} />
          <span className="font-bold text-xs uppercase tracking-widest">Add Subject</span>
        </motion.button>
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl relative border border-slate-100"
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">New subject</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">What course are you currently focusing on?</p>
              
              <form onSubmit={handleAddSubject} className="space-y-4">
                <input
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. Mathematics"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold transition-all hover:bg-indigo-700 active:scale-95 shadow-sm"
                >
                  Start tracking
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProgress;
