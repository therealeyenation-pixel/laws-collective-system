import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  GraduationCap,
  Users,
  TrendingUp,
  Clock,
  Award,
  Star,
  ChevronRight,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  Rocket,
} from "lucide-react";

const LEVEL_LABELS: Record<string, string> = {
  specialist_i: "Specialist I",
  specialist_ii: "Specialist II",
  specialist_iii: "Specialist III",
  associate: "Associate",
};

const LEVEL_COLORS: Record<string, string> = {
  specialist_i: "bg-blue-100 text-blue-800",
  specialist_ii: "bg-purple-100 text-purple-800",
  specialist_iii: "bg-amber-100 text-amber-800",
  associate: "bg-green-100 text-green-800",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  part_time_20: "Part-Time (20 hrs)",
  part_time_25: "Part-Time (25 hrs)",
  part_time_30: "Part-Time (30 hrs)",
  full_time: "Full-Time (40 hrs)",
};

const EDUCATION_LABELS: Record<string, string> = {
  in_high_school: "In High School",
  high_school_diploma: "HS Diploma",
  academy_enrolled: "Academy Enrolled",
  academy_graduate: "Academy Graduate",
  ged: "GED",
  college_enrolled: "College Enrolled",
  college_graduate: "College Graduate",
};

export default function SpecialistTracks() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  
  const { data: tracks, refetch: refetchTracks } = trpc.specialistTracks.getAllTracks.useQuery();
  const { data: stats } = trpc.specialistTracks.getStats.useQuery();
  
  const createTrack = trpc.specialistTracks.createTrack.useMutation({
    onSuccess: () => {
      toast.success("Specialist track created");
      setIsCreateOpen(false);
      refetchTracks();
    },
    onError: (err) => toast.error(err.message),
  });

  const advanceLevel = trpc.specialistTracks.advanceLevel.useMutation({
    onSuccess: (data) => {
      toast.success(`Advanced to ${LEVEL_LABELS[data.newLevel]}! Token bonus: ${data.tokenBonus}`);
      refetchTracks();
    },
    onError: (err) => toast.error(err.message),
  });

  const createAssessment = trpc.specialistTracks.createAssessment.useMutation({
    onSuccess: (data) => {
      toast.success(`Assessment completed. Score: ${data.totalScore}/100`);
      setIsAssessmentOpen(false);
      refetchTracks();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreateTrack = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createTrack.mutate({
      fullName: formData.get("fullName") as string,
      candidateType: formData.get("candidateType") as any,
      familyMemberId: formData.get("familyMemberId") as string || undefined,
      dateOfBirth: formData.get("dateOfBirth") as string || undefined,
      hasWorkPermit: formData.get("hasWorkPermit") === "true",
      educationStatus: formData.get("educationStatus") as any,
      entityName: formData.get("entityName") as string || undefined,
      department: formData.get("department") as string || undefined,
      positionTitle: formData.get("positionTitle") as string || undefined,
      supervisorName: formData.get("supervisorName") as string || undefined,
      hourlyRate: formData.get("hourlyRate") ? parseFloat(formData.get("hourlyRate") as string) : undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleCreateAssessment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTrack) return;
    
    const formData = new FormData(e.currentTarget);
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    
    createAssessment.mutate({
      specialistTrackId: selectedTrack.id,
      assessmentPeriod: `${now.getFullYear()}-Q${quarter}`,
      assessorName: formData.get("assessorName") as string || undefined,
      academyModulesCompleted: parseInt(formData.get("academyModulesCompleted") as string) || 0,
      academyModulesTarget: 3,
      simulatorSessionsCompleted: parseInt(formData.get("simulatorSessionsCompleted") as string) || 0,
      simulatorAverageScore: parseInt(formData.get("simulatorAverageScore") as string) || 0,
      attendanceRating: parseInt(formData.get("attendanceRating") as string) || 3,
      punctualityRating: parseInt(formData.get("punctualityRating") as string) || 3,
      initiativeRating: parseInt(formData.get("initiativeRating") as string) || 3,
      teamworkRating: parseInt(formData.get("teamworkRating") as string) || 3,
      qualityOfWorkRating: parseInt(formData.get("qualityOfWorkRating") as string) || 3,
      supervisorComments: formData.get("supervisorComments") as string || undefined,
      tokensEarned: parseInt(formData.get("tokensEarned") as string) || 0,
      tokensSpentWisely: formData.get("tokensSpentWisely") === "true",
      tokenSavingsRate: parseFloat(formData.get("tokenSavingsRate") as string) || 0,
      budgetAdherence: formData.get("budgetAdherence") === "true",
      expenseReportingAccuracy: parseInt(formData.get("expenseReportingAccuracy") as string) || 0,
      financialGoalsMet: parseInt(formData.get("financialGoalsMet") as string) || 0,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Specialist Tracks</h1>
            <p className="text-muted-foreground mt-1">
              Entry-level career progression program for family and community members
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Track
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Specialist Track</DialogTitle>
                <DialogDescription>
                  Enroll a new candidate in the entry-level specialist program
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTrack} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" name="fullName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="candidateType">Candidate Type *</Label>
                    <Select name="candidateType" defaultValue="external">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Family Member</SelectItem>
                        <SelectItem value="external">External Candidate</SelectItem>
                        <SelectItem value="academy_graduate">Academy Graduate</SelectItem>
                        <SelectItem value="community">Community Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" name="dateOfBirth" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hasWorkPermit">Work Permit (if under 18)</Label>
                    <Select name="hasWorkPermit" defaultValue="false">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="educationStatus">Education Status *</Label>
                    <Select name="educationStatus" defaultValue="high_school_diploma">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_high_school">In High School</SelectItem>
                        <SelectItem value="high_school_diploma">HS Diploma</SelectItem>
                        <SelectItem value="academy_enrolled">Academy Enrolled</SelectItem>
                        <SelectItem value="academy_graduate">Academy Graduate</SelectItem>
                        <SelectItem value="ged">GED</SelectItem>
                        <SelectItem value="college_enrolled">College Enrolled</SelectItem>
                        <SelectItem value="college_graduate">College Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="familyMemberId">Family Member ID (if applicable)</Label>
                    <Input id="familyMemberId" name="familyMemberId" placeholder="House ID or family reference" />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">Position Assignment</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="entityName">Entity</Label>
                      <Input id="entityName" name="entityName" placeholder="e.g., L.A.W.S. Collective" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" name="department" placeholder="e.g., Operations" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="positionTitle">Position Title</Label>
                      <Input id="positionTitle" name="positionTitle" placeholder="e.g., Operations Specialist I" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supervisorName">Supervisor</Label>
                      <Input id="supervisorName" name="supervisorName" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Starting Hourly Rate ($)</Label>
                      <Input id="hourlyRate" name="hourlyRate" type="number" step="0.01" placeholder="15.00" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" placeholder="Additional notes about this candidate..." />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTrack.isPending}>
                    {createTrack.isPending ? "Creating..." : "Create Track"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Tracks</p>
                  <p className="text-2xl font-bold">{stats?.activeTracks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Eligibility</p>
                  <p className="text-2xl font-bold">{stats?.pendingEligibility || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Graduated</p>
                  <p className="text-2xl font-bold">{stats?.graduated || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Rocket className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accelerated</p>
                  <p className="text-2xl font-bold">{stats?.acceleratedTracks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(stats?.byLevel || {}).map(([level, count]) => (
                <div key={level} className="text-center p-4 bg-secondary/30 rounded-lg">
                  <Badge className={LEVEL_COLORS[level]}>{LEVEL_LABELS[level]}</Badge>
                  <p className="text-3xl font-bold mt-2">{count as number}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tracks Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Specialist Tracks</CardTitle>
            <CardDescription>
              Manage entry-level career progression for all candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Maturity Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks?.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{track.fullName}</p>
                        <p className="text-sm text-muted-foreground">{track.positionTitle || "Unassigned"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {track.familyMemberId?.startsWith("ext-") ? "External" : "Family"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={LEVEL_COLORS[track.currentLevel]}>
                        {LEVEL_LABELS[track.currentLevel]}
                      </Badge>
                      {track.acceleratedTrack && (
                        <Rocket className="w-4 h-4 text-purple-500 inline ml-1" />
                      )}
                    </TableCell>
                    <TableCell>{EMPLOYMENT_LABELS[track.employmentType]}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={track.maturityScore} className="w-20" />
                        <span className="text-sm">{track.maturityScore}/100</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={track.status === "active" ? "default" : "secondary"}>
                        {track.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTrack(track);
                            setIsAssessmentOpen(true);
                          }}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        {track.currentLevel !== "associate" && track.maturityScore >= 60 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => advanceLevel.mutate({ trackId: track.id })}
                          >
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!tracks || tracks.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No specialist tracks found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Assessment Dialog */}
        <Dialog open={isAssessmentOpen} onOpenChange={setIsAssessmentOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Maturity Assessment</DialogTitle>
              <DialogDescription>
                Quarterly assessment for {selectedTrack?.fullName}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAssessment} className="space-y-6">
              {/* Academy Performance */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Academy Performance (0-20 pts)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modules Completed</Label>
                    <Input name="academyModulesCompleted" type="number" defaultValue="0" min="0" />
                  </div>
                </div>
              </div>

              {/* Simulator Performance */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Simulator Performance (0-20 pts)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sessions Completed</Label>
                    <Input name="simulatorSessionsCompleted" type="number" defaultValue="0" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Average Score</Label>
                    <Input name="simulatorAverageScore" type="number" defaultValue="0" min="0" max="100" />
                  </div>
                </div>
              </div>

              {/* Supervisor Evaluation */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Supervisor Evaluation (0-25 pts)
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {["attendance", "punctuality", "initiative", "teamwork", "qualityOfWork"].map((rating) => (
                    <div key={rating} className="space-y-2">
                      <Label className="text-xs capitalize">{rating.replace(/([A-Z])/g, " $1")}</Label>
                      <Select name={`${rating}Rating`} defaultValue="3">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Supervisor Comments</Label>
                  <Textarea name="supervisorComments" />
                </div>
                <div className="space-y-2">
                  <Label>Assessor Name</Label>
                  <Input name="assessorName" />
                </div>
              </div>

              {/* Token Economy */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Token Economy (0-15 pts)
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tokens Earned</Label>
                    <Input name="tokensEarned" type="number" defaultValue="0" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Spent Wisely?</Label>
                    <Select name="tokensSpentWisely" defaultValue="false">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Savings Rate (%)</Label>
                    <Input name="tokenSavingsRate" type="number" defaultValue="0" min="0" max="100" />
                  </div>
                </div>
              </div>

              {/* Fiscal Responsibility */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Fiscal Responsibility (0-20 pts)
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Budget Adherence</Label>
                    <Select name="budgetAdherence" defaultValue="false">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reporting Accuracy (%)</Label>
                    <Input name="expenseReportingAccuracy" type="number" defaultValue="0" min="0" max="100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Goals Met</Label>
                    <Input name="financialGoalsMet" type="number" defaultValue="0" min="0" max="3" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAssessmentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAssessment.isPending}>
                  {createAssessment.isPending ? "Submitting..." : "Submit Assessment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
