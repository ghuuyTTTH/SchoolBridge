/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, ArrowLeft, Mail, Lock, User as UserIcon, Hash, School, Smartphone } from 'lucide-react';
import { UserRole, User } from '../../types';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

const AuthForm: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { users, addUser, login, showToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    schoolCode: '',
    childStudentId: ''
  });

  const validRole = (role as UserRole) || 'student';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      if (users.find(u => u.email === formData.email)) {
        showToast('Account with this email already exists', 'warning');
        return;
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: validRole,
        createdAt: Date.now(),
        linkedIds: [],
        firstTimeUser: true,
        xp: validRole === 'student' ? 0 : undefined,
        level: validRole === 'student' ? 'Explorer' : undefined,
        studentId: validRole === 'student' ? formData.studentId : undefined,
        schoolCode: validRole === 'teacher' ? formData.schoolCode : undefined,
      };
      
      // If parent signing up with a child student ID, we'll handle actual linking in dashboard
      // but we store it for now or just wait for dashboard. Prompt says "Parent: Full name, Email, Password, Child's student ID"
      
      addUser(newUser);
      showToast('Account created successfully!', 'success');
      navigate('/');
    } else {
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        if (user.role !== validRole) {
          showToast(`This account is registered as a ${user.role}`, 'warning');
          return;
        }
        login(user);
        navigate('/');
      } else {
        showToast('Invalid email or password', 'warning');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate('/role')}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm"
      >
        <ArrowLeft size={18} />
        Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white mb-4">
             <div className="w-6 h-1 bg-white rounded-full rotate-45 translate-y-0.5"></div>
             <div className="w-6 h-1 bg-white rounded-full -rotate-45 -translate-y-0.5"></div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
            {isSignUp ? `Join as a ${validRole}` : `Welcome back, ${validRole}`}
          </h1>
        </div>

        <div className="space-y-3 mb-8">
          <button className="w-full py-3 px-4 flex items-center justify-center gap-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-700 active:scale-[0.98]">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.32-2.11 4.5-.74.74-1.9 1.54-4.11 1.54-4.01 0-7.26-3.25-7.26-7.26s3.25-7.26 7.26-7.26c2.09 0 3.73.81 4.83 1.89l2.3-2.3C19.46 3.1 16.6 2 12.48 2 6.48 2 1.6 6.88 1.6 12.88s4.88 10.88 10.88 10.88c4.4 0 7.75-1.45 10.33-4.11 2.67-2.67 3.51-6.44 3.51-9.56 0-.67-.05-1.32-.16-1.91h-13.68z" />
            </svg>
            Continue with Google
          </button>
          <button className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-[#00A4EF] text-white rounded-xl hover:bg-[#0094D8] transition-all font-bold text-sm active:scale-[0.98]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
               <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
            </svg>
            Continue with Microsoft
          </button>
        </div>

        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <span className="relative px-4 bg-white text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">or use email</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input
                required
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium placeholder:text-slate-300 text-sm"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <input
              required
              type="email"
              placeholder="you@school.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium placeholder:text-slate-300 text-sm"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
            </div>
            <input
              required
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium placeholder:text-slate-300 text-sm"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {isSignUp && validRole === 'student' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Student ID</label>
              <input
                required
                type="text"
                placeholder="e.g. STU12345"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium placeholder:text-slate-300 text-sm"
                value={formData.studentId}
                onChange={e => setFormData({ ...formData, studentId: e.target.value })}
              />
            </div>
          )}

          {isSignUp && validRole === 'teacher' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">School Code</label>
              <input
                required
                type="text"
                placeholder="e.g. SCH789"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium placeholder:text-slate-300 text-sm"
                value={formData.schoolCode}
                onChange={e => setFormData({ ...formData, schoolCode: e.target.value })}
              />
            </div>
          )}

          {isSignUp && validRole === 'parent' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Child's Student ID</label>
              <input
                required
                type="text"
                placeholder="e.g. STU12345"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium placeholder:text-slate-300 text-sm"
                value={formData.childStudentId}
                onChange={e => setFormData({ ...formData, childStudentId: e.target.value })}
              />
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-100 transition-all mt-4 active:scale-[0.97]"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthForm;
