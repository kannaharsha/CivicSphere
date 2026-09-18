/**
 * CivicSphere — Document Information Card (Read-Only)
 * Individual premium informational card for each government document.
 *
 * Animations:
 *  • Viewport-triggered entrance via useInView — each card independently
 *  • Hover: elevation lift + border glow + shimmer sweep + icon rotate
 *  • Accordion: smooth height-auto per section
 *  • Scheme chips: individual scale on hover
 *
 * NO upload, NO status, NO file storage — informational only.
 */

import React, { useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  IdCard, CreditCard, BookOpen, IndianRupee, Users, Home, Tractor,
  BookMarked, Map, ScrollText, Leaf, FileCheck, Landmark,
  Camera, Smartphone, HeartHandshake, Shield, Droplets, FileUser,
  PawPrint, BriefcaseBusiness, FileText, ChevronDown,
  MapPin, Clock, Info, HelpCircle, Building2, ListChecks,
  AlertOctagon, CheckCircle2, Sparkles,
} from 'lucide-react';
import type { GovernmentDocument } from './documentTypes';
import { DocumentAccordion } from './DocumentAccordion';
import { RelatedSchemes } from './RelatedSchemes';

/* ── Icon map ── */
const ICON_MAP: Record<string, React.ElementType> = {
  IdCard, CreditCard, BookOpen, IndianRupee, Users, Home, Tractor,
  BookMarked, Map, ScrollText, Leaf, FileCheck, Landmark,
  Camera, Smartphone, HeartHandshake, Shield, Droplets, FileUser,
  PawPrint, BriefcaseBusiness, FileText,
};

interface DocumentCardProps {
  doc: GovernmentDocument;
  isDark: boolean;
  index: number;
  accentColor: string;
  onOpenDetails?: (doc: GovernmentDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc, isDark, index, accentColor, onOpenDetails
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);

