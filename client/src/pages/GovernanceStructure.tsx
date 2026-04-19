import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Building2,
  BookOpen,
  Palette,
  ArrowRight,
  Scale,
  Users,
  Sprout,
  Wind,
  Droplets,
  Star,
  FileText,
  Lock,
  Eye,
  Heart,
  Cpu,
  ChevronRight,
} from "lucide-react";

interface EntityInfo {
  name: string;
  type: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  purpose: string;
  capabilities: string[];
  departments?: string[];
}

const entities: EntityInfo[] = [
  {
    name: "L.A.W.S. Collective LLC",
    type: "Limited Liability Company",
    icon: <Building2 className="w-8 h-8" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-950/40",
    borderColor: "border-emerald-700/50",
    description:
      "The operational backbone of the Collective. L.A.W.S. Collective LLC manages all business services, professional consulting, legal coordination, financial operations, and member support infrastructure.",
    purpose: "Operations, Services & Business Management",
    capabilities: [
      "Business formation & consulting",
      "Legal coordination & contract administration",
      "Financial planning & tax strategy",
      "HR, compliance & workforce management",
      "IT infrastructure & smart contract services",
      "Procurement, purchasing & vendor management",
      "Marketing, outreach & member communications",
      "Property & asset management",
    ],
    departments: [
      "Contracts",
      "Finance",
      "Legal",
      "HR",
      "IT",
      "Marketing",
      "Operations",
      "Procurement",
      "Purchasing",
      "Property & Assets",
      "Real Estate",
      "Project Controls",
      "QA/QC",
      "Media",
    ],
  },
  {
    name: "Real-Eye-Nation LLC",
    type: "Limited Liability Company — Design Division",
    icon: <Palette className="w-8 h-8" />,
    color: "text-violet-400",
    bgColor: "bg-violet-950/40",
    borderColor: "border-violet-700/50",
    description:
      "The creative and design arm operating under the Design department of the L.A.W.S. Collective. Real-Eye-Nation handles all visual identity, NFT creation, graphic design, media production, performing arts programming, and creative services.",
    purpose: "Creative Services, Design & Performing Arts",
    capabilities: [
      "Graphic design & brand identity",
      "NFT creation & digital art",
      "Media production & content creation",
      "Performing arts programming & training",
      "Documentary & film production",
      "Social media management & outreach",
      "Creative consulting & visual strategy",
    ],
  },
  {
    name: "LuvOnPurpose Academy & Outreach",
    type: "508(c)(1)(A) Faith-Based Organization",
    icon: <BookOpen className="w-8 h-8" />,
    color: "text-amber-400",
    bgColor: "bg-amber-950/40",
    borderColor: "border-amber-700/50",
    description:
      "The educational and outreach entity dedicated to curriculum development, K-12 education, financial literacy, trade apprenticeships, and community development. The Academy operates as a tax-exempt organization focused exclusively on education — it does not provide services for hire.",
    purpose: "Education, Curriculum & Community Outreach",
    capabilities: [
      "K-12 curriculum (standards-aligned + culturally enriched)",
      "Financial literacy & wealth-building education",
      "Business readiness & entrepreneurship training",
      "Trade apprenticeship partnerships",
      "Blockchain & smart contract education",
      "Performing arts education (via Real-Eye-Nation)",
      "Scholarship & community outreach programs",
    ],
  },
];

const revenueAllocation = [
  {
    label: "Operations (L.A.W.S. Collective LLC)",
    percentage: 70,
    color: "bg-emerald-500",
    description: "Business operations, services, staffing, infrastructure",
  },
  {
    label: "Academy (LuvOnPurpose Academy)",
    percentage: 30,
    color: "bg-amber-500",
    description: "Education, curriculum, scholarships, outreach",
  },
];

