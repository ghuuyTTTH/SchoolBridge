/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  CheckCheck,
  User as UserIcon,
  MessageCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { User, Message } from '../../types';

const Messages: React.FC = () => {
  const { currentUser, users, messages, addMessage, markBatchAsRead } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedUserId, messages]);

  const selectedUser = useMemo(() => {
    return users.find(u => u.id === selectedUserId);
  }, [selectedUserId, users]);

  // Handle Mark as Read when opening conversation
  useEffect(() => {
    if (selectedUserId && currentUser) {
      markBatchAsRead(selectedUserId, currentUser.id);
    }
  }, [selectedUserId, currentUser, markBatchAsRead]);

  const conversationList = useMemo(() => {
    if (!currentUser) return [];
    
    // Find all unique people we've conversed with or could potentially converse with
    // For now, let's show all "linked" or relevant contacts
    let potentialContacts: User[] = [];
    if (currentUser.role === 'student') {
        potentialContacts = users.filter(u => u.role === 'teacher');
    } else if (currentUser.role === 'teacher') {
        potentialContacts = users.filter(u => u.role === 'student' || u.role === 'parent');
    } else if (currentUser.role === 'parent') {
        potentialContacts = users.filter(u => u.role === 'teacher');
    }

    // Get list of users we have existing messages with
    const messagedIds = new Set(messages
      .filter(m => m.fromId === currentUser.id || m.toId === currentUser.id)
      .map(m => m.fromId === currentUser.id ? m.toId : m.fromId)
    );

    // Filter potential contacts by search
    let filtered = potentialContacts.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch && (messagedIds.has(u.id) || u.role === 'teacher'); // Show if already messaged or if teacher
    });

    return filtered.map(user => {
      const thread = messages.filter(m => 
        (m.fromId === currentUser.id && m.toId === user.id) || 
        (m.fromId === user.id && m.toId === currentUser.id)
      ).sort((a,b) => b.timestamp - a.timestamp);

      const unreadCount = messages.filter(m => 
        m.fromId === user.id && m.toId === currentUser.id && m.status === 'sent'
      ).length;

      return {
        ...user,
        lastMessage: thread[0],
        unreadCount
      };
    }).sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return b.lastMessage.timestamp - a.lastMessage.timestamp;
    });
  }, [currentUser, users, messages, searchQuery]);

  const threadMessages = useMemo(() => {
    if (!currentUser || !selectedUserId) return [];
    return messages
      .filter(m => 
        (m.fromId === currentUser.id && m.toId === selectedUserId) || 
        (m.fromId === selectedUserId && m.toId === currentUser.id)
      )
      .sort((a,b) => a.timestamp - b.timestamp);
  }, [currentUser, selectedUserId, messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !selectedUserId) return;
    
    addMessage({
      fromId: currentUser.id,
      toId: selectedUserId,
      body: inputText.trim()
    });
    setInputText('');
  };

  const formatTime = (ts: number) => {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (ts: number) => {
      return new Date(ts).toDateString() === new Date().toDateString();
  };

  return (
    <div className="flex bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-180px)] max-h-[800px]">
      {/* Sidebar List */}
      <aside className={cn(
        "w-full md:w-80 flex flex-col border-r border-slate-100",
        selectedUserId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-slate-50">
           <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight uppercase">Messages</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationList.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {conversationList.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={cn(
                    "w-full p-5 flex items-start gap-4 transition-all hover:bg-slate-50 text-left relative",
                    selectedUserId === user.id && "bg-slate-50"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold flex-shrink-0 border border-slate-200 text-xs shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{user.name}</h4>
                      {user.lastMessage && (
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex-shrink-0">
                          {formatTime(user.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    {user.lastMessage ? (
                      <p className={cn(
                        "text-[11px] truncate",
                        user.unreadCount > 0 ? "text-slate-900 font-bold" : "text-slate-400 font-medium"
                      )}>
                        {user.lastMessage.fromId === currentUser?.id && "You: "}
                        {user.lastMessage.body}
                      </p>
                    ) : (
                      <p className="text-[9px] text-indigo-600 font-black uppercase tracking-widest mt-1">Start chatting</p>
                    )}
                  </div>
                  {user.unreadCount > 0 && (
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-4 h-4 bg-indigo-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                        {user.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center px-6">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                <MessageCircle size={24} />
              </div>
              <p className="text-xs text-slate-400 font-medium italic leading-relaxed">
                 No conversations yet.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Message Thread */}
      <main className={cn(
        "flex-1 flex flex-col bg-white",
        !selectedUserId ? "hidden md:flex" : "flex"
      )}>
        {selectedUser ? (
          <>
            <header className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedUserId(null)}
                  className="md:hidden p-2 text-slate-400"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden shadow-sm border border-slate-100 text-xs">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                   <h4 className="font-bold text-slate-900 text-sm leading-none mb-1">{selectedUser.name}</h4>
                   <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Online</p>
                </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                <MoreVertical size={18} />
              </button>
            </header>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 flex flex-col bg-slate-50/20"
            >
              {threadMessages.length > 0 ? (
                threadMessages.map((msg, i) => {
                  const isMine = msg.fromId === currentUser?.id;
                  const showTime = i === 0 || threadMessages[i-1].fromId !== msg.fromId || msg.timestamp - threadMessages[i-1].timestamp > 300000;
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex flex-col max-w-[85%] sm:max-w-[75%] space-y-1",
                        isMine ? "self-end items-end" : "self-start items-start"
                      )}
                    >
                      {showTime && (
                         <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-2 mb-1 flex items-center gap-1">
                            {formatTime(msg.timestamp)}
                         </div>
                      )}
                      <div className={cn(
                        "p-3.5 rounded-xl text-xs leading-relaxed shadow-sm",
                        isMine 
                          ? "bg-indigo-600 text-white rounded-tr-none" 
                          : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                      )}>
                        {msg.body}
                      </div>
                      {isMine && (
                        <div className="flex items-center gap-1 uppercase tracking-widest px-1">
                           <span className="text-[8px] font-black text-slate-300">
                             {msg.status === 'read' ? 'Read' : 'Delivered'}
                           </span>
                           <CheckCheck size={10} className={cn("transition-colors", msg.status === 'read' ? "text-emerald-500" : "text-slate-200")} />
                        </div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 mb-3 border border-white shadow-sm">
                      <MessageCircle size={24} />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your conversation starts here.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
               <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                  <input 
                    type="text"
                    placeholder="Message..."
                    className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                  />
                  <button 
                    disabled={!inputText.trim()}
                    type="submit"
                    className={cn(
                      "p-3 rounded-xl transition-all shadow-sm",
                      inputText.trim() ? "bg-indigo-600 text-white shadow-indigo-100" : "bg-slate-200 text-white cursor-not-allowed"
                    )}
                  >
                    <Send size={18} />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs mx-auto space-y-6">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-xl border border-slate-100">
                <MessageCircle size={32} />
             </div>
             <div>
                <h4 className="text-base font-bold text-slate-900 mb-1 uppercase tracking-tight">Select conversation</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-bold italic px-4">
                  Pick a recipient to start messaging.
                </p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
