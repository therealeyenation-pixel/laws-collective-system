import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import CompletionCertificate from "@/components/CompletionCertificate";
import { 
  Building2, Shield, Landmark, Users, ChevronRight, ChevronLeft, Check, 
  DollarSign, Calendar, FileText, MapPin, Clock, AlertCircle, Sparkles,
  ArrowRight, CheckCircle2, Circle, Loader2, Save, RotateCcw, Play,
  Award, GraduationCap, BookOpen, Target, Zap
} from "lucide-react";

// Training Manager - Reviews and approves all training content
const TRAINING_MANAGER = {
  name: "Cornelius",
  title: "Education/Training Manager",
  credentials: ["Masters in Education", "Masters in Criminal Justice"],
};

// Simulator Managers - Create and customize content for their specific simulators
const SIMULATOR_MANAGERS: Record<string, { name: string; title: string }> = {
  llc: { name: "LaShanna Russell", title: "LLC Formation Director" },
  trust: { name: "LaShanna Russell", title: "Trust Systems Director" },
  nonprofit: { name: "LaShanna Russell", title: "LuvOnPurpose Academy Director" },
  collective: { name: "LaShanna Russell", title: "The L.A.W.S. Collective, LLC Director" },
};

// Entity types with descriptions
const ENTITY_TYPES = [
  {
    id: "llc",
    name: "Limited Liability Company (LLC)",
    icon: Building2,
    description: "Flexible business structure with liability protection. Ideal for small businesses and real estate.",
    benefits: ["Personal asset protection", "Pass-through taxation", "Flexible management", "Less paperwork than corporations"],
    considerations: ["Self-employment taxes", "State fees vary", "May need operating agreement"],
    recommended: true,
    tokensReward: 500,
    modules: 7,
  },
  {
    id: "trust",
    name: "Family Trust",
    icon: Shield,
    description: "Asset protection and estate planning vehicle. Protects wealth across generations.",
    benefits: ["Asset protection", "Estate planning", "Avoid probate", "Privacy"],
    considerations: ["Complex setup", "Ongoing management", "Trustee responsibilities"],
    recommended: false,
    tokensReward: 600,
    modules: 8,
  },
  {
    id: "nonprofit",
    name: "508(c)(1)(A) Nonprofit",
    icon: Landmark,
    description: "Tax-exempt religious or charitable organization. No IRS application required.",
    benefits: ["Tax-exempt status", "No 501(c)(3) application", "Donation deductibility", "Community impact"],
    considerations: ["Must be religious/charitable", "Record-keeping requirements", "Public benefit focus"],
    recommended: false,
    tokensReward: 550,
    modules: 9,
  },
  {
    id: "collective",
    name: "Collective / Cooperative",
    icon: Users,
    description: "Member-owned organization with shared decision-making and profit distribution.",
    benefits: ["Democratic control", "Shared resources", "Community building", "Flexible structure"],
    considerations: ["Consensus decision-making", "Member commitment", "Legal structure varies"],
    recommended: false,
    tokensReward: 450,
    modules: 8,
  },
];

// State information for formation
const STATE_INFO: Record<string, { name: string; filingFee: number; annualFee: number; processingTime: string; notes: string }> = {
  GA: { name: "Georgia", filingFee: 100, annualFee: 50, processingTime: "3-5 business days", notes: "Home state - familiar with regulations" },
  DE: { name: "Delaware", filingFee: 90, annualFee: 300, processingTime: "1-2 business days", notes: "Business-friendly laws, Court of Chancery" },
  WY: { name: "Wyoming", filingFee: 100, annualFee: 52, processingTime: "3-5 business days", notes: "No state income tax, strong privacy" },
  NV: { name: "Nevada", filingFee: 425, annualFee: 350, processingTime: "1-2 business days", notes: "No state income tax, strong asset protection" },
  FL: { name: "Florida", filingFee: 125, annualFee: 138.75, processingTime: "5-7 business days", notes: "No state income tax, growing business hub" },
  TX: { name: "Texas", filingFee: 300, annualFee: 0, processingTime: "3-5 business days", notes: "No state income tax, no annual report" },
  NM: { name: "New Mexico", filingFee: 50, annualFee: 0, processingTime: "3-5 business days", notes: "Lowest filing fee, no annual report" },
};

