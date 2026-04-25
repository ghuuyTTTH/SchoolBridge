/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User as UserIcon, Brain, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../../../../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const starterChips = [
    "Explain this to me simply",
    "Quiz me on this topic",
    "Summarize my notes",
    "Help me make a study plan"
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const chatHistory = messages.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n');
      const prompt = `
        ${chatHistory}
        Student: ${text}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a friendly, patient AI tutor for school students. Adapt your explanation complexity to the student's level. Use simple language. Encourage the student. Never give direct homework answers — guide them to find the answer themselves.",
        },
      });

      const aiText = response.text || "I'm sorry, I couldn't generate a response.";
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: aiText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setError("I'm having trouble connecting. Try again in a moment.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] max-h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">AI Tutor</h3>
            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Status: Ready</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth bg-slate-50/20"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xs mx-auto space-y-6">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300">
               <Brain size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">How can I help you learn today?</h4>
              <p className="text-xs text-slate-400 mt-1 font-medium font-serif italic">
                Ask me to explain a concept or quiz you.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {starterChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-slate-50 transition-all font-sans uppercase tracking-widest"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-end gap-3",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "max-w-[85%] p-4 rounded-xl text-xs leading-relaxed shadow-sm font-medium",
              msg.role === 'user' 
                ? "bg-indigo-600 text-white rounded-br-none font-sans" 
                : "bg-white text-slate-700 rounded-bl-none border border-slate-100 font-serif"
            )}>
              {msg.text}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-3">
            <div className="bg-white p-4 rounded-xl rounded-bl-none border border-slate-100 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-1 h-1 bg-indigo-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs font-bold justify-center">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything..."
            className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={cn(
              "p-3 rounded-xl transition-all shadow-sm",
              input.trim() && !isTyping ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-300"
            )}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITutor;
