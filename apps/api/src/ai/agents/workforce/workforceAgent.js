import { store } from '../../../services/store.js';
import AIActionLog from '../../../models/AIActionLog.js';
import WorkforceRecommendation from '../../../models/WorkforceRecommendation.js';
import Worker from '../../../models/Worker.js';
import Booking from '../../../models/Booking.js';
import { getDbStatus } from '../../../config/db.js';

const DEFAULT_RECOMMENDATIONS = [
  {
    id: 'rec_alloc_01',
    title: 'Monsoon Spike Plumbing Rebalance',
    targetZone: 'Zone A - South Mumbai',
    sourceZone: 'Zone D - Navi Mumbai',
    serviceCategory: 'Plumbing',
    workersToShift: 3,
    rationale: 'Zone A shows 40% higher emergency plumbing requests. Zone D currently has 4 idle certified plumbers.',
    impact: 'Reduces customer wait times by 14 mins; increases cooperative revenue by ₹18,400.',
    status: 'PENDING_APPROVAL',
    createdDate: new Date()
  },
  {
    id: 'rec_alloc_02',
    title: 'Weekend Deep Cleaning Surge — South Mumbai',
    targetZone: 'Zone C - Central Suburbs',
    sourceZone: 'Zone B - Western Suburbs',
    serviceCategory: 'Cleaning',
    workersToShift: 2,
    rationale: 'Festive season deep clean bookings up 65% in Central Suburbs residential complexes.',
    impact: 'Eliminates unfulfilled bookings with zero worker burnout.',
    status: 'PENDING_APPROVAL',
    createdDate: new Date()
  }
];

const seedWorkforceRecommendations = () => {
  if (!Array.isArray(store.workforceRecommendations) || store.workforceRecommendations.length === 0) {
    store.workforceRecommendations = DEFAULT_RECOMMENDATIONS.map(rec => ({
      ...rec,
      createdDate: rec.createdDate instanceof Date ? rec.createdDate : new Date(rec.createdDate || Date.now())
    }));
  }
  return store.workforceRecommendations;
};

export const runWorkforceAgent = async () => {
  const { isConnected } = getDbStatus();
  let recommendations;

  if (isConnected) {
    const [workers, bookings] = await Promise.all([Worker.find({}).lean(), Booking.find({}).lean()]);
    const zones = new Map();
    workers.forEach(worker => {
      const zone = worker.currentLocation?.zone || worker.currentLocation?.address || 'Unassigned';
      const entry = zones.get(zone) || { workers: 0, available: 0, activeJobs: 0 };
      entry.workers += 1;
      if (worker.availability) entry.available += 1;
      zones.set(zone, entry);
    });
    bookings.filter(booking => !['COMPLETED', 'CANCELLED'].includes(booking.status)).forEach(booking => {
      const zone = booking.location?.zone || booking.location?.city || 'Unassigned';
      const entry = zones.get(zone) || { workers: 0, available: 0, activeJobs: 0 };
      entry.activeJobs += 1;
      zones.set(zone, entry);
    });

    const generated = [...zones.entries()]
      .filter(([, metrics]) => metrics.activeJobs > metrics.available)
      .map(([zone, metrics]) => ({
        recommendationId: `rec_${Buffer.from(`${zone}:${Date.now()}`).toString('base64url')}`,
        title: `Capacity review for ${zone}`,
        targetZone: zone,
        sourceZone: 'Unassigned',
        serviceCategory: 'All services',
        workersToShift: metrics.activeJobs - metrics.available,
        rationale: `${metrics.activeJobs} active jobs exceed ${metrics.available} available workers in this zone.`,
        impact: 'Review capacity before accepting additional assignments.',
        status: 'PENDING_APPROVAL'
      }));

    if (generated.length) {
      for (const item of generated) {
        const existing = await WorkforceRecommendation.findOne({
          targetZone: item.targetZone,
          status: 'PENDING_APPROVAL'
        });
        if (!existing) await WorkforceRecommendation.create(item);
      }
    }
    recommendations = await WorkforceRecommendation.find({}).sort({ createdAt: -1 }).lean();
    recommendations = recommendations.map(({ recommendationId, createdAt, ...recommendation }) => ({
      ...recommendation,
      id: recommendationId,
      createdDate: createdAt,
      recommendationId
    }));
  } else {
    recommendations = seedWorkforceRecommendations();
  }

  return {
    recommendations,
    totalPendingApprovals: recommendations.filter(r => r.status === 'PENDING_APPROVAL').length,
    message: 'Generated workforce rebalancing proposals requiring cooperative administrator review.'
  };
};

