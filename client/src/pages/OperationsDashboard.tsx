import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Settings,
  Users,
  ClipboardCheck,
  ShoppingCart,
  BookOpen,
  Heart,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  Loader2,
  DollarSign,
  Cpu,
  Palette,
  Video,
  Scale,
  Building2,
  Package,
} from "lucide-react";
import { Link } from "wouter";
import { DepartmentProcedures } from "@/components/DepartmentProcedures";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import { GovernmentActionsWidget } from "@/components/GovernmentActionsWidget";

export default function OperationsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Department metrics - All departments with correct manager/coordinator assignments
  const departments = [
    // Executive Department
    { 
      name: "Executive", 
      icon: TrendingUp, 
      color: "text-gold-500",
      bgColor: "bg-yellow-500/10",
      coordinator: "Executive Assistant",
      manager: "LaShanna Russell (CEO)",
      status: "Filled",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Finance Department
    { 
      name: "Finance", 
      icon: DollarSign, 
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      coordinator: "Finance Operations Coordinator",
      manager: "Craig Russell (Finance Manager)",
      status: "Filled",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Education Department
    { 
      name: "Education", 
      icon: BookOpen, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      coordinator: "Education Operations Coordinator",
      manager: "Cornelius Christopher (Education Manager)",
      status: "Filled",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Health Department
    { 
      name: "Health", 
      icon: Heart, 
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      coordinator: "Health Operations Coordinator",
      manager: "Amber Hunter (Health Manager)",
      status: "Filled",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Design Department
    { 
      name: "Design", 
      icon: Palette, 
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      coordinator: "Design Operations Coordinator",
      manager: "Essence Hunter (Design Manager)",
      status: "Filled",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Media Department
    { 
      name: "Media", 
      icon: Video, 
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      coordinator: "Media Operations Coordinator",
      manager: "Amandes Pearsall IV (Media Manager)",
      status: "Filled",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Technology Department
    { 
      name: "Technology", 
      icon: Cpu, 
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      coordinator: "Technology Operations Coordinator",
      manager: "Platform Administrator",
      status: "Open",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Human Resources Department
    { 
      name: "Human Resources", 
      icon: Users, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      coordinator: "HR Operations Coordinator",
      manager: "HR Manager",
      status: "Open",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Operations Department
    { 
      name: "Operations", 
      icon: Settings, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      coordinator: "Operations Operations Coordinator",
      manager: "Operations Manager",
      status: "Open",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // QA/QC Department
    { 
      name: "QA/QC", 
      icon: ClipboardCheck, 
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      coordinator: "QA/QC Operations Coordinator",
      manager: "QA/QC Manager",
      status: "Open",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Procurement Department (Oversight)
    { 
      name: "Procurement", 
      icon: Package, 
      color: "text-amber-600",
      bgColor: "bg-amber-600/10",
      coordinator: "Procurement Operations Coordinator",
      manager: "Maia Rylandlesesene (Procurement Manager)",
      status: "Identified",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Purchasing Department (under Procurement)
    { 
      name: "Purchasing", 
      icon: ShoppingCart, 
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      coordinator: "Purchasing Operations Coordinator",
      manager: "Latisha Cox (Purchasing Manager)",
      status: "Identified",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Contracts Department (under Procurement)
    { 
      name: "Contracts", 
      icon: FileText, 
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      coordinator: "Contracts Operations Coordinator",
      manager: "Roshonda Parker (Contracts Manager)",
      status: "Identified",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Legal Department
    { 
      name: "Legal", 
      icon: Scale, 
      color: "text-slate-500",
      bgColor: "bg-slate-500/10",
      coordinator: "Legal Operations Coordinator",
      manager: "Legal Manager",
      status: "Open",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    // Real Estate Department (Two Managers due to state jurisdiction)
    { 
      name: "Real Estate", 
      icon: Building2, 
      color: "text-stone-500",
      bgColor: "bg-stone-500/10",
      coordinator: "SC & GA Coordinators (Open)",
      manager: "Treiva Hunter (SC) & Kenneth Coleman (GA)",
      status: "Identified",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
  ];

  // Calculate metrics
  const filledCount = departments.filter(d => d.status === "Filled").length;
  const identifiedCount = departments.filter(d => d.status === "Identified").length;
  const openCount = departments.filter(d => d.status === "Open").length;

  const overallMetrics = [
    { label: "Departments", value: departments.length, icon: BarChart3, color: "text-blue-500" },
    { label: "Positions Filled", value: filledCount, icon: CheckCircle, color: "text-green-500" },
    { label: "Candidates Identified", value: identifiedCount, icon: Users, color: "text-amber-500" },
    { label: "Positions Open", value: openCount, icon: AlertCircle, color: "text-yellow-500" },
  ];

  const recentActivity = [
    { action: "LaShanna Russell updated to CEO", department: "Executive", time: "Today", type: "system" },
    { action: "Family managers confirmed", department: "All", time: "Today", type: "hr" },
    { action: "Procurement hierarchy established", department: "Procurement", time: "Today", type: "operations" },
    { action: "Legal and Real Estate added", department: "Legal", time: "Today", type: "system" },
    { action: "Job postings created", department: "HR", time: "Today", type: "hr" },
    { action: "Training programs defined", department: "Education", time: "Today", type: "education" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Operations Dashboard</h1>
            <p className="text-muted-foreground">
              Cross-department metrics, task tracking, and operational oversight
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/agents">
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                AI Agents
              </Button>
            </Link>
            <Link href="/hr-dashboard">
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                HR Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {overallMetrics.map((metric) => (
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
            <LiveTicker department="operations" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        {/* Government Actions */}
        <GovernmentActionsWidget department="operations" showStats />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Department Status */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Department Status</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {departments.map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${dept.bgColor} ${dept.color}`}>
                          <dept.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{dept.name}</span>
                      </div>
                      <Badge variant={
                        dept.status === "Filled" ? "default" : 
                        dept.status === "Identified" ? "outline" : 
                        "secondary"
                      }>
                        {dept.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Staffing Progress */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Staffing Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Executive Level</span>
                      <span className="text-foreground">1/1 filled</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Family Manager Positions (Tier 2)</span>
                      <span className="text-foreground">5/5 filled</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Specialized Manager Positions (Tier 3)</span>
                      <span className="text-foreground">3/10 identified</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Operations Coordinators (Tier 4)</span>
                      <span className="text-foreground">0/15 filled</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
                
                {/* Family Manager Summary */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Family Management Team</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>LaShanna Russell - CEO</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Craig Russell - Finance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Cornelius Christopher - Education</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Amber Hunter - Health</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Essence Hunter - Design</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Amandes Pearsall IV - Media</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Links */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/employees">
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    Employee Directory
                  </Button>
                </Link>
                <Link href="/careers">
                  <Button variant="outline" className="w-full gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Job Postings
                  </Button>
                </Link>
                <Link href="/position-requisitions">
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="w-4 h-4" />
                    Requisitions
                  </Button>
                </Link>
                <Link href="/procedures">
                  <Button variant="outline" className="w-full gap-2">
                    <BookOpen className="w-4 h-4" />
                    Procedures
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <Card key={dept.name} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${dept.bgColor} ${dept.color}`}>
                      <dept.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{dept.name}</h3>
                      <Badge 
                        variant={
                          dept.status === "Filled" ? "default" : 
                          dept.status === "Identified" ? "outline" : 
                          "secondary"
                        } 
                        className="mt-1"
                      >
                        {dept.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manager:</span>
                      <span className="text-foreground text-right text-xs">{dept.manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coordinator:</span>
                      <span className="text-foreground text-right text-xs">{dept.coordinator}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Tasks:</span>
                      <span className="text-foreground">{dept.tasks.completed}/{dept.tasks.total}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Operations Department Team</h3>
                <Link href="/employee-directory?department=operations">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    View Full Directory
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      LR
                    </div>
                    <div>
                      <p className="font-medium text-foreground">LaShanna K. Russell</p>
                      <p className="text-sm text-muted-foreground">CEO - Operations Oversight</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500">Executive</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Operations Manager</p>
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
                      <p className="font-medium text-foreground">Operations Coordinator</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <Link href="/employee-directory?department=operations">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All Operations Team Members
                  </Button>
                </Link>
                <Link href="/onboarding-checklist?department=operations">
                  <Button variant="outline" className="w-full gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    View Onboarding Checklist
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Task Management</h3>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active tasks</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tasks will appear here once departments are staffed and operational
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.department}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <DepartmentProcedures 
              department="Operations" 
              title="Operations Document Repository"
              description="SOPs, operational procedures, workflow guides, and process documentation"
              showCategories={true}
              showSearch={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
