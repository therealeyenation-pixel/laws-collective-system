import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Users,
  FileText,
  Activity,
  Play,
  Clock,
  Shield,
  Upload,
  FolderOpen,
  Download,
  Search,
  Database,
  Globe,
  Cpu,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { DepartmentProcedures } from "@/components/DepartmentProcedures";

export default function PlatformAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const departmentInfo = {
    name: "Platform Administration",
    manager: "LaShanna K. Russell",
    role: "Platform Administrator",
    description: "Managing the L.A.W.S. platform infrastructure, users, and system configuration",
  };

  const metrics = [
    { label: "Active Users", value: 156, icon: Users, color: "text-blue-500" },
    { label: "System Health", value: "98%", icon: Activity, color: "text-green-500" },
    { label: "API Calls/Day", value: "12.4K", icon: Globe, color: "text-purple-500" },
    { label: "Storage", value: "45 GB", icon: Database, color: "text-amber-500" },
    { label: "CPU Usage", value: "34%", icon: Cpu, color: "text-emerald-500" },
  ];

  const systemHealth = [
    { component: "Web Application", status: "Healthy", latency: "45ms", uptime: "99.99%" },
    { component: "API Gateway", status: "Healthy", latency: "12ms", uptime: "99.98%" },
    { component: "Database", status: "Healthy", latency: "8ms", uptime: "99.99%" },
    { component: "File Storage", status: "Healthy", latency: "23ms", uptime: "100%" },
  ];

  const recentActivity = [
    { action: "User Registration", user: "new.user@email.com", time: "5 min ago", type: "User" },
    { action: "API Key Generated", user: "admin@laws.com", time: "15 min ago", type: "Security" },
    { action: "Database Backup", user: "System", time: "1 hour ago", type: "Maintenance" },
    { action: "Configuration Update", user: "admin@laws.com", time: "2 hours ago", type: "Config" },
  ];

  // Documents now pulled from centralized procedures system via DepartmentProcedures component

  const handleUpload = () => {
    toast.info("Document upload feature coming soon");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{departmentInfo.name}</h1>
            <p className="text-muted-foreground">
              Administrator: <span className="font-medium text-foreground">{departmentInfo.manager}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{departmentInfo.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/platform-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Platform Simulator
              </Button>
            </Link>
            <Link href="/platform-settings">
              <Button className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
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
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* System Health */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">System Health</h3>
                <div className="space-y-3">
                  {systemHealth.map((system, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{system.component}</p>
                          <p className="text-xs text-muted-foreground">Latency: {system.latency} • Uptime: {system.uptime}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-xs">{system.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">{activity.type}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/user-management">
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    Users
                  </Button>
                </Link>
                <Link href="/platform-settings">
                  <Button variant="outline" className="w-full gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </Link>
                <Link href="/security-center">
                  <Button variant="outline" className="w-full gap-2">
                    <Shield className="w-4 h-4" />
                    Security
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2" onClick={() => setActiveTab("documents")}>
                  <FolderOpen className="w-4 h-4" />
                  Documents
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemHealth.map((system, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Activity className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{system.component}</h3>
                        <p className="text-sm text-muted-foreground">Response Time: {system.latency}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">{system.status}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">{system.uptime}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">Details</Button>
                    <Button variant="outline" size="sm" className="flex-1">Logs</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Activity Log</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{activity.type}</Badge>
                      <Button variant="outline" size="sm">Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            <DepartmentProcedures 
              department="Platform" 
              title="Platform Document Repository"
              description="Technical documentation, API guides, and platform configuration"
              showCategories={true}
              showSearch={true}
            />
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Department Team</h3>
                <Link href="/employee-directory?department=platform%20admin">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    View Full Directory
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                      LR
                    </div>
                    <div>
                      <p className="font-medium text-foreground">LaShanna K. Russell</p>
                      <p className="text-sm text-muted-foreground">Platform Administrator</p>
                    </div>
                  </div>
                  <Badge className="bg-indigo-500">Admin</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">DevOps Engineer</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/employee-directory?department=platform%20admin">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All Platform Admin Team Members
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
