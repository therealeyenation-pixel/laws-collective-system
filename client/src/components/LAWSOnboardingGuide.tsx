import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Crown,
  Building2,
  Lock,
  Users,
  Shield,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Scale,
  Heart,
  Eye,
  FileText,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface OnboardingStep {
  id: string;
  stepKey: string;
  number: number;
  title: string;
  description: string;
  details: string;
  icon: React.ReactNode;
  actionLabel: string;
  actionPath: string;
  category: "foundation" | "security" | "growth";
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "join-collective",
    stepKey: "join_collective",
    number: 1,
    title: "Join the L.A.W.S. Collective",
    description: "Complete your member profile and set your goals",
    details:
      "Start by completing the Getting Started onboarding. This creates your member profile, identifies your primary goals, and connects you with the right resources. Your profile determines your personalized path through the system.",
    icon: <Users className="w-5 h-5" />,
    actionLabel: "Complete Profile",
    actionPath: "/getting-started",
    category: "foundation",
  },
  {
    id: "complete-workshops",
    stepKey: "complete_profile",
    number: 2,
    title: "Complete Education Workshops",
    description: "Build foundational knowledge through 6 core workshops",
    details:
      "Work through the Business Workshop, Grant Writing, Proposals, Contracts, Real-Eye-Nation, and L.A.W.S. Foundation courses. Each workshop builds on the last, preparing you with the knowledge needed to establish and manage your House.",
    icon: <BookOpen className="w-5 h-5" />,
    actionLabel: "Start Workshops",
    actionPath: "/business-simulator",
    category: "foundation",
  },
  {
    id: "form-business",
    stepKey: "attend_orientation",
    number: 3,
    title: "Form Your Business Entity",
    description: "Register and structure your business through the formation wizard",
    details:
      "Use the Business Formation tool to establish your legal entity. This creates the business that will be linked to your House. The system guides you through entity type selection, registration, and initial setup.",
    icon: <Building2 className="w-5 h-5" />,
    actionLabel: "Start Formation",
    actionPath: "/business-formation",
    category: "foundation",
  },
  {
    id: "genesis-activation",
    stepKey: "activate_house",
    number: 4,
    title: "Genesis House Activation",
    description: "Establish your first House — the foundational trust structure",
    details:
      "The Genesis Ceremony creates your House, names your heirs, and defines your vision. This is the core of the Autonomous Wealth System — your House is the entity that holds your trust, protects your assets, and secures your family's legacy across generations.",
    icon: <Crown className="w-5 h-5" />,
    actionLabel: "Start Genesis",
    actionPath: "/genesis",
    category: "foundation",
  },
  {
    id: "secure-vault",
    stepKey: "secure_vault",
    number: 5,
    title: "Secure the Identity Vault",
    description: "Encrypt and store family identity documents",
    details:
      "Upload and encrypt sensitive family documents — SSNs, birth certificates, legal records — into your House's Identity Vault. This encrypted storage ensures your family's identity is protected and accessible only to authorized members.",
    icon: <Lock className="w-5 h-5" />,
    actionLabel: "Open Vault",
    actionPath: "/founder/identity-vault",
    category: "security",
  },
  {
    id: "succession-protocol",
    stepKey: "designate_heirs",
    number: 6,
    title: "Configure Succession Protocol",
    description: "Designate successors and set emergency access rules",
    details:
      "Designate who inherits access to your House if something happens to you. Configure time-locked emergency access protocols so designated successors can request vault access through a secure 72-hour verification process.",
    icon: <ShieldAlert className="w-5 h-5" />,
    actionLabel: "Set Up Succession",
    actionPath: "/founder/succession-protocol",
    category: "security",
  },
  {
    id: "link-businesses",
    stepKey: "link_business",
    number: 7,
    title: "Link Businesses to Your House",
    description: "Connect revenue-generating entities to your trust structure",
    details:
      "Link your businesses to your House so revenue flows into the trust. This creates the wealth engine — businesses generate income, the trust protects and distributes it, and the House ensures it passes to the next generation.",
    icon: <Eye className="w-5 h-5" />,
    actionLabel: "Manage Entities",
    actionPath: "/entity-structure",
    category: "growth",
  },
  {
    id: "trust-governance",
    stepKey: "review_governance",
    number: 8,
    title: "Establish Trust Governance",
    description: "Set distribution rules, beneficiary management, and trust policies",
    details:
      "Define how your trust operates — distribution schedules, beneficiary rights, voting rules, and policy oversight. This governance framework ensures your House operates according to your vision even when you're not directly managing it.",
    icon: <Scale className="w-5 h-5" />,
    actionLabel: "Configure Governance",
    actionPath: "/trust-governance",
    category: "growth",
  },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  foundation: { label: "Foundation", color: "text-amber-600", bgColor: "bg-amber-500/10" },
  security: { label: "Security", color: "text-emerald-600", bgColor: "bg-emerald-500/10" },
  growth: { label: "Growth", color: "text-blue-600", bgColor: "bg-blue-500/10" },
};

