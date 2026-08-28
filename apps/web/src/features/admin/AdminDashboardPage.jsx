import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  HeartHandshake, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Bot, 
  ArrowRight, 
  Layers
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [workforceRecs, setWorkforceRecs] = useState([]);
  const [welfareAlerts, setWelfareAlerts] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, forecastRes, wfRes, welfareRes, logsRes] = await Promise.all([
          api.get('/cooperatives/stats'),
          api.get('/ai/demand-forecast'),
          api.get('/ai/workforce-recommendation'),
          api.get('/ai/welfare-alerts'),
          api.get('/ai/actions')
        ]);

        setStats(statsRes.data.summary);
        setForecast(forecastRes.data);
        setWorkforceRecs(wfRes.data.recommendations || []);
        setWelfareAlerts(welfareRes.data.welfareAlerts || []);
        setAiLogs(logsRes.data.actions || []);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleApproveRebalance = async (recId) => {
    try {
      const res = await api.patch(`/ai/workforce-recommendation/${recId}/status`, {
        status: 'APPROVED',
        reviewedBy: 'admin@coopseva.org',
        note: 'Approved after cooperative workload review and welfare check.'
      });

      const updated = res.data.recommendation;
      setWorkforceRecs(prev => prev.map(r => r.id === recId ? { ...r, ...updated, status: 'APPROVED' } : r));
    } catch (err) {
      console.error('Failed to approve workforce recommendation:', err);
    }
  };

  const handleRejectRebalance = async (recId) => {
    try {
      const res = await api.patch(`/ai/workforce-recommendation/${recId}/status`, {
        status: 'REJECTED',
        reviewedBy: 'admin@coopseva.org',
        note: 'Rejected to preserve worker balance and current service coverage.'
      });

      const updated = res.data.recommendation;
      setWorkforceRecs(prev => prev.map(r => r.id === recId ? { ...r, ...updated, status: 'REJECTED' } : r));
    } catch (err) {
      console.error('Failed to reject workforce recommendation:', err);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cooperative Federation Command Center
            </h1>
            <span className="bg-coop-100 text-coop-800 text-xs font-bold px-2.5 py-1 rounded-full">
              Apex Council
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Realtime cooperative governance, ethical AI workforce orchestration & member welfare monitoring.
          </p>
        </div>
      </div>

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Guild Workers</span>
            <Users className="w-4 h-4 text-coop-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{stats?.totalWorkers ?? 0}</span>
          <span className="text-[11px] text-emerald-600 font-bold">Verified cooperative members</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Co-op Health Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 block">{stats?.healthScore ?? 0} / 100</span>
          <span className="text-[11px] text-emerald-600 font-semibold">Computed from current operations</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Worker Opportunity Index</span>
            <HeartHandshake className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-coop-800 block">{stats?.opportunityIndex ?? 0} / 100</span>
          <span className="text-[11px] text-blue-600 font-semibold">Computed from worker opportunity</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Welfare & Health Pool</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-900 block">₹{stats?.workerWelfareFundAccrued ?? 0}</span>
          <span className="text-[11px] text-indigo-600 font-semibold">10% of recorded paid value</span>
        </div>
      </div>

      {/* AI Demand Forecasting Chart */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-coop-600" />
              <span>Forecast Agent: 7-Day Predicted Service Demand</span>
            </h3>
            <p className="text-xs text-slate-500">{forecast?.summary?.fastestGrowingCategory || 'Predictive demand by domain'}</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast?.forecastData || []}>
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '12px', border: 'none' }}
              />
              <Legend />
              <Bar dataKey="plumbing" fill="#2563EB" name="Plumbing" radius={[6, 6, 0, 0]} />
              <Bar dataKey="electrical" fill="#F59E0B" name="Electrical" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cleaning" fill="#10B981" name="Cleaning" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Workforce Rebalancing Recommendations (Chunk 17) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Workforce Agent: Capacity Rebalancing Proposals</span>
            </h3>
            <p className="text-xs text-slate-500">Autonomous optimization requiring cooperative council review</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workforceRecs.map((rec) => (
            <div key={rec.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-coop-800 bg-blue-100 px-2 py-0.5 rounded">
                  {rec.serviceCategory} • Shift {rec.workersToShift} Workers
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  rec.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                  rec.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {rec.status}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{rec.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.rationale}</p>
                <p className="text-xs font-semibold text-coop-700 mt-1">Impact: {rec.impact}</p>
              </div>

              {rec.status === 'PENDING_APPROVAL' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleApproveRebalance(rec.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Deployment
                  </button>
                  <button
                    onClick={() => handleRejectRebalance(rec.id)}
                    className="px-4 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold py-2 rounded-xl text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Worker Welfare & Burnout Monitoring (Chunk 18) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-600" />
              <span>Welfare Agent: Worker Fatigue & Opportunity Guardrails</span>
            </h3>
            <p className="text-xs text-slate-500">Autonomous protection against gig worker burnout and underutilization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {welfareAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                alert.severity === 'WARNING'
                  ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                  : 'bg-blue-50/60 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  {alert.name}
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white font-mono">
                  {alert.alertType}
                </span>
              </div>
              <p className="text-[11px] font-medium">{alert.metric}</p>
              <p className="text-[11px] bg-white/70 p-2 rounded-lg leading-relaxed">
                🛡️ <strong>Welfare Action:</strong> {alert.actionRecommended}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Action & Explainability Audit Log (Chunk 17) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-coop-600" />
              <span>AI Action & Explainability Audit Logs</span>
            </h3>
            <p className="text-xs text-slate-500">Immutable trace of all agent recommendations, tools executed, and reasoning</p>
          </div>
        </div>

        <div className="space-y-3">
          {aiLogs.map((log) => (
            <div key={log._id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-coop-100 text-coop-800 px-2 py-0.5 rounded">
                    {log.agent}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{log.task}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Confidence: {Math.round((log.confidence || 0.95) * 100)}% • {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-xs text-slate-600 italic">"{log.inputSummary}"</p>

              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                💡 <strong>Explainability:</strong> {log.explainabilityNote || 'Multi-objective fairness match successfully executed.'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
