/**
 * Virtual Library Quiz System
 * Handles book quizzes, quiz attempts, and reading verification
 */

// Quiz types
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'matching';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type AttemptStatus = 'in_progress' | 'completed' | 'passed' | 'failed';

export interface QuizQuestion {
  id: string;
  questionText: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  pillar?: string; // L.A.W.S. pillar connection
}

export interface BookQuiz {
  id: string;
  bookId: string;
  bookTitle: string;
  difficulty: QuizDifficulty;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // minutes
  maxAttempts: number;
  certificateAwarded: boolean;
  tokensAwarded: number;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  answers: Record<string, string | string[]>;
  score: number;
  maxScore: number;
  percentScore: number;
  status: AttemptStatus;
  timeSpent?: number; // seconds
}

export interface QuizResult {
  attemptId: string;
  passed: boolean;
  score: number;
  maxScore: number;
  percentScore: number;
  correctAnswers: number;
  totalQuestions: number;
  pillarScores: Record<string, { correct: number; total: number; percent: number }>;
  feedback: string[];
  certificateId?: string;
  tokensEarned: number;
}

// Create a new quiz for a book
export function createBookQuiz(
  bookId: string,
  bookTitle: string,
  questions: Omit<QuizQuestion, 'id'>[],
  options: {
    difficulty?: QuizDifficulty;
    passingScore?: number;
    timeLimit?: number;
    maxAttempts?: number;
    tokensAwarded?: number;
  } = {}
): BookQuiz {
  const questionsWithIds = questions.map((q, index) => ({
    ...q,
    id: `Q-${bookId}-${index + 1}`
  }));

  return {
    id: `QUIZ-${bookId}`,
    bookId,
    bookTitle,
    difficulty: options.difficulty || 'medium',
    questions: questionsWithIds,
    passingScore: options.passingScore || 70,
    timeLimit: options.timeLimit,
    maxAttempts: options.maxAttempts || 3,
    certificateAwarded: true,
    tokensAwarded: options.tokensAwarded || 50,
    createdAt: new Date().toISOString()
  };
}

// Start a quiz attempt
export function startQuizAttempt(quizId: string, userId: string): QuizAttempt {
  return {
    id: `ATTEMPT-${Date.now()}`,
    quizId,
    userId,
    startedAt: new Date().toISOString(),
    answers: {},
    score: 0,
    maxScore: 0,
    percentScore: 0,
    status: 'in_progress'
  };
}

// Submit an answer
export function submitAnswer(
  attempt: QuizAttempt,
  questionId: string,
  answer: string | string[]
): QuizAttempt {
  if (attempt.status !== 'in_progress') {
    throw new Error('Cannot submit answers to a completed attempt');
  }

  return {
    ...attempt,
    answers: {
      ...attempt.answers,
      [questionId]: answer
    }
  };
}

