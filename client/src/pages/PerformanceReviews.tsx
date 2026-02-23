import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, ClipboardCheck, User, Calendar, Star, CheckCircle, Users, MessageSquare, Send } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  self_assessment: "bg-blue-100 text-blue-800",
  manager_review: "bg-yellow-100 text-yellow-800",
  calibration: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  acknowledged: "bg-emerald-100 text-emerald-800",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  self_assessment: "Self Assessment",
  manager_review: "Manager Review",
  calibration: "Calibration",
  completed: "Completed",
  acknowledged: "Acknowledged",
};

export default function PerformanceReviews() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("reviews");
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackReviewers, setFeedbackReviewers] = useState<Array<{name: string; email: string; relationship: string}>>([]);
  const [newReviewerName, setNewReviewerName] = useState("");
  const [newReviewerEmail, setNewReviewerEmail] = useState("");
  const [newReviewerRelationship, setNewReviewerRelationship] = useState("peer");
  
  // Form state
  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [department, setDepartment] = useState("");
  const [reviewPeriod, setReviewPeriod] = useState(new Date().getFullYear().toString());
  const [reviewType, setReviewType] = useState<"annual" | "quarterly" | "probationary" | "project">("annual");
  const [reviewerName, setReviewerName] = useState("");

  const { data: reviews, isLoading, refetch } = trpc.performanceReviews.list.useQuery();
  const { data: reviewDetails } = trpc.performanceReviews.getById.useQuery(
    { id: selectedReview! },
    { enabled: !!selectedReview }
  );

  const createMutation = trpc.performanceReviews.create.useMutation({
    onSuccess: () => {
      toast.success("Performance review created");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create review");
    },
  });

  const resetForm = () => {
    setEmployeeName("");
    setEmployeeRole("");
    setDepartment("");
    setReviewPeriod(new Date().getFullYear().toString());
    setReviewType("annual");
    setReviewerName("");
  };

  const handleCreate = () => {
    if (!employeeName.trim()) {
      toast.error("Employee name is required");
      return;
    }
    if (!reviewPeriod.trim()) {
      toast.error("Review period is required");
      return;
    }
    
    createMutation.mutate({
      employeeId: 1,
      employeeName,
      employeeRole: employeeRole || undefined,
      department: department || undefined,
      reviewPeriod,
      reviewType,
      reviewerName: reviewerName || undefined,
    });
  };

  const getRatingStars = (rating: number | null | undefined) => {
    if (!rating) return "—";
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Performance Reviews</h1>
            <p className="text-muted-foreground">Annual and quarterly employee performance evaluations</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Performance Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Employee Name</Label>
                  <Input
                    placeholder="Enter employee name"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role/Position</Label>
                    <Input
                      placeholder="Job title"
                      value={employeeRole}
                      onChange={(e) => setEmployeeRole(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      placeholder="Department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Review Period</Label>
                    <Input
                      placeholder="e.g., 2025 or Q1 2025"
                      value={reviewPeriod}
                      onChange={(e) => setReviewPeriod(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Review Type</Label>
                    <Select value={reviewType} onValueChange={(v) => setReviewType(v as typeof reviewType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="probationary">Probationary</SelectItem>
                        <SelectItem value="project">Project-Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reviewer/Manager Name</Label>
                  <Input
                    placeholder="Manager conducting the review"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Review"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Reviews
              </CardTitle>
              <CardDescription>Select a review to view details</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : !reviews?.length ? (
                <div className="text-center py-8">
                  <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
                    Create First Review
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedReview === review.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedReview(review.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{review.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{review.employeeRole || "No role"}</p>
                        </div>
                        <Badge className={statusColors[review.status]}>
                          {statusLabels[review.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {review.reviewPeriod}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Select a Review
              </CardTitle>
              <CardDescription>Click on a review from the list to view details</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedReview ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Select a review from the list to view details</p>
                </div>
              ) : !reviewDetails ? (
                <div className="text-center py-8 text-muted-foreground">Loading review details...</div>
              ) : (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="self">Self Assessment</TabsTrigger>
                    <TabsTrigger value="manager">Manager Review</TabsTrigger>
                    <TabsTrigger value="360feedback">360° Feedback</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Employee</Label>
                        <p className="font-medium">{reviewDetails.employeeName}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Role</Label>
                        <p className="font-medium">{reviewDetails.employeeRole || "—"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Department</Label>
                        <p className="font-medium">{reviewDetails.department || "—"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Review Period</Label>
                        <p className="font-medium">{reviewDetails.reviewPeriod}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Reviewer</Label>
                        <p className="font-medium">{reviewDetails.reviewerName || "—"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <Badge className={statusColors[reviewDetails.status]}>
                          {statusLabels[reviewDetails.status]}
                        </Badge>
                      </div>
                    </div>

                    {reviewDetails.overallRating && (
                      <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium">Overall Rating:</span>
                          <span className="text-yellow-500">{getRatingStars(reviewDetails.overallRating)}</span>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="self" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground">Self Performance Rating</Label>
                        <p className="text-yellow-500">{getRatingStars(reviewDetails.selfPerformanceRating)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Accomplishments</Label>
                        <p className="text-sm">{reviewDetails.selfAccomplishments || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Challenges</Label>
                        <p className="text-sm">{reviewDetails.selfChallenges || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Development Areas</Label>
                        <p className="text-sm">{reviewDetails.selfDevelopmentAreas || "Not provided"}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="manager" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground">Manager Rating</Label>
                        <p className="text-yellow-500">{getRatingStars(reviewDetails.managerPerformanceRating)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Feedback</Label>
                        <p className="text-sm">{reviewDetails.managerFeedback || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Strengths</Label>
                        <p className="text-sm">{reviewDetails.managerStrengths || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Improvement Areas</Label>
                        <p className="text-sm">{reviewDetails.managerImprovementAreas || "Not provided"}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        {[
                          { label: "Quality of Work", value: reviewDetails.qualityOfWork },
                          { label: "Productivity", value: reviewDetails.productivity },
                          { label: "Communication", value: reviewDetails.communication },
                          { label: "Teamwork", value: reviewDetails.teamwork },
                          { label: "Initiative", value: reviewDetails.initiative },
                          { label: "Reliability", value: reviewDetails.reliability },
                          { label: "Adaptability", value: reviewDetails.adaptability },
                          { label: "Leadership", value: reviewDetails.leadership },
                        ].map((item) => (
                          <div key={item.label}>
                            <Label className="text-muted-foreground text-xs">{item.label}</Label>
                            <p className="text-yellow-500 text-sm">{getRatingStars(item.value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="360feedback" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            360-Degree Feedback
                          </h3>
                          <p className="text-sm text-muted-foreground">Collect anonymous feedback from peers, direct reports, and cross-functional partners</p>
                        </div>
                        <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Send className="w-4 h-4" />
                              Request Feedback
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request 360° Feedback</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <p className="text-sm text-muted-foreground">Add reviewers who will provide anonymous feedback for {reviewDetails.employeeName}</p>
                              <div className="space-y-2">
                                <Label>Reviewer Name</Label>
                                <Input
                                  placeholder="Enter name"
                                  value={newReviewerName}
                                  onChange={(e) => setNewReviewerName(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  placeholder="reviewer@example.com"
                                  value={newReviewerEmail}
                                  onChange={(e) => setNewReviewerEmail(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Relationship</Label>
                                <Select value={newReviewerRelationship} onValueChange={setNewReviewerRelationship}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="peer">Peer</SelectItem>
                                    <SelectItem value="direct_report">Direct Report</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="cross_functional">Cross-Functional</SelectItem>
                                    <SelectItem value="external">External Partner</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                  if (newReviewerName && newReviewerEmail) {
                                    setFeedbackReviewers([...feedbackReviewers, {
                                      name: newReviewerName,
                                      email: newReviewerEmail,
                                      relationship: newReviewerRelationship
                                    }]);
                                    setNewReviewerName("");
                                    setNewReviewerEmail("");
                                  }
                                }}
                              >
                                Add Reviewer
                              </Button>
                              {feedbackReviewers.length > 0 && (
                                <div className="border rounded-lg p-3 space-y-2">
                                  <Label>Added Reviewers ({feedbackReviewers.length})</Label>
                                  {feedbackReviewers.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                      <span>{r.name} ({r.relationship})</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFeedbackReviewers(feedbackReviewers.filter((_, idx) => idx !== i))}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="flex justify-end gap-2 pt-4">
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                  onClick={() => {
                                    toast.success(`Feedback requests sent to ${feedbackReviewers.length} reviewers`);
                                    setFeedbackReviewers([]);
                                    setFeedbackDialogOpen(false);
                                  }}
                                  disabled={feedbackReviewers.length === 0}
                                >
                                  Send Requests
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <Card className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="text-center py-8">
                            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">No feedback collected yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Request feedback from colleagues to get started</p>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-5 gap-4">
                        {[
                          { label: "Communication", score: "—" },
                          { label: "Teamwork", score: "—" },
                          { label: "Leadership", score: "—" },
                          { label: "Technical", score: "—" },
                          { label: "Problem Solving", score: "—" },
                        ].map((item) => (
                          <div key={item.label} className="text-center p-3 bg-muted/30 rounded-lg">
                            <p className="text-2xl font-bold text-muted-foreground">{item.score}</p>
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
