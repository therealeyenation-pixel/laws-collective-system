import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Users,
  Activity,
  Calendar,
  FileText,
  Play,
  FolderOpen,
  CheckCircle,
  Clock,
  Target,
  Smile,
  Brain,
  Dumbbell,
  Apple,
} from "lucide-react";
import { Link } from "wouter";
import { DepartmentProcedures } from "@/components/DepartmentProcedures";

export default function HealthDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "Health & Wellness Department",
    manager: "Amber S. Hunter",
    role: "Health Manager",
    description: "Promoting holistic wellness across the organization through programs and resources",
  };

  const metrics = [
    { label: "Wellness Programs", value: 5, icon: Heart, color: "text-red-500" },
    { label: "Active Participants", value: 24, icon: Users, color: "text-blue-500" },
    { label: "Events This Month", value: 3, icon: Calendar, color: "text-purple-500" },
    { label: "Resources Available", value: 12, icon: FileText, color: "text-green-500" },
    { label: "Satisfaction Score", value: "92%", icon: Smile, color: "text-amber-500" },
  ];

  const wellnessPrograms = [
    { name: "Mental Health Awareness", category: "Mental", participants: 18, status: "Active" },
    { name: "Physical Fitness Challenge", category: "Physical", participants: 12, status: "Active" },
    { name: "Nutrition Workshop", category: "Nutrition", participants: 8, status: "Upcoming" },
    { name: "Stress Management", category: "Mental", participants: 15, status: "Active" },
    { name: "Work-Life Balance", category: "Lifestyle", participants: 20, status: "Active" },
  ];

  const upcomingEvents = [
    { event: "Team Wellness Walk", date: "Jan 25, 2026", type: "Physical" },
    { event: "Meditation Session", date: "Jan 27, 2026", type: "Mental" },
    { event: "Healthy Cooking Demo", date: "Feb 1, 2026", type: "Nutrition" },
  ];

  const categoryIcons: Record<string, any> = {
    Mental: Brain,
    Physical: Dumbbell,
    Nutrition: Apple,
    Lifestyle: Heart,
  };

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
            <Link href="/health-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Health Simulator
              </Button>
            </Link>
            <Link href="/wellness-programs">
              <Button className="gap-2">
                <Heart className="w-4 h-4" />
                Programs
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
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Active Programs */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Active Programs</h3>
                <div className="space-y-3">
                  {wellnessPrograms.filter(p => p.status === "Active").map((program) => {
                    const Icon = categoryIcons[program.category] || Heart;
                    return (
                      <div key={program.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-red-500" />
                          <div>
                            <p className="font-medium text-foreground text-sm">{program.name}</p>
                            <p className="text-xs text-muted-foreground">{program.participants} participants</p>
                          </div>
                        </div>
                        <Badge variant="default">{program.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Upcoming Events */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{event.event}</p>
                          <p className="text-xs text-muted-foreground">{event.date}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{event.type}</Badge>
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
                  <Heart className="w-4 h-4" />
                  New Program
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Event
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <FileText className="w-4 h-4" />
                  Resources
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Activity className="w-4 h-4" />
                  Reports
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wellnessPrograms.map((program) => {
                const Icon = categoryIcons[program.category] || Heart;
                return (
                  <Card key={program.name} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                          <Icon className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{program.name}</h3>
                          <p className="text-sm text-muted-foreground">{program.category}</p>
                        </div>
                      </div>
                      <Badge variant={program.status === "Active" ? "default" : "secondary"}>
                        {program.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{program.participants} participants</p>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Upcoming Wellness Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <Calendar className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{event.event}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{event.type}</Badge>
                      <Button variant="outline" size="sm">RSVP</Button>
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
                <Link href="/employee-directory?department=health">
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
                      AH
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Amber S. Hunter</p>
                      <p className="text-sm text-muted-foreground">Health Manager</p>
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
                      <p className="font-medium text-foreground">Health Coordinator</p>
                      <p className="text-sm text-muted-foreground">Ready to Hire</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/employee-directory?department=health">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All Health Team Members
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <DepartmentProcedures 
              department="Health" 
              title="Health & Wellness Document Repository"
              description="Wellness programs, health policies, safety protocols, and wellness resources"
              showCategories={true}
              showSearch={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
