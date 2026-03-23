import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Paperclip, ArrowUp, Square, Terminal, Search, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Message from './Message';

const useIntelligentScroll = (isStreaming, messages) => {
  const scrollRef = useRef(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setIsScrolledUp(!isNearBottom);
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isScrolledUp && isStreaming && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isStreaming, isScrolledUp]);

  return scrollRef;
};

export default function ChatBox() {
  const [messages, setMessages] = useState([]); // Empty state by default
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRetrievingContext, setIsRetrievingContext] = useState(false);
  const textareaRef = useRef(null);

  const scrollRef = useIntelligentScroll(isTyping || isRetrievingContext, messages);

  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (e.key === 'Escape' && (isTyping || isRetrievingContext)) {
        setIsTyping(false);
        setIsRetrievingContext(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [isTyping, isRetrievingContext]);

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping || isRetrievingContext) return;

    const userMsg = { id: Date.now(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    
    setIsRetrievingContext(true);
    
    // Simulate Semantic Search
    setTimeout(() => {
      setIsRetrievingContext(false);
      setIsTyping(true);

      const assistantId = Date.now() + 1;
      setMessages(prev => [...prev, { 
        id: assistantId, 
        role: 'assistant', 
        content: '', 
        model: 'GPT-4o'
      }]);

      const fullContent = '**Context retrieved & synthesis applied.** \n\nThe Multimodal RAG architecture separates ingestion (vector embedding) from orchestration, allowing high-fidelity retrievals before invoking the LLM. How else can I assist?';
      let currentLen = 0;
      
      const streamInterval = setInterval(() => {
        currentLen += 4;
        if (currentLen > fullContent.length) {
          clearInterval(streamInterval);
          setMessages(prev => prev.map(m => m.id === assistantId ? {...m, content: fullContent, sources: [
            { title: "System Architecture V2", snippet: "Vector embedding orchestration allows high-fidelity lookups." },
            { title: "RAG Docs", snippet: "pgvector HNSW indexes yield sub-millisecond retrieval." }
          ]} : m));
          setIsTyping(false);
        } else {
          setMessages(prev => prev.map(m => m.id === assistantId ? {...m, content: fullContent.substring(0, currentLen) + '<span class="streaming-cursor"></span>'} : m));
        }
      }, 25); 

    }, 800); 
  };

  return (
    <>
      <div className="flex-1 w-full flex flex-col h-full overflow-hidden absolute inset-0 pb-[160px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 pt-8 pb-12 space-y-10">
          
          {/* Empty State Presentation */}
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto pt-20"
            >
              <div className="w-16 h-16 bg-surface-sidebar rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-border-light drop-shadow-xl">
                <Sparkles size={32} className="text-accent-iris" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary mb-3">How can I help you today?</h1>
              <p className="text-text-tertiary mb-10 text-lg">I have access to your organization's internal knowledge base.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {[
                  { icon: <Terminal size={18}/>, text: "Explain the deployment pipeline" },
                  { icon: <Search size={18}/>, text: "Search architecture documents" },
                  { icon: <Zap size={18}/>, text: "Generate an image of a cloud network" }
                ].map((s, i) => (
                  <button key={i} onClick={() => setInput(s.text)} className="flex flex-col items-start p-4 bg-surface-sidebar hover:bg-surface-hover/50 border border-border-light rounded-xl transition-all shadow-sm group">
                    <div className="text-accent-iris bg-accent-iris/10 p-2 rounded-lg mb-3 group-hover:scale-110 transition-transform">{s.icon}</div>
                    <span className="text-sm font-medium text-text-secondary text-left">{s.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <Message 
                key={msg.id} 
                role={msg.role} 
                content={msg.content} 
                sources={msg.sources} 
                model={msg.model} 
                isRetrievingContext={isRetrievingContext && index === messages.length - 1 && msg.role === 'user' ? true : false}
              />
            ))}
            
            {/* Context Skeleton */}
            {isRetrievingContext && (
               <Message 
                 key="skeleton-loading" 
                 role="assistant" 
                 content="" 
                 model="GPT-4o"
                 isRetrievingContext={true}
               />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-surface-base via-surface-base to-transparent px-4 pb-8 pt-12 flex justify-center pointer-events-none z-20">
        <div className="w-full max-w-3xl relative pointer-events-auto">
          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onSubmit={handleSubmit} 
            className="relative flex items-end gap-3 bg-surface-sidebar border border-border-light shadow-2xl rounded-2xl p-3 ring-1 ring-inset ring-transparent focus-within:ring-accent-iris/40 focus-within:border-accent-iris/40 transition-all drop-shadow-2xl"
          >
            <button type="button" className="p-2.5 mb-0.5 text-text-tertiary hover:text-text-primary hover:bg-surface-hover/80 rounded-xl transition-colors shrink-0 bg-surface-base border border-border-light shadow-sm">
              <Paperclip size={18} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              placeholder="Ask anything or upload a document..."
              className="w-full bg-transparent border-0 px-2 py-2.5 text-[15px] focus:outline-none focus:ring-0 text-text-primary resize-none placeholder-text-tertiary leading-relaxed max-h-[250px]"
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type={(isTyping || isRetrievingContext) ? "button" : "submit"} 
              className={`p-2.5 mb-0.5 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md ${
                (isTyping || isRetrievingContext)
                ? "bg-surface-base text-text-primary border border-border-light hover:bg-surface-hover animate-pulse" 
                : input.trim() 
                  ? "bg-accent-iris text-white hover:bg-indigo-600 border border-transparent" 
                  : "bg-surface-base text-text-tertiary border border-border-light cursor-not-allowed"
              }`}
            >
              {(isTyping || isRetrievingContext) ? <Square fill="currentColor" size={16} /> : <ArrowUp size={18} strokeWidth={2.5} />}
            </button>
          </motion.form>
          <div className="text-center mt-3 text-[12px] text-text-tertiary">
            AI generated content can be inaccurate. Always verify source citations.
          </div>
        </div>
      </div>
    </>
  );
}
