import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  MapPin, 
  Globe, 
  UserCheck, 
  ShieldCheck, 
  Briefcase, 
  LayoutDashboard,
  CalendarCheck
} from 'lucide-react';

export const Navbar = ({ onOpenAiDrawer }) => {
  const { t, i18n } = useTranslation();
  const { user, switchPersona, personas } = useAuth();
  const location = useLocation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top micro-bar for Demo Persona and Cooperative Trust */}
      <div className="bg-coop-900 text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
          <span className="font-medium text-blue-100">Co-opSeva Autonomous Federation</span>
          <span className="bg-blue-800 text-[10px] px-2 py-0.5 rounded-full text-blue-200 font-mono">
            85% Direct Worker Wage
          </span>
        </div>

        {/* Demo Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-300 hidden sm:inline">Role Switcher:</span>
          <div className="flex bg-coop-800/80 p-0.5 rounded-md border border-blue-700/50">
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => switchPersona(p)}
                className={`px-2 py-0.5 text-[11px] rounded transition-all font-medium ${
                  user?.id === p.id 
                    ? 'bg-blue-500 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {p.badge}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Location */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-coop-700 to-coop-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Co-op<span className="text-coop-600">Seva</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </Link>

          {/* Location Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-coop-600" />
            <span>Connaught Place, New Delhi</span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'text-coop-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/services"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.startsWith('/services') ? 'text-coop-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('nav.services')}
          </Link>
          <Link
            to="/workers"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/workers' ? 'text-coop-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('nav.workers')}
          </Link>
          <Link
            to="/bookings"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/bookings' ? 'text-coop-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('nav.myBookings')}
          </Link>

          {user?.role === 'WORKER' && (
            <Link
              to="/worker-dashboard"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              {t('nav.workerDashboard')}
            </Link>
          )}

          {(user?.role === 'ADMIN' || user?.role === 'FEDERATION_ADMIN') && (
            <Link
              to="/admin"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              {t('nav.admin')}
            </Link>
          )}
        </nav>

        {/* Actions (Language Switcher + AI Button) */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-medium">
            <Globe className="w-3.5 h-3.5 text-slate-500 mr-1 ml-1" />
            <button
              onClick={() => changeLanguage('en')}
              className={`px-1.5 py-0.5 rounded ${i18n.language === 'en' ? 'bg-white shadow-xs text-coop-600 font-bold' : 'text-slate-600'}`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`px-1.5 py-0.5 rounded ${i18n.language === 'hi' ? 'bg-white shadow-xs text-coop-600 font-bold' : 'text-slate-600'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => changeLanguage('mr')}
              className={`px-1.5 py-0.5 rounded ${i18n.language === 'mr' ? 'bg-white shadow-xs text-coop-600 font-bold' : 'text-slate-600'}`}
            >
              मराठी
            </button>
          </div>

          {/* AI Fast Booking Trigger */}
          <button
            onClick={onOpenAiDrawer}
            className="flex items-center gap-2 bg-gradient-to-r from-coop-600 to-indigo-600 hover:from-coop-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="hidden sm:inline">AI Fast Book</span>
            <span className="sm:hidden">AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
