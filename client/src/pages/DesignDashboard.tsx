import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Users,
  Image,
  Layers,
  FileText,
  Play,
  FolderOpen,
  CheckCircle,
  Clock,
  Sparkles,
  Hexagon,
  PenTool,
} from "lucide-react";
import { Link } from "wouter";

export default function DesignDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "Design Department",
    manager: "Essence M. Hunter",
    role: "Design Manager",
    description: "Creating visual identity, brand assets, and NFT/Web3 digital experiences",
  };

  const metrics = [
    { label: "Active Projects", value: 6, icon: Palette, color: "text-pink-500" },
    { label: "Brand Assets", value: 48, icon: Image, color: "text-purple-500" },
    { label: "NFT Collections", value: 2, icon: Hexagon, color: "text-blue-500" },
    { label: "Team Members", value: 3, icon: Users, color: "text-green-500" },
    { label: "Completed", value: 24, icon: CheckCircle, color: "text-emerald-500" },
  ];

  const projects = [
    { name: "L.A.W.S. Brand Guidelines", type: "Branding", status: "In Progress", progress: 75 },
    { name: "Academy Course Graphics", type: "Digital", status: "In Progress", progress: 40 },
    { name: "NFT Collection - Genesis", type: "NFT/Web3", status: "Planning", progress: 15 },
    { name: "Social Media Templates", type: "Digital", status: "Complete", progress: 100 },
    { name: "Website UI Refresh", type: "UI/UX", status: "In Progress", progress: 60 },
    { name: "Print Materials", type: "Print", status: "Pending", progress: 0 },
  ];

  const brandAssets = [
    { category: "Logos", count: 12, icon: Sparkles },
    { category: "Icons", count: 24, icon: Layers },
    { category: "Templates", count: 8, icon: FileText },
    { category: "Illustrations", count: 4, icon: PenTool },
  ];

  const recentActivity = [
    { action: "Logo variations completed", project: "L.A.W.S. Brand", date: "2 hours ago" },
    { action: "NFT concept approved", project: "Genesis Collection", date: "Yesterday" },
    { action: "Social templates delivered", project: "Social Media", date: "2 days ago" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{departmentInfo.name}</h1>
              <Badge variant="secondary" className="bg-pink-500/10 text-pink-600">NFT/Web3</Badge>
            </div>
            <p className="text-muted-foreground">
              Manager: <span className="font-medium text-foreground">{departmentInfo.manager}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{departmentInfo.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/design-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Design Simulator
              </Button>
            </Link>
            <Link href="/design-department">
              <Button className="gap-2">
                <Palette className="w-4 h-4" />
                Projects
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
            <TabsTrigger value="assets">Brand Assets</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Active Projects */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Active Projects</h3>
                <div className="space-y-3">
                  {projects.filter(p => p.status === "In Progress").map((project) => (
                    <div key={project.name} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground text-sm">{project.name}</p>
                        <Badge variant="outline">{project.type}</Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full transition-all" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{project.progress}% complete</p>
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
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.project}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.date}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Brand Assets Summary */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Brand Assets Library</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brandAssets.map((asset) => (
                  <div key={asset.category} className="p-4 bg-muted/50 rounded-lg text-center">
                    <asset.icon className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                    <p className="text-2xl font-bold text-foreground">{asset.count}</p>
                    <p className="text-sm text-muted-foreground">{asset.category}</p>
                  </div>
                ))}
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
                      <p className="text-sm text-muted-foreground">{project.type}</p>
                    </div>
                    <Badge variant={
                      project.status === "Complete" ? "default" : 
                      project.status === "In Progress" ? "secondary" : "outline"
                    }>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full transition-all" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{project.progress}% complete</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">View</Button>
                    <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {brandAssets.map((asset) => (
                <Card key={asset.category} className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mx-auto mb-4 flex items-center justify-center">
                      <asset.icon className="w-8 h-8 text-pink-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">{asset.category}</h3>
                    <p className="text-3xl font-bold text-foreground mt-2">{asset.count}</p>
                    <p className="text-sm text-muted-foreground">assets</p>
                    <Button variant="outline" size="sm" className="mt-4 w-full">Browse</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Department Team</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                      EH
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Essence M. Hunter</p>
                      <p className="text-sm text-muted-foreground">Design Manager - NFT/Web3 Specialist</p>
                    </div>
                  </div>
                  <Badge className="bg-pink-500">Manager</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Design Coordinator</p>
                      <p className="text-sm text-muted-foreground">Ready to Hire</p>
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
