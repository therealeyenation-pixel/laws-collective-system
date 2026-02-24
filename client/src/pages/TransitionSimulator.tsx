import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Briefcase,
  Building2,
  TrendingUp,
  CheckCircle,
  Circle,
  ArrowRight,
  DollarSign,
  GraduationCap,
  Shield,
  Users,
  Target,
  Lightbulb,
  Award,
  Download,
  Play,
  RotateCcw,
} from "lucide-react";

interface TransitionPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  milestones: string[];
  skills: string[];
  resources: string[];
}

interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  options: { value: string; label: string; score: number }[];
}

const TRANSITION_PHASES: TransitionPhase[] = [
  {
    id: "awareness",
    name: "Awareness & Exploration",
    description: "Understanding the entrepreneurship path and self-assessment",
    duration: "1-3 months",
    milestones: [
      "Complete entrepreneurship readiness assessment",
      "Identify potential business ideas aligned with skills",
      "Research market opportunities in your field",
      "Connect with entrepreneur mentors",
    ],
    skills: ["Self-assessment", "Market research", "Networking"],
    resources: ["L.A.W.S. Foundation Course", "Business Idea Workshop", "Mentor Matching"],
  },
  {
    id: "foundation",
    name: "Foundation Building",
    description: "Developing core business skills while employed",
    duration: "3-6 months",
    milestones: [
      "Complete financial literacy training",
      "Develop business plan draft",
      "Build emergency fund (3-6 months expenses)",
      "Start building professional network",
    ],
    skills: ["Financial literacy", "Business planning", "Budgeting", "Professional networking"],
    resources: ["Financial Literacy Simulator", "Business Plan Builder", "Networking Events"],
  },
  {
    id: "preparation",
    name: "Business Preparation",
    description: "Concrete steps toward business launch",
    duration: "3-6 months",
    milestones: [
      "Finalize business structure decision",
      "Register business entity",
      "Set up business banking",
      "Develop initial client pipeline",
    ],
    skills: ["Legal compliance", "Business formation", "Sales", "Marketing basics"],
    resources: ["Business Formation Wizard", "Legal Document Templates", "Marketing Course"],
  },
  {
    id: "transition",
    name: "Active Transition",
    description: "Gradual shift from employment to self-employment",
    duration: "6-12 months",
    milestones: [
      "Secure first paying clients/contracts",
      "Establish consistent revenue stream",
      "Build operational systems",
      "Negotiate transition with employer (if applicable)",
    ],
    skills: ["Client management", "Operations", "Time management", "Contract negotiation"],
    resources: ["Contract Templates", "Client Management System", "Time Tracking Tools"],
  },
  {
    id: "launch",
    name: "Full Independence",
    description: "Operating as a fully self-employed business owner",
    duration: "Ongoing",
    milestones: [
      "Achieve sustainable monthly revenue",
      "Hire first contractor or employee",
      "Establish business credit",
      "Develop growth strategy",
    ],
    skills: ["Leadership", "Strategic planning", "Hiring", "Business development"],
    resources: ["Growth Strategy Workshop", "Hiring Guide", "Business Credit Builder"],
  },
];

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q1",
    category: "Financial Readiness",
    question: "How many months of living expenses do you have saved?",
    options: [
      { value: "a", label: "Less than 1 month", score: 1 },
      { value: "b", label: "1-3 months", score: 2 },
      { value: "c", label: "3-6 months", score: 3 },
      { value: "d", label: "6+ months", score: 4 },
    ],
  },
  {
    id: "q2",
    category: "Skills & Experience",
    question: "How would you rate your expertise in your intended business area?",
    options: [
      { value: "a", label: "Beginner - still learning", score: 1 },
      { value: "b", label: "Intermediate - some experience", score: 2 },
      { value: "c", label: "Advanced - significant experience", score: 3 },
      { value: "d", label: "Expert - recognized in the field", score: 4 },
    ],
  },
  {
    id: "q3",
    category: "Market Understanding",
    question: "How well do you understand your target market and competition?",
    options: [
      { value: "a", label: "Haven't researched yet", score: 1 },
      { value: "b", label: "Basic understanding", score: 2 },
      { value: "c", label: "Good understanding with some gaps", score: 3 },
      { value: "d", label: "Deep understanding with validated insights", score: 4 },
    ],
  },
  {
    id: "q4",
    category: "Support System",
    question: "What level of support do you have from family/friends for this transition?",
    options: [
      { value: "a", label: "No support or opposition", score: 1 },
      { value: "b", label: "Neutral - neither supporting nor opposing", score: 2 },
      { value: "c", label: "Supportive but with concerns", score: 3 },
      { value: "d", label: "Fully supportive and engaged", score: 4 },
    ],
  },
  {
    id: "q5",
    category: "Risk Tolerance",
    question: "How comfortable are you with financial uncertainty?",
    options: [
      { value: "a", label: "Very uncomfortable - need stability", score: 1 },
      { value: "b", label: "Somewhat uncomfortable", score: 2 },
      { value: "c", label: "Moderately comfortable", score: 3 },
      { value: "d", label: "Very comfortable with calculated risks", score: 4 },
    ],
  },
  {
    id: "q6",
    category: "Business Planning",
    question: "How developed is your business plan?",
    options: [
      { value: "a", label: "Just an idea", score: 1 },
      { value: "b", label: "Basic outline", score: 2 },
      { value: "c", label: "Detailed draft", score: 3 },
      { value: "d", label: "Complete and validated", score: 4 },
    ],
  },
  {
    id: "q7",
    category: "Client Pipeline",
    question: "Do you have potential clients or customers identified?",
    options: [
      { value: "a", label: "No clients identified", score: 1 },
      { value: "b", label: "Some ideas but no contacts", score: 2 },
      { value: "c", label: "Contacts identified, not approached", score: 3 },
      { value: "d", label: "Clients ready to commit", score: 4 },
    ],
  },
  {
    id: "q8",
    category: "Time Commitment",
    question: "How much time can you dedicate to building your business while employed?",
    options: [
      { value: "a", label: "Less than 5 hours/week", score: 1 },
      { value: "b", label: "5-10 hours/week", score: 2 },
      { value: "c", label: "10-20 hours/week", score: 3 },
      { value: "d", label: "20+ hours/week", score: 4 },
    ],
  },
];

