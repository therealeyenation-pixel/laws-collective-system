import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Brain,
  Trophy,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  ChevronRight,
  Zap,
  Target,
  Award,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: "financial" | "business" | "legal" | "laws" | "history";
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  xpReward: number;
}

interface TriviaCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  questionsCount: number;
  highScore: number;
}

const triviaCategories: TriviaCategory[] = [
  {
    id: "financial",
    name: "Financial Literacy",
    description: "Test your knowledge of personal finance and investing",
    icon: <Target className="w-5 h-5" />,
    color: "bg-green-100 text-green-700",
    questionsCount: 50,
    highScore: 850,
  },
  {
    id: "business",
    name: "Business Fundamentals",
    description: "Questions about entrepreneurship and business management",
    icon: <Zap className="w-5 h-5" />,
    color: "bg-blue-100 text-blue-700",
    questionsCount: 45,
    highScore: 720,
  },
  {
    id: "legal",
    name: "Legal Knowledge",
    description: "Test your understanding of business and personal law",
    icon: <Award className="w-5 h-5" />,
    color: "bg-purple-100 text-purple-700",
    questionsCount: 40,
    highScore: 680,
  },
  {
    id: "laws",
    name: "L.A.W.S. Framework",
    description: "Questions about Land, Air, Water, and Self principles",
    icon: <Sparkles className="w-5 h-5" />,
    color: "bg-amber-100 text-amber-700",
    questionsCount: 35,
    highScore: 920,
  },
  {
    id: "history",
    name: "Financial History",
    description: "Historical events and figures in finance and business",
    icon: <Brain className="w-5 h-5" />,
    color: "bg-rose-100 text-rose-700",
    questionsCount: 30,
    highScore: 560,
  },
];

const sampleQuestions: TriviaQuestion[] = [
  {
    id: "q1",
    question: "What is the primary purpose of an emergency fund?",
    options: [
      "To invest in stocks",
      "To cover unexpected expenses",
      "To pay for vacations",
      "To buy luxury items"
    ],
    correctAnswer: 1,
    category: "financial",
    difficulty: "easy",
    explanation: "An emergency fund is designed to cover unexpected expenses like medical bills, car repairs, or job loss, typically 3-6 months of living expenses.",
    xpReward: 10,
  },
  {
    id: "q2",
    question: "What does LLC stand for?",
    options: [
      "Limited Liability Company",
      "Legal Liability Corporation",
      "Limited Legal Company",
      "Liability Limited Corporation"
    ],
    correctAnswer: 0,
    category: "business",
    difficulty: "easy",
    explanation: "LLC stands for Limited Liability Company, a business structure that protects owners' personal assets from business debts.",
    xpReward: 10,
  },
  {
    id: "q3",
    question: "What is the 'L' in L.A.W.S. Collective?",
    options: [
      "Legacy",
      "Learning",
      "Land",
      "Leadership"
    ],
    correctAnswer: 2,
    category: "laws",
    difficulty: "easy",
    explanation: "L.A.W.S. stands for Land, Air, Water, and Self - the four pillars of the collective's framework for community development.",
    xpReward: 10,
  },
  {
    id: "q4",
    question: "What is compound interest?",
    options: [
      "Interest paid only on the principal",
      "Interest earned on both principal and accumulated interest",
      "A type of business loan",
      "Interest that decreases over time"
    ],
    correctAnswer: 1,
    category: "financial",
    difficulty: "medium",
    explanation: "Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods.",
    xpReward: 20,
  },
  {
    id: "q5",
    question: "What is a fiduciary duty?",
    options: [
      "A type of business insurance",
      "A legal obligation to act in another's best interest",
      "A tax deduction",
      "A type of investment account"
    ],
    correctAnswer: 1,
    category: "legal",
    difficulty: "medium",
    explanation: "A fiduciary duty is a legal obligation to act in the best interest of another party, common for trustees, financial advisors, and board members.",
    xpReward: 20,
  },
];

