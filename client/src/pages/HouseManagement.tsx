import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Home,
  Building2,
  Users,
  GraduationCap,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Briefcase,
  FileText,
  Shield,
  ArrowRight,
  Plus,
  Eye,
  Settings,
} from "lucide-react";

/**
 * House Management Dashboard
 * 
 * Displays all Houses in the system with their activation status,
 * training progress, and distribution eligibility.
 * 
 * KEY CONCEPTS:
 * - Template Houses: Placeholders awaiting activation
 * - Business-First: Existing businesses joining ecosystem (keep their revenue)
 * - Platform Fees: How the system benefits from all Houses
 * - Distribution Tiers: Observer → Participant → Contributor → Partner
 */
export default function HouseManagement() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [contributionRate, setContributionRate] = useState([0]);

  // Fetch dashboard data
  const { data: dashboard, isLoading: dashboardLoading } = trpc.houseManagement.getDashboard.useQuery();
  const { data: allHouses, isLoading: housesLoading } = trpc.houseManagement.getAllHouses.useQuery({
    limit: 50,
    offset: 0,
  });
  const { data: templates } = trpc.houseManagement.getTemplates.useQuery();

  // Status badge colors
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      template: { variant: "outline", label: "Template" },
      forming: { variant: "secondary", label: "Forming" },
      pending_activation: { variant: "default", label: "Pending Activation" },
      active: { variant: "default", label: "Active" },
      suspended: { variant: "destructive", label: "Suspended" },
      dissolved: { variant: "destructive", label: "Dissolved" },
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Tier badge colors
  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      observer: "bg-gray-100 text-gray-800",
      participant: "bg-blue-100 text-blue-800",
      contributor: "bg-green-100 text-green-800",
      partner: "bg-purple-100 text-purple-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[tier] || colors.observer}`}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  // Pathway icons
  const getPathwayIcon = (pathway: string) => {
    const icons: Record<string, React.ReactNode> = {
      employee_transition: <Users className="w-4 h-4" />,
      external_partner: <Briefcase className="w-4 h-4" />,
      business_first: <Building2 className="w-4 h-4" />,
      community_member: <Users className="w-4 h-4" />,
      family_branch: <Home className="w-4 h-4" />,
    };
    return icons[pathway] || <Home className="w-4 h-4" />;
  };

  if (dashboardLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">House Management</h1>
            <p className="text-muted-foreground">
              Manage Houses, track activations, and monitor platform usage
            </p>
          </div>
          <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Register Business-First House
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Register Existing Business</DialogTitle>
                <DialogDescription>
                  Register an existing business to join the L.A.W.S. ecosystem. Your business revenue remains yours - 
                  you only pay platform fees for tools you use.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>House Name</Label>
                  <Input placeholder="e.g., Smith Family House" />
                </div>
                <div className="space-y-2">
                  <Label>Business Entity</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">+ Register New Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Voluntary Contribution Rate: {contributionRate[0]}%</Label>
                  <p className="text-xs text-muted-foreground">
                    Optional: Choose what percentage of your business revenue to contribute to the collective.
                    This is entirely voluntary and can be changed anytime.
                  </p>
                  <Slider
                    value={contributionRate}
                    onValueChange={setContributionRate}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">What You Get:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Access to L.A.W.S. Business OS tools
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Distribution eligibility (after training)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Community and network access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Your business revenue stays 100% yours
                    </li>
                  </ul>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
                  <h4 className="font-medium text-sm text-amber-800 dark:text-amber-200">Required:</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Complete all 8 simulator training modules to become eligible for distributions.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success("Business-First House registration started");
                  setShowRegisterDialog(false);
                }}>
                  Register House
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Houses</CardTitle>
              <Home className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard?.statusCounts?.reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboard?.statusCounts?.find((s: any) => s.status === "active")?.count || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Activation</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard?.pendingActivations?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting requirements completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Business-First</CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard?.pathwayCounts?.find((p: any) => p.activationPathway === "business_first")?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Existing businesses in ecosystem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">
                From tool usage fees (60/40 split)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="houses">All Houses</TabsTrigger>
            <TabsTrigger value="activations">Activations</TabsTrigger>
            <TabsTrigger value="platform">Platform Usage</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Distribution Tiers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribution Tiers</CardTitle>
                  <CardDescription>
                    Houses progress through tiers based on participation, not business revenue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { tier: "Observer", desc: "Registered, training not complete", share: "0%", count: dashboard?.tierCounts?.find((t: any) => t.distributionTier === "observer")?.count || 0 },
                    { tier: "Participant", desc: "Training complete, active 6+ months", share: "Base", count: dashboard?.tierCounts?.find((t: any) => t.distributionTier === "participant")?.count || 0 },
                    { tier: "Contributor", desc: "Voluntary contributions made", share: "1.5x", count: dashboard?.tierCounts?.find((t: any) => t.distributionTier === "contributor")?.count || 0 },
                    { tier: "Partner", desc: "24+ months, significant contribution", share: "2x", count: dashboard?.tierCounts?.find((t: any) => t.distributionTier === "partner")?.count || 0 },
                  ].map((item) => (
                    <div key={item.tier} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{item.tier}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.share}</p>
                        <p className="text-xs text-muted-foreground">{item.count} Houses</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Pathways */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">House Pathways</CardTitle>
                  <CardDescription>
                    Different ways to join the ecosystem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { pathway: "employee_transition", label: "Employee Transition", desc: "24-month tenure + training" },
                    { pathway: "business_first", label: "Business-First", desc: "Existing business + training" },
                    { pathway: "external_partner", label: "External Partner", desc: "Application + vetting" },
                    { pathway: "community_member", label: "Community Member", desc: "Training + participation" },
                    { pathway: "family_branch", label: "Family Branch", desc: "Extended family" },
                  ].map((item) => {
                    const count = dashboard?.pathwayCounts?.find((p: any) => p.activationPathway === item.pathway)?.count || 0;
                    return (
                      <div key={item.pathway} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPathwayIcon(item.pathway)}
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activations</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.recentActivations?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No recent activations. Houses will appear here once activated.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dashboard?.recentActivations?.map((house: any) => (
                      <div key={house.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPathwayIcon(house.activationPathway)}
                          <div>
                            <p className="font-medium">{house.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(house.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(house.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Houses Tab */}
          <TabsContent value="houses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Houses</CardTitle>
                <CardDescription>
                  Complete list of Houses in the ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                {housesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : allHouses?.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No Houses registered yet.</p>
                    <Button className="mt-4" onClick={() => setShowRegisterDialog(true)}>
                      Register First House
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allHouses?.map((house: any) => (
                      <div key={house.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          {getPathwayIcon(house.activationPathway)}
                          <div>
                            <p className="font-medium">{house.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{house.ownerName || "No owner"}</span>
                              <span>•</span>
                              <span>{house.activationPathway?.replace(/_/g, " ") || "No pathway"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getTierBadge(house.distributionTier || "observer")}
                          {getStatusBadge(house.status)}
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activations Tab */}
          <TabsContent value="activations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Activations</CardTitle>
                <CardDescription>
                  Houses awaiting completion of activation requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard?.pendingActivations?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pending activations.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {dashboard?.pendingActivations?.map((house: any) => {
                      const trainingProgress = house.totalRequiredCourses > 0 
                        ? (house.requiredCoursesCompleted / house.totalRequiredCourses) * 100 
                        : 0;
                      return (
                        <div key={house.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getPathwayIcon(house.activationPathway)}
                              <div>
                                <p className="font-medium">{house.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {house.activationPathway?.replace(/_/g, " ")}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(house.status)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Training Progress</span>
                              <span>{house.requiredCoursesCompleted}/{house.totalRequiredCourses} courses</span>
                            </div>
                            <Progress value={trainingProgress} className="h-2" />
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {house.trainingCompletionStatus === "completed" ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Training Complete
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <Clock className="w-3 h-3" />
                                Training In Progress
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platform Usage Tab */}
          <TabsContent value="platform" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Revenue Model</CardTitle>
                  <CardDescription>
                    How the system benefits from all Houses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">60/40 Inter-House Split</h4>
                    <p className="text-sm text-muted-foreground">
                      Applied to: Subscriptions, Tool Usage, Training, Marketplace, API Access
                    </p>
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1 bg-primary/20 p-2 rounded text-center">
                        <p className="text-xs text-muted-foreground">Collective</p>
                        <p className="font-bold">60%</p>
                      </div>
                      <div className="flex-1 bg-secondary p-2 rounded text-center">
                        <p className="text-xs text-muted-foreground">House</p>
                        <p className="font-bold">40%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">70/30 Intra-House Split</h4>
                    <p className="text-sm text-muted-foreground">
                      Applied to: Referral Commissions
                    </p>
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1 bg-primary/20 p-2 rounded text-center">
                        <p className="text-xs text-muted-foreground">Operations</p>
                        <p className="font-bold">70%</p>
                      </div>
                      <div className="flex-1 bg-secondary p-2 rounded text-center">
                        <p className="text-xs text-muted-foreground">Inheritance</p>
                        <p className="font-bold">30%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fee Types</CardTitle>
                  <CardDescription>
                    Revenue streams from platform usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { name: "Platform Subscription", icon: Shield, rate: "Monthly fee" },
                      { name: "Payroll Processing", icon: DollarSign, rate: "2% per run" },
                      { name: "Invoice Generation", icon: FileText, rate: "1.5% per invoice" },
                      { name: "Contract Management", icon: FileText, rate: "Flat fee" },
                      { name: "Marketplace Sales", icon: TrendingUp, rate: "5% per sale" },
                      { name: "Training Courses", icon: GraduationCap, rate: "Per course" },
                      { name: "Referral Commission", icon: Users, rate: "10% for 12 months" },
                    ].map((fee) => (
                      <div key={fee.name} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <fee.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{fee.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{fee.rate}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Principle Banner */}
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-800 dark:text-green-200">
                      Business-First Houses Keep Their Revenue
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      The system benefits through platform tool usage fees, not by capturing existing business revenue.
                      Every interaction with ecosystem tools generates value for the collective while your business
                      remains 100% independent and owner-controlled.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