export default function TransitionSimulator() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);

  const calculateScore = () => {
    let total = 0;
    ASSESSMENT_QUESTIONS.forEach((q) => {
      const answer = assessmentAnswers[q.id];
      if (answer) {
        const option = q.options.find((o) => o.value === answer);
        if (option) total += option.score;
      }
    });
    return total;
  };

  const getReadinessLevel = (score: number) => {
    const maxScore = ASSESSMENT_QUESTIONS.length * 4;
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return { level: "Ready to Launch", color: "text-green-600", phase: 3 };
    if (percentage >= 60) return { level: "Preparation Phase", color: "text-blue-600", phase: 2 };
    if (percentage >= 40) return { level: "Foundation Building", color: "text-amber-600", phase: 1 };
    return { level: "Exploration Phase", color: "text-purple-600", phase: 0 };
  };

  const handleSubmitAssessment = () => {
    if (Object.keys(assessmentAnswers).length < ASSESSMENT_QUESTIONS.length) {
      toast.error("Please answer all questions");
      return;
    }
    setShowResults(true);
    const score = calculateScore();
    const readiness = getReadinessLevel(score);
    setCurrentPhase(readiness.phase);
    toast.success(`Assessment complete! You're in the ${readiness.level}`);
  };

  const resetAssessment = () => {
    setAssessmentAnswers({});
    setShowResults(false);
    setCurrentPhase(0);
    setCompletedMilestones([]);
  };

  const toggleMilestone = (milestone: string) => {
    setCompletedMilestones((prev) =>
      prev.includes(milestone) ? prev.filter((m) => m !== milestone) : [...prev, milestone]
    );
  };

  const exportTransitionPlan = () => {
    const plan = {
      assessmentScore: calculateScore(),
      readinessLevel: getReadinessLevel(calculateScore()),
      currentPhase: TRANSITION_PHASES[currentPhase],
      completedMilestones,
      allPhases: TRANSITION_PHASES,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transition-plan.json";
    a.click();
    toast.success("Transition plan exported");
  };

  const score = calculateScore();
  const readiness = getReadinessLevel(score);
  const progressPercentage = showResults ? ((currentPhase + 1) / TRANSITION_PHASES.length) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Workforce to Self-Employment Transition
            </h1>
            <p className="text-muted-foreground">
              Your personalized pathway from employee to business owner
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetAssessment}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" onClick={exportTransitionPlan}>
              <Download className="w-4 h-4 mr-2" />
              Export Plan
            </Button>
          </div>
        </div>

        <Tabs defaultValue="assessment" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assessment">Readiness Assessment</TabsTrigger>
            <TabsTrigger value="pathway">Transition Pathway</TabsTrigger>
            <TabsTrigger value="resources">Resources & Support</TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="space-y-6 mt-6">
            {!showResults ? (
              <Card>
                <CardHeader>
                  <CardTitle>Entrepreneurship Readiness Assessment</CardTitle>
                  <CardDescription>
                    Answer these questions to determine your current readiness for the transition
                    from traditional employment to self-employment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {ASSESSMENT_QUESTIONS.map((q, index) => (
                    <div key={q.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{q.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Question {index + 1} of {ASSESSMENT_QUESTIONS.length}
                        </span>
                      </div>
                      <p className="font-medium">{q.question}</p>
                      <RadioGroup
                        value={assessmentAnswers[q.id] || ""}
                        onValueChange={(value) =>
                          setAssessmentAnswers({ ...assessmentAnswers, [q.id]: value })
                        }
                      >
                        {q.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`${q.id}-${option.value}`} />
                            <Label htmlFor={`${q.id}-${option.value}`}>{option.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                  <Button onClick={handleSubmitAssessment} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Complete Assessment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <Award className="w-16 h-16 mx-auto text-primary" />
                      <h2 className="text-2xl font-bold">Your Readiness Score</h2>
                      <div className="text-5xl font-bold text-primary">
                        {score} / {ASSESSMENT_QUESTIONS.length * 4}
                      </div>
                      <Badge className={`text-lg px-4 py-2 ${readiness.color}`}>
                        {readiness.level}
                      </Badge>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Based on your assessment, you're currently in the{" "}
                        <strong>{TRANSITION_PHASES[readiness.phase].name}</strong> phase of your
                        entrepreneurship journey.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Financial Readiness", icon: DollarSign },
                    { label: "Skills & Experience", icon: GraduationCap },
                    { label: "Market Understanding", icon: Target },
                    { label: "Support System", icon: Users },
                  ].map((category) => (
                    <Card key={category.label}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <category.icon className="w-5 h-5 text-primary" />
                          <span className="text-sm font-medium">{category.label}</span>
                        </div>
                        <Progress value={Math.random() * 40 + 60} className="mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pathway" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Transition Journey</CardTitle>
                <CardDescription>
                  Follow this pathway from traditional employment to business ownership
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      Phase {currentPhase + 1} of {TRANSITION_PHASES.length}
                    </span>
                  </div>
                  <Progress value={progressPercentage} />
                </div>

                <div className="space-y-4">
                  {TRANSITION_PHASES.map((phase, index) => (
                    <Card
                      key={phase.id}
                      className={`overflow-hidden ${
                        index === currentPhase
                          ? "border-primary border-2"
                          : index < currentPhase
                          ? "bg-green-50 dark:bg-green-950/20"
                          : "opacity-60"
                      }`}
                    >
                      <div className="flex">
                        <div
                          className={`w-16 flex items-center justify-center ${
                            index < currentPhase
                              ? "bg-green-500"
                              : index === currentPhase
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        >
                          {index < currentPhase ? (
                            <CheckCircle className="w-8 h-8 text-white" />
                          ) : (
                            <span className="text-2xl font-bold text-white">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{phase.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {phase.description}
                              </p>
                              <Badge variant="outline" className="mt-2">
                                Duration: {phase.duration}
                              </Badge>
                            </div>
                            {index === currentPhase && (
                              <Badge className="bg-primary">Current Phase</Badge>
                            )}
                          </div>

                          {index === currentPhase && (
                            <div className="mt-4 space-y-3">
                              <p className="text-sm font-medium">Milestones:</p>
                              <div className="space-y-2">
                                {phase.milestones.map((milestone) => (
                                  <div
                                    key={milestone}
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => toggleMilestone(milestone)}
                                  >
                                    {completedMilestones.includes(milestone) ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    <span
                                      className={`text-sm ${
                                        completedMilestones.includes(milestone)
                                          ? "line-through text-muted-foreground"
                                          : ""
                                      }`}
                                    >
                                      {milestone}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">
                                <p className="text-sm font-medium w-full">Skills to develop:</p>
                                {phase.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {currentPhase < TRANSITION_PHASES.length - 1 && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => setCurrentPhase(currentPhase + 1)}
                    disabled={
                      completedMilestones.filter((m) =>
                        TRANSITION_PHASES[currentPhase].milestones.includes(m)
                      ).length < 2
                    }
                  >
                    Advance to Next Phase
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Training & Courses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "L.A.W.S. Foundation Course", status: "Available", link: "/products" },
                    { name: "Financial Literacy Simulator", status: "Available", link: "/financial-literacy-game" },
                    { name: "Business Plan Builder", status: "Available", link: "/business-plan-simulator" },
                    { name: "Grant Writing Workshop", status: "Available", link: "/grant-simulator" },
                  ].map((resource) => (
                    <div key={resource.name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="font-medium">{resource.name}</span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = resource.link}>
                        Access
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Formation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Business Structure Wizard", link: "/business-setup-wizard" },
                    { name: "Entity Formation Guide", link: "/business-formation" },
                    { name: "Legal Document Templates", link: "/document-vault" },
                    { name: "Tax Planning Simulator", link: "/tax-simulator" },
                  ].map((resource) => (
                    <div key={resource.name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="font-medium">{resource.name}</span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = resource.link}>
                        Access
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Mentorship & Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "AI Business Agents", link: "/agents" },
                    { name: "Consulting Sessions", link: "/products" },
                    { name: "Community Network", link: "/contractor-network" },
                    { name: "Peer Support Groups", link: "/support" },
                  ].map((resource) => (
                    <div key={resource.name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="font-medium">{resource.name}</span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = resource.link}>
                        Access
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Funding & Grants
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Grant Opportunities", link: "/grant-tracking" },
                    { name: "Demographic Grants", link: "/demographic-grants" },
                    { name: "Business Credit Builder", link: "/banking" },
                    { name: "Funding Strategy Guide", link: "/grant-management" },
                  ].map((resource) => (
                    <div key={resource.name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="font-medium">{resource.name}</span>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = resource.link}>
                        Access
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Lightbulb className="w-12 h-12 mx-auto text-primary" />
                  <h3 className="text-xl font-bold">The L.A.W.S. Approach to Self-Employment</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Our transition pathway is built on the L.A.W.S. framework: reconnecting with your
                    roots (<strong>Land</strong>), expanding your knowledge (<strong>Air</strong>),
                    healing and finding balance (<strong>Water</strong>), and discovering your
                    purpose (<strong>Self</strong>). This holistic approach ensures sustainable
                    success in your entrepreneurship journey.
                  </p>
                  <div className="flex justify-center gap-4 pt-4">
                    <Button onClick={() => window.location.href = "/products"}>
                      Start L.A.W.S. Foundation Course
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = "/services"}>
                      Book Consultation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
