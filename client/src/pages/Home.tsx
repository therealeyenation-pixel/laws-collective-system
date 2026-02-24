import { useState } from "react";
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
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

// Demo Simulator Component
function DemoSimulator() {
  const [simulatorState, setSimulatorState] = useState({
    started: false,
    year: 1,
    capital: 50000,
    revenue: 0,
    expenses: 0,
    employees: 2,
    decisions: [] as string[],
  });

  const handleDecision = (decision: string, impact: { capital: number; revenue: number; employees: number }) => {
    setSimulatorState((prev) => ({
      ...prev,
      year: prev.year + 1,
      capital: Math.max(0, prev.capital + impact.capital),
      revenue: prev.revenue + impact.revenue,
      expenses: prev.expenses + 500,
      employees: Math.max(1, prev.employees + impact.employees),
      decisions: [...prev.decisions, decision],
    }));
  };

  const netProfit = simulatorState.revenue - simulatorState.expenses;

  if (!simulatorState.started) {
    return (
      <div className="text-center space-y-6">
        <h3 className="text-2xl font-bold text-foreground">Try the Business Simulator</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Make strategic business decisions and see how your choices impact your company's growth, your family's wealth, and the collective community prosperity.
        </p>
        <Button
          size="lg"
          onClick={() => setSimulatorState({ ...simulatorState, started: true })}
          className="gap-2"
        >
          Start Demo Simulator <Zap className="w-4 h-4" />
        </Button>
        <p className="text-xs text-muted-foreground italic">
          This is a sample simulation. No data is saved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Year</p>
          <p className="text-2xl font-bold text-primary">{simulatorState.year}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Capital</p>
          <p className="text-2xl font-bold text-emerald-600">${(simulatorState.capital / 1000).toFixed(1)}K</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Revenue</p>
          <p className="text-2xl font-bold text-blue-600">${(simulatorState.revenue / 1000).toFixed(1)}K</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${(netProfit / 1000).toFixed(1)}K
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Team</p>
          <p className="text-2xl font-bold text-amber-600">{simulatorState.employees}</p>
        </Card>
      </div>

      <div className="space-y-3">
        <p className="font-semibold text-foreground">What's your next move?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleDecision("Launched new product line", { capital: -5000, revenue: 8000, employees: 1 })}
            className="text-left h-auto py-4 justify-start"
          >
            <div className="text-left">
              <p className="font-semibold">Launch New Product</p>
              <p className="text-xs text-muted-foreground">Invest $5K, gain $8K revenue</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDecision("Hired marketing specialist", { capital: -2000, revenue: 3000, employees: 1 })}
            className="text-left h-auto py-4 justify-start"
          >
            <div className="text-left">
              <p className="font-semibold">Hire Marketing Specialist</p>
              <p className="text-xs text-muted-foreground">Invest $2K, gain $3K revenue</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDecision("Expanded to new market", { capital: -8000, revenue: 12000, employees: 2 })}
            className="text-left h-auto py-4 justify-start"
          >
            <div className="text-left">
              <p className="font-semibold">Expand to New Market</p>
              <p className="text-xs text-muted-foreground">Invest $8K, gain $12K revenue</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDecision("Invested in training", { capital: -1000, revenue: 2000, employees: 0 })}
            className="text-left h-auto py-4 justify-start"
          >
            <div className="text-left">
              <p className="font-semibold">Invest in Team Training</p>
              <p className="text-xs text-muted-foreground">Invest $1K, gain $2K revenue</p>
            </div>
          </Button>
        </div>
      </div>

      {simulatorState.decisions.length > 0 && (
        <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
          <p className="font-semibold text-foreground text-sm">Your Journey:</p>
          <div className="space-y-1">
            {simulatorState.decisions.map((decision, idx) => (
              <p key={idx} className="text-sm text-muted-foreground">
                <span className="text-primary font-semibold">Year {idx + 1}:</span> {decision}
              </p>
            ))}
          </div>
        </div>
      )}

      {simulatorState.year >= 5 && (
        <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200">
          <h4 className="font-bold text-foreground mb-2">Simulation Complete!</h4>
          <p className="text-sm text-muted-foreground mb-4">
            You've built a business with ${netProfit.toFixed(0)} in net profit and a team of {simulatorState.employees} people. 
            Imagine this multiplied across dozens of families in the L.A.W.S. Collective - that's community wealth building in action.
          </p>
          <Button
            variant="outline"
            onClick={() => setSimulatorState({
              started: false,
              year: 1,
              capital: 50000,
              revenue: 0,
              expenses: 0,
              employees: 2,
              decisions: [],
            })}
          >
            Reset Simulator
          </Button>
        </Card>
      )}
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

      {/* QR Code Section */}
      <section className="py-12 md:py-16 flex justify-center items-center">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <img 
            src="/qr-code.png" 
            alt="QR Code" 
            className="w-48 h-48 md:w-64 md:h-64 mx-auto"
          />
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
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="p-8 md:p-12">
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

      {/* About Luv Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary mb-2">MEET THE FOUNDER</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">About Luv</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/dLPgSOCzSajCscyU.png" 
                alt="La Shanna K. Russell" 
                className="w-64 h-64 md:w-80 md:h-80 rounded-lg shadow-lg object-cover"
              />
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">La Shanna K. Russell (Luv)</h3>
                <p className="text-lg text-primary font-semibold mb-4">Founder & Visionary of The L.A.W.S. Collective</p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  With extensive experience in contracting and enterprise operations, I bring both academic rigor and practical expertise to the L.A.W.S. Collective.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  My background spans 15+ years in government and commercial contracting, combined with a lifetime of research and systems architecture focused on wealth-building mechanisms and economic sovereignty.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-4">Education</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Bachelor's Degree in Business Administration with minor in Management (American Public University, 2025, Cum Laude)</li>
                  <li>• Associates Degree in Microcomputers Management (Bryant & Stratton College, 1998, National Honors Society)</li>
                  <li>• Associates Degree in Administrative Assistant with Micro option (Bryant & Stratton College, 1998)</li>
                </ul>
              </div>
            </div>
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
