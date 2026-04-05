import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Brain, Trophy, Clock, CheckCircle, XCircle, Zap, Star,
  ArrowRight, RotateCcw, Home, Loader2, Lightbulb, Target,
  Medal, Crown, Flame, BookOpen
} from "lucide-react";
import { Link } from "wouter";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
  points: number;
}

// Sample questions - in production these would come from the backend
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the primary purpose of a 501(c)(3) organization?",
    options: [
      "To generate profit for shareholders",
      "To operate exclusively for charitable, religious, educational, or scientific purposes",
      "To lobby for political candidates",
      "To provide unlimited benefits to members"
    ],
    correctAnswer: 1,
    category: "Nonprofit",
    difficulty: "easy",
    explanation: "501(c)(3) organizations are tax-exempt nonprofits that must operate exclusively for charitable, religious, educational, scientific, or other exempt purposes.",
    points: 100,
  },
  {
    id: 2,
    question: "What is the difference between a grant and a loan?",
    options: [
      "Grants must be repaid with interest",
      "Loans do not need to be repaid",
      "Grants do not need to be repaid; loans must be repaid",
      "There is no difference"
    ],
    correctAnswer: 2,
    category: "Finance",
    difficulty: "easy",
    explanation: "Grants are funds given for a specific purpose that do not need to be repaid, while loans must be repaid, usually with interest.",
    points: 100,
  },
  {
    id: 3,
    question: "What does 'fiduciary duty' mean in the context of nonprofit governance?",
    options: [
      "The duty to maximize profits",
      "The legal obligation to act in the best interest of the organization",
      "The requirement to file annual taxes",
      "The duty to hire family members"
    ],
    correctAnswer: 1,
    category: "Governance",
    difficulty: "medium",
    explanation: "Fiduciary duty is the legal obligation of board members to act in the best interest of the organization, putting the organization's interests above personal interests.",
    points: 200,
  },
  {
    id: 4,
    question: "What is a Form 990?",
    options: [
      "A tax return for individuals",
      "An annual information return filed by tax-exempt organizations",
      "A grant application form",
      "A business license application"
    ],
    correctAnswer: 1,
    category: "Compliance",
    difficulty: "medium",
    explanation: "Form 990 is the annual information return that most tax-exempt organizations must file with the IRS, providing information about finances, governance, and activities.",
    points: 200,
  },
  {
    id: 5,
    question: "What is the purpose of a conflict of interest policy?",
    options: [
      "To prevent employees from working overtime",
      "To ensure decisions are made in the organization's best interest, free from personal gain",
      "To limit the number of board meetings",
      "To increase executive compensation"
    ],
    correctAnswer: 1,
    category: "Governance",
    difficulty: "hard",
    explanation: "A conflict of interest policy ensures that decisions are made in the organization's best interest and that personal interests do not improperly influence organizational decisions.",
    points: 300,
  },
];

type GameState = "menu" | "playing" | "review" | "complete";

