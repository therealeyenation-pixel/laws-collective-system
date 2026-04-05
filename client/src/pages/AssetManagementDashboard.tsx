import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Package, Monitor, Car, Wrench, Calendar, Search, Plus, AlertTriangle, 
  CheckCircle, Clock, DollarSign, Users, FileText, Settings, TrendingDown
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AssetManagementDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data for demonstration
  const inventorySummary = {
    totalAssets: 156,
    totalValue: 892500,
    checkedOut: 23,
    inMaintenance: 8,
    available: 125,
    overdueCheckouts: 3,
  };

  const assets = [
    { id: "1", assetTag: "EQP-2024-001", name: "Dell Latitude 5540", category: "technology", status: "checked_out", value: 1200, location: "Remote - J. Smith", purchaseDate: "2024-06-15", assignedTo: "John Smith" },
    { id: "2", assetTag: "EQP-2024-002", name: "HP LaserJet Pro", category: "equipment", status: "available", value: 450, location: "Office - Room 102", purchaseDate: "2024-03-20", assignedTo: null },
    { id: "3", assetTag: "VEH-2024-001", name: "Ford Transit Van", category: "vehicle", status: "available", value: 35000, location: "Parking Lot A", purchaseDate: "2024-01-10", assignedTo: null },
    { id: "4", assetTag: "TLS-2024-001", name: "DeWalt Power Drill Set", category: "tools", status: "checked_out", value: 350, location: "Field - Project Alpha", purchaseDate: "2023-11-05", assignedTo: "Mike Johnson" },
    { id: "5", assetTag: "FUR-2024-001", name: "Standing Desk - Uplift", category: "furniture", status: "in_maintenance", value: 800, location: "Warehouse", purchaseDate: "2024-02-28", assignedTo: null },
    { id: "6", assetTag: "TEC-2024-003", name: "MacBook Pro 16\"", category: "technology", status: "available", value: 2500, location: "Office - Room 201", purchaseDate: "2024-05-10", assignedTo: null },
  ];

  const softwareLicenses = [
    { id: "1", name: "Microsoft 365 Business", vendor: "Microsoft", type: "subscription", totalSeats: 50, usedSeats: 42, expirationDate: "2026-12-31", annualCost: 7500, status: "active" },
    { id: "2", name: "Adobe Creative Cloud", vendor: "Adobe", type: "subscription", totalSeats: 10, usedSeats: 10, expirationDate: "2026-06-15", annualCost: 6000, status: "active" },
    { id: "3", name: "AutoCAD LT", vendor: "Autodesk", type: "per_seat", totalSeats: 5, usedSeats: 4, expirationDate: "2026-03-01", annualCost: 2250, status: "pending_renewal" },
    { id: "4", name: "Slack Business+", vendor: "Slack", type: "subscription", totalSeats: 100, usedSeats: 67, expirationDate: "2027-01-15", annualCost: 15000, status: "active" },
  ];

  const vehicles = [
    { id: "1", assetTag: "VEH-2024-001", make: "Ford", model: "Transit Van", year: 2024, licensePlate: "ABC-1234", currentMileage: 12500, registrationExpiration: "2026-06-30", status: "available", fuelType: "gasoline" },
    { id: "2", assetTag: "VEH-2023-002", make: "Toyota", model: "Camry", year: 2023, licensePlate: "XYZ-5678", currentMileage: 28000, registrationExpiration: "2026-03-15", status: "checked_out", fuelType: "hybrid" },
    { id: "3", assetTag: "VEH-2022-003", make: "Chevrolet", model: "Silverado", year: 2022, licensePlate: "DEF-9012", currentMileage: 45000, registrationExpiration: "2026-08-20", status: "in_maintenance", fuelType: "diesel" },
  ];

  const maintenanceSchedule = [
    { id: "1", assetName: "Ford Transit Van", type: "preventive", description: "Oil change and inspection", dueDate: "2026-02-01", status: "upcoming" },
    { id: "2", assetName: "HP LaserJet Pro", type: "preventive", description: "Toner replacement", dueDate: "2026-01-28", status: "overdue" },
    { id: "3", assetName: "Standing Desk - Uplift", type: "corrective", description: "Motor repair", dueDate: "2026-01-30", status: "in_progress" },
    { id: "4", assetName: "Chevrolet Silverado", type: "preventive", description: "Brake inspection", dueDate: "2026-02-15", status: "upcoming" },
  ];

  const overdueCheckouts = [
    { id: "1", assetName: "Dell Latitude 5540", assetTag: "EQP-2024-001", userName: "John Smith", expectedReturn: "2026-01-20", daysOverdue: 6 },
    { id: "2", assetName: "DeWalt Power Drill Set", assetTag: "TLS-2024-001", userName: "Mike Johnson", expectedReturn: "2026-01-22", daysOverdue: 4 },
    { id: "3", assetName: "Projector - Epson", assetTag: "TEC-2024-005", userName: "Sarah Davis", expectedReturn: "2026-01-24", daysOverdue: 2 },
  ];

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.assetTag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      equipment: <Package className="h-4 w-4" />,
      technology: <Monitor className="h-4 w-4" />,
      vehicle: <Car className="h-4 w-4" />,
      tools: <Wrench className="h-4 w-4" />,
      furniture: <Package className="h-4 w-4" />,
      software: <Monitor className="h-4 w-4" />,
      machinery: <Settings className="h-4 w-4" />,
    };
    return icons[category] || <Package className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      available: "default",
      checked_out: "secondary",
      in_maintenance: "outline",
      reserved: "secondary",
      retired: "destructive",
      active: "default",
      pending_renewal: "outline",
      expired: "destructive",
    };
    const labels: Record<string, string> = {
      available: "Available",
      checked_out: "Checked Out",
      in_maintenance: "In Maintenance",
      reserved: "Reserved",
      retired: "Retired",
      active: "Active",
      pending_renewal: "Renewal Due",
      expired: "Expired",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Asset Management</h1>
            <p className="text-muted-foreground">Track equipment, software licenses, and vehicle fleet</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Add Asset</Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{inventorySummary.totalAssets}</p>
                  <p className="text-xs text-muted-foreground">Total Assets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(inventorySummary.totalValue)}</p>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{inventorySummary.available}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{inventorySummary.checkedOut}</p>
                  <p className="text-xs text-muted-foreground">Checked Out</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{inventorySummary.inMaintenance}</p>
                  <p className="text-xs text-muted-foreground">In Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{inventorySummary.overdueCheckouts}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Alert */}
        {overdueCheckouts.length > 0 && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Overdue Checkouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueCheckouts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-background rounded border">
                    <div>
                      <p className="font-medium">{item.assetName}</p>
                      <p className="text-sm text-muted-foreground">{item.assetTag} - Assigned to {item.userName}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">{item.daysOverdue} days overdue</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Due: {item.expectedReturn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Asset Inventory</TabsTrigger>
            <TabsTrigger value="licenses">Software Licenses</TabsTrigger>
            <TabsTrigger value="fleet">Vehicle Fleet</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Inventory</CardTitle>
                <CardDescription>All tracked equipment and assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or asset tag..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="vehicle">Vehicle</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="checked_out">Checked Out</SelectItem>
                      <SelectItem value="in_maintenance">In Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  {filteredAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">{getCategoryIcon(asset.category)}</div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">{asset.assetTag}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{asset.category}</Badge>
                            <Badge variant="outline">{asset.location}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(asset.value)}</p>
                        {asset.assignedTo && <p className="text-sm text-muted-foreground">{asset.assignedTo}</p>}
                        <div className="mt-1">{getStatusBadge(asset.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="licenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Software Licenses</CardTitle>
                <CardDescription>Track license seats and renewals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {softwareLicenses.map((license) => (
                    <div key={license.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{license.name}</p>
                          <p className="text-sm text-muted-foreground">{license.vendor} - {license.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(license.annualCost)}/year</p>
                          {getStatusBadge(license.status)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Seat Usage</span>
                          <span>{license.usedSeats} / {license.totalSeats} seats</span>
                        </div>
                        <Progress value={(license.usedSeats / license.totalSeats) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">Expires: {license.expirationDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fleet" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Fleet</CardTitle>
                <CardDescription>Manage company vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg"><Car className="h-5 w-5" /></div>
                        <div>
                          <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.assetTag} - {vehicle.licensePlate}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{vehicle.fuelType}</Badge>
                            <Badge variant="outline">{vehicle.currentMileage.toLocaleString()} mi</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Reg. Expires: {vehicle.registrationExpiration}</p>
                        <div className="mt-1">{getStatusBadge(vehicle.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Upcoming and overdue maintenance tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceSchedule.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${task.status === "overdue" ? "bg-red-100 dark:bg-red-900/20" : task.status === "in_progress" ? "bg-yellow-100 dark:bg-yellow-900/20" : "bg-blue-100 dark:bg-blue-900/20"}`}>
                          {task.status === "overdue" ? <AlertTriangle className="h-5 w-5 text-red-500" /> : task.status === "in_progress" ? <Wrench className="h-5 w-5 text-yellow-500" /> : <Calendar className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div>
                          <p className="font-medium">{task.assetName}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <Badge variant="outline" className="mt-1">{task.type}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Due: {task.dueDate}</p>
                        <Badge variant={task.status === "overdue" ? "destructive" : task.status === "in_progress" ? "secondary" : "outline"}>
                          {task.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="depreciation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Depreciation Summary</CardTitle>
                <CardDescription>Asset book values and depreciation schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">{formatCurrency(892500)}</p>
                          <p className="text-xs text-muted-foreground">Original Cost</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-2xl font-bold">{formatCurrency(178500)}</p>
                          <p className="text-xs text-muted-foreground">Accumulated Depreciation</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">{formatCurrency(714000)}</p>
                          <p className="text-xs text-muted-foreground">Current Book Value</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-3">
                  {assets.slice(0, 4).map((asset) => {
                    const depreciation = asset.value * 0.2;
                    const bookValue = asset.value - depreciation;
                    return (
                      <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">{asset.assetTag}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Original: {formatCurrency(asset.value)}</p>
                          <p className="font-semibold">Book Value: {formatCurrency(bookValue)}</p>
                          <p className="text-xs text-red-500">-{formatCurrency(depreciation)} depreciation</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Full Depreciation Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
