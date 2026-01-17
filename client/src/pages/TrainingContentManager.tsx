import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  Bot, 
  Gamepad2,
  ChevronRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  Loader2
} from "lucide-react";

const AGENT_TYPES = [
  { value: "operations", label: "Operations Agent" },
  { value: "support", label: "Support Agent" },
  { value: "education", label: "Education Agent" },
  { value: "analytics", label: "Analytics Agent" },
  { value: "guardian", label: "Trust Guardian" },
  { value: "finance", label: "Finance Agent" },
  { value: "media", label: "Media Agent" },
  { value: "outreach", label: "Outreach Agent" },
  { value: "seo", label: "SEO Agent" },
  { value: "engagement", label: "Engagement Agent" },
];

const SIMULATOR_TYPES = [
  { value: "business_setup", label: "Business Setup Simulator" },
  { value: "financial_management", label: "Financial Management Simulator" },
  { value: "entity_operations", label: "Entity Operations Simulator" },
  { value: "grant_creation", label: "Grant Creation Simulator" },
  { value: "tax_preparation", label: "Tax Preparation Simulator" },
  { value: "proposal_writing", label: "Proposal Writing Simulator" },
];

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True/False" },
  { value: "open_ended", label: "Open Ended" },
  { value: "fill_blank", label: "Fill in the Blank" },
];

