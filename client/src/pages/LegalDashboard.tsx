import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Scale,
  Users,
  FileText,
  Gavel,
  Play,
  Clock,
  AlertTriangle,
  Shield,
  Upload,
  FolderOpen,
  Download,
  Search,
  Plus,
  BookOpen,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { DepartmentProcedures } from "@/components/DepartmentProcedures";
import { ResourceLinks } from "@/components/ResourceLinks";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import { GovernmentActionsWidget } from "@/components/GovernmentActionsWidget";

export default function LegalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const departmentInfo = {
    name: "Legal Department",
    manager: "Atty. Tiffany Crutcher",
    role: "General Counsel",
    description: "Managing legal compliance, contracts, and regulatory matters",
  };

  const metrics = [
    { label: "Active Cases", value: 4, icon: Gavel, color: "text-blue-500" },
    { label: "Pending Reviews", value: 7, icon: Clock, color: "text-amber-500" },
    { label: "Compliance Score", value: "96%", icon: Shield, color: "text-green-500" },
    { label: "Contracts", value: 23, icon: FileText, color: "text-purple-500" },
    { label: "Risk Items", value: 2, icon: AlertTriangle, color: "text-red-500" },
  ];

  const activeCases = [
    { name: "Trademark Registration", type: "IP", status: "In Progress", priority: "High", deadline: "Feb 15, 2026" },
    { name: "Vendor Contract Dispute", type: "Contract", status: "Under Review", priority: "Medium", deadline: "Mar 1, 2026" },
    { name: "Employment Policy Update", type: "Compliance", status: "Drafting", priority: "Low", deadline: "Apr 1, 2026" },
    { name: "Privacy Policy Revision", type: "Regulatory", status: "Final Review", priority: "High", deadline: "Jan 30, 2026" },
  ];

  const complianceItems = [
    { item: "Annual Report Filing", deadline: "Mar 15, 2026", status: "Pending" },
    { item: "Tax Compliance Review", deadline: "Apr 15, 2026", status: "Scheduled" },
    { item: "Insurance Renewal", deadline: "Feb 1, 2026", status: "In Progress" },
    { item: "Board Resolution Update", deadline: "Jan 31, 2026", status: "Complete" },
  ];

  // Documents now pulled from centralized procedures system via DepartmentProcedures component

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
              General Counsel: <span className="font-medium text-foreground">{departmentInfo.manager}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{departmentInfo.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/legal-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Legal Simulator
              </Button>
            </Link>
            <Link href="/legal-case-management">
              <Button className="gap-2">
                <Gavel className="w-4 h-4" />
                New Case
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
            <LiveTicker department="legal" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        {/* Government Actions */}
        <GovernmentActionsWidget department="legal" showStats />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="resources">
              <BookOpen className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Active Cases */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Active Cases</h3>
                <div className="space-y-3">
                  {activeCases.slice(0, 3).map((caseItem, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Gavel className={`w-4 h-4 ${
                          caseItem.priority === "High" ? "text-red-500" :
                          caseItem.priority === "Medium" ? "text-amber-500" : "text-blue-500"
                        }`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{caseItem.name}</p>
                          <p className="text-xs text-muted-foreground">{caseItem.type} • Due {caseItem.deadline}</p>
                        </div>
                      </div>
                      <Badge variant={
                        caseItem.status === "Final Review" ? "default" :
                        caseItem.status === "In Progress" ? "secondary" : "outline"
                      } className="text-xs">
                        {caseItem.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Compliance Items */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Compliance Calendar</h3>
                <div className="space-y-3">
                  {complianceItems.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className={`w-4 h-4 ${
                          item.status === "Complete" ? "text-green-500" :
                          item.status === "In Progress" ? "text-blue-500" : "text-amber-500"
                        }`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.item}</p>
                          <p className="text-xs text-muted-foreground">Due {item.deadline}</p>
                        </div>
                      </div>
                      <Badge variant={
                        item.status === "Complete" ? "default" :
                        item.status === "In Progress" ? "secondary" : "outline"
                      } className="text-xs">
                        {item.status}
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
                <Link href="/legal-case-management">
                  <Button variant="outline" className="w-full gap-2">
                    <Gavel className="w-4 h-4" />
                    New Case
                  </Button>
                </Link>
                <Link href="/contract-management">
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="w-4 h-4" />
                    Contracts
                  </Button>
                </Link>
                <Link href="/compliance-calendar">
                  <Button variant="outline" className="w-full gap-2">
                    <Shield className="w-4 h-4" />
                    Compliance
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2" onClick={() => setActiveTab("documents")}>
                  <FolderOpen className="w-4 h-4" />
                  Documents
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCases.map((caseItem, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{caseItem.name}</h3>
                      <p className="text-sm text-muted-foreground">{caseItem.type}</p>
                    </div>
                    <Badge variant={
                      caseItem.priority === "High" ? "destructive" :
                      caseItem.priority === "Medium" ? "secondary" : "outline"
                    }>
                      {caseItem.priority}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium">{caseItem.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deadline</span>
                      <span className="font-medium">{caseItem.deadline}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">View</Button>
                    <Button variant="outline" size="sm" className="flex-1">Update</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Compliance Calendar</h3>
              <div className="space-y-4">
                {complianceItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        item.status === "Complete" ? "bg-green-100 dark:bg-green-900/30" :
                        item.status === "In Progress" ? "bg-blue-100 dark:bg-blue-900/30" :
                        "bg-amber-100 dark:bg-amber-900/30"
                      }`}>
                        <Shield className={`w-5 h-5 ${
                          item.status === "Complete" ? "text-green-500" :
                          item.status === "In Progress" ? "text-blue-500" : "text-amber-500"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.item}</p>
                        <p className="text-sm text-muted-foreground">Due {item.deadline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        item.status === "Complete" ? "default" :
                        item.status === "In Progress" ? "secondary" : "outline"
                      }>
                        {item.status}
                      </Badge>
                      <Button variant="outline" size="sm">Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            <DepartmentProcedures 
              department="Legal" 
              title="Legal Document Repository"
              description="Contracts, policies, compliance documents, and legal templates"
              showCategories={true}
              showSearch={true}
            />
          </TabsContent>

          <TabsContent value="resources" className="mt-4">
            <ResourceLinks 
              dashboard="legal" 
              title="Legal Resources"
              description="Case law, regulatory updates, compliance requirements, and industry standards"
            />
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Department Team</h3>
                <Link href="/employee-directory?department=legal">
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
                      <p className="font-medium text-foreground">Atty. Tiffany Crutcher</p>
                      <p className="text-sm text-muted-foreground">General Counsel</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500">Lead</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Legal Assistant</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/employee-directory?department=legal">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All Legal Team Members
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
