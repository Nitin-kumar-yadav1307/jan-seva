import React from 'react';
import clsx from 'clsx';

/**
 * Status / category badge. Colors map to the brand + status palette.
 * Used for booking states, notifications, category labels, ratings.
 */
const tones = {
  blue: 'bg-blue-100 text-blue-700',
  teal: 'bg-teal-100 text-teal-700',
  navy: 'bg-navy text-white',
  green: 'bg-green-100 text-green-700',
  success: 'bg-status-success/10 text-status-success',
  warning: 'bg-status-warning/15 text-amber-700',
  error: 'bg-status-error/10 text-status-error',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  purple: 'bg-violet-100 text-violet-700',
  neutral: 'bg-slate-100 text-slate-600',
  outline: 'bg-white border border-slate-200 text-slate-600',
};

export const Badge = ({ tone = 'blue', className, children, ...props }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-4',
        tones[tone] || tones.blue,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

/** Small icon inside a tinted rounded container (used for category cards, feature icons). */
export const IconTile = ({ tone = 'blue', className, children, ...props }) => {
  const tints = {
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600',
    navy: 'bg-navy text-white',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-xl',
        tints[tone] || tints.blue,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
