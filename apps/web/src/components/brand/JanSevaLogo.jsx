import React from 'react';

/**
 * Jan Seva brand logo.
 * Emblem: house outline + 3 diverse workers inside + supporting hand underneath + leaf accents.
 * Wordmark: "jan seva" with blue→teal gradient.
 *
 * Props:
 *  - variant: 'full' (emblem + wordmark) | 'emblem' (icon only, for favicon/app icon)
 *  - light: true → white wordmark text for dark backgrounds (footer/auth header)
 *  - showTagline: render "COOPERATIVE SERVICES PLATFORM" under the wordmark
 *  - className: applied to the root svg/span
 */

const EMBLEM_VIEWBOX = '0 0 52 52';

export const JanSevaEmblem = ({ className = '', idPrefix = 'js' }) => (
  <svg viewBox={EMBLEM_VIEWBOX} className={className} role="img" aria-label="Jan Seva emblem" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`${idPrefix}-brand`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2F80ED" />
        <stop offset="100%" stopColor="#12B8B0" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-hand`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2F80ED" />
        <stop offset="100%" stopColor="#12B8B0" />
      </linearGradient>
    </defs>

    {/* Subtle leaf accents — growth & sustainability (left roof eave + right roof eave) */}
    <path d="M9.5 18.5 C7 15.5 7.5 11.5 10.5 9.5 C13.5 11.8 13.8 15.8 11.6 18.2 Z" fill="#12B8B0" opacity="0.85" />
    <path d="M42.5 18.5 C45 15.5 44.5 11.5 41.5 9.5 C38.5 11.8 38.2 15.8 40.4 18.2 Z" fill="#2F80ED" opacity="0.85" />

    {/* Supporting hand underneath — trust & community support */}
    <path
      d="M12 42 C16 46.5 36 46.5 40 42 C41 40.9 40.6 39.3 39.2 39.1 C34 38.4 30.5 40.4 26 40.4 C21.5 40.4 18 38.4 12.8 39.1 C11.4 39.3 11 40.9 12 42 Z"
      fill={`url(#${idPrefix}-hand)`}
      opacity="0.95"
    />

    {/* House outline — main shape, rounded joins */}
    <path
      d="M10 24.5 V38 Q10 40.5 12.5 40.5 H39.5 Q42 40.5 42 38 V24.5"
      fill="none"
      stroke={`url(#${idPrefix}-brand)`}
      strokeWidth="3.4"
      strokeLinecap="round"
    />
    {/* Roof */}
    <path
      d="M6.5 25.5 L24.3 9.6 Q26 8.1 27.7 9.6 L45.5 25.5"
      fill="none"
      stroke={`url(#${idPrefix}-brand)`}
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Three diverse workers inside the house — head + shoulders, center one larger */}
    {/* Left worker — deep blue */}
    <g fill="#2563EB">
      <circle cx="16.5" cy="26.5" r="3.1" />
      <path d="M11.5 36.5 Q11.5 31 16.5 31 Q21.5 31 21.5 36.5 Z" />
    </g>
    {/* Right worker — teal */}
    <g fill="#12B8B0">
      <circle cx="35.5" cy="26.5" r="3.1" />
      <path d="M30.5 36.5 Q30.5 31 35.5 31 Q40.5 31 40.5 36.5 Z" />
    </g>
    {/* Center worker — dark navy, slightly taller */}
    <g fill="#172033">
      <circle cx="26" cy="23.5" r="3.9" />
      <path d="M19.8 36.5 Q19.8 29.5 26 29.5 Q32.2 29.5 32.2 36.5 Z" />
    </g>
  </svg>
);

export const JanSevaLogo = ({
  variant = 'full',
  light = false,
  showTagline = false,
  className = '',
  emblemClassName = 'h-9 w-9',
}) => {
  if (variant === 'emblem') {
    return <JanSevaEmblem className={emblemClassName || className} idPrefix="jse" />;
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Jan Seva — Cooperative Services Platform">
      <JanSevaEmblem className={emblemClassName} idPrefix="jsl" />
      <span className="flex flex-col leading-none">
        <span
          className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy'}`}
        >
          jan{' '}
          <span
            className={light ? 'text-teal-300' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#2F80ED] to-[#12B8B0]'}
          >
            seva
          </span>
        </span>
        {showTagline && (
          <span className={`mt-1 text-[8px] font-bold tracking-[0.18em] uppercase ${light ? 'text-blue-200' : 'text-slate-400'}`}>
            Cooperative Services Platform
          </span>
        )}
      </span>
    </span>
  );
};

export default JanSevaLogo;
