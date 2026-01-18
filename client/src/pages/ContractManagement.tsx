import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { 
  FileText, 
  Plus, 
  FileSignature,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Building2,
  Calendar,
  DollarSign,
  ClipboardList,
  Eye,
  Edit,
  Send
} from "lucide-react";
import { toast } from "sonner";

export default function ContractManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createSOWDialogOpen, setCreateSOWDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedContractForSOW, setSelectedContractForSOW] = useState<number | null>(null);
  
  const [newContract, setNewContract] = useState({
    contractType: 'msa' as const,
    title: '',
    description: '',
    effectiveDate: '',
    expirationDate: '',
    autoRenew: false,
    renewalTermMonths: 12,
    totalValue: 0,
    paymentTerms: 'Net 30',
    billingFrequency: 'monthly' as const,
    retainerAmount: 0,
    hourlyRate: 0,
    terminationNoticeDays: 30,
    nonCompeteMonths: 12,
    ipAssignment: true,
    confidentialityRequired: true,
    insuranceRequired: false,
    insuranceMinimum: 0,
    notes: ''
  });

  const [newSOW, setNewSOW] = useState({
    title: '',
    description: '',
    scope: '',
    deliverables: '',
    startDate: '',
    endDate: '',
    estimatedHours: 0,
    fixedPrice: 0,
    hourlyRate: 0,
    budgetAmount: 0,
    milestones: '',
    acceptanceCriteria: ''
  });

  // Queries
  const { data: contracts, isLoading, refetch } = trpc.contractManagement.getContracts.useQuery({});
  const { data: stats } = trpc.contractManagement.getContractStats.useQuery();
  const { data: expiringContracts } = trpc.contractManagement.getExpiringContracts.useQuery({ daysAhead: 60 });
  const { data: sows } = trpc.contractManagement.getSOWs.useQuery({});

  // Mutations
  const createMutation = trpc.contractManagement.createContract.useMutation({
    onSuccess: (data) => {
      toast.success(`Contract ${data.contractNumber} created`);
      setCreateDialogOpen(false);
      resetContractForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create contract: ${error.message}`);
    }
  });

  const createSOWMutation = trpc.contractManagement.createSOW.useMutation({
    onSuccess: (data) => {
      toast.success(`SOW ${data.sowNumber} created`);
      setCreateSOWDialogOpen(false);
      resetSOWForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create SOW: ${error.message}`);
    }
  });

  const updateStatusMutation = trpc.contractManagement.updateContractStatus.useMutation({
    onSuccess: () => {
      toast.success("Contract status updated");
      refetch();
    }
  });

  const signAsClientMutation = trpc.contractManagement.signContractAsClient.useMutation({
    onSuccess: () => {
      toast.success("Contract signed");
      refetch();
    }
  });

  const resetContractForm = () => {
    setNewContract({
      contractType: 'msa',
      title: '',
      description: '',
      effectiveDate: '',
      expirationDate: '',
      autoRenew: false,
      renewalTermMonths: 12,
      totalValue: 0,
      paymentTerms: 'Net 30',
      billingFrequency: 'monthly',
      retainerAmount: 0,
      hourlyRate: 0,
      terminationNoticeDays: 30,
      nonCompeteMonths: 12,
      ipAssignment: true,
      confidentialityRequired: true,
      insuranceRequired: false,
      insuranceMinimum: 0,
      notes: ''
    });
  };

  const resetSOWForm = () => {
    setNewSOW({
      title: '',
      description: '',
      scope: '',
      deliverables: '',
      startDate: '',
      endDate: '',
      estimatedHours: 0,
      fixedPrice: 0,
      hourlyRate: 0,
      budgetAmount: 0,
      milestones: '',
      acceptanceCriteria: ''
    });
    setSelectedContractForSOW(null);
  };

  const handleCreateContract = () => {
    if (!newContract.title) {
      toast.error("Please enter a contract title");
      return;
    }
    createMutation.mutate({
      ...newContract,
      createdBy: 1 // Would come from auth context
    });
  };

  const handleCreateSOW = () => {
    if (!selectedContractForSOW || !newSOW.title) {
      toast.error("Please select a contract and enter SOW title");
      return;
    }
    createSOWMutation.mutate({
      contractId: selectedContractForSOW,
      ...newSOW
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      pending_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      pending_signature: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      terminated: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      renewed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      pending_approval: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      on_hold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    };
    return <Badge className={styles[status] || styles.draft}>{status.replace(/_/g, ' ').toUpperCase()}</Badge>;
  };

  const getContractTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      msa: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      sow: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      nda: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      employment: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      consulting: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      vendor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      partnership: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    };
    return <Badge className={styles[type] || styles.other}>{type.toUpperCase()}</Badge>;
  };

  if (isLoading) {
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contract Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage MSAs, SOWs, and contractor agreements
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={createSOWDialogOpen} onOpenChange={setCreateSOWDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ClipboardList className="w-4 h-4" />
                  New SOW
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Statement of Work</DialogTitle>
                  <DialogDescription>
                    Create a new SOW linked to an existing contract
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Parent Contract *</Label>
                    <Select 
                      value={selectedContractForSOW?.toString() || ''}
                      onValueChange={(v) => setSelectedContractForSOW(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contract" />
                      </SelectTrigger>
                      <SelectContent>
                        {contracts?.filter((c: any) => c.contractType === 'msa' && c.status === 'active').map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.contractNumber} - {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>SOW Title *</Label>
                    <Input 
                      value={newSOW.title}
                      onChange={(e) => setNewSOW({...newSOW, title: e.target.value})}
                      placeholder="e.g., Website Development Phase 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={newSOW.description}
                      onChange={(e) => setNewSOW({...newSOW, description: e.target.value})}
                      placeholder="Brief description of the work"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Scope of Work</Label>
                    <Textarea 
                      value={newSOW.scope}
                      onChange={(e) => setNewSOW({...newSOW, scope: e.target.value})}
                      placeholder="Detailed scope of work..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deliverables</Label>
                    <Textarea 
                      value={newSOW.deliverables}
                      onChange={(e) => setNewSOW({...newSOW, deliverables: e.target.value})}
                      placeholder="List of deliverables..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input 
                        type="date"
                        value={newSOW.startDate}
                        onChange={(e) => setNewSOW({...newSOW, startDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input 
                        type="date"
                        value={newSOW.endDate}
                        onChange={(e) => setNewSOW({...newSOW, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Estimated Hours</Label>
                      <Input 
                        type="number"
                        value={newSOW.estimatedHours}
                        onChange={(e) => setNewSOW({...newSOW, estimatedHours: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Budget Amount</Label>
                      <Input 
                        type="number"
                        value={newSOW.budgetAmount}
                        onChange={(e) => setNewSOW({...newSOW, budgetAmount: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateSOW} disabled={createSOWMutation.isPending} className="w-full">
                    {createSOWMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                    ) : (
                      <><ClipboardList className="w-4 h-4 mr-2" />Create SOW</>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Contract
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Contract</DialogTitle>
                  <DialogDescription>
                    Create a Master Service Agreement or other contract type
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contract Type *</Label>
                      <Select 
                        value={newContract.contractType}
                        onValueChange={(v: any) => setNewContract({...newContract, contractType: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="msa">Master Service Agreement</SelectItem>
                          <SelectItem value="consulting">Consulting Agreement</SelectItem>
                          <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                          <SelectItem value="vendor">Vendor Agreement</SelectItem>
                          <SelectItem value="partnership">Partnership Agreement</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Billing Frequency</Label>
                      <Select 
                        value={newContract.billingFrequency}
                        onValueChange={(v: any) => setNewContract({...newContract, billingFrequency: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_time">One Time</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Contract Title *</Label>
                    <Input 
                      value={newContract.title}
                      onChange={(e) => setNewContract({...newContract, title: e.target.value})}
                      placeholder="e.g., Software Development Services Agreement"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={newContract.description}
                      onChange={(e) => setNewContract({...newContract, description: e.target.value})}
                      placeholder="Contract description..."
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Effective Date</Label>
                      <Input 
                        type="date"
                        value={newContract.effectiveDate}
                        onChange={(e) => setNewContract({...newContract, effectiveDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiration Date</Label>
                      <Input 
                        type="date"
                        value={newContract.expirationDate}
                        onChange={(e) => setNewContract({...newContract, expirationDate: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Financial Terms */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Total Value ($)</Label>
                      <Input 
                        type="number"
                        value={newContract.totalValue}
                        onChange={(e) => setNewContract({...newContract, totalValue: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Retainer Amount ($)</Label>
                      <Input 
                        type="number"
                        value={newContract.retainerAmount}
                        onChange={(e) => setNewContract({...newContract, retainerAmount: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hourly Rate ($)</Label>
                      <Input 
                        type="number"
                        value={newContract.hourlyRate}
                        onChange={(e) => setNewContract({...newContract, hourlyRate: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Termination Notice (days)</Label>
                      <Input 
                        type="number"
                        value={newContract.terminationNoticeDays}
                        onChange={(e) => setNewContract({...newContract, terminationNoticeDays: parseInt(e.target.value) || 30})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Non-Compete (months)</Label>
                      <Input 
                        type="number"
                        value={newContract.nonCompeteMonths}
                        onChange={(e) => setNewContract({...newContract, nonCompeteMonths: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Renewal Term (months)</Label>
                      <Input 
                        type="number"
                        value={newContract.renewalTermMonths}
                        onChange={(e) => setNewContract({...newContract, renewalTermMonths: parseInt(e.target.value) || 12})}
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label>Auto-Renew</Label>
                      <Switch 
                        checked={newContract.autoRenew}
                        onCheckedChange={(v) => setNewContract({...newContract, autoRenew: v})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label>IP Assignment Required</Label>
                      <Switch 
                        checked={newContract.ipAssignment}
                        onCheckedChange={(v) => setNewContract({...newContract, ipAssignment: v})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label>Confidentiality Required</Label>
                      <Switch 
                        checked={newContract.confidentialityRequired}
                        onCheckedChange={(v) => setNewContract({...newContract, confidentialityRequired: v})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label>Insurance Required</Label>
                      <Switch 
                        checked={newContract.insuranceRequired}
                        onCheckedChange={(v) => setNewContract({...newContract, insuranceRequired: v})}
                      />
                    </div>
                  </div>

                  <Button onClick={handleCreateContract} disabled={createMutation.isPending} className="w-full">
                    {createMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                    ) : (
                      <><FileText className="w-4 h-4 mr-2" />Create Contract</>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Contracts</p>
                  <p className="text-2xl font-bold">{stats?.contracts?.totalContracts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Contracts</p>
                  <p className="text-2xl font-bold">{stats?.contracts?.activeContracts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active SOWs</p>
                  <p className="text-2xl font-bold">{stats?.sows?.activeSOWs || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold">{expiringContracts?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expiring Contracts Alert */}
        {expiringContracts && expiringContracts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Contracts Expiring Within 60 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {expiringContracts.slice(0, 5).map((contract: any) => (
                  <div key={contract.id} className="flex items-center justify-between p-2 bg-background rounded">
                    <div>
                      <p className="font-medium">{contract.contractNumber} - {contract.title}</p>
                      <p className="text-sm text-muted-foreground">{contract.businessName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        Expires: {new Date(contract.expirationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Tabs */}
        <Tabs defaultValue="contracts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="sows">Statements of Work</TabsTrigger>
            <TabsTrigger value="pending">Pending Signature ({stats?.contracts?.pendingSignature || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <CardTitle>All Contracts</CardTitle>
                <CardDescription>Master Service Agreements and other contracts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Contractor</TableHead>
                      <TableHead>Effective</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No contracts found. Create your first contract to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      contracts?.map((contract: any) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                          <TableCell>{getContractTypeBadge(contract.contractType)}</TableCell>
                          <TableCell>{contract.title}</TableCell>
                          <TableCell>{contract.businessName || '-'}</TableCell>
                          <TableCell>{contract.effectiveDate ? new Date(contract.effectiveDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{contract.expirationDate ? new Date(contract.expirationDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{getStatusBadge(contract.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => {
                                setSelectedContract(contract);
                                setViewDialogOpen(true);
                              }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {contract.status === 'draft' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => updateStatusMutation.mutate({ 
                                    contractId: contract.id, 
                                    status: 'pending_signature' 
                                  })}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              )}
                              {contract.status === 'pending_signature' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => signAsClientMutation.mutate({ 
                                    contractId: contract.id, 
                                    signerName: 'L.A.W.S. Collective' 
                                  })}
                                >
                                  <FileSignature className="w-4 h-4 text-green-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sows">
            <Card>
              <CardHeader>
                <CardTitle>Statements of Work</CardTitle>
                <CardDescription>Project-specific work orders under MSAs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SOW #</TableHead>
                      <TableHead>Contract</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sows?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No SOWs found. Create a SOW under an active contract.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sows?.map((sow: any) => (
                        <TableRow key={sow.id}>
                          <TableCell className="font-medium">{sow.sowNumber}</TableCell>
                          <TableCell>{sow.contractNumber}</TableCell>
                          <TableCell>{sow.title}</TableCell>
                          <TableCell>{sow.startDate ? new Date(sow.startDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{sow.endDate ? new Date(sow.endDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>${parseFloat(sow.budgetAmount || 0).toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(sow.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Signatures</CardTitle>
                <CardDescription>Contracts awaiting signature</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract #</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Contractor Signed</TableHead>
                      <TableHead>Client Signed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts?.filter((c: any) => c.status === 'pending_signature').map((contract: any) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                        <TableCell>{contract.title}</TableCell>
                        <TableCell>
                          {contract.signedByContractor ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          {contract.signedByClient ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          {!contract.signedByClient && (
                            <Button 
                              size="sm"
                              onClick={() => signAsClientMutation.mutate({ 
                                contractId: contract.id, 
                                signerName: 'L.A.W.S. Collective' 
                              })}
                            >
                              <FileSignature className="w-4 h-4 mr-1" />
                              Sign as Client
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Contract Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedContract?.contractNumber}</DialogTitle>
            </DialogHeader>
            {selectedContract && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{selectedContract.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    {getContractTypeBadge(selectedContract.contractType)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedContract.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contractor</p>
                    <p className="font-medium">{selectedContract.businessName || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="border-t pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Effective Date</p>
                    <p className="font-medium">{selectedContract.effectiveDate ? new Date(selectedContract.effectiveDate).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiration Date</p>
                    <p className="font-medium">{selectedContract.expirationDate ? new Date(selectedContract.expirationDate).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
                {selectedContract.totalValue > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">Total Contract Value</p>
                    <p className="text-2xl font-bold">${parseFloat(selectedContract.totalValue).toLocaleString()}</p>
                  </div>
                )}
                {selectedContract.description && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{selectedContract.description}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
