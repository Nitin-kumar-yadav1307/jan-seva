import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { 
  Wrench, 
  Zap, 
  Hammer, 
  Paintbrush, 
  Sparkle, 
  Trees, 
  Tv, 
  HeartHandshake, 
  Car,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const ServicesPage = ({ onSelectBookingConfig }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Carpentry',
    'Painting',
    'Gardening',
    'Appliance Repair',
    'Caregiving',
    'Driver'
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data.services || []);
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cooperative Service Catalogue
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Fixed, transparent pricing with 85% guaranteed direct wage distribution to certified local workers.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md pt-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service by keyword (e.g. pipe, wiring, ac)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-coop-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setSearchParams(cat === 'All' ? {} : { category: cat });
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-coop-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((srv) => (
          <div
            key={srv._id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-44 bg-slate-100 overflow-hidden">
              <img src={srv.image} alt={srv.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-coop-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                {srv.category}
              </div>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-extrabold text-base text-slate-900">{srv.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>

                {/* Features List */}
                <div className="pt-2 space-y-1">
                  {srv.features?.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Standard Co-op Fee</span>
                  <span className="text-lg font-black text-coop-900">₹{srv.basePrice}</span>
                </div>

                <button
                  onClick={() => {
                    onSelectBookingConfig({
                      serviceId: srv._id,
                      serviceName: srv.name,
                      worker: { name: 'Top Matched Cooperative Guild Worker', hourlyRate: srv.basePrice },
                      isEmergency: false
                    });
                  }}
                  className="bg-coop-600 hover:bg-coop-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  Book Service
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
