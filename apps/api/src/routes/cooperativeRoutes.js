import express from 'express';
import { getCooperativeStats, getCooperatives, createCooperative, updateCooperative } from '../controllers/cooperativeController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { ROLES } from '@coopseva/shared';

const router = express.Router();

router.use(authenticateToken);
router.get('/stats', getCooperativeStats);
router.get('/list', getCooperatives);
router.post('/', requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), createCooperative);
router.put('/:id', requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), updateCooperative);

export default router;
