import React from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOADING SKELETON COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const Shimmer = ({ className = '' }) => (
  <div className={`bg-slate-200 animate-pulse rounded-xl ${className}`} />
);

export const ServiceCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs flex-shrink-0 w-44">
    <Shimmer className="h-28 rounded-none" />
    <div className="p-3 space-y-1.5">
      <Shimmer className="h-3.5 w-3/4" />
      <Shimmer className="h-3 w-1/2" />
    </div>
  </div>
);

export const WorkerCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
    <div className="flex items-start gap-3.5">
      <Shimmer className="w-14 h-14 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-3 w-28" />
      </div>
    </div>
    <Shimmer className="h-10 w-full" />
    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
      <Shimmer className="h-5 w-16" />
      <Shimmer className="h-8 w-24 rounded-xl" />
    </div>
  </div>
);

export const DashboardCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
    <Shimmer className="h-4 w-20" />
    <Shimmer className="h-8 w-28" />
    <Shimmer className="h-3 w-36" />
  </div>
);

export const ChartSkeleton = ({ height = 'h-48' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 ${height} flex items-end justify-around px-6 pb-6 pt-10 gap-2`}>
    {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
      <div key={i} className="flex-1 bg-slate-200 animate-pulse rounded-t-lg" style={{ height: `${h}%` }} />
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-end gap-4">
        <Shimmer className="w-20 h-20 rounded-2xl" />
        <div className="pb-1 flex-1 space-y-2">
          <Shimmer className="h-5 w-40" />
          <Shimmer className="h-3.5 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <Shimmer key={i} className="h-16" />)}
      </div>
    </div>
  </div>
);

export const BookingCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 animate-pulse">
    <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Shimmer className="h-4 w-40" />
      <Shimmer className="h-3 w-28" />
    </div>
    <Shimmer className="h-6 w-16 rounded-full" />
  </div>
);

export const ListSkeleton = ({ count = 4, CardComponent = WorkerCardSkeleton }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => <CardComponent key={i} />)}
  </div>
);
