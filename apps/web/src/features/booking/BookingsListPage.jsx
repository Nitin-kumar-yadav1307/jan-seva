import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Zap, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const BookingsListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings');
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Cooperative Bookings
        </h1>
        <p className="text-sm text-slate-500">
          Track active service requests, view past jobs, and access cooperative work warranties.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <Clock className="w-8 h-8 animate-spin mx-auto text-coop-600 mb-2" />
          <p>Loading your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Bookings Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Book trusted cooperative services using our fast AI Assistant or explore the catalogue.
          </p>
          <Link
            to="/services"
            className="inline-block bg-coop-600 hover:bg-coop-700 text-white text-xs font-bold px-4 py-2 rounded-xl mt-2"
          >
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((bk) => (
            <Link
              key={bk._id}
              to={`/customer/bookings/${bk._id || bk.bookingReference || ''}`}
              className="block p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-coop-100 text-coop-800 px-2 py-0.5 rounded">
                    {bk.bookingReference}
                  </span>
                  {bk.isEmergency && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Zap className="w-3 h-3 fill-rose-600" /> Rapid
                    </span>
                  )}
                </div>

                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  bk.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                  bk.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                  'bg-blue-100 text-coop-800'
                }`}>
                  {bk.status}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-coop-600 transition-colors">
                    {bk.service?.name || 'Home Service'}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{bk.location?.address || 'Address unavailable'}</span>
                  </p>
                </div>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{bk.finalPrice ?? bk.estimatedPrice ?? '—'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Worker: {bk.worker?.name || 'Assigned Artisan'}
                </span>
                <span className="text-coop-600 font-semibold flex items-center gap-0.5">
                  View Live Tracking <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
