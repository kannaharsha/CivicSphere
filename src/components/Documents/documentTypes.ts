/**
 * CivicSphere — My Documents (Information Center)
 * Read-only TypeScript interfaces for the government document knowledge hub.
 * No uploads, no storage, no user data — information only.
 */

export type DocumentCategory =
  | 'identity'
  | 'farmer'
  | 'land'
  | 'income'
  | 'banking'
  | 'agriculture'
  | 'social'
  | 'other';

export interface GovernmentDocument {
  /** Unique slug identifier */
  id: string;
  name: string;
  category: DocumentCategory;
  /** Lucide icon name */
  iconName: string;
  /** One-line issuing authority tagline */
  tagline: string;
  /** Citizen-friendly "What is this document?" */
  description: string;
  /** Why government schemes request this */
  whyRequired: string;
  /** Step-by-step how to obtain */
  howToObtain: string[];
  /** Issuing authority full name */
  issuingAuthority: string;
  /** MeeSeva / Village Secretariat / etc. */
  issuingOffice: string;
  /** "Lifetime valid" | "1 year" | "3 years" */
  validity: string;
  /** Important notes citizens should know */
  importantNotes: string[];
  /** Common mistakes causing rejection */
  commonMistakes: string[];
  /** Required info visible on the document */
  requiredInfo: string[];
  /** Related scheme names */
  relatedSchemes: string[];
  /** Highlighted as most frequently required */
  isMostRequired: boolean;
}

export interface DocumentCategoryInfo {
  id: DocumentCategory;
  label: string;
  description: string;
  iconName: string;
  color: string;
  darkColor: string;
}

export interface DocumentInfoStats {
  total: number;
  agriculture: number;
  identity: number;
  land: number;
}
