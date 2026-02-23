import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Users,
  Building2,
  DollarSign,
  Play,
  TrendingUp,
  Home,
  FileText,
  Calendar,
  Key,
} from "lucide-react";
import { Link } from "wouter";
import { GovernmentActionsWidget } from "@/components/GovernmentActionsWidget";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";

export default function RealEstateDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "Real Estate Department",
    managers: ["Kenneth Coleman", "Treiva Hunter"],
    role: "Real Estate Managers",
    description: "Managing property acquisitions, leases, and real estate investments",
  };

  const metrics = [
    { label: "Properties", value: 3, icon: Building2, color: "text-blue-500" },
    { label: "Total Value", value: "$1.2M", icon: DollarSign, color: "text-green-500" },
    { label: "Active Leases", value: 2, icon: FileText, color: "text-purple-500" },
    { label: "Occupancy", value: "85%", icon: Home, color: "text-amber-500" },
    { label: "Monthly Income", value: "$8.5K", icon: TrendingUp, color: "text-emerald-500" },
  ];

  const properties = [
    { name: "Main Office Building", type: "Commercial", location: "Downtown", value: "$650,000", status: "Owned", occupancy: "100%" },
    { name: "Training Center", type: "Commercial", location: "Midtown", value: "$350,000", status: "Leased", occupancy: "80%" },
    { name: "Storage Facility", type: "Industrial", location: "Warehouse District", value: "$200,000", status: "Owned", occupancy: "75%" },
  ];

  const upcomingLeases = [
    { property: "Training Center", action: "Renewal", date: "Mar 15, 2026", tenant: "L.A.W.S. Academy" },
    { property: "Storage Unit B", action: "New Lease", date: "Feb 1, 2026", tenant: "Pending" },
  ];

  const recentTransactions = [
    { type: "Rent Payment", property: "Training Center", amount: 3500, date: "Jan 15, 2026" },
    { type: "Maintenance", property: "Main Office", amount: -850, date: "Jan 12, 2026" },
    { type: "Rent Payment", property: "Storage Facility", amount: 1200, date: "Jan 10, 2026" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{departmentInfo.name}</h1>
            <p className="text-muted-foreground">
              Managers: <span className="font-medium text-foreground">{departmentInfo.managers.join(" & ")}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{departmentInfo.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/real-estate-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Real Estate Simulator
              </Button>
            </Link>
            <Link href="/properties">
              <Button className="gap-2">
                <Building2 className="w-4 h-4" />
                Properties
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
        {/* Live Ticker and Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <LiveTicker department="realestate" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        </div>

        {/* Government Actions */}
        <GovernmentActionsWidget department="real-estate" />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="leases">Leases</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Properties Overview */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Property Portfolio</h3>
                <div className="space-y-3">
                  {properties.map((property) => (
                    <div key={property.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{property.name}</p>
                          <p className="text-xs text-muted-foreground">{property.type} • {property.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{property.value}</p>
                        <Badge variant={property.status === "Owned" ? "default" : "secondary"} className="text-xs">
                          {property.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Upcoming Leases */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Upcoming Lease Actions</h3>
                <div className="space-y-3">
                  {upcomingLeases.map((lease, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{lease.property}</p>
                          <p className="text-xs text-muted-foreground">{lease.action} • {lease.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{lease.tenant}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/properties">
                  <Button variant="outline" className="w-full gap-2">
                    <Building2 className="w-4 h-4" />
                    View Properties
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2">
                  <FileText className="w-4 h-4" />
                  New Lease
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <MapPin className="w-4 h-4" />
                  Property Search
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Market Analysis
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <Card key={property.name} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{property.name}</h3>
                      <p className="text-sm text-muted-foreground">{property.type}</p>
                    </div>
                    <Badge variant={property.status === "Owned" ? "default" : "secondary"}>
                      {property.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">{property.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value</span>
                      <span className="font-medium">{property.value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Occupancy</span>
                      <span className="font-medium">{property.occupancy}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">Details</Button>
                    <Button variant="outline" size="sm" className="flex-1">Manage</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leases" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Active Leases</h3>
              <div className="space-y-4">
                {upcomingLeases.map((lease, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <Key className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{lease.property}</p>
                        <p className="text-sm text-muted-foreground">{lease.action} • {lease.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{lease.tenant}</Badge>
                      <Button variant="outline" size="sm">Review</Button>
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
                <Link href="/employee-directory?department=real%20estate">
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
                      KC
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Kenneth Coleman</p>
                      <p className="text-sm text-muted-foreground">Real Estate Manager</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500">Manager</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      TH
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Treiva Hunter</p>
                      <p className="text-sm text-muted-foreground">Real Estate Manager</p>
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
                      <p className="font-medium text-foreground">Real Estate Coordinator</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/employee-directory?department=real%20estate">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All Real Estate Team Members
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
