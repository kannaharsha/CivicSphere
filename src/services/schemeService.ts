import axios from 'axios';
import { supabase } from '../lib/supabase';

export interface AgricultureScheme {
  id: string | number;
  scheme_id: string;
  scheme_name: string;
  category: string;
  state?: string;
  ministry_department?: string;
  target_beneficiary?: string;
  description: string;
  benefits: string;
  eligibility: string;
  documents_required: string;
  application_mode: string;
  application_process: string;
  official_urls?: string[];
  registration_links?: string[];
  official_scheme_url?: string;
  official_pdf_url?: string;
  status?: string;
  raw_eligibility?: any;
  raw_benefits?: any;
  raw_documents?: any;
  raw_application_process?: any;
  raw_faq?: any;
  raw_state?: string;    // original DB value e.g. "['Kerala', 'Karnataka']"
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SchemeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  ministry?: string;
  state?: string;
  application_mode?: string;
}

export interface SchemeFiltersResponse {
  categories?: string[];
  ministries: string[];
  states: string[];
  applicationModes: string[];
}

export interface SchemesResponse {
  success: boolean;
  data: AgricultureScheme[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const API_BASE = '/api/schemes';

// Helper to format raw database row from Supabase into AgricultureScheme
function formatSchemeRow(row: any): AgricultureScheme {
  if (!row) return {} as AgricultureScheme;

  // Extract primary URLs
  const official_scheme_url =
    (row.official_urls && row.official_urls[0]) ||
    (row.registration_links && row.registration_links[0]) ||
    '';
  const official_pdf_url =
    (row.official_urls &&
      row.official_urls.find((u: string) => typeof u === 'string' && u.toLowerCase().endsWith('.pdf'))) ||
    '';

  // Extract application mode
  let application_mode = row.application_mode || 'Online';
  if (Array.isArray(row.application_process) && row.application_process[0]?.mode) {
    application_mode = row.application_process[0].mode;
  }

  // Format benefits text preview
  let benefits_text = '';
  if (row.benefits) {
    if (typeof row.benefits === 'string') {
      benefits_text = row.benefits;
    } else if (Array.isArray(row.benefits.summary)) {
      benefits_text = row.benefits.summary.join('. ');
    } else {
      benefits_text = JSON.stringify(row.benefits);
    }
  }

  // Format eligibility text preview
  let eligibility_text = '';
  if (row.eligibility) {
    if (typeof row.eligibility === 'string') {
      eligibility_text = row.eligibility;
    } else if (Array.isArray(row.eligibility.conditions)) {
      eligibility_text = row.eligibility.conditions.join('. ');
    } else {
      eligibility_text = JSON.stringify(row.eligibility);
    }
  }

  // Format documents text preview
  let documents_text = '';
  if (row.documents) {
    if (typeof row.documents === 'string') {
      documents_text = row.documents;
    } else if (Array.isArray(row.documents)) {
      documents_text = row.documents
        .map((d: any) => d.name || d.type || (typeof d === 'string' ? d : ''))
        .filter(Boolean)
        .join(', ');
    } else {
      documents_text = JSON.stringify(row.documents);
    }
  }

  // Format application process text preview
  let application_process_text = '';
  if (row.application_process) {
    if (typeof row.application_process === 'string') {
      application_process_text = row.application_process;
    } else if (Array.isArray(row.application_process)) {
      application_process_text = row.application_process
        .map((p: any) => {
          const steps = Array.isArray(p.steps) ? p.steps.join(' ') : '';
          return `${p.mode ? `[${p.mode}] ` : ''}${steps}`;
        })
        .join('; ');
    } else {
      application_process_text = JSON.stringify(row.application_process);
    }
  }

  // Parse raw state string into clean list
  function parseRawState(raw: string | null | undefined): string[] {
    if (!raw) return [];
    const t = raw.trim();
    if (t.startsWith('[') && t.endsWith(']')) {
      return t.slice(1, -1)
        .split(',')
        .map((s: string) => s.trim().replace(/^['"]|['"]$/g, '').trim())
        .filter(Boolean);
    }
    return t.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const parsedStates = parseRawState(row.state);
  const cleanState =
    parsedStates.length === 0 ? 'All India'
      : parsedStates.length === 1 ? parsedStates[0]
        : `${parsedStates.length} States`;

  const ministry_department =
    row.ministry_department ||
    row.ministry ||
    'Ministry of Agriculture & Farmers Welfare';

  const target_beneficiary =
    row.target_beneficiary ||
    (row.eligibility && (typeof row.eligibility === 'string' ? row.eligibility : row.eligibility.target)) ||
    'Farmers & Rural Citizens';

  return {
    ...row,
    id: row.scheme_id,
    scheme_id: row.scheme_id,
    scheme_name: row.scheme_name,
    category: row.category,
    state: cleanState,
    raw_state: row.state,
    ministry_department,
    target_beneficiary,
    description: row.description || '',
    benefits: benefits_text,
    eligibility: eligibility_text,
    documents_required: documents_text,
    application_process: application_process_text,
    application_mode,
    official_urls: Array.isArray(row.official_urls) ? row.official_urls : [],
    registration_links: Array.isArray(row.registration_links) ? row.registration_links : [],
    official_scheme_url,
    official_pdf_url,
    status: 'Active',
    raw_eligibility: row.eligibility,
    raw_benefits: row.benefits,
    raw_documents: row.documents,
    raw_application_process: row.application_process,
    raw_faq: row.faq,
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

/**
 * Fetch total number of agriculture schemes directly from Supabase (with Express fallback)
 */
export const fetchAgricultureSchemeCount = async (): Promise<number> => {
  if (supabase) {
    try {
      const { count, error } = await supabase
        .from('agriculture_schemes')
        .select('*', { count: 'exact', head: true });

      if (!error && typeof count === 'number') {
        return count;
      }
    } catch (err) {
      console.warn('[Supabase fetchAgricultureSchemeCount] Falling back to API:', err);
    }
  }

  // Fallback to Express backend API if Supabase is unreachable
  try {
    const res = await axios.get(`${API_BASE}/agriculture/count`);
    return res.data?.total_agriculture_schemes || 0;
  } catch (err) {
    console.error('Error fetching scheme count:', err);
    return 0;
  }
};

/**
 * Fetch paginated & filtered schemes directly from Supabase (with Express fallback)
 */
export const fetchAgricultureSchemes = async (params: SchemeQueryParams = {}): Promise<SchemesResponse> => {
  const page = params.page || 1;
  const limit = params.limit || 9;
  const offset = (page - 1) * limit;

  if (supabase) {
    try {
      let query = supabase
        .from('agriculture_schemes')
        .select('*', { count: 'exact' });

      if (params.search && params.search.trim()) {
        const s = params.search.trim();
        query = query.or(
          `scheme_name.ilike.%${s}%,description.ilike.%${s}%,state.ilike.%${s}%,category.ilike.%${s}%`
        );
      }

      if (params.category && params.category.trim()) {
        query = query.ilike('category', `%${params.category.trim()}%`);
      }

      if (params.state && params.state.trim() && params.state.trim().toLowerCase() !== 'all india') {
        query = query.ilike('state', `%${params.state.trim()}%`);
      }

      query = query.order('scheme_name', { ascending: true });

      // If application mode filter is present, fetch and filter client side
      if (params.application_mode && params.application_mode.trim()) {
        const mode = params.application_mode.trim().toLowerCase();
        const { data, error } = await query;
        if (!error && data) {
          const filtered = data.filter((row: any) => {
            const rowMode = (row.application_mode || '').toLowerCase();
            const proc = JSON.stringify(row.application_process || '').toLowerCase();
            return rowMode.includes(mode) || proc.includes(mode);
          });
          const total = filtered.length;
          const paginated = filtered.slice(offset, offset + limit);
          return {
            success: true,
            data: paginated.map(formatSchemeRow),
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit) || 1,
            },
          };
        }
      } else {
        query = query.range(offset, offset + limit - 1);
        const { data, count, error } = await query;
        if (!error && data) {
          const total = typeof count === 'number' ? count : data.length;
          return {
            success: true,
            data: data.map(formatSchemeRow),
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit) || 1,
            },
          };
        }
      }
    } catch (err) {
      console.warn('[Supabase fetchAgricultureSchemes] Falling back to API:', err);
    }
  }

  // Fallback to Express backend API
  const res = await axios.get(`${API_BASE}/agriculture`, { params });
  return res.data;
};

/**
 * Fetch filter dropdown metadata directly from Supabase (with Express fallback)
 */
export const fetchAgricultureSchemeFilters = async (): Promise<SchemeFiltersResponse> => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('agriculture_schemes')
        .select('category, state');

      if (!error && data && data.length > 0) {
        const categorySet = new Set<string>();
        const stateSet = new Set<string>();

        data.forEach((r: any) => {
          if (r.category) {
            const parts = r.category.split(/, (?=[A-Z])/);
            parts.forEach((c: string) => {
              const trimmed = c.trim();
              if (trimmed) categorySet.add(trimmed);
            });
          }
          if (r.state) {
            const cleaned = r.state.replace(/[\[\]']/g, '');
            cleaned.split(',').forEach((s: string) => {
              const trimmed = s.trim();
              if (trimmed && trimmed.toLowerCase() !== 'all india') {
                stateSet.add(trimmed);
              }
            });
          }
        });

        return {
          categories: Array.from(categorySet).sort(),
          ministries: ['Ministry of Agriculture & Farmers Welfare'],
          states: ['All India', ...Array.from(stateSet).sort()],
          applicationModes: ['Online', 'Offline'],
        };
      }
    } catch (err) {
      console.warn('[Supabase fetchAgricultureSchemeFilters] Falling back to API:', err);
    }
  }

  // Fallback to Express backend API
  try {
    const res = await axios.get(`${API_BASE}/agriculture/filters`);
    return {
      categories: res.data?.categories || [],
      ministries: res.data?.ministries || [],
      states: res.data?.states || [],
      applicationModes: res.data?.applicationModes || []
    };
  } catch (err) {
    console.error('Error fetching scheme filters:', err);
    return { categories: [], ministries: [], states: [], applicationModes: [] };
  }
};

/**
 * Fetch scheme by scheme_id directly from Supabase (with Express fallback)
 */
export const fetchAgricultureSchemeById = async (id: string | number): Promise<AgricultureScheme | null> => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('agriculture_schemes')
        .select('*')
        .eq('scheme_id', String(id))
        .maybeSingle();

      if (!error && data) {
        return formatSchemeRow(data);
      }
    } catch (err) {
      console.warn('[Supabase fetchAgricultureSchemeById] Falling back to API:', err);
    }
  }

  // Fallback to Express backend API
  try {
    const res = await axios.get(`${API_BASE}/agriculture/${id}`);
    return res.data?.scheme || null;
  } catch (err) {
    console.error(`Error fetching scheme ${id}:`, err);
    return null;
  }
};
