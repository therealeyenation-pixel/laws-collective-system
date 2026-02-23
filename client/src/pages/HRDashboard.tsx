import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { DepartmentProcedures } from "@/components/DepartmentProcedures";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import { GovernmentActionsWidget } from "@/components/GovernmentActionsWidget";

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: applications, isLoading: applicationsLoading } = trpc.jobApplications.list.useQuery({});
  const { data: positionsData, isLoading: positionsLoading } = trpc.positionManagement.getAllPositions.useQuery();
  // Employees endpoint not yet implemented
  const employees: any[] = [];

  // Map database positions to display format
  const openPositions = (positionsData || []).filter((p: any) => p.status === 'open').map((p: any) => ({
    title: p.title,
    department: p.department || 'General',
    applications: 0, // TODO: count applications per position
    status: 'Open Position',
    salary: p.salaryAmount,
  }));

  // Calculate metrics from applications
  const totalApplications = applications?.length || 0;
  const pendingApplications = applications?.filter((a: any) => a.status === "received" || a.status === "screening").length || 0;
  const interviewScheduled = applications?.filter((a: any) => a.status === "interview").length || 0;
  const offersExtended = applications?.filter((a: any) => a.status === "offer").length || 0;
  const hired = applications?.filter((a: any) => a.status === "hired").length || 0;
  const rejected = applications?.filter((a: any) => a.status === "rejected").length || 0;

  // Recent applications (last 7 days)
  const recentApplications = applications?.filter((a: any) => {
    const appDate = new Date(a.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return appDate >= weekAgo;
  }) || [];

  const metrics = [
    { label: "Total Applications", value: totalApplications, icon: FileText, color: "text-blue-500" },
    { label: "Pending Review", value: pendingApplications, icon: Clock, color: "text-yellow-500" },
    { label: "Interviews Scheduled", value: interviewScheduled, icon: Calendar, color: "text-purple-500" },
    { label: "Offers Extended", value: offersExtended, icon: Briefcase, color: "text-green-500" },
    { label: "Hired", value: hired, icon: CheckCircle, color: "text-emerald-500" },
    { label: "Rejected", value: rejected, icon: XCircle, color: "text-red-500" },
  ];

  // Positions are now fetched from database via positionsData

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">HR Dashboard</h1>
            <p className="text-muted-foreground">
              Application tracking, employee data, and onboarding status
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/hr-applications">
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                View Applications
              </Button>
            </Link>
            <Link href="/positions">
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Job Postings
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${metric.color}`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Live Ticker and Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <LiveTicker department="hr" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        {/* Government Actions */}
        <GovernmentActionsWidget department="hr" showStats />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Recent Applications</TabsTrigger>
            <TabsTrigger value="positions">Open Positions</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Application Pipeline */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Application Pipeline</h3>
                <div className="space-y-3">
                  {[
                    { stage: "Received", count: applications?.filter((a: any) => a.status === "received").length || 0, color: "bg-blue-500" },
                    { stage: "Screening", count: applications?.filter((a: any) => a.status === "screening").length || 0, color: "bg-yellow-500" },
                    { stage: "Interview", count: interviewScheduled, color: "bg-purple-500" },
                    { stage: "Offer", count: offersExtended, color: "bg-green-500" },
                    { stage: "Hired", count: hired, color: "bg-emerald-500" },
                  ].map((stage) => (
                    <div key={stage.stage} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <span className="text-sm text-foreground flex-1">{stage.stage}</span>
                      <span className="text-sm font-medium text-foreground">{stage.count}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Hiring Activity */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">This Week's Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New Applications</span>
                    <span className="text-lg font-bold text-foreground">{recentApplications.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Interviews Conducted</span>
                    <span className="text-lg font-bold text-foreground">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Offers Sent</span>
                    <span className="text-lg font-bold text-foreground">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New Hires</span>
                    <span className="text-lg font-bold text-foreground">0</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/hr-applications">
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="w-4 h-4" />
                    Review Applications
                  </Button>
                </Link>
                <Link href="/positions">
                  <Button variant="outline" className="w-full gap-2">
                    <Briefcase className="w-4 h-4" />
                    Manage Postings
                  </Button>
                </Link>
                <Link href="/training">
                  <Button variant="outline" className="w-full gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Training Programs
                  </Button>
                </Link>
                <Link href="/employee-directory?department=human%20resources">
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    HR Team Directory
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Applications</h3>
              {applicationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentApplications.length > 0 ? (
                <div className="space-y-3">
                  {recentApplications.slice(0, 10).map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{app.applicantName}</p>
                        <p className="text-sm text-muted-foreground">{app.positionTitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          app.status === "hired" ? "default" :
                          app.status === "rejected" ? "destructive" :
                          "secondary"
                        }>
                          {app.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No recent applications</p>
              )}
              <div className="mt-4">
                <Link href="/hr-applications">
                  <Button variant="outline" className="w-full">View All Applications</Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="positions" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Open Positions ({openPositions.length})</h3>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Actively Recruiting</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Ready to Hire</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600"></span> Open</span>
                </div>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {openPositions.map((position, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{position.title}</p>
                      <p className="text-sm text-muted-foreground">{position.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary"
                        className={`${
                          position.status === "Actively Recruiting" ? "bg-red-500 text-white hover:bg-red-600" :
                          position.status === "Ready to Hire" ? "bg-amber-500 text-white hover:bg-amber-600" :
                          position.status === "Candidate Identified" ? "bg-blue-500 text-white hover:bg-blue-600" :
                          position.status === "Pending Manager" ? "bg-purple-500 text-white hover:bg-purple-600" :
                          "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {position.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/positions">
                  <Button variant="outline" className="w-full">Manage All Positions</Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">HR Department Team</h3>
                <Link href="/employee-directory?department=hr">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    View Full Directory
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                      LR
                    </div>
                    <div>
                      <p className="font-medium text-foreground">LaShanna K. Russell</p>
                      <p className="text-sm text-muted-foreground">CEO - HR Oversight</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500">Executive</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">HR Manager</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">HR Coordinator</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <Link href="/employee-directory?department=hr">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All HR Team Members
                  </Button>
                </Link>
                <Link href="/onboarding-checklist?department=hr">
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="w-4 h-4" />
                    View Onboarding Checklist
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding" className="mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Onboarding Status</h3>
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No employees currently in onboarding</p>
                <p className="text-sm text-muted-foreground mt-2">
                  New hires will appear here once they accept their offer
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <DepartmentProcedures 
              department="HR" 
              title="HR Document Repository"
              description="Employee handbooks, policies, onboarding materials, and HR procedures"
              showCategories={true}
              showSearch={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
