import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Search,
  Building2,
  FileText,
  DollarSign,
  Settings,
  TrendingUp,
  Crown,
  ArrowRight,
  CheckCircle,
  Target,
  Users,
  Shield,
  Zap,
  BookOpen,
  BarChart3,
  FileCheck,
  Briefcase,
  Play,
  ChevronRight,
  Home,
  Lock,
  Unlock,
  Coins,
  Wallet,
  Flame,
  Gift,
  Sparkles,
  Heart,
  Scale,
} from "lucide-react";
import { Link } from "wouter";

// Business lifecycle stages
const lifecycleStages = [
  {
    id: "conception",
    name: "Conception",
    icon: Lightbulb,
    color: "bg-yellow-500",
    description: "Idea generation and initial concept development",
    tools: ["Business Simulator", "Idea Validation"],
    duration: "1-2 weeks",
  },
  {
    id: "validation",
    name: "Validation",
    icon: Search,
    color: "bg-orange-500",
    description: "Market research, SWOT analysis, and feasibility study",
    tools: ["SWOT Analysis", "Trademark Search", "Market Research"],
    duration: "2-4 weeks",
  },
  {
    id: "formation",
    name: "Formation",
    icon: Building2,
    color: "bg-red-500",
    description: "Legal entity creation, EIN application, and compliance setup",
    tools: ["Entity Formation Wizard", "State Filing", "EIN Application"],
    duration: "2-6 weeks",
  },
  {
    id: "planning",
    name: "Planning",
    icon: FileText,
    color: "bg-purple-500",
    description: "Business plan development, financial projections, and strategy",
    tools: ["Business Plan Simulator", "Financial Projections", "Strategy Builder"],
    duration: "2-4 weeks",
  },
  {
    id: "funding",
    name: "Funding",
    icon: DollarSign,
    color: "bg-green-500",
    description: "Grant applications, investor pitches, and capital acquisition",
    tools: ["Grant Simulator", "RFP Generator", "Pitch Deck Builder"],
    duration: "4-12 weeks",
  },
  {
    id: "operations",
    name: "Operations",
    icon: Settings,
    color: "bg-blue-500",
    description: "Day-to-day management, HR, finance, and compliance",
    tools: ["Operations Dashboard", "HR Management", "Compliance Tracking"],
    duration: "Ongoing",
  },
  {
    id: "growth",
    name: "Growth",
    icon: TrendingUp,
    color: "bg-teal-500",
    description: "Scaling, marketing, partnerships, and expansion",
    tools: ["Marketing Dashboard", "Analytics", "Partnership Management"],
    duration: "Ongoing",
  },
  {
    id: "legacy",
    name: "Legacy",
    icon: Crown,
    color: "bg-amber-600",
    description: "Succession planning, trust integration, and generational wealth",
    tools: ["Trust Governance", "Estate Planning", "Wealth Transfer"],
    duration: "Long-term",
  },
];

// What you get sections
const valuePropositions = [
  {
    icon: Zap,
    title: "Automated Business Formation",
    description: "Step-by-step guidance through entity selection, state filing, EIN application, and compliance setup. No legal expertise required.",
    features: ["LLC, Corporation, Trust formation", "State-specific requirements", "Automatic document generation"],
  },
  {
    icon: FileCheck,
    title: "Grant & Proposal Writing",
    description: "AI-powered grant discovery, eligibility matching, and proposal generation. Increase your funding success rate.",
    features: ["1000+ grant database", "Eligibility auto-matching", "Professional proposal templates"],
  },
  {
    icon: BarChart3,
    title: "Business Plan Simulator",
    description: "Interactive business planning with financial projections, market analysis, and investor-ready documents.",
    features: ["SWOT integration", "Financial modeling", "Export to PDF/Word"],
  },
  {
    icon: Shield,
    title: "Compliance Tracking",
    description: "Never miss a filing deadline. Automated reminders for annual reports, taxes, and regulatory requirements.",
    features: ["Multi-state compliance", "Deadline alerts", "Document vault"],
  },
  {
    icon: Users,
    title: "HR & Team Management",
    description: "From contractor to employee transitions, payroll tracking, and performance management.",
    features: ["W-2/1099 management", "Benefits tracking", "Performance reviews"],
  },
  {
    icon: BookOpen,
    title: "Financial Literacy Training",
    description: "Gamified learning modules to build financial knowledge for you and your team.",
    features: ["Interactive games", "Achievement badges", "Leaderboards"],
  },
];

