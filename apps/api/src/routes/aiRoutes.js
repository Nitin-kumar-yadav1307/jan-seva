import express from 'express';
import {
  handleBookingIntent,
  handleMatchingAgent,
  handleSupervisor,
  getDemandForecast,
  getWorkforceRecommendations,
  getWelfareAlerts,
  getAIActions,
  testAI
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/booking-intent', handleBookingIntent);
router.post('/match', handleMatchingAgent);
router.post('/supervisor', handleSupervisor);
router.get('/demand-forecast', getDemandForecast);
router.get('/workforce-recommendation', getWorkforceRecommendations);
router.get('/welfare-alerts', getWelfareAlerts);
router.get('/actions', getAIActions);
router.post('/test', testAI);

export default router;
