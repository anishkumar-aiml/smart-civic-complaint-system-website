import React from 'react';
import { Phone, ShieldAlert, Flame, Droplets, Zap, X } from 'lucide-react';

interface EmergencyHotlinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HOTLINES = [
  {
    name: 'Unified Police Emergency',
    number: '911 / 100',
    desc: 'Imminent danger, violent disturbance, accidents',
    icon: ShieldAlert,
    color: 'text-red-600 bg-red-50',
  },
  {
    name: 'Municipal Fire & Rescue',
    number: '101',
    desc: 'Fire hazards, building collapse, hazardous chemical spills',
    icon: Flame,
    color: 'text-orange-600 bg-orange-50',
  },
  {
    name: 'Water Main Burst & Flooding Desk',
    number: '1916',
    desc: 'Major pipe ruptures, sewage backflow, open manholes',
    icon: Droplets,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    name: 'Electric Hazard & High Voltage Lines',
    number: '1912',
    desc: 'Fallen live wires, sparking transformers, substation smoke',
    icon: Zap,
    color: 'text-amber-600 bg-amber-50',
  },
  {
    name: 'Solid Waste & Sanitation Toll-Free',
    number: '1913',
    desc: 'Dead animal removal, bio-waste dump cleanup',
    icon: Phone,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    name: 'Citizen 311 Grievance Support Desk',
    number: '+1 (555) 019-3110',
    desc: 'General inquiry, portal help, telephone grievance intake',
    icon: Phone,
    color: 'text-slate-700 bg-slate-100',
  },
];

export const EmergencyHotlinesModal: React.FC<EmergencyHotlinesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              City Emergency & Municipal Helplines
            </h3>
            <p className="text-xs text-slate-500">
              24/7 dedicated response channels for urgent hazards
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
          {HOTLINES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="py-3 flex items-start gap-3">
                <div className={`p-2 rounded-lg ${item.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                    <a
                      href={`tel:${item.number.replace(/[^0-9+]/g, '')}`}
                      className="font-mono font-bold text-xs text-blue-700 hover:underline"
                    >
                      {item.number}
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
