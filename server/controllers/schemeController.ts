import { Request, Response } from 'express';
import { pool } from '../db.js';

// GET /api/schemes/agriculture/count
export const getAgricultureSchemeCount = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS total_agriculture_schemes
      FROM agriculture_schemes
      WHERE status = 'Active';
    `);

    const count = parseInt(result.rows[0]?.total_agriculture_schemes || '0', 10);

    res.json({
      success: true,
      total_agriculture_schemes: count,
      count
    });
  } catch (error: any) {
    console.error('Error fetching agriculture scheme count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scheme count', error: error.message });
  }
};

// GET /api/schemes/agriculture
export const getAgricultureSchemes = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '12', 10);
    const offset = (page - 1) * limit;

    const search = (req.query.search as string || '').trim();
    const ministry = (req.query.ministry as string || '').trim();
    const state = (req.query.state as string || '').trim();
    const applicationMode = (req.query.application_mode as string || '').trim();

    const conditions: string[] = ["status = 'Active'"];
    const values: any[] = [];
    let paramIndex = 1;

    // Search filter across multiple fields
    if (search) {
      conditions.push(`(
        scheme_name ILIKE $${paramIndex} OR
        ministry_department ILIKE $${paramIndex} OR
        description ILIKE $${paramIndex} OR
        benefits ILIKE $${paramIndex} OR
        eligibility ILIKE $${paramIndex} OR
        target_beneficiary ILIKE $${paramIndex} OR
        scheme_id ILIKE $${paramIndex}
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Category filter
    const category = (req.query.category as string || '').trim();
    if (category) {
      conditions.push(`category ILIKE $${paramIndex}`);
      values.push(`%${category}%`);
      paramIndex++;
    }

    // Ministry filter
    if (ministry) {
      conditions.push(`ministry_department = $${paramIndex}`);
      values.push(ministry);
      paramIndex++;
    }

    // State / Beneficiary filter
    if (state) {
      conditions.push(`target_beneficiary ILIKE $${paramIndex}`);
      values.push(`%${state}%`);
      paramIndex++;
    }

    // Application Mode filter
    if (applicationMode) {
      conditions.push(`application_mode = $${paramIndex}`);
      values.push(applicationMode);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count Total Matching Schemes
    const countQuery = `SELECT COUNT(*) AS total FROM agriculture_schemes ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // Fetch Paginated Schemes sorted by id ASC
    const dataQuery = `
      SELECT * FROM agriculture_schemes
      ${whereClause}
      ORDER BY id ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataValues = [...values, limit, offset];
    const dataResult = await pool.query(dataQuery, dataValues);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching agriculture schemes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schemes', error: error.message });
  }
};

// GET /api/schemes/agriculture/filters
export const getAgricultureSchemeFilters = async (req: Request, res: Response) => {
  try {
    const categoriesRes = await pool.query(`
      SELECT DISTINCT category
      FROM agriculture_schemes
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category ASC
    `);

    const ministriesRes = await pool.query(`
      SELECT DISTINCT ministry_department
      FROM agriculture_schemes
      WHERE ministry_department IS NOT NULL AND ministry_department != ''
      ORDER BY ministry_department ASC
    `);

    const statesRes = await pool.query(`
      SELECT DISTINCT target_beneficiary
      FROM agriculture_schemes
      WHERE target_beneficiary IS NOT NULL AND target_beneficiary != ''
      ORDER BY target_beneficiary ASC
    `);

    const modesRes = await pool.query(`
      SELECT DISTINCT application_mode
      FROM agriculture_schemes
      WHERE application_mode IS NOT NULL AND application_mode != ''
      ORDER BY application_mode ASC
    `);

    res.json({
      success: true,
      categories: categoriesRes.rows.map(r => r.category),
      ministries: ministriesRes.rows.map(r => r.ministry_department),
      states: statesRes.rows.map(r => r.target_beneficiary),
      applicationModes: modesRes.rows.map(r => r.application_mode)
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
    let query = '';
    let values = [id];

    if (/^\d+$/.test(id)) {
      query = 'SELECT * FROM agriculture_schemes WHERE id = $1';
    } else {
      query = 'SELECT * FROM agriculture_schemes WHERE scheme_id = $1';
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    res.json({ success: true, scheme: result.rows[0] });
  } catch (error: any) {
    console.error('Error fetching scheme by id:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scheme', error: error.message });
  }
};
