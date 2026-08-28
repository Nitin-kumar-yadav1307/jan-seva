import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../context/GeolocationContext';
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

const QUICK_ACTIONS = [
  { label: 'Book Service', icon: Package, href: '/customer/services', color: 'bg-coop-600 text-white', desc: 'Browse service categories' },
  { label: 'Emergency', icon: Zap, href: '/customer/services', color: 'bg-rose-500 text-white', desc: 'Book urgent support' },
  { label: 'Track Booking', icon: MapPin, href: '/customer/bookings', color: 'bg-amber-500 text-white', desc: 'Live tracking' },
  { label: 'Past Bookings', icon: Clock, href: '/customer/bookings', color: 'bg-slate-700 text-white', desc: 'History & invoices' },
];

const AI_SUGGESTIONS = [
  { title: 'AC Service Due', desc: 'Last serviced 3 months ago. Book before summer peak.', service: 'Appliance Repair', icon: '❄️' },
  { title: 'Monsoon Waterproofing', desc: 'High demand expected in your area next week.', service: 'Painting', icon: '🌧️' },
  { title: 'Festive Cleaning', desc: 'Deep cleaning services popular this time of year.', service: 'Cleaning', icon: '✨' },
];

export const CustomerDashboardPage = ({ onSelectBookingConfig, onOpenAiDrawer }) => {
  const { user } = useAuth();
  const { location: geoLocation } = useGeolocation();
  const [bookings, setBookings] = useState([]);
  const [kpi, setKpi] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, coopRes, serviceRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/cooperatives/stats'),
          api.get('/services'),
        ]);
        setBookings(bookRes.data.bookings?.slice(0, 5) || []);
        setKpi(coopRes.data?.stats || null);
        setServices(serviceRes.data.services || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const customerName = user?.name || 'Customer';
  const customerLocation = geoLocation?.label || user?.location?.address || 'Your preferred area';
  const customerInitials = customerName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const activeBookings = bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status));
  const suggestions = services.slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      <div className="bg-gradient-to-r from-coop-900 to-indigo-900 rounded-3xl p-5 text-white flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-black shadow-lg">
          {customerInitials || 'C'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold">Welcome, {customerName.split(' ')[0]}! 👋</h1>
          <p className="text-blue-200 text-xs mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {customerLocation}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="bg-white/10 px-2 py-0.5 rounded-full">{bookings.length} bookings</span>
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
              to={activeBookings[0] ? `/customer/bookings/${activeBookings[0]._id || activeBookings[0].bookingReference}` : '/customer/bookings'}
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
          {suggestions.map((service) => (
            <div key={service._id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="text-2xl"><Package className="w-6 h-6 text-coop-600" /></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900">{service.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{service.description}</p>
              </div>
              <button
                onClick={() => onSelectBookingConfig && onSelectBookingConfig({ serviceId: service._id, serviceName: service.name, service })}
                className="shrink-0 text-[11px] font-bold text-white bg-coop-600 px-3 py-1.5 rounded-lg hover:bg-coop-700 transition-colors"
              >
                Book
              </button>
            </div>
          ))}
          {services.length === 0 && <p className="text-sm text-slate-500">No service suggestions are available yet.</p>}
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Bookings</h2>
          <Link to="/customer/bookings" className="text-xs text-coop-600 font-bold">See all →</Link>
        </div>
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500">No bookings yet</p>
            <Link to="/customer/services" className="inline-flex items-center gap-1.5 bg-coop-600 text-white text-xs font-bold px-4 py-2 rounded-xl">
              Book your first service <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((b) => (
              <Link
                key={b._id}
                to={`/customer/bookings/${b._id || b.bookingReference || ''}`}
                className="block bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{b.service?.name || 'Home Service'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Worker: {b.worker?.name || 'Assigned worker'} · {b.finalPrice != null || b.estimatedPrice != null ? `₹${b.finalPrice ?? b.estimatedPrice}` : 'Price pending'}
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

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-coop-600" /> Preferred Area
        </h2>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs font-semibold text-slate-700">{customerLocation}</p>
        </div>
      </div>
    </div>
  );
};
