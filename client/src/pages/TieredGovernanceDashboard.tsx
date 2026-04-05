import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Filter,
  BarChart3,
  Wallet,
  Building,
  Coins,
  LineChart,
  AlertCircle,
  FileText,
} from "lucide-react";

// Risk tier colors
const TIER_COLORS: Record<string, string> = {
  cash: "bg-green-100 text-green-800 border-green-200",
  stablecoin: "bg-blue-100 text-blue-800 border-blue-200",
  index: "bg-cyan-100 text-cyan-800 border-cyan-200",
  stock: "bg-purple-100 text-purple-800 border-purple-200",
  volatile_crypto: "bg-orange-100 text-orange-800 border-orange-200",
  speculative: "bg-red-100 text-red-800 border-red-200",
  property: "bg-amber-100 text-amber-800 border-amber-200",
};

const TIER_ICONS: Record<string, React.ReactNode> = {
  cash: <DollarSign className="h-4 w-4" />,
  stablecoin: <Coins className="h-4 w-4" />,
  index: <BarChart3 className="h-4 w-4" />,
  stock: <LineChart className="h-4 w-4" />,
  volatile_crypto: <TrendingUp className="h-4 w-4" />,
  speculative: <AlertTriangle className="h-4 w-4" />,
  property: <Building className="h-4 w-4" />,
};

