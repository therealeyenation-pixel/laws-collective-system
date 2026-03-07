import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
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
  const introSlides: Array<{
    title: string;
    subtitle?: string;
    description: string;
    icon: string;
    color: string;
    accentColor: string;
    details?: string[];
  }> = [
    {
      title: "Welcome to The L.A.W.S. Collective",
      subtitle: "Multi-Generational Wealth Building",
      description: "A comprehensive system for building sustainable wealth through purpose and community.",
      icon: "🌍",
      color: "from-blue-500/20 to-cyan-500/20",
      accentColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "LAND - Reconnection & Stability",
      description: "Understanding roots, migrations, and family history to build a strong foundation.",
      icon: "🌱",
      color: "from-green-500/20 to-emerald-500/20",
      accentColor: "text-green-600 dark:text-green-400",
      details: ["Family History", "Ancestral Roots", "Foundation Building"],
    },
    {
      title: "AIR - Education & Knowledge",
      description: "Learning, personal development, and communication for continuous growth.",
      icon: "📚",
      color: "from-purple-500/20 to-pink-500/20",
      accentColor: "text-purple-600 dark:text-purple-400",
      details: ["Continuous Learning", "Personal Growth", "Communication"],
    },
    {
      title: "WATER - Healing & Balance",
      description: "Emotional resilience, healing cycles, and healthy decision-making.",
      icon: "💧",
      color: "from-blue-500/20 to-indigo-500/20",
      accentColor: "text-blue-600 dark:text-blue-400",
      details: ["Emotional Resilience", "Healing Cycles", "Balance"],
    },
    {
      title: "SELF - Purpose & Skills",
      description: "Financial literacy, business readiness, and purposeful growth.",
      icon: "⭐",
      color: "from-yellow-500/20 to-orange-500/20",
      accentColor: "text-yellow-600 dark:text-yellow-500",
      details: ["Financial Literacy", "Business Skills", "Purpose-Driven"],
    },
    {
      title: "The Ecosystem",
      description: "All four pillars work together to create a complete system for generational wealth and community empowerment.",
      icon: "🔄",
      color: "from-indigo-500/20 to-purple-500/20",
      accentColor: "text-indigo-600 dark:text-indigo-400",
      details: ["Integrated System", "Community Empowerment", "Generational Impact"],
    },
    {
      title: "Join the Collective",
      description: "Enter your business name below to see what you can build with The L.A.W.S. Collective.",
      icon: "🚀",
      color: "from-green-500/20 to-teal-500/20",
      accentColor: "text-green-600 dark:text-green-400",
      details: ["Start Your Journey", "Build Your Business", "Join Community"],
    },
  ];

  // Results slideshow - what they get with their business name (7 slides)
  const resultsSlides = [
    {
      title: `Welcome, ${businessName}`,
      subtitle: "Your Business Dashboard",
      description: "Here's what you'll access when you set up your business with The L.A.W.S. Collective.",
      icon: "🎯",
      color: "from-blue-500/20 to-cyan-500/20",
      accentColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: `${businessName} - Financial Management`,
      subtitle: "Complete Financial Suite",
      description: "Manage your business finances with integrated tools for accounting, invoicing, and financial reporting.",
      icon: "💰",
      color: "from-green-500/20 to-emerald-500/20",
      accentColor: "text-green-600 dark:text-green-400",
      features: ["Accounting Dashboard", "Invoice Management", "Financial Reporting", "Tax Preparation"],
    },
    {
      title: `${businessName} - Team & Operations`,
      subtitle: "Employee & Operations Management",
      description: "Manage your team, operations, and compliance with integrated tools.",
      icon: "👥",
      color: "from-purple-500/20 to-pink-500/20",
      accentColor: "text-purple-600 dark:text-purple-400",
      features: ["Employee Management", "Payroll Integration", "Scheduling", "Performance Tracking"],
    },
    {
      title: `${businessName} - Legal & Compliance`,
      subtitle: "Contracts & Compliance Tracking",
      description: "Stay compliant with automated legal document management and compliance tracking.",
      icon: "⚖️",
      color: "from-orange-500/20 to-red-500/20",
      accentColor: "text-orange-600 dark:text-orange-400",
      features: ["Contract Management", "Compliance Tracking", "Document Storage", "Legal Templates"],
    },
    {
      title: `${businessName} - Community & Growth`,
      subtitle: "Networking & Community Access",
      description: "Connect with other The L.A.W.S. Collective members and access exclusive resources.",
      icon: "🌐",
      color: "from-indigo-500/20 to-blue-500/20",
      accentColor: "text-indigo-600 dark:text-indigo-400",
      features: ["Community Network", "Resource Library", "Mentorship Program", "Growth Opportunities"],
    },
    {
      title: `${businessName} - Training & Development`,
      subtitle: "Continuous Learning",
      description: "Access comprehensive training programs and development resources to scale your business.",
      icon: "📖",
      color: "from-pink-500/20 to-rose-500/20",
      accentColor: "text-pink-600 dark:text-pink-400",
      features: ["Online Courses", "Workshops", "Expert Mentorship", "Certification Programs"],
    },
    {
      title: `${businessName} - Ready to Launch`,
      subtitle: "Join the Collective Today",
      description: "Everything you need to build sustainable wealth and create generational impact.",
      icon: "🚀",
      color: "from-yellow-500/20 to-orange-500/20",
      accentColor: "text-yellow-600 dark:text-yellow-500",
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
    <div className="min-h-screen bg-background flex flex-col w-screen max-w-full overflow-x-hidden">
      {/* Header - Mobile Optimized */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border w-full">
        <div className="w-full px-4 py-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-foreground">The L.A.W.S. Collective</h1>
            {(stage === "name-input") && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Button variant="outline" onClick={() => window.location.href = "/contact-us"} className="w-full text-sm py-2">
              Contact Us
            </Button>
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => window.location.href = "/demo"} className="flex-1 text-sm py-2">
                Sign In
              </Button>
              <Button onClick={() => window.location.href = "/demo"} className="flex-1 text-sm py-2">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <main className="flex-1 w-full px-4 py-8 space-y-8">
        {/* STAGE 1: INTRO SLIDESHOW */}
        {stage === "intro-slideshow" && (
          <section className="space-y-8">
            {/* QR Code Section - Mobile Optimized */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-foreground">Scan to Learn More</h2>
              <p className="text-base text-muted-foreground">Connect with The L.A.W.S. Collective</p>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <QRCode value={typeof window !== "undefined" ? window.location.href : "https://example.com"} size={160} />
                </div>
              </div>
            </div>

            {/* Slideshow - Mobile Optimized */}
            <div className={`bg-gradient-to-br ${introSlides[currentSlide].color} border border-border rounded-lg p-8 h-[480px] flex flex-col justify-center overflow-hidden relative transition-colors duration-700`}>
              <div className="text-center space-y-6">
                <div className={`text-7xl ${introSlides[currentSlide].accentColor}`}>
                  {introSlides[currentSlide].icon}
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-foreground">{introSlides[currentSlide].title}</h2>
                  {introSlides[currentSlide].subtitle && (
                    <p className="text-lg text-muted-foreground font-semibold">{introSlides[currentSlide].subtitle}</p>
                  )}
                  <p className="text-base text-muted-foreground max-w-2xl mx-auto">{introSlides[currentSlide].description}</p>
                </div>
                {introSlides[currentSlide].details && (
                  <div className="flex flex-wrap justify-center gap-3 pt-4">
                    {introSlides[currentSlide].details?.map((detail, idx) => (
                      <span key={idx} className={`px-4 py-2 rounded-full text-sm font-medium ${introSlides[currentSlide].accentColor} bg-white/10 backdrop-blur-sm`}>
                        {detail}
                      </span>
                    ))}
                  </div>
                )}
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
                    Enter your business name to see what you'll get when you start with The L.A.W.S. Collective.
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
              <div className={`bg-gradient-to-br ${resultsSlides[resultsSlide].color} border border-border rounded-lg p-8 h-[520px] flex flex-col justify-center overflow-hidden relative transition-colors duration-700`}>
                <div className="text-center space-y-6">
                  <div className={`text-6xl ${resultsSlides[resultsSlide].accentColor}`}>
                    {resultsSlides[resultsSlide].icon}
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-4xl font-bold text-foreground">{resultsSlides[resultsSlide].title}</h2>
                    {resultsSlides[resultsSlide].subtitle && (
                      <p className="text-xl font-semibold text-muted-foreground">{resultsSlides[resultsSlide].subtitle}</p>
                    )}
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      {resultsSlides[resultsSlide].description}
                    </p>
                  </div>
                  {resultsSlides[resultsSlide].features && (
                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
                      {resultsSlides[resultsSlide].features?.map((feature, idx) => (
                        <div key={idx} className={`p-3 rounded-lg font-medium text-sm ${resultsSlides[resultsSlide].accentColor} bg-white/10 backdrop-blur-sm`}>
                          <p>{feature}</p>
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

              </div>
            )}

            {/* CTA after results - outside fixed-height container */}
            {showResults && businessName.trim() && (
              <div className="text-center space-y-4 pt-4">
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
                Luv's journey to building The L.A.W.S. Collective started with a simple question: why do so many families struggle to build wealth that lasts? With a career rooted in contract administration across both government and commercial sectors, she saw firsthand how systems are built — and how they often leave everyday families behind.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                That experience, combined with years of real-world observation, community conversations, and a deep commitment to understanding how wealth actually works, led her to create something different. The L.A.W.S. Collective is her answer — a framework built on purpose, not theory, designed to help families reconnect with their roots and build something that outlasts any single generation.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663294252884/SPWUc63a3tjYuzCxiuEomB/luv-photo_38d8d9aa.jpg"
                alt="Luv - Founder of The L.A.W.S. Collective"
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
                    Be among the first to access the complete The L.A.W.S. Collective platform when we launch. Enter your email to join our waitlist.
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
                Get notified when we launch the full platform and be part of the The L.A.W.S. Collective
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
