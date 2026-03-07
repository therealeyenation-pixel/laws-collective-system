import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  Video,
  FileText,
  CheckCircle,
  Clock,
  UserPlus,
  ClipboardList,
  Star,
  Download,
  Send,
  Bot,
} from "lucide-react";

interface InterviewStage {
  id: string;
  name: string;
  description: string;
  duration: string;
  panelSize: number;
  format: "remote" | "in-person" | "hybrid";
  aiAssistance: string[];
}

interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  evaluationCriteria: string[];
  aiSuggested: boolean;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  stage: string;
  score: number | null;
  scheduledDate: string | null;
}

const INTERVIEW_STAGES: InterviewStage[] = [
  {
    id: "screening",
    name: "Initial Screening",
    description: "AI-assisted resume review and initial qualification check",
    duration: "15-20 minutes",
    panelSize: 1,
    format: "remote",
    aiAssistance: [
      "Resume parsing and qualification matching",
      "Initial screening questions generation",
      "Availability coordination",
    ],
  },
  {
    id: "phone",
    name: "Phone Interview",
    description: "Brief conversation to assess communication and basic fit",
    duration: "30 minutes",
    panelSize: 1,
    format: "remote",
    aiAssistance: [
      "Question suggestions based on resume gaps",
      "Real-time note transcription",
      "Candidate response analysis",
    ],
  },
  {
    id: "technical",
    name: "Technical/Skills Assessment",
    description: "Position-specific skills evaluation and scenario-based questions",
    duration: "45-60 minutes",
    panelSize: 2,
    format: "remote",
    aiAssistance: [
      "Position-specific question generation",
      "Skills assessment scoring",
      "Comparative analysis with role requirements",
    ],
  },
  {
    id: "panel",
    name: "Panel Interview",
    description: "Comprehensive interview with cross-functional team members",
    duration: "60 minutes",
    panelSize: 3,
    format: "remote",
    aiAssistance: [
      "Panel coordination and scheduling",
      "Question distribution among panelists",
      "Consolidated feedback compilation",
    ],
  },
  {
    id: "final",
    name: "Final Interview",
    description: "Executive-level conversation focusing on culture fit and vision alignment",
    duration: "45 minutes",
    panelSize: 2,
    format: "remote",
    aiAssistance: [
      "Background summary preparation",
      "Culture fit assessment questions",
      "Offer recommendation generation",
    ],
  },
];

