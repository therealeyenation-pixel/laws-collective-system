/**
 * Academy K-12 Homeschool Curriculum Router
 * LuvOnPurpose Academy and Outreach (508 Entity)
 * 
 * AI-generated, standards-aligned, self-paced curriculum
 * with human collaboration for cultural perspective infusion
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import {
  academySubjects,
  academyUnits,
  academyUnitLessons,
  academyHumanNotes,
  academyAssessments,
  academyAssessmentResults,
  academyMasteryTracking,
  academyContentGenLog,
  studentProfiles,
} from "../../drizzle/schema";
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";

export const academyK12Router = router({
  // ============================================
  // SUBJECTS
  // ============================================

  getSubjects: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(academySubjects).where(eq(academySubjects.status, "active")).orderBy(asc(academySubjects.orderIndex));
  }),

  getSubjectBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [subject] = await db.select().from(academySubjects).where(eq(academySubjects.slug, input.slug));
      return subject || null;
    }),

  // ============================================
  // UNITS
  // ============================================

  getUnitsBySubject: publicProcedure
    .input(z.object({ subjectId: z.number(), levelBand: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(academyUnits.subjectId, input.subjectId)];
      if (input.levelBand) {
        conditions.push(eq(academyUnits.levelBand, input.levelBand as any));
      }
      return db.select().from(academyUnits)
        .where(and(...conditions))
        .orderBy(asc(academyUnits.orderIndex));
    }),

  getUnitById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [unit] = await db.select().from(academyUnits).where(eq(academyUnits.id, input.id));
      return unit || null;
    }),

  // ============================================
  // LESSONS
  // ============================================

  getLessonsByUnit: publicProcedure
    .input(z.object({ unitId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(academyUnitLessons)
        .where(eq(academyUnitLessons.unitId, input.unitId))
        .orderBy(asc(academyUnitLessons.orderIndex));
    }),

  getLessonById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [lesson] = await db.select().from(academyUnitLessons).where(eq(academyUnitLessons.id, input.id));
      // Also fetch human notes for this lesson
      const notes = await db.select().from(academyHumanNotes)
        .where(and(
          eq(academyHumanNotes.targetType, "lesson"),
          eq(academyHumanNotes.targetId, input.id),
          eq(academyHumanNotes.isPublished, true)
        ));
      return lesson ? { ...lesson, humanNotes: notes } : null;
    }),

  // ============================================
  // AI CONTENT GENERATION
  // ============================================

  generateLessonContent: protectedProcedure
    .input(z.object({
      unitId: z.number(),
      lessonTitle: z.string(),
      lessonType: z.enum(["instruction", "practice", "exploration", "project", "discussion", "lab", "reading", "simulation"]),
      subjectName: z.string(),
      levelBand: z.string(),
      standardsCovered: z.array(z.string()).optional(),
      additionalContext: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const levelDescriptions: Record<string, string> = {
        early_elementary: "Kindergarten through 2nd grade (ages 5-7). Use simple language, visual descriptions, hands-on activities.",
        upper_elementary: "3rd through 5th grade (ages 8-10). Build on basics, introduce reasoning, use real-world examples.",
        middle_school: "6th through 8th grade (ages 11-13). Develop critical thinking, introduce abstract concepts, encourage inquiry.",
        high_school_intro: "9th through 10th grade (ages 14-15). Formal academic language, deeper analysis, prepare for advanced work.",
        high_school_adv: "11th through 12th grade (ages 16-18). College-prep rigor, independent research, synthesis and evaluation.",
        certification: "Post-secondary certification level. Professional standards, practical application, career readiness.",
      };

      const prompt = `You are an expert K-12 curriculum designer creating a lesson for a homeschool program.

SUBJECT: ${input.subjectName}
LEVEL: ${levelDescriptions[input.levelBand] || input.levelBand}
LESSON TITLE: ${input.lessonTitle}
LESSON TYPE: ${input.lessonType}
${input.standardsCovered?.length ? `STANDARDS: ${input.standardsCovered.join(", ")}` : ""}
${input.additionalContext ? `ADDITIONAL CONTEXT: ${input.additionalContext}` : ""}

Generate a complete lesson with the following JSON structure:
{
  "summary": "2-3 sentence overview of the lesson",
  "contentBlocks": [
    { "type": "key_concept", "data": { "title": "...", "content": "..." } },
    { "type": "text", "data": { "content": "..." } },
    { "type": "vocabulary", "data": { "terms": [{ "term": "...", "definition": "...", "example": "..." }] } },
    { "type": "practice_problem", "data": { "problems": [{ "question": "...", "hint": "...", "answer": "..." }] } },
    { "type": "real_world_connection", "data": { "title": "...", "content": "..." } },
    { "type": "discussion_prompt", "data": { "prompt": "...", "guiding_questions": ["..."] } }
  ],
  "vocabularyTerms": [{ "term": "...", "definition": "...", "example": "..." }],
  "estimatedMinutes": 30,
  "resources": [{ "title": "...", "url": "...", "type": "reference" }]
}

Requirements:
- Use REAL, accurate educational content aligned with Common Core / NGSS / state standards
- Include 5-8 content blocks appropriate for the lesson type
- Vocabulary terms should be age-appropriate
- Practice problems should have clear, correct answers
- Real-world connections should be culturally inclusive and relevant
- For ${input.lessonType} type, emphasize ${input.lessonType === "instruction" ? "clear explanations and examples" : input.lessonType === "practice" ? "guided and independent practice problems" : input.lessonType === "exploration" ? "inquiry-based discovery activities" : input.lessonType === "project" ? "hands-on project steps and rubric" : input.lessonType === "discussion" ? "thought-provoking prompts and perspectives" : input.lessonType === "lab" ? "step-by-step procedures and observations" : input.lessonType === "reading" ? "reading passages with comprehension questions" : "interactive scenario descriptions"}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert curriculum designer. Return ONLY valid JSON, no markdown formatting." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "lesson_content",
            strict: false,
            schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                contentBlocks: { type: "array", items: { type: "object" } },
                vocabularyTerms: { type: "array", items: { type: "object" } },
                estimatedMinutes: { type: "integer" },
                resources: { type: "array", items: { type: "object" } },
              },
              required: ["summary", "contentBlocks", "vocabularyTerms", "estimatedMinutes"],
            },
          },
        },
      });

      const content = JSON.parse(response.choices[0].message.content || "{}");

      // Insert the lesson
      const [inserted] = await db.insert(academyUnitLessons).values({
        unitId: input.unitId,
        title: input.lessonTitle,
        slug: input.lessonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
        summary: content.summary,
        contentBlocks: content.contentBlocks,
        contentType: input.lessonType,
        estimatedMinutes: content.estimatedMinutes || 30,
        vocabularyTerms: content.vocabularyTerms,
        resources: content.resources,
        standardsCovered: input.standardsCovered,
        aiGenerated: true,
        humanReviewed: false,
        status: "ai_generated",
      });

      // Log the generation
      await db.insert(academyContentGenLog).values({
        generationType: "lesson_content",
        targetType: "lesson",
        targetId: Number((inserted as any).insertId),
        prompt: prompt.substring(0, 5000),
        generatedContent: content,
        generatedBy: ctx.user.id,
        status: "completed",
      });

      return { success: true, lessonId: Number((inserted as any).insertId), content };
    }),

  generateAssessment: protectedProcedure
    .input(z.object({
      unitId: z.number().optional(),
      lessonId: z.number().optional(),
      assessmentType: z.enum(["lesson_check", "unit_quiz", "mastery_exam", "practice_set", "project_rubric", "oral_prompt", "portfolio_review"]),
      subjectName: z.string(),
      levelBand: z.string(),
      topicDescription: z.string(),
      questionCount: z.number().default(10),
      difficultyLevel: z.enum(["foundational", "developing", "proficient", "advanced", "mastery"]).default("proficient"),
      // For adaptive: student's current mastery data
      studentStrengths: z.array(z.string()).optional(),
      studentWeaknesses: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const difficultyGuide: Record<string, string> = {
        foundational: "Basic recall and recognition. Simple, direct questions.",
        developing: "Understanding and application. Some multi-step problems.",
        proficient: "Analysis and application. Real-world scenarios, explain reasoning.",
        advanced: "Synthesis and evaluation. Complex problems, multiple approaches.",
        mastery: "Creation and transfer. Novel situations, cross-disciplinary connections.",
      };

      const adaptiveContext = input.studentStrengths?.length || input.studentWeaknesses?.length
        ? `\n\nADAPTIVE CONTEXT (tailor questions to this student):
- Strengths: ${input.studentStrengths?.join(", ") || "Not yet assessed"}
- Areas for growth: ${input.studentWeaknesses?.join(", ") || "Not yet assessed"}
Focus more questions on growth areas while including some strength-area questions for confidence.`
        : "";

      const prompt = `You are an expert assessment designer for a K-12 homeschool program.

SUBJECT: ${input.subjectName}
TOPIC: ${input.topicDescription}
LEVEL: ${input.levelBand}
ASSESSMENT TYPE: ${input.assessmentType}
DIFFICULTY: ${input.difficultyLevel} - ${difficultyGuide[input.difficultyLevel]}
NUMBER OF QUESTIONS: ${input.questionCount}
${adaptiveContext}

Generate an assessment with this JSON structure:
{
  "title": "Assessment title",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "stem": "Question text...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "Why this is correct...",
      "difficulty": "proficient",
      "standard": "CCSS.MATH.4.NBT.1",
      "points": 10,
      "tags": ["addition", "place_value"]
    }
  ],
  "totalPoints": 100,
  "passingScore": 70,
  "timeLimit": 30
}

Question types to use:
- multiple_choice: 4 options (A-D)
- true_false: true/false with explanation
- short_answer: open response with expected answer
- fill_blank: sentence with blank(s)
- matching: pairs to match
- coding: for STEM subjects, code-based problems

Requirements:
- Use REAL, factually accurate content
- Questions should progressively increase in difficulty
- Include clear, educational explanations for every answer
- Tag each question with relevant standards and topics
- For ${input.assessmentType}, focus on ${input.assessmentType === "lesson_check" ? "quick comprehension verification (3-5 questions)" : input.assessmentType === "unit_quiz" ? "comprehensive unit coverage" : input.assessmentType === "mastery_exam" ? "deep understanding across all unit topics" : input.assessmentType === "practice_set" ? "varied practice without grading pressure" : "structured evaluation criteria"}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert assessment designer. Return ONLY valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "assessment",
            strict: false,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                questions: { type: "array", items: { type: "object" } },
                totalPoints: { type: "integer" },
                passingScore: { type: "integer" },
                timeLimit: { type: "integer" },
              },
              required: ["title", "questions", "totalPoints"],
            },
          },
        },
      });

      const assessment = JSON.parse(response.choices[0].message.content || "{}");

      // Insert assessment
      const [inserted] = await db.insert(academyAssessments).values({
        unitId: input.unitId,
        lessonId: input.lessonId,
        title: assessment.title || `${input.subjectName} - ${input.assessmentType}`,
        assessmentType: input.assessmentType,
        questions: assessment.questions,
        totalPoints: assessment.totalPoints || 100,
        passingScore: assessment.passingScore || 70,
        timeLimit: assessment.timeLimit,
        adaptiveDifficulty: true,
        difficultyLevel: input.difficultyLevel,
        aiGenerated: true,
        humanReviewed: false,
        status: "ai_generated",
      });

      // Log generation
      await db.insert(academyContentGenLog).values({
        generationType: "assessment_questions",
        targetType: "assessment",
        targetId: Number((inserted as any).insertId),
        prompt: prompt.substring(0, 5000),
        generatedContent: assessment,
        generatedBy: ctx.user.id,
        status: "completed",
      });

      return { success: true, assessmentId: Number((inserted as any).insertId), assessment };
    }),

  // ============================================
  // HUMAN COLLABORATION
  // ============================================

  addHumanNote: protectedProcedure
    .input(z.object({
      targetType: z.enum(["unit", "lesson", "assessment"]),
      targetId: z.number(),
      noteType: z.enum([
        "cultural_context", "real_world_example", "teaching_tip", "laws_connection",
        "differentiation", "parent_guidance", "correction", "enrichment"
      ]),
      title: z.string().optional(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [inserted] = await db.insert(academyHumanNotes).values({
        ...input,
        authorId: ctx.user.id,
        isPublished: false,
      });

      return { success: true, noteId: Number((inserted as any).insertId) };
    }),

  getHumanNotes: protectedProcedure
    .input(z.object({
      targetType: z.enum(["unit", "lesson", "assessment"]),
      targetId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(academyHumanNotes)
        .where(and(
          eq(academyHumanNotes.targetType, input.targetType),
          eq(academyHumanNotes.targetId, input.targetId)
        ))
        .orderBy(desc(academyHumanNotes.createdAt));
    }),

  publishHumanNote: protectedProcedure
    .input(z.object({ noteId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(academyHumanNotes)
        .set({ isPublished: true })
        .where(eq(academyHumanNotes.id, input.noteId));
      return { success: true };
    }),

  reviewContent: protectedProcedure
    .input(z.object({
      contentType: z.enum(["unit", "lesson", "assessment"]),
      contentId: z.number(),
      approved: z.boolean(),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const newStatus = input.approved ? "approved" : "human_review";
      const reviewData = {
        humanReviewed: input.approved,
        reviewedBy: ctx.user.id,
        reviewedAt: new Date(),
        status: newStatus as any,
      };

      if (input.contentType === "unit") {
        await db.update(academyUnits).set(reviewData).where(eq(academyUnits.id, input.contentId));
      } else if (input.contentType === "lesson") {
        await db.update(academyUnitLessons).set(reviewData).where(eq(academyUnitLessons.id, input.contentId));
      } else {
        await db.update(academyAssessments).set(reviewData).where(eq(academyAssessments.id, input.contentId));
      }

      // If approved, also set to active
      if (input.approved) {
        const activeData = { status: "active" as any };
        if (input.contentType === "unit") {
          await db.update(academyUnits).set(activeData).where(eq(academyUnits.id, input.contentId));
        } else if (input.contentType === "lesson") {
          await db.update(academyUnitLessons).set(activeData).where(eq(academyUnitLessons.id, input.contentId));
        } else {
          await db.update(academyAssessments).set(activeData).where(eq(academyAssessments.id, input.contentId));
        }
      }

      return { success: true };
    }),

  // ============================================
  // ASSESSMENT SUBMISSION & SCORING
  // ============================================

  submitAssessment: protectedProcedure
    .input(z.object({
      assessmentId: z.number(),
      answers: z.array(z.object({
        questionId: z.string(),
        answer: z.string(),
      })),
      timeSpentMinutes: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get the assessment
      const [assessment] = await db.select().from(academyAssessments)
        .where(eq(academyAssessments.id, input.assessmentId));
      if (!assessment) throw new Error("Assessment not found");

      // Get student profile
      const [profile] = await db.select().from(studentProfiles)
        .where(eq(studentProfiles.userId, ctx.user.id));
      if (!profile) throw new Error("Student profile not found. Please create one first.");

      const questions = (assessment.questions as any[]) || [];

      // Score each answer
      const scoredAnswers = input.answers.map(a => {
        const question = questions.find((q: any) => q.id === a.questionId);
        if (!question) return { ...a, isCorrect: false, pointsEarned: 0 };

        let isCorrect = false;
        if (question.type === "multiple_choice" || question.type === "true_false") {
          isCorrect = a.answer.trim().toUpperCase() === (question.correctAnswer || "").trim().toUpperCase();
        } else if (question.type === "fill_blank") {
          isCorrect = a.answer.trim().toLowerCase() === (question.correctAnswer || "").trim().toLowerCase();
        } else {
          // For short_answer, essay, coding — mark for AI review
          isCorrect = false; // Will be AI-scored below
        }

        return {
          ...a,
          isCorrect,
          pointsEarned: isCorrect ? (question.points || 10) : 0,
        };
      });

      // AI-score open-ended questions
      const openEndedAnswers = scoredAnswers.filter(a => {
        const q = questions.find((q: any) => q.id === a.questionId);
        return q && ["short_answer", "essay", "coding"].includes(q.type);
      });

      if (openEndedAnswers.length > 0) {
        const scoringPrompt = openEndedAnswers.map(a => {
          const q = questions.find((q: any) => q.id === a.questionId);
          return `Question: ${q.stem}\nExpected: ${q.correctAnswer}\nStudent Answer: ${a.answer}\nPoints possible: ${q.points || 10}`;
        }).join("\n\n---\n\n");

        try {
          const scoringResponse = await invokeLLM({
            messages: [
              { role: "system", content: "You are a fair, encouraging teacher scoring student answers. Return JSON array of { questionId, pointsEarned, isCorrect, feedback }. Be generous with partial credit. Max points per question as specified." },
              { role: "user", content: scoringPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "scoring",
                strict: false,
                schema: {
                  type: "object",
                  properties: {
                    scores: { type: "array", items: { type: "object" } },
                  },
                  required: ["scores"],
                },
              },
            },
          });

          const aiScores = JSON.parse(scoringResponse.choices[0].message.content || '{"scores":[]}');
          for (const score of aiScores.scores || []) {
            const idx = scoredAnswers.findIndex(a => a.questionId === score.questionId);
            if (idx >= 0) {
              scoredAnswers[idx].isCorrect = score.isCorrect;
              scoredAnswers[idx].pointsEarned = score.pointsEarned;
            }
          }
        } catch (e) {
          console.error("AI scoring failed, marking open-ended as needs review:", e);
        }
      }

      const totalScore = scoredAnswers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
      const percentageScore = Math.round((totalScore / (assessment.totalPoints || 100)) * 100);
      const passed = percentageScore >= (assessment.passingScore || 70);

      // Get attempt number
      const existingAttempts = await db.select().from(academyAssessmentResults)
        .where(and(
          eq(academyAssessmentResults.assessmentId, input.assessmentId),
          eq(academyAssessmentResults.studentProfileId, profile.id)
        ));

      // Generate AI feedback
      let aiFeedback = "";
      let strengthAreas: string[] = [];
      let improvementAreas: string[] = [];
      let recommendedNextSteps: any[] = [];

      try {
        const feedbackResponse = await invokeLLM({
          messages: [
            { role: "system", content: "You are an encouraging, supportive tutor providing assessment feedback. Be specific about what the student did well and where they can improve. Return JSON." },
            { role: "user", content: `Student scored ${percentageScore}% (${totalScore}/${assessment.totalPoints}). ${passed ? "PASSED" : "Did not pass (needs " + assessment.passingScore + "%)"}.\n\nResults:\n${scoredAnswers.map(a => {
              const q = questions.find((q: any) => q.id === a.questionId);
              return `- ${q?.stem?.substring(0, 100)}: ${a.isCorrect ? "✓ Correct" : "✗ Incorrect"} (${a.pointsEarned} pts)`;
            }).join("\n")}\n\nReturn JSON: { "feedback": "personalized feedback paragraph", "strengths": ["topic1"], "improvements": ["topic1"], "nextSteps": [{"type": "review_lesson", "reason": "..."}] }` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "feedback",
              strict: false,
              schema: {
                type: "object",
                properties: {
                  feedback: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                  nextSteps: { type: "array", items: { type: "object" } },
                },
                required: ["feedback"],
              },
            },
          },
        });

        const fb = JSON.parse(feedbackResponse.choices[0].message.content || "{}");
        aiFeedback = fb.feedback || "";
        strengthAreas = fb.strengths || [];
        improvementAreas = fb.improvements || [];
        recommendedNextSteps = fb.nextSteps || [];
      } catch (e) {
        aiFeedback = passed
          ? `Great job! You scored ${percentageScore}%. Keep up the excellent work!`
          : `You scored ${percentageScore}%. Review the material and try again — you're making progress!`;
      }

      // Save result
      const [result] = await db.insert(academyAssessmentResults).values({
        assessmentId: input.assessmentId,
        studentProfileId: profile.id,
        attemptNumber: existingAttempts.length + 1,
        answers: scoredAnswers,
        totalScore,
        percentageScore,
        passed,
        difficultyAtStart: assessment.difficultyLevel,
        difficultyAtEnd: assessment.difficultyLevel,
        aiFeedback,
        strengthAreas,
        improvementAreas,
        recommendedNextSteps,
        timeSpentMinutes: input.timeSpentMinutes,
        completedAt: new Date(),
      });

      return {
        success: true,
        resultId: Number((result as any).insertId),
        totalScore,
        percentageScore,
        passed,
        aiFeedback,
        strengthAreas,
        improvementAreas,
        recommendedNextSteps,
        scoredAnswers,
      };
    }),

  // ============================================
  // STUDENT PROGRESS & MASTERY
  // ============================================

  getMyProgress: protectedProcedure
    .input(z.object({ subjectId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { profile: null, mastery: [], assessmentResults: [] };

      const [profile] = await db.select().from(studentProfiles)
        .where(eq(studentProfiles.userId, ctx.user.id));
      if (!profile) return { profile: null, mastery: [], assessmentResults: [] };

      const conditions = [eq(academyMasteryTracking.studentProfileId, profile.id)];
      if (input.subjectId) conditions.push(eq(academyMasteryTracking.subjectId, input.subjectId));

      const mastery = await db.select().from(academyMasteryTracking)
        .where(and(...conditions))
        .orderBy(desc(academyMasteryTracking.updatedAt));

      const assessmentResults = await db.select().from(academyAssessmentResults)
        .where(eq(academyAssessmentResults.studentProfileId, profile.id))
        .orderBy(desc(academyAssessmentResults.completedAt))
        .limit(20);

      return { profile, mastery, assessmentResults };
    }),

  getAssessmentsByUnit: protectedProcedure
    .input(z.object({ unitId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(academyAssessments)
        .where(eq(academyAssessments.unitId, input.unitId))
        .orderBy(asc(academyAssessments.createdAt));
    }),

  getAssessmentById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [assessment] = await db.select().from(academyAssessments)
        .where(eq(academyAssessments.id, input.id));
      return assessment || null;
    }),

  getMyAssessmentResults: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const [profile] = await db.select().from(studentProfiles)
        .where(eq(studentProfiles.userId, ctx.user.id));
      if (!profile) return [];
      return db.select().from(academyAssessmentResults)
        .where(and(
          eq(academyAssessmentResults.assessmentId, input.assessmentId),
          eq(academyAssessmentResults.studentProfileId, profile.id)
        ))
        .orderBy(desc(academyAssessmentResults.attemptNumber));
    }),

  // ============================================
  // ADMIN: CURRICULUM MANAGEMENT
  // ============================================

  createSubject: protectedProcedure
    .input(z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      category: z.enum(["core_academic", "stem_extended", "creative_arts", "life_skills", "laws_framework"]),
      iconEmoji: z.string().optional(),
      standardsAlignment: z.string().optional(),
      gradeRange: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [inserted] = await db.insert(academySubjects).values({ ...input, orderIndex: 0 });
      return { success: true, subjectId: Number((inserted as any).insertId) };
    }),

  createUnit: protectedProcedure
    .input(z.object({
      subjectId: z.number(),
      title: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      levelBand: z.enum(["early_elementary", "upper_elementary", "middle_school", "high_school_intro", "high_school_adv", "certification"]),
      estimatedHours: z.number().optional(),
      standardsCovered: z.array(z.string()).optional(),
      learningObjectives: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [inserted] = await db.insert(academyUnits).values({
        ...input,
        orderIndex: 0,
        status: "draft",
      });
      return { success: true, unitId: Number((inserted as any).insertId) };
    }),

  createLesson: protectedProcedure
    .input(z.object({
      unitId: z.number(),
      title: z.string(),
      slug: z.string(),
      summary: z.string().optional(),
      contentType: z.enum(["instruction", "practice", "exploration", "project", "discussion", "lab", "reading", "simulation"]).default("instruction"),
      contentBlocks: z.any().optional(),
      estimatedMinutes: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [inserted] = await db.insert(academyUnitLessons).values({
        ...input,
        orderIndex: 0,
        status: "draft",
      });
      return { success: true, lessonId: Number((inserted as any).insertId) };
    }),

  updateLesson: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      summary: z.string().optional(),
      contentBlocks: z.any().optional(),
      vocabularyTerms: z.any().optional(),
      resources: z.any().optional(),
      estimatedMinutes: z.number().optional(),
      status: z.enum(["draft", "ai_generated", "human_review", "approved", "active", "archived"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { id, ...updates } = input;
      await db.update(academyUnitLessons).set(updates as any).where(eq(academyUnitLessons.id, id));
      return { success: true };
    }),

  // ============================================
  // AI UNIT OUTLINE GENERATION
  // ============================================

  generateUnitOutline: protectedProcedure
    .input(z.object({
      subjectId: z.number(),
      subjectName: z.string(),
      levelBand: z.enum(["early_elementary", "upper_elementary", "middle_school", "high_school_intro", "high_school_adv", "certification"]),
      topicArea: z.string(), // e.g., "Fractions", "The Solar System", "American Revolution"
      additionalContext: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const prompt = `You are an expert K-12 curriculum designer. Create a complete unit outline for a homeschool program.

SUBJECT: ${input.subjectName}
TOPIC: ${input.topicArea}
LEVEL: ${input.levelBand}
${input.additionalContext ? `CONTEXT: ${input.additionalContext}` : ""}

Generate a unit with 5-8 lessons. Return JSON:
{
  "title": "Unit title",
  "description": "Unit description (2-3 sentences)",
  "estimatedHours": 15,
  "standardsCovered": ["CCSS.MATH.4.NF.1", "..."],
  "learningObjectives": ["Students will be able to...", "..."],
  "lessons": [
    {
      "title": "Lesson title",
      "type": "instruction",
      "summary": "Brief lesson description",
      "estimatedMinutes": 30,
      "standardsCovered": ["CCSS.MATH.4.NF.1"]
    }
  ]
}

Use REAL educational standards. Lessons should follow a logical progression from introduction to mastery.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert curriculum designer. Return ONLY valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "unit_outline",
            strict: false,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                estimatedHours: { type: "integer" },
                standardsCovered: { type: "array", items: { type: "string" } },
                learningObjectives: { type: "array", items: { type: "string" } },
                lessons: { type: "array", items: { type: "object" } },
              },
              required: ["title", "description", "lessons"],
            },
          },
        },
      });

      const outline = JSON.parse(response.choices[0].message.content || "{}");

      // Insert unit
      const unitSlug = outline.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
      const [unitInserted] = await db.insert(academyUnits).values({
        subjectId: input.subjectId,
        title: outline.title,
        slug: unitSlug,
        description: outline.description,
        levelBand: input.levelBand,
        estimatedHours: outline.estimatedHours || 15,
        standardsCovered: outline.standardsCovered,
        learningObjectives: outline.learningObjectives,
        aiGenerated: true,
        humanReviewed: false,
        status: "ai_generated",
        orderIndex: 0,
      });

      const unitId = Number((unitInserted as any).insertId);

      // Insert lesson stubs
      const lessonIds: number[] = [];
      for (let i = 0; i < (outline.lessons || []).length; i++) {
        const lesson = outline.lessons[i];
        const lessonSlug = lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
        const [lessonInserted] = await db.insert(academyUnitLessons).values({
          unitId,
          title: lesson.title,
          slug: lessonSlug,
          summary: lesson.summary,
          contentType: lesson.type || "instruction",
          estimatedMinutes: lesson.estimatedMinutes || 30,
          standardsCovered: lesson.standardsCovered,
          orderIndex: i,
          aiGenerated: true,
          humanReviewed: false,
          status: "ai_generated",
        });
        lessonIds.push(Number((lessonInserted as any).insertId));
      }

      // Log generation
      await db.insert(academyContentGenLog).values({
        generationType: "unit_outline",
        targetType: "unit",
        targetId: unitId,
        prompt: prompt.substring(0, 5000),
        generatedContent: outline,
        generatedBy: ctx.user.id,
        status: "completed",
      });

      return { success: true, unitId, lessonIds, outline };
    }),

  // ============================================
  // CONTENT GENERATION LOG
  // ============================================

  getContentGenLog: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(academyContentGenLog)
        .orderBy(desc(academyContentGenLog.createdAt))
        .limit(input.limit);
    }),
});
