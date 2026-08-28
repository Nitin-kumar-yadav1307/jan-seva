import express from 'express';
import { getDbStatus } from '../config/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = getDbStatus();
  return res.status(200).json({
    status: 'HEALTHY',
    service: 'Co-opSeva Backend API & Agentic AI Layer',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    aiMode: process.env.AI_MODE || 'demo',
    version: '1.0.0'
  });
});

export default router;
