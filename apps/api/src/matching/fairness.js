import { FAIRNESS_WEIGHTS, VERIFICATION_STATUS, MAX_MATCHING_RADIUS_KM } from '@coopseva/shared';
import { calculateDistanceKm, calculateProximityScore, calculateSkillScore } from './scoring.js';

/**
 * Deterministic Fairness Engine
 * Evaluates candidate workers using multi-objective optimization:
 * - Skill match
 * - Distance & Proximity
 * - Rating & Track Record
 * - Workload balancing (prevents worker burnout, distributes income)
 * - Welfare & Opportunity index
 */
export const evaluateWorkerCandidate = (worker, options = {}) => {
  const {
    customerCoords = [77.2167, 28.6328], // [longitude, latitude]
    serviceCategory = 'Plumbing',
    isEmergency = false
  } = options;

  const [custLon, custLat] = customerCoords;
  const [wrkLon, wrkLat] = worker.currentLocation?.coordinates || [72.8777, 19.0760];

  // 1. Distance & Proximity
  const distanceKm = calculateDistanceKm(custLat, custLon, wrkLat, wrkLon);
  const proximityScore = calculateProximityScore(distanceKm);

  // 2. Skill Match
  const skillScore = calculateSkillScore(worker.skills || [], serviceCategory);

  // 3. Rating Score (Normalized to 0-100)
  const ratingScore = Math.round(((worker.rating || 4.5) / 5.0) * 100);

  // 4. Workload Balancing Score
  // If a worker is overloaded (workloadScore = 88), workloadBalanceScore is low (12).
  // If a worker is fresh (workloadScore = 25), workloadBalanceScore is high (75).
  const workloadScore = Math.max(0, 100 - (worker.workloadScore || 30));

  // 5. Welfare & Opportunity Factor
  const welfareFactor = worker.welfareScore || 90;

  // Select weight table (Normal vs Emergency mode)
  const weights = isEmergency ? FAIRNESS_WEIGHTS.EMERGENCY : FAIRNESS_WEIGHTS.NORMAL;

  // Composite Match Score
  const totalScore = Math.round(
    skillScore * weights.skillMatch +
    proximityScore * weights.proximity +
    ratingScore * weights.rating +
    workloadScore * weights.workloadBalance +
    welfareFactor * weights.welfareFactor
  );

  // Approximate ETA: 5 mins base + 3 mins per km
  const etaMinutes = Math.max(8, Math.round(5 + distanceKm * 3.2));

  // Explainability narrative
  let reason = '';
  if (isEmergency) {
    reason = `Emergency Mode: Prioritized rapid ETA (${etaMinutes}m, ${distanceKm}km away) and certified ${serviceCategory} skill match.`;
  } else if (worker.workloadScore > 75) {
    reason = `Qualified worker nearby, but penalized for high weekly workload (${worker.weeklyHoursLogged || 40}h) to protect worker health.`;
  } else {
    reason = `Optimal match: Strong rating (${worker.rating}★), close proximity (${distanceKm}km), and high cooperative fairness balance score.`;
  }

  return {
    worker,
    distanceKm,
    etaMinutes,
    scores: {
      totalScore,
      skillScore,
      proximityScore,
      ratingScore,
      workloadScore,
      welfareFactor
    },
    explainability: {
      reason,
      workloadStatus: worker.workloadScore > 70 ? 'OVERLOADED' : worker.workloadScore > 40 ? 'MODERATE' : 'OPTIMAL_CAPACITY',
      verificationStatus: worker.verificationStatus,
      cooperativeAffiliation: worker.cooperativeId?.name || 'Mumbai Central Artisan Co-op'
    }
  };
};

/**
 * Filter, score, and rank workers for a booking request
 */
export const rankWorkersForBooking = (workersList = [], options = {}) => {
  const { serviceCategory, isEmergency, maxResults = 5, maxRadiusKm = MAX_MATCHING_RADIUS_KM } = options;
  const customerCoords = options.customerCoords || [77.2167, 28.6328];

  // Mandatory hard constraints: availability, verification, skill, and customer radius.
  const eligible = workersList.filter(worker => {
    if (!worker.availability) return false;
    if (worker.verificationStatus !== VERIFICATION_STATUS.VERIFIED) return false;
    const hasSkill = worker.skills?.some(
      s => s.category.toLowerCase().trim() === serviceCategory.toLowerCase().trim()
    );
    if (!hasSkill) return false;

    const [customerLon, customerLat] = customerCoords;
    const [workerLon, workerLat] = worker.currentLocation?.coordinates || [];
    if (![customerLon, customerLat, workerLon, workerLat].every(Number.isFinite)) return false;
    return calculateDistanceKm(customerLat, customerLon, workerLat, workerLon) <= maxRadiusKm;
  });

  // 2. Score every eligible worker
  const scored = eligible.map(w => evaluateWorkerCandidate(w, options));

  // 3. Sort by totalScore descending
  scored.sort((a, b) => b.scores.totalScore - a.scores.totalScore);

  return scored.slice(0, maxResults);
};
