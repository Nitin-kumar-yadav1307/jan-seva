import express from 'express';
import {
  handleBookingIntent,
  handleMatchingAgent,
  handleSupervisor,
  getDemandForecast,
  getWorkforceRecommendations,
  getWelfareAlerts,
  updateRecommendationStatus,
  getAIActions,
  testAI
} from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { ROLES } from '@coopseva/shared';

const router = express.Router();

router.use(authenticateToken);
router.post('/booking-intent', requireRoles(ROLES.CUSTOMER), handleBookingIntent);
router.post('/match', requireRoles(ROLES.CUSTOMER), handleMatchingAgent);
router.post('/supervisor', requireRoles(ROLES.CUSTOMER), handleSupervisor);
router.get('/demand-forecast', requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), getDemandForecast);
router.get('/workforce-recommendation', requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), getWorkforceRecommendations);
router.patch('/workforce-recommendation/:id/status', requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), updateRecommendationStatus);
router.get('/welfare-alerts', requireRoles(ROLES.WORKER, ROLES.ADMIN, ROLES.FEDERATION_ADMIN), getWelfareAlerts);
router.get('/actions', requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), getAIActions);
router.post('/test', requireRoles(ROLES.ADMIN, ROLES.FEDERATION_ADMIN), testAI);

export default router;
