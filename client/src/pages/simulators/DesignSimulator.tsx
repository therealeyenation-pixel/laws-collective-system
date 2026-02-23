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
  Palette, Paintbrush, Layout, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  Type, Image, Layers, Sparkles
} from "lucide-react";

const DESIGN_MODULES = [
  {
    id: "design-principles",
    title: "Design Principles",
    description: "Master the fundamental principles of visual design.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is visual hierarchy?", options: ["Random arrangement", "Organizing elements by importance", "Using only one font", "Making everything the same size"], correct: 1 },
      { question: "What is the rule of thirds?", options: ["Use three colors", "Divide canvas into 9 equal parts for composition", "Three design revisions", "Three font sizes"], correct: 1 },
      { question: "What does 'white space' do in design?", options: ["Wastes space", "Improves readability and focus", "Should be eliminated", "Only for print"], correct: 1 }
    ]
  },
  {
    id: "color-theory",
    title: "Color Theory",
    description: "Understand color relationships and psychology.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What are complementary colors?", options: ["Similar colors", "Colors opposite on the color wheel", "Only primary colors", "Black and white"], correct: 1 },
      { question: "What emotion does blue typically convey?", options: ["Excitement", "Trust and calm", "Danger", "Hunger"], correct: 1 },
      { question: "What is a color palette?", options: ["Paint container", "Coordinated set of colors for a design", "Single color", "Random colors"], correct: 1 }
    ]
  },
  {
    id: "typography",
    title: "Typography Basics",
    description: "Learn effective use of fonts and text styling.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is kerning?", options: ["Font size", "Space between individual letters", "Line height", "Font weight"], correct: 1 },
      { question: "How many fonts should typically be used in a design?", options: ["As many as possible", "2-3 maximum", "Only one", "At least 5"], correct: 1 },
      { question: "What is a serif font?", options: ["Font without decorative strokes", "Font with small decorative strokes", "Handwritten font", "Bold font"], correct: 1 }
    ]
  },
  {
    id: "brand-identity",
    title: "Brand Identity Design",
    description: "Create cohesive brand visual systems.",
    duration: "30 min",
    tokensReward: 200,
    quiz: [
      { question: "What is a brand style guide?", options: ["Marketing plan", "Document defining visual brand standards", "Logo only", "Website design"], correct: 1 },
      { question: "What should a logo be?", options: ["Complex and detailed", "Simple, memorable, and scalable", "Trendy and temporary", "Text only"], correct: 1 },
      { question: "What is brand consistency?", options: ["Using different styles", "Uniform visual identity across all touchpoints", "Changing logos often", "Random design choices"], correct: 1 }
    ]
  },
  {
    id: "ui-design",
    title: "UI/UX Design Basics",
    description: "Design user-friendly digital interfaces.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is UX design?", options: ["Visual design only", "Designing the overall user experience", "Coding websites", "Marketing"], correct: 1 },
      { question: "What is a wireframe?", options: ["Final design", "Basic structural layout of a page", "Color scheme", "Logo design"], correct: 1 },
      { question: "What is responsive design?", options: ["Fast loading", "Design that adapts to different screen sizes", "Interactive animations", "Print design"], correct: 1 }
    ]
  },
  {
    id: "design-workflow",
    title: "Design Project Workflow",
    description: "Manage design projects from brief to delivery.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is a creative brief?", options: ["Short meeting", "Document outlining project requirements and goals", "Final design", "Invoice"], correct: 1 },
      { question: "What is the purpose of design iterations?", options: ["Waste time", "Refine and improve designs through feedback", "Create confusion", "Avoid client input"], correct: 1 },
      { question: "What file format is best for logos?", options: ["JPEG only", "Vector formats (SVG, AI, EPS)", "GIF", "BMP"], correct: 1 }
    ]
  }
];

