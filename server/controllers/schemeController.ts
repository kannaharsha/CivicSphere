import { Request, Response } from 'express';
import { pool } from '../db.js';
import { supabase } from '../supabase.js';

// Helper to format scheme row for both legacy UI components and rich JSON views
function formatSchemeRow(row: any) {
  if (!row) return null;

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
  let application_mode = 'Online';
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

  // ── Parse raw state string into clean list ──────────────────────────
  // Handles: "['Kerala', 'Karnataka']" | "All India" | "Kerala" | ""
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
    state: cleanState,           // ← always clean text now
    raw_state: row.state,        // ← keep original for Location card parsing if needed
    parsed_states: parsedStates,
    ministry_department,
    target_beneficiary,
    description: row.description,
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

// GET /api/schemes/agriculture/count
export const getAgricultureSchemeCount = async (req: Request, res: Response) => {
  try {
    if (supabase) {
      const { count, error } = await supabase
        .from('agriculture_schemes')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        return res.json({
          success: true,
          total_agriculture_schemes: count,
          count,
        });
      }
    }

    const result = await pool.query(`
      SELECT COUNT(*) AS total_agriculture_schemes
      FROM agriculture_schemes;
    `);

    const count = parseInt(result.rows[0]?.total_agriculture_schemes || '0', 10);

    res.json({
      success: true,
      total_agriculture_schemes: count,
      count,
    });
  } catch (error: any) {
    console.error('Error fetching agriculture scheme count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scheme count', error: error.message });
  }
};

// GET /api/schemes/agriculture
export const getAgricultureSchemes = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '12', 10);
    const offset = (page - 1) * limit;

    const search = ((req.query.search as string) || '').trim();
    const state = ((req.query.state as string) || '').trim();
    const category = ((req.query.category as string) || '').trim();
    const applicationMode = ((req.query.application_mode as string) || '').trim();

    // 1. Primary Retrieval: Supabase
    if (supabase) {
      let query = supabase
        .from('agriculture_schemes')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(
          `scheme_name.ilike.%${search}%,description.ilike.%${search}%,state.ilike.%${search}%,category.ilike.%${search}%`
        );
      }

      if (category) {
        query = query.ilike('category', `%${category}%`);
      }

      if (state) {
        query = query.ilike('state', `%${state}%`);
      }

      query = query.order('scheme_name', { ascending: true });

      if (!applicationMode) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        let filteredRows = data;
        if (applicationMode) {
          filteredRows = filteredRows.filter((row: any) => {
            const proc = JSON.stringify(row.application_process || '');
            return proc.toLowerCase().includes(applicationMode.toLowerCase());
          });
          const total = filteredRows.length;
          const paginated = filteredRows.slice(offset, offset + limit);
          const formattedData = paginated.map(formatSchemeRow);
          return res.json({
            success: true,
            data: formattedData,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit) || 1,
            },
          });
        }

        const formattedData = filteredRows.map(formatSchemeRow);
        const total = count ?? formattedData.length;

        return res.json({
          success: true,
          data: formattedData,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        });
      }
    }

    // 2. Fallback: PostgreSQL
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Search filter across multiple fields
    if (search) {
      conditions.push(`(
        scheme_name ILIKE $${paramIndex} OR
        description ILIKE $${paramIndex} OR
        state ILIKE $${paramIndex} OR
        category ILIKE $${paramIndex} OR
        tags::text ILIKE $${paramIndex} OR
        benefits::text ILIKE $${paramIndex} OR
        eligibility::text ILIKE $${paramIndex}
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Category filter
    if (category) {
      conditions.push(`category ILIKE $${paramIndex}`);
      values.push(`%${category}%`);
      paramIndex++;
    }

    // State filter
    if (state) {
      conditions.push(`state ILIKE $${paramIndex}`);
      values.push(`%${state}%`);
      paramIndex++;
    }

    // Application Mode filter
    if (applicationMode) {
      conditions.push(`application_process::text ILIKE $${paramIndex}`);
      values.push(`%${applicationMode}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count Total Matching Schemes
    const countQuery = `SELECT COUNT(*) AS total FROM agriculture_schemes ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // Fetch Paginated Schemes sorted alphabetically by name
    const dataQuery = `
      SELECT * FROM agriculture_schemes
      ${whereClause}
      ORDER BY scheme_name ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataValues = [...values, limit, offset];
    const dataResult = await pool.query(dataQuery, dataValues);

    const formattedData = dataResult.rows.map(formatSchemeRow);

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching agriculture schemes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schemes', error: error.message });
  }
};

// GET /api/schemes/agriculture/filters
export const getAgricultureSchemeFilters = async (req: Request, res: Response) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('agriculture_schemes')
        .select('category, state');

      if (!error && data) {
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

        return res.json({
          success: true,
          categories: Array.from(categorySet).sort(),
          ministries: ['Ministry of Agriculture & Farmers Welfare'],
          states: ['All India', ...Array.from(stateSet).sort()],
          applicationModes: ['Online', 'Offline'],
        });
      }
    }

    // Fallback: PostgreSQL
    const categoriesRes = await pool.query(`
      SELECT DISTINCT category
      FROM agriculture_schemes
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category ASC
    `);

    // Parse distinct categories (splitting multi-category comma-separated values)
    const categorySet = new Set<string>();
    categoriesRes.rows.forEach((r) => {
      if (r.category) {
        // Split on ", " followed by an uppercase letter to preserve "Agriculture,Rural & Environment"
        // but split "Agriculture,Rural & Environment, Business & Entrepreneurship" correctly
        const parts = r.category.split(/, (?=[A-Z])/);
        parts.forEach((c: string) => {
          const trimmed = c.trim();
          if (trimmed) categorySet.add(trimmed);
        });
      }
    });

    const statesRes = await pool.query(`
      SELECT DISTINCT state
      FROM agriculture_schemes
      WHERE state IS NOT NULL AND state != ''
    `);

    const stateSet = new Set<string>();
    statesRes.rows.forEach((r) => {
      if (r.state) {
        // Clean bracket arrays like "['Kerala', 'Karnataka']" or single names
        const cleaned = r.state.replace(/[\[\]']/g, '');
        cleaned.split(',').forEach((s: string) => {
          const trimmed = s.trim();
          if (trimmed && trimmed.toLowerCase() !== 'all india') {
            stateSet.add(trimmed);
          }
        });
      }
    });

    const statesList = ['All India', ...Array.from(stateSet).sort()];

    res.json({
      success: true,
      categories: Array.from(categorySet).sort(),
      ministries: ['Ministry of Agriculture & Farmers Welfare'],
      states: statesList,
      applicationModes: ['Online', 'Offline'],
    });
  } catch (error: any) {
    console.error('Error fetching scheme filters:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch filters', error: error.message });
  }
};

// GET /api/schemes/agriculture/:id
export const getAgricultureSchemeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { data, error } = await supabase
        .from('agriculture_schemes')
        .select('*')
        .eq('scheme_id', id)
        .maybeSingle();

      if (!error && data) {
        return res.json({ success: true, scheme: formatSchemeRow(data) });
      }
    }

    // Fallback: PostgreSQL
    const query = 'SELECT * FROM agriculture_schemes WHERE scheme_id::text = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    res.json({ success: true, scheme: formatSchemeRow(result.rows[0]) });
  } catch (error: any) {
    console.error('Error fetching scheme by id:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scheme', error: error.message });
  }
};
