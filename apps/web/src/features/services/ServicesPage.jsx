import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { Search, CheckCircle2, Clock } from 'lucide-react';

const categories = [
  'All', 'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting',
  'Gardening', 'Appliance Repair', 'Caregiving', 'Driver',
];

export const ServicesPage = ({ onSelectBookingConfig }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);

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
    const category = String(s.category || '');
    const name = String(s.name || '');
    const description = String(s.description || '');
    const matchesCategory = selectedCategory === 'All' || category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="space-y-4 rounded-[24px] bg-brand-soft px-6 py-8 sm:px-8">
        <span className="section-kicker">Browse the catalogue</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-[2.6rem] sm:leading-tight">
          Browse Services
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-slate-600">
          Find trusted cooperative professionals for your household and community needs — with fixed, transparent pricing.
        </p>

        <div className="relative max-w-lg pt-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keyword (e.g. pipe, wiring, cleaning)…"
            aria-label="Search services"
            className="h-12 w-full rounded-btn border border-slate-200 bg-white pl-10 pr-4 text-[15px] text-ink shadow-subtle placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const active = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchParams(cat === 'All' ? {} : { category: cat });
              }}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                active
                  ? 'bg-brand text-white shadow-soft'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Services grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="aspect-[16/10] bg-slate-200" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-4/5 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-lg font-bold text-ink">No services found</p>
          <p className="mt-1 text-sm text-slate-500">Try a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((srv) => (
            <div
              key={srv._id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img src={srv.image} alt={srv.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 shadow-subtle">
                  {srv.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[16px] font-bold text-ink">{srv.name}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{srv.description}</p>

                {srv.duration && (
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="h-3.5 w-3.5" /> {srv.duration}
                  </p>
                )}

                {srv.features?.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                    {srv.features.slice(0, 3).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5 text-[12px] text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-500" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Standard Co-op Fee</p>
                    <p className="text-lg font-extrabold text-blue-700">₹{srv.basePrice}</p>
                  </div>
                  <button
                    onClick={() => onSelectBookingConfig && onSelectBookingConfig({ serviceId: srv._id, serviceName: srv.name, service: srv, isEmergency: false })}
                    className="rounded-btn bg-brand px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-soft hover:brightness-105 active:scale-[0.97]"
                  >
                    Book Service
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

