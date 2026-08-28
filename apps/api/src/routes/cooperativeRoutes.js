import express from 'express';
import { getCooperativeStats, getCooperatives } from '../controllers/cooperativeController.js';

const router = express.Router();

router.get('/stats', getCooperativeStats);
router.get('/list', getCooperatives);

export default router;
