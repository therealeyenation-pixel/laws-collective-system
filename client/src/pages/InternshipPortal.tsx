import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  GraduationCap, 
  Building2, 
  Users, 
  Briefcase,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Award,
  ArrowRight,
  Star,
  Target,
  BookOpen,
  TrendingUp,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Entity configuration with correct company names
const ENTITIES = {
  parent_llc: {
    name: "LuvOnPurpose Autonomous Wealth System, LLC",
    shortName: "Parent LLC",
    icon: Building2,
    color: "bg-blue-500",
    tracks: [
      { id: "exec_ops", name: "Executive Operations", description: "Strategic planning, executive support, board coordination" },
      { id: "finance", name: "Finance & Accounting", description: "Financial reporting, budgeting, compliance" },
      { id: "legal", name: "Legal & Compliance", description: "Contract review, regulatory compliance, risk management" },
      { id: "biz_dev", name: "Business Development", description: "Partnership development, market research, growth strategy" }
    ]
  },
  collective: {
    name: "The L.A.W.S. Collective, LLC",
    shortName: "Collective",
    icon: Users,
    color: "bg-green-500",
    tracks: [
      { id: "member_svc", name: "Member Services", description: "Member onboarding, support, engagement" },
      { id: "community_ops", name: "Community Operations", description: "Event coordination, community programs" },
      { id: "comms", name: "Communications", description: "Internal/external communications, marketing" },
      { id: "workforce", name: "Workforce Development", description: "Training programs, career pathways" }
    ]
  },
  academy: {
    name: "LuvOnPurpose Academy & Outreach",
    shortName: "Academy (508)",
    icon: GraduationCap,
    color: "bg-amber-500",
    tracks: [
      { id: "curriculum", name: "Curriculum Development", description: "Course design, content creation, assessment" },
      { id: "instruction", name: "Instruction Support", description: "Teaching assistance, student support" },
      { id: "program_admin", name: "Program Administration", description: "Enrollment, scheduling, records" },
      { id: "nonprofit_mgmt", name: "Nonprofit Management", description: "Grant compliance, donor relations" }
    ]
  },
  real_eye_nation: {
    name: "Real-Eye-Nation",
    shortName: "Real-Eye-Nation",
    icon: Briefcase,
    color: "bg-purple-500",
    tracks: [
      { id: "content", name: "Content Creation", description: "Writing, storytelling, narrative development" },
      { id: "media_prod", name: "Media Production", description: "Video, audio, podcast production" },
      { id: "research", name: "Research & Documentation", description: "Fact-checking, historical research" },
      { id: "digital_mkt", name: "Digital Marketing", description: "Social media, SEO, analytics" }
    ]
  }
};

// Internship phases
const PHASES = [
  { id: "orientation", name: "Orientation", duration: "Week 1-2", description: "Introduction to L.A.W.S. framework and entity operations" },
  { id: "training", name: "Core Training", duration: "Week 3-6", description: "Department-specific skills and competency development" },
  { id: "application", name: "Applied Learning", duration: "Week 7-10", description: "Hands-on projects with mentor supervision" },
  { id: "evaluation", name: "Final Evaluation", duration: "Week 11-12", description: "Performance review and transition planning" }
];

// Competencies aligned with L.A.W.S.
const COMPETENCIES = [
  { id: "laws_alignment", name: "L.A.W.S. Framework Alignment", pillar: "ALL", weight: 15 },
  { id: "professional_conduct", name: "Professional Conduct", pillar: "SELF", weight: 10 },
  { id: "communication", name: "Communication Skills", pillar: "AIR", weight: 10 },
  { id: "teamwork", name: "Teamwork & Collaboration", pillar: "WATER", weight: 10 },
  { id: "problem_solving", name: "Problem Solving", pillar: "AIR", weight: 10 },
  { id: "technical_skills", name: "Technical Skills", pillar: "SELF", weight: 15 },
  { id: "initiative", name: "Initiative & Self-Direction", pillar: "SELF", weight: 10 },
  { id: "adaptability", name: "Adaptability", pillar: "WATER", weight: 5 },
  { id: "time_management", name: "Time Management", pillar: "LAND", weight: 10 },
  { id: "ethical_judgment", name: "Ethical Judgment", pillar: "LAND", weight: 5 }
];

