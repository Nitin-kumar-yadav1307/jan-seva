import express from 'express';
import { getServices, getServiceById, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { ROLES } from '@coopseva/shared';

const router = express.Router();

// Public catalogue — the landing page fetches services without authentication.
router.get('/', getServices);
router.get('/:id', getServiceById);

// Mutations require an authenticated admin/federation-admin.
router.post('/', authenticateToken, requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), createService);
router.put('/:id', authenticateToken, requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), updateService);
router.delete('/:id', authenticateToken, requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), deleteService);

export default router;