export default function KnowledgeQuest() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; selected: number; correct: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const handleTimeUp = () => {
    setTimerActive(false);
    if (selectedAnswer === null) {
      // Auto-submit wrong answer
      const currentQuestion = questions[currentQuestionIndex];
      setAnswers([...answers, { 
        questionId: currentQuestion.id, 
        selected: -1, 
        correct: false 
      }]);
      setStreak(0);
      setShowExplanation(true);
    }
  };

  const startGame = () => {
    let filteredQuestions = [...SAMPLE_QUESTIONS];
    
    if (category !== "all") {
      filteredQuestions = filteredQuestions.filter(q => q.category === category);
    }
    if (difficulty !== "all") {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }

    // Shuffle questions
    filteredQuestions.sort(() => Math.random() - 0.5);

    if (filteredQuestions.length === 0) {
      toast.error("No questions available for selected filters");
      return;
    }

    setQuestions(filteredQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setAnswers([]);
    setTimeLeft(30);
    setTimerActive(true);
    setGameState("playing");
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setTimerActive(false);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * 5);
      const streakBonus = streak * 50;
      const totalPoints = currentQuestion.points + timeBonus + streakBonus;
      setScore(prev => prev + totalPoints);
      setStreak(prev => prev + 1);
      setMaxStreak(prev => Math.max(prev, streak + 1));
      toast.success(`+${totalPoints} points!`);
    } else {
      setStreak(0);
    }

    setAnswers([...answers, { 
      questionId: currentQuestion.id, 
      selected: answerIndex, 
      correct: isCorrect 
    }]);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(30);
      setTimerActive(true);
    } else {
      setGameState("complete");
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getGrade = () => {
    const percentage = (answers.filter(a => a.correct).length / questions.length) * 100;
    if (percentage >= 90) return { grade: "A+", icon: Crown, color: "text-yellow-500" };
    if (percentage >= 80) return { grade: "A", icon: Medal, color: "text-yellow-400" };
    if (percentage >= 70) return { grade: "B", icon: Star, color: "text-blue-500" };
    if (percentage >= 60) return { grade: "C", icon: Target, color: "text-green-500" };
    return { grade: "D", icon: BookOpen, color: "text-gray-500" };
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-7 h-7 text-purple-500" />
              Knowledge Quest
            </h1>
            <p className="text-muted-foreground">Test your knowledge and earn points</p>
          </div>
          <Link href="/game-center">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Game Center
            </Button>
          </Link>
        </div>

        {/* Menu State */}
        {gameState === "menu" && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <Brain className="w-10 h-10 text-purple-500" />
              </div>
              <CardTitle className="text-2xl">Ready to Test Your Knowledge?</CardTitle>
              <CardDescription>
                Answer questions correctly to earn points. Build streaks for bonus points!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Nonprofit">Nonprofit</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Governance">Governance</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-lg">
                <div className="text-center">
                  <Zap className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
                  <p className="text-sm font-medium">Time Bonus</p>
                  <p className="text-xs text-muted-foreground">Answer fast for extra points</p>
                </div>
                <div className="text-center">
                  <Flame className="w-6 h-6 mx-auto text-orange-500 mb-1" />
                  <p className="text-sm font-medium">Streak Bonus</p>
                  <p className="text-xs text-muted-foreground">Chain correct answers</p>
                </div>
                <div className="text-center">
                  <Lightbulb className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                  <p className="text-sm font-medium">Learn</p>
                  <p className="text-xs text-muted-foreground">See explanations</p>
                </div>
              </div>

              <Button onClick={startGame} className="w-full" size="lg">
                Start Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Playing State */}
        {gameState === "playing" && currentQuestion && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                    {streak}x streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    {score.toLocaleString()} pts
                  </span>
                </div>
              </div>
              <Progress value={(currentQuestionIndex / questions.length) * 100} />
            </div>

            {/* Question Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{currentQuestion.category}</Badge>
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge variant="secondary">{currentQuestion.points} pts</Badge>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    timeLeft <= 10 ? 'bg-red-500/20 text-red-500' : 'bg-secondary'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-mono font-bold">{timeLeft}s</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <h2 className="text-xl font-semibold">{currentQuestion.question}</h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQuestion.correctAnswer;
                    const showResult = selectedAnswer !== null;

                    let buttonClass = "w-full justify-start text-left h-auto py-4 px-4";
                    if (showResult) {
                      if (isCorrect) {
                        buttonClass += " bg-green-500/20 border-green-500 text-green-700 dark:text-green-300";
                      } else if (isSelected && !isCorrect) {
                        buttonClass += " bg-red-500/20 border-red-500 text-red-700 dark:text-red-300";
                      }
                    }

                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        className={buttonClass}
                        onClick={() => handleAnswerSelect(idx)}
                        disabled={selectedAnswer !== null}
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                          {showResult && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                          )}
                        </span>
                      </Button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && currentQuestion.explanation && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">Explanation</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {showExplanation && (
                  <Button onClick={nextQuestion} className="w-full">
                    {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Complete State */}
        {gameState === "complete" && (
          <Card>
            <CardHeader className="text-center">
              {(() => {
                const { grade, icon: GradeIcon, color } = getGrade();
                return (
                  <>
                    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                      <GradeIcon className={`w-12 h-12 ${color}`} />
                    </div>
                    <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
                    <CardDescription className="text-lg">
                      Grade: <span className={`font-bold ${color}`}>{grade}</span>
                    </CardDescription>
                  </>
                );
              })()}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <p className="text-2xl font-bold">{score.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Score</p>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl font-bold">
                    {answers.filter(a => a.correct).length}/{questions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <Flame className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                  <p className="text-2xl font-bold">{maxStreak}</p>
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <Target className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold">
                    {Math.round((answers.filter(a => a.correct).length / questions.length) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={startGame} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Button variant="outline" onClick={() => setGameState("menu")} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Main Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