interface LAWSOnboardingGuideProps {
  compact?: boolean;
}

export default function LAWSOnboardingGuide({
  compact = false,
}: LAWSOnboardingGuideProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const { data: progress, isLoading } = trpc.lawsOnboarding.getProgress.useQuery();
  const utils = trpc.useUtils();

  const completeStep = trpc.lawsOnboarding.completeStep.useMutation({
    onSuccess: () => {
      utils.lawsOnboarding.getProgress.invalidate();
      toast.success("Step marked as complete!");
    },
    onError: () => {
      toast.error("Failed to update step");
    },
  });

  const resetStep = trpc.lawsOnboarding.resetStep.useMutation({
    onSuccess: () => {
      utils.lawsOnboarding.getProgress.invalidate();
      toast.success("Step reset");
    },
  });

  // Derive completed step keys from DB
  const completedStepKeys = new Set(
    progress?.steps.filter((s) => s.status === "completed").map((s) => s.stepKey) ?? []
  );

  const completedCount = completedStepKeys.size;
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPercent = (completedCount / totalSteps) * 100;

  // Find the current step (first non-completed)
  const currentStepNumber =
    ONBOARDING_STEPS.find((s) => !completedStepKeys.has(s.stepKey))?.number ?? totalSteps + 1;

  const toggleExpand = (stepId: string) => {
    setExpandedStep((prev) => (prev === stepId ? null : stepId));
  };

  if (isLoading) {
    return (
      <Card className="border-amber-500/20">
        <CardContent className="pt-6 pb-6 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          <span className="text-sm text-muted-foreground">Loading your journey...</span>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    const nextStep = ONBOARDING_STEPS.find((s) => !completedStepKeys.has(s.stepKey));
    return (
      <Card className="border-amber-500/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold">Wealth System Journey</span>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {completedCount}/{totalSteps}
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-1.5 mb-3" />
          {nextStep && (
            <Button asChild size="sm" variant="outline" className="w-full gap-2 text-xs">
              <Link href={nextStep.actionPath}>
                Next: {nextStep.title}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          )}
          {!nextStep && (
            <p className="text-xs text-emerald-600 font-medium text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All steps complete
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/3 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-lg">
              <Rocket className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Your Wealth System Journey</CardTitle>
              <CardDescription>
                Follow these steps to build your House and establish generational wealth
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={completedCount >= totalSteps ? "default" : "secondary"}
            className={completedCount >= totalSteps ? "bg-emerald-600" : ""}
          >
            {completedCount}/{totalSteps} Complete
          </Badge>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{completedCount} steps completed</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Category Legend */}
        <div className="flex gap-4 mb-2">
          {Object.entries(CATEGORY_LABELS).map(([key, cat]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${cat.bgColor}`} />
              <span className="text-[10px] text-muted-foreground">{cat.label}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Steps */}
        <div className="space-y-1">
          {ONBOARDING_STEPS.map((step) => {
            const isCompleted = completedStepKeys.has(step.stepKey);
            const isCurrent = step.number === currentStepNumber && !isCompleted;
            const isExpanded = expandedStep === step.id;
            const cat = CATEGORY_LABELS[step.category];

            return (
              <div key={step.id}>
                <div
                  onClick={() => toggleExpand(step.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    isCompleted
                      ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                      : isCurrent
                      ? "bg-primary/5 ring-1 ring-primary/20 hover:bg-primary/10"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {/* Step Number / Status */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">
                          {step.number}
                        </span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {step.number}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isCompleted
                            ? "text-emerald-700 dark:text-emerald-400"
                            : isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 ${cat.color} border-current/20`}
                      >
                        {cat.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                  </div>

                  {/* Icon */}
                  <div className={`p-1.5 rounded-md ${cat.bgColor} flex-shrink-0`}>
                    {step.icon}
                  </div>

                  {/* Expand Toggle */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="ml-9 mr-3 mb-2 p-4 bg-muted/50 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {step.details}
                    </p>
                    {!isCompleted && (
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="gap-2">
                          <Link href={step.actionPath}>
                            {step.actionLabel}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            completeStep.mutate({ stepKey: step.stepKey });
                          }}
                          disabled={completeStep.isPending}
                        >
                          {completeStep.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Mark Complete
                        </Button>
                      </div>
                    )}
                    {isCompleted && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetStep.mutate({ stepKey: step.stepKey });
                          }}
                          disabled={resetStep.isPending}
                        >
                          Reset Step
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
