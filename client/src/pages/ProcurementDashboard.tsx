import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Users,
  FileText,
  Package,
  Search,
  Play,
  CheckCircle,
  Clock,
  TrendingUp,
  Building2,
  DollarSign,
} from "lucide-react";
import { Link } from "wouter";

export default function ProcurementDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "Procurement Department",
    manager: "Maia Rylandlesesene",
    role: "Procurement Manager",
    status: "Candidate Identified",
    description: "Managing vendor relationships, sourcing, and procurement processes",
  };

  const metrics = [
    { label: "Active RFPs", value: 3, icon: FileText, color: "text-blue-500" },
    { label: "Vendors", value: 12, icon: Building2, color: "text-purple-500" },
    { label: "Pending Orders", value: 5, icon: Package, color: "text-amber-500" },
    { label: "This Month Spend", value: "$8.2K", icon: DollarSign, color: "text-green-500" },
    { label: "Cost Savings", value: "12%", icon: TrendingUp, color: "text-emerald-500" },
  ];

  const activeRFPs = [
    { title: "Office Equipment", responses: 4, deadline: "Jan 30, 2026", status: "Open" },
    { title: "Software Licenses", responses: 6, deadline: "Feb 5, 2026", status: "Open" },
    { title: "Marketing Services", responses: 2, deadline: "Feb 10, 2026", status: "Draft" },
  ];

  const recentOrders = [
    { item: "Adobe Creative Suite", vendor: "Adobe Inc.", amount: 599, status: "Delivered" },
    { item: "Office Supplies", vendor: "Staples", amount: 245, status: "In Transit" },
    { item: "Web Hosting", vendor: "AWS", amount: 150, status: "Active" },
    { item: "Training Materials", vendor: "Various", amount: 350, status: "Pending" },
  ];

  const topVendors = [
    { name: "Adobe Inc.", category: "Software", orders: 5, spend: "$2,995" },
    { name: "Amazon Web Services", category: "Cloud", orders: 12, spend: "$1,800" },
    { name: "Staples", category: "Supplies", orders: 8, spend: "$980" },
    { name: "Canva", category: "Design", orders: 1, spend: "$120" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{departmentInfo.name}</h1>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">{departmentInfo.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              Manager: <span className="font-medium text-foreground">{departmentInfo.manager}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{departmentInfo.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/procurement-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Procurement Simulator
              </Button>
            </Link>
            <Link href="/rfp-generator">
              <Button className="gap-2">
                <FileText className="w-4 h-4" />
                Create RFP
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
            <TabsTrigger value="rfps">RFPs</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Active RFPs */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Active RFPs</h3>
                <div className="space-y-3">
                  {activeRFPs.map((rfp) => (
                    <div key={rfp.title} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground text-sm">{rfp.title}</p>
                        <p className="text-xs text-muted-foreground">{rfp.responses} responses • Due {rfp.deadline}</p>
                      </div>
                      <Badge variant={rfp.status === "Open" ? "default" : "secondary"}>
                        {rfp.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Orders */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {recentOrders.map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{order.item}</p>
                          <p className="text-xs text-muted-foreground">{order.vendor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">${order.amount}</p>
                        <Badge variant={
                          order.status === "Delivered" ? "default" :
                          order.status === "Active" ? "secondary" : "outline"
                        } className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/rfp-generator">
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="w-4 h-4" />
                    New RFP
                  </Button>
                </Link>
                <Link href="/purchase-requests">
                  <Button variant="outline" className="w-full gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Purchase Request
                  </Button>
                </Link>
                <Link href="/vendor-management">
                  <Button variant="outline" className="w-full gap-2">
                    <Search className="w-4 h-4" />
                    Find Vendor
                  </Button>
                </Link>
                <Link href="/procurement-catalog">
                  <Button variant="outline" className="w-full gap-2">
                    <Package className="w-4 h-4" />
                    Catalog
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="rfps" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRFPs.map((rfp) => (
                <Card key={rfp.title} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{rfp.title}</h3>
                    <Badge variant={rfp.status === "Open" ? "default" : "secondary"}>
                      {rfp.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Responses</span>
                      <span className="font-medium">{rfp.responses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deadline</span>
                      <span className="font-medium">{rfp.deadline}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">View</Button>
                    <Button variant="outline" size="sm" className="flex-1">Responses</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Top Vendors</h3>
              <div className="space-y-4">
                {topVendors.map((vendor) => (
                  <div key={vendor.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <Building2 className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{vendor.category} • {vendor.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{vendor.spend}</p>
                      <p className="text-xs text-muted-foreground">Total Spend</p>
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
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                      MR
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Maia Rylandlesesene</p>
                      <p className="text-sm text-muted-foreground">Procurement Manager (Candidate Identified)</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500">Pending</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Procurement Coordinator</p>
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