// Transition pathways
const TRANSITION_PATHS = [
  { 
    id: "w2_employee", 
    name: "W-2 Employee", 
    description: "Full-time employment with benefits package",
    requirements: ["Complete all phases", "Score 80%+ on evaluation", "Supervisor recommendation"],
    benefits: ["Health insurance", "401(k)", "PTO", "Professional development"]
  },
  { 
    id: "contractor", 
    name: "Independent Contractor", 
    description: "Project-based work with flexibility",
    requirements: ["Complete all phases", "Score 75%+ on evaluation", "Business entity formed"],
    benefits: ["Flexible schedule", "Multiple clients allowed", "Business expense deductions"]
  },
  { 
    id: "member", 
    name: "Collective Member", 
    description: "Join the The L.A.W.S. Collective with profit interest",
    requirements: ["Complete all phases", "Score 85%+ on evaluation", "House activation eligible"],
    benefits: ["Profit interest grant", "Voting rights", "Token economy participation", "House benefits"]
  }
];

export default function InternshipPortal() {
  const [selectedEntity, setSelectedEntity] = useState<string>("collective");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [currentPhase, setCurrentPhase] = useState(1); // 0-3 for phases
  const [competencyScores, setCompetencyScores] = useState<Record<string, number>>({});
  const [selfEvaluation, setSelfEvaluation] = useState("");
  const [selectedTransition, setSelectedTransition] = useState<string>("");

  // Calculate overall progress
  const phaseProgress = ((currentPhase + 1) / PHASES.length) * 100;
  
  // Calculate competency completion
  const completedCompetencies = Object.keys(competencyScores).length;
  const competencyProgress = (completedCompetencies / COMPETENCIES.length) * 100;

  // Calculate overall score
  const overallScore = COMPETENCIES.reduce((acc, comp) => {
    const score = competencyScores[comp.id] || 0;
    return acc + (score * comp.weight / 100);
  }, 0);

  const handleCompetencyScore = (competencyId: string, score: number) => {
    setCompetencyScores(prev => ({ ...prev, [competencyId]: score }));
  };

  const handleSubmitSelfEvaluation = () => {
    if (!selfEvaluation.trim()) {
      toast.error("Please enter your self-evaluation");
      return;
    }
    toast.success("Self-evaluation submitted successfully");
  };

  const handleDownloadCertificate = () => {
    toast.success("Generating completion certificate...");
    // In production, this would call the backend to generate the certificate
  };

  const entity = ENTITIES[selectedEntity as keyof typeof ENTITIES];
  const EntityIcon = entity?.icon || Building2;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Internship Portal</h1>
            <p className="text-muted-foreground mt-1">
              Track your progress, complete evaluations, and plan your transition
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            Week {Math.min((currentPhase + 1) * 3, 12)} of 12
          </Badge>
        </div>

        {/* Entity and Track Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Internship Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Entity</Label>
                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ENTITIES).map(([key, ent]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <ent.icon className="w-4 h-4" />
                          {ent.shortName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Track</Label>
                <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select track" />
                  </SelectTrigger>
                  <SelectContent>
                    {entity?.tracks.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        {track.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedTrack && (
              <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {entity?.tracks.find(t => t.id === selectedTrack)?.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Phase Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(phaseProgress)}%</span>
              </div>
              <Progress value={phaseProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Currently in: {PHASES[currentPhase]?.name}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Competencies</span>
                <span className="text-sm text-muted-foreground">{completedCompetencies}/{COMPETENCIES.length}</span>
              </div>
              <Progress value={competencyProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {COMPETENCIES.length - completedCompetencies} remaining
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <span className="text-sm text-muted-foreground">{Math.round(overallScore)}%</span>
              </div>
              <Progress value={overallScore} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {overallScore >= 85 ? "Excellent" : overallScore >= 75 ? "Good" : overallScore >= 60 ? "Satisfactory" : "Needs Improvement"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="phases" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="competencies">Competencies</TabsTrigger>
            <TabsTrigger value="evaluation">Self-Evaluation</TabsTrigger>
            <TabsTrigger value="transition">Transition</TabsTrigger>
          </TabsList>

          {/* Phases Tab */}
          <TabsContent value="phases" className="space-y-4">
            <div className="grid gap-4">
              {PHASES.map((phase, index) => (
                <Card 
                  key={phase.id} 
                  className={`${index === currentPhase ? 'border-primary' : ''} ${index < currentPhase ? 'bg-secondary/20' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${index < currentPhase ? 'bg-green-500' : index === currentPhase ? 'bg-primary' : 'bg-secondary'}`}>
                        {index < currentPhase ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : index === currentPhase ? (
                          <Clock className="w-5 h-5 text-white" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{phase.name}</h3>
                          <Badge variant={index < currentPhase ? "default" : index === currentPhase ? "secondary" : "outline"}>
                            {phase.duration}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                        {index === currentPhase && (
                          <Button 
                            size="sm" 
                            className="mt-3"
                            onClick={() => setCurrentPhase(Math.min(currentPhase + 1, PHASES.length - 1))}
                          >
                            Mark Complete
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Competencies Tab */}
          <TabsContent value="competencies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Competency Assessment</CardTitle>
                <CardDescription>
                  Rate your proficiency in each competency area (1-5 scale)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {COMPETENCIES.map((comp) => (
                    <div key={comp.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comp.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {comp.pillar}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ({comp.weight}% weight)
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <Button
                            key={score}
                            variant={competencyScores[comp.id] === score ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => handleCompetencyScore(comp.id, score)}
                          >
                            {score}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Self-Evaluation Tab */}
          <TabsContent value="evaluation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Self-Evaluation
                </CardTitle>
                <CardDescription>
                  Reflect on your internship experience and growth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>What were your key accomplishments during this internship?</Label>
                  <Textarea 
                    placeholder="Describe your main achievements and contributions..."
                    className="mt-2"
                    rows={4}
                    value={selfEvaluation}
                    onChange={(e) => setSelfEvaluation(e.target.value)}
                  />
                </div>
                <div>
                  <Label>What challenges did you face and how did you overcome them?</Label>
                  <Textarea 
                    placeholder="Describe challenges and your problem-solving approach..."
                    className="mt-2"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>How has this internship aligned with your understanding of the L.A.W.S. framework?</Label>
                  <Textarea 
                    placeholder="Reflect on LAND, AIR, WATER, SELF pillars..."
                    className="mt-2"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>What are your goals for the next phase of your journey?</Label>
                  <Textarea 
                    placeholder="Describe your career aspirations and next steps..."
                    className="mt-2"
                    rows={4}
                  />
                </div>
                <Button onClick={handleSubmitSelfEvaluation}>
                  Submit Self-Evaluation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transition Tab */}
          <TabsContent value="transition" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Career Pathway Options
                </CardTitle>
                <CardDescription>
                  Choose your transition path based on your goals and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {TRANSITION_PATHS.map((path) => (
                    <Card 
                      key={path.id}
                      className={`cursor-pointer transition-all ${selectedTransition === path.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                      onClick={() => setSelectedTransition(path.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{path.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
                          </div>
                          {selectedTransition === path.id && (
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Requirements</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {path.requirements.map((req, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <Circle className="w-2 h-2" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2">Benefits</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {path.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <Star className="w-2 h-2 text-amber-500" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completion Certificate */}
            {currentPhase === PHASES.length - 1 && overallScore >= 75 && (
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Award className="w-12 h-12 text-amber-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Internship Complete!</h3>
                        <p className="text-sm text-muted-foreground">
                          Congratulations on completing your internship with a score of {Math.round(overallScore)}%
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleDownloadCertificate}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
