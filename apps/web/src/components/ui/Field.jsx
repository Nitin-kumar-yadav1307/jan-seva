import React from 'react';
import clsx from 'clsx';

/**
 * Accessible form field:
 * - clear label (+ required marker)
 * - 48–52px tall input, white bg, 1px border, 12px radius
 * - blue/teal focus ring
 * - red border + concise message on error, helper text otherwise
 * Never rely on color alone → error is a text message + icon.
 */
export const baseInput =
  'w-full h-12 rounded-input border bg-white px-3.5 text-[15px] text-ink placeholder:text-slate-400 ' +
  'focus:outline-none focus:ring-4 transition-all disabled:bg-slate-50 disabled:text-slate-400';

const stateClasses = {
  normal: 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
  error: 'border-status-error focus:border-status-error focus:ring-red-100',
  success: 'border-status-success focus:border-status-success focus:ring-green-100',
};

export const Field = ({
  label,
  hint,
  error,
  success,
  required,
  inputClassName,
  className,
  id,
  ...props
}) => {
  const state = error ? 'error' : success ? 'success' : 'normal';
  const fieldId = id || props.name || label;
  return (
    <div className={clsx('block space-y-1.5', className)}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-status-error">*</span>}
        </label>
      )}
      <input
        id={fieldId}
        className={clsx(baseInput, stateClasses[state], inputClassName)}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="flex items-center gap-1 text-xs text-status-error">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default Field;
