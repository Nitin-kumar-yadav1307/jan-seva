import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
  Tv,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkle,
  Car,
  Users,
  BadgeCheck,
  Search,
  CreditCard,
  CalendarCheck,
} from 'lucide-react';

const fallbackCategories = [
  { name: 'Plumbing', desc: 'Leaks, taps & pipes', icon: Wrench, tone: 'text-blue-600' },
  { name: 'Electrical', desc: 'Wiring & safety checks', icon: Zap, tone: 'text-amber-600' },
  { name: 'Cleaning', desc: 'Homes & offices', icon: Sparkle, tone: 'text-teal-600' },
  { name: 'Carpentry', desc: 'Furniture & repairs', icon: Hammer, tone: 'text-orange-600' },
  { name: 'Appliance Repair', desc: 'ACs, fridges & more', icon: Tv, tone: 'text-violet-600' },
  { name: 'Painting', desc: 'Walls & interiors', icon: Paintbrush, tone: 'text-pink-600' },
  { name: 'Caregiving', desc: 'Elder & home care', icon: HeartHandshake, tone: 'text-rose-600' },
  { name: 'Gardening', desc: 'Lawns & plants', icon: Trees, tone: 'text-green-600' },
  { name: 'Driver', desc: 'Verified chauffeurs', icon: Car, tone: 'text-indigo-600' },
];

const fallbackServices = [
  {
    _id: 'svc-plumbing',
    name: 'Plumbing & Pipe Repair',
    category: 'Plumbing',
    description: 'Leak detection, tap fittings, and waterline repairs for homes and offices.',
    basePrice: 349,
    duration: '45–60 min',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
  },
  {
    _id: 'svc-electric',
    name: 'Electrical Safety Check',
    category: 'Electrical',
    description: 'Switchboard checks, lighting fixes, and safe power restoration in emergencies.',
    basePrice: 499,
    duration: '1–2 hrs',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80',
  },
  {
    _id: 'svc-cleaning',
    name: 'Deep Home Cleaning',
    category: 'Cleaning',
    description: 'Scheduled hygiene care, sanitization, and kitchen cleaning by trained workers.',
    basePrice: 599,
    duration: '2–3 hrs',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=900&q=80',
  },
  {
    _id: 'svc-care',
    name: 'Home Care Support',
    category: 'Caregiving',
    description: 'Compassionate support for daily routines, medicine reminders, and elder care.',
    basePrice: 699,
    duration: 'per visit',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=900&q=80',
  },
];

const stepsData = [
  { icon: Search, title: 'Choose Service', text: 'Pick from verified categories and compare transparent, fair pricing.' },
  { icon: CalendarCheck, title: 'Schedule Service', text: 'Select a convenient date and time that works for you.' },
  { icon: Users, title: 'Professional Arrives', text: 'A background-checked cooperative professional arrives on time.' },
  { icon: CreditCard, title: 'Complete & Pay', text: 'Pay securely with full transparency and rate your experience.' },
];

