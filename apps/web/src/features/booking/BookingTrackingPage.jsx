import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../lib/api';
import { OpenStreetMap } from '../../components/map/OpenStreetMap';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Star, 
  ArrowLeft, 
  AlertCircle,
  Truck,
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';

const STAGES = [
  { key: 'REQUESTED', label: 'Requested' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'ON_THE_WAY', label: 'On The Way' },
  { key: 'STARTED', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' }
];

export const BookingTrackingPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const socketRef = useRef(null);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.booking);
    } catch (err) {
      console.error('Failed to load booking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();

    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;
    socket.emit('join_booking_room', id);

    socket.on('booking_status_updated', async ({ bookingId, status, payload }) => {
      if (bookingId !== id) return;

      if (payload) {
        setBooking(prev => prev ? { ...prev, ...payload, status: status || prev.status } : payload);
      }

      await fetchBooking();
    });

    const interval = setInterval(fetchBooking, 4000);
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [id]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ratings', {
        bookingId: booking._id,
        score: ratingScore,
        comment: ratingComment
      });
      setRatingSubmitted(true);
      await fetchBooking();
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <Clock className="w-8 h-8 animate-spin mx-auto text-coop-600 mb-2" />
        <p>Loading live booking tracking...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Booking Not Found</h2>
        <Link to="/bookings" className="text-coop-600 hover:underline text-sm font-semibold">
          Return to My Bookings
        </Link>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex(s => s.key === booking.status);
  const custCoords = [
    booking.location?.coordinates?.[1] ?? null,
    booking.location?.coordinates?.[0] ?? null
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Top Back Navigation */}
      <Link to="/customer/bookings" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-coop-600">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Bookings</span>
      </Link>

      {/* Main Status Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-coop-900 to-indigo-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-blue-500/30 px-2 py-0.5 rounded text-blue-200 font-bold">
                {booking.bookingReference || booking._id}
              </span>
              {booking.isEmergency && (
                <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-white" /> EMERGENCY
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold">{booking.service?.name || 'Home Service'}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-blue-200 block">Total Paid</span>
                <span className="text-2xl font-black">₹{booking.finalPrice ?? booking.estimatedPrice ?? 0}</span>
          </div>
        </div>

        {/* Live Timeline Tracker */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Realtime Service Lifecycle
            </h3>

            <div className="relative flex items-center justify-between">
              {/* Connecting progress line */}
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-200 -translate-y-1/2 z-0" />
              <div
                className="absolute left-0 top-1/2 h-1 bg-coop-600 -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100)}%` }}
              />

              {STAGES.map((st, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={st.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-coop-600 text-white ring-4 ring-blue-100 scale-110 shadow-md'
                          : isPassed
                          ? 'bg-coop-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-bold whitespace-nowrap ${isCurrent ? 'text-coop-600' : 'text-slate-500'}`}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live OpenStreetMap Live Tracker */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-coop-600" />
              Live Route & Artisan Approaching Map (OpenStreetMap)
            </span>
            <OpenStreetMap
              workers={booking.worker ? [booking.worker] : []}
              customerLocation={custCoords}
              selectedWorker={booking.worker}
              showRoute={true}
              height="260px"
              zoom={14}
            />
          </div>

          {/* Assigned Worker Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={booking.worker?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
                alt={booking.worker?.name || 'Worker'}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  {booking.worker?.name || 'Worker assignment pending'}
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </h4>
                <p className="text-xs text-slate-500">
                  {booking.cooperative?.name || 'Mumbai Central Artisan Co-op'}
                </p>
                <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{booking.worker?.rating ?? 'Not rated'}</span>
                </div>
              </div>
            </div>

            {booking.worker?.phone && (
              <a
                href={`tel:${booking.worker.phone}`}
                className="p-3 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-coop-600 shadow-xs transition-colors"
                aria-label="Call worker"
              >
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>

          {/* Post-Completion Rating Form */}
          {booking.status === 'COMPLETED' && (
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-200 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-coop-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  {ratingSubmitted ? 'Thank you! Rating Submitted' : 'Service Completed! Rate Your Cooperative Worker'}
                </h3>
              </div>

              {!ratingSubmitted ? (
                <form onSubmit={handleRatingSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingScore(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Share feedback (e.g. prompt, skilled, polite)..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-coop-500 focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="w-full bg-coop-600 hover:bg-coop-700 text-white font-bold py-2 rounded-xl text-xs shadow-sm transition-all"
                  >
                    Submit Cooperative Review
                  </button>
                </form>
              ) : (
                <p className="text-xs text-emerald-700 font-medium">
                  ⭐ Your rating was recorded for this completed booking.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