export default function TrainingContentManager() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  // Module form state
  const [moduleForm, setModuleForm] = useState({
    name: "",
    description: "",
    agentType: "",
    simulatorType: "",
    difficulty: "beginner",
    estimatedMinutes: 30,
    passingScore: 70,
    isActive: true,
    isPublic: true,
  });

  // Topic form state
  const [topicForm, setTopicForm] = useState({
    name: "",
    description: "",
    orderIndex: 0,
  });

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    questionType: "multiple_choice",
    difficulty: "medium",
    points: 10,
    explanation: "",
    hint: "",
    answers: [
      { answerText: "", isCorrect: false, feedback: "" },
      { answerText: "", isCorrect: false, feedback: "" },
      { answerText: "", isCorrect: false, feedback: "" },
      { answerText: "", isCorrect: false, feedback: "" },
    ],
  });

  // Queries
  const { data: modules, isLoading: modulesLoading } = trpc.training.getModules.useQuery(
    { includeInactive: true },
    { retry: false }
  );
  
  const { data: moduleDetail, isLoading: moduleDetailLoading } = trpc.training.getModule.useQuery(
    { moduleId: selectedModule! },
    { enabled: !!selectedModule, retry: false }
  );

  // Mutations
  const createModule = trpc.training.createModule.useMutation({
    onSuccess: () => {
      toast.success("Module created successfully");
      utils.training.getModules.invalidate();
      setIsModuleDialogOpen(false);
      resetModuleForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateModule = trpc.training.updateModule.useMutation({
    onSuccess: () => {
      toast.success("Module updated successfully");
      utils.training.getModules.invalidate();
      utils.training.getModule.invalidate();
      setIsModuleDialogOpen(false);
      setEditingModule(null);
      resetModuleForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteModule = trpc.training.deleteModule.useMutation({
    onSuccess: () => {
      toast.success("Module deleted");
      utils.training.getModules.invalidate();
      setSelectedModule(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const createTopic = trpc.training.createTopic.useMutation({
    onSuccess: () => {
      toast.success("Topic created");
      utils.training.getModule.invalidate();
      setIsTopicDialogOpen(false);
      resetTopicForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateTopic = trpc.training.updateTopic.useMutation({
    onSuccess: () => {
      toast.success("Topic updated");
      utils.training.getModule.invalidate();
      setIsTopicDialogOpen(false);
      setEditingTopic(null);
      resetTopicForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteTopic = trpc.training.deleteTopic.useMutation({
    onSuccess: () => {
      toast.success("Topic deleted");
      utils.training.getModule.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const createQuestion = trpc.training.createQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question created");
      utils.training.getModule.invalidate();
      setIsQuestionDialogOpen(false);
      resetQuestionForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateQuestion = trpc.training.updateQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question updated");
      utils.training.getModule.invalidate();
      setIsQuestionDialogOpen(false);
      setEditingQuestion(null);
      resetQuestionForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteQuestion = trpc.training.deleteQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question deleted");
      utils.training.getModule.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Form helpers
  const resetModuleForm = () => {
    setModuleForm({
      name: "",
      description: "",
      agentType: "",
      simulatorType: "",
      difficulty: "beginner",
      estimatedMinutes: 30,
      passingScore: 70,
      isActive: true,
      isPublic: true,
    });
  };

  const resetTopicForm = () => {
    setTopicForm({ name: "", description: "", orderIndex: 0 });
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      questionText: "",
      questionType: "multiple_choice",
      difficulty: "medium",
      points: 10,
      explanation: "",
      hint: "",
      answers: [
        { answerText: "", isCorrect: false, feedback: "" },
        { answerText: "", isCorrect: false, feedback: "" },
        { answerText: "", isCorrect: false, feedback: "" },
        { answerText: "", isCorrect: false, feedback: "" },
      ],
    });
  };

  const openEditModule = (module: any) => {
    setEditingModule(module);
    setModuleForm({
      name: module.name,
      description: module.description || "",
      agentType: module.agentType || "",
      simulatorType: module.simulatorType || "",
      difficulty: module.difficulty,
      estimatedMinutes: module.estimatedMinutes || 30,
      passingScore: module.passingScore || 70,
      isActive: module.isActive,
      isPublic: module.isPublic,
    });
    setIsModuleDialogOpen(true);
  };

  const openEditTopic = (topic: any) => {
    setEditingTopic(topic);
    setTopicForm({
      name: topic.name,
      description: topic.description || "",
      orderIndex: topic.orderIndex,
    });
    setIsTopicDialogOpen(true);
  };

  const openEditQuestion = (question: any, topicId: number) => {
    setEditingQuestion(question);
    setSelectedTopicId(topicId);
    setQuestionForm({
      questionText: question.questionText,
      questionType: question.questionType,
      difficulty: question.difficulty,
      points: question.points,
      explanation: question.explanation || "",
      hint: question.hint || "",
      answers: question.answers?.length > 0 
        ? question.answers.map((a: any) => ({
            answerText: a.answerText,
            isCorrect: a.isCorrect,
            feedback: a.feedback || "",
          }))
        : [
            { answerText: "", isCorrect: false, feedback: "" },
            { answerText: "", isCorrect: false, feedback: "" },
            { answerText: "", isCorrect: false, feedback: "" },
            { answerText: "", isCorrect: false, feedback: "" },
          ],
    });
    setIsQuestionDialogOpen(true);
  };

  const handleSaveModule = () => {
    if (editingModule) {
      updateModule.mutate({ 
        moduleId: editingModule.id, 
        name: moduleForm.name,
        description: moduleForm.description || undefined,
        agentType: moduleForm.agentType || undefined,
        simulatorType: moduleForm.simulatorType || undefined,
        difficulty: moduleForm.difficulty as "beginner" | "intermediate" | "advanced",
        estimatedMinutes: moduleForm.estimatedMinutes,
        passingScore: moduleForm.passingScore,
        isActive: moduleForm.isActive,
        isPublic: moduleForm.isPublic,
      });
    } else {
      createModule.mutate({
        name: moduleForm.name,
        description: moduleForm.description || undefined,
        agentType: moduleForm.agentType || undefined,
        simulatorType: moduleForm.simulatorType || undefined,
        difficulty: moduleForm.difficulty as "beginner" | "intermediate" | "advanced",
        estimatedMinutes: moduleForm.estimatedMinutes,
        passingScore: moduleForm.passingScore,
        isActive: moduleForm.isActive,
        isPublic: moduleForm.isPublic,
      });
    }
  };

  const handleSaveTopic = () => {
    if (editingTopic) {
      updateTopic.mutate({ topicId: editingTopic.id, ...topicForm });
    } else if (selectedModule) {
      createTopic.mutate({ moduleId: selectedModule, ...topicForm });
    }
  };

  const handleSaveQuestion = () => {
    const validAnswers = questionForm.answers.filter(a => a.answerText.trim());
    
    if (editingQuestion) {
      updateQuestion.mutate({
        questionId: editingQuestion.id,
        questionText: questionForm.questionText,
        questionType: questionForm.questionType as any,
        difficulty: questionForm.difficulty as any,
        points: questionForm.points,
        explanation: questionForm.explanation,
        hint: questionForm.hint,
      });
    } else if (selectedTopicId) {
      createQuestion.mutate({
        topicId: selectedTopicId,
        questionText: questionForm.questionText,
        questionType: questionForm.questionType as any,
        difficulty: questionForm.difficulty as any,
        points: questionForm.points,
        explanation: questionForm.explanation,
        hint: questionForm.hint,
        answers: validAnswers,
      });
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "owner";

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You need admin privileges to manage training content.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Training Content Manager</h1>
            <p className="text-muted-foreground">
              Create and manage training modules, topics, and questions for agents and simulators
            </p>
          </div>
          <Button onClick={() => { resetModuleForm(); setEditingModule(null); setIsModuleDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Module
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Training Modules
              </CardTitle>
              <CardDescription>
                {modules?.length || 0} modules created
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {modulesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : modules?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No modules yet. Create your first one!
                </p>
              ) : (
                modules?.map((module) => (
                  <div
                    key={module.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedModule === module.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedModule(module.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{module.name}</span>
                          {!module.isActive && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {module.agentType && (
                            <Badge variant="outline" className="text-xs">
                              <Bot className="w-3 h-3 mr-1" />
                              {module.agentType}
                            </Badge>
                          )}
                          {module.simulatorType && (
                            <Badge variant="outline" className="text-xs">
                              <Gamepad2 className="w-3 h-3 mr-1" />
                              {module.simulatorType}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Module Detail */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {moduleDetail?.name || "Select a Module"}
                  </CardTitle>
                  <CardDescription>
                    {moduleDetail?.description || "Choose a module from the list to view and edit its content"}
                  </CardDescription>
                </div>
                {moduleDetail && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModule(moduleDetail)}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this module and all its content?")) {
                          deleteModule.mutate({ moduleId: moduleDetail.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedModule ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mb-4" />
                  <p>Select a module to view its topics and questions</p>
                </div>
              ) : moduleDetailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Module Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{moduleDetail?.topics?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Topics</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">
                        {moduleDetail?.topics?.reduce((sum, t) => sum + (t.questions?.length || 0), 0) || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Questions</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{moduleDetail?.estimatedMinutes || 0}</p>
                      <p className="text-xs text-muted-foreground">Minutes</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{moduleDetail?.passingScore || 70}%</p>
                      <p className="text-xs text-muted-foreground">Pass Score</p>
                    </div>
                  </div>

                  {/* Topics & Questions */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Topics & Questions</h3>
                    <Button 
                      size="sm" 
                      onClick={() => { 
                        resetTopicForm(); 
                        setEditingTopic(null); 
                        setIsTopicDialogOpen(true); 
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Topic
                    </Button>
                  </div>

                  {moduleDetail?.topics?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No topics yet. Add your first topic to start creating questions.
                    </p>
                  ) : (
                    <Accordion type="multiple" className="space-y-2">
                      {moduleDetail?.topics?.map((topic, idx) => (
                        <AccordionItem key={topic.id} value={`topic-${topic.id}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{idx + 1}. {topic.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {topic.questions?.length || 0} questions
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">{topic.description}</p>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => openEditTopic(topic)}>
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      if (confirm("Delete this topic and all its questions?")) {
                                        deleteTopic.mutate({ topicId: topic.id });
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedTopicId(topic.id);
                                      resetQuestionForm();
                                      setEditingQuestion(null);
                                      setIsQuestionDialogOpen(true);
                                    }}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Question
                                  </Button>
                                </div>
                              </div>

                              {topic.questions?.map((q, qIdx) => (
                                <div key={q.id} className="p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <HelpCircle className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium">Q{qIdx + 1}</span>
                                        <Badge variant="outline" className="text-xs">{q.questionType}</Badge>
                                        <Badge variant="outline" className="text-xs">{q.points} pts</Badge>
                                      </div>
                                      <p className="text-sm">{q.questionText}</p>
                                      {q.answers && q.answers.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          {q.answers.map((a: any, aIdx: number) => (
                                            <div key={a.id || aIdx} className="flex items-center gap-2 text-xs">
                                              {a.isCorrect ? (
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                              ) : (
                                                <XCircle className="w-3 h-3 text-muted-foreground" />
                                              )}
                                              <span className={a.isCorrect ? "text-green-600" : "text-muted-foreground"}>
                                                {a.answerText}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="sm" onClick={() => openEditQuestion(q, topic.id)}>
                                        <Pencil className="w-3 h-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                          if (confirm("Delete this question?")) {
                                            deleteQuestion.mutate({ questionId: q.id });
                                          }
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Module Dialog */}
        <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingModule ? "Edit Module" : "Create New Module"}</DialogTitle>
              <DialogDescription>
                Configure the training module settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Module Name</Label>
                  <Input
                    value={moduleForm.name}
                    onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                    placeholder="e.g., Business Fundamentals"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    placeholder="Describe what this module covers..."
                  />
                </div>
                <div>
                  <Label>Link to Agent (Optional)</Label>
                  <Select
                    value={moduleForm.agentType}
                    onValueChange={(v) => setModuleForm({ ...moduleForm, agentType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {AGENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Link to Simulator (Optional)</Label>
                  <Select
                    value={moduleForm.simulatorType}
                    onValueChange={(v) => setModuleForm({ ...moduleForm, simulatorType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select simulator type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {SIMULATOR_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select
                    value={moduleForm.difficulty}
                    onValueChange={(v) => setModuleForm({ ...moduleForm, difficulty: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Minutes</Label>
                  <Input
                    type="number"
                    value={moduleForm.estimatedMinutes}
                    onChange={(e) => setModuleForm({ ...moduleForm, estimatedMinutes: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div>
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={moduleForm.passingScore}
                    onChange={(e) => setModuleForm({ ...moduleForm, passingScore: parseInt(e.target.value) || 70 })}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={moduleForm.isActive}
                      onCheckedChange={(v) => setModuleForm({ ...moduleForm, isActive: v })}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={moduleForm.isPublic}
                      onCheckedChange={(v) => setModuleForm({ ...moduleForm, isPublic: v })}
                    />
                    <Label>Public</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveModule} disabled={createModule.isPending || updateModule.isPending}>
                {(createModule.isPending || updateModule.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingModule ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Topic Dialog */}
        <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTopic ? "Edit Topic" : "Add New Topic"}</DialogTitle>
              <DialogDescription>
                Topics organize questions within a module
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Topic Name</Label>
                <Input
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  placeholder="e.g., Introduction to Business Entities"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  placeholder="What will learners understand after this topic?"
                />
              </div>
              <div>
                <Label>Order Index</Label>
                <Input
                  type="number"
                  value={topicForm.orderIndex}
                  onChange={(e) => setTopicForm({ ...topicForm, orderIndex: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTopicDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTopic} disabled={createTopic.isPending || updateTopic.isPending}>
                {(createTopic.isPending || updateTopic.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingTopic ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Question Dialog */}
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
              <DialogDescription>
                Create a question with answer options
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Question Text</Label>
                <Textarea
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  placeholder="Enter your question..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Question Type</Label>
                  <Select
                    value={questionForm.questionType}
                    onValueChange={(v) => setQuestionForm({ ...questionForm, questionType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select
                    value={questionForm.difficulty}
                    onValueChange={(v) => setQuestionForm({ ...questionForm, difficulty: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>

              {(questionForm.questionType === "multiple_choice" || questionForm.questionType === "true_false") && (
                <div>
                  <Label>Answer Options</Label>
                  <div className="space-y-2 mt-2">
                    {questionForm.answers.map((answer, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Switch
                          checked={answer.isCorrect}
                          onCheckedChange={(v) => {
                            const newAnswers = [...questionForm.answers];
                            newAnswers[idx].isCorrect = v;
                            setQuestionForm({ ...questionForm, answers: newAnswers });
                          }}
                        />
                        <Input
                          value={answer.answerText}
                          onChange={(e) => {
                            const newAnswers = [...questionForm.answers];
                            newAnswers[idx].answerText = e.target.value;
                            setQuestionForm({ ...questionForm, answers: newAnswers });
                          }}
                          placeholder={`Answer option ${idx + 1}`}
                          className="flex-1"
                        />
                        <Input
                          value={answer.feedback}
                          onChange={(e) => {
                            const newAnswers = [...questionForm.answers];
                            newAnswers[idx].feedback = e.target.value;
                            setQuestionForm({ ...questionForm, answers: newAnswers });
                          }}
                          placeholder="Feedback (optional)"
                          className="w-40"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Toggle the switch to mark the correct answer(s)
                  </p>
                </div>
              )}

              <div>
                <Label>Explanation (shown after answering)</Label>
                <Textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="Explain why the correct answer is correct..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Hint (optional)</Label>
                <Input
                  value={questionForm.hint}
                  onChange={(e) => setQuestionForm({ ...questionForm, hint: e.target.value })}
                  placeholder="A helpful hint for the learner..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveQuestion} disabled={createQuestion.isPending || updateQuestion.isPending}>
                {(createQuestion.isPending || updateQuestion.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingQuestion ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
