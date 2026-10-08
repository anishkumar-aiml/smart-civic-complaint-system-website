import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Wrench,
  Download,
  Filter,
  Send,
  RefreshCw,
} from 'lucide-react';
import { Complaint, ComplaintStatus, PriorityLevel, AuditEvent } from '../types';
import { WARDS_DATA } from '../data/initialData';

interface OfficerConsoleProps {
  complaints: Complaint[];
  onUpdateStatus: (
    ticketId: string,
    newStatus: ComplaintStatus,
    officerNote: string,
    crewUnit?: string
  ) => void;
  onSelectTicket: (id: string) => void;
  onResetData: () => void;
}

export const OfficerConsole: React.FC<OfficerConsoleProps> = ({
  complaints,
  onUpdateStatus,
  onSelectTicket,
  onResetData,
}) => {
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    complaints.length > 0 ? complaints[0].id : null
  );

  // Status edit drawer state
  const [editingTicket, setEditingTicket] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('in_progress');
  const [officerNote, setOfficerNote] = useState('');
  const [crewUnit, setCrewUnit] = useState('');

  const filteredTickets = complaints.filter((c) => {
    if (departmentFilter === 'all') return true;
    return c.category === departmentFilter;
  });

  const activeTicket = complaints.find((c) => c.id === selectedTicketId);

  const handleOpenEdit = (ticket: Complaint) => {
    setEditingTicket(ticket);
    setNewStatus(ticket.status);
    setOfficerNote('');
    setCrewUnit(ticket.assignedOfficer?.crewUnit || 'Rapid Remediation Unit 02');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    onUpdateStatus(
      editingTicket.id,
      newStatus,
      officerNote.trim() || `Status updated to ${newStatus.replace('_', ' ').toUpperCase()} by Municipal Dispatch.`,
      crewUnit
    );
    setEditingTicket(null);
  };

  const handleExportCSV = () => {
    const headers = ['Complaint ID', 'Title', 'Category', 'Ward', 'Status', 'Priority', 'Submitted At', 'Upvotes'];
    const rows = complaints.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.ward,
      c.status,
      c.priority,
      c.submittedAt,
      c.upvotes,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `municipal_grievance_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Officer Console Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0" />
          <div>
            <h2 className="text-base font-bold text-amber-950">
              Department Operations & Field Dispatch Console
            </h2>
            <p className="text-xs text-amber-800">
              Municipal Officer Mode is active. You can assign field units, update work orders, and verify resolved citizen grievances.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 text-amber-950 rounded-lg hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onResetData}
            className="px-3 py-1.5 text-xs font-medium text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
            title="Reset to default mock database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Ticket Table & Quick Action Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispatch Queue Table (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header Filter */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active Municipal Work Orders ({filteredTickets.length})
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Dept:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none"
              >
                <option value="all">All Departments</option>
                <option value="roads">Public Works (Roads)</option>
                <option value="sanitation">Waste Management</option>
                <option value="lighting">Street Lighting</option>
                <option value="water">Water & Sewerage</option>
                <option value="traffic">Traffic Operations</option>
                <option value="parks">Parks & Horticulture</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Reference ID</th>
                  <th className="py-2.5 px-3">Issue Title & Ward</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedTicketId === t.id ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {t.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 max-w-xs truncate">
                        {t.title}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate">
                        {t.address}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold capitalize text-slate-800">
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`font-semibold uppercase text-[10px] ${
                          t.priority === 'critical'
                            ? 'text-red-700'
                            : t.priority === 'high'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(t);
                        }}
                        className="px-2.5 py-1 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 cursor-pointer"
                      >
                        Dispatch Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Officer Inspector & Action Box */}
        <div className="space-y-6">
          {editingTicket ? (
            /* Update Modal Form */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Dispatch Action for {editingTicket.id}
              </h3>
              <p className="text-xs text-slate-500 mb-4 truncate">
                {editingTicket.title}
              </p>

              <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Update Workflow Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="under_review">Under Review / Triage</option>
                    <option value="assigned">Field Crew Assigned</option>
                    <option value="in_progress">Work In Progress</option>
                    <option value="resolved">Resolved & Verified</option>
                    <option value="rejected">Rejected (Out of Municipal Scope)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Field Crew Unit
                  </label>
                  <input
                    type="text"
                    value={crewUnit}
                    onChange={(e) => setCrewUnit(e.target.value)}
                    placeholder="e.g. Unit #04 Asphalt Rapid Repair"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Remediation Note
                  </label>
                  <textarea
                    rows={3}
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    placeholder="State actions taken, materials deployed, or expected completion window..."
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTicket(null)}
                    className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    Apply & Log Update
                  </button>
                </div>
              </form>
            </div>
          ) : activeTicket ? (
            /* Selected Ticket Snapshot */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <div className="text-xs font-mono text-slate-500">
                  {activeTicket.id} · {activeTicket.department}
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-1">
                  {activeTicket.title}
                </h3>
              </div>

              {activeTicket.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={activeTicket.imageUrl}
                    alt="Issue Snapshot"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              <div className="space-y-2 text-xs text-slate-700">
                <div>
                  <span className="text-slate-500">Location:</span> {activeTicket.address}
                </div>
                <div>
                  <span className="text-slate-500">Complainant:</span> {activeTicket.citizenName} ({activeTicket.citizenPhone})
                </div>
                <div>
                  <span className="text-slate-500">SLA Expiry:</span>{' '}
                  <span className="font-mono font-semibold">
                    {new Date(activeTicket.expectedResolutionDate).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(activeTicket)}
                  className="w-full py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Update Status & Crew
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTicket(activeTicket.id)}
                  className="py-2 px-3 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg hover:bg-slate-200 cursor-pointer whitespace-nowrap"
                >
                  Citizen View
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a work order from the table to view details.
            </div>
          )}

          {/* Quick Ward Summary Cards */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Ward Readiness Telemetry
            </div>
            <div className="space-y-2 text-xs">
              {WARDS_DATA.slice(0, 3).map((w) => (
                <div key={w.id} className="flex justify-between items-center text-slate-600">
                  <span>{w.name}</span>
                  <span className="font-mono text-slate-900 font-semibold">
                    {w.activeIssues} Open · {w.avgResolutionHours}h SLA
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
