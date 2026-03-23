import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Copy, ThumbsUp, ThumbsDown, Database, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SourcePanel from './SourcePanel';

export default function Message({ role, content, sources, model, isRetrievingContext }) {
  const isUser = role === 'user';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`flex gap-4 group w-full ${isUser ? 'justify-end' : ''}`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-surface-sidebar border border-border-light shadow-sm text-accent-iris mt-1 group-hover:bg-surface-hover/50 transition-colors">
          <Sparkles size={18} />
        </div>
      )}
      
      <div className={`flex flex-col min-w-0 ${isUser ? 'max-w-[75%] items-end' : 'flex-1 max-w-[85%]'}`}>
        
        {/* Model Badge */}
        {!isUser && model && !isRetrievingContext && (
          <div className="inline-flex items-center gap-1.5 mb-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
            {model}
          </div>
        )}

        {/* Skeleton RAG Retrieving Pill */}
        <AnimatePresence>
          {isRetrievingContext && !isUser && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex items-center gap-2 text-xs text-text-secondary bg-surface-sidebar shadow-md px-4 py-3 rounded-xl border border-border-light mb-3"
            >
              <Database size={14} className="animate-pulse text-accent-iris" />
              <span className="font-medium">Searching knowledge base...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Bubble/Block */}
        {content && (
          <div className={`prose prose-invert prose-p:leading-relaxed prose-pre:bg-surface-base prose-pre:border prose-pre:border-border-light max-w-none text-[15px] ${
            isUser 
              ? 'bg-surface-sidebar text-text-primary px-6 py-4 rounded-3xl rounded-tr-md border border-border-light shadow-md' 
              : 'text-text-primary'
          }`}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        {/* Sources Carousel */}
        {!isUser && sources && sources.length > 0 && (
          <SourcePanel sources={sources} />
        )}

        {/* Action Row */}
        {!isUser && content && !isRetrievingContext && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }} 
            className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-sidebar rounded-lg transition-colors border border-transparent hover:border-border-light"><Copy size={16} /></button>
            <button className="p-1.5 text-text-tertiary hover:text-accent-emerald hover:bg-surface-sidebar rounded-lg transition-colors border border-transparent hover:border-border-light"><ThumbsUp size={16} /></button>
            <button className="p-1.5 text-text-tertiary hover:text-red-400 hover:bg-surface-sidebar rounded-lg transition-colors border border-transparent hover:border-border-light"><ThumbsDown size={16} /></button>
          </motion.div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-tr from-accent-iris to-indigo-400 shadow-md text-white mt-1">
          <User size={18} />
        </div>
      )}
    </motion.div>
  );
}