const POSITION_QUESTIONS: Record<string, InterviewQuestion[]> = {
  "Grant Manager": [
    {
      id: "gm-1",
      category: "Experience",
      question: "Describe your experience managing federal grants, including compliance requirements and reporting cycles.",
      evaluationCriteria: ["Federal grant experience", "Compliance knowledge", "Reporting proficiency"],
      aiSuggested: false,
    },
    {
      id: "gm-2",
      category: "Technical",
      question: "How do you approach budget management for multi-year grants with variable funding?",
      evaluationCriteria: ["Budget management", "Financial planning", "Adaptability"],
      aiSuggested: false,
    },
    {
      id: "gm-3",
      category: "AI Collaboration",
      question: "How would you leverage AI assistance to improve grant compliance monitoring and deadline management?",
      evaluationCriteria: ["AI openness", "Process improvement", "Technology adoption"],
      aiSuggested: true,
    },
  ],
  "Education & Outreach Coordinator": [
    {
      id: "eoc-1",
      category: "Experience",
      question: "Describe a successful educational program you developed and delivered to adult learners.",
      evaluationCriteria: ["Curriculum development", "Adult learning principles", "Program delivery"],
      aiSuggested: false,
    },
    {
      id: "eoc-2",
      category: "Community",
      question: "How do you build trust and engagement with communities that may be skeptical of institutional programs?",
      evaluationCriteria: ["Community engagement", "Cultural competency", "Relationship building"],
      aiSuggested: false,
    },
    {
      id: "eoc-3",
      category: "AI Collaboration",
      question: "How would you use AI tools to personalize learning experiences while maintaining authentic human connection?",
      evaluationCriteria: ["AI integration", "Personalization", "Human-centered approach"],
      aiSuggested: true,
    },
  ],
  "HR Manager": [
    {
      id: "hrm-1",
      category: "Experience",
      question: "Describe your approach to building an inclusive hiring process that attracts diverse talent.",
      evaluationCriteria: ["DEI knowledge", "Recruitment strategy", "Process design"],
      aiSuggested: false,
    },
    {
      id: "hrm-2",
      category: "Technical",
      question: "How do you balance compliance requirements with creating a positive employee experience?",
      evaluationCriteria: ["Compliance knowledge", "Employee experience", "Balance"],
      aiSuggested: false,
    },
    {
      id: "hrm-3",
      category: "AI Collaboration",
      question: "How would you implement AI-assisted HR processes while ensuring fairness and avoiding algorithmic bias?",
      evaluationCriteria: ["AI ethics", "Bias awareness", "Implementation strategy"],
      aiSuggested: true,
    },
  ],
  default: [
    {
      id: "def-1",
      category: "Experience",
      question: "Tell us about your most relevant experience for this position and what you learned from it.",
      evaluationCriteria: ["Relevant experience", "Self-awareness", "Learning orientation"],
      aiSuggested: false,
    },
    {
      id: "def-2",
      category: "Values",
      question: "What attracted you to The The L.A.W.S. Collective's mission of building multi-generational wealth through community?",
      evaluationCriteria: ["Mission alignment", "Values fit", "Motivation"],
      aiSuggested: false,
    },
    {
      id: "def-3",
      category: "AI Collaboration",
      question: "How do you see AI assistance enhancing your productivity in this role while maintaining the human elements that matter most?",
      evaluationCriteria: ["AI openness", "Human-AI balance", "Productivity mindset"],
      aiSuggested: true,
    },
    {
      id: "def-4",
      category: "Growth",
      question: "Describe how you would approach the transition from traditional employment to potentially supporting others in their entrepreneurship journey.",
      evaluationCriteria: ["Growth mindset", "Entrepreneurial thinking", "Mentorship orientation"],
      aiSuggested: true,
    },
  ],
};

