/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, Message, MoodLog, HelpRequest, StudyPlan, Intervention, Session, PomodoroSession, Class, ClassJoinRequest } from '../types';
import { supabase } from '../lib/supabase';

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
  login: (formData: any) => Promise<void>;
  signUp: (formData: any, role: string) => Promise<void>;
  logout: () => Promise<void>;
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
  createClass: (className: string) => Promise<any>;
  regenerateClassCode: (classId: string) => void;
  updateClass: (updatedClass: Class) => void;
  archiveClass: (classId: string) => void;
  joinClass: (classCode: string) => Promise<void>;
  approveJoinRequest: (requestId: string) => void;
  rejectJoinRequest: (requestId: string) => void;
  leaveClass: (classId: string) => void;
  pendingJoinCode: string | null;
  setPendingJoinCode: (code: string | null) => void;
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

  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(localStorage.getItem('sb_pending_join'));

  useEffect(() => {
    if (pendingJoinCode) {
      localStorage.setItem('sb_pending_join', pendingJoinCode);
    } else {
      localStorage.removeItem('sb_pending_join');
    }
  }, [pendingJoinCode]);

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

  const loadUserData = useCallback(async (userId: string) => {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error loading user profile:', userError);
      return null;
    }

    return userData;
  }, []);

  const loadClasses = useCallback(async () => {
    const { data, error } = await supabase.from('classes').select('*');
    if (error) console.error('Error loading classes:', error);
    else setState(prev => ({ ...prev, classes: data || [] }));
  }, []);

  const loadData = useCallback(async () => {
    // Initial fetch of other data (stubbed for now as requested tables were only users, classes, members)
    // In a full migration, we would move all tables to Supabase.
    try {
      const messages = JSON.parse(localStorage.getItem('sb_messages') || '[]');
      const moodLogs = JSON.parse(localStorage.getItem('sb_moodLogs') || '[]');
      const helpRequests = JSON.parse(localStorage.getItem('sb_helpRequests') || '[]');
      const studyPlans = JSON.parse(localStorage.getItem('sb_studyPlans') || '[]');
      const interventions = JSON.parse(localStorage.getItem('sb_interventions') || '[]');
      const pomodoroSessions = JSON.parse(localStorage.getItem('sb_pomodoro') || '[]');
      
      setState(prev => ({
        ...prev,
        messages,
        moodLogs,
        helpRequests,
        studyPlans,
        interventions,
        pomodoroSessions,
      }));

      await loadClasses();
    } catch (error) {
      console.error("Failed to load data", error);
    }
  }, [loadClasses]);

  // Auth Sync
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData = await loadUserData(session.user.id);
        setState(prev => ({ ...prev, currentUser: userData, isLoading: false }));
        loadData();
      } else {
        setState(prev => ({ ...prev, currentUser: null, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData, loadData]);

  // Persistence Effects for remaining localStorage items
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem('sb_messages', JSON.stringify(state.messages));
      localStorage.setItem('sb_moodLogs', JSON.stringify(state.moodLogs));
      localStorage.setItem('sb_helpRequests', JSON.stringify(state.helpRequests));
      localStorage.setItem('sb_studyPlans', JSON.stringify(state.studyPlans));
      localStorage.setItem('sb_interventions', JSON.stringify(state.interventions));
      localStorage.setItem('sb_pomodoro', JSON.stringify(state.pomodoroSessions));
    }
  }, [state.messages, state.moodLogs, state.helpRequests, state.studyPlans, state.interventions, state.pomodoroSessions, state.isLoading]);

  // Handle pending join code after login
  useEffect(() => {
    if (state.currentUser && pendingJoinCode && !state.isLoading) {
      joinClass(pendingJoinCode).then(() => {
        setPendingJoinCode(null);
      });
    }
  }, [state.currentUser, pendingJoinCode, state.isLoading]);

  const login = useCallback(async ({ email, password }: any) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast(error.message, 'warning');
      throw error;
    }
    showToast('Welcome back!', 'success');
  }, [showToast]);

  const signUp = useCallback(async ({ email, password, name }: any, role: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name, role }
      }
    });

    if (authError) {
      showToast(authError.message, 'warning');
      throw authError;
    }

    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert([{ id: authData.user.id, email, role, name }]);
      
      if (dbError) {
        showToast('Account created but profile failed. Please contact support.', 'warning');
      } else {
        showToast('Account created successfully!', 'success');
      }
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) showToast(error.message, 'warning');
    else showToast('Logged out successfully', 'info');
  }, [showToast]);

  const createClass = useCallback(async (className: string) => {
    if (!state.currentUser) return null;
    
    // Generate code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const { data, error } = await supabase
      .from('classes')
      .insert([{ 
        teacher_id: state.currentUser.id, 
        name: className, 
        code: code.toUpperCase() 
      }])
      .select()
      .single();

    if (error) {
      showToast('Failed to create class', 'warning');
      return null;
    }

    await loadClasses();
    return data;
  }, [state.currentUser, loadClasses, showToast]);

  const joinClass = useCallback(async (classCode: string) => {
    if (!state.currentUser) {
      setPendingJoinCode(classCode);
      showToast('Please log in to join the class', 'info');
      return;
    }

    const trimmedCode = classCode.trim().toUpperCase();
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('code', trimmedCode)
      .single();

    if (classError || !classData) {
      showToast("We couldn't find that code.", 'warning');
      return;
    }

    const { error: joinError } = await supabase
      .from('class_members')
      .insert([{ class_id: classData.id, student_id: state.currentUser.id }]);

    if (joinError) {
      if (joinError.code === '23505') { // Unique violation
        showToast("You're already in this class.", 'info');
      } else {
        showToast('Failed to join class', 'warning');
      }
    } else {
      showToast(`You joined ${classData.name}!`, 'success');
    }
  }, [state.currentUser, showToast]);

  // STUBBED OR REMAINING LOCALSTORAGE LOGIC (To be migrated as needed)
  const updateUser = useCallback((updatedUser: User) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
      currentUser: prev.currentUser?.id === updatedUser.id ? updatedUser : prev.currentUser
    }));
  }, []);

  const addUser = useCallback((user: User) => {
    setState(prev => ({
      ...prev,
      users: [...prev.users, user],
      currentUser: user
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
  }, [state.currentUser]);

  const addHelpRequest = useCallback((req: Omit<HelpRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: HelpRequest = {
      ...req,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      status: 'pending'
    };
    setState(prev => ({ ...prev, helpRequests: [...prev.helpRequests, newReq] }));
  }, []);

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
  }, []);

  const regenerateClassCode = useCallback((classId: string) => {
    // Implement as needed
  }, []);

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

  const approveJoinRequest = useCallback((requestId: string) => {
    // Implement as needed
  }, []);

  const rejectJoinRequest = useCallback((requestId: string) => {
    // Implement as needed
  }, []);

  const leaveClass = useCallback((classId: string) => {
    // Implement as needed
  }, []);

  const value = useMemo(() => ({
    ...state,
    login,
    signUp,
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
    pendingJoinCode,
    setPendingJoinCode,
  }), [state, login, signUp, logout, updateUser, addUser, addMessage, addMoodLog, addHelpRequest, updateHelpRequest, addStudyPlanTask, addIntervention, addPomodoroSession, showToast, markBatchAsRead, createClass, regenerateClassCode, updateClass, archiveClass, joinClass, approveJoinRequest, rejectJoinRequest, leaveClass, pendingJoinCode]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
