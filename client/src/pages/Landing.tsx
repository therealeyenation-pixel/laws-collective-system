import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as QRCodeLib from "qrcode.react";
import { trpc } from "@/lib/trpc";
const QRCode = QRCodeLib.QRCodeSVG || QRCodeLib.default || QRCodeLib;

type Stage = "intro-slideshow" | "name-input" | "waitlist-signup";

export default function Landing() {
  const [stage, setStage] = useState<Stage>("intro-slideshow");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [resultsSlide, setResultsSlide] = useState(0);
  const [autoPlayResults, setAutoPlayResults] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [email, setEmail] = useState("");
  const [waitlistError, setWaitlistError] = useState("");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Analytics tracking
  const trackEvent = trpc.landingAnalytics.trackEvent.useMutation();
  const joinWaitlist = trpc.landingAnalytics.joinWaitlist.useMutation();

  // Track page view on mount
  useEffect(() => {
    trackEvent.mutate({
      sessionId,
      eventType: "page_view",
    });
  }, []);

  // Track intro slideshow start
  useEffect(() => {
    if (stage === "intro-slideshow") {
      trackEvent.mutate({
        sessionId,
        eventType: "intro_slideshow_start",
      });
    }
  }, [stage]);

  // Intro slideshow auto-play
  useEffect(() => {
    if (stage === "intro-slideshow" && autoPlay) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % introSlides.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [autoPlay, stage]);

  // Results slideshow auto-play
  useEffect(() => {
    if (showResults && autoPlayResults) {
      const timer = setInterval(() => {
        setResultsSlide((prev) => (prev + 1) % resultsSlides.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [autoPlayResults, showResults]);

  // Intro slideshow content - L.A.W.S. framework (7 slides)
  const introSlides = [
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
    {
      title: "The Ecosystem",
      description: "All four pillars work together to create a complete system for generational wealth and community empowerment.",
    },
    {
      title: "Join the Collective",
      description: "Enter your business name below to see what you can build with L.A.W.S. Collective.",
    },
  ];

  // Results slideshow - what they get with their business name (7 slides)
  const resultsSlides = [
    {
      title: `Welcome, ${businessName}`,
      subtitle: "Your Business Dashboard",
      description: "Here's what you'll access when you set up your business with L.A.W.S. Collective.",
    },
    {
      title: `${businessName} - Financial Management`,
      subtitle: "Complete Financial Suite",
      description: "Manage your business finances with integrated tools for accounting, invoicing, and financial reporting.",
      features: ["Accounting Dashboard", "Invoice Management", "Financial Reporting", "Tax Preparation"],
    },
    {
      title: `${businessName} - Team & Operations`,
      subtitle: "Employee & Operations Management",
      description: "Manage your team, operations, and compliance with integrated tools.",
      features: ["Employee Management", "Payroll Integration", "Scheduling", "Performance Tracking"],
    },
    {
      title: `${businessName} - Legal & Compliance`,
      subtitle: "Contracts & Compliance Tracking",
      description: "Stay compliant with automated legal document management and compliance tracking.",
      features: ["Contract Management", "Compliance Tracking", "Document Storage", "Legal Templates"],
    },
    {
      title: `${businessName} - Community & Growth`,
      subtitle: "Networking & Community Access",
      description: "Connect with other L.A.W.S. Collective members and access exclusive resources.",
      features: ["Community Network", "Resource Library", "Mentorship Program", "Growth Opportunities"],
    },
    {
      title: `${businessName} - Training & Development`,
      subtitle: "Continuous Learning",
      description: "Access comprehensive training programs and development resources to scale your business.",
      features: ["Online Courses", "Workshops", "Expert Mentorship", "Certification Programs"],
    },
    {
      title: `${businessName} - Ready to Launch`,
      subtitle: "Join the Collective Today",
      description: "Everything you need to build sustainable wealth and create generational impact.",
      features: ["Full System Access", "Community Support", "Expert Guidance", "Ongoing Growth"],
    },
  ];

  const handleIntroNext = () => {
    setCurrentSlide((prev) => (prev + 1) % introSlides.length);
    setAutoPlay(false);
  };

  const handleIntroPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + introSlides.length) % introSlides.length);
    setAutoPlay(false);
  };

  const handleStartSimulator = () => {
    if (businessName.trim()) {
      trackEvent.mutate({
        sessionId,
        eventType: "name_input_submit",
        businessName: businessName,
      });
      trackEvent.mutate({
        sessionId,
        eventType: "results_slideshow_start",
        businessName: businessName,
      });
      setShowResults(true);
      setResultsSlide(0);
      setAutoPlayResults(true);
    }
  };

  const handleResultsNext = () => {
    setResultsSlide((prev) => (prev + 1) % resultsSlides.length);
    setAutoPlayResults(false);
  };

  const handleResultsPrev = () => {
    setResultsSlide((prev) => (prev - 1 + resultsSlides.length) % resultsSlides.length);
    setAutoPlayResults(false);
  };

  const handleBackToIntro = () => {
    setStage("intro-slideshow");
    setCurrentSlide(0);
    setAutoPlay(true);
  };

  const handleWaitlistSubmit = async () => {
    if (!email.trim()) {
      setWaitlistError("Please enter a valid email");
      return;
    }

    try {
      const result = await joinWaitlist.mutateAsync({
        email: email,
        businessName: businessName,
        source: "landing_page",
      });

      if (result.success) {
        trackEvent.mutate({
          sessionId,
          eventType: "waitlist_signup",
          businessName: businessName,
          metadata: { email },
        });
        setWaitlistSuccess(true);
        setEmail("");
        setTimeout(() => {
          setStage("intro-slideshow");
          setCurrentSlide(0);
          setAutoPlay(true);
          setWaitlistSuccess(false);
        }, 2000);
      } else {
        setWaitlistError(result.error || "Failed to join waitlist");
      }
    } catch (error) {
      setWaitlistError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">L.A.W.S. Collective</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = "mailto:luvonpurpose@protonmail.com"}>
              Contact Us
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/demo"}>
              Sign In
            </Button>
            <Button onClick={() => window.location.href = "/demo"}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* STAGE 1: INTRO SLIDESHOW */}
        {stage === "intro-slideshow" && (
          <section className="space-y-8">
            {/* QR Code Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Scan to Learn More</h2>
              <p className="text-lg text-muted-foreground">Connect with L.A.W.S. Collective</p>
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-lg">
                  <QRCode value={typeof window !== "undefined" ? window.location.href : "https://example.com"} size={200} />
                </div>
              </div>
            </div>

            {/* Slideshow - Video Loop Style */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-lg p-12 min-h-[500px] flex flex-col justify-center overflow-hidden relative">
              <style>{`
                @keyframes fadeInOut {
                  0% { opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { opacity: 0; }
                }
                .slide-content {
                  animation: fadeInOut 5s ease-in-out;
                }
              `}</style>
              <div className="text-center space-y-6 slide-content">
                <h2 className="text-4xl font-bold text-foreground">{introSlides[currentSlide].title}</h2>
                {introSlides[currentSlide].subtitle && (
                  <p className="text-xl text-muted-foreground">{introSlides[currentSlide].subtitle}</p>
                )}
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {introSlides[currentSlide].description}
                </p>
              </div>

              {/* Slide indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {introSlides.map((_, idx) => (
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
                <Button variant="outline" size="icon" onClick={handleIntroPrev}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentSlide + 1} / {introSlides.length}
                </span>
                <Button variant="outline" size="icon" onClick={handleIntroNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* CTA to start simulator */}
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">
                Ready to see what your business could look like?
              </p>
              <Button size="lg" onClick={() => setStage("name-input")}>
                Start Business Demo
              </Button>
            </div>
          </section>
        )}

        {/* STAGE 2: NAME INPUT (Single Step) */}
        {stage === "name-input" && (
          <section className="space-y-8">
            <div className="bg-card border border-border rounded-lg p-12 min-h-[300px] flex flex-col justify-center">
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-foreground">Start Your Business</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Enter your business name to see what you'll get when you start with L.A.W.S. Collective.
                  </p>
                </div>

                <div className="pt-4 w-full flex flex-col items-center">
                  <input
                    type="text"
                    placeholder="Enter your business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="px-6 py-3 rounded-md border-2 border-primary bg-background text-foreground text-center text-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <Button variant="outline" onClick={handleBackToIntro}>
                  Back
                </Button>
                <Button size="lg" onClick={handleStartSimulator} disabled={!businessName.trim()}>
                  Show Demo
                </Button>
              </div>
            </div>

            {/* INLINE RESULTS DISPLAY - Video Loop Style */}
            {showResults && businessName.trim() && (
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-lg p-12 min-h-[500px] flex flex-col justify-center overflow-hidden relative">
                <style>{`
                  @keyframes fadeInOut {
                    0% { opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { opacity: 0; }
                  }
                  .slide-content {
                    animation: fadeInOut 5s ease-in-out;
                  }
                `}</style>
                <div className="text-center space-y-6 slide-content">
                  <h2 className="text-4xl font-bold text-foreground">{resultsSlides[resultsSlide].title}</h2>
                  {resultsSlides[resultsSlide].subtitle && (
                    <p className="text-xl text-muted-foreground">{resultsSlides[resultsSlide].subtitle}</p>
                  )}
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {resultsSlides[resultsSlide].description}
                  </p>
                  {resultsSlides[resultsSlide].features && (
                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
                      {resultsSlides[resultsSlide].features?.map((feature, idx) => (
                        <div key={idx} className="p-3 bg-secondary/30 rounded-md">
                          <p className="text-sm font-medium text-foreground">{feature}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Slide indicators */}
                <div className="flex justify-center gap-2 mt-8">
                  {resultsSlides.map((_, idx) => (
                    <button
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        idx === resultsSlide ? "bg-primary w-8" : "bg-border w-2"
                      }`}
                      onClick={() => {
                        setResultsSlide(idx);
                        setAutoPlayResults(false);
                      }}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8">
                  <Button variant="outline" size="icon" onClick={handleResultsPrev}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {resultsSlide + 1} / {resultsSlides.length}
                  </span>
                  <Button variant="outline" size="icon" onClick={handleResultsNext}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* CTA after results */}
                <div className="text-center space-y-4 mt-8">
                  <p className="text-lg text-muted-foreground">
                    Ready to get started with {businessName}?
                  </p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button variant="outline" onClick={() => setShowResults(false)}>
                      Try Another Name
                    </Button>
                    <Button size="lg" onClick={() => setStage("waitlist-signup")}>
                      Join Waitlist
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = "/demo"}>
                      Explore Live System
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* SECTION: LUV'S VISION AND L.A.W.S. MISSION */}
        <section className="space-y-8 border-t border-border pt-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Luv's Vision and L.A.W.S. Mission</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The L.A.W.S. Collective represents a revolutionary approach to multi-generational wealth building. By integrating the four pillars—LAND, AIR, WATER, and SELF—we create a comprehensive framework that honors cultural heritage while building sustainable financial futures.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/30">
              <h3 className="font-bold text-foreground mb-2">LAND</h3>
              <p className="text-sm text-muted-foreground">Reconnection & Stability</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/30">
              <h3 className="font-bold text-foreground mb-2">AIR</h3>
              <p className="text-sm text-muted-foreground">Education & Knowledge</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 rounded-lg border border-cyan-500/30">
              <h3 className="font-bold text-foreground mb-2">WATER</h3>
              <p className="text-sm text-muted-foreground">Healing & Balance</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/30">
              <h3 className="font-bold text-foreground mb-2">SELF</h3>
              <p className="text-sm text-muted-foreground">Purpose & Skills</p>
            </div>
          </div>
        </section>

        {/* SECTION: MEET LUV BIO */}
        <section className="bg-secondary/10 rounded-lg p-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Meet Luv</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Luv brings decades of experience in community building, financial literacy, and multi-generational wealth creation.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                With a background in education, business development, and social impact, Luv has dedicated her career to creating systems that empower families and communities to build sustainable wealth while honoring their values and heritage.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="/luv-photo.jpg"
                alt="Luv - Founder of L.A.W.S. Collective"
                className="w-80 h-80 rounded-lg object-cover border border-border shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* STAGE 4: WAITLIST SIGNUP */}
        {stage === "waitlist-signup" && (
          <section className="space-y-8">
            <div className="bg-card border border-border rounded-lg p-12 min-h-[400px] flex flex-col justify-center">
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-foreground">Join the Collective</h2>
                  <p className="text-xl text-muted-foreground">Get Early Access</p>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Be among the first to access the complete L.A.W.S. Collective platform when we launch. Enter your email to join our waitlist.
                  </p>
                </div>

                <div className="pt-4 space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-6 py-4 rounded-md border border-border bg-background text-foreground text-center text-lg max-w-md mx-auto block w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  {waitlistError && <p className="text-sm text-red-500">{waitlistError}</p>}
                  {waitlistSuccess && <p className="text-sm text-green-500">Successfully joined the waitlist!</p>}
                  <p className="text-sm text-muted-foreground">Business: {businessName}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <Button variant="outline" onClick={() => setStage("name-input")}>
                  Back
                </Button>
                <Button size="lg" onClick={handleWaitlistSubmit} disabled={joinWaitlist.isPending}>
                  {joinWaitlist.isPending ? "Joining..." : "Confirm"}
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION: SIGN-UP CTA (Bottom of page) */}
        {stage !== "waitlist-signup" && (
          <section className="bg-secondary/30 border border-border rounded-lg p-8 text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Join Our Community</h3>
              <p className="text-muted-foreground">
                Get notified when we launch the full platform and be part of the L.A.W.S. Collective
              </p>
              <p className="text-sm text-muted-foreground italic">Live system coming soon</p>
            </div>
            <div className="flex gap-2 max-w-md mx-auto flex-wrap justify-center">
              <form className="flex gap-2 flex-1 min-w-[250px]" onSubmit={(e) => {
                e.preventDefault();
                setStage("waitlist-signup");
              }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-md border border-border bg-background text-foreground"
                  required
                />
                <Button type="submit">Sign Up</Button>
              </form>
              <Button variant="outline" onClick={() => window.location.href = "/donate"}>
                Support the Collective
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/demo"}>
                Explore the L.A.W.S. Structure
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
