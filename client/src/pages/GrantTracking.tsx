import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Target,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Building2,
  TrendingUp,
  FileCheck,
  Send,
  Award,
} from "lucide-react";

export default function GrantTracking() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewOpportunity, setShowNewOpportunity] = useState(false);
  const [showNewApplication, setShowNewApplication] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data: dashboard, refetch: refetchDashboard } = trpc.grantTracking.getDashboard.useQuery();
  const { data: opportunities, refetch: refetchOpportunities } = trpc.grantTracking.getOpportunities.useQuery({
    status: statusFilter || undefined,
    grantType: typeFilter || undefined,
  });
  const { data: applications, refetch: refetchApplications } = trpc.grantTracking.getApplications.useQuery({});
  const { data: pipeline } = trpc.grantTracking.getPipeline.useQuery();

  const createOpportunity = trpc.grantTracking.createOpportunity.useMutation({
    onSuccess: () => {
      toast.success("Grant opportunity added");
      setShowNewOpportunity(false);
      refetchOpportunities();
      refetchDashboard();
    },
    onError: (error) => toast.error(error.message),
  });

  const createApplication = trpc.grantTracking.createApplication.useMutation({
    onSuccess: () => {
      toast.success("Application created");
      setShowNewApplication(false);
      setSelectedOpportunityId(null);
      refetchApplications();
      refetchDashboard();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateOpportunityStatus = trpc.grantTracking.updateOpportunityStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      refetchOpportunities();
      refetchDashboard();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateApplicationStatus = trpc.grantTracking.updateApplicationStatus.useMutation({
    onSuccess: () => {
      toast.success("Application status updated");
      refetchApplications();
      refetchDashboard();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCreateOpportunity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createOpportunity.mutate({
      funderName: formData.get("funderName") as string,
      grantName: formData.get("grantName") as string,
      description: formData.get("description") as string,
      fundingAmountMin: formData.get("fundingAmountMin") ? Number(formData.get("fundingAmountMin")) : undefined,
      fundingAmountMax: formData.get("fundingAmountMax") ? Number(formData.get("fundingAmountMax")) : undefined,
      deadline: formData.get("deadline") as string || undefined,
      applicationUrl: formData.get("applicationUrl") as string,
      eligibilityRequirements: formData.get("eligibilityRequirements") as string,
      focusAreas: formData.get("focusAreas") as string,
      grantType: formData.get("grantType") as any,
      priority: formData.get("priority") as any,
      notes: formData.get("notes") as string,
    });
  };

  const handleCreateApplication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOpportunityId) return;
    const formData = new FormData(e.currentTarget);
    createApplication.mutate({
      opportunityId: selectedOpportunityId,
      projectTitle: formData.get("projectTitle") as string,
      projectDescription: formData.get("projectDescription") as string,
      requestedAmount: formData.get("requestedAmount") ? Number(formData.get("requestedAmount")) : undefined,
      projectStartDate: formData.get("projectStartDate") as string || undefined,
      projectEndDate: formData.get("projectEndDate") as string || undefined,
      assignedTo: formData.get("assignedTo") as string,
    });
  };

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return <Badge className="bg-gray-100">Unknown</Badge>;
    const styles: Record<string, string> = {
      researching: "bg-gray-100 text-gray-800",
      eligible: "bg-blue-100 text-blue-800",
      not_eligible: "bg-red-100 text-red-800",
      applied: "bg-purple-100 text-purple-800",
      archived: "bg-gray-100 text-gray-600",
      not_started: "bg-gray-100 text-gray-800",
      drafting: "bg-yellow-100 text-yellow-800",
      review: "bg-orange-100 text-orange-800",
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-purple-100 text-purple-800",
      awarded: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      withdrawn: "bg-gray-100 text-gray-600",
    };
    return <Badge className={styles[status] || "bg-gray-100"}>{status.replace(/_/g, " ")}</Badge>;
  };

  const getPriorityBadge = (priority: string | null | undefined) => {
    if (!priority) return <Badge className="bg-gray-100">N/A</Badge>;
    const styles: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return <Badge className={styles[priority] || "bg-gray-100"}>{priority}</Badge>;
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Grant Tracking</h1>
            <p className="text-muted-foreground">Manage grant opportunities, applications, and reporting</p>
          </div>
          <Dialog open={showNewOpportunity} onOpenChange={setShowNewOpportunity}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Grant Opportunity</DialogTitle>
                <DialogDescription>Track a new funding opportunity</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOpportunity} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="funderName">Funder Name *</Label>
                    <Input id="funderName" name="funderName" required placeholder="e.g., Ford Foundation" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grantName">Grant Name *</Label>
                    <Input id="grantName" name="grantName" required placeholder="e.g., Community Development Grant" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Brief description of the grant..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fundingAmountMin">Min Funding ($)</Label>
                    <Input id="fundingAmountMin" name="fundingAmountMin" type="number" placeholder="10000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fundingAmountMax">Max Funding ($)</Label>
                    <Input id="fundingAmountMax" name="fundingAmountMax" type="number" placeholder="100000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" name="deadline" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicationUrl">Application URL</Label>
                    <Input id="applicationUrl" name="applicationUrl" type="url" placeholder="https://..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grantType">Grant Type</Label>
                    <Select name="grantType" defaultValue="foundation">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="federal">Federal</SelectItem>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="foundation">Foundation</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" defaultValue="medium">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eligibilityRequirements">Eligibility Requirements</Label>
                  <Textarea id="eligibilityRequirements" name="eligibilityRequirements" placeholder="List key eligibility criteria..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="focusAreas">Focus Areas</Label>
                  <Input id="focusAreas" name="focusAreas" placeholder="e.g., Education, Workforce Development, Community" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" placeholder="Additional notes..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewOpportunity(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createOpportunity.isPending}>
                    {createOpportunity.isPending ? "Adding..." : "Add Opportunity"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Deadline Alert Banner */}
        {dashboard?.upcomingDeadlines?.some((opp: any) => {
          const deadline = new Date(opp.deadline);
          const today = new Date();
          const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil <= 7 && daysUntil >= 0;
        }) && (
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-800">Urgent: Grant Deadlines This Week</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dashboard?.upcomingDeadlines?.filter((opp: any) => {
                      const deadline = new Date(opp.deadline);
                      const today = new Date();
                      const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return daysUntil <= 7 && daysUntil >= 0;
                    }).map((opp: any) => {
                      const deadline = new Date(opp.deadline);
                      const today = new Date();
                      const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <Badge key={opp.id} variant="destructive" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {opp.grant_name}: {daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? '1 day' : `${daysUntil} days`}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Opportunities</p>
                  <p className="text-2xl font-bold">{dashboard?.opportunities.total || 0}</p>
                  <p className="text-xs text-muted-foreground">{dashboard?.opportunities.eligible || 0} eligible</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold">{dashboard?.applications.total || 0}</p>
                  <p className="text-xs text-muted-foreground">{dashboard?.applications.inProgress || 0} in progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Awarded</p>
                  <p className="text-2xl font-bold">{dashboard?.applications.awarded || 0}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(dashboard?.applications.totalAwarded)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
                  <p className="text-2xl font-bold">{dashboard?.opportunities.upcomingDeadlines || 0}</p>
                  <p className="text-xs text-muted-foreground">Next 30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboard?.upcomingDeadlines?.length ? (
                      dashboard.upcomingDeadlines.map((opp: any) => (
                        <div key={opp.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{opp.grant_name}</p>
                            <p className="text-sm text-muted-foreground">{opp.funder_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatDate(opp.deadline)}</p>
                            {getPriorityBadge(opp.priority)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No upcoming deadlines</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboard?.recentApplications?.length ? (
                      dashboard.recentApplications.map((app: any) => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{app.project_title}</p>
                            <p className="text-sm text-muted-foreground">{app.funder_name}</p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(app.status)}
                            <p className="text-sm text-muted-foreground mt-1">{formatCurrency(app.requested_amount)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No applications yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Reports */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Upcoming Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboard?.upcomingReports?.length ? (
                      dashboard.upcomingReports.map((report: any) => (
                        <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{report.report_name || `${report.report_type} Report`}</p>
                            <p className="text-sm text-muted-foreground">{report.project_title} - {report.funder_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Due: {formatDate(report.due_date)}</p>
                            {getStatusBadge(report.status)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No upcoming reports</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-4">
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="researching">Researching</SelectItem>
                  <SelectItem value="eligible">Eligible</SelectItem>
                  <SelectItem value="not_eligible">Not Eligible</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="foundation">Foundation</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {opportunities?.map((opp: any) => (
                <Card key={opp.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{opp.grant_name}</h3>
                          {getStatusBadge(opp.status)}
                          {getPriorityBadge(opp.priority)}
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {opp.funder_name}
                        </p>
                        {opp.description && <p className="text-sm">{opp.description}</p>}
                        <div className="flex gap-6 text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(opp.funding_amount_min)} - {formatCurrency(opp.funding_amount_max)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Deadline: {formatDate(opp.deadline)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {opp.status === "eligible" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOpportunityId(opp.id);
                              setShowNewApplication(true);
                            }}
                          >
                            Start Application
                          </Button>
                        )}
                        <Select
                          value={opp.status}
                          onValueChange={(value) =>
                            updateOpportunityStatus.mutate({ id: opp.id, status: value as any })
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="researching">Researching</SelectItem>
                            <SelectItem value="eligible">Eligible</SelectItem>
                            <SelectItem value="not_eligible">Not Eligible</SelectItem>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!opportunities?.length && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No opportunities found</p>
                    <Button className="mt-4" onClick={() => setShowNewOpportunity(true)}>
                      Add First Opportunity
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <div className="grid gap-4">
              {applications?.map((app: any) => (
                <Card key={app.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{app.project_title}</h3>
                          {getStatusBadge(app.status)}
                        </div>
                        <p className="text-muted-foreground">{app.grant_name} - {app.funder_name}</p>
                        <div className="flex gap-6 text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Requested: {formatCurrency(app.requested_amount)}
                          </span>
                          {app.awarded_amount && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Award className="w-4 h-4" />
                              Awarded: {formatCurrency(app.awarded_amount)}
                            </span>
                          )}
                          {app.submitted_date && (
                            <span className="flex items-center gap-1">
                              <Send className="w-4 h-4" />
                              Submitted: {formatDate(app.submitted_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Select
                        value={app.status}
                        onValueChange={(value) =>
                          updateApplicationStatus.mutate({ id: app.id, status: value as any })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">Not Started</SelectItem>
                          <SelectItem value="drafting">Drafting</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="awarded">Awarded</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="withdrawn">Withdrawn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!applications?.length && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No applications yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Mark an opportunity as "Eligible" to start an application
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Researching Column */}
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Researching ({pipeline?.researching?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {pipeline?.researching?.map((opp: any) => (
                    <div key={opp.id} className="p-3 border rounded-lg space-y-2">
                      <p className="font-medium text-sm">{opp.grant_name}</p>
                      <p className="text-xs text-muted-foreground">{opp.funder_name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{formatDate(opp.deadline)}</span>
                        {getPriorityBadge(opp.priority)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Eligible Column */}
              <Card>
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Eligible ({pipeline?.eligible?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {pipeline?.eligible?.map((opp: any) => (
                    <div key={opp.id} className="p-3 border rounded-lg space-y-2">
                      <p className="font-medium text-sm">{opp.grant_name}</p>
                      <p className="text-xs text-muted-foreground">{opp.funder_name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{formatCurrency(opp.funding_amount_max)}</span>
                        <span className="text-xs">{formatDate(opp.deadline)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Applied Column */}
              <Card>
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Send className="w-5 h-5 text-purple-600" />
                    Applied ({pipeline?.applied?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {pipeline?.applied?.map((opp: any) => (
                    <div key={opp.id} className="p-3 border rounded-lg space-y-2">
                      <p className="font-medium text-sm">{opp.grant_name}</p>
                      <p className="text-xs text-muted-foreground">{opp.funder_name}</p>
                      <div className="flex justify-between items-center">
                        {getStatusBadge(opp.application_status || "submitted")}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* New Application Dialog */}
        <Dialog open={showNewApplication} onOpenChange={setShowNewApplication}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Start Application</DialogTitle>
              <DialogDescription>Create a new grant application</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title *</Label>
                <Input id="projectTitle" name="projectTitle" required placeholder="e.g., Workforce Development Initiative" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea id="projectDescription" name="projectDescription" placeholder="Brief description of the project..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestedAmount">Requested Amount ($)</Label>
                  <Input id="requestedAmount" name="requestedAmount" type="number" placeholder="50000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input id="assignedTo" name="assignedTo" placeholder="Team member name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectStartDate">Project Start Date</Label>
                  <Input id="projectStartDate" name="projectStartDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectEndDate">Project End Date</Label>
                  <Input id="projectEndDate" name="projectEndDate" type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowNewApplication(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createApplication.isPending}>
                  {createApplication.isPending ? "Creating..." : "Create Application"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
