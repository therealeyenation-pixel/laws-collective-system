import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  GraduationCap,
  BookOpen,
  Globe2,
  TreePine,
  Calculator,
  Code,
  Wrench,
  Leaf,
  Pen,
  Briefcase,
  Music,
  Languages,
  Lock,
  ArrowRight,
  Check,
  Loader2,
  Shield,
  Users,
  Award,
  Flame,
} from "lucide-react";
import { Link } from "wouter";
import { PublicQAAgent } from "@/components/PublicQAAgent";

const CURRICULUM_MODULES = [
  {
    name: "Science of Origin & Observation",
    icon: <TreePine className="w-5 h-5" />,
    description: "Understanding natural systems, ecology, and the science of creation through indigenous and modern lenses.",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    name: "Mathematics & Sacred Geometry",
    icon: <Calculator className="w-5 h-5" />,
    description: "From foundational math to sacred geometry — patterns that connect nature, architecture, and the universe.",
    color: "bg-blue-100 text-blue-800",
  },
  {
    name: "Technology & Light Code",
    icon: <Code className="w-5 h-5" />,
    description: "Coding, AI, blockchain, and digital literacy. Building tools for sovereignty in the modern world.",
    color: "bg-purple-100 text-purple-800",
  },
  {
    name: "Engineering of Purpose",
    icon: <Wrench className="w-5 h-5" />,
    description: "Skilled trades, construction, electrical, plumbing — practical engineering for self-sufficiency.",
    color: "bg-orange-100 text-orange-800",
  },
  {
    name: "Living Earth & Farming",
    icon: <Leaf className="w-5 h-5" />,
    description: "Agriculture, permaculture, food sovereignty — reconnecting with the land that sustains us.",
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Spirit Writing & Chants",
    icon: <Pen className="w-5 h-5" />,
    description: "Creative expression, storytelling, oral tradition, and the power of written and spoken word.",
    color: "bg-amber-100 text-amber-800",
  },
  {
    name: "Entrepreneurial Flame",
    icon: <Briefcase className="w-5 h-5" />,
    description: "Financial literacy, business formation, tax strategy, and building generational wealth.",
    color: "bg-red-100 text-red-800",
  },
  {
    name: "House of Many Tongues",
    icon: <Languages className="w-5 h-5" />,
    description: "Indigenous languages, ancestral tongues, and global trade languages for cultural preservation.",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    name: "Ceremonial Arts",
    icon: <Music className="w-5 h-5" />,
    description: "Music, dance, visual arts, and ceremonial practices that connect generations.",
    color: "bg-pink-100 text-pink-800",
  },
  {
    name: "Smart Contract & Blockchain Mastery",
    icon: <Lock className="w-5 h-5" />,
    description: "Smart contract development, NFT deployment, tokenomics, DeFi mechanics, and blockchain security — building sovereign digital infrastructure.",
    color: "bg-cyan-100 text-cyan-800",
  },
];

