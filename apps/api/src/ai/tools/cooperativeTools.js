import { store } from '../../services/store.js';

/**
 * cooperativeTools.js — Cooperative query tools for AI agents
 */

export const getCooperativeStats = (cooperativeId) => {
  const coops = cooperativeId
    ? store.cooperatives.filter(c => c._id === cooperativeId)
    : store.cooperatives;

  return coops.map(coop => {
    const coopWorkers = store.workers.filter(w => w.cooperativeId === coop._id);
    const coopBookings = store.bookings.filter(b => b.cooperativeId === coop._id);
    const completedBookings = coopBookings.filter(b => b.status === 'COMPLETED');

    const avgRating = coopWorkers.length > 0
      ? (coopWorkers.reduce((s, w) => s + (w.rating || 0), 0) / coopWorkers.length).toFixed(2)
      : 0;

    const totalRevenue = completedBookings.reduce((s, b) => s + (b.finalPrice || b.estimatedPrice || 0), 0);
    const welfarePool = Math.round(totalRevenue * 0.10);

    const overloadedWorkers = coopWorkers.filter(w => w.workloadScore > 70).length;
    const avgWorkload = coopWorkers.length > 0
      ? Math.round(coopWorkers.reduce((s, w) => s + (w.workloadScore || 0), 0) / coopWorkers.length)
      : 0;

    // Cooperative Health Score (0–100)
    const utilizationScore = coopWorkers.length > 0
      ? Math.round((coopWorkers.filter(w => w.availability !== false).length / coopWorkers.length) * 100)
      : 0;
    const balanceScore = Math.max(0, 100 - (overloadedWorkers / Math.max(coopWorkers.length, 1)) * 100);
    const satisfactionScore = parseFloat(avgRating) * 20; // 0–100
    const healthScore = Math.round((utilizationScore * 0.3) + (balanceScore * 0.4) + (satisfactionScore * 0.3));

    // Worker Opportunity Index
    const opportunityIndex = coopWorkers.map(w => ({
      workerId: w._id,
      name: w.name,
      completedJobs: w.completedJobs || 0,
      weeklyHours: w.weeklyHoursLogged || 0,
      opportunityScore: w.opportunityScore || 50,
      opportunityLabel: (w.opportunityScore || 50) < 40 ? 'LOW' : (w.opportunityScore || 50) > 70 ? 'HIGH' : 'BALANCED'
    })).sort((a, b) => a.opportunityScore - b.opportunityScore);

    return {
      cooperative: coop,
      stats: {
        totalWorkers: coopWorkers.length,
        availableWorkers: coopWorkers.filter(w => w.availability !== false).length,
        verifiedWorkers: coopWorkers.filter(w => w.verificationStatus === 'VERIFIED').length,
        totalBookings: coopBookings.length,
        completedBookings: completedBookings.length,
        totalRevenue,
        welfarePool,
        avgRating: parseFloat(avgRating),
        avgWorkload,
        overloadedWorkers,
        healthScore,
        utilizationRate: `${utilizationScore}%`
      },
      opportunityIndex
    };
  });
};

export const getWorkerWelfareReport = () => {
  return store.workers.map(w => {
    const weeklyHours = w.weeklyHoursLogged || 0;
    const workloadScore = w.workloadScore || 0;
    const welfareScore = w.welfareScore || 80;

    let status = 'OPTIMAL';
    let recommendation = null;

    if (weeklyHours > 45 || workloadScore > 80) {
      status = 'OVERWORKED';
      recommendation = `Reduce new assignments for ${w.name}. Currently at ${weeklyHours}h/week. Suggest capping at 40h.`;
    } else if (weeklyHours < 10 && (w.completedJobs || 0) < 5) {
      status = 'UNDERUTILIZED';
      recommendation = `${w.name} has capacity. Consider increasing assignment priority for new requests.`;
    } else if (w.activeJobsToday > 3) {
      status = 'HIGH_LOAD_TODAY';
      recommendation = `${w.name} has ${w.activeJobsToday} active jobs today. Monitor fatigue.`;
    }

    return {
      workerId: w._id,
      name: w.name,
      skill: w.skills?.[0]?.category || 'Artisan',
      weeklyHours,
      workloadScore,
      welfareScore,
      activeJobsToday: w.activeJobsToday || 0,
      completedJobs: w.completedJobs || 0,
      status,
      recommendation,
      zone: w.currentLocation?.zone
    };
  }).sort((a, b) => b.workloadScore - a.workloadScore);
};
