import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const [stage, setStage] = useState<"slideshow" | "simulator" | "shell">("slideshow");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [simulatorStep, setSimulatorStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Automatic slideshow
  useEffect(() => {
    if (stage === "slideshow" && autoPlay) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(timer);
    }
  }, [stage, autoPlay]);

  // Slideshow content
  const slides = [
    {
      title: "Welcome to L.A.W.S. Collective",
      subtitle: "Multi-Generational Wealth Building",
      description: "A comprehensive system for building sustainable wealth through purpose and community.",
    },
    {
      title: "LAND - Reconnection & Stability",
      description: "Understanding roots, migrations, and family history to build a strong foundation.",
    },
    {
      title: "AIR - Education & Knowledge",
      description: "Learning, personal development, and communication for continuous growth.",
    },
    {
      title: "WATER - Healing & Balance",
      description: "Emotional resilience, healing cycles, and healthy decision-making.",
    },
    {
      title: "SELF - Purpose & Skills",
      description: "Financial literacy, business readiness, and purposeful growth.",
    },
  ];

  const simulatorSlides = [
    {
      title: "Start Your Business",
      subtitle: "Default LLC Structure",
      description: "Enter your business name to see what you'll get when you start.",
    },
    {
      title: `Welcome, ${businessName}`,
      subtitle: "Your Business Dashboard",
      description: "Here's what you'll access when you set up your business with L.A.W.S. Collective.",
    },
    {
      title: `${businessName} - What You Get`,
      subtitle: "Complete Business Suite",
      items: [
        "Business Dashboard & Analytics",
        "Financial Management Tools",
        "Employee Management System",
        "Contract & Document Management",
        "Compliance & Legal Tracking",
        "Community & Networking Access",
      ],
    },
  ];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setAutoPlay(false);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoPlay(false);
  };

  const handleStartSimulator = () => {
    setStage("simulator");
    setSimulatorStep(0);
  };

  const handleSimulatorNext = () => {
    if (simulatorStep < 2) {
      setSimulatorStep(simulatorStep + 1);
    } else {
      setStage("shell");
    }
  };

  const handleSimulatorPrev = () => {
    if (simulatorStep > 0) {
      setSimulatorStep(simulatorStep - 1);
    } else {
      setStage("slideshow");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">L.A.W.S. Collective</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12">
        {/* STAGE 1: AUTOMATIC SLIDESHOW */}
        {stage === "slideshow" && (
          <div className="space-y-8">
            {/* Slideshow */}
            <div className="bg-card border border-border rounded-lg p-12 min-h-[400px] flex flex-col justify-center relative">
              {/* Watermark */}
              <div className="absolute top-4 right-4 text-xs text-muted-foreground opacity-50">
                UNDER CONSTRUCTION - DEMO MODE
              </div>

              <div className="text-center space-y-6">
                <h2 className="text-4xl font-bold text-foreground">{slides[currentSlide].title}</h2>
                {slides[currentSlide].subtitle && (
                  <p className="text-xl text-muted-foreground">{slides[currentSlide].subtitle}</p>
                )}
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {slides[currentSlide].description}
                </p>
              </div>

              {/* Slide indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide ? "bg-primary w-8" : "bg-border w-2"
                    }`}
                    onClick={() => {
                      setCurrentSlide(idx);
                      setAutoPlay(false);
                    }}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <Button variant="outline" size="icon" onClick={handlePrev}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentSlide + 1} / {slides.length}
                </span>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* CTA to start simulator */}
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">
                Ready to see what your business could look like?
              </p>
              <Button size="lg" onClick={handleStartSimulator}>
                Start Business Simulator
              </Button>
            </div>

            {/* Sign up section */}
            <div className="bg-secondary/30 border border-border rounded-lg p-8 text-center space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Join Our Community</h3>
              <p className="text-muted-foreground">
                Get notified when we launch the full platform
              </p>
              <form className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-md border border-border bg-background text-foreground"
                />
                <Button type="submit">Sign Up</Button>
              </form>
            </div>
          </div>
        )}

        {/* STAGE 2: BUSINESS SIMULATOR */}
        {stage === "simulator" && (
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-lg p-12 min-h-[400px] flex flex-col justify-center relative">
              {/* Watermark */}
              <div className="absolute top-4 right-4 text-xs text-muted-foreground opacity-50">
                UNDER CONSTRUCTION - DEMO MODE
              </div>

              {simulatorStep === 0 && (
                <div className="text-center space-y-6">
                  <h2 className="text-4xl font-bold text-foreground">
                    {simulatorSlides[0].title}
                  </h2>
                  <p className="text-xl text-muted-foreground">{simulatorSlides[0].subtitle}</p>
                  <p className="text-lg text-muted-foreground">{simulatorSlides[0].description}</p>
                  <div className="pt-4">
                    <input
                      type="text"
                      placeholder="Enter your business name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="px-4 py-3 rounded-md border border-border bg-background text-foreground text-center text-lg max-w-md mx-auto block"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {simulatorStep === 1 && (
                <div className="text-center space-y-6">
                  <h2 className="text-4xl font-bold text-foreground">
                    {simulatorSlides[1].title}
                  </h2>
                  <p className="text-xl text-muted-foreground">{simulatorSlides[1].subtitle}</p>
                  <p className="text-lg text-muted-foreground">{simulatorSlides[1].description}</p>
                </div>
              )}

              {simulatorStep === 2 && (
                <div className="text-center space-y-6">
                  <h2 className="text-4xl font-bold text-foreground">
                    {simulatorSlides[2].title}
                  </h2>
                  <p className="text-xl text-muted-foreground">{simulatorSlides[2].subtitle}</p>
                  <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
                    {simulatorSlides[2].items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-secondary/30 rounded-lg border border-border text-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <Button variant="outline" onClick={handleSimulatorPrev}>
                  Back
                </Button>
                <span className="text-sm text-muted-foreground">
                  {simulatorStep + 1} / 3
                </span>
                <Button
                  onClick={handleSimulatorNext}
                  disabled={simulatorStep === 0 && !businessName}
                >
                  {simulatorStep === 2 ? "View Shell" : "Next"}
                </Button>
              </div>
            </div>

            {/* Sign up section */}
            <div className="bg-secondary/30 border border-border rounded-lg p-8 text-center space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Join Our Community</h3>
              <p className="text-muted-foreground">
                Get notified when we launch the full platform
              </p>
              <form className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-md border border-border bg-background text-foreground"
                />
                <Button type="submit">Sign Up</Button>
              </form>
            </div>
          </div>
        )}

        {/* STAGE 3: SHELL STRUCTURE PREVIEW */}
        {stage === "shell" && (
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-lg p-12 relative">
              {/* Watermark */}
              <div className="absolute top-4 right-4 text-xs text-muted-foreground opacity-50">
                UNDER CONSTRUCTION - DEMO MODE
              </div>

              <div className="text-center space-y-6 mb-8">
                <h2 className="text-4xl font-bold text-foreground">{businessName} Dashboard</h2>
                <p className="text-lg text-muted-foreground">
                  Here's what you'll access when you set up your business
                </p>
              </div>

              {/* Shell modules grid - plain, minimal, few features functional */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Dashboard",
                  "Financial Management",
                  "Employee Management",
                  "Contracts & Documents",
                  "Compliance Tracking",
                  "Community & Networking",
                ].map((module, idx) => (
                  <div
                    key={idx}
                    className="p-6 border border-border rounded-lg bg-background hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <h3 className="font-semibold text-foreground mb-2">{module}</h3>
                    <p className="text-sm text-muted-foreground">Coming Soon</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation back */}
            <div className="text-center">
              <Button variant="outline" onClick={() => setStage("slideshow")}>
                Back to Slideshow
              </Button>
            </div>

            {/* Sign up section */}
            <div className="bg-secondary/30 border border-border rounded-lg p-8 text-center space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Ready to Get Started?</h3>
              <p className="text-muted-foreground">
                Join {businessName} and start building your wealth today
              </p>
              <form className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-md border border-border bg-background text-foreground"
                />
                <Button type="submit">Get Started</Button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-background/50 py-6">
        <div className="container max-w-6xl mx-auto px-4 text-center text-xs text-muted-foreground opacity-60">
          <p>L.A.W.S. Collective | Multi-Generational Wealth Building</p>
        </div>
      </footer>
    </div>
  );
}
