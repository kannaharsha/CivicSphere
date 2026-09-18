/**
 * CivicSphere — Related Schemes Chips
 * Animated scheme chip display for each document card.
 * Hover animation per chip — independent.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface RelatedSchemesProps {
  schemes: string[];
  isDark: boolean;
  accentColor: string;
}

export const RelatedSchemes: React.FC<RelatedSchemesProps> = ({ schemes, isDark, accentColor }) => {
  if (!schemes || schemes.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
        <span className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: isDark ? '#64748B' : '#9CA3AF' }}>
          Required for Schemes
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {schemes.map((scheme, i) => (
          <motion.span
            key={scheme}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: i * 0.045,
              type: 'spring',
              stiffness: 300,
              damping: 24,
            }}
            whileHover={{
              scale: 1.08,
              y: -2,
              transition: { type: 'spring', stiffness: 400, damping: 20 },
            }}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold cursor-default"
            style={{
              background: isDark ? `${accentColor}14` : `${accentColor}10`,
              border: `1px solid ${accentColor}35`,
              color: accentColor,
            }}
          >
            {scheme}
          </motion.span>
        ))}
      </div>
    </div>
  );
};
