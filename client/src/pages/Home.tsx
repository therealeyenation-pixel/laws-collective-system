import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  Zap,
  Palette,
  ArrowRight,
  CheckCircle,
  Leaf,
  Wind,
  Droplets,
  Heart,
  ChevronRight,
  Quote,
  Lock,
  TrendingUp,
  Network,
  BookOpen,
  Building2,
  Play,
  Pause,
  ChevronLeft,
  Home as HomeIcon,
  BarChart3,
  Shield,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import SlidesCarousel from "@/components/SlidesCarousel";

// Simplified Demo: Setup + Premium Walkthrough
const entityTypes = [
  { id: "llc", name: "LLC", desc: "Limited Liability Company" },
  { id: "scorp", name: "S Corp", desc: "S Corporation" },
  { id: "nonprofit", name: "Nonprofit (508)", desc: "Tax-Exempt Organization" },
  { id: "trust", name: "Trust", desc: "Family Trust" },
];

const walkthroughSteps = [
  {
    title: "is Now Live",
    subtitle: "Entity Registration Complete",
    items: ["Entity Registration", "EIN Assignment", "Operating Agreement", "Bank Account Setup"],
    gradient: "from-blue-900 via-indigo-900 to-slate-900",
    icon: "Building2",
  },
  {
    title: "Your House Has Been Created",
    subtitle: "Private & Sovereign System Instance",
    items: ["Isolated data environment", "Family governance structure", "Multi-entity management", "Secure document vault"],
    gradient: "from-emerald-900 via-green-900 to-teal-900",
    icon: "HomeIcon",
  },
  {
    title: "LuvLedger Is Now Active",
    subtitle: "Your Wealth Management Hub",
    items: ["Business income tracking", "Investment portfolio", "Real estate holdings", "Multi-generational history"],
    gradient: "from-purple-900 via-violet-900 to-indigo-900",
    icon: "BarChart3",
  },
  {
    title: "Your Dashboards Are Online",
    subtitle: "4 Standard + 10 Specialized Dashboards",
    items: ["Financial Overview", "Team Management", "Operations Center", "LuvLedger Assets", "+ Specialized dashboards for your business type"],
    gradient: "from-amber-900 via-orange-900 to-yellow-900",
    icon: "Zap",
  },
  {
    title: "Connected to the Collective",
    subtitle: "The Multiplier Effect",
    items: ["1 Family \u2192 $100K wealth", "10 Families \u2192 $1M collective", "100 Families \u2192 $10M community", "Your success multiplies across the network"],
    gradient: "from-teal-900 via-cyan-900 to-blue-900",
    icon: "Shield",
  },
];

