import type { GovernmentDocument } from './documentTypes';
import { GOVERNMENT_DOCUMENTS } from './documentData';

// Session cache initialized with the 22 comprehensive government documents
let cachedDocs: GovernmentDocument[] = GOVERNMENT_DOCUMENTS;

/**
 * Fetch government document definitions.
 * Returns the comprehensive 22-document government catalog directly,
 * preventing 404 network errors from unprovisioned database tables.
 */
export async function fetchGovernmentDocuments(_forceRefresh = false): Promise<GovernmentDocument[]> {
  return cachedDocs;
}
