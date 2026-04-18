import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Handshake, Building2, Users, GraduationCap, Briefcase,
  MapPin, Calendar, Plus, Search, Star, Target,
  CheckCircle, Clock, ArrowRight, Award, TrendingUp,
  FileText, Phone, Mail, Globe, ExternalLink
} from "lucide-react";
import { toast } from "sonner";

// Partner organization types
const PARTNER_TYPES = [
  { value: "trade_union", label: "Trade Union / Labor Organization" },
  { value: "vocational_school", label: "Vocational / Technical School" },
  { value: "community_college", label: "Community College" },
  { value: "corporation", label: "Corporation / Business" },
  { value: "nonprofit", label: "Nonprofit Organization" },
  { value: "government", label: "Government Agency" },
  { value: "professional_association", label: "Professional Association" },
  { value: "cooperative", label: "Cooperative / Co-op" },
];

// Apprenticeship trade categories
const TRADE_CATEGORIES = [
  { value: "construction", label: "Construction & Building Trades", icon: "🏗️" },
  { value: "electrical", label: "Electrical & Electronics", icon: "⚡" },
  { value: "plumbing", label: "Plumbing & Pipefitting", icon: "🔧" },
  { value: "hvac", label: "HVAC & Refrigeration", icon: "❄️" },
  { value: "automotive", label: "Automotive & Diesel", icon: "🚗" },
  { value: "welding", label: "Welding & Metalwork", icon: "🔥" },
  { value: "carpentry", label: "Carpentry & Woodworking", icon: "🪵" },
  { value: "healthcare", label: "Healthcare & Allied Health", icon: "🏥" },
  { value: "culinary", label: "Culinary Arts & Hospitality", icon: "👨‍🍳" },
  { value: "technology", label: "Information Technology", icon: "💻" },
  { value: "media", label: "Media Production & Design", icon: "🎬" },
  { value: "agriculture", label: "Agriculture & Horticulture", icon: "🌱" },
  { value: "business", label: "Business & Entrepreneurship", icon: "📊" },
  { value: "performing_arts", label: "Performing Arts", icon: "🎭" },
  { value: "renewable_energy", label: "Renewable Energy & Solar", icon: "☀️" },
];

// Sample partner organizations (will be replaced by DB data)
const SAMPLE_PARTNERS = [
  {
    id: 1, name: "National Joint Apprenticeship & Training Committee (NJATC)",
    type: "trade_union", category: "electrical",
    location: "National", status: "active",
    description: "Premier electrical apprenticeship program providing 5-year training combining classroom instruction with on-the-job training.",
    contact: "partnerships@njatc.org", phone: "(301) 715-2300",
    website: "https://njatc.org",
    slotsAvailable: 12, totalPlacements: 0,
    certificationOffered: "Journeyman Electrician",
    durationMonths: 60, paidTraining: true,
  },
  {
    id: 2, name: "YouthBuild USA",
    type: "nonprofit", category: "construction",
    location: "Multiple Cities", status: "active",
    description: "Community-based program for young adults 16-24 to earn GED/diploma while learning construction skills building affordable housing.",
    contact: "info@youthbuild.org", phone: "(617) 741-6500",
    website: "https://youthbuild.org",
    slotsAvailable: 20, totalPlacements: 0,
    certificationOffered: "OSHA 10, NCCER Core",
    durationMonths: 12, paidTraining: true,
  },
  {
    id: 3, name: "Per Scholas",
    type: "nonprofit", category: "technology",
    location: "National (15 cities)", status: "active",
    description: "Free technology training and career development for underserved communities. Programs in IT Support, Cybersecurity, Cloud, and Software Engineering.",
    contact: "partnerships@perscholas.org", phone: "(718) 991-8400",
    website: "https://perscholas.org",
    slotsAvailable: 30, totalPlacements: 0,
    certificationOffered: "CompTIA A+, AWS, Google IT",
    durationMonths: 4, paidTraining: false,
  },
  {
    id: 4, name: "Helmets to Hardhats",
    type: "professional_association", category: "construction",
    location: "National", status: "prospective",
    description: "Connects transitioning military service members with quality careers in the construction industry through registered apprenticeship programs.",
    contact: "info@helmetstohardhats.org", phone: "(866) 741-6210",
    website: "https://helmetstohardhats.org",
    slotsAvailable: 15, totalPlacements: 0,
    certificationOffered: "Various trade certifications",
    durationMonths: 48, paidTraining: true,
  },
  {
    id: 5, name: "Year Up",
    type: "nonprofit", category: "business",
    location: "National (30+ cities)", status: "active",
    description: "One-year workforce development program providing professional training, college credits, and corporate internships for young adults.",
    contact: "partnerships@yearup.org", phone: "(617) 542-1533",
    website: "https://yearup.org",
    slotsAvailable: 25, totalPlacements: 0,
    certificationOffered: "College Credits, Professional Certifications",
    durationMonths: 12, paidTraining: true,
  },
  {
    id: 6, name: "Apprenti (Washington Technology Industry Association)",
    type: "professional_association", category: "technology",
    location: "National", status: "prospective",
    description: "Tech apprenticeship intermediary connecting diverse talent to companies like Microsoft, Amazon, and JP Morgan Chase.",
    contact: "info@apprenticareers.org", phone: "(206) 448-3033",
    website: "https://apprenticareers.org",
    slotsAvailable: 10, totalPlacements: 0,
    certificationOffered: "Registered Apprenticeship Certificate",
    durationMonths: 12, paidTraining: true,
  },
];

