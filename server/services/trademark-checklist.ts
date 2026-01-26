/**
 * Trademark Application Checklist Service
 * Phase 62: Entity-specific trademark checklists
 */

export type EntityType = '508c1a' | 'llc' | 'media' | 'trust';

export interface TrademarkClass {
  classNumber: number;
  name: string;
  description: string;
  recommendedFor: EntityType[];
}

export interface ChecklistItem {
  id: string;
  category: 'pre-application' | 'filing' | 'post-filing' | 'maintenance';
  item: string;
  description: string;
  required: boolean;
  estimatedCost?: number;
}

export interface EntityChecklist {
  entityType: EntityType;
  entityName: string;
  recommendedClasses: number[];
  checklist: ChecklistItem[];
  totalEstimatedCost: number;
  estimatedTimeline: string;
}

export function getTrademarkClasses(): TrademarkClass[] {
  return [
    { classNumber: 35, name: 'Advertising & Business', description: 'Business management', recommendedFor: ['llc', '508c1a'] },
    { classNumber: 36, name: 'Insurance & Financial', description: 'Financial services', recommendedFor: ['508c1a', 'trust'] },
    { classNumber: 41, name: 'Education & Entertainment', description: 'Education, training', recommendedFor: ['508c1a', 'media'] },
    { classNumber: 42, name: 'Scientific & Technology', description: 'Tech services', recommendedFor: ['llc'] },
    { classNumber: 45, name: 'Legal & Social Services', description: 'Legal services', recommendedFor: ['508c1a', 'trust'] }
  ];
}

export function getChecklistForEntity(entityType: EntityType): EntityChecklist {
  const classes = getTrademarkClasses();
  const recommendedClasses = classes.filter(c => c.recommendedFor.includes(entityType)).map(c => c.classNumber);

  const baseChecklist: ChecklistItem[] = [
    { id: 'pre-1', category: 'pre-application', item: 'Trademark Search', description: 'Conduct search', required: true, estimatedCost: 500 },
    { id: 'file-1', category: 'filing', item: 'USPTO Filing', description: 'File application', required: true, estimatedCost: 350 },
    { id: 'maint-1', category: 'maintenance', item: 'Section 8 Declaration', description: 'File between 5th-6th year', required: true, estimatedCost: 225 }
  ];

  const entityNames: Record<EntityType, string> = {
    '508c1a': '508(c)(1)(a) Religious Organization',
    'llc': 'Limited Liability Company',
    'media': 'Media & Publishing Entity',
    'trust': 'Trust Entity'
  };

  const totalCost = baseChecklist.filter(i => i.required).reduce((sum, i) => sum + (i.estimatedCost || 0), 0);

  return {
    entityType,
    entityName: entityNames[entityType],
    recommendedClasses,
    checklist: baseChecklist,
    totalEstimatedCost: totalCost,
    estimatedTimeline: '8-12 months'
  };
}

export function getClassPriority(entityType: EntityType): number[] {
  const priorityMap: Record<EntityType, number[]> = {
    '508c1a': [36, 41, 45, 35],
    'llc': [35, 42, 9, 25],
    'media': [41, 9, 16, 25],
    'trust': [36, 45, 35]
  };
  return priorityMap[entityType];
}
