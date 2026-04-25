/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  ArrowRight, 
  Play, 
  Brain, 
  MessageCircle, 
  Calendar,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Users
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/utils';
import JoinClassModal from '../JoinClassModal';

interface StudentHomeProps {
  onNavigate: (tab: string) => void;
}

const StudentHome: React.FC<StudentHomeProps> = ({ onNavigate }) => {
  const { currentUser, moodLogs, addMoodLog, studyPlans, classes, classJoinRequests } = useApp();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const myClass = useMemo(() => 
    classes.find(c => c.studentIds.includes(currentUser?.id || '') && !c.isArchived),
  [classes, currentUser]);

  const pendingRequest = useMemo(() => 
    classJoinRequests.find(r => r.studentId === currentUser?.id && r.status === 'pending'),
  [classJoinRequests, currentUser]);

  const teacher = useMemo(() => {
    if (!myClass) return null;
    return JSON.parse(localStorage.getItem('sb_users') || '[]').find((u: any) => u.id === myClass.teacherId);
  }, [myClass]);

  const todayMood = useMemo(() => {
    const todayStart = new Date().setHours(0, 0, 0, 0);
    return moodLogs.find(m => m.userId === currentUser?.id && m.timestamp >= todayStart);
  }, [moodLogs, currentUser]);

  const progressToNextLevel = useMemo(() => {
    const currentXP = currentUser?.xp || 0;
    return (currentXP % 100);
  }, [currentUser]);

  const tasks = useMemo(() => {
    const plan = studyPlans.find(p => p.studentId === currentUser?.id);
    return plan?.tasks.filter(t => !t.completed) || [];
  }, [studyPlans, currentUser]);

  const moodEmojis = [
    { value: 1, emoji: '😫', label: 'Stressed' },
    { value: 2, emoji: '😞', label: 'Sad' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '😊', label: 'Great' },
  ];

  const focusSubject = useMemo(() => {
    if (!currentUser?.subjects || currentUser.subjects.length === 0) return null;
    return currentUser.subjects.reduce((prev, curr) => (curr.confidence < prev.confidence ? curr : prev));
  }, [currentUser]);

  return (
    <div className="space-y-8">
      {/* Class Status Banner */}
      {!myClass && (
        <section className={cn(
          "p-4 rounded-2xl flex items-center justify-between border-2 border-dashed shadow-sm transition-all",
          pendingRequest ? "bg-amber-50 border-amber-200" : "bg-indigo-50 border-indigo-200"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", pendingRequest ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700")}>
               <Users size={18} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 shadow-indigo-600/10">
                 {pendingRequest ? "Waiting for Approval" : "Join Your Class"}
               </p>
               <p className="text-xs font-bold text-slate-600 leading-none">
                 {pendingRequest ? "Your teacher will approve you shortly." : "Connect to see your class and assignments."}
               </p>
            </div>
          </div>
          <button 
            disabled={!!pendingRequest}
            onClick={() => setIsJoinModalOpen(true)}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:border-indigo-600 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:border-slate-200 shadow-sm"
          >
            {pendingRequest ? "Pending" : "Enter Code"}
          </button>
        </section>
      )}

      {/* Class Info (if joined) */}
      {myClass && (
        <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-indigo-900/5 transition-all hover:shadow-indigo-900/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-indigo-100/50 transition-colors" />
           <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2 drop-shadow-sm">Current Class</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 group-hover:translate-x-1 transition-transform">{myClass.className}</h2>
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500">
                      {teacher?.name?.charAt(0)}
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{teacher?.name || 'Your Teacher'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</span>
                 <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                    Active
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* Welcome Header */}
      <section>
        <p className="text-slate-500 font-medium mb-1">{today}</p>
        <h1 className="text-3xl font-bold text-slate-900">Good morning, {currentUser?.name.split(' ')[0]}</h1>
      </section>

      {/* Mood Check-in */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 tracking-tight mb-4 uppercase">Daily Mood Check</h3>
        {todayMood ? (
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-2xl">{moodEmojis.find(e => e.value === todayMood.mood)?.emoji}</span>
            <div>
              <p className="font-bold text-slate-800">Feeling {moodEmojis.find(e => e.value === todayMood.mood)?.label} today</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                <CheckCircle2 size={10} /> Logged successfully
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-between gap-3">
            {moodEmojis.map((item) => (
              <motion.button
                key={item.value}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addMoodLog(item.value as any)}
                className="flex-1 aspect-square bg-slate-50 rounded-xl flex items-center justify-center text-2xl hover:bg-white hover:border-slate-200 transition-all border border-transparent"
              >
                {item.emoji}
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* Gamification Bar */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Trophy size={20} />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser?.level || 'Explorer'}</p>
                <h3 className="font-bold text-slate-900">{currentUser?.xp || 0} Total XP</h3>
             </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{100 - progressToNextLevel} XP to level up</p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressToNextLevel}%` }}
            className="h-full bg-indigo-600 rounded-full"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Focus Area */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-4">Current Focus</h3>
          {focusSubject ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Building Momentum In</p>
                <p className="text-lg font-bold text-slate-900">{focusSubject.name}</p>
                <div className="mt-3 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={cn("text-lg", i < focusSubject.confidence ? "text-amber-400" : "text-slate-200")}>★</span>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => onNavigate('study')}
                className="w-full flex items-center justify-between p-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold transition-all hover:bg-slate-200"
              >
                <span>Practice Session</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm mb-4 italic">No subjects added yet.</p>
              <button 
                onClick={() => onNavigate('progress')}
                className="text-indigo-600 font-bold text-sm"
              >
                + Add Subjects
              </button>
            </div>
          )}
        </section>

        {/* Tasks */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-4">Upcoming Tasks</h3>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-1 h-8 bg-indigo-600 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{task.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{task.subject} • {task.dueDay}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mb-3">
                <Calendar size={24} />
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight leading-relaxed">
                No active tasks found
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Quick Actions */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => onNavigate('help')}
              className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 border border-slate-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <HelpCircle size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase">Get Help</span>
            </button>
            <button 
              onClick={() => onNavigate('study')}
              className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 border border-slate-100 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Play size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase">Focus</span>
            </button>
            <button 
              onClick={() => onNavigate('study')}
              className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 border border-slate-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Brain size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase">AI Tutor</span>
            </button>
        </div>
      </section>
      <JoinClassModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
    </div>
  );
};

export default StudentHome;
