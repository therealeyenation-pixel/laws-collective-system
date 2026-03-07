import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Scale,
  FileText,
  GraduationCap,
  Users,
  Building2,
  DollarSign,
  Shield,
  Briefcase,
  MessageSquare,
  Target,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  BookOpen,
  Award,
  TrendingUp,
  Heart,
  Sparkles,
  Clock,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

// Service Categories
const SERVICE_CATEGORIES = [
  { id: "all", label: "All Services" },
  { id: "legal", label: "Legal & Contracts" },
  { id: "business", label: "Business Development" },
  { id: "education", label: "Education & Training" },
  { id: "financial", label: "Financial Services" },
];

// Services offered
const SERVICES = [
  {
    id: "contract-negotiation",
    title: "Contract Negotiation Agent",
    description: "AI-powered contract analysis and negotiation strategy development. Upload contracts, get plain-language explanations, and develop winning negotiation strategies.",
    icon: Scale,
    category: "legal",
    featured: true,
    pricing: {
      free: "1 contract analysis/month",
      premium: "Unlimited analysis + strategy",
      business: "All features + representation",
    },
    features: [
      "Plain language contract explanations",
      "Risk assessment and identification",
      "Negotiation strategy development",
      "Interactive Q&A about clauses",
      "Counter-offer suggestions",
      "Walk-away point guidance",
    ],
    cta: "/contract-agent",
    ctaLabel: "Try Contract Agent",
  },
  {
    id: "business-formation",
    title: "Business Formation Services",
    description: "Guided business entity formation including LLCs, corporations, trusts, and nonprofits. Complete training and document preparation.",
    icon: Building2,
    category: "business",
    featured: true,
    pricing: {
      free: "Educational content",
      premium: "Guided formation + documents",
      business: "Full service + registered agent",
    },
    features: [
      "Entity type selection guidance",
      "State comparison and selection",
      "Document preparation",
      "EIN application assistance",
      "Operating agreement templates",
      "Compliance calendar setup",
    ],
    cta: "/business-simulator",
    ctaLabel: "Start Formation",
  },
  {
    id: "grant-consulting",
    title: "Grant Writing & Consulting",
    description: "Expert guidance on identifying, applying for, and managing grants for nonprofits and businesses.",
    icon: DollarSign,
    category: "financial",
    featured: true,
    pricing: {
      free: "Grant database access",
      premium: "Application review + feedback",
      business: "Full grant writing service",
    },
    features: [
      "Grant opportunity identification",
      "Application strategy development",
      "Proposal writing assistance",
      "Budget development",
      "Compliance guidance",
      "Post-award management",
    ],
    cta: "/grant-simulator",
    ctaLabel: "Explore Grants",
  },
  {
    id: "academy-courses",
    title: "LuvOnPurpose Academy",
    description: "Comprehensive educational programs for financial literacy, business development, and personal growth.",
    icon: GraduationCap,
    category: "education",
    featured: false,
    pricing: {
      free: "Introductory courses",
      premium: "Full curriculum access",
      business: "Team training + certification",
    },
    features: [
      "Financial literacy courses",
      "Business fundamentals",
      "Leadership development",
      "Technical skills training",
      "Certification programs",
      "Continuing education credits",
    ],
    cta: "/academy",
    ctaLabel: "Browse Courses",
  },
  {
    id: "tax-planning",
    title: "Tax Planning & Strategy",
    description: "Proactive tax planning for individuals and businesses to minimize liability and maximize deductions.",
    icon: FileText,
    category: "financial",
    featured: false,
    pricing: {
      free: "Tax calculator tools",
      premium: "Strategy consultation",
      business: "Full tax planning service",
    },
    features: [
      "Tax liability estimation",
      "Deduction optimization",
      "Entity structure planning",
      "Quarterly planning",
      "Year-end strategies",
      "Multi-state considerations",
    ],
    cta: "/tax-simulator",
    ctaLabel: "Plan Taxes",
  },
  {
    id: "workforce-transition",
    title: "Workforce to Self-Employment",
    description: "Comprehensive program to transition from traditional employment to self-employment and business ownership.",
    icon: TrendingUp,
    category: "business",
    featured: true,
    pricing: {
      free: "Assessment tools",
      premium: "Guided transition program",
      business: "Full coaching + support",
    },
    features: [
      "Readiness assessment",
      "Business model development",
      "Financial planning",
      "Legal structure setup",
      "Client acquisition strategies",
      "Ongoing mentorship",
    ],
    cta: "/contractor-transition",
    ctaLabel: "Start Transition",
  },
  {
    id: "mediation",
    title: "Mediation Services",
    description: "Neutral third-party facilitation for disputes, partnerships, and contract negotiations.",
    icon: Users,
    category: "legal",
    featured: false,
    pricing: {
      free: "Initial consultation",
      premium: "Single session mediation",
      business: "Complex dispute resolution",
    },
    features: [
      "Conflict assessment",
      "Neutral facilitation",
      "Agreement drafting",
      "Follow-up support",
      "Confidential process",
      "Cost-effective resolution",
    ],
    cta: null,
    ctaLabel: "Request Mediation",
  },
  {
    id: "compliance-audit",
    title: "Compliance & Audit Services",
    description: "Ensure your organization meets regulatory requirements and best practices.",
    icon: Shield,
    category: "business",
    featured: false,
    pricing: {
      free: "Self-assessment checklist",
      premium: "Compliance review",
      business: "Full audit + remediation",
    },
    features: [
      "Regulatory compliance review",
      "Policy development",
      "Risk assessment",
      "Documentation audit",
      "Training recommendations",
      "Ongoing monitoring",
    ],
    cta: null,
    ctaLabel: "Request Audit",
  },
];

