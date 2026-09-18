/**
 * CivicSphere — Document Accordion
 * Smooth height-auto accordion for informational document detail sections.
 * No upload, no status — pure educational content.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface AccordionSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface DocumentAccordionProps {
  sections: AccordionSection[];
  isDark: boolean;
  accentColor: string;
}

export const DocumentAccordion: React.FC<DocumentAccordionProps> = ({
  sections, isDark, accentColor
}) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id);

  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  return (
    <div className="space-y-1.5">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div
            key={section.id}
            className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${isOpen ? accentColor + '40' : borderColor}` }}
          >
            <button
              type="button"
              onClick={() => toggle(section.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-all"
              style={{
                background: isOpen
                  ? isDark ? `${accentColor}10` : `${accentColor}08`
                  : 'transparent',
              }}
            >
              <div className="flex items-center gap-2.5">
                <span style={{ color: isOpen ? accentColor : isDark ? '#64748B' : '#9CA3AF' }}>
                  {section.icon}
                </span>
                <span
                  className="text-xs font-bold tracking-tight"
                  style={{ color: isOpen ? (isDark ? '#E2E8F0' : '#1E293B') : isDark ? '#94A3B8' : '#6B7280' }}
                >
                  {section.title}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.28, type: 'spring', stiffness: 260, damping: 24 }}
              >
                <ChevronDown
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isOpen ? accentColor : isDark ? '#475569' : '#CBD5E1' }}
                />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={`content-${section.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 pb-4 pt-2 text-xs leading-relaxed space-y-1.5"
                    style={{ color: isDark ? '#94A3B8' : '#6B7280', borderTop: `1px solid ${borderColor}` }}
                  >
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
