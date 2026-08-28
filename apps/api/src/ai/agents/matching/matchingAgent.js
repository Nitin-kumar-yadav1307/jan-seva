import { store } from '../../../services/store.js';
import { rankWorkersForBooking } from '../../../matching/fairness.js';

export const runMatchingAgent = async ({ serviceCategory, customerCoords, isEmergency = false }) => {
  const eligibleWorkers = store.workers.filter(w =>
    w.availability &&
    w.skills?.some(s => s.category.toLowerCase().includes(serviceCategory.toLowerCase()))
  );

  const rankedCandidates = rankWorkersForBooking(eligibleWorkers, {
    customerCoords,
    serviceCategory,
    isEmergency,
    maxResults: 5
  });

  const topMatch = rankedCandidates[0] || null;

  let explainabilitySummary = '';
  if (topMatch) {
    explainabilitySummary = `Top Recommended: ${topMatch.worker.name} (${topMatch.scores.totalScore}/100 match). Proximity: ${topMatch.distanceKm} km, ETA: ${topMatch.etaMinutes} mins. Workload status: ${topMatch.explainability.workloadStatus}. Reasoning: ${topMatch.explainability.reason}`;
  } else {
    explainabilitySummary = 'No qualified cooperative worker available in current radius.';
  }

  return {
    topRecommendation: topMatch,
    rankedCandidates,
    explainabilitySummary,
    confidence: 0.95
  };
};
