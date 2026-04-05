/**
 * Academy Homeschool K-12 Curriculum Service
 * Phase 76: Age-based tracks and curriculum structure
 */

export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type AgeGroup = 'early_childhood' | 'elementary' | 'middle_school' | 'high_school';
export type SubjectArea = 'financial_literacy' | 'entrepreneurship' | 'leadership' | 'laws_values' | 'life_skills' | 'business_basics';
export type LessonType = 'video' | 'reading' | 'activity' | 'project' | 'quiz' | 'discussion';

export interface CurriculumTrack {
  trackId: string;
  name: string;
  ageGroup: AgeGroup;
  gradeRange: { min: GradeLevel; max: GradeLevel };
  description: string;
  subjects: Subject[];
  totalHours: number;
  prerequisites?: string[];
}

export interface Subject {
  subjectId: string;
  area: SubjectArea;
  name: string;
  description: string;
  units: Unit[];
  totalLessons: number;
  estimatedHours: number;
}

export interface Unit {
  unitId: string;
  name: string;
  description: string;
  order: number;
  lessons: Lesson[];
  assessment?: Assessment;
}

export interface Lesson {
  lessonId: string;
  title: string;
  type: LessonType;
  duration: number; // minutes
  objectives: string[];
  content: string;
  resources?: string[];
  parentGuide?: string;
}

export interface Assessment {
  assessmentId: string;
  type: 'quiz' | 'project' | 'presentation' | 'portfolio';
  title: string;
  passingScore: number;
  questions?: AssessmentQuestion[];
  rubric?: RubricItem[];
}

