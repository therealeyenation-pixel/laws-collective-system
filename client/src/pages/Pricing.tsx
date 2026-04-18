import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Check,
  Sparkles,
  Building2,
  Users,
  Crown,
  ArrowRight,
  GraduationCap,
  Loader2,
  FileText,
  Gavel,
  DollarSign,
  Briefcase,
  BookOpen,
  Video,
  Heart,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Link } from "wouter";

/* ─────────────────────────────────────────────────────────
   CONTRIBUTION-BASED PRICING MODEL
   
   Year 1  → Annual Membership Contribution (full commitment)
   Year 2+ → Monthly Access Contribution OR Annual Access Contribution (discounted)
   
   Language: "contribution" — never "subscription", "payment", or "fee"
   No refunds: framed as supporting the collective mission
   ───────────────────────────────────────────────────────── */

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const membershipCheckout = trpc.stripeCheckout.createMembershipCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure contribution portal...");
        window.open(data.url, "_blank");
      }
      setLoadingTier(null);
    },
    onError: (err) => {
      toast.error(err.message);
      setLoadingTier(null);
    },
  });

  const academyCheckout = trpc.stripeCheckout.createAcademyCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure contribution portal...");
        window.open(data.url, "_blank");
      }
      setLoadingTier(null);
    },
    onError: (err) => {
      toast.error(err.message);
      setLoadingTier(null);
    },
  });

  const handleSelectTier = (tierId: string, isRenewal: boolean = false) => {
    if (tierId === "explorer") {
      window.location.href = "/getting-started";
      return;
    }
    if (tierId === "partner") {
      toast.info("Collective Partner applications are reviewed individually. Contact us to apply.");
      return;
    }
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoadingTier(tierId + (isRenewal ? "-renewal" : ""));
    membershipCheckout.mutate({
      tier: tierId as "member" | "builder",
      billingInterval: isRenewal ? "monthly" : "annual",
    });
  };

  const handleAcademyEnroll = (isRenewal: boolean = false) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoadingTier("academy" + (isRenewal ? "-renewal" : ""));
    academyCheckout.mutate({
      billingInterval: isRenewal ? "monthly" : "annual",
    });
  };

  const tierIcons: Record<string, React.ReactNode> = {
    explorer: <Sparkles className="w-6 h-6" />,
    member: <Users className="w-6 h-6" />,
    builder: <Building2 className="w-6 h-6" />,
    partner: <Crown className="w-6 h-6" />,
  };

  /* ─── YEAR 1: Annual Membership Contribution ─── */
  const year1Tiers = [
    {
      id: "explorer",
      name: "Explorer",
      subtitle: "Experience the Vision",
      description: "Explore the L.A.W.S. framework and discover what's possible before making a commitment",
      annualContribution: 0,
      features: [
        "Full interactive demo simulator (no save)",
        "L.A.W.S. framework overview",
        "Browse open career positions",
        "Community newsletter",
      ],
      cta: "Begin Exploring",
      highlighted: false,
      isCustom: false,
    },
    {
      id: "member",
      name: "Community Member",
      subtitle: "Learn & Build",
      description: "Full access to education, simulators, and community tools to build your sovereign foundation",
      annualContribution: 399,
      features: [
        "All business simulators (full access + save)",
        "Financial literacy & tax training",
        "Business plan development tools",
        "Complete Academy curriculum included",
        "Certificate of completion",
        "Community access & networking",
      ],
      cta: "Contribute & Join",
      highlighted: true,
      isCustom: false,
    },
    {
      id: "builder",
      name: "Builder",
      subtitle: "Form & Establish",
      description: "Everything needed to form your business, establish your House, and access the full operational suite",
      annualContribution: 1299,
      features: [
        "Everything in Community Member",
        "Business Formation wizard (entity + EIN + compliance)",
        "House establishment (customized management structure)",
        "Operational dashboard with all House tools",
        "Document vault (unlimited)",
        "Grant writing tools & funding resources",
        "Mentorship access",
      ],
      cta: "Contribute & Build",
      highlighted: false,
      isCustom: false,
    },
    {
      id: "partner",
      name: "Collective Partner",
      subtitle: "Lead & Govern",
      description: "A deep commitment to co-building the L.A.W.S. ecosystem with governance rights and shared prosperity",
      annualContribution: null,
      features: [
        "Everything in Builder",
        "Contractor transition pathway (after 2 years)",
        "Board Member eligibility (Founding Members)",
        "Profit share participation",
        "Full L.A.W.S. ecosystem integration",
        "Dedicated success manager",
        "Governance voting rights",
      ],
      cta: "Apply to Partner",
      highlighted: false,
      isCustom: true,
    },
  ];

  /* ─── YEAR 2+: Access Contribution (Monthly or Annual) ─── */
  const renewalTiers = [
    {
      id: "member",
      name: "Community Member",
      monthlyAccess: 49,
      annualAccess: 349,
      annualSavings: "Save $239/year (41%)",
    },
    {
      id: "builder",
      name: "Builder",
      monthlyAccess: 149,
      annualAccess: 1099,
      annualSavings: "Save $689/year (38%)",
    },
  ];

  const servicePackages = [
    {
      name: "Grant Writing Package",
      price: "$3,500 - $15,000",
      description: "Professional grant proposal development with research, writing, and submission support",
      icon: <DollarSign className="w-6 h-6" />,
      turnaround: "2-4 weeks",
      entity: "LuvOnPurpose Autonomous Wealth System LLC",
      deliverables: [
        "Grant opportunity research & matching",
        "Complete proposal narrative",
        "Budget development & justification",
        "Supporting documentation preparation",
        "Review & revision cycles (up to 3)",
        "Submission assistance",
        "Post-submission follow-up guidance",
      ],
    },
    {
      name: "Proposal Development",
      price: "$5,000 - $25,000",
      description: "Commercial and government proposal creation for contracts and major opportunities",
      icon: <FileText className="w-6 h-6" />,
      turnaround: "1-3 weeks",
      entity: "LuvOnPurpose Autonomous Wealth System LLC",
      deliverables: [
        "RFP/RFQ analysis & compliance matrix",
        "Technical approach development",
        "Management approach narrative",
        "Past performance documentation",
        "Pricing strategy & cost proposal",
        "Executive summary & cover letter",
        "Graphics & visual aids",
        "Final formatting & submission",
      ],
    },
    {
      name: "Contract Management",
      price: "$5,000 - $25,000",
      description: "Professional contract creation, review, negotiation support, and ongoing management",
      icon: <Gavel className="w-6 h-6" />,
      turnaround: "5-14 days",
      entity: "LuvOnPurpose Autonomous Wealth System LLC",
      deliverables: [
        "Contract drafting or comprehensive review",
        "Terms & conditions analysis",
        "Risk assessment & mitigation report",
        "Negotiation strategy & support",
        "Amendment & modification preparation",
        "Compliance tracking & monitoring setup",
      ],
    },
    {
      name: "Business Plan Development",
      price: "$2,500 - $10,000",
      description: "Comprehensive business planning for startups, expansions, and investor presentations",
      icon: <Briefcase className="w-6 h-6" />,
      turnaround: "2-3 weeks",
      entity: "LuvOnPurpose Autonomous Wealth System LLC",
      deliverables: [
        "Executive summary",
        "Market analysis & research",
        "Competitive landscape review",
        "Financial projections (3-5 years)",
        "Marketing & sales strategy",
        "Funding requirements & use of funds",
      ],
    },
    {
      name: "Financial Literacy Course",
      price: "$997 - $2,997",
      description: "Comprehensive financial education for individuals and families",
      icon: <BookOpen className="w-6 h-6" />,
      turnaround: "Self-paced",
      entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
      deliverables: [
        "12-module video curriculum",
        "Workbooks & exercises",
        "Live Q&A sessions",
        "Certificate of completion",
        "1-year access to materials",
        "Community forum access",
      ],
    },
    {
      name: "Business Formation Workshop",
      price: "$1,497 - $4,997",
      description: "Hands-on training for starting and structuring businesses",
      icon: <GraduationCap className="w-6 h-6" />,
      turnaround: "2-day intensive",
      entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
      deliverables: [
        "Entity selection guidance",
        "Formation document templates",
        "Tax structure optimization",
        "Compliance checklist",
        "30-day follow-up support",
      ],
    },
    {
      name: "Media Production Training",
      price: "$1,997 - $5,997",
      description: "Professional media and content creation skills development",
      icon: <Video className="w-6 h-6" />,
      turnaround: "4-6 weeks",
      entity: "Real-Eye-Nation LLC",
      deliverables: [
        "Video production fundamentals",
        "Audio recording & editing",
        "Social media content strategy",
        "Equipment recommendations",
        "Portfolio project guidance",
      ],
    },
  ];

  const faqs = [
    {
      q: "Why is this called a 'contribution' instead of a subscription?",
      a: "The L.A.W.S. Collective operates under a 508(c)(1)(A) organizational structure. Your contribution supports the collective mission of building multi-generational wealth, education, and sovereignty for our community. Access to the platform is granted as a benefit of your contribution — not as a transactional purchase. This framing reflects our values: every dollar strengthens the whole.",
    },
    {
      q: "Why is Year 1 an annual commitment?",
      a: "Year 1 is designed as a full Annual Membership Contribution because building a sovereign foundation takes commitment. The first year provides access to the complete system — Academy, simulators, business tools, and community — giving you the time and resources to fully engage with the L.A.W.S. framework. After your first year, you can choose monthly or annual access contributions.",
    },
    {
      q: "What is the no-refund policy?",
      a: "All contributions are non-refundable. Your contribution supports the collective mission — education programs, community infrastructure, and sovereign system development. Access to the platform is granted whether or not it is actively used. This policy ensures the sustainability of our programs and the community that depends on them.",
    },
    {
      q: "Is Academy access included with Collective membership?",
      a: "Yes. Community Member and Builder contributions include full Academy access. You only need a separate Academy Contribution if you want education access without the business and community tools.",
    },
    {
      q: "How is my contribution allocated?",
      a: "30% of every Collective membership contribution supports the LuvOnPurpose Academy & Outreach (508(c)(1)(a)) education programs. 70% supports L.A.W.S. Collective operations, infrastructure, and member services. Academy-only contributions go 100% to the Academy entity.",
    },
    {
      q: "Can I upgrade my contribution level?",
      a: "Yes. You can upgrade from Community Member to Builder at any time. The difference in contribution is prorated for the remainder of your current period. Downgrades take effect at the start of your next contribution period.",
    },
    {
      q: "What is the Collective Partner tier?",
      a: "The Partner tier is application-based for those deeply committed to co-building the L.A.W.S. ecosystem. It includes contractor transition pathways, board eligibility, profit sharing, and governance voting rights. Partner contributions are structured individually based on the scope of engagement.",
    },
    {
      q: "What methods of contribution are accepted?",
      a: "We accept all major credit and debit cards through our secure portal. ACH transfers and custom invoicing are available for Collective Partner tier contributions.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-lg text-foreground">L.A.W.S. Collective</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/academy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Academy
            </Link>
            <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Careers
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm" variant="outline">Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-800/10 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Contribution-Based Membership
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Invest in the Collective Mission
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Your contribution builds multi-generational wealth, education, and sovereignty
            for the entire community. Access is granted as a benefit of your commitment.
          </p>
        </div>

        {/* Contribution Philosophy Banner */}
        <div className="max-w-3xl mx-auto mb-12 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800/40">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-green-800 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800 mb-1">Our Contribution Model</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every contribution directly supports the L.A.W.S. Collective mission — 30% funds education
                through our 508(c)(1)(A) Academy, and 70% sustains community operations and member services.
                Contributions are non-refundable because they power the programs and infrastructure our
                community depends on. Access is granted regardless of usage.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="year1" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-10">
            <TabsTrigger value="year1">Year 1</TabsTrigger>
            <TabsTrigger value="renewal">Year 2+</TabsTrigger>
            <TabsTrigger value="academy">Academy</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          {/* ─── YEAR 1: Annual Membership Contribution ─── */}
          <TabsContent value="year1">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-green-800 text-white">Year 1 — Annual Membership Contribution</Badge>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Begin Your Sovereign Journey
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Your first year is a full annual commitment — the foundation for building
                generational wealth and community. One contribution, full access, all year.
              </p>
            </div>

            {/* Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {year1Tiers.map((tier) => {
                const isLoading = loadingTier === tier.id;

                return (
                  <div
                    key={tier.id}
                    className={`relative flex flex-col rounded-xl border p-6 ${
                      tier.highlighted
                        ? "border-green-800 bg-green-800/[0.02] ring-1 ring-green-800/20"
                        : "border-border bg-background"
                    }`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-800 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-800">{tierIcons[tier.id]}</span>
                        <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                      </div>
                      <p className="text-xs font-medium text-green-800 mb-1">{tier.subtitle}</p>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>

                    <div className="mb-6">
                      {tier.isCustom ? (
                        <div>
                          <div className="text-3xl font-bold text-foreground">By Application</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Structured individually
                          </p>
                        </div>
                      ) : tier.annualContribution === 0 ? (
                        <div>
                          <div className="text-3xl font-bold text-foreground">Free</div>
                          <p className="text-xs text-muted-foreground mt-1">No contribution required</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold text-foreground">
                            ${tier.annualContribution}
                          </span>
                          <span className="text-muted-foreground text-sm">/year</span>
                          <p className="text-xs text-muted-foreground mt-1">
                            Annual Membership Contribution
                          </p>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2.5 mb-6 flex-1">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSelectTier(tier.id)}
                      disabled={isLoading}
                      variant={tier.highlighted ? "default" : "outline"}
                      className={`w-full ${
                        tier.highlighted ? "bg-green-800 hover:bg-green-900 text-white" : ""
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {tier.cta}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* No-refund & allocation note */}
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-green-800">Transparent allocation:</span>{" "}
                  30% of every membership contribution supports the LuvOnPurpose Academy & Outreach (508(c)(1)(a)) education programs.
                  70% supports L.A.W.S. Collective operations and member services.
                </p>
              </div>
              <div className="text-center p-3 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/10">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-amber-800 dark:text-amber-500">Contribution Policy:</span>{" "}
                  All contributions are non-refundable. Your contribution supports the collective mission —
                  education, infrastructure, and community development. Access is granted as a benefit of your
                  contribution, whether or not it is actively used.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ─── YEAR 2+: Access Contribution ─── */}
          <TabsContent value="renewal">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-emerald-700 text-white">Year 2+ — Access Contribution</Badge>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Continue Your Journey
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                After your first year, maintain access with a Monthly or Annual Access Contribution.
                Choose the rhythm that works for your household.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {renewalTiers.map((tier) => (
                <Card key={tier.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-green-800">{tierIcons[tier.id]}</span>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                        <p className="text-xs text-muted-foreground">Ongoing Access Contribution</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Monthly option */}
                      <div className="flex-1 border border-border rounded-lg p-4 text-center min-w-[180px]">
                        <p className="text-xs text-muted-foreground mb-1">Monthly Access</p>
                        <p className="text-2xl font-bold text-foreground">${tier.monthlyAccess}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3"
                          disabled={loadingTier === tier.id + "-renewal"}
                          onClick={() => handleSelectTier(tier.id, true)}
                        >
                          {loadingTier === tier.id + "-renewal" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Choose Monthly"
                          )}
                        </Button>
                      </div>

                      {/* Annual option */}
                      <div className="flex-1 border border-green-800/30 bg-green-800/[0.02] rounded-lg p-4 text-center min-w-[180px] relative">
                        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-800 text-white text-[10px]">
                          Best Value
                        </Badge>
                        <p className="text-xs text-muted-foreground mb-1">Annual Access</p>
                        <p className="text-2xl font-bold text-foreground">${tier.annualAccess}<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
                        <p className="text-xs text-green-800 font-medium mt-0.5">{tier.annualSavings}</p>
                        <Button
                          size="sm"
                          className="w-full mt-2 bg-green-800 hover:bg-green-900 text-white"
                          disabled={loadingTier === tier.id}
                          onClick={() => handleSelectTier(tier.id)}
                        >
                          {loadingTier === tier.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Choose Annual"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Partner renewal note */}
              <Card className="p-6 border-green-800/20 bg-green-800/[0.01]">
                <div className="flex items-center gap-3">
                  <span className="text-green-800"><Crown className="w-6 h-6" /></span>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Collective Partner</h3>
                    <p className="text-sm text-muted-foreground">
                      Partner contributions are structured individually based on your engagement scope.
                      Contact your dedicated success manager for renewal details.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Renewal policy note */}
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-green-800">Renewal note:</span>{" "}
                  Year 2+ Access Contributions are available only to members who have completed their
                  Year 1 Annual Membership Contribution. All contributions remain non-refundable and
                  support the collective mission.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ─── Academy Tab ─── */}
          <TabsContent value="academy">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <GraduationCap className="w-6 h-6 text-green-800" />
                  <p className="text-sm font-semibold text-green-800 uppercase tracking-wider">
                    LuvOnPurpose Academy & Outreach
                  </p>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  Academy Contribution
                </h2>
                <p className="text-muted-foreground">
                  Standalone access to the full Academy curriculum. Already included with
                  Community Member and Builder contributions.
                </p>
              </div>

              {/* Year 1 Academy */}
              <div className="max-w-lg mx-auto rounded-xl border border-border p-8 bg-background mb-6">
                <Badge className="mb-4 bg-green-800 text-white">Year 1 — Annual Academy Contribution</Badge>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-foreground">$249</span>
                  <span className="text-muted-foreground">/year</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Annual Academy Contribution — full year of access
                  </p>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {[
                    "Complete K-12 homeschool curriculum",
                    "Financial literacy courses",
                    "Business simulators",
                    "Coding & AI technology modules",
                    "Skilled labor certification programs",
                    "Certificate of completion",
                    "Self-paced, progress-based learning",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 mb-6 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-xs font-semibold text-green-800">Special Programs:</p>
                  <p className="text-xs text-muted-foreground">
                    Scholarship program available for community members.
                  </p>
                </div>

                <Button
                  onClick={() => handleAcademyEnroll(false)}
                  disabled={loadingTier === "academy"}
                  className="w-full bg-green-800 hover:bg-green-900 text-white"
                >
                  {loadingTier === "academy" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Contribute & Enroll
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  Already a Community Member or Builder?{" "}
                  <Link href="/dashboard" className="text-green-800 hover:underline">
                    Academy access is included
                  </Link>
                </p>
              </div>

              {/* Year 2+ Academy renewal */}
              <div className="max-w-lg mx-auto rounded-xl border border-dashed border-border p-6 bg-background/50">
                <p className="text-xs font-semibold text-green-800 mb-3">Year 2+ Academy Access Contribution</p>
                <div className="flex gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Monthly</p>
                    <p className="text-xl font-bold text-foreground">$29<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Annual</p>
                    <p className="text-xl font-bold text-foreground">$199<span className="text-xs font-normal text-muted-foreground">/yr</span></p>
                    <p className="text-[10px] text-green-800">Save $149 (43%)</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-3">
                  Available after completing Year 1 Annual Academy Contribution
                </p>
              </div>

              {/* 100% to Academy note */}
              <div className="max-w-lg mx-auto text-center mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-green-800">100% Academy funded:</span>{" "}
                  All Academy contributions go directly to LuvOnPurpose Outreach Temple and Academy Society, Inc.
                  (508(c)(1)(a)) to support education programs. Contributions are non-refundable.
                </p>
              </div>

              <div className="text-center mt-8">
                <Link href="/academy">
                  <Button variant="outline" className="gap-2">
                    Explore Academy Curriculum
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          {/* ─── Services Tab ─── */}
          <TabsContent value="services">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Professional Services
              </h2>
              <p className="text-muted-foreground">
                Expert services available individually or bundled with your membership contribution
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {servicePackages.map((service, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-800/10 rounded-lg text-green-800">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{service.name}</h3>
                      <p className="text-sm text-green-800 font-medium">{service.price}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {service.turnaround}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-green-800/30 text-green-800">
                      {service.entity}
                    </Badge>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-medium text-foreground mb-2">Deliverables:</p>
                    <ul className="space-y-1">
                      {service.deliverables.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="w-3 h-3 text-green-700 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                      {service.deliverables.length > 4 && (
                        <li className="text-xs text-green-800">
                          +{service.deliverables.length - 4} more deliverables
                        </li>
                      )}
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => toast.info("Service request form coming soon.")}>
                    Request Quote
                  </Button>
                </Card>
              ))}
            </div>

            {/* Bundle Offer */}
            <Card className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <Badge className="mb-2 bg-green-800">Bundle & Save</Badge>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Service Bundle Discount
                  </h3>
                  <p className="text-muted-foreground">
                    Combine any 3+ services and receive 15% off. Collective members receive an additional 10% discount on all services.
                  </p>
                </div>
                <Button size="lg" className="gap-2 bg-green-800 hover:bg-green-900 text-white" onClick={() => toast.info("Bundle builder coming soon.")}>
                  Build Your Bundle <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-muted-foreground mb-8 text-sm">
            Understanding the contribution model
          </p>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-4 h-4 text-green-800 mt-0.5 flex-shrink-0" />
                    <span className="font-semibold text-foreground text-sm">{faq.q}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 ml-2 transition-transform ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-sm text-muted-foreground pl-7 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center mt-16 pb-8">
          <p className="text-muted-foreground mb-4">
            Not sure which contribution level is right for you?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/#demo-simulator">
              <Button variant="outline" className="gap-2">
                Try the Free Demo First
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/getting-started">
              <Button variant="outline" className="gap-2">
                Start as Explorer (Free)
                <Sparkles className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-8 py-8">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 The L.A.W.S. Collective. All rights reserved.</p>
          <p className="mt-1 text-xs">
            A 508(c)(1)(A) organization. All contributions support the collective mission.
          </p>
        </div>
      </footer>
    </div>
  );
}
