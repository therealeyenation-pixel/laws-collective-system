/**
 * Internship Application Workflow Service
 * Handles public internship applications, skills assessment, and status tracking
 */

// Types
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'interview_scheduled' | 'interview_completed' | 'accepted' | 'rejected' | 'withdrawn';
export type EntityType = 'parent_llc' | 'collective' | 'academy' | 'real_eye_nation';
export type SkillLevel = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface InternshipApplication {
  id: string;
  applicantInfo: ApplicantInfo;
  skillsAssessment: SkillsAssessment;
  entityPreference: EntityPreference;
  status: ApplicationStatus;
  statusHistory: StatusChange[];
  interviewSlots?: InterviewSlot[];
  evaluationNotes?: string;
  recommendedTrack?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  education: {
    level: 'high_school' | 'some_college' | 'associates' | 'bachelors' | 'masters' | 'doctorate';
    field?: string;
    institution?: string;
    graduationYear?: number;
  };
  workExperience: WorkExperience[];
  availability: {
    startDate: string;
    hoursPerWeek: number;
    preferredSchedule: 'morning' | 'afternoon' | 'evening' | 'flexible';
  };
  references: Reference[];
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Reference {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface SkillsAssessment {
  technicalSkills: SkillRating[];
  softSkills: SkillRating[];
  lawsPillarInterests: LAWSPillarInterest[];
  careerGoals: string;
  whyLAWS: string;
  strengthsWeaknesses: {
    strengths: string[];
    weaknesses: string[];
  };
}

export interface SkillRating {
  skill: string;
  level: SkillLevel;
  yearsExperience?: number;
}

export interface LAWSPillarInterest {
  pillar: 'land' | 'air' | 'water' | 'self';
  interestLevel: 1 | 2 | 3 | 4 | 5;
  specificInterests: string[];
}

export interface EntityPreference {
  firstChoice: EntityType;
  secondChoice?: EntityType;
  thirdChoice?: EntityType;
  preferredTracks: string[];
  openToOtherTracks: boolean;
}

export interface StatusChange {
  status: ApplicationStatus;
  changedAt: string;
  changedBy?: string;
  notes?: string;
}

export interface InterviewSlot {
  id: string;
  dateTime: string;
  duration: number; // minutes
  interviewer?: string;
  location: 'virtual' | 'in_person';
  meetingLink?: string;
  confirmed: boolean;
}

// Standard skills for assessment
export const TECHNICAL_SKILLS = [
  'Microsoft Office',
  'Google Workspace',
  'Data Entry',
  'Bookkeeping',
  'Social Media Management',
  'Content Writing',
  'Graphic Design',
  'Video Editing',
  'Web Development',
  'Project Management',
  'Customer Service',
  'Sales',
  'Research',
  'Public Speaking',
  'Event Planning'
];

export const SOFT_SKILLS = [
  'Communication',
  'Teamwork',
  'Problem Solving',
  'Time Management',
  'Leadership',
  'Adaptability',
  'Critical Thinking',
  'Attention to Detail',
  'Organization',
  'Conflict Resolution'
];

// Entity tracks mapping
export const ENTITY_TRACKS: Record<EntityType, string[]> = {
  parent_llc: ['Executive Operations', 'Finance & Accounting', 'Legal & Compliance', 'Business Development'],
  collective: ['Member Services', 'Community Operations', 'Communications', 'Workforce Development'],
  academy: ['Curriculum Development', 'Instruction Support', 'Program Administration', 'Nonprofit Management'],
  real_eye_nation: ['Content Creation', 'Media Production', 'Research & Documentation', 'Digital Marketing']
};

// Generate application ID
export function generateApplicationId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `APP-${timestamp}-${random}`;
}

// Create new application
export function createApplication(applicantInfo: ApplicantInfo): InternshipApplication {
  const now = new Date().toISOString();
  return {
    id: generateApplicationId(),
    applicantInfo,
    skillsAssessment: {
      technicalSkills: [],
      softSkills: [],
      lawsPillarInterests: [],
      careerGoals: '',
      whyLAWS: '',
      strengthsWeaknesses: { strengths: [], weaknesses: [] }
    },
    entityPreference: {
      firstChoice: 'collective',
      preferredTracks: [],
      openToOtherTracks: true
    },
    status: 'draft',
    statusHistory: [{
      status: 'draft',
      changedAt: now,
      notes: 'Application created'
    }],
    createdAt: now,
    updatedAt: now
  };
}

// Update application status
export function updateApplicationStatus(
  application: InternshipApplication,
  newStatus: ApplicationStatus,
  changedBy?: string,
  notes?: string
): InternshipApplication {
  const now = new Date().toISOString();
  return {
    ...application,
    status: newStatus,
    statusHistory: [
      ...application.statusHistory,
      {
        status: newStatus,
        changedAt: now,
        changedBy,
        notes
      }
    ],
    updatedAt: now
  };
}

// Calculate recommended track based on skills assessment
export function calculateRecommendedTrack(assessment: SkillsAssessment): {
  entity: EntityType;
  track: string;
  confidence: number;
  reasoning: string[];
} {
  const reasoning: string[] = [];
  let entityScores: Record<EntityType, number> = {
    parent_llc: 0,
    collective: 0,
    academy: 0,
    real_eye_nation: 0
  };

  // Score based on technical skills
  assessment.technicalSkills.forEach(skill => {
    const level = skill.level === 'expert' ? 4 : skill.level === 'advanced' ? 3 : skill.level === 'intermediate' ? 2 : skill.level === 'beginner' ? 1 : 0;
    
    if (['Bookkeeping', 'Data Entry', 'Microsoft Office'].includes(skill.skill)) {
      entityScores.parent_llc += level;
    }
    if (['Customer Service', 'Event Planning', 'Public Speaking'].includes(skill.skill)) {
      entityScores.collective += level;
    }
    if (['Content Writing', 'Research', 'Project Management'].includes(skill.skill)) {
      entityScores.academy += level;
    }
    if (['Video Editing', 'Graphic Design', 'Social Media Management', 'Web Development'].includes(skill.skill)) {
      entityScores.real_eye_nation += level;
    }
  });

  // Score based on L.A.W.S. pillar interests
  assessment.lawsPillarInterests.forEach(interest => {
    if (interest.pillar === 'land') {
      entityScores.parent_llc += interest.interestLevel;
      reasoning.push(`Strong interest in LAND pillar suggests business/finance focus`);
    }
    if (interest.pillar === 'air') {
      entityScores.academy += interest.interestLevel;
      reasoning.push(`Strong interest in AIR pillar suggests education focus`);
    }
    if (interest.pillar === 'water') {
      entityScores.collective += interest.interestLevel;
      reasoning.push(`Strong interest in WATER pillar suggests community focus`);
    }
    if (interest.pillar === 'self') {
      entityScores.real_eye_nation += interest.interestLevel;
      reasoning.push(`Strong interest in SELF pillar suggests creative/media focus`);
    }
  });

  // Find highest scoring entity
  let maxScore = 0;
  let recommendedEntity: EntityType = 'collective';
  Object.entries(entityScores).forEach(([entity, score]) => {
    if (score > maxScore) {
      maxScore = score;
      recommendedEntity = entity as EntityType;
    }
  });

  // Calculate confidence (0-100)
  const totalScore = Object.values(entityScores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? Math.round((maxScore / totalScore) * 100) : 25;

  // Determine track within entity based on skills
  const tracks = ENTITY_TRACKS[recommendedEntity];
  let recommendedTrack = tracks[0];

  // Simple track selection based on top skills
  const topSkills = assessment.technicalSkills
    .filter(s => s.level === 'advanced' || s.level === 'expert')
    .map(s => s.skill);

  if (recommendedEntity === 'parent_llc') {
    if (topSkills.includes('Bookkeeping')) recommendedTrack = 'Finance & Accounting';
    else if (topSkills.includes('Sales')) recommendedTrack = 'Business Development';
  } else if (recommendedEntity === 'collective') {
    if (topSkills.includes('Customer Service')) recommendedTrack = 'Member Services';
    else if (topSkills.includes('Event Planning')) recommendedTrack = 'Community Operations';
  } else if (recommendedEntity === 'academy') {
    if (topSkills.includes('Content Writing')) recommendedTrack = 'Curriculum Development';
    else if (topSkills.includes('Public Speaking')) recommendedTrack = 'Instruction Support';
  } else if (recommendedEntity === 'real_eye_nation') {
    if (topSkills.includes('Video Editing')) recommendedTrack = 'Media Production';
    else if (topSkills.includes('Social Media Management')) recommendedTrack = 'Digital Marketing';
  }

  return {
    entity: recommendedEntity,
    track: recommendedTrack,
    confidence,
    reasoning
  };
}

// Generate interview slots
export function generateInterviewSlots(
  startDate: Date,
  daysAhead: number = 7,
  slotsPerDay: number = 4
): InterviewSlot[] {
  const slots: InterviewSlot[] = [];
  const times = ['09:00', '11:00', '14:00', '16:00'];

  for (let d = 0; d < daysAhead; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (let t = 0; t < Math.min(slotsPerDay, times.length); t++) {
      const [hours, minutes] = times[t].split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      slots.push({
        id: `SLOT-${Date.now()}-${d}-${t}`,
        dateTime: date.toISOString(),
        duration: 30,
        location: 'virtual',
        confirmed: false
      });
    }
  }

  return slots;
}

// Validate application completeness
export function validateApplication(application: InternshipApplication): {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
} {
  const missingFields: string[] = [];
  let completedFields = 0;
  const totalFields = 10;

  // Check applicant info
  if (!application.applicantInfo.firstName) missingFields.push('First Name');
  else completedFields++;
  
  if (!application.applicantInfo.lastName) missingFields.push('Last Name');
  else completedFields++;
  
  if (!application.applicantInfo.email) missingFields.push('Email');
  else completedFields++;
  
  if (!application.applicantInfo.phone) missingFields.push('Phone');
  else completedFields++;

  // Check skills assessment
  if (application.skillsAssessment.technicalSkills.length === 0) missingFields.push('Technical Skills');
  else completedFields++;
  
  if (application.skillsAssessment.softSkills.length === 0) missingFields.push('Soft Skills');
  else completedFields++;
  
  if (!application.skillsAssessment.careerGoals) missingFields.push('Career Goals');
  else completedFields++;
  
  if (!application.skillsAssessment.whyLAWS) missingFields.push('Why L.A.W.S.');
  else completedFields++;

  // Check entity preference
  if (!application.entityPreference.firstChoice) missingFields.push('Entity Preference');
  else completedFields++;
  
  if (application.entityPreference.preferredTracks.length === 0) missingFields.push('Preferred Tracks');
  else completedFields++;

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage: Math.round((completedFields / totalFields) * 100)
  };
}

// Get application status display info
export function getStatusDisplayInfo(status: ApplicationStatus): {
  label: string;
  color: string;
  description: string;
  nextSteps: string[];
} {
  const statusInfo: Record<ApplicationStatus, { label: string; color: string; description: string; nextSteps: string[] }> = {
    draft: {
      label: 'Draft',
      color: 'gray',
      description: 'Application in progress',
      nextSteps: ['Complete all required fields', 'Review your responses', 'Submit application']
    },
    submitted: {
      label: 'Submitted',
      color: 'blue',
      description: 'Application received and pending review',
      nextSteps: ['Wait for review', 'Check email for updates', 'Prepare for potential interview']
    },
    under_review: {
      label: 'Under Review',
      color: 'yellow',
      description: 'Application is being evaluated',
      nextSteps: ['Wait for decision', 'Be available for follow-up questions']
    },
    interview_scheduled: {
      label: 'Interview Scheduled',
      color: 'purple',
      description: 'Interview has been scheduled',
      nextSteps: ['Confirm interview time', 'Prepare for interview', 'Research L.A.W.S. pillars']
    },
    interview_completed: {
      label: 'Interview Completed',
      color: 'indigo',
      description: 'Interview completed, awaiting decision',
      nextSteps: ['Wait for final decision', 'Send thank you note']
    },
    accepted: {
      label: 'Accepted',
      color: 'green',
      description: 'Congratulations! You have been accepted',
      nextSteps: ['Complete onboarding paperwork', 'Review internship agreement', 'Prepare for start date']
    },
    rejected: {
      label: 'Not Selected',
      color: 'red',
      description: 'Application was not selected at this time',
      nextSteps: ['Review feedback if provided', 'Consider reapplying in the future', 'Explore other opportunities']
    },
    withdrawn: {
      label: 'Withdrawn',
      color: 'gray',
      description: 'Application has been withdrawn',
      nextSteps: ['Contact us if you wish to reapply']
    }
  };

  return statusInfo[status];
}

// Generate application summary for review
export function generateApplicationSummary(application: InternshipApplication): string {
  const { applicantInfo, skillsAssessment, entityPreference } = application;
  const recommendation = calculateRecommendedTrack(skillsAssessment);
  const validation = validateApplication(application);

  return `
INTERNSHIP APPLICATION SUMMARY
==============================
Application ID: ${application.id}
Status: ${application.status.toUpperCase()}
Completion: ${validation.completionPercentage}%

APPLICANT INFORMATION
--------------------
Name: ${applicantInfo.firstName} ${applicantInfo.lastName}
Email: ${applicantInfo.email}
Phone: ${applicantInfo.phone}
Education: ${applicantInfo.education.level}${applicantInfo.education.field ? ` in ${applicantInfo.education.field}` : ''}
Availability: ${applicantInfo.availability.hoursPerWeek} hours/week, starting ${applicantInfo.availability.startDate}

SKILLS ASSESSMENT
-----------------
Technical Skills: ${skillsAssessment.technicalSkills.map(s => `${s.skill} (${s.level})`).join(', ') || 'Not provided'}
Soft Skills: ${skillsAssessment.softSkills.map(s => `${s.skill} (${s.level})`).join(', ') || 'Not provided'}

L.A.W.S. Pillar Interests:
${skillsAssessment.lawsPillarInterests.map(p => `  - ${p.pillar.toUpperCase()}: ${p.interestLevel}/5`).join('\n') || '  Not provided'}

Career Goals: ${skillsAssessment.careerGoals || 'Not provided'}

ENTITY PREFERENCE
-----------------
First Choice: ${entityPreference.firstChoice}
Preferred Tracks: ${entityPreference.preferredTracks.join(', ') || 'Not specified'}
Open to Other Tracks: ${entityPreference.openToOtherTracks ? 'Yes' : 'No'}

RECOMMENDATION
--------------
Recommended Entity: ${recommendation.entity}
Recommended Track: ${recommendation.track}
Confidence: ${recommendation.confidence}%
Reasoning:
${recommendation.reasoning.map(r => `  - ${r}`).join('\n')}

APPLICATION HISTORY
-------------------
${application.statusHistory.map(h => `${h.changedAt}: ${h.status}${h.notes ? ` - ${h.notes}` : ''}`).join('\n')}
`.trim();
}
