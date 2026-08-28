import { store } from '../services/store.js';
import { rankWorkersForBooking } from '../matching/fairness.js';
import { getEligibleWorkers } from '../matching/matcher.js';

export const findMatchingWorkers = async (req, res) => {
  try {
    const {
      serviceCategory = 'Plumbing',
      customerCoordinates = [77.2167, 28.6328], // [lon, lat]
      isEmergency = false,
      maxRadiusKm = 25
    } = req.body;

    const workers = await getEligibleWorkers({ serviceCategory, customerCoords: customerCoordinates, maxRadiusKm });

    const rankedCandidates = rankWorkersForBooking(workers, {
      customerCoords: customerCoordinates,
      serviceCategory,
      isEmergency,
      maxRadiusKm,
      maxResults: 6
    });

    const topRecommendation = rankedCandidates[0] || null;

    // Check if fairness balancing re-ranked the nearest worker
    let fairnessBalancingApplied = false;
    if (rankedCandidates.length > 1) {
      const nearest = [...rankedCandidates].sort((a, b) => a.distanceKm - b.distanceKm)[0];
      if (topRecommendation && nearest.worker._id !== topRecommendation.worker._id) {
        fairnessBalancingApplied = true;
      }
    }

    return res.status(200).json({
      serviceCategory,
      isEmergency,
      customerCoordinates,
      topRecommendation,
      rankedCandidates,
      totalCandidatesFound: rankedCandidates.length,
      fairnessBalancingApplied,
      message: topRecommendation 
        ? `Found top verified worker: ${topRecommendation.worker.name || 'Worker'} (${topRecommendation.scores.totalScore}% match)`
        : 'No available workers found matching criteria'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
