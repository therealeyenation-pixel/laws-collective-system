import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Users,
  Building2,
  Clock,
  Calendar,
  TrendingUp,
  Shield,
  Star,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Settings,
  Briefcase,
  GraduationCap,
  Target,
  Milestone,
  Lock,
  Unlock,
} from "lucide-react";

export default function CareerPathPlanner() {
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);

  // Fetch data
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = trpc.workforceDevelopment.getWorkforceDashboard.useQuery();
  const { data: careerTracks } = trpc.workforceDevelopment.getCareerTracks.useQuery();
  const { data: allTracks, isLoading: tracksLoading, refetch: refetchTracks } = trpc.workforceDevelopment.getAllCareerTracks.useQuery(
    selectedTrack !== "all" || selectedPhase !== "all"
      ? {
          trackType: selectedTrack !== "all" ? selectedTrack as any : undefined,
          phase: selectedPhase !== "all" ? selectedPhase : undefined,
        }
      : undefined
  );

  // Mutations
  const updatePhaseMutation = trpc.workforceDevelopment.updateSystemPhase.useMutation({
    onSuccess: () => {
      toast.success("System phase updated successfully");
      refetchDashboard();
      setShowPhaseDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to update phase: ${error.message}`);
    },
  });

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "build":
        return "bg-amber-500";
      case "stabilize":
        return "bg-blue-500";
      case "operations":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTrackPhaseColor = (phase: string) => {
    switch (phase) {
      case "onboarding":
        return "bg-blue-100 text-blue-800";
      case "year_1":
        return "bg-purple-100 text-purple-800";
      case "year_2":
        return "bg-indigo-100 text-indigo-800";
      case "transition_eligible":
        return "bg-green-100 text-green-800";
      case "in_transition":
        return "bg-amber-100 text-amber-800";
      case "transitioned":
        return "bg-emerald-100 text-emerald-800";
      case "opted_out":
        return "bg-gray-100 text-gray-800";
      case "permanent":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPhase = (phase: string) => {
    return phase
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (dashboardLoading) {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Career Path Planner</h1>
            <p className="text-muted-foreground mt-1">
              Workforce development and transition management
            </p>
          </div>
          <Dialog open={showPhaseDialog} onOpenChange={setShowPhaseDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                System Phase: {formatPhase(dashboard?.systemPhase || "build")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>System Phase Control</DialogTitle>
                <DialogDescription>
                  Change the system phase to control transition availability. This affects all employees.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-3">
                  {["build", "stabilize", "operations"].map((phase) => (
                    <Card
                      key={phase}
                      className={`cursor-pointer transition-all ${
                        dashboard?.systemPhase === phase
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => updatePhaseMutation.mutate({ phase: phase as any })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getPhaseColor(phase)}`} />
                          <div className="flex-1">
                            <p className="font-medium capitalize">{phase} Phase</p>
                            <p className="text-sm text-muted-foreground">
                              {phase === "build" && "Infrastructure development. No transitions allowed."}
                              {phase === "stabilize" && "Testing and refinement. Limited transitions."}
                              {phase === "operations" && "Full operations. Standard transitions enabled."}
                            </p>
                          </div>
                          {phase === "operations" ? (
                            <Unlock className="w-5 h-5 text-green-500" />
                          ) : (
                            <Lock className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* System Status Banner */}
        <Card className={`border-l-4 ${dashboard?.transitionsEnabled ? "border-l-green-500 bg-green-50" : "border-l-amber-500 bg-amber-50"}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {dashboard?.transitionsEnabled ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                )}
                <div>
                  <p className="font-medium">
                    System Phase: <span className="capitalize">{dashboard?.systemPhase}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dashboard?.transitionsEnabled
                      ? "Transitions are enabled. Eligible employees can begin the contractor transition process."
                      : "Transitions are currently disabled. All employees remain in employee status."}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Minimum Tenure</p>
                <p className="font-medium">{dashboard?.minTenureManager} months</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Founding Members</p>
                  <p className="text-2xl font-bold">{dashboard?.stats.foundingMembers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transition Eligible</p>
                  <p className="text-2xl font-bold">{dashboard?.stats.transitionEligible || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-100">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transitioned</p>
                  <p className="text-2xl font-bold">{dashboard?.stats.transitioned || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total in Pipeline</p>
                  <p className="text-2xl font-bold">
                    {Object.values(dashboard?.stats.byPhase || {}).reduce((a: number, b: any) => a + (b || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tracks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tracks" className="gap-2">
              <Users className="w-4 h-4" />
              Career Tracks
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Milestone className="w-4 h-4" />
              Timeline View
            </TabsTrigger>
            <TabsTrigger value="definitions" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Track Definitions
            </TabsTrigger>
          </TabsList>

          {/* Career Tracks Tab */}
          <TabsContent value="tracks" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-1 block">Track Type</label>
                    <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Tracks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tracks</SelectItem>
                        <SelectItem value="architect_manager">Architect/Manager</SelectItem>
                        <SelectItem value="coordinator_to_manager">Coordinator to Manager</SelectItem>
                        <SelectItem value="permanent_staff">Permanent Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-1 block">Current Phase</label>
                    <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Phases" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Phases</SelectItem>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="year_1">Year 1</SelectItem>
                        <SelectItem value="year_2">Year 2</SelectItem>
                        <SelectItem value="transition_eligible">Transition Eligible</SelectItem>
                        <SelectItem value="in_transition">In Transition</SelectItem>
                        <SelectItem value="transitioned">Transitioned</SelectItem>
                        <SelectItem value="opted_out">Opted Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracks Table */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Career Tracks</CardTitle>
                <CardDescription>
                  View and manage employee career progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tracksLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : !allTracks || allTracks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No career tracks found</p>
                    <p className="text-sm">Assign career tracks to employees to begin tracking their progression</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Track</TableHead>
                        <TableHead>Current Phase</TableHead>
                        <TableHead>Tenure</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allTracks.map((track: any) => (
                        <TableRow key={track.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {track.firstName} {track.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{track.position}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {track.isFoundingMember && (
                                <Star className="w-4 h-4 text-amber-500" />
                              )}
                              <span className="text-sm">{track.trackInfo?.label || track.trackType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTrackPhaseColor(track.currentPhase)}>
                              {formatPhase(track.currentPhase)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{track.tenure?.years}y {track.tenure?.months % 12}m</p>
                              <p className="text-muted-foreground">{track.tenure?.months} months total</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-24">
                              <Progress value={track.progress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">{track.progress}%</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {track.boardEligible && (
                              <Badge variant="outline" className="gap-1">
                                <Shield className="w-3 h-3" />
                                Board Eligible
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline View Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Career Journey Timeline</CardTitle>
                <CardDescription>
                  Visual representation of the 24-month employee-to-contractor journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

                  {/* Timeline Items */}
                  <div className="space-y-8">
                    {/* Onboarding */}
                    <div className="relative flex items-start gap-4 pl-16">
                      <div className="absolute left-6 w-4 h-4 rounded-full bg-blue-500 border-4 border-background" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Onboarding</h4>
                        <p className="text-sm text-muted-foreground">Month 0-1</p>
                        <p className="text-sm mt-2">
                          New hire orientation, policy acknowledgment, initial training, and career track assignment.
                        </p>
                      </div>
                    </div>

                    {/* Year 1 */}
                    <div className="relative flex items-start gap-4 pl-16">
                      <div className="absolute left-6 w-4 h-4 rounded-full bg-purple-500 border-4 border-background" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Year 1 - Foundation Building</h4>
                        <p className="text-sm text-muted-foreground">Month 1-12</p>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm">
                            <strong>Architects:</strong> Build system infrastructure, create processes, document procedures.
                          </p>
                          <p className="text-sm">
                            <strong>Coordinators:</strong> Learn operations, complete training modules, support team functions.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Year 2 */}
                    <div className="relative flex items-start gap-4 pl-16">
                      <div className="absolute left-6 w-4 h-4 rounded-full bg-indigo-500 border-4 border-background" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Year 2 - Leadership & Preparation</h4>
                        <p className="text-sm text-muted-foreground">Month 12-24</p>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm">
                            <strong>Architects:</strong> Stabilize systems, mentor new hires, refine documentation.
                          </p>
                          <p className="text-sm">
                            <strong>Coordinators (now Managers):</strong> Lead teams, manage projects, complete business training.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Transition Eligible */}
                    <div className="relative flex items-start gap-4 pl-16">
                      <div className="absolute left-6 w-4 h-4 rounded-full bg-green-500 border-4 border-background" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Transition Eligible</h4>
                        <p className="text-sm text-muted-foreground">Month 24+</p>
                        <p className="text-sm mt-2">
                          Complete Business Setup Simulator, form LLC, obtain EIN, open business bank account, sign contractor agreement.
                        </p>
                      </div>
                    </div>

                    {/* Transitioned */}
                    <div className="relative flex items-start gap-4 pl-16">
                      <div className="absolute left-6 w-4 h-4 rounded-full bg-emerald-500 border-4 border-background" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Contractor Status</h4>
                        <p className="text-sm text-muted-foreground">Post-Transition</p>
                        <p className="text-sm mt-2">
                          Independent contractor with own LLC, invoicing through L.A.W.S. Business OS, eligible for board membership (Architects only).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Track Definitions Tab */}
          <TabsContent value="definitions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Architect/Manager Track */}
              <Card className="border-t-4 border-t-amber-500">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <CardTitle className="text-lg">Architect/Manager Track</CardTitle>
                  </div>
                  <CardDescription>Founding team members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Minimum Tenure</p>
                    <p className="text-2xl font-bold text-primary">24 months</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Characteristics</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Board eligible after transition
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Mentor eligible
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Indefinite contractor contracts
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Equity stake eligible
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Coordinator to Manager Track */}
              <Card className="border-t-4 border-t-blue-500">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-lg">Coordinator → Manager</CardTitle>
                  </div>
                  <CardDescription>Pipeline employees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Minimum Tenure</p>
                    <p className="text-2xl font-bold text-primary">24 months</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Journey</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Year 1: Coordinator role
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Year 2: Promoted to Manager
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Month 24+: Transition eligible
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Renewable contractor contracts
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Permanent Staff Track */}
              <Card className="border-t-4 border-t-slate-500">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-slate-500" />
                    <CardTitle className="text-lg">Permanent Staff</CardTitle>
                  </div>
                  <CardDescription>Opted-out employees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Minimum Tenure</p>
                    <p className="text-2xl font-bold text-muted-foreground">N/A</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Characteristics</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Permanent W-2 employment
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Standard benefits package
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Capped growth potential
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        No equity eligibility
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
