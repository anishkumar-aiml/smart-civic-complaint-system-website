export type ComplaintCategory =
  | 'roads'
  | 'sanitation'
  | 'lighting'
  | 'water'
  | 'traffic'
  | 'parks'
  | 'safety';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AuditEvent {
  id: string;
  timestamp: string;
  status: ComplaintStatus;
  actor: string;
  role: 'Citizen' | 'Dispatch Officer' | 'Field Inspector' | 'Department Head' | 'Automated System';
  note: string;
  attachmentUrl?: string;
}

export interface Complaint {
  id: string; // e.g. "CC-2026-4821"
  title: string;
  description: string;
  category: ComplaintCategory;
  department: string;
  ward: string;
  zone: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  landmark?: string;
  imageUrl?: string;
  resolutionImageUrl?: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  submittedAt: string;
  updatedAt: string;
  expectedResolutionDate: string;
  resolvedAt?: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail?: string;
  isAnonymous: boolean;
  assignedOfficer?: {
    name: string;
    badge: string;
    crewUnit: string;
    phone: string;
  };
  upvotes: number;
  hasUpvoted?: boolean;
  timeline: AuditEvent[];
  feedback?: {
    rating: number; // 1-5
    comment?: string;
    submittedAt: string;
  };
}

export interface WardInfo {
  id: string;
  name: string;
  zone: string;
  officerInCharge: string;
  contact: string;
  activeIssues: number;
  resolvedThisMonth: number;
  avgResolutionHours: number;
}
