import express from 'express';
import { findMatchingWorkers } from '../controllers/matchingController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { ROLES } from '@coopseva/shared';

const router = express.Router();

router.post('/find', authenticateToken, requireRoles(ROLES.CUSTOMER), findMatchingWorkers);

export default router;
