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
  GraduationCap, BookOpen, Users, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, RotateCcw,
  Brain, ClipboardList, Calendar, Lightbulb
} from "lucide-react";

const EDUCATION_MODULES = [
  {
    id: "curriculum-design",
    title: "Curriculum Design",
    description: "Learn to create effective educational curricula.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is curriculum design?", options: ["Random topic selection", "Systematic planning of educational content and experiences", "Only textbook selection", "Testing students"], correct: 1 },
      { question: "What are learning objectives?", options: ["Teacher goals", "Specific, measurable outcomes students should achieve", "Class schedules", "Grading criteria"], correct: 1 },
      { question: "What is backward design?", options: ["Teaching in reverse", "Starting with desired outcomes then planning instruction", "Old teaching methods", "Student-led learning"], correct: 1 }
    ]
  },
  {
    id: "instructional-methods",
    title: "Instructional Methods",
    description: "Explore different teaching approaches and strategies.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is active learning?", options: ["Students listening only", "Students engaging through activities and discussion", "Teacher lecturing", "Reading assignments"], correct: 1 },
      { question: "What is differentiated instruction?", options: ["Teaching everyone the same way", "Adapting teaching to meet diverse learner needs", "Advanced classes only", "Standardized testing"], correct: 1 },
      { question: "What is scaffolding in education?", options: ["Building construction", "Providing temporary support to help learners progress", "Punishment system", "Grading scale"], correct: 1 }
    ]
  },
  {
    id: "assessment",
    title: "Assessment & Evaluation",
    description: "Design effective assessments to measure learning.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is formative assessment?", options: ["Final exam", "Ongoing assessment to guide instruction", "Grading only", "Standardized tests"], correct: 1 },
      { question: "What is summative assessment?", options: ["Daily quizzes", "Evaluation at the end of a learning period", "Homework", "Class participation"], correct: 1 },
      { question: "What is a rubric?", options: ["A type of test", "Scoring guide with criteria and levels", "Attendance sheet", "Lesson plan"], correct: 1 }
    ]
  },
  {
    id: "adult-learning",
    title: "Adult Learning Principles",
    description: "Understand how adults learn differently.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is andragogy?", options: ["Child education", "The art and science of adult learning", "Online learning", "Group projects"], correct: 1 },
      { question: "What motivates adult learners?", options: ["Grades only", "Relevance, practical application, and self-direction", "Parental pressure", "Competition"], correct: 1 },
      { question: "How do adults prefer to learn?", options: ["Passive listening", "Through experience and problem-solving", "Memorization", "Lectures only"], correct: 1 }
    ]
  },
  {
    id: "online-learning",
    title: "Online & Blended Learning",
    description: "Design effective digital learning experiences.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is blended learning?", options: ["Online only", "Combination of online and in-person instruction", "In-person only", "Self-study"], correct: 1 },
      { question: "What is asynchronous learning?", options: ["Real-time classes", "Learning that occurs at different times for different learners", "Group projects", "Lab work"], correct: 1 },
      { question: "What is important for online engagement?", options: ["Long lectures", "Interactive content, discussions, and clear structure", "No deadlines", "Text-only content"], correct: 1 }
    ]
  },
  {
    id: "program-management",
    title: "Educational Program Management",
    description: "Manage educational programs effectively.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is program evaluation?", options: ["Student grading", "Systematic assessment of program effectiveness", "Teacher reviews", "Budget planning"], correct: 1 },
      { question: "What is accreditation?", options: ["Student enrollment", "External validation of educational quality", "Graduation", "Course completion"], correct: 1 },
      { question: "What is continuous improvement in education?", options: ["Never changing", "Ongoing process of enhancing programs based on data", "Annual reviews only", "Student complaints"], correct: 1 }
    ]
  }
];

