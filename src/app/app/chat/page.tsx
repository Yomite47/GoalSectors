'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/lib/store';
import { Send, Bot, User, CheckCircle2, Sparkles, Flame, Coffee, ThumbsUp, ThumbsDown } from 'lucide-react';
import { clsx } from 'clsx';

import { EvalResult } from '@/lib/ai/eval';
import { getStore } from '@/lib/data';
import { supabase } from '@/lib/supabaseClient';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionsApplied?: number;
  evalResult?: EvalResult;
  traceId?: string;
  runId?: string;
  feedbackGiven?: boolean;
};

type Mode = 'coach' | 'strict' | 'chill';

export default function ChatPage() {
  const { profile, updateProfile, isLoading } = useUser(); // Using updateProfile just to trigger re-renders if needed, but mainly we need ID
  // Note: We need a way to trigger refreshData globally. The context exposes updateProfile but not explicit refresh. 
  // However, actions are applied on server/store. To see changes, we might need to reload or rely on optimistic updates if we had them.
  // Since this is a separate page, when user navigates back to dashboard, it will likely re-fetch or use stale data. 
  // Ideally we should expose refreshData in context, but for MVP we can rely on page navigation or simple context updates.
  // Actually, we can add a dummy update to force refresh if the context supports it, or just accept that "Tasks" page will reload when visited.
  // Wait, UserContext *does* have internal refreshData but it's not exposed. 
  // Let's just trust the user will see updates when they navigate away.
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I\'m your productivity coach. What do you want to get done today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('coach');
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Plan my day",
    "Create a reading habit",
    "Set a goal to run 5k",
    "What should I focus on?"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isLoading) return;

    if (!profile.id) {
        console.error("User ID is missing");
        setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: "I'm having trouble identifying your session. Please refresh the page."
        }]);
        return;
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const promptVersion = localStorage.getItem('prompt_version') || 'A';
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          message: userMsg.content,
          mode,
          enabledSectors: profile.enabledSectors, // Pass client state for better local sync
          promptVersion
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      // Sync actions to client-side store (since server store is ephemeral/disconnected)
      if (data.actions && data.actions.length > 0) {
        try {
            const store = getStore();
            // Ensure user exists locally before syncing
            await store.getOrCreateUser(profile.id);
            
            const sectors = profile.enabledSectors || [];
            
            for (const action of data.actions) {
                if (action.type === 'CREATE_TASK' && sectors.includes('Productivity')) {
                    if (action.payload.title) {
                        await store.createTask(
                            profile.id, 
                            action.payload.title, 
                            action.payload.due_date || new Date().toISOString().split('T')[0]
                        );
                    }
                } 
                else if (action.type === 'CREATE_HABIT' && sectors.includes('Habits')) {
                    if (action.payload.title) {
                        await store.createHabit(profile.id, action.payload.title);
                    }
                }
                else if (action.type === 'CREATE_GOAL_PLAN' && sectors.includes('Goals')) {
                     // Complex goal plans might need more care, but basic implementation:
                     const { goal_id, milestones, weekly_plan } = action.payload;
                     
                     if (Array.isArray(milestones)) {
                         for (const m of milestones) {
                            if (m.title) {
                                await store.createMilestone(profile.id, goal_id, m.title, m.target_date);
                            }
                         }
                     }
                     
                     if (Array.isArray(weekly_plan)) {
                         for (const p of weekly_plan) {
                            if (p.week_start && p.focus) {
                                await store.upsertWeeklyPlan(profile.id, goal_id, p.week_start, p.focus);
                            }
                         }
                     }
                }
            }
        } catch (err: any) {
            console.error("Failed to sync actions locally:", err.message, err);
        }
      }

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.assistant_message,
        actionsApplied: data.actions_applied,
        evalResult: data.eval,
        traceId: data.traceId,
        runId: data.runId
      };
      
      if (data.traceId) {
          try {
            localStorage.setItem('opik_last_trace', new Date().toISOString());
          } catch (e) {
            // Ignore storage errors
          }
      }

      setMessages(prev => [...prev, botMsg]);

      // Sync to LocalStore for Ops Dashboard (if not using Supabase)
      if (!supabase && data.eval) {
        try {
          const store = getStore();
          // Ensure user exists locally
          await store.getOrCreateUser(profile.id);
          
          const runId = await store.logAiRun(
            profile.id,
            '/api/coach',
            userMsg.content,
            data.assistant_message,
            data.eval.scores.schema === 25,
            data.latency_ms || 0
          );
          
          await store.logAiEval(profile.id, runId, data.eval);
        } catch (err) {
          console.error("Failed to sync run to local store:", err);
        }
      }

    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${error.message}. Please check your API key.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (msgId: string, runId: string, traceId: string | undefined, score: number) => {
    // Optimistic update
    setMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, feedbackGiven: true } : m
    ));

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, runId, traceId, score })
      });
    } catch (err) {
      console.error("Failed to send feedback:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col -m-4 sm:m-0">
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-100 sm:rounded-t-xl">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bot className="text-blue-600" />
          AI Coach
        </h1>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setMode('strict')}
            className={clsx("p-2 rounded-md transition-all", mode === 'strict' ? "bg-white shadow text-red-600" : "text-gray-400 hover:text-gray-600")}
            title="Strict Mode"
          >
            <Flame size={18} />
          </button>
          <button 
            onClick={() => setMode('coach')}
            className={clsx("p-2 rounded-md transition-all", mode === 'coach' ? "bg-white shadow text-blue-600" : "text-gray-400 hover:text-gray-600")}
            title="Coach Mode"
          >
            <Sparkles size={18} />
          </button>
          <button 
            onClick={() => setMode('chill')}
            className={clsx("p-2 rounded-md transition-all", mode === 'chill' ? "bg-white shadow text-green-600" : "text-gray-400 hover:text-gray-600")}
            title="Chill Mode"
          >
            <Coffee size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
        {messages.map(m => (
          <div key={m.id} className={clsx("flex gap-3 max-w-[85%]", m.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", 
              m.role === 'user' ? "bg-gray-200" : "bg-blue-600 text-white"
            )}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={clsx(
              "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
              m.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none"
            )}>
              <p className="whitespace-pre-wrap">{m.content}</p>
              
              {m.actionsApplied !== undefined && m.actionsApplied > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs font-bold text-green-600">
                  <CheckCircle2 size={14} />
                  <span>Done: {m.actionsApplied} action{m.actionsApplied > 1 ? 's' : ''} applied</span>
                </div>
              )}

              {/* Eval Scores - Debug Only (Hidden for Production) */}
              {/*
              {m.evalResult && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                  <div className="font-semibold mb-1">Run score: {m.evalResult.score_total}/100</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span title="Schema Validity">
                      Schema: {m.evalResult.scores.schema > 0 ? '✅' : '❌'}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span title="Sector Compliance">
                      Sector: {m.evalResult.scores.sector_compliance > 0 ? '✅' : '❌'}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span title="Usefulness">
                      Useful: {m.evalResult.scores.usefulness > 0 ? '✅' : '❌'}
                    </span>
                  </div>
                  
                  // User Feedback Loop
                  {m.runId && !m.feedbackGiven && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                      <span className="text-gray-400">Rate this response:</span>
                      <button 
                        onClick={() => handleFeedback(m.id, m.runId!, m.traceId, 1)}
                        className="p-1 hover:bg-green-100 hover:text-green-600 rounded text-gray-400 transition-colors"
                        title="Good response"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button 
                        onClick={() => handleFeedback(m.id, m.runId!, m.traceId, 0)}
                        className="p-1 hover:bg-red-100 hover:text-red-600 rounded text-gray-400 transition-colors"
                        title="Bad response"
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  )}
                  {m.feedbackGiven && (
                     <div className="mt-2 pt-1 text-[10px] text-gray-400 italic">
                       Thanks for your feedback!
                     </div>
                  )}
                </div>
              )}
              */}
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex gap-3 max-w-[85%]">
             <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-400 text-sm">
               Thinking...
             </div>
           </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 sm:rounded-b-xl">
        {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
                {suggestedPrompts.map((prompt) => (
                    <button
                        key={prompt}
                        onClick={() => {
                            setInput(prompt);
                            // Optional: auto-submit or just fill
                        }}
                        className="whitespace-nowrap px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
