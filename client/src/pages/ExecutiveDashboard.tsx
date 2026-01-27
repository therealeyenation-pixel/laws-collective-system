import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  FileText,
  Award,
  Briefcase,
  GraduationCap,
  Heart,
  Scale,
  Leaf,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Link } from "wouter";
import { GovernmentActionsWidget } from "@/components/GovernmentActionsWidget";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";

export default function ExecutiveDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Entity overview
  const entities = [
    { 
      name: "Calea Freeman Family Trust", 
      type: "Trust",
      icon: Scale,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      status: "Active",
      revenue: "$0",
      employees: 1
    },
    { 
      name: "L.A.W.S. Collective", 
      type: "501(c)(3)",
      icon: Leaf,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      status: "Active",
      revenue: "$0",
      employees: 0
    },
    { 
      name: "LAWS, LLC", 
      type: "LLC",
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      status: "Active",
      revenue: "$0",
      employees: 0
    },
    { 
      name: "Temple of LuvOnPurpose", 
      type: "508(c)(1)(a)",
      icon: GraduationCap,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      status: "Active",
      revenue: "$0",
      employees: 1
    },
    { 
      name: "Real-Eye-Nation", 
      type: "LLC",
      icon: Activity,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      status: "Active",
      revenue: "$0",
      employees: 1
    },
  ];

  const keyMetrics = [
    { label: "Total Entities", value: "5", icon: Building2, color: "text-blue-500", change: null },
    { label: "Team Members", value: "5", icon: Users, color: "text-green-500", change: null },
    { label: "Open Positions", value: "20+", icon: Briefcase, color: "text-yellow-500", change: null },
    { label: "Active Programs", value: "4", icon: Target, color: "text-purple-500", change: null },
  ];

  const strategicGoals = [
    { goal: "Complete organizational staffing", progress: 15, target: "Q2 2026" },
    { goal: "Launch Academy certification programs", progress: 25, target: "Q1 2026" },
    { goal: "Establish L.A.W.S. community programs", progress: 10, target: "Q3 2026" },
    { goal: "Secure initial grant funding", progress: 5, target: "Q2 2026" },
    { goal: "Launch LAWS platform beta", progress: 20, target: "Q4 2026" },
  ];

  const lawsPillars = [
    { name: "LAND", description: "Reconnection & Stability", icon: Leaf, color: "text-amber-600", progress: 15 },
    { name: "AIR", description: "Education & Knowledge", icon: GraduationCap, color: "text-sky-500", progress: 25 },
    { name: "WATER", description: "Healing & Balance", icon: Heart, color: "text-blue-500", progress: 10 },
    { name: "SELF", description: "Purpose & Skills", icon: Target, color: "text-emerald-500", progress: 20 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Executive Dashboard</h1>
            <p className="text-muted-foreground">
              High-level KPIs across all entities and strategic initiatives
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/operations-dashboard">
              <Button variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Operations
              </Button>
            </Link>
            <Link href="/hr-dashboard">
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                HR
              </Button>
            </Link>
            <Link href="/luv-ledger">
              <Button className="gap-2">
                <DollarSign className="w-4 h-4" />
                LuvLedger
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {keyMetrics.map((metric) => (
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
        {/* Live Ticker and Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <LiveTicker department="executive" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        </div>

        {/* Government Actions */}
        <GovernmentActionsWidget department="executive" showStats />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="goals">Strategic Goals</TabsTrigger>
            <TabsTrigger value="laws">L.A.W.S. Pillars</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Entity Summary */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Entity Overview</h3>
                <div className="space-y-3">
                  {entities.map((entity) => (
                    <div key={entity.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${entity.bgColor} ${entity.color}`}>
                          <entity.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">{entity.name}</span>
                          <p className="text-xs text-muted-foreground">{entity.type}</p>
                        </div>
                      </div>
                      <Badge variant="default">{entity.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* L.A.W.S. Pillars Progress */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">L.A.W.S. Framework Progress</h3>
                <div className="space-y-4">
                  {lawsPillars.map((pillar) => (
                    <div key={pillar.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <pillar.icon className={`w-4 h-4 ${pillar.color}`} />
                          <span className="text-sm font-medium text-foreground">{pillar.name}</span>
                          <span className="text-xs text-muted-foreground">- {pillar.description}</span>
                        </div>
                        <span className="text-sm text-foreground">{pillar.progress}%</span>
                      </div>
                      <Progress value={pillar.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Executive Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/trust-governance">
                  <Button variant="outline" className="w-full gap-2">
                    <Scale className="w-4 h-4" />
                    Trust Governance
                  </Button>
                </Link>
                <Link href="/financial-automation">
                  <Button variant="outline" className="w-full gap-2">
                    <DollarSign className="w-4 h-4" />
                    Financial Map
                  </Button>
                </Link>
                <Link href="/employees">
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    Org Structure
                  </Button>
                </Link>
                <Link href="/system">
                  <Button variant="outline" className="w-full gap-2">
                    <Award className="w-4 h-4" />
                    Token Economy
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="entities" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entities.map((entity) => (
                <Card key={entity.name} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${entity.bgColor} ${entity.color}`}>
                      <entity.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{entity.name}</h3>
                      <Badge variant="secondary" className="mt-1">{entity.type}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="default">{entity.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Members:</span>
                      <span className="text-foreground">{entity.employees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="text-foreground">{entity.revenue}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Strategic Goals</h3>
              <div className="space-y-4">
                {strategicGoals.map((item, idx) => (
                  <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{item.goal}</span>
                      <Badge variant="secondary">{item.target}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={item.progress} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-12">{item.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="laws" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lawsPillars.map((pillar) => (
                <Card key={pillar.name} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg bg-muted ${pillar.color}`}>
                      <pillar.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{pillar.name}</h3>
                      <p className="text-sm text-muted-foreground">{pillar.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Implementation Progress</span>
                      <span className="text-foreground">{pillar.progress}%</span>
                    </div>
                    <Progress value={pillar.progress} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {pillar.name === "LAND" && "Focus on land reconnection, family history, and generational stability programs."}
                      {pillar.name === "AIR" && "Academy programs, certifications, and educational content development."}
                      {pillar.name === "WATER" && "Wellness programs, mental health resources, and healing initiatives."}
                      {pillar.name === "SELF" && "Financial literacy, business readiness, and purpose-driven skill building."}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
