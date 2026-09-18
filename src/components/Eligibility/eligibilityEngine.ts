/**
 * CivicSphere Eligibility Engine (Pure TypeScript)
 * Evaluates citizen eligibility dynamically against verified criteria from Supabase PostgreSQL.
 * Does not rely on AI, external APIs, or hardcoded scheme names.
 */

import type {
  CitizenEligibilityProfile,
  SchemeRecord,
  EvaluationResult,
  SchemeEligibilityJSON
} from './eligibilityTypes';

/**
 * Normalizes scheme eligibility object from either JSON or JSON-string.
 */
function parseSchemeEligibility(raw: any): SchemeEligibilityJSON {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Extracts clean list of required documents from scheme record.
 * Handles strings, string arrays, and arrays of document objects { name, type, ... }.
 */
function parseDocuments(raw: any): string[] {
  if (!raw) return ['Aadhaar Card', 'Bank Passbook', 'Land Records / RoR'];

  const extractDocName = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') return item.replace(/^[-*•\d.]\s*/, '').trim();
    if (typeof item === 'object') {
      return (
        item.name ||
        item.document_name ||
        item.doc_name ||
        item.title ||
        item.type ||
        item.description ||
        ''
      ).replace(/^[-*•\d.]\s*/, '').trim();
    }
    return String(item).trim();
  };

  if (Array.isArray(raw)) {
    const list = raw.map(extractDocName).filter((d: string) => d.length > 1);
    return list.length > 0 ? list : ['Aadhaar Card', 'Bank Passbook', 'Land Records / RoR'];
  }

  if (typeof raw === 'string') {
    // Check if it's a JSON string
    if (raw.trim().startsWith('[') || raw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        return parseDocuments(parsed);
      } catch {
        // Not JSON, continue to plain text split
      }
    }
    return raw
      .split(/[;\n,]/)
      .map((d: string) => d.replace(/^[-*•\d.]\s*/, '').trim())
      .filter((d: string) => d.length > 2);
  }

  if (typeof raw === 'object') {
    const list: string[] = [];
    Object.values(raw).forEach((v: any) => {
      const extracted = extractDocName(v);
      if (extracted) list.push(extracted);
      else if (Array.isArray(v)) list.push(...v.map(extractDocName).filter((d: string) => d.length > 1));
    });
    return list.length > 0 ? list : ['Aadhaar Card', 'Land Ownership Records', 'Bank Passbook'];
  }

  return ['Aadhaar Card', 'Bank Passbook', 'Land Ownership Records'];
}

/**
 * Extracts a concise benefit string from scheme benefits data.
 */