function DemoSimulator() {
  const [step, setStep] = useState<"start" | "setup" | "walkthrough" | "done">("start");
  const [entityType, setEntityType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [walkStep, setWalkStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (step !== "walkthrough" || !isAutoPlaying) return;
    const timer = setTimeout(() => {
      if (walkStep < walkthroughSteps.length - 1) {
        setWalkStep((prev) => prev + 1);
      } else {
        setStep("done");
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [step, walkStep, isAutoPlaying]);

  const iconMap: Record<string, React.ReactNode> = {
    Building2: <Building2 className="w-10 h-10" />,
    HomeIcon: <HomeIcon className="w-10 h-10" />,
    BarChart3: <BarChart3 className="w-10 h-10" />,
    Zap: <Zap className="w-10 h-10" />,
    Shield: <Shield className="w-10 h-10" />,
  };

  const handleSubmit = () => {
    if (!entityType || !businessName.trim()) return;
    setStep("walkthrough");
    setWalkStep(0);
    setIsAutoPlaying(true);
  };

  const resetDemo = () => {
    setStep("start");
    setEntityType("");
    setBusinessName("");
    setWalkStep(0);
    setIsAutoPlaying(true);
  };

  // START SCREEN
  if (step === "start") {
    return (
      <div className="text-center space-y-6">
        <h3 className="text-2xl font-bold text-foreground">Experience the System</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Set up a demo business and watch the entire L.A.W.S. system come alive \u2014 from entity formation to community wealth building.
        </p>
        <Button size="lg" onClick={() => setStep("setup")} className="gap-2">
          Start Demo <Zap className="w-4 h-4" />
        </Button>
        <p className="text-xs text-muted-foreground italic">Interactive demo \u2022 No data saved \u2022 Under 2 minutes</p>
      </div>
    );
  }

  // SETUP SCREEN
  if (step === "setup") {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-2">Step 1 of 2</p>
          <h3 className="text-2xl font-bold text-foreground">Set Up Your Business</h3>
        </div>

        <div className="space-y-6 max-w-lg mx-auto">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Choose Entity Type</label>
            <div className="grid grid-cols-2 gap-3">
              {entityTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setEntityType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    entityType === type.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-bold text-foreground">{type.name}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!entityType || !businessName.trim()}
            className="w-full gap-2"
          >
            Set Up Business <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // WALKTHROUGH - PREMIUM FULL-WIDTH PRESENTATION
  if (step === "walkthrough") {
    const current = walkthroughSteps[walkStep];
    const displayName = businessName || "Your Business";
    const title = walkStep === 0 ? `"${displayName}" ${current.title}` : current.title;

    return (
      <div className="-m-8 md:-m-12">
        <div className={`bg-gradient-to-br ${current.gradient} transition-all duration-700 ease-in-out`} style={{ minHeight: "480px" }}>
          {/* Progress Bar */}
          <div className="flex items-center gap-1 px-8 pt-8">
            {walkthroughSteps.map((_, idx) => (
              <div key={idx} className={`h-1 flex-1 rounded-full transition-all duration-500 ${idx <= walkStep ? "bg-white" : "bg-white/20"}`} />
            ))}
          </div>
          <p className="text-white/50 text-xs px-8 mt-2">Step {walkStep + 1} of {walkthroughSteps.length}</p>

          {/* Content */}
          <div className="flex flex-col items-center justify-center text-center px-8 py-12 md:py-16">
            <div className="text-white/80 mb-6">{iconMap[current.icon]}</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl">{title}</h2>
            <p className="text-xl text-white/80 font-medium mb-8">{current.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              {current.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-white text-sm text-left">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWalkStep(Math.max(0, walkStep - 1))}
              disabled={walkStep === 0}
              className="text-white/70 hover:text-white hover:bg-white/20 h-10 w-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-white/70 hover:text-white hover:bg-white/20 h-10 w-10"
            >
              {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (walkStep < walkthroughSteps.length - 1) {
                  setWalkStep(walkStep + 1);
                } else {
                  setStep("done");
                }
              }}
              className="text-white/70 hover:text-white hover:bg-white/20 h-10 w-10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // DONE SCREEN
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-emerald-500" />
      </div>
      <h3 className="text-2xl font-bold text-foreground">Ready to Build Your Legacy?</h3>
      <p className="text-muted-foreground max-w-xl mx-auto">
        You just saw how <span className="font-semibold text-foreground">"{businessName}"</span> would flow through the entire L.A.W.S. system \u2014 from formation to community wealth building.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" onClick={resetDemo} variant="outline" className="gap-2">
          Run Demo Again
        </Button>
        <Link href="/getting-started">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            Join the Collective <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();

  const systemComponents = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Business Simulators",
      description: "Interactive scenarios to practice business decisions and see real-time outcomes",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Academy & Curriculum",
      description: "Comprehensive education in financial literacy, business, and wealth building",
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: "Community Network",
      description: "Connect with other families and houses building wealth together",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Trust Management",
      description: "Secure governance and asset management for multi-generational wealth",
    },
  ];

  const lawsFramework = [
    { letter: "L", word: "Land", meaning: "Reconnection & Stability", icon: <Leaf className="w-5 h-5" />, description: "Understanding your roots, migrations, and family history" },
    { letter: "A", word: "Air", meaning: "Education & Knowledge", icon: <Wind className="w-5 h-5" />, description: "Learning, personal development, and communication" },
    { letter: "W", word: "Water", meaning: "Healing & Balance", icon: <Droplets className="w-5 h-5" />, description: "Emotional resilience and healthy decision-making" },
    { letter: "S", word: "Self", meaning: "Purpose & Skills", icon: <Heart className="w-5 h-5" />, description: "Financial literacy, business readiness, and purposeful growth" },
  ];

  const comingFeatures = [
    { name: "Multi-Tenant System", description: "Each house gets their own isolated system instance" },
    { name: "Full Dashboard Suite", description: "Comprehensive management dashboards for all operations" },
    { name: "Community Collaboration", description: "Tools for houses to collaborate and share resources" },
    { name: "Token Economy", description: "Wealth sharing and token-based incentives" },
    { name: "Advanced Analytics", description: "Deep insights into business and community metrics" },
    { name: "Mobile App", description: "Full system access on iOS and Android" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container max-w-6xl mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
                The L.A.W.S. Collective
              </h1>
              <div className="flex flex-wrap gap-4 md:gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-3xl md:text-4xl font-bold text-primary">L</span>
                  <span className="text-lg md:text-xl text-foreground">and</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl md:text-4xl font-bold text-primary">A</span>
                  <span className="text-lg md:text-xl text-foreground">ir</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl md:text-4xl font-bold text-primary">W</span>
                  <span className="text-lg md:text-xl text-foreground">ater</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl md:text-4xl font-bold text-primary">S</span>
                  <span className="text-lg md:text-xl text-foreground">elf</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6">
              Building <span className="text-primary">Multi-Generational Wealth</span> Through Community
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              A complete system for families and communities to build lasting prosperity together. 
              Learn, simulate, grow, and create generational wealth while supporting your community's collective success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#simulator" className="inline-block">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Try the Demo Simulator <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="#system-overview" className="inline-block">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore the System
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Slides Carousel */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">See the Full Vision</h2>
            <p className="text-muted-foreground">Auto-playing overview of the L.A.W.S. system</p>
          </div>
          <SlidesCarousel />
        </div>
      </section>

      {/* System Overview Section */}
      <section id="system-overview" className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Complete System
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed to support every aspect of your journey to financial freedom and community prosperity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {systemComponents.map((component, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-primary mb-4">{component.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{component.title}</h3>
                <p className="text-muted-foreground">{component.description}</p>
              </Card>
            ))}
          </div>

          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h3 className="text-xl font-bold text-foreground mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold text-foreground">Learn & Practice</h4>
                <p className="text-sm text-muted-foreground">Use simulators to practice business decisions in a safe environment</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold text-foreground">Build & Grow</h4>
                <p className="text-sm text-muted-foreground">Apply what you've learned to build your own business and wealth</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold text-foreground">Share & Prosper</h4>
                <p className="text-sm text-muted-foreground">Connect with other families and build collective community wealth</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Community Wealth Building Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Community Wealth Building
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The L.A.W.S. Collective is built on a revolutionary principle: individual success creates collective prosperity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Individual Excellence</h3>
                  <p className="text-muted-foreground">Each family builds their own thriving business</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Shared Resources</h3>
                  <p className="text-muted-foreground">Access to collective knowledge, tools, and support systems</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Generational Impact</h3>
                  <p className="text-muted-foreground">Build wealth that lasts for generations</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Community Prosperity</h3>
                  <p className="text-muted-foreground">When families thrive, the entire community thrives</p>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200">
              <h3 className="text-2xl font-bold text-foreground mb-6">The Multiplier Effect</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">1 Family builds $100K business</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">10 Families = $1M collective wealth</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "50%" }}></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">100 Families = $10M community impact</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6 italic">
                This is how generational wealth and community prosperity are built together.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* LuvLedger Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  LuvLedger: Your Asset Manager
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Every house gets their own LuvLedger when created—your personal wealth management and asset tracking system.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Real-Time Asset Tracking</h3>
                    <p className="text-muted-foreground text-sm">Monitor all your assets, investments, and wealth in one secure location</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Multi-Generational Records</h3>
                    <p className="text-muted-foreground text-sm">Document and preserve your family's financial history for generations</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Integrated System Hub</h3>
                    <p className="text-muted-foreground text-sm">All simulators, businesses, and transactions flow through LuvLedger</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Secure & Private</h3>
                    <p className="text-muted-foreground text-sm">Your data is encrypted and only accessible to your house members</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200">
              <h3 className="text-2xl font-bold text-foreground mb-6">What LuvLedger Manages</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-foreground">Business operations and income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-foreground">Investment portfolios</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-foreground">Real estate and property</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-foreground">Cryptocurrency and tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-foreground">Educational achievements</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-foreground">Legal documents and records</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-foreground">Family wealth history</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6 italic">
                LuvLedger is the foundation of your house's financial autonomy and generational wealth building.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* L.A.W.S. Framework Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The L.A.W.S. Framework
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our holistic approach to personal and financial development
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lawsFramework.map((item, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-600">{item.letter}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{item.word}</h3>
                <p className="text-sm text-primary mb-2">{item.meaning}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Simulator Section */}
      <section id="simulator" className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-5xl mx-auto px-4">
          <Card className="p-8 md:p-12 overflow-hidden">
            <DemoSimulator />
          </Card>
        </div>
      </section>

      {/* What's Coming Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What's Coming
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're building more features to make the L.A.W.S. system even more powerful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingFeatures.map((feature, idx) => (
              <Card key={idx} className="p-6 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-amber-500/20 text-amber-700 text-xs font-semibold px-2 py-1 rounded">
                  Coming Soon
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.name}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the L.A.W.S. Collective and begin building multi-generational wealth with your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#simulator" className="inline-block">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Try the Simulator <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a href={getLoginUrl()} className="inline-block">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Contact Us to Join
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">L.A.W.S. Collective</h3>
              <p className="text-sm text-muted-foreground">
                Building multi-generational wealth through purpose, education, and community.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#system-overview" className="text-muted-foreground hover:text-foreground">System Overview</a></li>
                <li><a href="#simulator" className="text-muted-foreground hover:text-foreground">Try Demo</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Get Started</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ready to begin your journey to financial freedom?
              </p>
              <a href={getLoginUrl()}>
                <Button size="sm">Join Now</Button>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} L.A.W.S. Collective. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
