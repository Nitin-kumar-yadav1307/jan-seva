import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Package,
  Calendar,
  Users,
  BarChart3,
  MessageSquare,
  Star,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const EMPTY_STATE_PRESETS = {
  workers: {
    icon: <Users className="w-12 h-12 text-slate-300" />,
    title: 'No workers found nearby',
    description: 'Try expanding your search radius or choosing a different service category.',
    ctaLabel: 'Adjust Filters',
    ctaHref: null,
  },
  bookings: {
    icon: <Calendar className="w-12 h-12 text-slate-300" />,
    title: 'No bookings yet',
    description: 'Book your first cooperative service and experience fair, transparent home services.',
    ctaLabel: 'Book a Service',
    ctaHref: '/services',
  },
  services: {
    icon: <Package className="w-12 h-12 text-slate-300" />,
    title: 'No services available',
    description: 'Services for this category are not available right now. Check back soon.',
    ctaLabel: 'Browse All Services',
    ctaHref: '/services',
  },
  forecast: {
    icon: <BarChart3 className="w-12 h-12 text-slate-300" />,
    title: 'No forecast data',
    description: 'There is not enough booking history yet to generate a demand forecast.',
    ctaLabel: null,
    ctaHref: null,
  },
  aiRecommendations: {
    icon: <Sparkles className="w-12 h-12 text-slate-300" />,
    title: 'No AI recommendations',
    description: 'Ask the AI assistant about service demand or workforce allocation to generate recommendations.',
    ctaLabel: 'Open AI Assistant',
    ctaHref: null,
  },
  reviews: {
    icon: <Star className="w-12 h-12 text-slate-300" />,
    title: 'No reviews yet',
    description: 'Be the first to review after completing a service.',
    ctaLabel: null,
    ctaHref: null,
  },
  messages: {
    icon: <MessageSquare className="w-12 h-12 text-slate-300" />,
    title: 'No messages',
    description: 'Updates from your bookings and cooperative will appear here.',
    ctaLabel: null,
    ctaHref: null,
  },
};

export const EmptyState = ({
  preset,
  icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  compact = false,
}) => {
  const config = preset ? EMPTY_STATE_PRESETS[preset] : {};

  const resolvedIcon = icon || config.icon || <AlertCircle className="w-12 h-12 text-slate-300" />;
  const resolvedTitle = title || config.title || 'Nothing here yet';
  const resolvedDesc = description || config.description || '';
  const resolvedCtaLabel = ctaLabel || config.ctaLabel;
  const resolvedCtaHref = ctaHref || config.ctaHref;

  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-16 px-6'} space-y-4`}>
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
        {resolvedIcon}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-extrabold text-slate-800 text-base">{resolvedTitle}</h3>
        {resolvedDesc && <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">{resolvedDesc}</p>}
      </div>
      {resolvedCtaLabel && (
        resolvedCtaHref ? (
          <Link
            to={resolvedCtaHref}
            className="inline-flex items-center gap-2 bg-coop-600 hover:bg-coop-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            {resolvedCtaLabel}
          </Link>
        ) : (
          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 bg-coop-600 hover:bg-coop-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            {resolvedCtaLabel}
          </button>
        )
      )}
    </div>
  );
};
