import { FAIRNESS_WEIGHTS, MAX_MATCHING_RADIUS_KM } from '@coopseva/shared';

/**
 * Calculate Great-Circle distance using Haversine formula
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

/**
 * Converts distance into a 0-100 proximity score
 */
export const calculateProximityScore = (distanceKm, maxRadius = MAX_MATCHING_RADIUS_KM) => {
  if (distanceKm <= 0.5) return 100;
  if (distanceKm >= maxRadius) return 0;
  // Non-linear decay giving high scores to nearby workers
  const score = 100 * Math.pow(1 - distanceKm / maxRadius, 1.2);
  return Math.round(score);
};

/**
 * Evaluates skill match grade
 */
export const calculateSkillScore = (workerSkills = [], requiredCategory = '') => {
  const match = workerSkills.find(
    s => s.category.toLowerCase().trim() === requiredCategory.toLowerCase().trim()
  );
  if (!match) return 0;

  let base = 70;
  if (match.level === 'EXPERT') base += 20;
  else if (match.level === 'INTERMEDIATE') base += 10;

  if (match.experienceYears >= 5) base += 10;
  else if (match.experienceYears >= 2) base += 5;

  return Math.min(100, base);
};
