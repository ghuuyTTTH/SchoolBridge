/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BarChart3, 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Bell, 
  Settings, 
  Search,
  LogOut,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import StudentHome from './tabs/StudentHome';
import StudentProgress from './tabs/StudentProgress';
import StudentHelp from './tabs/StudentHelp';
import StudentStudy from './tabs/StudentStudy';
import StudentMessages from '../shared/Messages';
import SettingsScreen from '../shared/SettingsScreen';

const StudentDashboard: React.FC = () => {
  const { currentUser, logout, messages } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const unreadMessagesCount = messages.filter(m => m.toId === currentUser?.id && m.status === 'sent').length;

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: unreadMessagesCount },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <StudentHome onNavigate={setActiveTab} />;
      case 'progress': return <StudentProgress />;
      case 'help': return <StudentHelp onNavigate={setActiveTab} />;
      case 'study': return <StudentStudy />;
      case 'chat': return <StudentMessages />;
      default: return <StudentHome onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-5 h-1 bg-white rounded-full rotate-45 translate-y-0.5"></div>
                <div className="w-5 h-1 bg-white rounded-full -rotate-45 -translate-y-0.5"></div>
             </div>
             <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">SchoolBridge</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-r pr-6 border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Student</p>
                <p className="text-sm font-bold text-slate-900 leading-none">{currentUser?.name}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">
                {currentUser?.name.charAt(0)}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full border-2 border-white"></div>
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
               >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-5xl mx-auto p-6">
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

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all",
                activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-500"
              )}
            >
              <motion.div
                animate={activeTab === tab.id ? { y: -2 } : { y: 0 }}
              >
                <tab.icon size={22} className={activeTab === tab.id ? "stroke-[2.5px]" : "stroke-[2px]"} />
              </motion.div>
              <span className={cn("text-[9px] font-bold uppercase tracking-wider", activeTab === tab.id ? "opacity-100" : "opacity-40")}>
                {tab.label}
              </span>
              {tab.badge && tab.badge > 0 && (
                <div className="absolute top-1 right-2 min-w-[16px] h-4 bg-amber-400 text-amber-900 text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {tab.badge}
                </div>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-2 w-8 h-1 bg-indigo-600 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      <SettingsScreen isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default StudentDashboard;
