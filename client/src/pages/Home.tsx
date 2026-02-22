import React, { useState } from "react";
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
  Globe,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import SlidesCarousel from "@/components/SlidesCarousel";
import { WaitlistSignup } from "@/components/WaitlistSignup";

// Simplified Demo: Setup + Premium Walkthrough
const entityTypes = [
  { id: "llc", name: "LLC", desc: "Limited Liability Company" },
  { id: "scorp", name: "S Corp", desc: "S Corporation" },
  { id: "nonprofit", name: "Nonprofit", desc: "Tax-Exempt Organization" },
  { id: "trust", name: "Trust", desc: "Family Trust" },
];

const businessTypes = [
  { id: "tech", name: "Tech / E-Commerce", dashboards: ["Product Analytics", "Customer Acquisition", "Revenue Pipeline", "Tech Infrastructure"] },
  { id: "service", name: "Service / Consulting", dashboards: ["Client Management", "Project Tracking", "Billing & Invoicing", "Resource Allocation"] },
  { id: "healthcare", name: "Healthcare / Wellness", dashboards: ["Patient Management", "Compliance Tracking", "Appointment Scheduling", "Insurance & Billing"] },
  { id: "retail", name: "Retail / Food Service", dashboards: ["Inventory Management", "Point of Sale", "Supplier Relations", "Customer Loyalty"] },
  { id: "realestate", name: "Real Estate / Property", dashboards: ["Property Portfolio", "Tenant Management", "Maintenance Tracking", "Market Analysis"] },
  { id: "education", name: "Education / Training", dashboards: ["Student Enrollment", "Curriculum Management", "Instructor Scheduling", "Certification Tracking"] },
  { id: "creative", name: "Creative / Media", dashboards: ["Content Calendar", "Client Campaigns", "Asset Library", "Performance Analytics"] },
  { id: "construction", name: "Construction / Trades", dashboards: ["Job Scheduling", "Materials Tracking", "Subcontractor Management", "Safety Compliance"] },
];

const walkthroughSteps = [
  {
    title: "Will Be Established",
    subtitle: "Entity Registration Process",
    items: ["Entity Registration", "EIN Assignment", "Operating Agreement", "Bank Account Setup"],
    gradient: "from-blue-900 via-indigo-900 to-slate-900",
    icon: "Building2",
  },
  {
    title: "Your House Will Be Created",
    subtitle: "Private & Sovereign System Instance",
    items: ["Isolated data environment", "Family governance structure", "Multi-entity management", "Secure document vault"],
    gradient: "from-emerald-900 via-green-900 to-teal-900",
    icon: "HomeIcon",
  },
  {
    title: "LuvLedger Will Activate",
    subtitle: "Your Planned Wealth Management Hub",
    items: ["Business income tracking", "Investment portfolio", "Real estate holdings", "Multi-generational history"],
    gradient: "from-purple-900 via-violet-900 to-indigo-900",
    icon: "BarChart3",
  },
  {
    title: "Education Simulators (Planned)",
    subtitle: "Learn by Doing — Practice Before You Risk",
    items: ["Business Formation Simulator", "Grant Writing Workshop", "Tax Preparation & Compliance", "Proposal Development Tools", "Financial Planning Scenarios"],
    gradient: "from-violet-900 via-purple-900 to-fuchsia-900",
    icon: "BookOpen",
  },
  {
    title: "Grant & Tax Tools (Planned)",
    subtitle: "Entity-Specific Strategy & Funding Access",
    items: ["Curated grant database for your entity type", "Tax simulators for LLCs, S Corps, nonprofits, Trusts", "Proposal templates & budget builders", "Compliance checklists & filing guides"],
    gradient: "from-amber-900 via-orange-900 to-red-900",
    icon: "TrendingUp",
  },
  {
    title: "Your Growth Path (Planned)",
    subtitle: "Employee to Contractor Transition",
    items: ["Managers transition to Board Members", "Coordinators become independent contractors", "Benefits & legal structure documented", "No one is left behind in the process"],
    gradient: "from-cyan-900 via-blue-900 to-indigo-900",
    icon: "Network",
  },
  {
    title: "Land Reclamation (Planned)",
    subtitle: "Reconnecting Families to the Land",
    items: ["Ancestral land record research", "Reclamation opportunity identification", "Pathway to land ownership", "Foundational to generational wealth"],
    gradient: "from-teal-900 via-cyan-900 to-blue-900",
    icon: "Shield",
  },
];

