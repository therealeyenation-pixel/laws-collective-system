import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  FileText, 
  Plus, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2,
  Link2,
  Shield,
  Bell,
  FileSignature,
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const contractTypes = [
  { value: "vendor_agreement", label: "Vendor Agreement" },
  { value: "partnership_agreement", label: "Partnership Agreement" },
  { value: "service_agreement", label: "Service Agreement" },
  { value: "licensing_agreement", label: "Licensing Agreement" },
  { value: "lease_agreement", label: "Lease Agreement" },
  { value: "employment_contract", label: "Employment Contract" },
  { value: "contractor_agreement", label: "Contractor Agreement" },
  { value: "nda", label: "Non-Disclosure Agreement" },
  { value: "operating_agreement", label: "Operating Agreement" },
  { value: "trust_affiliation", label: "Trust Affiliation" },
  { value: "distribution_agreement", label: "Distribution Agreement" },
  { value: "franchise_agreement", label: "Franchise Agreement" },
  { value: "joint_venture", label: "Joint Venture" },
  { value: "loan_agreement", label: "Loan Agreement" },
  { value: "insurance_policy", label: "Insurance Policy" },
  { value: "other", label: "Other" },
];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending_approval: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  suspended: "bg-orange-100 text-orange-800",
  expired: "bg-red-100 text-red-800",
  terminated: "bg-red-100 text-red-800",
  renewed: "bg-blue-100 text-blue-800",
};

const signatureStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending_internal: "bg-yellow-100 text-yellow-800",
  pending_counterparty: "bg-blue-100 text-blue-800",
  partially_signed: "bg-purple-100 text-purple-800",
  fully_executed: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
};

