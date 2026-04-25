/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  Heart, 
  Send, 
  BookOpen, 
  Plus, 
  Calendar,
  X,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  User as UserIcon,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/utils';
import { User, HelpRequest, MoodLog } from '../../../types';

const TeacherStudents: React.FC = () => {
  const { 
    users, 
    helpRequests, 
    moodLogs, 
    updateHelpRequest, 
    addStudyPlanTask, 
    addIntervention, 
    addMessage,
    currentUser,
    showToast
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'needs_attention' | 'checked_in'>('all');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  
  // Interaction states
  const [replyText, setReplyText] = useState('');
  const [newTask, setNewTask] = useState({ subject: '', description: '', dueDay: 'Monday' });
  const [interventionNote, setInterventionNote] = useState('');

  const students = useMemo(() => {
    let list = users.filter(u => u.role === 'student');
    
    if (searchQuery) {
      list = list.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filter === 'needs_attention') {
      list = list.filter(student => {
        const studentHelp = helpRequests.filter(r => r.studentId === student.id && r.status === 'pending');
        const studentMoods = moodLogs.filter(m => m.userId === student.id).sort((a,b) => b.timestamp - a.timestamp).slice(0,3);
        return studentHelp.length >= 2 || (studentMoods.length >= 2 && studentMoods.every(m => m.mood <= 2));
      });
    } else if (filter === 'checked_in') {
      const todayStart = new Date().setHours(0,0,0,0);
      list = list.filter(student => moodLogs.some(l => l.userId === student.id && l.timestamp >= todayStart));
    }

    return list;
  }, [users, searchQuery, filter, helpRequests, moodLogs]);

  const studentDetails = useMemo(() => {
    if (!selectedStudent) return null;
    return {
      help: helpRequests.filter(r => r.studentId === selectedStudent.id),
      moods: moodLogs.filter(m => m.userId === selectedStudent.id).sort((a,b) => b.timestamp - a.timestamp).slice(0, 7),
    };
  }, [selectedStudent, helpRequests, moodLogs]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getMoodEmoji = (mood: number) => {
    switch(mood) {
      case 1: return '😫';
      case 2: return '😞';
      case 3: return '😐';
      case 4: return '😊';
      default: return '😐';
    }
  };

  const handleSendEncouragement = (student: User) => {
    const text = `Hey ${student.name.split(' ')[0]}, you're doing great — keep it up!`;
    addMessage({
      fromId: currentUser!.id,
      toId: student.id,
      body: text
    });
    addIntervention({
      teacherId: currentUser!.id,
      studentId: student.id,
      type: 'Encouragement',
      note: text
    });
    showToast('Encouragement sent!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Class List</h2>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-medium"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
          <div className="bg-white p-1 rounded-xl flex gap-1 border border-slate-100">
            {[
              { id: 'all', label: 'All' },
              { id: 'needs_attention', label: 'Needs Support' },
              { id: 'checked_in', label: 'Recent' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  filter === f.id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {students.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {students.map((student) => {
              const lastMood = moodLogs.find(l => l.userId === student.id);
              const helpCount = helpRequests.filter(r => r.studentId === student.id && r.status === 'pending').length;
              
              return (
                <div 
                  key={student.id} 
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight">{student.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5 uppercase tracking-widest leading-none">
                         <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", lastMood?.mood && lastMood.mood <= 2 ? "bg-rose-400" : "bg-emerald-400")} />
                         {lastMood ? `Checked in ${new Date(lastMood.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No check-in'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {helpCount > 0 && (
                      <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-amber-100 shadow-sm tracking-wider">
                        {helpCount} Pending
                      </div>
                    )}
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center space-y-6 max-w-sm mx-auto">
            <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 mx-auto">
               <Users size={24} />
            </div>
            <div>
               <h4 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">BUILD YOUR COMMUNITY</h4>
               <p className="text-[11px] text-slate-400 font-medium font-serif italic">
                 Share your code <span className="text-indigo-600 font-black not-italic">{currentUser?.schoolCode}</span> for students to join.
               </p>
            </div>
          </div>
        )}
      </div>

      {/* Student Detail Slide-over */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto border-l border-slate-100"
            >
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-lg font-bold">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight leading-none">{selectedStudent.name}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none opacity-70">
                      ID: {selectedStudent.studentId}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-slate-100 shadow-sm"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Detail Content */}
              <div className="p-6 space-y-8">
                {/* Mood Trend */}
                <section>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Recent Wellbeing</h4>
                  <div className="h-24 flex items-end gap-2 px-2">
                    {studentDetails?.moods.length! > 0 ? (
                      studentDetails?.moods.map((log, i) => (
                        <div key={log.id} className="flex-1 flex flex-col items-center gap-2 group relative">
                          <div className={cn(
                            "w-full rounded-t-lg transition-all shadow-sm",
                            log.mood === 1 ? "bg-rose-400 h-[25%]" :
                            log.mood === 2 ? "bg-amber-400 h-[50%]" :
                            log.mood === 3 ? "bg-indigo-400 h-[75%]" :
                            "bg-emerald-400 h-[100%]"
                          )} />
                          <span className="text-sm">{getMoodEmoji(log.mood)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="w-full text-center text-[10px] text-slate-400 uppercase tracking-widest opacity-50">No check-ins</p>
                    )}
                  </div>
                </section>

                <div className="space-y-6">
                  {/* Help Requests */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Pending Support</h4>
                    <div className="space-y-3">
                      {studentDetails?.help.filter(r => r.status === 'pending').map((req) => (
                        <div key={req.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded border border-indigo-100">
                                {req.subject}
                              </span>
                           </div>
                           <p className="text-slate-700 text-xs mb-4 leading-relaxed font-medium">"{req.body}"</p>
                           <div className="flex gap-2">
                              <input
                                placeholder="Reply..."
                                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                              />
                              <button
                                onClick={() => {
                                  updateHelpRequest(req.id, replyText);
                                  setReplyText('');
                                  showToast('Reply sent!', 'success');
                                }}
                                className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                              >
                                <Send size={16} />
                              </button>
                           </div>
                        </div>
                      ))}
                      {studentDetails?.help.filter(r => r.status === 'pending').length === 0 && (
                        <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl">
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Clear queue</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Study Plan Section */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Assign Tasks</h4>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                          <input 
                            placeholder="e.g. Math"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                            value={newTask.subject}
                            onChange={e => setNewTask({ ...newTask, subject: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Day</label>
                          <select 
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium appearance-none"
                            value={newTask.dueDay}
                            onChange={e => setNewTask({ ...newTask, dueDay: e.target.value })}
                          >
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Task</label>
                          <input 
                            placeholder="Assignment description..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                            value={newTask.description}
                            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                          />
                      </div>
                      <button 
                        onClick={() => {
                          if (!newTask.subject || !newTask.description) return;
                          addStudyPlanTask(selectedStudent.id, newTask);
                          setNewTask({ subject: '', description: '', dueDay: 'Monday' });
                          showToast('Task assigned!', 'success');
                        }}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold transition-all hover:bg-indigo-700 active:scale-95 shadow-sm text-xs uppercase tracking-widest"
                      >
                        Assign Task
                      </button>
                    </div>
                  </div>

                   {/* Quick Support */}
                   <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleSendEncouragement(selectedStudent)}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center gap-2 transition-all hover:bg-white hover:border-indigo-200 group"
                      >
                        <Heart size={18} className="text-rose-400 group-hover:fill-rose-400 transition-all" />
                        <span className="font-bold text-[9px] uppercase tracking-widest text-slate-500">Motivate</span>
                      </button>
                      <button 
                        onClick={() => { showToast('Support session ready!', 'info'); }}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center gap-2 transition-all hover:bg-white hover:border-emerald-200 group"
                      >
                         <Calendar size={18} className="text-emerald-500" />
                        <span className="font-bold text-[9px] uppercase tracking-widest text-slate-500">Plan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherStudents;
