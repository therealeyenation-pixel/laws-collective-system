import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileCheck,
  Users,
  FileText,
  Calendar,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Building2,
} from "lucide-react";
import { Link } from "wouter";
import { ElectronicSignature } from "@/components/ElectronicSignature";

export default function ContractsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "Contracts Department",
    manager: "Roshonda Parker",
    role: "Contracts Manager",
    description: "Managing contract lifecycle, compliance, and contractor agreements",
  };

  const metrics = [
    { label: "Active Contracts", value: 8, icon: FileCheck, color: "text-blue-500" },
    { label: "Pending Review", value: 3, icon: Clock, color: "text-amber-500" },
    { label: "Expiring Soon", value: 2, icon: AlertTriangle, color: "text-red-500" },
    { label: "Total Value", value: "$125K", icon: DollarSign, color: "text-green-500" },
    { label: "Contractors", value: 5, icon: Users, color: "text-purple-500" },
  ];

  const activeContracts = [
    { name: "Software Development Agreement", party: "Tech Solutions LLC", value: "$45,000", expiry: "Dec 2026", status: "Active" },
    { name: "Marketing Services", party: "Creative Agency", value: "$15,000", expiry: "Jun 2026", status: "Active" },
    { name: "Consulting Agreement", party: "Business Advisors", value: "$25,000", expiry: "Mar 2026", status: "Expiring" },
    { name: "Office Lease", party: "Property Management", value: "$36,000", expiry: "Jan 2027", status: "Active" },
  ];

  const pendingContracts = [
    { name: "Contractor Agreement - Design", party: "Essence M. Hunter", submitted: "Jan 18", status: "Pending Signature" },
    { name: "NDA - New Vendor", party: "Vendor Corp", submitted: "Jan 17", status: "Under Review" },
    { name: "Service Agreement", party: "IT Support Inc", submitted: "Jan 15", status: "Pending Approval" },
  ];

  const recentActivity = [
    { action: "Contract Signed", contract: "Marketing Services", date: "2 days ago" },
    { action: "Amendment Approved", contract: "Software Development", date: "3 days ago" },
    { action: "New Contract Created", contract: "Consulting Agreement", date: "1 week ago" },
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
            <Link href="/contracts-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Contracts Simulator
              </Button>
            </Link>
            <Link href="/contract-management">
              <Button className="gap-2">
                <FileCheck className="w-4 h-4" />
                New Contract
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
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Active Contracts */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Active Contracts</h3>
                <div className="space-y-3">
                  {activeContracts.slice(0, 3).map((contract) => (
                    <div key={contract.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground text-sm">{contract.name}</p>
                        <p className="text-xs text-muted-foreground">{contract.party}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{contract.value}</p>
                        <Badge variant={contract.status === "Expiring" ? "destructive" : "default"} className="text-xs">
                          {contract.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pending Contracts */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Pending Review</h3>
                <div className="space-y-3">
                  {pendingContracts.map((contract, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{contract.name}</p>
                          <p className="text-xs text-muted-foreground">{contract.party}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">{contract.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/contract-management">
                  <Button variant="outline" className="w-full gap-2">
                    <FileCheck className="w-4 h-4" />
                    New Contract
                  </Button>
                </Link>
                <Link href="/contractor-agreements">
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    Contractor Agreements
                  </Button>
                </Link>
                <Link href="/e-signature">
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="w-4 h-4" />
                    E-Signature
                  </Button>
                </Link>
                <Button variant="outline" className="w-full gap-2">
                  <Calendar className="w-4 h-4" />
                  Renewals
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeContracts.map((contract) => (
                <Card key={contract.name} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{contract.name}</h3>
                      <p className="text-sm text-muted-foreground">{contract.party}</p>
                    </div>
                    <Badge variant={contract.status === "Expiring" ? "destructive" : "default"}>
                      {contract.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value</span>
                      <span className="font-medium">{contract.value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="font-medium">{contract.expiry}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">View</Button>
                    <Button variant="outline" size="sm" className="flex-1">Amend</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Contracts Pending Action</h3>
              <div className="space-y-4">
                {pendingContracts.map((contract, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <Clock className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{contract.name}</p>
                        <p className="text-sm text-muted-foreground">{contract.party} • Submitted {contract.submitted}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{contract.status}</Badge>
                      <Button variant="outline" size="sm">Review</Button>
                      {contract.status === "Pending Signature" && (
                        <ElectronicSignature
                          documentType="contract"
                          documentId={idx + 1000}
                          documentTitle={contract.name}
                          signatureStatement={`I have reviewed and agree to the terms of ${contract.name} with ${contract.party}.`}
                          compact={true}
                        />
                      )}
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
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      RP
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Roshonda Parker</p>
                      <p className="text-sm text-muted-foreground">Contracts Manager</p>
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
                      <p className="font-medium text-foreground">Contracts Coordinator</p>
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