// Membership tiers
const MEMBERSHIP_TIERS = [
  {
    id: "free",
    name: "Community",
    price: "Free",
    description: "Access to basic tools and resources",
    features: [
      "1 contract analysis per month",
      "Basic educational content",
      "Community forum access",
      "Tax calculator tools",
      "Grant database access",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "premium",
    name: "Premium Member",
    price: "$29/month",
    description: "Full access to all tools and services",
    features: [
      "Unlimited contract analysis",
      "Full negotiation strategy",
      "Complete Academy access",
      "Priority support",
      "Document templates",
      "Consultation discounts",
    ],
    cta: "Upgrade to Premium",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business Member",
    price: "$99/month",
    description: "Everything plus representation services",
    features: [
      "All Premium features",
      "Representation services",
      "Dedicated account manager",
      "Team training access",
      "Custom integrations",
      "White-glove onboarding",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Services() {
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [trademarkSearch, setTrademarkSearch] = useState("");

  const filteredServices = activeCategory === "all" 
    ? SERVICES 
    : SERVICES.filter(s => s.category === activeCategory);

  const featuredServices = SERVICES.filter(s => s.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-green-50/30 dark:to-green-950/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="text-2xl font-bold text-green-700">L.A.W.S.</span>
                <span className="text-sm text-muted-foreground">Services</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/academy">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Academy</span>
              </Link>
              <Link href="/about">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">About</span>
              </Link>
              <Link href="/contact">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Contact</span>
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button variant="outline">Sign In</Button>
                  </a>
                  <a href={getLoginUrl()}>
                    <Button>Get Started</Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-500/30">
            Professional Services
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            The The L.A.W.S. Collective Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Empowering individuals and businesses with professional services in legal support, 
            business development, education, and financial planning.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contract-agent">
              <Button size="lg" className="gap-2">
                <Scale className="w-5 h-5" />
                Try Contract Agent
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Services</h2>
            <p className="text-muted-foreground">Our most popular offerings to help you succeed</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map(service => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {service.cta ? (
                      <Link href={service.cta}>
                        <Button className="w-full gap-2">
                          {service.ctaLabel}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full gap-2" variant="outline">
                        {service.ctaLabel}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Services */}
      <section className="py-16 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">All Services</h2>
            <p className="text-muted-foreground">Browse our complete service catalog</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {SERVICE_CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      {service.featured && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-4">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">KEY FEATURES</p>
                        <ul className="space-y-1">
                          {service.features.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">PRICING</p>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Free:</span> {service.pricing.free}</p>
                          <p><span className="font-medium">Premium:</span> {service.pricing.premium}</p>
                        </div>
                      </div>

                      {service.cta ? (
                        <Link href={service.cta}>
                          <Button className="w-full gap-2" variant="outline">
                            {service.ctaLabel}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Button className="w-full gap-2" variant="outline">
                          {service.ctaLabel}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Bundle Discount */}
      <section className="py-16 px-4">
        <div className="container max-w-7xl mx-auto">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <Badge className="bg-green-600 text-white mb-4">Bundle & Save</Badge>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Service Bundle Discount</h3>
                  <p className="text-muted-foreground mb-4">
                    Combine any 3+ services and receive 15% off. Platform subscribers get an additional 10% discount on all services.
                  </p>
                  
                  {/* Trademark Search */}
                  <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">Check Business Name Availability</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter business name to search trademarks..."
                        className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={trademarkSearch}
                        onChange={(e) => setTrademarkSearch(e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        className="border-green-500 text-green-700 hover:bg-green-50"
                        onClick={() => {
                          if (trademarkSearch.trim()) {
                            window.open(`https://tmsearch.uspto.gov/bin/gate.exe?f=searchss&state=4810:1234.1.1&p_s_PARA1=${encodeURIComponent(trademarkSearch)}&p_s_PARA2=&p_s_PARA1_SRCH=yes&p_s_PARA2_SRCH=yes&p_taession=&p_L=50&p_plural=yes&p_s_ALL=&a_default=search&a_search=Submit+Query`, '_blank');
                          }
                        }}
                      >
                        Search USPTO
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Search the USPTO trademark database before registering your business name.</p>
                  </div>
                </div>
                <div>
                  <Link href="/bundle-builder">
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                      Build Your Bundle
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Membership Plans</h2>
            <p className="text-muted-foreground">Choose the plan that fits your needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {MEMBERSHIP_TIERS.map(tier => (
              <Card 
                key={tier.id} 
                className={`relative ${tier.highlighted ? "border-green-500 shadow-lg" : ""}`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/30">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Need Custom Solutions?</h2>
              <p className="text-muted-foreground mb-6">
                Contact us for enterprise solutions, custom integrations, or specialized consulting services.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button className="gap-2">
                  <Phone className="w-4 h-4" />
                  Schedule a Call
                </Button>
                <Button variant="outline" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-muted/30">
        <div className="container max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">The The L.A.W.S. Collective</h3>
              <p className="text-sm text-muted-foreground">
                Building multi-generational wealth through purpose and community.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contract-agent"><span className="hover:text-foreground cursor-pointer">Contract Agent</span></Link></li>
                <li><Link href="/business-simulator"><span className="hover:text-foreground cursor-pointer">Business Formation</span></Link></li>
                <li><Link href="/grant-simulator"><span className="hover:text-foreground cursor-pointer">Grant Consulting</span></Link></li>
                <li><Link href="/academy"><span className="hover:text-foreground cursor-pointer">Academy</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/training-hub"><span className="hover:text-foreground cursor-pointer">Training Hub</span></Link></li>
                <li><Link href="/careers"><span className="hover:text-foreground cursor-pointer">Careers</span></Link></li>
                <li><Link href="/about"><span className="hover:text-foreground cursor-pointer">About Us</span></Link></li>
                <li><Link href="/contact"><span className="hover:text-foreground cursor-pointer">Contact</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="hover:text-foreground cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-foreground cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-foreground cursor-pointer">Cookie Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} The The The L.A.W.S. Collective, LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
