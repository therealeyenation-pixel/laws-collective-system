import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Home, BarChart3, Zap, Mail, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type SlideType = {
  title: string;
  description: string;
  icon: string;
  type: string;
  options?: string[];
};

export default function ShellDemo() {
  const [stage, setStage] = useState<"intro" | "simulator" | "results" | "waitlist" | "dashboard">("intro");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Enhanced Business Simulator Slides with Answer Options
  const simulatorSlides: SlideType[] = [
    {
      title: "Let's Build Your Business",
      description: "Answer a few questions to see how the L.A.W.S. system helps you structure your business.",
      icon: "🏢",
      type: "intro",
    },
    {
      title: "What Type of Business?",
      description: "Choose the business structure that fits your vision.",
      icon: "📋",
      type: "multiple-choice",
      options: ["LLC", "S-Corp", "C-Corp", "Partnership", "Sole Proprietorship"],
    },
    {
      title: "Business Goals",
      description: "What's your primary goal?",
      icon: "🎯",
      type: "multiple-choice",
      options: ["Revenue generation", "Wealth building", "Community impact", "Growth & scaling"],
    },
    {
      title: "Timeline & Milestones",
      description: "What's your business timeline?",
      icon: "📅",
      type: "multiple-choice",
      options: ["Starting now", "1-3 months", "3-6 months", "6-12 months"],
    },
    {
      title: "Team Structure",
      description: "How do you want to structure your team?",
      icon: "👥",
      type: "multiple-choice",
      options: ["Solo", "Small team (2-5)", "Medium team (6-20)", "Large team (20+)"],
    },
    {
      title: "Financial Management",
      description: "How do you want to manage finances?",
      icon: "💰",
      type: "multiple-choice",
      options: ["Self-managed", "Professional accounting", "Full automation"],
    },
    {
      title: "Ready to Launch",
      description: "Your business structure is ready. What's your business name?",
      icon: "🚀",
      type: "text-input",
    },
  ];

  // Dashboard cards mapped to answers
  const getDashboardCards = () => {
    const cards = [];
    
    // Always show Business Overview
    cards.push({
      title: "Business Overview",
      icon: BarChart3,
      color: "bg-blue-500/10",
      reason: "Core dashboard for all businesses",
    });

    // Show Financial Dashboard if revenue/wealth focused
    if (answers[1]?.includes("Revenue") || answers[1]?.includes("Wealth")) {
      cards.push({
        title: "Financial Dashboard",
        icon: Zap,
        color: "bg-green-500/10",
        reason: "Essential for your financial goals",
      });
    }

    // Show Team Management if team size > 1
    if (answers[3] && answers[3] !== "Solo") {
      cards.push({
        title: "Team Management",
        icon: Home,
        color: "bg-purple-500/10",
        reason: "Manage your growing team",
      });
    }

    // Show Documents & Compliance for all
    cards.push({
      title: "Documents & Compliance",
      icon: BarChart3,
      color: "bg-orange-500/10",
      reason: "Legal protection and compliance",
    });

    // Show Growth Tracking if growth focused
    if (answers[1]?.includes("Growth")) {
      cards.push({
        title: "Growth Tracking",
        icon: Zap,
        color: "bg-pink-500/10",
        reason: "Monitor your scaling progress",
      });
    }

    // Show Integration Hub for professional accounting
    if (answers[4]?.includes("Professional") || answers[4]?.includes("automation")) {
      cards.push({
        title: "Integration Hub",
        icon: Home,
        color: "bg-cyan-500/10",
        reason: "Connect with your tools",
      });
    }

    return cards.length > 0 ? cards : [
      { title: "Business Overview", icon: BarChart3, color: "bg-blue-500/10", reason: "Core dashboard" },
      { title: "Financial Dashboard", icon: Zap, color: "bg-green-500/10", reason: "Manage finances" },
      { title: "Documents & Compliance", icon: BarChart3, color: "bg-orange-500/10", reason: "Stay compliant" },
    ];
  };

  const handleSlideNext = () => {
    if (currentSlide < simulatorSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setStage("results");
    }
  };

  const handleSlidePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers({ ...answers, [currentSlide]: answer });
  };

  const handleNameSubmit = () => {
    if (businessName.trim()) {
      setStage("results");
    }
  };

  const waitlistMutation = trpc.waitlist.signup.useMutation();

  const handleWaitlistSignup = async () => {
    if (!email.trim()) return;
    
    try {
      const result = await waitlistMutation.mutateAsync({
        email,
        businessName: businessName || undefined,
        source: "demo",
      });
      
      if (result.success) {
        toast.success(result.message);
        setStage("dashboard");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Waitlist signup error:", error);
      toast.error("Failed to join waitlist. Please try again.");
    }
  };

  const currentQuestion = simulatorSlides[currentSlide];
  const isAnswered = answers[currentSlide] !== undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Explore the L.A.W.S. Structure</h1>
            <p className="text-sm text-muted-foreground">Interactive Demo</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* INTRO STAGE */}
        {stage === "intro" && (
          <section className="space-y-8">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-12 text-center space-y-6">
              <h2 className="text-4xl font-bold text-foreground">Welcome to the L.A.W.S. Demo</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience how the L.A.W.S. Collective helps you build and manage your business with professional tools, guidance, and community support.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" onClick={() => setStage("simulator")}>
                  Start Interactive Demo
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* SIMULATOR STAGE */}
        {stage === "simulator" && (
          <section className="space-y-8">
            <div className="bg-card border border-border rounded-lg p-12 min-h-[500px] flex flex-col justify-center">
              <div className="text-center space-y-8">
                {/* Current Slide */}
                <div className="space-y-4">
                  <div className="text-6xl">{currentQuestion.icon}</div>
                  <h2 className="text-3xl font-bold text-foreground">{currentQuestion.title}</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {currentQuestion.description}
                  </p>
                </div>

                {/* Answer Options */}
                {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                  <div className="space-y-3 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {currentQuestion.options.map((option) => (
                        <Button
                          key={option}
                          variant={answers[currentSlide] === option ? "default" : "outline"}
                          className="h-auto py-3 px-4 text-left justify-start"
                          onClick={() => handleAnswerSelect(option)}
                        >
                          {answers[currentSlide] === option && <span className="mr-2">✓</span>}
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Input for Business Name */}
                {currentQuestion.type === "text-input" && (
                  <div className="space-y-4 pt-4">
                    <input
                      type="text"
                      placeholder="Enter your business name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="px-6 py-4 rounded-md border border-border bg-background text-foreground text-center text-lg max-w-md mx-auto block w-full focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    <Button size="lg" onClick={handleNameSubmit} disabled={!businessName.trim()}>
                      See Your Results
                    </Button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              {currentQuestion.type !== "text-input" && (
                <div className="flex justify-between items-center mt-12">
                  <Button variant="outline" size="icon" onClick={handleSlidePrev} disabled={currentSlide === 0}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentSlide + 1} / {simulatorSlides.length}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleSlideNext}
                    disabled={!isAnswered && currentQuestion.type === "multiple-choice"}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* RESULTS STAGE */}
        {stage === "results" && (
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">{businessName}'s Dashboard</h2>
              <p className="text-lg text-muted-foreground">
                Based on your answers, here are the tools you'll use most
              </p>
            </div>

            {/* Personalized Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getDashboardCards().map((card, idx) => (
                <Card key={idx} className={`p-6 ${card.color} border border-border`}>
                  <div className="flex items-start gap-4">
                    <card.icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{card.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{card.reason}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Waitlist CTA */}
            <div className="bg-secondary/30 border border-border rounded-lg p-8 space-y-6">
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold text-foreground">Ready for the Full Experience?</h3>
                <p className="text-muted-foreground">
                  Join our waitlist to get early access to the complete L.A.W.S. system
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleWaitlistSignup}
                  disabled={!email.trim()}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Join Waitlist
                </Button>
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                  Back to Landing Page
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/donate"}>
                  Support the Collective
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* DASHBOARD STAGE */}
        {stage === "dashboard" && (
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Welcome to the Waitlist!</h2>
              <p className="text-lg text-muted-foreground">
                We've sent a confirmation email to <strong>{email}</strong>
              </p>
              <p className="text-muted-foreground">
                You'll be among the first to access the complete L.A.W.S. system
              </p>
            </div>

            {/* Success Message */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 text-center space-y-4">
              <h3 className="text-xl font-bold text-foreground">Thank you, {businessName}!</h3>
              <p className="text-muted-foreground">
                We're building the tools to help you succeed. You'll hear from us soon with exclusive updates and early access opportunities.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={() => window.location.href = "/"}>
                Back to Home
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = "/donate"}>
                Support the Collective
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
