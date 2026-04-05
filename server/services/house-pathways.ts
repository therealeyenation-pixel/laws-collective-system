/**
 * House Pathways Service
 * Phase 74: Multiple pathways to House membership
 */

export type PathwayType = 'employee_to_contractor' | 'external_partner' | 'business_first' | 'community_member';
export type PathwayStatus = 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected';

export interface HousePathway {
  pathwayId: string;
  type: PathwayType;
  applicantId: string;
  applicantName: string;
  status: PathwayStatus;
  startedAt: Date;
  completedAt?: Date;
  requirements: PathwayRequirement[];
  currentStep: number;
  notes: string[];
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface PathwayRequirement {
  requirementId: string;
  name: string;
  description: string;
  category: 'training' | 'tenure' | 'documentation' | 'vetting' | 'business' | 'participation';
  isCompleted: boolean;
  completedAt?: Date;
  evidence?: string;
  verifiedBy?: string;
}

export interface EmployeeToContractorPathway extends HousePathway {
  type: 'employee_to_contractor';
  employeeId: string;
  hireDate: Date;
  tenureMonths: number;
  performanceRating: number;
  trainingCompleted: string[];
  contractorReadyDate?: Date;
}

export interface ExternalPartnerPathway extends HousePathway {
  type: 'external_partner';
  partnerOrganization?: string;
  referredBy?: string;
  vettingScore: number;
  backgroundCheckPassed: boolean;
  interviewDate?: Date;
  interviewNotes?: string;
}

export interface BusinessFirstPathway extends HousePathway {
  type: 'business_first';
  businessName: string;
  businessType: string;
  yearsInOperation: number;
  annualRevenue: number;
  employeeCount: number;
  affiliationType: 'full' | 'associate' | 'partner';
}

export interface CommunityMemberPathway extends HousePathway {
  type: 'community_member';
  communityRole: string;
  participationMonths: number;
  eventsAttended: number;
  contributionScore: number;
  sponsoredBy?: string;
}

const PATHWAY_REQUIREMENTS: Record<PathwayType, Omit<PathwayRequirement, 'requirementId' | 'isCompleted'>[]> = {
  employee_to_contractor: [
    { name: '24-Month Tenure', description: 'Complete 24 months as W-2 employee', category: 'tenure' },
    { name: 'Performance Review', description: 'Achieve satisfactory performance rating', category: 'documentation' },
    { name: 'Contractor Training', description: 'Complete contractor transition training', category: 'training' },
    { name: 'Business Formation', description: 'Form LLC or business entity', category: 'business' },
    { name: 'Insurance Verification', description: 'Obtain required business insurance', category: 'documentation' },
    { name: 'Tax Compliance', description: 'Complete tax compliance training', category: 'training' }
  ],
  external_partner: [
    { name: 'Application Submission', description: 'Submit complete partner application', category: 'documentation' },
    { name: 'Background Check', description: 'Pass background verification', category: 'vetting' },
    { name: 'Reference Check', description: 'Provide and verify 3 professional references', category: 'vetting' },
    { name: 'Interview', description: 'Complete partner interview process', category: 'vetting' },
    { name: 'Values Alignment Training', description: 'Complete L.A.W.S. values training', category: 'training' },
    { name: 'Probationary Period', description: 'Complete 6-month probationary period', category: 'tenure' }
  ],
  business_first: [
    { name: 'Business Verification', description: 'Verify existing business operations', category: 'business' },
    { name: 'Financial Review', description: 'Submit 2 years financial statements', category: 'documentation' },
    { name: 'Legal Compliance', description: 'Verify business licenses and compliance', category: 'documentation' },
    { name: 'Affiliation Agreement', description: 'Sign trust affiliation agreement', category: 'documentation' },
    { name: 'Integration Training', description: 'Complete system integration training', category: 'training' },
    { name: 'Revenue Sharing Setup', description: 'Configure revenue sharing arrangement', category: 'business' }
  ],
  community_member: [
    { name: 'Community Participation', description: 'Active participation for 12 months', category: 'participation' },
    { name: 'Event Attendance', description: 'Attend minimum 6 community events', category: 'participation' },
    { name: 'L.A.W.S. Training', description: 'Complete all 4 L.A.W.S. modules', category: 'training' },
    { name: 'Sponsor Endorsement', description: 'Obtain endorsement from existing member', category: 'vetting' },
    { name: 'Contribution Assessment', description: 'Demonstrate community contributions', category: 'participation' },
    { name: 'Membership Application', description: 'Submit formal membership application', category: 'documentation' }
  ]
};

export function createPathway(
  type: PathwayType,
  applicantId: string,
  applicantName: string
): HousePathway {
  const requirements = PATHWAY_REQUIREMENTS[type].map((req, idx) => ({
    ...req,
    requirementId: `req-${Date.now()}-${idx}`,
    isCompleted: false
  }));

  return {
    pathwayId: `pathway-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    applicantId,
    applicantName,
    status: 'not_started',
    startedAt: new Date(),
    requirements,
    currentStep: 0,
    notes: []
  };
}

export function startPathway(pathway: HousePathway): HousePathway {
  return {
    ...pathway,
    status: 'in_progress',
    currentStep: 1
  };
}

export function completeRequirement(
  pathway: HousePathway,
  requirementId: string,
  evidence?: string,
  verifiedBy?: string
): HousePathway {
  const updatedRequirements = pathway.requirements.map(req => {
    if (req.requirementId === requirementId) {
      return {
        ...req,
        isCompleted: true,
        completedAt: new Date(),
        evidence,
        verifiedBy
      };
    }
    return req;
  });

  const completedCount = updatedRequirements.filter(r => r.isCompleted).length;

  return {
    ...pathway,
    requirements: updatedRequirements,
    currentStep: completedCount
  };
}

export function checkPathwayProgress(pathway: HousePathway): {
  completedCount: number;
  totalCount: number;
  percentComplete: number;
  nextRequirement?: PathwayRequirement;
  isReadyForReview: boolean;
} {
  const completedCount = pathway.requirements.filter(r => r.isCompleted).length;
  const totalCount = pathway.requirements.length;
  const nextRequirement = pathway.requirements.find(r => !r.isCompleted);
  const isReadyForReview = completedCount === totalCount;

  return {
    completedCount,
    totalCount,
    percentComplete: Math.round((completedCount / totalCount) * 100),
    nextRequirement,
    isReadyForReview
  };
}

export function submitForReview(pathway: HousePathway): HousePathway {
  const progress = checkPathwayProgress(pathway);
  if (!progress.isReadyForReview) {
    throw new Error('All requirements must be completed before submitting for review');
  }

  return {
    ...pathway,
    status: 'pending_review'
  };
}

export function reviewPathway(
  pathway: HousePathway,
  approved: boolean,
  reviewerId: string,
  notes?: string
): HousePathway {
  const updatedNotes = notes ? [...pathway.notes, `Review: ${notes}`] : pathway.notes;

  return {
    ...pathway,
    status: approved ? 'approved' : 'rejected',
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
    completedAt: approved ? new Date() : undefined,
    notes: updatedNotes
  };
}

export function addNote(pathway: HousePathway, note: string): HousePathway {
  return {
    ...pathway,
    notes: [...pathway.notes, `${new Date().toISOString()}: ${note}`]
  };
}

export function getPathwayDescription(type: PathwayType): {
  name: string;
  description: string;
  duration: string;
  benefits: string[];
} {
  const descriptions: Record<PathwayType, ReturnType<typeof getPathwayDescription>> = {
    employee_to_contractor: {
      name: 'Employee to Contractor Transition',
      description: 'For current W-2 employees ready to transition to independent contractor status',
      duration: '24+ months tenure required',
      benefits: [
        'Higher earning potential',
        'Business ownership opportunity',
        'Tax advantages',
        'Path to House membership',
        'Continued system access'
      ]
    },
    external_partner: {
      name: 'External Partner Pathway',
      description: 'For professionals outside the organization seeking partnership',
      duration: '6-12 months vetting process',
      benefits: [
        'Access to community network',
        'Business development opportunities',
        'Training and resources',
        'Revenue sharing participation',
        'House membership eligibility'
      ]
    },
    business_first: {
      name: 'Business-First Affiliation',
      description: 'For existing business owners seeking trust affiliation',
      duration: '3-6 months integration',
      benefits: [
        'Retain full business ownership',
        'Access to collective resources',
        'Shared services and support',
        'Community customer base',
        'Legacy planning support'
      ]
    },
    community_member: {
      name: 'Community Member Pathway',
      description: 'For active community participants seeking formal membership',
      duration: '12+ months participation',
      benefits: [
        'Full member benefits',
        'Voting rights',
        'House formation eligibility',
        'Training access',
        'Network participation'
      ]
    }
  };

  return descriptions[type];
}

export function createEmployeeToContractorPathway(
  applicantId: string,
  applicantName: string,
  employeeId: string,
  hireDate: Date,
  performanceRating: number
): EmployeeToContractorPathway {
  const base = createPathway('employee_to_contractor', applicantId, applicantName);
  const tenureMonths = Math.floor((Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  return {
    ...base,
    type: 'employee_to_contractor',
    employeeId,
    hireDate,
    tenureMonths,
    performanceRating,
    trainingCompleted: []
  };
}

export function createExternalPartnerPathway(
  applicantId: string,
  applicantName: string,
  referredBy?: string,
  partnerOrganization?: string
): ExternalPartnerPathway {
  const base = createPathway('external_partner', applicantId, applicantName);

  return {
    ...base,
    type: 'external_partner',
    partnerOrganization,
    referredBy,
    vettingScore: 0,
    backgroundCheckPassed: false
  };
}

export function createBusinessFirstPathway(
  applicantId: string,
  applicantName: string,
  businessName: string,
  businessType: string,
  yearsInOperation: number,
  annualRevenue: number,
  employeeCount: number
): BusinessFirstPathway {
  const base = createPathway('business_first', applicantId, applicantName);

  return {
    ...base,
    type: 'business_first',
    businessName,
    businessType,
    yearsInOperation,
    annualRevenue,
    employeeCount,
    affiliationType: 'associate'
  };
}

export function createCommunityMemberPathway(
  applicantId: string,
  applicantName: string,
  communityRole: string,
  sponsoredBy?: string
): CommunityMemberPathway {
  const base = createPathway('community_member', applicantId, applicantName);

  return {
    ...base,
    type: 'community_member',
    communityRole,
    participationMonths: 0,
    eventsAttended: 0,
    contributionScore: 0,
    sponsoredBy
  };
}

export function generatePathwayReport(pathway: HousePathway): string {
  const progress = checkPathwayProgress(pathway);
  const description = getPathwayDescription(pathway.type);

  return `
HOUSE PATHWAY PROGRESS REPORT
=============================

Applicant: ${pathway.applicantName}
Pathway: ${description.name}
Status: ${pathway.status.toUpperCase().replace('_', ' ')}
Started: ${pathway.startedAt.toLocaleDateString()}
${pathway.completedAt ? `Completed: ${pathway.completedAt.toLocaleDateString()}` : ''}

PROGRESS
--------
${progress.completedCount}/${progress.totalCount} requirements completed (${progress.percentComplete}%)

REQUIREMENTS STATUS
-------------------
${pathway.requirements.map((req, idx) => 
  `${idx + 1}. [${req.isCompleted ? 'X' : ' '}] ${req.name}${req.completedAt ? ` - Completed ${req.completedAt.toLocaleDateString()}` : ''}`
).join('\n')}

${progress.nextRequirement ? `
NEXT STEP
---------
${progress.nextRequirement.name}: ${progress.nextRequirement.description}
` : ''}

NOTES
-----
${pathway.notes.length > 0 ? pathway.notes.join('\n') : 'No notes recorded'}

${pathway.reviewedBy ? `
REVIEW
------
Reviewed by: ${pathway.reviewedBy}
Date: ${pathway.reviewedAt?.toLocaleDateString()}
Result: ${pathway.status.toUpperCase()}
` : ''}
`;
}

export const housePathways = {
  createPathway,
  startPathway,
  completeRequirement,
  checkPathwayProgress,
  submitForReview,
  reviewPathway,
  addNote,
  getPathwayDescription,
  createEmployeeToContractorPathway,
  createExternalPartnerPathway,
  createBusinessFirstPathway,
  createCommunityMemberPathway,
  generatePathwayReport
};
