import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Home, Grid, Users, Calendar, Sparkles, LayoutDashboard, Briefcase } from 'lucide-react';

export const BottomNav = ({ onOpenAiDrawer }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const role = String(user?.role || '').toUpperCase();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          isActive('/') ? 'text-coop-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>{t('nav.home')}</span>
      </Link>

      <Link
        to={role === 'CUSTOMER' ? '/customer/services' : role === 'WORKER' ? '/worker/dashboard' : role === 'ADMIN' || role === 'FEDERATION_ADMIN' ? '/admin' : '/auth'}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          isActive('/customer/services') || isActive('/worker/dashboard') || isActive('/admin') ? 'text-coop-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span>{t('nav.services')}</span>
      </Link>

      {/* Floating Center AI Action Button */}
      <button
        onClick={onOpenAiDrawer}
        className="flex flex-col items-center -mt-6 group"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-coop-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <span className="text-[10px] font-semibold text-coop-600 mt-1">AI Book</span>
      </button>

      <Link
        to={role === 'CUSTOMER' ? '/customer/bookings' : role === 'WORKER' ? '/worker/dashboard' : role === 'ADMIN' || role === 'FEDERATION_ADMIN' ? '/admin' : '/auth'}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          isActive('/customer/bookings') || isActive('/worker/dashboard') || isActive('/admin') ? 'text-coop-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span>{t('nav.myBookings')}</span>
      </Link>

      {role === 'WORKER' ? (
        <Link
          to="/worker/dashboard"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            isActive('/worker/dashboard') ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span>Portal</span>
        </Link>
      ) : role === 'ADMIN' || role === 'FEDERATION_ADMIN' ? (
        <Link
          to="/admin"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            isActive('/admin') ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Co-op</span>
        </Link>
      ) : (
        <Link
          to="/auth"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            isActive('/auth') ? 'text-coop-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>{t('nav.workers')}</span>
        </Link>
      )}
    </div>
  );
};
