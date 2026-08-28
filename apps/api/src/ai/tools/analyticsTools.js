import { store } from '../../services/store.js';

/**
 * analyticsTools.js — Analytics & demand history tools for AI agents
 */

export const getDemandHistory = ({ category, zone, days = 7 } = {}) => {
  // Generate synthetic but realistic demand history seeded from store data
  const categories = category
    ? [category]
    : ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Caregiving', 'Appliance Repair', 'Painting', 'Gardening'];

  const zones = ['Zone A - South Mumbai', 'Zone B - Western Suburbs', 'Zone C - Central Suburbs', 'Zone D - Navi Mumbai'];

  const history = [];
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });

    categories.forEach(cat => {
      const baseLoad = cat === 'Plumbing' ? 18 : cat === 'Electrical' ? 14 : cat === 'Cleaning' ? 22 : cat === 'Carpentry' ? 9 : 11;
      const dayMultiplier = [0.7, 1.0, 1.1, 1.0, 1.2, 1.5, 1.3][date.getDay()]; // Sun–Sat
      const demand = Math.round(baseLoad * dayMultiplier + (Math.random() * 4 - 2));

      (zone ? [zone] : zones.slice(0, 2)).forEach(z => {
        history.push({
          date: date.toISOString().split('T')[0],
          dayName,
          category: cat,
          zone: z,
          bookingsCount: Math.max(0, Math.round(demand * (z.includes('Central') ? 1.2 : 0.8)))
        });
      });
    });
  }

  return { history, days, categories, zones: zone ? [zone] : zones };
};

export const getServiceDistribution = () => {
  const dist = {};
  store.workers.forEach(w => {
    w.skills?.forEach(s => {
      dist[s.category] = (dist[s.category] || 0) + 1;
    });
  });
  return Object.entries(dist)
    .map(([category, workerCount]) => ({ category, workerCount }))
    .sort((a, b) => b.workerCount - a.workerCount);
};

export const getWorkerUtilizationStats = () => {
  const total = store.workers.length;
  const available = store.workers.filter(w => w.availability !== false).length;
  const overloaded = store.workers.filter(w => w.workloadScore > 70).length;
  const underutilized = store.workers.filter(w => w.workloadScore < 30).length;
  const avgWorkload = Math.round(store.workers.reduce((s, w) => s + (w.workloadScore || 0), 0) / total);
  const avgRating = (store.workers.reduce((s, w) => s + (w.rating || 0), 0) / total).toFixed(2);

  return {
    total,
    available,
    unavailable: total - available,
    overloaded,
    underutilized,
    balanced: total - overloaded - underutilized,
    avgWorkload,
    avgRating: parseFloat(avgRating),
    utilizationRate: `${Math.round((available / total) * 100)}%`
  };
};

export const getKPISummary = () => {
  const workers = store.workers;
  const bookings = store.bookings;
  const completed = bookings.filter(b => b.status === 'COMPLETED');

  return {
    totalWorkers: workers.length,
    verifiedWorkers: workers.filter(w => w.verificationStatus === 'VERIFIED').length,
    totalBookings: bookings.length,
    completedBookings: completed.length,
    activeBookings: bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status)).length,
    totalRevenue: completed.reduce((s, b) => s + (b.finalPrice || b.estimatedPrice || 0), 0),
    avgRating: parseFloat((workers.reduce((s, w) => s + (w.rating || 0), 0) / workers.length).toFixed(2)),
    cooperatives: store.cooperatives.length
  };
};