export default function HouseContractManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  
  // Queries
  const { data: contracts, isLoading: contractsLoading, refetch: refetchContracts } = trpc.houseContracts.getMyContracts.useQuery();
  const { data: expiringContracts } = trpc.houseContracts.getExpiringSoon.useQuery({ daysAhead: 30 });
  const { data: upcomingMilestones } = trpc.houseContracts.getUpcomingMilestones.useQuery({ daysAhead: 30 });
  
  // Mutations
  const createContract = trpc.houseContracts.create.useMutation({
    onSuccess: () => {
      toast.success("Contract created successfully");
      setIsCreateDialogOpen(false);
      refetchContracts();
    },
    onError: (error) => {
      toast.error(`Failed to create contract: ${error.message}`);
    },
  });

  const recordOnLuvLedger = trpc.houseContracts.recordOnLuvLedger.useMutation({
    onSuccess: () => {
      toast.success("Contract recorded on LuvLedger blockchain");
      refetchContracts();
    },
    onError: (error) => {
      toast.error(`Failed to record on LuvLedger: ${error.message}`);
    },
  });

  const handleCreateContract = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createContract.mutate({
      houseId: parseInt(formData.get("houseId") as string),
      houseName: formData.get("houseName") as string,
      contractNumber: formData.get("contractNumber") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      contractType: formData.get("contractType") as any,
      counterpartyName: formData.get("counterpartyName") as string,
      counterpartyType: formData.get("counterpartyType") as any || "business",
      counterpartyEmail: formData.get("counterpartyEmail") as string,
      contractValue: formData.get("contractValue") as string,
      paymentTerms: formData.get("paymentTerms") as string,
      effectiveDate: new Date(formData.get("effectiveDate") as string),
      expirationDate: formData.get("expirationDate") ? new Date(formData.get("expirationDate") as string) : undefined,
      autoRenew: formData.get("autoRenew") === "on",
      notes: formData.get("notes") as string,
    });
  };

  // Calculate stats
  const stats = {
    total: contracts?.length || 0,
    active: contracts?.filter(c => c.status === "active").length || 0,
    pending: contracts?.filter(c => c.status === "pending_approval" || c.signatureStatus === "pending_internal" || c.signatureStatus === "pending_counterparty").length || 0,
    expiringSoon: expiringContracts?.length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">House Contract Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage all contracts linked to your Houses with compliance tracking and LuvLedger recording
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Contract</DialogTitle>
                <DialogDescription>
                  Add a new contract to your House. It will be tracked for compliance and can be recorded on LuvLedger.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateContract} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="houseId">House ID</Label>
                    <Input id="houseId" name="houseId" type="number" required placeholder="Enter House ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="houseName">House Name</Label>
                    <Input id="houseName" name="houseName" required placeholder="Enter House name" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractNumber">Contract Number</Label>
                    <Input id="contractNumber" name="contractNumber" required placeholder="e.g., CON-2026-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Contract Type</Label>
                    <Select name="contractType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Contract Title</Label>
                  <Input id="title" name="title" required placeholder="Enter contract title" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Brief description of the contract" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="counterpartyName">Counterparty Name</Label>
                    <Input id="counterpartyName" name="counterpartyName" required placeholder="Other party's name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="counterpartyType">Counterparty Type</Label>
                    <Select name="counterpartyType" defaultValue="business">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit</SelectItem>
                        <SelectItem value="trust">Trust</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="counterpartyEmail">Counterparty Email</Label>
                  <Input id="counterpartyEmail" name="counterpartyEmail" type="email" placeholder="contact@example.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractValue">Contract Value ($)</Label>
                    <Input id="contractValue" name="contractValue" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Input id="paymentTerms" name="paymentTerms" placeholder="e.g., Net 30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="effectiveDate">Effective Date</Label>
                    <Input id="effectiveDate" name="effectiveDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input id="expirationDate" name="expirationDate" type="date" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="autoRenew" name="autoRenew" className="rounded" />
                  <Label htmlFor="autoRenew">Auto-renew contract</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" placeholder="Additional notes..." />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createContract.isPending}>
                    {createContract.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Contract"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Contracts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Signature</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.expiringSoon}</p>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Contracts</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            <TabsTrigger value="milestones">Upcoming Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {contractsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : contracts && contracts.length > 0 ? (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <Card key={contract.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{contract.title}</h3>
                            <Badge className={statusColors[contract.status]}>
                              {contract.status.replace("_", " ")}
                            </Badge>
                            <Badge className={signatureStatusColors[contract.signatureStatus]}>
                              {contract.signatureStatus.replace("_", " ")}
                            </Badge>
                            {contract.luvLedgerRecorded && (
                              <Badge className="bg-purple-100 text-purple-800">
                                <Link2 className="w-3 h-3 mr-1" />
                                On LuvLedger
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{contract.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span>{contract.houseName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span>{contract.contractNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(contract.effectiveDate).toLocaleDateString()}</span>
                            </div>
                            {contract.contractValue && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span>${parseFloat(contract.contractValue).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 text-sm">
                            <span className="text-muted-foreground">Counterparty: </span>
                            <span className="font-medium">{contract.counterpartyName}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!contract.luvLedgerRecorded && contract.signatureStatus === "fully_executed" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => recordOnLuvLedger.mutate({ contractId: contract.id })}
                              disabled={recordOnLuvLedger.isPending}
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              Record on LuvLedger
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Contracts Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first contract to start tracking agreements for your Houses.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Contract
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="expiring" className="mt-6">
            {expiringContracts && expiringContracts.length > 0 ? (
              <div className="space-y-4">
                {expiringContracts.map((contract) => (
                  <Card key={contract.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{contract.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Expires: {contract.expirationDate ? new Date(contract.expirationDate).toLocaleDateString() : "N/A"}
                          </p>
                          <p className="text-sm mt-1">
                            <span className="text-muted-foreground">House: </span>
                            {contract.houseName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-500" />
                          <Button size="sm" variant="outline">Review</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">
                    No contracts expiring in the next 30 days.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="milestones" className="mt-6">
            {upcomingMilestones && upcomingMilestones.length > 0 ? (
              <div className="space-y-4">
                {upcomingMilestones.map((item) => (
                  <Card key={item.milestone.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{item.milestone.milestoneType.replace("_", " ")}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Due: {new Date(item.milestone.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-semibold">{item.milestone.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Contract: {item.contract.title}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Upcoming Milestones</h3>
                  <p className="text-muted-foreground">
                    No contract milestones due in the next 30 days.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* LuvLedger Integration Info */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              LuvLedger Blockchain Integration
            </CardTitle>
            <CardDescription>
              All fully executed contracts can be recorded on the LuvLedger blockchain for immutable record-keeping
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <FileSignature className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">Immutable Records</p>
                  <p className="text-muted-foreground">Contract details are permanently recorded</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Link2 className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">Audit Trail</p>
                  <p className="text-muted-foreground">Complete history of contract milestones</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">Trust Verification</p>
                  <p className="text-muted-foreground">Verify contract authenticity anytime</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
