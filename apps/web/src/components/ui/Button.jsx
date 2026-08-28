import React from 'react';
import clsx from 'clsx';

/**
 * Small reusable button system.
 * Primary   → blue→teal gradient, white text (default CTA)
 * Secondary → white background + subtle border
 * Destructive→ red
 * Ghost     → transparent with subtle hover
 */
const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-btn transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ' +
  'whitespace-nowrap select-none';

const variants = {
  primary:
    'bg-brand text-white shadow-soft hover:shadow-elevated hover:brightness-105 active:scale-[0.98]',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-subtle',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200 active:scale-[0.98]',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  teal: 'bg-teal-500 text-white hover:bg-teal-600 focus-visible:ring-teal-200 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-[15px]',
  icon: 'p-2.5',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  as: Comp = 'button',
  block,
  ...props
}) => {
  return (
    <Comp
      className={clsx(base, variants[variant], sizes[size], block && 'w-full', className)}
      {...props}
    />
  );
};

export default Button;
