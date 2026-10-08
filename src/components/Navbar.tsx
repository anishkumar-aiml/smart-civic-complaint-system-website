import React from 'react';
import { PhoneCall, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'report' | 'track' | 'map' | 'feed' | 'officer' | 'analytics';
  setActiveTab: (tab: 'report' | 'track' | 'map' | 'feed' | 'officer' | 'analytics') => void;
  onOpenHelpline: () => void;
  officerMode: boolean;
  setOfficerMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenHelpline,
  officerMode,
  setOfficerMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('report');
            }}
            className="text-left group cursor-pointer"
          >
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors">
              CivicPulse
            </span>
          </button>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500 border-l border-slate-300 pl-3">
            City of Metroville 311
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('report')}
            className={`cursor-pointer transition-colors pb-1 ${
              activeTab === 'report'
                ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            File Report
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`cursor-pointer transition-colors pb-1 ${
              activeTab === 'track'
                ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Track Status
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`cursor-pointer transition-colors pb-1 ${
              activeTab === 'map'
                ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Civic Map
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`cursor-pointer transition-colors pb-1 ${
              activeTab === 'feed'
                ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Community Feed
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`cursor-pointer transition-colors pb-1 ${
              activeTab === 'analytics'
                ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            SLA Metrics
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenHelpline}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
            title="Municipal Emergency Numbers"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Emergency</span>
            <span>Helplines</span>
          </button>

          <button
            onClick={() => {
              const nextMode = !officerMode;
              setOfficerMode(nextMode);
              if (nextMode) setActiveTab('officer');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              officerMode
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{officerMode ? 'Officer Desk Active' : 'Officer Console'}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-700">
        <button
          onClick={() => setActiveTab('report')}
          className={`py-1 px-2 font-medium ${activeTab === 'report' ? 'text-slate-950 font-bold' : ''}`}
        >
          File
        </button>
        <button
          onClick={() => setActiveTab('track')}
          className={`py-1 px-2 font-medium ${activeTab === 'track' ? 'text-slate-950 font-bold' : ''}`}
        >
          Track
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`py-1 px-2 font-medium ${activeTab === 'map' ? 'text-slate-950 font-bold' : ''}`}
        >
          Map
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`py-1 px-2 font-medium ${activeTab === 'feed' ? 'text-slate-950 font-bold' : ''}`}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-1 px-2 font-medium ${activeTab === 'analytics' ? 'text-slate-950 font-bold' : ''}`}
        >
          SLA
        </button>
      </div>
    </header>
  );
};
