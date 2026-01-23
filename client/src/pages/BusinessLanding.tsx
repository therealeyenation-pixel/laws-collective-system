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
