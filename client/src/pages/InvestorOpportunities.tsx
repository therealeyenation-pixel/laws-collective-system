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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Shield, 
  Lock, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  FileText,
  PlusCircle,
  Building2,
  Percent,
  Clock,
  Gavel
} from "lucide-react";

export default function InvestorOpportunities() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewInvestorDialog, setShowNewInvestorDialog] = useState(false);
  const [showNewOpportunityDialog, setShowNewOpportunityDialog] = useState(false);

  // Queries
  const { data: safeguards = [] } = trpc.investorManagement.getSafeguards.useQuery();
  const { data: constitutionalSafeguards = [] } = trpc.investorManagement.getConstitutionalSafeguards.useQuery();
  const { data: investors = [] } = trpc.investorManagement.getInvestors.useQuery();
  const { data: opportunities = [] } = trpc.investorManagement.getOpportunities.useQuery();
  const { data: agreements = [] } = trpc.investorManagement.getAgreements.useQuery();
  const { data: allocationSummary } = trpc.investorManagement.getAllocationSummary.useQuery();

  // Mutations
  const createInvestor = trpc.investorManagement.createInvestor.useMutation({
    onSuccess: () => {
      toast.success("Investor added successfully");
      setShowNewInvestorDialog(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const createOpportunity = trpc.investorManagement.createOpportunity.useMutation({
    onSuccess: () => {
      toast.success("Opportunity created successfully");
      setShowNewOpportunityDialog(false);
    },
    onError: (error) => toast.error(error.message),
  });

  // Form state
  const [investorForm, setInvestorForm] = useState({
    name: "",
    entityType: "individual" as const,
    tier: "strategic_partner" as const,
    contactName: "",
    contactEmail: "",
    accreditedInvestor: false,
  });

  const [opportunityForm, setOpportunityForm] = useState({
    title: "",
    description: "",
    opportunityType: "revenue_share" as const,
    targetAmount: 0,
    minimumInvestment: 0,
    termMonths: 36,
    riskLevel: "medium" as const,
    maxPoolAllocation: 10,
  });

  const tierColors: Record<string, string> = {
    strategic_partner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    limited_partner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    equity_investor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  };

  const statusColors: Record<string, string> = {
    prospect: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-yellow-100 text-yellow-800",
    exited: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-800",
    open: "bg-blue-100 text-blue-800",
    closed: "bg-yellow-100 text-yellow-800",
    funded: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investor & Partner Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage investment opportunities with constitutional protections
            </p>
          </div>
        </div>

        {/* Protection Banner */}
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-800 dark:text-green-200">60/40 Protection Active</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  The 60% House Retained portion is constitutionally protected and inaccessible to investors. 
                  All investment opportunities are limited to the 40% Network Pool only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>House Retained (Protected)</CardDescription>
              <CardTitle className="text-2xl text-green-600">60%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Completely Protected</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Network Pool (Available)</CardDescription>
              <CardTitle className="text-2xl">40%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>For Partners & Investors</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Currently Allocated</CardDescription>
              <CardTitle className="text-2xl text-amber-600">
                {allocationSummary?.totalAllocatedPercent || 0}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress 
                value={(allocationSummary?.totalAllocatedPercent || 0) / 25 * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                of 25% max investor cap
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Remaining Capacity</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {allocationSummary?.remainingCapPercent || 25}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Available for new investments</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="safeguards">Safeguards</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Investment Tiers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Investment Tiers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Tier 1: Strategic Partners</span>
                      <Badge className={tierColors.strategic_partner}>Revenue Share</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Revenue sharing agreements with no equity dilution
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Tier 2: Limited Partners</span>
                      <Badge className={tierColors.limited_partner}>Profit Share</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Profit participation up to 15% of Network Pool
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Tier 3: Equity Investors</span>
                      <Badge className={tierColors.equity_investor}>Equity Stake</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Minority stake in specific ventures only
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Constitutional Protections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Constitutional Protections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(constitutionalSafeguards as any[]).map((safeguard: any) => (
                    <div key={safeguard.id} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{safeguard.name}</p>
                        <p className="text-xs text-muted-foreground">{safeguard.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Active Investors</span>
                    <span className="font-bold">{allocationSummary?.activeInvestors || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Invested</span>
                    <span className="font-bold">
                      ${(allocationSummary?.totalInvested || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Open Opportunities</span>
                    <span className="font-bold">
                      {(opportunities as any[]).filter((o: any) => o.status === "open").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Active Agreements</span>
                    <span className="font-bold">
                      {(agreements as any[]).filter((a: any) => a.status === "active").length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Safeguards Tab */}
          <TabsContent value="safeguards" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Protection Safeguards</CardTitle>
                <CardDescription>
                  These safeguards protect the 60/40 structure and ensure investor relationships remain beneficial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(safeguards as any[]).map((safeguard: any) => (
                    <div 
                      key={safeguard.id} 
                      className={`p-4 border rounded-lg ${safeguard.isConstitutional ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {safeguard.isConstitutional ? (
                            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                          ) : (
                            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{safeguard.name}</h4>
                              {safeguard.isConstitutional && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Constitutional
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {safeguard.description}
                            </p>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Type: {safeguard.safeguardType}</span>
                              <span>Enforcement: {safeguard.enforcementLevel}</span>
                              {safeguard.thresholdPercentage && (
                                <span>Threshold: {safeguard.thresholdPercentage}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant={safeguard.isActive ? "default" : "secondary"}>
                          {safeguard.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investors Tab */}
          <TabsContent value="investors" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Investor & Partner Registry</h3>
              <Dialog open={showNewInvestorDialog} onOpenChange={setShowNewInvestorDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Investor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Investor/Partner</DialogTitle>
                    <DialogDescription>
                      Register a new investor or strategic partner
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Name</Label>
                      <Input 
                        value={investorForm.name}
                        onChange={(e) => setInvestorForm({...investorForm, name: e.target.value})}
                        placeholder="Investor or company name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Entity Type</Label>
                        <Select 
                          value={investorForm.entityType}
                          onValueChange={(v: any) => setInvestorForm({...investorForm, entityType: v})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="fund">Fund</SelectItem>
                            <SelectItem value="family_office">Family Office</SelectItem>
                            <SelectItem value="strategic_partner">Strategic Partner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tier</Label>
                        <Select 
                          value={investorForm.tier}
                          onValueChange={(v: any) => setInvestorForm({...investorForm, tier: v})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strategic_partner">Tier 1: Strategic Partner</SelectItem>
                            <SelectItem value="limited_partner">Tier 2: Limited Partner</SelectItem>
                            <SelectItem value="equity_investor">Tier 3: Equity Investor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Contact Email</Label>
                      <Input 
                        type="email"
                        value={investorForm.contactEmail}
                        onChange={(e) => setInvestorForm({...investorForm, contactEmail: e.target.value})}
                        placeholder="email@example.com"
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => createInvestor.mutate(investorForm)}
                      disabled={createInvestor.isPending}
                    >
                      {createInvestor.isPending ? "Adding..." : "Add Investor"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {(investors as any[]).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No investors registered yet</p>
                    <p className="text-sm">Add your first investor or partner to get started</p>
                  </CardContent>
                </Card>
              ) : (
                (investors as any[]).map((investor: any) => (
                  <Card key={investor.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{investor.name}</h4>
                          <p className="text-sm text-muted-foreground">{investor.contactEmail}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={tierColors[investor.tier]}>
                            {investor.tier.replace(/_/g, " ")}
                          </Badge>
                          <Badge className={statusColors[investor.status]}>
                            {investor.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                        <span>Type: {investor.entityType.replace(/_/g, " ")}</span>
                        {investor.accreditedInvestor && (
                          <span className="text-green-600">✓ Accredited</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Investment Opportunities</h3>
              <Dialog open={showNewOpportunityDialog} onOpenChange={setShowNewOpportunityDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Opportunity
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Investment Opportunity</DialogTitle>
                    <DialogDescription>
                      All opportunities are limited to the 40% Network Pool
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Title</Label>
                      <Input 
                        value={opportunityForm.title}
                        onChange={(e) => setOpportunityForm({...opportunityForm, title: e.target.value})}
                        placeholder="Investment opportunity title"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea 
                        value={opportunityForm.description}
                        onChange={(e) => setOpportunityForm({...opportunityForm, description: e.target.value})}
                        placeholder="Describe the investment opportunity"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select 
                          value={opportunityForm.opportunityType}
                          onValueChange={(v: any) => setOpportunityForm({...opportunityForm, opportunityType: v})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="revenue_share">Revenue Share</SelectItem>
                            <SelectItem value="profit_participation">Profit Participation</SelectItem>
                            <SelectItem value="equity_stake">Equity Stake</SelectItem>
                            <SelectItem value="convertible_note">Convertible Note</SelectItem>
                            <SelectItem value="loan">Loan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Risk Level</Label>
                        <Select 
                          value={opportunityForm.riskLevel}
                          onValueChange={(v: any) => setOpportunityForm({...opportunityForm, riskLevel: v})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Target Amount ($)</Label>
                        <Input 
                          type="number"
                          value={opportunityForm.targetAmount}
                          onChange={(e) => setOpportunityForm({...opportunityForm, targetAmount: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Minimum Investment ($)</Label>
                        <Input 
                          type="number"
                          value={opportunityForm.minimumInvestment}
                          onChange={(e) => setOpportunityForm({...opportunityForm, minimumInvestment: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Term (months)</Label>
                        <Input 
                          type="number"
                          value={opportunityForm.termMonths}
                          onChange={(e) => setOpportunityForm({...opportunityForm, termMonths: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Max Pool Allocation (%)</Label>
                        <Input 
                          type="number"
                          max={25}
                          value={opportunityForm.maxPoolAllocation}
                          onChange={(e) => setOpportunityForm({...opportunityForm, maxPoolAllocation: Math.min(25, Number(e.target.value))})}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Max 25% of Network Pool</p>
                      </div>
                    </div>
                    
                    {/* Protection Notice */}
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-green-800 dark:text-green-200">
                            Automatic Protections Applied
                          </p>
                          <ul className="text-xs text-green-700 dark:text-green-300 mt-1 space-y-1">
                            <li>• 60% House Firewall clause</li>
                            <li>• Founding Chair veto rights</li>
                            <li>• Buyback provisions</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full"
                      onClick={() => createOpportunity.mutate(opportunityForm)}
                      disabled={createOpportunity.isPending}
                    >
                      {createOpportunity.isPending ? "Creating..." : "Create Opportunity"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {(opportunities as any[]).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No investment opportunities yet</p>
                    <p className="text-sm">Create your first opportunity to attract investors</p>
                  </CardContent>
                </Card>
              ) : (
                (opportunities as any[]).map((opp: any) => (
                  <Card key={opp.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{opp.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{opp.description}</p>
                        </div>
                        <Badge className={statusColors[opp.status]}>
                          {opp.status}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type</span>
                          <p className="font-medium">{opp.opportunityType.replace(/_/g, " ")}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Target</span>
                          <p className="font-medium">${Number(opp.targetAmount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Term</span>
                          <p className="font-medium">{opp.termMonths} months</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Max Allocation</span>
                          <p className="font-medium">{opp.maxPoolAllocation}% of pool</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Badge variant="outline" className="text-green-600">
                          <Lock className="w-3 h-3 mr-1" />
                          60% Protected
                        </Badge>
                        <Badge variant="outline" className="text-blue-600">
                          <Gavel className="w-3 h-3 mr-1" />
                          Chair Veto
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Agreements Tab */}
          <TabsContent value="agreements" className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Investment Agreements</h3>
            <div className="grid gap-4">
              {(agreements as any[]).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No agreements yet</p>
                    <p className="text-sm">Agreements are created when investors commit to opportunities</p>
                  </CardContent>
                </Card>
              ) : (
                (agreements as any[]).map((agreement: any) => (
                  <Card key={agreement.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{agreement.agreementNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            {agreement.investorName} - {agreement.opportunityTitle}
                          </p>
                        </div>
                        <Badge className={statusColors[agreement.status]}>
                          {agreement.status}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Investment</span>
                          <p className="font-medium">${Number(agreement.investmentAmount).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ownership</span>
                          <p className="font-medium">{agreement.ownershipPercentage || 0}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Effective Date</span>
                          <p className="font-medium">
                            {new Date(agreement.effectiveDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
