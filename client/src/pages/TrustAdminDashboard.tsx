import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Database,
  Code,
  FileText,
  Globe,
  Building2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { GovernmentActionsWidget } from "@/components/GovernmentActionsWidget";

export default function TrustAdminDashboard() {
  const { user } = useAuth();
  const [showSensitive, setShowSensitive] = useState(false);

  // Trust-level assets (internal only - not visible to public)
  const trustAssets = [
    {
      name: "LuvLedger System",
      type: "Financial Backbone",
      icon: Database,
      status: "Active",
      description: "Transaction tracking, allocations, blockchain records",
      value: "Core Infrastructure",
      licensedTo: "L.A.W.S. LLC → Collective",
    },
    {
      name: "Platform Application",
      type: "Software Asset",
      icon: Code,
      status: "Active",
      description: "The L.A.W.S. platform, simulators, member tools",
      value: "Core Infrastructure",
      licensedTo: "L.A.W.S. LLC → Collective",
    },
    {
      name: "IP Portfolio",
      type: "Intellectual Property",
      icon: FileText,
      status: "Active",
      description: "Trademarks, copyrights, patents, trade secrets",
      value: "Protected Assets",
      licensedTo: "All Operating Entities",
    },
    {
      name: "Digital Assets",
      type: "Domain Names",
      icon: Globe,
      status: "Active",
      description: "lawscollective.com, digital real estate, member data",
      value: "Digital Property",
      licensedTo: "L.A.W.S. LLC",
    },
  ];

  // Entity hierarchy
  const entityHierarchy = {
    trust: {
      name: "CALEA Freeman Family Trust",
      type: "Trust",
      role: "Asset Protection & Governance",
      visibility: "Internal Only",
      children: [
        {
          name: "LuvOnPurpose Autonomous Wealth System, LLC",
          type: "LLC",
          role: "Parent Operating Company",
          allocation: "100%",
          children: [
            {
              name: "The L.A.W.S. Collective, LLC",
              type: "LLC",
              role: "Community Operating Entity",
              allocation: "100%",
              children: [
                { name: "LuvOnPurpose Academy & Outreach", type: "508(c)(1)(a)", role: "Education Division", allocation: "30%" },
                { name: "Real-Eye-Nation", type: "Division", role: "Media Division", allocation: "20%" },
                { name: "Services & Operations", type: "Division", role: "Platform, Consulting", allocation: "50%" },
              ],
            },
          ],
        },
      ],
    },
  };

  // Governance actions
  const governanceActions = [
    { action: "Allocation Review", status: "Scheduled", date: "Q1 2026", priority: "Normal" },
    { action: "IP Audit", status: "Pending", date: "Feb 2026", priority: "High" },
    { action: "License Renewal", status: "Active", date: "Annual", priority: "Normal" },
    { action: "Trust Document Update", status: "Draft", date: "Mar 2026", priority: "Medium" },
  ];

  // Check if user has admin access
  const isAdmin = user?.role === "admin" || user?.role === "owner";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
          <p className="text-muted-foreground mb-4">
            Trust Administration is only accessible to authorized administrators.
          </p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Trust Administration</h1>
                <p className="text-sm text-muted-foreground">
                  CALEA Freeman Family Trust • Internal Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSensitive(!showSensitive)}
                className="gap-2"
              >
                {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSensitive ? "Hide Sensitive" : "Show Sensitive"}
              </Button>
              <Badge variant="destructive" className="gap-1">
                <Lock className="w-3 h-3" />
                Internal Only
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Warning Banner */}
        <Card className="p-4 mb-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Confidential Information</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This dashboard contains sensitive Trust information. Do not share or screenshot.
                All access is logged for security purposes.
              </p>
            </div>
          </div>
        </Card>

        {/* Government Actions */}
        <GovernmentActionsWidget department="trust" showStats className="mb-6" />

        <Tabs defaultValue="assets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assets">Trust Assets</TabsTrigger>
            <TabsTrigger value="hierarchy">Entity Hierarchy</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="licensing">Licensing</TabsTrigger>
          </TabsList>

          {/* Trust Assets Tab */}
          <TabsContent value="assets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trustAssets.map((asset) => (
                <Card key={asset.name} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <asset.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{asset.name}</h3>
                        <Badge variant={asset.status === "Active" ? "default" : "secondary"}>
                          {asset.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{asset.description}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="text-foreground">{asset.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Classification:</span>
                          <span className="text-foreground">{asset.value}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Licensed To:</span>
                          <span className="text-foreground">{asset.licensedTo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Asset Summary */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Asset Protection Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Database className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">4</p>
                  <p className="text-xs text-muted-foreground">Core Assets</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-foreground">100%</p>
                  <p className="text-xs text-muted-foreground">Protected</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Building2 className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-foreground">5</p>
                  <p className="text-xs text-muted-foreground">Operating Entities</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                  <p className="text-2xl font-bold text-foreground">Active</p>
                  <p className="text-xs text-muted-foreground">Trust Status</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Entity Hierarchy Tab */}
          <TabsContent value="hierarchy" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-6">Legal Entity Structure</h3>
              
              {/* Trust Level */}
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-foreground">{entityHierarchy.trust.name}</span>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      {entityHierarchy.trust.visibility}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">{entityHierarchy.trust.role}</p>
                  
                  {/* L.A.W.S. LLC Level */}
                  <div className="ml-8 mt-4 pl-4 border-l-2 border-amber-300">
                    {entityHierarchy.trust.children.map((llc) => (
                      <div key={llc.name} className="mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-center gap-3 mb-1">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-foreground">{llc.name}</span>
                            <Badge variant="secondary">{llc.type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground ml-7">{llc.role}</p>
                          
                          {/* Collective Level */}
                          <div className="ml-7 mt-3 pl-4 border-l-2 border-blue-300">
                            {llc.children?.map((collective) => (
                              <div key={collective.name} className="mb-3">
                                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                                  <div className="flex items-center gap-3 mb-1">
                                    <Users className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-foreground">{collective.name}</span>
                                    <Badge variant="secondary">{collective.type}</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground ml-7">{collective.role}</p>
                                  
                                  {/* Divisions */}
                                  <div className="ml-7 mt-3 space-y-2">
                                    {collective.children?.map((division) => (
                                      <div key={division.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                        <div className="flex items-center gap-2">
                                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                          <span className="text-sm text-foreground">{division.name}</span>
                                          <Badge variant="outline" className="text-xs">{division.type}</Badge>
                                        </div>
                                        <span className="text-sm font-medium text-primary">{division.allocation}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Link href="/governance-workflows">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-primary/20 hover:border-primary">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Governance Workflows</p>
                      <p className="text-xs text-muted-foreground">Approval workflows & escalations</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </Card>
              </Link>
              <Link href="/audit-trail">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-primary/20 hover:border-primary">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Audit Trail</p>
                      <p className="text-xs text-muted-foreground">Activity timeline & blockchain verification</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </Card>
              </Link>
              <Link href="/entity-curriculum">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-primary/20 hover:border-primary">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Entity Curricula</p>
                      <p className="text-xs text-muted-foreground">Training programs by entity</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </Card>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Governance Actions</h3>
                <div className="space-y-3">
                  {governanceActions.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          item.priority === "High" ? "destructive" :
                          item.priority === "Medium" ? "default" : "secondary"
                        }>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Trust Principles</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-foreground">Asset Protection</p>
                    <p className="text-xs text-muted-foreground">All core assets held at Trust level, licensed to operating entities</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-foreground">Generational Wealth</p>
                    <p className="text-xs text-muted-foreground">Structure designed for multi-generational transfer and longevity</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-foreground">Liability Separation</p>
                    <p className="text-xs text-muted-foreground">Operating entities shielded from Trust assets</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-foreground">Sovereign Operations</p>
                    <p className="text-xs text-muted-foreground">Self-governing with defined allocation formulas</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Licensing Tab */}
          <TabsContent value="licensing" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Asset Licensing Structure</h3>
              <p className="text-sm text-muted-foreground mb-6">
                The Trust owns all core assets and licenses them to operating entities. 
                This provides asset protection while allowing operational use.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">LuvLedger System License</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Licensor:</p>
                      <p className="text-foreground">CALEA Freeman Family Trust</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Licensee:</p>
                      <p className="text-foreground">L.A.W.S. LLC → Collective</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type:</p>
                      <p className="text-foreground">Exclusive, Non-transferable</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term:</p>
                      <p className="text-foreground">Perpetual (with Trust oversight)</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Code className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Platform Application License</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Licensor:</p>
                      <p className="text-foreground">CALEA Freeman Family Trust</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Licensee:</p>
                      <p className="text-foreground">L.A.W.S. LLC → Collective</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type:</p>
                      <p className="text-foreground">Exclusive, Non-transferable</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term:</p>
                      <p className="text-foreground">Perpetual (with Trust oversight)</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">IP Portfolio License</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Licensor:</p>
                      <p className="text-foreground">CALEA Freeman Family Trust</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Licensee:</p>
                      <p className="text-foreground">All Operating Entities</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type:</p>
                      <p className="text-foreground">Non-exclusive, Entity-specific</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term:</p>
                      <p className="text-foreground">Annual Renewal</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
