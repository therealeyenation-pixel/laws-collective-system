import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Heart, Activity, Apple, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  Brain, Dumbbell, Moon, Droplets
} from "lucide-react";

const HEALTH_MODULES = [
  {
    id: "wellness-basics",
    title: "Workplace Wellness Fundamentals",
    description: "Understand the importance of employee wellness programs.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is the primary goal of workplace wellness programs?", options: ["Reduce salaries", "Improve employee health and productivity", "Increase work hours", "Cut benefits"], correct: 1 },
      { question: "What is the typical ROI of wellness programs?", options: ["No return", "$1.50-$3 for every $1 invested", "Negative return", "$10+ for every $1"], correct: 1 },
      { question: "Which is NOT a common wellness program component?", options: ["Health screenings", "Fitness challenges", "Mandatory overtime", "Stress management"], correct: 2 }
    ]
  },
  {
    id: "nutrition",
    title: "Nutrition & Healthy Eating",
    description: "Learn about nutrition fundamentals for better health.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "How many servings of fruits/vegetables are recommended daily?", options: ["1-2", "5-9", "10-15", "None needed"], correct: 1 },
      { question: "What is the recommended daily water intake?", options: ["1-2 cups", "8+ cups (64oz)", "Only when thirsty", "1 gallon minimum"], correct: 1 },
      { question: "Which nutrient provides the most energy per gram?", options: ["Protein", "Carbohydrates", "Fat", "Vitamins"], correct: 2 }
    ]
  },
  {
    id: "physical-activity",
    title: "Physical Activity & Exercise",
    description: "Understand exercise guidelines and benefits.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "How much moderate exercise is recommended weekly?", options: ["30 minutes total", "150 minutes", "500 minutes", "Exercise isn't necessary"], correct: 1 },
      { question: "What are the benefits of regular exercise?", options: ["Only weight loss", "Improved mood, energy, sleep, and health", "Just muscle building", "No proven benefits"], correct: 1 },
      { question: "What is 'sedentary behavior'?", options: ["Active lifestyle", "Prolonged sitting or inactivity", "Moderate exercise", "Walking"], correct: 1 }
    ]
  },
  {
    id: "mental-health",
    title: "Mental Health & Stress Management",
    description: "Address mental wellness in the workplace.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What percentage of adults experience mental health issues?", options: ["Less than 5%", "About 20% (1 in 5)", "Over 50%", "Mental health isn't measurable"], correct: 1 },
      { question: "What is burnout?", options: ["Physical exhaustion only", "Chronic workplace stress leading to exhaustion and detachment", "Normal tiredness", "A medical condition"], correct: 1 },
      { question: "Which is an effective stress management technique?", options: ["Ignoring stress", "Mindfulness and deep breathing", "Working longer hours", "Avoiding all challenges"], correct: 1 }
    ]
  },
  {
    id: "sleep-health",
    title: "Sleep & Recovery",
    description: "Understand the importance of quality sleep.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "How much sleep do adults need nightly?", options: ["4-5 hours", "7-9 hours", "10-12 hours", "Sleep needs vary too much"], correct: 1 },
      { question: "What is sleep hygiene?", options: ["Washing before bed", "Habits that promote good sleep", "Sleeping in clean sheets", "Morning routines"], correct: 1 },
      { question: "What is the impact of poor sleep on work?", options: ["No impact", "Reduced productivity, focus, and decision-making", "Improved creativity", "Better problem-solving"], correct: 1 }
    ]
  },
  {
    id: "benefits-admin",
    title: "Health Benefits Administration",
    description: "Manage employee health benefits effectively.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is an HSA?", options: ["Health Savings Account", "Hospital Service Agreement", "Health Service Administration", "Home Safety Assessment"], correct: 0 },
      { question: "What is open enrollment?", options: ["Hiring period", "Period to select or change benefits", "Training program", "Performance review"], correct: 1 },
      { question: "What is COBRA?", options: ["A snake", "Continuation of health coverage after leaving job", "A fitness program", "A diet plan"], correct: 1 }
    ]
  }
];

const WELLNESS_DIMENSIONS = [
  { name: "Physical", icon: Dumbbell, description: "Exercise, nutrition, sleep, and preventive care", color: "text-red-600 bg-red-100" },
  { name: "Mental", icon: Brain, description: "Stress management, mindfulness, and emotional health", color: "text-purple-600 bg-purple-100" },
  { name: "Nutritional", icon: Apple, description: "Healthy eating habits and hydration", color: "text-green-600 bg-green-100" },
  { name: "Sleep", icon: Moon, description: "Quality rest and recovery", color: "text-blue-600 bg-blue-100" },
];

