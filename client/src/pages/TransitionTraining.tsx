import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award,
  PlayCircle,
  FileText,
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function TransitionTraining() {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  // Get required courses
  const { data: requiredCourses, isLoading: coursesLoading } = trpc.trainingTransition.getRequiredCourses.useQuery();
  
  // Get training stats
  const { data: trainingStats, isLoading: statsLoading } = trpc.trainingTransition.getTrainingStats.useQuery();
  
  // Get employees for enrollment
  const { data: employees } = trpc.employees.getAll.useQuery();

  // Mutations
  const enrollMutation = trpc.trainingTransition.enrollInTransitionTraining.useMutation({
    onSuccess: () => {
      toast.success("Employee enrolled in transition training");
      setEnrollDialogOpen(false);
      setSelectedEmployee(null);
    },
    onError: (error) => {
      toast.error(`Failed to enroll: ${error.message}`);
    }
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tax_compliance: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      business_operations: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      legal: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      platform: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      financial: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      tax_compliance: "Tax Compliance",
      business_operations: "Business Operations",
      legal: "Legal",
      platform: "Platform",
      financial: "Financial"
    };
    return labels[category] || category;
  };

  const handleEnroll = () => {
    if (selectedEmployee) {
      enrollMutation.mutate({ employeeId: selectedEmployee });
    }
  };

  if (coursesLoading || statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const totalHours = requiredCourses?.reduce((sum, c) => sum + parseFloat(c.durationHours), 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transition Training</h1>
            <p className="text-muted-foreground mt-1">
              Required training for employee-to-contractor transition
            </p>
          </div>
          <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Enroll Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enroll in Transition Training</DialogTitle>
                <DialogDescription>
                  Select an employee to enroll in all required transition training courses.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Employee</label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={selectedEmployee || ""}
                    onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                  >
                    <option value="">Choose an employee...</option>
                    {employees?.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This will enroll the employee in all {requiredCourses?.length || 8} required courses 
                    ({totalHours.toFixed(1)} hours total). They must complete all courses before 
                    becoming eligible for contractor transition.
                  </p>
                </div>
                <Button 
                  onClick={handleEnroll} 
                  disabled={!selectedEmployee || enrollMutation.isPending}
                  className="w-full"
                >
                  {enrollMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    "Enroll in All Courses"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employees Enrolled</p>
                  <p className="text-2xl font-bold">{trainingStats?.enrollment?.totalEmployeesEnrolled || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Courses Completed</p>
                  <p className="text-2xl font-bold">{trainingStats?.completion?.totalCompletions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hours Completed</p>
                  <p className="text-2xl font-bold">
                    {parseFloat(trainingStats?.completion?.totalHoursCompleted || 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">
                    {parseFloat(trainingStats?.completion?.averageScore || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">Required Courses</TabsTrigger>
            <TabsTrigger value="progress">Course Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Transition Training Curriculum
                </CardTitle>
                <CardDescription>
                  {requiredCourses?.length || 8} required courses • {totalHours.toFixed(1)} total hours • 
                  Must pass all courses before contractor transition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requiredCourses?.map((course: any, index: number) => (
                    <div 
                      key={course.courseId}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{course.courseName}</h3>
                          <Badge variant="outline" className={getCategoryColor(course.category)}>
                            {getCategoryLabel(course.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {course.courseDescription}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {parseFloat(course.durationHours).toFixed(1)} hours
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {parseFloat(course.passingScore).toFixed(0)}% passing score
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course.courseId}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        <PlayCircle className="w-4 h-4" />
                        Preview
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Training Path Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Training Path to Contractor Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center z-10">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Employee Status</h4>
                        <p className="text-sm text-muted-foreground">Current position with L.A.W.S.</p>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center z-10">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Complete Training ({totalHours.toFixed(1)} hours)</h4>
                        <p className="text-sm text-muted-foreground">Pass all {requiredCourses?.length || 8} required courses</p>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center z-10">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Form Business Entity</h4>
                        <p className="text-sm text-muted-foreground">LLC/Corp registration, EIN, business bank account</p>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center z-10">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Contractor Status</h4>
                        <p className="text-sm text-muted-foreground">Independent contractor with own business</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Completion Analytics</CardTitle>
                <CardDescription>
                  Performance metrics by course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingStats?.courseBreakdown?.map((course: any) => (
                    <div key={course.courseId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{course.courseName}</span>
                          <Badge variant="outline" className={getCategoryColor(course.category)}>
                            {getCategoryLabel(course.category)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{course.completionCount || 0} completions</span>
                          <span>Avg: {parseFloat(course.averageScore || 0).toFixed(1)}%</span>
                        </div>
                      </div>
                      <Progress 
                        value={parseFloat(course.averageScore || 0)} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gate Requirements Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Transition Gate Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Training Gate</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Complete all {requiredCourses?.length || 8} required courses
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Pass each course with minimum score
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Earn completion certificates
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Entity Formation Gate</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Register LLC or Corporation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Obtain EIN from IRS
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Open business bank account
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
