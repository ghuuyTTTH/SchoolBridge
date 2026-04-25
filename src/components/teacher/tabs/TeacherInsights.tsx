/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Timer
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/utils';

const TeacherInsights: React.FC = () => {
  const { moodLogs, helpRequests, pomodoroSessions, users, addMessage, currentUser, showToast } = useApp();

  const linkedStudents = useMemo(() => users.filter(u => u.role === 'student'), [users]);

  const classPulse = useMemo(() => {
    const todayStart = new Date().setHours(0,0,0,0);
    const todayMoods = moodLogs.filter(l => l.timestamp >= todayStart);
    
    if (todayMoods.length === 0) return null;

    const counts = todayMoods.reduce((acc, curr) => {
      acc[curr.mood] = (acc[curr.mood] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const dominantMood = Object.entries(counts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    const percentage = Math.round((todayMoods.length / linkedStudents.length) * 100);

    const getSummary = (mood: string) => {
      switch(parseInt(mood)) {
        case 1: return "The class is feeling quite stressed today. Consider a light activity.";
        case 2: return "Energy seems a bit low. A short check-in might help build momentum.";
        case 3: return "Mostly steady and focused! Keep the current pace.";
        case 4: return "High spirits today! Perfect for tackling new challenges.";
        default: return "Energy is varied today.";
      }
    };

    return {
      dominantEmoji: parseInt(dominantMood) === 1 ? '😫' : parseInt(dominantMood) === 2 ? '😞' : parseInt(dominantMood) === 3 ? '😐' : '😊',
      percentage,
      summary: getSummary(dominantMood)
    };
  }, [moodLogs, linkedStudents]);

  const engagement = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weekHelp = helpRequests.filter(r => r.createdAt >= weekStart.getTime());
    const weekPomodoros = pomodoroSessions.filter(s => s.timestamp >= weekStart.getTime());

    return {
      helpCount: weekHelp.length,
      pomodoroCount: weekPomodoros.length,
      participatingStudents: new Set([
        ...weekHelp.map(r => r.studentId),
        ...weekPomodoros.map(s => s.userId)
      ]).size
    };
  }, [helpRequests, pomodoroSessions]);

  const handleSendClassEncouragement = () => {
    linkedStudents.forEach(student => {
      addMessage({
        fromId: currentUser!.id,
        toId: student.id,
        body: "Hey class! You've been working hard this week. Let's keep that momentum going! Remember I'm here if you need a hand."
      });
    });
    showToast('Encouragement sent to all students!', 'success');
  };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">CLASS INSIGHTS</h2>
        <p className="text-xs text-slate-500 font-medium font-serif italic">Understand the collective energy and engagement of your class.</p>
      </section>

      {/* emotional Pulse */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full -translate-y-20 translate-x-20 opacity-50" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Heart size={16} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Emotional Pulse</h3>
          </div>

          {classPulse ? (
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative h-32 w-32 flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="56" className="stroke-slate-100" strokeWidth="4" fill="none" />
                    <motion.circle 
                      cx="64" cy="64" r="56" className="stroke-indigo-600" strokeWidth="4" fill="none" 
                      strokeDasharray={2 * Math.PI * 56}
                      animate={{ strokeDashoffset: (2 * Math.PI * 56) * (1 - classPulse.percentage / 100) }}
                      strokeLinecap="round"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl mb-1">{classPulse.dominantEmoji}</span>
                    <span className="text-[10px] font-black text-indigo-600 font-mono tracking-widest leading-none">{classPulse.percentage}%</span>
                 </div>
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-lg font-bold text-slate-800 leading-tight tracking-tight">
                  {classPulse.summary}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <AlertCircle size={10} />
                  Based on {moodLogs.length} entries
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center bg-slate-50 border border-slate-200 rounded-xl border-dashed">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                 No check-ins today
               </p>
            </div>
          )}
        </div>
      </section>

      {/* Engagement metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center border border-slate-100">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase tracking-widest">Active Engagement</h3>
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-amber-500 shadow-sm border border-slate-100">
                      <HelpCircle size={14} />
                   </div>
                   <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Help Requests</span>
                </div>
                <span className="text-base font-bold text-slate-900 font-mono">{engagement.helpCount} <span className="text-[9px] text-slate-400 font-sans uppercase">WK</span></span>
             </div>
 
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                      <Timer size={14} />
                   </div>
                   <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Focus Sessions</span>
                </div>
                <span className="text-base font-bold text-slate-900 font-mono">{engagement.pomodoroCount} <span className="text-[9px] text-slate-400 font-sans uppercase">WK</span></span>
             </div>
 
             <div className="flex items-center gap-2 pt-4 justify-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  {engagement.participatingStudents} Students participating
                </p>
             </div>
          </div>
        </section>

        <section className="bg-indigo-600 p-8 rounded-2xl text-white shadow-xl shadow-indigo-100 flex flex-col justify-between border border-indigo-700">
           <div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                 <MessageSquare size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 tracking-tight uppercase">Bulk Motivation</h3>
              <p className="text-indigo-100 text-[11px] leading-relaxed mb-8 font-medium italic opacity-80">
                Send a quick note of encouragement to the entire class.
              </p>
           </div>
           
           <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSendClassEncouragement}
            className="w-full py-4 bg-white text-indigo-600 rounded-xl font-bold transition-all hover:bg-slate-50 active:scale-95 shadow-sm text-xs uppercase tracking-widest"
           >
              Send Encouragement
           </motion.button>
        </section>
      </div>
    </div>
  );
};

export default TeacherInsights;
