import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, ServerCrash, ShieldAlert } from 'lucide-react';

const ERROR_PRESETS = {
  network: {
    icon: <WifiOff className="w-12 h-12 text-slate-400" />,
    title: 'No Connection',
    description: 'Could not reach Co-opSeva servers. Check your internet connection and try again.',
  },
  server: {
    icon: <ServerCrash className="w-12 h-12 text-rose-400" />,
    title: 'Something went wrong',
    description: 'We couldn\'t load the requested information. Our team has been notified.',
  },
  auth: {
    icon: <ShieldAlert className="w-12 h-12 text-amber-400" />,
    title: 'Session Expired',
    description: 'Your session has expired. Please sign in again to continue.',
  },
  notFound: {
    icon: <AlertTriangle className="w-12 h-12 text-slate-400" />,
    title: 'Not Found',
    description: 'The item you\'re looking for doesn\'t exist or may have been removed.',
  },
};

export const ErrorState = ({
  preset = 'server',
  icon,
  title,
  description,
  onRetry,
  retryLabel = 'Try Again',
  compact = false,
}) => {
  const config = ERROR_PRESETS[preset] || ERROR_PRESETS.server;

  const resolvedIcon = icon || config.icon;
  const resolvedTitle = title || config.title;
  const resolvedDesc = description || config.description;

  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-16 px-6'} space-y-4`}>
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
        {resolvedIcon}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-extrabold text-slate-800 text-base">{resolvedTitle}</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">{resolvedDesc}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-coop-600 hover:bg-coop-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
      <p className="text-[10px] text-slate-400">
        If this issue persists, contact cooperative support.
      </p>
    </div>
  );
};

// Inline error banner (not fullscreen)
export const ErrorBanner = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3 text-sm">
    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
    <div className="flex-1">
      <p className="text-red-800 font-semibold">{message || 'Something went wrong.'}</p>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="text-red-600 font-bold text-xs hover:underline shrink-0">
        Retry
      </button>
    )}
  </div>
);
