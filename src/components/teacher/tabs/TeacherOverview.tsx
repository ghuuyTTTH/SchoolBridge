/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  HelpCircle, 
  Heart, 
  ShieldAlert, 
  Clipboard, 
  CheckCircle2,
  ChevronRight,
  User as UserIcon,
  MessageCircle,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/utils';
import { User, MoodLog, HelpRequest } from '../../../types';

interface TeacherOverviewProps {
  onNavigate: (tab: string) => void;
}

const TeacherOverview: React.FC<TeacherOverviewProps> = ({ onNavigate }) => {
  const { currentUser, users, helpRequests, moodLogs, interventions, classes, showToast } = useApp();

  const myClasses = useMemo(() => 
    classes.filter(c => c.teacherId === currentUser?.id && !c.isArchived)
  , [classes, currentUser]);

  const primaryClass = myClasses[0];
  const classCode = primaryClass?.classCode || 'NONE';

  const stats = useMemo(() => {
    const studentIds = new Set(myClasses.flatMap(c => c.studentIds));
    const linkedStudents = users.filter(u => studentIds.has(u.id)); 
    const pendingHelp = helpRequests.filter(r => studentIds.has(r.studentId) && r.status === 'pending');
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayMoods = moodLogs.filter(l => studentIds.has(l.userId) && l.timestamp >= todayStart);
    const totalInterventions = interventions.filter(i => i.teacherId === currentUser?.id);

    return {
      students: linkedStudents.length,
      help: pendingHelp.length,
      moods: todayMoods.length,
      interventions: totalInterventions.length
    };
  }, [users, helpRequests, moodLogs, interventions, currentUser, myClasses]);

  const strugglingStudents = useMemo(() => {
    const studentIds = new Set(myClasses.flatMap(c => c.studentIds));
    const students = users.filter(u => studentIds.has(u.id));
    return students.map(student => {
      const studentHelp = helpRequests.filter(r => r.studentId === student.id && r.status === 'pending');
      const studentMoods = moodLogs
        .filter(m => m.userId === student.id)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3);
      
      const isLowMood = studentMoods.length >= 2 && studentMoods.every(m => m.mood <= 2);
      const isHighHelp = studentHelp.length >= 2;
      
      let reason = '';
      if (isLowMood) reason = 'Consistently low mood';
      else if (isHighHelp) reason = 'Unresolved help requests';

      return (isLowMood || isHighHelp) ? { ...student, reason } : null;
    }).filter(s => s !== null) as (User & { reason: string })[];
  }, [users, helpRequests, moodLogs, myClasses]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(classCode);
    showToast('Copied!', 'success');
  };

  return (
    <div className="space-y-10">
      <section className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Hello, {currentUser?.name.split(' ')[0]}</h2>
          <p className="text-slate-500 font-medium">Here's what's happening with your students today.</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Your Class Code</p>
            <p className="text-xl font-bold text-indigo-600 font-mono tracking-wider">{classCode}</p>
          </div>
          <button 
            onClick={copyToClipboard}
            className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100"
          >
            <Clipboard size={18} />
          </button>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Students', value: stats.students, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pending Help', value: stats.help, icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Check-ins', value: stats.moods, icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Interventions', value: stats.interventions, icon: ShieldAlert, color: 'text-indigo-400', bg: 'bg-slate-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm", stat.bg, stat.color)}>
              <stat.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-0.5">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Silent Struggle Panel */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-0.5 tracking-tight text-xl uppercase">Silence Watch</h3>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Students flagged based on recent activity and mood.</p>
          </div>
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {strugglingStudents.length > 0 ? (
            <div className="space-y-3">
              {strugglingStudents.map((student) => (
                <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 font-bold shadow-sm border border-slate-100">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{student.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-bold uppercase py-0.5 px-2 bg-white text-amber-600 rounded border border-amber-100">
                          {student.reason}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-indigo-600 rounded-lg border border-indigo-100 font-bold text-[11px] uppercase tracking-wider hover:bg-indigo-50 transition-colors shadow-sm active:scale-95">
                      <MessageCircle size={14} />
                      Send Note
                    </button>
                    <button 
                      onClick={() => onNavigate('students')}
                      className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-lg border border-slate-100 transition-colors shadow-sm"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center max-w-sm mx-auto">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Class check list complete</h4>
              <p className="text-xs text-slate-400 font-medium italic">
                All students appear to be doing well today.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TeacherOverview;
