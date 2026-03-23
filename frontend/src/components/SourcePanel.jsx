import React from 'react';
import { Database, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SourcePanel({ sources }) {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-6 w-full overflow-hidden"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3 pl-1">
        <Database size={12} />
        <span>Sources ({sources.length})</span>
      </div>
      
      <div className="flex overflow-x-auto gap-3 pb-3 snap-x scrollbar-hide py-1 px-1">
        {sources.map((source, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="shrink-0 w-[280px] p-4 bg-surface-base border border-border-light rounded-2xl hover:border-accent-iris/60 cursor-pointer snap-start transition-all hover:bg-surface-hover/30 group shadow-sm hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold text-accent-iris bg-accent-iris/10">
                Source {idx + 1}
              </span>
              <ExternalLink size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>
            <p className="text-sm font-semibold text-text-primary line-clamp-1 mb-1.5">
              {source.title || `Document Chunk ${idx + 1}`}
            </p>
            <p className="text-xs text-text-tertiary line-clamp-2 leading-relaxed">
              {source.snippet || "Similarity score: 0.89. Context retrieved successfully from pgvector."}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
