import { runBookingAgent } from '../booking/bookingAgent.js';
import { runMatchingAgent } from '../matching/matchingAgent.js';
import { store } from '../../../services/store.js';
import AIActionLog from '../../../models/AIActionLog.js';
import { getDbStatus } from '../../../config/db.js';

export const runSupervisorAgent = async ({ prompt, customerLocation, language = 'en' }) => {
  // Step 1: Delegate to Booking Agent to understand intent
  const bookingResult = await runBookingAgent({ prompt, language, customerLocation });
  const intent = bookingResult.extractedIntent;

  // Step 2: Delegate to Matching Agent with parsed category & coordinates
  const matchingResult = await runMatchingAgent({
    serviceCategory: intent.serviceCategory,
    customerCoords: customerLocation?.coordinates || [77.2167, 28.6328],
    isEmergency: intent.isEmergency
  });

  // Step 3: Record structured AIActionLog
  const logRecord = {
    _id: `ai_log_${Date.now()}`,
    agent: 'SUPERVISOR',
    task: 'ORCHESTRATE_BOOKING_MATCH',
    inputSummary: `User request: "${prompt}" (Emergency: ${intent.isEmergency})`,
    toolsUsed: ['runBookingAgent', 'rankWorkersForBooking', 'evaluateFairnessWeights'],
    recommendation: {
      category: intent.serviceCategory,
      isEmergency: intent.isEmergency,
      selectedWorker: matchingResult.topRecommendation?.worker?.name,
      workerId: matchingResult.topRecommendation?.worker?._id,
      matchScore: matchingResult.topRecommendation?.scores?.totalScore,
      etaMinutes: matchingResult.topRecommendation?.etaMinutes
    },
    confidence: 0.96,
    explainabilityNote: matchingResult.explainabilitySummary,
    status: 'EXECUTED',
    createdAt: new Date()
  };

  const { isConnected } = getDbStatus();
  if (isConnected) {
    try {
      const doc = new AIActionLog(logRecord);
      await doc.save();
    } catch (e) {
      console.warn('[Supervisor] MongoDB action log save error:', e.message);
    }
  }
  store.aiLogs.unshift(logRecord);

  return {
    supervisorStatus: 'COMPLETED',
    bookingIntent: intent,
    suggestedServiceId: bookingResult.suggestedServiceId,
    matchingResult,
    aiActionLogId: logRecord._id,
    agentMessage: bookingResult.agentMessage
  };
};
