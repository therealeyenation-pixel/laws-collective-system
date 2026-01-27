import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
  RefreshCw,
  Calendar,
  FileText,
  AlertTriangle,
} from "lucide-react";

const ASSET_CLASS_COLORS: Record<string, string> = {
  stocks: "bg-blue-500",
  bonds: "bg-green-500",
  mutual_funds: "bg-purple-500",
  etfs: "bg-orange-500",
  reits: "bg-pink-500",
  commodities: "bg-yellow-500",
  cryptocurrency: "bg-cyan-500",
  cash_equivalents: "bg-gray-500",
  alternatives: "bg-indigo-500",
};

const ASSET_CLASS_LABELS: Record<string, string> = {
  stocks: "Stocks",
  bonds: "Bonds",
  mutual_funds: "Mutual Funds",
  etfs: "ETFs",
  reits: "REITs",
  commodities: "Commodities",
  cryptocurrency: "Cryptocurrency",
  cash_equivalents: "Cash & Equivalents",
  alternatives: "Alternatives",
};

export default function InvestmentPortfolioDashboard() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [showRecordTransaction, setShowRecordTransaction] = useState(false);

  // Form states
  const [newAccount, setNewAccount] = useState({
    entityId: "entity-1",
    accountName: "",
    accountType: "brokerage" as const,
    custodian: "",
    accountNumber: "",
    taxStatus: "taxable" as const,
    openedDate: new Date().toISOString().split("T")[0],
  });

  const [newHolding, setNewHolding] = useState({
    accountId: "",
    ticker: "",
    name: "",
    assetClass: "stocks" as const,
    shares: 0,
    costBasis: 0,
    currentPrice: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
  });

  const [newTransaction, setNewTransaction] = useState({
    accountId: "",
    holdingId: "",
    transactionType: "buy" as const,
    ticker: "",
    shares: 0,
    pricePerShare: 0,
    fees: 0,
    transactionDate: new Date().toISOString().split("T")[0],
  });

  // Queries
  const { data: accounts, isLoading: accountsLoading, refetch: refetchAccounts } = trpc.investmentPortfolio.listAccounts.useQuery();
  const { data: holdings, isLoading: holdingsLoading, refetch: refetchHoldings } = trpc.investmentPortfolio.listHoldings.useQuery();
  const { data: transactions, refetch: refetchTransactions } = trpc.investmentPortfolio.listTransactions.useQuery();
  const { data: assetClasses } = trpc.investmentPortfolio.getAssetClasses.useQuery();
  const { data: accountTypes } = trpc.investmentPortfolio.getAccountTypes.useQuery();
  const { data: transactionTypes } = trpc.investmentPortfolio.getTransactionTypes.useQuery();

  // Get allocation for selected account
  const { data: allocation } = trpc.investmentPortfolio.getPortfolioAllocation.useQuery(
    { accountId: selectedAccount || "" },
    { enabled: !!selectedAccount }
  );

  // Mutations
  const createAccountMutation = trpc.investmentPortfolio.createAccount.useMutation({
    onSuccess: () => {
      toast.success("Investment account created successfully");
      setShowAddAccount(false);
      refetchAccounts();
      setNewAccount({
        entityId: "entity-1",
        accountName: "",
        accountType: "brokerage",
        custodian: "",
        accountNumber: "",
        taxStatus: "taxable",
        openedDate: new Date().toISOString().split("T")[0],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const createHoldingMutation = trpc.investmentPortfolio.createHolding.useMutation({
    onSuccess: () => {
      toast.success("Holding added successfully");
      setShowAddHolding(false);
      refetchHoldings();
      setNewHolding({
        accountId: "",
        ticker: "",
        name: "",
        assetClass: "stocks",
        shares: 0,
        costBasis: 0,
        currentPrice: 0,
        purchaseDate: new Date().toISOString().split("T")[0],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const recordTransactionMutation = trpc.investmentPortfolio.recordTransaction.useMutation({
    onSuccess: () => {
      toast.success("Transaction recorded successfully");
      setShowRecordTransaction(false);
      refetchTransactions();
      refetchHoldings();
      setNewTransaction({
        accountId: "",
        holdingId: "",
        transactionType: "buy",
        ticker: "",
        shares: 0,
        pricePerShare: 0,
        fees: 0,
        transactionDate: new Date().toISOString().split("T")[0],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  // Calculate totals
  const totalValue = holdings?.reduce((sum, h) => sum + h.marketValue, 0) || 0;
  const totalCostBasis = holdings?.reduce((sum, h) => sum + h.costBasis, 0) || 0;
  const totalGainLoss = totalValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  // Filter holdings by selected account
  const filteredHoldings = selectedAccount
    ? holdings?.filter((h) => h.accountId === selectedAccount)
    : holdings;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Portfolio</h1>
            <p className="text-muted-foreground mt-1">
              Track holdings, transactions, and portfolio performance
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Investment Account</DialogTitle>
                  <DialogDescription>
                    Create a new investment account to track holdings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input
                      value={newAccount.accountName}
                      onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                      placeholder="e.g., Main Brokerage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select
                      value={newAccount.accountType}
                      onValueChange={(v) => setNewAccount({ ...newAccount, accountType: v as typeof newAccount.accountType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes?.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, " ").toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Custodian</Label>
                    <Input
                      value={newAccount.custodian}
                      onChange={(e) => setNewAccount({ ...newAccount, custodian: e.target.value })}
                      placeholder="e.g., Fidelity, Vanguard"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      value={newAccount.accountNumber}
                      onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                      placeholder="Account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Status</Label>
                    <Select
                      value={newAccount.taxStatus}
                      onValueChange={(v) => setNewAccount({ ...newAccount, taxStatus: v as typeof newAccount.taxStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="taxable">Taxable</SelectItem>
                        <SelectItem value="tax_deferred">Tax Deferred</SelectItem>
                        <SelectItem value="tax_exempt">Tax Exempt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Opened Date</Label>
                    <Input
                      type="date"
                      value={newAccount.openedDate}
                      onChange={(e) => setNewAccount({ ...newAccount, openedDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddAccount(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createAccountMutation.mutate({
                      ...newAccount,
                      openedDate: new Date(newAccount.openedDate),
                    })}
                    disabled={createAccountMutation.isPending}
                  >
                    {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showRecordTransaction} onOpenChange={setShowRecordTransaction}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Record Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Transaction</DialogTitle>
                  <DialogDescription>
                    Record a buy, sell, or other investment transaction
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Account</Label>
                    <Select
                      value={newTransaction.accountId}
                      onValueChange={(v) => setNewTransaction({ ...newTransaction, accountId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Transaction Type</Label>
                    <Select
                      value={newTransaction.transactionType}
                      onValueChange={(v) => setNewTransaction({ ...newTransaction, transactionType: v as typeof newTransaction.transactionType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {transactionTypes?.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ticker Symbol</Label>
                    <Input
                      value={newTransaction.ticker}
                      onChange={(e) => setNewTransaction({ ...newTransaction, ticker: e.target.value.toUpperCase() })}
                      placeholder="e.g., AAPL"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Shares</Label>
                      <Input
                        type="number"
                        value={newTransaction.shares}
                        onChange={(e) => setNewTransaction({ ...newTransaction, shares: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price per Share</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newTransaction.pricePerShare}
                        onChange={(e) => setNewTransaction({ ...newTransaction, pricePerShare: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fees</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newTransaction.fees}
                        onChange={(e) => setNewTransaction({ ...newTransaction, fees: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newTransaction.transactionDate}
                        onChange={(e) => setNewTransaction({ ...newTransaction, transactionDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Total: {formatCurrency(newTransaction.shares * newTransaction.pricePerShare + newTransaction.fees)}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRecordTransaction(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => recordTransactionMutation.mutate({
                      ...newTransaction,
                      transactionDate: new Date(newTransaction.transactionDate),
                    })}
                    disabled={recordTransactionMutation.isPending}
                  >
                    {recordTransactionMutation.isPending ? "Recording..." : "Record Transaction"}
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
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Across {accounts?.length || 0} accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cost Basis</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCostBasis)}</div>
              <p className="text-xs text-muted-foreground">
                Original investment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unrealized Gain/Loss</CardTitle>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(totalGainLoss)}
              </div>
              <p className={`text-xs ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatPercent(totalGainLossPercent)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Holdings</CardTitle>
              <PieChart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{holdings?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Unique positions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="holdings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
          </TabsList>

          {/* Holdings Tab */}
          <TabsContent value="holdings" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <Label>Filter by Account:</Label>
                <Select
                  value={selectedAccount || "all"}
                  onValueChange={(v) => setSelectedAccount(v === "all" ? null : v)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={showAddHolding} onOpenChange={setShowAddHolding}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Holding
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Holding</DialogTitle>
                    <DialogDescription>
                      Add a new investment holding to an account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Account</Label>
                      <Select
                        value={newHolding.accountId}
                        onValueChange={(v) => setNewHolding({ ...newHolding, accountId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts?.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.accountName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ticker</Label>
                        <Input
                          value={newHolding.ticker}
                          onChange={(e) => setNewHolding({ ...newHolding, ticker: e.target.value.toUpperCase() })}
                          placeholder="e.g., AAPL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Asset Class</Label>
                        <Select
                          value={newHolding.assetClass}
                          onValueChange={(v) => setNewHolding({ ...newHolding, assetClass: v as typeof newHolding.assetClass })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {assetClasses?.map((cls) => (
                              <SelectItem key={cls} value={cls}>
                                {ASSET_CLASS_LABELS[cls] || cls}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={newHolding.name}
                        onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                        placeholder="e.g., Apple Inc."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Shares</Label>
                        <Input
                          type="number"
                          value={newHolding.shares}
                          onChange={(e) => setNewHolding({ ...newHolding, shares: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cost Basis</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newHolding.costBasis}
                          onChange={(e) => setNewHolding({ ...newHolding, costBasis: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Current Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newHolding.currentPrice}
                          onChange={(e) => setNewHolding({ ...newHolding, currentPrice: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Purchase Date</Label>
                      <Input
                        type="date"
                        value={newHolding.purchaseDate}
                        onChange={(e) => setNewHolding({ ...newHolding, purchaseDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddHolding(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createHoldingMutation.mutate({
                        ...newHolding,
                        purchaseDate: new Date(newHolding.purchaseDate),
                      })}
                      disabled={createHoldingMutation.isPending}
                    >
                      {createHoldingMutation.isPending ? "Adding..." : "Add Holding"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {holdingsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading holdings...</div>
            ) : filteredHoldings?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <PieChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No holdings found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first holding to start tracking your portfolio
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredHoldings?.map((holding) => (
                  <Card key={holding.id} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-12 rounded ${ASSET_CLASS_COLORS[holding.assetClass] || "bg-gray-500"}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{holding.ticker}</span>
                              <Badge variant="outline" className="text-xs">
                                {ASSET_CLASS_LABELS[holding.assetClass] || holding.assetClass}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{holding.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Shares</p>
                              <p className="font-medium">{holding.shares.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Price</p>
                              <p className="font-medium">{formatCurrency(holding.currentPrice)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Market Value</p>
                              <p className="font-bold">{formatCurrency(holding.marketValue)}</p>
                            </div>
                            <div className="min-w-[100px]">
                              <p className="text-sm text-muted-foreground">Gain/Loss</p>
                              <div className={`flex items-center gap-1 ${holding.unrealizedGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {holding.unrealizedGainLoss >= 0 ? (
                                  <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4" />
                                )}
                                <span className="font-medium">
                                  {formatPercent(holding.unrealizedGainLossPercent)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            {accountsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading accounts...</div>
            ) : accounts?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No investment accounts</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first account to start tracking investments
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts?.map((account) => {
                  const accountHoldings = holdings?.filter((h) => h.accountId === account.id) || [];
                  const accountValue = accountHoldings.reduce((sum, h) => sum + h.marketValue, 0);
                  const accountCostBasis = accountHoldings.reduce((sum, h) => sum + h.costBasis, 0);
                  const accountGainLoss = accountValue - accountCostBasis;

                  return (
                    <Card key={account.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{account.accountName}</CardTitle>
                            <CardDescription>{account.custodian}</CardDescription>
                          </div>
                          <Badge variant={account.status === "active" ? "default" : "secondary"}>
                            {account.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Account Type</span>
                          <span className="font-medium">
                            {account.accountType.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Tax Status</span>
                          <Badge variant="outline">
                            {account.taxStatus.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Holdings</span>
                          <span className="font-medium">{accountHoldings.length}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Value</span>
                            <span className="font-bold text-lg">{formatCurrency(accountValue)}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-muted-foreground">Gain/Loss</span>
                            <span className={`font-medium ${accountGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {formatCurrency(accountGainLoss)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setSelectedAccount(account.id);
                          }}
                        >
                          View Holdings
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            {transactions?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transactions recorded</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Record your first transaction to track your investment activity
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Your investment activity history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions?.slice(0, 20).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            tx.transactionType === "buy" ? "bg-green-100 text-green-600" :
                            tx.transactionType === "sell" ? "bg-red-100 text-red-600" :
                            tx.transactionType === "dividend" ? "bg-blue-100 text-blue-600" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {tx.transactionType === "buy" ? <ArrowDownRight className="w-4 h-4" /> :
                             tx.transactionType === "sell" ? <ArrowUpRight className="w-4 h-4" /> :
                             <DollarSign className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{tx.ticker}</span>
                              <Badge variant="outline" className="text-xs">
                                {tx.transactionType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {tx.shares} shares @ {formatCurrency(tx.pricePerShare)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(tx.totalAmount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.transactionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Allocation Tab */}
          <TabsContent value="allocation" className="space-y-4">
            <div className="flex gap-2 items-center mb-4">
              <Label>Select Account:</Label>
              <Select
                value={selectedAccount || ""}
                onValueChange={(v) => setSelectedAccount(v)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!selectedAccount ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <PieChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select an account to view allocation</p>
                </CardContent>
              </Card>
            ) : allocation ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                    <CardDescription>
                      Distribution by asset class
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {allocation.allocation.map((item) => (
                      <div key={item.assetClass} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${ASSET_CLASS_COLORS[item.assetClass] || "bg-gray-500"}`} />
                            {ASSET_CLASS_LABELS[item.assetClass] || item.assetClass}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.value)} ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Summary</CardTitle>
                    <CardDescription>
                      Key metrics for this account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Total Value</span>
                      <span className="font-bold">{formatCurrency(allocation.totalValue)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Number of Holdings</span>
                      <span className="font-bold">{allocation.allocation.reduce((sum, a) => sum + a.holdings, 0)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Asset Classes</span>
                      <span className="font-bold">{allocation.allocation.length}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Diversification</h4>
                      <p className="text-sm text-muted-foreground">
                        {allocation.allocation.length >= 5
                          ? "Well diversified across multiple asset classes"
                          : allocation.allocation.length >= 3
                          ? "Moderately diversified"
                          : "Consider diversifying across more asset classes"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Loading allocation...</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
