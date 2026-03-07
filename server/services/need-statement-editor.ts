/**
 * Need Statement Editor Service
 * Phase 53: Admin interface for customizing entity need statements
 * 
 * Provides CRUD operations, version history, and approval workflows
 * for managing need statements without code changes.
 */

import {
  REAL_EYE_NATION_NEED_STATEMENT,
  LAWS_COLLECTIVE_NEED_STATEMENT,
  LUVONPURPOSE_AWS_NEED_STATEMENT,
  LUVONPURPOSE_ACADEMY_NEED_STATEMENT
} from './need-statements';

export interface NeedStatementDraft {
  id: string;
  entityId: string;
  entityName: string;
  entityType: string;
  content: string;
  wordCount: number;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  version: number;
}

export interface NeedStatementVersion {
  id: string;
  entityId: string;
  content: string;
  wordCount: number;
  version: number;
  createdAt: string;
  createdBy: string;
  changeDescription: string;
  isActive: boolean;
}

export interface NeedStatementTemplate {
  id: string;
  name: string;
  description: string;
  sections: Array<{
    title: string;
    placeholder: string;
    minWords: number;
    maxWords: number;
  }>;
}

// In-memory storage for drafts and versions
const drafts: Map<string, NeedStatementDraft> = new Map();
const versions: Map<string, NeedStatementVersion[]> = new Map();
let draftIdCounter = 1;
let versionIdCounter = 1;

// Entity metadata
const ENTITY_METADATA: Record<string, { name: string; type: string; defaultStatement: string }> = {
  'realeyenation': {
    name: 'Real-Eye-Nation LLC',
    type: 'LLC',
    defaultStatement: REAL_EYE_NATION_NEED_STATEMENT,
  },
  'laws': {
    name: 'The L.A.W.S. Collective, LLC',
    type: 'LLC',
    defaultStatement: LAWS_COLLECTIVE_NEED_STATEMENT,
  },
  'luvonpurpose': {
    name: 'LuvOnPurpose Autonomous Wealth System LLC',
    type: 'LLC',
    defaultStatement: LUVONPURPOSE_AWS_NEED_STATEMENT,
  },
  '508academy': {
    name: 'LuvOnPurpose Outreach Temple and Academy Society, Inc.',
    type: '508(c)(1)(a)',
    defaultStatement: LUVONPURPOSE_ACADEMY_NEED_STATEMENT,
  },
};

// Initialize versions from default statements
function initializeVersions() {
  Object.entries(ENTITY_METADATA).forEach(([entityId, metadata]) => {
    if (!versions.has(entityId)) {
      const version: NeedStatementVersion = {
        id: `v_${versionIdCounter++}`,
        entityId,
        content: metadata.defaultStatement,
        wordCount: metadata.defaultStatement.split(/\s+/).length,
        version: 1,
        createdAt: '2026-01-26T00:00:00Z',
        createdBy: 'system',
        changeDescription: 'Initial version',
        isActive: true,
      };
      versions.set(entityId, [version]);
    }
  });
}

// Initialize on module load
initializeVersions();

/**
 * Get all entities available for editing
 */
export function getEditableEntities(): Array<{
  entityId: string;
  entityName: string;
  entityType: string;
  currentVersion: number;
  hasDraft: boolean;
  lastUpdated: string;
}> {
  return Object.entries(ENTITY_METADATA).map(([entityId, metadata]) => {
    const entityVersions = versions.get(entityId) || [];
    const activeVersion = entityVersions.find(v => v.isActive);
    const entityDrafts = Array.from(drafts.values()).filter(d => d.entityId === entityId);
    const hasDraft = entityDrafts.some(d => d.status === 'draft' || d.status === 'pending_review');

    return {
      entityId,
      entityName: metadata.name,
      entityType: metadata.type,
      currentVersion: activeVersion?.version || 1,
      hasDraft,
      lastUpdated: activeVersion?.createdAt || '2026-01-26T00:00:00Z',
    };
  });
}

/**
 * Get current active statement for an entity
 */
export function getCurrentStatement(entityId: string): {
  entityId: string;
  entityName: string;
  entityType: string;
  content: string;
  wordCount: number;
  version: number;
  lastUpdated: string;
} | null {
  const metadata = ENTITY_METADATA[entityId];
  if (!metadata) return null;

  const entityVersions = versions.get(entityId) || [];
  const activeVersion = entityVersions.find(v => v.isActive);

  if (!activeVersion) {
    return {
      entityId,
      entityName: metadata.name,
      entityType: metadata.type,
      content: metadata.defaultStatement,
      wordCount: metadata.defaultStatement.split(/\s+/).length,
      version: 1,
      lastUpdated: '2026-01-26T00:00:00Z',
    };
  }

  return {
    entityId,
    entityName: metadata.name,
    entityType: metadata.type,
    content: activeVersion.content,
    wordCount: activeVersion.wordCount,
    version: activeVersion.version,
    lastUpdated: activeVersion.createdAt,
  };
}