// Training modules by entity type
const TRAINING_MODULES: Record<string, { id: string; title: string; description: string; duration: string; quiz?: { question: string; options: string[]; correct: number }[] }[]> = {
  llc: [
    { 
      id: "llc-1", 
      title: "Understanding LLCs", 
      description: "Learn the fundamentals of Limited Liability Companies and why they're popular for small businesses.",
      duration: "10 min",
      quiz: [
        { question: "What does LLC stand for?", options: ["Limited Liability Company", "Legal Liability Corporation", "Limited Legal Company", "Liability Limited Corporation"], correct: 0 },
        { question: "LLCs provide protection for:", options: ["Business assets only", "Personal assets of owners", "Neither", "Government assets"], correct: 1 },
      ]
    },
    { id: "llc-2", title: "Choosing Your State", description: "Compare state requirements and select the best jurisdiction for your LLC.", duration: "15 min" },
    { id: "llc-3", title: "Name Selection & Availability", description: "Learn naming rules and how to check if your desired name is available.", duration: "10 min" },
    { id: "llc-4", title: "Articles of Organization", description: "Understand and prepare your formation documents.", duration: "20 min" },
    { id: "llc-5", title: "Operating Agreement", description: "Draft the internal governance document for your LLC.", duration: "25 min" },
    { id: "llc-6", title: "EIN & Banking", description: "Apply for your Federal EIN and set up business banking.", duration: "15 min" },
    { id: "llc-7", title: "Compliance & Maintenance", description: "Ongoing requirements to keep your LLC in good standing.", duration: "15 min" },
  ],
  trust: [
    { id: "trust-1", title: "Trust Fundamentals", description: "Understand what trusts are and how they protect assets.", duration: "15 min" },
    { id: "trust-2", title: "Types of Trusts", description: "Learn about revocable vs irrevocable trusts and their uses.", duration: "20 min" },
    { id: "trust-3", title: "Roles & Responsibilities", description: "Understand trustees, beneficiaries, and grantors.", duration: "15 min" },
    { id: "trust-4", title: "Trust Document Drafting", description: "Key provisions and language for your trust declaration.", duration: "30 min" },
    { id: "trust-5", title: "Funding Your Trust", description: "How to properly transfer assets into your trust.", duration: "20 min" },
    { id: "trust-6", title: "98 Trust Structure", description: "Special considerations for 98 trusts and foreign elements.", duration: "25 min" },
    { id: "trust-7", title: "Trust Administration", description: "Ongoing management and record-keeping requirements.", duration: "15 min" },
    { id: "trust-8", title: "Multi-Generational Planning", description: "Using trusts for legacy and wealth transfer.", duration: "20 min" },
  ],
  nonprofit: [
    { id: "np-1", title: "Nonprofit Basics", description: "Understanding tax-exempt organizations and their purpose.", duration: "15 min" },
    { id: "np-2", title: "508(c)(1)(A) vs 501(c)(3)", description: "Key differences and why 508 may be right for you.", duration: "20 min" },
    { id: "np-3", title: "Mission & Purpose", description: "Defining your charitable or religious mission.", duration: "15 min" },
    { id: "np-4", title: "Articles of Incorporation", description: "Required provisions for nonprofit formation.", duration: "20 min" },
    { id: "np-5", title: "Bylaws & Governance", description: "Creating your organizational structure.", duration: "25 min" },
    { id: "np-6", title: "Board of Directors", description: "Roles, responsibilities, and best practices.", duration: "15 min" },
    { id: "np-7", title: "508 Declaration", description: "Filing your declaration of tax-exempt status.", duration: "15 min" },
    { id: "np-8", title: "Fundraising & Compliance", description: "Legal requirements for soliciting donations.", duration: "20 min" },
    { id: "np-9", title: "Record Keeping", description: "Documentation requirements for nonprofits.", duration: "15 min" },
  ],
  collective: [
    { id: "coll-1", title: "Collective Structures", description: "Understanding cooperatives and collective ownership.", duration: "15 min" },
    { id: "coll-2", title: "Legal Framework", description: "Choosing the right legal structure for your collective.", duration: "20 min" },
    { id: "coll-3", title: "Membership Models", description: "Defining who can join and member rights.", duration: "15 min" },
    { id: "coll-4", title: "Governance & Decision Making", description: "Consensus, voting, and democratic processes.", duration: "25 min" },
    { id: "coll-5", title: "Operating Agreement", description: "Drafting your collective's foundational document.", duration: "25 min" },
    { id: "coll-6", title: "Resource Sharing", description: "Profit distribution and shared resources.", duration: "15 min" },
    { id: "coll-7", title: "L.A.W.S. Framework", description: "Integrating Land, Air, Water, Self principles.", duration: "20 min" },
    { id: "coll-8", title: "Community Building", description: "Growing and sustaining your collective.", duration: "15 min" },
  ],
};

