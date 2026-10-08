import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Clock, MapPin, Wrench } from 'lucide-react';
import heroImg from '../assets/images/hero_civic_city_1791478610376.jpg';

interface HeroProps {
  onSearchTicket: (ticketId: string) => void;
  onSelectCategory: (category: string) => void;
  totalResolved: number;
  totalActive: number;
}

export const Hero: React.FC<HeroProps> = ({
  onSearchTicket,
  onSelectCategory,
  totalResolved,
  totalActive,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchTicket(searchInput.trim());
    }
  };

  return (
    <div className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
      {/* Background with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Metroville City Urban Infrastructure"
          className="w-full h-full object-cover opacity-25 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/75" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-slate-300 uppercase mb-3">
            <span>City of Metroville</span>
            <span aria-hidden="true">·</span>
            <span>Department of Public Grievance Redressal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Report civic issues. Track resolution in real time.
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
            Directly connect with municipal road maintenance, solid waste crews, street lighting, and water utilities. Guaranteed SLA tracking and verified photographic audit.
          </p>

          {/* Quick Tracking Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 max-w-xl">
            <div className="relative flex items-center bg-white rounded-lg shadow-lg p-1.5 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-2.5 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Track Complaint ID (e.g., CC-2026-4821) or phone..."
                className="w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer shrink-0"
              >
                Track Now
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <span>Try sample IDs:</span>
              <button
                type="button"
                onClick={() => onSearchTicket('CC-2026-4821')}
                className="text-slate-200 hover:text-white underline decoration-slate-600 font-mono"
              >
                CC-2026-4821
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onSearchTicket('CC-2026-3194')}
                className="text-slate-200 hover:text-white underline decoration-slate-600 font-mono"
              >
                CC-2026-3194
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onSearchTicket('CC-2026-6188')}
                className="text-slate-200 hover:text-white underline decoration-slate-600 font-mono"
              >
                CC-2026-6188
              </button>
            </div>
          </form>
        </div>

        {/* 4 Quantitative Key Metrics adhering to Zero-Pill & Tabular Numerals */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              {(totalResolved + 1284).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">Grievances redressed this year</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
              94.2%
            </div>
            <div className="text-xs text-slate-400 mt-1">SLA on-time compliance rate</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              24.5 hrs
            </div>
            <div className="text-xs text-slate-400 mt-1">Average resolution turnaround</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-300 tabular-nums">
              {totalActive} Active
            </div>
            <div className="text-xs text-slate-400 mt-1">Dispatched field units across 5 wards</div>
          </div>
        </div>
      </div>
    </div>
  );
};
