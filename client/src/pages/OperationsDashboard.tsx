import { useState } from "react";
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
} from "lucide-react";
import { Link } from "wouter";

export default function OperationsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Department metrics
  const departments = [
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
    { 
      name: "Purchasing", 
      icon: ShoppingCart, 
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      coordinator: "Purchasing Operations Coordinator",
      manager: "Purchasing Manager",
      status: "Open",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
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
    { 
      name: "Education", 
      icon: BookOpen, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      coordinator: "Education Operations Coordinator",
      manager: "Education Manager (Cornelius)",
      status: "Filled",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    { 
      name: "Health", 
      icon: Heart, 
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      coordinator: "Health Operations Coordinator",
      manager: "Health Manager",
      status: "Open",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
    { 
      name: "Contracts", 
      icon: FileText, 
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      coordinator: "Contracts Operations Coordinator",
      manager: "Contracts Manager",
      status: "Open",
      tasks: { completed: 0, pending: 0, total: 0 }
    },
  ];

  const overallMetrics = [
    { label: "Departments", value: departments.length, icon: BarChart3, color: "text-blue-500" },
    { label: "Positions Filled", value: 1, icon: CheckCircle, color: "text-green-500" },
    { label: "Positions Open", value: 13, icon: AlertCircle, color: "text-yellow-500" },
    { label: "Active Tasks", value: 0, icon: Clock, color: "text-purple-500" },
  ];

  const recentActivity = [
    { action: "System initialized", department: "All", time: "Today", type: "system" },
    { action: "Job postings created", department: "HR", time: "Today", type: "hr" },
    { action: "Training programs defined", department: "Education", time: "Today", type: "education" },
    { action: "Hiring process documented", department: "HR", time: "Today", type: "hr" },
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Department Status */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Department Status</h3>
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${dept.bgColor} ${dept.color}`}>
                          <dept.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{dept.name}</span>
                      </div>
                      <Badge variant={dept.status === "Filled" ? "default" : "secondary"}>
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
                      <span className="text-muted-foreground">Executive Positions</span>
                      <span className="text-foreground">2/5 filled</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Manager Positions</span>
                      <span className="text-foreground">1/10 filled</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Lead Positions</span>
                      <span className="text-foreground">0/1 filled</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Operations Coordinators</span>
                      <span className="text-foreground">0/7 filled</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Links */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/organizational-structure">
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    Org Structure
                  </Button>
                </Link>
                <Link href="/careers">
                  <Button variant="outline" className="w-full gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Job Postings
                  </Button>
                </Link>
                <Link href="/training">
                  <Button variant="outline" className="w-full gap-2">
                    <BookOpen className="w-4 h-4" />
                    Training
                  </Button>
                </Link>
                <Link href="/luv-ledger">
                  <Button variant="outline" className="w-full gap-2">
                    <TrendingUp className="w-4 h-4" />
                    LuvLedger
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
                      <Badge variant={dept.status === "Filled" ? "default" : "secondary"} className="mt-1">
                        {dept.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manager:</span>
                      <span className="text-foreground">{dept.manager}</span>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
