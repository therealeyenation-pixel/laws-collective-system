import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  PiggyBank,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Gift,
  ShoppingCart,
  Activity,
  Wallet,
  Building2,
  Crown,
  Users,
  BarChart3,
  Globe2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Supported currencies with exchange rates (relative to USD)
const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36 },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", rate: 17.15 },
  { code: "JMD", symbol: "J$", name: "Jamaican Dollar", rate: 155.50 },
  { code: "TTD", symbol: "TT$", name: "Trinidad Dollar", rate: 6.78 },
  { code: "BBD", symbol: "Bds$", name: "Barbados Dollar", rate: 2.00 },
  { code: "XCD", symbol: "EC$", name: "East Caribbean Dollar", rate: 2.70 },
  { code: "BSD", symbol: "B$", name: "Bahamian Dollar", rate: 1.00 },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", rate: 1550.00 },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", rate: 15.50 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rate: 153.00 },
  { code: "ZAR", symbol: "R", name: "South African Rand", rate: 18.50 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 149.50 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.24 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.50 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.53 },
];

export default function FinancialAutomation() {
  const [selectedHouseId, setSelectedHouseId] = useState<number>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");

  // Fetch financial summary
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = 
    trpc.luvledgerAutomation.getFinancialSummary.useQuery({ houseId: selectedHouseId });

  // Fetch allocation pots
  const { data: pots, isLoading: potsLoading } = 
    trpc.luvledgerAutomation.getAllocationPots.useQuery({ houseId: selectedHouseId });

  // Fetch allocation history
  const { data: allocationHistory, isLoading: historyLoading } = 
    trpc.luvledgerAutomation.getAllocationHistory.useQuery({ houseId: selectedHouseId, limit: 20 });

  // Fetch sync cycles
  const { data: syncCycles, isLoading: cyclesLoading } = 
    trpc.luvledgerAutomation.getSyncCycles.useQuery({ houseId: selectedHouseId, limit: 10 });

  // Fetch financial errors
  const { data: errors, isLoading: errorsLoading, refetch: refetchErrors } = 
    trpc.luvledgerAutomation.getFinancialErrors.useQuery({ houseId: selectedHouseId, status: "open" });

  // Mutations
  const runSyncCycle = trpc.luvledgerAutomation.runSyncCycle.useMutation({
    onSuccess: (data) => {
      toast.success(`Sync cycle completed: ${data.transactionsProcessed} transactions processed`);
      refetchSummary();
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  const initializePots = trpc.luvledgerAutomation.initializeHousePots.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.potsCreated} allocation pots created`);
      refetchSummary();
    },
    onError: (error) => {
      toast.error(`Failed to initialize pots: ${error.message}`);
    },
  });

  const resolveError = trpc.luvledgerAutomation.resolveError.useMutation({
    onSuccess: () => {
      toast.success("Error resolved");
      refetchErrors();
    },
  });

  const formatCurrency = (value: string | number | undefined) => {
    if (!value) return "$0.00";
    const num = typeof value === "string" ? parseFloat(value) : value;
    const currency = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];
    const convertedValue = num * currency.rate;
    return new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === "JPY" ? 0 : 2,
      maximumFractionDigits: selectedCurrency === "JPY" ? 0 : 2,
    }).format(convertedValue);
  };

  const formatPercentage = (value: string | number | undefined) => {
    if (!value) return "0%";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `${num.toFixed(1)}%`;
  };

  const getPotIcon = (potType: string) => {
    switch (potType) {
      case "root_authority_reserve": return <Building2 className="w-4 h-4" />;
      case "circulation_pool": return <ArrowRightLeft className="w-4 h-4" />;
      case "house_operational": return <Wallet className="w-4 h-4" />;
      case "steward_compensation": return <Users className="w-4 h-4" />;
      case "commercial_operating": return <DollarSign className="w-4 h-4" />;
      case "future_crown": return <Crown className="w-4 h-4" />;
      case "ancestral_treasury": return <PiggyBank className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  const getPotLabel = (potType: string) => {
    return potType.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Automation</h1>
            <p className="text-muted-foreground">
              LuvLedger allocation engine with 70/30 treasury split and 60/40 house-level distribution
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-[140px]">
                <Globe2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runSyncCycle.mutate({ houseId: selectedHouseId, cycleType: "daily" })}
              disabled={runSyncCycle.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${runSyncCycle.isPending ? "animate-spin" : ""}`} />
              Run Sync
            </Button>
            {(!pots || pots.length === 0) && (
              <Button
                size="sm"
                onClick={() => initializePots.mutate({ houseId: selectedHouseId })}
                disabled={initializePots.isPending}
              >
                Initialize Pots
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(summary?.house?.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All-time house income</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-blue-600" />
                Ancestral Treasury
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {formatCurrency(summary?.house?.ancestralTreasury)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">30% of income reserved</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                Circulation Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {formatCurrency(summary?.house?.circulationPool)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">40% of 70% shareable</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Root Authority Reserve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(summary?.house?.rootAuthorityReserve)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">60% of 70% non-shareable</p>
            </CardContent>
          </Card>
        </div>

        {/* Allocation Rules Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Allocation Rules (Scroll 55)
            </CardTitle>
            <CardDescription>
              Automated distribution based on LuvOnPurpose financial protocols
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">70/30 Treasury Split</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>House Operations</span>
                    <span className="font-medium">70%</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ancestral Treasury</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">60/40 House-Level Split</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Root Authority Reserve (non-shareable)</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Circulation Pool (shareable)</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="pots" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pots">Allocation Pots</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="ratio">Gift/Sale Ratio</TabsTrigger>
            <TabsTrigger value="sync">Sync Cycles</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          {/* Allocation Pots Tab */}
          <TabsContent value="pots" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {potsLoading ? (
                <p className="text-muted-foreground col-span-full text-center py-8">Loading pots...</p>
              ) : pots && pots.length > 0 ? (
                pots.map((pot) => (
                  <Card key={pot.id} className="relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${pot.isShareable ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {getPotIcon(pot.potType)}
                        {getPotLabel(pot.potType)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant={pot.isShareable ? "default" : "secondary"} className="text-xs">
                          {pot.isShareable ? "Shareable" : "Non-Shareable"}
                        </Badge>
                        {pot.requiresApproval && (
                          <Badge variant="outline" className="text-xs">Approval Required</Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatCurrency(pot.balance)}</div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Target: {formatPercentage(pot.targetPercentage)}</span>
                        <span>Status: {pot.status}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground mb-4">No allocation pots configured</p>
                  <Button onClick={() => initializePots.mutate({ houseId: selectedHouseId })}>
                    Initialize Allocation Pots
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Allocation Transaction History</CardTitle>
                <CardDescription>Recent income allocations with 70/30 and 60/40 splits</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading transactions...</p>
                ) : allocationHistory && allocationHistory.length > 0 ? (
                  <div className="space-y-3">
                    {allocationHistory.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tx.transactionType.replace("_", " ").toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">{tx.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(tx.grossAmount)}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>Treasury: {formatCurrency(tx.treasuryAmount)}</span>
                            <span>House: {formatCurrency(tx.houseAmount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No transactions yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gift/Sale Ratio Tab */}
          <TabsContent value="ratio" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  Gift/Sale Ratio Enforcement (Scroll 59)
                </CardTitle>
                <CardDescription>
                  1:3 global ratio (1 gift per 3 sales) and 2:1 house ratio (2 sales before gifting)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.giftSaleRatio ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-2xl font-bold">{summary.giftSaleRatio.totalSalesCompleted}</p>
                        <p className="text-xs text-muted-foreground">Total Sales</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Gift className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold">{summary.giftSaleRatio.totalGiftsIssued}</p>
                        <p className="text-xs text-muted-foreground">Total Gifts</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Activity className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                        <p className="text-2xl font-bold">{parseFloat(summary.giftSaleRatio.currentRatio).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Current Ratio</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        {summary.giftSaleRatio.isCompliant ? (
                          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                        )}
                        <p className="text-2xl font-bold">
                          {summary.giftSaleRatio.isCompliant ? "Yes" : "No"}
                        </p>
                        <p className="text-xs text-muted-foreground">Compliant</p>
                      </div>
                    </div>
                    {summary.giftSaleRatio.giftingBlocked && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">Gifting Blocked</span>
                        </div>
                        <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                          {summary.giftSaleRatio.blockReason}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No gift/sale ratio data. Ratios are tracked automatically when sales and gifts are recorded.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sync Cycles Tab */}
          <TabsContent value="sync" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  Sync Cycles (Scroll 61)
                </CardTitle>
                <CardDescription>
                  Automated financial reconciliation cycles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  {["hourly", "daily", "weekly", "monthly"].map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => runSyncCycle.mutate({ 
                        houseId: selectedHouseId, 
                        cycleType: type as "hourly" | "daily" | "weekly" | "monthly" 
                      })}
                      disabled={runSyncCycle.isPending}
                    >
                      Run {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
                {cyclesLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading sync cycles...</p>
                ) : syncCycles && syncCycles.length > 0 ? (
                  <div className="space-y-2">
                    {syncCycles.map((cycle) => (
                      <div key={cycle.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            cycle.status === "completed" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                            cycle.status === "failed" ? "bg-red-100 dark:bg-red-900/30" :
                            "bg-blue-100 dark:bg-blue-900/30"
                          }`}>
                            {cycle.status === "completed" ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            ) : cycle.status === "failed" ? (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm capitalize">{cycle.cycleType} Sync</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(cycle.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <Badge variant={cycle.status === "completed" ? "default" : cycle.status === "failed" ? "destructive" : "secondary"}>
                            {cycle.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {cycle.transactionsProcessed} processed, {cycle.errorsEncountered} errors
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No sync cycles run yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Financial Errors
                </CardTitle>
                <CardDescription>
                  Error codes: LL-01 to LL-07, AE-01 to AE-04, GSREL-01 to GSREL-06
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errorsLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading errors...</p>
                ) : errors && errors.length > 0 ? (
                  <div className="space-y-2">
                    {errors.map((error) => (
                      <div key={error.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="destructive">{error.errorCode}</Badge>
                          <div>
                            <p className="font-medium text-sm">{error.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(error.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveError.mutate({ errorId: error.id, resolution: "Manually resolved" })}
                        >
                          Resolve
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-emerald-600 mb-2" />
                    <p className="text-muted-foreground">No open errors</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pending Inflows Alert */}
        {summary && summary.pendingInflowsCount > 0 && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-medium">Pending Inflows</p>
                    <p className="text-sm text-muted-foreground">
                      {summary.pendingInflowsCount} inflows totaling {formatCurrency(summary.pendingInflowsTotal)} awaiting allocation
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => runSyncCycle.mutate({ houseId: selectedHouseId, cycleType: "daily" })}
                  disabled={runSyncCycle.isPending}
                >
                  Process Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
