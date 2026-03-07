import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Sparkles,
  Building2,
  Rocket,
  FileText,
  Gavel,
  DollarSign,
  Users,
  Briefcase,
  ArrowRight,
  Star,
  BookOpen,
  GraduationCap,
  Video,
} from "lucide-react";
import { Link } from "wouter";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ReactNode;
  cta: string;
}

interface ServicePackage {
  name: string;
  price: string;
  description: string;
  deliverables: string[];
  turnaround: string;
  icon: React.ReactNode;
  entity: string;
  entityType: "product" | "service" | "training";
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const platformTiers: PricingTier[] = [
    {
      name: "Starter",
      price: billingCycle === "annual" ? "$49" : "$59",
      period: "/month",
      description: "Perfect for individuals and small families starting their wealth journey",
      icon: <Sparkles className="w-6 h-6" />,
      cta: "Start Free Trial",
      features: [
        "1 Business Entity",
        "Basic Financial Dashboard",
        "Document Vault (5GB)",
        "Grant Database Access",
        "Email Support",
        "Basic Reporting",
        "Mobile App Access",
      ],
    },
    {
      name: "Professional",
      price: billingCycle === "annual" ? "$149" : "$179",
      period: "/month",
      description: "For growing families and organizations building multiple revenue streams",
      icon: <Building2 className="w-6 h-6" />,
      highlighted: true,
      cta: "Start Free Trial",
      features: [
        "Up to 5 Business Entities",
        "Advanced Financial Automation",
        "Document Vault (50GB)",
        "Grant Simulator & Writer",
        "Proposal Generator",
        "Contract Management",
        "Tax Preparation Tools",
        "Priority Support",
        "Custom Reporting",
        "API Access",
      ],
    },
    {
      name: "Enterprise",
      price: billingCycle === "annual" ? "$399" : "$479",
      period: "/month",
      description: "Complete solution for multi-generational wealth systems and organizations",
      icon: <Rocket className="w-6 h-6" />,
      cta: "Contact Sales",
      features: [
        "Unlimited Business Entities",
        "Full Financial Automation Suite",
        "Unlimited Document Storage",
        "All Simulators & Generators",
        "White-label Options",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Advanced Analytics",
        "Training & Onboarding",
        "SLA Guarantee",
        "Multi-user Access (25 seats)",
      ],
    },
  ];

