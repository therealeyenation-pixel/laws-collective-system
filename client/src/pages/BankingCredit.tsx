import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Building2,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  Loader2,
  ExternalLink,
  DollarSign,
  FileText,
  AlertCircle,
  Landmark,
} from "lucide-react";

const CREDIT_STEPS = [
  { id: 1, title: "Obtain EIN", category: "foundation", timeline: "Day 1" },
  { id: 2, title: "Open Business Bank Account", category: "banking", timeline: "Week 1" },
  { id: 3, title: "Get D-U-N-S Number", category: "credit_profile", timeline: "Week 1-2" },
  { id: 4, title: "Establish Business Phone", category: "foundation", timeline: "Week 2" },
  { id: 5, title: "Verify Business Address", category: "foundation", timeline: "Week 2" },
  { id: 6, title: "Create Business Website", category: "foundation", timeline: "Week 2-3" },
  { id: 7, title: "Open Net-30 Account #1", category: "trade_credit", timeline: "Month 1" },
  { id: 8, title: "Open Net-30 Account #2", category: "trade_credit", timeline: "Month 1" },
];

export default function BankingCredit() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [showStartCreditDialog, setShowStartCreditDialog] = useState(false);

  const { data: accountTypes } = trpc.bankingCredit.getAccountTypes.useQuery();
  const { data: accounts, isLoading: accountsLoading, refetch: refetchAccounts } = trpc.bankingCredit.getAccounts.useQuery({});
  const { data: creditTrackers, refetch: refetchTrackers } = trpc.bankingCredit.getCreditTrackers.useQuery();
  const { data: net30Vendors } = trpc.bankingCredit.getNet30Vendors.useQuery();

  const addAccountMutation = trpc.bankingCredit.addBankAccount.useMutation({
    onSuccess: () => {
      toast.success("Bank account added successfully");
      refetchAccounts();
      setShowAddAccountDialog(false);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const startCreditMutation = trpc.bankingCredit.startCreditBuilding.useMutation({
    onSuccess: () => {
      toast.success("Credit building program started");
      refetchTrackers();
      setShowStartCreditDialog(false);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const [accountData, setAccountData] = useState({
    businessEntityId: 1,
    accountType: "operating" as "operating" | "reserve" | "tax_escrow" | "payroll" | "trust_treasury",
    bankName: "",
    accountNumber: "",
    openedDate: new Date().toISOString().split("T")[0],
    initialBalance: 0,
  });

  const [creditData, setCreditData] = useState({
    businessEntityId: 1,
    businessName: "",
  });

  const handleAddAccount = () => {
    addAccountMutation.mutate(accountData);
  };

  const handleStartCredit = () => {
    startCreditMutation.mutate(creditData);
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      foundation: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      banking: "bg-green-500/10 text-green-600 border-green-500/20",
      credit_profile: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      trade_credit: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    };
    return colors[category] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  if (accountsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Banking & Credit</h1>
            <p className="text-muted-foreground">Manage business bank accounts and build business credit</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Landmark className="w-4 h-4" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Bank Account</DialogTitle>
                  <DialogDescription>Add a business bank account for tracking</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select value={accountData.accountType} onValueChange={(v: any) => setAccountData({ ...accountData, accountType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operating">Operating Account</SelectItem>
                        <SelectItem value="reserve">Reserve Account</SelectItem>
                        <SelectItem value="tax_escrow">Tax Escrow Account</SelectItem>
                        <SelectItem value="payroll">Payroll Account</SelectItem>
                        <SelectItem value="trust_treasury">Trust Treasury Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input value={accountData.bankName} onChange={(e) => setAccountData({ ...accountData, bankName: e.target.value })} placeholder="e.g., Chase, Bank of America" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Number (Last 4)</Label>
                      <Input value={accountData.accountNumber} onChange={(e) => setAccountData({ ...accountData, accountNumber: e.target.value })} placeholder="XXXX" maxLength={4} />
                    </div>
                    <div className="space-y-2">
                      <Label>Opened Date</Label>
                      <Input type="date" value={accountData.openedDate} onChange={(e) => setAccountData({ ...accountData, openedDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Initial Balance</Label>
                    <Input type="number" value={accountData.initialBalance} onChange={(e) => setAccountData({ ...accountData, initialBalance: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddAccountDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddAccount} disabled={addAccountMutation.isPending}>
                    {addAccountMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={showStartCreditDialog} onOpenChange={setShowStartCreditDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2"><TrendingUp className="w-4 h-4" />Start Credit Building</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Credit Building Program</DialogTitle>
                  <DialogDescription>Begin the business credit building journey</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input value={creditData.businessName} onChange={(e) => setCreditData({ ...creditData, businessName: e.target.value })} placeholder="Enter business name" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowStartCreditDialog(false)}>Cancel</Button>
                  <Button onClick={handleStartCredit} disabled={startCreditMutation.isPending}>
                    {startCreditMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Start Program
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><Landmark className="w-6 h-6 text-primary" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Bank Accounts</p>
                  <p className="text-2xl font-bold">{accounts?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10"><DollarSign className="w-6 h-6 text-green-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold">${accounts?.reduce((sum: number, a: any) => sum + (a.currentBalance || 0), 0).toLocaleString() || "0"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10"><CreditCard className="w-6 h-6 text-purple-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Credit Programs</p>
                  <p className="text-2xl font-bold">{creditTrackers?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10"><TrendingUp className="w-6 h-6 text-amber-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold">{creditTrackers && creditTrackers.length > 0 ? Math.round(creditTrackers.reduce((sum: number, t: any) => sum + t.progress, 0) / creditTrackers.length) : 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
            <TabsTrigger value="credit">Credit Building</TabsTrigger>
            <TabsTrigger value="vendors">Net-30 Vendors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Credit Building Roadmap</CardTitle>
                <CardDescription>16-step process to establish business credit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {CREDIT_STEPS.map((step) => (
                    <div key={step.id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">{step.id}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.timeline}</p>
                      </div>
                      <Badge className={getCategoryBadge(step.category)}>{step.category.replace("_", " ")}</Badge>
                    </div>
                  ))}
                  <p className="text-center text-sm text-muted-foreground pt-2">+ 8 more steps in the full program</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4 mt-4">
            {accounts && accounts.length > 0 ? (
              <div className="grid gap-4">
                {accounts.map((account: any) => (
                  <Card key={account.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10"><Landmark className="w-6 h-6 text-primary" /></div>
                          <div>
                            <h3 className="font-semibold">{account.accountNickname || account.accountTypeInfo?.name}</h3>
                            <p className="text-sm text-muted-foreground">{account.bankName}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span>****{account.accountNumberLast4}</span>
                              <span className="text-muted-foreground">Opened: {new Date(account.openedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${account.currentBalance?.toLocaleString()}</p>
                          <Badge variant={account.verified ? "default" : "outline"}>{account.verified ? "Verified" : "Unverified"}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <Landmark className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <div>
                      <h3 className="font-semibold">No Bank Accounts</h3>
                      <p className="text-sm text-muted-foreground mt-1">Add your business bank accounts to track balances</p>
                    </div>
                    <Button onClick={() => setShowAddAccountDialog(true)}>Add First Account</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="credit" className="space-y-4 mt-4">
            {creditTrackers && creditTrackers.length > 0 ? (
              <div className="space-y-4">
                {creditTrackers.map((tracker: any) => (
                  <Card key={tracker.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{tracker.businessName}</CardTitle>
                          <CardDescription>Started: {new Date(tracker.startedAt).toLocaleDateString()}</CardDescription>
                        </div>
                        <Badge variant={tracker.status === "foundation_complete" ? "default" : "outline"}>{tracker.status.replace("_", " ")}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2"><span>Progress</span><span>{tracker.progress}%</span></div>
                          <Progress value={tracker.progress} />
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div><p className="text-2xl font-bold">{tracker.completedSteps}</p><p className="text-xs text-muted-foreground">Completed</p></div>
                          <div><p className="text-2xl font-bold">{tracker.totalSteps - tracker.completedSteps}</p><p className="text-xs text-muted-foreground">Remaining</p></div>
                          <div><p className="text-2xl font-bold">{tracker.completedRequiredSteps}/{tracker.requiredSteps}</p><p className="text-xs text-muted-foreground">Required</p></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <div>
                      <h3 className="font-semibold">No Credit Building Programs</h3>
                      <p className="text-sm text-muted-foreground mt-1">Start building business credit for your entities</p>
                    </div>
                    <Button onClick={() => setShowStartCreditDialog(true)}>Start Credit Building</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Net-30 Vendors</CardTitle>
                <CardDescription>Vendors that report to business credit bureaus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {net30Vendors?.map((vendor: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <h4 className="font-medium">{vendor.name}</h4>
                        <p className="text-sm text-muted-foreground">{vendor.category}</p>
                        <div className="flex gap-2 mt-2">
                          {vendor.reportsTo?.map((bureau: string) => (
                            <Badge key={bureau} variant="outline" className="text-xs">{bureau}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Min Order</p>
                        <p className="font-medium">${vendor.minOrder}</p>
                        <Button variant="ghost" size="sm" className="mt-2 gap-1" asChild>
                          <a href={"https://" + vendor.website} target="_blank" rel="noopener noreferrer">Visit <ExternalLink className="w-3 h-3" /></a>
                        </Button>
                      </div>
                    </div>
                  )) || <p className="text-center text-muted-foreground py-8">Loading vendors...</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
