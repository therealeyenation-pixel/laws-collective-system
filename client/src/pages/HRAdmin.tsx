import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  ClipboardList,
  FileText,
  Building2,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";
import InterviewProcessManager from "@/components/InterviewProcessManager";

export default function HRAdmin() {
  const stats = [
    { label: "Open Positions", value: "12", icon: UserPlus, trend: "+3 this month" },
    { label: "Active Candidates", value: "8", icon: Users, trend: "In pipeline" },
    { label: "Interviews Scheduled", value: "5", icon: Calendar, trend: "This week" },
    { label: "Positions Filled", value: "6", icon: Award, trend: "YTD" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Administration</h1>
          <p className="text-muted-foreground">
            Manage hiring, interviews, and workforce development
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="interviews" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="interviews">Interview Process</TabsTrigger>
            <TabsTrigger value="positions">Position Management</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="development">Staff Development</TabsTrigger>
          </TabsList>

          <TabsContent value="interviews" className="mt-6">
            <InterviewProcessManager />
          </TabsContent>

          <TabsContent value="positions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Position Management</CardTitle>
                <CardDescription>
                  Manage open positions and staffing requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800">Filled</Badge>
                          <span className="text-2xl font-bold">6</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Family & identified candidates</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">Open</Badge>
                          <span className="text-2xl font-bold">12</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Actively recruiting</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-amber-100 text-amber-800">Future</Badge>
                          <span className="text-2xl font-bold">12</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Pending manager hire</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = "/careers"}>
                    <Building2 className="w-4 h-4 mr-2" />
                    View All Positions on Careers Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Checklist</CardTitle>
                <CardDescription>
                  Standard onboarding process for new hires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: "Pre-boarding", items: ["Offer letter signed", "Background check complete", "Equipment ordered", "System access requested"] },
                    { step: "Day 1", items: ["Welcome orientation", "HR paperwork", "Benefits enrollment", "AI agent introduction"] },
                    { step: "Week 1", items: ["Department training", "Mentor assignment", "Goal setting", "System training"] },
                    { step: "30-Day Check-in", items: ["Performance review", "Feedback session", "Training completion", "Integration assessment"] },
                  ].map((phase) => (
                    <Card key={phase.step} className="bg-secondary/30">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-2">{phase.step}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {phase.items.map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm">
                              <div className="w-4 h-4 rounded border border-primary/50" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="development" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Development Programs</CardTitle>
                <CardDescription>
                  Training and growth opportunities for team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "AI Agent Collaboration Training",
                      description: "Learn to effectively work with AI assistants to maximize productivity",
                      duration: "4 hours",
                      status: "Required",
                    },
                    {
                      title: "L.A.W.S. Framework Certification",
                      description: "Deep understanding of Land, Air, Water, Self principles",
                      duration: "8 hours",
                      status: "Required",
                    },
                    {
                      title: "Entrepreneurship Pathway",
                      description: "Prepare for transition from employee to business owner",
                      duration: "20 hours",
                      status: "Optional",
                    },
                    {
                      title: "Leadership Development",
                      description: "Skills for managing teams and leading initiatives",
                      duration: "16 hours",
                      status: "Manager Track",
                    },
                  ].map((program) => (
                    <Card key={program.title} className="bg-secondary/30">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{program.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">Duration: {program.duration}</p>
                          </div>
                          <Badge variant={program.status === "Required" ? "default" : "outline"}>
                            {program.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