  const servicePackages: ServicePackage[] = [
    {
      name: "Grant Writing Package",
      price: "$3,500 - $15,000",
      description: "Professional grant proposal development with research, writing, and submission support",
      icon: <DollarSign className="w-6 h-6" />,
      turnaround: "2-4 weeks",
      entity: "LuvOnPurpose Autonomous Wealth System LLC",
      entityType: "service",
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
      entityType: "service",
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
      description: "Professional contract creation, review, negotiation support, and ongoing management services",
      icon: <Gavel className="w-6 h-6" />,
      turnaround: "5-14 days",
      entity: "LuvOnPurpose Autonomous Wealth System LLC",
      entityType: "service",
      deliverables: [
        "Contract drafting or comprehensive review",
        "Terms & conditions analysis with recommendations",
        "Risk assessment & mitigation report",
        "Negotiation strategy & support",
        "Amendment & modification preparation",
        "Compliance tracking & monitoring setup",
        "Renewal management & optimization",
        "Legal coordination support",
      ],
    },
    {
      name: "Business Plan Development",
      price: "$2,500 - $10,000",
      description: "Comprehensive business planning for startups, expansions, and investor presentations",
      icon: <Briefcase className="w-6 h-6" />,
      turnaround: "2-3 weeks",
      entity: "LuvOnPurpose Autonomous Wealth System LLC",
      entityType: "service",
      deliverables: [
        "Executive summary",
        "Market analysis & research",
        "Competitive landscape review",
        "Products/services description",
        "Marketing & sales strategy",
        "Operations plan",
        "Financial projections (3-5 years)",
        "Funding requirements & use of funds",
      ],
    },
    {
      name: "RFP Response Service",
      price: "$7,500 - $35,000",
      description: "End-to-end RFP response management for government and commercial opportunities",
      icon: <Users className="w-6 h-6" />,
      turnaround: "Based on deadline",
      entity: "LuvOnPurpose Autonomous Wealth System LLC",
      entityType: "service",
      deliverables: [
        "Bid/no-bid analysis",
        "Teaming partner identification",
        "Full proposal development",
        "Oral presentation preparation",
        "BAFO (Best and Final Offer) support",
        "Debriefing analysis",
        "Win/loss review",
      ],
    },
    {
      name: "Financial Literacy Course",
      price: "$997 - $2,997",
      description: "Comprehensive financial education for individuals and families",
      icon: <BookOpen className="w-6 h-6" />,
      turnaround: "Self-paced",
      entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
      entityType: "training",
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
      entityType: "training",
      deliverables: [
        "Entity selection guidance",
        "Formation document templates",
        "Tax structure optimization",
        "Compliance checklist",
        "30-day follow-up support",
        "Resource library access",
      ],
    },
    {
      name: "Media Production Training",
      price: "$1,997 - $5,997",
      description: "Professional media and content creation skills development",
      icon: <Video className="w-6 h-6" />,
      turnaround: "4-6 weeks",
      entity: "Real-Eye-Nation LLC",
      entityType: "training",
      deliverables: [
        "Video production fundamentals",
        "Audio recording & editing",
        "Social media content strategy",
        "Equipment recommendations",
        "Portfolio project guidance",
        "Industry networking intro",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xl font-bold text-primary cursor-pointer">The The L.A.W.S. Collective</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/services">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Services</span>
              </Link>
              <Link href="/pricing">
                <span className="text-sm text-foreground font-medium cursor-pointer">Pricing</span>
              </Link>
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Star className="w-3 h-3 mr-1" />
            14-Day Free Trial on All Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include core features to help you build and manage generational wealth.
          </p>
        </div>

        <Tabs defaultValue="platform" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="platform">Platform Plans</TabsTrigger>
            <TabsTrigger value="services">Individual Services</TabsTrigger>
          </TabsList>

          {/* Platform Plans */}
          <TabsContent value="platform">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm ${billingCycle === "monthly" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  billingCycle === "annual" ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    billingCycle === "annual" ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === "annual" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                Annual
                <Badge variant="secondary" className="ml-2 text-xs">Save 20%</Badge>
              </span>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {platformTiers.map((tier, idx) => (
                <Card
                  key={idx}
                  className={`p-6 relative ${
                    tier.highlighted
                      ? "border-primary border-2 shadow-lg scale-105"
                      : "border-border"
                  }`}
                >
                  {tier.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {tier.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary mb-4">
                    Provided by: The The The L.A.W.S. Collective, LLC
                  </Badge>
                  <Button
                    className="w-full mb-6"
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            {/* Enterprise CTA */}
            <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Need a Custom Solution?
                  </h3>
                  <p className="text-muted-foreground">
                    We offer custom implementations for large organizations, franchises, and special requirements.
                  </p>
                </div>
                <Button size="lg" className="gap-2">
                  Contact Sales <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Individual Services */}
          <TabsContent value="services">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Professional Services
              </h2>
              <p className="text-muted-foreground">
                Expert services available individually or bundled with your platform subscription
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {servicePackages.map((service, idx) => (
                <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{service.name}</h3>
                      <p className="text-sm text-primary font-medium">{service.price}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Turnaround: {service.turnaround}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      {service.entity}
                    </Badge>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-medium text-foreground mb-2">Deliverables:</p>
                    <ul className="space-y-1">
                      {service.deliverables.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                      {service.deliverables.length > 4 && (
                        <li className="text-xs text-primary">
                          +{service.deliverables.length - 4} more deliverables
                        </li>
                      )}
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Request Quote
                  </Button>
                </Card>
              ))}
            </div>

            {/* Bundle Offer */}
            <Card className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <Badge className="mb-2 bg-green-600">Bundle & Save</Badge>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Service Bundle Discount
                  </h3>
                  <p className="text-muted-foreground">
                    Combine any 3+ services and receive 15% off. Platform subscribers get an additional 10% discount on all services.
                  </p>
                </div>
                <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
                  Build Your Bundle <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* FAQ Section */}
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
                q: "Is there a free trial?",
                a: "Yes, all platform plans include a 14-day free trial with full access to features. No credit card required to start.",
              },
              {
                q: "Do services require a platform subscription?",
                a: "No, our professional services are available to anyone. However, platform subscribers receive a 10% discount on all services.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, ACH bank transfers, and can arrange invoicing for Enterprise customers.",
              },
            ].map((faq, idx) => (
              <Card key={idx} className="p-6">
                <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 The The L.A.W.S. Collective. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