const GOVERNANCE_LEVEL_COLORS: Record<string, string> = {
  auto_approve: "bg-green-100 text-green-800",
  manager_approve: "bg-blue-100 text-blue-800",
  committee_review: "bg-yellow-100 text-yellow-800",
  board_approval: "bg-orange-100 text-orange-800",
  special_meeting: "bg-red-100 text-red-800",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  auto_approved: "bg-green-100 text-green-800",
  awaiting_approval: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  executed: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function TieredGovernanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");

  // Form state for new transaction request
  const [newRequest, setNewRequest] = useState({
    type: "buy" as "buy" | "sell" | "transfer" | "rebalance",
    assetClass: "",
    ticker: "",
    amount: "",
    quantity: "",
    notes: "",
  });

  // Fetch data
  const { data: riskTiers } = trpc.tieredGovernance.getAllRiskTiers.useQuery();
  const { data: transactionRequests, refetch: refetchRequests } = trpc.tieredGovernance.getTransactionRequests.useQuery({
    status: filterStatus !== "all" ? filterStatus as any : undefined,
    riskTier: filterTier !== "all" ? filterTier as any : undefined,
  });
  const { data: pendingApprovals } = trpc.tieredGovernance.getPendingApprovals.useQuery({});
  const { data: governanceSummary } = trpc.tieredGovernance.generateGovernanceSummary.useQuery();
  const { data: defaultPolicy } = trpc.tieredGovernance.getDefaultPolicy.useQuery();

  // Mutations
  const createRequest = trpc.tieredGovernance.createTransactionRequest.useMutation({
    onSuccess: () => {
      toast.success("Transaction request created successfully");
      setShowNewRequestDialog(false);
      setNewRequest({ type: "buy", assetClass: "", ticker: "", amount: "", quantity: "", notes: "" });
      refetchRequests();
    },
    onError: (error) => {
      toast.error(`Failed to create request: ${error.message}`);
    },
  });

  const approveRequest = trpc.tieredGovernance.approveTransactionRequest.useMutation({
    onSuccess: () => {
      toast.success("Request approved");
      refetchRequests();
    },
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  const rejectRequest = trpc.tieredGovernance.rejectTransactionRequest.useMutation({
    onSuccess: () => {
      toast.success("Request rejected");
      refetchRequests();
    },
    onError: (error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });

  const executeRequest = trpc.tieredGovernance.executeTransaction.useMutation({
    onSuccess: () => {
      toast.success("Transaction executed");
      refetchRequests();
    },
    onError: (error) => {
      toast.error(`Failed to execute: ${error.message}`);
    },
  });

  const handleCreateRequest = () => {
    if (!newRequest.assetClass || !newRequest.amount) {
      toast.error("Please fill in required fields");
      return;
    }
    createRequest.mutate({
      type: newRequest.type,
      assetClass: newRequest.assetClass,
      ticker: newRequest.ticker || undefined,
      amount: parseFloat(newRequest.amount),
      quantity: newRequest.quantity ? parseFloat(newRequest.quantity) : undefined,
      notes: newRequest.notes || undefined,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tiered Governance</h1>
            <p className="text-muted-foreground mt-1">
              Risk-based investment approval workflows and portfolio management
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchRequests()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Transaction Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Transaction Request</DialogTitle>
                  <DialogDescription>
                    Submit a new investment transaction for approval based on risk tier governance rules.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Transaction Type</Label>
                    <Select
                      value={newRequest.type}
                      onValueChange={(value) => setNewRequest({ ...newRequest, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="rebalance">Rebalance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Class *</Label>
                    <Select
                      value={newRequest.assetClass}
                      onValueChange={(value) => setNewRequest({ ...newRequest, assetClass: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stocks">Stocks</SelectItem>
                        <SelectItem value="bonds">Bonds</SelectItem>
                        <SelectItem value="mutual_funds">Mutual Funds</SelectItem>
                        <SelectItem value="etfs">ETFs</SelectItem>
                        <SelectItem value="reits">REITs</SelectItem>
                        <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                        <SelectItem value="cash_equivalents">Cash Equivalents</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ticker Symbol (optional)</Label>
                    <Input
                      placeholder="e.g., AAPL, BTC"
                      value={newRequest.ticker}
                      onChange={(e) => setNewRequest({ ...newRequest, ticker: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount ($) *</Label>
                      <Input
                        type="number"
                        placeholder="10000"
                        value={newRequest.amount}
                        onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity (optional)</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={newRequest.quantity}
                        onChange={(e) => setNewRequest({ ...newRequest, quantity: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Reason for this transaction..."
                      value={newRequest.notes}
                      onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRequest} disabled={createRequest.isPending}>
                    {createRequest.isPending ? "Creating..." : "Submit Request"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{governanceSummary?.totalRequests || 0}</div>
              <p className="text-xs text-muted-foreground">All time transaction requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovals?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {governanceSummary?.byStatus?.approved || 0}
              </div>
              <p className="text-xs text-muted-foreground">Successfully approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Auto-Approved</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {governanceSummary?.byGovernanceLevel?.auto_approve || 0}
              </div>
              <p className="text-xs text-muted-foreground">Low-risk automatic approvals</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Transaction Requests</TabsTrigger>
            <TabsTrigger value="tiers">Risk Tiers</TabsTrigger>
            <TabsTrigger value="policy">Investment Policy</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Governance Level Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Governance Level Distribution</CardTitle>
                  <CardDescription>Requests by approval requirement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {governanceSummary?.byGovernanceLevel && Object.entries(governanceSummary.byGovernanceLevel).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={GOVERNANCE_LEVEL_COLORS[level] || "bg-gray-100"}>
                            {level.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{count as number}</span>
                          <Progress 
                            value={((count as number) / (governanceSummary?.totalRequests || 1)) * 100} 
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Tier Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Tier Distribution</CardTitle>
                  <CardDescription>Requests by asset risk classification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {governanceSummary?.byRiskTier && Object.entries(governanceSummary.byRiskTier).map(([tier, count]) => (
                      <div key={tier} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {TIER_ICONS[tier]}
                          <span className="capitalize">{tier.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{count as number}</span>
                          <Progress 
                            value={((count as number) / (governanceSummary?.totalRequests || 1)) * 100} 
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Status</CardTitle>
                  <CardDescription>Current status of all requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {governanceSummary?.byStatus && Object.entries(governanceSummary.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <Badge className={STATUS_COLORS[status] || "bg-gray-100"}>
                          {status.replace(/_/g, " ")}
                        </Badge>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>Requests awaiting your review</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingApprovals && pendingApprovals.length > 0 ? (
                    <div className="space-y-3">
                      {pendingApprovals.slice(0, 5).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={TIER_COLORS[request.riskTier]}>
                                {request.riskTier}
                              </Badge>
                              <span className="font-medium capitalize">{request.type}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {request.assetClass} - {formatCurrency(request.amount)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectRequest.mutate({ requestId: request.id, reason: "Rejected by reviewer" })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => approveRequest.mutate({ requestId: request.id, approverLevel: request.governanceLevel })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>No pending approvals</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transaction Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="executed">Executed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterTier} onValueChange={setFilterTier}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Risk Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="stablecoin">Stablecoin</SelectItem>
                      <SelectItem value="index">Index</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="volatile_crypto">Volatile Crypto</SelectItem>
                      <SelectItem value="speculative">Speculative</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Requests</CardTitle>
                <CardDescription>All investment transaction requests</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionRequests && transactionRequests.length > 0 ? (
                  <div className="space-y-4">
                    {transactionRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={TIER_COLORS[request.riskTier]}>
                                {TIER_ICONS[request.riskTier]}
                                <span className="ml-1">{request.riskTier}</span>
                              </Badge>
                              <Badge className={STATUS_COLORS[request.status]}>
                                {request.status.replace(/_/g, " ")}
                              </Badge>
                              <Badge className={GOVERNANCE_LEVEL_COLORS[request.governanceLevel]}>
                                {request.governanceLevel.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-medium capitalize">{request.type}</span>
                              <span className="text-muted-foreground">•</span>
                              <span>{request.assetClass}</span>
                              {request.ticker && (
                                <>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="font-mono">{request.ticker}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{formatCurrency(request.amount)}</span>
                              {request.quantity && <span>{request.quantity} shares</span>}
                              <span>•</span>
                              <span>{formatDate(request.createdAt)}</span>
                            </div>
                            {request.notes && (
                              <p className="text-sm text-muted-foreground">{request.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {request.status === "awaiting_approval" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rejectRequest.mutate({ requestId: request.id, reason: "Rejected" })}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => approveRequest.mutate({ requestId: request.id, approverLevel: request.governanceLevel })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </>
                            )}
                            {request.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={() => executeRequest.mutate({ requestId: request.id })}
                              >
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                Execute
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-2" />
                    <p>No transaction requests found</p>
                    <Button className="mt-4" onClick={() => setShowNewRequestDialog(true)}>
                      Create First Request
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Tiers Tab */}
          <TabsContent value="tiers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {riskTiers?.map((tier) => (
                <Card key={tier.tier} className={`border-2 ${TIER_COLORS[tier.tier]?.split(" ")[2] || ""}`}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {TIER_ICONS[tier.tier]}
                      <CardTitle className="capitalize">{tier.tier.replace(/_/g, " ")}</CardTitle>
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Risk Level</p>
                        <p className="font-medium">{tier.riskLevel}/10</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Volatility</p>
                        <p className="font-medium capitalize">{tier.volatility}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Example Assets</p>
                      <div className="flex flex-wrap gap-1">
                        {tier.examples.slice(0, 4).map((example: string) => (
                          <Badge key={example} variant="outline" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {tier.tier === "cash" && "Auto-approved up to $50,000"}
                        {tier.tier === "stablecoin" && "Auto-approved up to $25,000"}
                        {tier.tier === "index" && "Manager approval up to $100,000"}
                        {tier.tier === "stock" && "Committee review for $25,000+"}
                        {tier.tier === "volatile_crypto" && "Board approval required for $10,000+"}
                        {tier.tier === "speculative" && "Special meeting for any amount over $5,000"}
                        {tier.tier === "property" && "Board approval for all transactions"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Investment Policy Tab */}
          <TabsContent value="policy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Investment Policy</CardTitle>
                <CardDescription>Current portfolio allocation limits and governance thresholds</CardDescription>
              </CardHeader>
              <CardContent>
                {defaultPolicy && (
                  <div className="space-y-6">
                    {/* Allocation Limits */}
                    <div>
                      <h3 className="font-semibold mb-4">Portfolio Allocation Limits by Risk Tier</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Risk Tier</th>
                              <th className="text-right py-2">Min %</th>
                              <th className="text-right py-2">Max %</th>
                              <th className="text-right py-2">Max Single Position</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(defaultPolicy.allocationLimits).map(([tier, limits]: [string, any]) => (
                              <tr key={tier} className="border-b">
                                <td className="py-2">
                                  <div className="flex items-center gap-2">
                                    {TIER_ICONS[tier]}
                                    <span className="capitalize">{tier.replace(/_/g, " ")}</span>
                                  </div>
                                </td>
                                <td className="text-right py-2">{(limits.minPercent * 100).toFixed(0)}%</td>
                                <td className="text-right py-2">{(limits.maxPercent * 100).toFixed(0)}%</td>
                                <td className="text-right py-2">{(limits.maxSinglePosition * 100).toFixed(0)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Governance Thresholds */}
                    <div>
                      <h3 className="font-semibold mb-4">Governance Approval Thresholds</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Risk Tier</th>
                              <th className="text-right py-2">Auto-Approve</th>
                              <th className="text-right py-2">Manager</th>
                              <th className="text-right py-2">Committee</th>
                              <th className="text-right py-2">Board</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(defaultPolicy.governanceThresholds).map(([tier, thresholds]: [string, any]) => (
                              <tr key={tier} className="border-b">
                                <td className="py-2 capitalize">{tier.replace(/_/g, " ")}</td>
                                <td className="text-right py-2">{formatCurrency(thresholds.auto_approve)}</td>
                                <td className="text-right py-2">{formatCurrency(thresholds.manager_approve)}</td>
                                <td className="text-right py-2">{formatCurrency(thresholds.committee_review)}</td>
                                <td className="text-right py-2">{formatCurrency(thresholds.board_approval)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Prohibited Assets */}
                    <div>
                      <h3 className="font-semibold mb-4">Prohibited Assets</h3>
                      <div className="flex flex-wrap gap-2">
                        {defaultPolicy.prohibitedAssets.map((asset: string) => (
                          <Badge key={asset} variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {asset.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* ESG Requirements */}
                    {defaultPolicy.esgRequirements && (
                      <div>
                        <h3 className="font-semibold mb-4">ESG Requirements</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Minimum ESG Score</p>
                            <p className="font-medium">{defaultPolicy.esgRequirements.minimumScore}/100</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Excluded Sectors</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {defaultPolicy.esgRequirements.excludedSectors.map((sector: string) => (
                                <Badge key={sector} variant="outline" className="text-xs">
                                  {sector}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
