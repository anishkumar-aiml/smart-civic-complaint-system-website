import React from 'react';
import { Complaint } from '../types';
import { WARDS_DATA } from '../data/initialData';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  ThumbsUp,
  Star,
  ShieldCheck,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  complaints: Complaint[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ complaints }) => {
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;
  const inProgress = complaints.filter((c) => c.status === 'in_progress').length;
  const underReview = complaints.filter((c) => c.status === 'under_review' || c.status === 'submitted').length;
  const critical = complaints.filter((c) => c.priority === 'critical' || c.priority === 'high').length;

  const categoryCounts: Record<string, number> = {
    roads: 0,
    sanitation: 0,
    lighting: 0,
    water: 0,
    traffic: 0,
    parks: 0,
  };

  complaints.forEach((c) => {
    if (categoryCounts[c.category] !== undefined) {
      categoryCounts[c.category]++;
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          Municipal Open Data & Service Level Metrics
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">
          Civic SLA Performance & Accountability
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Public metrics published under the Metroville Municipal Transparency and Citizens Right to Service Charter.
        </p>
      </div>

      {/* Top Stat Row with Tabular Numerals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total Registered Issues</div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
            {(total + 1480).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">
            +18.4% monthly resolution pace
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">SLA Compliance Rate</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600 mt-1 tabular-nums">
            94.6%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Standard: 90% mandated threshold
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Avg Resolution Time</div>
          <div className="text-3xl font-extrabold font-mono text-blue-600 mt-1 tabular-nums">
            24.5 hrs
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Target SLA: 48 hrs max
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Citizen Rating Index</div>
          <div className="text-3xl font-extrabold font-mono text-amber-500 mt-1 tabular-nums">
            4.8 / 5.0
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Based on 920 verified citizen reviews
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Complaint Distribution by Civic Domain
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Roads & Asphalt Pavements', count: categoryCounts.roads + 420, color: 'bg-blue-600' },
              { label: 'Solid Waste & Sanitation', count: categoryCounts.sanitation + 390, color: 'bg-emerald-600' },
              { label: 'Street Lighting & Grid', count: categoryCounts.lighting + 280, color: 'bg-amber-500' },
              { label: 'Water Supply & Sewerage', count: categoryCounts.water + 240, color: 'bg-cyan-600' },
              { label: 'Traffic Operations & Signs', count: categoryCounts.traffic + 110, color: 'bg-red-500' },
              { label: 'Parks & Recreation Facilities', count: categoryCounts.parks + 80, color: 'bg-indigo-500' },
            ].map((item) => {
              const max = 450;
              const pct = Math.min(100, Math.round((item.count / max) * 100));
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>{item.label}</span>
                    <span className="font-mono font-semibold">{item.count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ward-wise Efficiency */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Ward Performance & Officer in Charge
          </h3>
          <div className="space-y-3">
            {WARDS_DATA.map((w) => (
              <div
                key={w.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">{w.name}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Lead: {w.officerInCharge} ({w.contact})
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-emerald-700">
                    {w.resolvedThisMonth} Resolved
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Avg: {w.avgResolutionHours}h
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Citizens Charter Guarantee Note */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">
            Official Municipal Citizen Charter Notice:
          </span>{' '}
          All complaints are automatically time-stamped. Any grievance exceeding its designated SLA triggers an automatic escalation alert to the Chief Municipal Commissioner’s Executive Desk.
        </div>
      </div>
    </div>
  );
};
