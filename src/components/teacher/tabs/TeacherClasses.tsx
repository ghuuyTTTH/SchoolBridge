/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Copy, 
  Share, 
  MoreVertical, 
  Users, 
  ChevronRight, 
  X, 
  Check, 
  MessageSquare, 
  Flag, 
  User as UserIcon,
  Clock,
  Trash2,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/utils';
import { Class, User, ClassJoinRequest } from '../../../types';

const TeacherClasses: React.FC = () => {
  const { classes, currentUser, createClass, regenerateClassCode, archiveClass, updateClass, users, classJoinRequests, approveJoinRequest, rejectJoinRequest, moodLogs, showToast } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const myClasses = useMemo(() => 
    classes.filter(c => c.teacherId === currentUser?.id && !c.isArchived),
  [classes, currentUser]);

  const selectedClass = useMemo(() => 
    classes.find(c => c.id === selectedClassId),
  [classes, selectedClassId]);

  const handleCopyCode = (code: string, id: string) => {
    const text = `Join my class on SchoolBridge using code: ${code}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Code copied to clipboard!', 'success');
  };

  const handleShare = async (code: string) => {
    const text = `Join my class on SchoolBridge using code: ${code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my SchoolBridge Class',
          text: text,
          url: window.location.origin
        });
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(text);
      showToast('Sharing not supported, code copied instead.', 'info');
    }
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    createClass(newClassName.trim());
    setNewClassName('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">My Classes</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-70">Manage your learning environments</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 text-xs uppercase tracking-widest"
        >
          <Plus size={16} strokeWidth={3} />
          Create Class
        </button>
      </div>

      {myClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myClasses.map((cls) => (
            <ClassCard 
              key={cls.id} 
              cls={cls} 
              onCopy={handleCopyCode} 
              onShare={handleShare}
              onViewRoster={setSelectedClassId}
              isCopied={copiedId === cls.id}
            />
          ))}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 max-w-sm mx-auto">
          <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-200">
             <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded-sm bg-current" />
                ))}
             </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-2 uppercase">No classes yet</h3>
            <p className="text-sm font-medium text-slate-400 font-serif italic italic leading-relaxed">
              Create your first class to start building your class community.
            </p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black shadow-sm text-xs uppercase tracking-widest text-indigo-600 hover:border-indigo-600 transition-colors"
          >
            Create your first class
          </button>
        </div>
      )}

      {/* Roster Drawer */}
      <AnimatePresence>
        {selectedClass && (
          <RosterDrawer 
            cls={selectedClass} 
            users={users} 
            requests={classJoinRequests.filter(r => r.classId === selectedClass.id && r.status === 'pending')}
            moodLogs={moodLogs}
            onClose={() => setSelectedClassId(null)} 
            onApprove={approveJoinRequest}
            onReject={rejectJoinRequest}
          />
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">New Class</h3>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                 </button>
              </div>
              
              <form onSubmit={handleCreateClass} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                   <input
                    autoFocus
                    placeholder="e.g. Year 10 Math"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all font-bold"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                   />
                </div>
                <button
                  type="submit"
                  disabled={!newClassName.trim()}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                >
                   Create
                   <Plus size={16} strokeWidth={3} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ClassCard: React.FC<{ 
  cls: Class; 
  onCopy: (code: string, id: string) => void;
  onShare: (code: string) => void;
  onViewRoster: (id: string) => void;
  isCopied: boolean;
}> = ({ cls, onCopy, onShare, onViewRoster, isCopied }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { regenerateClassCode, archiveClass, showToast } = useApp();

  const handleRegenerate = () => {
    if (confirm("Regenerating the code will invalidate the old one. Students will need the new code to join. Continue?")) {
      regenerateClassCode(cls.id);
      showToast('Class code regenerated!', 'info');
    }
    setShowMenu(false);
  };

  const handleArchive = () => {
    if (confirm("Are you sure you want to archive this class? Students will lose access.")) {
      archiveClass(cls.id);
      showToast('Class archived', 'info');
    }
    setShowMenu(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col relative group">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase">{cls.className}</h3>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-transparent hover:border-slate-100"
          >
            <MoreVertical size={16} />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-[10]" onClick={() => setShowMenu(false)} />
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95, y: -10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95, y: -10 }}
                   className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-[11] overflow-hidden p-1.5"
                >
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
                    <Edit2 size={14} /> Rename
                  </button>
                  <button 
                    onClick={handleRegenerate}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors rounded-lg"
                  >
                    <RefreshCw size={14} /> Regenerate Code
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  <button 
                    onClick={handleArchive}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors rounded-lg"
                  >
                    <Trash2 size={14} /> Archive
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mb-6">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Class Code</p>
         <div className="flex items-center gap-3">
            <div className="flex-1 bg-indigo-50/50 border border-dashed border-indigo-200 rounded-xl px-4 py-3 flex items-center justify-center font-mono text-xl font-bold text-indigo-700 tracking-[0.2em] shadow-sm">
               {cls.classCode}
            </div>
            <button 
              onClick={() => onCopy(cls.classCode, cls.id)}
              className={cn(
                "p-3.5 rounded-xl transition-all border shadow-sm",
                isCopied ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100"
              )}
            >
               {isCopied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
            </button>
         </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
         <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
               {[...Array(Math.min(3, cls.studentIds.length))].map((_, i) => (
                 <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                    {String.fromCharCode(65 + i)}
                 </div>
               ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
               {cls.studentIds.length} Joined
            </span>
         </div>
         <div className="flex items-center gap-2">
            <button 
              onClick={() => onShare(cls.classCode)}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
               <Share size={16} />
            </button>
            <button 
              onClick={() => onViewRoster(cls.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-slate-100"
            >
               Roster
               <ChevronRight size={14} />
            </button>
         </div>
      </div>
    </div>
  );
};

const RosterDrawer: React.FC<{ 
  cls: Class; 
  users: User[]; 
  requests: ClassJoinRequest[];
  moodLogs: any[];
  onClose: () => void; 
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}> = ({ cls, users, requests, moodLogs, onClose, onApprove, onReject }) => {
  const [updatedAt, setUpdatedAt] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setUpdatedAt(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const students = useMemo(() => 
    users.filter(u => cls.studentIds.includes(u.id)),
  [users, cls.studentIds]);

  const getAvatarColor = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase();
    if ('ABCDEF'.includes(firstLetter)) return 'bg-indigo-100 text-indigo-600';
    if ('GHIJKLM'.includes(firstLetter)) return 'bg-emerald-100 text-emerald-600';
    if ('NOPQRS'.includes(firstLetter)) return 'bg-amber-100 text-amber-600';
    return 'bg-rose-100 text-rose-600';
  };

  const getMoodColor = (mood?: number) => {
    switch(mood) {
      case 4: return 'bg-emerald-400';
      case 3: return 'bg-indigo-400';
      case 2: return 'bg-amber-400';
      case 1: return 'bg-rose-400';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="flex-1 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 40, stiffness: 400 }}
        className="w-full max-w-md md:max-w-lg bg-white h-full flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">{cls.className}</h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono uppercase tracking-widest">{cls.classCode}</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">• Roster ({students.length})</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-100 rounded-lg shadow-sm transition-all hover:rotate-90">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {requests.length > 0 && (
            <section className="space-y-4">
               <div className="flex items-center gap-2 mb-4">
                  <Clock size={14} className="text-amber-500" />
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Waiting to Join ({requests.length})</h4>
               </div>
               <div className="space-y-3">
                  {requests.map((req) => {
                    const student = users.find(u => u.id === req.studentId);
                    if (!student) return null;
                    return (
                      <div key={req.id} className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-sm", getAvatarColor(student.name))}>
                               {student.name.charAt(0)}
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">{student.name}</p>
                               <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none">ID: {student.studentId}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 opacity-100 transition-opacity">
                            <button 
                              onClick={() => onReject(req.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-rose-100 transition-colors"
                            >
                               <X size={14} strokeWidth={3} />
                            </button>
                            <button 
                              onClick={() => onApprove(req.id)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-1.5"
                            >
                               <Check size={12} strokeWidth={4} />
                               Approve
                            </button>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </section>
          )}

          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Class Roster</h4>
            {students.length > 0 ? (
              <div className="grid grid-cols-1 gap-px bg-slate-100 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {students.map((student) => {
                  const latestMood = moodLogs.find(l => l.userId === student.id);
                  return (
                    <div key={student.id} className="bg-white p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border border-transparent shadow-sm", getAvatarColor(student.name))}>
                            {student.name.charAt(0)}
                          </div>
                          <div className={cn(
                            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                            getMoodColor(latestMood?.mood)
                          )} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">{student.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID: {student.studentId}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors border border-transparent hover:border-slate-100 rounded-lg" title="Message">
                          <MessageSquare size={14} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-amber-500 transition-colors border border-transparent hover:border-slate-100 rounded-lg" title="Flag Student">
                          <Flag size={14} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-100 rounded-lg" title="Profile Details">
                          <UserIcon size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center space-y-6">
                 <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-200 mx-auto">
                    <Users size={24} />
                 </div>
                 <div>
                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Empty Roster</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[180px] mx-auto leading-relaxed">
                      Share the class code with your students to see them here.
                    </p>
                 </div>
                 <div className="p-4 bg-indigo-50 border border-dashed border-indigo-200 rounded-2xl inline-block font-mono text-lg font-bold text-indigo-600 tracking-widest shadow-sm">
                    {cls.classCode}
                 </div>
              </div>
            )}
          </section>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center">
             Updated {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Synchronized with local data
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherClasses;
