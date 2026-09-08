import axios from 'axios';

export interface AgricultureScheme {
  id: number;
  scheme_id: string;
  scheme_name: string;
  category: string;
  ministry_department: string;
  target_beneficiary: string;
  description: string;
  benefits: string;
  eligibility: string;
  documents_required: string;
  application_mode: string;
  application_process: string;
  official_scheme_url: string;
  official_pdf_url: string;
  status: string;
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

export const fetchAgricultureSchemeCount = async (): Promise<number> => {
  try {
    const res = await axios.get(`${API_BASE}/agriculture/count`);
    return res.data?.total_agriculture_schemes || 0;
  } catch (err) {
    console.error('Error fetching scheme count:', err);
    return 0;
  }
};

export const fetchAgricultureSchemes = async (params: SchemeQueryParams = {}): Promise<SchemesResponse> => {
  const res = await axios.get(`${API_BASE}/agriculture`, { params });
  return res.data;
};

export const fetchAgricultureSchemeFilters = async (): Promise<SchemeFiltersResponse> => {
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

export const fetchAgricultureSchemeById = async (id: string | number): Promise<AgricultureScheme | null> => {
  try {
    const res = await axios.get(`${API_BASE}/agriculture/${id}`);
    return res.data?.scheme || null;
  } catch (err) {
    console.error(`Error fetching scheme ${id}:`, err);
    return null;
  }
};
