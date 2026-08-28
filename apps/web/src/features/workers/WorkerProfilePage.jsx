import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  ShieldCheck,
  Star,
  MapPin,
  Award,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Briefcase,
  HeartHandshake,
  Phone,
  MessageSquare,
  Zap,
  AlertCircle
} from 'lucide-react';

const VerificationBadge = ({ status }) => {
  const styles = {
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };
  const icons = {
    VERIFIED: <ShieldCheck className="w-3.5 h-3.5" />,
    PENDING: <Clock className="w-3.5 h-3.5" />,
    REJECTED: <AlertCircle className="w-3.5 h-3.5" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.PENDING}`}>
      {icons[status] || icons.PENDING}
      {status === 'VERIFIED' ? 'Verified Cooperative Worker' : status}
    </span>
  );
};

const RatingBar = ({ label, value, max = 100 }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-semibold text-slate-600">
      <span>{label}</span>
      <span className="text-coop-700">{value}</span>
    </div>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-coop-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  </div>
);

export const WorkerProfilePage = ({ onSelectBookingConfig }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const res = await api.get(`/workers/${id}`);
        setWorker(res.data.worker);
      } catch (err) {
        console.error('Failed to fetch worker:', err);
      } finally {
        setLoading(false);
      }
    };
    api.get('/services').then(res => setServices(res.data.services || res.data || []))
      .catch(() => {});
    fetchWorker();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-20 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-32" />
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-slate-200 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-200 rounded w-40" />
              <div className="h-4 bg-slate-100 rounded w-24" />
              <div className="h-4 bg-slate-100 rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-700">Worker not found</h2>
        <Link to="/workers" className="text-coop-600 font-semibold hover:underline text-sm">← Back to all workers</Link>
      </div>
    );
  }

  const primarySkill = worker.skills?.[0];
  const bookingAction = () => {
    if (onSelectBookingConfig) {
      const category = primarySkill?.category;
      const matchedService = services?.find?.(item => item.category?.toLowerCase() === category?.toLowerCase());
      onSelectBookingConfig({
        worker,
        serviceId: matchedService?._id,
        service: matchedService,
        serviceName: matchedService?.name || `${category || 'Specialist'} Service`,
        isEmergency: false,
      });
    }
  };

  const tabs = ['about', 'certifications', 'reviews'];

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24">
      <Link to="/workers" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-coop-600">
        <ArrowLeft className="w-4 h-4" /> Back to Workers
      </Link>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover gradient */}
        <div className="h-24 bg-gradient-to-r from-coop-800 to-indigo-800" />

        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4 mb-4">
            <div className="relative">
              <img
                src={worker.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80'}
                alt={worker.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
              />
              {worker.availability !== false && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <h1 className="text-xl font-extrabold text-slate-900 truncate">{worker.name}</h1>
              <p className="text-xs text-coop-700 font-semibold">{worker.skills?.map(s => s.category).join(' · ')}</p>
            </div>
          </div>

          <VerificationBadge status={worker.verificationStatus} />

          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {worker.currentLocation?.address || 'Mumbai, Maharashtra'}
          </p>

          {/* Key Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
              <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-base font-black">{worker.rating}</span>
              </div>
              <p className="text-[10px] text-slate-500">{worker.totalRatingsCount || 0} reviews</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
              <p className="text-base font-black text-slate-900">{worker.completedJobs || 0}</p>
              <p className="text-[10px] text-slate-500">Jobs Done</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
              <p className="text-base font-black text-slate-900">{worker.experience}y</p>
              <p className="text-[10px] text-slate-500">Experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking CTA */}
      <div className="bg-gradient-to-r from-coop-600 to-indigo-700 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-blue-100 text-xs font-medium">Hourly Rate</p>
          <p className="text-white text-2xl font-black">₹{worker.hourlyRate}/hr</p>
          <p className="text-blue-200 text-[11px] mt-0.5">
            {worker.availability !== false ? '✅ Available Now' : '❌ Currently Unavailable'}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={bookingAction}
            className="bg-white text-coop-700 font-black text-sm px-5 py-2.5 rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
          >
            Book Now
          </button>
          <button
            onClick={() => alert('Emergency booking initiated!')}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
          >
            <Zap className="w-3 h-3 fill-white" /> Emergency
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-bold capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-coop-600 text-coop-700'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              {/* Skills */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Skills & Expertise</h3>
                <div className="space-y-3">
                  {worker.skills?.map((skill, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{skill.category}</p>
                        <p className="text-[11px] text-slate-500">{skill.experienceYears} years · Level: {skill.level}</p>
                      </div>
                      <span className="text-sm font-black text-coop-700">₹{skill.hourlyRate}/hr</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Match Score Breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Fairness Score Breakdown</h3>
                <div className="space-y-3">
                  <RatingBar label="Rating Score" value={Math.round(worker.rating * 20)} />
                  <RatingBar label="Welfare Score" value={worker.welfareScore || 80} />
                  <RatingBar label="Opportunity Score" value={worker.opportunityScore || 70} />
                  <RatingBar label="Current Workload (lower = more available)" value={100 - (worker.workloadScore || 25)} />
                </div>
              </div>

              {/* Availability */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-emerald-900">Availability</h3>
                </div>
                <p className="text-xs text-emerald-700">
                  {worker.availability !== false
                    ? `Available for bookings today. ${worker.activeJobsToday || 0} active jobs, ${worker.weeklyHoursLogged || 0}h this week.`
                    : 'Currently unavailable. Check back tomorrow.'}
                </p>
              </div>

              {/* Cooperative Affiliation */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <HeartHandshake className="w-4 h-4 text-coop-600" />
                  <h3 className="font-bold text-sm text-coop-900">Cooperative Member</h3>
                </div>
                <p className="text-xs text-coop-700">
                  {worker.cooperativeId?.name || 'Mumbai Central Artisan Co-op'} · 85% earnings go directly to this worker.
                </p>
              </div>
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <div className="space-y-3">
              {worker.certifications?.length > 0 ? (
                worker.certifications.map((cert, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-coop-100 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-coop-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{cert.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{cert.issuer} · {cert.year}</p>
                      {cert.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No certifications on file</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="text-center">
                  <p className="text-4xl font-black text-amber-600">{worker.rating}</p>
                  <div className="flex gap-0.5 mt-1 justify-center">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(worker.rating) ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-amber-700 mt-1">{worker.totalRatingsCount || 0} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5,4,3,2,1].map(star => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] text-amber-700 w-3">{star}</span>
                      <div className="flex-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 8 : 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample reviews */}
              {[
                { name: 'Priya S.', rating: 5, comment: 'Excellent work! Very professional and timely.', date: '2 days ago' },
                { name: 'Ravi M.', rating: 5, comment: 'Fixed the issue quickly. Highly recommended.', date: '1 week ago' },
                { name: 'Sunita K.', rating: 4, comment: 'Good quality work, came on time.', date: '2 weeks ago' },
              ].map((r, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-800">{r.name}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{r.comment}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{r.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
