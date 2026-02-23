import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck,
  Users,
  Package,
  ShoppingCart,
  Play,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { Link } from "wouter";
import { DepartmentProcedures } from "@/components/DepartmentProcedures";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import { GovernmentActionsWidget } from "@/components/GovernmentActionsWidget";

export default function PurchasingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "Purchasing Department",
    manager: "Latisha Cox",
    role: "Purchasing Manager",
    description: "Managing purchase orders, inventory, and supply chain operations",
  };

  const metrics = [
    { label: "Open POs", value: 7, icon: ShoppingCart, color: "text-blue-500" },
    { label: "In Transit", value: 4, icon: Truck, color: "text-amber-500" },
    { label: "Inventory Items", value: 156, icon: Package, color: "text-purple-500" },
    { label: "Monthly Spend", value: "$12.4K", icon: DollarSign, color: "text-green-500" },
    { label: "Low Stock", value: 3, icon: AlertTriangle, color: "text-red-500" },
  ];

  const recentOrders = [
    { item: "Office Supplies Bundle", vendor: "Staples", quantity: 50, status: "Delivered", date: "Jan 18" },
    { item: "Computer Equipment", vendor: "Dell", quantity: 3, status: "In Transit", date: "Jan 16" },
    { item: "Training Materials", vendor: "Amazon", quantity: 25, status: "Processing", date: "Jan 15" },
    { item: "Marketing Collateral", vendor: "Vistaprint", quantity: 500, status: "Pending", date: "Jan 14" },
  ];

  const inventoryAlerts = [
    { item: "Printer Paper", current: 2, minimum: 10, status: "Critical" },
    { item: "Ink Cartridges", current: 4, minimum: 6, status: "Low" },
    { item: "Business Cards", current: 50, minimum: 100, status: "Low" },
  ];

  const pendingApprovals = [
    { item: "New Laptop - Design Team", amount: 1299, requester: "Essence M. Hunter", priority: "High" },
    { item: "Software Subscription", amount: 199, requester: "Craig Russell", priority: "Medium" },
    { item: "Office Furniture", amount: 850, requester: "Operations", priority: "Low" },
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
            <Link href="/purchasing-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Purchasing Simulator
              </Button>
            </Link>
            <Link href="/purchase-requests">
              <Button className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                New Order
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
            <LiveTicker department="purchasing" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        {/* Government Actions */}
        <GovernmentActionsWidget department="purchasing" showStats />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                          <p className="text-xs text-muted-foreground">{order.vendor} • Qty: {order.quantity}</p>
                        </div>
                      </div>
                      <Badge variant={
                        order.status === "Delivered" ? "default" :
                        order.status === "In Transit" ? "secondary" : "outline"
                      } className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Inventory Alerts */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Inventory Alerts</h3>
                <div className="space-y-3">
                  {inventoryAlerts.map((alert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-4 h-4 ${alert.status === "Critical" ? "text-red-500" : "text-amber-500"}`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{alert.item}</p>
                          <p className="text-xs text-muted-foreground">Current: {alert.current} / Min: {alert.minimum}</p>
                        </div>
                      </div>
                      <Badge variant={alert.status === "Critical" ? "destructive" : "secondary"} className="text-xs">
                        {alert.status}
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
                <Link href="/purchase-requests">
                  <Button variant="outline" className="w-full gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    New Purchase
                  </Button>
                </Link>
                <Link href="/inventory">
                  <Button variant="outline" className="w-full gap-2">
                    <Package className="w-4 h-4" />
                    Inventory
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2">
                  <Truck className="w-4 h-4" />
                  Track Orders
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Reports
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">All Purchase Orders</h3>
              <div className="space-y-4">
                {recentOrders.map((order, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        order.status === "Delivered" ? "bg-green-100 dark:bg-green-900/30" :
                        order.status === "In Transit" ? "bg-blue-100 dark:bg-blue-900/30" :
                        "bg-amber-100 dark:bg-amber-900/30"
                      }`}>
                        {order.status === "Delivered" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : order.status === "In Transit" ? (
                          <Truck className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{order.item}</p>
                        <p className="text-sm text-muted-foreground">{order.vendor} • Qty: {order.quantity} • {order.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        order.status === "Delivered" ? "default" :
                        order.status === "In Transit" ? "secondary" : "outline"
                      }>
                        {order.status}
                      </Badge>
                      <Button variant="outline" size="sm">Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Inventory Status</h3>
              <div className="space-y-4">
                {inventoryAlerts.map((item, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{item.item}</p>
                          <p className="text-sm text-muted-foreground">Minimum: {item.minimum} units</p>
                        </div>
                      </div>
                      <Badge variant={item.status === "Critical" ? "destructive" : "secondary"}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          item.status === "Critical" ? "bg-red-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${(item.current / item.minimum) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {item.current} / {item.minimum} ({Math.round((item.current / item.minimum) * 100)}%)
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Department Team</h3>
                <Link href="/employee-directory?department=purchasing">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    View Full Directory
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                      LC
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Latisha Cox</p>
                      <p className="text-sm text-muted-foreground">Purchasing Manager</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500">Manager</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Purchasing Coordinator</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/employee-directory?department=purchasing">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All Purchasing Team Members
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <DepartmentProcedures 
              department="Purchasing" 
              title="Purchasing Document Repository"
              description="Purchase order templates, inventory policies, supplier agreements, and supply chain procedures"
              showCategories={true}
              showSearch={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
