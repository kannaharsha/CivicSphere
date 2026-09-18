/**
 * CivicSphere Eligibility Types & Contracts
 * Pure TypeScript interfaces for citizen profiles, scheme database records,
 * and eligibility evaluation engine results.
 */

export const ELIGIBILITY_MODULE_NAME = 'CivicSphereEligibility';

export interface CitizenEligibilityProfile {
  // Personal
  fullName?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other' | 'All';
  state?: string;
  district?: string;
  occupation?: string;

  // Social
  caste?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  isMinority?: boolean;
  hasDisability?: boolean;
  disabilityPercentage?: number;

  // Financial
  annualFamilyIncome?: number;
  farmerCategory?: 'Marginal' | 'Small' | 'Medium' | 'Large';
  landOwnershipAcres?: number;
  ownsLand?: boolean;

  // Agriculture Information
  cropType?: string;
  irrigationType?: string;
  isOrganicFarmer?: boolean;
  hasLivestock?: boolean;
  isWomanFarmer?: boolean;
  isTenantFarmer?: boolean;

  // Additional Information
  hasAadhaar?: boolean;
  hasBankAccountLinked?: boolean;
  isPmKisanBeneficiary?: boolean;
  hasSoilHealthCard?: boolean;
}

export interface SchemeEligibilityJSON {
  age?: { min?: number; max?: number };
  income?: { max?: number; min?: number };
  state?: string;
  district?: string;
  priority?: string[];
  conditions?: string[];
  occupation?: string;
  farmer_category?: string[];
  land_holding?: { min?: number; max?: number };
  [key: string]: any;
}

export interface SchemeRecord {
  scheme_id: string;
  scheme_name: string;
  category?: string;
  state?: string;
  description?: string;
  eligibility?: SchemeEligibilityJSON | string;
  benefits?: any;
  documents?: any;
  application_process?: any;
  official_urls?: string[];
  registration_links?: string[];
  tags?: string[];
  ministry?: string;
  sector?: string;
  sub_sector?: string;
  target_demographic?: string[];
  beneficiary_category?: string[];
  occupation_category?: string;
  scheme_level?: string;
  eligibility_tags?: string[];
  benefit_tags?: string[];
  crop_tags?: string[];
  farmer_tags?: string[];
}

export interface EvaluationCondition {
  label: string;
  description: string;
  status: 'matched' | 'failed' | 'missing';
  type: 'age' | 'income' | 'state' | 'land' | 'caste' | 'occupation' | 'proof' | 'general';
}

export interface EvaluationResult {
  scheme: SchemeRecord;
  eligible: boolean;
  category: 'eligible' | 'partial' | 'not_eligible';
  score: number; // 0 - 100
  matchedConditions: string[];
  failedConditions: string[];
  missingConditions: string[];
  totalConditions: number;
  benefitSummary: string;
  benefitAmount?: string;
  officialUrl?: string;
  documentsList: string[];
}

export interface EligibilitySummaryMetrics {
  totalSchemesEvaluated: number;
  eligibleCount: number;
  partialCount: number;
  notEligibleCount: number;
}
