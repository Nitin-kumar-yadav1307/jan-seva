import express from 'express';
import { getWorkers, getWorkerById, updateWorkerProfile, verifyWorker } from '../controllers/workerController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { ROLES } from '@coopseva/shared';

const router = express.Router();

router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.put('/:id', authenticateToken, updateWorkerProfile);
router.post('/:id/verify', authenticateToken, requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), verifyWorker);

export default router;