function parseBenefits(raw: any): { summary: string; amount?: string } {
  if (!raw) return { summary: 'Financial assistance and welfare subsidies as per government norms.' };

  let text = '';
  if (typeof raw === 'string') {
    text = raw;
  } else if (typeof raw === 'object') {
    if (raw.financial_benefits) text += (Array.isArray(raw.financial_benefits) ? raw.financial_benefits.join(' ') : String(raw.financial_benefits)) + ' ';
    if (raw.subsidies) text += (Array.isArray(raw.subsidies) ? raw.subsidies.join(' ') : String(raw.subsidies)) + ' ';
    if (raw.assistance_amounts) text += (Array.isArray(raw.assistance_amounts) ? raw.assistance_amounts.join(' ') : String(raw.assistance_amounts)) + ' ';
    if (!text) text = JSON.stringify(raw);
  }

  // Look for currency amounts (e.g. ₹6,000, Rs. 50,000, etc.)
  const match = text.match(/(?:₹|Rs\.?|INR)\s*[\d,]+(?:\s*(?:lakh|crore|thousand|per year|\/year))?/i);
  const amount = match ? match[0] : undefined;

  const cleanSummary = text.replace(/[{}[\]"]/g, '').replace(/\s+/g, ' ').trim();
  return {
    summary: cleanSummary.length > 140 ? cleanSummary.slice(0, 137) + '...' : (cleanSummary || 'Government subsidy and welfare transfer.'),
    amount
  };
}

/**
 * Resolves official URL from scheme record.
 */
function parseOfficialUrl(scheme: SchemeRecord): string | undefined {
  if (scheme.registration_links && scheme.registration_links.length > 0) {
    return scheme.registration_links[0];
  }
  if (scheme.official_urls && scheme.official_urls.length > 0) {
    return scheme.official_urls[0];
  }
  return undefined;
}

/**
 * Evaluates an individual scheme against a citizen profile.
 */
export function evaluateSchemeEligibility(
  scheme: SchemeRecord,
  citizen: CitizenEligibilityProfile
): EvaluationResult {
  const elig = parseSchemeEligibility(scheme.eligibility);
  const matchedConditions: string[] = [];
  const failedConditions: string[] = [];
  const missingConditions: string[] = [];

  let hardFailure = false;
  let totalPoints = 0;
  let earnedPoints = 0;

  // 1. STATE & JURISDICTION CHECK
  totalPoints += 20;
  const schemeState = (scheme.state || elig.state || '').trim();
  const isCentral = !schemeState || schemeState.toLowerCase() === 'all' || schemeState.toLowerCase() === 'central';

  if (isCentral) {
    earnedPoints += 20;
    matchedConditions.push('Applicable to citizens across all Indian States & UTs (Central Scheme)');
  } else if (citizen.state) {
    if (citizen.state.toLowerCase() === schemeState.toLowerCase()) {
      earnedPoints += 20;
      matchedConditions.push(`Matches State Jurisdiction (${citizen.state})`);
    } else {
      hardFailure = true;
      failedConditions.push(`Restricted to residents of ${schemeState} (You selected: ${citizen.state})`);
    }
  } else {
    // State not provided yet
    earnedPoints += 10;
    missingConditions.push(`Verification required for state residency (${schemeState})`);
  }

  // 2. AGE BOUNDS CHECK
  const ageRule = elig.age;
  if (ageRule && (ageRule.min || ageRule.max)) {
    totalPoints += 15;
    if (citizen.age !== undefined && citizen.age > 0) {
      const minAge = ageRule.min || 18;
      const maxAge = ageRule.max || 120;
      if (citizen.age >= minAge && citizen.age <= maxAge) {
        earnedPoints += 15;
        matchedConditions.push(`Age criterion satisfied (${citizen.age} yrs within ${minAge}–${maxAge})`);
      } else {
        hardFailure = true;
        failedConditions.push(`Age requirement not met (Required ${minAge}–${maxAge} yrs, your age: ${citizen.age})`);
      }
    } else {
      earnedPoints += 7;
      missingConditions.push(`Age verification required (${ageRule.min || 18}–${ageRule.max || 60} yrs)`);
    }
  }

  // 3. INCOME CEILING CHECK
  const incomeRule = elig.income;
  if (incomeRule && incomeRule.max) {
    totalPoints += 15;
    if (citizen.annualFamilyIncome !== undefined && citizen.annualFamilyIncome >= 0) {
      if (citizen.annualFamilyIncome <= incomeRule.max) {
        earnedPoints += 15;
        matchedConditions.push(`Family income within allowable limit (₹${citizen.annualFamilyIncome.toLocaleString('en-IN')} ≤ ₹${incomeRule.max.toLocaleString('en-IN')})`);
      } else {
        hardFailure = true;
        failedConditions.push(`Income exceeds threshold (Max: ₹${incomeRule.max.toLocaleString('en-IN')}, Reported: ₹${citizen.annualFamilyIncome.toLocaleString('en-IN')})`);
      }
    } else {
      earnedPoints += 7;
      missingConditions.push(`Income certificate needed to verify ceiling (≤ ₹${incomeRule.max.toLocaleString('en-IN')})`);
    }
  }

  // 4. OCCUPATION & FARMER CATEGORY CHECK
  const occTags = [...(scheme.farmer_tags || []), ...(scheme.target_demographic || [])].map(t => t.toLowerCase());
  totalPoints += 15;

  const requiresSmallMarginal = occTags.some(t => t.includes('small') || t.includes('marginal'));
  if (requiresSmallMarginal) {
    if (citizen.farmerCategory === 'Marginal' || citizen.farmerCategory === 'Small' || (citizen.landOwnershipAcres && citizen.landOwnershipAcres <= 5.0)) {
      earnedPoints += 15;
      matchedConditions.push('Matches Small / Marginal farmer category target');
    } else if (citizen.farmerCategory === 'Medium' || citizen.farmerCategory === 'Large' || (citizen.landOwnershipAcres && citizen.landOwnershipAcres > 5.0)) {
      hardFailure = true;
      failedConditions.push('Exclusively reserved for Small & Marginal farmers (Landholding ≤ 5 acres)');
    } else {
      earnedPoints += 8;
      missingConditions.push('Landholding size / farmer classification required');
    }
  } else {
    // General farmer check
    if (citizen.occupation === 'Farmer' || citizen.ownsLand || citizen.isTenantFarmer) {
      earnedPoints += 15;
      matchedConditions.push('Citizen is an active agricultural cultivator / landowner');
    } else {
      earnedPoints += 10;
      matchedConditions.push('Citizen occupation meets broad beneficiary guidelines');
    }
  }

  // 5. GENDER & WOMEN TARGETING
  const requiresWomen = occTags.some(t => t.includes('women') || t.includes('mahila')) || scheme.scheme_name.toLowerCase().includes('mahila');
  if (requiresWomen) {
    totalPoints += 15;
    if (citizen.gender === 'Female' || citizen.isWomanFarmer) {
      earnedPoints += 15;
      matchedConditions.push('Special reservation for Women Farmers / Female heads of household satisfied');
    } else {
      hardFailure = true;
      failedConditions.push('Exclusively dedicated to Women Farmers');
    }
  }

  // 6. CASTE / SOCIAL CATEGORY
  const requiresScSt = occTags.some(t => t.includes('sc') || t.includes('st') || t.includes('tribal'));
  if (requiresScSt) {
    totalPoints += 10;
    if (citizen.caste === 'SC' || citizen.caste === 'ST') {
      earnedPoints += 10;
      matchedConditions.push(`Affirmative social priority for ${citizen.caste} category satisfied`);
    } else {
      hardFailure = true;
      failedConditions.push('Exclusively reserved for Scheduled Caste (SC) or Scheduled Tribe (ST) beneficiaries');
    }
  }

  // 7. LAND OWNERSHIP / TENANT
  const requiresLand = (scheme.description || '').toLowerCase().includes('cultivable land') || (scheme.description || '').toLowerCase().includes('landholder');
  if (requiresLand) {
    totalPoints += 10;
    if (citizen.ownsLand || (citizen.landOwnershipAcres && citizen.landOwnershipAcres > 0)) {
      earnedPoints += 10;
      matchedConditions.push('Cultivable land ownership verified (Pattadar / RoR)');
    } else if (citizen.isTenantFarmer) {
      earnedPoints += 5;
      missingConditions.push('Requires land lease agreement / tenant verification certificate');
    } else {
      failedConditions.push('Requires operational agricultural landholding in citizen name');
    }
  }

  // 8. MANDATORY PROOFS (Aadhaar, Bank Link)
  totalPoints += 10;
  if (citizen.hasAadhaar && citizen.hasBankAccountLinked) {
    earnedPoints += 10;
    matchedConditions.push('Aadhaar-seeded bank account active for Direct Benefit Transfer (DBT)');
  } else if (!citizen.hasAadhaar) {
    missingConditions.push('Aadhaar card mandatory for DBT authentication');
  } else if (!citizen.hasBankAccountLinked) {
    missingConditions.push('Bank account linking with Aadhaar required before subsidy disbursement');
  }

  // 9. ORGANIC / SPECIAL CERTIFICATION (If applicable)
  const isOrganicScheme = occTags.some(t => t.includes('organic')) || (scheme.scheme_name || '').toLowerCase().includes('organic');
  if (isOrganicScheme) {
    totalPoints += 10;
    if (citizen.isOrganicFarmer) {
      earnedPoints += 10;
      matchedConditions.push('Organic cultivation practices and farm certification verified');
    } else {
      missingConditions.push('Requires certification or registered adoption of organic farming');
    }
  }

  // Compute final percentage score
  const rawScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 75;
  const score = hardFailure ? Math.min(rawScore, 35) : Math.max(rawScore, 10);

  // Categorize based on rules
  let category: 'eligible' | 'partial' | 'not_eligible';
  let isEligible = false;

  if (hardFailure) {
    category = 'not_eligible';
    isEligible = false;
  } else if (score >= 75 && missingConditions.length <= 1) {
    category = 'eligible';
    isEligible = true;
  } else if (score >= 40) {
    category = 'partial';
    isEligible = false;
  } else {
    category = 'not_eligible';
    isEligible = false;
  }

  const { summary: benefitSummary, amount: benefitAmount } = parseBenefits(scheme.benefits);
  const documentsList = parseDocuments(scheme.documents);
  const officialUrl = parseOfficialUrl(scheme);

  return {
    scheme,
    eligible: isEligible,
    category,
    score,
    matchedConditions,
    failedConditions,
    missingConditions,
    totalConditions: matchedConditions.length + failedConditions.length + missingConditions.length,
    benefitSummary,
    benefitAmount,
    officialUrl,
    documentsList
  };
}

/**
 * Evaluates all provided schemes against a citizen profile and sorts by score descending.
 */
export function evaluateAllSchemes(
  schemes: SchemeRecord[],
  citizen: CitizenEligibilityProfile
): EvaluationResult[] {
  const results = schemes.map(scheme => evaluateSchemeEligibility(scheme, citizen));
  // Sort primarily by eligible status, then by match score descending
  return results.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return b.score - a.score;
  });
}