export default function BusinessLanding() {
  const [activeStage, setActiveStage] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-8 md:p-12 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10 max-w-4xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Complete Business Lifecycle Platform
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              From Idea to Legacy
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-6 max-w-2xl">
              Everything you need to conceive, validate, form, fund, operate, and grow your business—all in one integrated platform designed for multi-generational wealth building.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/business-simulator">
                <Button size="lg" className="bg-white text-green-800 hover:bg-green-50 gap-2">
                  <Play className="w-5 h-5" />
                  Try Demo Free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 gap-2">
                  <DollarSign className="w-5 h-5" />
                  View Pricing
                </Button>
              </Link>
              <Link href="/dept/business">
                <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 gap-2">
                  <Briefcase className="w-5 h-5" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Process Flowchart Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              The Complete Business Lifecycle
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform guides you through every stage of business development, from initial concept to generational legacy.
            </p>
          </div>

          {/* Flowchart */}
          <div className="relative">
            {/* Desktop Flowchart */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-green-500 to-amber-600 -translate-y-1/2 z-0"></div>
                
                {lifecycleStages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="relative z-10 flex flex-col items-center cursor-pointer group"
                    onMouseEnter={() => setActiveStage(stage.id)}
                    onMouseLeave={() => setActiveStage(null)}
                  >
                    <div className={`w-16 h-16 rounded-full ${stage.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                      <stage.icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground text-center">
                      {stage.name}
                    </p>
                    {index < lifecycleStages.length - 1 && (
                      <ArrowRight className="absolute -right-4 top-6 w-5 h-5 text-muted-foreground hidden xl:block" />
                    )}
                    
                    {/* Tooltip */}
                    {activeStage === stage.id && (
                      <Card className="absolute top-24 left-1/2 -translate-x-1/2 w-64 z-20 shadow-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{stage.name}</CardTitle>
                          <CardDescription className="text-xs">{stage.duration}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground mb-2">{stage.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {stage.tools.map((tool) => (
                              <Badge key={tool} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Flowchart */}
            <div className="lg:hidden space-y-4">
              {lifecycleStages.map((stage, index) => (
                <Card
                  key={stage.id}
                  className="relative overflow-hidden"
                  onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${stage.color}`}></div>
                  <CardContent className="p-4 pl-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${stage.color} flex items-center justify-center flex-shrink-0`}>
                        <stage.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">{stage.name}</h3>
                          <Badge variant="outline" className="text-xs">{stage.duration}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${activeStage === stage.id ? 'rotate-90' : ''}`} />
                    </div>
                    
                    {activeStage === stage.id && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Tools & Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {stage.tools.map((tool) => (
                            <Badge key={tool} variant="secondary" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  {index < lifecycleStages.length - 1 && (
                    <div className="absolute -bottom-2 left-6 w-0.5 h-4 bg-border"></div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What You Get Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              What You Get
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive suite of tools designed to automate and simplify every aspect of business management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valuePropositions.map((prop) => (
              <Card key={prop.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                    <prop.icon className="w-6 h-6 text-green-700 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">{prop.title}</CardTitle>
                  <CardDescription>{prop.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prop.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Data Flow Section */}
        <section>
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-xl md:text-2xl">Seamless Data Flow</CardTitle>
              <CardDescription>
                Enter your information once. It flows automatically across all modules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span>Business Simulator</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span>SWOT Analysis</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Business Plan</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span>Grant Simulator</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow">
                  <FileCheck className="w-4 h-4 text-teal-500" />
                  <span>RFP Generator</span>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">
                No duplicate data entry. Changes propagate automatically.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Business to House Connection Section */}
        <section>
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              <Home className="w-4 h-4 mr-2" />
              Business → House Integration
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              From Business to Generational Wealth
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your business can become a "House" in the LuvOnPurpose Autonomous Wealth System,
              unlocking trust governance, token economy, and multi-generational wealth tools.
            </p>
          </div>

          {/* Trust Affiliated vs Independent Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Trust Affiliated */}
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-full bg-primary text-white w-fit">
                  <Shield className="w-6 h-6" />
                </div>
                <CardTitle>Trust Affiliated</CardTitle>
                <CardDescription>Full System Benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { icon: Shield, text: "Asset protection under LuvOnPurpose Academy and Outreach" },
                    { icon: Coins, text: "Access to token economy (MIRROR, GIFT, SPARK, HOUSE)" },
                    { icon: TrendingUp, text: "Participate in 70/30 & 60/40 distributions" },
                    { icon: Users, text: "Succession planning & heir designations" },
                    { icon: Wallet, text: "Dedicated business crypto wallet" },
                    { icon: Heart, text: "Collective benefits & shared resources" },
                    { icon: FileText, text: "LuvLedger blockchain recording" },
                    { icon: Crown, text: "Generational wealth transfer tools" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link href="/genesis">
                    <Button className="w-full gap-2">
                      <Flame className="w-4 h-4" />
                      Affiliate with Trust
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Independent Operation */}
            <Card className="border-2 border-muted">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-full bg-muted w-fit">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-muted-foreground">Independent Operation</CardTitle>
                <CardDescription>Use Platform Tools Only</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { text: "Trust asset protection", included: false },
                    { text: "Token economy access", included: false },
                    { text: "Distribution participation", included: false },
                    { text: "Succession planning tools", included: false },
                    { text: "Business wallet", included: false },
                    { text: "Collective benefits", included: false },
                    { text: "LuvLedger recording", included: true },
                    { text: "Business management tools", included: true },
                    { text: "Analytics & reporting", included: true },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {item.included ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                      )}
                      <span className={item.included ? "" : "text-muted-foreground"}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <p className="text-xs text-center text-muted-foreground">
                    You can affiliate with the trust at any time
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Established Business Onboarding */}
          <Card className="border-2 border-dashed border-amber-500/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Building2 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Already Have a Business?</CardTitle>
                  <CardDescription>
                    Existing businesses can join the trust system through our affiliation process
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                If you already have an established business (LLC, Corporation, or other entity), 
                you can affiliate with the LuvOnPurpose Academy and Outreach Trust without 
                restructuring your existing legal entity. This is a <strong>legal, logical, and doable</strong> path 
                that maintains your business independence while gaining access to the House system.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    step: "1",
                    title: "Register Your Business",
                    desc: "Add your existing entity to the platform with basic information and documentation",
                    icon: FileText,
                  },
                  {
                    step: "2",
                    title: "Sign Affiliation Agreement",
                    desc: "Execute a Trust Affiliation Agreement (not ownership transfer) via e-signature",
                    icon: Scale,
                  },
                  {
                    step: "3",
                    title: "Complete Affiliation",
                    desc: "Finalize your trust affiliation and gain access to full system benefits",
                    icon: Flame,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-background border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-amber-500">{item.step}</Badge>
                      <item.icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-background border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Legal Framework
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>No ownership transfer</strong> - Your business remains yours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Affiliation model</strong> - Similar to franchise or membership agreements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Revocable participation</strong> - You can opt-out at any time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Asset protection benefits</strong> - Gain trust governance without restructuring</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/business-listings">
                  <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
                    <Building2 className="w-4 h-4" />
                    Register Existing Business
                  </Button>
                </Link>
                <Link href="/documents">
                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    View Affiliation Agreement
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* House Lifecycle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                House Lifecycle Journey
              </CardTitle>
              <CardDescription>
                From genesis to generational legacy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { stage: "1", title: "Genesis", desc: "Flame lighting ceremony", icon: Flame },
                  { stage: "2", title: "Activation", desc: "Token chain init", icon: Sparkles },
                  { stage: "3", title: "Operations", desc: "Active governance", icon: Scale },
                  { stage: "4", title: "Growth", desc: "Wealth accumulation", icon: TrendingUp },
                  { stage: "5", title: "Succession", desc: "Legacy transfer", icon: Crown },
                ].map((stage, idx) => (
                  <div key={idx} className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <stage.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="mb-1 text-xs">Stage {stage.stage}</Badge>
                    <h4 className="font-semibold text-sm">{stage.title}</h4>
                    <p className="text-xs text-muted-foreground">{stage.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-green-700 text-white border-0">
            <CardContent className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Build Your Business?
              </h2>
              <p className="text-green-100 mb-6 max-w-xl mx-auto">
                Start with our free demo to explore the platform, or subscribe for full access to all features.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/business-simulator">
                  <Button size="lg" className="bg-white text-green-800 hover:bg-green-50 gap-2">
                    <Play className="w-5 h-5" />
                    Try Demo Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 gap-2">
                    <DollarSign className="w-5 h-5" />
                    Subscribe Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
