import React, { useState } from 'react';
import {
  Upload,
  Sparkles,
  MapPin,
  CheckCircle,
  AlertCircle,
  FileText,
  Camera,
  Navigation,
  Info,
  Clock,
} from 'lucide-react';
import { Complaint, ComplaintCategory, PriorityLevel } from '../types';
import { WARDS_DATA } from '../data/initialData';
import {
  generateComplaintId,
  calculateExpectedSLA,
  getCategoryDepartment,
} from '../utils/storage';
import { analyzeGrievanceHeuristics } from '../utils/aiTriage';
import potholeImg from '../assets/images/civic_pothole_inspection_1791478623058.jpg';
import sanitationImg from '../assets/images/civic_sanitation_clean_1791478637196.jpg';
import streetlightImg from '../assets/images/civic_streetlight_repair_1791478648820.jpg';

interface ComplaintFormProps {
  onComplaintSubmitted: (complaint: Complaint) => void;
  preselectedCategory?: ComplaintCategory;
}

const CATEGORIES: {
  id: ComplaintCategory;
  name: string;
  desc: string;
  sla: string;
}[] = [
  {
    id: 'roads',
    name: 'Roads & Pavements',
    desc: 'Potholes, broken curbs, open trenches',
    sla: '48h SLA',
  },
  {
    id: 'sanitation',
    name: 'Waste & Sanitation',
    desc: 'Overflowing bins, uncollected trash, dumping',
    sla: '24h SLA',
  },
  {
    id: 'lighting',
    name: 'Street Lighting & Power',
    desc: 'Dark streets, damaged lamp poles, loose wires',
    sla: '24h SLA',
  },
  {
    id: 'water',
    name: 'Water & Sewerage',
    desc: 'Pipeline bursts, dirty water, drain blockages',
    sla: '14h SLA',
  },
  {
    id: 'traffic',
    name: 'Traffic & Signals',
    desc: 'Malfunctioning signals, blocked corridors',
    sla: '8h SLA',
  },
  {
    id: 'parks',
    name: 'Parks & Trees',
    desc: 'Dangerous fallen branches, broken playground equipment',
    sla: '36h SLA',
  },
  {
    id: 'safety',
    name: 'Public Safety',
    desc: 'Stray animal packs, open construction pits',
    sla: '12h SLA',
  },
];

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  onComplaintSubmitted,
  preselectedCategory,
}) => {
  const [category, setCategory] = useState<ComplaintCategory>(
    preselectedCategory || 'roads'
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState('ward-04');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Citizen details
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // AI Assistant state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Coordinate state
  const [coordinates, setCoordinates] = useState({ lat: 34.0522, lng: -118.2437 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiAutoTriage = () => {
    if (!description.trim()) {
      setValidationError('Please enter a brief description first for AI to analyze.');
      return;
    }
    setValidationError(null);
    setIsAnalyzing(true);

    setTimeout(() => {
      const triage = analyzeGrievanceHeuristics(description, title);
      setCategory(triage.category);
      setPriority(triage.priority);
      if (!title.trim() && triage.suggestedTitle) {
        setTitle(triage.suggestedTitle);
      }
      setAiNote(
        `AI Triage complete: Routed to ${triage.department} at ${triage.priority.toUpperCase()} priority (${triage.reasoning})`
      );
      setIsAnalyzing(false);
    }, 600);
  };

  const handleFetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setValidationError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        });
        if (!address) {
          setAddress(`Geo-tagged location: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°W`);
        }
        setGeoLocating(false);
      },
      () => {
        // Fallback default coordinates
        setCoordinates({ lat: 34.0537, lng: -118.2427 });
        setAddress('Central Ward 04 Sector — Geo Estimated');
        setGeoLocating(false);
      },
      { timeout: 7000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Please provide a brief title for the issue.');
      return;
    }
    if (!description.trim() || description.length < 15) {
      setValidationError('Please provide a descriptive explanation (at least 15 characters).');
      return;
    }
    if (!address.trim()) {
      setValidationError('Please specify the location or street address.');
      return;
    }
    if (!isAnonymous && (!citizenName.trim() || !citizenPhone.trim())) {
      setValidationError('Please provide your name & phone number for official SMS updates, or check "Report Anonymously".');
      return;
    }

    const newId = generateComplaintId();
    const now = new Date().toISOString();
    const selectedWardObj = WARDS_DATA.find((w) => w.id === ward);

    const newComplaint: Complaint = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      category,
      department: getCategoryDepartment(category),
      ward,
      zone: selectedWardObj?.zone || 'Central Zone',
      address: address.trim(),
      landmark: landmark.trim() || undefined,
      coordinates,
      imageUrl: imagePreview || undefined,
      status: 'submitted',
      priority,
      submittedAt: now,
      updatedAt: now,
      expectedResolutionDate: calculateExpectedSLA(category, priority),
      citizenName: isAnonymous ? 'Anonymous Citizen' : citizenName.trim(),
      citizenPhone: isAnonymous ? 'Hidden (Anonymous)' : citizenPhone.trim(),
      citizenEmail: isAnonymous ? undefined : citizenEmail.trim(),
      isAnonymous,
      upvotes: 1,
      hasUpvoted: true,
      timeline: [
        {
          id: `ev-${Date.now()}`,
          timestamp: now,
          status: 'submitted',
          actor: isAnonymous ? 'Anonymous Citizen' : citizenName.trim(),
          role: 'Citizen',
          note: `Grievance registered under ${getCategoryDepartment(category)}. Assigned SLA reference ${newId}.`,
        },
      ],
    };

    onComplaintSubmitted(newComplaint);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="border-b border-slate-200 pb-5 mb-6">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            City Service Form 311-A
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Lodge a Civic Grievance
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Submit public infrastructure defects, sanitation hazards, or utility outages directly to the responsible municipal department.
          </p>
        </div>

        {validationError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              1. Select Civic Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 text-left rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm leading-snug">
                        {cat.name}
                      </div>
                      <div
                        className={`text-xs mt-1 leading-snug ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {cat.desc}
                      </div>
                    </div>
                    <div
                      className={`text-xs font-mono mt-2 pt-2 border-t ${
                        isSelected
                          ? 'border-slate-700 text-slate-300'
                          : 'border-slate-100 text-slate-500'
                      }`}
                    >
                      {cat.sla}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Issue Details with AI Triage Assistant */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900">
                2. Issue Description & Details <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAiAutoTriage}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAnalyzing ? 'Analyzing...' : 'AI Auto-Detect Category & Urgency'}</span>
              </button>
            </div>

            {aiNote && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{aiNote}</div>
              </div>
            )}

            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary (e.g. Hazardous pothole opposite Central Library)"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                maxLength={120}
              />
            </div>

            <div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details: estimated dimensions, how long the issue has persisted, danger to pedestrians or vehicles..."
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
              <div className="text-xs text-slate-500 mt-1 flex justify-between">
                <span>Minimum 15 characters</span>
                <span className="font-mono">{description.length} chars</span>
              </div>
            </div>
          </div>

          {/* 3. Location & Ward */}
          <div className="space-y-4 pt-2">
            <label className="block text-sm font-semibold text-slate-900">
              3. Incident Location & Ward <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Municipal Ward / District
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {WARDS_DATA.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nearby Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Post Office, Gate 3"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Street Address or Junction <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 142 Riverbank Road, Corner of 4th Street"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={handleFetchCurrentLocation}
                  disabled={geoLocating}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  title="Tag current GPS coordinates"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">
                    {geoLocating ? 'Locating...' : 'Use My GPS'}
                  </span>
                </button>
              </div>
              <div className="mt-1 text-xs font-mono text-slate-500">
                Coords: {coordinates.lat}° N, {coordinates.lng}° W
              </div>
            </div>
          </div>

          {/* 4. Photo Evidence & Attachments */}
          <div className="space-y-3 pt-2">
            <label className="block text-sm font-semibold text-slate-900">
              4. Photographic Evidence (Recommended)
            </label>
            <p className="text-xs text-slate-500">
              Visual evidence increases dispatch speed and helps crew verify repair completion.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <label className="border-2 border-dashed border-slate-300 rounded-lg p-5 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-medium text-slate-700">
                  Upload photo from device
                </span>
                <span className="text-xs text-slate-400 mt-0.5">
                  PNG, JPG or WEBP up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Sample Photo Presets for quick testing */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Or select sample field photo:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setImagePreview(potholeImg)}
                    className="group border border-slate-200 rounded overflow-hidden text-left bg-white hover:border-slate-400 cursor-pointer"
                  >
                    <img
                      src={potholeImg}
                      alt="Sample Road Crater"
                      className="w-full h-14 object-cover"
                    />
                    <div className="p-1 text-[10px] text-slate-600 truncate font-medium">
                      Road Damage
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImagePreview(sanitationImg)}
                    className="group border border-slate-200 rounded overflow-hidden text-left bg-white hover:border-slate-400 cursor-pointer"
                  >
                    <img
                      src={sanitationImg}
                      alt="Sample Waste Overflow"
                      className="w-full h-14 object-cover"
                    />
                    <div className="p-1 text-[10px] text-slate-600 truncate font-medium">
                      Waste Bins
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImagePreview(streetlightImg)}
                    className="group border border-slate-200 rounded overflow-hidden text-left bg-white hover:border-slate-400 cursor-pointer"
                  >
                    <img
                      src={streetlightImg}
                      alt="Sample Streetlight"
                      className="w-full h-14 object-cover"
                    />
                    <div className="p-1 text-[10px] text-slate-600 truncate font-medium">
                      Streetlight
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {imagePreview && (
              <div className="relative inline-block mt-2">
                <img
                  src={imagePreview}
                  alt="Evidence Preview"
                  className="w-48 h-32 object-cover rounded-lg border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-full p-1 text-xs hover:bg-black cursor-pointer"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* 5. Urgency Level */}
          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              5. Perceived Severity & Urgency
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                  priority === 'low'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Routine / Low
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                  priority === 'medium'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Standard / Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                  priority === 'high'
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Urgent Hazard / High
              </button>
            </div>
          </div>

          {/* 6. Citizen Contact Information */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900">
                6. Complainant Contact Information
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span>File Anonymously (Hide Name & Phone)</span>
              </label>
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Jessica Taylor"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mobile Phone (For SMS Tracking) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submission CTA */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              By submitting, your grievance is entered into the Municipal SLA system. An SMS reference code will be generated immediately.
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Submit Grievance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
