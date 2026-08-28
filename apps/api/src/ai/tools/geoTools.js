import { store } from '../../services/store.js';
import { haversineDistance } from '../../matching/scoring.js';

/**
 * geoTools.js — Geospatial calculation tools for AI agents
 * Agents call these instead of directly touching the DB.
 */

export const findNearbyWorkers = ({ coords = [77.2167, 28.6328], radiusKm = 10, category, availableOnly = true }) => {
  let workers = [...store.workers];

  if (availableOnly) {
    workers = workers.filter(w => w.availability !== false);
  }

  if (category) {
    workers = workers.filter(w => w.skills?.some(s => s.category.toLowerCase().includes(category.toLowerCase())));
  }

  // Attach distance to each worker
  const workersWithDistance = workers.map(w => {
    const workerCoords = w.currentLocation?.coordinates || [77.2090, 28.6139];
    const distKm = haversineDistance(
      { lat: coords[1], lon: coords[0] },
      { lat: workerCoords[1], lon: workerCoords[0] }
    );
    return { ...w, distanceKm: Math.round(distKm * 10) / 10 };
  }).filter(w => w.distanceKm <= radiusKm);

  // Sort by distance ascending
  workersWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    workers: workersWithDistance,
    count: workersWithDistance.length,
    searchRadius: radiusKm,
    searchCenter: coords
  };
};

export const calculateDistance = ({ from, to }) => {
  // from/to are [lon, lat] arrays
  const distKm = haversineDistance(
    { lat: from[1], lon: from[0] },
    { lat: to[1], lon: to[0] }
  );
  const etaMinutes = Math.max(5, Math.round(distKm * 12)); // ~5 km/h walking or traffic
  return {
    distanceKm: Math.round(distKm * 10) / 10,
    etaMinutes,
    etaText: etaMinutes <= 10 ? 'Within 10 mins' : `~${etaMinutes} mins`
  };
};

export const getZoneStats = () => {
  const zoneMap = {};
  store.workers.forEach(w => {
    const zone = w.currentLocation?.zone || 'Unknown';
    if (!zoneMap[zone]) zoneMap[zone] = { zone, totalWorkers: 0, availableWorkers: 0, avgWorkload: 0, categories: {} };
    zoneMap[zone].totalWorkers++;
    if (w.availability !== false) zoneMap[zone].availableWorkers++;
    zoneMap[zone].avgWorkload += w.workloadScore || 0;
    w.skills?.forEach(s => {
      zoneMap[zone].categories[s.category] = (zoneMap[zone].categories[s.category] || 0) + 1;
    });
  });

  return Object.values(zoneMap).map(z => ({
    ...z,
    avgWorkload: Math.round(z.avgWorkload / z.totalWorkers)
  }));
};
