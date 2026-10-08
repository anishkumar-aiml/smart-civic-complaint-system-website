import { Complaint, AuditEvent, ComplaintStatus, PriorityLevel } from '../types';
import { INITIAL_COMPLAINTS } from '../data/initialData';

const STORAGE_KEY = 'civicpulse_complaints_v1';
const VOTED_KEY = 'civicpulse_voted_ids_v1';

export function getStoredComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading from localStorage:', err);
    return INITIAL_COMPLAINTS;
  }
}

export function saveComplaints(complaints: Complaint[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  } catch (err) {
    console.error('Error saving complaints:', err);
  }
}

export function resetToDefaultComplaints(): Complaint[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
  localStorage.removeItem(VOTED_KEY);
  return INITIAL_COMPLAINTS;
}

export function getVotedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    if (!raw) return new Set<string>();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set<string>();
  }
}

export function saveVotedIds(votedIds: Set<string>): void {
  try {
    localStorage.setItem(VOTED_KEY, JSON.stringify(Array.from(votedIds)));
  } catch (err) {
    console.error('Error saving voted IDs:', err);
  }
}

export function generateComplaintId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CC-${year}-${randomNum}`;
}

export function calculateExpectedSLA(category: string, priority: PriorityLevel): string {
  const now = new Date();
  let hours = 48; // default 48h

  if (category === 'traffic') hours = 8;
  else if (category === 'water') hours = 14;
  else if (category === 'sanitation') hours = 24;
  else if (category === 'lighting') hours = 24;
  else if (category === 'roads') hours = 48;
  else if (category === 'parks') hours = 36;
  else if (category === 'safety') hours = 12;

  if (priority === 'critical') hours = Math.max(4, Math.floor(hours * 0.3));
  else if (priority === 'high') hours = Math.floor(hours * 0.6);

  now.setHours(now.getHours() + hours);
  return now.toISOString();
}

export function getCategoryDepartment(category: string): string {
  switch (category) {
    case 'roads':
      return 'Public Works (Roads & Bridges)';
    case 'sanitation':
      return 'Solid Waste Management & Sanitation';
    case 'lighting':
      return 'Electrical Engineering & Street Lighting';
    case 'water':
      return 'Water Supply & Sewerage Board';
    case 'traffic':
      return 'Traffic Operations & Road Safety';
    case 'parks':
      return 'Parks, Recreation & Horticulture';
    case 'safety':
      return 'Municipal Safety & Public Health';
    default:
      return 'Municipal General Administration';
  }
}
