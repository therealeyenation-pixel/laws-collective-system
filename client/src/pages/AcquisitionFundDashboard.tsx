/**
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
 * Acquisition Fund Dashboard
 * 
 * Treasury dashboard showing fund balances, progress toward targets,
 * pending transfers/disbursements, and recent transactions
 */

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
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Building2,
  Home,
  Hammer,
  PaintBucket,
  AlertTriangle,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  RefreshCw,
  Loader2,
  Target,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Fund icons mapping
const fundIcons: Record<string, React.ReactNode> = {
  land_acquisition: <Building2 className="w-5 h-5" />,
  building_acquisition: <Home className="w-5 h-5" />,
  construction: <Hammer className="w-5 h-5" />,
  renovation: <PaintBucket className="w-5 h-5" />,
  emergency_housing: <AlertTriangle className="w-5 h-5" />,
  general_operations: <Wallet className="w-5 h-5" />,
};

// Fund colors
const fundColors: Record<string, string> = {
  land_acquisition: "bg-emerald-100 text-emerald-700 border-emerald-200",
  building_acquisition: "bg-blue-100 text-blue-700 border-blue-200",
  construction: "bg-amber-100 text-amber-700 border-amber-200",
  renovation: "bg-purple-100 text-purple-700 border-purple-200",
  emergency_housing: "bg-red-100 text-red-700 border-red-200",
  general_operations: "bg-slate-100 text-slate-700 border-slate-200",
};

