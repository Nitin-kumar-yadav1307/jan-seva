import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { 
  Sparkles, 
  Wrench, 
  Zap, 
  Hammer, 
  Paintbrush, 
  Sparkle, 
  Trees, 
  Tv, 
  HeartHandshake, 
  Car,
  Star,
  Clock,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Plumbing': Wrench,
  'Electrical': Zap,
  'Carpentry': Hammer,
  'Painting': Paintbrush,
  'Cleaning': Sparkle,
  'Gardening': Trees,
  'Appliance Repair': Tv,
  'Caregiving': HeartHandshake,
  'Driver': Car
};

export const HomePage = ({ onOpenAiDrawer, onSelectBookingConfig }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [heroPrompt, setHeroPrompt] = useState('');
  const [services, setServices] = useState([]);
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

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    onOpenAiDrawer(heroPrompt);
  };

  const categories = [
    { name: 'Plumbing', count: '14 Specialists', icon: Wrench, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { name: 'Electrical', count: '11 Electricians', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { name: 'Cleaning', count: '18 Housekeepers', icon: Sparkle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { name: 'Carpentry', count: '8 Carpenters', icon: Hammer, color: 'text-orange-600 bg-orange-50 border-orange-100' },
    { name: 'Appliance Repair', count: '9 Technicians', icon: Tv, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { name: 'Painting', count: '6 Painters', icon: Paintbrush, color: 'text-pink-600 bg-pink-50 border-pink-100' },
    { name: 'Caregiving', count: '12 Caregivers', icon: HeartHandshake, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { name: 'Gardening', count: '5 Gardeners', icon: Trees, color: 'text-green-600 bg-green-50 border-green-100' },
    { name: 'Driver', count: '15 Chauffeurs', icon: Car, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section with AI Search Bar */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-coop-900 via-coop-800 to-slate-900 text-white px-6 py-12 sm:px-12 sm:py-16 shadow-xl">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-5">
          {/* Emergency Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t('hero.emergencyBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t('hero.title')}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* AI Prompt Input */}
          <form onSubmit={handleHeroSubmit} className="pt-2">
            <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-slate-100 text-slate-900">
              <div className="flex items-center gap-2.5 flex-1 px-3 w-full">
                <Sparkles className="w-5 h-5 text-coop-600 shrink-0" />
                <input
                  type="text"
                  value={heroPrompt}
                  onChange={(e) => setHeroPrompt(e.target.value)}
                  placeholder={t('hero.aiPromptPlaceholder')}
                  className="w-full text-xs sm:text-sm py-2 bg-transparent focus:outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-coop-600 hover:bg-coop-700 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span>{t('hero.askAiBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Trust & Cooperative Value Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-coop-600 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{t('trust.welfareTitle')}</h4>
            <p className="text-[11px] text-slate-500 leading-snug">{t('trust.welfareDesc')}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{t('trust.verifiedWorkers')}</h4>
            <p className="text-[11px] text-slate-500 leading-snug">Government NSDC certified master craftsmen with background check.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{t('trust.fairPrice')}</h4>
            <p className="text-[11px] text-slate-500 leading-snug">Standardized cooperative tariffs with zero surge exploitation.</p>
          </div>
        </div>
      </section>

      {/* Category Grid (36) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{t('categories.title')}</h2>
            <p className="text-xs text-slate-500">Verified cooperative artisan guilds across Delhi-NCR</p>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="text-xs font-semibold text-coop-600 hover:text-coop-800 flex items-center gap-1"
          >
            <span>{t('categories.viewAll')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(`/services?category=${encodeURIComponent(cat.name)}`)}
                className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-coop-400 hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 border ${cat.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight truncate w-full">{cat.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{cat.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Horizontal Service Rails (37 & 38) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{t('popularServices.title')}</h2>
            <p className="text-xs text-slate-500">{t('popularServices.subtitle')}</p>
          </div>
        </div>

        {/* Scrollable Rail */}
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="min-w-[260px] sm:min-w-[280px] bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-36 overflow-hidden bg-slate-100">
                <img
                  src={srv.image}
                  alt={srv.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 right-2.5 bg-coop-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {srv.category}
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{srv.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Co-op Rate</span>
                    <span className="text-base font-extrabold text-coop-900">₹{srv.basePrice}</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectBookingConfig({
                        serviceId: srv._id,
                        serviceName: srv.name,
                        worker: { name: 'Top Ranked Cooperative Worker', hourlyRate: srv.basePrice },
                        isEmergency: false
                      });
                    }}
                    className="bg-coop-600 hover:bg-coop-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-blue-700 via-coop-700 to-indigo-800 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-200 bg-blue-900/40 px-2.5 py-1 rounded-md">
            Worker Cooperative Solidarity
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Are you a skilled technician or artisan?
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg">
            Join the Delhi-NCR Cooperative Federation. Earn 85% direct payouts, free health insurance, and equal voting shares.
          </p>
        </div>

        <button
          onClick={() => navigate('/worker-dashboard')}
          className="bg-white hover:bg-blue-50 text-coop-900 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md whitespace-nowrap transition-colors"
        >
          Join Cooperative Guild
        </button>
      </section>
    </div>
  );
};
