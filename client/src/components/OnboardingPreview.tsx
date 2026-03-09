import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";

interface OnboardingPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingPreview({ isOpen, onClose }: OnboardingPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Meet Luv",
      description: "Your personalized automated house manager",
      content: (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-40 h-40 relative">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663294252884/SPWUc63a3tjYuzCxiuEomB/luv_avatar_hologram_locs_muted_22d75ba4.png?v=3"
                alt="Luv Avatar"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold">Hello! I'm Luv</h3>
            <p className="text-muted-foreground">
              I'm the Brain of LuvLedger - your automated house manager that will guide you through building and managing your house/business.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold mb-2">How I Work:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ I analyze your data and provide insights</li>
              <li>✓ I suggest actions to optimize your growth</li>
              <li>✓ I track progress and celebrate milestones</li>
              <li>✓ I never make decisions without your approval</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "How LuvLedger Works",
      description: "Understand the system",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-sm">Track Everything</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Monitor financial flows and metrics
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-2xl mb-2">🤖</div>
              <h4 className="font-semibold text-sm">Brain Automation</h4>
              <p className="text-xs text-muted-foreground mt-1">
                AI-powered recommendations
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl mb-2">✅</div>
              <h4 className="font-semibold text-sm">Human Control</h4>
              <p className="text-xs text-muted-foreground mt-1">
                You approve all actions
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/10 rounded-lg border border-pink-200 dark:border-pink-800">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-sm">Grow Your Impact</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Build wealth and community
              </p>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Your Safety First:</h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              LuvLedger is designed with safety guardrails. Every action is logged and auditable.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "House Setup",
      description: "Create your foundation",
      content: (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              After you log in, you'll set up your house/business details and customize your avatar to represent your unique identity.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">What you'll do:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Name your house or business</li>
              <li>✓ Select your entity type</li>
              <li>✓ Customize your Brain avatar</li>
              <li>✓ Set your Brain's personality</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Avatar Customization",
      description: "Personalize your automated house manager",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Avatar Name</label>
            <input
              type="text"
              placeholder="e.g., Maya, Alex"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Avatar Expressions</label>
            <div className="grid grid-cols-4 gap-2">
              {["😊 Neutral", "💬 Talking", "🤔 Thinking", "🎉 Celebrating"].map((expr) => (
                <div key={expr} className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-center text-xs">
                  {expr}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <p className="text-xs text-purple-800 dark:text-purple-200">
              🎨 You can change your avatar's appearance at any time
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "You're Ready!",
      description: "Begin your journey",
      content: (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="text-5xl">✓</div>
          </div>
          <div>
            <h3 className="text-2xl font-bold">Welcome to LuvLedger!</h3>
            <p className="text-muted-foreground mt-1">Your Brain is ready to assist you</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">What's Next:</h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>✓ Explore your dashboard</li>
              <li>✓ Set up your financial tracking</li>
              <li>✓ Connect your team members</li>
              <li>✓ Start building your impact</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl">{steps[currentStep].title}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{steps[currentStep].description}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="py-6">
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <div className="flex gap-1">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep ? "bg-purple-600 w-6" : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="gap-2"
          >
            {currentStep === steps.length - 1 ? "Close" : "Next"}
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
