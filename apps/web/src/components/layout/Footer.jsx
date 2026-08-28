import React from 'react';
import { ShieldCheck, HeartHandshake, Award, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-coop-600 flex items-center justify-center text-white font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Co-op<span className="text-blue-400">Seva</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-4">
              Empowering Indian artisans, technicians, and home care workers through a federated cooperative marketplace driven by fairness-centric agentic AI.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                NSDC Verified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-4 h-4 text-blue-400" />
                85% Direct Worker Payout
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400" />
                SIH 2026 Prototype
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Core Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Plumbing & Leakages</li>
              <li>Electrical & Wiring</li>
              <li>Home Deep Cleaning</li>
              <li>Carpentry & Repairs</li>
              <li>Elderly & Home Care</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Federation & Trust</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Delhi Central Artisan Co-op</li>
              <li>NCR Urban Workers Federation</li>
              <li>Mahila Seva Sahakari Samiti</li>
              <li>Worker Welfare & Healthcare Pool</li>
              <li>Algorithmic Fairness Whitepaper</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Co-opSeva Autonomous Federation. Open architecture for public good.</p>
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
