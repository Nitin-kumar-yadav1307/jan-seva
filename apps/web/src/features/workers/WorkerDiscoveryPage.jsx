import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { 
  Users, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Award, 
  Clock, 
  HeartHandshake, 
  CheckCircle, 
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';

export const WorkerDiscoveryPage = ({ onSelectBookingConfig }) => {
  const [workers, setWorkers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await api.get('/workers');
        setWorkers(res.data.workers || []);
      } catch (err) {
        console.error('Failed to fetch workers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const categories = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Caregiving', 'Appliance Repair', 'Driver', 'Painting', 'Gardening'];
  const zones = ['All', 'Zone A - Central Delhi', 'Zone B - West Delhi', 'Zone C - South Delhi', 'Zone D - East Delhi'];

  const filteredWorkers = workers.filter(w => {
    const matchesCategory = selectedCategory === 'All' || w.skills?.some(s => s.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesZone = selectedZone === 'All' || w.currentLocation?.zone === selectedZone;
    const matchesSearch = w.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          w.currentLocation?.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesZone && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-coop-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-coop-600" />
          <span>Government NSDC & Cooperative Guild Certified</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Verified Cooperative Artisans & Specialists
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Browse autonomous cooperative members. Equal opportunity dispatch ensures fair workload distribution and dedicated service quality.
        </p>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker name or locality..."
              className="w-full pl-10 pr-3 py-2 bg-white text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-coop-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-coop-500 focus:outline-none font-medium"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Skill Categories' : c}</option>)}
          </select>

          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full px-3 py-2 bg-white text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-coop-500 focus:outline-none font-medium"
          >
            {zones.map(z => <option key={z} value={z}>{z === 'All' ? 'All Geographic Zones' : z}</option>)}
          </select>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((wrk) => (
          <div
            key={wrk._id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
          >
            {/* Top Info */}
            <div className="flex items-start gap-3.5">
              <img
                src={wrk.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
                alt={wrk.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900 truncate">{wrk.name}</h3>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {wrk.rating}
                  </span>
                </div>

                <p className="text-xs text-coop-700 font-semibold mt-0.5 truncate">
                  {wrk.skills?.map(s => s.category).join(' • ')}
                </p>

                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{wrk.currentLocation?.address || 'New Delhi'}</span>
                </p>
              </div>
            </div>

            {/* Certifications & Badges */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-[11px]">
                  <Award className="w-3.5 h-3.5 text-coop-600" />
                  <span>{wrk.certifications?.[0]?.name || 'Government NSDC Certified Artisan'}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {wrk.experience} years practical experience • {wrk.completedJobs} verified jobs completed
                </p>
              </div>

              {/* Workload Meter (Fairness Balancing Indicator) */}
              <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Fair Workload Meter:</span>
                  <span className={wrk.workloadScore > 70 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {wrk.workloadScore > 70 ? 'High Activity' : 'Available & Fresh'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${wrk.workloadScore > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${wrk.workloadScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Booking Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Hourly Rate</span>
                <span className="text-base font-black text-slate-900">₹{wrk.hourlyRate}/hr</span>
              </div>

              <button
                onClick={() => {
                  onSelectBookingConfig({
                    worker: wrk,
                    serviceId: 'srv_plumb_01',
                    serviceName: `${wrk.skills?.[0]?.category || 'Specialist'} Service`,
                    isEmergency: false
                  });
                }}
                className="bg-coop-600 hover:bg-coop-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Book Directly</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
