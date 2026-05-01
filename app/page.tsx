"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Pencil, 
  X, 
  Check, 
  ClipboardList,
  Filter,
  Search
} from "lucide-react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

type FilterType = "all" | "pending" | "completed";

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastDeleted, setLastDeleted] = useState<Todo | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("simpleflow-todos");
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
      localStorage.setItem("simpleflow-todos", JSON.stringify(todos));
    }
  }, [todos, isMounted]);

  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos([newTodo, ...todos]);
    setInputValue("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (todoToDelete) {
      setLastDeleted(todoToDelete);
      setShowUndo(true);
      setTodos(todos.filter(t => t.id !== id));
      
      // Auto hide undo after 5 seconds
      setTimeout(() => setShowUndo(false), 5000);
    }
  };

  const undoDelete = () => {
    if (lastDeleted) {
      setTodos([lastDeleted, ...todos]);
      setLastDeleted(null);
      setShowUndo(false);
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
    <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <ClipboardList className="w-8 h-8 text-indigo-400" />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-slate-800 tracking-tight"
          >
            SimpleFlow
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-sm"
          >
            Stay focused, stay productive.
          </motion.p>
        </header>

        {/* Search & Add Section */}
        <section className="space-y-4">
          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={addTodo}
            className="relative group"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new task..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 pr-14 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-2 p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </motion.form>

          {/* Filters & Search */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between"
          >
            <div className="flex bg-white/50 p-1 rounded-xl border border-slate-200/60 self-start">
              {(["all", "pending", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                    filter === f 
                      ? "bg-white text-slate-800 shadow-sm border border-slate-100" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-transparent border-b border-slate-200 text-xs text-slate-600 focus:outline-none focus:border-indigo-300 transition-all placeholder:text-slate-400 w-full sm:w-32 focus:sm:w-48"
              />
            </div>
          </motion.div>
        </section>

        {/* Todo List */}
        <section className="space-y-3 min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className={`group relative flex items-center gap-3 bg-white p-4 rounded-2xl border transition-all ${
                    todo.completed ? "border-slate-100 bg-slate-50/50" : "border-slate-200 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-500/5"
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 transition-colors ${
                      todo.completed ? "text-emerald-500" : "text-slate-300 hover:text-indigo-400"
                    }`}
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-6 h-6 fill-emerald-50" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div className="flex-grow min-w-0">
                    {editingId === todo.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-full bg-transparent text-slate-700 outline-none border-b border-indigo-300"
                        />
                        <button onClick={saveEdit} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded-md">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-md">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`block truncate text-slate-700 transition-all ${todo.completed ? "line-through text-slate-400" : ""}`}>
                        {todo.text}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!todo.completed && editingId !== todo.id && (
                      <button
                        onClick={() => startEditing(todo)}
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
                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <div className="bg-slate-50 p-6 rounded-full">
                  <ClipboardList className="w-12 h-12 text-slate-200" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">
                    {searchQuery ? "No matching tasks" : "Your list is empty"}
                  </p>
                  <p className="text-slate-300 text-sm">
                    {searchQuery ? "Try searching for something else" : "Add a task to get started"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Footer info */}
        {todos.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] uppercase tracking-wider text-slate-400 font-semibold"
          >
            <span>{todos.filter(t => !t.completed).length} items left</span>
            <button 
              onClick={() => {
                const completed = todos.filter(t => t.completed);
                if (completed.length > 0) {
                  setTodos(todos.filter(t => !t.completed));
                }
              }}
              className="hover:text-rose-400 transition-colors"
            >
              Clear completed
            </button>
          </motion.div>
        )}
      </div>

      {/* Undo Notification */}
      <AnimatePresence>
        {showUndo && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-50"
          >
            <span className="text-sm font-medium">Task deleted</span>
            <button 
              onClick={undoDelete}
              className="text-indigo-300 text-sm font-bold hover:text-indigo-200 transition-colors"
            >
              UNDO
            </button>
            <button onClick={() => setShowUndo(false)} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
