import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music,
  Users,
  Video,
  Mic,
  Calendar,
  FileText,
  Play,
  Share2,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Link } from "wouter";
import { DepartmentProcedures } from "@/components/DepartmentProcedures";

export default function MediaDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "Media Department",
    manager: "Amandes Pearsall IV",
    role: "Media Manager",
    description: "Creating and distributing multimedia content across all platforms",
  };

  const metrics = [
    { label: "Active Productions", value: 4, icon: Video, color: "text-red-500" },
    { label: "Content Pieces", value: 32, icon: FileText, color: "text-blue-500" },
    { label: "Total Views", value: "12.5K", icon: Eye, color: "text-purple-500" },
    { label: "Engagement Rate", value: "8.2%", icon: Heart, color: "text-pink-500" },
    { label: "Scheduled Posts", value: 15, icon: Calendar, color: "text-amber-500" },
  ];

  const productions = [
    { name: "Academy Promo Video", type: "Video", status: "In Production", platform: "YouTube" },
    { name: "Weekly Podcast", type: "Audio", status: "Recording", platform: "Spotify" },
    { name: "Social Media Campaign", type: "Mixed", status: "Active", platform: "Multi" },
    { name: "Documentary Series", type: "Video", status: "Planning", platform: "YouTube" },
  ];

  const contentCalendar = [
    { content: "Academy Launch Announcement", platform: "Instagram", date: "Jan 22", status: "Scheduled" },
    { content: "Grant Success Story", platform: "LinkedIn", date: "Jan 24", status: "Draft" },
    { content: "Podcast Episode #5", platform: "Spotify", date: "Jan 26", status: "Scheduled" },
    { content: "Team Introduction Video", platform: "YouTube", date: "Jan 28", status: "In Review" },
  ];

  const platformStats = [
    { platform: "YouTube", followers: "2.1K", growth: "+12%", icon: Video },
    { platform: "Instagram", followers: "5.4K", growth: "+8%", icon: Share2 },
    { platform: "LinkedIn", followers: "1.8K", growth: "+15%", icon: Users },
    { platform: "Podcast", listeners: "890", growth: "+22%", icon: Mic },
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
            <Link href="/media-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Media Simulator
              </Button>
            </Link>
            <Link href="/social-media">
              <Button className="gap-2">
                <Share2 className="w-4 h-4" />
                Social Media
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
            <TabsTrigger value="productions">Productions</TabsTrigger>
            <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Active Productions */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Active Productions</h3>
                <div className="space-y-3">
                  {productions.map((prod) => (
                    <div key={prod.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {prod.type === "Video" ? (
                          <Video className="w-4 h-4 text-red-500" />
                        ) : prod.type === "Audio" ? (
                          <Mic className="w-4 h-4 text-purple-500" />
                        ) : (
                          <Share2 className="w-4 h-4 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium text-foreground text-sm">{prod.name}</p>
                          <p className="text-xs text-muted-foreground">{prod.platform}</p>
                        </div>
                      </div>
                      <Badge variant={prod.status === "Active" ? "default" : "secondary"}>
                        {prod.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Platform Stats */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Platform Performance</h3>
                <div className="space-y-3">
                  {platformStats.map((stat) => (
                    <div key={stat.platform} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <stat.icon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{stat.platform}</p>
                          <p className="text-xs text-muted-foreground">{stat.followers} followers</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.growth}
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
                <Button variant="outline" className="w-full gap-2">
                  <Video className="w-4 h-4" />
                  New Video
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Mic className="w-4 h-4" />
                  Record Podcast
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Post
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="productions" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productions.map((prod) => (
                <Card key={prod.name} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        prod.type === "Video" ? "bg-red-100 dark:bg-red-900/30" :
                        prod.type === "Audio" ? "bg-purple-100 dark:bg-purple-900/30" :
                        "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        {prod.type === "Video" ? (
                          <Video className="w-5 h-5 text-red-500" />
                        ) : prod.type === "Audio" ? (
                          <Mic className="w-5 h-5 text-purple-500" />
                        ) : (
                          <Share2 className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{prod.name}</h3>
                        <p className="text-sm text-muted-foreground">{prod.type} • {prod.platform}</p>
                      </div>
                    </div>
                    <Badge variant={prod.status === "Active" ? "default" : "secondary"}>
                      {prod.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">View</Button>
                    <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Upcoming Content</h3>
              <div className="space-y-4">
                {contentCalendar.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.content}</p>
                        <p className="text-sm text-muted-foreground">{item.platform} • {item.date}</p>
                      </div>
                    </div>
                    <Badge variant={
                      item.status === "Scheduled" ? "default" :
                      item.status === "Draft" ? "secondary" : "outline"
                    }>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Department Team</h3>
                <Link href="/employee-directory?department=media">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    View Full Directory
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                      AP
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Amandes Pearsall IV</p>
                      <p className="text-sm text-muted-foreground">Media Manager</p>
                    </div>
                  </div>
                  <Badge className="bg-red-500">Manager</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Media Coordinator</p>
                      <p className="text-sm text-muted-foreground">Ready to Hire</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/employee-directory?department=media">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All Media Team Members
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <DepartmentProcedures 
              department="Media" 
              title="Media Document Repository"
              description="Production guidelines, content calendars, brand voice guides, and media policies"
              showCategories={true}
              showSearch={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
