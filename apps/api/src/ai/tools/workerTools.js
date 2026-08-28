import { store } from '../../services/store.js';
import Worker from '../../models/Worker.js';
import { getDbStatus } from '../../config/db.js';
import { getEligibleWorkers } from '../../matching/matcher.js';

export const workerTools = {
  findNearbyWorkers: async ({ category, maxDistanceKm = 25, customerCoords }) => {
    return getEligibleWorkers({ serviceCategory: category || 'Plumbing', customerCoords, maxRadiusKm: maxDistanceKm });
  },

  getWorkerWorkload: async ({ workerId }) => {
    const { isConnected } = getDbStatus();
    const worker = isConnected ? await Worker.findById(workerId).lean() : store.workers.find(w => w._id === workerId);
    if (!worker) return null;
    return {
      workerId: worker._id,
      name: worker.name,
      workloadScore: worker.workloadScore,
      activeJobsToday: worker.activeJobsToday,
      weeklyHoursLogged: worker.weeklyHoursLogged,
      fatigueRisk: worker.workloadScore > 75 ? 'HIGH_FATIGUE' : 'NORMAL'
    };
  },

  getWorkerRatings: async ({ workerId }) => {
    const { isConnected } = getDbStatus();
    const worker = isConnected ? await Worker.findById(workerId).lean() : store.workers.find(w => w._id === workerId);
    return {
      rating: worker?.rating || 4.8,
      totalRatings: worker?.totalRatingsCount || 20,
      completedJobs: worker?.completedJobs || 50
    };
  }
};
