import { useState, useEffect, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  Heart,
  Users,
  Briefcase,
  Shield,
  BookOpen,
  Sprout,
  Wind,
  Droplets,
  Star,
  ChevronRight,
  ChevronLeft,
  Mail,
  MapPin,
  Phone,
  Play,
  BarChart3,
  Zap,
  Home,
  FileText,
  TrendingUp,
  Settings,
  CheckCircle2,
} from "lucide-react";

export default function Landing() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/autonomous-wealth-system");
    }
  }, [loading, isAuthenticated, navigate]);
  const [sessionId] = useState(
    () =>
      `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  const trackEvent = trpc.landingAnalytics.trackEvent.useMutation();

  useEffect(() => {
    trackEvent.mutate({ sessionId, eventType: "page_view" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              <span className="text-lg font-bold tracking-tight">
                L.A.W.S. Collective
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#framework" className="text-muted-foreground hover:text-foreground transition-colors">
                Framework
              </a>
              <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </a>
              <a href="#founder" className="text-muted-foreground hover:text-foreground transition-colors">
                Founder
              </a>
              <Link href="/academy" className="text-muted-foreground hover:text-foreground transition-colors">
                Academy
              </Link>
              <Link href="/join" className="text-muted-foreground hover:text-foreground transition-colors">
                Join the Collective
              </Link>
              <Link href="/contact-us" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="sm">Join the Collective</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-primary font-semibold tracking-wide uppercase text-sm">
                  Multi-Generational Wealth Building
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Build Your Business.
                  <br />
                  <span className="text-primary">Establish Your House.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  The L.A.W.S. Collective is a comprehensive framework for building
                  sustainable wealth through purpose and community. From business
                  formation to operational management — we provide the structure,
                  training, and tools to create generational impact.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/pricing">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Join the Collective
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/purple-heart">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => {
                      trackEvent.mutate({
                        sessionId,
                        eventType: "support_clicked",
                      });
                    }}
                  >
                    <Heart className="w-4 h-4" />
                    Support the Mission
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Community-Driven</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span>Business Formation</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Education &amp; Training</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl blur-xl" />
                <div className="relative bg-card border border-border rounded-2xl p-8 space-y-6 shadow-lg">
                  <h3 className="text-xl font-bold text-center">Your Journey</h3>
                  <div className="space-y-4">
                    {[
                      { step: "1", label: "Join & Complete Profile", desc: "Create your account and tell us about yourself" },
                      { step: "2", label: "Business Simulators", desc: "Validate your concept through guided training" },
                      { step: "3", label: "Business Formation", desc: "Legally establish your business entity" },
                      { step: "4", label: "Establish Your House", desc: "Your customized management structure goes live" },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              What Is the L.A.W.S. Collective?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The L.A.W.S. Collective represents a revolutionary approach to
              multi-generational wealth building. By integrating the four
              pillars — LAND, AIR, WATER, and SELF — we create a comprehensive
              framework that honors cultural heritage while building sustainable
              financial futures. Members build real businesses, establish
              management structures (Houses), and gain access to education,
              training, and community support designed to last beyond a single
              generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="bg-card border-border">
              <CardContent className="p-8 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Briefcase className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Business Formation</h3>
                <p className="text-xs text-primary/70 font-medium">L.A.W.S. Collective</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Guided simulators take you from concept to legally formed
                  business entity — S Corp, LLC, non-profit, and more. Training
                  modules create actual, functional entities upon completion.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-8 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">House Structure</h3>
                <p className="text-xs text-primary/70 font-medium">LuvOnPurpose Autonomous Wealth System</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Once your business is established, your House provides a
                  customized management shell — financial tools, HR, compliance,
                  document vault, and governance tailored to your business type.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-8 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Education &amp; Academy</h3>
                <p className="text-xs text-primary/70 font-medium">LuvOnPurpose Academy and Outreach</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  LuvOnPurpose Academy and Outreach provides K-12 homeschool
                  programs, certification courses, coding &amp; AI simulators,
                  and apprenticeship pathways.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Demo Simulator */}
      <DemoSimulatorSection sessionId={sessionId} trackEvent={trackEvent} />

      {/* L.A.W.S. Framework */}
      <section id="framework" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">The L.A.W.S. Framework</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four interconnected pillars that create a complete system for
            generational wealth and community empowerment.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <Sprout className="w-8 h-8" />,
              title: "LAND",
              subtitle: "Reconnection & Stability",
              description:
                "Understanding roots, migrations, and family history to build a strong foundation. Reconnecting with ancestral knowledge and establishing stability for future generations.",
              color: "text-green-600 dark:text-green-400",
              bg: "bg-green-500/10 border-green-500/20",
            },
            {
              icon: <Wind className="w-8 h-8" />,
              title: "AIR",
              subtitle: "Education & Knowledge",
              description:
                "Learning, personal development, and communication for continuous growth. The Academy provides self-paced curricula aligned with traditional standards while fostering independent thinking.",
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
            {
              icon: <Droplets className="w-8 h-8" />,
              title: "WATER",
              subtitle: "Healing & Balance",
              description:
                "Emotional resilience, healing cycles, and healthy decision-making. Building the internal strength needed to sustain long-term wealth building and community leadership.",
              color: "text-cyan-600 dark:text-cyan-400",
              bg: "bg-cyan-500/10 border-cyan-500/20",
            },
            {
              icon: <Star className="w-8 h-8" />,
              title: "SELF",
              subtitle: "Purpose & Skills",
              description:
                "Financial literacy, business readiness, and purposeful growth. Developing the practical skills and mindset needed to build, manage, and scale sustainable enterprises.",
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-500/10 border-amber-500/20",
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className={`${pillar.bg} border rounded-xl p-8 space-y-4`}
            >
              <div className={`${pillar.color}`}>{pillar.icon}</div>
              <div>
                <h3 className="text-2xl font-bold">{pillar.title}</h3>
                <p className={`text-sm font-semibold ${pillar.color}`}>
                  {pillar.subtitle}
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Meet Luv / Founder Section */}
      <section id="founder" className="bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Meet Luv</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Luv's journey to building The L.A.W.S. Collective started with a
                simple question: why do so many families struggle to build wealth
                that lasts? With a career rooted in contract administration across
                both government and commercial sectors, she saw firsthand how
                systems are built — and how they often leave everyday families
                behind.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                That experience, combined with years of real-world observation,
                community conversations, and a deep commitment to understanding
                how wealth actually works, led her to create something different.
                The L.A.W.S. Collective is her answer — a framework built on
                purpose, not theory, designed to help families reconnect with
                their roots and build something that outlasts any single
                generation.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663294252884/SPWUc63a3tjYuzCxiuEomB/luv-photo_38d8d9aa.jpg"
                alt="Luv - Founder of The L.A.W.S. Collective"
                className="w-80 h-80 rounded-xl object-cover border border-border shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — Member Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your path from joining the Collective to operating your own House.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Join & Profile",
              desc: "Create your account, complete your personal profile and business assessment. Tell us who you are and what you want to build.",
              link: "/login",
            },
            {
              step: "02",
              title: "Business Simulators",
              desc: "Work through guided training modules that validate your business concept, build financial literacy, and prepare your business plan.",
              link: "/login",
            },
            {
              step: "03",
              title: "Business Formation",
              desc: "Legally establish your business entity — S Corp, LLC, non-profit, or other structure. Simulators produce real, functional entities upon completion.",
              link: "/login",
            },
            {
              step: "04",
              title: "Establish Your House",
              desc: "Your House is your customized management shell — financial tools, HR, compliance, document vault, and governance tailored to your business type.",
              link: "/login",
            },
          ].map((item) => (
            <div key={item.step} className="space-y-4">
              <div className="text-5xl font-bold text-primary/20">
                {item.step}
              </div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/pricing">
            <Button size="lg" className="gap-2">
              Start Your Journey
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Support / Donate CTA */}
      <section className="bg-primary/5 border-y border-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
          <Heart className="w-10 h-10 text-primary mx-auto" />
          <h2 className="text-3xl font-bold">Support the Mission</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The L.A.W.S. Collective is building a system for generational wealth
            that serves families and communities. Your support helps us expand
            access, develop training programs, and grow the Collective.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/purple-heart">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Heart className="w-4 h-4" />
                Donate / Support
              </Button>
            </Link>
            <Link href="/indigenous-rights">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 w-full sm:w-auto"
              >
                Indigenous Rights
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Join the Collective CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-card border border-border rounded-xl p-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Join the Collective</h3>
            <p className="text-muted-foreground">
              Start your journey with the L.A.W.S. Collective. Build a business,
              establish your House, and create generational wealth through purpose.
            </p>
          </div>
          <Link href="/join">
            <Button variant="outline" size="lg" className="gap-2 flex-shrink-0">
              <Users className="w-4 h-4" />
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* QR Code Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center text-center space-y-6">
          <h3 className="text-2xl font-bold">Scan to Connect</h3>
          <p className="text-muted-foreground max-w-md">
            Scan this QR code with your phone to access the LuvOnPurpose platform
            instantly — share it with family, friends, and community members.
          </p>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <QRCodeSVG
              value="https://finmap-spwuc63a.manus.space"
              size={200}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#1a1a2e"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            finmap-spwuc63a.manus.space
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                <span className="font-bold">L.A.W.S. Collective</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Multi-generational wealth building through purpose, community,
                and structured business development.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Navigate</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#about" className="block hover:text-foreground transition-colors">
                  About
                </a>
                <a href="#framework" className="block hover:text-foreground transition-colors">
                  L.A.W.S. Framework
                </a>
                <a href="#founder" className="block hover:text-foreground transition-colors">
                  Meet Luv
                </a>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Get Involved</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/pricing" className="block hover:text-foreground transition-colors">
                  Join the Collective
                </Link>
                <Link href="/purple-heart" className="block hover:text-foreground transition-colors">
                  Support / Donate
                </Link>
                <Link href="/join" className="block hover:text-foreground transition-colors">
                  Join the Collective
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/contact-us" className="block hover:text-foreground transition-colors">
                  <span className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    Contact Us
                  </span>
                </Link>
                <Link href="/indigenous-rights" className="block hover:text-foreground transition-colors">
                  Indigenous Rights
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-3">The Collective</h5>
            <div className="space-y-0.5 text-[11px] text-muted-foreground/40">
              <p>The L.A.W.S. Collective — Employment &amp; Membership</p>
              <p>LuvOnPurpose Autonomous Wealth System — House Structure &amp; Business Management</p>
              <p>LuvOnPurpose Academy and Outreach — Education &amp; 508(c)(1)(a)</p>
              <p>REAL-EYE-NATION — Performing Arts, Design Dept.</p>
            </div>
            {isAuthenticated && user?.role === "admin" && (
              <p className="mt-2">
                <Link href="/dashboard" className="text-muted-foreground/40 hover:text-primary transition-colors">
                  ·
                </Link>
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Interactive Demo Simulator ────────────────────────────────────────────
type SimSlide = {
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "intro" | "choice" | "text";
  options?: string[];
};

function DemoSimulatorSection({
  sessionId,
  trackEvent,
}: {
  sessionId: string;
  trackEvent: { mutate: (data: { sessionId: string; eventType: string; metadata?: any }) => void };
}) {
  const [started, setStarted] = useState(false);
  const [slide, setSlide] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [bizName, setBizName] = useState("");
  const [done, setDone] = useState(false);

  const slides: SimSlide[] = [
    {
      title: "Let's Build Your Business",
      description:
        "Answer a few quick questions and see how the L.A.W.S. system structures your business — no account needed.",
      icon: <Play className="w-6 h-6" />,
      type: "intro",
    },
    {
      title: "What Type of Business?",
      description: "Choose the structure that fits your vision.",
      icon: <Briefcase className="w-6 h-6" />,
      type: "choice",
      options: ["LLC", "S-Corp", "C-Corp", "Partnership", "Sole Proprietorship"],
    },
    {
      title: "Primary Goal",
      description: "What are you building toward?",
      icon: <TrendingUp className="w-6 h-6" />,
      type: "choice",
      options: [
        "Revenue generation",
        "Wealth building",
        "Community impact",
        "Growth & scaling",
      ],
    },
    {
      title: "Timeline",
      description: "When are you looking to launch?",
      icon: <Zap className="w-6 h-6" />,
      type: "choice",
      options: ["Starting now", "1-3 months", "3-6 months", "6-12 months"],
    },
    {
      title: "Team Structure",
      description: "How do you want to build your team?",
      icon: <Users className="w-6 h-6" />,
      type: "choice",
      options: ["Solo", "Small team (2-5)", "Medium team (6-20)", "Large team (20+)"],
    },
    {
      title: "Financial Management",
      description: "How will you manage finances?",
      icon: <BarChart3 className="w-6 h-6" />,
      type: "choice",
      options: ["Self-managed", "Professional accounting", "Full automation"],
    },
    {
      title: "Name Your Business",
      description: "What will your business be called?",
      icon: <Home className="w-6 h-6" />,
      type: "text",
    },
  ];

  const dashboardCards = () => {
    const cards = [
      { title: "Business Overview", icon: BarChart3, reason: "Core dashboard for all businesses" },
      { title: "Documents & Compliance", icon: FileText, reason: "Legal protection and compliance" },
    ];
    if (
      answers[2]?.includes("Revenue") ||
      answers[2]?.includes("Wealth")
    )
      cards.push({
        title: "Financial Dashboard",
        icon: Zap,
        reason: "Essential for your financial goals",
      });
    if (answers[4] && answers[4] !== "Solo")
      cards.push({
        title: "Team Management",
        icon: Users,
        reason: "Manage your growing team",
      });
    if (answers[2]?.includes("Growth"))
      cards.push({
        title: "Growth Tracking",
        icon: TrendingUp,
        reason: "Monitor your scaling progress",
      });
    if (
      answers[5]?.includes("Professional") ||
      answers[5]?.includes("automation")
    )
      cards.push({
        title: "Integration Hub",
        icon: Settings,
        reason: "Connect with your tools",
      });
    return cards;
  };

  const current = slides[slide];
  const answered = answers[slide] !== undefined;

  const next = () => {
    if (slide < slides.length - 1) setSlide(slide + 1);
    else {
      setDone(true);
      trackEvent.mutate({
        sessionId,
        eventType: "demo_completed",
        metadata: { businessName: bizName, answers },
      });
    }
  };
  const prev = () => slide > 0 && setSlide(slide - 1);

  if (!started) {
    return (
      <section
        id="demo"
        className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-y border-border"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full">
            <Play className="w-4 h-4" />
            Interactive Demo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Try the Business Simulator
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See how the L.A.W.S. system works before you join. Answer a few
            questions and we'll show you a personalized preview of your
            business management dashboard — no sign-up required.
          </p>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => {
              setStarted(true);
              trackEvent.mutate({ sessionId, eventType: "demo_started" });
            }}
          >
            <Play className="w-4 h-4" />
            Launch Demo Simulator
          </Button>
        </div>
      </section>
    );
  }

  if (done) {
    return (
      <section
        id="demo"
        className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-y border-border"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10">
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-3xl font-bold">
              {bizName ? `${bizName}'s` : "Your"} Dashboard Preview
            </h2>
            <p className="text-muted-foreground text-lg">
              Based on your answers, here are the tools your House would include.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardCards().map((c, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <c.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.reason}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Ready to build this for real?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Join the Collective
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setDone(false);
                  setSlide(0);
                  setAnswers({});
                  setBizName("");
                  setStarted(false);
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="demo"
      className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-y border-border"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        {/* Progress */}
        <div className="flex items-center gap-1">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= slide ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Slide Content */}
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
            {current.icon}
          </div>
          <h3 className="text-2xl font-bold">{current.title}</h3>
          <p className="text-muted-foreground">{current.description}</p>
        </div>

        {/* Answer Area */}
        {current.type === "choice" && current.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {current.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, [slide]: opt })}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                  answers[slide] === opt
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground hover:border-primary/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {current.type === "text" && (
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Enter your business name"
              value={bizName}
              onChange={(e) => {
                setBizName(e.target.value);
                setAnswers({ ...answers, [slide]: e.target.value });
              }}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={slide === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <span className="text-sm text-muted-foreground">
            {slide + 1} / {slides.length}
          </span>
          <Button
            size="sm"
            onClick={next}
            disabled={
              current.type === "choice"
                ? !answered
                : current.type === "text"
                ? !bizName.trim()
                : false
            }
            className="gap-1"
          >
            {slide === slides.length - 1 ? "See Results" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
