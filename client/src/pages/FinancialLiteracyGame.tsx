import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  DollarSign,
  Trophy,
  Star,
  Heart,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Coins,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Wallet,
  Target,
  Sparkles,
  RotateCcw,
  Home,
  Medal,
  Crown,
  Award,
} from "lucide-react";
import { Link } from "wouter";

// Question types
interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: "budgeting" | "saving" | "investing" | "credit" | "taxes" | "business";
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

// Game questions organized by difficulty
const QUESTIONS: Question[] = [
  // Easy Questions (10 points each)
  {
    id: 1,
    question: "What is a budget?",
    options: [
      "A type of bank account",
      "A plan for how to spend and save money",
      "A loan from the bank",
      "A credit card limit"
    ],
    correctAnswer: 1,
    explanation: "A budget is a plan that helps you track your income and expenses, ensuring you spend wisely and save for the future.",
    category: "budgeting",
    difficulty: "easy",
    points: 10
  },
  {
    id: 2,
    question: "What does 'saving' money mean?",
    options: [
      "Spending all your money quickly",
      "Borrowing money from friends",
      "Setting aside money for future use",
      "Giving money away"
    ],
    correctAnswer: 2,
    explanation: "Saving means keeping some of your money for later instead of spending it all now. This helps you prepare for emergencies and future goals.",
    category: "saving",
    difficulty: "easy",
    points: 10
  },
  {
    id: 3,
    question: "What is interest on a savings account?",
    options: [
      "A fee the bank charges you",
      "Money the bank pays you for keeping your money there",
      "The amount you can withdraw",
      "Your account number"
    ],
    correctAnswer: 1,
    explanation: "Interest is money the bank pays you as a reward for keeping your money in their savings account. It helps your money grow over time!",
    category: "saving",
    difficulty: "easy",
    points: 10
  },
  {
    id: 4,
    question: "What is a 'need' versus a 'want'?",
    options: [
      "They are the same thing",
      "A need is something you must have to survive, a want is something nice to have",
      "A want is more important than a need",
      "Needs are always more expensive"
    ],
    correctAnswer: 1,
    explanation: "Needs are essentials like food, shelter, and clothing. Wants are things we'd like to have but can live without, like video games or fancy clothes.",
    category: "budgeting",
    difficulty: "easy",
    points: 10
  },
  {
    id: 5,
    question: "What is an emergency fund?",
    options: [
      "Money for buying toys",
      "Money saved for unexpected expenses like car repairs or medical bills",
      "A type of credit card",
      "Money you owe to someone"
    ],
    correctAnswer: 1,
    explanation: "An emergency fund is money you save specifically for unexpected situations. Experts recommend saving 3-6 months of expenses.",
    category: "saving",
    difficulty: "easy",
    points: 10
  },

  // Medium Questions (20 points each)
  {
    id: 6,
    question: "What is compound interest?",
    options: [
      "Interest calculated only on the original amount",
      "Interest calculated on both the original amount and accumulated interest",
      "A type of bank fee",
      "Interest that decreases over time"
    ],
    correctAnswer: 1,
    explanation: "Compound interest is when you earn interest on your interest! This makes your money grow faster over time - it's often called 'the eighth wonder of the world'.",
    category: "investing",
    difficulty: "medium",
    points: 20
  },
  {
    id: 7,
    question: "What is a credit score?",
    options: [
      "The amount of money in your bank account",
      "A number that represents how trustworthy you are with borrowed money",
      "Your social security number",
      "The interest rate on your savings"
    ],
    correctAnswer: 1,
    explanation: "A credit score (usually 300-850) shows lenders how reliable you are at paying back borrowed money. Higher scores get better loan rates!",
    category: "credit",
    difficulty: "medium",
    points: 20
  },
  {
    id: 8,
    question: "What is the 50/30/20 budgeting rule?",
    options: [
      "Save 50%, spend 30%, invest 20%",
      "50% needs, 30% wants, 20% savings",
      "50% taxes, 30% rent, 20% food",
      "50% investing, 30% saving, 20% spending"
    ],
    correctAnswer: 1,
    explanation: "The 50/30/20 rule suggests spending 50% of income on needs, 30% on wants, and 20% on savings and debt repayment.",
    category: "budgeting",
    difficulty: "medium",
    points: 20
  },
  {
    id: 9,
    question: "What is diversification in investing?",
    options: [
      "Putting all your money in one stock",
      "Spreading investments across different types to reduce risk",
      "Only investing in real estate",
      "Keeping all money in cash"
    ],
    correctAnswer: 1,
    explanation: "Diversification means 'don't put all your eggs in one basket.' By spreading investments across stocks, bonds, and other assets, you reduce the risk of losing everything.",
    category: "investing",
    difficulty: "medium",
    points: 20
  },
  {
    id: 10,
    question: "What is an LLC?",
    options: [
      "A type of bank account",
      "Limited Liability Company - a business structure that protects personal assets",
      "A government tax form",
      "A type of investment"
    ],
    correctAnswer: 1,
    explanation: "An LLC (Limited Liability Company) is a business structure that separates your personal assets from business debts, protecting you if the business has problems.",
    category: "business",
    difficulty: "medium",
    points: 20
  },

  // Hard Questions (30 points each)
  {
    id: 11,
    question: "What is the difference between a Roth IRA and Traditional IRA?",
    options: [
      "There is no difference",
      "Roth contributions are after-tax (tax-free withdrawals), Traditional are pre-tax (taxed on withdrawal)",
      "Traditional IRAs have no contribution limits",
      "Roth IRAs can only hold stocks"
    ],
    correctAnswer: 1,
    explanation: "With a Roth IRA, you pay taxes now but withdraw tax-free in retirement. With a Traditional IRA, you get a tax break now but pay taxes when you withdraw.",
    category: "investing",
    difficulty: "hard",
    points: 30
  },
  {
    id: 12,
    question: "What is a 1099 tax form used for?",
    options: [
      "Reporting employee wages",
      "Reporting income from self-employment, freelance work, or contract work",
      "Filing for bankruptcy",
      "Applying for a mortgage"
    ],
    correctAnswer: 1,
    explanation: "A 1099 form reports income you received as an independent contractor or from other non-employment sources. Unlike W-2 employees, you're responsible for your own taxes.",
    category: "taxes",
    difficulty: "hard",
    points: 30
  },
  {
    id: 13,
    question: "What is the Rule of 72?",
    options: [
      "A tax regulation",
      "A quick way to estimate how long it takes money to double at a given interest rate",
      "The maximum credit card limit",
      "A retirement age requirement"
    ],
    correctAnswer: 1,
    explanation: "The Rule of 72: divide 72 by your interest rate to estimate years to double your money. At 8% interest, money doubles in about 9 years (72÷8=9).",
    category: "investing",
    difficulty: "hard",
    points: 30
  },
  {
    id: 14,
    question: "What is a trust and why might a family create one?",
    options: [
      "A type of checking account",
      "A legal arrangement to manage and protect assets for beneficiaries across generations",
      "A business partnership agreement",
      "A type of insurance policy"
    ],
    correctAnswer: 1,
    explanation: "A trust is a legal entity that holds assets for beneficiaries. Families use trusts to protect wealth, avoid probate, reduce taxes, and ensure assets pass to future generations as intended.",
    category: "business",
    difficulty: "hard",
    points: 30
  },
  {
    id: 15,
    question: "What is the difference between assets and liabilities?",
    options: [
      "They are the same thing",
      "Assets put money in your pocket, liabilities take money out",
      "Assets are only cash, liabilities are only loans",
      "Liabilities are always bad"
    ],
    correctAnswer: 1,
    explanation: "Assets generate income or appreciate in value (rental property, investments). Liabilities cost you money (car payments, credit card debt). Building wealth means acquiring assets and minimizing liabilities.",
    category: "business",
    difficulty: "hard",
    points: 30
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  budgeting: <Wallet className="w-5 h-5" />,
  saving: <PiggyBank className="w-5 h-5" />,
  investing: <TrendingUp className="w-5 h-5" />,
  credit: <CreditCard className="w-5 h-5" />,
  taxes: <DollarSign className="w-5 h-5" />,
  business: <Target className="w-5 h-5" />,
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

type GameState = "menu" | "playing" | "result" | "review";

export default function FinancialLiteracyGame() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean; selected: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [tokensEarned, setTokensEarned] = useState(0);

  // Leaderboard queries
  const { data: topScores, refetch: refetchLeaderboard } = trpc.leaderboard.getTopScores.useQuery(
    { gameType: "financial-literacy", limit: 10 },
    { enabled: showLeaderboard }
  );
  const submitScoreMutation = trpc.leaderboard.submitScore.useMutation({
    onSuccess: () => {
      refetchLeaderboard();
      toast.success("Score submitted to leaderboard!");
    },
    onError: () => {
      // Silently fail - user might not be logged in
    }
  });

  // Achievement checking
  const checkAchievementsMutation = trpc.achievements.checkAndUnlock.useMutation({
    onSuccess: (data) => {
      if (data.newlyUnlocked.length > 0) {
        data.newlyUnlocked.forEach((achievement) => {
          toast.success(
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-bold">Achievement Unlocked!</p>
                <p className="text-sm">{achievement.name} - +{achievement.tokenReward} tokens</p>
              </div>
            </div>
          );
        });
      }
    },
  });

  // Filter and shuffle questions based on difficulty
  const gameQuestions = useMemo(() => {
    let filtered = QUESTIONS;
    if (difficulty !== "mixed") {
      filtered = QUESTIONS.filter(q => q.difficulty === difficulty);
    }
    // Shuffle and take 10 questions
    return [...filtered].sort(() => Math.random() - 0.5).slice(0, 10);
  }, [difficulty, gameState]);

  const currentQuestion = gameQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / gameQuestions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const handleTimeout = () => {
    setTimerActive(false);
    setLives(prev => prev - 1);
    setStreak(0);
    setAnswers(prev => [...prev, { questionId: currentQuestion.id, correct: false, selected: -1 }]);
    setShowExplanation(true);
    toast.error("Time's up!");
  };

  const startGame = (selectedDifficulty: "easy" | "medium" | "hard" | "mixed") => {
    setDifficulty(selectedDifficulty);
    setGameState("playing");
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setAnswers([]);
    setTimeLeft(30);
    setTimerActive(true);
    setTokensEarned(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showExplanation) return;
    
    setSelectedAnswer(answerIndex);
    setTimerActive(false);
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      const bonusMultiplier = 1 + (streak * 0.1); // 10% bonus per streak
      const timeBonus = Math.floor(timeLeft / 3); // Bonus for quick answers
      const pointsEarned = Math.floor(currentQuestion.points * bonusMultiplier) + timeBonus;
      
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
      setMaxStreak(prev => Math.max(prev, streak + 1));
      setTokensEarned(prev => prev + Math.floor(pointsEarned / 10));
      toast.success(`+${pointsEarned} points! ${streak > 0 ? `🔥 ${streak + 1}x streak!` : ""}`);
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      toast.error("Incorrect!");
    }
    
    setAnswers(prev => [...prev, { questionId: currentQuestion.id, correct: isCorrect, selected: answerIndex }]);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (lives <= 0 || currentQuestionIndex >= gameQuestions.length - 1) {
      setGameState("result");
      // Submit score to leaderboard
      const correctCount = answers.filter(a => a.correct).length + (selectedAnswer === currentQuestion?.correctAnswer ? 1 : 0);
      submitScoreMutation.mutate({
        gameType: "financial-literacy",
        score: score,
        difficulty: difficulty,
        correctAnswers: correctCount,
        totalQuestions: gameQuestions.length,
        maxStreak: maxStreak,
        tokensEarned: tokensEarned,
      });
      
      // Check for achievements
      checkAchievementsMutation.mutate({
        gameType: "financial-literacy",
        gameResult: {
          score: score,
          correctAnswers: correctCount,
          totalQuestions: gameQuestions.length,
          maxStreak: maxStreak,
          difficulty: difficulty,
          gamesCompleted: 1,
        },
      });
      return;
    }
    
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(30);
    setTimerActive(true);
  };

  const renderMenu = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
          <DollarSign className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Financial Literacy Challenge</h1>
        <p className="text-lg text-muted-foreground">
          Test your knowledge of budgeting, saving, investing, and building wealth!
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How to Play</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium">3 Lives</p>
              <p className="text-muted-foreground">Wrong answers cost a life</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">30 Seconds</p>
              <p className="text-muted-foreground">Answer before time runs out</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium">Streak Bonus</p>
              <p className="text-muted-foreground">Consecutive correct answers multiply points</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Coins className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">Earn Tokens</p>
              <p className="text-muted-foreground">Points convert to L.A.W.S. tokens</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Select Difficulty</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-24 flex-col gap-2 border-green-200 hover:bg-green-50 hover:border-green-400"
            onClick={() => startGame("easy")}
          >
            <span className="text-lg font-semibold text-green-700">Easy</span>
            <span className="text-sm text-muted-foreground">10 points per question</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-24 flex-col gap-2 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-400"
            onClick={() => startGame("medium")}
          >
            <span className="text-lg font-semibold text-yellow-700">Medium</span>
            <span className="text-sm text-muted-foreground">20 points per question</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-24 flex-col gap-2 border-red-200 hover:bg-red-50 hover:border-red-400"
            onClick={() => startGame("hard")}
          >
            <span className="text-lg font-semibold text-red-700">Hard</span>
            <span className="text-sm text-muted-foreground">30 points per question</span>
          </Button>
          <Button
            size="lg"
            className="h-24 flex-col gap-2 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            onClick={() => startGame("mixed")}
          >
            <span className="text-lg font-semibold">Mixed Challenge</span>
            <span className="text-sm opacity-90">All difficulties combined</span>
          </Button>
        </div>
      </div>

      {/* Leaderboard Button */}
      <div className="text-center">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="gap-2"
        >
          <Trophy className="w-5 h-5 text-yellow-500" />
          {showLeaderboard ? "Hide Leaderboard" : "View Leaderboard"}
        </Button>
      </div>

      {/* Leaderboard Display */}
      {showLeaderboard && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Top 10 Scores</h2>
          </div>
          {topScores && topScores.length > 0 ? (
            <div className="space-y-2">
              {topScores.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0 ? "bg-yellow-50 border border-yellow-200" :
                    index === 1 ? "bg-gray-50 border border-gray-200" :
                    index === 2 ? "bg-orange-50 border border-orange-200" :
                    "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center font-bold text-lg">
                      {index === 0 ? <Crown className="w-6 h-6 text-yellow-500" /> :
                       index === 1 ? <Medal className="w-6 h-6 text-gray-400" /> :
                       index === 2 ? <Award className="w-6 h-6 text-orange-400" /> :
                       `#${entry.rank}`}
                    </span>
                    <div>
                      <p className="font-medium">{entry.playerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.correctAnswers}/{entry.totalQuestions} correct • {entry.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{entry.score}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No scores yet. Be the first to play!
            </p>
          )}
        </Card>
      )}
    </div>
  );

  const renderPlaying = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${i < lives ? "text-red-500 fill-red-500" : "text-gray-300"}`}
              />
            ))}
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            {score}
          </Badge>
          {streak > 1 && (
            <Badge className="bg-orange-500 text-lg px-3 py-1">
              🔥 {streak}x Streak
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${timeLeft <= 10 ? "text-red-500" : "text-muted-foreground"}`} />
          <span className={`text-xl font-mono font-bold ${timeLeft <= 10 ? "text-red-500" : ""}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {gameQuestions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2 rounded-lg ${difficultyColors[currentQuestion.difficulty]}`}>
            {categoryIcons[currentQuestion.category]}
          </div>
          <div>
            <Badge className={difficultyColors[currentQuestion.difficulty]}>
              {currentQuestion.difficulty.toUpperCase()}
            </Badge>
            <span className="ml-2 text-sm text-muted-foreground capitalize">
              {currentQuestion.category}
            </span>
          </div>
          <Badge variant="outline" className="ml-auto">
            {currentQuestion.points} pts
          </Badge>
        </div>

        <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = "w-full p-4 text-left justify-start h-auto";
            let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
            
            if (showExplanation) {
              if (index === currentQuestion.correctAnswer) {
                buttonClass += " bg-green-100 border-green-500 text-green-800";
              } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                buttonClass += " bg-red-100 border-red-500 text-red-800";
              }
            } else if (selectedAnswer === index) {
              variant = "secondary";
            }

            return (
              <Button
                key={index}
                variant={variant}
                className={buttonClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {showExplanation && index === currentQuestion.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                  {showExplanation && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                  )}
                </span>
              </Button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Explanation</h3>
            <p className="text-blue-700">{currentQuestion.explanation}</p>
          </div>
        )}
      </Card>

      {showExplanation && (
        <div className="flex justify-center">
          <Button size="lg" onClick={nextQuestion} className="gap-2">
            {currentQuestionIndex >= gameQuestions.length - 1 || lives <= 0 ? "See Results" : "Next Question"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderResult = () => {
    const correctAnswers = answers.filter(a => a.correct).length;
    const accuracy = Math.round((correctAnswers / answers.length) * 100);
    const grade = accuracy >= 90 ? "A" : accuracy >= 80 ? "B" : accuracy >= 70 ? "C" : accuracy >= 60 ? "D" : "F";
    
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mb-4">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Game Complete!</h1>
          <p className="text-lg text-muted-foreground">
            {lives > 0 ? "Great job completing the challenge!" : "You ran out of lives, but keep learning!"}
          </p>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold text-primary">{score}</p>
              <p className="text-sm text-muted-foreground">Total Score</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600">{correctAnswers}/{answers.length}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-amber-500">{maxStreak}</p>
              <p className="text-sm text-muted-foreground">Best Streak</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">{grade}</p>
              <p className="text-sm text-muted-foreground">Grade ({accuracy}%)</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Coins className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-800">+{tokensEarned} Tokens Earned</p>
                <p className="text-sm text-amber-600">Added to your L.A.W.S. Collective balance</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => setGameState("review")} variant="outline" className="gap-2">
            <Target className="w-4 h-4" />
            Review Answers
          </Button>
          <Button size="lg" onClick={() => setGameState("menu")} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Play Again
          </Button>
          <Link href="/game-center">
            <Button size="lg" variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Game Center
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  const renderReview = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Answer Review</h1>
        <Button variant="outline" onClick={() => setGameState("result")}>
          Back to Results
        </Button>
      </div>

      <div className="space-y-4">
        {gameQuestions.slice(0, answers.length).map((question, index) => {
          const answer = answers[index];
          const isCorrect = answer?.correct;
          
          return (
            <Card key={question.id} className={`p-4 ${isCorrect ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${isCorrect ? "bg-green-100" : "bg-red-100"}`}>
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={difficultyColors[question.difficulty]}>
                      {question.difficulty}
                    </Badge>
                    <span className="text-sm text-muted-foreground capitalize">{question.category}</span>
                  </div>
                  <p className="font-medium mb-2">{question.question}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Correct Answer:</span> {question.options[question.correctAnswer]}
                  </p>
                  {!isCorrect && answer?.selected >= 0 && (
                    <p className="text-sm text-red-600">
                      <span className="font-medium">Your Answer:</span> {question.options[answer.selected]}
                    </p>
                  )}
                  <p className="text-sm text-blue-600 mt-2">{question.explanation}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="py-6">
        {gameState === "menu" && renderMenu()}
        {gameState === "playing" && renderPlaying()}
        {gameState === "result" && renderResult()}
        {gameState === "review" && renderReview()}
      </div>
    </DashboardLayout>
  );
}
