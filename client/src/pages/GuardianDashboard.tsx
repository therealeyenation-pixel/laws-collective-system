/**
 * Guardian Dashboard Page
 * Phase 19.6: Parent/guardian dashboard for monitoring student progress
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudentProgressTracker } from "@/components/StudentProgressTracker";
import {
  Users,
  BookOpen,
  Award,
  Coins,
  Bell,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

export default function GuardianDashboard() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  // Fetch guardian data
  const { data: studentsData, isLoading: studentsLoading } = trpc.guardianDashboard.getStudents.useQuery();
  const { data: summaryData, isLoading: summaryLoading } = trpc.guardianDashboard.getSummary.useQuery();
  const { data: statsData } = trpc.guardianDashboard.getStats.useQuery();
  const { data: notificationsData } = trpc.guardianDashboard.getNotifications.useQuery();

  // Fetch detailed progress for selected student
  const { data: progressData, isLoading: progressLoading } = trpc.guardianDashboard.getStudentProgress.useQuery(
    { studentProfileId: selectedStudentId! },
    { enabled: !!selectedStudentId }
  );

  const handleViewProgress = (studentId: number) => {
    setSelectedStudentId(studentId);
    setShowProgressDialog(true);
  };

  const getHouseColor = (houseName: string | null) => {
    switch (houseName) {
      case "House of Wonder":
        return "bg-amber-100 text-amber-800";
      case "House of Form":
        return "bg-emerald-100 text-emerald-800";
      case "House of Mastery":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-600";
      case "B":
        return "text-blue-600";
      case "C":
        return "text-yellow-600";
      case "D":
        return "text-orange-600";
      case "F":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <Award className="w-4 h-4 text-green-600" />;
      case "inactivity":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const selectedStudent = summaryData?.summaries.find(s => s.studentId === selectedStudentId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Guardian Dashboard</h1>
            <p className="text-muted-foreground">Monitor your students' learning progress</p>
          </div>
        </div>

        {/* Stats Overview */}
        {statsData?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statsData.stats.totalStudents}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statsData.stats.totalCoursesCompleted}</p>
                    <p className="text-xs text-muted-foreground">Courses Done</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statsData.stats.totalScrollsEarned}</p>
                    <p className="text-xs text-muted-foreground">Scrolls Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Coins className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statsData.stats.totalTokensEarned.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Tokens</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  My Students
                </CardTitle>
                <CardDescription>Click on a student to view detailed progress</CardDescription>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : summaryData?.summaries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No students linked to your account
                  </div>
                ) : (
                  <div className="space-y-4">
                    {summaryData?.summaries.map((student) => (
                      <Card
                        key={student.studentId}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleViewProgress(student.studentId)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{student.studentName}</h4>
                                {student.houseName && (
                                  <Badge className={getHouseColor(student.houseName)}>
                                    {student.houseName.replace("House of ", "")}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Courses</p>
                                  <p className="font-medium">
                                    {student.coursesCompleted} done, {student.coursesInProgress} active
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Languages</p>
                                  <p className="font-medium">{student.languagesLearning} learning</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Scrolls</p>
                                  <p className="font-medium">{student.scrollsEarned} earned</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Grade</p>
                                  <p className={`font-bold text-lg ${getGradeColor(student.overallGrade)}`}>
                                    {student.overallGrade}
                                  </p>
                                </div>
                              </div>

                              {student.houseName && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>House Progress</span>
                                    <span>{student.houseProgress}%</span>
                                  </div>
                                  <Progress value={student.houseProgress} className="h-2" />
                                </div>
                              )}

                              {student.lastActivity && (
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Last active: {new Date(student.lastActivity).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notificationsData?.notifications.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No notifications
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notificationsData?.notifications.slice(0, 10).map((notif, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                      >
                        {getNotificationIcon(notif.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notif.studentName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {notif.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getPriorityColor(notif.priority)} variant="outline">
                          {notif.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* House Distribution */}
            {statsData?.stats && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">House Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-sm">Wonder (K-5)</span>
                      </div>
                      <span className="font-medium">{statsData.stats.studentsInWonder}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-sm">Form (6-8)</span>
                      </div>
                      <span className="font-medium">{statsData.stats.studentsInForm}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-sm">Mastery (9-12)</span>
                      </div>
                      <span className="font-medium">{statsData.stats.studentsInMastery}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Student Progress Dialog */}
        <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedStudent?.studentName}'s Progress
              </DialogTitle>
            </DialogHeader>
            {progressLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading progress...</div>
            ) : progressData?.progress ? (
              <StudentProgressTracker
                studentName={selectedStudent?.studentName || "Student"}
                courses={progressData.progress.courses}
                languages={progressData.progress.languages}
                scrolls={progressData.progress.scrolls}
                tokenHistory={progressData.progress.tokenHistory}
                weeklyActivity={progressData.progress.weeklyActivity}
                onViewScroll={(scrollId) => {
                  toast.info("Scroll viewer coming soon");
                }}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Unable to load progress data
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
