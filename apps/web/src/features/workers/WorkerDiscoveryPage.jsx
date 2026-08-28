import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { OpenStreetMap } from '../../components/map/OpenStreetMap';
import { useGeolocation } from '../../context/GeolocationContext';
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
  ArrowRight,
  Map,
  Grid,
  Navigation
} from 'lucide-react';

export const WorkerDiscoveryPage = ({ onSelectBookingConfig }) => {
  const [workers, setWorkers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'grid' | 'map'
  const [selectedWorkerForMap, setSelectedWorkerForMap] = useState(null);
  const [services, setServices] = useState([]);

  const { location: geoLocation, isPending: geoPending } = useGeolocation();

  // Customer coordinates in [lon, lat] (GeoJSON convention), from browser geolocation.
  const customerCoords = geoLocation?.coords || [72.8777, 19.0760];
  // Leaflet order [lat, lon]
  const mapCustomerLocation = [customerCoords[1], customerCoords[0]];

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const [workerRes, serviceRes] = await Promise.all([
          api.get('/workers', {
            params: { lat: customerCoords[1], lng: customerCoords[0] },
          }),
          api.get('/services'),
        ]);
        setWorkers(workerRes.data.workers || []);
        setServices(serviceRes.data.services || []);
      } catch (err) {
        console.error('Failed to fetch workers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoLocation?.coords?.[0], geoLocation?.coords?.[1]]);

  const categories = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Caregiving', 'Appliance Repair', 'Driver', 'Painting', 'Gardening'];
  const zones = ['All', 'Zone A - South Mumbai', 'Zone B - Western Suburbs', 'Zone C - Central Suburbs', 'Zone D - Navi Mumbai'];

  const filteredWorkers = workers.filter(w => {
    const matchesCategory = selectedCategory === 'All' || w.skills?.some(s => s.category?.toLowerCase() === selectedCategory.toLowerCase());
    const matchesZone = selectedZone === 'All' || w.currentLocation?.zone === selectedZone;
    const matchesSearch = w.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          w.currentLocation?.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesZone && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-coop-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-coop-600" />
            <span>Government NSDC & Cooperative Guild Certified</span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-xs text-xs font-bold">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'split' ? 'bg-coop-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map + List</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-coop-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid Only</span>
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Verified Cooperative Artisans & Specialists
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Browse autonomous cooperative members on live OpenStreetMap. Multi-factor fairness ensures equitable dispatch and healthy workloads.
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

      {/* Interactive OpenStreetMap Section */}
      {viewMode === 'split' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-coop-600" />
              Live OpenStreetMap Worker Density ({filteredWorkers.length} Workers Plotted)
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-coop-700">
              <Navigation className="w-3.5 h-3.5" />
              {geoPending ? 'Locating you…' : `Centered near ${geoLocation?.label || 'you'}`}
            </span>
          </div>

          <OpenStreetMap
            workers={filteredWorkers}
            customerLocation={mapCustomerLocation}
            customerLocationLabel={geoLocation?.label}
            selectedWorker={selectedWorkerForMap}
            onSelectWorker={(w) => {
              setSelectedWorkerForMap(w);
              const category = w.skills?.[0]?.category;
              const service = services.find(item => item.category?.toLowerCase() === category?.toLowerCase());
              onSelectBookingConfig({
                worker: w,
                serviceId: service?._id,
                serviceName: service?.name,
                service,
                isEmergency: false
              });
            }}
            height="360px"
          />
        </div>
      )}

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((wrk) => (
          <div
            key={wrk._id}
            className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 ${
              selectedWorkerForMap?._id === wrk._id
                ? 'border-coop-500 ring-2 ring-blue-100 shadow-md'
                : 'border-slate-200 shadow-xs hover:shadow-md'
            }`}
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
                  <span className="truncate">{wrk.currentLocation?.address || 'Mumbai'}</span>
                  {wrk.distanceKm != null && (
                    <span className="ml-auto shrink-0 inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 font-bold px-2 py-0.5 text-[10px]">
                      <Navigation className="w-2.5 h-2.5" />
                      {wrk.distanceKm < 1 ? '<1 km' : `${wrk.distanceKm} km`} · {wrk.etaText || `~${wrk.etaMinutes} min`}
                    </span>
                  )}
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
                      serviceId: services.find(item => item.category?.toLowerCase() === wrk.skills?.[0]?.category?.toLowerCase())?._id,
                      service: services.find(item => item.category?.toLowerCase() === wrk.skills?.[0]?.category?.toLowerCase()),
                      serviceName: services.find(item => item.category?.toLowerCase() === wrk.skills?.[0]?.category?.toLowerCase())?.name,
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
