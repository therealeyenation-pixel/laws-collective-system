import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  BookOpen, 
  FileText, 
  CreditCard,
  Award,
  Calendar,
  MessageSquare,
  Bell,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  Trophy,
  GraduationCap,
  Target,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";

interface MemberStatus {
  memberSince: Date;
  membershipType: 'basic' | 'standard' | 'premium';
  status: 'active' | 'pending' | 'suspended';
  renewalDate: Date;
  points: number;
  level: number;
}

interface TrainingProgress {
  courseId: string;
  courseName: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed?: Date;
  certificate?: string;
}

interface MemberDocument {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'pending' | 'expired';
  uploadedAt: Date;
  expiresAt?: Date;
}

interface MemberApplication {
  id: string;
  type: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt: Date;
  updatedAt: Date;
  notes?: string;
}

export default function MemberPortalPage() {
  const { user } = useAuth();
  const [memberStatus, setMemberStatus] = useState<MemberStatus | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>([]);
  const [documents, setDocuments] = useState<MemberDocument[]>([]);
  const [applications, setApplications] = useState<MemberApplication[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = () => {
    // Simulated member data - in production, fetch from tRPC
    setMemberStatus({
      memberSince: new Date('2023-06-15'),
      membershipType: 'standard',
      status: 'active',
      renewalDate: new Date('2025-06-15'),
      points: 2450,
      level: 3,
    });

    setTrainingProgress([
      {
        courseId: '1',
        courseName: 'Financial Literacy Fundamentals',
        progress: 100,
        completedLessons: 12,
        totalLessons: 12,
        lastAccessed: new Date('2024-01-10'),
        certificate: 'cert-001',
      },
      {
        courseId: '2',
        courseName: 'Business Formation Basics',
        progress: 65,
        completedLessons: 8,
        totalLessons: 12,
        lastAccessed: new Date('2024-01-25'),
      },
      {
        courseId: '3',
        courseName: 'Grant Writing Workshop',
        progress: 30,
        completedLessons: 3,
        totalLessons: 10,
        lastAccessed: new Date('2024-01-20'),
      },
    ]);

    setDocuments([
      {
        id: '1',
        name: 'Membership Certificate',
        type: 'certificate',
        status: 'available',
        uploadedAt: new Date('2023-06-15'),
      },
      {
        id: '2',
        name: 'Financial Literacy Certificate',
        type: 'certificate',
        status: 'available',
        uploadedAt: new Date('2024-01-10'),
      },
      {
        id: '3',
        name: 'ID Verification',
        type: 'verification',
        status: 'pending',
        uploadedAt: new Date('2024-01-22'),
      },
    ]);

    setApplications([
      {
        id: '1',
        type: 'Scholarship Application',
        status: 'under_review',
        submittedAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: '2',
        type: 'Mentorship Program',
        status: 'approved',
        submittedAt: new Date('2023-12-01'),
        updatedAt: new Date('2023-12-15'),
        notes: 'Matched with mentor: Dr. Johnson',
      },
    ]);

    setNotifications([
      { id: '1', message: 'Your scholarship application is under review', date: new Date('2024-01-20'), read: false },
      { id: '2', message: 'New course available: Advanced Grant Writing', date: new Date('2024-01-18'), read: true },
      { id: '3', message: 'Membership renewal reminder - 5 months remaining', date: new Date('2024-01-15'), read: true },
    ]);
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'standard': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'available':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
      case 'under_review':
      case 'submitted':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'rejected':
      case 'expired':
      case 'suspended':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Member Portal</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name || 'Member'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Member Status Card */}
        {memberStatus && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user?.name?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{user?.name || 'Member'}</h2>
                    <Badge className={getMembershipColor(memberStatus.membershipType)}>
                      {memberStatus.membershipType.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(memberStatus.status)}>
                      {memberStatus.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Member since {format(memberStatus.memberSince, 'MMMM yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span className="text-2xl font-bold">{memberStatus.points.toLocaleString()}</span>
                    <span className="text-muted-foreground">points</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Level {memberStatus.level}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {trainingProgress.filter(t => t.progress === 100).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Courses Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {documents.filter(d => d.type === 'certificate').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Certificates Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {applications.filter(a => a.status === 'approved').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Applications Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(trainingProgress.reduce((acc, t) => acc + t.progress, 0) / trainingProgress.length)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Avg. Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="training" className="space-y-4">
          <TabsList>
            <TabsTrigger value="training">Training Progress</TabsTrigger>
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
          </TabsList>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  My Courses
                </CardTitle>
                <CardDescription>
                  Track your learning progress and access course materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingProgress.map((course) => (
                    <div key={course.courseId} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{course.courseName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {course.completedLessons} of {course.totalLessons} lessons completed
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {course.progress === 100 ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline">In Progress</Badge>
                          )}
                        </div>
                      </div>
                      <Progress value={course.progress} className="h-2 mb-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {course.lastAccessed && `Last accessed ${format(course.lastAccessed, 'MMM d, yyyy')}`}
                        </span>
                        <div className="flex gap-2">
                          {course.certificate && (
                            <Button variant="outline" size="sm">
                              <Download className="w-3 h-3 mr-1" />
                              Certificate
                            </Button>
                          )}
                          <Button size="sm">
                            {course.progress === 100 ? 'Review' : 'Continue'}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  My Documents
                </CardTitle>
                <CardDescription>
                  Access your certificates, verifications, and other documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-primary" />
                          <div>
                            <h4 className="font-medium">{doc.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Uploaded {format(doc.uploadedAt, 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.status}
                          </Badge>
                          {doc.status === 'available' && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    My Applications
                  </span>
                  <Button size="sm">
                    New Application
                  </Button>
                </CardTitle>
                <CardDescription>
                  Track the status of your submitted applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{app.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            Submitted {format(app.submittedAt, 'MMM d, yyyy')}
                          </p>
                          {app.notes && (
                            <p className="text-sm text-primary mt-2">{app.notes}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Membership Tab */}
          <TabsContent value="membership" className="space-y-4">
            {memberStatus && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Membership Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <Badge className={getMembershipColor(memberStatus.membershipType)}>
                        {memberStatus.membershipType.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className={getStatusColor(memberStatus.status)}>
                        {memberStatus.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member Since</span>
                      <span>{format(memberStatus.memberSince, 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renewal Date</span>
                      <span>{format(memberStatus.renewalDate, 'MMMM d, yyyy')}</span>
                    </div>
                    <Button className="w-full mt-4">
                      Upgrade Membership
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Rewards & Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-4">
                      <p className="text-4xl font-bold text-primary">
                        {memberStatus.points.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">Total Points</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Level {memberStatus.level}</span>
                        <span>Level {memberStatus.level + 1}</span>
                      </div>
                      <Progress value={45} />
                      <p className="text-xs text-muted-foreground text-center">
                        550 more points to reach Level {memberStatus.level + 1}
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Rewards Catalog
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
