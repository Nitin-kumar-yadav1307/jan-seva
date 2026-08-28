import React from 'react';
import clsx from 'clsx';

/**
 * Default card:
 * white bg, 1px #E5E7EB border, 16px radius, subtle shadow, ~20–24px padding.
 * Hover = slight upward movement + stronger shadow (150–250ms), no dramatic animation.
 */
export const Card = ({ className, hover = false, padded = true, as: Comp = 'div', ...props }) => {
  return (
    <Comp
      className={clsx(
        'bg-white border border-slate-200 rounded-2xl shadow-card',
        padded && 'p-5 sm:p-6',
        hover &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated hover:border-blue-200',
        className
      )}
      {...props}
    />
  );
};

export default Card;
