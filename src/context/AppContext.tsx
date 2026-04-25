/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, Message, MoodLog, HelpRequest, StudyPlan, Intervention, Session, PomodoroSession, Class, ClassJoinRequest } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  messages: Message[];
  moodLogs: MoodLog[];
  helpRequests: HelpRequest[];
  studyPlans: StudyPlan[];
  interventions: Intervention[];
  pomodoroSessions: PomodoroSession[];
  classes: Class[];
  classJoinRequests: ClassJoinRequest[];
  isLoading: boolean;
  toasts: Toast[];
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  addUser: (user: User) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
  addMoodLog: (mood: 1 | 2 | 3 | 4) => void;
  addHelpRequest: (request: Omit<HelpRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateHelpRequest: (id: string, reply: string) => void;
  addStudyPlanTask: (studentId: string, task: any) => void;
  addIntervention: (intervention: Omit<Intervention, 'id' | 'timestamp'>) => void;
  addPomodoroSession: (session: Omit<PomodoroSession, 'id' | 'timestamp'>) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  markBatchAsRead: (fromId: string, toId: string) => void;
  createClass: (className: string) => Class | null;
  regenerateClassCode: (classId: string) => void;
  updateClass: (updatedClass: Class) => void;
  archiveClass: (classId: string) => void;
  joinClass: (classCode: string) => void;
  approveJoinRequest: (requestId: string) => void;
  rejectJoinRequest: (requestId: string) => void;
  leaveClass: (classId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: [],
    messages: [],
    moodLogs: [],
    helpRequests: [],
    studyPlans: [],
    interventions: [],
    pomodoroSessions: [],
    classes: [],
    classJoinRequests: [],
    isLoading: true,
    toasts: [],
  });

  const loadData = useCallback(() => {
    try {
      const users = JSON.parse(localStorage.getItem('sb_users') || '[]');
      const messages = JSON.parse(localStorage.getItem('sb_messages') || '[]');
      const moodLogs = JSON.parse(localStorage.getItem('sb_moodLogs') || '[]');
      const helpRequests = JSON.parse(localStorage.getItem('sb_helpRequests') || '[]');
      const studyPlans = JSON.parse(localStorage.getItem('sb_studyPlans') || '[]');
      const interventions = JSON.parse(localStorage.getItem('sb_interventions') || '[]');
      const pomodoroSessions = JSON.parse(localStorage.getItem('sb_pomodoro') || '[]');
      const classes = JSON.parse(localStorage.getItem('sb_classes') || '[]');
      const classJoinRequests = JSON.parse(localStorage.getItem('sb_class_requests') || '[]');
      const session = JSON.parse(localStorage.getItem('sb_session') || 'null');

      let currentUser = null;
      if (session && session.expiresAt > Date.now()) {
        currentUser = users.find((u: User) => u.id === session.userId) || null;
      }

      setState(prev => ({
        ...prev,
        users,
        messages,
        moodLogs,
        helpRequests,
        studyPlans,
        interventions,
        pomodoroSessions,
        classes,
        classJoinRequests,
        currentUser,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.isLoading) {
        loadData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [state.isLoading, loadData]);

  // Persistence Effects
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem('sb_users', JSON.stringify(state.users));
      localStorage.setItem('sb_messages', JSON.stringify(state.messages));
      localStorage.setItem('sb_moodLogs', JSON.stringify(state.moodLogs));
      localStorage.setItem('sb_helpRequests', JSON.stringify(state.helpRequests));
      localStorage.setItem('sb_studyPlans', JSON.stringify(state.studyPlans));
      localStorage.setItem('sb_interventions', JSON.stringify(state.interventions));
      localStorage.setItem('sb_pomodoro', JSON.stringify(state.pomodoroSessions));
      localStorage.setItem('sb_classes', JSON.stringify(state.classes));
      localStorage.setItem('sb_class_requests', JSON.stringify(state.classJoinRequests));
      if (state.currentUser) {
        localStorage.setItem('sb_session', JSON.stringify({
          userId: state.currentUser.id,
          expiresAt: Date.now() + 86400000 // 24h
        }));
      } else {
        localStorage.removeItem('sb_session');
      }
    }
  }, [state.users, state.messages, state.moodLogs, state.helpRequests, state.studyPlans, state.interventions, state.pomodoroSessions, state.currentUser, state.isLoading]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setState(prev => ({
      ...prev,
      toasts: [...prev.toasts, { id, message, type }]
    }));
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        toasts: prev.toasts.filter(t => t.id !== id)
      }));
    }, 3000);
  }, []);

  const login = useCallback((user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
    showToast(`Welcome back, ${user.name}!`, 'success');
  }, [showToast]);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, currentUser: null }));
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const addUser = useCallback((user: User) => {
    setState(prev => ({
      ...prev,
      users: [...prev.users, user],
      currentUser: user
    }));
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
      currentUser: prev.currentUser?.id === updatedUser.id ? updatedUser : prev.currentUser
    }));
  }, []);

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
    const newMessage: Message = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'sent'
    };
    setState(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
  }, []);

  const markBatchAsRead = useCallback((fromId: string, toId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => 
        (m.fromId === fromId && m.toId === toId && m.status === 'sent') 
        ? { ...m, status: 'read' } 
        : m
      )
    }));
  }, []);

  const addMoodLog = useCallback((mood: 1 | 2 | 3 | 4) => {
    if (!state.currentUser) return;
    const newMood: MoodLog = {
      id: crypto.randomUUID(),
      userId: state.currentUser.id,
      mood,
      timestamp: Date.now()
    };
    setState(prev => ({ ...prev, moodLogs: [...prev.moodLogs, newMood] }));
    
    // Reward XP
    if (state.currentUser.role === 'student' && state.currentUser.xp !== undefined) {
      const updatedUser = { ...state.currentUser, xp: state.currentUser.xp + 5 };
      updateUser(updatedUser);
    }
  }, [state.currentUser, updateUser]);

  const addHelpRequest = useCallback((req: Omit<HelpRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: HelpRequest = {
      ...req,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      status: 'pending'
    };
    setState(prev => ({ ...prev, helpRequests: [...prev.helpRequests, newReq] }));
    
     // Reward XP
     if (state.currentUser?.role === 'student' && state.currentUser.xp !== undefined) {
      updateUser({ ...state.currentUser, xp: state.currentUser.xp + 15 });
    }
  }, [state.currentUser, updateUser]);

  const updateHelpRequest = useCallback((id: string, reply: string) => {
    setState(prev => ({
      ...prev,
      helpRequests: prev.helpRequests.map(r => r.id === id ? { ...r, teacherReply: reply, status: 'resolved' } : r)
    }));
  }, []);

  const addStudyPlanTask = useCallback((studentId: string, task: any) => {
    setState(prev => {
      const existingPlan = prev.studyPlans.find(p => p.studentId === studentId);
      if (existingPlan) {
        return {
          ...prev,
          studyPlans: prev.studyPlans.map(p => p.studentId === studentId ? { ...p, tasks: [...p.tasks, { ...task, id: crypto.randomUUID(), completed: false }] } : p)
        };
      } else {
        const newPlan: StudyPlan = {
          id: crypto.randomUUID(),
          studentId,
          weekOf: new Date().toISOString(),
          tasks: [{ ...task, id: crypto.randomUUID(), completed: false }]
        };
        return { ...prev, studyPlans: [...prev.studyPlans, newPlan] };
      }
    });
  }, []);

  const addIntervention = useCallback((iv: Omit<Intervention, 'id' | 'timestamp'>) => {
    const newIv: Intervention = {
      ...iv,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    setState(prev => ({ ...prev, interventions: [...prev.interventions, newIv] }));
  }, []);

  const addPomodoroSession = useCallback((session: Omit<PomodoroSession, 'id' | 'timestamp'>) => {
    const newSession: PomodoroSession = {
      ...session,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    setState(prev => ({ ...prev, pomodoroSessions: [...prev.pomodoroSessions, newSession] }));

    // Reward XP
    if (state.currentUser?.role === 'student' && state.currentUser.xp !== undefined) {
      updateUser({ ...state.currentUser, xp: state.currentUser.xp + 20 });
    }
  }, [state.currentUser, updateUser]);

  const generateClassCode = useCallback((teacherName: string, existingClasses: Class[]) => {
    const prefix = teacherName.slice(0, 2).toUpperCase();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      code = prefix;
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      isUnique = !existingClasses.some(c => c.classCode === code);
    }
    return code;
  }, []);

  const createClass = useCallback((className: string) => {
    if (!state.currentUser) return null;
    const newClass: Class = {
      id: crypto.randomUUID(),
      teacherId: state.currentUser.id,
      className,
      classCode: generateClassCode(state.currentUser.name, state.classes),
      createdAt: Date.now(),
      studentIds: [],
      isArchived: false,
      requireApproval: false
    };
    setState(prev => ({ ...prev, classes: [...prev.classes, newClass] }));
    return newClass;
  }, [state.currentUser, state.classes, generateClassCode]);

  const regenerateClassCode = useCallback((classId: string) => {
    if (!state.currentUser) return;
    setState(prev => ({
      ...prev,
      classes: prev.classes.map(c => 
        c.id === classId ? { ...c, classCode: generateClassCode(state.currentUser!.name, prev.classes) } : c
      )
    }));
  }, [state.currentUser, generateClassCode]);

  const updateClass = useCallback((updatedClass: Class) => {
    setState(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === updatedClass.id ? updatedClass : c)
    }));
  }, []);

  const archiveClass = useCallback((classId: string) => {
    setState(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === classId ? { ...c, isArchived: true } : c)
    }));
  }, []);

  const joinClass = useCallback((classCode: string) => {
    if (!state.currentUser) return;
    const targetClass = state.classes.find(c => c.classCode === classCode.toUpperCase() && !c.isArchived);
    
    if (!targetClass) {
      showToast("We couldn't find that code. Double-check with your teacher.", 'warning');
      return;
    }

    if (targetClass.studentIds.includes(state.currentUser.id)) {
      showToast("You're already in this class.", 'info');
      return;
    }

    if (targetClass.requireApproval) {
      const newRequest: ClassJoinRequest = {
        id: crypto.randomUUID(),
        studentId: state.currentUser.id,
        classId: targetClass.id,
        status: 'pending',
        requestedAt: Date.now()
      };
      setState(prev => ({ ...prev, classJoinRequests: [...prev.classJoinRequests, newRequest] }));
      showToast("Your request was sent. Your teacher will approve it shortly.", 'info');
    } else {
      updateClass({ ...targetClass, studentIds: [...targetClass.studentIds, state.currentUser.id] });
      showToast(`You joined ${targetClass.className}!`, 'success');
    }
  }, [state.currentUser, state.classes, updateClass, showToast]);

  const approveJoinRequest = useCallback((requestId: string) => {
    const request = state.classJoinRequests.find(r => r.id === requestId);
    if (!request) return;

    const targetClass = state.classes.find(c => c.id === request.classId);
    if (!targetClass) return;

    setState(prev => ({
      ...prev,
      classJoinRequests: prev.classJoinRequests.map(r => r.id === requestId ? { ...r, status: 'approved' } : r),
      classes: prev.classes.map(c => c.id === targetClass.id ? { ...c, studentIds: [...c.studentIds, request.studentId] } : c)
    }));

    addMessage({
      fromId: state.currentUser!.id,
      toId: request.studentId,
      body: `Your request to join ${targetClass.className} was approved.`
    });
  }, [state.classJoinRequests, state.classes, state.currentUser, addMessage]);

  const rejectJoinRequest = useCallback((requestId: string) => {
    const request = state.classJoinRequests.find(r => r.id === requestId);
    if (!request) return;

    const targetClass = state.classes.find(c => c.id === request.classId);
    
    setState(prev => ({
      ...prev,
      classJoinRequests: prev.classJoinRequests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r)
    }));

    if (targetClass) {
        addMessage({
            fromId: state.currentUser!.id,
            toId: request.studentId,
            body: `Your request to join ${targetClass.className} was not approved. Contact your teacher for help.`
        });
    }
  }, [state.classJoinRequests, state.classes, state.currentUser, addMessage]);

  const leaveClass = useCallback((classId: string) => {
    if (!state.currentUser) return;
    setState(prev => ({
      ...prev,
      classes: prev.classes.map(c => 
        c.id === classId ? { ...c, studentIds: c.studentIds.filter(id => id !== state.currentUser!.id) } : c
      )
    }));
    showToast("Left class successfully.", 'info');
  }, [state.currentUser, showToast]);

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    updateUser,
    addUser,
    addMessage,
    addMoodLog,
    addHelpRequest,
    updateHelpRequest,
    addStudyPlanTask,
    addIntervention,
    addPomodoroSession,
    showToast,
    markBatchAsRead,
    createClass,
    regenerateClassCode,
    updateClass,
    archiveClass,
    joinClass,
    approveJoinRequest,
    rejectJoinRequest,
    leaveClass,
  }), [state, login, logout, updateUser, addUser, addMessage, addMoodLog, addHelpRequest, updateHelpRequest, addStudyPlanTask, addIntervention, addPomodoroSession, showToast, markBatchAsRead, createClass, regenerateClassCode, updateClass, archiveClass, joinClass, approveJoinRequest, rejectJoinRequest, leaveClass]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