// Grade a quiz attempt
export function gradeQuizAttempt(
  attempt: QuizAttempt,
  quiz: BookQuiz
): QuizResult {
  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  const pillarScores: Record<string, { correct: number; total: number; percent: number }> = {};
  const feedback: string[] = [];

  quiz.questions.forEach(question => {
    maxScore += question.points;
    const userAnswer = attempt.answers[question.id];
    
    // Track pillar scores
    if (question.pillar) {
      if (!pillarScores[question.pillar]) {
        pillarScores[question.pillar] = { correct: 0, total: 0, percent: 0 };
      }
      pillarScores[question.pillar].total += 1;
    }

    // Check answer
    let isCorrect = false;
    if (Array.isArray(question.correctAnswer)) {
      // Multiple correct answers (matching)
      if (Array.isArray(userAnswer)) {
        isCorrect = question.correctAnswer.every(a => userAnswer.includes(a)) &&
                    userAnswer.every(a => question.correctAnswer.includes(a));
      }
    } else {
      // Single correct answer
      isCorrect = userAnswer?.toString().toLowerCase() === question.correctAnswer.toLowerCase();
    }

    if (isCorrect) {
      totalScore += question.points;
      correctCount++;
      if (question.pillar) {
        pillarScores[question.pillar].correct += 1;
      }
    } else if (question.explanation) {
      feedback.push(`Question: "${question.questionText.substring(0, 50)}..." - ${question.explanation}`);
    }
  });

  // Calculate pillar percentages
  Object.keys(pillarScores).forEach(pillar => {
    const ps = pillarScores[pillar];
    ps.percent = Math.round((ps.correct / ps.total) * 100);
  });

  const percentScore = Math.round((totalScore / maxScore) * 100);
  const passed = percentScore >= quiz.passingScore;

  // Generate certificate if passed
  const certificateId = passed ? `CERT-${quiz.bookId}-${Date.now()}` : undefined;
  const tokensEarned = passed ? quiz.tokensAwarded : 0;

  return {
    attemptId: attempt.id,
    passed,
    score: totalScore,
    maxScore,
    percentScore,
    correctAnswers: correctCount,
    totalQuestions: quiz.questions.length,
    pillarScores,
    feedback: feedback.slice(0, 5), // Limit feedback to 5 items
    certificateId,
    tokensEarned
  };
}

// Complete a quiz attempt
export function completeQuizAttempt(
  attempt: QuizAttempt,
  quiz: BookQuiz
): QuizAttempt {
  const result = gradeQuizAttempt(attempt, quiz);
  const timeSpent = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);

  return {
    ...attempt,
    completedAt: new Date().toISOString(),
    score: result.score,
    maxScore: result.maxScore,
    percentScore: result.percentScore,
    status: result.passed ? 'passed' : 'failed',
    timeSpent
  };
}

// Check if user can attempt quiz
export function canAttemptQuiz(
  userId: string,
  quiz: BookQuiz,
  previousAttempts: QuizAttempt[]
): { canAttempt: boolean; reason?: string; attemptsRemaining: number } {
  const userAttempts = previousAttempts.filter(
    a => a.userId === userId && a.quizId === quiz.id && a.status !== 'in_progress'
  );

  const passedAttempt = userAttempts.find(a => a.status === 'passed');
  if (passedAttempt) {
    return {
      canAttempt: false,
      reason: 'You have already passed this quiz',
      attemptsRemaining: 0
    };
  }

  const attemptsRemaining = quiz.maxAttempts - userAttempts.length;
  if (attemptsRemaining <= 0) {
    return {
      canAttempt: false,
      reason: 'Maximum attempts reached',
      attemptsRemaining: 0
    };
  }

  return {
    canAttempt: true,
    attemptsRemaining
  };
}

// Get quiz statistics
export function getQuizStatistics(
  quiz: BookQuiz,
  attempts: QuizAttempt[]
): {
  totalAttempts: number;
  uniqueUsers: number;
  passRate: number;
  averageScore: number;
  averageTimeSpent: number;
  questionStats: Array<{
    questionId: string;
    correctRate: number;
    averageTime?: number;
  }>;
} {
  const completedAttempts = attempts.filter(a => a.status !== 'in_progress');
  const uniqueUsers = new Set(completedAttempts.map(a => a.userId)).size;
  const passedAttempts = completedAttempts.filter(a => a.status === 'passed');
  
  const passRate = completedAttempts.length > 0
    ? Math.round((passedAttempts.length / completedAttempts.length) * 100)
    : 0;

  const averageScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((sum, a) => sum + a.percentScore, 0) / completedAttempts.length)
    : 0;

  const attemptsWithTime = completedAttempts.filter(a => a.timeSpent);
  const averageTimeSpent = attemptsWithTime.length > 0
    ? Math.round(attemptsWithTime.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / attemptsWithTime.length)
    : 0;

  // Question-level stats
  const questionStats = quiz.questions.map(question => {
    let correctCount = 0;
    completedAttempts.forEach(attempt => {
      const userAnswer = attempt.answers[question.id];
      if (Array.isArray(question.correctAnswer)) {
        if (Array.isArray(userAnswer) &&
            question.correctAnswer.every(a => userAnswer.includes(a))) {
          correctCount++;
        }
      } else if (userAnswer?.toString().toLowerCase() === question.correctAnswer.toLowerCase()) {
        correctCount++;
      }
    });

    return {
      questionId: question.id,
      correctRate: completedAttempts.length > 0
        ? Math.round((correctCount / completedAttempts.length) * 100)
        : 0
    };
  });

  return {
    totalAttempts: completedAttempts.length,
    uniqueUsers,
    passRate,
    averageScore,
    averageTimeSpent,
    questionStats
  };
}

