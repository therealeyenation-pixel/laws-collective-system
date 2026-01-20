import { useState } from "react";
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

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: applications, isLoading: applicationsLoading } = trpc.jobApplications.list.useQuery({});
  // Employees endpoint not yet implemented
  const employees: any[] = [];

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

  const openPositions = [
    // Actively Recruiting (5)
    { title: "Outreach Coordinator", department: "Community Outreach", applications: 0, status: "Actively Recruiting" },
    { title: "Content Creator / Media Assistant", department: "Media Production", applications: 0, status: "Actively Recruiting" },
    { title: "Academy Instructor", department: "Education", applications: 0, status: "Actively Recruiting" },
    { title: "Grant Writer / Proposal Specialist", department: "Grants", applications: 0, status: "Actively Recruiting" },
    { title: "Community Programs Coordinator", department: "Community", applications: 0, status: "Actively Recruiting" },
    // Open Positions - Manager Level
    { title: "HR Manager", department: "Human Resources", applications: 0, status: "Open Position" },
    { title: "QA/QC Manager", department: "Quality Assurance", applications: 0, status: "Open Position" },
    { title: "Operations Manager", department: "Operations", applications: 0, status: "Open Position" },
    { title: "Technology Manager", department: "Technology", applications: 0, status: "Open Position" },
    { title: "Legal Manager", department: "Legal", applications: 0, status: "Open Position" },
    { title: "Real Estate Manager - SC (Treiva Hunter)", department: "Real Estate", applications: 0, status: "Candidate Identified" },
    { title: "Real Estate Manager - GA (Kenneth Coleman)", department: "Real Estate", applications: 0, status: "Candidate Identified" },
    // Open Positions - Coordinator Level
    { title: "Education Operations Coordinator", department: "Education", applications: 0, status: "Open Position" },
    { title: "HR Operations Coordinator", department: "Human Resources", applications: 0, status: "Open Position" },
    { title: "QA/QC Operations Coordinator", department: "Quality Assurance", applications: 0, status: "Open Position" },
    { title: "Operations Coordinator", department: "Operations", applications: 0, status: "Open Position" },
    { title: "Platform Administrator", department: "Technology", applications: 0, status: "Open Position" },
    { title: "Legal Operations Coordinator", department: "Legal", applications: 0, status: "Open Position" },
    { title: "Real Estate Operations Coordinator - SC", department: "Real Estate", applications: 0, status: "Open Position" },
    { title: "Real Estate Operations Coordinator - GA", department: "Real Estate", applications: 0, status: "Open Position" },
    // Ready to Hire (3)
    { title: "Media Operations Coordinator", department: "Media Production", applications: 0, status: "Ready to Hire" },
    { title: "Design Operations Coordinator", department: "Design", applications: 0, status: "Ready to Hire" },
    { title: "Health Operations Coordinator", department: "Health & Wellness", applications: 0, status: "Ready to Hire" },
    // Pending Manager (4)
    { title: "Finance Operations Coordinator", department: "Finance", applications: 0, status: "Pending Manager" },
    { title: "Project Controls Coordinator", department: "Project Controls", applications: 0, status: "Pending Manager" },
    { title: "Contracts Operations Coordinator", department: "Contracts", applications: 0, status: "Pending Manager" },
    { title: "Education Ops Coordinator (Temple)", department: "Education", applications: 0, status: "Pending Manager" },
    // Candidate Identified (8)
    { title: "Purchasing Manager (Latisha Cox)", department: "Purchasing", applications: 0, status: "Candidate Identified" },
    { title: "Contracts Manager (Roshonda Parker)", department: "Contracts", applications: 0, status: "Candidate Identified" },
    { title: "Procurement Manager (Maia Rylandlesesene)", department: "Procurement", applications: 0, status: "Candidate Identified" },
    { title: "Project Controls Manager (Christopher Battle Sr.)", department: "Project Controls", applications: 0, status: "Candidate Identified" },
    { title: "Property Manager (Talbert Cox)", department: "Property", applications: 0, status: "Candidate Identified" },
  ];

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
            <Link href="/careers">
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Recent Applications</TabsTrigger>
            <TabsTrigger value="positions">Open Positions</TabsTrigger>
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
                <Link href="/careers">
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
                <Link href="/family-onboarding">
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    Team Directory
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
                <Link href="/careers">
                  <Button variant="outline" className="w-full">Manage All Positions</Button>
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
