import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import {
  User,
  MapPin,
  Clock,
  Star,
  Calendar,
  Zap,
  ChevronRight,
  Sparkles,
  Package,
  TrendingUp,
  HeartHandshake,
  Bell,
  Settings,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

// Demo customer persona
const DEMO_CUSTOMER = {
  name: 'Amit Kumar',
  email: 'amit@example.com',
  location: 'Connaught Place, New Delhi',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=80',
  memberSince: 'January 2025',
  totalBookings: 14,
  savedAddresses: ['Home - Connaught Place', 'Office - Gurgaon Sector 18']
};

const QUICK_ACTIONS = [
  { label: 'Book Service', icon: Package, href: '/services', color: 'bg-coop-600 text-white', desc: 'Browse 9+ categories' },
  { label: 'Emergency', icon: Zap, href: '/?emergency=true', color: 'bg-rose-500 text-white', desc: 'Get help in 25 mins' },
  { label: 'Track Booking', icon: MapPin, href: '/bookings', color: 'bg-amber-500 text-white', desc: 'Live tracking' },
  { label: 'Past Bookings', icon: Clock, href: '/bookings', color: 'bg-slate-700 text-white', desc: 'History & invoices' },
];

const AI_SUGGESTIONS = [
  { title: 'AC Service Due', desc: 'Last serviced 3 months ago. Book before summer peak.', service: 'Appliance Repair', icon: '❄️' },
  { title: 'Monsoon Waterproofing', desc: 'High demand expected in your area next week.', service: 'Painting', icon: '🌧️' },
  { title: 'Festive Cleaning', desc: 'Deep cleaning services popular this time of year.', service: 'Cleaning', icon: '✨' },
];

export const CustomerDashboardPage = ({ onSelectBookingConfig, onOpenAiDrawer }) => {
  const [bookings, setBookings] = useState([]);
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, coopRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/cooperatives/stats'),
        ]);
        setBookings(bookRes.data.bookings?.slice(0, 5) || []);
        setKpi(coopRes.data?.stats || null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeBookings = bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status));
  const recentCompleted = bookings.filter(b => b.status === 'COMPLETED').slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      {/* Customer Profile Header */}
      <div className="bg-gradient-to-r from-coop-900 to-indigo-900 rounded-3xl p-5 text-white flex items-center gap-4">
        <img
          src={DEMO_CUSTOMER.avatar}
          alt={DEMO_CUSTOMER.name}
          className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold">Welcome, {DEMO_CUSTOMER.name.split(' ')[0]}! 👋</h1>
          <p className="text-blue-200 text-xs mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {DEMO_CUSTOMER.location}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="bg-white/10 px-2 py-0.5 rounded-full">{DEMO_CUSTOMER.totalBookings} bookings</span>
            <span className="bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Customer
            </span>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <Settings className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Active Booking Alert */}
      {activeBookings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <h3 className="font-bold text-sm text-amber-900">Active Booking</h3>
            </div>
            <Link
              to={`/bookings/${activeBookings[0]?._id}`}
              className="text-xs text-amber-700 font-bold flex items-center gap-1"
            >
              Track <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            {activeBookings[0]?.service?.name || 'Home Service'} · Status: <strong>{activeBookings[0]?.status}</strong>
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={`${action.color} rounded-2xl p-4 shadow-sm hover:opacity-90 transition-opacity`}
            >
              <action.icon className="w-6 h-6 mb-2 opacity-90" />
              <p className="font-extrabold text-sm">{action.label}</p>
              <p className="text-[11px] opacity-80 mt-0.5">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Service Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-coop-500" /> AI Suggestions
          </h2>
          <button
            onClick={onOpenAiDrawer}
            className="text-xs text-coop-600 font-bold"
          >
            Ask AI →
          </button>
        </div>
        <div className="space-y-3">
          {AI_SUGGESTIONS.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="text-2xl">{s.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900">{s.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{s.desc}</p>
              </div>
              <button
                onClick={() => onSelectBookingConfig && onSelectBookingConfig({ serviceId: 'srv_plumb_01', serviceName: s.service })}
                className="shrink-0 text-[11px] font-bold text-white bg-coop-600 px-3 py-1.5 rounded-lg hover:bg-coop-700 transition-colors"
              >
                Book
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Bookings</h2>
          <Link to="/bookings" className="text-xs text-coop-600 font-bold">See all →</Link>
        </div>
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500">No bookings yet</p>
            <Link to="/services" className="inline-flex items-center gap-1.5 bg-coop-600 text-white text-xs font-bold px-4 py-2 rounded-xl">
              Book your first service <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((b) => (
              <Link
                key={b._id}
                to={`/bookings/${b._id}`}
                className="block bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{b.service?.name || 'Home Service'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Worker: {b.worker?.name || 'Suresh Kumar'} · ₹{b.estimatedPrice || 299}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Saved Addresses */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-coop-600" /> Saved Addresses
        </h2>
        <div className="space-y-2">
          {DEMO_CUSTOMER.savedAddresses.map((addr, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-700">{addr}</p>
              <button className="text-[10px] text-coop-600 font-bold">Use</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
