import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  Vote,
  DollarSign,
  Plus,
  Crown,
  Shield,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PieChart,
  FileText,
  Gavel,
  Wallet,
} from "lucide-react";

export default function BoardGovernance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showScheduleMeetingDialog, setShowScheduleMeetingDialog] = useState(false);
  const [showCreateResolutionDialog, setShowCreateResolutionDialog] = useState(false);

  // Queries
  const { data: dashboard, isLoading: loadingDashboard } = trpc.boardGovernance.getGovernanceDashboard.useQuery();
  const { data: members, isLoading: loadingMembers } = trpc.boardGovernance.getBoardMembers.useQuery();
  const { data: meetings, isLoading: loadingMeetings } = trpc.boardGovernance.getBoardMeetings.useQuery();
  const { data: resolutions, isLoading: loadingResolutions } = trpc.boardGovernance.getResolutions.useQuery();
  const { data: ownership, isLoading: loadingOwnership } = trpc.boardGovernance.getOwnershipSummary.useQuery();
  const { data: distributions, isLoading: loadingDistributions } = trpc.boardGovernance.getDistributions.useQuery();

  // Mutations
  const addMemberMutation = trpc.boardGovernance.addBoardMember.useMutation({
    onSuccess: () => {
      toast.success("Board member added successfully");
      setShowAddMemberDialog(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const scheduleMeetingMutation = trpc.boardGovernance.scheduleMeeting.useMutation({
    onSuccess: () => {
      toast.success("Meeting scheduled successfully");
      setShowScheduleMeetingDialog(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const createResolutionMutation = trpc.boardGovernance.createResolution.useMutation({
    onSuccess: () => {
      toast.success("Resolution created successfully");
      setShowCreateResolutionDialog(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const positionLabels: Record<string, string> = {
    chair: "Chair",
    vice_chair: "Vice Chair",
    secretary: "Secretary",
    treasurer: "Treasurer",
    member: "Member",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    emeritus: "bg-purple-100 text-purple-800",
    scheduled: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-800",
    proposed: "bg-blue-100 text-blue-800",
    voting: "bg-yellow-100 text-yellow-800",
    passed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    tabled: "bg-orange-100 text-orange-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
  };

  if (loadingDashboard) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <h1 className="text-3xl font-bold text-foreground">Board Governance</h1>
            <p className="text-muted-foreground mt-1">
              Manage board members, meetings, resolutions, and distributions
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Shield className="w-4 h-4 mr-1" />
            Internal Use Only
          </Badge>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Board Members</p>
                  <p className="text-2xl font-bold">{dashboard?.members.total || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboard?.members.founding || 0} founding
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <PieChart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ownership Allocated</p>
                  <p className="text-2xl font-bold">{dashboard?.members.ownershipAllocated || 0}%</p>
                  <p className="text-xs text-muted-foreground">
                    {100 - (dashboard?.members.ownershipAllocated || 0)}% unallocated
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Vote className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Resolutions</p>
                  <p className="text-2xl font-bold">{dashboard?.resolutions.pending || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboard?.meetings.upcoming || 0} upcoming meetings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-100">
                  <Wallet className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Distributions</p>
                  <p className="text-2xl font-bold">{dashboard?.distributions.pending || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    ${(dashboard?.distributions.pendingAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="resolutions">Resolutions</TabsTrigger>
            <TabsTrigger value="distributions">Distributions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ownership Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Ownership Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingOwnership ? (
                    <div className="h-40 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ownership?.members.map((member: any) => (
                        <div key={member.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {member.name}
                              {member.isFoundingMember && (
                                <Crown className="w-3 h-3 text-amber-500" />
                              )}
                            </span>
                            <span className="font-medium">{member.ownershipPercentage}%</span>
                          </div>
                          <Progress value={member.ownershipPercentage} className="h-2" />
                        </div>
                      ))}
                      {(ownership?.unallocated || 0) > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Unallocated</span>
                            <span>{ownership?.unallocated}%</span>
                          </div>
                          <Progress value={ownership?.unallocated} className="h-2 bg-gray-200" />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Resolutions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="w-5 h-5" />
                    Recent Resolutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboard?.resolutions.recent.map((resolution: any) => (
                      <div key={resolution.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <div>
                          <p className="font-medium text-sm">{resolution.resolutionNumber}</p>
                          <p className="text-xs text-muted-foreground">{resolution.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {resolution.status === "passed" && (
                            <span className="text-xs text-green-600">
                              {resolution.votesFor}-{resolution.votesAgainst}
                            </span>
                          )}
                          <Badge className={statusColors[resolution.status]}>
                            {resolution.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {(!dashboard?.resolutions.recent || dashboard.resolutions.recent.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No resolutions yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Board Members</h3>
              <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Board Member</DialogTitle>
                    <DialogDescription>
                      Add a new member to the board of directors
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      addMemberMutation.mutate({
                        name: formData.get("name") as string,
                        email: formData.get("email") as string,
                        position: formData.get("position") as any,
                        ownershipPercentage: parseFloat(formData.get("ownership") as string) || 0,
                        votingRights: formData.get("votingRights") === "true",
                        termStart: formData.get("termStart") as string,
                        isFoundingMember: formData.get("isFoundingMember") === "true",
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Select name="position" defaultValue="member">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chair">Chair</SelectItem>
                            <SelectItem value="vice_chair">Vice Chair</SelectItem>
                            <SelectItem value="secretary">Secretary</SelectItem>
                            <SelectItem value="treasurer">Treasurer</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownership">Ownership %</Label>
                        <Input id="ownership" name="ownership" type="number" min="0" max="100" step="0.01" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="termStart">Term Start</Label>
                        <Input id="termStart" name="termStart" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="votingRights">Voting Rights</Label>
                        <Select name="votingRights" defaultValue="true">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isFoundingMember">Founding Member</Label>
                      <Select name="isFoundingMember" defaultValue="false">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes - Founding Member</SelectItem>
                          <SelectItem value="false">No - Regular Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={addMemberMutation.isPending}>
                        {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {loadingMembers ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Ownership</TableHead>
                        <TableHead>Voting</TableHead>
                        <TableHead>Term Start</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members?.map((member: any) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {member.name?.charAt(0) || "?"}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium flex items-center gap-1">
                                  {member.name}
                                  {member.isFoundingMember && (
                                    <Crown className="w-3 h-3 text-amber-500" />
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{positionLabels[member.position] || member.position}</TableCell>
                          <TableCell>{member.ownershipPercentage}%</TableCell>
                          <TableCell>
                            {member.votingRights ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(member.termStart).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[member.status]}>
                              {member.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!members || members.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No board members yet. Add your first member to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Board Meetings</h3>
              <Dialog open={showScheduleMeetingDialog} onOpenChange={setShowScheduleMeetingDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Board Meeting</DialogTitle>
                    <DialogDescription>
                      Schedule a new board meeting
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      scheduleMeetingMutation.mutate({
                        title: formData.get("title") as string,
                        meetingType: formData.get("meetingType") as any,
                        scheduledDate: formData.get("scheduledDate") as string,
                        location: formData.get("location") as string || undefined,
                        virtualLink: formData.get("virtualLink") as string || undefined,
                        agenda: formData.get("agenda") as string || undefined,
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="title">Meeting Title</Label>
                      <Input id="title" name="title" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="meetingType">Meeting Type</Label>
                        <Select name="meetingType" defaultValue="regular">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="special">Special</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduledDate">Date & Time</Label>
                        <Input id="scheduledDate" name="scheduledDate" type="datetime-local" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location (Optional)</Label>
                        <Input id="location" name="location" placeholder="Physical location" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="virtualLink">Virtual Link (Optional)</Label>
                        <Input id="virtualLink" name="virtualLink" placeholder="Zoom/Meet link" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agenda">Agenda (Optional)</Label>
                      <Textarea id="agenda" name="agenda" placeholder="Meeting agenda items..." />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={scheduleMeetingMutation.isPending}>
                        {scheduleMeetingMutation.isPending ? "Scheduling..." : "Schedule Meeting"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {loadingMeetings ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Meeting</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meetings?.map((meeting: any) => (
                        <TableRow key={meeting.id}>
                          <TableCell className="font-medium">{meeting.title}</TableCell>
                          <TableCell className="capitalize">{meeting.meetingType}</TableCell>
                          <TableCell>
                            {new Date(meeting.scheduledDate).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {meeting.virtualLink ? (
                              <a href={meeting.virtualLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Virtual
                              </a>
                            ) : meeting.location || "TBD"}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[meeting.status]}>
                              {meeting.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!meetings || meetings.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No meetings scheduled yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resolutions Tab */}
          <TabsContent value="resolutions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Board Resolutions</h3>
              <Dialog open={showCreateResolutionDialog} onOpenChange={setShowCreateResolutionDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Create Resolution
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Resolution</DialogTitle>
                    <DialogDescription>
                      Draft a new board resolution for voting
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createResolutionMutation.mutate({
                        resolutionNumber: formData.get("resolutionNumber") as string,
                        title: formData.get("title") as string,
                        description: formData.get("description") as string,
                        category: formData.get("category") as any,
                        requiredVotePercentage: parseInt(formData.get("requiredVotePercentage") as string) || 51,
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="resolutionNumber">Resolution Number</Label>
                        <Input id="resolutionNumber" name="resolutionNumber" placeholder="RES-2024-001" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" defaultValue="operational">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="financial">Financial</SelectItem>
                            <SelectItem value="operational">Operational</SelectItem>
                            <SelectItem value="governance">Governance</SelectItem>
                            <SelectItem value="personnel">Personnel</SelectItem>
                            <SelectItem value="strategic">Strategic</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requiredVotePercentage">Required Vote % to Pass</Label>
                      <Input id="requiredVotePercentage" name="requiredVotePercentage" type="number" min="50" max="100" defaultValue="51" />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createResolutionMutation.isPending}>
                        {createResolutionMutation.isPending ? "Creating..." : "Create Resolution"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {loadingResolutions ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resolution</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Votes</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resolutions?.map((resolution: any) => (
                        <TableRow key={resolution.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{resolution.resolutionNumber}</p>
                              <p className="text-sm text-muted-foreground">{resolution.title}</p>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{resolution.category}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-green-600">{resolution.votesFor || 0} For</span>
                              <span className="text-red-600">{resolution.votesAgainst || 0} Against</span>
                            </div>
                          </TableCell>
                          <TableCell>{resolution.requiredVotePercentage}%</TableCell>
                          <TableCell>
                            <Badge className={statusColors[resolution.status]}>
                              {resolution.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!resolutions || resolutions.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No resolutions yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distributions Tab */}
          <TabsContent value="distributions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Member Distributions</h3>
              <Button variant="outline" onClick={() => toast.info("Distribution creation coming soon")}>
                <DollarSign className="w-4 h-4 mr-2" />
                Create Distribution
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                {loadingDistributions ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Gross</TableHead>
                        <TableHead>Net</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributions?.map((dist: any) => (
                        <TableRow key={dist.id}>
                          <TableCell className="font-medium">{dist.memberName}</TableCell>
                          <TableCell className="capitalize">{dist.distributionType}</TableCell>
                          <TableCell>
                            {dist.fiscalYear} {dist.fiscalQuarter ? `Q${dist.fiscalQuarter}` : ""}
                          </TableCell>
                          <TableCell>${(dist.grossAmount || 0).toLocaleString()}</TableCell>
                          <TableCell>${(dist.netAmount || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[dist.status]}>
                              {dist.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!distributions || distributions.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No distributions recorded yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
