import { Router } from 'express';
import {
  getAgricultureSchemeCount,
  getAgricultureSchemes,
  getAgricultureSchemeFilters,
  getAgricultureSchemeById
} from '../controllers/schemeController.js';

const router = Router();

// /api/schemes/agriculture/count - Get total count of active agriculture schemes
router.get('/agriculture/count', getAgricultureSchemeCount);

// /api/schemes/agriculture/filters - Get dropdown filter options
router.get('/agriculture/filters', getAgricultureSchemeFilters);

// /api/schemes/agriculture - Get paginated & filtered agriculture schemes
router.get('/agriculture', getAgricultureSchemes);

// /api/schemes/agriculture/:id - Get single scheme details
router.get('/agriculture/:id', getAgricultureSchemeById);

export default router;