export interface AssessmentQuestion {
  questionId: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface RubricItem {
  criterion: string;
  excellent: string;
  good: string;
  satisfactory: string;
  needsImprovement: string;
  points: number;
}

export interface StudentProgress {
  studentId: string;
  trackId: string;
  enrolledAt: Date;
  completedLessons: string[];
  assessmentScores: { assessmentId: string; score: number; completedAt: Date }[];
  currentUnit: string;
  overallProgress: number;
  certificatesEarned: string[];
}

const CURRICULUM_TRACKS: Omit<CurriculumTrack, 'trackId' | 'subjects'>[] = [
  {
    name: 'Little Entrepreneurs (K-2)',
    ageGroup: 'early_childhood',
    gradeRange: { min: 'K', max: '2' },
    description: 'Introduction to money, sharing, and basic business concepts through play and stories',
    totalHours: 40
  },
  {
    name: 'Young Business Builders (3-5)',
    ageGroup: 'elementary',
    gradeRange: { min: '3', max: '5' },
    description: 'Hands-on projects exploring saving, earning, and simple business ideas',
    totalHours: 60
  },
  {
    name: 'Teen Entrepreneurs (6-8)',
    ageGroup: 'middle_school',
    gradeRange: { min: '6', max: '8' },
    description: 'Practical business skills, financial planning, and leadership development',
    totalHours: 80
  },
  {
    name: 'Future Leaders (9-12)',
    ageGroup: 'high_school',
    gradeRange: { min: '9', max: '12' },
    description: 'Advanced business concepts, investment strategies, and real-world entrepreneurship',
    totalHours: 120
  }
];

const SUBJECT_TEMPLATES: Record<AgeGroup, Omit<Subject, 'subjectId' | 'units'>[]> = {
  early_childhood: [
    { area: 'financial_literacy', name: 'Money Basics', description: 'Understanding coins, bills, and what money does', totalLessons: 8, estimatedHours: 4 },
    { area: 'life_skills', name: 'Sharing & Caring', description: 'Learning to share resources and help others', totalLessons: 6, estimatedHours: 3 },
    { area: 'laws_values', name: 'Our Family Values', description: 'Introduction to L.A.W.S. through stories', totalLessons: 8, estimatedHours: 4 }
  ],
  elementary: [
    { area: 'financial_literacy', name: 'Saving & Spending', description: 'Smart money choices and goal setting', totalLessons: 12, estimatedHours: 8 },
    { area: 'entrepreneurship', name: 'My First Business', description: 'Simple business ideas and lemonade stand economics', totalLessons: 10, estimatedHours: 10 },
    { area: 'leadership', name: 'Team Player', description: 'Working with others and basic leadership', totalLessons: 8, estimatedHours: 6 },
    { area: 'laws_values', name: 'L.A.W.S. Explorer', description: 'Deeper dive into Land, Air, Water, Self', totalLessons: 12, estimatedHours: 8 }
  ],
  middle_school: [
    { area: 'financial_literacy', name: 'Personal Finance', description: 'Budgeting, banking, and financial planning', totalLessons: 16, estimatedHours: 12 },
    { area: 'entrepreneurship', name: 'Business Basics', description: 'Starting and running a small business', totalLessons: 14, estimatedHours: 14 },
    { area: 'business_basics', name: 'Marketing & Sales', description: 'How to promote and sell products/services', totalLessons: 10, estimatedHours: 8 },
    { area: 'leadership', name: 'Leadership Skills', description: 'Communication, decision-making, and influence', totalLessons: 12, estimatedHours: 10 },
    { area: 'laws_values', name: 'L.A.W.S. in Action', description: 'Applying values to real-world situations', totalLessons: 10, estimatedHours: 8 }
  ],
  high_school: [
    { area: 'financial_literacy', name: 'Advanced Finance', description: 'Investing, taxes, and wealth building', totalLessons: 20, estimatedHours: 20 },
    { area: 'entrepreneurship', name: 'Business Launch', description: 'Creating a real business plan and launch', totalLessons: 18, estimatedHours: 24 },
    { area: 'business_basics', name: 'Operations & Management', description: 'Running a business day-to-day', totalLessons: 14, estimatedHours: 14 },
    { area: 'leadership', name: 'Executive Leadership', description: 'Strategic thinking and organizational leadership', totalLessons: 12, estimatedHours: 12 },
    { area: 'laws_values', name: 'L.A.W.S. Legacy', description: 'Building generational wealth and values', totalLessons: 10, estimatedHours: 10 },
    { area: 'life_skills', name: 'Life Readiness', description: 'Practical skills for adult life', totalLessons: 16, estimatedHours: 16 }
  ]
};

export function createCurriculumTrack(ageGroup: AgeGroup): CurriculumTrack {
  const template = CURRICULUM_TRACKS.find(t => t.ageGroup === ageGroup);
  if (!template) throw new Error(`Unknown age group: ${ageGroup}`);

  const subjectTemplates = SUBJECT_TEMPLATES[ageGroup];
  const subjects: Subject[] = subjectTemplates.map((st, idx) => ({
    ...st,
    subjectId: `subj-${ageGroup}-${idx}`,
    units: []
  }));

  return {
    ...template,
    trackId: `track-${ageGroup}-${Date.now()}`,
    subjects
  };
}

export function createUnit(
  subjectId: string,
  name: string,
  description: string,
  order: number
): Unit {
  return {
    unitId: `unit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    description,
    order,
    lessons: []
  };
}

export function createLesson(
  title: string,
  type: LessonType,
  duration: number,
  objectives: string[],
  content: string,
  parentGuide?: string
): Lesson {
  return {
    lessonId: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    type,
    duration,
    objectives,
    content,
    parentGuide
  };
}

export function createAssessment(
  type: Assessment['type'],
  title: string,
  passingScore: number
): Assessment {
  return {
    assessmentId: `assess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    passingScore,
    questions: [],
    rubric: []
  };
}

export function addQuestionToAssessment(
  assessment: Assessment,
  question: string,
  type: AssessmentQuestion['type'],
  points: number,
  options?: string[],
  correctAnswer?: string
): Assessment {
  const newQuestion: AssessmentQuestion = {
    questionId: `q-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
    question,
    type,
    options,
    correctAnswer,
    points
  };

  return {
    ...assessment,
    questions: [...(assessment.questions || []), newQuestion]
  };
}

export function enrollStudent(
  studentId: string,
  trackId: string
): StudentProgress {
  return {
    studentId,
    trackId,
    enrolledAt: new Date(),
    completedLessons: [],
    assessmentScores: [],
    currentUnit: '',
    overallProgress: 0,
    certificatesEarned: []
  };
}

export function recordLessonCompletion(
  progress: StudentProgress,
  lessonId: string
): StudentProgress {
  if (progress.completedLessons.includes(lessonId)) {
    return progress;
  }

  return {
    ...progress,
    completedLessons: [...progress.completedLessons, lessonId]
  };
}

export function recordAssessmentScore(
  progress: StudentProgress,
  assessmentId: string,
  score: number
): StudentProgress {
  return {
    ...progress,
    assessmentScores: [
      ...progress.assessmentScores,
      { assessmentId, score, completedAt: new Date() }
    ]
  };
}

export function calculateProgress(
  progress: StudentProgress,
  track: CurriculumTrack
): number {
  const totalLessons = track.subjects.reduce((sum, s) => sum + s.totalLessons, 0);
  if (totalLessons === 0) return 0;
  return Math.round((progress.completedLessons.length / totalLessons) * 100);
}

export function awardCertificate(
  progress: StudentProgress,
  certificateId: string
): StudentProgress {
  return {
    ...progress,
    certificatesEarned: [...progress.certificatesEarned, certificateId]
  };
}

export function getAgeGroupForGrade(grade: GradeLevel): AgeGroup {
  const gradeNum = grade === 'K' ? 0 : parseInt(grade);
  if (gradeNum <= 2) return 'early_childhood';
  if (gradeNum <= 5) return 'elementary';
  if (gradeNum <= 8) return 'middle_school';
  return 'high_school';
}

export function generateParentDashboard(
  studentName: string,
  progress: StudentProgress,
  track: CurriculumTrack
): string {
  const overallProgress = calculateProgress(progress, track);
  const avgScore = progress.assessmentScores.length > 0
    ? progress.assessmentScores.reduce((sum, s) => sum + s.score, 0) / progress.assessmentScores.length
    : 0;

  return `
PARENT DASHBOARD - ${studentName}
================================

ENROLLMENT
----------
Track: ${track.name}
Enrolled: ${progress.enrolledAt.toLocaleDateString()}
Overall Progress: ${overallProgress}%

COMPLETED LESSONS
-----------------
${progress.completedLessons.length} lessons completed

ASSESSMENT SCORES
-----------------
${progress.assessmentScores.length > 0 
  ? progress.assessmentScores.map(s => `- Assessment ${s.assessmentId}: ${s.score}%`).join('\n')
  : 'No assessments completed yet'}
Average Score: ${avgScore.toFixed(1)}%

CERTIFICATES EARNED
-------------------
${progress.certificatesEarned.length > 0
  ? progress.certificatesEarned.join(', ')
  : 'No certificates earned yet'}

NEXT STEPS
----------
Continue with the current unit to maintain progress.
`;
}

export function generateLessonPlan(lesson: Lesson): string {
  return `
LESSON PLAN: ${lesson.title}
============================

Type: ${lesson.type.toUpperCase()}
Duration: ${lesson.duration} minutes

LEARNING OBJECTIVES
-------------------
${lesson.objectives.map((obj, idx) => `${idx + 1}. ${obj}`).join('\n')}

CONTENT
-------
${lesson.content}

${lesson.parentGuide ? `
PARENT/TEACHER GUIDE
--------------------
${lesson.parentGuide}
` : ''}

${lesson.resources && lesson.resources.length > 0 ? `
RESOURCES
---------
${lesson.resources.join('\n')}
` : ''}
`;
}

export const academyHomeschool = {
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
  generateLessonPlan,
  CURRICULUM_TRACKS,
  SUBJECT_TEMPLATES
};
