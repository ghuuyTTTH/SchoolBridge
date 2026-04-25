/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

const OnboardingTour: React.FC = () => {
  const { currentUser, updateUser } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (currentUser?.firstTimeUser) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, [currentUser]);

  const studentSteps = [
    { title: "Home base", text: "This is your home base — everything starts here.", target: "nav button:nth-child(1)" },
    { title: "Express yourself", text: "Log how you're feeling each day. It helps us support you.", target: "section:nth-of-type(2)" },
    { title: "Ask away", text: "Stuck on something? Ask your teacher or the AI tutor.", target: "nav button:nth-child(3)" },
    { title: "Focus up", text: "Use the timer to stay focused. You earn points for every session.", target: "nav button:nth-child(4)" },
    { title: "Level up", text: "You earn points for showing up and asking for help. Keep going.", target: "section:nth-of-type(3)" },
  ];

  const teacherSteps = [
    { title: "Class Code", text: "Share this code with your students to connect them to your class.", target: "section:nth-of-type(1) div.bg-white" },
    { title: "Your Students", text: "See all your linked students and their recent activity here.", target: "aside nav button:nth-child(2)" },
    { title: "Silent Struggle", text: "We'll flag students who may need a check-in so you can reach out early.", target: "section:nth-of-type(3)" },
    { title: "Support Flow", text: "Send encouragement or assign practice with one tap.", target: "section:nth-of-type(3) div.p-4" },
  ];

  const parentSteps = [
    { title: "Child Snapshot", text: "This is a quick snapshot of how your child is doing.", target: "section:nth-of-type(1)" },
    { title: "Stay in touch", text: "Communicate directly with your child's teacher here.", target: "nav button:nth-child(2)" },
    { title: "Daily Tips", text: "We'll suggest specific ways to support your child based on their activity.", target: "section:nth-of-type(2) section:nth-of-type(2)" },
  ];

  const steps = useMemo(() => {
    if (currentUser?.role === 'student') return studentSteps;
    if (currentUser?.role === 'teacher') return teacherSteps;
    if (currentUser?.role === 'parent') return parentSteps;
    return [];
  }, [currentUser]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    if (currentUser) {
      updateUser({ ...currentUser, firstTimeUser: false });
    }
  };

  if (!isVisible || steps.length === 0) return null;

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl relative border border-slate-200 animate-bounce-subtle pointer-events-auto"
      >
        <div className="flex items-center justify-between mb-2">
           <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase rounded-full">
             STEP {currentStep + 1} OF {steps.length}
           </span>
           <button onClick={completeTour} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter hover:text-slate-600 transition-colors">
              Skip Tour
           </button>
        </div>

        <h3 className="text-sm font-bold text-slate-800 mb-4">{current.text}</h3>

        <div className="flex items-center justify-between">
           <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === currentStep ? "bg-indigo-600" : "bg-slate-200")} />
              ))}
           </div>
           
           <button 
            onClick={handleNext}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all hover:bg-indigo-700 active:scale-95 shadow-sm"
           >
             {currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingTour;