// Status badges
const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
    case "approved":
      return <Badge className="gap-1 bg-blue-500"><CheckCircle2 className="w-3 h-3" />Approved</Badge>;
    case "completed":
    case "disbursed":
      return <Badge className="gap-1 bg-green-500"><CheckCircle2 className="w-3 h-3" />Completed</Badge>;
    case "rejected":
      return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function AcquisitionFundDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [disbursementDialogOpen, setDisbursementDialogOpen] = useState(false);
  
  // Form state for transfer
  const [transferForm, setTransferForm] = useState({
    fromFundId: "",
    toFundId: "",
    amount: "",
    reason: "",
  });
  
  // Form state for disbursement
  const [disbursementForm, setDisbursementForm] = useState({
    fundId: "",
    amount: "",
    purpose: "",
    vendor: "",
    invoiceNumber: "",
  });
  
  // tRPC queries
  const { data: fundCategories } = trpc.acquisitionFund.getFundCategories.useQuery();
  const { data: allBalances, refetch: refetchBalances } = trpc.acquisitionFund.getAllBalances.useQuery();
  const { data: dashboardWidgets } = trpc.acquisitionFund.getDashboardWidgets.useQuery();
  const { data: transferRequests, refetch: refetchTransfers } = trpc.acquisitionFund.listTransferRequests.useQuery({});
  const { data: disbursementRequests, refetch: refetchDisbursements } = trpc.acquisitionFund.listDisbursementRequests.useQuery({});
  const { data: transactions, refetch: refetchTransactions } = trpc.acquisitionFund.getTransactions.useQuery({ limit: 20 });
  
  // tRPC mutations
  const requestTransferMutation = trpc.acquisitionFund.requestTransfer.useMutation({
    onSuccess: () => {
      toast.success("Transfer request submitted");
      setTransferDialogOpen(false);
      setTransferForm({ fromFundId: "", toFundId: "", amount: "", reason: "" });
      refetchTransfers();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit transfer request");
    },
  });
  
  const approveTransferMutation = trpc.acquisitionFund.approveTransfer.useMutation({
    onSuccess: () => {
      toast.success("Transfer approved");
      refetchTransfers();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve transfer");
    },
  });
  
  const completeTransferMutation = trpc.acquisitionFund.completeTransfer.useMutation({
    onSuccess: () => {
      toast.success("Transfer completed");
      refetchTransfers();
      refetchBalances();
      refetchTransactions();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete transfer");
    },
  });
  
  const requestDisbursementMutation = trpc.acquisitionFund.requestDisbursement.useMutation({
    onSuccess: () => {
      toast.success("Disbursement request submitted");
      setDisbursementDialogOpen(false);
      setDisbursementForm({ fundId: "", amount: "", purpose: "", vendor: "", invoiceNumber: "" });
      refetchDisbursements();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit disbursement request");
    },
  });
  
  const approveDisbursementMutation = trpc.acquisitionFund.approveDisbursement.useMutation({
    onSuccess: () => {
      toast.success("Disbursement approved");
      refetchDisbursements();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve disbursement");
    },
  });
  
  const completeDisbursementMutation = trpc.acquisitionFund.completeDisbursement.useMutation({
    onSuccess: () => {
      toast.success("Disbursement completed");
      refetchDisbursements();
      refetchBalances();
      refetchTransactions();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete disbursement");
    },
  });
  
  const handleSubmitTransfer = () => {
    if (!transferForm.fromFundId || !transferForm.toFundId || !transferForm.amount || !transferForm.reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    requestTransferMutation.mutate({
      fromFundId: transferForm.fromFundId as any,
      toFundId: transferForm.toFundId as any,
      amount: parseFloat(transferForm.amount),
      reason: transferForm.reason,
    });
  };
  
  const handleSubmitDisbursement = () => {
    if (!disbursementForm.fundId || !disbursementForm.amount || !disbursementForm.purpose) {
      toast.error("Please fill in all required fields");
      return;
    }
    requestDisbursementMutation.mutate({
      fundId: disbursementForm.fundId as any,
      amount: parseFloat(disbursementForm.amount),
      purpose: disbursementForm.purpose,
      vendor: disbursementForm.vendor || undefined,
      invoiceNumber: disbursementForm.invoiceNumber || undefined,
    });
  };
  
  // Calculate totals
  const totalBalance = allBalances?.reduce((sum, b) => sum + b.currentBalance, 0) ?? 0;
  const totalTarget = fundCategories?.reduce((sum, f) => sum + f.targetBalance, 0) ?? 0;
  const overallProgress = totalTarget > 0 ? (totalBalance / totalTarget) * 100 : 0;
  
  const pendingTransfers = transferRequests?.filter(t => t.status === "pending" || t.status === "approved").length ?? 0;
  const pendingDisbursements = disbursementRequests?.filter(d => d.status === "pending" || d.status === "approved").length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Land & Buildings Acquisition Fund
            </h1>
            <p className="text-muted-foreground">
              Treasury management for property acquisition and development
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Transfer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Fund Transfer</DialogTitle>
                  <DialogDescription>
                    Transfer funds between acquisition fund categories
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>From Fund *</Label>
                    <Select
                      value={transferForm.fromFundId}
                      onValueChange={(v) => setTransferForm(f => ({ ...f, fromFundId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source fund" />
                      </SelectTrigger>
                      <SelectContent>
                        {fundCategories?.map((fund) => (
                          <SelectItem key={fund.id} value={fund.id}>
                            {fund.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>To Fund *</Label>
                    <Select
                      value={transferForm.toFundId}
                      onValueChange={(v) => setTransferForm(f => ({ ...f, toFundId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination fund" />
                      </SelectTrigger>
                      <SelectContent>
                        {fundCategories?.filter(f => f.id !== transferForm.fromFundId).map((fund) => (
                          <SelectItem key={fund.id} value={fund.id}>
                            {fund.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm(f => ({ ...f, amount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason *</Label>
                    <Textarea
                      placeholder="Explain the reason for this transfer..."
                      value={transferForm.reason}
                      onChange={(e) => setTransferForm(f => ({ ...f, reason: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitTransfer} disabled={requestTransferMutation.isPending}>
                    {requestTransferMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={disbursementDialogOpen} onOpenChange={setDisbursementDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-green-700 hover:bg-green-800">
                  <DollarSign className="w-4 h-4" />
                  Disbursement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Disbursement</DialogTitle>
                  <DialogDescription>
                    Request funds for property acquisition or development
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Fund *</Label>
                    <Select
                      value={disbursementForm.fundId}
                      onValueChange={(v) => setDisbursementForm(f => ({ ...f, fundId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fund" />
                      </SelectTrigger>
                      <SelectContent>
                        {fundCategories?.map((fund) => (
                          <SelectItem key={fund.id} value={fund.id}>
                            {fund.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={disbursementForm.amount}
                      onChange={(e) => setDisbursementForm(f => ({ ...f, amount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose *</Label>
                    <Textarea
                      placeholder="Describe the purpose of this disbursement..."
                      value={disbursementForm.purpose}
                      onChange={(e) => setDisbursementForm(f => ({ ...f, purpose: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vendor</Label>
                      <Input
                        placeholder="Vendor name"
                        value={disbursementForm.vendor}
                        onChange={(e) => setDisbursementForm(f => ({ ...f, vendor: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice #</Label>
                      <Input
                        placeholder="Invoice number"
                        value={disbursementForm.invoiceNumber}
                        onChange={(e) => setDisbursementForm(f => ({ ...f, invoiceNumber: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDisbursementDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitDisbursement} disabled={requestDisbursementMutation.isPending}>
                    {requestDisbursementMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(totalBalance)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-green-700" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress to Target</span>
                  <span className="font-medium">{overallProgress.toFixed(1)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Target Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-700" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {formatCurrency(totalTarget - totalBalance)} remaining to reach target
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Transfers</p>
                  <p className="text-2xl font-bold">{pendingTransfers}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <ArrowRightLeft className="w-6 h-6 text-amber-700" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Awaiting approval or completion
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Disbursements</p>
                  <p className="text-2xl font-bold">{pendingDisbursements}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-700" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Awaiting approval or payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Fund Overview</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Fund Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardWidgets?.map((widget) => {
                const fund = fundCategories?.find(f => f.id === widget.fundId);
                const colorClass = fundColors[widget.fundId] || fundColors.general_operations;
                const icon = fundIcons[widget.fundId] || <Wallet className="w-5 h-5" />;
                
                return (
                  <Card key={widget.fundId} className={`border-2 ${colorClass.split(" ")[2]}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                            {icon}
                          </div>
                          <div>
                            <CardTitle className="text-base">{fund?.name}</CardTitle>
                            <CardDescription className="text-xs">{fund?.description}</CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={
                            widget.status === "on_track" ? "default" :
                            widget.status === "ahead" ? "default" :
                            "secondary"
                          }
                          className={
                            widget.status === "on_track" ? "bg-green-500" :
                            widget.status === "ahead" ? "bg-blue-500" :
                            ""
                          }
                        >
                          {widget.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-2xl font-bold">{formatCurrency(widget.currentBalance)}</span>
                            <span className="text-sm text-muted-foreground">
                              of {formatCurrency(widget.targetBalance)}
                            </span>
                          </div>
                          <Progress value={widget.progressPercent} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {widget.progressPercent.toFixed(1)}% of target
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1 text-green-600">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>{formatCurrency(widget.totalInflows)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-600">
                            <ArrowDownRight className="w-4 h-4" />
                            <span>{formatCurrency(widget.totalOutflows)}</span>
                          </div>
                        </div>
                        
                        {widget.pendingDisbursements > 0 && (
                          <div className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                            {formatCurrency(widget.pendingDisbursements)} pending disbursement
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transfer Requests</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => refetchTransfers()}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transferRequests && transferRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferRequests.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell className="text-sm">
                            {formatDate(transfer.requestedAt)}
                          </TableCell>
                          <TableCell>
                            {fundCategories?.find(f => f.id === transfer.fromFundId)?.name}
                          </TableCell>
                          <TableCell>
                            {fundCategories?.find(f => f.id === transfer.toFundId)?.name}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(transfer.amount)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {transfer.reason}
                          </TableCell>
                          <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                          <TableCell>
                            {transfer.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveTransferMutation.mutate({ requestId: transfer.id })}
                                disabled={approveTransferMutation.isPending}
                              >
                                Approve
                              </Button>
                            )}
                            {transfer.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={() => completeTransferMutation.mutate({ requestId: transfer.id })}
                                disabled={completeTransferMutation.isPending}
                              >
                                Complete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No transfer requests yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disbursements Tab */}
          <TabsContent value="disbursements" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Disbursement Requests</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => refetchDisbursements()}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {disbursementRequests && disbursementRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Fund</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disbursementRequests.map((disbursement) => (
                        <TableRow key={disbursement.id}>
                          <TableCell className="text-sm">
                            {formatDate(disbursement.requestedAt)}
                          </TableCell>
                          <TableCell>
                            {fundCategories?.find(f => f.id === disbursement.fundId)?.name}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(disbursement.amount)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {disbursement.purpose}
                          </TableCell>
                          <TableCell className="text-sm">
                            {disbursement.vendor || "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(disbursement.status)}</TableCell>
                          <TableCell>
                            {disbursement.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveDisbursementMutation.mutate({ requestId: disbursement.id })}
                                disabled={approveDisbursementMutation.isPending}
                              >
                                Approve
                              </Button>
                            )}
                            {disbursement.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={() => completeDisbursementMutation.mutate({ requestId: disbursement.id })}
                                disabled={completeDisbursementMutation.isPending}
                              >
                                Disburse
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No disbursement requests yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => refetchTransactions()}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Fund</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((txn) => (
                        <TableRow key={txn.id}>
                          <TableCell className="text-sm">
                            {formatDate(txn.createdAt)}
                          </TableCell>
                          <TableCell>
                            {fundCategories?.find(f => f.id === txn.fundId)?.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {txn.type.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {txn.description}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${txn.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {txn.amount >= 0 ? "+" : ""}{formatCurrency(txn.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No transactions yet</p>
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
