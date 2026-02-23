import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { 
  Building2, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  PiggyBank,
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  Loader2,
  CircleDollarSign,
  Landmark,
  Gift,
  Target,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

// Fund type icons and colors
const FUND_CONFIG: Record<string, { icon: any; color: string; bgColor: string }> = {
  reinvestment_pool: { icon: RefreshCw, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  development_fund: { icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  stability_reserve: { icon: Shield, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  growth_fund: { icon: BarChart3, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  legacy_fund: { icon: Landmark, color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-900/30' },
  operating_fund: { icon: Wallet, color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-900/30' },
};

// Status badges
const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
  probationary: { label: 'Probationary', variant: 'outline' },
  suspended: { label: 'Suspended', variant: 'destructive' },
  terminated: { label: 'Terminated', variant: 'destructive' },
  paid: { label: 'Paid', variant: 'default' },
  partial: { label: 'Partial', variant: 'outline' },
  overdue: { label: 'Overdue', variant: 'destructive' },
  waived: { label: 'Waived', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  disbursed: { label: 'Disbursed', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
};

export default function ClosedLoopWealth() {
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showReinvestmentDialog, setShowReinvestmentDialog] = useState(false);
  const [showDistributionDialog, setShowDistributionDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  
  // Form states
  const [newBusiness, setNewBusiness] = useState({
    businessName: '',
    businessType: 'llc' as const,
    ein: '',
    stateOfFormation: '',
    reinvestmentRate: 10,
    notes: '',
  });
  
  const [newReinvestment, setNewReinvestment] = useState({
    memberBusinessId: 0,
    periodStart: '',
    periodEnd: '',
    grossRevenue: 0,
    actualAmount: 0,
    paymentMethod: 'bank_transfer' as const,
    notes: '',
  });
  
  const [newDistribution, setNewDistribution] = useState({
    distributionType: 'member_benefit' as const,
    recipientType: 'member_business' as const,
    recipientId: 0,
    amount: 0,
    sourceType: 'reinvestment_pool' as const,
    purpose: '',
    notes: '',
  });
  
  const [transfer, setTransfer] = useState({
    fromFundId: 0,
    toFundId: 0,
    amount: 0,
    reason: '',
  });

  // Queries
  const { data: dashboard, isLoading: loadingDashboard, refetch: refetchDashboard } = 
    trpc.closedLoopWealth.getWealthDashboard.useQuery();
  
  const { data: treasury, isLoading: loadingTreasury, refetch: refetchTreasury } = 
    trpc.closedLoopWealth.getTreasuryOverview.useQuery();
  
  const { data: memberBusinesses, refetch: refetchBusinesses } = 
    trpc.closedLoopWealth.getAllMemberBusinesses.useQuery({});
  
  const { data: distributions, refetch: refetchDistributions } = 
    trpc.closedLoopWealth.getDistributions.useQuery({});
  
  const { data: reinvestments, refetch: refetchReinvestments } = 
    trpc.closedLoopWealth.getReinvestmentHistory.useQuery({});

  // Mutations
  const registerBusiness = trpc.closedLoopWealth.registerMemberBusiness.useMutation({
    onSuccess: () => {
      toast.success('Business registration submitted');
      setShowRegisterDialog(false);
      refetchBusinesses();
      setNewBusiness({
        businessName: '',
        businessType: 'llc',
        ein: '',
        stateOfFormation: '',
        reinvestmentRate: 10,
        notes: '',
      });
    },
    onError: (error) => toast.error(error.message),
  });
  
  const recordReinvestment = trpc.closedLoopWealth.recordReinvestment.useMutation({
    onSuccess: (data) => {
      toast.success(`Reinvestment recorded. Calculated: $${data.calculatedAmount.toFixed(2)}`);
      setShowReinvestmentDialog(false);
      refetchReinvestments();
      refetchTreasury();
      refetchDashboard();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const createDistribution = trpc.closedLoopWealth.createDistribution.useMutation({
    onSuccess: () => {
      toast.success('Distribution request created');
      setShowDistributionDialog(false);
      refetchDistributions();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const transferFunds = trpc.closedLoopWealth.transferBetweenFunds.useMutation({
    onSuccess: () => {
      toast.success('Funds transferred successfully');
      setShowTransferDialog(false);
      refetchTreasury();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const processDistribution = trpc.closedLoopWealth.processDistribution.useMutation({
    onSuccess: (data) => {
      toast.success(`Distribution ${data.newStatus}`);
      refetchDistributions();
      refetchTreasury();
    },
    onError: (error) => toast.error(error.message),
  });

  const formatCurrency = (amount: number | string | null) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">508 Closed-Loop Wealth System</h1>
            <p className="text-muted-foreground mt-1">
              Self-investing community wealth generation through member businesses
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Register Business
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Register Member Business</DialogTitle>
                  <DialogDescription>
                    Register a new business as a 508 collective member
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input 
                      value={newBusiness.businessName}
                      onChange={(e) => setNewBusiness({...newBusiness, businessName: e.target.value})}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select 
                      value={newBusiness.businessType}
                      onValueChange={(v: any) => setNewBusiness({...newBusiness, businessType: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="llc">LLC</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                        <SelectItem value="s_corp">S-Corporation</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>EIN (Optional)</Label>
                      <Input 
                        value={newBusiness.ein}
                        onChange={(e) => setNewBusiness({...newBusiness, ein: e.target.value})}
                        placeholder="XX-XXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input 
                        value={newBusiness.stateOfFormation}
                        onChange={(e) => setNewBusiness({...newBusiness, stateOfFormation: e.target.value})}
                        placeholder="e.g., Delaware"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Community Reinvestment Rate (%)</Label>
                    <Input 
                      type="number"
                      min={5}
                      max={50}
                      value={newBusiness.reinvestmentRate}
                      onChange={(e) => setNewBusiness({...newBusiness, reinvestmentRate: Number(e.target.value)})}
                    />
                    <p className="text-xs text-muted-foreground">Standard rate is 10%. Minimum 5%, maximum 50%.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea 
                      value={newBusiness.notes}
                      onChange={(e) => setNewBusiness({...newBusiness, notes: e.target.value})}
                      placeholder="Additional information..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>Cancel</Button>
                  <Button 
                    onClick={() => registerBusiness.mutate(newBusiness)}
                    disabled={registerBusiness.isPending || !newBusiness.businessName}
                  >
                    {registerBusiness.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Registration
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showReinvestmentDialog} onOpenChange={setShowReinvestmentDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CircleDollarSign className="w-4 h-4" />
                  Record Reinvestment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Community Reinvestment</DialogTitle>
                  <DialogDescription>
                    Record a contribution from a member business
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Member Business</Label>
                    <Select 
                      value={newReinvestment.memberBusinessId.toString()}
                      onValueChange={(v) => setNewReinvestment({...newReinvestment, memberBusinessId: Number(v)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business" />
                      </SelectTrigger>
                      <SelectContent>
                        {(memberBusinesses as any[])?.filter((b: any) => b.membershipStatus === 'active').map((b: any) => (
                          <SelectItem key={b.id} value={b.id.toString()}>{b.businessName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Period Start</Label>
                      <Input 
                        type="date"
                        value={newReinvestment.periodStart}
                        onChange={(e) => setNewReinvestment({...newReinvestment, periodStart: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Period End</Label>
                      <Input 
                        type="date"
                        value={newReinvestment.periodEnd}
                        onChange={(e) => setNewReinvestment({...newReinvestment, periodEnd: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gross Revenue for Period</Label>
                    <Input 
                      type="number"
                      min={0}
                      step={0.01}
                      value={newReinvestment.grossRevenue}
                      onChange={(e) => setNewReinvestment({...newReinvestment, grossRevenue: Number(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Actual Contribution Amount</Label>
                    <Input 
                      type="number"
                      min={0}
                      step={0.01}
                      value={newReinvestment.actualAmount}
                      onChange={(e) => setNewReinvestment({...newReinvestment, actualAmount: Number(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select 
                      value={newReinvestment.paymentMethod}
                      onValueChange={(v: any) => setNewReinvestment({...newReinvestment, paymentMethod: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="internal_transfer">Internal Transfer</SelectItem>
                        <SelectItem value="token_conversion">Token Conversion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowReinvestmentDialog(false)}>Cancel</Button>
                  <Button 
                    onClick={() => recordReinvestment.mutate(newReinvestment)}
                    disabled={recordReinvestment.isPending || !newReinvestment.memberBusinessId}
                  >
                    {recordReinvestment.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Record Contribution
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboard?.memberStats?.activeMembers || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    of {dashboard?.memberStats?.totalMembers || 0} total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <PiggyBank className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Treasury Balance</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(treasury?.totals?.totalBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ArrowUpRight className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Contributions</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(dashboard?.memberStats?.totalContributions)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Gift className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Benefits Distributed</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(dashboard?.memberStats?.totalBenefitsDistributed)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wealth Flow Visualization */}
        <Card className="bg-gradient-to-br from-background to-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              Closed-Loop Wealth Flow
            </CardTitle>
            <CardDescription>
              How wealth circulates within the 508 collective ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-6">
              {/* Member Businesses */}
              <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <Building2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <p className="font-semibold text-foreground">Member Businesses</p>
                <p className="text-sm text-muted-foreground">Generate Revenue</p>
              </div>
              
              <ArrowRightLeft className="w-6 h-6 text-muted-foreground rotate-0 md:rotate-0" />
              
              {/* Community Reinvestment */}
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <CircleDollarSign className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="font-semibold text-foreground">Community Reinvestment</p>
                <p className="text-sm text-muted-foreground">10% Contribution</p>
              </div>
              
              <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
              
              {/* Collective Treasury */}
              <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <Landmark className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="font-semibold text-foreground">Collective Treasury</p>
                <p className="text-sm text-muted-foreground">508 Common Fund</p>
              </div>
              
              <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
              
              {/* Prosperity Distribution */}
              <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <Gift className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                <p className="font-semibold text-foreground">Member Benefits</p>
                <p className="text-sm text-muted-foreground">Prosperity Distribution</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="treasury" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="treasury">Treasury</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="reinvestments">Reinvestments</TabsTrigger>
            <TabsTrigger value="distributions">Distributions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Treasury Tab */}
          <TabsContent value="treasury" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Collective Treasury Funds</h3>
              <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowRightLeft className="w-4 h-4" />
                    Transfer Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transfer Between Funds</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>From Fund</Label>
                      <Select 
                        value={transfer.fromFundId.toString()}
                        onValueChange={(v) => setTransfer({...transfer, fromFundId: Number(v)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source fund" />
                        </SelectTrigger>
                        <SelectContent>
                          {(treasury?.funds as any[])?.map((f: any) => (
                            <SelectItem key={f.id} value={f.id.toString()}>
                              {f.fundName} ({formatCurrency(f.currentBalance)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>To Fund</Label>
                      <Select 
                        value={transfer.toFundId.toString()}
                        onValueChange={(v) => setTransfer({...transfer, toFundId: Number(v)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination fund" />
                        </SelectTrigger>
                        <SelectContent>
                          {(treasury?.funds as any[])?.filter((f: any) => f.id !== transfer.fromFundId).map((f: any) => (
                            <SelectItem key={f.id} value={f.id.toString()}>
                              {f.fundName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input 
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={transfer.amount}
                        onChange={(e) => setTransfer({...transfer, amount: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason</Label>
                      <Textarea 
                        value={transfer.reason}
                        onChange={(e) => setTransfer({...transfer, reason: e.target.value})}
                        placeholder="Reason for transfer..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowTransferDialog(false)}>Cancel</Button>
                    <Button 
                      onClick={() => transferFunds.mutate(transfer)}
                      disabled={transferFunds.isPending || !transfer.fromFundId || !transfer.toFundId || transfer.amount <= 0}
                    >
                      {transferFunds.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Transfer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(treasury?.funds as any[])?.map((fund: any) => {
                const config = FUND_CONFIG[fund.fundType] || FUND_CONFIG.operating_fund;
                const FundIcon = config.icon;
                const percentOfTarget = fund.targetBalance ? (Number(fund.currentBalance) / Number(fund.targetBalance)) * 100 : 0;
                
                return (
                  <Card key={fund.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <FundIcon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-base">{fund.fundName}</CardTitle>
                            <CardDescription className="text-xs">
                              {fund.allocationPercentage}% allocation
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-foreground mb-2">
                        {formatCurrency(fund.currentBalance)}
                      </p>
                      {fund.targetBalance && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Target: {formatCurrency(fund.targetBalance)}</span>
                            <span>{percentOfTarget.toFixed(0)}%</span>
                          </div>
                          <Progress value={Math.min(percentOfTarget, 100)} className="h-1" />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Total In</p>
                          <p className="font-medium text-emerald-600">{formatCurrency(fund.totalDeposits)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Out</p>
                          <p className="font-medium text-rose-600">{formatCurrency(fund.totalWithdrawals)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Treasury Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(treasury?.recentTransactions as any[])?.slice(0, 10).map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        {tx.transactionType.includes('deposit') || tx.transactionType.includes('transfer_in') ? (
                          <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-rose-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{tx.fundName}</p>
                          <p className="text-xs text-muted-foreground">{tx.description || tx.transactionType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${tx.transactionType.includes('deposit') || tx.transactionType.includes('transfer_in') ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.transactionType.includes('deposit') || tx.transactionType.includes('transfer_in') ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!treasury?.recentTransactions || (treasury.recentTransactions as any[]).length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-4">
              {(memberBusinesses as any[])?.map((business: any) => (
                <Card key={business.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{business.businessName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {business.businessType.toUpperCase()} • {business.stateOfFormation || 'N/A'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={STATUS_CONFIG[business.membershipStatus]?.variant || 'secondary'}>
                              {STATUS_CONFIG[business.membershipStatus]?.label || business.membershipStatus}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {business.membershipTier}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Reinvestment Rate</p>
                          <p className="text-lg font-bold text-foreground">{business.reinvestmentRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Contributed</p>
                          <p className="text-lg font-bold text-emerald-600">{formatCurrency(business.totalContributed)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Benefits Received</p>
                          <p className="text-lg font-bold text-blue-600">{formatCurrency(business.totalBenefitsReceived)}</p>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-32">
                        <p className="text-xs text-muted-foreground mb-1">Compliance</p>
                        <Progress value={Number(business.complianceScore)} className="h-2" />
                        <p className="text-xs text-right text-muted-foreground mt-1">{Number(business.complianceScore).toFixed(0)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!memberBusinesses || (memberBusinesses as any[]).length === 0) && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Member Businesses</h3>
                    <p className="text-muted-foreground mb-4">
                      Register your first business to join the 508 collective
                    </p>
                    <Button onClick={() => setShowRegisterDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Register Business
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Reinvestments Tab */}
          <TabsContent value="reinvestments" className="space-y-4">
            <div className="space-y-3">
              {(reinvestments as any[])?.map((r: any) => (
                <Card key={r.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CircleDollarSign className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{r.businessName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(r.periodStart).toLocaleDateString()} - {new Date(r.periodEnd).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(r.actualAmount)} of {formatCurrency(r.calculatedAmount)}
                          </span>
                          <Badge variant={STATUS_CONFIG[r.paymentStatus]?.variant || 'secondary'}>
                            {STATUS_CONFIG[r.paymentStatus]?.label || r.paymentStatus}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Revenue: {formatCurrency(r.grossRevenue)} @ {r.reinvestmentRate}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!reinvestments || (reinvestments as any[]).length === 0) && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CircleDollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Reinvestments</h3>
                    <p className="text-muted-foreground">
                      Community reinvestments will appear here once recorded
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Distributions Tab */}
          <TabsContent value="distributions" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showDistributionDialog} onOpenChange={setShowDistributionDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Distribution
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Prosperity Distribution</DialogTitle>
                    <DialogDescription>
                      Request a distribution from the collective treasury
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Distribution Type</Label>
                      <Select 
                        value={newDistribution.distributionType}
                        onValueChange={(v: any) => setNewDistribution({...newDistribution, distributionType: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member_benefit">Member Benefit</SelectItem>
                          <SelectItem value="development_funding">Development Funding</SelectItem>
                          <SelectItem value="stability_support">Stability Support</SelectItem>
                          <SelectItem value="growth_investment">Growth Investment</SelectItem>
                          <SelectItem value="legacy_distribution">Legacy Distribution</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Recipient Business</Label>
                      <Select 
                        value={newDistribution.recipientId.toString()}
                        onValueChange={(v) => setNewDistribution({...newDistribution, recipientId: Number(v)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                        <SelectContent>
                          {(memberBusinesses as any[])?.filter((b: any) => b.membershipStatus === 'active').map((b: any) => (
                            <SelectItem key={b.id} value={b.id.toString()}>{b.businessName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input 
                        type="number"
                        min={0}
                        step={0.01}
                        value={newDistribution.amount}
                        onChange={(e) => setNewDistribution({...newDistribution, amount: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Purpose</Label>
                      <Textarea 
                        value={newDistribution.purpose}
                        onChange={(e) => setNewDistribution({...newDistribution, purpose: e.target.value})}
                        placeholder="Describe the purpose of this distribution..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDistributionDialog(false)}>Cancel</Button>
                    <Button 
                      onClick={() => createDistribution.mutate(newDistribution)}
                      disabled={createDistribution.isPending || !newDistribution.recipientId || newDistribution.amount <= 0 || newDistribution.purpose.length < 10}
                    >
                      {createDistribution.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Submit Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-3">
              {(distributions as any[])?.map((d: any) => (
                <Card key={d.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="font-medium text-foreground">{d.recipientName || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {d.distributionType.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{d.purpose}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{formatCurrency(d.amount)}</p>
                        <Badge variant={STATUS_CONFIG[d.approvalStatus]?.variant || 'secondary'}>
                          {STATUS_CONFIG[d.approvalStatus]?.label || d.approvalStatus}
                        </Badge>
                        {d.approvalStatus === 'pending' && (
                          <div className="flex gap-1 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => processDistribution.mutate({ distributionId: d.id, action: 'approve' })}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => processDistribution.mutate({ distributionId: d.id, action: 'reject' })}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {d.approvalStatus === 'approved' && (
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => processDistribution.mutate({ 
                              distributionId: d.id, 
                              action: 'disburse',
                              disbursementMethod: 'bank_transfer'
                            })}
                          >
                            Disburse
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!distributions || (distributions as any[]).length === 0) && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Distributions</h3>
                    <p className="text-muted-foreground">
                      Prosperity distributions will appear here once created
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Wealth Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(dashboard?.monthlyFlow as any[])?.slice(0, 6).map((month: any) => (
                      <div key={month.month} className="flex items-center justify-between p-2 rounded bg-secondary/30">
                        <span className="text-sm font-medium text-foreground">{month.month}</span>
                        <div className="flex gap-4">
                          <span className="text-sm text-emerald-600">+{formatCurrency(month.inflow)}</span>
                          <span className="text-sm text-rose-600">-{formatCurrency(month.outflow)}</span>
                        </div>
                      </div>
                    ))}
                    {(!dashboard?.monthlyFlow || (dashboard.monthlyFlow as any[]).length === 0) && (
                      <p className="text-center text-muted-foreground py-4">No flow data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Compliance Score</span>
                      <span className="font-medium text-foreground">
                        {Number(dashboard?.memberStats?.avgComplianceScore || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pending Approvals</span>
                      <span className="font-medium text-foreground">
                        {dashboard?.memberStats?.pendingMembers || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lifetime Deposits</span>
                      <span className="font-medium text-emerald-600">
                        {formatCurrency(treasury?.totals?.lifetimeDeposits)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lifetime Withdrawals</span>
                      <span className="font-medium text-rose-600">
                        {formatCurrency(treasury?.totals?.lifetimeWithdrawals)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
