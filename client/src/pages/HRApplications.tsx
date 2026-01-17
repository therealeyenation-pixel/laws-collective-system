import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Users,
  Search,
  Filter,
  FileText,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  MessageSquare,
  UserCheck,
  UserX,
  Briefcase,
  Building2,
  ExternalLink,
  Loader2,
  RefreshCw
} from "lucide-react";

const STATUS_CONFIG = {
  received: { label: "Received", color: "bg-blue-500", icon: Clock },
  screening: { label: "Screening", color: "bg-yellow-500", icon: Eye },
  phone_screen: { label: "Phone Screen", color: "bg-orange-500", icon: Phone },
  interview: { label: "Interview", color: "bg-purple-500", icon: Users },
  offer: { label: "Offer Extended", color: "bg-green-500", icon: CheckCircle2 },
  hired: { label: "Hired", color: "bg-emerald-600", icon: UserCheck },
  rejected: { label: "Rejected", color: "bg-red-500", icon: UserX },
  withdrawn: { label: "Withdrawn", color: "bg-gray-500", icon: XCircle },
};

export default function HRApplications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  const { data: applications, isLoading, refetch } = trpc.jobApplications.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm || undefined,
    limit: 100,
  });

  const { data: stats } = trpc.jobApplications.getStats.useQuery();

  const updateStatusMutation = trpc.jobApplications.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Application status updated");
      refetch();
      setShowStatusDialog(false);
      setNewStatus("");
      setStatusNotes("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    }
  });

  type ApplicationStatus = "received" | "screening" | "phone_screen" | "interview_scheduled" | "interview_completed" | "reference_check" | "offer_extended" | "offer_accepted" | "hired" | "rejected" | "withdrawn";

  const handleViewApplication = (app: any) => {
    setSelectedApplication(app);
    setShowDetailDialog(true);
  };

  const handleUpdateStatus = (app: any) => {
    setSelectedApplication(app);
    setNewStatus(app.status);
    setShowStatusDialog(true);
  };

  const submitStatusUpdate = () => {
    if (!selectedApplication || !newStatus) return;
    
    updateStatusMutation.mutate({
      id: selectedApplication.id,
      status: newStatus as ApplicationStatus,
      notes: statusNotes || undefined,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.received;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Application Management</h1>
            <p className="text-muted-foreground">Review and manage job applications</p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{stats?.byStatus?.received || 0}</p>
                <p className="text-xs text-muted-foreground">New</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">{stats?.byStatus?.screening || 0}</p>
                <p className="text-xs text-muted-foreground">Screening</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">{stats?.byStatus?.interview || 0}</p>
                <p className="text-xs text-muted-foreground">Interview</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{stats?.byStatus?.offer || 0}</p>
                <p className="text-xs text-muted-foreground">Offer</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats?.byStatus?.hired || 0}</p>
                <p className="text-xs text-muted-foreground">Hired</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{stats?.byStatus?.rejected || 0}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-500">{stats?.byStatus?.withdrawn || 0}</p>
                <p className="text-xs text-muted-foreground">Withdrawn</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="phone_screen">Phone Screen</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer Extended</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              {applications?.length || 0} application(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : applications?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No applications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications?.map((app: any) => (
                  <div
                    key={app.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {app.firstName} {app.lastName}
                          </h3>
                          {getStatusBadge(app.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {app.positionTitle}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {app.entity}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {app.email}
                          </span>
                          {app.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {app.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Applied {formatDate(app.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewApplication(app)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(app)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApplication?.positionTitle} at {selectedApplication?.entity}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6 py-4">
              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedApplication.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedApplication.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Role</Label>
                  <p className="font-medium">{selectedApplication.currentRole || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Experience</Label>
                  <p className="font-medium">{selectedApplication.yearsExperience || "Not provided"}</p>
                </div>
              </div>

              {/* Resume */}
              {selectedApplication.resumeUrl && (
                <div>
                  <Label className="text-muted-foreground">Resume</Label>
                  <div className="mt-2 p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{selectedApplication.resumeFileName || "Resume"}</p>
                        <p className="text-xs text-muted-foreground">Uploaded with application</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedApplication.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedApplication.relevantSkills && (
                <div>
                  <Label className="text-muted-foreground">Relevant Skills</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedApplication.relevantSkills}</p>
                </div>
              )}

              {/* Why Interested */}
              {selectedApplication.whyInterested && (
                <div>
                  <Label className="text-muted-foreground">Why Interested</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedApplication.whyInterested}</p>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div>
                  <Label className="text-muted-foreground">Cover Letter</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <Label className="text-muted-foreground">Application Timeline</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Applied: {formatDate(selectedApplication.createdAt)}</span>
                  </div>
                  {selectedApplication.updatedAt !== selectedApplication.createdAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                      <span>Last Updated: {formatDate(selectedApplication.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowDetailDialog(false);
              handleUpdateStatus(selectedApplication);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              {selectedApplication?.firstName} {selectedApplication?.lastName} - {selectedApplication?.positionTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="phone_screen">Phone Screen</SelectItem>
                  <SelectItem value="interview">Interview Scheduled</SelectItem>
                  <SelectItem value="offer">Offer Extended</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add notes about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
              />
            </div>
            {(newStatus === "interview" || newStatus === "hired" || newStatus === "rejected" || newStatus === "offer") && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  This status change will be logged to the LuvLedger for audit tracking.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitStatusUpdate}
              disabled={!newStatus || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
