/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, Briefcase, Heart, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types';
import { cn } from '../../lib/utils';

const RoleSelection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student' as UserRole,
      title: 'Student',
      description: 'Track your progress and get help when you need it',
      icon: GraduationCap,
      color: 'text-indigo-600',
    },
    {
      id: 'teacher' as UserRole,
      title: 'Teacher',
      description: 'Monitor your class and support struggling students',
      icon: Briefcase,
      color: 'text-emerald-500',
    },
    {
      id: 'parent' as UserRole,
      title: 'Parent',
      description: "Stay updated on your child's learning journey",
      icon: Heart,
      color: 'text-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <GraduationCap size={28} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">SchoolBridge</h1>
      </motion.div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {roles.map((role) => (
          <motion.button
            key={role.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole(role.id)}
            className={cn(
              "p-8 rounded-3xl border-2 transition-all flex flex-col items-center text-center",
              selectedRole === role.id 
                ? "border-indigo-600 bg-indigo-50/30" 
                : "border-slate-100 hover:border-slate-200 bg-white"
            )}
          >
            <div className={cn("mb-6 p-4 rounded-2xl bg-white shadow-sm border border-slate-100", role.color)}>
              <role.icon size={32} />
            </div>
            <h2 className="text-xl font-bold mb-3 text-slate-900">{role.title}</h2>
            <p className="text-slate-500 leading-relaxed text-sm">
              {role.description}
            </p>
          </motion.button>
        ))}
      </div>

      <motion.button
        disabled={!selectedRole}
        onClick={() => selectedRole && navigate(`/auth/${selectedRole}`)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "px-12 py-4 rounded-2xl font-bold transition-all flex items-center gap-3",
          selectedRole 
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        )}
      >
        Continue
        <ArrowRight size={20} />
      </motion.button>
    </div>
  );
};

export default RoleSelection;
