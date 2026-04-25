/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut, User as UserIcon, Lock, RefreshCw, ChevronRight, Users, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, logout, showToast, classes, leaveClass } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [password, setPassword] = useState('');

  const myClasses = classes.filter(c => c.studentIds.includes(currentUser?.id || '') && !c.isArchived);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    updateUser({
      ...currentUser,
      name,
      password: password || currentUser.password
    });
    showToast('Settings saved!', 'success');
  };

  const handleReplayTour = () => {
    if (!currentUser) return;
    updateUser({ ...currentUser, firstTimeUser: true });
    showToast('Tour will show on next reload!', 'info');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
               <h2 className="text-xl font-bold text-slate-900">Settings</h2>
               <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                     <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          type="text"
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                          value={name}
                          onChange={e => setName(e.target.value)}
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">New Password (Leave blank to keep current)</label>
                     <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                        />
                     </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                  >
                    Save changes
                  </button>
               </form>

               {currentUser?.role === 'student' && myClasses.length > 0 && (
                  <div className="space-y-4">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">My Classes</h3>
                     <div className="space-y-2">
                        {myClasses.map(cls => (
                          <div key={cls.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100 font-bold text-xs">
                                   {cls.className.charAt(0)}
                                </div>
                                <p className="text-sm font-bold text-slate-900">{cls.className}</p>
                             </div>
                             <button 
                               onClick={() => {
                                 if (confirm(`Leave ${cls.className}? Your teacher will no longer see your activity.`)) {
                                   leaveClass(cls.id);
                                 }
                               }}
                               className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>
                        ))}
                     </div>
                  </div>
               )}

               <div className="pt-4 space-y-3">
                  <button
                    onClick={handleReplayTour}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100"
                  >
                    <div className="flex items-center gap-3">
                       <RefreshCw size={18} className="text-indigo-600" />
                       <span className="text-sm font-bold text-slate-700">Replay onboarding tour</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>

                  <button
                    onClick={() => { logout(); onClose(); }}
                    className="w-full flex items-center justify-between p-4 bg-rose-50 rounded-2xl group hover:bg-rose-100 transition-colors border border-transparent hover:border-rose-200"
                  >
                    <div className="flex items-center gap-3">
                       <LogOut size={18} className="text-rose-500" />
                       <span className="text-sm font-bold text-rose-600">Log out</span>
                    </div>
                    <ChevronRight size={18} className="text-rose-300" />
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsScreen;
