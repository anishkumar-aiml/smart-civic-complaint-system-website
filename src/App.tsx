import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, AuditEvent } from './types';
import {
  getStoredComplaints,
  saveComplaints,
  getVotedIds,
  saveVotedIds,
  resetToDefaultComplaints,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintTracker } from './components/ComplaintTracker';
import { CivicMap } from './components/CivicMap';
import { CommunityFeed } from './components/CommunityFeed';
import { OfficerConsole } from './components/OfficerConsole';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { EmergencyHotlinesModal } from './components/EmergencyHotlinesModal';
import { ReceiptModal } from './components/ReceiptModal';
import {
  Shield,
  FileCheck,
  Building2,
  PhoneCall,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'report' | 'track' | 'map' | 'feed' | 'officer' | 'analytics'>('report');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [preselectedCategory, setPreselectedCategory] = useState<ComplaintCategory>('roads');
  const [officerMode, setOfficerMode] = useState<boolean>(false);
  const [isHelplineOpen, setIsHelplineOpen] = useState<boolean>(false);
  const [receiptComplaint, setReceiptComplaint] = useState<Complaint | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loaded = getStoredComplaints();
    const loadedVotes = getVotedIds();
    setVotedIds(loadedVotes);

    // Sync upvoted flags
    const synced = loaded.map((c) => ({
      ...c,
      hasUpvoted: loadedVotes.has(c.id),
    }));
    setComplaints(synced);

    if (synced.length > 0 && !activeTicketId) {
      setActiveTicketId(synced[0].id);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Upvote an issue
  const handleUpvote = (id: string) => {
    const updatedVotes = new Set(votedIds);
    let delta = 1;

    if (updatedVotes.has(id)) {
      updatedVotes.delete(id);
      delta = -1;
    } else {
      updatedVotes.add(id);
    }

    setVotedIds(updatedVotes);
    saveVotedIds(updatedVotes);

    const updated = complaints.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          upvotes: Math.max(0, c.upvotes + delta),
          hasUpvoted: updatedVotes.has(id),
        };
      }
      return c;
    });

    setComplaints(updated);
    saveComplaints(updated);
    showToast(delta > 0 ? 'Your voice has been added to this community grievance.' : 'Removed vote.');
  };

  // Submit new complaint
  const handleComplaintSubmitted = (newComplaint: Complaint) => {
    const updated = [newComplaint, ...complaints];
    setComplaints(updated);
    saveComplaints(updated);
    setActiveTicketId(newComplaint.id);
    setReceiptComplaint(newComplaint);
    setIsReceiptOpen(true);
    showToast(`Grievance ${newComplaint.id} registered successfully.`);
  };

  // Track ticket directly from Hero search or links
  const handleSelectTicket = (ticketId: string) => {
    setActiveTicketId(ticketId);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Officer updates status
  const handleUpdateStatus = (
    ticketId: string,
    nextStatus: ComplaintStatus,
    note: string,
    crew?: string
  ) => {
    const now = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === ticketId) {
        const newEvent: AuditEvent = {
          id: `ev-${Date.now()}`,
          timestamp: now,
          status: nextStatus,
          actor: 'Municipal Dispatch Command',
          role: 'Dispatch Officer',
          note: note,
        };

        const assignedOfficer = crew
          ? {
              name: c.assignedOfficer?.name || 'Duty Inspector',
              badge: c.assignedOfficer?.badge || 'MUN-100',
              crewUnit: crew,
              phone: c.assignedOfficer?.phone || '+1 (555) 301-4000',
            }
          : c.assignedOfficer;

        return {
          ...c,
          status: nextStatus,
          updatedAt: now,
          resolvedAt: nextStatus === 'resolved' ? now : c.resolvedAt,
          assignedOfficer,
          timeline: [...c.timeline, newEvent],
        };
      }
      return c;
    });

    setComplaints(updated);
    saveComplaints(updated);
    showToast(`Work order ${ticketId} status updated to ${nextStatus.replace('_', ' ').toUpperCase()}.`);
  };

  // Citizen adds feedback
  const handleAddFeedback = (ticketId: string, rating: number, comment: string) => {
    const updated = complaints.map((c) => {
      if (c.id === ticketId) {
        return {
          ...c,
          feedback: {
            rating,
            comment,
            submittedAt: new Date().toISOString(),
          },
        };
      }
      return c;
    });
    setComplaints(updated);
    saveComplaints(updated);
    showToast('Thank you for rating municipal service performance.');
  };

  // Citizen reopens grievance
  const handleReopen = (ticketId: string, reason: string) => {
    const now = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === ticketId) {
        const reopenEvent: AuditEvent = {
          id: `ev-reopen-${Date.now()}`,
          timestamp: now,
          status: 'under_review',
          actor: c.citizenName,
          role: 'Citizen',
          note: `Citizen requested grievance reopening: ${reason}`,
        };
        return {
          ...c,
          status: 'under_review' as ComplaintStatus,
          updatedAt: now,
          resolvedAt: undefined,
          timeline: [...c.timeline, reopenEvent],
        };
      }
      return c;
    });
    setComplaints(updated);
    saveComplaints(updated);
    showToast('Grievance has been reopened and prioritized for review.');
  };

  // Reset demo data
  const handleResetData = () => {
    const defaults = resetToDefaultComplaints();
    setComplaints(defaults);
    setVotedIds(new Set());
    if (defaults.length > 0) setActiveTicketId(defaults[0].id);
    showToast('Reset sample database to default records.');
  };

  const totalResolved = complaints.filter((c) => c.status === 'resolved').length;
  const totalActive = complaints.filter((c) => c.status !== 'resolved' && c.status !== 'rejected').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-2">
          <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHelpline={() => setIsHelplineOpen(true)}
        officerMode={officerMode}
        setOfficerMode={setOfficerMode}
      />

      {/* Hero Banner with Quick Search */}
      {activeTab !== 'officer' && (
        <Hero
          onSearchTicket={handleSelectTicket}
          onSelectCategory={(cat) => {
            setPreselectedCategory(cat as ComplaintCategory);
            setActiveTab('report');
          }}
          totalResolved={totalResolved}
          totalActive={totalActive}
        />
      )}

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {activeTab === 'report' && (
          <ComplaintForm
            onComplaintSubmitted={handleComplaintSubmitted}
            preselectedCategory={preselectedCategory}
          />
        )}

        {activeTab === 'track' && (
          <ComplaintTracker
            complaints={complaints}
            activeTicketId={activeTicketId}
            onSelectTicket={(id) => setActiveTicketId(id)}
            onUpvote={handleUpvote}
            onAddFeedback={handleAddFeedback}
            onReopen={handleReopen}
            onViewReceipt={(comp) => {
              setReceiptComplaint(comp);
              setIsReceiptOpen(true);
            }}
          />
        )}

        {activeTab === 'map' && (
          <CivicMap
            complaints={complaints}
            onSelectTicket={handleSelectTicket}
            onUpvote={handleUpvote}
          />
        )}

        {activeTab === 'feed' && (
          <CommunityFeed
            complaints={complaints}
            onSelectTicket={handleSelectTicket}
            onUpvote={handleUpvote}
          />
        )}

        {activeTab === 'officer' && (
          <OfficerConsole
            complaints={complaints}
            onUpdateStatus={handleUpdateStatus}
            onSelectTicket={handleSelectTicket}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard complaints={complaints} />
        )}
      </main>

      {/* Modals */}
      <EmergencyHotlinesModal
        isOpen={isHelplineOpen}
        onClose={() => setIsHelplineOpen(false)}
      />

      <ReceiptModal
        complaint={receiptComplaint}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onTrackNow={(id) => {
          setActiveTicketId(id);
          setActiveTab('track');
        }}
      />

      {/* Municipal Authority Footer adhering to Zero-Pill rules */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            <div>
              <div className="text-white font-bold text-base mb-2">
                CivicPulse Metroville
              </div>
              <p className="text-slate-400 leading-relaxed">
                Centralized Public Grievance Redressal and Municipal Operations Management Portal. Powered by the Citizens Charter Act.
              </p>
            </div>

            <div>
              <div className="text-white font-semibold mb-2">
                Core Service Portals
              </div>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('report')} className="hover:text-white cursor-pointer">
                    Report Public Hazard
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('track')} className="hover:text-white cursor-pointer">
                    Track Grievance SLA
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('map')} className="hover:text-white cursor-pointer">
                    Spatial Ward GIS Map
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('analytics')} className="hover:text-white cursor-pointer">
                    Transparency Metrics
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-white font-semibold mb-2">
                Municipal Departments
              </div>
              <ul className="space-y-1.5 text-slate-400">
                <li>Public Works (Roads & Bridges)</li>
                <li>Solid Waste Management & Sanitation</li>
                <li>Electrical Grid & Public Lighting</li>
                <li>Metro Water Supply & Drainage</li>
                <li>Traffic Safety Operations</li>
              </ul>
            </div>

            <div>
              <div className="text-white font-semibold mb-2">
                Emergency & Support
              </div>
              <p className="text-slate-400 leading-relaxed mb-2">
                Citizen 311 Support: <strong>+1 (555) 019-3110</strong>
                <br />
                Toll Free Grievance Desk: <strong>1913</strong>
                <br />
                Operating Hours: 24/7/365
              </p>
              <button
                onClick={() => setIsHelplineOpen(true)}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                View all municipal emergency numbers →
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-3">
            <div>
              © 2026 Greater Metro Municipal Corporation. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Citizens Charter 2026</span>
              <span aria-hidden="true">·</span>
              <span>Open Data Compliance</span>
              <span aria-hidden="true">·</span>
              <span>WCAG AA Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
