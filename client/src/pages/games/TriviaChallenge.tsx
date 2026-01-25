import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, Trophy, Brain, Map, Wind, Droplets, Heart, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface TriviaQuestion {
  id: number;
  category: "land" | "air" | "water" | "self";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

const questions: TriviaQuestion[] = [
  // LAND - Science, Geography, Environment
  { id: 1, category: "land", question: "What is the largest ocean on Earth?", options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"], correctAnswer: 2, explanation: "The Pacific Ocean covers about 63 million square miles, making it the largest ocean.", difficulty: "easy" },
  { id: 2, category: "land", question: "What is the process by which plants make their own food?", options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"], correctAnswer: 1, explanation: "Photosynthesis uses sunlight, water, and carbon dioxide to create glucose and oxygen.", difficulty: "easy" },
  { id: 3, category: "land", question: "Which layer of Earth's atmosphere do we live in?", options: ["Stratosphere", "Mesosphere", "Troposphere", "Thermosphere"], correctAnswer: 2, explanation: "The troposphere extends from Earth's surface to about 7-20 km high.", difficulty: "medium" },
  { id: 4, category: "land", question: "What is the term for land that is owned outright, free of any mortgage?", options: ["Leasehold", "Freehold", "Allodial", "Tenancy"], correctAnswer: 2, explanation: "Allodial title means complete ownership with no obligations to a superior landlord.", difficulty: "hard" },
  
  // AIR - History, Communication, Language
  { id: 5, category: "air", question: "Who wrote the Declaration of Independence?", options: ["George Washington", "Benjamin Franklin", "Thomas Jefferson", "John Adams"], correctAnswer: 2, explanation: "Thomas Jefferson was the principal author of the Declaration of Independence in 1776.", difficulty: "easy" },
  { id: 6, category: "air", question: "What is the study of word origins called?", options: ["Phonetics", "Etymology", "Syntax", "Semantics"], correctAnswer: 1, explanation: "Etymology traces the history and origin of words and how their meanings have changed.", difficulty: "medium" },
  { id: 7, category: "air", question: "Which document established the framework for the U.S. government?", options: ["Bill of Rights", "Declaration of Independence", "Constitution", "Federalist Papers"], correctAnswer: 2, explanation: "The Constitution, ratified in 1788, established the structure of the federal government.", difficulty: "easy" },
  { id: 8, category: "air", question: "What is the Uniform Commercial Code (UCC)?", options: ["Tax law", "Criminal code", "Commercial transaction law", "Property law"], correctAnswer: 2, explanation: "The UCC standardizes commercial transactions across U.S. states.", difficulty: "hard" },
  
  // WATER - Emotional Intelligence, Health, Arts
  { id: 9, category: "water", question: "What are the five basic emotions according to psychology?", options: ["Happy, Sad, Angry, Scared, Surprised", "Love, Hate, Fear, Joy, Sorrow", "Calm, Excited, Bored, Anxious, Content", "Pride, Shame, Guilt, Envy, Gratitude"], correctAnswer: 0, explanation: "The five basic emotions are happiness, sadness, anger, fear, and surprise.", difficulty: "medium" },
  { id: 10, category: "water", question: "What is emotional intelligence (EQ)?", options: ["IQ for emotions", "Ability to manage and understand emotions", "Being overly emotional", "Suppressing emotions"], correctAnswer: 1, explanation: "EQ is the ability to recognize, understand, and manage our own emotions and those of others.", difficulty: "easy" },
  { id: 11, category: "water", question: "What is the recommended amount of water to drink daily?", options: ["4 cups", "6 cups", "8 cups", "12 cups"], correctAnswer: 2, explanation: "The general recommendation is about 8 cups (64 ounces) of water per day.", difficulty: "easy" },
  { id: 12, category: "water", question: "What is mindfulness?", options: ["Thinking about the future", "Being present in the moment", "Analyzing the past", "Multitasking"], correctAnswer: 1, explanation: "Mindfulness is the practice of being fully present and engaged in the current moment.", difficulty: "easy" },
  
  // SELF - Financial Literacy, Business, Leadership
  { id: 13, category: "self", question: "What is compound interest?", options: ["Interest on the principal only", "Interest on interest", "A type of loan", "A bank fee"], correctAnswer: 1, explanation: "Compound interest is interest calculated on both the initial principal and accumulated interest.", difficulty: "easy" },
  { id: 14, category: "self", question: "What does LLC stand for?", options: ["Limited Loan Company", "Limited Liability Corporation", "Limited Liability Company", "Legal Liability Coverage"], correctAnswer: 2, explanation: "LLC stands for Limited Liability Company, a business structure that protects personal assets.", difficulty: "easy" },
  { id: 15, category: "self", question: "What is a trust in legal terms?", options: ["A promise", "A fiduciary arrangement", "A type of bank account", "A business license"], correctAnswer: 1, explanation: "A trust is a fiduciary arrangement where a trustee holds assets for beneficiaries.", difficulty: "medium" },
  { id: 16, category: "self", question: "What is the difference between an asset and a liability?", options: ["Assets cost more", "Assets put money in your pocket, liabilities take it out", "They are the same", "Liabilities are always bad"], correctAnswer: 1, explanation: "Assets generate income or appreciate in value; liabilities cost you money over time.", difficulty: "medium" },
  { id: 17, category: "self", question: "What is a 508(c)(1)(a) organization?", options: ["A type of LLC", "A tax-exempt religious organization", "A government agency", "A bank"], correctAnswer: 1, explanation: "A 508(c)(1)(a) is a mandatory exception religious organization that is tax-exempt by law.", difficulty: "hard" },
  { id: 18, category: "self", question: "What is generational wealth?", options: ["Money for one generation", "Assets passed down through generations", "Government benefits", "Retirement savings"], correctAnswer: 1, explanation: "Generational wealth refers to assets passed from one generation to the next.", difficulty: "easy" },
];

const categoryIcons = {
  land: Map,
  air: Wind,
  water: Droplets,
  self: Heart,
};

const categoryColors = {
  land: "bg-green-100 text-green-800",
  air: "bg-blue-100 text-blue-800",
  water: "bg-cyan-100 text-cyan-800",
  self: "bg-purple-100 text-purple-800",
};

export default function TriviaChallenge() {
  const [gameMode, setGameMode] = useState<"menu" | "category" | "mixed" | "results">("menu");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [stats, setStats] = useState({ gamesPlayed: 0, totalCorrect: 0, totalQuestions: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("trivia_stats");
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  const saveStats = (newStats: typeof stats) => {
    localStorage.setItem("trivia_stats", JSON.stringify(newStats));
    setStats(newStats);
  };

  const startCategoryGame = (category: string) => {
    const categoryQuestions = questions.filter(q => q.category === category);
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    setCurrentQuestions(shuffled);
    setSelectedCategory(category);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
    setGameMode("category");
  };

  const startMixedGame = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
    setCurrentQuestions(shuffled);
    setSelectedCategory(null);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
    setGameMode("mixed");
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestions[currentIndex].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      toast.success("Correct!");
    } else {
      toast.error("Incorrect");
    }
    
    setAnswers([...answers, isCorrect]);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Game over
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        totalCorrect: stats.totalCorrect + score,
        totalQuestions: stats.totalQuestions + currentQuestions.length,
      };
      saveStats(newStats);
      setGameMode("results");
    }
  };

  const currentQuestion = currentQuestions[currentIndex];

  if (gameMode === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100 p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/game-center">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Center
              </Button>
            </Link>
          </div>

          <Card className="p-8 text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-indigo-600 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">L.A.W.S. Trivia Challenge</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Test your knowledge across all four L.A.W.S. pillars! Learn about Land, Air, Water, and Self
              through engaging trivia questions.
            </p>

            <div className="flex gap-4 justify-center mb-6">
              <Badge variant="outline">All Ages</Badge>
              <Badge variant="outline">All Pillars</Badge>
              <Badge variant="outline">Single Player</Badge>
            </div>

            {stats.gamesPlayed > 0 && (
              <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Your Stats</p>
                <p className="font-medium">
                  {stats.gamesPlayed} Games | {stats.totalCorrect}/{stats.totalQuestions} Correct 
                  ({stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%)
                </p>
              </div>
            )}
          </Card>

          {/* Game mode selection */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={startMixedGame}
            >
              <Brain className="w-10 h-10 mb-4 text-indigo-600" />
              <h3 className="text-xl font-bold mb-2">Mixed Challenge</h3>
              <p className="text-muted-foreground">
                10 questions from all categories. Test your overall L.A.W.S. knowledge!
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Category Challenge</h3>
              <p className="text-muted-foreground mb-4">
                5 questions from a specific pillar:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["land", "air", "water", "self"] as const).map(category => {
                  const Icon = categoryIcons[category];
                  return (
                    <Button
                      key={category}
                      variant="outline"
                      className={`${categoryColors[category]} border-0`}
                      onClick={() => startCategoryGame(category)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.toUpperCase()}
                    </Button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === "results") {
    const percentage = Math.round((score / currentQuestions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100 p-4">
        <div className="container max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${percentage >= 80 ? "text-yellow-500" : percentage >= 60 ? "text-gray-400" : "text-amber-700"}`} />
            
            <h2 className="text-3xl font-bold mb-2">
              {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good Job!" : "Keep Learning!"}
            </h2>
            
            <p className="text-4xl font-bold text-indigo-600 mb-4">
              {score} / {currentQuestions.length}
            </p>
            
            <p className="text-muted-foreground mb-6">
              You got {percentage}% correct
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {answers.map((correct, i) => (
                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center ${correct ? "bg-green-100" : "bg-red-100"}`}>
                  {correct ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setGameMode("menu")}>
                Back to Menu
              </Button>
              <Button 
                onClick={() => selectedCategory ? startCategoryGame(selectedCategory) : startMixedGame()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Play Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100 p-4">
      <div className="container max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => setGameMode("menu")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge className={categoryColors[currentQuestion.category]}>
              {currentQuestion.category.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {currentIndex + 1} / {currentQuestions.length}
            </Badge>
          </div>
          
          <div className="text-lg font-bold">
            Score: {score}
          </div>
        </div>

        <Progress value={((currentIndex + 1) / currentQuestions.length) * 100} className="mb-6" />

        <Card className="p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            {(() => {
              const Icon = categoryIcons[currentQuestion.category];
              return <Icon className="w-5 h-5" />;
            })()}
            <Badge variant={
              currentQuestion.difficulty === "easy" ? "default" :
              currentQuestion.difficulty === "medium" ? "secondary" : "destructive"
            }>
              {currentQuestion.difficulty}
            </Badge>
          </div>
          
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full justify-start text-left h-auto py-3 px-4";
              
              if (selectedAnswer !== null) {
                if (index === currentQuestion.correctAnswer) {
                  buttonClass += " bg-green-100 border-green-500 text-green-800";
                } else if (index === selectedAnswer) {
                  buttonClass += " bg-red-100 border-red-500 text-red-800";
                }
              }
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={buttonClass}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              );
            })}
          </div>
        </Card>

        {showExplanation && (
          <Card className="p-4 mb-4 bg-blue-50">
            <p className="text-sm">
              <strong>Explanation:</strong> {currentQuestion.explanation}
            </p>
          </Card>
        )}

        {selectedAnswer !== null && (
          <div className="flex justify-center">
            <Button onClick={nextQuestion} className="bg-indigo-600 hover:bg-indigo-700">
              {currentIndex < currentQuestions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