interface SimulationData {
  entityType: string;
  entityName: string;
  state: string;
  purpose: string;
  startDate: string;
  completedModules: string[];
  completedSteps: string[];
  notes: string;
  isCompleted: boolean;
  certificateNumber?: string;
  completionDate?: string;
}

const STEPS = [
  { id: 1, title: "Select Training", description: "Choose your entity type" },
  { id: 2, title: "Entity Details", description: "Name and purpose" },
  { id: 3, title: "Training Modules", description: "Complete the training" },
  { id: 4, title: "State & Costs", description: "Formation planning" },
  { id: 5, title: "Action Checklist", description: "Complete formation steps" },
  { id: 6, title: "Create Entity", description: "Finalize and certify" },
  { id: 7, title: "Certificate", description: "Your completion certificate" },
];

export default function BusinessSimulator() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCertificate, setShowCertificate] = useState(false);
  const [simulation, setSimulation] = useState<SimulationData>({
    entityType: "",
    entityName: "",
    state: "GA",
    purpose: "",
    startDate: new Date().toISOString().split("T")[0],
    completedModules: [],
    completedSteps: [],
    notes: "",
    isCompleted: false,
  });

  const progress = (currentStep / STEPS.length) * 100;
  const selectedEntity = ENTITY_TYPES.find(e => e.id === simulation.entityType);
  const selectedState = STATE_INFO[simulation.state];
  const trainingModules = TRAINING_MODULES[simulation.entityType] || [];
  const manager = SIMULATOR_MANAGERS[simulation.entityType] || { name: "LaShanna Russell", title: "System Director" };

  // Calculate module completion progress
  const moduleProgress = trainingModules.length > 0 
    ? (simulation.completedModules.length / trainingModules.length) * 100 
    : 0;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return simulation.entityType !== "";
      case 2: return simulation.entityName.trim() !== "";
      case 3: return simulation.completedModules.length === trainingModules.length;
      case 4: return simulation.state !== "";
      case 5: return simulation.completedSteps.length >= 3; // At least 3 steps completed
      case 6: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteModule = (moduleId: string) => {
    if (!simulation.completedModules.includes(moduleId)) {
      setSimulation({
        ...simulation,
        completedModules: [...simulation.completedModules, moduleId]
      });
      toast.success("Module completed!");
    }
  };

  const handleCompleteStep = (step: string, checked: boolean) => {
    if (checked) {
      setSimulation({
        ...simulation,
        completedSteps: [...simulation.completedSteps, step]
      });
    } else {
      setSimulation({
        ...simulation,
        completedSteps: simulation.completedSteps.filter(s => s !== step)
      });
    }
  };

  const generateCertificateNumber = () => {
    const prefix = simulation.entityType.toUpperCase().slice(0, 3);
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleCreateEntity = () => {
    const certNumber = generateCertificateNumber();
    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    setSimulation({
      ...simulation,
      isCompleted: true,
      certificateNumber: certNumber,
      completionDate: completionDate,
    });

    // Save to localStorage
    const savedSimulations = JSON.parse(localStorage.getItem("completed_simulations") || "[]");
    savedSimulations.push({
      ...simulation,
      isCompleted: true,
      certificateNumber: certNumber,
      completionDate: completionDate,
      userId: user?.id,
    });
    localStorage.setItem("completed_simulations", JSON.stringify(savedSimulations));

    toast.success(`Entity "${simulation.entityName}" created successfully!`);
    setCurrentStep(7);
  };

  const handleReset = () => {
    setSimulation({
      entityType: "",
      entityName: "",
      state: "GA",
      purpose: "",
      startDate: new Date().toISOString().split("T")[0],
      completedModules: [],
      completedSteps: [],
      notes: "",
      isCompleted: false,
    });
    setCurrentStep(1);
    toast.info("Simulator reset");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <GraduationCap className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Business Formation Training</h2>
              <p className="text-muted-foreground mt-2">
                Select a training track to learn how to form your business entity. 
                Complete all modules to create your actual entity and earn LUV tokens.
              </p>
            </div>
            
            <RadioGroup
              value={simulation.entityType}
              onValueChange={(value) => setSimulation({ ...simulation, entityType: value, completedModules: [] })}
              className="grid md:grid-cols-2 gap-4"
            >
              {ENTITY_TYPES.map((entity) => {
                const Icon = entity.icon;
                const isSelected = simulation.entityType === entity.id;
                return (
                  <div key={entity.id} className="relative">
                    <RadioGroupItem value={entity.id} id={entity.id} className="sr-only" />
                    <Label
                      htmlFor={entity.id}
                      className={`block cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-md ${
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                          <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{entity.name}</h3>
                            {entity.recommended && (
                              <Badge variant="secondary" className="text-xs">Recommended</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{entity.description}</p>
                          
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <BookOpen className="w-4 h-4" />
                              {entity.modules} modules
                            </span>
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <Award className="w-4 h-4" />
                              {entity.tokensReward} tokens
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Name Your {selectedEntity?.name}</h2>
              <p className="text-muted-foreground mt-2">
                This will be the actual entity created upon completion
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entityName">Entity Name *</Label>
                <Input
                  id="entityName"
                  placeholder={`e.g., ${simulation.entityType === "llc" ? "My Business LLC" : simulation.entityType === "trust" ? "Smith Family Trust" : "My Organization"}`}
                  value={simulation.entityName}
                  onChange={(e) => setSimulation({ ...simulation, entityName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose / Mission</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the primary purpose or mission..."
                  value={simulation.purpose}
                  onChange={(e) => setSimulation({ ...simulation, purpose: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Important</h4>
                    <p className="text-sm text-amber-800 mt-1">
                      The entity name you enter will be used to create your actual business entity 
                      upon completion of the training. Choose carefully.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Training Modules</h2>
              <p className="text-muted-foreground mt-2">
                Complete all modules to proceed to entity creation
              </p>
            </div>

            {/* Progress */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Training Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {simulation.completedModules.length} / {trainingModules.length} modules
                  </span>
                </div>
                <Progress value={moduleProgress} className="h-3" />
              </CardContent>
            </Card>

            {/* Modules */}
            <div className="space-y-3">
              {trainingModules.map((module, idx) => {
                const isCompleted = simulation.completedModules.includes(module.id);
                const isLocked = idx > 0 && !simulation.completedModules.includes(trainingModules[idx - 1].id);
                
                return (
                  <Card 
                    key={module.id}
                    className={`transition-all ${
                      isCompleted ? "bg-green-50 border-green-200" : 
                      isLocked ? "opacity-50" : "hover:shadow-md"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? "bg-green-500 text-white" :
                          isLocked ? "bg-muted text-muted-foreground" :
                          "bg-primary/10 text-primary"
                        }`}>
                          {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{module.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {module.duration}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={isCompleted ? "outline" : "default"}
                          disabled={isLocked}
                          onClick={() => handleCompleteModule(module.id)}
                        >
                          {isCompleted ? "Completed" : isLocked ? "Locked" : "Start"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {moduleProgress === 100 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Training Complete!</h4>
                      <p className="text-sm text-green-800">
                        You've completed all training modules. Proceed to plan your formation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Formation Planning</h2>
              <p className="text-muted-foreground mt-2">
                Select your state and review estimated costs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(STATE_INFO).map(([code, state]) => {
                const isSelected = simulation.state === code;
                return (
                  <Card 
                    key={code}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "border-primary border-2 bg-primary/5" : ""
                    }`}
                    onClick={() => setSimulation({ ...simulation, state: code })}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-semibold">{state.name}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{state.notes}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Filing Fee</p>
                          <p className="font-medium">${state.filingFee}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Annual Fee</p>
                          <p className="font-medium">${state.annualFee}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Estimated Total Cost</h4>
                    <p className="text-2xl font-bold text-blue-800 mt-1">
                      ${selectedState?.filingFee || 0} - ${(selectedState?.filingFee || 0) + 200}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Includes state filing fee plus estimated additional costs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        const formationSteps = [
          "Name Search & Reservation",
          "Registered Agent Selection",
          "Formation Documents Filed",
          "EIN Application Submitted",
          "Operating Agreement Drafted",
          "Bank Account Opened",
        ];

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Formation Checklist</h2>
              <p className="text-muted-foreground mt-2">
                Complete at least 3 steps to proceed to entity creation
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {formationSteps.map((step, idx) => {
                    const isCompleted = simulation.completedSteps.includes(step);
                    return (
                      <div 
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isCompleted ? "bg-green-50 border-green-200" : "hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          id={`step-${idx}`}
                          checked={isCompleted}
                          onCheckedChange={(checked) => handleCompleteStep(step, checked as boolean)}
                        />
                        <Label 
                          htmlFor={`step-${idx}`}
                          className={`flex-1 cursor-pointer ${isCompleted ? "line-through text-muted-foreground" : ""}`}
                        >
                          {step}
                        </Label>
                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {simulation.completedSteps.length} of {formationSteps.length} steps completed
                    </span>
                    <Progress 
                      value={(simulation.completedSteps.length / formationSteps.length) * 100} 
                      className="w-32 h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <Target className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Ready to Create Your Entity</h2>
              <p className="text-muted-foreground mt-2">
                Review your information and create your {selectedEntity?.name}
              </p>
            </div>

            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle>Entity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Entity Name</span>
                    <span className="font-medium">{simulation.entityName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Entity Type</span>
                    <span className="font-medium">{selectedEntity?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">State of Formation</span>
                    <span className="font-medium">{selectedState?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Training Completed</span>
                    <span className="font-medium text-green-600">
                      {simulation.completedModules.length} modules
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Tokens to Earn</span>
                    <span className="font-medium text-green-600">
                      {selectedEntity?.tokensReward} LUV
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Signed By</span>
                    <span className="font-medium">{manager.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button size="lg" onClick={handleCreateEntity} className="gap-2">
                <Zap className="w-5 h-5" />
                Create Entity & Generate Certificate
              </Button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-amber-100 rounded-full">
                  <Award className="w-12 h-12 text-amber-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Congratulations!</h2>
              <p className="text-muted-foreground mt-2">
                You've successfully completed the training and created your entity
              </p>
            </div>

            <CompletionCertificate
              recipientName={user?.name || "Training Participant"}
              entityName={simulation.entityName}
              entityType={simulation.entityType as "llc" | "trust" | "nonprofit" | "collective"}
              completionDate={simulation.completionDate || new Date().toLocaleDateString()}
              certificateNumber={simulation.certificateNumber || "CERT-000000"}
              managerName={manager.name}
              managerTitle={manager.title}
              trainingManagerName={TRAINING_MANAGER.name}
              trainingManagerTitle={TRAINING_MANAGER.title}
              tokensEarned={selectedEntity?.tokensReward}
            />

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.href = "/business-formation"}>
                View in Entity Management
              </Button>
              <Button onClick={handleReset}>
                Start New Training
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-primary" />
              Business Formation Simulator
            </h1>
            <p className="text-muted-foreground">
              Complete training to create actual business entities and earn tokens
            </p>
          </div>
          {currentStep < 7 && (
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Start Over
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        {currentStep < 7 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
                {STEPS.slice(0, 6).map((step, idx) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  return (
                    <div 
                      key={step.id} 
                      className={`flex items-center ${idx < 5 ? "flex-1" : ""}`}
                    >
                      <div className="flex flex-col items-center min-w-[60px]">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors text-sm ${
                            isCompleted 
                              ? "bg-primary border-primary text-primary-foreground" 
                              : isActive 
                                ? "border-primary text-primary" 
                                : "border-muted-foreground/30 text-muted-foreground"
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                        </div>
                        <span className={`text-xs mt-1 text-center hidden md:block ${isActive ? "font-medium" : "text-muted-foreground"}`}>
                          {step.title}
                        </span>
                      </div>
                      {idx < 5 && (
                        <div className={`flex-1 h-0.5 mx-1 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        <Card>
          <CardContent className="pt-8 pb-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < 7 && (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            
            {currentStep < 6 && (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
