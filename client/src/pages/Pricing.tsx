import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const membershipCheckout = trpc.stripeCheckout.createMembershipCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to checkout...");
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
        toast.info("Redirecting to checkout...");
        window.open(data.url, "_blank");
      }
      setLoadingTier(null);
    },
    onError: (err) => {
      toast.error(err.message);
      setLoadingTier(null);
    },
  });

  const handleSelectTier = (tierId: string) => {
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
    setLoadingTier(tierId);
    membershipCheckout.mutate({
      tier: tierId as "member" | "builder",
      billingInterval: annual ? "annual" : "monthly",
    });
  };

  const handleAcademyEnroll = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoadingTier("academy");
    academyCheckout.mutate({
      billingInterval: annual ? "annual" : "monthly",
    });
  };

  const tierIcons: Record<string, React.ReactNode> = {
    explorer: <Sparkles className="w-6 h-6" />,
    member: <Users className="w-6 h-6" />,
    builder: <Building2 className="w-6 h-6" />,
    partner: <Crown className="w-6 h-6" />,
  };

  const tiers = [
    {
      id: "explorer",
      name: "Explorer",
      description: "Experience the L.A.W.S. vision before committing",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Full interactive demo simulator (no save)",
        "L.A.W.S. framework overview",
        "Browse open career positions",
        "Community newsletter",
      ],
      cta: "Start Free",
      highlighted: false,
      isCustom: false,
    },
    {
      id: "member",
      name: "Member",
      description: "Learn, validate, and build your business concept",
      monthlyPrice: 49,
      annualPrice: 399,
      features: [
        "All business simulators (full access + save)",
        "Financial literacy & tax training",
        "Business plan development tools",
        "Academy courses included",
        "Certificate of completion",
        "Community access",
      ],
      cta: "Join as Member",
      highlighted: true,
      isCustom: false,
    },
    {
      id: "builder",
      name: "Builder",
      description: "Form your business and establish your House",
      monthlyPrice: 149,
      annualPrice: 1299,
      features: [
        "Everything in Member",
        "Business Formation wizard (entity + EIN + compliance)",
        "House establishment (customized management structure)",
        "Operational dashboard with all House tools",
        "Document vault (unlimited)",
        "Grant writing tools & funding resources",
        "Mentorship access",
      ],
      cta: "Join as Builder",
      highlighted: false,
      isCustom: false,
    },
    {
      id: "partner",
      name: "Collective Partner",
      description: "Deep commitment to building the L.A.W.S. ecosystem",
      monthlyPrice: null,
      annualPrice: null,
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
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-wider mb-3">
            Membership Plans
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your Path
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Whether you're exploring, learning, or building — there's a place for you
            in the L.A.W.S. Collective.
          </p>
        </div>

        <Tabs defaultValue="membership" className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="academy">Academy</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          {/* ─── Membership Tab ─── */}
          <TabsContent value="membership">
            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <span className={`text-sm ${!annual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <Switch checked={annual} onCheckedChange={setAnnual} />
              <span className={`text-sm ${annual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                Annual
              </span>
              {annual && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  Save up to 32%
                </span>
              )}
            </div>

            {/* Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {tiers.map((tier) => {
                const price = tier.isCustom
                  ? null
                  : annual
                  ? tier.annualPrice
                  : tier.monthlyPrice;
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
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-800">{tierIcons[tier.id]}</span>
                        <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>

                    <div className="mb-6">
                      {tier.isCustom ? (
                        <div className="text-3xl font-bold text-foreground">Custom</div>
                      ) : price === 0 ? (
                        <div className="text-3xl font-bold text-foreground">Free</div>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold text-foreground">
                            ${annual ? Math.round((price || 0) / 12) : price}
                          </span>
                          <span className="text-muted-foreground text-sm">/mo</span>
                          {annual && price !== 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ${price}/year billed annually
                            </p>
                          )}
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

            {/* Revenue allocation note */}
            <div className="max-w-2xl mx-auto text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-green-800">Transparent allocation:</span>{" "}
                30% of every membership fee supports the LuvOnPurpose Academy & Outreach (508(c)(1)(a)) education programs.
                70% supports L.A.W.S. Collective operations and member services.
              </p>
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
                  Academy Pass
                </h2>
                <p className="text-muted-foreground">
                  Standalone access to the full Academy curriculum. Already included with
                  Collective Member and Builder plans.
                </p>
              </div>

              {/* Billing toggle */}
              <div className="flex items-center justify-center gap-3 mb-8">
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

              <div className="max-w-lg mx-auto rounded-xl border border-border p-8 bg-background">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    ${annual ? Math.round(249 / 12) : 29}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                  {annual && (
                    <p className="text-xs text-muted-foreground mt-1">
                      $249/year billed annually
                    </p>
                  )}
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
                  onClick={handleAcademyEnroll}
                  disabled={loadingTier === "academy"}
                  className="w-full bg-green-800 hover:bg-green-900 text-white"
                >
                  {loadingTier === "academy" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Enroll Now
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  Already a Collective Member or Builder?{" "}
                  <Link href="/dashboard" className="text-green-800 hover:underline">
                    Academy access is included
                  </Link>
                </p>
              </div>

              {/* 100% to Academy note */}
              <div className="max-w-lg mx-auto text-center mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-green-800">100% Academy funded:</span>{" "}
                  All Academy Pass revenue goes directly to LuvOnPurpose Outreach Temple and Academy Society, Inc.
                  (508(c)(1)(a)) to support education programs.
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
                Expert services available individually or bundled with your membership
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
                    Combine any 3+ services and receive 15% off. Collective members get an additional 10% discount on all services.
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
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "Can I switch plans at any time?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
              },
              {
                q: "Is Academy access included with Collective membership?",
                a: "Yes. Member and Builder plans include full Academy access. You only need a separate Academy Pass if you want education without the business tools.",
              },
              {
                q: "How does the revenue allocation work?",
                a: "30% of every Collective membership fee supports the LuvOnPurpose Academy (508(c)(1)(a)) education programs. 70% supports Collective operations. Academy Pass revenue goes 100% to the Academy entity.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards through Stripe. ACH and invoicing available for Collective Partner tier.",
              },
              {
                q: "What is the Collective Partner tier?",
                a: "The Partner tier is application-based for those deeply committed to building the L.A.W.S. ecosystem. It includes contractor transition pathways, board eligibility, and profit sharing after 2 years.",
              },
            ].map((faq, idx) => (
              <Card key={idx} className="p-6">
                <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center mt-16 pb-8">
          <p className="text-muted-foreground mb-4">
            Not sure which plan is right for you?
          </p>
          <Link href="/#demo-simulator">
            <Button variant="outline" className="gap-2">
              Try the Free Demo First
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border mt-8 py-8">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 The L.A.W.S. Collective. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
