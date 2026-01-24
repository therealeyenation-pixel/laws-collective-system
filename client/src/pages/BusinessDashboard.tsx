import { useState } from "react";
import { MeetingWidget } from "@/components/widgets/MeetingWidget";
import { ChatWidget } from "@/components/widgets/ChatWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  Building2,
  Target,
  Clock,
  CheckCircle,
  Play,
  FolderOpen,
  BarChart3,
  DollarSign,
  UserPlus,
  Calendar,
  Info,
} from "lucide-react";
import { Link } from "wouter";
import { DepartmentProcedures } from "@/components/DepartmentProcedures";
import { HouseParticipationToggle } from "@/components/HouseParticipationToggle";

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Business department is "ground zero" - managed by CEO LaShanna K. Russell
  const departmentInfo = {
    name: "Business Department",
    manager: "LaShanna K. Russell",
    role: "CEO",
    description: "Ground Zero - All employees start here before transitioning to specialized departments",
  };

  const metrics = [
    { label: "Active Business Plans", value: 4, icon: FileText, color: "text-blue-500" },
    { label: "Entities Formed", value: 4, icon: Building2, color: "text-green-500" },
    { label: "Team Members", value: 12, icon: Users, color: "text-purple-500" },
    { label: "W-2 to Contractor", value: 0, icon: TrendingUp, color: "text-amber-500" },
    { label: "Revenue Streams", value: 3, icon: DollarSign, color: "text-emerald-500" },
  ];

  // Public-facing entity hierarchy (Trust is internal only, not shown publicly)
  // Structure: Trust → L.A.W.S. LLC → Collective → Divisions
  const entities = [
    { 
      name: "LuvOnPurpose Autonomous Wealth System, LLC", 
      type: "LLC", 
      status: "Active", 
      description: "Parent Operating LLC - The House",
      isParent: true,
      children: [
        { 
          name: "The L.A.W.S. Collective, LLC", 
          type: "LLC", 
          status: "Active", 
          description: "Community Operating Entity",
          isParent: true,
          children: [
            { name: "LuvOnPurpose Academy & Outreach", type: "508(c)(1)(a)", status: "Pending EIN", description: "Education Division", allocation: "30%" },
            { name: "Real-Eye-Nation", type: "Division", status: "Active", description: "Media Division", allocation: "20%" },
            { name: "Services & Operations", type: "Division", status: "Active", description: "Platform, Consulting, Member Services", allocation: "50%" },
          ]
        }
      ]
    },
  ];

  // Flat list for simple display
  const entitiesFlat = [
    { name: "LuvOnPurpose Autonomous Wealth System, LLC", type: "LLC", status: "Active", description: "Parent Operating LLC - The House" },
    { name: "The L.A.W.S. Collective, LLC", type: "LLC", status: "Active", description: "Community Operating Entity" },
    { name: "LuvOnPurpose Academy & Outreach", type: "508(c)(1)(a)", status: "Pending EIN", description: "Education Division - 30%" },
    { name: "Real-Eye-Nation", type: "Division", status: "Active", description: "Media Division - 20%" },
  ];

  const recentActivity = [
    { action: "Grant Application Submitted", entity: "Amber Grant", date: "Today", status: "Pending" },
    { action: "Grant Application Submitted", entity: "Freed Fellowship", date: "Today", status: "Pending" },
    { action: "Offer Letters Created", entity: "12 Manager Positions", date: "Today", status: "Complete" },
    { action: "Business Plan Updated", entity: "L.A.W.S. Collective", date: "Yesterday", status: "Complete" },
  ];

  const upcomingTasks = [
    { task: "EIN Application - L.A.W.S. Academy", deadline: "Tomorrow", priority: "High" },
    { task: "Bank Account Setup", deadline: "This Week", priority: "High" },
    { task: "HerRise Microgrant Application", deadline: "After Headshots", priority: "Medium" },
    { task: "Professional Headshots - Team", deadline: "Before Launch", priority: "Medium" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{departmentInfo.name}</h1>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">Ground Zero</Badge>
            </div>
            <p className="text-muted-foreground">
              Manager: <span className="font-medium text-foreground">{departmentInfo.manager}</span> ({departmentInfo.role})
            </p>
            <p className="text-sm text-muted-foreground mt-1">{departmentInfo.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/business-landing">
              <Button variant="outline" className="gap-2">
                <Info className="w-4 h-4" />
                What We Offer
              </Button>
            </Link>
            <Link href="/business-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Business Simulator
              </Button>
            </Link>
            <Link href="/business-formation">
              <Button className="gap-2">
                <Building2 className="w-4 h-4" />
                Entity Formation
              </Button>
            </Link>
            <Button variant="secondary" className="gap-2" onClick={() => window.open("/business-simulator", "_blank")}>
              <Target className="w-4 h-4" />
              Try Demo Sandbox
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => window.location.href = "/pricing"}>
              <DollarSign className="w-4 h-4" />
              Subscribe
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Entity Status */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Entity Status</h3>
                <div className="space-y-3">
                  {entitiesFlat.map((entity) => (
                    <div key={entity.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{entity.name}</p>
                        <p className="text-xs text-muted-foreground">{entity.type} - {entity.description}</p>
                      </div>
                      <Badge variant={entity.status === "Active" ? "default" : "secondary"}>
                        {entity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Upcoming Tasks */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Upcoming Tasks</h3>
                <div className="space-y-3">
                  {upcomingTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className={`w-4 h-4 ${task.priority === "High" ? "text-red-500" : "text-amber-500"}`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{task.task}</p>
                          <p className="text-xs text-muted-foreground">{task.deadline}</p>
                        </div>
                      </div>
                      <Badge variant={task.priority === "High" ? "destructive" : "secondary"}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Meeting & Chat Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MeetingWidget
                entityType="business"
                entityId={1}
                entityName="L.A.W.S. Collective, LLC"
              />
              <ChatWidget
                entityType="business"
                entityId={1}
                entityName="L.A.W.S. Collective, LLC"
              />
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/business-plan-simulator">
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="w-4 h-4" />
                    Business Plan
                  </Button>
                </Link>
                <Link href="/grant-simulator">
                  <Button variant="outline" className="w-full gap-2">
                    <Target className="w-4 h-4" />
                    Grant Simulator
                  </Button>
                </Link>
                <Link href="/business-formation">
                  <Button variant="outline" className="w-full gap-2">
                    <Building2 className="w-4 h-4" />
                    Form Entity
                  </Button>
                </Link>
                <Link href="/procedures">
                  <Button variant="outline" className="w-full gap-2">
                    <FolderOpen className="w-4 h-4" />
                    SOPs
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="entities" className="space-y-4 mt-4">
            {/* House Participation Integration */}
            <HouseParticipationToggle
              businessId={1}
              businessName="L.A.W.S. Collective, LLC"
              currentStatus="pending"
              onStatusChange={(newStatus, reason) => {
                console.log("Status changed to:", newStatus, reason);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entitiesFlat.map((entity) => (
                <Card key={entity.name} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{entity.name}</h3>
                      <p className="text-sm text-muted-foreground">{entity.type}</p>
                    </div>
                    <Badge variant={entity.status === "Active" ? "default" : "secondary"}>
                      {entity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{entity.description}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Documents</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${activity.status === "Complete" ? "bg-green-100 dark:bg-green-900" : "bg-amber-100 dark:bg-amber-900"}`}>
                        {activity.status === "Complete" ? (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.entity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                      <Badge variant={activity.status === "Complete" ? "default" : "secondary"}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Department Team</h3>
                <div className="flex gap-2">
                  <Link href="/employee-directory?department=business">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Users className="w-4 h-4" />
                      View Directory
                    </Button>
                  </Link>
                  <Link href="/positions">
                    <Button variant="outline" size="sm" className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Positions
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                      LR
                    </div>
                    <div>
                      <p className="font-medium text-foreground">LaShanna K. Russell</p>
                      <p className="text-sm text-muted-foreground">CEO - Department Manager</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500">CEO</Badge>
                </div>
                <div className="p-4 border rounded-lg border-dashed">
                  <p className="text-center text-muted-foreground">
                    All new employees start in Business Department before transitioning to specialized roles
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/employee-directory?department=business">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All Business Team Members
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <DepartmentProcedures 
              department="Business" 
              title="Business Document Repository"
              description="Business plans, entity documents, strategic plans, and corporate governance"
              showCategories={true}
              showSearch={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
