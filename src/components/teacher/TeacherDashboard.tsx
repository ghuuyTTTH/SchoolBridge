/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Users, 
  LayoutDashboard, 
  Lightbulb, 
  MessageSquare, 
  Bell, 
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Layout
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import TeacherOverview from './tabs/TeacherOverview';
import TeacherStudents from './tabs/TeacherStudents';
import TeacherInsights from './tabs/TeacherInsights';
import TeacherClasses from './tabs/TeacherClasses';
import StudentMessages from '../shared/Messages';
import SettingsScreen from '../shared/SettingsScreen';
import TeacherSetup from './TeacherSetup';

const TeacherDashboard: React.FC = () => {
  const { currentUser, messages, classes } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Check if teacher has any classes on first load
  const myClasses = classes.filter(c => c.teacherId === currentUser?.id);
  const hasNoClasses = myClasses.length === 0;

  React.useEffect(() => {
    if (hasNoClasses) {
      setShowSetup(true);
    }
  }, [hasNoClasses]);

  const unreadCount = messages.filter(m => m.toId === currentUser?.id && m.status === 'sent').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'classes', label: 'Classes', icon: Layout },
    { id: 'students', label: 'Classroom', icon: Users },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <TeacherOverview onNavigate={setActiveTab} />;
      case 'classes': return <TeacherClasses />;
      case 'students': return <TeacherStudents />;
      case 'insights': return <TeacherInsights />;
      case 'messages': return <StudentMessages />;
      default: return <TeacherOverview onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-0.5 bg-white rounded-full rotate-45 translate-y-0.5"></div>
            <div className="w-4 h-0.5 bg-white rounded-full -rotate-45 -translate-y-0.5"></div>
          </div>
          <span className="font-bold text-slate-900">SchoolBridge</span>
        </div>
        <button onClick={() => setIsSideNavOpen(true)} className="p-2 text-slate-500">
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-0.5 bg-white rounded-full rotate-45 translate-y-0.5"></div>
              <div className="w-4 h-0.5 bg-white rounded-full -rotate-45 -translate-y-0.5"></div>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">SchoolBridge</h1>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm",
                  activeTab === tab.id 
                    ? "bg-slate-100 text-indigo-600" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <tab.icon size={18} className={activeTab === tab.id ? "stroke-[2.5px]" : "stroke-[2px]"} />
                  {tab.label}
                </div>
                {tab.badge && tab.badge > 0 && (
                  <span className={cn(
                    "min-w-[16px] h-4 flex items-center justify-center rounded-full text-[8px] font-black",
                    activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-amber-400 text-amber-900"
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{currentUser?.role}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
          >
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-6xl mx-auto p-4 md:p-10 pb-24 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all relative",
              activeTab === tab.id ? "text-indigo-600" : "text-slate-400"
            )}
          >
            <tab.icon size={22} className={activeTab === tab.id ? "stroke-[2.5px]" : "stroke-[2px]"} />
            <span className={cn("text-[9px] font-bold uppercase tracking-wider", activeTab === tab.id ? "opacity-100" : "opacity-40")}>
              {tab.label}
            </span>
            {tab.badge && tab.badge > 0 && (
                <div className="absolute top-1 right-2 min-w-[16px] h-4 bg-amber-400 text-amber-900 text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {tab.badge}
                </div>
              )}
          </button>
        ))}
      </nav>

      {/* Mobile Sidenav Overlay */}
      <AnimatePresence>
        {isSideNavOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsSideNavOpen(false)}
               className="flex-1 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-64 bg-white h-full p-8 flex flex-col"
            >
              <button onClick={() => setIsSideNavOpen(false)} className="self-end p-2 text-slate-400 mb-8">
                <X size={24} />
              </button>
              
              <div className="mt-auto pt-8 border-t border-slate-100 space-y-4">
                 <button 
                  onClick={() => { setIsSettingsOpen(true); setIsSideNavOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  <Settings size={20} />
                  Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SettingsScreen isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <AnimatePresence>
        {showSetup && (
          <TeacherSetup onComplete={() => setShowSetup(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherDashboard;
