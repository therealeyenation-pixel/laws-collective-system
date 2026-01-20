import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  FileText, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Download,
  Printer,
  Calculator,
  TrendingUp,
  Building2,
  RefreshCw,
  Play,
  Eye,
  CreditCard,
  Landmark,
  Send,
  Trash2,
  Edit
} from "lucide-react";

// Format currency
const formatCurrency = (amount: number | string) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num || 0);
};

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });
};

// Pay period status badge
const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    open: { variant: "outline", icon: <Clock className="w-3 h-3" /> },
    processing: { variant: "secondary", icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
    approved: { variant: "default", icon: <CheckCircle className="w-3 h-3" /> },
    paid: { variant: "default", icon: <DollarSign className="w-3 h-3" /> },
    closed: { variant: "secondary", icon: <CheckCircle className="w-3 h-3" /> },
    pending: { variant: "outline", icon: <Clock className="w-3 h-3" /> },
    calculated: { variant: "secondary", icon: <Calculator className="w-3 h-3" /> },
    voided: { variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
  };
  const config = variants[status] || variants.open;
  return (
    <Badge variant={config.variant} className="gap-1">
      {config.icon}
      {status.replace("_", " ")}
    </Badge>
  );
};

// Direct Deposit Tab Component
function DirectDepositTab({ workers }: { workers: any[] }) {
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [newAccount, setNewAccount] = useState({
    accountName: "",
    bankName: "",
    routingNumber: "",
    accountNumber: "",
    accountType: "checking" as "checking" | "savings",
    depositType: "full" as "full" | "fixed" | "percentage",
    depositAmount: "",
  });

  const { data: allAccounts, refetch: refetchAccounts } = trpc.bankAccounts.listAll.useQuery();
  const { data: workersWithoutAccounts } = trpc.bankAccounts.getWorkersWithoutAccounts.useQuery();
  
  const createAccount = trpc.bankAccounts.create.useMutation({
    onSuccess: () => {
      toast.success("Bank account added successfully");
      setShowAddAccountDialog(false);
      setNewAccount({
        accountName: "",
        bankName: "",
        routingNumber: "",
        accountNumber: "",
        accountType: "checking",
        depositType: "full",
        depositAmount: "",
      });
      refetchAccounts();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteAccount = trpc.bankAccounts.delete.useMutation({
    onSuccess: () => {
      toast.success("Bank account removed");
      refetchAccounts();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAddAccount = () => {
    if (!selectedWorkerId) {
      toast.error("Please select a worker");
      return;
    }
    createAccount.mutate({
      workerId: selectedWorkerId,
      ...newAccount,
      isPrimary: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Workers without bank accounts alert */}
      {workersWithoutAccounts && workersWithoutAccounts.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Workers Missing Direct Deposit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {workersWithoutAccounts.length} worker(s) do not have bank accounts set up:
            </p>
            <div className="flex flex-wrap gap-2">
              {workersWithoutAccounts.map((w: any) => (
                <Badge key={w.id} variant="outline">
                  {w.firstName} {w.lastName}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Account Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Bank Accounts</h3>
        <Button onClick={() => setShowAddAccountDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Bank Account
        </Button>
      </div>

      {/* Bank Accounts Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAccounts?.map((account: any) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.workerName}</TableCell>
                  <TableCell>{account.accountName}</TableCell>
                  <TableCell>{account.bankName}</TableCell>
                  <TableCell className="font-mono">{account.accountNumberMasked}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{account.accountType}</Badge>
                  </TableCell>
                  <TableCell>
                    {account.depositType === "full" ? "100%" : 
                     account.depositType === "percentage" ? `${account.depositAmount}%` :
                     formatCurrency(account.depositAmount || 0)}
                  </TableCell>
                  <TableCell>
                    {account.isPrimary ? (
                      <Badge>Primary</Badge>
                    ) : (
                      <Badge variant="secondary">Secondary</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteAccount.mutate({ id: account.id })}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!allAccounts || allAccounts.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No bank accounts configured. Add bank accounts to enable direct deposit.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
            <DialogDescription>
              Add a bank account for direct deposit payments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Worker</Label>
              <Select 
                value={selectedWorkerId?.toString() || ""} 
                onValueChange={(v) => setSelectedWorkerId(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((w: any) => (
                    <SelectItem key={w.id} value={w.id.toString()}>
                      {w.firstName} {w.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input 
                  placeholder="e.g., Primary Checking"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input 
                  placeholder="e.g., Chase Bank"
                  value={newAccount.bankName}
                  onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Routing Number</Label>
                <Input 
                  placeholder="9 digits"
                  maxLength={9}
                  value={newAccount.routingNumber}
                  onChange={(e) => setNewAccount({ ...newAccount, routingNumber: e.target.value.replace(/\D/g, "") })}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input 
                  placeholder="Account number"
                  value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value.replace(/\D/g, "") })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select 
                  value={newAccount.accountType} 
                  onValueChange={(v: "checking" | "savings") => setNewAccount({ ...newAccount, accountType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deposit Type</Label>
                <Select 
                  value={newAccount.depositType} 
                  onValueChange={(v: "full" | "fixed" | "percentage") => setNewAccount({ ...newAccount, depositType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Amount (100%)</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newAccount.depositType !== "full" && (
              <div className="space-y-2">
                <Label>{newAccount.depositType === "percentage" ? "Percentage" : "Fixed Amount"}</Label>
                <Input 
                  placeholder={newAccount.depositType === "percentage" ? "e.g., 50" : "e.g., 500.00"}
                  value={newAccount.depositAmount}
                  onChange={(e) => setNewAccount({ ...newAccount, depositAmount: e.target.value })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAccountDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAccount} disabled={createAccount.isPending}>
              {createAccount.isPending ? "Adding..." : "Add Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ACH Batches Tab Component
function ACHBatchesTab({ payrollHistory }: { payrollHistory: any[] }) {
  const [showCreateBatchDialog, setShowCreateBatchDialog] = useState(false);
  const [showGenerateFileDialog, setShowGenerateFileDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [selectedPayrollIds, setSelectedPayrollIds] = useState<number[]>([]);
  const [batchConfig, setBatchConfig] = useState({
    companyId: "",
    immediateDestination: "",
    immediateDestinationName: "",
    originatingDFI: "",
  });

  const { data: batches, refetch: refetchBatches } = trpc.ach.listBatches.useQuery({});
  
  const createBatch = trpc.ach.createBatch.useMutation({
    onSuccess: (data) => {
      toast.success(`ACH batch created with ${data.entryCount} entries`);
      setShowCreateBatchDialog(false);
      setSelectedPayrollIds([]);
      refetchBatches();
    },
    onError: (err) => toast.error(err.message),
  });

  const generateFile = trpc.ach.generateFile.useMutation({
    onSuccess: (data) => {
      // Download the file
      const blob = new Blob([data.fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.fileName;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(`ACH file generated: ${data.fileName}`);
      setShowGenerateFileDialog(false);
      refetchBatches();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatus = trpc.ach.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Batch status updated");
      refetchBatches();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreateBatch = () => {
    if (selectedPayrollIds.length === 0) {
      toast.error("Please select payroll runs to include");
      return;
    }
    createBatch.mutate({
      payrollRunIds: selectedPayrollIds,
      effectiveDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      companyId: batchConfig.companyId || "1234567890",
    });
  };

  const handleGenerateFile = () => {
    if (!selectedBatch) return;
    generateFile.mutate({
      batchId: selectedBatch.id,
      immediateDestination: batchConfig.immediateDestination,
      immediateDestinationName: batchConfig.immediateDestinationName,
      originatingDFI: batchConfig.originatingDFI,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      generated: "secondary",
      submitted: "default",
      accepted: "default",
      rejected: "destructive",
      processed: "default",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ACH Payment Batches</h3>
        <Button onClick={() => setShowCreateBatchDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create ACH Batch
        </Button>
      </div>

      {/* Batches Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch #</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches?.map((batch: any) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-mono">{batch.batchNumber}</TableCell>
                  <TableCell>{formatDate(batch.createdAt)}</TableCell>
                  <TableCell>{formatDate(batch.effectiveDate)}</TableCell>
                  <TableCell>{batch.entryCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(batch.totalCredits)}
                  </TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {batch.status === "draft" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedBatch(batch);
                            setShowGenerateFileDialog(true);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      {batch.status === "generated" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateStatus.mutate({ batchId: batch.id, status: "submitted" })}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!batches || batches.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No ACH batches created yet. Create a batch from processed payroll runs.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Batch Dialog */}
      <Dialog open={showCreateBatchDialog} onOpenChange={setShowCreateBatchDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create ACH Batch</DialogTitle>
            <DialogDescription>
              Select payroll runs to include in the ACH payment batch
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Tax ID (EIN)</Label>
              <Input 
                placeholder="e.g., 12-3456789"
                value={batchConfig.companyId}
                onChange={(e) => setBatchConfig({ ...batchConfig, companyId: e.target.value.replace(/[^0-9-]/g, "") })}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Payroll Runs</Label>
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {payrollHistory.filter((r: any) => r.status === "processed").map((run: any) => (
                  <div 
                    key={run.id} 
                    className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-secondary/30 cursor-pointer"
                    onClick={() => {
                      setSelectedPayrollIds(prev => 
                        prev.includes(run.id) 
                          ? prev.filter(id => id !== run.id)
                          : [...prev, run.id]
                      );
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedPayrollIds.includes(run.id)}
                      onChange={() => {}}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Worker #{run.workerId}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(run.createdAt)} - Net: {formatCurrency(run.netPay)}
                      </p>
                    </div>
                  </div>
                ))}
                {payrollHistory.filter((r: any) => r.status === "processed").length === 0 && (
                  <p className="p-4 text-center text-muted-foreground">
                    No processed payroll runs available
                  </p>
                )}
              </div>
            </div>

            {selectedPayrollIds.length > 0 && (
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm">
                  <strong>{selectedPayrollIds.length}</strong> payroll run(s) selected
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBatchDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBatch} disabled={createBatch.isPending}>
              {createBatch.isPending ? "Creating..." : "Create Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate File Dialog */}
      <Dialog open={showGenerateFileDialog} onOpenChange={setShowGenerateFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate ACH File</DialogTitle>
            <DialogDescription>
              Configure bank routing information for NACHA file generation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Destination Bank Routing Number</Label>
              <Input 
                placeholder="9 digits"
                maxLength={9}
                value={batchConfig.immediateDestination}
                onChange={(e) => setBatchConfig({ ...batchConfig, immediateDestination: e.target.value.replace(/\D/g, "") })}
              />
            </div>

            <div className="space-y-2">
              <Label>Destination Bank Name</Label>
              <Input 
                placeholder="e.g., FIRST NATIONAL BANK"
                maxLength={23}
                value={batchConfig.immediateDestinationName}
                onChange={(e) => setBatchConfig({ ...batchConfig, immediateDestinationName: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-2">
              <Label>Originating DFI (First 8 digits of your routing)</Label>
              <Input 
                placeholder="8 digits"
                maxLength={8}
                value={batchConfig.originatingDFI}
                onChange={(e) => setBatchConfig({ ...batchConfig, originatingDFI: e.target.value.replace(/\D/g, "") })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateFileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateFile} disabled={generateFile.isPending}>
              {generateFile.isPending ? "Generating..." : "Generate & Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PayrollDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewPeriodDialog, setShowNewPeriodDialog] = useState(false);
  const [showRunPayrollDialog, setShowRunPayrollDialog] = useState(false);
  const [showPayStubDialog, setShowPayStubDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [selectedPayStub, setSelectedPayStub] = useState<any>(null);
  
  // Form states
  const [newPeriod, setNewPeriod] = useState({
    periodStartDate: "",
    periodEndDate: "",
    payDate: "",
  });

  // Queries
  const { data: workersData, refetch: refetchWorkers } = trpc.payroll.getWorkers.useQuery();
  const { data: payrollHistory, refetch: refetchHistory } = trpc.payroll.getPayrollHistory.useQuery({});
  const { data: statesData } = trpc.payroll.getStates.useQuery({});

  // Calculate payroll from timesheets mutation
  const calculatePayroll = trpc.payroll.calculatePayrollFromTimesheets.useMutation({
    onSuccess: (data) => {
      toast.success(`Payroll calculated for ${data.calculations.length} workers`);
      setSelectedPeriod(data);
      setShowRunPayrollDialog(true);
    },
    onError: (err) => toast.error(err.message),
  });

  // Process individual payroll
  const processPayroll = trpc.payroll.processPayroll.useMutation({
    onSuccess: () => {
      toast.success("Payroll processed successfully");
      refetchHistory();
    },
    onError: (err) => toast.error(err.message),
  });

  // Summary stats
  const workers = workersData?.workers || [];
  const summary = workersData?.summary;
  const records = payrollHistory?.records || [];
  const historySummary = payrollHistory?.summary;

  // Calculate current period dates (bi-weekly)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;
  const periodEnd = new Date(today);
  periodEnd.setDate(today.getDate() - daysToLastSunday);
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodEnd.getDate() - 13);

  // Handle run payroll
  const handleRunPayroll = () => {
    calculatePayroll.mutate({
      payPeriodStart: periodStart,
      payPeriodEnd: periodEnd,
    });
  };

  // Handle process payroll for a worker
  const handleProcessWorkerPayroll = (calc: any) => {
    processPayroll.mutate({
      workerId: calc.workerId,
      payPeriodStart: periodStart,
      payPeriodEnd: periodEnd,
      payDate: new Date(),
      hoursWorked: calc.regularHours,
      overtimeHours: calc.overtimeHours,
      regularPay: calc.regularPay,
      overtimePay: calc.overtimePay,
      grossPay: calc.grossPay,
      federalWithholding: calc.federalWithholding,
      stateWithholding: calc.stateWithholding,
      socialSecurityWithholding: calc.socialSecurityWithholding,
      medicareWithholding: calc.medicareWithholding,
      netPay: calc.netPay,
    });
  };

  // View pay stub
  const handleViewPayStub = (record: any) => {
    setSelectedPayStub(record);
    setShowPayStubDialog(true);
  };

  // Print pay stub
  const handlePrintPayStub = () => {
    window.print();
  };

  // Download pay stub as text (simplified)
  const handleDownloadPayStub = () => {
    if (!selectedPayStub) return;
    
    const content = `
PAY STUB
========================================
Pay Date: ${formatDate(selectedPayStub.createdAt)}
Worker ID: ${selectedPayStub.workerId}

EARNINGS
----------------------------------------
Regular Hours: ${selectedPayStub.regularHours}
Overtime Hours: ${selectedPayStub.overtimeHours}
Gross Pay: ${formatCurrency(selectedPayStub.grossPay)}

DEDUCTIONS
----------------------------------------
Federal Tax: ${formatCurrency(selectedPayStub.federalTax)}
State Tax: ${formatCurrency(selectedPayStub.stateTax)}
Local Tax: ${formatCurrency(selectedPayStub.localTax)}
Social Security: ${formatCurrency(selectedPayStub.socialSecurity)}
Medicare: ${formatCurrency(selectedPayStub.medicare)}
Other Deductions: ${formatCurrency(selectedPayStub.otherDeductions)}

----------------------------------------
NET PAY: ${formatCurrency(selectedPayStub.netPay)}
========================================
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `paystub-${selectedPayStub.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Pay stub downloaded");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payroll Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage pay periods, run payroll, and generate pay stubs</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRunPayroll} disabled={calculatePayroll.isPending}>
              {calculatePayroll.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run Payroll
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.activeWorkers || 0}</div>
              <p className="text-xs text-muted-foreground">of {summary?.totalWorkers || 0} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary?.totalAnnualPayroll || 0)}</div>
              <p className="text-xs text-muted-foreground">estimated annual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">YTD Gross Pay</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(historySummary?.totalGrossPay || 0)}</div>
              <p className="text-xs text-muted-foreground">{records.length} pay runs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">YTD Taxes</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(historySummary?.totalTaxesWithheld || 0)}</div>
              <p className="text-xs text-muted-foreground">total withheld</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Pay Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Current Pay Period
            </CardTitle>
            <CardDescription>
              {formatDate(periodStart)} - {formatDate(periodEnd)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pay Frequency: Bi-Weekly</p>
                <p className="text-sm text-muted-foreground">Pay Date: {formatDate(new Date(periodEnd.getTime() + 5 * 24 * 60 * 60 * 1000))}</p>
              </div>
              <Button onClick={handleRunPayroll} disabled={calculatePayroll.isPending}>
                {calculatePayroll.isPending ? "Calculating..." : "Calculate Payroll"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="history">Payroll History</TabsTrigger>
            <TabsTrigger value="directDeposit">Direct Deposit</TabsTrigger>
            <TabsTrigger value="ach">ACH Batches</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Worker Summary by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {summary?.byType?.map((type: any) => (
                    <div key={type.value} className="text-center p-4 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold">{type.count}</p>
                      <p className="text-sm text-muted-foreground">{type.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payroll Runs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payroll Runs</CardTitle>
                <CardDescription>Last 10 payroll transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No payroll records yet</p>
                    <p className="text-sm">Run payroll to generate pay records</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Worker ID</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead className="text-right">Gross Pay</TableHead>
                        <TableHead className="text-right">Deductions</TableHead>
                        <TableHead className="text-right">Net Pay</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.slice(0, 10).map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.createdAt)}</TableCell>
                          <TableCell>#{record.workerId}</TableCell>
                          <TableCell className="text-right">
                            {parseFloat(record.regularHours || "0").toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(record.grossPay)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              parseFloat(record.federalTax || "0") +
                              parseFloat(record.stateTax || "0") +
                              parseFloat(record.socialSecurity || "0") +
                              parseFloat(record.medicare || "0")
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(record.netPay)}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleViewPayStub(record)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>W-2 Workers</CardTitle>
                <CardDescription>Employees registered for payroll</CardDescription>
              </CardHeader>
              <CardContent>
                {workers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No workers registered</p>
                    <p className="text-sm">Add workers from HR or manually</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Pay Rate</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workers.map((worker: any) => (
                        <TableRow key={worker.id}>
                          <TableCell className="font-medium">
                            {worker.firstName} {worker.lastName}
                          </TableCell>
                          <TableCell>{worker.jobTitle || "-"}</TableCell>
                          <TableCell>{worker.department || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{worker.employmentType || "full_time"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(worker.payRate || 0)}/hr
                          </TableCell>
                          <TableCell>{getStatusBadge(worker.status || "active")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll History</CardTitle>
                <CardDescription>All payroll transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No payroll history</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Worker</TableHead>
                        <TableHead className="text-right">Regular Hrs</TableHead>
                        <TableHead className="text-right">OT Hrs</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                        <TableHead className="text-right">Fed Tax</TableHead>
                        <TableHead className="text-right">State Tax</TableHead>
                        <TableHead className="text-right">FICA</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell>#{record.id}</TableCell>
                          <TableCell>{formatDate(record.createdAt)}</TableCell>
                          <TableCell>#{record.workerId}</TableCell>
                          <TableCell className="text-right">{parseFloat(record.regularHours || "0").toFixed(1)}</TableCell>
                          <TableCell className="text-right">{parseFloat(record.overtimeHours || "0").toFixed(1)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.grossPay)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.federalTax)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.stateTax)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(parseFloat(record.socialSecurity || "0") + parseFloat(record.medicare || "0"))}
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(record.netPay)}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleViewPayStub(record)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Summary Report</CardTitle>
                  <CardDescription>Year-to-date payroll totals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Gross Pay</span>
                      <span className="font-medium">{formatCurrency(historySummary?.totalGrossPay || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Net Pay</span>
                      <span className="font-medium">{formatCurrency(historySummary?.totalNetPay || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Taxes Withheld</span>
                      <span className="font-medium">{formatCurrency(historySummary?.totalTaxesWithheld || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payroll Runs</span>
                      <span className="font-medium">{historySummary?.totalRecords || 0}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => toast.info("Report export coming soon")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Liability Report</CardTitle>
                  <CardDescription>Employer tax obligations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Federal Withholding</span>
                      <span className="font-medium">
                        {formatCurrency(records.reduce((sum: number, r: any) => sum + parseFloat(r.federalTax || "0"), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">State Withholding</span>
                      <span className="font-medium">
                        {formatCurrency(records.reduce((sum: number, r: any) => sum + parseFloat(r.stateTax || "0"), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Social Security</span>
                      <span className="font-medium">
                        {formatCurrency(records.reduce((sum: number, r: any) => sum + parseFloat(r.socialSecurity || "0"), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Medicare</span>
                      <span className="font-medium">
                        {formatCurrency(records.reduce((sum: number, r: any) => sum + parseFloat(r.medicare || "0"), 0))}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => toast.info("941 report coming soon")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate 941 Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Direct Deposit Tab */}
          <TabsContent value="directDeposit" className="space-y-4">
            <DirectDepositTab workers={workers} />
          </TabsContent>

          {/* ACH Batches Tab */}
          <TabsContent value="ach" className="space-y-4">
            <ACHBatchesTab payrollHistory={records} />
          </TabsContent>
        </Tabs>

        {/* Run Payroll Dialog */}
        <Dialog open={showRunPayrollDialog} onOpenChange={setShowRunPayrollDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payroll Calculation Results</DialogTitle>
              <DialogDescription>
                Review calculated payroll for {formatDate(periodStart)} - {formatDate(periodEnd)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPeriod && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <p className="text-lg font-bold">{selectedPeriod.summary?.totalWorkers || 0}</p>
                    <p className="text-xs text-muted-foreground">Workers</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <p className="text-lg font-bold">{formatCurrency(selectedPeriod.summary?.totalGrossPay || 0)}</p>
                    <p className="text-xs text-muted-foreground">Gross Pay</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <p className="text-lg font-bold">{formatCurrency(selectedPeriod.summary?.totalWithholdings || 0)}</p>
                    <p className="text-xs text-muted-foreground">Withholdings</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <p className="text-lg font-bold">{formatCurrency(selectedPeriod.summary?.totalNetPay || 0)}</p>
                    <p className="text-xs text-muted-foreground">Net Pay</p>
                  </div>
                </div>

                {/* Worker Details */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Fed Tax</TableHead>
                      <TableHead className="text-right">State Tax</TableHead>
                      <TableHead className="text-right">FICA</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPeriod.calculations?.map((calc: any) => (
                      <TableRow key={calc.workerId}>
                        <TableCell className="font-medium">{calc.workerName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{calc.workerType}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {calc.regularHours.toFixed(1)}
                          {calc.overtimeHours > 0 && (
                            <span className="text-muted-foreground"> +{calc.overtimeHours.toFixed(1)} OT</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(calc.grossPay)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(calc.federalWithholding)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(calc.stateWithholding)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(calc.socialSecurityWithholding + calc.medicareWithholding)}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(calc.netPay)}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            onClick={() => handleProcessWorkerPayroll(calc)}
                            disabled={processPayroll.isPending}
                          >
                            Process
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRunPayrollDialog(false)}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  selectedPeriod?.calculations?.forEach((calc: any) => handleProcessWorkerPayroll(calc));
                  setShowRunPayrollDialog(false);
                }}
                disabled={processPayroll.isPending}
              >
                Process All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pay Stub Dialog */}
        <Dialog open={showPayStubDialog} onOpenChange={setShowPayStubDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Pay Stub</DialogTitle>
              <DialogDescription>
                Pay Date: {selectedPayStub && formatDate(selectedPayStub.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPayStub && (
              <div className="space-y-4 print:text-black">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="text-center border-b pb-2">
                    <h3 className="font-bold">L.A.W.S. Collective, LLC</h3>
                    <p className="text-sm text-muted-foreground">Pay Statement</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm"><strong>Worker ID:</strong> #{selectedPayStub.workerId}</p>
                    <p className="text-sm"><strong>Pay Period:</strong> Bi-Weekly</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-sm mb-2">EARNINGS</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Regular Hours</span>
                        <span>{parseFloat(selectedPayStub.regularHours || "0").toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overtime Hours</span>
                        <span>{parseFloat(selectedPayStub.overtimeHours || "0").toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Gross Pay</span>
                        <span>{formatCurrency(selectedPayStub.grossPay)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-sm mb-2">DEDUCTIONS</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Federal Tax</span>
                        <span>{formatCurrency(selectedPayStub.federalTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>State Tax</span>
                        <span>{formatCurrency(selectedPayStub.stateTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Local Tax</span>
                        <span>{formatCurrency(selectedPayStub.localTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Social Security</span>
                        <span>{formatCurrency(selectedPayStub.socialSecurity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medicare</span>
                        <span>{formatCurrency(selectedPayStub.medicare)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Deductions</span>
                        <span>{formatCurrency(selectedPayStub.otherDeductions)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>NET PAY</span>
                    <span>{formatCurrency(selectedPayStub.netPay)}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="print:hidden">
              <Button variant="outline" onClick={handleDownloadPayStub}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handlePrintPayStub}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => setShowPayStubDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
