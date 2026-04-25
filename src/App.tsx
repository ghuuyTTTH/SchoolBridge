/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import RoleSelection from './components/auth/RoleSelection';
import AuthForm from './components/auth/AuthForm';
import StudentDashboard from './components/student/StudentDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import ParentDashboard from './components/parent/ParentDashboard';
import ToastContainer from './components/ui/ToastContainer';
import OnboardingTour from './components/ui/OnboardingTour';

const AppRoutes = () => {
  const { currentUser, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/role" element={!currentUser ? <RoleSelection /> : <Navigate to="/" />} />
      <Route path="/auth/:role" element={!currentUser ? <AuthForm /> : <Navigate to="/" />} />
      
      <Route path="/" element={
        currentUser ? (
          currentUser.role === 'student' ? <StudentDashboard /> :
          currentUser.role === 'teacher' ? <TeacherDashboard /> :
          <ParentDashboard />
        ) : <Navigate to="/role" />
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
          <AppRoutes />
          <ToastContainer />
          <OnboardingTour />
        </div>
      </Router>
    </AppProvider>
  );
}
