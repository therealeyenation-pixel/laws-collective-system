import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Users,
  Building2,
  Loader2,
  Eye,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Available positions for requisition
const POSITIONS = [
  // Tier 3 Managers
  { id: "hr-manager", title: "HR Manager", department: "Human Resources", entity: "The L.A.W.S. Collective, LLC", tier: "tier3_open", salaryRange: "$75,000 - $95,000" },
  { id: "qa-manager", title: "QA/QC Manager", department: "Quality Assurance", entity: "The L.A.W.S. Collective, LLC", tier: "tier3_open", salaryRange: "$80,000 - $100,000" },
  { id: "purchasing-manager", title: "Purchasing Manager", department: "Purchasing", entity: "The L.A.W.S. Collective, LLC", tier: "tier3_open", salaryRange: "$75,000 - $95,000" },
  { id: "legal-manager", title: "Legal Manager", department: "Legal", entity: "The L.A.W.S. Collective, LLC", tier: "tier3_open", salaryRange: "$95,000 - $130,000" },
  
  // Tier 4 Coordinators
  { id: "ops-coordinator-finance", title: "Finance Operations Coordinator", department: "Finance", entity: "The L.A.W.S. Collective, LLC", tier: "tier4_coordinator", salaryRange: "$55,000 - $75,000" },
  { id: "ops-coordinator-education", title: "Education Operations Coordinator", department: "Education", entity: "Divine STEM Academy", tier: "tier4_coordinator", salaryRange: "$55,000 - $75,000" },
  { id: "ops-coordinator-technology", title: "Technology Operations Coordinator", department: "Technology", entity: "The L.A.W.S. Collective, LLC", tier: "tier4_coordinator", salaryRange: "$60,000 - $80,000" },
  { id: "ops-coordinator-hr", title: "HR Operations Coordinator", department: "Human Resources", entity: "The L.A.W.S. Collective, LLC", tier: "tier4_coordinator", salaryRange: "$50,000 - $70,000" },
  { id: "ops-coordinator-qa", title: "QA/QC Operations Coordinator", department: "Quality Assurance", entity: "The L.A.W.S. Collective, LLC", tier: "tier4_coordinator", salaryRange: "$52,000 - $72,000" },
  { id: "ops-coordinator-grants", title: "Grants Operations Coordinator", department: "Grants", entity: "The L.A.W.S. Collective, LLC", tier: "tier4_coordinator", salaryRange: "$55,000 - $75,000" },
  { id: "ops-coordinator-procurement", title: "Procurement Operations Coordinator", department: "Procurement", entity: "The L.A.W.S. Collective, LLC", tier: "tier4_coordinator", salaryRange: "$55,000 - $75,000" },
  { id: "ops-coordinator-purchasing", title: "Purchasing Operations Coordinator", department: "Purchasing", entity: "The L.A.W.S. Collective, LLC", tier: "tier4_coordinator", salaryRange: "$52,000 - $72,000" },
  { id: "ops-coordinator-contracts", title: "Contracts Operations Coordinator", department: "Contracts", entity: "The L.A.W.S. Collective, LLC", tier: "tier4_coordinator", salaryRange: "$52,000 - $72,000" },
  { id: "ops-coordinator-legal", title: "Legal Operations Coordinator", department: "Legal", entity: "The L.A.W.S. Collective, LLC", tier: "tier4_coordinator", salaryRange: "$55,000 - $75,000" },
  { id: "ops-coordinator-real-estate", title: "Real Estate Operations Coordinator", department: "Real Estate", entity: "The L.A.W.S. Collective, LLC", tier: "tier4_coordinator", salaryRange: "$52,000 - $72,000" },
  { id: "ops-coordinator-business", title: "Business Operations Coordinator", department: "Business Management", entity: "The L.A.W.S. Collective, LLC", tier: "tier4_coordinator", salaryRange: "$55,000 - $75,000" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Draft</Badge>;
    case "submitted":
      return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/30"><Clock className="w-3 h-3 mr-1" />Submitted</Badge>;
    case "under_review":
      return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30"><AlertCircle className="w-3 h-3 mr-1" />Under Review</Badge>;
    case "approved":
      return <Badge className="bg-green-500/10 text-green-700 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
    case "rejected":
      return <Badge className="bg-red-500/10 text-red-700 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    case "filled":
      return <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/30"><Users className="w-3 h-3 mr-1" />Filled</Badge>;
    case "cancelled":
      return <Badge variant="secondary">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getUrgencyBadge = (urgency: string) => {
  switch (urgency) {
    case "low":
      return <Badge variant="outline" className="text-gray-600">Low</Badge>;
    case "medium":
      return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/30">Medium</Badge>;
    case "high":
      return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30">High</Badge>;
    case "critical":
      return <Badge className="bg-red-500/10 text-red-700 border-red-500/30">Critical</Badge>;
    default:
      return <Badge variant="outline">{urgency}</Badge>;
  }
};

export default function PositionRequisitions() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<any>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [formData, setFormData] = useState({
    justification: "",
    urgency: "medium" as "low" | "medium" | "high" | "critical",
    targetStartDate: "",
    candidateName: "",
    candidateEmail: "",
  });

  const { data: requisitions, isLoading, refetch } = trpc.requisitions.list.useQuery();
  const { data: stats } = trpc.requisitions.getStats.useQuery();

  const createMutation = trpc.requisitions.create.useMutation({
    onSuccess: () => {
      toast.success("Position requisition submitted successfully");
      setCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to submit requisition: ${error.message}`);
    },
  });

  const updateStatusMutation = trpc.requisitions.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Requisition status updated");
      setViewDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSelectedPosition("");
    setFormData({
      justification: "",
      urgency: "medium",
      targetStartDate: "",
      candidateName: "",
      candidateEmail: "",
    });
  };

  const handleSubmit = () => {
    const position = POSITIONS.find(p => p.id === selectedPosition);
    if (!position) {
      toast.error("Please select a position");
      return;
    }

    if (!formData.justification.trim()) {
      toast.error("Please provide a justification");
      return;
    }

    createMutation.mutate({
      positionId: position.id,
      positionTitle: position.title,
      department: position.department,
      entity: position.entity,
      tier: position.tier,
      salaryRange: position.salaryRange,
      justification: formData.justification,
      urgency: formData.urgency,
      targetStartDate: formData.targetStartDate ? new Date(formData.targetStartDate) : undefined,
      candidateName: formData.candidateName || undefined,
      candidateEmail: formData.candidateEmail || undefined,
    });
  };

  const handleApprove = (id: number) => {
    updateStatusMutation.mutate({ id, status: "approved", budgetApproved: "approved" });
  };

  const handleReject = (id: number, notes: string) => {
    updateStatusMutation.mutate({ id, status: "rejected", approvalNotes: notes });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Position Requisitions</h1>
            <p className="text-muted-foreground mt-1">Request and track coordinator position approvals</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Requisition
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats?.submitted || 0}</p>
                <p className="text-sm text-muted-foreground">Submitted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats?.underReview || 0}</p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats?.filled || 0}</p>
                <p className="text-sm text-muted-foreground">Filled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requisitions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              All Requisitions
            </CardTitle>
            <CardDescription>Track position requests and their approval status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : requisitions && requisitions.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requisitions.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{req.positionTitle}</p>
                            <p className="text-xs text-muted-foreground">{req.entity}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{req.department}</Badge>
                        </TableCell>
                        <TableCell>{req.requestedByName || `User ${req.requestedBy}`}</TableCell>
                        <TableCell>{getUrgencyBadge(req.urgency)}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>
                          {req.createdAt && format(new Date(req.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRequisition(req);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(req.status === "submitted" || req.status === "under_review") && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleApprove(req.id)}
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleReject(req.id, "Position not approved at this time")}
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No requisitions yet</p>
                <p className="text-sm">Click "New Requisition" to request a position</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Requisition Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Position Requisition</DialogTitle>
              <DialogDescription>
                Submit a request to fill a coordinator or manager position
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Position *</Label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header-managers" disabled className="font-semibold">
                      -- Tier 3 Managers --
                    </SelectItem>
                    {POSITIONS.filter(p => p.tier === "tier3_open").map(pos => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.title} ({pos.department})
                      </SelectItem>
                    ))}
                    <SelectItem value="header-coordinators" disabled className="font-semibold">
                      -- Tier 4 Coordinators --
                    </SelectItem>
                    {POSITIONS.filter(p => p.tier === "tier4_coordinator").map(pos => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.title} ({pos.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPosition && (
                  <div className="text-sm text-muted-foreground">
                    Salary Range: {POSITIONS.find(p => p.id === selectedPosition)?.salaryRange}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Justification *</Label>
                <Textarea
                  placeholder="Explain why this position is needed..."
                  value={formData.justification}
                  onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select 
                    value={formData.urgency} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, urgency: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Start Date</Label>
                  <Input
                    type="date"
                    value={formData.targetStartDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetStartDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Candidate Information (Optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Candidate Name</Label>
                    <Input
                      placeholder="If you have someone in mind..."
                      value={formData.candidateName}
                      onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Candidate Email</Label>
                    <Input
                      type="email"
                      placeholder="candidate@email.com"
                      value={formData.candidateEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, candidateEmail: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                ) : (
                  "Submit Requisition"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Requisition Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Requisition Details</DialogTitle>
            </DialogHeader>
            {selectedRequisition && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Position</Label>
                    <p className="font-medium">{selectedRequisition.positionTitle}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="font-medium">{selectedRequisition.department}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Entity</Label>
                    <p className="font-medium">{selectedRequisition.entity}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Salary Range</Label>
                    <p className="font-medium">{selectedRequisition.salaryRange || "Not specified"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedRequisition.status)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Urgency</Label>
                    <div className="mt-1">{getUrgencyBadge(selectedRequisition.urgency)}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Justification</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequisition.justification}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Requested By</Label>
                    <p className="font-medium">{selectedRequisition.requestedByName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Submitted</Label>
                    <p className="font-medium">
                      {selectedRequisition.createdAt && format(new Date(selectedRequisition.createdAt), "PPP")}
                    </p>
                  </div>
                </div>

                {selectedRequisition.candidateName && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Candidate Information</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-medium">{selectedRequisition.candidateName}</p>
                      </div>
                      {selectedRequisition.candidateEmail && (
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="font-medium">{selectedRequisition.candidateEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedRequisition.approvalNotes && (
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground">Approval Notes</Label>
                    <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequisition.approvalNotes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
