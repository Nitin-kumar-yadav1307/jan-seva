import express from 'express';
import { findMatchingWorkers } from '../controllers/matchingController.js';

const router = express.Router();

router.post('/find', findMatchingWorkers);

export default router;
