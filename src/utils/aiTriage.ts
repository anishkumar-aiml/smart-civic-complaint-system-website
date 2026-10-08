import { ComplaintCategory, PriorityLevel } from '../types';
import { getCategoryDepartment } from './storage';

export interface TriageResult {
  category: ComplaintCategory;
  department: string;
  priority: PriorityLevel;
  confidence: number;
  reasoning: string;
  suggestedTitle: string;
  extractedKeywords: string[];
}

export function analyzeGrievanceHeuristics(description: string, title: string = ''): TriageResult {
  const combined = (title + ' ' + description).toLowerCase();

  let category: ComplaintCategory = 'roads';
  let priority: PriorityLevel = 'medium';
  let reasoning = 'Routine public works issue identified.';
  let keywords: string[] = [];

  // Keywords tests
  if (
    combined.includes('pipe') ||
    combined.includes('water') ||
    combined.includes('leak') ||
    combined.includes('flood') ||
    combined.includes('drain') ||
    combined.includes('sewage') ||
    combined.includes('overflowing water') ||
    combined.includes('manhole')
  ) {
    category = 'water';
    keywords = ['Water Infrastructure', 'Hydraulic', 'Subsurface Pipe'];
    if (combined.includes('burst') || combined.includes('flooding') || combined.includes('gushing') || combined.includes('contamination')) {
      priority = 'critical';
      reasoning = 'High risk of water supply contamination or property flooding detected.';
    } else {
      priority = 'high';
      reasoning = 'Water loss or drainage obstruction requires prompt municipal attention.';
    }
  } else if (
    combined.includes('light') ||
    combined.includes('dark') ||
    combined.includes('lamp') ||
    combined.includes('bulb') ||
    combined.includes('electric') ||
    combined.includes('pole') ||
    combined.includes('wire') ||
    combined.includes('spark')
  ) {
    category = 'lighting';
    keywords = ['Public Illumination', 'Electrical Grid', 'Luminaire'];
    if (combined.includes('spark') || combined.includes('fallen wire') || combined.includes('shock') || combined.includes('danger')) {
      priority = 'critical';
      reasoning = 'Potential electrical hazard or live wire exposure detected.';
    } else if (combined.includes('entire street') || combined.includes('block') || combined.includes('pitch dark')) {
      priority = 'high';
      reasoning = 'Multi-pole blackout compromises pedestrian and vehicular night safety.';
    } else {
      priority = 'medium';
      reasoning = 'Single street fixture malfunction reported.';
    }
  } else if (
    combined.includes('garbage') ||
    combined.includes('trash') ||
    combined.includes('waste') ||
    combined.includes('dump') ||
    combined.includes('bin') ||
    combined.includes('smell') ||
    combined.includes('odor') ||
    combined.includes('cleanliness') ||
    combined.includes('litter')
  ) {
    category = 'sanitation';
    keywords = ['Solid Waste', 'Sanitation', 'Public Hygiene'];
    if (combined.includes('biohazard') || combined.includes('hospital') || combined.includes('carcass') || combined.includes('toxic')) {
      priority = 'critical';
      reasoning = 'Biological or hazardous waste accumulation in public area.';
    } else if (combined.includes('overflow') || combined.includes('infestation') || combined.includes('days')) {
      priority = 'high';
      reasoning = 'Sanitation overflow poses public health and pest nuisance.';
    } else {
      priority = 'medium';
      reasoning = 'Scheduled sanitation sweep or bin replacement required.';
    }
  } else if (
    combined.includes('signal') ||
    combined.includes('traffic') ||
    combined.includes('junction') ||
    combined.includes('accident') ||
    combined.includes('congestion') ||
    combined.includes('red light') ||
    combined.includes('speed') ||
    combined.includes('signboard')
  ) {
    category = 'traffic';
    keywords = ['Traffic Control', 'Road Safety', 'Signal Electronics'];
    if (combined.includes('jam') || combined.includes('permanent red') || combined.includes('blind') || combined.includes('head-on')) {
      priority = 'critical';
      reasoning = 'Traffic flow failure posing imminent collision danger.';
    } else {
      priority = 'high';
      reasoning = 'Traffic regulatory equipment repair needed.';
    }
  } else if (
    combined.includes('park') ||
    combined.includes('tree') ||
    combined.includes('branch') ||
    combined.includes('playground') ||
    combined.includes('swing') ||
    combined.includes('bench') ||
    combined.includes('grass')
  ) {
    category = 'parks';
    keywords = ['Urban Greenery', 'Recreational Equipment', 'Public Park'];
    if (combined.includes('fallen tree') || combined.includes('crush') || combined.includes('broken swing') || combined.includes('children danger')) {
      priority = 'high';
      reasoning = 'Hazardous playground condition or fallen timber in civic recreation zone.';
    } else {
      priority = 'medium';
      reasoning = 'Municipal park grounds maintenance request.';
    }
  } else if (
    combined.includes('dog') ||
    combined.includes('stray') ||
    combined.includes('animal') ||
    combined.includes('bite') ||
    combined.includes('pest') ||
    combined.includes('rabies') ||
    combined.includes('harass') ||
    combined.includes('safety')
  ) {
    category = 'safety';
    keywords = ['Public Safety', 'Animal Control', 'Community Well-being'];
    if (combined.includes('bite') || combined.includes('aggressive') || combined.includes('pack')) {
      priority = 'high';
      reasoning = 'Animal control intervention necessary to protect residents.';
    } else {
      priority = 'medium';
      reasoning = 'Routine civic safety inspection required.';
    }
  } else {
    // default to roads/pothole if asphalt/pothole/crater/sidewalk
    category = 'roads';
    keywords = ['Pavement Repair', 'Road Quality', 'Civil Infrastructure'];
    if (combined.includes('crater') || combined.includes('swerving') || combined.includes('main road') || combined.includes('avenue') || combined.includes('highway')) {
      priority = 'high';
      reasoning = 'High-traffic roadway surface disruption impacting vehicle safety.';
    } else {
      priority = 'medium';
      reasoning = 'Municipal road repair scheduled in regular ward maintenance.';
    }
  }

  // Generate suggested clean civic title
  let suggestedTitle = title.trim();
  if (!suggestedTitle || suggestedTitle.length < 10) {
    const preview = description.slice(0, 50).trim();
    suggestedTitle = `${category.toUpperCase()}: ${preview}...`;
  }

  return {
    category,
    department: getCategoryDepartment(category),
    priority,
    confidence: 0.92,
    reasoning,
    suggestedTitle,
    extractedKeywords: keywords,
  };
}
