import { describe, it, expect } from 'vitest';
import {
  createCurriculumTrack,
  createUnit,
  createLesson,
  createAssessment,
  addQuestionToAssessment,
  enrollStudent,
  recordLessonCompletion,
  recordAssessmentScore,
  calculateProgress,
  awardCertificate,
  getAgeGroupForGrade,
  generateParentDashboard,
  generateLessonPlan
} from './academy-homeschool';

describe('Academy Homeschool K-12 Curriculum Service', () => {
  describe('createCurriculumTrack', () => {
    it('should create early childhood track (K-2)', () => {
      const track = createCurriculumTrack('early_childhood');
      expect(track.trackId).toContain('track-early_childhood');
      expect(track.name).toBe('Little Entrepreneurs (K-2)');
      expect(track.ageGroup).toBe('early_childhood');
      expect(track.subjects.length).toBe(3);
    });

    it('should create elementary track (3-5)', () => {
      const track = createCurriculumTrack('elementary');
      expect(track.name).toBe('Young Business Builders (3-5)');
      expect(track.subjects.length).toBe(4);
    });

    it('should create middle school track (6-8)', () => {
      const track = createCurriculumTrack('middle_school');
      expect(track.name).toBe('Teen Entrepreneurs (6-8)');
      expect(track.subjects.length).toBe(5);
    });

    it('should create high school track (9-12)', () => {
      const track = createCurriculumTrack('high_school');
      expect(track.name).toBe('Future Leaders (9-12)');
      expect(track.subjects.length).toBe(6);
      expect(track.totalHours).toBe(120);
    });
  });

  describe('createUnit', () => {
    it('should create unit with proper structure', () => {
      const unit = createUnit('subj-001', 'Introduction to Money', 'Learn about coins and bills', 1);
      expect(unit.unitId).toContain('unit-');
      expect(unit.name).toBe('Introduction to Money');
      expect(unit.order).toBe(1);
      expect(unit.lessons).toEqual([]);
    });
  });

  describe('createLesson', () => {
    it('should create lesson with all properties', () => {
      const lesson = createLesson(
        'Counting Coins',
        'activity',
        30,
        ['Identify different coins', 'Count coin values'],
        'In this lesson, students will learn to identify and count coins.',
        'Help your child sort coins by type first.'
      );

      expect(lesson.lessonId).toContain('lesson-');
      expect(lesson.title).toBe('Counting Coins');
      expect(lesson.type).toBe('activity');
      expect(lesson.duration).toBe(30);
      expect(lesson.objectives).toHaveLength(2);
      expect(lesson.parentGuide).toBeDefined();
    });
  });

  describe('createAssessment', () => {
    it('should create assessment', () => {
      const assessment = createAssessment('quiz', 'Money Basics Quiz', 70);
      expect(assessment.assessmentId).toContain('assess-');
      expect(assessment.type).toBe('quiz');
      expect(assessment.passingScore).toBe(70);
    });
  });

  describe('addQuestionToAssessment', () => {
    it('should add multiple choice question', () => {
      let assessment = createAssessment('quiz', 'Test', 70);
      assessment = addQuestionToAssessment(
        assessment,
        'How many cents in a dollar?',
        'multiple_choice',
        10,
        ['50', '75', '100', '200'],
        '100'
      );

      expect(assessment.questions).toHaveLength(1);
      expect(assessment.questions![0].options).toContain('100');
      expect(assessment.questions![0].correctAnswer).toBe('100');
    });
  });

  describe('Student Progress', () => {
    it('should enroll student in track', () => {
      const progress = enrollStudent('student-001', 'track-001');
      expect(progress.studentId).toBe('student-001');
      expect(progress.trackId).toBe('track-001');
      expect(progress.completedLessons).toEqual([]);
      expect(progress.overallProgress).toBe(0);
    });

    it('should record lesson completion', () => {
      let progress = enrollStudent('student-001', 'track-001');
      progress = recordLessonCompletion(progress, 'lesson-001');
      progress = recordLessonCompletion(progress, 'lesson-002');

      expect(progress.completedLessons).toHaveLength(2);
      expect(progress.completedLessons).toContain('lesson-001');
    });

    it('should not duplicate lesson completion', () => {
      let progress = enrollStudent('student-001', 'track-001');
      progress = recordLessonCompletion(progress, 'lesson-001');
      progress = recordLessonCompletion(progress, 'lesson-001');

      expect(progress.completedLessons).toHaveLength(1);
    });

    it('should record assessment score', () => {
      let progress = enrollStudent('student-001', 'track-001');
      progress = recordAssessmentScore(progress, 'assess-001', 85);

      expect(progress.assessmentScores).toHaveLength(1);
      expect(progress.assessmentScores[0].score).toBe(85);
    });

    it('should calculate progress percentage', () => {
      const track = createCurriculumTrack('early_childhood');
      let progress = enrollStudent('student-001', track.trackId);
      
      // Simulate completing some lessons
      for (let i = 0; i < 5; i++) {
        progress = recordLessonCompletion(progress, `lesson-${i}`);
      }

      const percentage = calculateProgress(progress, track);
      expect(percentage).toBeGreaterThan(0);
    });

    it('should award certificate', () => {
      let progress = enrollStudent('student-001', 'track-001');
      progress = awardCertificate(progress, 'cert-money-basics');

      expect(progress.certificatesEarned).toContain('cert-money-basics');
    });
  });

  describe('getAgeGroupForGrade', () => {
    it('should return early_childhood for K-2', () => {
      expect(getAgeGroupForGrade('K')).toBe('early_childhood');
      expect(getAgeGroupForGrade('1')).toBe('early_childhood');
      expect(getAgeGroupForGrade('2')).toBe('early_childhood');
    });

    it('should return elementary for 3-5', () => {
      expect(getAgeGroupForGrade('3')).toBe('elementary');
      expect(getAgeGroupForGrade('5')).toBe('elementary');
    });

    it('should return middle_school for 6-8', () => {
      expect(getAgeGroupForGrade('6')).toBe('middle_school');
      expect(getAgeGroupForGrade('8')).toBe('middle_school');
    });

    it('should return high_school for 9-12', () => {
      expect(getAgeGroupForGrade('9')).toBe('high_school');
      expect(getAgeGroupForGrade('12')).toBe('high_school');
    });
  });

  describe('generateParentDashboard', () => {
    it('should generate formatted dashboard', () => {
      const track = createCurriculumTrack('elementary');
      let progress = enrollStudent('student-001', track.trackId);
      progress = recordLessonCompletion(progress, 'lesson-001');
      progress = recordAssessmentScore(progress, 'assess-001', 90);
      progress = awardCertificate(progress, 'Money Basics Certificate');

      const dashboard = generateParentDashboard('Emma Freeman', progress, track);
      
      expect(dashboard).toContain('PARENT DASHBOARD - Emma Freeman');
      expect(dashboard).toContain('Young Business Builders (3-5)');
      expect(dashboard).toContain('1 lessons completed');
      expect(dashboard).toContain('90%');
      expect(dashboard).toContain('Money Basics Certificate');
    });
  });

  describe('generateLessonPlan', () => {
    it('should generate formatted lesson plan', () => {
      const lesson = createLesson(
        'Understanding Savings',
        'video',
        20,
        ['Define what savings means', 'Explain why saving is important'],
        'Watch the video about saving money for the future.',
        'Discuss with your child what they might want to save for.'
      );

      const plan = generateLessonPlan(lesson);
      
      expect(plan).toContain('LESSON PLAN: Understanding Savings');
      expect(plan).toContain('VIDEO');
      expect(plan).toContain('20 minutes');
      expect(plan).toContain('Define what savings means');
      expect(plan).toContain('PARENT/TEACHER GUIDE');
    });
  });
});
