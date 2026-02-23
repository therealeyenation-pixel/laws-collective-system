import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Gift,
  Users,
  FileText,
  ArrowUpRight,
  Wallet,
  Calendar,
  Shield,
  Star,
  Crown,
  Gem,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";

const membershipTiers = {
  standard: { name: "Standard", icon: Star, color: "text-gray-600", bgColor: "bg-gray-100" },
  premium: { name: "Premium", icon: Award, color: "text-blue-600", bgColor: "bg-blue-100" },
  elite: { name: "Elite", icon: Crown, color: "text-purple-600", bgColor: "bg-purple-100" },
  founding: { name: "Founding", icon: Gem, color: "text-amber-600", bgColor: "bg-amber-100" },
};

const complianceStatus = {
  compliant: { label: "Compliant", icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-100" },
  pending: { label: "Pending", icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100" },
  overdue: { label: "Overdue", icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-100" },
};

export default function MemberBusinessDashboard() {
  const [reinvestmentAmount, setReinvestmentAmount] = useState("");
  const [reinvestmentPeriod, setReinvestmentPeriod] = useState("monthly");

  // Get member business profile
  const { data: businessProfile, isLoading: loadingProfile } = 
    trpc.closedLoopWealth.getMemberBusinessProfile.useQuery();
  
  const { data: reinvestmentHistory, isLoading: loadingHistory } = 
    trpc.closedLoopWealth.getMyReinvestmentHistory.useQuery();
  
  const { data: prosperityDistributions } = 
    trpc.closedLoopWealth.getProsperityDistributions.useQuery();
  
  const { data: memberBenefits } = 
    trpc.closedLoopWealth.getMemberBenefits.useQuery();

  const submitReinvestment = trpc.closedLoopWealth.submitReinvestment.useMutation({
    onSuccess: () => {
      toast.success("Community reinvestment submitted successfully!");
      setReinvestmentAmount("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit reinvestment");
    },
  });

  const handleSubmitReinvestment = () => {
    const amount = parseFloat(reinvestmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    submitReinvestment.mutate({ amount, period: reinvestmentPeriod });
  };

  if (loadingProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!businessProfile) {
    return (
      <DashboardLayout>
        <div className="container max-w-6xl mx-auto py-8">
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Member Business Found</h2>
              <p className="text-muted-foreground mb-6">
                You haven't registered a business as a 508 member yet.
              </p>
              <Button>Register Your Business</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const tier = membershipTiers[businessProfile.membershipTier as keyof typeof membershipTiers] || membershipTiers.standard;
  const compliance = complianceStatus[businessProfile.complianceStatus as keyof typeof complianceStatus] || complianceStatus.pending;
  const TierIcon = tier.icon;
  const ComplianceIcon = compliance.icon;

  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{businessProfile.businessName}</h1>
            <p className="text-muted-foreground">508 Member Business Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${tier.bgColor} ${tier.color} border-0 px-3 py-1`}>
              <TierIcon className="w-4 h-4 mr-1" />
              {tier.name} Member
            </Badge>
            <Badge className={`${compliance.bgColor} ${compliance.color} border-0 px-3 py-1`}>
              <ComplianceIcon className="w-4 h-4 mr-1" />
              {compliance.label}
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reinvestment</p>
                  <p className="text-2xl font-bold">${businessProfile.totalReinvestment?.toLocaleString() || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                YTD: ${businessProfile.ytdReinvestment?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Distributions Received</p>
                  <p className="text-2xl font-bold">${businessProfile.totalDistributions?.toLocaleString() || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Prosperity distributions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reinvestment Rate</p>
                  <p className="text-2xl font-bold">{businessProfile.reinvestmentRate || 10}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Community contribution rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Referrals</p>
                  <p className="text-2xl font-bold">{businessProfile.referralCount || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Businesses referred
              </p>
            </CardContent>
          </Card>
        {/* Live Ticker and Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <LiveTicker department="business" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="reinvestment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reinvestment">Reinvestment</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="distributions">Distributions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Reinvestment Tab */}
          <TabsContent value="reinvestment" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Submit Reinvestment */}
              <Card>
                <CardHeader>
                  <CardTitle>Submit Community Reinvestment</CardTitle>
                  <CardDescription>
                    Contribute your {businessProfile.reinvestmentRate || 10}% community reinvestment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={reinvestmentAmount}
                        onChange={(e) => setReinvestmentAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Period</Label>
                    <Select value={reinvestmentPeriod} onValueChange={setReinvestmentPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleSubmitReinvestment}
                    disabled={submitReinvestment.isPending}
                  >
                    {submitReinvestment.isPending ? "Submitting..." : "Submit Reinvestment"}
                  </Button>
                </CardContent>
              </Card>

              {/* Reinvestment History */}
              <Card>
                <CardHeader>
                  <CardTitle>Reinvestment History</CardTitle>
                  <CardDescription>Your contribution record</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : reinvestmentHistory && reinvestmentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {reinvestmentHistory.slice(0, 5).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">${item.amount?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{item.period}</p>
                          </div>
                          <Badge variant={item.status === 'paid' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No reinvestment history yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits">
            <Card>
              <CardHeader>
                <CardTitle>Member Benefits</CardTitle>
                <CardDescription>
                  Benefits available at your {tier.name} membership tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {memberBenefits?.map((benefit: any, index: number) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-4 rounded-lg border ${
                        benefit.available 
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                          : 'bg-muted/30 border-muted'
                      }`}
                    >
                      {benefit.available ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div>
                        <p className={`font-medium ${!benefit.available && 'text-muted-foreground'}`}>
                          {benefit.name}
                        </p>
                        {!benefit.available && (
                          <p className="text-xs text-muted-foreground">Upgrade to unlock</p>
                        )}
                      </div>
                    </div>
                  )) || (
                    <>
                      <div className="flex items-center gap-3 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="font-medium">Academy Access</p>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="font-medium">Business Consulting</p>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="font-medium">Network Events</p>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30 border-muted">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-muted-foreground">Marketing Support</p>
                          <p className="text-xs text-muted-foreground">Premium tier</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distributions Tab */}
          <TabsContent value="distributions">
            <Card>
              <CardHeader>
                <CardTitle>Prosperity Distributions</CardTitle>
                <CardDescription>Benefits received from the collective</CardDescription>
              </CardHeader>
              <CardContent>
                {prosperityDistributions && prosperityDistributions.length > 0 ? (
                  <div className="space-y-3">
                    {prosperityDistributions.map((dist: any) => (
                      <div key={dist.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Gift className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">${dist.amount?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{dist.distributionType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge>{dist.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(dist.distributedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No distributions received yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Distributions are based on collective performance and your contribution level
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>Your 508 member business information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Business Name</Label>
                      <p className="font-medium">{businessProfile.businessName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Business Type</Label>
                      <p className="font-medium capitalize">{businessProfile.businessType?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">EIN</Label>
                      <p className="font-medium">{businessProfile.ein || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">State of Formation</Label>
                      <p className="font-medium">{businessProfile.stateOfFormation || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Membership Status</Label>
                      <p className="font-medium capitalize">{businessProfile.membershipStatus}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Membership Tier</Label>
                      <div className="flex items-center gap-2">
                        <TierIcon className={`w-5 h-5 ${tier.color}`} />
                        <p className="font-medium">{tier.name}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Member Since</Label>
                      <p className="font-medium">
                        {businessProfile.joinedDate 
                          ? new Date(businessProfile.joinedDate).toLocaleDateString() 
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Sponsoring House</Label>
                      <p className="font-medium">{businessProfile.houseName || 'None'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Wealth Loop Visualization */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle>Your Place in the Wealth Loop</CardTitle>
            <CardDescription>How your contributions power the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-4 text-center">
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium">Your Business</p>
                <p className="text-xs text-muted-foreground">Earns Revenue</p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-muted-foreground" />
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Reinvestment</p>
                <p className="text-xs text-muted-foreground">{businessProfile.reinvestmentRate || 10}% to Treasury</p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-muted-foreground" />
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium">L.A.W.S. Jobs</p>
                <p className="text-xs text-muted-foreground">Community Employment</p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-muted-foreground" />
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                  <Gift className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-sm font-medium">Distributions</p>
                <p className="text-xs text-muted-foreground">Back to Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
