import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Send,
  MessageSquare,
  FileUp,
  TrendingUp,
  DollarSign,
  Calendar,
  Building2,
  Loader2,
  ChevronRight,
  History
} from "lucide-react";

type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'additional_info_requested' | 'approved' | 'rejected' | 'withdrawn';
type FunderType = 'federal' | 'foundation' | 'state' | 'corporate' | 'other';

export default function GrantHistory() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  // Form state for new application
  const [newApplication, setNewApplication] = useState({
    entityId: '',
    grantName: '',
    funderName: '',
    funderType: 'foundation' as FunderType,
    requestedAmount: 0,
    deadlineDate: '',
    projectTitle: '',
    projectDescription: '',
    contactPerson: '',
    contactEmail: '',
    notes: '',
  });

  // Form state for funder response
  const [newResponse, setNewResponse] = useState({
    responseDate: new Date().toISOString().split('T')[0],
    responseType: 'acknowledgment' as 'acknowledgment' | 'request_info' | 'site_visit' | 'decision' | 'feedback',
    summary: '',
    details: '',
    actionRequired: false,
    actionDeadline: '',
  });

  // Queries
  const { data: dashboard, isLoading, refetch: refetchDashboard } = trpc.grantApplicationHistory.getDashboard.useQuery();
  const { data: allApplications, refetch: refetchApplications } = trpc.grantApplicationHistory.getApplications.useQuery({});
  const { data: entityNames } = trpc.grantApplicationHistory.getEntityNames.useQuery();
  const { data: applicationDetails } = trpc.grantApplicationHistory.getFullDetails.useQuery(
    { id: selectedApplication || '' },
    { enabled: !!selectedApplication }
  );
  const { data: searchResults } = trpc.grantApplicationHistory.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );

  // Mutations
  const createMutation = trpc.grantApplicationHistory.createApplication.useMutation({
    onSuccess: () => {
      toast.success("Application created");
      setShowCreateDialog(false);
      resetNewApplicationForm();
      refetchDashboard();
      refetchApplications();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateStatusMutation = trpc.grantApplicationHistory.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      refetchDashboard();
      refetchApplications();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.grantApplicationHistory.deleteApplication.useMutation({
    onSuccess: () => {
      toast.success("Application deleted");
      refetchDashboard();
      refetchApplications();
    },
    onError: (error) => toast.error(error.message),
  });

  const addResponseMutation = trpc.grantApplicationHistory.addFunderResponse.useMutation({
    onSuccess: () => {
      toast.success("Response recorded");
      setShowResponseDialog(false);
      resetResponseForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetNewApplicationForm = () => {
    setNewApplication({
      entityId: '',
      grantName: '',
      funderName: '',
      funderType: 'foundation',
      requestedAmount: 0,
      deadlineDate: '',
      projectTitle: '',
      projectDescription: '',
      contactPerson: '',
      contactEmail: '',
      notes: '',
    });
  };

  const resetResponseForm = () => {
    setNewResponse({
      responseDate: new Date().toISOString().split('T')[0],
      responseType: 'acknowledgment',
      summary: '',
      details: '',
      actionRequired: false,
      actionDeadline: '',
    });
  };

  const handleCreateApplication = () => {
    if (!newApplication.entityId || !newApplication.grantName || !newApplication.deadlineDate) {
      toast.error("Please fill in required fields");
      return;
    }

    createMutation.mutate({
      ...newApplication,
      entityName: entityNames?.[newApplication.entityId] || newApplication.entityId,
      status: 'draft',
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const styles: Record<ApplicationStatus, { className: string; icon: React.ReactNode }> = {
      draft: { className: "bg-gray-500/10 text-gray-600 border-gray-500/20", icon: <Edit3 className="w-3 h-3" /> },
      submitted: { className: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: <Send className="w-3 h-3" /> },
      under_review: { className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: <Clock className="w-3 h-3" /> },
      additional_info_requested: { className: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: <AlertCircle className="w-3 h-3" /> },
      approved: { className: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle2 className="w-3 h-3" /> },
      rejected: { className: "bg-red-500/10 text-red-600 border-red-500/20", icon: <XCircle className="w-3 h-3" /> },
      withdrawn: { className: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: <XCircle className="w-3 h-3" /> },
    };

    const style = styles[status];
    return (
      <Badge className={`gap-1 ${style.className}`}>
        {style.icon}
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getFunderTypeBadge = (type: FunderType) => {
    const colors: Record<FunderType, string> = {
      federal: "bg-blue-500/10 text-blue-600",
      foundation: "bg-purple-500/10 text-purple-600",
      state: "bg-green-500/10 text-green-600",
      corporate: "bg-orange-500/10 text-orange-600",
      other: "bg-gray-500/10 text-gray-600",
    };
    return <Badge className={colors[type]}>{type}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const filteredApplications = (allApplications || []).filter(app => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (entityFilter !== "all" && app.entityId !== entityFilter) return false;
    return true;
  });

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Grant Application History</h1>
            <p className="text-muted-foreground">Track applications, status updates, and funder responses</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{dashboard?.analytics.totalApplications || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{dashboard?.analytics.successRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Awarded</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboard?.analytics.totalAwarded || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{dashboard?.analytics.pendingApplications || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="applications">All Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-4">
            {/* Action Required */}
            {dashboard?.actionRequired && dashboard.actionRequired.length > 0 && (
              <Card className="border-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboard.actionRequired.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <div>
                          <p className="font-medium">{app.grantName}</p>
                          <p className="text-sm text-muted-foreground">{app.funderName}</p>
                        </div>
                        <Button size="sm" onClick={() => {
                          setSelectedApplication(app.id);
                          setShowDetailsDialog(true);
                        }}>
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.pendingApplications && dashboard.pendingApplications.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.pendingApplications.slice(0, 5).map((app: any) => (
                        <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{app.grantName}</p>
                              {getStatusBadge(app.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{app.entityName}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedApplication(app.id);
                            setShowDetailsDialog(true);
                          }}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No pending applications</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Decisions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Recent Decisions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.recentDecisions && dashboard.recentDecisions.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.recentDecisions.slice(0, 5).map((app: any) => (
                        <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{app.grantName}</p>
                              {getStatusBadge(app.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {app.status === 'approved' && app.awardedAmount 
                                ? `Awarded: ${formatCurrency(app.awardedAmount)}`
                                : app.funderName}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedApplication(app.id);
                            setShowDetailsDialog(true);
                          }}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No recent decisions</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Deadlines */}
            {dashboard?.upcomingDeadlines && dashboard.upcomingDeadlines.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Deadlines (Drafts)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboard.upcomingDeadlines.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{app.grantName}</p>
                          <p className="text-sm text-muted-foreground">{app.entityName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-amber-600">{new Date(app.deadlineDate).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(app.requestedAmount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All Applications Tab */}
          <TabsContent value="applications" className="space-y-4 mt-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search applications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="additional_info_requested">Info Requested</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      {entityNames && Object.entries(entityNames).map(([id, name]) => (
                        <SelectItem key={id} value={id}>{name as string}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Applications List */}
            <div className="space-y-3">
              {(searchQuery.length > 2 ? searchResults : filteredApplications)?.map((app: any) => (
                <Card key={app.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{app.grantName}</h3>
                          {getStatusBadge(app.status)}
                          {getFunderTypeBadge(app.funderType)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{app.projectTitle}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {app.entityName}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(app.requestedAmount)}
                            {app.awardedAmount && ` (Awarded: ${formatCurrency(app.awardedAmount)})`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Deadline: {new Date(app.deadlineDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedApplication(app.id);
                          setShowDetailsDialog(true);
                        }}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {app.status === 'draft' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this draft application?')) {
                                deleteMutation.mutate({ id: app.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Applications by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboard?.analytics.byStatus && Object.entries(dashboard.analytics.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* By Funder Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Applications by Funder Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboard?.analytics.byFunderType && Object.entries(dashboard.analytics.byFunderType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* By Entity */}
              <Card>
                <CardHeader>
                  <CardTitle>Applications by Entity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboard?.analytics.byEntity && Object.entries(dashboard.analytics.byEntity).map(([entityId, count]) => (
                      <div key={entityId} className="flex items-center justify-between">
                        <span>{entityNames?.[entityId] || entityId}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Requested</span>
                      <span className="font-bold">{formatCurrency(dashboard?.analytics.totalRequested || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Awarded</span>
                      <span className="font-bold text-green-600">{formatCurrency(dashboard?.analytics.totalAwarded || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average Response Time</span>
                      <span className="font-bold">{dashboard?.analytics.averageResponseDays || 0} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Application Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Grant Application</DialogTitle>
              <DialogDescription>Track a new grant application</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Entity *</Label>
                <Select value={newApplication.entityId} onValueChange={(v) => setNewApplication(prev => ({ ...prev, entityId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityNames && Object.entries(entityNames).map(([id, name]) => (
                      <SelectItem key={id} value={id}>{name as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Funder Type *</Label>
                <Select value={newApplication.funderType} onValueChange={(v) => setNewApplication(prev => ({ ...prev, funderType: v as FunderType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="federal">Federal</SelectItem>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Grant Name *</Label>
                <Input 
                  value={newApplication.grantName}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, grantName: e.target.value }))}
                  placeholder="e.g., NEA Art Works Grant"
                />
              </div>
              <div className="space-y-2">
                <Label>Funder Name *</Label>
                <Input 
                  value={newApplication.funderName}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, funderName: e.target.value }))}
                  placeholder="e.g., National Endowment for the Arts"
                />
              </div>
              <div className="space-y-2">
                <Label>Requested Amount *</Label>
                <Input 
                  type="number"
                  value={newApplication.requestedAmount || ''}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, requestedAmount: Number(e.target.value) }))}
                  placeholder="100000"
                />
              </div>
              <div className="space-y-2">
                <Label>Deadline Date *</Label>
                <Input 
                  type="date"
                  value={newApplication.deadlineDate}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, deadlineDate: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Project Title *</Label>
                <Input 
                  value={newApplication.projectTitle}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, projectTitle: e.target.value }))}
                  placeholder="Project title"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Project Description</Label>
                <Textarea 
                  value={newApplication.projectDescription}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, projectDescription: e.target.value }))}
                  placeholder="Brief description of the project"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input 
                  value={newApplication.contactPerson}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Contact name"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input 
                  type="email"
                  value={newApplication.contactEmail}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={newApplication.notes}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateApplication} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Application Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{applicationDetails?.application.grantName}</DialogTitle>
              <DialogDescription>{applicationDetails?.application.funderName}</DialogDescription>
            </DialogHeader>
            {applicationDetails && (
              <div className="space-y-6 py-4">
                {/* Status and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(applicationDetails.application.status)}
                    {getFunderTypeBadge(applicationDetails.application.funderType)}
                  </div>
                  <div className="flex gap-2">
                    {applicationDetails.application.status === 'draft' && (
                      <Button size="sm" onClick={() => {
                        updateStatusMutation.mutate({ id: applicationDetails.application.id, status: 'submitted' });
                      }}>
                        <Send className="w-4 h-4 mr-1" />
                        Mark Submitted
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => {
                      setShowResponseDialog(true);
                    }}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Add Response
                    </Button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Entity</p>
                    <p className="font-medium">{applicationDetails.application.entityName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested Amount</p>
                    <p className="font-medium">{formatCurrency(applicationDetails.application.requestedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">{new Date(applicationDetails.application.deadlineDate).toLocaleDateString()}</p>
                  </div>
                  {applicationDetails.application.submissionDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-medium">{new Date(applicationDetails.application.submissionDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {applicationDetails.application.awardedAmount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Awarded Amount</p>
                      <p className="font-medium text-green-600">{formatCurrency(applicationDetails.application.awardedAmount)}</p>
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Project</p>
                  <p className="font-medium">{applicationDetails.application.projectTitle}</p>
                  <p className="text-sm text-muted-foreground mt-1">{applicationDetails.application.projectDescription}</p>
                </div>

                {/* Notes */}
                {applicationDetails.application.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{applicationDetails.application.notes}</p>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <History className="w-4 h-4" />
                    Timeline
                  </h4>
                  <div className="space-y-2">
                    {applicationDetails.timeline.map((event: any) => (
                      <div key={event.id} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="text-sm">{event.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Funder Responses */}
                {applicationDetails.funderResponses.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4" />
                      Funder Responses
                    </h4>
                    <div className="space-y-2">
                      {applicationDetails.funderResponses.map((response: any) => (
                        <div key={response.id} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{response.responseType}</Badge>
                            <span className="text-sm text-muted-foreground">{new Date(response.responseDate).toLocaleDateString()}</span>
                          </div>
                          <p className="font-medium">{response.summary}</p>
                          <p className="text-sm text-muted-foreground">{response.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Response Dialog */}
        <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Funder Response</DialogTitle>
              <DialogDescription>Record a response from the funder</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Response Date</Label>
                  <Input 
                    type="date"
                    value={newResponse.responseDate}
                    onChange={(e) => setNewResponse(prev => ({ ...prev, responseDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Response Type</Label>
                  <Select value={newResponse.responseType} onValueChange={(v) => setNewResponse(prev => ({ ...prev, responseType: v as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                      <SelectItem value="request_info">Request for Info</SelectItem>
                      <SelectItem value="site_visit">Site Visit</SelectItem>
                      <SelectItem value="decision">Decision</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Input 
                  value={newResponse.summary}
                  onChange={(e) => setNewResponse(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary of the response"
                />
              </div>
              <div className="space-y-2">
                <Label>Details</Label>
                <Textarea 
                  value={newResponse.details}
                  onChange={(e) => setNewResponse(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Full details of the response"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResponseDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (selectedApplication) {
                  addResponseMutation.mutate({
                    applicationId: selectedApplication,
                    ...newResponse,
                  });
                }
              }} disabled={addResponseMutation.isPending}>
                {addResponseMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
