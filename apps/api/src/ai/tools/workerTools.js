import { store } from '../../services/store.js';

export const workerTools = {
  findNearbyWorkers: async ({ category, maxDistanceKm = 25 }) => {
    return store.workers.filter(w => 
      w.availability &&
      w.skills?.some(s => s.category.toLowerCase() === (category || 'plumbing').toLowerCase())
    );
  },

  getWorkerWorkload: async ({ workerId }) => {
    const worker = store.workers.find(w => w._id === workerId);
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
    const worker = store.workers.find(w => w._id === workerId);
    return {
      rating: worker?.rating || 4.8,
      totalRatings: worker?.totalRatingsCount || 20,
      completedJobs: worker?.completedJobs || 50
    };
  }
};