/**
 * Create a new draft for editing
 */
export function createDraft(
  entityId: string,
  content: string,
  createdBy: string
): NeedStatementDraft | null {
  const metadata = ENTITY_METADATA[entityId];
  if (!metadata) return null;

  const entityVersions = versions.get(entityId) || [];
  const activeVersion = entityVersions.find(v => v.isActive);
  const currentVersion = activeVersion?.version || 1;

  const draft: NeedStatementDraft = {
    id: `draft_${draftIdCounter++}`,
    entityId,
    entityName: metadata.name,
    entityType: metadata.type,
    content,
    wordCount: content.split(/\s+/).length,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy,
    version: currentVersion + 1,
  };

  drafts.set(draft.id, draft);
  return draft;
}

/**
 * Update an existing draft
 */
export function updateDraft(
  draftId: string,
  content: string
): NeedStatementDraft | null {
  const draft = drafts.get(draftId);
  if (!draft) return null;

  if (draft.status !== 'draft') {
    return null; // Can only update drafts in 'draft' status
  }

  draft.content = content;
  draft.wordCount = content.split(/\s+/).length;
  draft.updatedAt = new Date().toISOString();

  return draft;
}

/**
 * Get a specific draft
 */
export function getDraft(draftId: string): NeedStatementDraft | null {
  return drafts.get(draftId) || null;
}

/**
 * Get all drafts for an entity
 */
