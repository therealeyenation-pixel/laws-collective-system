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
  Heart,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Zap,
  Clock,
  Search,
  FileCheck,
  Scale,
  BarChart3,
  Handshake,
  MessageSquare,
  CalendarCheck,
  Percent,
  Info,
  AlertTriangle,
  Palette,
  Image,
  Video,
  Megaphone,
  Gem,
  Layers,
  PenTool,
  Link2,
  Lock,
  Cpu,
  Globe,
} from "lucide-react";
import { Link } from "wouter";

/* ─────────────────────────────────────────────────────────
   CONTRIBUTION-BASED PRICING MODEL
   
   Year 1  → Annual Membership Contribution (full commitment)
   Year 2+ → Monthly Access Contribution OR Annual Access Contribution (discounted)
   Services → Three-tier professional services by L.A.W.S. Collective, LLC employees
   
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

  /* ─── PROFESSIONAL SERVICES — Three-Tier Structure ─── */
  const quickServices = [
    {
      name: "Contract Template Customization",
      description: "Standard contract templates customized to your specific entity and business needs",
      priceRange: "$75 – $150",
      turnaround: "1–3 business days",
      icon: <FileCheck className="w-5 h-5" />,
    },
    {
      name: "Compliance Checklist & Filing",
      description: "State-specific compliance checklists with filing preparation and guidance",
      priceRange: "$100 – $200",
      turnaround: "2–3 business days",
      icon: <Scale className="w-5 h-5" />,
    },
    {
      name: "Business Summary Document",
      description: "Professional one-page business summary for investors, partners, or lenders",
      priceRange: "$100 – $250",
      turnaround: "2–4 business days",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "Market Snapshot Report",
      description: "Quick competitive landscape and market overview for your target industry",
      priceRange: "$150 – $250",
      turnaround: "3–5 business days",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: "Document Review & Formatting",
      description: "Professional review, editing, and formatting of existing business documents",
      priceRange: "$75 – $175",
      turnaround: "1–2 business days",
      icon: <Search className="w-5 h-5" />,
    },
  ];

  const standardProjects = [
    {
      name: "Grant Application",
      description: "Complete grant proposal including research, narrative development, budget justification, and submission preparation",
      priceRange: "$500 – $2,500",
      turnaround: "2–4 weeks",
      icon: <DollarSign className="w-5 h-5" />,
      deliverables: [
        "Grant opportunity research & matching",
        "Complete proposal narrative",
        "Budget development & justification",
        "Supporting documentation preparation",
        "Up to 3 revision cycles",
        "Submission assistance",
      ],
    },
    {
      name: "Business Proposal Development",
      description: "Professional business or funding proposals ready for submission to partners, investors, or government agencies",
      priceRange: "$750 – $2,500",
      turnaround: "1–3 weeks",
      icon: <Briefcase className="w-5 h-5" />,
      deliverables: [
        "RFP/RFQ analysis & compliance matrix",
        "Technical approach development",
        "Management approach narrative",
        "Pricing strategy & cost proposal",
        "Executive summary & cover letter",
        "Final formatting & submission prep",
      ],
    },
    {
      name: "Market Research Report",
      description: "Detailed market analysis with competitive landscape, target demographics, and strategic recommendations",
      priceRange: "$500 – $1,500",
      turnaround: "1–2 weeks",
      icon: <BarChart3 className="w-5 h-5" />,
      deliverables: [
        "Industry overview & trends",
        "Competitive landscape analysis",
        "Target market demographics",
        "SWOT analysis",
        "Strategic recommendations",
        "Data sources & methodology",
      ],
    },
    {
      name: "Business Formation Package",
      description: "Guided entity setup including formation documents, EIN application, operating agreement, and compliance setup",
      priceRange: "$750 – $2,000",
      turnaround: "1–2 weeks",
      icon: <Building2 className="w-5 h-5" />,
      deliverables: [
        "Entity type selection guidance",
        "Formation document preparation",
        "EIN application assistance",
        "Operating agreement drafting",
        "Initial compliance checklist",
        "30-day follow-up support",
      ],
    },
    {
      name: "Multi-Document Contract Package",
      description: "Comprehensive contract suite for your business including service agreements, vendor contracts, and NDAs",
      priceRange: "$1,000 – $2,500",
      turnaround: "1–3 weeks",
      icon: <Gavel className="w-5 h-5" />,
      deliverables: [
        "Contract drafting (up to 5 documents)",
        "Terms & conditions analysis",
        "Risk assessment & mitigation notes",
        "Negotiation strategy guidance",
        "Amendment templates",
        "Compliance tracking setup",
      ],
    },
  ];

  const customEngagements = [
    {
      name: "Multi-Grant Campaign",
      description: "Strategic identification and application to multiple grant opportunities with coordinated submissions",
      startingAt: "$2,500+",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      name: "Full Business Launch Package",
      description: "End-to-end business establishment including formation, compliance, marketing strategy, and operational setup",
      startingAt: "$3,500+",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      name: "Comprehensive Compliance Overhaul",
      description: "Full audit and restructuring of business compliance across all jurisdictions and regulatory requirements",
      startingAt: "$2,500+",
      icon: <Scale className="w-5 h-5" />,
    },
    {
      name: "Strategic Planning & Advisory",
      description: "Ongoing strategic guidance including quarterly reviews, growth planning, and operational optimization",
      startingAt: "$2,500+/quarter",
      icon: <Handshake className="w-5 h-5" />,
    },
  ];

  /* ─── REAL-EYE-NATION LLC — Creative & Design Services ─── */
  const reyQuickServices = [
    {
      name: "Social Media Graphics Package",
      description: "Custom-designed social media graphics for your brand across platforms (5-10 assets)",
      priceRange: "$100 – $250",
      turnaround: "2–3 business days",
      icon: <Image className="w-5 h-5" />,
    },
    {
      name: "Logo Refresh & Brand Mark",
      description: "Professional logo refinement or secondary brand mark creation with source files",
      priceRange: "$150 – $250",
      turnaround: "3–5 business days",
      icon: <PenTool className="w-5 h-5" />,
    },
    {
      name: "Event Flyer & Promotional Material",
      description: "Eye-catching event flyers, banners, and promotional materials (print + digital)",
      priceRange: "$75 – $200",
      turnaround: "1–3 business days",
      icon: <Megaphone className="w-5 h-5" />,
    },
    {
      name: "NFT Single Asset Design",
      description: "Custom digital artwork designed and prepared for NFT minting on your chosen platform",
      priceRange: "$150 – $250",
      turnaround: "3–5 business days",
      icon: <Gem className="w-5 h-5" />,
    },
    {
      name: "Short-Form Video Edit",
      description: "Professional editing of short-form video content for social media (up to 60 seconds)",
      priceRange: "$100 – $200",
      turnaround: "2–4 business days",
      icon: <Video className="w-5 h-5" />,
    },
  ];

  const reyStandardProjects = [
    {
      name: "NFT Collection Development",
      description: "Full NFT collection design including artwork generation, trait system development, metadata structure, and minting strategy",
      priceRange: "$1,000 – $2,500",
      turnaround: "2–4 weeks",
      icon: <Gem className="w-5 h-5" />,
      deliverables: [
        "Collection concept & art direction",
        "Trait system design (10–50+ traits)",
        "Generative artwork engine setup",
        "Metadata & smart contract preparation",
        "Minting platform guidance",
        "Collection preview & revision cycles",
      ],
    },
    {
      name: "Full Brand Identity Package",
      description: "Complete visual identity system including logo, color palette, typography, brand guidelines, and collateral templates",
      priceRange: "$750 – $2,500",
      turnaround: "2–3 weeks",
      icon: <Palette className="w-5 h-5" />,
      deliverables: [
        "Primary & secondary logo designs",
        "Color palette & typography system",
        "Brand guidelines document",
        "Business card & letterhead templates",
        "Social media brand kit",
        "Source files in all formats",
      ],
    },
    {
      name: "Video Production Package",
      description: "Professional video production for promotional content, training materials, or community outreach campaigns",
      priceRange: "$1,000 – $2,500",
      turnaround: "2–4 weeks",
      icon: <Video className="w-5 h-5" />,
      deliverables: [
        "Creative concept & storyboard",
        "Script development",
        "Production coordination",
        "Professional editing & color grading",
        "Motion graphics & titles",
        "Multi-format delivery (web, social, broadcast)",
      ],
    },
    {
      name: "Outreach Campaign Design",
      description: "Complete visual campaign for community outreach including digital and print materials across all touchpoints",
      priceRange: "$500 – $1,500",
      turnaround: "1–2 weeks",
      icon: <Megaphone className="w-5 h-5" />,
      deliverables: [
        "Campaign visual concept & mood board",
        "Social media content suite (15+ assets)",
        "Email newsletter templates",
        "Print materials (flyers, posters, banners)",
        "Presentation deck design",
        "Campaign style guide",
      ],
    },
  ];

  const reyCustomEngagements = [
    {
      name: "Enterprise NFT Strategy & Deployment",
      description: "End-to-end NFT program including strategy, artwork, smart contracts, marketplace setup, and community building",
      startingAt: "$3,500+",
      icon: <Gem className="w-5 h-5" />,
    },
    {
      name: "Full Creative Direction & Ongoing Design",
      description: "Dedicated creative direction with ongoing design support for all brand, digital, and outreach needs",
      startingAt: "$2,500+/quarter",
      icon: <Palette className="w-5 h-5" />,
    },
    {
      name: "Multi-Platform Media Campaign",
      description: "Comprehensive media production across video, audio, print, and digital for large-scale outreach or launch campaigns",
      startingAt: "$3,000+",
      icon: <Layers className="w-5 h-5" />,
    },
  ];

  /* ─── CROSS-FUNCTIONAL: Smart Contract & Blockchain Services ─── */
  /* Delivered jointly by Contracts (legal), IT (development), and Real-Eye-Nation (NFT art) */

  const smartContractQuick = [
    {
      name: "Smart Contract Audit Review",
      description: "Security review and vulnerability assessment of an existing smart contract with written report",
      priceRange: "$150 – $250",
      turnaround: "3–5 business days",
      icon: <Lock className="w-5 h-5" />,
      departments: ["IT", "Contracts"],
    },
    {
      name: "NFT Metadata & Contract Setup",
      description: "Metadata structure, IPFS pinning, and basic ERC-721/1155 contract configuration for your collection",
      priceRange: "$150 – $250",
      turnaround: "3–5 business days",
      icon: <Gem className="w-5 h-5" />,
      departments: ["IT", "Real-Eye-Nation"],
    },
    {
      name: "Token Economics Blueprint",
      description: "Tokenomics design document outlining supply, distribution, utility, and governance mechanics",
      priceRange: "$200 – $250",
      turnaround: "3–5 business days",
      icon: <Cpu className="w-5 h-5" />,
      departments: ["IT", "Contracts"],
    },
  ];

  const smartContractStandard = [
    {
      name: "Custom Smart Contract Development",
      description: "Bespoke smart contract for your business logic — escrow, royalties, vesting, governance, or custom tokenization",
      priceRange: "$1,500 – $2,500",
      turnaround: "2–4 weeks",
      icon: <Lock className="w-5 h-5" />,
      departments: ["IT", "Contracts"],
      deliverables: [
        "Requirements analysis & architecture",
        "Smart contract development (Solidity/Rust)",
        "Unit testing & security review",
        "Testnet deployment & verification",
        "Legal compliance review",
        "Documentation & deployment guide",
      ],
    },
    {
      name: "NFT Collection Deployment",
      description: "Full NFT collection launch including generative art engine, smart contract, minting page, and marketplace listing",
      priceRange: "$2,000 – $2,500",
      turnaround: "3–5 weeks",
      icon: <Gem className="w-5 h-5" />,
      departments: ["Real-Eye-Nation", "IT", "Contracts"],
      deliverables: [
        "Generative art engine & trait system",
        "ERC-721/1155 smart contract",
        "Minting page development",
        "Metadata & IPFS storage",
        "Marketplace listing setup",
        "Royalty structure & legal review",
      ],
    },
    {
      name: "DAO & Governance Setup",
      description: "Decentralized governance infrastructure including voting contracts, proposal systems, and treasury management",
      priceRange: "$1,500 – $2,500",
      turnaround: "2–4 weeks",
      icon: <Globe className="w-5 h-5" />,
      departments: ["IT", "Contracts"],
      deliverables: [
        "Governance token contract",
        "Voting mechanism implementation",
        "Proposal submission system",
        "Treasury management contract",
        "Legal framework documentation",
        "Admin dashboard & monitoring",
      ],
    },
  ];

  const smartContractCustom = [
    {
      name: "Enterprise Blockchain Strategy & Build",
      description: "End-to-end blockchain program: strategy, smart contracts, NFT ecosystem, tokenomics, marketplace, and community infrastructure",
      startingAt: "$5,000+",
      icon: <Link2 className="w-5 h-5" />,
      departments: ["IT", "Contracts", "Real-Eye-Nation"],
    },
    {
      name: "Full NFT Ecosystem Build",
      description: "Complete NFT program including generative art, smart contracts, custom marketplace, staking mechanics, and community building",
      startingAt: "$5,000+",
      icon: <Gem className="w-5 h-5" />,
      departments: ["Real-Eye-Nation", "IT", "Contracts"],
    },
    {
      name: "DeFi Protocol Development",
      description: "Custom decentralized finance protocol including liquidity pools, yield mechanics, and governance — from concept to mainnet",
      startingAt: "$7,500+",
      icon: <Cpu className="w-5 h-5" />,
      departments: ["IT", "Contracts"],
    },
  ];

  /* ─── Member Discount Tiers ─── */
  const memberDiscounts = [
    { tier: "Explorer", discount: "10%", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    { tier: "Community Member", discount: "20%", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { tier: "Builder", discount: "30% + Priority", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400" },
    { tier: "Collective Partner", discount: "Custom Rates", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
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
      q: "How do professional services work?",
      a: "Professional services are provided by employees of L.A.W.S. Collective, LLC (business services) and Real-Eye-Nation LLC (creative & design services) using our AI-assisted infrastructure. Quick Services can be ordered directly. Standard Projects begin with an intake form — our team scopes the work and provides a quote before you commit. Custom Engagements start with a paid discovery consultation. All Collective members receive discounts on services from both entities.",
    },
    {
      q: "What is Real-Eye-Nation LLC?",
      a: "Real-Eye-Nation LLC is the creative and design arm of the L.A.W.S. Collective ecosystem, tied to the Design department. It provides NFT generation, graphic design, media production, and outreach design services. Like all entities in the ecosystem, its revenue follows the same 30/70 allocation model — 30% to the Academy, 70% to operations.",
    },
    {
      q: "Do I need to be a member to use professional services?",
      a: "No. Professional services are available to everyone. However, Collective members receive significant discounts: Explorers save 10%, Community Members save 20%, and Builders save 30% with priority scheduling. Non-members pay the standard rate.",
    },
    {
      q: "What is the service contribution policy?",
      a: "Service contributions are non-refundable once work has commenced. For Quick Services, this is upon order confirmation. For Standard Projects, this is upon scope approval. If the Collective is unable to deliver the agreed scope, a credit toward future services will be issued. All service revenue supports the collective mission.",
    },
    {
      q: "How do smart contract and blockchain services work?",
      a: "Smart contract and blockchain services are delivered cross-functionally by three departments: Contracts handles legal compliance and terms translation, IT handles development, testing, and deployment, and Real-Eye-Nation handles NFT artwork and digital asset creation. This ensures every deliverable is legally sound, technically secure, and visually compelling. Quick blockchain services can be ordered directly, Standard projects require an intake form, and Custom engagements begin with a $250 discovery consultation.",
    },
    {
      q: "Does the Academy teach smart contract development?",
      a: "Yes. The Smart Contract & Blockchain Mastery module is part of the Divine STEM Curriculum. It covers smart contract fundamentals, NFT deployment, tokenomics, DeFi mechanics, security and auditing, and deployment management. This is education — teaching you how to build. If you need a professional team to build it for you, that's what the cross-functional blockchain services are for.",
    },
    {
      q: "Is the AI technology used in services available for purchase or licensing?",
      a: "No. The AI-assisted infrastructure, automation systems, and proprietary tools are the exclusive intellectual property of the LuvOnPurpose Trust, licensed exclusively to L.A.W.S. Collective, LLC and its affiliated entities. This technology is not available for external licensing, resale, or independent use. It is built exclusively for this ecosystem and its members.",
    },
    {
      q: "What methods of contribution are accepted?",
      a: "We accept all major credit and debit cards through our secure portal. ACH transfers and custom invoicing are available for Collective Partner tier contributions and Custom Engagements.",
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
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Done-For-You Professional Services
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
                Our trained staff uses the same AI-assisted infrastructure to deliver completed work products.
                You focus on your vision — we handle the execution.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge className="bg-green-800 text-white">L.A.W.S. Collective, LLC — Business Services</Badge>
                <Badge className="bg-purple-800 text-white">Real-Eye-Nation LLC — Creative & Design</Badge>
                <Badge className="bg-cyan-800 text-white">Smart Contracts & Blockchain — Cross-Functional</Badge>
              </div>
            </div>

            {/* DIY vs Done-For-You comparison */}
            <div className="max-w-3xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-border bg-background">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-green-800" />
                  <h3 className="font-bold text-foreground text-sm">DIY with Platform Tools</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Included with your membership contribution
                </p>
                <ul className="space-y-2">
                  {[
                    "AI-assisted grant writing tools",
                    "Business plan generators",
                    "Contract templates & builders",
                    "Market research dashboards",
                    "Document formatting tools",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-green-700 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-muted-foreground mt-3 italic">
                  Available to Community Member and Builder tiers
                </p>
              </div>

              <div className="p-5 rounded-xl border border-green-800/30 bg-green-800/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <Handshake className="w-5 h-5 text-green-800" />
                  <h3 className="font-bold text-foreground text-sm">Done-For-You Services</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Professional staff delivers completed work products
                </p>
                <ul className="space-y-2">
                  {[
                    "Dedicated professional assigned to your project",
                    "AI-assisted drafting + human review & customization",
                    "Multiple revision cycles included",
                    "Final deliverable ready for submission",
                    "Post-delivery support included",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-green-700 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-muted-foreground mt-3 italic">
                  Available to everyone — members receive discounts
                </p>
              </div>
            </div>

            {/* Member Discount Badges */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="flex items-center gap-2 mb-3 justify-center">
                <Percent className="w-4 h-4 text-green-800" />
                <p className="text-sm font-semibold text-foreground">Member Service Discounts</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {memberDiscounts.map((md, i) => (
                  <div key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium ${md.color}`}>
                    {md.tier}: {md.discount} off
                  </div>
                ))}
                <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  Non-member: Standard rate
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════
               L.A.W.S. COLLECTIVE, LLC — BUSINESS SERVICES
               ═══════════════════════════════════════════════════ */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">L.A.W.S. Collective, LLC</h3>
                  <p className="text-sm text-muted-foreground">Business, Legal & Financial Services</p>
                </div>
              </div>
              <div className="h-px bg-green-800/20 mt-4" />
            </div>

            {/* ─── TIER 1: Quick Services ─── */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-800/10 rounded-lg">
                  <Zap className="w-5 h-5 text-green-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Quick Services</h3>
                  <p className="text-sm text-muted-foreground">$75 – $250 · Standardized deliverables · Order directly</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickServices.map((service, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-border bg-background hover:border-green-800/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-1.5 bg-green-800/10 rounded-lg text-green-800">
                        {service.icon}
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">{service.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{service.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-green-800">{service.priceRange}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {service.turnaround}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toast.info("Service ordering coming soon. Contact us directly for immediate requests.")}
                    >
                      Order Now
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── TIER 2: Standard Projects ─── */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-800/10 rounded-lg">
                  <FileText className="w-5 h-5 text-green-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Standard Projects</h3>
                  <p className="text-sm text-muted-foreground">$500 – $2,500 · Scoped & quoted · Intake form required</p>
                </div>
              </div>

              <div className="space-y-4">
                {standardProjects.map((project, idx) => (
                  <Card key={idx} className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-1.5 bg-green-800/10 rounded-lg text-green-800">
                            {project.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">{project.name}</h4>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-sm font-semibold text-green-800">{project.priceRange}</span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {project.turnaround}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                      </div>

                      <div className="lg:w-72 flex-shrink-0">
                        <p className="text-xs font-semibold text-foreground mb-2">Deliverables:</p>
                        <ul className="space-y-1.5 mb-4">
                          {project.deliverables.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-green-700 mt-0.5 flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => toast.info("Service intake form coming soon. Contact us directly for immediate requests.")}
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1" />
                          Request Quote
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* ─── TIER 3: Custom Engagements ─── */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-800/10 rounded-lg">
                  <Handshake className="w-5 h-5 text-green-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Custom Engagements</h3>
                  <p className="text-sm text-muted-foreground">$2,500+ · Multi-phase work · Begins with paid discovery consultation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {customEngagements.map((engagement, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-green-800/20 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/10 dark:to-emerald-950/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-1.5 bg-green-800/10 rounded-lg text-green-800">
                        {engagement.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{engagement.name}</h4>
                        <span className="text-xs font-medium text-green-800">Starting at {engagement.startingAt}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">{engagement.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toast.info("Consultation booking coming soon. Contact us directly for immediate requests.")}
                    >
                      <CalendarCheck className="w-3.5 h-3.5 mr-1" />
                      Book Discovery Consultation
                    </Button>
                  </div>
                ))}
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-green-800">Discovery consultation:</span>{" "}
                  Custom Engagements begin with a $150 discovery consultation (credited toward your project if you proceed).
                  This ensures we fully understand your needs before scoping the work.
                </p>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════
               REAL-EYE-NATION LLC — CREATIVE & DESIGN SERVICES
               ═══════════════════════════════════════════════════ */}
            <div className="mb-8 mt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Real-Eye-Nation LLC</h3>
                  <p className="text-sm text-muted-foreground">Creative Design, NFT Generation, Media Production & Outreach</p>
                </div>
              </div>
              <div className="h-px bg-purple-800/20 mt-4" />
            </div>

            {/* ─── REY TIER 1: Quick Creative Services ─── */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-800/10 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Quick Creative Services</h3>
                  <p className="text-sm text-muted-foreground">$75 – $250 · Standardized deliverables · Order directly</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reyQuickServices.map((service, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-border bg-background hover:border-purple-800/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-1.5 bg-purple-800/10 rounded-lg text-purple-800">
                        {service.icon}
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">{service.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{service.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-purple-800">{service.priceRange}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {service.turnaround}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toast.info("Service ordering coming soon. Contact us directly for immediate requests.")}
                    >
                      Order Now
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── REY TIER 2: Standard Creative Projects ─── */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-800/10 rounded-lg">
                  <Palette className="w-5 h-5 text-purple-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Standard Creative Projects</h3>
                  <p className="text-sm text-muted-foreground">$500 – $2,500 · Scoped & quoted · Intake form required</p>
                </div>
              </div>

              <div className="space-y-4">
                {reyStandardProjects.map((project, idx) => (
                  <Card key={idx} className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-1.5 bg-purple-800/10 rounded-lg text-purple-800">
                            {project.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">{project.name}</h4>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-sm font-semibold text-purple-800">{project.priceRange}</span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {project.turnaround}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                      </div>

                      <div className="lg:w-72 flex-shrink-0">
                        <p className="text-xs font-semibold text-foreground mb-2">Deliverables:</p>
                        <ul className="space-y-1.5 mb-4">
                          {project.deliverables.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-purple-700 mt-0.5 flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => toast.info("Service intake form coming soon. Contact us directly for immediate requests.")}
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1" />
                          Request Quote
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* ─── REY TIER 3: Custom Creative Engagements ─── */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-800/10 rounded-lg">
                  <Layers className="w-5 h-5 text-purple-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Custom Creative Engagements</h3>
                  <p className="text-sm text-muted-foreground">$2,500+ · Multi-phase work · Begins with paid discovery consultation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {reyCustomEngagements.map((engagement, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-purple-800/20 bg-gradient-to-br from-purple-50/50 to-fuchsia-50/30 dark:from-purple-950/10 dark:to-fuchsia-950/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-1.5 bg-purple-800/10 rounded-lg text-purple-800">
                        {engagement.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{engagement.name}</h4>
                        <span className="text-xs font-medium text-purple-800">Starting at {engagement.startingAt}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">{engagement.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toast.info("Consultation booking coming soon. Contact us directly for immediate requests.")}
                    >
                      <CalendarCheck className="w-3.5 h-3.5 mr-1" />
                      Book Discovery Consultation
                    </Button>
                  </div>
                ))}
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-purple-800">Discovery consultation:</span>{" "}
                  Custom Creative Engagements begin with a $150 discovery consultation (credited toward your project if you proceed).
                  This ensures we fully understand your creative vision before scoping the work.
                </p>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════
               CROSS-FUNCTIONAL: SMART CONTRACT & BLOCKCHAIN SERVICES
               Delivered jointly by Contracts + IT + Real-Eye-Nation
               ═══════════════════════════════════════════════════ */}
            <div className="mb-8 mt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-cyan-800 flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Smart Contract & Blockchain Services</h3>
                  <p className="text-sm text-muted-foreground">Cross-Functional: Contracts + IT + Real-Eye-Nation</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 max-w-3xl">
                Smart contract and blockchain services are delivered jointly across departments — <strong>Contracts</strong> handles legal compliance and terms translation,
                <strong> IT</strong> handles development, testing, and deployment, and <strong>Real-Eye-Nation</strong> handles NFT artwork and digital asset creation.
                This cross-functional model ensures every deliverable is legally sound, technically secure, and visually compelling.
              </p>
              <div className="h-px bg-cyan-800/20 mt-4" />
            </div>

            {/* ─── SC TIER 1: Quick Blockchain Services ─── */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-800/10 rounded-lg">
                  <Zap className="w-5 h-5 text-cyan-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Quick Blockchain Services</h3>
                  <p className="text-sm text-muted-foreground">$150 – $250 · Standardized deliverables · Order directly</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {smartContractQuick.map((service, idx) => (
                  <div key={idx} className="p-5 rounded-lg border border-border hover:border-cyan-800/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-cyan-800/10 rounded-lg text-cyan-800">
                        {service.icon}
                      </div>
                      <span className="font-bold text-foreground text-sm">{service.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{service.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {service.departments.map((dept, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5">{dept}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-semibold text-cyan-800">{service.priceRange}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.turnaround}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toast.info("Service ordering coming soon. Contact us directly for immediate requests.")}
                    >
                      Order Now
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── SC TIER 2: Standard Blockchain Projects ─── */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-800/10 rounded-lg">
                  <Lock className="w-5 h-5 text-cyan-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Standard Blockchain Projects</h3>
                  <p className="text-sm text-muted-foreground">$1,500 – $2,500 · Scoped & quoted · Intake form required</p>
                </div>
              </div>

              <div className="space-y-4">
                {smartContractStandard.map((project, idx) => (
                  <Card key={idx} className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-1.5 bg-cyan-800/10 rounded-lg text-cyan-800">
                            {project.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">{project.name}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {project.departments.map((dept, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5">{dept}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-cyan-800">{project.priceRange}</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {project.turnaround}
                          </span>
                        </div>
                      </div>
                      <div className="lg:w-64 flex-shrink-0">
                        <p className="text-xs font-semibold text-foreground mb-2">Deliverables:</p>
                        <ul className="space-y-1">
                          {project.deliverables.map((d, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <Check className="w-3 h-3 text-cyan-700 mt-0.5 flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4"
                          onClick={() => toast.info("Service intake form coming soon. Contact us directly for immediate requests.")}
                        >
                          Request Quote
                          <MessageSquare className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* ─── SC TIER 3: Custom Blockchain Engagements ─── */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-800/10 rounded-lg">
                  <CalendarCheck className="w-5 h-5 text-cyan-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Custom Blockchain Engagements</h3>
                  <p className="text-sm text-muted-foreground">$5,000+ · Discovery consultation · Fully custom scope</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {smartContractCustom.map((engagement, idx) => (
                  <Card key={idx} className="p-6">
                    <div className="p-2 bg-cyan-800/10 rounded-lg text-cyan-800 w-fit mb-3">
                      {engagement.icon}
                    </div>
                    <h4 className="font-bold text-foreground mb-2">{engagement.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{engagement.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {engagement.departments.map((dept, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5">{dept}</Badge>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-cyan-800 mb-4">Starting at {engagement.startingAt}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toast.info("Consultation booking coming soon. Contact us directly for immediate requests.")}
                    >
                      Book Consultation
                      <CalendarCheck className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Card>
                ))}
              </div>

              <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg mt-6">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-cyan-800">Discovery consultation:</span>{" "}
                  Custom Blockchain Engagements begin with a $250 discovery consultation (credited toward your project if you proceed).
                  This ensures we fully understand your technical requirements, legal needs, and creative vision across all departments.
                </p>
              </div>
            </div>

            {/* ─── Legal Disclaimers & Policies ─── */}
            <div className="max-w-3xl mx-auto space-y-3 mb-8">
              {/* Entity Attribution */}
              <div className="p-4 rounded-lg border border-border bg-background">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-green-800 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground">Service Providers:</span>{" "}
                      Business, legal, and financial services are provided by employees of <strong>L.A.W.S. Collective, LLC</strong>.
                      Creative, design, NFT, and media services are provided by employees of <strong>Real-Eye-Nation LLC</strong>,
                      the creative and design arm of the L.A.W.S. Collective ecosystem.
                      Smart contract and blockchain services are delivered <strong>cross-functionally</strong> by the Contracts, IT, and Real-Eye-Nation departments.
                      AI-assisted tools are used to enhance efficiency and quality; all deliverables are
                      reviewed and finalized by qualified professionals.
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">Revenue Allocation:</span>{" "}
                      Service revenue from both entities follows the same allocation as membership contributions — 30% supports
                      the LuvOnPurpose Academy & Outreach (508(c)(1)(a)) education programs, and 70% supports
                      operations and staff.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Contribution Policy */}
              <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      <span className="font-semibold text-amber-800 dark:text-amber-500">Service Contribution Policy:</span>{" "}
                      Service contributions are non-refundable once work has commenced. For Quick Services,
                      this is upon order confirmation. For Standard Projects, this is upon scope approval.
                      If the Collective is unable to deliver the agreed scope, a credit toward future services
                      will be issued.
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Disclaimers */}
              <div className="p-4 rounded-lg border border-border bg-secondary/10">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-green-800 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1.5 text-[11px] text-muted-foreground">
                    <p>Grant writing services do not guarantee funding approval. Success depends on funder criteria, competition, and eligibility.</p>
                    <p>Legal document services (contracts, compliance) are not a substitute for licensed legal counsel. Consult an attorney for legal advice.</p>
                    <p>NFT and digital asset services include artwork creation and minting preparation. Blockchain transaction fees (gas fees) are the client's responsibility. NFT market value is not guaranteed.</p>
                    <p>Intellectual property for custom creative work transfers to the client upon full payment, unless otherwise specified in the project scope agreement.</p>
                    <p>Service scope and pricing are confirmed in writing before work begins. No work commences without mutual agreement.</p>
                    <p>Smart contract services include development, testing, and testnet deployment. Mainnet deployment gas fees and blockchain transaction costs are the client's responsibility. Smart contract functionality is provided "as-is" after client-approved testing; L.A.W.S. Collective is not liable for post-deployment exploits or market conditions.</p>
                    <p>Client data is handled confidentially within the L.A.W.S. Collective infrastructure. No client information is shared with third parties.</p>
                  </div>
                </div>
              </div>

              {/* Proprietary Technology & AI Exclusivity */}
              <div className="p-4 rounded-lg border border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-cyan-800 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      <span className="font-semibold text-cyan-800 dark:text-cyan-400">Proprietary Technology Notice:</span>{" "}
                      The AI-assisted infrastructure, automation systems, and proprietary tools used to deliver all services
                      are the exclusive intellectual property of the LuvOnPurpose Trust, licensed exclusively to L.A.W.S. Collective, LLC
                      and its affiliated entities. This technology is not available for external licensing, resale, or independent use.
                    </p>
                    <p>
                      All AI-generated outputs, automation workflows, and system-assisted deliverables are produced exclusively
                      within the L.A.W.S. Collective ecosystem. The underlying technology, algorithms, and methodologies remain
                      the property of the Trust and are protected under applicable intellectual property law.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