const LEARNING_STYLES = [
  { style: "Visual", description: "Learn through seeing - diagrams, charts, videos", icon: "👁️", strategies: ["Use infographics", "Create mind maps", "Watch demonstrations"] },
  { style: "Auditory", description: "Learn through hearing - lectures, discussions", icon: "👂", strategies: ["Record lessons", "Discuss concepts", "Use podcasts"] },
  { style: "Reading/Writing", description: "Learn through text - reading, note-taking", icon: "📝", strategies: ["Provide handouts", "Written exercises", "Journaling"] },
  { style: "Kinesthetic", description: "Learn through doing - hands-on activities", icon: "🤲", strategies: ["Simulations", "Role-playing", "Practice exercises"] },
];

const BLOOMS_TAXONOMY = [
  { level: "Remember", description: "Recall facts and basic concepts", verbs: "Define, list, recall, identify" },
  { level: "Understand", description: "Explain ideas or concepts", verbs: "Describe, explain, summarize, classify" },
  { level: "Apply", description: "Use information in new situations", verbs: "Execute, implement, solve, use" },
  { level: "Analyze", description: "Draw connections among ideas", verbs: "Differentiate, organize, compare, examine" },
  { level: "Evaluate", description: "Justify a decision or course of action", verbs: "Critique, judge, defend, assess" },
  { level: "Create", description: "Produce new or original work", verbs: "Design, construct, develop, formulate" },
];

export default function EducationSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = EDUCATION_MODULES[currentModule];
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
    if (currentModule < EDUCATION_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / EDUCATION_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              Education Simulator
            </h1>
            <p className="text-muted-foreground">Master educational design and delivery</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/education"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{EDUCATION_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="styles"><Brain className="w-4 h-4 mr-2" />Learning Styles</TabsTrigger>
            <TabsTrigger value="taxonomy"><Lightbulb className="w-4 h-4 mr-2" />Bloom's Taxonomy</TabsTrigger>
            <TabsTrigger value="planning"><Calendar className="w-4 h-4 mr-2" />Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {EDUCATION_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-blue-500' : ''} ${isCompleted ? 'bg-blue-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-blue-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-blue-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < EDUCATION_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="styles">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEARNING_STYLES.map((style) => (
                <Card key={style.style}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{style.icon}</span>
                      {style.style} Learners
                    </CardTitle>
                    <CardDescription>{style.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium mb-2">Teaching Strategies:</p>
                    <ul className="space-y-1">
                      {style.strategies.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />{s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="taxonomy">
            <Card>
              <CardHeader>
                <CardTitle>Bloom's Taxonomy of Learning</CardTitle>
                <CardDescription>Hierarchy of cognitive skills from lower to higher order thinking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {BLOOMS_TAXONOMY.map((level, i) => (
                    <div key={level.level} className="p-4 border rounded-lg" style={{ marginLeft: `${i * 20}px` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={i < 3 ? "secondary" : "default"}>{i + 1}</Badge>
                        <span className="font-medium">{level.level}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{level.description}</p>
                      <p className="text-xs"><span className="font-medium">Action verbs:</span> {level.verbs}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planning">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-600" />Lesson Plan Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { section: "Learning Objectives", desc: "What students will know/do" },
                    { section: "Materials Needed", desc: "Resources and supplies" },
                    { section: "Introduction", desc: "Hook and context setting" },
                    { section: "Direct Instruction", desc: "Teaching new content" },
                    { section: "Guided Practice", desc: "Supported application" },
                    { section: "Independent Practice", desc: "Solo work" },
                    { section: "Assessment", desc: "Check for understanding" },
                    { section: "Closure", desc: "Summary and preview" },
                  ].map((item) => (
                    <div key={item.section} className="p-2 border-l-4 border-blue-500 pl-3">
                      <p className="font-medium text-sm">{item.section}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" />Course Design Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "1. Identify target audience and needs",
                    "2. Define learning outcomes",
                    "3. Outline course structure",
                    "4. Develop content and materials",
                    "5. Design assessments",
                    "6. Create engagement activities",
                    "7. Plan delivery method",
                    "8. Pilot and gather feedback",
                    "9. Refine and finalize",
                    "10. Launch and evaluate",
                  ].map((step) => (
                    <div key={step} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      {step}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
