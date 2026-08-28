import express from 'express';
import { getWorkers, getWorkerById, createWorkerProfile, updateWorkerProfile, verifyWorker } from '../controllers/workerController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { ROLES } from '@coopseva/shared';

const router = express.Router();

router.use(authenticateToken);
router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.post('/profile', requireRoles(ROLES.WORKER), createWorkerProfile);
router.put('/:id', authenticateToken, updateWorkerProfile);
router.post('/:id/verify', authenticateToken, requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), verifyWorker);

export default router;
