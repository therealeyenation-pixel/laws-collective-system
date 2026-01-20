import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FolderKanban,
  Users,
  BarChart3,
  Calendar,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

export default function ProjectControlsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "Project Controls Department",
    manager: "Christopher Battle Sr.",
    role: "Project Controls Manager",
    description: "Managing project schedules, budgets, and performance metrics across all initiatives",
  };

  const metrics = [
    { label: "Active Projects", value: 8, icon: FolderKanban, color: "text-blue-500" },
    { label: "On Track", value: 5, icon: CheckCircle, color: "text-green-500" },
    { label: "At Risk", value: 2, icon: AlertTriangle, color: "text-amber-500" },
    { label: "Budget Variance", value: "-3%", icon: TrendingUp, color: "text-emerald-500" },
    { label: "Schedule Variance", value: "+2d", icon: Clock, color: "text-purple-500" },
  ];

  const projects = [
    { name: "Academy Platform Launch", phase: "Development", progress: 75, status: "On Track", budget: "$45K", spent: "$32K" },
    { name: "Grant Application System", phase: "Testing", progress: 90, status: "On Track", budget: "$25K", spent: "$23K" },
    { name: "Financial Automation", phase: "Planning", progress: 30, status: "At Risk", budget: "$60K", spent: "$15K" },
    { name: "HR Management System", phase: "Development", progress: 55, status: "On Track", budget: "$35K", spent: "$18K" },
  ];

  const milestones = [
    { milestone: "Academy Beta Launch", project: "Academy Platform", date: "Jan 30, 2026", status: "Upcoming" },
    { milestone: "Grant System Go-Live", project: "Grant Application", date: "Feb 15, 2026", status: "On Track" },
    { milestone: "Financial Automation MVP", project: "Financial Automation", date: "Mar 1, 2026", status: "At Risk" },
  ];

  const riskItems = [
    { risk: "Resource constraints on Financial Automation", impact: "High", likelihood: "Medium", mitigation: "Hire contractor" },
    { risk: "Third-party API delays", impact: "Medium", likelihood: "Low", mitigation: "Alternative provider identified" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{departmentInfo.name}</h1>
            <p className="text-muted-foreground">
              Manager: <span className="font-medium text-foreground">{departmentInfo.manager}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{departmentInfo.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/project-controls-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Project Simulator
              </Button>
            </Link>
            <Link href="/project-controls">
              <Button className="gap-2">
                <FolderKanban className="w-4 h-4" />
                All Projects
              </Button>
            </Link>
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
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Project Status */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Project Status</h3>
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.name} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground text-sm">{project.name}</p>
                        <Badge variant={
                          project.status === "On Track" ? "default" :
                          project.status === "At Risk" ? "destructive" : "secondary"
                        } className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-1">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            project.status === "On Track" ? "bg-green-500" :
                            project.status === "At Risk" ? "bg-amber-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{project.phase}</span>
                        <span>{project.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Upcoming Milestones */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Upcoming Milestones</h3>
                <div className="space-y-3">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Target className={`w-4 h-4 ${
                          milestone.status === "On Track" ? "text-green-500" :
                          milestone.status === "At Risk" ? "text-amber-500" : "text-blue-500"
                        }`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{milestone.milestone}</p>
                          <p className="text-xs text-muted-foreground">{milestone.project} • {milestone.date}</p>
                        </div>
                      </div>
                      <Badge variant={
                        milestone.status === "On Track" ? "default" :
                        milestone.status === "At Risk" ? "destructive" : "secondary"
                      } className="text-xs">
                        {milestone.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/project-controls">
                  <Button variant="outline" className="w-full gap-2">
                    <FolderKanban className="w-4 h-4" />
                    Projects
                  </Button>
                </Link>
                <Link href="/progress-reporting">
                  <Button variant="outline" className="w-full gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Reports
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risks
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Card key={project.name} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.phase}</p>
                    </div>
                    <Badge variant={
                      project.status === "On Track" ? "default" :
                      project.status === "At Risk" ? "destructive" : "secondary"
                    }>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            project.status === "On Track" ? "bg-green-500" :
                            project.status === "At Risk" ? "bg-amber-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">{project.spent} / {project.budget}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">Details</Button>
                    <Button variant="outline" size="sm" className="flex-1">Report</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">All Milestones</h3>
              <div className="space-y-4">
                {milestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        milestone.status === "On Track" ? "bg-green-100 dark:bg-green-900/30" :
                        milestone.status === "At Risk" ? "bg-amber-100 dark:bg-amber-900/30" :
                        "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        <Target className={`w-5 h-5 ${
                          milestone.status === "On Track" ? "text-green-500" :
                          milestone.status === "At Risk" ? "text-amber-500" : "text-blue-500"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{milestone.milestone}</p>
                        <p className="text-sm text-muted-foreground">{milestone.project} • {milestone.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        milestone.status === "On Track" ? "default" :
                        milestone.status === "At Risk" ? "destructive" : "secondary"
                      }>
                        {milestone.status}
                      </Badge>
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Department Team</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                      CB
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Christopher Battle Sr.</p>
                      <p className="text-sm text-muted-foreground">Project Controls Manager</p>
                    </div>
                  </div>
                  <Badge className="bg-indigo-500">Manager</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Project Coordinator</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