export function getDraftsForEntity(entityId: string): NeedStatementDraft[] {
  return Array.from(drafts.values())
    .filter(d => d.entityId === entityId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Get all drafts pending review
 */
export function getPendingDrafts(): NeedStatementDraft[] {
  return Array.from(drafts.values())
    .filter(d => d.status === 'pending_review')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Submit draft for review
 */
export function submitForReview(draftId: string): NeedStatementDraft | null {
  const draft = drafts.get(draftId);
  if (!draft || draft.status !== 'draft') return null;

  draft.status = 'pending_review';
  draft.updatedAt = new Date().toISOString();

  return draft;
}

/**
 * Approve a draft and create new version
 */
export function approveDraft(
  draftId: string,
  reviewedBy: string,
  reviewNotes?: string
): { draft: NeedStatementDraft; version: NeedStatementVersion } | null {
  const draft = drafts.get(draftId);
  if (!draft || draft.status !== 'pending_review') return null;

  // Update draft status
  draft.status = 'approved';
  draft.reviewedBy = reviewedBy;
  draft.reviewedAt = new Date().toISOString();
  draft.reviewNotes = reviewNotes;
  draft.updatedAt = new Date().toISOString();

  // Deactivate current active version
  const entityVersions = versions.get(draft.entityId) || [];
  entityVersions.forEach(v => {
    v.isActive = false;
  });

  // Create new version
  const newVersion: NeedStatementVersion = {
    id: `v_${versionIdCounter++}`,
    entityId: draft.entityId,
    content: draft.content,
    wordCount: draft.wordCount,
    version: draft.version,
    createdAt: new Date().toISOString(),
    createdBy: draft.createdBy,
    changeDescription: reviewNotes || 'Updated via editor',
    isActive: true,
  };

  entityVersions.push(newVersion);
  versions.set(draft.entityId, entityVersions);

  return { draft, version: newVersion };
}

/**
 * Reject a draft
 */
export function rejectDraft(
  draftId: string,
  reviewedBy: string,
  reviewNotes: string
): NeedStatementDraft | null {
  const draft = drafts.get(draftId);
  if (!draft || draft.status !== 'pending_review') return null;

  draft.status = 'rejected';
  draft.reviewedBy = reviewedBy;
  draft.reviewedAt = new Date().toISOString();
  draft.reviewNotes = reviewNotes;
  draft.updatedAt = new Date().toISOString();

  return draft;
}

/**
 * Delete a draft
 */
export function deleteDraft(draftId: string): boolean {
  const draft = drafts.get(draftId);
  if (!draft) return false;

  // Can only delete drafts in 'draft' or 'rejected' status
  if (draft.status !== 'draft' && draft.status !== 'rejected') {
    return false;
  }

  return drafts.delete(draftId);
}

/**
 * Get version history for an entity
 */
export function getVersionHistory(entityId: string): NeedStatementVersion[] {
  const entityVersions = versions.get(entityId) || [];
  return [...entityVersions].sort((a, b) => b.version - a.version);
}

/**
 * Get a specific version
 */
export function getVersion(entityId: string, versionNumber: number): NeedStatementVersion | null {
  const entityVersions = versions.get(entityId) || [];
  return entityVersions.find(v => v.version === versionNumber) || null;
}

/**
 * Revert to a previous version
 */
export function revertToVersion(
  entityId: string,
  versionNumber: number,
  revertedBy: string
): NeedStatementVersion | null {
  const entityVersions = versions.get(entityId) || [];
  const targetVersion = entityVersions.find(v => v.version === versionNumber);
  
  if (!targetVersion) return null;

  // Deactivate all versions
  entityVersions.forEach(v => {
    v.isActive = false;
  });

  // Create new version with reverted content
  const currentMaxVersion = Math.max(...entityVersions.map(v => v.version));
  const newVersion: NeedStatementVersion = {
    id: `v_${versionIdCounter++}`,
    entityId,
    content: targetVersion.content,
    wordCount: targetVersion.wordCount,
    version: currentMaxVersion + 1,
    createdAt: new Date().toISOString(),
    createdBy: revertedBy,
    changeDescription: `Reverted to version ${versionNumber}`,
    isActive: true,
  };

  entityVersions.push(newVersion);
  versions.set(entityId, entityVersions);

  return newVersion;
}

/**
 * Compare two versions
 */
export function compareVersions(
  entityId: string,
  version1: number,
  version2: number
): {
  version1: NeedStatementVersion;
  version2: NeedStatementVersion;
  wordCountDiff: number;
  characterDiff: number;
} | null {
  const entityVersions = versions.get(entityId) || [];
  const v1 = entityVersions.find(v => v.version === version1);
  const v2 = entityVersions.find(v => v.version === version2);

  if (!v1 || !v2) return null;

  return {
    version1: v1,
    version2: v2,
    wordCountDiff: v2.wordCount - v1.wordCount,
    characterDiff: v2.content.length - v1.content.length,
  };
}

/**
 * Get need statement templates
 */
export function getTemplates(): NeedStatementTemplate[] {
  return [
    {
      id: 'standard_nonprofit',
      name: 'Standard Nonprofit',
      description: 'A comprehensive template for 501(c)(3) and 508(c)(1)(a) organizations',
      sections: [
        {
          title: 'Problem Statement',
          placeholder: 'Describe the problem your organization addresses...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Target Population',
          placeholder: 'Describe who you serve and their specific needs...',
          minWords: 75,
          maxWords: 125,
        },
        {
          title: 'Solution & Approach',
          placeholder: 'Explain your unique approach to solving the problem...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Funding Request',
          placeholder: 'Detail how funding will be used and expected outcomes...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Impact & Sustainability',
          placeholder: 'Describe expected impact and long-term sustainability...',
          minWords: 75,
          maxWords: 125,
        },
      ],
    },
    {
      id: 'llc_business',
      name: 'LLC Business Entity',
      description: 'Template for for-profit LLCs seeking grants or impact investment',
      sections: [
        {
          title: 'Market Need',
          placeholder: 'Describe the market gap your business addresses...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Business Model',
          placeholder: 'Explain how your business creates value and generates revenue...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Social Impact',
          placeholder: 'Detail the social or community impact of your work...',
          minWords: 75,
          maxWords: 125,
        },
        {
          title: 'Growth Strategy',
          placeholder: 'Describe your scaling plans and funding utilization...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Track Record',
          placeholder: 'Highlight achievements, metrics, and proof of concept...',
          minWords: 75,
          maxWords: 125,
        },
      ],
    },
    {
      id: 'media_production',
      name: 'Media & Content Production',
      description: 'Template for media companies and content creators',
      sections: [
        {
          title: 'Content Gap',
          placeholder: 'Describe the representation or content gap you address...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Target Audience',
          placeholder: 'Define your audience and their content needs...',
          minWords: 75,
          maxWords: 125,
        },
        {
          title: 'Production Plan',
          placeholder: 'Detail your content creation approach and distribution...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Budget & Timeline',
          placeholder: 'Outline funding allocation and production schedule...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Reach & Impact',
          placeholder: 'Project audience reach and measurable impact...',
          minWords: 75,
          maxWords: 125,
        },
      ],
    },
    {
      id: 'education_program',
      name: 'Education & Training Program',
      description: 'Template for educational institutions and training programs',
      sections: [
        {
          title: 'Educational Need',
          placeholder: 'Describe the educational gap or training need...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Curriculum Overview',
          placeholder: 'Outline your educational approach and curriculum...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Student Population',
          placeholder: 'Define your target students and their backgrounds...',
          minWords: 75,
          maxWords: 125,
        },
        {
          title: 'Program Resources',
          placeholder: 'Detail funding needs for facilities, staff, and materials...',
          minWords: 100,
          maxWords: 150,
        },
        {
          title: 'Outcomes & Assessment',
          placeholder: 'Describe expected outcomes and how you measure success...',
          minWords: 75,
          maxWords: 125,
        },
      ],
    },
  ];
}

/**
 * Generate statement from template
 */
export function generateFromTemplate(
  templateId: string,
  sectionContent: Record<string, string>
): string {
  const template = getTemplates().find(t => t.id === templateId);
  if (!template) return '';

  const parts: string[] = [];
  template.sections.forEach(section => {
    const content = sectionContent[section.title];
    if (content) {
      parts.push(content);
    }
  });

  return parts.join('\n\n');
}

/**
 * Validate statement content
 */
export function validateStatement(content: string): {
  isValid: boolean;
  wordCount: number;
  issues: string[];
  suggestions: string[];
} {
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check minimum word count
  if (wordCount < 300) {
    issues.push(`Statement is too short (${wordCount} words). Minimum recommended is 300 words.`);
  }

  // Check maximum word count
  if (wordCount > 750) {
    issues.push(`Statement is too long (${wordCount} words). Maximum recommended is 750 words.`);
  }

  // Check for key sections
  const contentLower = content.toLowerCase();
  
  if (!contentLower.includes('need') && !contentLower.includes('problem') && !contentLower.includes('challenge')) {
    suggestions.push('Consider adding a clear problem or need statement.');
  }

  if (!contentLower.includes('funding') && !contentLower.includes('support') && !contentLower.includes('investment')) {
    suggestions.push('Consider explicitly mentioning funding needs and amounts.');
  }

  if (!contentLower.includes('impact') && !contentLower.includes('outcome') && !contentLower.includes('result')) {
    suggestions.push('Consider describing expected impact and outcomes.');
  }

  if (!contentLower.includes('community') && !contentLower.includes('population') && !contentLower.includes('serve')) {
    suggestions.push('Consider describing your target population or community.');
  }

  // Check for statistics or data
  const hasNumbers = /\d+%|\$[\d,]+|\d+,\d+/.test(content);
  if (!hasNumbers) {
    suggestions.push('Consider adding statistics or data to strengthen your case.');
  }

  return {
    isValid: issues.length === 0,
    wordCount,
    issues,
    suggestions,
  };
}

/**
 * Get editor statistics
 */
export function getEditorStatistics(): {
  totalEntities: number;
  totalVersions: number;
  pendingDrafts: number;
  approvedDrafts: number;
  rejectedDrafts: number;
  averageWordCount: number;
  recentActivity: Array<{
    type: 'draft_created' | 'draft_submitted' | 'draft_approved' | 'draft_rejected' | 'version_created';
    entityId: string;
    entityName: string;
    timestamp: string;
    user: string;
  }>;
} {
  const allDrafts = Array.from(drafts.values());
  const allVersions = Array.from(versions.values()).flat();

  const totalWordCount = allVersions
    .filter(v => v.isActive)
    .reduce((sum, v) => sum + v.wordCount, 0);

  const activeVersionCount = allVersions.filter(v => v.isActive).length;

  // Build recent activity
  const activity: Array<{
    type: 'draft_created' | 'draft_submitted' | 'draft_approved' | 'draft_rejected' | 'version_created';
    entityId: string;
    entityName: string;
    timestamp: string;
    user: string;
  }> = [];

  allDrafts.forEach(draft => {
    const metadata = ENTITY_METADATA[draft.entityId];
    activity.push({
      type: draft.status === 'approved' ? 'draft_approved' :
            draft.status === 'rejected' ? 'draft_rejected' :
            draft.status === 'pending_review' ? 'draft_submitted' : 'draft_created',
      entityId: draft.entityId,
      entityName: metadata?.name || draft.entityId,
      timestamp: draft.updatedAt,
      user: draft.status === 'approved' || draft.status === 'rejected' 
        ? draft.reviewedBy || draft.createdBy 
        : draft.createdBy,
    });
  });

  // Sort by timestamp descending
  activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    totalEntities: Object.keys(ENTITY_METADATA).length,
    totalVersions: allVersions.length,
    pendingDrafts: allDrafts.filter(d => d.status === 'pending_review').length,
    approvedDrafts: allDrafts.filter(d => d.status === 'approved').length,
    rejectedDrafts: allDrafts.filter(d => d.status === 'rejected').length,
    averageWordCount: activeVersionCount > 0 ? Math.round(totalWordCount / activeVersionCount) : 0,
    recentActivity: activity.slice(0, 10),
  };
}
