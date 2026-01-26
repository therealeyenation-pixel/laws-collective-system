import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { 
  FileSignature, Plus, Send, Users, Clock, CheckCircle, XCircle, 
  AlertTriangle, Bell, RefreshCw, Eye, Loader2, Calendar, Building2,
  UserCheck, FileText, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BulkSignatureRequest() {
  const [activeTab, setActiveTab] = useState("requests");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "active" | "completed" | "cancelled">("all");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    articleId: "",
    articleTitle: "",
    articleType: "document" as const,
    department: "",
    targetType: "all" as const,
    targetValue: "",
    dueDate: "",
  });

  // Queries
  const { data: requestsData, isLoading: loadingRequests, refetch: refetchRequests } = trpc.bulkSignature.getRequests.useQuery({
    status: statusFilter,
    page: 1,
    pageSize: 20,
  });

  const { data: reminderStats, refetch: refetchStats } = trpc.bulkSignature.getReminderStats.useQuery();
  const { data: departments } = trpc.bulkSignature.getDepartments.useQuery();
  const { data: requestDetails, isLoading: loadingDetails } = trpc.bulkSignature.getRequestDetails.useQuery(
    { requestId: selectedRequestId! },
    { enabled: !!selectedRequestId && showDetailsDialog }
  );

  // Mutations
  const createMutation = trpc.bulkSignature.createRequest.useMutation({
    onSuccess: (data) => {
      toast.success("Signature request created");
      setShowCreateDialog(false);
      resetForm();
      refetchRequests();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create request");
    },
  });

  const activateMutation = trpc.bulkSignature.activateRequest.useMutation({
    onSuccess: (data) => {
      toast.success(`Request activated! Sent to ${data.recipientCount} recipients`);
      refetchRequests();
      refetchStats();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to activate request");
    },
  });

  const cancelMutation = trpc.bulkSignature.cancelRequest.useMutation({
    onSuccess: () => {
      toast.success("Request cancelled");
      refetchRequests();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel request");
    },
  });

  const triggerRemindersMutation = trpc.bulkSignature.triggerReminders.useMutation({
    onSuccess: (data) => {
      const { daily, weekly, overdue } = data.results;
      toast.success(`Reminders sent: ${daily.sent + weekly.sent + overdue.sent} total`);
      refetchStats();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send reminders");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      articleId: "",
      articleTitle: "",
      articleType: "document",
      department: "",
      targetType: "all",
      targetValue: "",
      dueDate: "",
    });
  };

  const handleCreate = () => {
    if (!formData.title || !formData.articleId || !formData.articleTitle) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleActivate = (requestId: number) => {
    activateMutation.mutate({ requestId });
  };

  const handleCancel = (requestId: number) => {
    if (confirm("Are you sure you want to cancel this signature request?")) {
      cancelMutation.mutate({ requestId });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case "active":
        return <Badge variant="default" className="bg-blue-500"><Send className="w-3 h-3 mr-1" />Active</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bulk Signature Requests</h1>
            <p className="text-muted-foreground">Create and manage signature requests for multiple users</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => triggerRemindersMutation.mutate()}
              disabled={triggerRemindersMutation.isPending}
            >
              {triggerRemindersMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Bell className="w-4 h-4 mr-2" />
              )}
              Send Reminders
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileSignature className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Signatures</p>
                  <p className="text-2xl font-bold">{reminderStats?.totalPending || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{reminderStats?.overdueCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reminders Today</p>
                  <p className="text-2xl font-bold">{reminderStats?.remindersSentToday || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{reminderStats?.remindersSentThisWeek || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="requests">Signature Requests</TabsTrigger>
            <TabsTrigger value="templates">Document Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => refetchRequests()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Requests Table */}
            <Card>
              <CardContent className="p-0">
                {loadingRequests ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestsData?.requests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No signature requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        requestsData?.requests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{request.articleTitle}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {request.targetType === "all" && <Users className="w-4 h-4" />}
                                {request.targetType === "department" && <Building2 className="w-4 h-4" />}
                                {request.targetType === "role" && <UserCheck className="w-4 h-4" />}
                                <span className="text-sm capitalize">{request.targetType}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="w-32">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>{request.signedCount}/{request.totalRecipients}</span>
                                  <span>
                                    {request.totalRecipients > 0
                                      ? Math.round((request.signedCount / request.totalRecipients) * 100)
                                      : 0}%
                                  </span>
                                </div>
                                <Progress 
                                  value={request.totalRecipients > 0 
                                    ? (request.signedCount / request.totalRecipients) * 100 
                                    : 0} 
                                  className="h-2"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.dueDate ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  {format(new Date(request.dueDate), "MMM d, yyyy")}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">No due date</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequestId(request.id);
                                    setShowDetailsDialog(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {request.status === "draft" && (
                                  <>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleActivate(request.id)}
                                      disabled={activateMutation.isPending}
                                    >
                                      <Send className="w-4 h-4 mr-1" />
                                      Activate
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleCancel(request.id)}
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                {request.status === "active" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancel(request.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Document Templates</CardTitle>
                <CardDescription>Pre-configured documents for common signature requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Employee Handbook", type: "policy", icon: FileText },
                    { title: "Code of Conduct", type: "compliance", icon: FileSignature },
                    { title: "Safety Training", type: "training", icon: UserCheck },
                    { title: "NDA Agreement", type: "document", icon: FileText },
                    { title: "Privacy Policy", type: "policy", icon: FileSignature },
                    { title: "Benefits Enrollment", type: "procedure", icon: FileText },
                  ].map((template, idx) => (
                    <Card key={idx} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <template.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{template.title}</p>
                              <p className="text-xs text-muted-foreground capitalize">{template.type}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Request Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Signature Request</DialogTitle>
              <DialogDescription>
                Create a new bulk signature request to send to multiple users
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Request Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Q1 2026 Policy Updates"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="articleType">Document Type</Label>
                  <Select
                    value={formData.articleType}
                    onValueChange={(v: any) => setFormData({ ...formData, articleType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="articleId">Document ID *</Label>
                  <Input
                    id="articleId"
                    value={formData.articleId}
                    onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
                    placeholder="e.g., DOC-2026-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="articleTitle">Document Title *</Label>
                  <Input
                    id="articleTitle"
                    value={formData.articleTitle}
                    onChange={(e) => setFormData({ ...formData, articleTitle: e.target.value })}
                    placeholder="e.g., Employee Handbook 2026"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the signature request..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetType">Target Recipients</Label>
                  <Select
                    value={formData.targetType}
                    onValueChange={(v: any) => setFormData({ ...formData, targetType: v, targetValue: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="department">By Department</SelectItem>
                      <SelectItem value="role">By Role</SelectItem>
                      <SelectItem value="specific">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.targetType === "department" && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.targetValue}
                      onValueChange={(v) => setFormData({ ...formData, targetValue: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments?.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.targetType === "role" && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.targetValue}
                      onValueChange={(v) => setFormData({ ...formData, targetValue: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.targetType === "specific" && (
                  <div className="space-y-2">
                    <Label htmlFor="userIds">User IDs (comma-separated)</Label>
                    <Input
                      id="userIds"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                      placeholder="e.g., 1, 2, 3"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Request Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(v) => setFormData({ ...formData, department: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Request Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
              <DialogDescription>
                View signature request details and recipient status
              </DialogDescription>
            </DialogHeader>
            {loadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : requestDetails ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{requestDetails.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(requestDetails.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Document</p>
                    <p className="font-medium">{requestDetails.articleTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {requestDetails.dueDate
                        ? format(new Date(requestDetails.dueDate), "MMM d, yyyy")
                        : "No due date"}
                    </p>
                  </div>
                </div>

                {requestDetails.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{requestDetails.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Recipients ({requestDetails.recipients.length})</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Read</TableHead>
                        <TableHead>Signed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestDetails.recipients.map((recipient, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{recipient.userName}</TableCell>
                          <TableCell className="text-muted-foreground">{recipient.userEmail}</TableCell>
                          <TableCell>
                            {recipient.readAt ? (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {format(new Date(recipient.readAt), "MMM d")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {recipient.signedAt ? (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {format(new Date(recipient.signedAt), "MMM d")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