// Generate reading certificate
export function generateReadingCertificate(
  userId: string,
  userName: string,
  quiz: BookQuiz,
  result: QuizResult
): {
  certificateId: string;
  userId: string;
  userName: string;
  bookTitle: string;
  score: number;
  completedAt: string;
  content: string;
  tokensAwarded: number;
} {
  if (!result.passed) {
    throw new Error('Cannot generate certificate for failed attempt');
  }

  const content = `
CERTIFICATE OF COMPLETION

This certifies that

${userName}

has successfully completed the reading assessment for

"${quiz.bookTitle}"

Score: ${result.percentScore}%
Correct Answers: ${result.correctAnswers}/${result.totalQuestions}
Completed: ${new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}

${Object.keys(result.pillarScores).length > 0 ? `
L.A.W.S. Pillar Mastery:
${Object.entries(result.pillarScores)
  .map(([pillar, score]) => `  ${pillar}: ${score.percent}%`)
  .join('\n')}
` : ''}

Certificate ID: ${result.certificateId}
Tokens Awarded: ${result.tokensEarned}

This certificate verifies completion of the reading assessment
and demonstrates understanding of the material covered.
`.trim();

  return {
    certificateId: result.certificateId!,
    userId,
    userName,
    bookTitle: quiz.bookTitle,
    score: result.percentScore,
    completedAt: new Date().toISOString(),
    content,
    tokensAwarded: result.tokensEarned
  };
}

// Create sample quiz questions for a book
export function createSampleQuestions(
  bookTitle: string,
  pillar: string
): Omit<QuizQuestion, 'id'>[] {
  return [
    {
      questionText: `What is the main theme of "${bookTitle}"?`,
      type: 'multiple_choice',
      options: [
        'Financial independence',
        'Personal growth',
        'Family legacy',
        'All of the above'
      ],
      correctAnswer: 'All of the above',
      explanation: 'The book covers multiple interconnected themes.',
      points: 10,
      pillar
    },
    {
      questionText: 'True or False: Building wealth requires immediate results.',
      type: 'true_false',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: 'Sustainable wealth building is a long-term process.',
      points: 5,
      pillar
    },
    {
      questionText: 'What is the first step in the wealth-building process described?',
      type: 'multiple_choice',
      options: [
        'Invest in stocks',
        'Create a budget',
        'Understand your current situation',
        'Start a business'
      ],
      correctAnswer: 'Understand your current situation',
      explanation: 'Self-awareness is the foundation of financial planning.',
      points: 10,
      pillar
    },
    {
      questionText: 'The book emphasizes the importance of what type of thinking?',
      type: 'multiple_choice',
      options: [
        'Short-term',
        'Generational',
        'Individual',
        'Competitive'
      ],
      correctAnswer: 'Generational',
      explanation: 'Generational thinking ensures lasting family wealth.',
      points: 10,
      pillar
    },
    {
      questionText: 'True or False: Financial literacy should be taught to children.',
      type: 'true_false',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'Early financial education creates lifelong habits.',
      points: 5,
      pillar
    }
  ];
}
