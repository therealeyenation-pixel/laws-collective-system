import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Users, 
  FileText, 
  Send, 
  Download, 
  Eye, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  Heart,
  Briefcase,
  DollarSign,
  Shield,
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Plus,
  Copy,
  Printer
} from "lucide-react";

// Position data synced with Careers.tsx - includes all open/recruiting positions
const POSITIONS = [
  // TIER 3: OPEN MANAGER POSITIONS
  { id: "hr-lead", title: "HR Manager", entity: "The L.A.W.S. Collective, LLC", department: "Human Resources", tier: "tier3_open", salaryRange: "$85,000 - $115,000", recommendedBenefits: "standard" },
  { id: "qaqc-lead", title: "QA/QC Manager", entity: "The L.A.W.S. Collective, LLC", department: "Quality Assurance", tier: "tier3_open", salaryRange: "$85,000 - $115,000", recommendedBenefits: "standard" },
  { id: "purchasing-lead", title: "Purchasing Manager", entity: "The L.A.W.S. Collective, LLC", department: "Purchasing", tier: "tier3_open", salaryRange: "$80,000 - $110,000", recommendedBenefits: "standard" },
  { id: "operations-manager", title: "Operations Manager", entity: "LuvOnPurpose Autonomous Wealth System LLC", department: "Operations", tier: "tier3_open", salaryRange: "$85,000 - $115,000", recommendedBenefits: "standard" },
  { id: "grant-writer", title: "Grant Writer / Proposal Specialist", entity: "The L.A.W.S. Collective, LLC", department: "Grants & Proposals", tier: "tier3_open", salaryRange: "$85,000 - $115,000", recommendedBenefits: "grant-compliant" },
  { id: "platform-admin", title: "Platform Administrator", entity: "LuvOnPurpose Autonomous Wealth System LLC", department: "Technology", tier: "tier3_open", salaryRange: "$95,000 - $130,000", recommendedBenefits: "remote-work" },
  
  // TIER 4: OPERATIONS COORDINATORS - All Open Positions
  { id: "finance-ops-coordinator", title: "Finance Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Finance", tier: "tier4_coordinator", salaryRange: "$55,000 - $75,000", recommendedBenefits: "standard" },
  { id: "ops-coordinator-education", title: "Education Operations Coordinator", entity: "508-LuvOnPurpose Academy and Outreach", department: "Education", tier: "tier4_coordinator", salaryRange: "$55,000 - $75,000", recommendedBenefits: "standard" },
  { id: "outreach-coordinator", title: "Outreach Coordinator", entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.", department: "Community Outreach", tier: "tier4_coordinator", salaryRange: "$65,000 - $85,000", recommendedBenefits: "standard" },
  { id: "content-creator", title: "Content Creator / Media Assistant", entity: "Real-Eye-Nation LLC", department: "Media Production", tier: "tier4_coordinator", salaryRange: "$35,000 - $55,000", recommendedBenefits: "part-time" },
  { id: "academy-instructor", title: "Academy Instructor / Curriculum Developer", entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.", department: "Education", tier: "tier4_coordinator", salaryRange: "$75,000 - $100,000", recommendedBenefits: "standard" },
  { id: "programs-coordinator", title: "Community Programs Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Community Programs", tier: "tier4_coordinator", salaryRange: "$80,000 - $110,000", recommendedBenefits: "grant-compliant" },
  { id: "lead-ops-coordinator", title: "Lead Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Operations", tier: "tier4_coordinator", salaryRange: "$68,000 - $88,000", recommendedBenefits: "standard" },
  { id: "ops-coordinator-business", title: "Business Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Business Management", tier: "tier4_coordinator", salaryRange: "$60,000 - $80,000", recommendedBenefits: "standard" },
  { id: "ops-coordinator-hr", title: "HR Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Human Resources", tier: "tier4_coordinator", salaryRange: "$52,000 - $68,000", recommendedBenefits: "standard" },
  { id: "ops-coordinator-qaqc", title: "QA/QC Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Quality Assurance", tier: "tier4_coordinator", salaryRange: "$52,000 - $68,000", recommendedBenefits: "standard" },
  { id: "ops-coordinator-purchasing", title: "Purchasing Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Purchasing", tier: "tier4_coordinator", salaryRange: "$52,000 - $68,000", recommendedBenefits: "standard" },
  { id: "ops-coordinator-operations", title: "Operations Operations Coordinator", entity: "LuvOnPurpose Autonomous Wealth System LLC", department: "Operations", tier: "tier4_coordinator", salaryRange: "$52,000 - $68,000", recommendedBenefits: "remote-work" },
  { id: "ops-coordinator-health", title: "Health Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Health", tier: "tier4_coordinator", salaryRange: "$55,000 - $72,000", recommendedBenefits: "standard" },
  { id: "ops-coordinator-procurement", title: "Procurement Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Procurement", tier: "tier4_coordinator", salaryRange: "$55,000 - $75,000", recommendedBenefits: "standard" },
  { id: "ops-coordinator-contracts", title: "Contracts Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Contracts", tier: "tier4_coordinator", salaryRange: "$52,000 - $72,000", recommendedBenefits: "standard" },
  { id: "ops-coordinator-design", title: "Design Operations Coordinator", entity: "Real-Eye-Nation, LLC", department: "Design & Creative", tier: "tier4_coordinator", salaryRange: "$52,000 - $72,000", recommendedBenefits: "remote-work" },
  { id: "ops-coordinator-media", title: "Media Operations Coordinator", entity: "Real-Eye-Nation, LLC", department: "Media Production", tier: "tier4_coordinator", salaryRange: "$52,000 - $72,000", recommendedBenefits: "remote-work" },
  { id: "ops-coordinator-project-controls", title: "Project Controls Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Project Controls", tier: "tier4_coordinator", salaryRange: "$68,000 - $88,000", recommendedBenefits: "standard" },
  
  // LEGAL DEPARTMENT
  { id: "legal-manager", title: "Legal Manager", entity: "The L.A.W.S. Collective, LLC", department: "Legal", tier: "tier3_open", salaryRange: "$95,000 - $130,000", recommendedBenefits: "standard" },
  { id: "ops-coordinator-legal", title: "Legal Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Legal", tier: "tier4_coordinator", salaryRange: "$55,000 - $75,000", recommendedBenefits: "standard" },
  
  // REAL ESTATE DEPARTMENT
  { id: "ops-coordinator-real-estate", title: "Real Estate Operations Coordinator", entity: "The L.A.W.S. Collective, LLC", department: "Real Estate", tier: "tier4_coordinator", salaryRange: "$52,000 - $72,000", recommendedBenefits: "standard" },
];

const BENEFITS_PACKAGES = [
  { 
    id: "standard", 
    name: "Standard Benefits Package", 
    description: "For full-time team members",
    benefits: [
      "Ownership stake in assigned entity",
      "All Academy certifications at no cost",
      "Token earnings based on role metrics",
      "Flexible work schedule",
      "Voice in organizational governance decisions",
      "Professional development opportunities"
    ]
  },
  { 
    id: "part-time", 
    name: "Part-Time Benefits Package", 
    description: "For part-time team members",
    benefits: [
      "Pro-rated ownership stake",
      "Academy certifications at no cost",
      "Token earnings based on contribution",
      "Flexible scheduling"
    ]
  },
  { 
    id: "grant-compliant", 
    name: "Grant-Compliant Benefits Package", 
    description: "For positions funded by grants requiring traditional benefits",
    benefits: [
      "Health insurance stipend",
      "Retirement contribution matching",
      "Paid time off",
      "Professional development allowance",
      "All standard benefits"
    ],
    notes: "Specific benefits vary by grant requirements"
  },
  { 
    id: "remote-work", 
    name: "Remote Work Support Package", 
    description: "Grant-allowable support for remote positions",
    benefits: [
      "Monthly utilities stipend ($75-150/month for internet and electricity)",
      "Equipment provision (laptop, phone, software licenses)",
      "Home office setup allowance (one-time $500-1,000)",
      "Variable travel reimbursement (mileage, lodging, per diem)"
    ],
    grantCategory: "Personnel Costs / Fringe Benefits",
    annualCost: "$2,400 - $4,800 ongoing + $2,750 first year setup"
  },
  { 
    id: "outreach-professional", 
    name: "Outreach & Professional Appearance Package", 
    description: "For public-facing and outreach positions",
    benefits: [
      "Annual professional wardrobe budget ($500-1,000/year)",
      "Branded apparel and materials provided",
      "Event attendance allowance",
      "Networking and professional membership dues"
    ],
    grantCategory: "Personnel Costs / Supplies",
    annualCost: "$1,000 - $1,500",
    applicableTo: ["HR Manager", "Outreach Coordinator", "Content Creator", "Community Programs Coordinator", "Operations Manager"]
  },
  { 
    id: "software-subscriptions", 
    name: "Software Subscriptions Package", 
    description: "Essential software tools for remote work productivity",
    benefits: [
      "Productivity suite (Google Workspace or Microsoft 365)",
      "Communication tools (Slack, Zoom)",
      "Project management platform (Asana, Monday, Notion)",
      "Role-specific software as needed",
      "Security and VPN services"
    ],
    grantCategory: "Other Direct Costs / Supplies",
    annualCost: "$500 - $1,500 (varies by role)"
  },
  { 
    id: "system-maintenance", 
    name: "System Maintenance & IT Infrastructure", 
    description: "Organizational-level IT costs (NOT per-employee)",
    benefits: [
      "Cloud hosting and infrastructure",
      "Backup and disaster recovery services",
      "IT support and helpdesk contract",
      "Domain, SSL, and email services",
      "Security monitoring and updates"
    ],
    grantCategory: "Other Direct Costs / Contractual",
    annualCost: "$5,100 - $13,200 (organizational total)",
    budgetLevel: "organizational",
    notes: "Budget as single organizational line item, not per-employee. Can also be included in indirect costs if organization has negotiated indirect rate."
  },
];

interface OfferLetter {
  id: string;
  candidateName: string;
  candidateEmail: string;
  positionId: string;
  positionTitle: string;
  entity: string;
  department: string;
  salaryRange: string;
  offeredSalary: string;
  benefitsPackage: string;
  startDate: string;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  createdAt: string;
  sentAt?: string;
  respondedAt?: string;
  customTerms?: string;
}

// Sample offer letters for demo
const SAMPLE_OFFERS: OfferLetter[] = [
  {
    id: "offer-001",
    candidateName: "Jordan Williams",
    candidateEmail: "jordan.w@email.com",
    positionId: "grant-writer",
    positionTitle: "Grant Writer / Proposal Specialist",
    entity: "The L.A.W.S. Collective, LLC",
    department: "Grants & Proposals",
    salaryRange: "$85,000 - $115,000",
    offeredSalary: "$95,000",
    benefitsPackage: "grant-compliant",
    startDate: "2026-02-01",
    status: "sent",
    createdAt: "2026-01-10",
    sentAt: "2026-01-12"
  },
  {
    id: "offer-002",
    candidateName: "Alex Chen",
    candidateEmail: "alex.chen@email.com",
    positionId: "content-creator",
    positionTitle: "Content Creator / Media Assistant",
    entity: "Real-Eye-Nation LLC",
    department: "Media Production",
    salaryRange: "$35,000 - $55,000",
    offeredSalary: "$42,000",
    benefitsPackage: "part-time",
    startDate: "2026-01-20",
    status: "accepted",
    createdAt: "2026-01-05",
    sentAt: "2026-01-06",
    respondedAt: "2026-01-08"
  },
];

export default function HRManagement() {
  const [activeTab, setActiveTab] = useState("offers");
  const [offers, setOffers] = useState<OfferLetter[]>(SAMPLE_OFFERS);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferLetter | null>(null);
  const [showBenefitsDialog, setShowBenefitsDialog] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<typeof BENEFITS_PACKAGES[0] | null>(null);
  
  // New offer form state
  const [newOffer, setNewOffer] = useState({
    candidateName: "",
    candidateEmail: "",
    positionId: "",
    offeredSalary: "",
    benefitsPackage: "standard",
    startDate: "",
    customTerms: ""
  });

  // Check for pending offer data from requisition workflow
  useEffect(() => {
    const pendingData = sessionStorage.getItem('pendingOfferData');
    if (pendingData) {
      try {
        const offerData = JSON.parse(pendingData);
        // Find matching position or use first match by title
        const matchingPosition = POSITIONS.find(
          p => p.title.toLowerCase().includes(offerData.position?.toLowerCase() || '') ||
               p.department.toLowerCase() === offerData.department?.toLowerCase()
        );
        
        setNewOffer({
          candidateName: offerData.candidateName || "",
          candidateEmail: offerData.candidateEmail || "",
          positionId: matchingPosition?.id || "",
          offeredSalary: offerData.salaryRange?.split(' - ')[0] || "",
          benefitsPackage: (matchingPosition as any)?.recommendedBenefits || "standard",
          startDate: offerData.startDate ? new Date(offerData.startDate).toISOString().split('T')[0] : "",
          customTerms: `From Requisition #${offerData.requisitionId}`
        });
        
        setShowCreateDialog(true);
        sessionStorage.removeItem('pendingOfferData');
        toast.info("Offer form pre-filled from approved requisition");
      } catch (e) {
        console.error('Failed to parse pending offer data:', e);
        sessionStorage.removeItem('pendingOfferData');
      }
    }
  }, []);

  // Auto-fill salary range and benefits when position changes
  const handlePositionChange = (positionId: string) => {
    const position = POSITIONS.find(p => p.id === positionId) as any;
    if (position) {
      setNewOffer(prev => ({
        ...prev,
        positionId,
        offeredSalary: position.salaryRange ? position.salaryRange.split(' - ')[0] : "",
        benefitsPackage: position.recommendedBenefits || "standard"
      }));
    } else {
      setNewOffer(prev => ({ ...prev, positionId }));
    }
  };

  const handleCreateOffer = () => {
    const position = POSITIONS.find(p => p.id === newOffer.positionId) as any;
    if (!position) {
      toast.error("Please select a position");
      return;
    }
    
    const offer: OfferLetter = {
      id: `offer-${Date.now()}`,
      candidateName: newOffer.candidateName,
      candidateEmail: newOffer.candidateEmail,
      positionId: newOffer.positionId,
      positionTitle: position.title,
      entity: position.entity,
      department: position.department,
      salaryRange: position.salaryRange || "Negotiable",
      offeredSalary: newOffer.offeredSalary,
      benefitsPackage: newOffer.benefitsPackage,
      startDate: newOffer.startDate,
      status: "draft",
      createdAt: new Date().toISOString().split('T')[0],
      customTerms: newOffer.customTerms
    };
    
    setOffers([offer, ...offers]);
    setShowCreateDialog(false);
    setNewOffer({ candidateName: "", candidateEmail: "", positionId: "", offeredSalary: "", benefitsPackage: "standard", startDate: "", customTerms: "" });
    toast.success("Offer letter created as draft");
  };

  const handleSendOffer = (offer: OfferLetter) => {
    setOffers(offers.map(o => 
      o.id === offer.id 
        ? { ...o, status: "sent" as const, sentAt: new Date().toISOString().split('T')[0] }
        : o
    ));
    toast.success(`Offer letter sent to ${offer.candidateName}`);
  };

  const handlePreviewOffer = (offer: OfferLetter) => {
    setSelectedOffer(offer);
    setShowPreviewDialog(true);
  };

  const handleViewBenefits = (pkg: typeof BENEFITS_PACKAGES[0]) => {
    setSelectedBenefits(pkg);
    setShowBenefitsDialog(true);
  };

  const getStatusBadge = (status: OfferLetter["status"]) => {
    switch (status) {
      case "draft": return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Draft</Badge>;
      case "sent": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Sent</Badge>;
      case "accepted": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Accepted</Badge>;
      case "declined": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Declined</Badge>;
      case "expired": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Expired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const draftOffers = offers.filter(o => o.status === "draft");
  const sentOffers = offers.filter(o => o.status === "sent");
  const acceptedOffers = offers.filter(o => o.status === "accepted");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">HR Management</h1>
            <p className="text-muted-foreground">Offer letters, benefits packages, and employee management</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Offer Letter
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{draftOffers.length}</p>
                  <p className="text-sm text-muted-foreground">Draft Offers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sentOffers.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{acceptedOffers.length}</p>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{POSITIONS.length}</p>
                  <p className="text-sm text-muted-foreground">Open Positions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="offers">Offer Letters</TabsTrigger>
            <TabsTrigger value="benefits">Benefits Packages</TabsTrigger>
            <TabsTrigger value="positions">Open Positions</TabsTrigger>
          </TabsList>

          {/* Offer Letters Tab */}
          <TabsContent value="offers" className="space-y-4 mt-6">
            {offers.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No offer letters yet. Create your first one!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <Card key={offer.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{offer.candidateName}</h3>
                            {getStatusBadge(offer.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{offer.positionTitle}</p>
                          <p className="text-xs text-muted-foreground">{offer.entity}</p>
                          <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {offer.candidateEmail}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Start: {offer.startDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {BENEFITS_PACKAGES.find(b => b.id === offer.benefitsPackage)?.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handlePreviewOffer(offer)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          {offer.status === "draft" && (
                            <>
                              <Button variant="outline" size="sm">
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" onClick={() => handleSendOffer(offer)}>
                                <Send className="w-4 h-4 mr-1" />
                                Send
                              </Button>
                            </>
                          )}
                          {offer.status === "sent" && (
                            <Button variant="outline" size="sm">
                              <Send className="w-4 h-4 mr-1" />
                              Resend
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Benefits Packages Tab */}
          <TabsContent value="benefits" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BENEFITS_PACKAGES.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      {pkg.name}
                    </CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {pkg.benefits.slice(0, 4).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                      {pkg.benefits.length > 4 && (
                        <li className="text-sm text-muted-foreground">
                          +{pkg.benefits.length - 4} more benefits
                        </li>
                      )}
                    </ul>
                    {pkg.notes && (
                      <p className="text-xs text-muted-foreground italic mb-4">{pkg.notes}</p>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => handleViewBenefits(pkg)}>
                      View Full Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Grant-Compliant Benefits
                </CardTitle>
                <CardDescription>
                  When applying for grants that require traditional employee benefits, use the Grant-Compliant Benefits Package.
                  This ensures we meet grant requirements while maintaining our ownership-based compensation model.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Important:</strong> When preparing grant proposals, coordinate with the Grant Writer to ensure 
                    benefit costs are properly budgeted. Common grant-required benefits include:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                    <li>• Health insurance (employer contribution)</li>
                    <li>• Retirement plan matching (typically 3-6%)</li>
                    <li>• Paid time off (vacation, sick leave)</li>
                    <li>• Workers' compensation insurance</li>
                    <li>• Professional development allowance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Open Positions Tab */}
          <TabsContent value="positions" className="space-y-4 mt-6">
            <div className="space-y-4">
              {POSITIONS.map((position) => (
                <Card key={position.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{position.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{position.entity}</span>
                        </div>
                        <Badge variant="outline" className="mt-2">{position.department}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setNewOffer({ ...newOffer, positionId: position.id });
                          setShowCreateDialog(true);
                        }}>
                          <Plus className="w-4 h-4 mr-1" />
                          Create Offer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Offer Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Offer Letter</DialogTitle>
              <DialogDescription>
                Create a new offer letter for a candidate. The letter will be saved as a draft until you send it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidateName">Candidate Name</Label>
                  <Input
                    id="candidateName"
                    placeholder="Full name"
                    value={newOffer.candidateName}
                    onChange={(e) => setNewOffer({ ...newOffer, candidateName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidateEmail">Candidate Email</Label>
                  <Input
                    id="candidateEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={newOffer.candidateEmail}
                    onChange={(e) => setNewOffer({ ...newOffer, candidateEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={newOffer.positionId} onValueChange={handlePositionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">Manager Positions (Tier 3)</div>
                    {POSITIONS.filter(p => p.tier === "tier3_open").map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        <span className="flex items-center gap-2">
                          <span>{pos.title}</span>
                          <span className="text-xs text-muted-foreground">({pos.department})</span>
                        </span>
                      </SelectItem>
                    ))}
                    <Separator className="my-1" />
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">Coordinator Positions (Tier 4)</div>
                    {POSITIONS.filter(p => p.tier === "tier4_coordinator").map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        <span className="flex items-center gap-2">
                          <span>{pos.title}</span>
                          <span className="text-xs text-muted-foreground">({pos.department})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newOffer.positionId && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Salary Range:</span>
                    <span className="font-medium">
                      {(POSITIONS.find(p => p.id === newOffer.positionId) as any)?.salaryRange || "Negotiable"}
                    </span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offeredSalary">Offered Salary</Label>
                  <Input
                    id="offeredSalary"
                    placeholder="$XX,XXX"
                    value={newOffer.offeredSalary}
                    onChange={(e) => setNewOffer({ ...newOffer, offeredSalary: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Auto-filled from position range (editable)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benefitsPackage">Benefits Package</Label>
                  <Select value={newOffer.benefitsPackage} onValueChange={(v) => setNewOffer({ ...newOffer, benefitsPackage: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      {BENEFITS_PACKAGES.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Auto-selected based on position type</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Proposed Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newOffer.startDate}
                  onChange={(e) => setNewOffer({ ...newOffer, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customTerms">Custom Terms (Optional)</Label>
                <Textarea
                  id="customTerms"
                  placeholder="Add any custom terms or conditions..."
                  value={newOffer.customTerms}
                  onChange={(e) => setNewOffer({ ...newOffer, customTerms: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateOffer}>Create Draft</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Offer Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Offer Letter Preview</DialogTitle>
            </DialogHeader>
            {selectedOffer && (
              <div className="py-4">
                <div className="border rounded-lg p-8 bg-white dark:bg-gray-900">
                  {/* Letter Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-primary">{selectedOffer.entity}</h2>
                    <p className="text-sm text-muted-foreground">Building Multi-Generational Wealth Through Purpose & Community</p>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                    
                    <div>
                      <p className="font-medium">{selectedOffer.candidateName}</p>
                      <p className="text-sm text-muted-foreground">{selectedOffer.candidateEmail}</p>
                    </div>
                    
                    <p className="mt-6">Dear {selectedOffer.candidateName.split(' ')[0]},</p>
                    
                    <p>
                      We are pleased to extend this offer of membership and employment with <strong>{selectedOffer.entity}</strong>.
                    </p>
                    
                    <div className="bg-muted p-4 rounded-lg my-6">
                      <h3 className="font-semibold mb-2">Position Details</h3>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="py-1 text-muted-foreground">Position:</td>
                            <td className="py-1 font-medium">{selectedOffer.positionTitle}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-muted-foreground">Entity:</td>
                            <td className="py-1">{selectedOffer.entity}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-muted-foreground">Start Date:</td>
                            <td className="py-1">{selectedOffer.startDate}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-muted-foreground">Benefits Package:</td>
                            <td className="py-1">{BENEFITS_PACKAGES.find(b => b.id === selectedOffer.benefitsPackage)?.name}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <h3 className="font-semibold">Compensation & Benefits</h3>
                    <p>
                      As a member of our organization, you will receive the following benefits as part of the 
                      {" "}{BENEFITS_PACKAGES.find(b => b.id === selectedOffer.benefitsPackage)?.name}:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      {BENEFITS_PACKAGES.find(b => b.id === selectedOffer.benefitsPackage)?.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                    
                    {selectedOffer.customTerms && (
                      <>
                        <h3 className="font-semibold mt-4">Additional Terms</h3>
                        <p className="text-sm">{selectedOffer.customTerms}</p>
                      </>
                    )}
                    
                    <p className="mt-6">
                      This offer is contingent upon successful completion of our onboarding process, including 
                      completion of required Academy certifications and signing of the Organization Agreement.
                    </p>
                    
                    <p>
                      Please indicate your acceptance of this offer by signing below and returning this letter 
                      within 7 business days.
                    </p>
                    
                    <div className="mt-8">
                      <p>Sincerely,</p>
                      <p className="font-medium mt-4">LaShanna Russell</p>
                      <p className="text-sm text-muted-foreground">Founder & Managing Member</p>
                      <p className="text-sm text-muted-foreground">{selectedOffer.entity}</p>
                    </div>
                    
                    <Separator className="my-8" />
                    
                    <div className="space-y-4">
                      <p className="font-medium">Acceptance</p>
                      <p className="text-sm">
                        I, {selectedOffer.candidateName}, accept this offer of membership and employment with 
                        {" "}{selectedOffer.entity} under the terms described above.
                      </p>
                      <div className="grid grid-cols-2 gap-8 mt-6">
                        <div>
                          <div className="border-b border-gray-400 mb-1 h-8"></div>
                          <p className="text-sm text-muted-foreground">Signature</p>
                        </div>
                        <div>
                          <div className="border-b border-gray-400 mb-1 h-8"></div>
                          <p className="text-sm text-muted-foreground">Date</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => toast.success("Copied to clipboard")}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={() => toast.success("Printing...")}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={() => toast.success("Downloaded as PDF")}>
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Benefits Details Dialog */}
        <Dialog open={showBenefitsDialog} onOpenChange={setShowBenefitsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedBenefits?.name}</DialogTitle>
              <DialogDescription>{selectedBenefits?.description}</DialogDescription>
            </DialogHeader>
            {selectedBenefits && (
              <div className="py-4">
                <h3 className="font-semibold mb-4">Included Benefits</h3>
                <ul className="space-y-3">
                  {selectedBenefits.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                {selectedBenefits.notes && (
                  <p className="mt-4 text-sm text-muted-foreground italic">{selectedBenefits.notes}</p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBenefitsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
