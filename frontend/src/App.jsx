import React, { useState } from 'react';
import ChatBox from './components/ChatBox';
import { Plus, MessageSquare, PanelLeftClose, ChevronDown, User } from 'lucide-react';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-row h-screen w-full bg-surface-base text-text-secondary overflow-hidden font-sans">
      
      {/* Sidebar - Elevated Slate */}
      <div className={`flex-shrink-0 flex flex-col border-r border-border-light bg-surface-sidebar transition-all duration-300 shadow-xl z-20 ${sidebarOpen ? 'w-[280px]' : 'w-0 overflow-hidden border-none'}`}>
        <div className="p-4 w-[280px]">
          <button className="w-full flex items-center gap-3 bg-accent-iris hover:bg-indigo-600 text-white px-4 py-3 rounded-xl transition-all font-medium text-sm shadow-md shadow-accent-iris/20 group">
            <Plus size={18} strokeWidth={2.5} />
            <span>New Chat</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2 w-[280px]">
          <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-3 px-1">Today</div>
          <button className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-hover/50 border border-border-active text-text-primary text-sm mb-1 transition-all shadow-sm">
            <MessageSquare size={16} className="text-accent-iris" />
            <span className="truncate font-medium">Placement-level UI</span>
          </button>
          <button className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-hover/30 text-text-tertiary hover:text-text-primary text-sm transition-all outline-none">
            <MessageSquare size={16} />
            <span className="truncate">RAG Hybrid Search</span>
          </button>
        </div>

        <div className="p-4 border-t border-border-light mt-auto w-[280px]">
          <button className="flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover/50 w-full px-3 py-3 rounded-xl transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-iris to-indigo-400 flex items-center justify-center text-white shadow-md">
              <User size={16} />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-text-primary">Admin User</span>
              <span className="text-[11px] text-text-tertiary">Pro Plan</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-surface-base">
        
        {/* Header - Glassmorphism */}
        <header className="h-16 flex items-center justify-between px-6 sticky top-0 bg-surface-base/80 backdrop-blur-md z-10 border-b border-border-light/50">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-hover/50 rounded-xl transition-colors"
                title="Open Sidebar"
              >
                <PanelLeftClose size={20} className="rotate-180" />
              </button>
            )}
            {sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-hover/50 rounded-xl transition-colors"
                title="Close Sidebar"
              >
                <PanelLeftClose size={20} />
              </button>
            )}
          </div>
          
          <button className="flex items-center gap-2 font-medium text-text-primary bg-surface-sidebar border border-border-light px-4 py-2 rounded-xl hover:bg-surface-hover/50 transition-all shadow-sm">
            GPT-4o <span className="text-accent-iris">✨</span>
            <ChevronDown size={14} className="text-text-tertiary ml-1" />
          </button>
          
          <div className="flex items-center w-8"></div>
        </header>

        {/* Chat Feed */}
        <main className="flex-1 overflow-y-auto scroll-smooth flex justify-center pb-48">
          <div className="w-full max-w-4xl flex flex-col h-full pt-8 px-4">
            <ChatBox />
          </div>
        </main>
      </div>
    </div>
  );
}
