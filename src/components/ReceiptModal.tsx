import React, { useState } from 'react';
import { X, Printer, Copy, Check, QrCode, ShieldCheck, ArrowRight } from 'lucide-react';
import { Complaint } from '../types';

interface ReceiptModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackNow: (id: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onTrackNow,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !complaint) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(complaint.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Receipt Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-900" />
            <span className="font-bold text-sm text-slate-900">
              Official Grievance Registration Receipt
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body printable */}
        <div className="p-6 space-y-5 bg-white font-sans text-xs" id="printable-receipt">
          {/* Municipal Watermark Banner */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <div className="font-bold text-sm uppercase tracking-widest text-slate-900">
              City of Metroville Municipal Corporation
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Central Civic Redressal & Citizen Charter Portal
            </div>
            <div className="mt-3 inline-block bg-slate-900 text-white font-mono font-bold text-base px-4 py-1.5 rounded tracking-wider">
              {complaint.id}
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-3 text-slate-700">
            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase">
                Citizen Name
              </span>
              <span className="font-semibold text-slate-900">{complaint.citizenName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase">
                Contact Phone
              </span>
              <span className="font-mono text-slate-900">{complaint.citizenPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase">
                Filing Date & Time
              </span>
              <span className="font-mono text-slate-900">
                {new Date(complaint.submittedAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase">
                SLA Mandated Deadline
              </span>
              <span className="font-mono font-bold text-slate-900">
                {new Date(complaint.expectedResolutionDate).toLocaleString()}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">
                Assigned Department
              </span>
              <span className="font-semibold text-slate-900">{complaint.department}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">
                Location
              </span>
              <span className="text-slate-900">{complaint.address}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">
                Subject
              </span>
              <span className="text-slate-900 font-medium">{complaint.title}</span>
            </div>
          </div>

          {/* Verification Stamp Notice */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            Please retain this Reference ID for status inquiries or SMS follow-up. You can track remediation progress anytime at <strong className="font-mono">civicpulse.metroville.gov</strong>.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleCopyId}
              className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
          </div>

          <button
            onClick={() => {
              onTrackNow(complaint.id);
              onClose();
            }}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Track Grievance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