export default function HealthSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);
  const [wellnessGoals, setWellnessGoals] = useState<Record<string, boolean>>({});

  const module = HEALTH_MODULES[currentModule];
  const quiz = module?.quiz || [];
  const question = quiz[currentQuestion];

  const handleAnswerSelect = (index: number) => setSelectedAnswer(index);

  const handleNextQuestion = () => {
    if (selectedAnswer === null) { toast.error("Please select an answer"); return; }
    const isCorrect = selectedAnswer === question.correct;
    if (isCorrect) { setQuizScore(prev => prev + 1); toast.success("Correct!"); }
    else { toast.error(`Incorrect. The correct answer was: ${question.options[question.correct]}`); }

    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      const finalScore = quizScore + (isCorrect ? 1 : 0);
      const percentage = Math.round((finalScore / quiz.length) * 100);
      if (percentage >= 70) {
        setTotalTokensEarned(prev => prev + module.tokensReward);
        toast.success(`Module completed! You earned ${module.tokensReward} tokens!`);
      }
      setModuleProgress(prev => ({ ...prev, [module.id]: { completed: true, score: percentage } }));
      setShowResults(true);
    }
  };

  const handleNextModule = () => {
    if (currentModule < HEALTH_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / HEALTH_MODULES.length) * 100);

  const WELLNESS_GOALS = [
    "Drink 8 glasses of water daily",
    "Exercise 30 minutes, 5 days a week",
    "Get 7-9 hours of sleep",
    "Eat 5 servings of fruits/vegetables",
    "Take regular breaks from sitting",
    "Practice mindfulness 10 minutes daily",
    "Limit processed foods",
    "Schedule annual health checkup",
  ];

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-600" />
              Health & Wellness Simulator
            </h1>
            <p className="text-muted-foreground">Build healthy habits for life</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-rose-600 border-rose-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/health"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{HEALTH_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="dimensions"><Activity className="w-4 h-4 mr-2" />Wellness</TabsTrigger>
            <TabsTrigger value="goals"><Target className="w-4 h-4 mr-2" />Goals</TabsTrigger>
            <TabsTrigger value="resources"><Heart className="w-4 h-4 mr-2" />Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {HEALTH_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-rose-500' : ''} ${isCompleted ? 'bg-rose-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-rose-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{mod.title}</p>
                            <p className="text-xs text-muted-foreground">{mod.duration} • {mod.tokensReward} tokens</p>
                            {progress?.score !== undefined && <Badge variant={progress.score >= 70 ? "default" : "secondary"} className="mt-1">Score: {progress.score}%</Badge>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-rose-600" />{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showResults ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between text-sm">
                          <span>Question {currentQuestion + 1} of {quiz.length}</span>
                          <Badge variant="outline">{quizScore} correct</Badge>
                        </div>
                        <Progress value={((currentQuestion + 1) / quiz.length) * 100} className="h-2" />
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="font-medium mb-4">{question?.question}</p>
                          <RadioGroup value={selectedAnswer?.toString()} onValueChange={(v) => handleAnswerSelect(parseInt(v))}>
                            {question?.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                        <Button onClick={handleNextQuestion} className="w-full">
                          {currentQuestion < quiz.length - 1 ? "Next Question" : "Complete Module"}<ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <div className="w-20 h-20 mx-auto bg-rose-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-rose-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-rose-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < HEALTH_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dimensions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {WELLNESS_DIMENSIONS.map((dim) => (
                <Card key={dim.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full ${dim.color} flex items-center justify-center`}>
                        <dim.icon className="w-5 h-5" />
                      </div>
                      {dim.name} Wellness
                    </CardTitle>
                    <CardDescription>{dim.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Wellness Goals Tracker</CardTitle>
                <CardDescription>Track your daily wellness habits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Progress value={(Object.values(wellnessGoals).filter(Boolean).length / WELLNESS_GOALS.length) * 100} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{Object.values(wellnessGoals).filter(Boolean).length}/{WELLNESS_GOALS.length} goals completed today</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {WELLNESS_GOALS.map((goal) => (
                    <div key={goal} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => setWellnessGoals(prev => ({ ...prev, [goal]: !prev[goal] }))}>
                      <div className={`w-5 h-5 rounded border ${wellnessGoals[goal] ? 'bg-rose-600 border-rose-600' : 'border-gray-300'} flex items-center justify-center`}>
                        {wellnessGoals[goal] && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-sm">{goal}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Hydration Calculator", desc: "Calculate your daily water needs based on weight and activity", icon: Droplets },
                { title: "BMI Calculator", desc: "Check your Body Mass Index", icon: Activity },
                { title: "Sleep Quality Guide", desc: "Tips for better sleep hygiene", icon: Moon },
                { title: "Stress Assessment", desc: "Evaluate your stress levels", icon: Brain },
              ].map((resource) => (
                <Card key={resource.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info("Resource coming soon!")}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                        <resource.icon className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground">{resource.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
