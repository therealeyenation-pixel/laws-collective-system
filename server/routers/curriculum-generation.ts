import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { courses, generatedCurriculum, activityAuditTrail } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const curriculumGenerationRouter = router({
  // Generate curriculum content based on business data
  generateCurriculumContent: protectedProcedure
    .input(
      z.object({
        subject: z.string(),
        ageLevel: z.enum(["elementary", "middle", "high", "adult", "professional"]),
        department: z.string().optional(),
        businessContext: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Generate curriculum using LLM
      const prompt = `Create comprehensive curriculum content for:

Subject: ${input.subject}
Age Level: ${input.ageLevel}
Department: ${input.department || "General"}
Business Context: ${JSON.stringify(input.businessContext || {})}

Generate a structured curriculum with:
1. Learning objectives (3-5 clear goals)
2. Core topics (5-7 main topics to cover)
3. Learning activities (practical exercises and projects)
4. Assessment methods (how to measure learning)
5. Resources needed (materials, tools, references)
6. Timeline (estimated hours/weeks)
7. Real-world applications (how this applies to business/life)

Format as JSON with these exact keys: objectives, topics, activities, assessments, resources, timeline, applications`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert curriculum designer. Create detailed, practical curriculum content. Respond only with valid JSON." },
          { role: "user", content: prompt },
        ],
      });

      let curriculumData;
      try {
        const messageContent = response.choices[0]?.message.content;
        const content = typeof messageContent === "string" ? messageContent : "{}";
        curriculumData = JSON.parse(content);
      } catch {
        curriculumData = {
          objectives: ["Placeholder objective"],
          topics: ["Placeholder topic"],
          activities: ["Placeholder activity"],
          assessments: ["Placeholder assessment"],
          resources: ["Placeholder resource"],
          timeline: "Placeholder timeline",
          applications: ["Placeholder application"],
        };
      }

      // Save curriculum to database
      // First create course
      const courseResult = await db.insert(courses).values({
        subjectId: 1, // Default subject
        title: input.subject,
        level: (input.ageLevel === "elementary" || input.ageLevel === "middle" ? "beginner" : 
                input.ageLevel === "high" ? "intermediate" : "advanced") as "beginner" | "intermediate" | "advanced",
        ageGroup: input.ageLevel,
        description: `AI-generated curriculum for ${input.subject}`,
        status: "active",
      });

      const courseId = courseResult[0].insertId;

      // Then save generated curriculum
      const genCurriculum = await db.insert(generatedCurriculum).values({
        courseId: courseId,
        contentData: curriculumData,
        difficulty: (input.ageLevel === "elementary" || input.ageLevel === "middle" ? "beginner" : 
                     input.ageLevel === "high" ? "intermediate" : "advanced") as "beginner" | "intermediate" | "advanced",
        status: "active",
      });

      const curriculumId = genCurriculum[0].insertId;

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "curriculum_generated",
        action: "create",
        details: {
          subject: input.subject,
          ageLevel: input.ageLevel,
          department: input.department,
        } as any,
      });

      return {
        courseId: courseId,
        curriculumId: curriculumId,
        curriculum: curriculumData,
        status: "created",
      };
    }),

  // Get curriculum by course ID
  getCurriculum: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const curriculum = await db
        .select()
        .from(generatedCurriculum)
        .where(eq(generatedCurriculum.courseId, input.courseId));

      if (curriculum.length === 0) return null;
      return curriculum[0];
    }),

  // List all available curricula
  listCurricula: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const curricula = await db
        .select()
        .from(generatedCurriculum)
        .limit(input.limit || 10);

      return curricula;
    }),

  // Update curriculum based on student performance
  updateCurriculumDifficulty: protectedProcedure
    .input(
      z.object({
        curriculumId: z.number(),
        performanceData: z.record(z.string(), z.any()),
        adjustmentFactor: z.number().min(0.5).max(2),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get current curriculum
      const curriculum = await db
        .select()
        .from(generatedCurriculum)
        .where(eq(generatedCurriculum.id, input.curriculumId));

      if (curriculum.length === 0) throw new Error("Curriculum not found");

      // Use LLM to adjust difficulty
      const prompt = `Adjust curriculum difficulty based on student performance:

Current Curriculum: ${JSON.stringify(curriculum[0].contentData)}
Student Performance: ${JSON.stringify(input.performanceData)}
Adjustment Factor: ${input.adjustmentFactor} (>1 = harder, <1 = easier)

Generate adjusted curriculum with modified:
1. Objectives (more/less challenging)
2. Topics (more/less depth)
3. Activities (more/less complex)
4. Assessments (higher/lower difficulty)

Format as JSON with same structure as original curriculum`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert curriculum designer. Adjust curriculum difficulty based on performance data. Respond only with valid JSON." },
          { role: "user", content: prompt },
        ],
      });

      let adjustedCurriculum;
      try {
        const messageContent = response.choices[0]?.message.content;
        const content = typeof messageContent === "string" ? messageContent : "{}";
        adjustedCurriculum = JSON.parse(content);
      } catch {
        adjustedCurriculum = curriculum[0].contentData;
      }

      // Update curriculum
      await db
        .update(generatedCurriculum)
        .set({
          contentData: adjustedCurriculum,
          generationVersion: (curriculum[0].generationVersion || 1) + 1,
        })
        .where(eq(generatedCurriculum.id, input.curriculumId));

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "curriculum_adjusted",
        action: "update",
        details: {
          curriculumId: input.curriculumId,
          adjustmentFactor: input.adjustmentFactor,
        } as any,
      });

      return {
        curriculumId: input.curriculumId,
        adjustedCurriculum,
        status: "updated",
      };
    }),

  // Generate course from business operations data
  generateCourseFromBusinessData: protectedProcedure
    .input(
      z.object({
        businessEntityId: z.number(),
        department: z.string(),
        ageLevel: z.enum(["elementary", "middle", "high", "adult", "professional"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Generate course based on department operations
      const prompt = `Create a practical curriculum course for the ${input.department} department:

Department: ${input.department}
Target Age Level: ${input.ageLevel}
Business Entity ID: ${input.businessEntityId}

Generate a course that teaches:
1. Real operations from this department
2. Practical skills needed
3. Decision-making processes
4. Problem-solving scenarios
5. Industry best practices
6. Technology and tools used
7. Career pathways

Make it hands-on and immediately applicable. Format as JSON with: objectives, topics, activities, assessments, resources, timeline, applications`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert curriculum designer specializing in practical, business-focused education. Respond only with valid JSON." },
          { role: "user", content: prompt },
        ],
      });

      let courseData;
      try {
        const messageContent = response.choices[0]?.message.content;
        const content = typeof messageContent === "string" ? messageContent : "{}";
        courseData = JSON.parse(content);
      } catch {
        courseData = {
          objectives: ["Learn department operations"],
          topics: ["Department overview"],
          activities: ["Practical exercises"],
          assessments: ["Performance evaluation"],
          resources: ["Department resources"],
          timeline: "Variable",
          applications: ["Career development"],
        };
      }

      // Save course
      const courseResult = await db.insert(courses).values({
        subjectId: 1, // Default subject
        title: `${input.department} Operations`,
        level: (input.ageLevel === "elementary" || input.ageLevel === "middle" ? "beginner" : 
                input.ageLevel === "high" ? "intermediate" : "advanced") as "beginner" | "intermediate" | "advanced",
        ageGroup: input.ageLevel,
        description: `Practical course for ${input.department} department`,
        status: "active",
      });

      const courseId = courseResult[0].insertId;

      // Save generated curriculum
      const genCurriculum = await db.insert(generatedCurriculum).values({
        courseId: courseId,
        contentData: courseData,
        difficulty: (input.ageLevel === "elementary" || input.ageLevel === "middle" ? "beginner" : 
                     input.ageLevel === "high" ? "intermediate" : "advanced") as "beginner" | "intermediate" | "advanced",
        status: "active",
      });

      const curriculumId = genCurriculum[0].insertId;

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "course_generated_from_business",
        action: "create",
        details: {
          businessEntityId: input.businessEntityId,
          department: input.department,
          ageLevel: input.ageLevel,
        } as any,
      });

      return {
        courseId: courseId,
        curriculumId: curriculumId,
        course: courseData,
        status: "created",
      };
    }),
});
