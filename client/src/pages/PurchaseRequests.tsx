import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ShoppingCart,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  FileText,
  Users,
  Building2,
} from "lucide-react";

const categories = [
  { value: "software", label: "Software" },
  { value: "equipment", label: "Equipment" },
  { value: "supplies", label: "Supplies" },
  { value: "professional_development", label: "Professional Development" },
  { value: "travel", label: "Travel" },
  { value: "contractor", label: "Contractor Services" },
  { value: "subscription", label: "Subscription" },
  { value: "other", label: "Other" },
];

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  pending_manager: "bg-yellow-500",
  pending_procurement: "bg-orange-500",
  pending_finance: "bg-blue-500",
  pending_ceo: "bg-purple-500",
  pending_board_notification: "bg-indigo-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  cancelled: "bg-gray-400",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending_manager: "Pending Manager",
  pending_procurement: "Pending Procurement",
  pending_finance: "Pending Finance",
  pending_ceo: "Pending CEO",
  pending_board_notification: "Pending Board",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function getApprovalTierLabel(tier: string): string {
  switch (tier) {
    case "tier1":
      return "Under $1,000 (Auto-approve)";
    case "tier2":
      return "$1,000-$5,000 (CEO Approval)";
    case "tier3":
      return "Over $5,000 (Board Notification)";
    default:
      return tier;
  }
}

