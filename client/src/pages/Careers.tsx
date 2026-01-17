import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  Building2, 
  MapPin, 
  Clock, 
  Briefcase,
  Heart,
  Users,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Send,
  FileText,
  Upload,
  Sparkles,
  Target,
  Globe,
  DollarSign,
  Wifi,
  Laptop,
  Shirt,
  X,
  Loader2
} from "lucide-react";
import { Link } from "wouter";

const POSITIONS = [
  { 
    id: "hr-lead", 
    title: "HR Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Human Resources",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Build and maintain the human capital infrastructure across all five subsidiary entities. Oversee talent acquisition, onboarding, training coordination, performance management, and employee relations.",
    requirements: ["3+ years HR experience", "Strong interpersonal skills", "HR systems proficiency", "Employment law knowledge"],
    category: "operations"
  },
  { 
    id: "qaqc-lead", 
    title: "QA/QC Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Quality Assurance",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Establish and maintain quality standards across all subsidiary entities. Ensure deliverables meet organizational standards and grant compliance requirements are satisfied.",
    requirements: ["3+ years QA/compliance experience", "Strong attention to detail", "Technical writing skills", "Process documentation"],
    category: "operations"
  },
  { 
    id: "purchasing-lead", 
    title: "Purchasing Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Purchasing",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$80,000 - $110,000",
    description: "Manage procurement operations across all subsidiary entities. Handle vendor relationships, cost control, inventory tracking, and grant compliance for purchasing activities.",
    requirements: ["2+ years purchasing experience", "Negotiation skills", "Spreadsheet proficiency", "Basic accounting knowledge"],
    category: "operations"
  },
  { 
    id: "operations-manager", 
    title: "Operations Manager", 
    entity: "LuvOnPurpose Autonomous Wealth System LLC",
    entityShort: "LAWS LLC",
    department: "Operations",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Ensure smooth day-to-day operations across all subsidiary entities. Coordinate workflows, monitor business systems, identify bottlenecks, and provide support to team members.",
    requirements: ["3+ years operations experience", "Strong organizational skills", "Excellent communication", "Problem-solving mindset"],
    category: "operations"
  },
  { 
    id: "outreach-coordinator", 
    title: "Outreach Coordinator", 
    entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
    entityShort: "Temple/508",
    department: "Community Outreach",
    type: "Full-Time",
    location: "Hybrid",
    salaryRange: "$65,000 - $85,000",
    description: "Connect the organization with the broader community through events, partnerships, and relationship building. Plan community events, build partner relationships, and coordinate volunteers.",
    requirements: ["2+ years outreach experience", "Strong interpersonal skills", "Event planning ability", "Public speaking comfort"],
    category: "community"
  },
  { 
    id: "content-creator", 
    title: "Content Creator / Media Assistant", 
    entity: "Real-Eye-Nation LLC",
    entityShort: "Real-Eye",
    department: "Media Production",
    type: "Part-Time to Full-Time",
    location: "Remote + On-location",
    salaryRange: "$35,000 - $55,000",
    description: "Support the media production mission by creating social media content, documenting events, editing videos, and writing copy for marketing materials.",
    requirements: ["Portfolio required", "Photography/videography skills", "Video editing ability", "Social media knowledge"],
    category: "media"
  },
  { 
    id: "academy-instructor", 
    title: "Academy Instructor / Curriculum Developer", 
    entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
    entityShort: "Temple/508",
    department: "Education",
    type: "Part-Time to Full-Time",
    location: "Remote + Occasional In-Person",
    salaryRange: "$75,000 - $100,000",
    description: "Deliver educational content and develop new courses for the LuvOnPurpose Academy. Teach courses, create curriculum, develop assessments, and track student progress.",
    requirements: ["Subject matter expertise", "Teaching experience", "Clear communication", "Online teaching comfort"],
    category: "education"
  },
  { 
    id: "grant-writer", 
    title: "Grant Writer / Proposal Specialist", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Grants & Proposals",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Identify funding opportunities and write compelling proposals to secure grants for all subsidiary entities. Research opportunities, develop narratives, create budgets, and manage deadlines.",
    requirements: ["2+ years grant writing", "Strong writing skills", "Deadline management", "Research abilities"],
    category: "operations"
  },
  { 
    id: "platform-admin", 
    title: "Platform Administrator", 
    entity: "LuvOnPurpose Autonomous Wealth System LLC",
    entityShort: "LAWS LLC",
    department: "Technology",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$95,000 - $130,000",
    description: "Maintain and improve the technology infrastructure of the organization. Monitor system health, manage user accounts, implement new features, and ensure security.",
    requirements: ["2+ years IT administration", "Tech-savvy", "Security-conscious", "User support patience"],
    category: "technology"
  },
  { 
    id: "programs-coordinator", 
    title: "Community Programs Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Community Programs",
    type: "Full-Time",
    location: "Hybrid",
    salaryRange: "$80,000 - $110,000",
    description: "Develop and manage programs based on the L.A.W.S. framework (Land, Air, Water, Self) that help community members reconnect with their roots, gain knowledge, find balance, and discover purpose.",
    requirements: ["2+ years program management", "Community development passion", "Organizational skills", "Cultural sensitivity"],
    category: "community"
  },
  { 
    id: "lead-ops-coordinator", 
    title: "Lead Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Operations",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$68,000 - $88,000",
    description: "Oversee all department Operations Coordinator staff across the organization. Serve as the primary support to the executive team while supervising HR, QA/QC, Purchasing, Operations, and Education Operations Coordinator staff.",
    requirements: ["3+ years operations/admin leadership", "Team leadership experience", "Process management skills", "Remote team coordination"],
    category: "operations"
  },
  { 
    id: "ops-coordinator-hr", 
    title: "HR Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Human Resources",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $68,000",
    description: "Provide day-to-day administrative assistance to the HR Department. Handle scheduling, document management, candidate coordination, and employee record maintenance.",
    requirements: ["1+ years admin/HR support", "Organization skills", "Microsoft Office/Google Workspace", "Data entry proficiency"],
    category: "operations"
  },
  { 
    id: "ops-coordinator-qaqc", 
    title: "QA/QC Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Quality Assurance",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $68,000",
    description: "Assist the Quality Department with documentation, tracking, and compliance activities. Maintain quality records, track audit findings, and support process improvement initiatives.",
    requirements: ["1+ years admin/quality support", "Attention to detail", "Documentation skills", "Process tracking"],
    category: "operations"
  },
  { 
    id: "ops-coordinator-purchasing", 
    title: "Purchasing Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Purchasing",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $68,000",
    description: "Assist with procurement operations including order processing, vendor communications, and inventory tracking. Ensure accurate records and timely processing of purchases.",
    requirements: ["1+ years admin/purchasing support", "Data entry skills", "Vendor communication", "Invoice processing"],
    category: "operations"
  },
  { 
    id: "ops-coordinator-operations", 
    title: "Operations Operations Coordinator", 
    entity: "LuvOnPurpose Autonomous Wealth System LLC",
    entityShort: "LAWS LLC",
    department: "Operations",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $68,000",
    description: "Provide day-to-day assistance to the Operations team. Handle scheduling, project tracking, communications, and general administrative tasks to keep operations running smoothly.",
    requirements: ["1+ years admin/operations support", "Organization skills", "Multitasking ability", "Project tracking"],
    category: "operations"
  },
  { 
    id: "ops-coordinator-education", 
    title: "Education Operations Coordinator", 
    entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
    entityShort: "Temple/508",
    department: "Education",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $68,000",
    description: "Provide administrative support to the Education Department and Academy. Assist with student enrollment, course scheduling, materials preparation, and instructor coordination.",
    requirements: ["1+ years admin/education support", "Organization skills", "Student communication", "LMS familiarity preferred"],
    category: "education"
  },
  { 
    id: "ops-coordinator-health", 
    title: "Health Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Health",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$55,000 - $72,000",
    description: "Support community wellness initiatives within the L.A.W.S. framework (WATER pillar - Healing & Balance). Coordinate health programs, track wellness metrics, and help community members access health resources.",
    requirements: ["1+ years health/wellness coordination", "Organization skills", "Compassionate approach", "Health resource knowledge"],
    category: "health"
  },
];