const COLOR_PALETTES = [
  { name: "Professional", colors: ["#1a365d", "#2b6cb0", "#4299e1", "#90cdf4", "#ebf8ff"], mood: "Trust, stability" },
  { name: "Warm & Inviting", colors: ["#744210", "#c05621", "#ed8936", "#fbd38d", "#fffaf0"], mood: "Friendly, energetic" },
  { name: "Natural", colors: ["#22543d", "#38a169", "#68d391", "#9ae6b4", "#f0fff4"], mood: "Growth, health" },
  { name: "Bold & Modern", colors: ["#553c9a", "#805ad5", "#b794f4", "#e9d8fd", "#faf5ff"], mood: "Creative, innovative" },
];

const DESIGN_TOOLS = [
  { name: "Figma", type: "UI/UX Design", desc: "Collaborative interface design" },
  { name: "Adobe Illustrator", type: "Vector Graphics", desc: "Logo and illustration creation" },
  { name: "Adobe Photoshop", type: "Image Editing", desc: "Photo manipulation and graphics" },
  { name: "Canva", type: "Quick Design", desc: "Easy-to-use design for non-designers" },
  { name: "Adobe InDesign", type: "Print Layout", desc: "Multi-page document design" },
  { name: "Sketch", type: "UI Design", desc: "Mac-based interface design" },
];

export default function DesignSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = DESIGN_MODULES[currentModule];
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
    if (currentModule < DESIGN_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / DESIGN_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Palette className="w-6 h-6 text-pink-600" />
              Design Simulator
            </h1>
            <p className="text-muted-foreground">Master visual design fundamentals</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-pink-600 border-pink-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/design"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{DESIGN_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="colors"><Paintbrush className="w-4 h-4 mr-2" />Colors</TabsTrigger>
            <TabsTrigger value="typography"><Type className="w-4 h-4 mr-2" />Typography</TabsTrigger>
            <TabsTrigger value="tools"><Layers className="w-4 h-4 mr-2" />Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {DESIGN_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-pink-500' : ''} ${isCompleted ? 'bg-pink-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-pink-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-pink-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-pink-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < DESIGN_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors">
            <div className="space-y-4">
              <h3 className="font-semibold">Color Palette Examples</h3>
              {COLOR_PALETTES.map((palette) => (
                <Card key={palette.name}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{palette.name}</p>
                        <p className="text-sm text-muted-foreground">{palette.mood}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {palette.colors.map((color) => (
                        <div key={color} className="flex-1">
                          <div className="h-16 rounded-lg" style={{ backgroundColor: color }} />
                          <p className="text-xs text-center mt-1 font-mono">{color}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="typography">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Font Pairing Examples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { heading: "Playfair Display", body: "Source Sans Pro", style: "Elegant" },
                    { heading: "Montserrat", body: "Open Sans", style: "Modern" },
                    { heading: "Roboto Slab", body: "Roboto", style: "Professional" },
                  ].map((pair) => (
                    <div key={pair.heading} className="p-4 border rounded-lg">
                      <Badge variant="outline" className="mb-2">{pair.style}</Badge>
                      <p className="text-lg font-bold">{pair.heading}</p>
                      <p className="text-sm text-muted-foreground">Body: {pair.body}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Typography Scale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { size: "H1", px: "48px", use: "Main headlines" },
                    { size: "H2", px: "36px", use: "Section headers" },
                    { size: "H3", px: "24px", use: "Subsections" },
                    { size: "Body", px: "16px", use: "Paragraph text" },
                    { size: "Small", px: "14px", use: "Captions, labels" },
                  ].map((type) => (
                    <div key={type.size} className="flex items-center justify-between p-2 border-b">
                      <span className="font-medium">{type.size}</span>
                      <span className="text-sm text-muted-foreground">{type.px}</span>
                      <span className="text-xs">{type.use}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DESIGN_TOOLS.map((tool) => (
                <Card key={tool.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-600" />
                      {tool.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="mb-2">{tool.type}</Badge>
                    <p className="text-sm text-muted-foreground">{tool.desc}</p>
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
