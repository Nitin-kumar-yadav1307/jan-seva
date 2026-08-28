import React from 'react';
import { ShieldCheck, HeartHandshake, Award, Sparkles } from 'lucide-react';
import { JanSevaLogo } from '../brand/JanSevaLogo';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-950 pb-24 pt-14 text-slate-300 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <JanSevaLogo light emblemClassName="h-9 w-9" />
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-400 mb-5">
              Empowering Indian artisans, technicians, and home care workers through a federated cooperative marketplace driven by fairness-centric agentic AI.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                NSDC Verified
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-4 h-4 text-blue-400" />
                85% Direct Worker Payout
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400" />
                SIH 2026 Prototype
              </span>
            </div>
          </div>

          <div>
            <h4 className="section-kicker mb-3 text-sky-300">Core Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Plumbing & Leakages</li>
              <li>Electrical & Wiring</li>
              <li>Home Deep Cleaning</li>
              <li>Carpentry & Repairs</li>
              <li>Elderly & Home Care</li>
            </ul>
          </div>

          <div>
            <h4 className="section-kicker mb-3 text-sky-300">Federation & Trust</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Mumbai Central Artisan Co-op</li>
              <li>Mumbai Urban Workers Federation</li>
              <li>Mahila Seva Sahakari Samiti</li>
              <li>Worker Welfare & Healthcare Pool</li>
              <li>Algorithmic Fairness Whitepaper</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Jan Seva Cooperative Federation. Open architecture for public good.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Charter</span>
            <span>Worker Bill of Rights</span>
            <span>Cooperative Bylaws</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
