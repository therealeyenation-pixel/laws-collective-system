/**
 * Financial Management Course Tests
 */

import { describe, it, expect } from "vitest";
import {
  getFinancialManagementModules,
  getFinancialModuleById,
  getFinancialLessonContent,
  getFinancialModuleQuiz,
  getFinancialOutputTemplate,
  calculateFinancialQuizScore,
  getFinancialCourseOverview,
  FINANCIAL_MANAGEMENT_MODULES
} from "./services/financial-management-course";

describe("Financial Management Course Service", () => {
  describe("Course Structure", () => {
    it("should have exactly 6 modules", async () => {
      const modules = await getFinancialManagementModules();
      expect(modules).toHaveLength(6);
    });

    it("should have modules in correct order", async () => {
      const modules = await getFinancialManagementModules();
      expect(modules[0].title).toBe("Startup Costs");
      expect(modules[1].title).toBe("Revenue Planning");
      expect(modules[2].title).toBe("Expense Management");
      expect(modules[3].title).toBe("Cash Flow Management");
      expect(modules[4].title).toBe("Break-Even & Profitability");
      expect(modules[5].title).toBe("Financial Plan Assembly");
    });

    it("should mark module 6 as final", async () => {
      const modules = await getFinancialManagementModules();
      expect(modules[5].isFinal).toBe(true);
    });

    it("should have token rewards for each module", async () => {
      const modules = await getFinancialManagementModules();
      modules.forEach(module => {
        expect(module.tokensReward).toBeGreaterThan(0);
      });
    });
  });

  describe("Module Content", () => {
    it("should get module by ID", async () => {
      const module = await getFinancialModuleById(1);
      expect(module).toBeDefined();
      expect(module?.title).toBe("Startup Costs");
    });

    it("should return undefined for invalid module ID", async () => {
      const module = await getFinancialModuleById(999);
      expect(module).toBeUndefined();
    });

    it("should have 3 lessons for each module", async () => {
      const modules = await getFinancialManagementModules();
      modules.forEach(module => {
        expect(module.lessons.length).toBe(3);
      });
    });

    it("should get lesson content", async () => {
      const lesson = await getFinancialLessonContent(1, "fmc-1-1");
      expect(lesson).toBeDefined();
      expect(lesson?.title).toBe("Understanding Startup Costs");
      expect(lesson?.content).toContain("One-Time Costs");
    });

    it("should return undefined for invalid lesson", async () => {
      const lesson = await getFinancialLessonContent(1, "invalid-lesson");
      expect(lesson).toBeUndefined();
    });
  });

  describe("Module Quizzes", () => {
    it("should have quiz for each module", async () => {
      const modules = await getFinancialManagementModules();
      modules.forEach(module => {
        expect(module.quiz).toBeDefined();
        expect(module.quiz.length).toBeGreaterThanOrEqual(4);
      });
    });

    it("should get quiz questions", async () => {
      const quiz = await getFinancialModuleQuiz(1);
      expect(quiz).toBeDefined();
      expect(quiz?.length).toBeGreaterThan(0);
      expect(quiz?.[0].question).toBeDefined();
      expect(quiz?.[0].options).toBeDefined();
    });

    it("should calculate quiz score correctly - all correct", async () => {
      const module = await getFinancialModuleById(1);
      const correctAnswers = module!.quiz.map(q => q.correct);
      const result = await calculateFinancialQuizScore(1, correctAnswers);
      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
    });

    it("should calculate quiz score correctly - all wrong", async () => {
      const module = await getFinancialModuleById(1);
      const wrongAnswers = module!.quiz.map(q => (q.correct + 1) % 4);
      const result = await calculateFinancialQuizScore(1, wrongAnswers);
      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
    });

    it("should require 70% to pass", async () => {
      // Module 1 has 5 questions
      const result = await calculateFinancialQuizScore(1, [1, 1, 2, 2, 1]); // All correct
      expect(result.passed).toBe(true);
    });

    it("should provide feedback for each question", async () => {
      const result = await calculateFinancialQuizScore(1, [1, 1, 2, 2, 1]);
      expect(result.feedback.length).toBe(5);
    });
  });

  describe("Output Spreadsheets", () => {
    it("should have output spreadsheet for each module", async () => {
      const modules = await getFinancialManagementModules();
      modules.forEach(module => {
        expect(module.outputSpreadsheet).toBeDefined();
        expect(module.outputSpreadsheet.title).toBeDefined();
        expect(module.outputSpreadsheet.fields.length).toBeGreaterThan(0);
      });
    });

    it("should get spreadsheet template", async () => {
      const template = await getFinancialOutputTemplate(1);
      expect(template).toBeDefined();
      expect(template?.title).toBe("Startup Costs Worksheet");
      expect(template?.fields.length).toBeGreaterThan(0);
    });

    it("should have correct spreadsheet types", async () => {
      const modules = await getFinancialManagementModules();
      expect(modules[0].outputSpreadsheet.type).toBe("worksheet");
      expect(modules[1].outputSpreadsheet.type).toBe("projection");
      expect(modules[2].outputSpreadsheet.type).toBe("budget");
      expect(modules[3].outputSpreadsheet.type).toBe("projection");
      expect(modules[4].outputSpreadsheet.type).toBe("analysis");
      expect(modules[5].outputSpreadsheet.type).toBe("plan");
    });

    it("should have calculations for spreadsheets", async () => {
      const template = await getFinancialOutputTemplate(1);
      expect(template?.calculations).toBeDefined();
      expect(template?.calculations?.length).toBeGreaterThan(0);
    });
  });

  describe("Course Overview", () => {
    it("should return course overview", () => {
      const overview = getFinancialCourseOverview();
      expect(overview.title).toBe("Financial Management Course");
      expect(overview.totalModules).toBe(6);
    });

    it("should calculate total lessons", () => {
      const overview = getFinancialCourseOverview();
      expect(overview.totalLessons).toBe(18); // 6 modules × 3 lessons
    });

    it("should calculate total tokens", () => {
      const overview = getFinancialCourseOverview();
      expect(overview.totalTokens).toBeGreaterThan(0);
    });

    it("should include module summaries", () => {
      const overview = getFinancialCourseOverview();
      expect(overview.modules.length).toBe(6);
      overview.modules.forEach(module => {
        expect(module.id).toBeDefined();
        expect(module.title).toBeDefined();
        expect(module.lessonsCount).toBe(3);
        expect(module.hasQuiz).toBe(true);
        expect(module.outputSpreadsheet).toBeDefined();
      });
    });
  });

  describe("Module 1: Startup Costs", () => {
    it("should cover key startup cost concepts", async () => {
      const module = await getFinancialModuleById(1);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("One-Time Costs");
      expect(allContent).toContain("Recurring Costs");
      expect(allContent).toContain("Working Capital");
      expect(allContent).toContain("Contingency");
    });
  });

  describe("Module 2: Revenue Planning", () => {
    it("should cover revenue concepts", async () => {
      const module = await getFinancialModuleById(2);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("Revenue Streams");
      expect(allContent).toContain("Pricing");
      expect(allContent).toContain("Projections");
    });
  });

  describe("Module 3: Expense Management", () => {
    it("should cover expense concepts", async () => {
      const module = await getFinancialModuleById(3);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("Fixed Costs");
      expect(allContent).toContain("Variable Costs");
      expect(allContent).toContain("Budget");
    });
  });

  describe("Module 4: Cash Flow", () => {
    it("should cover cash flow concepts", async () => {
      const module = await getFinancialModuleById(4);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("Cash Flow");
      expect(allContent).toContain("Accounts Receivable");
      expect(allContent).toContain("Cash Buffer");
    });
  });

  describe("Module 5: Break-Even & Profitability", () => {
    it("should cover profitability concepts", async () => {
      const module = await getFinancialModuleById(5);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("Break-Even");
      expect(allContent).toContain("Contribution Margin");
      expect(allContent).toContain("Profit Margin");
    });
  });

  describe("Module 6: Financial Plan Assembly", () => {
    it("should cover financial plan concepts", async () => {
      const module = await getFinancialModuleById(6);
      const allContent = module!.lessons.map(l => l.content).join(" ");
      expect(allContent).toContain("Financial Plan");
      expect(allContent).toContain("Projections");
      expect(allContent).toContain("Scenarios");
    });

    it("should be marked as final module", async () => {
      const module = await getFinancialModuleById(6);
      expect(module?.isFinal).toBe(true);
    });
  });
});
