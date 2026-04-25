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
  const { signUp, login, showToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    schoolCode: '',
    childStudentId: ''
  });

  const validRole = (role as UserRole) || 'student';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }, validRole);
        navigate('/');
      } else {
        await login({
          email: formData.email,
          password: formData.password
        });
        navigate('/');
      }
    } catch (error) {
      // Error handled in AppContext (toast)
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-100 transition-all mt-4 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
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
