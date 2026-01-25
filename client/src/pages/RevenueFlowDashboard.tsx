import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import {
  ArrowRight,
  Building2,
  Landmark,
  Wallet,
  TrendingUp,
  DollarSign,
  Users,
  PieChart,
  Plus,
  Zap,
  Shield,
  Home,
} from "lucide-react";

export default function RevenueFlowDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);

  const [sourceName, setSourceName] = useState("");
  const [sourceDescription, setSourceDescription] = useState("");
  const [sourceType, setSourceType] = useState<string>("merchandise");

  const [transactionSourceId, setTransactionSourceId] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");

  const { data: overview } = trpc.revenueFlow.getDashboardOverview.useQuery();
  const { data: sources, refetch: refetchSources } = trpc.revenueFlow.getRevenueSources.useQuery({});
  const { data: transactions, refetch: refetchTransactions } = trpc.revenueFlow.getTransactions.useQuery({});
  const { data: splits, refetch: refetchSplits } = trpc.revenueFlow.getSplits.useQuery({});
  const { data: flowLogs } = trpc.revenueFlow.getFlowLogs.useQuery({});
  const { data: revenueByType } = trpc.revenueFlow.getRevenueBySourceType.useQuery();

  const createSource = trpc.revenueFlow.createRevenueSource.useMutation({
    onSuccess: () => {
      toast.success("Revenue source created");
      setShowSourceDialog(false);
      setSourceName("");
      setSourceDescription("");
      refetchSources();
    },
    onError: (error) => toast.error(error.message),
  });

  const recordTransaction = trpc.revenueFlow.recordTransaction.useMutation({
    onSuccess: (data) => {
      toast.success(`Transaction recorded with 60/40 split: $${data.familyPortion.toFixed(2)} family / $${data.networkPortion.toFixed(2)} network`);
      setShowTransactionDialog(false);
      setTransactionAmount("");
      setTransactionDescription("");
      refetchTransactions();
      refetchSplits();
    },
    onError: (error) => toast.error(error.message),
  });

  const processDistribution = trpc.revenueFlow.processSplitDistribution.useMutation({
    onSuccess: () => {
      toast.success("Split distributed successfully");
      refetchSplits();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCreateSource = () => {
    createSource.mutate({
      name: sourceName,
      description: sourceDescription,
      sourceType: sourceType as any,
    });
  };

  const handleRecordTransaction = () => {
    recordTransaction.mutate({
      sourceId: transactionSourceId,
      amount: parseFloat(transactionAmount),
      transactionDate: new Date().toISOString(),
      description: transactionDescription,
    });
  };

  const totalRevenue = Number(overview?.transactions?.totalRevenue || 0);
  const familyPortion = Number(overview?.splits?.totalFamilyPortion || 0);
  const networkPortion = Number(overview?.splits?.totalNetworkPortion || 0);

  const flowStageColors: Record<string, string> = {
    received: "bg-blue-500",
    trust_deposit: "bg-purple-500",
    split_calculated: "bg-amber-500",
    family_allocated: "bg-green-500",
    network_allocated: "bg-cyan-500",
    distributed: "bg-emerald-500",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Revenue Flow</h1>
            <p className="text-muted-foreground">Track revenue from generation to wealth accumulation</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Revenue Source</DialogTitle>
                  <DialogDescription>Create a new revenue stream for tracking</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Source Name</Label>
                    <Input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Merchandise Sales" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input value={sourceDescription} onChange={(e) => setSourceDescription(e.target.value)} placeholder="Revenue from branded merchandise" />
                  </div>
                  <div>
                    <Label>Source Type</Label>
                    <Select value={sourceType} onValueChange={setSourceType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="merchandise">Merchandise</SelectItem>
                        <SelectItem value="academy">Academy</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="membership">Membership</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="licensing">Licensing</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="donation">Donation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateSource} disabled={!sourceName || createSource.isPending} className="w-full">
                    {createSource.isPending ? "Creating..." : "Create Source"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <DollarSign className="w-4 h-4" />
                  Record Revenue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Revenue Transaction</DialogTitle>
                  <DialogDescription>Revenue will automatically be split 60/40</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Revenue Source</Label>
                    <Select value={transactionSourceId} onValueChange={setTransactionSourceId}>
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        {sources?.map((source: any) => (
                          <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input type="number" value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} placeholder="1000.00" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input value={transactionDescription} onChange={(e) => setTransactionDescription(e.target.value)} placeholder="Monthly merchandise sales" />
                  </div>
                  {transactionAmount && (
                    <div className="p-4 bg-secondary/30 rounded-lg space-y-2">
                      <p className="text-sm font-medium">Automatic 60/40 Split Preview:</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Family Portion (60%)</span>
                        <span className="font-medium">${(parseFloat(transactionAmount) * 0.6).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600">Network Pool (40%)</span>
                        <span className="font-medium">${(parseFloat(transactionAmount) * 0.4).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  <Button onClick={handleRecordTransaction} disabled={!transactionSourceId || !transactionAmount || recordTransaction.isPending} className="w-full">
                    {recordTransaction.isPending ? "Recording..." : "Record Transaction"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Progression Flow Visualization */}
        <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Revenue Progression Flow
            </CardTitle>
            <CardDescription>From business creation to wealth accumulation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
              <div className="flex flex-col items-center min-w-[140px]">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-center">Business Creation</p>
                <p className="text-xs text-muted-foreground text-center">Create & Manage</p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              
              <div className="flex flex-col items-center min-w-[140px]">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-center">L.A.W.S. Collective</p>
                <p className="text-xs text-muted-foreground text-center">Revenue Generation</p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              
              <div className="flex flex-col items-center min-w-[140px]">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                  <Landmark className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-center">Trust Deposit</p>
                <p className="text-xs text-muted-foreground text-center">Legal Container</p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              
              <div className="flex flex-col items-center min-w-[140px]">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                  <PieChart className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm font-medium text-center">60/40 Split</p>
                <p className="text-xs text-muted-foreground text-center">Auto Distribution</p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              
              <div className="flex flex-col items-center min-w-[140px]">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-center">Wealth Building</p>
                <p className="text-xs text-muted-foreground text-center">Long-term Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{overview?.transactions?.totalTransactions || 0} transactions</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Family Portion (60%)</CardTitle>
              <Home className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${familyPortion.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Protected allocation</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Network Pool (40%)</CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${networkPortion.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Shared allocation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue Sources</CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.sources?.activeSources || 0}</div>
              <p className="text-xs text-muted-foreground">of {overview?.sources?.totalSources || 0} total</p>
            </CardContent>
          </Card>
        </div>

        {/* 60/40 Split Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Constitutional 60/40 Split
            </CardTitle>
            <CardDescription>Protected wealth distribution ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-green-600">Family Portion</span>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                  <Progress value={60} className="h-4 bg-green-100" />
                </div>
                <div className="text-right min-w-[100px]">
                  <p className="text-lg font-bold text-green-600">${familyPortion.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-blue-600">Network Pool</span>
                    <span className="text-sm font-medium">40%</span>
                  </div>
                  <Progress value={40} className="h-4 bg-blue-100" />
                </div>
                <div className="text-right min-w-[100px]">
                  <p className="text-lg font-bold text-blue-600">${networkPortion.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Source Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {revenueByType?.map((item: any) => (
                      <div key={item.source_type} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{item.source_type}</p>
                          <p className="text-xs text-muted-foreground">{item.transaction_count} transactions</p>
                        </div>
                        <p className="font-bold">${Number(item.total_revenue).toLocaleString()}</p>
                      </div>
                    ))}
                    {(!revenueByType || revenueByType.length === 0) && (
                      <p className="text-center text-muted-foreground py-4">No revenue data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Distributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {splits?.filter((s: any) => s.split_status === 'pending').slice(0, 5).map((split: any) => (
                      <div key={split.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div>
                          <p className="font-medium">${Number(split.total_amount).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            Family: ${Number(split.family_portion).toLocaleString()} | Network: ${Number(split.network_portion).toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => processDistribution.mutate({ splitId: split.id })}>
                          Distribute
                        </Button>
                      </div>
                    ))}
                    {(!splits || splits.filter((s: any) => s.split_status === 'pending').length === 0) && (
                      <p className="text-center text-muted-foreground py-4">No pending distributions</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="grid gap-4">
              {sources?.map((source: any) => (
                <Card key={source.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{source.name}</CardTitle>
                        <CardDescription>{source.description || "No description"}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{source.source_type}</Badge>
                        <Badge className={source.is_active ? "bg-green-500" : "bg-gray-500"}>
                          {source.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Brand</p>
                        <p className="font-medium">{source.brand}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Target</p>
                        <p className="font-medium">${Number(source.monthly_target).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Yearly Target</p>
                        <p className="font-medium">${Number(source.yearly_target).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!sources || sources.length === 0) && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No revenue sources yet. Add your first source to start tracking.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="grid gap-4">
              {transactions?.map((transaction: any) => (
                <Card key={transaction.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{transaction.description || "Transaction"}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.source_name} • {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">${Number(transaction.amount).toLocaleString()}</p>
                        <Badge className={transaction.status === 'completed' ? "bg-green-500" : "bg-yellow-500"}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!transactions || transactions.length === 0) && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No transactions yet. Record your first revenue to start tracking.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <div className="grid gap-2">
              {flowLogs?.map((log: any) => (
                <div key={log.id} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${flowStageColors[log.flow_stage]}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{log.flow_stage.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">{log.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${Number(log.amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!flowLogs || flowLogs.length === 0) && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No flow logs yet. Record transactions to see the audit trail.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
