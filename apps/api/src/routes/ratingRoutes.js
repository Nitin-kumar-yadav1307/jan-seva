import express from 'express';
import { createRating } from '../controllers/ratingController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { ROLES } from '@coopseva/shared';

const router = express.Router();

router.post('/', authenticateToken, requireRoles(ROLES.CUSTOMER), createRating);

export default router;
