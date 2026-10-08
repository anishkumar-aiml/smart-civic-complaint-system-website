import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  Filter,
  Eye,
  ThumbsUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';
import { WARDS_DATA } from '../data/initialData';

interface CivicMapProps {
  complaints: Complaint[];
  onSelectTicket: (id: string) => void;
  onUpvote: (id: string) => void;
  onNewReportAtLocation?: (lat: number, lng: number, address: string) => void;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  complaints,
  onSelectTicket,
  onUpvote,
  onNewReportAtLocation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [activePinId, setActivePinId] = useState<string | null>(null);

  const filteredComplaints = complaints.filter((c) => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (selectedWard !== 'all' && c.ward !== selectedWard) return false;
    return true;
  });

  const activeComplaint = complaints.find((c) => c.id === activePinId);

  // Map coordinate conversion into visual SVG coordinates (width 800, height 500)
  // Lat bounds ~ 34.03 to 34.08, Lng bounds ~ -118.28 to -118.22
  const mapCoords = (lat: number, lng: number) => {
    const minLat = 34.035;
    const maxLat = 34.075;
    const minLng = -118.275;
    const maxLng = -118.225;

    const x = Math.max(40, Math.min(760, ((lng - minLng) / (maxLng - minLng)) * 800));
    const y = Math.max(40, Math.min(460, (1 - (lat - minLat) / (maxLat - minLat)) * 500));
    return { x, y };
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'resolved':
        return '#10b981'; // emerald
      case 'in_progress':
        return '#3b82f6'; // blue
      case 'assigned':
        return '#8b5cf6'; // purple
      case 'under_review':
        return '#f59e0b'; // amber
      default:
        return '#ef4444'; // red
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Spatial Ward GIS Telemetry
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Interactive City Grievance Map
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Live geospatial feed of municipal incidents across Metroville. Click pins to inspect dispatch status or register your support.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
          <span className="font-semibold text-slate-900">Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span>New</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
        >
          <option value="all">All Categories</option>
          <option value="roads">Roads & Pavements</option>
          <option value="sanitation">Waste & Sanitation</option>
          <option value="lighting">Street Lighting</option>
          <option value="water">Water & Drainage</option>
          <option value="traffic">Traffic Signals</option>
          <option value="parks">Parks & Trees</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Registered / New</option>
          <option value="under_review">Under Review</option>
          <option value="assigned">Crew Dispatched</option>
          <option value="in_progress">Work in Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
        >
          <option value="all">All City Wards</option>
          {WARDS_DATA.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <span className="ml-auto text-slate-500 font-mono">
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </span>
      </div>

      {/* Main Map View & Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Canvas Container */}
        <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 shadow-md p-3 relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded border border-slate-700 text-[11px] text-slate-300 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GIS Grid: Metroville Municipal Boundary</span>
          </div>

          <div className="w-full aspect-[16/10] bg-slate-900 rounded-lg relative overflow-hidden select-none border border-slate-800">
            {/* SVG Base Map */}
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full"
              style={{ background: 'radial-gradient(circle at 50% 50%, #1e293b, #0f172a)' }}
            >
              {/* Grid Lines */}
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* River Curve */}
              <path
                d="M 120 0 Q 300 180 500 240 T 800 480"
                fill="none"
                stroke="#0284c7"
                strokeWidth="14"
                strokeOpacity="0.3"
              />
              <path
                d="M 120 0 Q 300 180 500 240 T 800 480"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeOpacity="0.4"
                strokeDasharray="6 4"
              />

              {/* Major Arterial Roads */}
              <line x1="80" y1="250" x2="720" y2="250" stroke="#334155" strokeWidth="6" />
              <line x1="400" y1="40" x2="400" y2="460" stroke="#334155" strokeWidth="6" />
              <line x1="150" y1="80" x2="650" y2="420" stroke="#334155" strokeWidth="4" />
              <line x1="180" y1="420" x2="680" y2="80" stroke="#334155" strokeWidth="4" />

              {/* Ward Boundaries & Labels */}
              <g opacity="0.6">
                <rect x="260" y="160" width="280" height="180" fill="none" stroke="#475569" strokeDasharray="4 4" />
                <text x="320" y="240" fill="#94a3b8" fontSize="13" fontFamily="monospace" fontWeight="600">
                  WARD 04 (Downtown Central)
                </text>

                <text x="540" y="130" fill="#94a3b8" fontSize="12" fontFamily="monospace">
                  WARD 07 (Riverside)
                </text>

                <text x="140" y="120" fill="#94a3b8" fontSize="12" fontFamily="monospace">
                  WARD 11 (Tech Park)
                </text>

                <text x="120" y="380" fill="#94a3b8" fontSize="12" fontFamily="monospace">
                  WARD 18 (Heritage)
                </text>

                <text x="520" y="380" fill="#94a3b8" fontSize="12" fontFamily="monospace">
                  WARD 14 (Green Valley)
                </text>
              </g>

              {/* Complaint Pins */}
              {filteredComplaints.map((c) => {
                const { x, y } = mapCoords(c.coordinates.lat, c.coordinates.lng);
                const isSelected = activePinId === c.id;
                const pinColor = getStatusColor(c.status);

                return (
                  <g
                    key={c.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => setActivePinId(c.id)}
                  >
                    {/* Pulsing ring for critical/high priority */}
                    {(c.priority === 'critical' || c.priority === 'high') && (
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 18 : 12}
                        fill={pinColor}
                        opacity="0.25"
                      />
                    )}

                    {/* Outer halo */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 10 : 7}
                      fill={pinColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Pin label if selected */}
                    {isSelected && (
                      <g>
                        <rect
                          x={x - 45}
                          y={y - 32}
                          width="90"
                          height="20"
                          rx="4"
                          fill="#0f172a"
                          stroke="#475569"
                          strokeWidth="1"
                        />
                        <text
                          x={x}
                          y={y - 18}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {c.id}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono px-2">
            <span>Coordinates Normalized WGS84</span>
            <span>Click any pin to inspect details</span>
          </div>
        </div>

        {/* Selected Pin Inspector Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          {activeComplaint ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                  <span className="font-bold text-slate-900">{activeComplaint.id}</span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase text-white"
                    style={{ backgroundColor: getStatusColor(activeComplaint.status) }}
                  >
                    {activeComplaint.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {activeComplaint.title}
                </h3>
              </div>

              {activeComplaint.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-slate-200 max-h-40">
                  <img
                    src={activeComplaint.imageUrl}
                    alt="Inspection Evidence"
                    className="w-full h-36 object-cover"
                  />
                </div>
              )}

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {activeComplaint.description}
              </p>

              <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1.5 font-mono text-slate-700">
                <div>
                  <span className="text-slate-400">Department:</span> {activeComplaint.department}
                </div>
                <div>
                  <span className="text-slate-400">Location:</span> {activeComplaint.address}
                </div>
                <div>
                  <span className="text-slate-400">SLA Due:</span>{' '}
                  {new Date(activeComplaint.expectedResolutionDate).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => onUpvote(activeComplaint.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    activeComplaint.hasUpvoted
                      ? 'border-blue-400 bg-blue-50 text-blue-800'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{activeComplaint.upvotes} Citizens Affected</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTicket(activeComplaint.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <span>Track Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="my-auto text-center py-12 text-slate-500">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-700">Select an Incident Pin</div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Click any colored node on the city grid map to inspect complaint photos, assigned crew, and progress.
              </p>
            </div>
          )}

          {/* Quick Municipal Ward Directory */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
              Municipal Ward Response Desk
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <div>Central Zone Command: <strong className="font-mono text-slate-800">+1 (555) 014-4000</strong></div>
              <div>Solid Waste Helpline: <strong className="font-mono text-slate-800">1913</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
