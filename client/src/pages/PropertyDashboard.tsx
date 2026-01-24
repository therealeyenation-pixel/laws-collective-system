import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Users,
  Package,
  Monitor,
  Play,
  CheckCircle,
  Clock,
  DollarSign,
  Clipboard,
  AlertTriangle,
  Key,
} from "lucide-react";
import { Link } from "wouter";

export default function PropertyDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "Property Department",
    manager: "Talbert Cox",
    role: "Property Manager",
    description: "Managing organizational assets, software licenses, and property tracking",
  };

  const metrics = [
    { label: "Total Assets", value: 89, icon: Package, color: "text-blue-500" },
    { label: "Software Licenses", value: 24, icon: Monitor, color: "text-purple-500" },
    { label: "Asset Value", value: "$156K", icon: DollarSign, color: "text-green-500" },
    { label: "Expiring Soon", value: 5, icon: AlertTriangle, color: "text-amber-500" },
    { label: "Assigned", value: 72, icon: Key, color: "text-emerald-500" },
  ];

  const assets = [
    { name: "MacBook Pro 16\"", type: "Hardware", assignee: "LaShanna K. Russell", status: "Active", value: "$2,499" },
    { name: "Dell Monitor 27\"", type: "Hardware", assignee: "Craig Russell", status: "Active", value: "$399" },
    { name: "Office Desk", type: "Furniture", assignee: "Office", status: "Active", value: "$450" },
    { name: "Projector", type: "Equipment", assignee: "Conference Room", status: "Active", value: "$899" },
  ];

  const softwareLicenses = [
    { name: "Adobe Creative Suite", seats: 5, used: 3, expiry: "Dec 2026", status: "Active" },
    { name: "Microsoft 365", seats: 15, used: 12, expiry: "Mar 2026", status: "Active" },
    { name: "Slack Business", seats: 20, used: 18, expiry: "Jun 2026", status: "Active" },
    { name: "Figma", seats: 3, used: 2, expiry: "Feb 2026", status: "Expiring" },
  ];

  const maintenanceSchedule = [
    { asset: "HVAC System", type: "Preventive", date: "Jan 25, 2026", status: "Scheduled" },
    { asset: "Server Room", type: "Inspection", date: "Feb 1, 2026", status: "Scheduled" },
    { asset: "Fire Extinguishers", type: "Certification", date: "Feb 15, 2026", status: "Pending" },
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
            <Link href="/property-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Property Simulator
              </Button>
            </Link>
            <Link href="/asset-tracking">
              <Button className="gap-2">
                <Clipboard className="w-4 h-4" />
                Track Asset
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
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Assets */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Recent Assets</h3>
                <div className="space-y-3">
                  {assets.map((asset, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.type} • {asset.assignee}</p>
                        </div>
                      </div>
                      <span className="font-medium text-foreground">{asset.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Software Licenses */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Software Licenses</h3>
                <div className="space-y-3">
                  {softwareLicenses.slice(0, 3).map((license, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{license.name}</p>
                          <p className="text-xs text-muted-foreground">{license.used}/{license.seats} seats used</p>
                        </div>
                      </div>
                      <Badge variant={license.status === "Expiring" ? "destructive" : "default"} className="text-xs">
                        {license.status}
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
                <Link href="/asset-tracking">
                  <Button variant="outline" className="w-full gap-2">
                    <Clipboard className="w-4 h-4" />
                    Asset Tracking
                  </Button>
                </Link>
                <Link href="/software-licenses">
                  <Button variant="outline" className="w-full gap-2">
                    <Monitor className="w-4 h-4" />
                    Licenses
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2">
                  <Package className="w-4 h-4" />
                  Add Asset
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Clock className="w-4 h-4" />
                  Maintenance
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((asset, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{asset.name}</h3>
                      <p className="text-sm text-muted-foreground">{asset.type}</p>
                    </div>
                    <Badge variant="default">{asset.status}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned To</span>
                      <span className="font-medium">{asset.assignee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value</span>
                      <span className="font-medium">{asset.value}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">View</Button>
                    <Button variant="outline" size="sm" className="flex-1">Transfer</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="licenses" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {softwareLicenses.map((license, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Monitor className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{license.name}</h3>
                        <p className="text-sm text-muted-foreground">Expires {license.expiry}</p>
                      </div>
                    </div>
                    <Badge variant={license.status === "Expiring" ? "destructive" : "default"}>
                      {license.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Seats Used</span>
                      <span className="font-medium">{license.used} / {license.seats}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all" 
                        style={{ width: `${(license.used / license.seats) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">Manage</Button>
                    <Button variant="outline" size="sm" className="flex-1">Assign</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Department Team</h3>
                <Link href="/employee-directory?department=property">
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
                      TC
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Talbert Cox</p>
                      <p className="text-sm text-muted-foreground">Property Manager</p>
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
                      <p className="font-medium text-foreground">Property Coordinator</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/employee-directory?department=property">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All Property Team Members
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
