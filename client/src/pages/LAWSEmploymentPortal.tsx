import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Map,
  Wind,
  Droplets,
  Heart,
  Briefcase,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Building2,
  GraduationCap,
  Banknote,
  Home,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";

const pillarIcons: Record<string, React.ReactNode> = {
  LAND: <Map className="w-5 h-5" />,
  AIR: <Wind className="w-5 h-5" />,
  WATER: <Droplets className="w-5 h-5" />,
  SELF: <Heart className="w-5 h-5" />,
};

const pillarColors: Record<string, string> = {
  LAND: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  AIR: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  WATER: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  SELF: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const pillarDescriptions: Record<string, string> = {
  LAND: "Reconnection & Stability - Property management, land stewardship, agricultural work",
  AIR: "Education & Knowledge - Teaching, curriculum development, knowledge sharing",
  WATER: "Healing & Balance - Wellness services, counseling, healing arts",
  SELF: "Purpose & Skills - Financial literacy, business coaching, entrepreneurship",
};

const fundingBadgeColors: Record<string, string> = {
  grant_funded: "bg-green-500/10 text-green-600 border-green-500/20",
  revenue_funded: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  mixed: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  donation_funded: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export default function LAWSEmploymentPortal() {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  
  // Form state
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [communityConnection, setCommunityConnection] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [referralSource, setReferralSource] = useState("");

  const { data: positions, isLoading: positionsLoading } = trpc.lawsEmployment.getPositions.useQuery(
    selectedPillar ? { pillar: selectedPillar as any, status: 'open' } : { status: 'open' }
  );
  
  const { data: pathways } = trpc.lawsEmployment.getProgressionPathways.useQuery();
  const { data: dashboardStats } = trpc.lawsEmployment.getDashboardStats.useQuery();
  const { data: impactMetrics } = trpc.lawsEmployment.getImpactMetrics.useQuery();

  const submitApplication = trpc.lawsEmployment.submitApplication.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully! We'll be in touch soon.");
      setApplicationDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  const resetForm = () => {
    setApplicantName("");
    setApplicantEmail("");
    setApplicantPhone("");
    setCoverLetter("");
    setCommunityConnection("");
    setSkills("");
    setExperienceYears("");
    setReferralSource("");
  };

  const handleApply = (position: any) => {
    setSelectedPosition(position);
    setApplicationDialogOpen(true);
  };

  const handleSubmitApplication = () => {
    if (!selectedPosition || !applicantName || !applicantEmail) {
      toast.error("Please fill in required fields");
      return;
    }
    
    submitApplication.mutate({
      positionId: selectedPosition.id,
      applicantName,
      applicantEmail,
      applicantPhone: applicantPhone || undefined,
      coverLetter: coverLetter || undefined,
      communityConnection: communityConnection || undefined,
      skills: skills || undefined,
      experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
      referralSource: referralSource || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">L.A.W.S. Employment Portal</h1>
            <p className="text-muted-foreground mt-1">
              Community job opportunities through the L.A.W.S. Collective
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Building Generational Wealth Through Employment</h3>
                <p className="text-muted-foreground mt-1">
                  L.A.W.S. Collective creates job opportunities that lead to ownership. Start as a W-2 employee, 
                  develop your skills, transition to contractor, build your own business, and become a House member 
                  in our wealth-building ecosystem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboardStats?.positions?.open || 0}</p>
                  <p className="text-sm text-muted-foreground">Open Positions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Banknote className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboardStats?.funding?.grant_funded || 0}</p>
                  <p className="text-sm text-muted-foreground">Grant-Funded</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboardStats?.applications?.hired || 0}</p>
                  <p className="text-sm text-muted-foreground">People Hired</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/10">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{impactMetrics?.latestMetrics?.w2_to_contractor_transitions || 0}</p>
                  <p className="text-sm text-muted-foreground">Transitions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="positions">Job Opportunities</TabsTrigger>
            <TabsTrigger value="pathways">Progression Pathways</TabsTrigger>
            <TabsTrigger value="impact">Community Impact</TabsTrigger>
          </TabsList>

          {/* Job Opportunities Tab */}
          <TabsContent value="positions" className="space-y-6">
            {/* Pillar Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedPillar === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPillar(null)}
              >
                All Pillars
              </Button>
              {Object.entries(pillarIcons).map(([pillar, icon]) => (
                <Button
                  key={pillar}
                  variant={selectedPillar === pillar ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPillar(pillar)}
                  className="gap-2"
                >
                  {icon}
                  {pillar}
                </Button>
              ))}
            </div>

            {/* Positions Grid */}
            {positionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading positions...</div>
            ) : positions && positions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {positions.map((position: any) => (
                  <Card key={position.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${pillarColors[position.pillar]}`}>
                            {pillarIcons[position.pillar]}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{position.title}</CardTitle>
                            <CardDescription>{position.department}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className={pillarColors[position.pillar]}>
                          {position.pillar}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {position.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {position.funding_type && (
                          <Badge variant="outline" className={fundingBadgeColors[position.funding_type]}>
                            {position.funding_type.replace('_', ' ')}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {position.employment_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Salary: </span>
                          <span className="font-medium">
                            ${position.salary_min?.toLocaleString()} - ${position.salary_max?.toLocaleString()}
                          </span>
                        </div>
                        <Button size="sm" onClick={() => handleApply(position)}>
                          Apply Now
                        </Button>
                      </div>
                      
                      {position.pathway_name && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Pathway: {position.pathway_name}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No open positions found for the selected filter.</p>
              </Card>
            )}
          </TabsContent>

          {/* Progression Pathways Tab */}
          <TabsContent value="pathways" className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
              <h3 className="font-semibold text-lg mb-4">The L.A.W.S. Wealth-Building Journey</h3>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <span>W-2 Employee</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <span>Contractor</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                  <Building2 className="w-5 h-5 text-green-500" />
                  <span>Business Owner</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                  <Home className="w-5 h-5 text-amber-500" />
                  <span>House Member</span>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pathways?.map((pathway: any) => (
                <Card key={pathway.id} className="overflow-hidden">
                  <CardHeader className={`${pillarColors[pathway.pillar]} border-b`}>
                    <div className="flex items-center gap-3">
                      {pillarIcons[pathway.pillar]}
                      <div>
                        <CardTitle className="text-lg">{pathway.name}</CardTitle>
                        <CardDescription className="text-current/70">
                          {pillarDescriptions[pathway.pillar]}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-sm text-muted-foreground">{pathway.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-semibold text-sm">1</div>
                        <div>
                          <p className="font-medium">{pathway.stage_1_title}</p>
                          <p className="text-xs text-muted-foreground">{pathway.stage_1_duration_months} months</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 font-semibold text-sm">2</div>
                        <div>
                          <p className="font-medium">{pathway.stage_2_title}</p>
                          <p className="text-xs text-muted-foreground">{pathway.stage_2_duration_months} months</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-semibold text-sm">3</div>
                        <div>
                          <p className="font-medium">{pathway.stage_3_title}</p>
                          <p className="text-xs text-muted-foreground">Business Owner</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-semibold text-sm">4</div>
                        <div>
                          <p className="font-medium">{pathway.stage_4_title}</p>
                          <p className="text-xs text-muted-foreground">Full Wealth Integration</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Est. Timeline: {pathway.estimated_timeline_months} months
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Community Impact Tab */}
          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {impactMetrics?.positionsByPillar?.map((item: any) => (
                <Card key={item.pillar}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${pillarColors[item.pillar]}`}>
                        {pillarIcons[item.pillar]}
                      </div>
                      <span className="font-semibold">{item.pillar}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Positions</span>
                        <span className="font-medium">{item.total_positions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Open</span>
                        <span className="font-medium text-green-600">{item.open_positions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Filled</span>
                        <span className="font-medium text-blue-600">{item.filled_positions}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Funding Breakdown</CardTitle>
                <CardDescription>How positions are funded across the collective</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {impactMetrics?.fundingBreakdown?.map((item: any) => (
                    <div key={item.funding_type} className="p-4 rounded-lg border">
                      <Badge variant="outline" className={fundingBadgeColors[item.funding_type] + " mb-2"}>
                        {item.funding_type.replace('_', ' ')}
                      </Badge>
                      <p className="text-2xl font-bold">{item.position_count}</p>
                      <p className="text-sm text-muted-foreground">
                        ${(item.total_budget || 0).toLocaleString()} total budget
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>The Wealth-Building Loop</CardTitle>
                <CardDescription>How employment creates generational wealth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <DollarSign className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                    <h4 className="font-semibold mb-2">Grants Fund Jobs</h4>
                    <p className="text-sm text-muted-foreground">
                      508 receives grants and donations that fund community employment
                    </p>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-green-500/5 border border-green-500/20">
                    <GraduationCap className="w-10 h-10 mx-auto mb-3 text-green-600" />
                    <h4 className="font-semibold mb-2">Employees Learn & Grow</h4>
                    <p className="text-sm text-muted-foreground">
                      Workers develop skills, earn certifications, and build experience
                    </p>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <Home className="w-10 h-10 mx-auto mb-3 text-amber-600" />
                    <h4 className="font-semibold mb-2">Owners Reinvest</h4>
                    <p className="text-sm text-muted-foreground">
                      Business owners contribute back, funding more jobs and growth
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Application Dialog */}
        <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Apply for {selectedPosition?.title}</DialogTitle>
              <DialogDescription>
                {selectedPosition?.department} • {selectedPosition?.pillar} Pillar
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skills">Relevant Skills</Label>
                <Input
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="List your relevant skills"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="community">Community Connection</Label>
                <Textarea
                  id="community"
                  value={communityConnection}
                  onChange={(e) => setCommunityConnection(e.target.value)}
                  placeholder="How are you connected to the L.A.W.S. community? (optional)"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cover">Cover Letter / Why This Role?</Label>
                <Textarea
                  id="cover"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're interested in this position and what you bring..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referral">How did you hear about us?</Label>
                <Select value={referralSource} onValueChange={setReferralSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select referral source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="community_member">Community Member</SelectItem>
                    <SelectItem value="job_board">Job Board</SelectItem>
                    <SelectItem value="event">Event / Workshop</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setApplicationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitApplication}
                  disabled={submitApplication.isPending}
                >
                  {submitApplication.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
