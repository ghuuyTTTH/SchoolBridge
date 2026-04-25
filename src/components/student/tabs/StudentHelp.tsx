/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Brain, 
  Mic, 
  Send, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { cn } from '../../../lib/utils';

interface StudentHelpProps {
  onNavigate: (tab: string) => void;
}

const StudentHelp: React.FC<StudentHelpProps> = ({ onNavigate }) => {
  const { currentUser, addHelpRequest, showToast } = useApp();
  const [form, setForm] = useState({
    subject: '',
    body: '',
    anonymous: false
  });
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.body) return;

    addHelpRequest({
      studentId: currentUser!.id,
      subject: form.subject,
      body: form.body,
      anonymous: form.anonymous
    });

    setForm({ subject: '', body: '', anonymous: false });
    showToast('Your question was sent! You\'ll hear back soon.', 'success');
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Voice input not supported on this device', 'warning');
      return;
    }

    setIsRecording(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm(prev => ({ ...prev, body: prev.body + (prev.body ? ' ' : '') + transcript }));
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">SUPPORT</h2>
        <p className="text-xs text-slate-500 font-medium font-serif italic">Choose how you'd like to get support today.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ask AI Option */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('study')}
          className="p-6 bg-indigo-600 rounded-2xl border border-indigo-700 text-white text-left shadow-lg shadow-indigo-100 flex flex-col items-start gap-6 relative overflow-hidden"
        >
          <div className="p-3 bg-white/20 rounded-xl">
            <Brain size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1 tracking-tight">Ask the AI Tutor</h3>
            <p className="text-indigo-100 text-[11px] leading-relaxed mb-6 font-medium italic opacity-80">
              Get instant explanations, practice quizzes, and summaries anytime.
            </p>
            <div className="flex items-center gap-2 font-bold text-[10px] bg-white/10 px-4 py-2 rounded-lg border border-white/20 uppercase tracking-widest">
              Start Session <ChevronRight size={14} />
            </div>
          </div>
        </motion.button>

        {/* Ask Teacher Form */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400 border border-slate-100">
              <Users size={18} />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight uppercase">Ask your teacher</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-xs appearance-none"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
              >
                <option value="">Select a subject</option>
                {currentUser?.subjects?.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Question</label>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  placeholder="Ask anything..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium resize-none text-xs"
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                />
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={cn(
                    "absolute bottom-4 right-4 p-2 rounded-lg transition-all shadow-sm",
                    isRecording ? "bg-amber-400 text-white animate-pulse" : "bg-white text-slate-400 hover:text-indigo-600 border border-slate-100"
                  )}
                >
                  <Mic size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.anonymous}
                  onChange={e => setForm({ ...form, anonymous: e.target.checked })}
                />
                <div className={cn(
                  "w-4 h-4 rounded border transition-all flex items-center justify-center",
                  form.anonymous ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-slate-50 group-hover:border-slate-400"
                )}>
                  {form.anonymous && <ShieldCheck size={10} />}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Anonymous</span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold transition-all hover:bg-indigo-700 active:scale-95 shadow-sm uppercase text-xs tracking-widest"
            >
              Send Question
            </motion.button>
          </form>
        </section>
      </div>

      {isRecording && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-1.5 h-12">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [20, 60, 20] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                  className="w-1.5 bg-indigo-400 rounded-full"
                />
              ))}
            </div>
            <p className="text-xl font-bold text-white">Listening...</p>
            <button 
              onClick={() => setIsRecording(false)}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all font-bold"
            >
              Cancel recording
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHelp;