  /* Viewport-triggered entrance — fires once when card scrolls into view */
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });

  const DocIcon = ICON_MAP[doc.iconName] || FileText;

  /* Individual delay — max 0.38s so deep cards don't feel sluggish */
  const enterDelay = Math.min(index * 0.055, 0.38);

  const cardBg = isDark 
    ? 'linear-gradient(150deg, rgba(15, 23, 42, 0.88) 0%, rgba(10, 16, 30, 0.95) 100%)' 
    : 'linear-gradient(150deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const subtleBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const borderNormal = doc.isMostRequired
    ? isDark ? `${accentColor}35` : `${accentColor}30`
    : subtleBorder;

  /* Accordion sections for inline expandable details */
  const accordionSections = [
    {
      id: 'about',
      title: 'About This Document',
      icon: <Info className="w-3.5 h-3.5" />,
      content: <p className="leading-relaxed">{doc.description}</p>,
    },
    {
      id: 'why',
      title: 'Why the Government Requires It',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      content: <p className="leading-relaxed">{doc.whyRequired}</p>,
    },
    {
      id: 'howto',
      title: 'How to Obtain',
      icon: <Building2 className="w-3.5 h-3.5" />,
      content: (
        <ol className="space-y-2">
          {doc.howToObtain.map((step, i) => (
            <li key={i} className="flex gap-2.5 leading-relaxed">
              <span
                className="font-black flex-shrink-0 w-4 text-right"
                style={{ color: accentColor }}
              >
                {i + 1}.
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      ),
    },
    {
      id: 'important',
      title: 'Important Information',
      icon: <ListChecks className="w-3.5 h-3.5" />,
      content: (
        <ul className="space-y-1.5">
          {doc.importantNotes.map((note, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'mistakes',
      title: 'Common Mistakes to Avoid',
      icon: <AlertOctagon className="w-3.5 h-3.5" />,
      content: (
        <ul className="space-y-1.5">
          {doc.commonMistakes.map((mistake, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <span className="flex-shrink-0 font-black text-red-400 mt-0.5">✗</span>
              <span>{mistake}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div ref={ref} className="h-full flex flex-col">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: enterDelay,
          type: 'spring',
          stiffness: 240,
          damping: 24,
        }}
        whileHover={{
          y: -5,
          boxShadow: isDark
            ? `0 20px 40px -8px rgba(0,0,0,0.60), 0 0 20px -3px ${accentColor}20`
            : `0 20px 40px -8px rgba(15,23,42,0.10), 0 0 15px -2px ${accentColor}15`,
          transition: { type: 'spring', stiffness: 380, damping: 25 },
        }}
        className="relative rounded-2xl overflow-hidden group cursor-default flex flex-col justify-between flex-1"
        style={{
          background: cardBg,
          border: `1.5px solid ${borderNormal}`,
          backdropFilter: 'blur(16px)',
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 16px rgba(0,0,0,0.05)',
        }}
      >
        {/* Priority accent bar at top */}
        {doc.isMostRequired && (
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}55)` }}
          />
        )}

        {/* Hover radial glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at 35% 20%, ${accentColor}0E 0%, transparent 65%)`,
          }}
        />

        {/* Hover shimmer sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          animate={{ x: ['-100%', '220%'] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 2.5 + (index % 5) * 0.4,
          }}
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}0A, transparent)`,
          }}
        />

        {/* Top & Middle Content Area */}
        <div className="relative z-10 p-5 pb-3 space-y-3.5 flex-1 flex flex-col">
          {/* Header Row: Icon + Name & Office */}
          <div className="flex items-start gap-3">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{
                background: isDark ? `${accentColor}1A` : `${accentColor}12`,
                border: `1.5px solid ${accentColor}30`,
              }}
            >
              <DocIcon className="w-5 h-5" style={{ color: accentColor }} />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1 h-5">
                {doc.isMostRequired && (
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{
                      background: isDark ? `${accentColor}1C` : `${accentColor}14`,
                      color: accentColor,
                      border: `1px solid ${accentColor}35`,
                    }}
                  >
                    Most Required
                  </span>
                )}
              </div>

              <h3 className="text-sm font-black leading-snug tracking-tight line-clamp-1" style={{ color: textColor }} title={doc.name}>
                {doc.name}
              </h3>

              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: mutedColor }} />
                <p className="text-[11px] leading-tight truncate" style={{ color: mutedColor }}>
                  {doc.issuingOffice}
                </p>
              </div>
            </div>
          </div>

          {/* Description — Fixed line height & clamp for perfect uniform size */}
          <p className="text-[12px] leading-relaxed line-clamp-3 h-[54px]" style={{ color: mutedColor }}>
            {doc.description}
          </p>

          {/* Info pills: Uniform 1-row or 2-row layout with equal spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div
              className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg overflow-hidden"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${subtleBorder}`,
                color: mutedColor,
              }}
              title={doc.issuingAuthority}
            >
              <Building2 className="w-3 h-3 flex-shrink-0" style={{ color: accentColor }} />
              <span className="truncate">{doc.issuingAuthority.replace(/—.*/, '').trim()}</span>
            </div>
            
            <div
              className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg overflow-hidden"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${subtleBorder}`,
                color: mutedColor,
              }}
              title={doc.validity}
            >
              <Clock className="w-3 h-3 flex-shrink-0" style={{ color: accentColor }} />
              <span className="truncate">{doc.validity}</span>
            </div>
          </div>

          {/* Related Schemes chips — Container with max 3 chips + counter */}
          <div className="pt-1 flex-1 flex flex-col justify-end">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                  style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                  <Sparkles className="w-3 h-3" style={{ color: accentColor }} />
                  Required For Schemes
                </span>
                {doc.relatedSchemes.length > 3 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded" style={{ color: mutedColor, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                    +{doc.relatedSchemes.length - 3} more
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 h-[58px] overflow-hidden content-start">
                {doc.relatedSchemes.slice(0, 3).map((scheme) => (
                  <span
                    key={scheme}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold truncate max-w-full"
                    style={{
                      background: isDark ? `${accentColor}12` : `${accentColor}0C`,
                      border: `1px solid ${accentColor}25`,
                      color: accentColor,
                    }}
                    title={scheme}
                  >
                    {scheme}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer: Expand toggle / Full modal view */}
        <div className="relative z-10 p-5 pt-0">
          <div
            className="flex items-center justify-between pt-3 border-t"
            style={{ borderColor: subtleBorder }}
          >
            {/* Learn More Details (Quick modal view) */}
            <motion.button
              type="button"
              onClick={() => onOpenDetails?.(doc)}
              whileHover={{ scale: 1.03, x: 2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 text-xs font-black group/btn"
              style={{ color: accentColor }}
            >
              <span>Learn More Details</span>
              <motion.div
                className="group-hover/btn:translate-x-1 transition-transform"
              >
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </motion.div>
            </motion.button>

            {/* Inline quick toggle option */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[10px] font-bold px-2 py-1 rounded-md transition-colors"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  color: isExpanded ? accentColor : mutedColor,
                  border: `1px solid ${isExpanded ? `${accentColor}35` : subtleBorder}`,
                }}
                title={isExpanded ? 'Collapse inline view' : 'Expand inline view'}
              >
                {isExpanded ? 'Collapse' : 'Inline'}
              </button>

              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  color: mutedColor,
                }}
              >
                {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
              </span>
            </div>
          </div>

          {/* Inline expandable accordion */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="accordion"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div
                  className="pt-3 mt-3 border-t"
                  style={{ borderColor: subtleBorder }}
                >
                  <DocumentAccordion
                    sections={accordionSections}
                    isDark={isDark}
                    accentColor={accentColor}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.article>
    </div>
  );
};