function DemoSimulator() {
  const [step, setStep] = useState<"start" | "setup" | "walkthrough" | "done">("start");
  const [entityType, setEntityType] = useState("llc");
  const [businessType, setBusinessType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [walkStep, setWalkStep] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const resetDemo = () => {
    setStep("start");
    setEntityType("llc");
    setBusinessType("");
    setBusinessName("");
    setWalkStep(0);
  };

  const handleSubmit = () => {
    if (!entityType || !businessType || !businessName) return;
    setStep("walkthrough");
  };

  // Auto-advance walkthrough every 12 seconds
  React.useEffect(() => {
    if (step !== "walkthrough" || !autoAdvance) return;
    const timer = setTimeout(() => {
      if (walkStep < walkthroughSteps.length - 1) {
        setWalkStep(walkStep + 1);
      } else {
        setStep("done");
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [step, walkStep, autoAdvance]);

  if (step === "start") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">Educational Concept Demo</h3>
          <p className="text-muted-foreground mb-6">Walk through a concept demonstration of how the L.A.W.S. system will work — from entity formation to community wealth building.</p>
          <Button onClick={() => setStep("setup")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Start Educational Demo
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">Educational concept demo • No data saved • Under 2 minutes</p>
      </div>
    );
  }

  if (step === "setup") {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">Entity Type (Planned)</label>
          <div className="grid grid-cols-2 gap-3">
            {entityTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setEntityType(type.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  entityType === type.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-semibold text-foreground">{type.name}</div>
                <div className="text-xs text-muted-foreground">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">Business Type (Planned)</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {businessTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setBusinessType(type.id)}
                className={`p-2 rounded-lg border-2 transition-all text-left text-sm ${
                  businessType === type.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-semibold text-foreground">{type.name}</div>
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
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={!entityType || !businessType || !businessName} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            Continue
          </Button>
          <Button onClick={resetDemo} variant="outline">
            Reset
          </Button>
        </div>
      </div>
    );
  }

  if (step === "walkthrough") {
    const currentStep = walkthroughSteps[walkStep];
    const IconComponent = currentStep.icon === "Building2" ? Building2 : currentStep.icon === "HomeIcon" ? HomeIcon : currentStep.icon === "BarChart3" ? BarChart3 : currentStep.icon === "BookOpen" ? BookOpen : currentStep.icon === "TrendingUp" ? TrendingUp : currentStep.icon === "Network" ? Network : Shield;

    return (
      <div className="space-y-6">
        <div className={`bg-gradient-to-br ${currentStep.gradient} rounded-lg p-8 text-white`}>
          <div className="flex items-start gap-4 mb-4">
            <IconComponent className="w-8 h-8 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white/70 text-sm uppercase tracking-wider mb-1">(Planned)</p>
              <h3 className="text-2xl font-bold mb-2">{currentStep.title}</h3>
              <p className="text-white/80">{currentStep.subtitle}</p>
            </div>
          </div>
          <ul className="space-y-2 mt-6">
            {currentStep.items.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-white/90">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={() => setWalkStep(Math.max(0, walkStep - 1))} variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${((walkStep + 1) / walkthroughSteps.length) * 100}%` }} />
          </div>
          <Button onClick={() => setWalkStep(Math.min(walkthroughSteps.length - 1, walkStep + 1))} variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setAutoAdvance(!autoAdvance)} variant="outline" className="flex-1">
            {autoAdvance ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {autoAdvance ? "Pause" : "Play"}
          </Button>
          <Button onClick={() => setStep("done")} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            Skip to End
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Step {walkStep + 1} of {walkthroughSteps.length}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">That's the Vision</h3>
        <p className="text-muted-foreground mb-4">
          This is how the L.A.W.S. system will activate when you join. We're building this platform to help families and communities build lasting prosperity together.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Platform in Development • Launching 2026 • Contact us to learn more
        </p>
      </div>
      <Button onClick={resetDemo} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        Run Demo Again
      </Button>
    </div>
  );
}

const systemComponents = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Business Simulators",
    description: "Interactive scenarios designed to help practice business decisions and see real-time outcomes",
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Academy & Curriculum",
    description: "Planned comprehensive education in financial literacy, business, and wealth building",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community Network",
    description: "A planned network to connect families and houses building wealth together",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Trust Management",
    description: "Planned secure governance and asset management for multi-generational wealth",
  },
];

const comingFeatures = [
  { name: "Multi-Tenant System", description: "Each house gets their own isolated system instance" },
  { name: "Full Dashboard Suite", description: "Comprehensive management dashboards for all operations" },
  { name: "Community Collaboration", description: "Tools for houses to collaborate and share resources" },
  { name: "Token Economy", description: "Wealth sharing and token-based incentives" },
  { name: "Advanced Analytics", description: "Deep insights into business and community metrics" },
  { name: "Mobile App", description: "Full system access on iOS and Android" },
];

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              The L.A.W.S. Collective
            </h1>

            <div className="flex justify-center gap-3 mb-8 text-2xl font-bold">
              <span><span className="text-green-600">L</span>and</span>
              <span><span className="text-blue-600">A</span>ir</span>
              <span><span className="text-cyan-600">W</span>ater</span>
              <span><span className="text-purple-600">S</span>elf</span>
            </div>

            <p className="text-xl md:text-2xl text-foreground font-semibold mb-4">
              A Sovereign Wealth Management & Trust Administration Platform
            </p>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              We are building a sovereign wealth management and trust administration platform designed to connect families within a closed-loop economic system for multi-generational wealth building.
            </p>


          </div>
        </div>
      </section>

      {/* Concept Overview - Carousel Section - MOVED TO TOP */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/70 mb-3">Concept Overview</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">See What We're Building</h2>
            <p className="text-muted-foreground">An overview of the platform vision and planned capabilities</p>
          </div>
          <SlidesCarousel />
          
          {/* CTA Buttons Under Carousel */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
              <Link href="#simulator">Try the Educational Demo</Link>
            </Button>
            <Button asChild variant="outline" className="px-8 py-6 text-lg">
              <Link href="#system-overview">Explore the Vision</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Luv Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="flex justify-center md:justify-start">
              <img src="/IMG_0290.jpeg" alt="La Shanna K. Russell (Luv)" className="w-64 h-64 object-cover rounded-xl border-2 border-primary/30 shadow-lg" />
            </div>
            <div className="md:col-span-2">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/70 mb-3">Meet the Founder</span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">About Luv</h2>
              <p className="text-xl text-muted-foreground mb-6">Founder & Visionary of The L.A.W.S. Collective</p>
              <div className="space-y-4 text-base text-foreground/80 leading-relaxed">
                <p>With extensive experience in contracting and enterprise operations, I bring both academic rigor and practical expertise to The L.A.W.S. Collective.</p>
                <p><strong>Education:</strong> Associates degrees from Bryant and Stratton College (1998) and Bachelor from American Public University (2025, Cum Laude).</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Simulator Section - MOVED BELOW CAROUSEL */}
      <section id="simulator" className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full mb-4">Educational Demo</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Interactive System Demo</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Walk through the business setup process and see how the L.A.W.S. system activates for your family</p>
          </div>
          <Card className="p-8 md:p-12 overflow-hidden">
            <DemoSimulator />
          </Card>
        </div>
      </section>

      {/* System Overview Section */}
      <section id="system-overview" className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/70 mb-3">Planned Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Complete System Vision
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform being designed to support every aspect of your journey to financial freedom and community prosperity
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
                <p className="text-sm text-muted-foreground">Use simulators to practice business decisions in a safe, educational environment</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold text-foreground">Build & Grow</h4>
                <p className="text-sm text-muted-foreground">Apply what you learn to build your own business and wealth</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold text-foreground">Share & Prosper</h4>
                <p className="text-sm text-muted-foreground">Connect with other families to build collective community wealth together</p>
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
              The L.A.W.S. Collective is being built on a foundational principle: individual success creates collective prosperity
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
                  <h3 className="font-semibold text-foreground">Individual Excellence</h3>
                  <p className="text-muted-foreground">Each family will build their own thriving business</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Shared Resources</h3>
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
                  <h3 className="font-semibold text-foreground">Generational Impact</h3>
                  <p className="text-muted-foreground">Building wealth designed to last for generations</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Community Prosperity</h3>
                  <p className="text-muted-foreground">When families thrive, entire communities thrive</p>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
              <h3 className="text-2xl font-bold text-foreground mb-6">The Multiplier Effect (Our Goal)</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-emerald-600">1</div>
                  <div>
                    <p className="font-semibold text-foreground">Family builds toward $100K business</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-emerald-600">10</div>
                  <div>
                    <p className="font-semibold text-foreground">Families = $1M collective wealth goal</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-emerald-600">100</div>
                  <div>
                    <p className="font-semibold text-foreground">Families = $10M community impact goal</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                This is the vision for how generational wealth and community prosperity will be built together.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* LuvLedger Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              LuvLedger: Your Future Asset Manager
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every house will receive their own LuvLedger—a planned personal wealth management and asset tracking system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Real-Time Asset Tracking</h3>
              <p className="text-muted-foreground">Planned capability to monitor all assets, investments, and wealth in one secure location</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Multi-Generational Records</h3>
              <p className="text-muted-foreground">Designed to document and preserve your family's financial history for generations</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Integrated System Hub</h3>
              <p className="text-muted-foreground">All simulators, businesses, and transactions will flow through LuvLedger</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">Your data will be encrypted and only accessible to your house members</p>
            </Card>
          </div>

          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
            <h3 className="text-xl font-bold text-foreground mb-6">What LuvLedger Will Manage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Business operations and income",
                "Investment portfolios",
                "Real estate and property",
                "Cryptocurrency and tokens",
                "Educational achievements",
                "Legal documents and records",
                "Family wealth history",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              LuvLedger will be the foundation of your house's financial autonomy and generational wealth building.
            </p>
          </Card>
        </div>
      </section>

      {/* L.A.W.S. Framework Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The L.A.W.S. Framework
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our holistic approach to personal and financial development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="text-lg font-bold text-foreground mb-2">Land</h3>
              <p className="text-sm text-muted-foreground mb-3">Reconnection & Stability</p>
              <p className="text-xs text-muted-foreground">Understanding your roots, migrations, and family history</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">💨</div>
              <h3 className="text-lg font-bold text-foreground mb-2">Air</h3>
              <p className="text-sm text-muted-foreground mb-3">Education & Knowledge</p>
              <p className="text-xs text-muted-foreground">Learning, personal development, and communication</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">💧</div>
              <h3 className="text-lg font-bold text-foreground mb-2">Water</h3>
              <p className="text-sm text-muted-foreground mb-3">Healing & Balance</p>
              <p className="text-xs text-muted-foreground">Emotional resilience and healthy decision-making</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="text-lg font-bold text-foreground mb-2">Self</h3>
              <p className="text-sm text-muted-foreground mb-3">Purpose & Skills</p>
              <p className="text-xs text-muted-foreground">Financial literacy, business readiness, and purposeful growth</p>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Coming Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
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

      {/* Waitlist Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Be First to Know
            </h2>
            <p className="text-lg text-muted-foreground">
              Join our waitlist for exclusive early access and launch updates.
            </p>
          </div>
          <WaitlistSignup />
        </div>
      </section>
    </div>
  );
}
