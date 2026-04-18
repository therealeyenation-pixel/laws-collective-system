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
  Handshake, Building2, Users, GraduationCap, Briefcase,
  MapPin, Calendar, Plus, Search, Star, Target,
  CheckCircle, Clock, ArrowRight, Award, TrendingUp,
  FileText, Phone, Mail, Globe, ExternalLink, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

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

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  archived: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function ApprenticeshipPartnerships() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddPartnerDialog, setShowAddPartnerDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  // Form state for adding partner
  const [newPartner, setNewPartner] = useState({
    name: "", industry: "technology", description: "", website: "",
    contactEmail: "", contactPhone: "", durationWeeks: 0,
    isPaid: false, certificationOffered: false, certificationName: "",
    locations: "",
  });

  // Form state for application
  const [application, setApplication] = useState({
    programName: "", tradeCategory: "technology", coverLetter: "",
    educationLevel: "", preferredStartDate: "",
  });

  // tRPC queries
  const { data: partners = [], isLoading: loadingPartners } = trpc.apprenticeships.listPartners.useQuery();
  const { data: stats } = trpc.apprenticeships.getStats.useQuery();
  const { data: myApps = [] } = trpc.apprenticeships.getMyApplications.useQuery();
  const utils = trpc.useUtils();

  const createPartnerMut = trpc.apprenticeships.createPartner.useMutation({
    onSuccess: () => {
      toast.success("Partner organization added successfully");
      setShowAddPartnerDialog(false);
      utils.apprenticeships.listPartners.invalidate();
      utils.apprenticeships.getStats.invalidate();
      setNewPartner({ name: "", industry: "technology", description: "", website: "", contactEmail: "", contactPhone: "", durationWeeks: 0, isPaid: false, certificationOffered: false, certificationName: "", locations: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const submitAppMut = trpc.apprenticeships.submitApplication.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setShowApplyDialog(false);
      utils.apprenticeships.getMyApplications.invalidate();
      utils.apprenticeships.getStats.invalidate();
      setApplication({ programName: "", tradeCategory: "technology", coverLetter: "", educationLevel: "", preferredStartDate: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredPartners = useMemo(() => {
    let result = partners;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p: any) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((p: any) => p.industry.toLowerCase().includes(categoryFilter));
    }
    return result;
  }, [partners, searchQuery, categoryFilter]);

  const activePartners = partners.filter((p: any) => p.status === "active");

  if (loadingPartners) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

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
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Partnership Organization</DialogTitle>
                <DialogDescription>Register a new apprenticeship partner for student placement opportunities.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                createPartnerMut.mutate({
                  name: newPartner.name,
                  slug: newPartner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                  industry: newPartner.industry,
                  description: newPartner.description || undefined,
                  website: newPartner.website || undefined,
                  contactEmail: newPartner.contactEmail || undefined,
                  contactPhone: newPartner.contactPhone || undefined,
                  durationWeeks: newPartner.durationWeeks || undefined,
                  isPaid: newPartner.isPaid,
                  certificationOffered: newPartner.certificationOffered,
                  certificationName: newPartner.certificationName || undefined,
                  locations: newPartner.locations ? newPartner.locations.split(",").map(s => s.trim()) : undefined,
                });
              }} className="space-y-4 pt-4">
                <div>
                  <Label>Organization Name</Label>
                  <Input required value={newPartner.name} onChange={e => setNewPartner(p => ({ ...p, name: e.target.value }))} placeholder="e.g., National Joint Apprenticeship Committee" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Industry</Label>
                    <Input value={newPartner.industry} onChange={e => setNewPartner(p => ({ ...p, industry: e.target.value }))} placeholder="e.g., Technology" />
                  </div>
                  <div>
                    <Label>Duration (weeks)</Label>
                    <Input type="number" value={newPartner.durationWeeks || ""} onChange={e => setNewPartner(p => ({ ...p, durationWeeks: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div>
                  <Label>Locations (comma-separated)</Label>
                  <Input value={newPartner.locations} onChange={e => setNewPartner(p => ({ ...p, locations: e.target.value }))} placeholder="New York, Chicago, National" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={newPartner.description} onChange={e => setNewPartner(p => ({ ...p, description: e.target.value }))} placeholder="Describe the partnership opportunity..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Email</Label>
                    <Input type="email" value={newPartner.contactEmail} onChange={e => setNewPartner(p => ({ ...p, contactEmail: e.target.value }))} placeholder="contact@org.com" />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input value={newPartner.website} onChange={e => setNewPartner(p => ({ ...p, website: e.target.value }))} placeholder="https://..." />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={newPartner.isPaid} onChange={e => setNewPartner(p => ({ ...p, isPaid: e.target.checked }))} className="rounded" />
                    Paid Training
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={newPartner.certificationOffered} onChange={e => setNewPartner(p => ({ ...p, certificationOffered: e.target.checked }))} className="rounded" />
                    Certification Offered
                  </label>
                </div>
                {newPartner.certificationOffered && (
                  <div>
                    <Label>Certification Name</Label>
                    <Input value={newPartner.certificationName} onChange={e => setNewPartner(p => ({ ...p, certificationName: e.target.value }))} placeholder="e.g., CompTIA A+" />
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={createPartnerMut.isPending}>
                  {createPartnerMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Add Partner Organization
                </Button>
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
                  <p className="text-2xl font-bold">{stats?.totalPartners ?? partners.length}</p>
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
                  <p className="text-2xl font-bold">{stats?.activePartners ?? activePartners.length}</p>
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
                  <p className="text-2xl font-bold">{stats?.totalApplications ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Applications</p>
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
                  <p className="text-2xl font-bold">{stats?.placedStudents ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Student Placements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="trades">Trade Categories</TabsTrigger>
            <TabsTrigger value="placements">Placements</TabsTrigger>
            <TabsTrigger value="my-apps">My Applications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Active Partnerships</CardTitle>
                  <CardDescription>Organizations with active placement agreements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activePartners.slice(0, 6).map((partner: any) => (
                      <div key={partner.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="font-medium text-sm truncate max-w-[200px]">{partner.name}</p>
                            <p className="text-xs text-muted-foreground">{partner.industry}</p>
                          </div>
                        </div>
                        {partner.certificationOffered && <Badge variant="outline" className="text-xs">Certified</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trade Coverage</CardTitle>
                  <CardDescription>Apprenticeship categories with partner coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {TRADE_CATEGORIES.slice(0, 8).map(trade => {
                      const count = partners.filter((p: any) => p.industry.toLowerCase().includes(trade.value)).length;
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
              {filteredPartners.map((partner: any) => {
                const locations = partner.locations as string[] | null;
                const trades = partner.tradeCategories as string[] | null;
                return (
                  <Card key={partner.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">{partner.name}</h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {locations?.join(", ") || "National"}</span>
                                <span>{partner.industry}</span>
                              </div>
                            </div>
                            <Badge className={statusColors[partner.status] || ""}>{partner.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-3">{partner.description}</p>
                          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
                            {partner.certificationName && (
                              <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {partner.certificationName}</span>
                            )}
                            {partner.durationWeeks && (
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.round(partner.durationWeeks / 4)} months</span>
                            )}
                            {partner.isPaid && (
                              <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                                Paid {partner.stipendAmount ? `(${partner.stipendAmount})` : "Training"}
                              </Badge>
                            )}
                          </div>
                          {trades && trades.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {trades.map((t: string) => (
                                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-4">
                            {partner.website && (
                              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => window.open(partner.website, "_blank")}>
                                <Globe className="w-3 h-3" /> Website
                              </Button>
                            )}
                            {partner.contactEmail && (
                              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => toast.info(`Contact: ${partner.contactEmail}`)}>
                                <Mail className="w-3 h-3" /> Contact
                              </Button>
                            )}
                            <Button size="sm" className="gap-1 text-xs" onClick={() => {
                              setSelectedPartner(partner);
                              setApplication(a => ({ ...a, programName: partner.name, tradeCategory: partner.industry }));
                              setShowApplyDialog(true);
                            }}>
                              <ArrowRight className="w-3 h-3" /> Apply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredPartners.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No partners match your search criteria</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Trade Categories Tab */}
          <TabsContent value="trades" className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Available Trade Categories</h3>
            <p className="text-sm text-muted-foreground">
              The Academy connects students with apprenticeship opportunities across these skilled trade categories.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRADE_CATEGORIES.map(trade => {
                const tradePartners = partners.filter((p: any) => p.industry.toLowerCase().includes(trade.value));
                return (
                  <Card key={trade.value} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{trade.icon}</span>
                        <div>
                          <h4 className="font-semibold">{trade.label}</h4>
                          <p className="text-xs text-muted-foreground">{tradePartners.length} partner{tradePartners.length !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      {tradePartners.length > 0 ? (
                        <div className="space-y-2">
                          {tradePartners.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                              <span className="truncate">{p.name}</span>
                              {p.certificationOffered && <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">Cert</Badge>}
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

          {/* My Applications Tab */}
          <TabsContent value="my-apps" className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">My Applications</h3>
            {myApps.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <h4 className="font-semibold mb-2">No Applications Yet</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Browse our partner organizations and apply for apprenticeship opportunities that match your skills and interests.
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab("partners")}>Browse Partners</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myApps.map((app: any) => {
                  const partner = partners.find((p: any) => p.id === app.partnerId);
                  return (
                    <Card key={app.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{app.programName}</h4>
                            <p className="text-sm text-muted-foreground">{partner?.name || "Partner"} — {app.tradeCategory}</p>
                            <p className="text-xs text-muted-foreground mt-1">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge className={
                            app.status === "accepted" ? "bg-green-100 text-green-800" :
                            app.status === "rejected" ? "bg-red-100 text-red-800" :
                            app.status === "placed" ? "bg-purple-100 text-purple-800" :
                            "bg-blue-100 text-blue-800"
                          }>{app.status.replace(/_/g, " ")}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Apply for Apprenticeship</DialogTitle>
              <DialogDescription>
                {selectedPartner ? `Applying to ${selectedPartner.name}` : "Submit your application"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!selectedPartner) return;
              submitAppMut.mutate({
                partnerId: selectedPartner.id,
                programName: application.programName,
                tradeCategory: application.tradeCategory,
                coverLetter: application.coverLetter || undefined,
                educationLevel: application.educationLevel || undefined,
                preferredStartDate: application.preferredStartDate || undefined,
              });
            }} className="space-y-4 pt-4">
              <div>
                <Label>Program / Trade</Label>
                <Input value={application.programName} onChange={e => setApplication(a => ({ ...a, programName: e.target.value }))} required />
              </div>
              <div>
                <Label>Trade Category</Label>
                <Input value={application.tradeCategory} onChange={e => setApplication(a => ({ ...a, tradeCategory: e.target.value }))} required />
              </div>
              <div>
                <Label>Education Level</Label>
                <Input value={application.educationLevel} onChange={e => setApplication(a => ({ ...a, educationLevel: e.target.value }))} placeholder="e.g., High School Diploma, Some College" />
              </div>
              <div>
                <Label>Preferred Start Date</Label>
                <Input type="date" value={application.preferredStartDate} onChange={e => setApplication(a => ({ ...a, preferredStartDate: e.target.value }))} />
              </div>
              <div>
                <Label>Cover Letter</Label>
                <Textarea value={application.coverLetter} onChange={e => setApplication(a => ({ ...a, coverLetter: e.target.value }))} placeholder="Tell us about your interest, skills, and goals..." rows={4} />
              </div>
              <Button type="submit" className="w-full" disabled={submitAppMut.isPending}>
                {submitAppMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Application
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
