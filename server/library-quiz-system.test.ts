import { describe, it, expect } from 'vitest';
import {
  createBookQuiz,
  startQuizAttempt,
  submitAnswer,
  gradeQuizAttempt,
  completeQuizAttempt,
  canAttemptQuiz,
  getQuizStatistics,
  generateReadingCertificate,
  createSampleQuestions
} from './services/library-quiz-system';

describe('Library Quiz System', () => {
  const sampleQuestions = [
    {
      questionText: 'What is 2 + 2?',
      type: 'multiple_choice' as const,
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      explanation: 'Basic math',
      points: 10,
      pillar: 'SELF'
    },
    {
      questionText: 'True or False: The sky is blue.',
      type: 'true_false' as const,
      options: ['True', 'False'],
      correctAnswer: 'True',
      points: 5,
      pillar: 'AIR'
    },
    {
      questionText: 'What color is grass?',
      type: 'multiple_choice' as const,
      options: ['Red', 'Green', 'Blue', 'Yellow'],
      correctAnswer: 'Green',
      points: 10,
      pillar: 'LAND'
    }
  ];

  describe('createBookQuiz', () => {
    it('should create quiz with default options', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      
      expect(quiz.id).toBe('QUIZ-book-1');
      expect(quiz.bookTitle).toBe('Test Book');
      expect(quiz.questions).toHaveLength(3);
      expect(quiz.difficulty).toBe('medium');
      expect(quiz.passingScore).toBe(70);
      expect(quiz.maxAttempts).toBe(3);
    });

    it('should create quiz with custom options', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions, {
        difficulty: 'hard',
        passingScore: 80,
        timeLimit: 30,
        maxAttempts: 5,
        tokensAwarded: 100
      });
      
      expect(quiz.difficulty).toBe('hard');
      expect(quiz.passingScore).toBe(80);
      expect(quiz.timeLimit).toBe(30);
      expect(quiz.maxAttempts).toBe(5);
      expect(quiz.tokensAwarded).toBe(100);
    });

    it('should assign IDs to questions', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      
      expect(quiz.questions[0].id).toBe('Q-book-1-1');
      expect(quiz.questions[1].id).toBe('Q-book-1-2');
      expect(quiz.questions[2].id).toBe('Q-book-1-3');
    });
  });

  describe('startQuizAttempt', () => {
    it('should create new attempt in progress', () => {
      const attempt = startQuizAttempt('QUIZ-book-1', 'user-1');
      
      expect(attempt.id).toContain('ATTEMPT-');
      expect(attempt.quizId).toBe('QUIZ-book-1');
      expect(attempt.userId).toBe('user-1');
      expect(attempt.status).toBe('in_progress');
      expect(attempt.answers).toEqual({});
    });
  });

  describe('submitAnswer', () => {
    it('should add answer to attempt', () => {
      let attempt = startQuizAttempt('QUIZ-book-1', 'user-1');
      attempt = submitAnswer(attempt, 'Q-book-1-1', '4');
      
      expect(attempt.answers['Q-book-1-1']).toBe('4');
    });

    it('should throw error for completed attempt', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      let attempt = startQuizAttempt('QUIZ-book-1', 'user-1');
      attempt = completeQuizAttempt(attempt, quiz);
      
      expect(() => submitAnswer(attempt, 'Q-book-1-1', '4')).toThrow('completed attempt');
    });
  });

  describe('gradeQuizAttempt', () => {
    it('should grade correct answers', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      let attempt = startQuizAttempt('QUIZ-book-1', 'user-1');
      attempt = submitAnswer(attempt, 'Q-book-1-1', '4');
      attempt = submitAnswer(attempt, 'Q-book-1-2', 'True');
      attempt = submitAnswer(attempt, 'Q-book-1-3', 'Green');
      
      const result = gradeQuizAttempt(attempt, quiz);
      
      expect(result.correctAnswers).toBe(3);
      expect(result.totalQuestions).toBe(3);
      expect(result.percentScore).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.tokensEarned).toBe(50);
      expect(result.certificateId).toBeTruthy();
    });

    it('should grade incorrect answers', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      let attempt = startQuizAttempt('QUIZ-book-1', 'user-1');
      attempt = submitAnswer(attempt, 'Q-book-1-1', '3');
      attempt = submitAnswer(attempt, 'Q-book-1-2', 'False');
      attempt = submitAnswer(attempt, 'Q-book-1-3', 'Red');
      
      const result = gradeQuizAttempt(attempt, quiz);
      
      expect(result.correctAnswers).toBe(0);
      expect(result.percentScore).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.tokensEarned).toBe(0);
    });

    it('should calculate pillar scores', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      let attempt = startQuizAttempt('QUIZ-book-1', 'user-1');
      attempt = submitAnswer(attempt, 'Q-book-1-1', '4'); // SELF - correct
      attempt = submitAnswer(attempt, 'Q-book-1-2', 'False'); // AIR - wrong
      attempt = submitAnswer(attempt, 'Q-book-1-3', 'Green'); // LAND - correct
      
      const result = gradeQuizAttempt(attempt, quiz);
      
      expect(result.pillarScores['SELF'].percent).toBe(100);
      expect(result.pillarScores['AIR'].percent).toBe(0);
      expect(result.pillarScores['LAND'].percent).toBe(100);
    });
  });

  describe('completeQuizAttempt', () => {
    it('should complete attempt with pass status', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      let attempt = startQuizAttempt('QUIZ-book-1', 'user-1');
      attempt = submitAnswer(attempt, 'Q-book-1-1', '4');
      attempt = submitAnswer(attempt, 'Q-book-1-2', 'True');
      attempt = submitAnswer(attempt, 'Q-book-1-3', 'Green');
      
      attempt = completeQuizAttempt(attempt, quiz);
      
      expect(attempt.status).toBe('passed');
      expect(attempt.completedAt).toBeTruthy();
      expect(attempt.timeSpent).toBeGreaterThanOrEqual(0);
    });

    it('should complete attempt with fail status', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions, { passingScore: 100 });
      let attempt = startQuizAttempt('QUIZ-book-1', 'user-1');
      attempt = submitAnswer(attempt, 'Q-book-1-1', '4');
      attempt = submitAnswer(attempt, 'Q-book-1-2', 'False');
      
      attempt = completeQuizAttempt(attempt, quiz);
      
      expect(attempt.status).toBe('failed');
    });
  });

  describe('canAttemptQuiz', () => {
    it('should allow first attempt', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      const result = canAttemptQuiz('user-1', quiz, []);
      
      expect(result.canAttempt).toBe(true);
      expect(result.attemptsRemaining).toBe(3);
    });

    it('should not allow attempt after passing', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      const passedAttempt = {
        id: 'ATTEMPT-1',
        quizId: quiz.id,
        userId: 'user-1',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        answers: {},
        score: 25,
        maxScore: 25,
        percentScore: 100,
        status: 'passed' as const
      };
      
      const result = canAttemptQuiz('user-1', quiz, [passedAttempt]);
      
      expect(result.canAttempt).toBe(false);
      expect(result.reason).toContain('already passed');
    });

    it('should not allow attempt after max attempts', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions, { maxAttempts: 2 });
      const failedAttempts = [
        { id: 'A1', quizId: quiz.id, userId: 'user-1', startedAt: '', answers: {}, score: 0, maxScore: 25, percentScore: 0, status: 'failed' as const },
        { id: 'A2', quizId: quiz.id, userId: 'user-1', startedAt: '', answers: {}, score: 0, maxScore: 25, percentScore: 0, status: 'failed' as const }
      ];
      
      const result = canAttemptQuiz('user-1', quiz, failedAttempts);
      
      expect(result.canAttempt).toBe(false);
      expect(result.reason).toContain('Maximum attempts');
    });
  });

  describe('getQuizStatistics', () => {
    it('should calculate statistics', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      const attempts = [
        { id: 'A1', quizId: quiz.id, userId: 'user-1', startedAt: '', answers: { 'Q-book-1-1': '4', 'Q-book-1-2': 'True', 'Q-book-1-3': 'Green' }, score: 25, maxScore: 25, percentScore: 100, status: 'passed' as const, timeSpent: 300 },
        { id: 'A2', quizId: quiz.id, userId: 'user-2', startedAt: '', answers: { 'Q-book-1-1': '3', 'Q-book-1-2': 'False', 'Q-book-1-3': 'Red' }, score: 0, maxScore: 25, percentScore: 0, status: 'failed' as const, timeSpent: 200 }
      ];
      
      const stats = getQuizStatistics(quiz, attempts);
      
      expect(stats.totalAttempts).toBe(2);
      expect(stats.uniqueUsers).toBe(2);
      expect(stats.passRate).toBe(50);
      expect(stats.averageScore).toBe(50);
      expect(stats.averageTimeSpent).toBe(250);
    });

    it('should calculate question-level stats', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      const attempts = [
        { id: 'A1', quizId: quiz.id, userId: 'user-1', startedAt: '', answers: { 'Q-book-1-1': '4' }, score: 10, maxScore: 25, percentScore: 40, status: 'failed' as const },
        { id: 'A2', quizId: quiz.id, userId: 'user-2', startedAt: '', answers: { 'Q-book-1-1': '4' }, score: 10, maxScore: 25, percentScore: 40, status: 'failed' as const }
      ];
      
      const stats = getQuizStatistics(quiz, attempts);
      
      expect(stats.questionStats[0].correctRate).toBe(100);
    });
  });

  describe('generateReadingCertificate', () => {
    it('should generate certificate for passed quiz', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      const result = {
        attemptId: 'A1',
        passed: true,
        score: 25,
        maxScore: 25,
        percentScore: 100,
        correctAnswers: 3,
        totalQuestions: 3,
        pillarScores: { 'SELF': { correct: 1, total: 1, percent: 100 } },
        feedback: [],
        certificateId: 'CERT-book-1-123',
        tokensEarned: 50
      };
      
      const cert = generateReadingCertificate('user-1', 'John Doe', quiz, result);
      
      expect(cert.certificateId).toBe('CERT-book-1-123');
      expect(cert.userName).toBe('John Doe');
      expect(cert.bookTitle).toBe('Test Book');
      expect(cert.content).toContain('CERTIFICATE OF COMPLETION');
      expect(cert.content).toContain('John Doe');
      expect(cert.content).toContain('Test Book');
    });

    it('should throw error for failed quiz', () => {
      const quiz = createBookQuiz('book-1', 'Test Book', sampleQuestions);
      const result = {
        attemptId: 'A1',
        passed: false,
        score: 0,
        maxScore: 25,
        percentScore: 0,
        correctAnswers: 0,
        totalQuestions: 3,
        pillarScores: {},
        feedback: [],
        tokensEarned: 0
      };
      
      expect(() => generateReadingCertificate('user-1', 'John', quiz, result)).toThrow('failed attempt');
    });
  });

  describe('createSampleQuestions', () => {
    it('should create sample questions for a book', () => {
      const questions = createSampleQuestions('Wealth Building 101', 'SELF');
      
      expect(questions.length).toBeGreaterThan(0);
      expect(questions[0]).toHaveProperty('questionText');
      expect(questions[0]).toHaveProperty('type');
      expect(questions[0]).toHaveProperty('correctAnswer');
      expect(questions[0].pillar).toBe('SELF');
    });
  });
});
