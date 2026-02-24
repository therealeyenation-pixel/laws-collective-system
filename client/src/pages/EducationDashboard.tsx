import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Play,
  Award,
  Clock,
  Target,
  Video,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { DepartmentProcedures } from "@/components/DepartmentProcedures";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import { GovernmentActionsWidget } from "@/components/GovernmentActionsWidget";

export default function EducationDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "Education Department",
    manager: "Cornelius Christopher",
    role: "Education Manager",
    description: "Developing and delivering educational programs through L.A.W.S. Academy",
  };

  const metrics = [
    { label: "Active Courses", value: 8, icon: BookOpen, color: "text-blue-500" },
    { label: "Enrolled Students", value: 45, icon: Users, color: "text-green-500" },
    { label: "Instructors", value: 3, icon: GraduationCap, color: "text-purple-500" },
    { label: "Completion Rate", value: "78%", icon: Award, color: "text-amber-500" },
    { label: "Certifications", value: 12, icon: CheckCircle, color: "text-emerald-500" },
  ];

  const courses = [
    { name: "Financial Literacy 101", category: "SELF", students: 15, status: "Active", progress: 65 },
    { name: "Business Formation Basics", category: "SELF", students: 12, status: "Active", progress: 45 },
    { name: "Grant Writing Workshop", category: "SELF", students: 8, status: "Active", progress: 80 },
    { name: "Family History Research", category: "LAND", students: 10, status: "Active", progress: 30 },
    { name: "Healing & Balance", category: "WATER", students: 18, status: "Upcoming", progress: 0 },
  ];

  const upcomingClasses = [
    { course: "Financial Literacy 101", date: "Jan 22, 2026", time: "6:00 PM", instructor: "Cornelius C." },
    { course: "Business Formation", date: "Jan 24, 2026", time: "7:00 PM", instructor: "LaShanna R." },
    { course: "Grant Writing", date: "Jan 26, 2026", time: "5:00 PM", instructor: "TBD" },
  ];

  const lawsCategories = {
    LAND: { color: "bg-amber-500", label: "Land - Reconnection" },
    AIR: { color: "bg-sky-500", label: "Air - Education" },
    WATER: { color: "bg-blue-500", label: "Water - Healing" },
    SELF: { color: "bg-purple-500", label: "Self - Purpose" },
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
            <Link href="/education-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Education Simulator
              </Button>
            </Link>
            <Link href="/academy">
              <Button className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Academy
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

        {/* Live Ticker and Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <LiveTicker department="education" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        {/* Government Actions */}
        <GovernmentActionsWidget department="education" showStats />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Active Courses */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Active Courses</h3>
                <div className="space-y-3">
                  {courses.filter(c => c.status === "Active").slice(0, 4).map((course) => {
                    const category = lawsCategories[course.category as keyof typeof lawsCategories];
                    return (
                      <div key={course.name} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${category?.color || "bg-gray-500"}`} />
                            <p className="font-medium text-foreground text-sm">{course.name}</p>
                          </div>
                          <Badge variant="secondary">{course.students} students</Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{course.progress}% complete</p>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Upcoming Classes */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Upcoming Classes</h3>
                <div className="space-y-3">
                  {upcomingClasses.map((cls, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{cls.course}</p>
                          <p className="text-xs text-muted-foreground">{cls.date} at {cls.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{cls.instructor}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* L.A.W.S. Framework */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">L.A.W.S. Framework Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(lawsCategories).map(([key, value]) => (
                  <div key={key} className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className={`w-8 h-8 rounded-full ${value.color} mx-auto mb-2`} />
                    <p className="font-medium text-foreground">{key}</p>
                    <p className="text-xs text-muted-foreground">{value.label.split(" - ")[1]}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const category = lawsCategories[course.category as keyof typeof lawsCategories];
                return (
                  <Card key={course.name} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${category?.color || "bg-gray-500"}`} />
                          <Badge variant="outline">{course.category}</Badge>
                        </div>
                        <h3 className="font-semibold text-foreground">{course.name}</h3>
                      </div>
                      <Badge variant={course.status === "Active" ? "default" : "secondary"}>
                        {course.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Students</span>
                        <span className="font-medium">{course.students}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">View Course</Button>
                      <Button variant="outline" size="sm" className="flex-1">Manage</Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Class Schedule</h3>
              <div className="space-y-4">
                {upcomingClasses.map((cls, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Video className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{cls.course}</p>
                        <p className="text-sm text-muted-foreground">Instructor: {cls.instructor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{cls.date}</p>
                      <p className="text-sm text-muted-foreground">{cls.time}</p>
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
                <Link href="/employee-directory?department=education">
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
                      CC
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Cornelius Christopher</p>
                      <p className="text-sm text-muted-foreground">Education Manager</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500">Manager</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Education Coordinator</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/employee-directory?department=education">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All Education Team Members
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <DepartmentProcedures 
              department="Education" 
              title="Education Document Repository"
              description="Curriculum materials, course outlines, training guides, and educational resources"
              showCategories={true}
              showSearch={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
