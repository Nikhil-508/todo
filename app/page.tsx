"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Pencil, 
  X, 
  Check, 
  ClipboardList,
  Search,
  Tag,
  AlertCircle,
  Bell
} from "lucide-react";

type Priority = "low" | "medium" | "high";
type Category = "work" | "personal" | "growth" | "urgent";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  category: Category;
};

type FilterType = "all" | "pending" | "completed";

// Sound URLs
const SOUNDS = {
  click: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  delete: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
};

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("personal");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastDeleted, setLastDeleted] = useState<Todo | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("simpleflow-todos-v2");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse todos", e);
      }
    }
    setIsMounted(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("simpleflow-todos-v2", JSON.stringify(todos));
    }
  }, [todos, isMounted]);

  const playSound = useCallback((type: keyof typeof SOUNDS) => {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.2;
    audio.play().catch(() => {});
  }, []);

  // Aura Themes Logic
  const auraTheme = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "from-[#ff9a9e] via-[#fecfef] to-[#feada6]"; // Morning
    if (hour >= 11 && hour < 17) return "from-[#e0c3fc] via-[#8ec5fc] to-[#e0c3fc]"; // Day
    if (hour >= 17 && hour < 21) return "from-[#667eea] via-[#764ba2] to-[#667eea]"; // Evening
    return "from-[#09203f] via-[#537895] to-[#09203f]"; // Night
  }, []);

  const progress = useMemo(() => {
    if (todos.length === 0) return 0;
    const completedCount = todos.filter(t => t.completed).length;
    return Math.round((completedCount / todos.length) * 100);
  }, [todos]);

  // Confetti celebration
  useEffect(() => {
    if (progress === 100 && todos.length > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#ec4899"]
      });
    }
  }, [progress, todos.length]);

  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
      priority,
      category
    };

    setTodos([newTodo, ...todos]);
    setInputValue("");
    playSound("click");
  };

  const toggleTodo = (id: string) => {
    const newTodos = todos.map(t => {
      if (t.id === id) {
        if (!t.completed) playSound("success");
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTodos(newTodos);
  };

  const deleteTodo = (id: string) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (todoToDelete) {
      setLastDeleted(todoToDelete);
      setShowUndo(true);
      setTodos(todos.filter(t => t.id !== id));
      playSound("delete");
      setTimeout(() => setShowUndo(false), 5000);
    }
  };

  const undoDelete = () => {
    if (lastDeleted) {
      setTodos([lastDeleted, ...todos]);
      setLastDeleted(null);
      setShowUndo(false);
      playSound("click");
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    setTodos(todos.map(t => t.id === editingId ? { ...t, text: editText.trim() } : t));
    setEditingId(null);
    playSound("click");
  };

  const filteredTodos = todos.filter(todo => {
    const matchesFilter = 
      filter === "all" ? true :
      filter === "completed" ? todo.completed :
      !todo.completed;
    
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (!isMounted) return null;

  return (
    <main className={`min-h-screen bg-gradient-to-br ${auraTheme} flex flex-col items-center py-12 px-4 sm:px-6 transition-colors duration-1000`}>
      <div className="max-w-md w-full space-y-8">
        
        {/* Progress & Header */}
        <header className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-white/50 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="364.4"
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 - (364.4 * progress) / 100 }}
                  className="text-indigo-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{progress}%</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Done</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">SimpleFlow</h1>
            <p className="text-slate-500 text-xs font-medium">Daily Harmony & Productivity</p>
          </div>
        </header>

        {/* Input & Options */}
        <section className="bg-white/90 backdrop-blur-lg p-6 rounded-[2rem] shadow-xl border border-white/50 space-y-4">
          <form onSubmit={addTodo} className="relative group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What's your next flow?"
              className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 pr-14 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-2 p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="flex gap-2">
            <div className="flex-1 flex gap-1 bg-slate-50 p-1 rounded-xl">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPriority(p); playSound("click"); }}
                  className={`flex-1 py-1 text-[10px] uppercase font-bold rounded-lg transition-all ${
                    priority === p ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex-1 flex gap-1 bg-slate-50 p-1 rounded-xl overflow-x-auto no-scrollbar">
              {(["work", "personal", "growth", "urgent"] as Category[]).map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); playSound("click"); }}
                  className={`px-3 py-1 text-[10px] uppercase font-bold rounded-lg whitespace-nowrap transition-all ${
                    category === c ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Filters & List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex bg-white/40 backdrop-blur p-1 rounded-xl border border-white/40">
              {(["all", "pending", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); playSound("click"); }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                    filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-xs text-white placeholder:text-white/60 focus:outline-none focus:bg-white/30 transition-all w-24 sm:w-32 focus:w-40"
              />
            </div>
          </div>

          <section className="space-y-3 min-h-[200px]">
            <AnimatePresence mode="popLayout">
              {filteredTodos.length > 0 ? (
                filteredTodos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className={`group relative flex items-center gap-3 bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border-2 transition-all ${
                      todo.completed 
                        ? "border-transparent bg-white/50 opacity-70" 
                        : todo.priority === "high" ? "border-rose-100 hover:border-rose-200" 
                        : todo.priority === "medium" ? "border-indigo-100 hover:border-indigo-200" 
                        : "border-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        todo.completed 
                          ? "bg-indigo-500 border-indigo-500 text-white" 
                          : "border-slate-200 text-transparent hover:border-indigo-400 group-hover:bg-indigo-50/50"
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div className="flex-grow min-w-0">
                      {editingId === todo.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            className="w-full bg-transparent text-slate-700 outline-none border-b-2 border-indigo-300"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className={`block truncate font-semibold text-slate-700 transition-all ${todo.completed ? "line-through text-slate-400" : ""}`}>
                            {todo.text}
                          </span>
                          <div className="flex gap-2">
                            <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full ${
                              todo.priority === "high" ? "bg-rose-50 text-rose-500" :
                              todo.priority === "medium" ? "bg-indigo-50 text-indigo-500" :
                              "bg-slate-50 text-slate-400"
                            }`}>
                              {todo.priority}
                            </span>
                            <span className="text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              {todo.category}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!todo.completed && editingId !== todo.id && (
                        <button
                          onClick={() => { startEditing(todo); playSound("click"); }}
                          className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center space-y-4"
                >
                  <div className="bg-white/20 backdrop-blur-md p-8 rounded-full border border-white/20">
                    <ClipboardList className="w-16 h-16 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Clear Sky</p>
                    <p className="text-white/60 text-sm">No tasks in this flow. Add one to begin.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Undo Notification */}
        <AnimatePresence>
          {showUndo && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-6 z-50 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-sm font-bold tracking-tight">Task removed</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={undoDelete}
                  className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-black hover:bg-indigo-50 transition-colors"
                >
                  UNDO
                </button>
                <button onClick={() => setShowUndo(false)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
