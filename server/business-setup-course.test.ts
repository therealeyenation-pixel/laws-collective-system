/**
 * Business Setup Course Tests
 */

import { describe, it, expect, vi } from "vitest";
import {
  getBusinessSetupModules,
  getModuleById,
  getLessonContent,
  getModuleQuiz,
  getOutputDocumentTemplate,
  calculateQuizScore,
  getCourseOverview,
  BUSINESS_SETUP_MODULES
} from "./services/business-setup-course";

describe("Business Setup Course Service", () => {
  describe("Course Structure", () => {
    it("should have exactly 6 modules", async () => {
      const modules = await getBusinessSetupModules();
      expect(modules).toHaveLength(6);
    });

    it("should have modules in correct order", async () => {
      const modules = await getBusinessSetupModules();
      expect(modules[0].title).toBe("Business Foundations");
      expect(modules[1].title).toBe("Mission & Vision");
      expect(modules[2].title).toBe("Market Research");
      expect(modules[3].title).toBe("Products & Services");
      expect(modules[4].title).toBe("Legal Formation");
      expect(modules[5].title).toBe("Business Plan Assembly");
    });

    it("should mark module 6 as final", async () => {
      const modules = await getBusinessSetupModules();
      expect(modules[5].isFinal).toBe(true);
    });

    it("should have token rewards for each module", async () => {
      const modules = await getBusinessSetupModules();
      modules.forEach(module => {
        expect(module.tokensReward).toBeGreaterThan(0);
      });
    });
  });

  describe("Module Content", () => {
    it("should get module by ID", async () => {
      const module = await getModuleById(1);
      expect(module).toBeDefined();
      expect(module?.title).toBe("Business Foundations");
    });

    it("should return null for invalid module ID", async () => {
      const module = await getModuleById(999);
      expect(module).toBeUndefined();
    });

    it("should have lessons for each module", async () => {
      const modules = await getBusinessSetupModules();
      modules.forEach(module => {
        expect(module.lessons.length).toBeGreaterThan(0);
      });
    });

    it("should get lesson content", async () => {
      const lesson = await getLessonContent(1, "bsc-1-1");
      expect(lesson).toBeDefined();
      expect(lesson?.title).toBe("Introduction to Business Structures");
      expect(lesson?.content).toContain("Understanding the different types of business structures");
    });

    it("should return null for invalid lesson", async () => {
      const lesson = await getLessonContent(1, "invalid-lesson");
      expect(lesson).toBeUndefined();
    });
  });

  describe("Module Quizzes", () => {
    it("should have quiz for each module", async () => {
      const modules = await getBusinessSetupModules();
      modules.forEach(module => {
        expect(module.quiz).toBeDefined();
        expect(module.quiz.length).toBeGreaterThan(0);
      });
    });

    it("should get quiz questions", async () => {
      const quiz = await getModuleQuiz(1);
      expect(quiz).toBeDefined();
      expect(quiz?.length).toBeGreaterThan(0);
      expect(quiz?.[0].question).toBeDefined();
      expect(quiz?.[0].options).toBeDefined();
    });

    it("should calculate quiz score correctly - all correct", async () => {
      const module = await getModuleById(1);
      const correctAnswers = module!.quiz.map(q => q.correct);
      const result = await calculateQuizScore(1, correctAnswers);
      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
    });

    it("should calculate quiz score correctly - all wrong", async () => {
      const module = await getModuleById(1);
      const wrongAnswers = module!.quiz.map(q => (q.correct + 1) % 4);
      const result = await calculateQuizScore(1, wrongAnswers);
      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
    });

    it("should require 70% to pass", async () => {
      // Module 1 has 5 questions, need 4 correct (80%) to pass
      const result = await calculateQuizScore(1, [1, 2, 1, 2, 1]); // All correct
      expect(result.passed).toBe(true);
      
      // 2 correct out of 5 = 40%
      const failResult = await calculateQuizScore(1, [1, 0, 0, 0, 0]);
      expect(failResult.passed).toBe(false);
    });

    it("should provide feedback for each question", async () => {
      const result = await calculateQuizScore(1, [1, 2, 1, 2, 1]);
      expect(result.feedback.length).toBe(5);
    });
  });

  describe("Output Documents", () => {
    it("should have output document for each module", async () => {
      const modules = await getBusinessSetupModules();
      modules.forEach(module => {
        expect(module.outputDocument).toBeDefined();
        expect(module.outputDocument.title).toBeDefined();
        expect(module.outputDocument.fields.length).toBeGreaterThan(0);
      });
    });

    it("should get document template", async () => {
      const template = await getOutputDocumentTemplate(1);
      expect(template).toBeDefined();
      expect(template?.title).toBe("Entity Type Selection Worksheet");
      expect(template?.fields.length).toBeGreaterThan(0);
    });

    it("should have correct document types", async () => {
      const modules = await getBusinessSetupModules();
      expect(modules[0].outputDocument.type).toBe("worksheet");
      expect(modules[1].outputDocument.type).toBe("document");
      expect(modules[2].outputDocument.type).toBe("persona");
      expect(modules[3].outputDocument.type).toBe("catalog");
      expect(modules[4].outputDocument.type).toBe("legal");
      expect(modules[5].outputDocument.type).toBe("business_plan");
    });

    it("should have field definitions with required properties", async () => {
      const template = await getOutputDocumentTemplate(1);
      template?.fields.forEach(field => {
        expect(field.name).toBeDefined();
        expect(field.label).toBeDefined();
        expect(field.type).toBeDefined();
      });
    });
  });

  describe("Course Overview", () => {
    it("should return course overview", () => {
      const overview = getCourseOverview();
      expect(overview.title).toBe("Business Setup Course");
      expect(overview.totalModules).toBe(6);
    });

    it("should calculate total lessons", () => {
      const overview = getCourseOverview();
      expect(overview.totalLessons).toBeGreaterThan(0);
    });

    it("should calculate total tokens", () => {
      const overview = getCourseOverview();
      expect(overview.totalTokens).toBeGreaterThan(0);
    });

    it("should include module summaries", () => {
      const overview = getCourseOverview();
      expect(overview.modules.length).toBe(6);
      overview.modules.forEach(module => {
        expect(module.id).toBeDefined();
        expect(module.title).toBeDefined();
        expect(module.lessonsCount).toBeGreaterThan(0);
        expect(module.hasQuiz).toBe(true);
        expect(module.outputDocument).toBeDefined();
      });
    });
  });

  describe("Module 1: Business Foundations", () => {
    it("should cover all entity types", async () => {
      const module = await getModuleById(1);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("LLC");
      expect(allContent).toContain("Corporation");
      expect(allContent).toContain("Partnership");
      expect(allContent).toContain("Nonprofit");
      expect(allContent).toContain("Trust");
    });
  });

  describe("Module 2: Mission & Vision", () => {
    it("should cover mission and vision concepts", async () => {
      const module = await getModuleById(2);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("Mission Statement");
      expect(allContent).toContain("Vision Statement");
      expect(allContent).toContain("Value Proposition");
    });
  });

  describe("Module 3: Market Research", () => {
    it("should cover market analysis concepts", async () => {
      const module = await getModuleById(3);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("TAM");
      expect(allContent).toContain("Customer Persona");
      expect(allContent).toContain("Competitive Analysis");
      expect(allContent).toContain("SWOT");
    });
  });

  describe("Module 4: Products & Services", () => {
    it("should cover pricing strategies", async () => {
      const module = await getModuleById(4);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("Pricing");
      expect(allContent).toContain("Value-Based");
      expect(allContent).toContain("Revenue Model");
    });
  });

  describe("Module 5: Legal Formation", () => {
    it("should cover legal documents", async () => {
      const module = await getModuleById(5);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("Articles of Organization");
      expect(allContent).toContain("Operating Agreement");
      expect(allContent).toContain("EIN");
    });
  });

  describe("Module 6: Business Plan Assembly", () => {
    it("should cover business plan structure", async () => {
      const module = await getModuleById(6);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("Executive Summary");
      expect(allContent).toContain("Financial Projections");
      expect(allContent).toContain("Marketing Strategy");
    });

    it("should be marked as final module", async () => {
      const module = await getModuleById(6);
      expect(module?.isFinal).toBe(true);
    });
  });
});
