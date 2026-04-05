/**
 * Investment Education & Gamification Router
 * Phase 32.5: Interactive learning modules, quizzes, achievements, and leaderboards
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const getInvestmentCourses = publicProcedure.query(async () => {
  return [
    {
      id: 1,
      title: "Investment Fundamentals",
      description: "Learn the basics of stocks, bonds, and portfolio diversification",
      modules: 5,
      duration: 120,
      difficulty: "beginner",
      topics: ["stocks", "bonds", "diversification", "asset classes", "risk vs. reward"],
      order: 1,
    },
    {
      id: 2,
      title: "Portfolio Construction",
      description: "Master asset allocation, rebalancing, and portfolio design",
      modules: 5,
      duration: 150,
      difficulty: "intermediate",
      topics: ["asset allocation", "rebalancing", "portfolio design", "correlation", "optimization"],
      order: 2,
    },
    {
      id: 3,
      title: "Risk Management",
      description: "Understand volatility, correlation, hedging, and risk mitigation",
      modules: 5,
      duration: 140,
      difficulty: "intermediate",
      topics: ["volatility", "correlation", "hedging", "risk metrics", "downside protection"],
      order: 3,
    },
    {
      id: 4,
      title: "Income Generation",
      description: "Explore dividend strategies, interest income, and yield optimization",
      modules: 5,
      duration: 130,
      difficulty: "intermediate",
      topics: ["dividends", "interest income", "yield strategies", "covered calls", "bond ladders"],
      order: 4,
    },
    {
      id: 5,
      title: "Advanced Strategies",
      description: "Learn options, derivatives, and tax optimization techniques",
      modules: 5,
      duration: 160,
      difficulty: "advanced",
      topics: ["options", "derivatives", "tax optimization", "leverage", "complex strategies"],
      order: 5,
    },
  ];
});

export const getCourseLessons = publicProcedure
  .input(z.object({ courseId: z.number() }))
  .query(async ({ input }) => {
    const courseModules: Record<number, any[]> = {
      1: [
        { id: 1, title: "What Are Stocks?", duration: 20, order: 1 },
        { id: 2, title: "Understanding Bonds", duration: 25, order: 2 },
        { id: 3, title: "Asset Classes Explained", duration: 22, order: 3 },
        { id: 4, title: "Diversification Principles", duration: 28, order: 4 },
        { id: 5, title: "Risk vs. Reward", duration: 25, order: 5 },
      ],
      2: [
        { id: 6, title: "Asset Allocation Basics", duration: 25, order: 1 },
        { id: 7, title: "Building Your Portfolio", duration: 30, order: 2 },
        { id: 8, title: "Rebalancing Strategies", duration: 28, order: 3 },
        { id: 9, title: "Correlation and Diversification", duration: 32, order: 4 },
        { id: 10, title: "Portfolio Optimization", duration: 35, order: 5 },
      ],
      3: [
        { id: 11, title: "Understanding Volatility", duration: 24, order: 1 },
        { id: 12, title: "Correlation Analysis", duration: 26, order: 2 },
        { id: 13, title: "Hedging Techniques", duration: 30, order: 3 },
        { id: 14, title: "Risk Metrics", duration: 28, order: 4 },
        { id: 15, title: "Downside Protection", duration: 32, order: 5 },
      ],
      4: [
        { id: 16, title: "Dividend Investing", duration: 28, order: 1 },
        { id: 17, title: "Interest Income Strategies", duration: 26, order: 2 },
        { id: 18, title: "Yield Optimization", duration: 30, order: 3 },
        { id: 19, title: "Covered Calls", duration: 25, order: 4 },
        { id: 20, title: "Bond Ladders", duration: 27, order: 5 },
      ],
      5: [
        { id: 21, title: "Options Basics", duration: 32, order: 1 },
        { id: 22, title: "Derivatives Overview", duration: 35, order: 2 },
        { id: 23, title: "Tax Optimization", duration: 30, order: 3 },
        { id: 24, title: "Leverage and Margin", duration: 28, order: 4 },
        { id: 25, title: "Complex Strategies", duration: 35, order: 5 },
      ],
    };
    return courseModules[input.courseId] || [];
  });

export const getLessonQuiz = publicProcedure
  .input(z.object({ lessonId: z.number() }))
  .query(async ({ input }) => {
    const quizzes: Record<number, any> = {
      1: {
        title: "What Are Stocks? Quiz",
        questions: [
          {
            id: 1,
            question: "What does a stock represent?",
            options: ["Ownership in a company", "A loan to a company", "A promise to pay dividends", "A type of insurance"],
            correctAnswer: 0,
            explanation: "A stock represents partial ownership in a company.",
          },
          {
            id: 2,
            question: "How do investors earn money from stocks?",
            options: ["Interest payments", "Capital appreciation and dividends", "Fixed returns", "Tax deductions"],
            correctAnswer: 1,
            explanation: "Investors earn through capital appreciation (price increase) and dividends.",
          },
          {
            id: 3,
            question: "What is a dividend?",
            options: ["A fee charged by brokers", "A payment made by companies to shareholders", "A type of stock split", "A trading strategy"],
            correctAnswer: 1,
            explanation: "A dividend is a payment made by a company to its shareholders.",
          },
        ],
      },
    };
    return quizzes[input.lessonId] || { title: "Quiz", questions: [] };
  });

export const submitQuizAnswers = protectedProcedure
  .input(
    z.object({
      lessonId: z.number(),
      courseId: z.number(),
      answers: z.array(z.object({ questionId: z.number(), selectedAnswer: z.number() })),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const correctAnswers = input.answers.filter(() => Math.random() > 0.3).length;
    const score = Math.round((correctAnswers / input.answers.length) * 100);
    const passed = score >= 70;
    return {
      score,
      passed,
      correctAnswers,
      totalQuestions: input.answers.length,
      feedback: passed ? "Great job! You've mastered this lesson." : "Keep studying! Review the material and try again.",
    };
  });

export const getMemberCourseProgress = protectedProcedure.query(async ({ ctx }) => {
  return {
    userId: ctx.user.id,
    coursesEnrolled: [
      {
        courseId: 1,
        title: "Investment Fundamentals",
        progress: 60,
        lessonsCompleted: 3,
        totalLessons: 5,
        quizzesCompleted: 3,
        averageScore: 82,
        status: "in_progress",
      },
    ],
    certificationsEarned: [
      { id: 1, name: "Investment Literacy Certificate", earnedAt: new Date("2026-03-15"), courseId: 1 },
    ],
  };
});

export const getMemberAchievements = protectedProcedure.query(async ({ ctx }) => {
  return {
    userId: ctx.user.id,
    totalAchievements: 3,
    achievements: [
      { id: 1, name: "First Lesson", description: "Complete your first investment lesson", icon: "🎓", earnedAt: new Date("2026-03-10"), rarity: "common" },
      { id: 2, name: "Quiz Master", description: "Score 90% or higher on 5 quizzes", icon: "🏆", earnedAt: new Date("2026-03-15"), rarity: "rare" },
    ],
    streakDays: 7,
    nextMilestone: "10 achievements",
  };
});

export const getInvestmentLeaderboard = publicProcedure
  .input(z.object({ limit: z.number().default(10), timeframe: z.enum(["all_time", "month", "week"]).default("all_time") }))
  .query(async ({ input }) => {
    return {
      timeframe: input.timeframe,
      leaderboard: [
        { rank: 1, memberId: 1, memberName: "Alex Johnson", totalScore: 2850, coursesCompleted: 3, certificationsEarned: 2, achievements: 12, streak: 15 },
        { rank: 2, memberId: 2, memberName: "Maria Garcia", totalScore: 2720, coursesCompleted: 3, certificationsEarned: 2, achievements: 11, streak: 12 },
      ],
      totalParticipants: 47,
    };
  });

export const getInvestmentChallenges = publicProcedure.query(async () => {
  return [
    { id: 1, title: "March Trading Challenge", description: "Build the best performing portfolio in March", type: "trading", startDate: new Date("2026-03-01"), endDate: new Date("2026-03-31"), prize: "500 tokens", participants: 23, status: "active" },
  ];
});

export const enrollInCourse = protectedProcedure
  .input(z.object({ courseId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    return { success: true, enrollmentId: Math.random(), courseId: input.courseId, enrolledAt: new Date(), message: "Successfully enrolled in course" };
  });

export const completeLessonMutation = protectedProcedure
  .input(z.object({ lessonId: z.number(), courseId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    return { success: true, lessonId: input.lessonId, completedAt: new Date(), progressUpdate: { lessonsCompleted: 4, totalLessons: 5, progress: 80 } };
  });

export const getMemberRankStats = protectedProcedure.query(async ({ ctx }) => {
  return {
    userId: ctx.user.id,
    currentRank: 12,
    totalMembers: 47,
    totalScore: 1850,
    coursesCompleted: 2,
    certificationsEarned: 1,
    achievements: 8,
    streakDays: 5,
    percentileRank: 75,
    nextRankThreshold: 2100,
    pointsToNextRank: 250,
  };
});

export const getCertificationDetails = protectedProcedure
  .input(z.object({ certificationType: z.enum(["literacy", "portfolio_manager", "advisor"]) }))
  .query(async ({ input }) => {
    const certifications: Record<string, any> = {
      literacy: {
        name: "Investment Literacy Certificate",
        description: "Demonstrate foundational knowledge of investment principles",
        requirements: ["Complete Investment Fundamentals course", "Score 80%+ on final exam", "Complete 3 quizzes with 70%+ average"],
        coursesRequired: [1],
        estimatedTime: "4 weeks",
        value: "High - Shows investment fundamentals knowledge",
      },
    };
    return certifications[input.certificationType];
  });

export const investmentEducationRouter = router({
  getInvestmentCourses,
  getCourseLessons,
  getLessonQuiz,
  submitQuizAnswers,
  getMemberCourseProgress,
  getMemberAchievements,
  getInvestmentLeaderboard,
  getInvestmentChallenges,
  enrollInCourse,
  completeLessonMutation,
  getMemberRankStats,
  getCertificationDetails,
});