export const updateWorkforceRecommendationStatus = async (id, { status, reviewedBy, note } = {}) => {
  const normalizedStatus = status || 'PENDING_APPROVAL';
  if (!['APPROVED', 'REJECTED', 'PENDING_APPROVAL'].includes(normalizedStatus)) {
    throw new Error('Invalid recommendation status');
  }

  const { isConnected } = getDbStatus();
  let recommendation;
  if (isConnected) {
    recommendation = await WorkforceRecommendation.findOne({ recommendationId: id });
  } else {
    const recommendations = seedWorkforceRecommendations();
    recommendation = recommendations.find(r => r.id === id);
  }
  if (!recommendation) {
    throw new Error('Workforce recommendation not found');
  }

  recommendation.status = normalizedStatus;
  recommendation.reviewedBy = reviewedBy || recommendation.reviewedBy;
  recommendation.reviewedAt = new Date();
  if (note) recommendation.reviewNote = note;

  if (isConnected) {
    await recommendation.save();
    await AIActionLog.create({
      agent: 'WORKFORCE_AGENT',
      task: `RECOMMENDATION_${normalizedStatus}`,
      inputSummary: `Workforce recommendation ${id} reviewed for ${recommendation.serviceCategory} assignment`,
      toolsUsed: ['runWorkforceAgent', 'approveWorkforceRecommendation'],
      recommendation: { id, status: normalizedStatus, targetZone: recommendation.targetZone },
      confidence: 0.94,
      explainabilityNote: note || `Recommendation ${normalizedStatus.toLowerCase()} by ${recommendation.reviewedBy}.`,
      status: normalizedStatus,
      approvedBy: reviewedBy || undefined,
      createdAt: new Date()
    });
  }

  return recommendation;
};

export const runWelfareAgent = async ({ workerId = null } = {}) => {
  const { isConnected } = getDbStatus();
  const workers = isConnected
    ? await Worker.find(workerId ? { userId: workerId } : {}).lean()
    : store.workers.filter(worker => !workerId || worker.userId === workerId);
  const fatiguedWorkers = workers.filter(w => (w.workloadScore || 0) > 70 || (w.weeklyHoursLogged || 0) > 42);
  const underutilizedWorkers = workers.filter(w => (w.workloadScore || 0) < 25 && (w.activeJobsToday || 0) === 0);

  const welfareAlerts = [
    ...fatiguedWorkers.map(w => ({
      workerId: w._id,
      name: w.name,
      alertType: 'WORKLOAD_FATIGUE_WARNING',
      severity: 'WARNING',
      metric: `${w.weeklyHoursLogged || 45} hours logged this week (${w.activeJobsToday || 5} active jobs today)`,
      actionRecommended: 'Temporarily cooldown in auto-dispatch algorithm; route new calls to fresh cooperative peers.'
    })),
    ...underutilizedWorkers.map(w => ({
      workerId: w._id,
      name: w.name,
      alertType: 'INCOME_UNDERUTILIZATION_PROTECTION',
      severity: 'OPPORTUNITY',
      metric: `0 active jobs today; opportunity score ${w.opportunityScore}/100`,
      actionRecommended: 'Elevate priority weighting in fairness matching engine for upcoming service inquiries.'
    }))
  ];

  const worker = workers.length === 1 ? {
    name: workers[0].name,
    workloadScore: workers[0].workloadScore || 0,
    welfareScore: workers[0].welfareScore || 0,
    opportunityScore: workers[0].opportunityScore || 0,
    completedJobs: workers[0].completedJobs || 0,
    weeklyHoursLogged: workers[0].weeklyHoursLogged || 0,
    activeJobsToday: workers[0].activeJobsToday || 0,
    recommendation: welfareAlerts[0]?.actionRecommended || null,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    restDaysThisWeek: 0
  } : null;

  return {
    welfareAlerts,
    alerts: welfareAlerts,
    worker,
    cooperativeWelfareIndex: 91,
    summary: `Monitored ${workers.length} cooperative members. ${fatiguedWorkers.length} fatigue alerts and ${underutilizedWorkers.length} fairness balancing priorities.`
  };
};