export default function InterviewProcessManager() {
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: "1",
      name: "Sample Candidate",
      email: "candidate@example.com",
      position: "Grant Manager",
      stage: "screening",
      score: null,
      scheduledDate: null,
    },
  ]);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: "", email: "", position: "" });
  const [selectedStage, setSelectedStage] = useState<InterviewStage | null>(null);

  const positions = [
    "Grant Manager",
    "Grant Writer",
    "Education & Outreach Coordinator",
    "HR Manager",
    "Operations Manager",
    "Media & Outreach Coordinator",
    "Finance & Operations Coordinator",
    "Business Analyst",
    "Health & Wellness Coordinator",
    "Design & Operations Coordinator",
  ];

  const handleAddCandidate = () => {
    if (!newCandidate.name || !newCandidate.email || !newCandidate.position) {
      toast.error("Please fill in all candidate fields");
      return;
    }
    const candidate: Candidate = {
      id: Date.now().toString(),
      name: newCandidate.name,
      email: newCandidate.email,
      position: newCandidate.position,
      stage: "screening",
      score: null,
      scheduledDate: null,
    };
    setCandidates([...candidates, candidate]);
    setNewCandidate({ name: "", email: "", position: "" });
    setShowAddCandidate(false);
    toast.success("Candidate added to pipeline");
  };

  const advanceCandidate = (candidateId: string) => {
    setCandidates(candidates.map(c => {
      if (c.id === candidateId) {
        const currentIndex = INTERVIEW_STAGES.findIndex(s => s.id === c.stage);
        if (currentIndex < INTERVIEW_STAGES.length - 1) {
          return { ...c, stage: INTERVIEW_STAGES[currentIndex + 1].id };
        }
      }
      return c;
    }));
    toast.success("Candidate advanced to next stage");
  };

  const getQuestions = (position: string): InterviewQuestion[] => {
    return POSITION_QUESTIONS[position] || POSITION_QUESTIONS.default;
  };

  const exportInterviewGuide = () => {
    const guide = {
      position: selectedPosition || "General",
      stages: INTERVIEW_STAGES,
      questions: getQuestions(selectedPosition),
      generatedAt: new Date().toISOString(),
      organization: "The The L.A.W.S. Collective, LLC",
    };
    const blob = new Blob([JSON.stringify(guide, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-guide-${selectedPosition || "general"}.json`;
    a.click();
    toast.success("Interview guide exported");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Interview Process Manager</h2>
          <p className="text-muted-foreground">
            AI-assisted hiring workflow with formal interview stages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportInterviewGuide}>
            <Download className="w-4 h-4 mr-2" />
            Export Guide
          </Button>
          <Dialog open={showAddCandidate} onOpenChange={setShowAddCandidate}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
                <DialogDescription>
                  Enter candidate information to begin the interview process
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                    placeholder="Enter candidate name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    placeholder="candidate@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={newCandidate.position}
                    onValueChange={(v) => setNewCandidate({ ...newCandidate, position: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddCandidate} className="w-full">
                  Add to Pipeline
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Candidate Pipeline</TabsTrigger>
          <TabsTrigger value="stages">Interview Stages</TabsTrigger>
          <TabsTrigger value="questions">Question Bank</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4 mt-6">
          <div className="grid grid-cols-5 gap-4">
            {INTERVIEW_STAGES.map((stage) => (
              <Card key={stage.id} className="min-h-[300px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                  <CardDescription className="text-xs">{stage.duration}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {candidates
                    .filter((c) => c.stage === stage.id)
                    .map((candidate) => (
                      <Card key={candidate.id} className="p-3 bg-secondary/30">
                        <div className="space-y-2">
                          <p className="font-medium text-sm">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.position}</p>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => advanceCandidate(candidate.id)}
                            >
                              Advance
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stages" className="space-y-4 mt-6">
          <div className="space-y-4">
            {INTERVIEW_STAGES.map((stage, index) => (
              <Card key={stage.id} className="overflow-hidden">
                <div className="flex">
                  <div className="w-16 bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{stage.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {stage.duration}
                        </Badge>
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          {stage.panelSize} panelist{stage.panelSize > 1 ? "s" : ""}
                        </Badge>
                        <Badge variant="secondary">
                          <Video className="w-3 h-3 mr-1" />
                          {stage.format}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        AI Assistance:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {stage.aiAssistance.map((assist, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Bot className="w-3 h-3 mr-1" />
                            {assist}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4 mt-6">
          <div className="flex items-center gap-4 mb-4">
            <Label>Filter by Position:</Label>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {getQuestions(selectedPosition).map((q) => (
              <Card key={q.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{q.category}</Badge>
                        {q.aiSuggested && (
                          <Badge variant="secondary">
                            <Bot className="w-3 h-3 mr-1" />
                            AI Suggested
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-foreground">{q.question}</p>
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Evaluation Criteria:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {q.evaluationCriteria.map((criteria, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              {criteria}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Remote Interview Scheduling</CardTitle>
              <CardDescription>
                Schedule interviews via Microsoft Teams or other video platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Candidate</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} - {c.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Interview Stage</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_STAGES.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Panel Members</Label>
                <Textarea placeholder="Enter panel member names/emails (one per line)" rows={3} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Send Invites
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Panel Requirements</CardTitle>
              <CardDescription>
                Standard panel composition for each interview stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {INTERVIEW_STAGES.map((stage) => (
                  <div key={stage.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-medium">{stage.name}</p>
                      <p className="text-sm text-muted-foreground">{stage.format} format</p>
                    </div>
                    <Badge>
                      <Users className="w-3 h-3 mr-1" />
                      {stage.panelSize} panelist{stage.panelSize > 1 ? "s" : ""} required
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
