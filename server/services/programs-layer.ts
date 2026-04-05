/**
 * Programs Layer Build Service
 * Training & Curriculum (LMS), Outreach & Engagement
 */

// Training & Curriculum Types
export interface Course {
  id: number;
  title: string;
  description: string;
  category: "technical" | "soft_skills" | "compliance" | "leadership" | "onboarding";
  level: "beginner" | "intermediate" | "advanced";
  duration: number; // in minutes
  modules: CourseModule[];
  prerequisites: number[];
  status: "draft" | "published" | "archived";
  createdBy: number;
  createdAt: Date;
}

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
  content: ModuleContent[];
  duration: number;
  assessmentRequired: boolean;
}

export interface ModuleContent {
  type: "video" | "document" | "quiz" | "assignment" | "interactive";
  title: string;
  url?: string;
  content?: string;
  duration?: number;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  status: "enrolled" | "in_progress" | "completed" | "dropped";
  progress: number; // percentage
  enrolledAt: Date;
  completedAt?: Date;
  score?: number;
}

export interface LearningPath {
  id: number;
  name: string;
  description: string;
  courses: number[];
  targetRole?: string;
  estimatedDuration: number;
  status: "active" | "inactive";
}

// Outreach & Engagement Types
export interface Campaign {
  id: number;
  name: string;
  type: "email" | "social" | "event" | "newsletter" | "webinar";
  status: "draft" | "scheduled" | "active" | "completed" | "cancelled";
  targetAudience: string;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  metrics: CampaignMetrics;
}

export interface CampaignMetrics {
  reach: number;
  engagement: number;
  conversions: number;
  roi?: number;
}

export interface Event {
  id: number;
  name: string;
  type: "workshop" | "webinar" | "conference" | "meetup" | "training";
  description: string;
  date: Date;
  duration: number; // in minutes
  location: string;
  isVirtual: boolean;
  capacity: number;
  registrations: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}

export interface CommunityMember {
  id: number;
  userId?: number;
  email: string;
  name: string;
  joinedAt: Date;
  engagementScore: number;
  interests: string[];
  status: "active" | "inactive" | "unsubscribed";
}

export interface Newsletter {
  id: number;
  title: string;
  content: string;
  sentAt?: Date;
  recipients: number;
  openRate?: number;
  clickRate?: number;
  status: "draft" | "scheduled" | "sent";
}

// Training Functions
export function calculateCourseProgress(completedModules: number, totalModules: number): number {
  if (totalModules === 0) return 0;
  return Math.round((completedModules / totalModules) * 100);
}

export function estimateCourseCompletion(
  progress: number,
  totalDuration: number,
  startDate: Date
): Date | null {
  if (progress === 0) return null;
  const elapsed = Date.now() - startDate.getTime();
  const estimatedTotal = elapsed / (progress / 100);
  return new Date(startDate.getTime() + estimatedTotal);
}

export function createCourseData(
  title: string,
  description: string,
  category: Course["category"],
  level: Course["level"],
  duration: number,
  createdBy: number
): Omit<Course, "id" | "modules"> {
  return {
    title,
    description,
    category,
    level,
    duration,
    prerequisites: [],
    status: "draft",
    createdBy,
    createdAt: new Date()
  };
}

export function createModuleData(
  courseId: number,
  title: string,
  description: string,
  order: number,
  duration: number,
  assessmentRequired: boolean = false
): Omit<CourseModule, "id" | "content"> {
  return {
    courseId,
    title,
    description,
    order,
    duration,
    assessmentRequired
  };
}

export function createEnrollmentData(userId: number, courseId: number): Omit<Enrollment, "id"> {
  return {
    userId,
    courseId,
    status: "enrolled",
    progress: 0,
    enrolledAt: new Date()
  };
}

export function createLearningPathData(
  name: string,
  description: string,
  courses: number[],
  targetRole?: string
): Omit<LearningPath, "id" | "estimatedDuration"> {
  return {
    name,
    description,
    courses,
    targetRole,
    estimatedDuration: 0, // Will be calculated from courses
    status: "active"
  };
}

// Outreach Functions
export function calculateEngagementRate(engagements: number, reach: number): number {
  if (reach === 0) return 0;
  return Math.round((engagements / reach) * 100 * 100) / 100;
}

export function calculateCampaignROI(revenue: number, cost: number): number {
  if (cost === 0) return 0;
  return Math.round(((revenue - cost) / cost) * 100 * 100) / 100;
}

export function createCampaignData(
  name: string,
  type: Campaign["type"],
  targetAudience: string,
  startDate: Date,
  budget?: number
): Omit<Campaign, "id"> {
  return {
    name,
    type,
    status: "draft",
    targetAudience,
    startDate,
    budget,
    metrics: {
      reach: 0,
      engagement: 0,
      conversions: 0
    }
  };
}

export function createEventData(
  name: string,
  type: Event["type"],
  description: string,
  date: Date,
  duration: number,
  location: string,
  isVirtual: boolean,
  capacity: number
): Omit<Event, "id"> {
  return {
    name,
    type,
    description,
    date,
    duration,
    location,
    isVirtual,
    capacity,
    registrations: 0,
    status: "upcoming"
  };
}

export function createCommunityMemberData(
  email: string,
  name: string,
  interests: string[]
): Omit<CommunityMember, "id"> {
  return {
    email,
    name,
    joinedAt: new Date(),
    engagementScore: 0,
    interests,
    status: "active"
  };
}

export function createNewsletterData(title: string, content: string): Omit<Newsletter, "id"> {
  return {
    title,
    content,
    recipients: 0,
    status: "draft"
  };
}

export function getEventAvailability(event: Event): { available: number; percentFull: number } {
  const available = Math.max(0, event.capacity - event.registrations);
  const percentFull = event.capacity > 0 ? Math.round((event.registrations / event.capacity) * 100) : 0;
  return { available, percentFull };
}

export function getProgramsLayerSummary() {
  return {
    modules: ["Training & Curriculum (LMS)", "Outreach & Engagement"],
    courseCategories: ["technical", "soft_skills", "compliance", "leadership", "onboarding"],
    courseLevels: ["beginner", "intermediate", "advanced"],
    contentTypes: ["video", "document", "quiz", "assignment", "interactive"],
    campaignTypes: ["email", "social", "event", "newsletter", "webinar"],
    eventTypes: ["workshop", "webinar", "conference", "meetup", "training"]
  };
}