// Sample student placements
const SAMPLE_PLACEMENTS = [
  { id: 1, studentName: "Pending First Placement", partnerId: 1, trade: "electrical", status: "available", startDate: null },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  prospective: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  negotiating: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  paused: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function ApprenticeshipPartnerships() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddPartnerDialog, setShowAddPartnerDialog] = useState(false);

  const filteredPartners = useMemo(() => {
    let result = SAMPLE_PARTNERS;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter(p => p.category === categoryFilter);
    }
    return result;
  }, [searchQuery, categoryFilter]);

  const activePartners = SAMPLE_PARTNERS.filter(p => p.status === "active");
  const totalSlots = SAMPLE_PARTNERS.reduce((sum, p) => sum + p.slotsAvailable, 0);
  const totalPlacements = SAMPLE_PARTNERS.reduce((sum, p) => sum + p.totalPlacements, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Handshake className="w-8 h-8 text-amber-500" />
              Apprenticeship Partnerships
            </h1>
            <p className="text-muted-foreground mt-1">
              LuvOnPurpose Academy &amp; Outreach — External Program Partnerships &amp; Student Placement
            </p>
          </div>
          <Dialog open={showAddPartnerDialog} onOpenChange={setShowAddPartnerDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Partnership Organization</DialogTitle>
                <DialogDescription>Register a new apprenticeship partner for student placement opportunities.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                toast.success("Partner organization added — feature coming soon with database integration");
                setShowAddPartnerDialog(false);
              }} className="space-y-4 pt-4">
                <div>
                  <Label>Organization Name</Label>
                  <Input required placeholder="e.g., National Joint Apprenticeship Committee" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select defaultValue="trade_union">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PARTNER_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Trade Category</Label>
                    <Select defaultValue="construction">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TRADE_CATEGORIES.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input placeholder="City, State or National" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the partnership opportunity..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Email</Label>
                    <Input type="email" placeholder="contact@org.com" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input placeholder="(555) 123-4567" />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Partner Organization</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Handshake className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{SAMPLE_PARTNERS.length}</p>
                  <p className="text-xs text-muted-foreground">Total Partners</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activePartners.length}</p>
                  <p className="text-xs text-muted-foreground">Active Partners</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSlots}</p>
                  <p className="text-xs text-muted-foreground">Available Slots</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPlacements}</p>
                  <p className="text-xs text-muted-foreground">Student Placements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="trades">Trade Categories</TabsTrigger>
            <TabsTrigger value="placements">Placements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mission Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Academy Apprenticeship Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    The LuvOnPurpose Academy partners with established apprenticeship programs, trade unions, 
                    vocational schools, and industry leaders to provide students with real-world career pathways. 
                    Our goal is to bridge the gap between academic learning and skilled employment, ensuring every 
                    student has access to paid training, industry certifications, and mentorship opportunities 
                    that lead to sustainable careers and generational wealth.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Briefcase className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                      <p className="font-semibold text-sm">Skilled Trades</p>
                      <p className="text-xs text-muted-foreground">Construction, Electrical, HVAC, Welding</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <GraduationCap className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                      <p className="font-semibold text-sm">Certifications</p>
                      <p className="text-xs text-muted-foreground">Industry-recognized credentials</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
                      <p className="font-semibold text-sm">Career Pathways</p>
                      <p className="text-xs text-muted-foreground">From training to employment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Partners */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Active Partnerships</CardTitle>
                  <CardDescription>Organizations with active placement agreements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activePartners.map(partner => (
                      <div key={partner.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="text-lg">{TRADE_CATEGORIES.find(c => c.value === partner.category)?.icon || "🏢"}</div>
                          <div>
                            <p className="font-medium text-sm">{partner.name}</p>
                            <p className="text-xs text-muted-foreground">{partner.location}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">{partner.slotsAvailable} slots</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trade Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trade Coverage</CardTitle>
                  <CardDescription>Apprenticeship categories with partner coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {TRADE_CATEGORIES.slice(0, 8).map(trade => {
                      const count = SAMPLE_PARTNERS.filter(p => p.category === trade.value).length;
                      return (
                        <div key={trade.value} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{trade.icon}</span>
                            <span className="text-sm">{trade.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={count > 0 ? Math.min(count * 33, 100) : 0} className="w-20 h-2" />
                            <span className="text-xs text-muted-foreground w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-4 mt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TRADE_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredPartners.map(partner => (
                <Card key={partner.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl">
                        {TRADE_CATEGORIES.find(c => c.value === partner.category)?.icon || "🏢"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{partner.name}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {partner.location}</span>
                              <span className="capitalize">{partner.type.replace(/_/g, " ")}</span>
                            </div>
                          </div>
                          <Badge className={statusColors[partner.status] || ""}>{partner.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">{partner.description}</p>
                        <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {partner.certificationOffered}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {partner.durationMonths} months</span>
                          <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {partner.slotsAvailable} slots available</span>
                          {partner.paidTraining && (
                            <Badge variant="outline" className="text-green-600 border-green-300 text-xs">Paid Training</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          {partner.website && (
                            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => window.open(partner.website, "_blank")}>
                              <Globe className="w-3 h-3" /> Website
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => toast.info(`Contact: ${partner.contact}`)}>
                            <Mail className="w-3 h-3" /> Contact
                          </Button>
                          <Button size="sm" className="gap-1 text-xs" onClick={() => toast.success("Placement request initiated — feature coming soon")}>
                            <ArrowRight className="w-3 h-3" /> Request Placement
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trade Categories Tab */}
          <TabsContent value="trades" className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Available Trade Categories</h3>
            <p className="text-sm text-muted-foreground">
              The Academy connects students with apprenticeship opportunities across these skilled trade categories.
              Each category includes partner organizations offering paid training, certifications, and career placement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRADE_CATEGORIES.map(trade => {
                const partners = SAMPLE_PARTNERS.filter(p => p.category === trade.value);
                return (
                  <Card key={trade.value} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{trade.icon}</span>
                        <div>
                          <h4 className="font-semibold">{trade.label}</h4>
                          <p className="text-xs text-muted-foreground">{partners.length} partner{partners.length !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      {partners.length > 0 ? (
                        <div className="space-y-2">
                          {partners.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                              <span className="truncate">{p.name}</span>
                              <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">{p.slotsAvailable}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Seeking partners — contact us to establish a partnership</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Placements Tab */}
          <TabsContent value="placements" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Student Placements</h3>
                <p className="text-sm text-muted-foreground">Track student apprenticeship placements and progress</p>
              </div>
              <Button className="gap-2" onClick={() => toast.info("Student placement matching — feature coming soon")}>
                <Plus className="w-4 h-4" /> New Placement
              </Button>
            </div>

            <Card>
              <CardContent className="text-center py-16">
                <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready for First Placements</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  As Academy students complete their K-12 curriculum and certification programs, 
                  they will be matched with partner organizations for apprenticeship placements. 
                  The matching system considers student skills, interests, location, and partner availability.
                </p>
                <div className="flex justify-center gap-3 mt-6">
                  <Button variant="outline" onClick={() => setActiveTab("partners")}>
                    View Partners
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("trades")}>
                    Browse Trades
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Placement Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Placement Pipeline</CardTitle>
                <CardDescription>How students move from Academy to apprenticeship</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  {[
                    { step: 1, title: "Academy Completion", desc: "Complete K-12 curriculum + certifications", icon: GraduationCap },
                    { step: 2, title: "Skills Assessment", desc: "AI-powered skills matching & readiness evaluation", icon: Target },
                    { step: 3, title: "Partner Matching", desc: "Matched with partner organizations by trade & location", icon: Handshake },
                    { step: 4, title: "Apprenticeship", desc: "Paid on-the-job training with mentorship", icon: Briefcase },
                    { step: 5, title: "Certification", desc: "Earn industry-recognized credentials", icon: Award },
                  ].map((item, idx) => (
                    <div key={item.step} className="flex items-center gap-4 flex-1">
                      <div className="text-center flex-1">
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
                          <item.icon className="w-6 h-6 text-amber-600" />
                        </div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                      {idx < 4 && <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 hidden md:block" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
