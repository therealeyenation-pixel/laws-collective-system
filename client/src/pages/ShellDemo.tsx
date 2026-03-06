import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Home, BarChart3, Zap } from "lucide-react";

export default function ShellDemo() {
  const [stage, setStage] = useState<"intro" | "simulator" | "dashboard" | "comparison">("intro");
  const [businessName, setBusinessName] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Business Simulator Slides
  const simulatorSlides = [
    {
      title: "Let's Build Your Business",
      description: "Answer a few questions to see how the L.A.W.S. system helps you structure your business.",
      icon: "🏢",
    },
    {
      title: "What Type of Business?",
      description: "Choose from LLC, S-Corp, C-Corp, Partnership, Sole Proprietorship, or other structures.",
      icon: "📋",
    },
    {
      title: "Business Goals",
      description: "Define your primary goals: Revenue generation, Wealth building, Community impact, or Growth.",
      icon: "🎯",
    },
    {
      title: "Timeline & Milestones",
      description: "Set your 1-year, 3-year, and 5-year milestones for your business.",
      icon: "📅",
    },
    {
      title: "Team Structure",
      description: "Define your team: Solo, Small team (2-5), Medium team (6-20), or Large team (20+).",
      icon: "👥",
    },
    {
      title: "Financial Management",
      description: "Choose your approach: Self-managed, Professional accounting, or Full automation.",
      icon: "💰",
    },
    {
      title: "Ready to Launch",
      description: "Your business structure is ready. In the full system, you'll get professional forms, documents, and tools.",
      icon: "🚀",
    },
  ];

  // Dashboard Preview Cards
  const dashboardCards = [
    { title: "Business Overview", icon: BarChart3, color: "bg-blue-500/10" },
    { title: "Financial Dashboard", icon: Zap, color: "bg-green-500/10" },
    { title: "Team Management", icon: Home, color: "bg-purple-500/10" },
    { title: "Documents & Compliance", icon: BarChart3, color: "bg-orange-500/10" },
    { title: "Growth Tracking", icon: Zap, color: "bg-pink-500/10" },
    { title: "Integration Hub", icon: Home, color: "bg-cyan-500/10" },
  ];

  const handleSlideNext = () => {
    if (currentSlide < simulatorSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleSlidePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Explore the L.A.W.S. Structure</h1>
            <p className="text-sm text-muted-foreground">Interactive Demo</p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            ← Back to Home
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
                <Button variant="outline" size="lg" onClick={() => setStage("comparison")}>
                  See Full System Features
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
                  <div className="text-6xl">{simulatorSlides[currentSlide].icon}</div>
                  <h2 className="text-3xl font-bold text-foreground">{simulatorSlides[currentSlide].title}</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {simulatorSlides[currentSlide].description}
                  </p>
                </div>

                {/* Business Name Input (on last slide) */}
                {currentSlide === simulatorSlides.length - 1 && !showResults && (
                  <div className="space-y-4 pt-4">
                    <p className="text-muted-foreground">What's your business name?</p>
                    <input
                      type="text"
                      placeholder="Enter your business name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="px-6 py-4 rounded-md border border-border bg-background text-foreground text-center text-lg max-w-md mx-auto block w-full focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                )}

                {/* Results Display */}
                {showResults && (
                  <div className="space-y-6 pt-8">
                    <div className="bg-secondary/20 rounded-lg p-8 space-y-4">
                      <h3 className="text-2xl font-bold text-foreground">
                        {businessName || "Your Business"} is Ready!
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        In the full L.A.W.S. system, you would now have access to:
                      </p>
                      <ul className="text-left space-y-2 max-w-md mx-auto">
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Professional business formation documents</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Financial management tools and templates</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Compliance and legal guidance</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Team management and onboarding</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Growth tracking and analytics</span>
                        </li>
                      </ul>
                    </div>
                    <Button size="lg" onClick={() => setStage("dashboard")}>
                      See Your Dashboard
                    </Button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              {!showResults && (
                <div className="flex justify-between items-center mt-12">
                  <Button variant="outline" size="icon" onClick={handleSlidePrev} disabled={currentSlide === 0}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentSlide + 1} / {simulatorSlides.length}
                  </span>
                  <Button variant="outline" size="icon" onClick={handleSlideNext}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* DASHBOARD STAGE */}
        {stage === "dashboard" && (
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Your Business Dashboard</h2>
              <p className="text-lg text-muted-foreground">
                This is what your dashboard would look like in the full L.A.W.S. system
              </p>
            </div>

            {/* Dashboard Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardCards.map((card, idx) => (
                <Card key={idx} className={`p-6 ${card.color} border border-border`}>
                  <div className="flex items-start gap-4">
                    <card.icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground">{card.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">View and manage your {card.title.toLowerCase()}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <div className="bg-secondary/30 border border-border rounded-lg p-8 text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Ready for the Full Experience?</h3>
                <p className="text-muted-foreground">
                  This demo shows the interface. The full system includes professional forms, real data management, and complete business tools.
                </p>
              </div>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" onClick={() => window.location.href = "/"}>
                  Back to Landing Page
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = "/donate"}>
                  Support the Collective
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* COMPARISON STAGE */}
        {stage === "comparison" && (
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Demo vs. Full System</h2>
              <p className="text-lg text-muted-foreground">
                Here's what you get in the complete L.A.W.S. system
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-lg">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">Feature</th>
                    <th className="px-6 py-4 text-center font-semibold text-foreground">Demo</th>
                    <th className="px-6 py-4 text-center font-semibold text-foreground">Full System</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 text-foreground">Interactive Business Simulator</td>
                    <td className="px-6 py-4 text-center">✓</td>
                    <td className="px-6 py-4 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-foreground">Professional Business Forms</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-foreground">Financial Management Tools</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-foreground">Data Storage & Tracking</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-foreground">Compliance & Legal Guidance</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-foreground">Team Management</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-foreground">Document Generation</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-foreground">Analytics & Reporting</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-foreground">Community Access</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-foreground">Ongoing Support</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CTA Section */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-8 text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Join the L.A.W.S. Collective</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Get access to the complete system with professional tools, guidance, and community support to build sustainable wealth.
                </p>
              </div>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" onClick={() => window.location.href = "/"}>
                  Back to Landing Page
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = "/donate"}>
                  Support the Collective
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
