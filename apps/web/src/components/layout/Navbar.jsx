import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../context/GeolocationContext';
import { JanSevaLogo } from '../brand/JanSevaLogo';
import {
  Sparkles,
  MapPin,
  Globe,
  ShieldCheck,
  Briefcase,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  HeartHandshake,
  UserPlus,
  Search,
  Menu,
  X,
} from 'lucide-react';

const isDefaultNav = (path, loc) =>
  (path === '/' && loc.pathname === '/') ||
  (path !== '/' && loc.pathname.startsWith(path));

const UserMenu = ({ user, logout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const role = String(user.role || '').toUpperCase();
  const roleColor = role === 'WORKER' ? 'bg-teal-500' : role === 'ADMIN' || role === 'FEDERATION_ADMIN' ? 'bg-navy' : 'bg-blue-500';
  const roleLabel = role === 'WORKER' ? 'Worker' : role === 'ADMIN' || role === 'FEDERATION_ADMIN' ? 'Admin' : 'Customer';
  const dashHref = role === 'WORKER' ? '/worker/dashboard' : role === 'ADMIN' || role === 'FEDERATION_ADMIN' ? '/admin' : '/customer/dashboard';
  const DashIcon = role === 'WORKER' ? Briefcase : role === 'ADMIN' || role === 'FEDERATION_ADMIN' ? LayoutDashboard : User;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-btn border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className={`w-7 h-7 rounded-lg ${roleColor} flex items-center justify-center text-white text-xs font-bold`}>
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-ink leading-none">{user.name?.split(' ')[0]}</p>
          <p className="text-[10px] text-slate-400">{roleLabel}</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-12 w-52 bg-white rounded-2xl border border-slate-200 shadow-elevated z-50 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="font-semibold text-sm text-ink">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
          <div className="p-1.5">
            <Link to={dashHref} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
              <DashIcon className="w-4 h-4 text-slate-500" /> My Dashboard
            </Link>
            {role === 'WORKER' && (
              <Link to="/worker/welfare" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                <HeartHandshake className="w-4 h-4 text-teal-500" /> Welfare
              </Link>
            )}
            <div className="border-t border-slate-100 mt-1 pt-1">
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-status-error hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LanguageSwitcher = ({ i18n, changeLanguage }) => (
  <div className="hidden sm:flex items-center bg-slate-100 rounded-btn p-1 border border-slate-200 text-xs font-medium">
    <Globe className="w-3.5 h-3.5 text-slate-500 mr-1 ml-1" />
    {['en', 'hi', 'mr'].map(lang => (
      <button
        key={lang}
        onClick={() => changeLanguage(lang)}
        className={`px-1.5 py-0.5 rounded-md transition-all ${i18n.language === lang ? 'bg-white shadow-subtle text-blue-600 font-bold' : 'text-slate-600'}`}
      >
        {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिन्दी' : 'मराठी'}
      </button>
    ))}
  </div>
);

export const Navbar = ({ onOpenAiDrawer }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = location.pathname === '/auth';
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const changeLanguage = (lang) => i18n.changeLanguage(lang);
  const userRole = String(user?.role || '').toUpperCase();

  const { location: geoLocation, status: geoStatus, requestLocation, isPending: geoPending } = useGeolocation();
  const detectedLabel = geoLocation?.label && geoLocation.label !== 'My location'
    ? geoLocation.label
    : (user?.location?.address || user?.location?.city || 'Choose your service area');
  const locationLabel = detectedLabel;

  if (isAuthPage) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    setQuery('');
    setMobileOpen(false);
    if (!user) { navigate('/auth'); return; }
    navigate(q ? `/customer/services?q=${encodeURIComponent(q)}` : '/customer/services');
  };

  const guestLinks = [
    { to: '/', label: t('nav.home'), exact: true },
    { to: '/customer/services', label: t('nav.services') },
    { to: '/customer/workers', label: 'Workers' },
  ];
  const customerLinks = [
    { to: '/', label: t('nav.home'), exact: true },
    { to: '/customer/services', label: t('nav.services') },
    { to: '/customer/workers', label: t('nav.workers') },
    { to: '/customer/bookings', label: t('nav.myBookings') },
  ];
  const activeLinks = userRole === 'CUSTOMER' ? customerLinks : guestLinks;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="bg-navy text-white text-xs px-4 py-1.5 hidden sm:block">
        <div className="flex items-center gap-2 mx-auto w-full max-w-7xl">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
          <span className="font-medium text-blue-50">Jan Seva Cooperative Federation</span>
          <span className="bg-white/10 px-2 py-0.5 rounded-full text-teal-200">85% Direct Worker Wage</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center group shrink-0" aria-label="Jan Seva home">
          <JanSevaLogo variant="emblem" emblemClassName="h-10 w-10 group-hover:scale-105 transition-transform" />
          <span className="hidden md:flex flex-col leading-none ml-2.5">
            <span className="text-lg font-extrabold tracking-tight text-navy">jan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F80ED] to-[#12B8B0]">seva</span></span>
            <span className="text-[9px] text-slate-500 font-semibold tracking-wide mt-0.5">{t('tagline')}</span>
          </span>
        </Link>

        {/* Live location control */}
        <button
          type="button"
          onClick={requestLocation}
          disabled={geoPending}
          title={geoPending ? 'Detecting your location…' : 'Tap to update your location'}
          className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors max-w-[200px] shrink-0"
        >
          {geoPending ? (
            <svg className="h-3.5 w-3.5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
          )}
          <span className="truncate">{geoPending ? 'Detecting…' : locationLabel}</span>
        </button>

        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, repairs, workers…"
              aria-label="Search services"
              className="w-full h-10 pl-10 pr-4 rounded-btn border border-slate-200 bg-slate-50 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>
        </form>

        <nav className="hidden md:flex items-center gap-1">
          {activeLinks.map(link => (
            <Link
              key={link.to + link.label}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDefaultNav(link.to, location)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-navy hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher i18n={i18n} changeLanguage={changeLanguage} />

          <button
            type="button"
            onClick={onOpenAiDrawer}
            className="hidden md:inline-flex items-center gap-2 bg-brand text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-btn shadow-soft transition-all hover:shadow-elevated hover:brightness-105 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Fast Book</span>
            <span className="sm:hidden">AI</span>
          </button>

          {user ? (
            <UserMenu user={user} logout={logout} />
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/auth" className="flex items-center gap-1.5 px-3.5 py-2 rounded-btn text-sm font-semibold text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors">
                <LogIn className="w-4 h-4" />
                <span>Customer Login</span>
              </Link>
              <Link to="/auth" className="flex items-center gap-1.5 px-3.5 py-2 rounded-btn text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-colors">
                <UserPlus className="w-4 h-4" />
                <span>Join as Technician</span>
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-3">
            {/* Mobile location control */}
            <button
              type="button"
              onClick={requestLocation}
              disabled={geoPending}
              className="flex w-full items-center gap-2 rounded-btn border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:border-blue-300 transition-colors"
            >
              {geoPending ? (
                <svg className="h-4 w-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <MapPin className="h-4 w-4 text-blue-500" />
              )}
              <span className="truncate">{geoPending ? 'Detecting your location…' : locationLabel}</span>
            </button>

            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search services…"
                  aria-label="Search services"
                  className="w-full h-10 pl-9 pr-3 rounded-btn border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <button type="submit" className="bg-brand text-white h-10 px-4 rounded-btn text-sm font-semibold">Go</button>
            </form>

            <nav className="grid gap-1">
              {activeLinks.map(link => (
                <Link
                  key={link.to + link.label}
                  to={link.to}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  to={userRole === 'WORKER' ? '/worker/dashboard' : userRole === 'ADMIN' || userRole === 'FEDERATION_ADMIN' ? '/admin' : '/customer/dashboard'}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  My Dashboard
                </Link>
              )}
            </nav>

            {!user && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/auth" className="flex items-center justify-center gap-1.5 h-11 rounded-btn text-sm font-semibold text-slate-700 border border-slate-300">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link to="/auth" className="flex items-center justify-center gap-1.5 h-11 rounded-btn text-sm font-semibold text-white bg-teal-500">
                  <UserPlus className="w-4 h-4" /> Join
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

