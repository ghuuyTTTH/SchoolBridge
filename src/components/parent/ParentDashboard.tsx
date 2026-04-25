/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Link as LinkIcon, 
  User as UserIcon, 
  Heart, 
  TrendingUp, 
  MessageCircle, 
  Bell, 
  Settings,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { User, Message, MoodLog, HelpRequest, PomodoroSession } from '../../types';
import StudentMessages from '../shared/Messages';
import SettingsScreen from '../shared/SettingsScreen';

const ParentDashboard: React.FC = () => {
  const { currentUser, users, moodLogs, helpRequests, pomodoroSessions, updateUser, showToast, messages } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [linkIdInput, setLinkIdInput] = useState('');

  const child = useMemo(() => {
    if (!currentUser?.linkedIds || currentUser.linkedIds.length === 0) return null;
    return users.find(u => u.id === currentUser.linkedIds[0]);
  }, [currentUser, users]);

  const unreadCount = messages.filter(m => m.toId === currentUser?.id && m.status === 'sent').length;

  const handleLinkChild = (e: React.FormEvent) => {
    e.preventDefault();
    const student = users.find(u => u.role === 'student' && u.studentId === linkIdInput.trim());
    
    if (student) {
      const updatedParent = { ...currentUser!, linkedIds: [student.id] };
      updateUser(updatedParent);
      showToast(`Linked with ${student.name}!`, 'success');
      setLinkIdInput('');
    } else {
      showToast('No student found with that ID', 'warning');
    }
  };

  const childData = useMemo(() => {
    if (!child) return null;
    const todayStart = new Date().setHours(0,0,0,0);
    const lastSession = pomodoroSessions.filter(s => s.userId === child.id).sort((a,b) => b.timestamp - a.timestamp)[0];
    const recentMoods = moodLogs.filter(m => m.userId === child.id).sort((a,b) => b.timestamp - a.timestamp);
    const pendingHelp = helpRequests.filter(r => r.studentId === child.id && r.status === 'pending');
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
    const weekPomodoros = pomodoroSessions.filter(s => s.userId === child.id && s.timestamp >= weekStart.getTime());

    return {
      mood: recentMoods[0],
      isLowMood: recentMoods.slice(0, 2).every(m => m.mood <= 2),
      pendingHelp,
      weekPomodoros: weekPomodoros.length,
      lastActive: lastSession ? new Date(lastSession.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier today'
    };
  }, [child, moodLogs, helpRequests, pomodoroSessions]);

  const getMoodEmoji = (mood?: number) => {
    switch(mood) {
      case 1: return '😫';
      case 2: return '😞';
      case 3: return '😐';
      case 4: return '😊';
      default: return '😐';
    }
  };

  const helperTips = useMemo(() => {
    if (!childData) return null;
    const tips = [];
    if (childData.pendingHelp.length > 0) {
      tips.push({
        icon: HelpCircle,
        text: `Your child asked for help with ${childData.pendingHelp[0].subject} — ask them how it went.`
      });
    }
    if (childData.isLowMood) {
      tips.push({
        icon: Heart,
        text: `Your child checked in feeling down recently. A conversation at home can make a big difference.`
      });
    }
    if (childData.weekPomodoros > 0) {
      tips.push({
        icon: TrendingUp,
        text: `Your child completed ${childData.weekPomodoros} focus sessions this week — great consistency!`
      });
    }
    
    if (tips.length === 0) {
      tips.push({ icon: Lightbulb, text: "Try setting a dedicated focus hour at home to build study habits." });
      tips.push({ icon: Lightbulb, text: "Check the SchoolBridge app with your child to celebrate their earned XP." });
      tips.push({ icon: Lightbulb, text: "Asking 'What was the most interesting thing you learned today?' can spark great talks." });
    }
    return tips.slice(0, 3);
  }, [childData]);

  if (!child && activeTab === 'home') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl shadow-slate-100 border border-slate-200 text-center"
        >
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 mx-auto mb-6">
            <Smartphone size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight uppercase">FAMILY LINK</h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8 italic font-serif">
            Enter your child's student ID to monitor progress and stay in touch.
          </p>
          <form onSubmit={handleLinkChild} className="space-y-4">
            <div className="relative">
               <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
               <input 
                required
                placeholder="ID (e.g. STU123)"
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-sm"
                value={linkIdInput}
                onChange={e => setLinkIdInput(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold transition-all hover:bg-indigo-700 active:scale-95 shadow-sm text-xs uppercase tracking-widest"
            >
              Link Account
            </button>
          </form>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
          >
            Sign Out
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden shadow-sm">
              {currentUser?.name.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Parent</p>
              <h2 className="text-xs font-black text-slate-900 leading-none uppercase tracking-tighter">{currentUser?.name}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors border border-slate-100 rounded-lg shadow-sm">
              <Bell size={16} />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white"></div>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors border border-slate-100 rounded-lg shadow-sm"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 pb-24">
        <div className="max-w-5xl mx-auto space-y-10">
          {activeTab === 'home' ? (
            <>
              {/* Child Summary */}
              <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-full bg-slate-50 rounded-l-full opacity-30" />
                 <div className="relative flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-sm">
                       {getMoodEmoji(childData?.mood?.mood)}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">{child?.name}</h2>
                       <p className="text-[10px] font-bold text-slate-400 flex items-center justify-center md:justify-start gap-1.5 uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-sm" />
                          Last active: <span className="text-slate-900">{childData?.lastActive}</span>
                       </p>
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                             Level {child?.level}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-black uppercase tracking-widest border border-slate-100">
                             {child?.xp} Total XP
                          </span>
                       </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl flex flex-col items-center gap-1 min-w-[200px]">
                       <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">State of Mind</p>
                       <p className="font-bold text-xs leading-tight text-center text-slate-600 font-serif italic">"{childData?.mood?.note || 'Engaged and focused'}"</p>
                    </div>
                 </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Academic Overview */}
                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-slate-50 border border-slate-100 text-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                         <BookOpen size={16} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase tracking-widest">Academics</h3>
                   </div>
                   
                   {child?.subjects && child.subjects.length > 0 ? (
                      <div className="space-y-2">
                         {child.subjects.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                               <div>
                                 <span className="font-bold text-slate-900 text-xs tracking-tight">{sub.name}</span>
                                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block">Level {sub.confidence} confidence</span>
                               </div>
                               <div className="flex gap-0.5 opacity-40">
                                  {[...Array(5)].map((_, i) => (
                                     <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i < sub.confidence ? "bg-amber-400" : "bg-slate-200")} />
                                  ))}
                               </div>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl">
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No subject data</p>
                      </div>
                   )}
                </section>

                {/* How to help Section */}
                <section className="bg-indigo-600 text-white p-8 rounded-2xl shadow-xl shadow-indigo-900/10 border border-indigo-700">
                   <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-white/20 text-white rounded-lg flex items-center justify-center">
                         <Lightbulb size={16} />
                      </div>
                      <h3 className="text-sm font-bold tracking-tight uppercase tracking-widest">Support Tips</h3>
                   </div>

                   <div className="space-y-4">
                      {helperTips?.map((tip, i) => (
                         <div key={i} className="flex items-start gap-3 p-4 bg-indigo-500/20 rounded-xl border border-indigo-400/20 group transition-colors">
                            <tip.icon className="mt-0.5 flex-shrink-0 opacity-60" size={14} />
                            <p className="text-[11px] font-medium leading-relaxed italic font-serif">"{tip.text}"</p>
                         </div>
                      ))}
                   </div>
                </section>
              </div>
            </>
          ) : (
             <StudentMessages />
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-slate-100 px-4 py-3 flex items-center justify-center">
         <div className="flex items-center gap-12">
            <button 
              onClick={() => setActiveTab('home')}
              className={cn(
                "flex flex-col items-center gap-1.5 p-1 transition-all relative group",
                activeTab === 'home' ? "text-indigo-600" : "text-slate-300"
              )}
            >
               <TrendingUp size={20} className={activeTab === 'home' ? "stroke-[2.5px]" : "stroke-[2px] group-hover:text-slate-400"} />
               <span className="text-[9px] font-black uppercase tracking-widest leading-none">Dashboard</span>
               {activeTab === 'home' && <div className="absolute -top-3 w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
            </button>

            <button 
              onClick={() => setActiveTab('messages')}
              className={cn(
                "flex flex-col items-center gap-1.5 p-1 transition-all relative group",
                activeTab === 'messages' ? "text-indigo-600" : "text-slate-300"
              )}
            >
                <div className="relative">
                   <MessageCircle size={20} className={activeTab === 'messages' ? "stroke-[2.5px]" : "stroke-[2px] group-hover:text-slate-400"} />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 border border-white rounded-full" />
                  )}
                </div>
               <span className="text-[9px] font-black uppercase tracking-widest leading-none">Messages</span>
               {activeTab === 'messages' && <div className="absolute -top-3 w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
            </button>
         </div>
      </nav>

      <SettingsScreen isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default ParentDashboard;
