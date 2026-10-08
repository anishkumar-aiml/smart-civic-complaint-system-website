import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  ThumbsUp,
  FileText,
  AlertTriangle,
  Star,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Wrench,
  RotateCcw,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';

interface ComplaintTrackerProps {
  complaints: Complaint[];
  activeTicketId: string | null;
  onSelectTicket: (id: string) => void;
  onUpvote: (id: string) => void;
  onAddFeedback: (id: string, rating: number, comment: string) => void;
  onReopen: (id: string, reason: string) => void;
  onViewReceipt: (complaint: Complaint) => void;
}

const STATUS_STEPS: { key: ComplaintStatus; label: string; desc: string }[] = [
  { key: 'submitted', label: '1. Registered', desc: 'Logged into system' },
  { key: 'under_review', label: '2. Triage & Review', desc: 'Department validated' },
  { key: 'assigned', label: '3. Crew Dispatched', desc: 'Field unit assigned' },
  { key: 'in_progress', label: '4. In Progress', desc: 'On-site remediation' },
  { key: 'resolved', label: '5. Resolved', desc: 'Verified & closed' },
];

export const ComplaintTracker: React.FC<ComplaintTrackerProps> = ({
  complaints,
  activeTicketId,
  onSelectTicket,
  onUpvote,
  onAddFeedback,
  onReopen,
  onViewReceipt,
}) => {
  const [searchInput, setSearchInput] = useState(activeTicketId || '');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenForm, setShowReopenForm] = useState(false);

  // Find active complaint or default to first
  const activeComplaint =
    complaints.find((c) => c.id.toLowerCase() === (activeTicketId || searchInput).trim().toLowerCase()) ||
    (complaints.length > 0 ? complaints[0] : null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = complaints.find(
      (c) =>
        c.id.toLowerCase() === searchInput.trim().toLowerCase() ||
        c.citizenPhone.includes(searchInput.trim())
    );
    if (found) {
      onSelectTicket(found.id);
    }
  };

  const getStepState = (stepKey: ComplaintStatus, currentStatus: ComplaintStatus) => {
    const order: ComplaintStatus[] = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (currentStatus === 'rejected') {
      return stepKey === 'submitted' ? 'completed' : 'rejected';
    }
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Search Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="max-w-2xl">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Grievance Redressal Audit Pipeline
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Track Grievance Resolution & SLA
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Search by Reference ID (e.g., CC-2026-4821) or phone number to view real-time department updates, field crew telemetry, and resolution photos.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Complaint ID (CC-2026-XXXX)..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick list selector */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Recent Complaints:</span>
            {complaints.slice(0, 5).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSearchInput(c.id);
                  onSelectTicket(c.id);
                }}
                className={`font-mono px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  activeComplaint?.id === c.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!activeComplaint ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          No grievance found matching that ID. Try selecting one from the sample list above.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Ticket Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Ticket Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-1 font-mono">
                    <span className="font-bold text-slate-900">{activeComplaint.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeComplaint.department}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeComplaint.zone}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">
                    {activeComplaint.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{activeComplaint.address}</span>
                    {activeComplaint.landmark && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Ref: {activeComplaint.landmark}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpvote(activeComplaint.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      activeComplaint.hasUpvoted
                        ? 'border-blue-300 bg-blue-50 text-blue-800'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{activeComplaint.upvotes} Citizens Affected</span>
                  </button>

                  <button
                    onClick={() => onViewReceipt(activeComplaint)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Official Receipt</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="p-6 border-b border-slate-200">
              <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Service Level Redressal Lifecycle
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                {STATUS_STEPS.map((step, idx) => {
                  const state = getStepState(step.key, activeComplaint.status);

                  let bgStyle = 'bg-slate-100 border-slate-200 text-slate-400';
                  let badge = 'text-slate-400';

                  if (state === 'completed') {
                    bgStyle = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                    badge = 'text-emerald-700 font-bold';
                  } else if (state === 'current') {
                    bgStyle = 'bg-slate-900 border-slate-900 text-white shadow-sm';
                    badge = 'text-white font-bold';
                  }

                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-lg border transition-all ${bgStyle}`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={badge}>{step.label}</span>
                        {state === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                        {state === 'current' && (
                          <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                        )}
                      </div>
                      <div className="text-xs mt-1 opacity-80">{step.desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* SLA Target Banner */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>
                    Mandated SLA Resolution Deadline:{' '}
                    <strong className="font-mono text-slate-900">
                      {new Date(activeComplaint.expectedResolutionDate).toLocaleString()}
                    </strong>
                  </span>
                </div>
                {activeComplaint.resolvedAt ? (
                  <span className="font-semibold text-emerald-700">
                    Resolved on{' '}
                    {new Date(activeComplaint.resolvedAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="font-mono text-slate-700">
                    Status: {activeComplaint.status.toUpperCase().replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>

            {/* Middle Grid: Detailed Description & Field Officer Assignment */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Incident Statement
                  </h4>
                  <p className="mt-1 text-sm text-slate-800 leading-relaxed">
                    {activeComplaint.description}
                  </p>
                </div>

                {/* Evidence Photos */}
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                    Photographic Inspection Records
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeComplaint.imageUrl && (
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <img
                          src={activeComplaint.imageUrl}
                          alt="Reported Issue Photo"
                          className="w-full h-44 object-cover"
                        />
                        <div className="p-2 text-xs font-medium text-slate-600 bg-white border-t border-slate-200">
                          Initial Citizen Evidence
                        </div>
                      </div>
                    )}
                    {activeComplaint.resolutionImageUrl && (
                      <div className="border border-emerald-200 rounded-lg overflow-hidden bg-emerald-50">
                        <img
                          src={activeComplaint.resolutionImageUrl}
                          alt="Post Repair Inspection"
                          className="w-full h-44 object-cover"
                        />
                        <div className="p-2 text-xs font-medium text-emerald-800 bg-emerald-50 border-t border-emerald-200">
                          Verified Completion Photo
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Assigned Officer / Crew Card */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                    Dispatched Field Unit
                  </h4>
                  {activeComplaint.assignedOfficer ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="text-slate-500">Lead Officer:</div>
                        <div className="font-semibold text-slate-900">
                          {activeComplaint.assignedOfficer.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Badge & Crew:</div>
                        <div className="font-mono text-slate-800">
                          {activeComplaint.assignedOfficer.badge} · {activeComplaint.assignedOfficer.crewUnit}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Dispatch Desk:</div>
                        <div className="font-mono text-slate-800">
                          {activeComplaint.assignedOfficer.phone}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      Grievance is currently queued in triage. A specialized ward crew is being assigned according to priority.
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-xs space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Complainant Details
                  </h4>
                  <div>
                    <span className="text-slate-500">Filed by:</span>{' '}
                    <span className="font-semibold text-slate-900">
                      {activeComplaint.citizenName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact:</span>{' '}
                    <span className="font-mono text-slate-800">
                      {activeComplaint.citizenPhone}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Timestamp:</span>{' '}
                    <span className="font-mono text-slate-800">
                      {new Date(activeComplaint.submittedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Audit Trail Timeline */}
            <div className="p-6 border-t border-slate-200 bg-slate-50/30">
              <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-4">
                Official Redressal Log & Audit Trail
              </h4>

              <div className="space-y-4">
                {activeComplaint.timeline.map((event, index) => (
                  <div key={event.id || index} className="flex gap-3 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                    <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="font-semibold text-slate-900">
                          {event.actor} ({event.role})
                        </span>
                        <span className="font-mono">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-slate-700 leading-relaxed">
                        {event.note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizen Resolution Feedback or Reopen Action */}
            <div className="p-6 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
              {activeComplaint.status === 'resolved' ? (
                activeComplaint.feedback ? (
                  <div className="text-xs text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Citizen Feedback: </span>
                    <span className="font-bold">
                      {activeComplaint.feedback.rating} / 5 Stars
                    </span>
                    {activeComplaint.feedback.comment && (
                      <span className="text-slate-500">
                        — "{activeComplaint.feedback.comment}"
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                      className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Rate Resolution Quality
                    </button>
                    <button
                      onClick={() => setShowReopenForm(!showReopenForm)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Issue Not Resolved? Reopen</span>
                    </button>
                  </div>
                )
              ) : (
                <div className="text-xs text-slate-500">
                  Grievance actively tracked under Municipal Citizen Charter regulations.
                </div>
              )}
            </div>

            {/* Citizen Feedback Form Drawer */}
            {showFeedbackForm && (
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <h5 className="text-sm font-bold text-slate-900 mb-2">
                  Rate Municipal Resolution Service
                </h5>
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= feedbackRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-600 font-mono ml-2">
                    {feedbackRating} of 5 Stars
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share feedback on speed, crew behavior, and quality of repair..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    onAddFeedback(activeComplaint.id, feedbackRating, feedbackComment);
                    setShowFeedbackForm(false);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg cursor-pointer"
                >
                  Submit Citizen Feedback
                </button>
              </div>
            )}

            {/* Reopen Form Drawer */}
            {showReopenForm && (
              <div className="p-6 border-t border-slate-200 bg-amber-50">
                <h5 className="text-sm font-bold text-amber-950 mb-1">
                  Reopen Unresolved Grievance
                </h5>
                <p className="text-xs text-amber-800 mb-3">
                  If the defect was not remediated properly or recurred within 48 hours, state the inspection failure below.
                </p>
                <textarea
                  rows={2}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Reason for reopening (e.g., Pothole reopened after heavy rain)..."
                  className="w-full p-2 text-xs rounded-lg border border-amber-300 bg-white mb-2"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (reopenReason.trim()) {
                        onReopen(activeComplaint.id, reopenReason);
                        setShowReopenForm(false);
                        setReopenReason('');
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-semibold bg-amber-700 text-white rounded-lg cursor-pointer"
                  >
                    Confirm Reopen Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReopenForm(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
