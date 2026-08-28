import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import {
  Briefcase,
  CheckCircle,
  Clock,
  MapPin,
  ShieldCheck,
  TrendingUp,
  HeartHandshake,
  Power,
  CheckCircle2,
  XCircle,
  Play,
  Award
} from 'lucide-react';

export const WorkerDashboardPage = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkerBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load worker bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      await fetchWorkerBookings();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const workerName = user?.name || 'Worker';
  const workerRole = user?.workerCategory || 'Service Professional';
  const completedJobs = bookings.filter((booking) => booking.status === 'COMPLETED').length;
  const totalEarnings = bookings
    .filter((booking) => booking.status === 'COMPLETED')
    .reduce((sum, booking) => sum + (Number(booking.finalPrice) || Number(booking.estimatedPrice) || 0), 0);
  const activeJobs = bookings.filter((booking) => !['COMPLETED', 'CANCELLED'].includes(booking.status)).length;
  const memberId = user?._id ? `Member ${user._id.slice(-6).toUpperCase()}` : 'Unassigned member';

  return (
    <div className="space-y-8 pb-16">
      <div className="bg-gradient-to-r from-coop-900 via-coop-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-black shadow-md">
            {workerName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{workerName}</h1>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs text-blue-200">
              {workerRole} • Cooperative Member
            </p>
            <span className="text-[10px] bg-blue-500/30 text-blue-100 px-2 py-0.5 rounded-full font-mono mt-1 inline-block">
              {memberId}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all ${
            isOnline
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{isOnline ? 'Active for Auto-Dispatch' : 'Offline / On Rest'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Earnings</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">₹{totalEarnings.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-emerald-600 font-bold">Based on completed work</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Active Jobs</span>
          <span className="text-xl font-extrabold text-blue-700 mt-1 block">{activeJobs}</span>
          <span className="text-[10px] text-blue-600 font-semibold">Live assignments</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Jobs Completed</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{completedJobs}</span>
          <span className="text-[10px] text-slate-400">Across all bookings</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Status</span>
          <span className="text-xl font-extrabold text-emerald-700 mt-1 block">{isOnline ? 'Available' : 'Rest'}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Current availability</span>
        </div>
      </div>

      {/* Active & Assigned Jobs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-coop-600" />
            <span>Assigned & Active Jobs</span>
          </h2>
          <span className="text-xs text-slate-400">{bookings.length} total requests</span>
        </div>

        <div className="space-y-3">
          {bookings.map((bk) => (
            <div
              key={bk._id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-coop-700 bg-blue-100 px-2 py-0.5 rounded">
                    {bk.bookingReference}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {bk.service?.name || 'Service assignment'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {bk.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {bk.location?.address || 'Address unavailable'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {bk.status === 'ASSIGNED' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(bk._id, 'ACCEPTED')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(bk._id, 'CANCELLED')}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-xl"
                    >
                      Decline
                    </button>
                  </>
                )}

                {bk.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus(bk._id, 'ON_THE_WAY')}
                    className="px-4 py-2 bg-coop-600 hover:bg-coop-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Start Travel (On The Way)
                  </button>
                )}

                {bk.status === 'ON_THE_WAY' && (
                  <button
                    onClick={() => handleUpdateStatus(bk._id, 'STARTED')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Begin Service Work
                  </button>
                )}

                {bk.status === 'STARTED' && (
                  <button
                    onClick={() => handleUpdateStatus(bk._id, 'COMPLETED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Complete & Settle Wage
                  </button>
                )}

                {bk.status === 'COMPLETED' && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                    ✓ Wage Credited (₹{bk.finalPrice ?? bk.estimatedPrice ?? 0})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