const CATEGORIES = [
  { id: "all", label: "All Positions", count: POSITIONS.length },
  { id: "operations", label: "Operations", count: POSITIONS.filter(p => p.category === "operations").length },
  { id: "community", label: "Community", count: POSITIONS.filter(p => p.category === "community").length },
  { id: "education", label: "Education", count: POSITIONS.filter(p => p.category === "education").length },
  { id: "health", label: "Health", count: POSITIONS.filter(p => p.category === "health").length },
  { id: "media", label: "Media", count: POSITIONS.filter(p => p.category === "media").length },
  { id: "technology", label: "Technology", count: POSITIONS.filter(p => p.category === "technology").length },
];

const BENEFITS = [
  { icon: Heart, title: "Ownership Stake", description: "Become a true stakeholder in the organization you help build" },
  { icon: GraduationCap, title: "Free Certifications", description: "Access to all Academy courses and certifications at no cost" },
  { icon: Clock, title: "Flexible Schedule", description: "Work arrangements that fit your life and responsibilities" },
  { icon: Users, title: "Governance Voice", description: "Participate in decisions that shape the organization's future" },
  { icon: Target, title: "Purpose-Driven Work", description: "Make a real impact on families and communities" },
  { icon: Globe, title: "Remote-First", description: "Work from anywhere with occasional in-person gatherings" },
  { icon: Wifi, title: "Utilities Stipend", description: "Monthly support for internet and electricity costs" },
  { icon: Laptop, title: "Equipment Provided", description: "Laptop, phone, and software licenses included" },
  { icon: Shirt, title: "Wardrobe Budget", description: "Professional appearance allowance for public-facing roles" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export default function Careers() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<typeof POSITIONS[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [application, setApplication] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentRole: "",
    yearsExperience: "",
    relevantSkills: "",
    whyInterested: "",
    coverLetter: ""
  });

  const submitMutation = trpc.jobApplications.submit.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowApplyDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application. Please try again.");
      setIsSubmitting(false);
    }
  });

  const filteredPositions = selectedCategory === "all" 
    ? POSITIONS 
    : POSITIONS.filter(p => p.category === selectedCategory);

  const handleApply = (position: typeof POSITIONS[0]) => {
    setSelectedPosition(position);
    setShowApplyDialog(true);
  };

  const resetForm = () => {
    setApplication({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      currentRole: "",
      yearsExperience: "",
      relevantSkills: "",
      whyInterested: "",
      coverLetter: ""
    });
    setResumeFile(null);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setResumeFile(file);
  };

  const removeResume = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitApplication = async () => {
    if (!application.firstName || !application.lastName || !application.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let resumeData: string | undefined;
      let resumeFileName: string | undefined;
      let resumeMimeType: string | undefined;

      // Convert resume file to base64 if provided
      if (resumeFile) {
        const reader = new FileReader();
        resumeData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(resumeFile);
        });
        resumeFileName = resumeFile.name;
        resumeMimeType = resumeFile.type;
      }

      await submitMutation.mutateAsync({
        positionId: selectedPosition?.id || "general-interest",
        positionTitle: selectedPosition?.title || "General Interest",
        entity: selectedPosition?.entity || "LuvOnPurpose Family Enterprise",
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone || undefined,
        currentRole: application.currentRole || undefined,
        yearsExperience: application.yearsExperience || undefined,
        relevantSkills: application.relevantSkills || undefined,
        whyInterested: application.whyInterested || undefined,
        coverLetter: application.coverLetter || undefined,
        resumeData,
        resumeFileName,
        resumeMimeType,
      });
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <div>
                  <span className="font-bold text-foreground">The L.A.W.S. Collective, LLC</span>
                  <span className="text-xs text-muted-foreground block">Land • Air • Water • Self</span>
                </div>
              </a>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</a>
              </Link>
              <Link href="/academy">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Academy</a>
              </Link>
              <Link href="/pricing">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</a>
              </Link>
              <span className="text-sm font-medium text-primary">Careers</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">We're Hiring</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join Our Mission to Build
              <span className="text-primary"> Generational Wealth</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              We're building something different—a family enterprise focused on community development, 
              education, and creating lasting prosperity. Join us and become a true stakeholder in our shared success.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => document.getElementById('positions')?.scrollIntoView({ behavior: 'smooth' })}>
                View Open Positions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/getting-started">
                  <a>Learn About Us</a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Why Join LuvOnPurpose?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, idx) => (
              <Card key={idx} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Positions Section */}
      <section id="positions" className="py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">Open Positions</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're looking for passionate individuals who believe in family, community, and building something that lasts.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label} ({cat.count})
              </Button>
            ))}
          </div>

          {/* Position Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPositions.map((position) => (
              <Card key={position.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{position.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Building2 className="w-4 h-4" />
                        {position.entity}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{position.entityShort}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{position.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {position.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      {position.location}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {position.department}
                    </Badge>
                    <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {position.salaryRange}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Requirements:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {position.requirements.slice(0, 3).map((req, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full" onClick={() => handleApply(position)}>
                    Apply Now
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Don't See the Right Fit?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our vision. 
            Send us your information and we'll keep you in mind for future opportunities.
          </p>
          <Button variant="outline" size="lg" onClick={() => {
            setSelectedPosition(null);
            setShowApplyDialog(true);
          }}>
            <FileText className="w-4 h-4 mr-2" />
            Submit General Interest
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 LuvOnPurpose Family Enterprise. Building Multi-Generational Wealth Through Purpose & Community.
            </p>
            <div className="flex gap-4">
              <Link href="/">
                <a className="text-sm text-muted-foreground hover:text-foreground">Home</a>
              </Link>
              <Link href="/academy">
                <a className="text-sm text-muted-foreground hover:text-foreground">Academy</a>
              </Link>
              <Link href="/pricing">
                <a className="text-sm text-muted-foreground hover:text-foreground">Services</a>
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={(open) => {
        setShowApplyDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPosition ? `Apply for ${selectedPosition.title}` : "Express Interest"}
            </DialogTitle>
            <DialogDescription>
              {selectedPosition 
                ? `Submit your application for the ${selectedPosition.title} position at ${selectedPosition.entity}.`
                : "Tell us about yourself and we'll keep you in mind for future opportunities."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Your first name"
                  value={application.firstName}
                  onChange={(e) => setApplication({ ...application, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Your last name"
                  value={application.lastName}
                  onChange={(e) => setApplication({ ...application, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={application.email}
                  onChange={(e) => setApplication({ ...application, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={application.phone}
                  onChange={(e) => setApplication({ ...application, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  placeholder="Your current job title"
                  value={application.currentRole}
                  onChange={(e) => setApplication({ ...application, currentRole: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  placeholder="e.g., 5 years"
                  value={application.yearsExperience}
                  onChange={(e) => setApplication({ ...application, yearsExperience: e.target.value })}
                />
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="resume">Resume / CV</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {resumeFile ? (
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{resumeFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(resumeFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeResume}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your resume, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      PDF or Word document, max 5MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relevantSkills">Relevant Skills</Label>
              <Textarea
                id="relevantSkills"
                placeholder="List your relevant skills and experience..."
                value={application.relevantSkills}
                onChange={(e) => setApplication({ ...application, relevantSkills: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whyInterested">Why are you interested?</Label>
              <Textarea
                id="whyInterested"
                placeholder="Tell us why you're interested in joining LuvOnPurpose..."
                value={application.whyInterested}
                onChange={(e) => setApplication({ ...application, whyInterested: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <Textarea
                id="coverLetter"
                placeholder="Add a brief cover letter..."
                value={application.coverLetter}
                onChange={(e) => setApplication({ ...application, coverLetter: e.target.value })}
                rows={4}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Your application will be reviewed by our HR team. 
                We typically respond within 5-7 business days if there's a good fit.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitApplication} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
