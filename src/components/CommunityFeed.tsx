import React, { useState } from 'react';
import {
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Search,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { Complaint } from '../types';

interface CommunityFeedProps {
  complaints: Complaint[];
  onSelectTicket: (id: string) => void;
  onUpvote: (id: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  complaints,
  onSelectTicket,
  onUpvote,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'upvoted' | 'resolved' | 'critical'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredList = complaints
    .filter((c) => {
      if (filterType === 'upvoted' && c.upvotes < 20) return false;
      if (filterType === 'resolved' && c.status !== 'resolved') return false;
      if (filterType === 'critical' && c.priority !== 'critical' && c.priority !== 'high') return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.address.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (filterType === 'upvoted') return b.upvotes - a.upvotes;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <span className="text-emerald-700 font-semibold text-xs">Resolved & Verified</span>;
      case 'in_progress':
        return <span className="text-blue-700 font-semibold text-xs">Field Crew Working</span>;
      case 'assigned':
        return <span className="text-purple-700 font-semibold text-xs">Crew Dispatched</span>;
      case 'under_review':
        return <span className="text-amber-700 font-semibold text-xs">In Triage</span>;
      default:
        return <span className="text-slate-700 font-semibold text-xs">Registered</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Public Civic Transparency Ledger
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Community Grievance Feed
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Public record of reported neighborhood defects, collective citizen upvoting, and verified municipal resolutions.
          </p>
        </div>

        {/* Quick Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setFilterType('upvoted')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterType === 'upvoted'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Most Upvoted
          </button>
          <button
            onClick={() => setFilterType('critical')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterType === 'critical'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            High Urgency
          </button>
          <button
            onClick={() => setFilterType('resolved')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterType === 'resolved'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved Cases
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter community feed by keyword, street name, or ticket ID..."
          className="w-full pl-9 pr-4 py-2 bg-white text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      {/* Grievance Card List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            No complaints found matching this criteria.
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono mb-1.5">
                    <span className="font-bold text-slate-900">{item.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.department}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.zone}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                  </div>

                  <h3
                    onClick={() => onSelectTicket(item.id)}
                    className="text-base font-bold text-slate-900 hover:text-blue-900 cursor-pointer leading-snug"
                  >
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.address}</span>
                  </div>
                </div>

                {/* Evidence Thumbnail if present */}
                {item.imageUrl && (
                  <div className="sm:w-36 sm:h-24 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  {getStatusBadge(item.status)}
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-500 font-mono">
                    SLA Due: {new Date(item.expectedResolutionDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpvote(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium border text-xs transition-colors cursor-pointer ${
                      item.hasUpvoted
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{item.upvotes} Affected</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTicket(item.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs transition-colors cursor-pointer"
                  >
                    <span>View Audit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
