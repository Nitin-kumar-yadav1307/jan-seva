import { runSupervisorAgent } from '../ai/agents/supervisor/supervisorAgent.js';
import { runBookingAgent } from '../ai/agents/booking/bookingAgent.js';
import { runMatchingAgent } from '../ai/agents/matching/matchingAgent.js';
import { runForecastAgent } from '../ai/agents/forecast/forecastAgent.js';
import {
  runWorkforceAgent,
  runWelfareAgent,
  updateWorkforceRecommendationStatus as persistWorkforceRecommendationStatus
} from '../ai/agents/workforce/workforceAgent.js';
import { store } from '../services/store.js';
import AIActionLog from '../models/AIActionLog.js';
import { getDbStatus } from '../config/db.js';
import { getAIMeta } from '../ai/aiClient.js';

/** Split agent result into payload + AI observability metadata */
const withAIMeta = (result) => {
  const { __ai, ...payload } = result || {};
  return { ...payload, aiMeta: __ai || getAIMeta() };
};

export const handleBookingIntent = async (req, res) => {
  try {
    const { prompt, language = 'en', customerLocation } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const result = await runBookingAgent({ prompt, language, customerLocation });
    return res.status(200).json(withAIMeta(result));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const handleMatchingAgent = async (req, res) => {
  try {
    const { serviceCategory = 'Plumbing', customerCoords = [77.2167, 28.6328], isEmergency = false } = req.body;
    const result = await runMatchingAgent({ serviceCategory, customerCoords, isEmergency });
    return res.status(200).json(withAIMeta(result));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const handleSupervisor = async (req, res) => {
  try {
    const { prompt, customerLocation, language = 'en' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const result = await runSupervisorAgent({ prompt, customerLocation, language });
    return res.status(200).json(withAIMeta(result));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getDemandForecast = async (req, res) => {
  try {
    const { zone } = req.query;
    const result = await runForecastAgent({ zone });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getWorkforceRecommendations = async (req, res) => {
  try {
    const result = await runWorkforceAgent();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getWelfareAlerts = async (req, res) => {
  try {
    const isAdmin = ['ADMIN', 'FEDERATION_ADMIN'].includes(String(req.user.role).toUpperCase());
    const result = await runWelfareAgent({ workerId: isAdmin ? null : req.user._id });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateRecommendationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const recommendation = await persistWorkforceRecommendationStatus(id, { status, reviewedBy: req.user._id, note });
    return res.status(200).json({
      recommendation,
      message: `Recommendation ${status} successfully updated.`
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAIActions = async (req, res) => {
  try {
    const { isConnected } = getDbStatus();
    let logs = [];
    if (isConnected) {
      logs = await AIActionLog.find({}).sort({ createdAt: -1 }).limit(30);
    }
    if (!logs || logs.length === 0) {
      logs = store.aiLogs;
    }
    return res.status(200).json({ actions: logs, count: logs.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const testAI = async (req, res) => {
  try {
    const prompt = req.body.prompt || 'Need a plumber tomorrow morning.';
    const result = await runSupervisorAgent({ prompt });
    return res.status(200).json({
      testStatus: 'SUCCESS',
      input: prompt,
      output: result,
      ai: getAIMeta()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