export function TriviaGame() {
  const [selectedCategory, setSelectedCategory] = useState<TriviaCategory | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const questions = sampleQuestions.filter(q => 
    selectedCategory ? q.category === selectedCategory.id : true
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !isAnswered && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [gameStarted, timeLeft, isAnswered]);

  const handleTimeUp = () => {
    setIsAnswered(true);
    setStreak(0);
    toast.error("Time's up!");
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const question = questions[currentQuestion];
    if (answerIndex === question.correctAnswer) {
      const streakBonus = Math.min(streak * 5, 50);
      const timeBonus = Math.floor(timeLeft / 3) * 5;
      const totalPoints = question.xpReward + streakBonus + timeBonus;
      
      setScore(score + totalPoints);
      setStreak(streak + 1);
      setCorrectAnswers(correctAnswers + 1);
      toast.success(`Correct! +${totalPoints} XP`);
    } else {
      setStreak(0);
      toast.error("Incorrect!");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setGameEnded(true);
    }
  };

  const startGame = (category: TriviaCategory) => {
    setSelectedCategory(category);
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setCorrectAnswers(0);
    setTimeLeft(30);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setGameEnded(false);
  };

  const resetGame = () => {
    setSelectedCategory(null);
    setGameStarted(false);
    setGameEnded(false);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setCorrectAnswers(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "hard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (gameEnded) {
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="pt-8 pb-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-3xl font-bold mb-2">Game Complete!</h2>
            <p className="text-muted-foreground mb-6">
              {selectedCategory?.name} Trivia
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-3xl font-bold text-primary">{score}</p>
                <p className="text-sm text-muted-foreground">Total Score</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-3xl font-bold text-green-600">{correctAnswers}/{questions.length}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>

            {accuracy >= 80 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Award className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                <p className="font-medium text-yellow-800">Achievement Unlocked!</p>
                <p className="text-sm text-yellow-600">Trivia Master - 80%+ Accuracy</p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={() => startGame(selectedCategory!)} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Play Again
              </Button>
              <Button variant="outline" onClick={resetGame}>
                Choose Category
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameStarted && selectedCategory) {
    const question = questions[currentQuestion];
    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className={selectedCategory.color}>
              {selectedCategory.icon}
              <span className="ml-1">{selectedCategory.name}</span>
            </Badge>
            <Badge variant="outline">
              Question {currentQuestion + 1}/{questions.length}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-bold">{streak} streak</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="font-bold">{score} XP</span>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Time Left
            </span>
            <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
              {timeLeft}s
            </span>
          </div>
          <Progress value={(timeLeft / 30) * 100} className="h-2" />
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge className={getDifficultyColor(question.difficulty)} variant="outline">
                {question.difficulty}
              </Badge>
              <Badge variant="outline">+{question.xpReward} XP</Badge>
            </div>
            <CardTitle className="text-xl mt-4">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={`w-full justify-start text-left h-auto py-4 px-4 ${
                  isAnswered
                    ? index === question.correctAnswer
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : selectedAnswer === index
                        ? 'bg-red-100 border-red-500 text-red-700'
                        : ''
                    : selectedAnswer === index
                      ? 'border-primary bg-primary/5'
                      : ''
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {isAnswered && index === question.correctAnswer && (
                    <CheckCircle className="w-5 h-5 ml-auto text-green-600" />
                  )}
                  {isAnswered && selectedAnswer === index && index !== question.correctAnswer && (
                    <XCircle className="w-5 h-5 ml-auto text-red-600" />
                  )}
                </span>
              </Button>
            ))}

            {isAnswered && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Explanation:</p>
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </div>
            )}

            {isAnswered && (
              <Button className="w-full mt-4 gap-2" onClick={handleNextQuestion}>
                {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Category Selection
  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <Brain className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold">Trivia Challenge</h2>
        <p className="text-muted-foreground">Test your knowledge and earn XP rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {triviaCategories.map((category) => (
          <Card
            key={category.id}
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => startGame(category)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${category.color}`}>
                  {category.icon}
                </div>
                <Badge variant="outline">
                  {category.questionsCount} questions
                </Badge>
              </div>
              <CardTitle className="mt-3">{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">High Score</span>
                <span className="font-bold flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  {category.highScore}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Play */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Quick Play</h3>
              <p className="text-sm text-muted-foreground">Random questions from all categories</p>
            </div>
            <Button onClick={() => startGame(triviaCategories[0])} className="gap-2">
              <Zap className="w-4 h-4" />
              Start
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TriviaGame;
