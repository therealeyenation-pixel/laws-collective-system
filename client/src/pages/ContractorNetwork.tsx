import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Users,
  DollarSign,
  Plus,
  Network,
  CreditCard,
  Gift,
  TrendingUp,
  Shield,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  UserPlus,
  Receipt,
  Wallet,
  ArrowUpRight,
  Crown,
  Layers,
} from "lucide-react";

export default function ContractorNetwork() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showSubmitReferralDialog, setShowSubmitReferralDialog] = useState(false);
  const [showAddBenefitDialog, setShowAddBenefitDialog] = useState(false);

  // Queries
  const { data: dashboard, isLoading: loadingDashboard } = trpc.contractorNetwork.getNetworkDashboard.useQuery();
  const { data: members, isLoading: loadingMembers } = trpc.contractorNetwork.getNetworkMembers.useQuery();
  const { data: referrals, isLoading: loadingReferrals } = trpc.contractorNetwork.getReferrals.useQuery();
  const { data: subscriptions, isLoading: loadingSubscriptions } = trpc.contractorNetwork.getSubscriptions.useQuery();
  const { data: relationships, isLoading: loadingRelationships } = trpc.contractorNetwork.getSubContractorRelationships.useQuery();
  const { data: benefits, isLoading: loadingBenefits } = trpc.contractorNetwork.getAvailableBenefits.useQuery();
  const { data: networkTree, isLoading: loadingTree } = trpc.contractorNetwork.getNetworkTree.useQuery();

  // Mutations
  const submitReferralMutation = trpc.contractorNetwork.submitReferral.useMutation({
    onSuccess: (data) => {
      toast.success(`Referral submitted! Estimated fee: $${data.estimatedFee?.toFixed(2) || 'TBD'}`);
      setShowSubmitReferralDialog(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const addBenefitMutation = trpc.contractorNetwork.addNetworkBenefit.useMutation({
    onSuccess: () => {
      toast.success("Benefit added successfully");
      setShowAddBenefitDialog(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const tierColors: Record<string, string> = {
    basic: "bg-gray-100 text-gray-800",
    professional: "bg-blue-100 text-blue-800",
    enterprise: "bg-purple-100 text-purple-800",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    paid: "bg-emerald-100 text-emerald-800",
    overdue: "bg-red-100 text-red-800",
  };

  if (loadingDashboard) {
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
            <h1 className="text-3xl font-bold text-foreground">Contractor Network</h1>
            <p className="text-muted-foreground mt-1">
              Self-perpetuating ecosystem of transitioned contractors
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Network className="w-4 h-4 mr-1" />
            Closed Loop Ecosystem
          </Badge>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Network Members</p>
                  <p className="text-2xl font-bold">{dashboard?.members.total || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboard?.members.active || 0} active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription Revenue</p>
                  <p className="text-2xl font-bold">
                    ${(dashboard?.subscriptions.totalRevenue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-red-500">
                    ${(dashboard?.subscriptions.overdueAmount || 0).toLocaleString()} overdue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Referral Fees Paid</p>
                  <p className="text-2xl font-bold">
                    ${(dashboard?.referrals.feesPaid || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dashboard?.referrals.completed || 0} completed referrals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-100">
                  <Layers className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pipeline Relationships</p>
                  <p className="text-2xl font-bold">{dashboard?.subContractors.pipelineCount || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    ${(dashboard?.subContractors.trainingFees || 0).toLocaleString()} training fees
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Pricing Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Membership Tiers
            </CardTitle>
            <CardDescription>
              Platform subscription tiers with decreasing referral fees for higher tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboard?.tierPricing && Object.entries(dashboard.tierPricing).map(([tier, pricing]: [string, any]) => (
                <Card key={tier} className={`${tier === 'professional' ? 'border-primary border-2' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <Badge className={tierColors[tier]} variant="secondary">
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </Badge>
                      <div>
                        <p className="text-3xl font-bold">${pricing.monthly}</p>
                        <p className="text-sm text-muted-foreground">/month</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        or ${pricing.annual}/year (save ${pricing.monthly * 12 - pricing.annual})
                      </p>
                      <div className="pt-4 border-t">
                        <p className="text-sm">
                          <span className="font-semibold">{pricing.referralFee}%</span> referral fee
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Network Tree */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Network Hierarchy
                  </CardTitle>
                  <CardDescription>
                    Contractor relationships and downline structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingTree ? (
                    <div className="h-40 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : networkTree && networkTree.length > 0 ? (
                    <div className="space-y-2">
                      {networkTree.map((node: any) => (
                        <NetworkNode key={node.id} node={node} level={0} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No network members yet. Contractors will appear here after transitioning.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Flow */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Revenue Flow
                  </CardTitle>
                  <CardDescription>
                    Self-perpetuating ecosystem revenue streams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">Platform Subscriptions</p>
                          <p className="text-xs text-muted-foreground">Monthly/Annual fees</p>
                        </div>
                      </div>
                      <p className="font-bold">${(dashboard?.subscriptions.totalRevenue || 0).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium text-sm">Referral Fees</p>
                          <p className="text-xs text-muted-foreground">5-10% of project value</p>
                        </div>
                      </div>
                      <p className="font-bold">${(dashboard?.referrals.feesPaid || 0).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <UserPlus className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-sm">Training Fees</p>
                          <p className="text-xs text-muted-foreground">Sub-contractor pipeline</p>
                        </div>
                      </div>
                      <p className="font-bold">${(dashboard?.subContractors.trainingFees || 0).toLocaleString()}</p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Total Network Revenue</p>
                        <p className="text-xl font-bold text-primary">
                          ${(
                            (dashboard?.subscriptions.totalRevenue || 0) +
                            (dashboard?.referrals.feesPaid || 0) +
                            (dashboard?.subContractors.trainingFees || 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ecosystem Loop Explanation */}
            <Card>
              <CardHeader>
                <CardTitle>Self-Perpetuating Ecosystem Loop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { icon: Building2, title: "L.A.W.S. Collective", desc: "Hires employees" },
                    { icon: Users, title: "Employee Pipeline", desc: "2-year development" },
                    { icon: ArrowUpRight, title: "Contractor Transition", desc: "Form own LLC" },
                    { icon: Network, title: "Network Member", desc: "Platform subscription" },
                    { icon: UserPlus, title: "Hire Own Employees", desc: "Feed back to pipeline" },
                  ].map((step, idx) => (
                    <div key={idx} className="text-center space-y-2">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                      {idx < 4 && (
                        <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                          →
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {loadingMembers ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Monthly Fee</TableHead>
                        <TableHead>Referral %</TableHead>
                        <TableHead>Network Level</TableHead>
                        <TableHead>Revenue Generated</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members?.map((member: any) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium">{member.businessName || `Contractor #${member.contractorId}`}</p>
                                <p className="text-xs text-muted-foreground">{member.ownerName}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={tierColors[member.membershipTier]}>
                              {member.membershipTier}
                            </Badge>
                          </TableCell>
                          <TableCell>${member.monthlyFee}</TableCell>
                          <TableCell>{member.referralFeePercentage}%</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Layers className="w-4 h-4 text-muted-foreground" />
                              Level {member.networkLevel}
                            </div>
                          </TableCell>
                          <TableCell>${(member.totalRevenueGenerated || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[member.status]}>
                              {member.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!members || members.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No network members yet. Members are added after contractor transition.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Client Referrals</h3>
              <Dialog open={showSubmitReferralDialog} onOpenChange={setShowSubmitReferralDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Referral
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Client Referral</DialogTitle>
                    <DialogDescription>
                      Refer a client to the network and earn referral fees
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      submitReferralMutation.mutate({
                        referringContractorId: parseInt(formData.get("contractorId") as string),
                        clientName: formData.get("clientName") as string,
                        clientEmail: formData.get("clientEmail") as string || undefined,
                        clientCompany: formData.get("clientCompany") as string || undefined,
                        projectDescription: formData.get("projectDescription") as string,
                        estimatedProjectValue: parseFloat(formData.get("projectValue") as string) || undefined,
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="contractorId">Your Contractor ID</Label>
                      <Input id="contractorId" name="contractorId" type="number" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input id="clientName" name="clientName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientEmail">Client Email</Label>
                        <Input id="clientEmail" name="clientEmail" type="email" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientCompany">Client Company</Label>
                      <Input id="clientCompany" name="clientCompany" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectDescription">Project Description</Label>
                      <Textarea id="projectDescription" name="projectDescription" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectValue">Estimated Project Value ($)</Label>
                      <Input id="projectValue" name="projectValue" type="number" step="0.01" />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={submitReferralMutation.isPending}>
                        {submitReferralMutation.isPending ? "Submitting..." : "Submit Referral"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {loadingReferrals ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Referred By</TableHead>
                        <TableHead>Project Value</TableHead>
                        <TableHead>Referral Fee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals?.map((referral: any) => (
                        <TableRow key={referral.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{referral.clientName}</p>
                              <p className="text-xs text-muted-foreground">{referral.clientCompany}</p>
                            </div>
                          </TableCell>
                          <TableCell>{referral.referringContractorName || `Contractor #${referral.referringContractorId}`}</TableCell>
                          <TableCell>${(referral.projectValue || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <div>
                              <p>${(referral.referralFeeAmount || 0).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{referral.referralFeePercentage}%</p>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(referral.referredAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[referral.status]}>
                              {referral.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!referrals || referrals.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No referrals yet. Network members can submit client referrals to earn fees.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {loadingSubscriptions ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions?.map((sub: any) => (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={tierColors[sub.membershipTier]} variant="outline">
                                {sub.membershipTier}
                              </Badge>
                              <span>{sub.businessName || `Member #${sub.networkMemberId}`}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{sub.subscriptionType}</TableCell>
                          <TableCell>${sub.amount}</TableCell>
                          <TableCell>
                            {new Date(sub.periodStart).toLocaleDateString()} - {new Date(sub.periodEnd).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{sub.invoiceNumber}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[sub.status]}>
                              {sub.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!subscriptions || subscriptions.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No subscriptions yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Network Benefits</h3>
              <Dialog open={showAddBenefitDialog} onOpenChange={setShowAddBenefitDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Benefit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Network Benefit</DialogTitle>
                    <DialogDescription>
                      Add a new benefit available to network members
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      addBenefitMutation.mutate({
                        name: formData.get("name") as string,
                        description: formData.get("description") as string || undefined,
                        benefitType: formData.get("benefitType") as any,
                        provider: formData.get("provider") as string || undefined,
                        monthlyCost: parseFloat(formData.get("monthlyCost") as string) || undefined,
                        minimumTier: formData.get("minimumTier") as any || "basic",
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name">Benefit Name</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="benefitType">Type</Label>
                        <Select name="benefitType" defaultValue="other">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="insurance">Insurance</SelectItem>
                            <SelectItem value="retirement">Retirement</SelectItem>
                            <SelectItem value="legal">Legal</SelectItem>
                            <SelectItem value="accounting">Accounting</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="software">Software</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimumTier">Minimum Tier</Label>
                        <Select name="minimumTier" defaultValue="basic">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="provider">Provider</Label>
                        <Input id="provider" name="provider" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthlyCost">Monthly Cost ($)</Label>
                        <Input id="monthlyCost" name="monthlyCost" type="number" step="0.01" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={addBenefitMutation.isPending}>
                        {addBenefitMutation.isPending ? "Adding..." : "Add Benefit"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingBenefits ? (
                <div className="col-span-3 h-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : benefits && benefits.length > 0 ? (
                benefits.map((benefit: any) => (
                  <Card key={benefit.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold">{benefit.name}</h4>
                          </div>
                          <Badge className={tierColors[benefit.minimumTier]} variant="outline">
                            {benefit.minimumTier}+
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{benefit.provider}</span>
                          {benefit.monthlyCost && (
                            <span className="font-medium">${benefit.monthlyCost}/mo</span>
                          )}
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {benefit.benefitType}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  No benefits configured yet. Add benefits to make network membership more valuable.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Network Tree Node Component
function NetworkNode({ node, level }: { node: any; level: number }) {
  return (
    <div style={{ marginLeft: `${level * 24}px` }}>
      <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary/30">
        {level > 0 && <div className="w-4 border-t border-l h-4 border-border" />}
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Building2 className="w-3 h-3" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{node.businessName || `Contractor #${node.contractorId}`}</p>
          <p className="text-xs text-muted-foreground">
            Level {node.networkLevel} • {node.membershipTier} • ${(node.totalRevenueGenerated || 0).toLocaleString()}
          </p>
        </div>
      </div>
      {node.children?.map((child: any) => (
        <NetworkNode key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );
}
