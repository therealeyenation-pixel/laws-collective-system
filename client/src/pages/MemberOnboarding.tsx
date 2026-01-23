import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Home,
  Briefcase,
  GraduationCap,
  Target,
  Loader2,
  Leaf,
  Wind,
  Droplets,
  Heart,
} from "lucide-react";

interface OnboardingData {
  // Step 1: Personal Info
  displayName: string;
  phone: string;
  location: string;
  
  // Step 2: Goals
  primaryGoal: string;
  interests: string[];
  
  // Step 3: House Setup
  houseName: string;
  houseVision: string;
  
  // Step 4: Membership
  membershipTier: string;
}

const steps = [
  { id: 1, title: "Welcome", icon: User },
  { id: 2, title: "Your Goals", icon: Target },
  { id: 3, title: "Your House", icon: Home },
  { id: 4, title: "Membership", icon: GraduationCap },
  { id: 5, title: "Complete", icon: Check },
];

const goals = [
  { id: "wealth", label: "Build Generational Wealth", description: "Create lasting financial legacy for your family" },
  { id: "business", label: "Start a Business", description: "Launch and grow your own enterprise" },
  { id: "education", label: "Financial Education", description: "Learn wealth-building strategies" },
  { id: "community", label: "Join Community", description: "Connect with like-minded individuals" },
];

const interests = [
  { id: "land", label: "Land & Property", icon: Leaf },
  { id: "air", label: "Education & Knowledge", icon: Wind },
  { id: "water", label: "Healing & Balance", icon: Droplets },
  { id: "self", label: "Purpose & Skills", icon: Heart },
];

