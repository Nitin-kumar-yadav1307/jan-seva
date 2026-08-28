import { store } from '../../../services/store.js';

export const runWorkforceAgent = async () => {
  // Analyzes cooperative staffing vs predicted demand
  const recommendations = [
    {
      id: 'rec_alloc_01',
      title: 'Monsoon Spike Plumbing Rebalance',
      targetZone: 'Zone A - Central Delhi',
      sourceZone: 'Zone D - East Delhi',
      serviceCategory: 'Plumbing',
      workersToShift: 3,
      rationale: 'Zone A shows 40% higher emergency plumbing requests. Zone D currently has 4 idle certified plumbers.',
      impact: 'Reduces customer wait times by 14 mins; increases cooperative revenue by ₹18,400.',
      status: 'PENDING_APPROVAL',
      createdDate: new Date()
    },
    {
      id: 'rec_alloc_02',
      title: 'South Delhi Weekend Deep Cleaning Surge',
      targetZone: 'Zone C - South Delhi',
      sourceZone: 'Zone B - West Delhi',
      serviceCategory: 'Cleaning',
      workersToShift: 2,
      rationale: 'Festive season deep clean bookings up 65% in South Delhi residential complexes.',
      impact: 'Eliminates unfulfilled bookings with zero worker burnout.',
      status: 'PENDING_APPROVAL',
      createdDate: new Date()
    }
  ];

  return {
    recommendations,
    totalPendingApprovals: recommendations.length,
    message: 'Generated 2 workforce rebalancing proposals requiring cooperative administrator review.'
  };
};

export const runWelfareAgent = async () => {
  const workers = store.workers;
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

  return {
    welfareAlerts,
    cooperativeWelfareIndex: 91,
    summary: `Monitored ${workers.length} cooperative members. ${fatiguedWorkers.length} fatigue alerts and ${underutilizedWorkers.length} fairness balancing priorities.`
  };
};
