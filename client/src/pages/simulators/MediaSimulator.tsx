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
  Video, Camera, Share2, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  Calendar, BarChart3, MessageSquare, TrendingUp
} from "lucide-react";

const MEDIA_MODULES = [
  {
    id: "content-strategy",
    title: "Content Strategy",
    description: "Develop effective content strategies for your audience.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is content strategy?", options: ["Random posting", "Planning, creation, and management of content to achieve goals", "Only social media", "Advertising only"], correct: 1 },
      { question: "What is a content pillar?", options: ["A building structure", "Core topic themes that guide content creation", "Single post", "Hashtag"], correct: 1 },
      { question: "Why is audience research important?", options: ["It's not important", "To create content that resonates with target audience", "To copy competitors", "For legal reasons"], correct: 1 }
    ]
  },
  {
    id: "social-media",
    title: "Social Media Marketing",
    description: "Master social media platforms and strategies.",
    duration: "30 min",
    tokensReward: 200,
    quiz: [
      { question: "What is engagement rate?", options: ["Number of followers", "Interactions divided by reach or followers", "Post frequency", "Ad spend"], correct: 1 },
      { question: "What is the best time to post on social media?", options: ["Always midnight", "When your specific audience is most active", "Only weekends", "Never matters"], correct: 1 },
      { question: "What is a call-to-action (CTA)?", options: ["Phone number", "Prompt encouraging audience to take specific action", "Company slogan", "Hashtag"], correct: 1 }
    ]
  },
  {
    id: "video-production",
    title: "Video Production Basics",
    description: "Learn fundamentals of video content creation.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is the rule of thirds in video?", options: ["Three-minute videos", "Compositional guide dividing frame into 9 parts", "Three camera angles", "Three takes"], correct: 1 },
      { question: "What is B-roll footage?", options: ["Main interview", "Supplementary footage to enhance storytelling", "Bloopers", "Behind-the-scenes"], correct: 1 },
      { question: "What is the ideal video length for social media?", options: ["Always 1 hour", "Depends on platform and content type", "30 seconds only", "Doesn't matter"], correct: 1 }
    ]
  },
  {
    id: "content-calendar",
    title: "Content Calendar Management",
    description: "Plan and organize content effectively.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is a content calendar?", options: ["Holiday list", "Schedule for planning and organizing content publication", "Meeting schedule", "Sales calendar"], correct: 1 },
      { question: "How far ahead should you plan content?", options: ["Day of", "At least 2-4 weeks, ideally months", "Years ahead only", "Never plan"], correct: 1 },
      { question: "What should a content calendar include?", options: ["Just dates", "Dates, platforms, content type, copy, and assets", "Only holidays", "Employee birthdays"], correct: 1 }
    ]
  },
  {
    id: "analytics",
    title: "Media Analytics",
    description: "Measure and analyze content performance.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is reach vs impressions?", options: ["Same thing", "Reach is unique viewers; impressions is total views", "Impressions is unique", "Neither matters"], correct: 1 },
      { question: "What is conversion rate?", options: ["Currency exchange", "Percentage who take desired action", "Follower count", "Post frequency"], correct: 1 },
      { question: "What is ROI in media?", options: ["Return on Investment", "Rate of Impressions", "Reach of Influence", "Range of Interest"], correct: 0 }
    ]
  },
  {
    id: "brand-voice",
    title: "Brand Voice & Messaging",
    description: "Develop consistent brand communication.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is brand voice?", options: ["Company spokesperson", "Consistent personality in all communications", "Logo", "Tagline only"], correct: 1 },
      { question: "Why is consistency important in branding?", options: ["It's not", "Builds recognition and trust", "Saves money", "Legal requirement"], correct: 1 },
      { question: "What is a brand style guide?", options: ["Fashion tips", "Document defining brand visual and verbal standards", "Employee dress code", "Office decor"], correct: 1 }
    ]
  }
];

const PLATFORMS = [
  { name: "Instagram", audience: "18-34", best_for: "Visual content, lifestyle, products", posting: "1-2 posts/day, Stories daily" },
  { name: "LinkedIn", audience: "25-54 professionals", best_for: "B2B, thought leadership, recruiting", posting: "1-2 posts/day weekdays" },
  { name: "TikTok", audience: "16-24", best_for: "Short-form video, trends, entertainment", posting: "1-4 videos/day" },
  { name: "Facebook", audience: "25-54", best_for: "Community, events, diverse content", posting: "1-2 posts/day" },
  { name: "YouTube", audience: "18-49", best_for: "Long-form video, tutorials, vlogs", posting: "1-2 videos/week" },
  { name: "X (Twitter)", audience: "25-49", best_for: "News, conversations, customer service", posting: "3-5 tweets/day" },
];

const CONTENT_TYPES = [
  { type: "Educational", examples: "How-tos, tutorials, tips", goal: "Build authority" },
  { type: "Entertaining", examples: "Memes, humor, trends", goal: "Increase engagement" },
  { type: "Inspirational", examples: "Quotes, success stories", goal: "Emotional connection" },
  { type: "Promotional", examples: "Products, services, offers", goal: "Drive sales" },
  { type: "User-Generated", examples: "Reviews, testimonials", goal: "Build trust" },
  { type: "Behind-the-Scenes", examples: "Team, process, culture", goal: "Humanize brand" },
];

export default function MediaSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = MEDIA_MODULES[currentModule];
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
    if (currentModule < MEDIA_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / MEDIA_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Video className="w-6 h-6 text-red-600" />
              Media Simulator
            </h1>
            <p className="text-muted-foreground">Master media and content marketing</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-red-600 border-red-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/media"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{MEDIA_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="platforms"><Share2 className="w-4 h-4 mr-2" />Platforms</TabsTrigger>
            <TabsTrigger value="content"><Camera className="w-4 h-4 mr-2" />Content Types</TabsTrigger>
            <TabsTrigger value="metrics"><BarChart3 className="w-4 h-4 mr-2" />Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {MEDIA_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-red-500' : ''} ${isCompleted ? 'bg-red-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-red-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-red-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < MEDIA_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="platforms">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATFORMS.map((platform) => (
                <Card key={platform.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{platform.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Audience:</span> {platform.audience}</div>
                    <div><span className="text-muted-foreground">Best for:</span> {platform.best_for}</div>
                    <Badge variant="outline" className="text-xs">{platform.posting}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONTENT_TYPES.map((content) => (
                <Card key={content.type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-red-600" />
                      {content.type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{content.examples}</p>
                    <Badge variant="secondary">{content.goal}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-red-600" />Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { metric: "Reach", desc: "Unique users who saw content" },
                    { metric: "Impressions", desc: "Total times content was displayed" },
                    { metric: "Engagement Rate", desc: "(Interactions / Reach) × 100" },
                    { metric: "Click-Through Rate", desc: "(Clicks / Impressions) × 100" },
                    { metric: "Conversion Rate", desc: "(Conversions / Clicks) × 100" },
                    { metric: "Cost Per Click", desc: "Ad spend / Total clicks" },
                  ].map((item) => (
                    <div key={item.metric} className="flex justify-between items-center p-2 border-b">
                      <span className="font-medium">{item.metric}</span>
                      <span className="text-sm text-muted-foreground">{item.desc}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-red-600" />Content Calendar Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Plan content 2-4 weeks in advance",
                    "Include holidays and relevant events",
                    "Mix content types (80/20 rule: 80% value, 20% promotional)",
                    "Schedule posts at optimal times",
                    "Leave room for timely/reactive content",
                    "Track performance and adjust strategy",
                    "Repurpose high-performing content",
                    "Maintain consistent posting frequency",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      {tip}
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