export const HomePage = ({ onOpenAiDrawer, onSelectBookingConfig }) => {
  const navigate = useNavigate();
  const [heroPrompt, setHeroPrompt] = useState('');
  const [services, setServices] = useState(fallbackServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        const data = res?.data?.services || fallbackServices;
        setServices(data.length ? data : fallbackServices);
      } catch (error) {
        console.warn('Services unavailable; showing landing-page defaults.', error);
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleHeroSubmit = (event) => {
    event.preventDefault();
    if (!localStorage.getItem('coopseva_user')) { navigate('/auth'); return; }
    if (onOpenAiDrawer) onOpenAiDrawer(heroPrompt || 'I need a trusted worker near me today.');
  };

  const stats = useMemo(() => [
    { label: 'Workers onboarded', value: '3.2K+' },
    { label: 'Avg. service time', value: '48 min' },
    { label: 'Customer satisfaction', value: '4.9/5' },
  ], []);

  const goServices = () => (localStorage.getItem('coopseva_user') ? navigate('/customer/services') : navigate('/auth'));
  const goCategory = (name) => (localStorage.getItem('coopseva_user') ? navigate(`/customer/services?category=${encodeURIComponent(name)}`) : navigate('/auth'));

  return (
    <div className="space-y-14 pb-16 animate-fade-in">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[28px] bg-brand text-white shadow-soft">
        <div className="pointer-events-none absolute -top-10 -right-10 h-52 w-52 rounded-full border-[20px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-white/10" />

        <div className="relative grid items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-200 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-100" />
              </span>
              Trusted local cooperative service network
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
              Trusted professionals,<br className="hidden sm:block" /> fair cooperative work.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/85">
              Book verified home and business services through a worker-owned cooperative network — with fixed pricing, on-time arrival, and 85% direct worker wages.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={goServices}
                className="inline-flex items-center justify-center gap-2 rounded-btn bg-white px-6 py-3 text-[15px] font-bold text-blue-700 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Book a Service
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="inline-flex items-center justify-center gap-2 rounded-btn border border-white/40 bg-white/10 px-6 py-3 text-[15px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Join as Technician
              </button>
            </div>

            <form onSubmit={handleHeroSubmit} className="flex max-w-lg items-center rounded-btn bg-white p-1.5 shadow-elevated">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-4 w-4 text-blue-600" />
                <input
                  value={heroPrompt}
                  onChange={(e) => setHeroPrompt(e.target.value)}
                  placeholder="e.g. emergency plumber near me"
                  className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none"
                  aria-label="Describe what you need"
                />
              </div>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-[10px] bg-brand px-4 py-2.5 text-sm font-bold text-white transition-all hover:brightness-105 active:scale-[0.98]">
                <Sparkles className="h-4 w-4" />
                Book with AI
              </button>
            </form>
          </div>

          {/* Hero visual: image collage */}
          <div className="relative hidden lg:block">
            <div className="relative h-[26rem] overflow-hidden rounded-[24px] border-4 border-white/20 shadow-[0_30px_80px_rgba(23,32,51,0.35)]">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80"
                alt="Cooperative technician at work"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -left-6 top-8 h-28 w-28 rounded-full bg-white/20 backdrop-blur" />
            <div className="absolute -bottom-6 -right-4 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-elevated">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Verified & trained</p>
                <p className="text-xs text-slate-500">Background-checked workers</p>
              </div>
            </div>
            <div className="absolute -top-3 right-8 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-elevated">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-ink">4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-white/15 bg-white/10 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-white/15 px-6 py-4">
            {stats.map(s => (
              <div key={s.label} className="px-4 text-center">
                <p className="text-xl font-extrabold sm:text-2xl">{s.value}</p>
                <p className="text-[11px] text-white/75 sm:text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust features ──────────────────────────── */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { icon: HeartHandshake, title: 'Worker-first model', text: 'Direct cooperative wages, welfare support, and transparent payouts.' },
          { icon: ShieldCheck, title: 'Verified professionals', text: 'Background-checked service workers with real certification tracking.' },
          { icon: Clock3, title: 'On-time, dependable', text: 'AI matches nearby professionals and keeps you updated at every step.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card hover:border-blue-200 transition-all duration-200">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </section>

      {/* ── Service categories ──────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="section-kicker">Browse by category</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-navy">What do you need done?</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              From everyday repairs to specialised care, choose from trusted cooperative professionals near you.
            </p>
          </div>
          <button
            type="button"
            onClick={goServices}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all services <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {fallbackCategories.map(({ name, desc, icon: Icon, tone }) => (
            <button
              key={name}
              type="button"
              onClick={() => goCategory(name)}
              className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-elevated"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                <Icon className="h-6 w-6" />
              </div>
              <div className={`text-sm font-bold text-ink`}>{name}</div>
              <div className="mt-0.5 text-[11px] text-slate-500">{desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Popular services ────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-kicker">Featured services</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-navy">Popular right now</h2>
            <p className="mt-2 text-sm text-slate-600">Trusted fixes for everyday life, starting at fair cooperative prices.</p>
          </div>
          <button type="button" onClick={goServices} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3">
                <div className="aspect-video rounded-xl bg-slate-200" />
                <div className="mt-4 h-4 w-2/3 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-full rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 8).map((service) => (
              <div
                key={service._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 shadow-subtle">
                    {service.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-[15px] font-bold text-ink">{service.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" /> {service.estimatedDuration || service.duration || 'varies by job'}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Starting from</p>
                      <p className="text-lg font-extrabold text-blue-700">₹{service.basePrice || 399}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!localStorage.getItem('coopseva_user')) { navigate('/auth'); return; }
                        if (onSelectBookingConfig) {
                          onSelectBookingConfig({
                            serviceId: service._id,
                            serviceName: service.name,
                            service,
                            isEmergency: false,
                          });
                        }
                      }}
                      className="rounded-btn bg-brand px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-soft hover:brightness-105 active:scale-[0.97]"
                    >
                      Book now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── How it works ────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-center">
          <p className="section-kicker">How it works</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-navy">From booking to done, in four easy steps</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            A simple, transparent journey designed to save you time and build lasting trust.
          </p>
        </div>

        <div className="relative">
          {/* curved dotted connector (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-10 hidden md:block" aria-hidden="true">
            <svg className="mx-auto h-6 w-full max-w-3xl" viewBox="0 0 600 30" fill="none" preserveAspectRatio="none">
              <path d="M 15 15 C 150 15, 200 15, 295 15 M 305 15 C 400 15, 450 15, 585 15"
                stroke="#BBD7F7" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" />
            </svg>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {stepsData.map(({ icon: Icon, title, text }, idx) => (
              <div key={title} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white shadow-elevated">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-blue-600">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-soft">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
                <p className="mt-1.5 max-w-[13rem] text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Join the cooperative ────────────────────── */}
      <section className="relative overflow-hidden rounded-[28px] bg-brand text-white shadow-soft">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full border-[18px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-14 left-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="relative flex flex-col items-center justify-between gap-6 px-6 py-10 text-center md:flex-row md:px-12 md:text-left">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-100">Join the cooperative</p>
            <h2 className="mt-2 text-3xl font-extrabold">Turn your skill into stable income.</h2>
            <p className="mt-3 text-sm text-white/85">
              Earn with fair pricing, direct wage payouts, healthcare support, and a growing network of trusted local customers.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="rounded-btn bg-white px-6 py-3 text-[15px] font-bold text-blue-700 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Join as worker
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="rounded-btn border border-white/40 bg-white/10 px-6 py-3 text-[15px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Sign up now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

