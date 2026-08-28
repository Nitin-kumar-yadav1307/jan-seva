import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  HeartHandshake,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coffee,
  Activity,
  Shield,
  Star,
  Wallet,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

const WELFARE_STATUS_CONFIG = {
  OPTIMAL: {
    label: 'Optimal Workload',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    barColor: 'bg-emerald-500',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
  HIGH_LOAD_TODAY: {
    label: 'High Today',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    barColor: 'bg-amber-500',
    icon: <Activity className="w-4 h-4 text-amber-600" />,
  },
  OVERWORKED: {
    label: 'Overworked — Rest Recommended',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    barColor: 'bg-rose-500',
    icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
  },
  UNDERUTILIZED: {
    label: 'Under-assigned',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    barColor: 'bg-blue-500',
    icon: <TrendingDown className="w-4 h-4 text-blue-600" />,
  },
};

const MetricCard = ({ icon, label, value, subLabel, color = 'text-slate-900' }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
    <div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-[11px] font-semibold">{label}</span></div>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
    {subLabel && <p className="text-[10px] text-slate-400">{subLabel}</p>}
  </div>
);

const WelfareBar = ({ label, value, max = 100, status = 'OPTIMAL', helpText }) => {
  const cfg = WELFARE_STATUS_CONFIG[status] || WELFARE_STATUS_CONFIG.OPTIMAL;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-1">
          {label}
          {helpText && (
            <span title={helpText}>
              <Info className="w-3 h-3 text-slate-400" />
            </span>
          )}
        </span>
        <span className={cfg.color}>{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${cfg.barColor} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <p className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</p>
    </div>
  );
};

export const WorkerWelfarePage = () => {
  const [welfareData, setWelfareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchWelfare = async () => {
      try {
        const res = await api.get('/ai/welfare-alerts');
        setWelfareData(res.data);
      } catch (err) {
        console.error('Failed to fetch welfare data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWelfare();
  }, []);

  const workerName = 'Worker';
  const workloadScore = welfareData?.worker?.workloadScore ?? 0;
  const welfareScore = welfareData?.worker?.welfareScore ?? 0;
  const opportunityScore = welfareData?.worker?.opportunityScore ?? 0;
  const completedJobs = welfareData?.worker?.completedJobs ?? 0;
  const weeklyHours = welfareData?.worker?.weeklyHoursLogged ?? 0;
  const monthlyEarnings = welfareData?.worker?.monthlyEarnings ?? 0;
  const weeklyEarnings = welfareData?.worker?.weeklyEarnings ?? 0;
  const restDaysThisWeek = welfareData?.worker?.restDaysThisWeek ?? 0;
  const activeJobsToday = welfareData?.worker?.activeJobsToday ?? 0;
  const recommendation = welfareData?.worker?.recommendation || null;
  const status = workloadScore > 70 ? 'OVERWORKED' : workloadScore < 20 ? 'UNDERUTILIZED' : 'OPTIMAL';

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-20 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-48" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const allAlerts = welfareData?.alerts || [];
  const overloadedCount = allAlerts.filter(a => a.status === 'OVERWORKED').length;
  const underutilizedCount = allAlerts.filter(a => a.status === 'UNDERUTILIZED').length;
  const displayedAlerts = showAll ? allAlerts : allAlerts.slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <HeartHandshake className="w-4 h-4" />
          <span>Worker Welfare & Wellbeing</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Your Welfare Dashboard</h1>
        <p className="text-sm text-slate-500">
          Co-opSeva monitors workload to ensure fair, sustainable work for every cooperative member.
        </p>
      </div>

      <div className={`rounded-2xl border p-5 space-y-4 ${WELFARE_STATUS_CONFIG[status].bg} ${WELFARE_STATUS_CONFIG[status].border}`}>
        <div className="flex items-center gap-2">
          {WELFARE_STATUS_CONFIG[status].icon}
          <h2 className="font-extrabold text-base text-slate-900">My Status: {WELFARE_STATUS_CONFIG[status].label}</h2>
        </div>

        <div className="space-y-3">
          <WelfareBar
            label="Workload Meter"
            value={workloadScore}
            status={status}
            helpText="Based on active jobs and weekly hours"
          />
          <WelfareBar
            label="Welfare Score"
            value={welfareScore}
            status={welfareScore >= 80 ? 'OPTIMAL' : welfareScore >= 50 ? 'HIGH_LOAD_TODAY' : 'OVERWORKED'}
            helpText="Composite of earnings, rest, ratings, and travel"
          />
          <WelfareBar
            label="Opportunity Score"
            value={opportunityScore}
            status={opportunityScore >= 80 ? 'OPTIMAL' : 'HIGH_LOAD_TODAY'}
            helpText="How equitably you're receiving job assignments"
          />
        </div>

        {recommendation && (
          <div className="p-3 rounded-xl bg-white/70 border border-white text-xs text-rose-700 font-medium">
            💡 {recommendation}
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<Wallet className="w-4 h-4" />}
          label="This Week's Earnings"
          value={`₹${weeklyEarnings.toLocaleString()}`}
          subLabel={`₹${monthlyEarnings.toLocaleString()} this month`}
          color="text-emerald-700"
        />
        <MetricCard
          icon={<Clock className="w-4 h-4" />}
          label="Weekly Hours Logged"
          value={`${weeklyHours}h`}
          subLabel="Hours tracked for the current period"
          color={weeklyHours > 40 ? 'text-rose-700' : 'text-slate-900'}
        />
        <MetricCard
          icon={<Star className="w-4 h-4" />}
          label="Completed Jobs"
          value={completedJobs}
          subLabel="Total completed assignments"
          color="text-amber-600"
        />
        <MetricCard
          icon={<Coffee className="w-4 h-4" />}
          label="Rest Days This Week"
          value={restDaysThisWeek}
          subLabel="Available recovery time"
          color="text-coop-700"
        />
      </div>

      {/* Today's Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-extrabold text-sm text-slate-800 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-coop-600" /> Today's Activity
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-lg font-black text-slate-900">{activeJobsToday}</p>
            <p className="text-[10px] text-slate-500">Active Jobs</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-lg font-black text-slate-900">{weeklyHours || 0}h</p>
            <p className="text-[10px] text-slate-500">Tracked Hours</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-lg font-black text-emerald-700">{workloadScore >= 80 ? 'High' : workloadScore >= 40 ? 'Balanced' : 'Low'}</p>
            <p className="text-[10px] text-slate-500">Load Level</p>
          </div>
        </div>
      </div>

      {/* Cooperative-wide Welfare Alerts (Admin view) */}
      {allAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-coop-600" /> Cooperative Welfare Monitoring
            </h3>
            <div className="flex gap-2 text-[10px] font-bold">
              {overloadedCount > 0 && (
                <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">{overloadedCount} Overloaded</span>
              )}
              {underutilizedCount > 0 && (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{underutilizedCount} Under-assigned</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {displayedAlerts.map((alert, i) => {
              const cfg = WELFARE_STATUS_CONFIG[alert.status] || WELFARE_STATUS_CONFIG.OPTIMAL;
              if (alert.status === 'OPTIMAL') return null;
              return (
                <div key={i} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {cfg.icon}
                      <span className="font-bold text-sm text-slate-900">{alert.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 ml-6">{alert.skill} · {alert.weeklyHours}h/week · Workload: {alert.workloadScore}%</p>
                  {alert.recommendation && (
                    <p className={`text-[11px] ${cfg.color} font-medium ml-6 mt-1`}>
                      💡 {alert.recommendation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {allAlerts.length > 5 && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="w-full text-xs font-bold text-coop-600 py-2 flex items-center justify-center gap-1 hover:bg-coop-50 rounded-xl transition-colors"
            >
              {showAll ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show All {allAlerts.length} Workers</>}
            </button>
          )}
        </div>
      )}

      {/* Welfare Principles */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white space-y-3">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-emerald-400" />
          <h3 className="font-extrabold text-sm">Co-opSeva's Worker Welfare Principles</h3>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300">
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> 85% of every booking goes directly to you</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> AI prevents overloading any single worker</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Opportunity Index ensures fair job distribution</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> 10% cooperative welfare fund for emergencies & training</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Maximum 40 working hours per week enforced by guardrails</li>
        </ul>
      </div>
    </div>
  );
};