export default function AcademyLanding() {
  const { isAuthenticated } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [loadingEnroll, setLoadingEnroll] = useState(false);

  const academyCheckout = trpc.stripeCheckout.createAcademyCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to checkout...");
        window.open(data.url, "_blank");
      }
      setLoadingEnroll(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setLoadingEnroll(false);
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoadingEnroll(true);
    academyCheckout.mutate({
      billingInterval: annual ? "annual" : "monthly",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">LuvOnPurpose Academy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Collective Plans
            </Link>
            <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Careers
            </Link>
            {isAuthenticated ? (
              <Link href="/academy/dashboard">
                <Button size="sm">My Academy</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm" variant="outline">Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="container max-w-5xl mx-auto text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
              508(c)(1)(a) Educational Institution
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              LuvOnPurpose Outreach<br />
              <span className="text-green-800">Temple and Academy Society</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              A sovereign school rooted in ancestral wisdom and modern innovation.
              From K-12 homeschool curriculum to skilled trades certification —
              education designed to build generational wealth and cultural preservation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="gap-2 bg-green-800 hover:bg-green-900 text-white"
                onClick={handleEnroll}
                disabled={loadingEnroll}
              >
                {loadingEnroll ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Enroll Now — ${annual ? "21" : "29"}/mo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              <a href="#curriculum">
                <Button size="lg" variant="outline" className="gap-2">
                  Explore Curriculum
                  <BookOpen className="w-4 h-4" />
                </Button>
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Included with Collective Member & Builder plans.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-green-800/5 border-y border-border">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Divine STEM Modules", value: "10" },
                { label: "Languages Offered", value: "15+" },
                { label: "Certification Programs", value: "12" },
                { label: "Self-Paced Learning", value: "100%" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-green-800">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section id="curriculum" className="py-16 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Divine STEM Curriculum
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ten interconnected modules blending ancestral knowledge with modern education.
                Each module builds on the others to create a holistic learning experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CURRICULUM_MODULES.map((mod, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${mod.color}`}>
                      {mod.icon}
                    </div>
                    <h3 className="font-bold text-foreground text-sm">{mod.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{mod.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="py-16 px-4 bg-green-800/5">
          <div className="container max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-10">
              What Makes This Academy Different
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "Sovereign Education",
                  desc: "Not bound to standardized testing or state curriculum mandates. Education designed for sovereignty, not compliance.",
                },
                {
                  icon: <Flame className="w-6 h-6" />,
                  title: "Ancestral + Modern",
                  desc: "Indigenous knowledge systems integrated with STEM, coding, and financial literacy. The past informs the future.",
                },
                {
                  icon: <Users className="w-6 h-6" />,
                  title: "Multi-Generational",
                  desc: "From K-12 homeschool to adult certification programs. Every generation learns together and builds together.",
                },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-800/10 flex items-center justify-center mx-auto mb-4 text-green-800">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 px-4">
          <div className="container max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">Academy Pass</h2>
              <p className="text-muted-foreground">
                Full access to every course, module, and certification program.
              </p>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className={`text-sm ${!annual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <Switch checked={annual} onCheckedChange={setAnnual} />
              <span className={`text-sm ${annual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                Annual
              </span>
              {annual && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  Save ~28%
                </span>
              )}
            </div>

            <Card className="p-8">
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-foreground">
                  ${annual ? Math.round(249 / 12) : 29}
                </span>
                <span className="text-muted-foreground text-lg">/mo</span>
                {annual && (
                  <p className="text-sm text-muted-foreground mt-1">$249/year billed annually</p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  "Complete K-12 homeschool curriculum",
                  "All 10 Divine STEM modules",
                  "15+ language courses",
                  "Financial literacy & business training",
                  "Skilled labor certification programs",
                  "Coding & AI technology modules",
                  "Certificate of completion per module",
                  "Self-paced, progress-based learning",
                  "Community forum access",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg mb-6">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-green-800">Special programs:</span>{" "}
                  Scholarship program available.
                  Already included with Collective Member & Builder plans.
                </p>
              </div>

              <Button
                onClick={handleEnroll}
                disabled={loadingEnroll}
                className="w-full bg-green-800 hover:bg-green-900 text-white"
                size="lg"
              >
                {loadingEnroll ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Enroll Now
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </Card>

            <div className="text-center mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-green-800">100% Academy funded:</span>{" "}
                All Academy Pass revenue goes directly to LuvOnPurpose Outreach Temple and Academy Society, Inc.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-green-800 text-white">
          <div className="container max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-green-100 mb-8">
              Join a community of learners building generational wealth through knowledge,
              skills, and cultural preservation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
                onClick={handleEnroll}
                disabled={loadingEnroll}
              >
                {loadingEnroll ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Get Your Academy Pass
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white/10">
                  Or Join the Collective
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 LuvOnPurpose Outreach Temple and Academy Society, Inc. All rights reserved.</p>
          <p className="mt-1 text-xs">A 508(c)(1)(a) tax-exempt educational institution.</p>
        </div>
      </footer>
    
      <PublicQAAgent agentType="academy_qa" label="Academy Guide" pageContext="User is viewing the Academy Landing page with program overview, curriculum highlights, and enrollment options." />
    </div>
  );
}
