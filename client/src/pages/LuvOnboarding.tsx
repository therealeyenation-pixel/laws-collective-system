/**
 * LuvOnboarding - Welcome guide with Luv avatar
 * 
 * First experience when house/business is activated
 * Luv introduces the system and guides through setup
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, ChevronRight, CheckCircle } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  completed: boolean;
}

export default function LuvOnboarding() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [houseSetup, setHouseSetup] = useState({
    houseName: "",
    businessType: "",
    avatarName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const initBrainMutation = trpc.brainAutomation.initializeForHouse.useMutation();

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to LuvLedger",
      description: "Meet your AI assistant Brain",
      content: (
        <div className="space-y-6">
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48 relative">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663294252884/SPWUc63a3tjYuzCxiuEomB/luv_avatar_locs_long_neutral_3f2665f6.png"
                alt="Luv Avatar"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent rounded-full" />
            </div>
          </div>

          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Hello! I'm Luv
            </h2>
            <p className="text-lg text-muted-foreground">
              I'm the Brain of LuvLedger - your AI assistant that will guide you
              through building and managing your house/business.
            </p>
            <p className="text-sm text-muted-foreground">
              I'll help you with automation, insights, recommendations, and
              strategic decisions. But remember - you're always in control.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How I Work:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ I analyze your data and provide insights</li>
              <li>✓ I suggest actions to optimize your growth</li>
              <li>✓ I track progress and celebrate milestones</li>
              <li>✓ I never make decisions without your approval</li>
            </ul>
          </div>
        </div>
      ),
      completed: false,
    },
    {
      id: "how-it-works",
      title: "How LuvLedger Works",
      description: "Understand the system",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Track Everything</h3>
              <p className="text-sm text-muted-foreground">
                Monitor financial flows, team progress, and business metrics in
                real-time
              </p>
            </Card>

            <Card className="p-6">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-semibold mb-2">Brain Automation</h3>
              <p className="text-sm text-muted-foreground">
                I automate routine tasks and provide recommendations based on
                your data
              </p>
            </Card>

            <Card className="p-6">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-semibold mb-2">Human Control</h3>
              <p className="text-sm text-muted-foreground">
                You approve all significant actions - I never act without your
                consent
              </p>
            </Card>

            <Card className="p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Grow Your Impact</h3>
              <p className="text-sm text-muted-foreground">
                Build wealth, create jobs, and generate lasting community impact
              </p>
            </Card>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              Your Safety First:
            </h3>
            <p className="text-sm text-green-800">
              LuvLedger is designed with safety guardrails. I have permission
              levels that ensure I can never take control of your system. Every
              action is logged and auditable.
            </p>
          </div>
        </div>
      ),
      completed: false,
    },
    {
      id: "house-setup",
      title: "Set Up Your House/Business",
      description: "Create your foundation",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                House/Business Name
              </label>
              <input
                type="text"
                value={houseSetup.houseName}
                onChange={(e) =>
                  setHouseSetup({ ...houseSetup, houseName: e.target.value })
                }
                placeholder="e.g., The Johnson House, Tech Ventures LLC"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is the name of your entity in the LuvLedger system
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Business Type
              </label>
              <select
                value={houseSetup.businessType}
                onChange={(e) =>
                  setHouseSetup({ ...houseSetup, businessType: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a type...</option>
                <option value="family">Family House</option>
                <option value="business">Business Entity</option>
                <option value="nonprofit">Non-Profit Organization</option>
                <option value="cooperative">Cooperative</option>
                <option value="trust">Trust/Foundation</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> You can customize your avatar in the next
              step to represent your house/business identity
            </p>
          </div>
        </div>
      ),
      completed: false,
    },
    {
      id: "avatar-intro",
      title: "Create Your Avatar",
      description: "Personalize your Brain assistant",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Avatar Name
              </label>
              <input
                type="text"
                value={houseSetup.avatarName}
                onChange={(e) =>
                  setHouseSetup({ ...houseSetup, avatarName: e.target.value })
                }
                placeholder="e.g., Maya, Alex, The Manager"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is what your personalized Brain assistant will be called
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Upload Your Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 cursor-pointer transition">
                <div className="text-4xl mb-2">📸</div>
                <p className="text-sm font-medium">Click to upload photo</p>
                <p className="text-xs text-muted-foreground">
                  We'll create an animated avatar with your appearance
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your avatar will have 4 expressions: Neutral, Talking, Thinking, and Celebrating
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              🎨 <strong>Customization:</strong> You can change your avatar's
              appearance, clothing, and personality at any time
            </p>
          </div>
        </div>
      ),
      completed: false,
    },
    {
      id: "ready",
      title: "You're Ready!",
      description: "Begin your journey",
      content: (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Welcome to LuvLedger!
            </h2>
            <p className="text-lg text-muted-foreground">
              Your Brain is ready to assist you
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-green-900">What's Next:</h3>
            <ul className="text-sm text-green-800 space-y-2 text-left">
              <li>✓ Explore your dashboard</li>
              <li>✓ Set up your financial tracking</li>
              <li>✓ Connect your team members</li>
              <li>✓ Start building your impact</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            I'll be here to guide you every step of the way. Let's build
            something amazing together.
          </p>
        </div>
      ),
      completed: false,
    },
  ];

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Complete onboarding
      setIsLoading(true);
      try {
        // Initialize Brain for the house
        await initBrainMutation.mutateAsync({
          houseId: 1, // Replace with actual house ID
        });
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              LuvLedger Onboarding
            </h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="mb-8">{steps[currentStep].content}</div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Completing...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Start Dashboard
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