export default function PurchaseRequests() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    departmentId: 1,
    title: "",
    description: "",
    category: "software" as const,
    vendor: "",
    amount: "",
    budgetCode: "",
  });

  const utils = trpc.useUtils();

  // Queries
  const { data: requests = [], isLoading } = trpc.purchaseRequests.list.useQuery({});
  const { data: stats } = trpc.purchaseRequests.getStats.useQuery();

  // Mutations
  const createMutation = trpc.purchaseRequests.create.useMutation({
    onSuccess: () => {
      toast.success("Purchase request created successfully");
      setIsCreateOpen(false);
      setFormData({
        departmentId: 1,
        title: "",
        description: "",
        category: "software",
        vendor: "",
        amount: "",
        budgetCode: "",
      });
      utils.purchaseRequests.list.invalidate();
      utils.purchaseRequests.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const approveMutation = trpc.purchaseRequests.approve.useMutation({
    onSuccess: (data) => {
      toast.success(`Request approved. New status: ${statusLabels[data.newStatus] || data.newStatus}`);
      utils.purchaseRequests.list.invalidate();
      utils.purchaseRequests.getStats.invalidate();
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectMutation = trpc.purchaseRequests.reject.useMutation({
    onSuccess: () => {
      toast.success("Request rejected");
      utils.purchaseRequests.list.invalidate();
      utils.purchaseRequests.getStats.invalidate();
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = () => {
    if (!formData.title || !formData.description || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  const handleApprove = (id: number, role: "manager" | "procurement" | "finance" | "ceo") => {
    approveMutation.mutate({ id, role });
  };

  const handleReject = (id: number, role: "manager" | "procurement" | "finance" | "ceo", notes: string) => {
    if (!notes) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    rejectMutation.mutate({ id, role, notes });
  };

  const filteredRequests = requests.filter((req: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return !["approved", "rejected", "cancelled"].includes(req.status);
    if (activeTab === "approved") return req.status === "approved";
    if (activeTab === "rejected") return req.status === "rejected";
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Purchase Requests</h1>
            <p className="text-muted-foreground mt-1">
              Manage department spending with tiered approval workflow
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Purchase Request</DialogTitle>
                <DialogDescription>
                  Submit a new purchase request for approval
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of purchase"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed justification for this purchase"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    placeholder="Vendor or supplier name"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetCode">Budget Code</Label>
                  <Input
                    id="budgetCode"
                    placeholder="Optional budget code"
                    value={formData.budgetCode}
                    onChange={(e) => setFormData({ ...formData, budgetCode: e.target.value })}
                  />
                </div>
                {formData.amount && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Approval Tier:</strong>{" "}
                      {getApprovalTierLabel(
                        parseFloat(formData.amount) < 1000
                          ? "tier1"
                          : parseFloat(formData.amount) <= 5000
                          ? "tier2"
                          : "tier3"
                      )}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.approved || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.approvedAmount || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approval Workflow Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approval Workflow</CardTitle>
            <CardDescription>
              Tiered approval based on purchase amount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-700 dark:text-green-400">
                  Tier 1: Under $1,000
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Manager → Procurement → Finance
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  CEO receives monthly report
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                  Tier 2: $1,000 - $5,000
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Manager → Procurement → Finance → CEO
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  CEO approval required
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-700 dark:text-purple-400">
                  Tier 3: Over $5,000
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Manager → Procurement → Finance → CEO → Board
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Board notification required
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading requests...
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No purchase requests found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request: any) => (
                      <div
                        key={request.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{request.title}</span>
                              <Badge
                                className={`${statusColors[request.status]} text-white`}
                              >
                                {statusLabels[request.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.requestNumber} • {request.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(request.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getApprovalTierLabel(request.approvalTier)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Request Detail Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            {selectedRequest && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedRequest.title}
                    <Badge
                      className={`${statusColors[selectedRequest.status]} text-white`}
                    >
                      {statusLabels[selectedRequest.status]}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedRequest.requestNumber}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Amount</Label>
                      <p className="font-semibold text-lg">
                        {formatCurrency(selectedRequest.amount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Category</Label>
                      <p className="capitalize">{selectedRequest.category.replace("_", " ")}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Vendor</Label>
                      <p>{selectedRequest.vendor || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Approval Tier</Label>
                      <p>{getApprovalTierLabel(selectedRequest.approvalTier)}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="mt-1">{selectedRequest.description}</p>
                  </div>

                  {/* Approval Status */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Approval Chain</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        {selectedRequest.managerApproval === "approved" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : selectedRequest.managerApproval === "rejected" ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="text-sm">Manager</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        {selectedRequest.procurementApproval === "approved" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : selectedRequest.procurementApproval === "rejected" ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="text-sm">Procurement</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        {selectedRequest.financeApproval === "approved" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : selectedRequest.financeApproval === "rejected" ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="text-sm">Finance</span>
                      </div>
                      {selectedRequest.approvalTier !== "tier1" && (
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                          {selectedRequest.ceoApproval === "approved" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : selectedRequest.ceoApproval === "rejected" ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : selectedRequest.ceoApproval === "not_required" ? (
                            <span className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-sm">CEO</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons based on current status */}
                {selectedRequest.status === "pending_manager" && (
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const notes = prompt("Rejection reason:");
                        if (notes) handleReject(selectedRequest.id, "manager", notes);
                      }}
                    >
                      Reject
                    </Button>
                    <Button onClick={() => handleApprove(selectedRequest.id, "manager")}>
                      Approve as Manager
                    </Button>
                  </DialogFooter>
                )}
                {selectedRequest.status === "pending_procurement" && (
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const notes = prompt("Rejection reason:");
                        if (notes) handleReject(selectedRequest.id, "procurement", notes);
                      }}
                    >
                      Reject
                    </Button>
                    <Button onClick={() => handleApprove(selectedRequest.id, "procurement")}>
                      Approve as Procurement
                    </Button>
                  </DialogFooter>
                )}
                {selectedRequest.status === "pending_finance" && (
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const notes = prompt("Rejection reason:");
                        if (notes) handleReject(selectedRequest.id, "finance", notes);
                      }}
                    >
                      Reject
                    </Button>
                    <Button onClick={() => handleApprove(selectedRequest.id, "finance")}>
                      Approve as Finance
                    </Button>
                  </DialogFooter>
                )}
                {selectedRequest.status === "pending_ceo" && (
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const notes = prompt("Rejection reason:");
                        if (notes) handleReject(selectedRequest.id, "ceo", notes);
                      }}
                    >
                      Reject
                    </Button>
                    <Button onClick={() => handleApprove(selectedRequest.id, "ceo")}>
                      Approve as CEO
                    </Button>
                  </DialogFooter>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
