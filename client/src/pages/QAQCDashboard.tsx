import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Users,
  ClipboardList,
  FileCheck,
  Play,
  AlertTriangle,
  Target,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Link } from "wouter";

export default function QAQCDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "QA/QC Department",
    manager: "Open Position",
    role: "QA/QC Manager",
    status: "Hiring",
    description: "Ensuring quality standards and compliance across all organizational processes",
  };

  const metrics = [
    { label: "Quality Score", value: "94%", icon: Target, color: "text-green-500" },
    { label: "Open Issues", value: 7, icon: AlertTriangle, color: "text-amber-500" },
    { label: "Audits Complete", value: 12, icon: FileCheck, color: "text-blue-500" },
    { label: "Standards", value: 24, icon: ClipboardList, color: "text-purple-500" },
    { label: "Compliance", value: "98%", icon: Shield, color: "text-emerald-500" },
  ];

  const recentAudits = [
    { name: "Financial Process Audit", department: "Finance", score: 96, date: "Jan 15, 2026", status: "Complete" },
    { name: "HR Compliance Review", department: "HR", score: 92, date: "Jan 10, 2026", status: "Complete" },
    { name: "IT Security Audit", department: "Platform", score: 88, date: "Jan 5, 2026", status: "Complete" },
    { name: "Procurement Process", department: "Procurement", score: null, date: "Jan 25, 2026", status: "Scheduled" },
  ];

  const openIssues = [
    { issue: "Documentation gap in onboarding", severity: "Medium", department: "HR", age: "5 days" },
    { issue: "Missing approval workflow", severity: "High", department: "Finance", age: "3 days" },
    { issue: "Outdated SOP", severity: "Low", department: "Operations", age: "10 days" },
  ];

  const qualityStandards = [
    { standard: "Document Control", compliance: 98, lastReview: "Jan 2026" },
    { standard: "Process Documentation", compliance: 95, lastReview: "Jan 2026" },
    { standard: "Data Accuracy", compliance: 92, lastReview: "Dec 2025" },
    { standard: "Security Protocols", compliance: 99, lastReview: "Jan 2026" },
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
            <Link href="/qaqc-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                QA/QC Simulator
              </Button>
            </Link>
            <Link href="/audits">
              <Button className="gap-2">
                <FileCheck className="w-4 h-4" />
                New Audit
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
            <TabsTrigger value="audits">Audits</TabsTrigger>
            <TabsTrigger value="standards">Standards</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Audits */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Recent Audits</h3>
                <div className="space-y-3">
                  {recentAudits.slice(0, 3).map((audit, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileCheck className={`w-4 h-4 ${audit.status === "Complete" ? "text-green-500" : "text-blue-500"}`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{audit.name}</p>
                          <p className="text-xs text-muted-foreground">{audit.department} • {audit.date}</p>
                        </div>
                      </div>
                      {audit.score ? (
                        <Badge variant={audit.score >= 90 ? "default" : "secondary"}>{audit.score}%</Badge>
                      ) : (
                        <Badge variant="outline">{audit.status}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Open Issues */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Open Issues</h3>
                <div className="space-y-3">
                  {openIssues.map((issue, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-4 h-4 ${
                          issue.severity === "High" ? "text-red-500" :
                          issue.severity === "Medium" ? "text-amber-500" : "text-blue-500"
                        }`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{issue.issue}</p>
                          <p className="text-xs text-muted-foreground">{issue.department} • {issue.age}</p>
                        </div>
                      </div>
                      <Badge variant={
                        issue.severity === "High" ? "destructive" :
                        issue.severity === "Medium" ? "secondary" : "outline"
                      } className="text-xs">
                        {issue.severity}
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
                <Link href="/audits">
                  <Button variant="outline" className="w-full gap-2">
                    <FileCheck className="w-4 h-4" />
                    Schedule Audit
                  </Button>
                </Link>
                <Link href="/quality-standards">
                  <Button variant="outline" className="w-full gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Standards
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Report Issue
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="audits" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">All Audits</h3>
              <div className="space-y-4">
                {recentAudits.map((audit, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        audit.status === "Complete" ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        <FileCheck className={`w-5 h-5 ${
                          audit.status === "Complete" ? "text-green-500" : "text-blue-500"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{audit.name}</p>
                        <p className="text-sm text-muted-foreground">{audit.department} • {audit.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {audit.score ? (
                        <Badge variant={audit.score >= 90 ? "default" : "secondary"}>{audit.score}%</Badge>
                      ) : (
                        <Badge variant="outline">{audit.status}</Badge>
                      )}
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="standards" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qualityStandards.map((standard, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{standard.standard}</h3>
                      <p className="text-sm text-muted-foreground">Last Review: {standard.lastReview}</p>
                    </div>
                    <Badge variant={standard.compliance >= 95 ? "default" : "secondary"}>
                      {standard.compliance}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        standard.compliance >= 95 ? "bg-green-500" :
                        standard.compliance >= 90 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${standard.compliance}%` }}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">View</Button>
                    <Button variant="outline" size="sm" className="flex-1">Update</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Department Team</h3>
                <Link href="/employee-directory?department=qaqc">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    View Full Directory
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">QA/QC Manager</p>
                      <p className="text-sm text-muted-foreground">Position Open - Actively Hiring</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500">Hiring</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Quality Coordinator</p>
                      <p className="text-sm text-muted-foreground">Open Position</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/employee-directory?department=qaqc">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All QA/QC Team Members
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
