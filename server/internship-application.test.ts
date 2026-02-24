import { describe, it, expect } from 'vitest';
import {
  generateApplicationId,
  createApplication,
  updateApplicationStatus,
  calculateRecommendedTrack,
  generateInterviewSlots,
  validateApplication,
  getStatusDisplayInfo,
  generateApplicationSummary,
  TECHNICAL_SKILLS,
  SOFT_SKILLS,
  ENTITY_TRACKS
} from './services/internship-application';

describe('Internship Application Workflow Service', () => {
  const mockApplicantInfo = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    dateOfBirth: '1995-05-15',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '90210'
    },
    education: {
      level: 'bachelors' as const,
      field: 'Business Administration',
      institution: 'State University',
      graduationYear: 2017
    },
    workExperience: [{
      company: 'Tech Corp',
      title: 'Marketing Associate',
      startDate: '2018-01-01',
      current: true,
      description: 'Social media management and content creation'
    }],
    availability: {
      startDate: '2025-02-01',
      hoursPerWeek: 20,
      preferredSchedule: 'flexible' as const
    },
    references: [{
      name: 'Jane Smith',
      relationship: 'Former Manager',
      phone: '555-987-6543',
      email: 'jane.smith@example.com'
    }]
  };

  describe('Application ID Generation', () => {
    it('should generate unique application IDs', () => {
      const id1 = generateApplicationId();
      const id2 = generateApplicationId();
      
      expect(id1).toMatch(/^APP-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Application Creation', () => {
    it('should create new application with draft status', () => {
      const application = createApplication(mockApplicantInfo);
      
      expect(application.id).toMatch(/^APP-/);
      expect(application.status).toBe('draft');
      expect(application.applicantInfo.firstName).toBe('John');
      expect(application.statusHistory.length).toBe(1);
    });

    it('should initialize empty skills assessment', () => {
      const application = createApplication(mockApplicantInfo);
      
      expect(application.skillsAssessment.technicalSkills).toEqual([]);
      expect(application.skillsAssessment.softSkills).toEqual([]);
      expect(application.skillsAssessment.lawsPillarInterests).toEqual([]);
    });
  });

  describe('Status Updates', () => {
    it('should update application status', () => {
      const application = createApplication(mockApplicantInfo);
      const updated = updateApplicationStatus(application, 'submitted', 'system', 'Application submitted');
      
      expect(updated.status).toBe('submitted');
      expect(updated.statusHistory.length).toBe(2);
      expect(updated.statusHistory[1].notes).toBe('Application submitted');
    });

    it('should track status history', () => {
      let application = createApplication(mockApplicantInfo);
      application = updateApplicationStatus(application, 'submitted');
      application = updateApplicationStatus(application, 'under_review');
      application = updateApplicationStatus(application, 'interview_scheduled');
      
      expect(application.statusHistory.length).toBe(4);
      expect(application.statusHistory.map(h => h.status)).toEqual([
        'draft', 'submitted', 'under_review', 'interview_scheduled'
      ]);
    });
  });

  describe('Skills Assessment Routing', () => {
    it('should recommend entity based on technical skills', () => {
      const assessment = {
        technicalSkills: [
          { skill: 'Video Editing', level: 'expert' as const },
          { skill: 'Graphic Design', level: 'advanced' as const }
        ],
        softSkills: [],
        lawsPillarInterests: [],
        careerGoals: 'Media production',
        whyLAWS: 'Creative opportunities',
        strengthsWeaknesses: { strengths: [], weaknesses: [] }
      };
      
      const result = calculateRecommendedTrack(assessment);
      expect(result.entity).toBe('real_eye_nation');
    });

    it('should recommend entity based on L.A.W.S. pillar interests', () => {
      const assessment = {
        technicalSkills: [],
        softSkills: [],
        lawsPillarInterests: [
          { pillar: 'air' as const, interestLevel: 5 as const, specificInterests: ['teaching'] }
        ],
        careerGoals: 'Education',
        whyLAWS: 'Teaching',
        strengthsWeaknesses: { strengths: [], weaknesses: [] }
      };
      
      const result = calculateRecommendedTrack(assessment);
      expect(result.entity).toBe('academy');
    });

    it('should provide confidence score', () => {
      const assessment = {
        technicalSkills: [
          { skill: 'Bookkeeping', level: 'expert' as const }
        ],
        softSkills: [],
        lawsPillarInterests: [
          { pillar: 'land' as const, interestLevel: 5 as const, specificInterests: [] }
        ],
        careerGoals: 'Finance',
        whyLAWS: 'Business',
        strengthsWeaknesses: { strengths: [], weaknesses: [] }
      };
      
      const result = calculateRecommendedTrack(assessment);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('should provide reasoning for recommendation', () => {
      const assessment = {
        technicalSkills: [],
        softSkills: [],
        lawsPillarInterests: [
          { pillar: 'water' as const, interestLevel: 5 as const, specificInterests: ['healing'] }
        ],
        careerGoals: 'Community service',
        whyLAWS: 'Help others',
        strengthsWeaknesses: { strengths: [], weaknesses: [] }
      };
      
      const result = calculateRecommendedTrack(assessment);
      expect(result.reasoning.length).toBeGreaterThan(0);
    });
  });

  describe('Interview Slots', () => {
    it('should generate interview slots', () => {
      const startDate = new Date('2025-02-03'); // Monday
      const slots = generateInterviewSlots(startDate, 5, 4);
      
      expect(slots.length).toBeGreaterThan(0);
      slots.forEach(slot => {
        expect(slot.id).toMatch(/^SLOT-/);
        expect(slot.duration).toBe(30);
        expect(slot.confirmed).toBe(false);
      });
    });

    it('should skip weekends', () => {
      const startDate = new Date('2025-02-01'); // Saturday
      const slots = generateInterviewSlots(startDate, 7, 4);
      
      slots.forEach(slot => {
        const date = new Date(slot.dateTime);
        expect(date.getDay()).not.toBe(0); // Not Sunday
        expect(date.getDay()).not.toBe(6); // Not Saturday
      });
    });
  });

  describe('Application Validation', () => {
    it('should identify missing fields', () => {
      const application = createApplication(mockApplicantInfo);
      const validation = validateApplication(application);
      
      expect(validation.isComplete).toBe(false);
      expect(validation.missingFields).toContain('Technical Skills');
      expect(validation.missingFields).toContain('Career Goals');
    });

    it('should calculate completion percentage', () => {
      const application = createApplication(mockApplicantInfo);
      const validation = validateApplication(application);
      
      expect(validation.completionPercentage).toBeGreaterThan(0);
      expect(validation.completionPercentage).toBeLessThan(100);
    });

    it('should validate complete application', () => {
      const application = createApplication(mockApplicantInfo);
      application.skillsAssessment = {
        technicalSkills: [{ skill: 'Microsoft Office', level: 'intermediate' }],
        softSkills: [{ skill: 'Communication', level: 'advanced' }],
        lawsPillarInterests: [{ pillar: 'land', interestLevel: 4, specificInterests: [] }],
        careerGoals: 'Business development',
        whyLAWS: 'Community impact',
        strengthsWeaknesses: { strengths: ['Leadership'], weaknesses: ['Public speaking'] }
      };
      application.entityPreference = {
        firstChoice: 'parent_llc',
        preferredTracks: ['Business Development'],
        openToOtherTracks: true
      };
      
      const validation = validateApplication(application);
      expect(validation.completionPercentage).toBe(100);
      expect(validation.isComplete).toBe(true);
    });
  });

  describe('Status Display Info', () => {
    it('should return display info for each status', () => {
      const statuses = ['draft', 'submitted', 'under_review', 'interview_scheduled', 'accepted', 'rejected'] as const;
      
      statuses.forEach(status => {
        const info = getStatusDisplayInfo(status);
        expect(info.label).toBeDefined();
        expect(info.color).toBeDefined();
        expect(info.description).toBeDefined();
        expect(info.nextSteps.length).toBeGreaterThan(0);
      });
    });

    it('should provide appropriate next steps', () => {
      const draftInfo = getStatusDisplayInfo('draft');
      expect(draftInfo.nextSteps).toContain('Submit application');
      
      const acceptedInfo = getStatusDisplayInfo('accepted');
      expect(acceptedInfo.nextSteps.some(s => s.toLowerCase().includes('onboarding'))).toBe(true);
    });
  });

  describe('Application Summary', () => {
    it('should generate comprehensive summary', () => {
      const application = createApplication(mockApplicantInfo);
      application.skillsAssessment = {
        technicalSkills: [{ skill: 'Microsoft Office', level: 'intermediate' }],
        softSkills: [{ skill: 'Communication', level: 'advanced' }],
        lawsPillarInterests: [{ pillar: 'land', interestLevel: 4, specificInterests: [] }],
        careerGoals: 'Business development',
        whyLAWS: 'Community impact',
        strengthsWeaknesses: { strengths: [], weaknesses: [] }
      };
      
      const summary = generateApplicationSummary(application);
      
      expect(summary).toContain('INTERNSHIP APPLICATION SUMMARY');
      expect(summary).toContain('John Doe');
      expect(summary).toContain(application.id);
      expect(summary).toContain('RECOMMENDATION');
    });
  });

  describe('Constants', () => {
    it('should have technical skills defined', () => {
      expect(TECHNICAL_SKILLS.length).toBeGreaterThan(10);
      expect(TECHNICAL_SKILLS).toContain('Microsoft Office');
    });

    it('should have soft skills defined', () => {
      expect(SOFT_SKILLS.length).toBeGreaterThan(5);
      expect(SOFT_SKILLS).toContain('Communication');
    });

    it('should have entity tracks defined', () => {
      expect(Object.keys(ENTITY_TRACKS)).toEqual(['parent_llc', 'collective', 'academy', 'real_eye_nation']);
      expect(ENTITY_TRACKS.parent_llc.length).toBe(4);
    });
  });
});
