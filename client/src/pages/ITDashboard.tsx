import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Monitor,
  Users,
  FileText,
  Server,
  Play,
  Clock,
  AlertTriangle,
  Shield,
  Upload,
  FolderOpen,
  Download,
  Search,
  Wifi,
  HardDrive,
  Cloud,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function ITDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const departmentInfo = {
    name: "IT Department",
    manager: "Amandes Pearsall IV",
    role: "IT Director",
    description: "Managing technology infrastructure, security, and digital systems",
  };

  const metrics = [
    { label: "Systems Online", value: 12, icon: Server, color: "text-green-500" },
    { label: "Open Tickets", value: 8, icon: Clock, color: "text-amber-500" },
    { label: "Security Score", value: "98%", icon: Shield, color: "text-blue-500" },
    { label: "Uptime", value: "99.9%", icon: Wifi, color: "text-emerald-500" },
    { label: "Storage Used", value: "67%", icon: HardDrive, color: "text-purple-500" },
  ];

  const systemStatus = [
    { name: "Production Server", status: "Online", uptime: "99.99%", lastCheck: "2 min ago" },
    { name: "Database Cluster", status: "Online", uptime: "99.95%", lastCheck: "1 min ago" },
    { name: "Email Server", status: "Online", uptime: "99.98%", lastCheck: "3 min ago" },
    { name: "Backup System", status: "Running", uptime: "100%", lastCheck: "5 min ago" },
  ];

  const openTickets = [
    { title: "Password Reset Request", priority: "Low", requester: "HR Dept", age: "2 hours" },
    { title: "Software Installation", priority: "Medium", requester: "Design Dept", age: "1 day" },
    { title: "Network Connectivity Issue", priority: "High", requester: "Finance Dept", age: "30 min" },
    { title: "Email Configuration", priority: "Low", requester: "New Employee", age: "4 hours" },
  ];

  const documents = [
    { name: "IT Security Policy", type: "Policy", date: "Jan 2026", size: "345 KB" },
    { name: "Disaster Recovery Plan", type: "Procedure", date: "Dec 2025", size: "567 KB" },
    { name: "Network Architecture Diagram", type: "Technical", date: "Jan 2026", size: "1.2 MB" },
    { name: "Software Inventory", type: "Inventory", date: "Jan 2026", size: "234 KB" },
    { name: "User Access Guidelines", type: "Policy", date: "Dec 2025", size: "189 KB" },
    { name: "Backup Procedures", type: "Procedure", date: "Jan 2026", size: "156 KB" },
  ];

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = () => {
    toast.info("Document upload feature coming soon");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{departmentInfo.name}</h1>
            <p className="text-muted-foreground">
              IT Director: <span className="font-medium text-foreground">{departmentInfo.manager}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{departmentInfo.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/it-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                IT Simulator
              </Button>
            </Link>
            <Link href="/it-tickets">
              <Button className="gap-2">
                <Monitor className="w-4 h-4" />
                New Ticket
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
            <TabsTrigger value="systems">Systems</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* System Status */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">System Status</h3>
                <div className="space-y-3">
                  {systemStatus.map((system, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Server className={`w-4 h-4 ${
                          system.status === "Online" ? "text-green-500" : "text-blue-500"
                        }`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{system.name}</p>
                          <p className="text-xs text-muted-foreground">Uptime: {system.uptime} • {system.lastCheck}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-500 text-xs">
                        {system.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Open Tickets */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Open Tickets</h3>
                <div className="space-y-3">
                  {openTickets.slice(0, 3).map((ticket, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className={`w-4 h-4 ${
                          ticket.priority === "High" ? "text-red-500" :
                          ticket.priority === "Medium" ? "text-amber-500" : "text-blue-500"
                        }`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground">{ticket.requester} • {ticket.age}</p>
                        </div>
                      </div>
                      <Badge variant={
                        ticket.priority === "High" ? "destructive" :
                        ticket.priority === "Medium" ? "secondary" : "outline"
                      } className="text-xs">
                        {ticket.priority}
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
                <Link href="/it-tickets">
                  <Button variant="outline" className="w-full gap-2">
                    <Monitor className="w-4 h-4" />
                    New Ticket
                  </Button>
                </Link>
                <Link href="/system-monitoring">
                  <Button variant="outline" className="w-full gap-2">
                    <Server className="w-4 h-4" />
                    Monitoring
                  </Button>
                </Link>
                <Link href="/security-center">
                  <Button variant="outline" className="w-full gap-2">
                    <Shield className="w-4 h-4" />
                    Security
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2" onClick={() => setActiveTab("documents")}>
                  <FolderOpen className="w-4 h-4" />
                  Documents
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="systems" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemStatus.map((system, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Server className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{system.name}</h3>
                        <p className="text-sm text-muted-foreground">Last check: {system.lastCheck}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">{system.status}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">{system.uptime}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">Details</Button>
                    <Button variant="outline" size="sm" className="flex-1">Logs</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Support Tickets</h3>
              <div className="space-y-4">
                {openTickets.map((ticket, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        ticket.priority === "High" ? "bg-red-100 dark:bg-red-900/30" :
                        ticket.priority === "Medium" ? "bg-amber-100 dark:bg-amber-900/30" :
                        "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        <Clock className={`w-5 h-5 ${
                          ticket.priority === "High" ? "text-red-500" :
                          ticket.priority === "Medium" ? "text-amber-500" : "text-blue-500"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground">{ticket.requester} • Open for {ticket.age}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        ticket.priority === "High" ? "destructive" :
                        ticket.priority === "Medium" ? "secondary" : "outline"
                      }>
                        {ticket.priority}
                      </Badge>
                      <Button variant="outline" size="sm">Resolve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">IT Document Repository</h3>
                <Button className="gap-2" onClick={handleUpload}>
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Document List */}
              <div className="space-y-3">
                {filteredDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <FileText className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.type} • {doc.date} • {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No documents found matching your search</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Department Team</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                      AP
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Amandes Pearsall IV</p>
                      <p className="text-sm text-muted-foreground">IT Director</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500">Director</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Systems Administrator</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Help Desk Technician</p>
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
