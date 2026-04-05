import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Zap,
  ClipboardList,
  Keyboard,
  LayoutDashboard,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
  action?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to LuvOnPurpose!",
    description:
      "This quick tour will show you the key features to help you get started with managing your entities, grants, and finances.",
    icon: <Sparkles className="w-8 h-8 text-primary" />,
  },
  {
    id: "quick-actions",
    title: "Quick Actions",
    description:
      "Use the Quick Actions widget on your dashboard to instantly create grants, entities, documents, and more with a single click.",
    icon: <Zap className="w-8 h-8 text-amber-500" />,
    highlight: "Quick Actions",
    action: "Try clicking 'New Grant Application' to start your first grant",
  },
  {
    id: "my-tasks",
    title: "My Tasks",
    description:
      "All your pending items in one place - articles to read, signatures needed, approvals waiting, and upcoming deadlines.",
    icon: <ClipboardList className="w-8 h-8 text-blue-500" />,
    highlight: "My Tasks",
    action: "Access via My Account → My Tasks in the sidebar",
  },
  {
    id: "keyboard-shortcuts",
    title: "Keyboard Shortcuts",
    description:
      "Power users can navigate faster with keyboard shortcuts. Press Ctrl+/ anytime to see all available shortcuts.",
    icon: <Keyboard className="w-8 h-8 text-purple-500" />,
    action: "Try Alt+D for Dashboard, Alt+T for Tasks, Alt+G for Grants",
  },
  {
    id: "dashboards",
    title: "Department Dashboards",
    description:
      "Each department has its own dashboard with relevant KPIs, news, and actions. Access them from the sidebar navigation.",
    icon: <LayoutDashboard className="w-8 h-8 text-green-500" />,
    highlight: "Dashboards",
    action: "Explore Finance, Legal, HR, and other department dashboards",
  },
  {
    id: "documents",
    title: "Document Management",
    description:
      "Upload, organize, and share documents securely. Use e-signatures to get documents signed by team members.",
    icon: <FileText className="w-8 h-8 text-orange-500" />,
    action: "Go to Documents in the sidebar to upload your first file",
  },
  {
    id: "preferences",
    title: "Customize Your Experience",
    description:
      "Set your preferred weather location, notification settings, and display preferences in User Preferences.",
    icon: <Settings className="w-8 h-8 text-gray-500" />,
    action: "Access via My Account → User Preferences",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("onboarding-completed", "true");
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem("onboarding-completed", "true");
    onSkip();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="relative w-full max-w-lg mx-4 p-6 bg-background shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Skip tour"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress indicator */}
        <div className="flex gap-1 mb-6">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">{step.icon}</div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {step.title}
          </h2>
          <p className="text-muted-foreground mb-4">{step.description}</p>
          {step.action && (
            <div className="bg-primary/10 rounded-lg p-3 text-sm text-primary">
              <span className="font-medium">Tip:</span> {step.action}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isFirstStep}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentStep + 1} of {tourSteps.length}
          </span>

          <Button onClick={handleNext} className="gap-1">
            {isLastStep ? "Get Started" : "Next"}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Skip link */}
        {!isLastStep && (
          <button
            onClick={handleSkip}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
        )}
      </Card>
    </div>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showTour, setShowTour] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem("onboarding-completed");
    if (!completed) {
      setHasCompletedOnboarding(false);
      // Show tour after a brief delay for better UX
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => setShowTour(true);
  const completeTour = () => {
    setShowTour(false);
    setHasCompletedOnboarding(true);
  };
  const skipTour = () => {
    setShowTour(false);
    setHasCompletedOnboarding(true);
  };
  const resetTour = () => {
    localStorage.removeItem("onboarding-completed");
    setHasCompletedOnboarding(false);
    setShowTour(true);
  };

  return {
    showTour,
    hasCompletedOnboarding,
    startTour,
    completeTour,
    skipTour,
    resetTour,
  };
}

export default OnboardingTour;