export default function MemberOnboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    displayName: user?.name || "",
    phone: "",
    location: "",
    primaryGoal: "",
    interests: [],
    houseName: "",
    houseVision: "",
    membershipTier: "community",
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData({ ...data, ...updates });
  };

  const toggleInterest = (interestId: string) => {
    if (data.interests.includes(interestId)) {
      updateData({ interests: data.interests.filter((i) => i !== interestId) });
    } else {
      updateData({ interests: [...data.interests, interestId] });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Here we would save the onboarding data
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Welcome to L.A.W.S. Collective!");
      setLocation("/house");
    } catch (error) {
      toast.error("Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-600" />
              <span className="text-lg font-bold text-stone-900">L.A.W.S. Collective</span>
            </div>
            <div className="text-sm text-stone-500">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  currentStep >= step.id
                    ? "bg-green-600 text-white"
                    : "bg-stone-200 text-stone-500"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-24 h-1 mx-2 transition-colors ${
                    currentStep > step.id ? "bg-green-600" : "bg-stone-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="p-8">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-stone-900 mb-2">
                  Welcome to L.A.W.S. Collective
                </h1>
                <p className="text-stone-600">
                  Let's set up your profile and get you started on your wealth-building journey.
                </p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={data.displayName}
                    onChange={(e) => updateData({ displayName: e.target.value })}
                    placeholder="How should we address you?"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => updateData({ phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => updateData({ location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-stone-900 mb-2">
                  What brings you here?
                </h1>
                <p className="text-stone-600">
                  Understanding your goals helps us personalize your experience.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-4 block">Primary Goal</Label>
                  <RadioGroup
                    value={data.primaryGoal}
                    onValueChange={(value) => updateData({ primaryGoal: value })}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {goals.map((goal) => (
                      <div key={goal.id} className="relative">
                        <RadioGroupItem
                          value={goal.id}
                          id={goal.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={goal.id}
                          className="flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-colors peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 hover:border-green-300"
                        >
                          <span className="font-semibold text-stone-900">{goal.label}</span>
                          <span className="text-sm text-stone-500">{goal.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-4 block">
                    Areas of Interest (L.A.W.S. Framework)
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {interests.map((interest) => (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          data.interests.includes(interest.id)
                            ? "border-green-600 bg-green-50"
                            : "border-stone-200 hover:border-green-300"
                        }`}
                      >
                        <interest.icon
                          className={`w-8 h-8 mx-auto mb-2 ${
                            data.interests.includes(interest.id)
                              ? "text-green-600"
                              : "text-stone-400"
                          }`}
                        />
                        <span className="text-sm font-medium text-stone-900">
                          {interest.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: House Setup */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-stone-900 mb-2">
                  Establish Your House
                </h1>
                <p className="text-stone-600">
                  Your House is the foundation of your generational wealth structure.
                </p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <Label htmlFor="houseName">House Name</Label>
                  <Input
                    id="houseName"
                    value={data.houseName}
                    onChange={(e) => updateData({ houseName: e.target.value })}
                    placeholder="e.g., House of Johnson"
                  />
                  <p className="text-xs text-stone-500 mt-1">
                    This will be the official name of your family's wealth structure.
                  </p>
                </div>
                <div>
                  <Label htmlFor="houseVision">House Vision Statement</Label>
                  <Textarea
                    id="houseVision"
                    value={data.houseVision}
                    onChange={(e) => updateData({ houseVision: e.target.value })}
                    placeholder="What legacy do you want to build for future generations?"
                    rows={4}
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="font-semibold text-green-800 mb-2">What is a House?</h3>
                <p className="text-sm text-green-700">
                  A House is your family's wealth-building entity within the L.A.W.S. Collective. 
                  It provides structure for asset protection, business operations, and generational 
                  wealth transfer using our 60/40 trust model.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Membership */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-stone-900 mb-2">
                  Choose Your Membership
                </h1>
                <p className="text-stone-600">
                  Select the membership tier that fits your journey.
                </p>
              </div>

              <RadioGroup
                value={data.membershipTier}
                onValueChange={(value) => updateData({ membershipTier: value })}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {[
                  {
                    id: "community",
                    name: "Community",
                    price: "Free",
                    features: ["Academy access", "Community forums", "Basic resources"],
                  },
                  {
                    id: "builder",
                    name: "Builder",
                    price: "$29/mo",
                    features: ["All Community features", "Business tools", "Document templates", "Priority support"],
                    popular: true,
                  },
                  {
                    id: "legacy",
                    name: "Legacy",
                    price: "$99/mo",
                    features: ["All Builder features", "Trust management", "1-on-1 coaching", "Network access"],
                  },
                ].map((tier) => (
                  <div key={tier.id} className="relative">
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <RadioGroupItem
                      value={tier.id}
                      id={tier.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={tier.id}
                      className={`flex flex-col p-6 border-2 rounded-lg cursor-pointer transition-colors peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 hover:border-green-300 ${
                        tier.popular ? "border-green-300" : ""
                      }`}
                    >
                      <span className="font-bold text-lg text-stone-900">{tier.name}</span>
                      <span className="text-2xl font-bold text-green-600 my-2">{tier.price}</span>
                      <ul className="space-y-2 mt-2">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-stone-600">
                            <Check className="w-4 h-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-stone-900 mb-2">
                You're All Set!
              </h1>
              <p className="text-stone-600 mb-8 max-w-md mx-auto">
                Welcome to the L.A.W.S. Collective, {data.displayName || "Member"}! 
                Your House "{data.houseName || "Your House"}" has been established. 
                Let's start building your legacy.
              </p>

              <div className="bg-stone-50 rounded-lg p-6 max-w-md mx-auto mb-8">
                <h3 className="font-semibold text-stone-900 mb-4">Next Steps</h3>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-600">1</span>
                    </div>
                    <span className="text-sm text-stone-600">
                      Explore the Academy to learn wealth-building fundamentals
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-600">2</span>
                    </div>
                    <span className="text-sm text-stone-600">
                      Set up your House dashboard and invite family members
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-600">3</span>
                    </div>
                    <span className="text-sm text-stone-600">
                      Connect with the community and find your first mentor
                    </span>
                  </li>
                </ul>
              </div>

              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 gap-2"
                onClick={handleComplete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Go to My House
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Navigation */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-stone-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={nextStep}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