export default function GovernanceStructure() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Shield className="w-7 h-7 text-primary" />
                <span className="text-lg font-bold tracking-tight">
                  L.A.W.S. Collective
                </span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/academy" className="text-muted-foreground hover:text-foreground transition-colors">
                Academy
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
            </div>
            <Link href="/waitlist">
              <Button size="sm">Join the Waitlist</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Scale className="w-4 h-4" />
              Governance & Structure
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Built on Purpose.
              <br />
              <span className="text-primary">Structured for Generations.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              The L.A.W.S. Collective operates through a multi-entity structure
              designed for transparency, legal compliance, and long-term
              sustainability. Each entity serves a distinct purpose within the
              Collective's mission of building generational wealth through
              community.
            </p>
          </div>
        </div>
      </section>

      {/* L.A.W.S. Framework Meaning */}
      <section className="border-y border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">The L.A.W.S. Framework</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four pillars that guide every decision, service, and educational
              program across the Collective.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                letter: "L",
                word: "LAND",
                meaning: "Reconnection & Stability",
                desc: "Understanding roots, migrations, and family history. Reconnecting with the land and building a stable foundation.",
                icon: <Sprout className="w-6 h-6" />,
                color: "text-green-400",
              },
              {
                letter: "A",
                word: "AIR",
                meaning: "Education & Knowledge",
                desc: "Learning, personal development, and communication. Breathing life into communities through accessible education.",
                icon: <Wind className="w-6 h-6" />,
                color: "text-sky-400",
              },
              {
                letter: "W",
                word: "WATER",
                meaning: "Healing & Balance",
                desc: "Emotional resilience, healing cycles, and healthy decision-making. Restoring balance to families and communities.",
                icon: <Droplets className="w-6 h-6" />,
                color: "text-blue-400",
              },
              {
                letter: "S",
                word: "SELF",
                meaning: "Purpose & Skills",
                desc: "Financial literacy, business readiness, and purposeful growth. Building the skills to sustain generational wealth.",
                icon: <Star className="w-6 h-6" />,
                color: "text-amber-400",
              },
            ].map((pillar) => (
              <div
                key={pillar.letter}
                className="text-center space-y-3 p-6 rounded-xl bg-card border border-border"
              >
                <div className={`${pillar.color} flex justify-center`}>
                  {pillar.icon}
                </div>
                <div>
                  <span className="text-3xl font-black text-primary">
                    {pillar.letter}
                  </span>
                  <span className="text-lg font-bold ml-1">.{pillar.word.slice(1)}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {pillar.meaning}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Entity Structure */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold">
            Our Entity Structure
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three distinct entities working in concert — each with clear legal
            boundaries, defined responsibilities, and shared purpose.
          </p>
        </div>

        <div className="space-y-8">
          {entities.map((entity) => (
            <Card
              key={entity.name}
              className={`${entity.bgColor} ${entity.borderColor} border overflow-hidden`}
            >
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Entity Header */}
                  <div className="space-y-4">
                    <div className={entity.color}>{entity.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold">{entity.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {entity.type}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium">
                      <FileText className="w-3 h-3" />
                      {entity.purpose}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {entity.description}
                    </p>
                  </div>

                  {/* Capabilities */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Core Capabilities
                    </h4>
                    <ul className="space-y-2">
                      {entity.capabilities.map((cap) => (
                        <li
                          key={cap}
                          className="flex items-start gap-2 text-sm"
                        >
                          <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Departments (if applicable) */}
                  {entity.departments ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Departments
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {entity.departments.map((dept) => (
                          <span
                            key={dept}
                            className="text-xs bg-foreground/10 text-foreground px-2.5 py-1 rounded-full"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Entity Relationship
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {entity.name === "Real-Eye-Nation LLC"
                          ? "Operates under the Design department of L.A.W.S. Collective LLC. Creative services revenue flows through the Collective's standard allocation model."
                          : "Receives 30% of all revenue across the Collective for educational programming, curriculum development, and community outreach. Does not provide services for hire."}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Revenue Allocation */}
      <section className="border-y border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              Revenue Allocation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every contribution to the Collective is allocated transparently
              across operations and education.
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Visual bar */}
            <div className="h-8 rounded-full overflow-hidden flex">
              {revenueAllocation.map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} flex items-center justify-center text-white text-sm font-bold`}
                  style={{ width: `${item.percentage}%` }}
                >
                  {item.percentage}%
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {revenueAllocation.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${item.color} mt-1 flex-shrink-0`}
                  />
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Governance Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">
            Governance Principles
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The Collective is governed by principles that protect members,
            preserve privacy, and ensure long-term sustainability.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Lock className="w-6 h-6" />,
              title: "Privacy-First",
              desc: "Member and founder identities are protected. The Collective leads with brand identity, not personal identity. A registered agent service keeps personal addresses off public records.",
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: "Multi-Generational Design",
              desc: "Every structure is built to outlast any single generation. Trust frameworks, succession protocols, and educational pipelines ensure continuity across generations.",
            },
            {
              icon: <Users className="w-6 h-6" />,
              title: "Community Governance",
              desc: "Houses (family trust units) participate in governance through structured voting, delegation, and representation. No single entity controls the Collective unilaterally.",
            },
            {
              icon: <Eye className="w-6 h-6" />,
              title: "Transparent Allocation",
              desc: "All revenue allocation is visible to members. The 70/30 split between operations and education is consistently applied across all revenue streams.",
            },
            {
              icon: <Cpu className="w-6 h-6" />,
              title: "Proprietary AI Infrastructure",
              desc: "All AI systems, automation tools, and digital infrastructure are exclusive proprietary intellectual property of the Trust, licensed to the Collective for member benefit.",
            },
            {
              icon: <Heart className="w-6 h-6" />,
              title: "Contribution-Based Model",
              desc: "Members make contributions, not payments. Every contribution supports the collective mission. Non-refundable contributions are framed as investments in the community's future.",
            },
          ].map((principle) => (
            <div
              key={principle.title}
              className="p-6 rounded-xl bg-card border border-border space-y-3"
            >
              <div className="text-primary">{principle.icon}</div>
              <h3 className="font-bold">{principle.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {principle.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Token System Overview */}
      <section className="border-y border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              The Token Activation System
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Members progress through a structured token sequence that unlocks
              capabilities and governance rights within the Collective.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
            {[
              { name: "MIRROR", desc: "Self-assessment & reflection", color: "bg-slate-600" },
              { name: "GIFT", desc: "Community contribution", color: "bg-blue-600" },
              { name: "SPARK", desc: "Business concept validation", color: "bg-orange-600" },
              { name: "HOUSE", desc: "Trust establishment", color: "bg-emerald-600" },
              { name: "CROWN", desc: "Full governance rights", color: "bg-amber-600" },
            ].map((token, i) => (
              <div key={token.name} className="flex items-center gap-2">
                <div className={`${token.color} text-white px-4 py-3 rounded-lg text-center min-w-[120px]`}>
                  <p className="font-bold text-sm">{token.name}</p>
                  <p className="text-xs opacity-80 mt-1">{token.desc}</p>
                </div>
                {i < 4 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to Build Something That Lasts?
          </h2>
          <p className="text-muted-foreground">
            The Collective is currently in pre-launch. Join the waitlist to be
            among the first to establish your House when we go live.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/waitlist">
              <Button size="lg" className="gap-2">
                Join the Waitlist
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Contribution Tiers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-bold">L.A.W.S. Collective</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Land. Air. Water. Self. Building generational wealth through
                purpose and community.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Entities</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>L.A.W.S. Collective LLC</p>
                <p>Real-Eye-Nation LLC</p>
                <p>LuvOnPurpose Academy & Outreach</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Quick Links</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/" className="block hover:text-foreground transition-colors">
                  Home
                </Link>
                <Link href="/pricing" className="block hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="/academy" className="block hover:text-foreground transition-colors">
                  Academy
                </Link>
                <Link href="/waitlist" className="block hover:text-foreground transition-colors">
                  Join Waitlist
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} L.A.W.S. Collective. All rights
              reserved. All AI systems and digital infrastructure are proprietary
              intellectual property of the Trust.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
