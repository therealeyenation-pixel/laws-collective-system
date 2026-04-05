import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  BookOpen,
  DollarSign,
  Zap,
  TrendingUp,
  Lock,
  Users,
  FileText,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { data: overview, isLoading } = trpc.luv.getSystemOverview.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Zap className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            LuvOnPurpose Sovereign System
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal gateway to autonomous wealth generation and multi-generational legacy building
          </p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Business Entities</p>
                <p className="text-2xl font-bold text-foreground">
                  {overview?.entitiesCount || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certificates</p>
                <p className="text-2xl font-bold text-foreground">
                  {overview?.certificatesCount || 0}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/5 to-green-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LuvLedger Accounts</p>
                <p className="text-2xl font-bold text-foreground">
                  {overview?.accountsCount || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trust Relationships</p>
                <p className="text-2xl font-bold text-foreground">
                  {overview?.trustRelationshipsCount || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="entities" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="entities">Business Entities</TabsTrigger>
            <TabsTrigger value="simulators">Simulators</TabsTrigger>
            <TabsTrigger value="ledger">LuvLedger</TabsTrigger>
            <TabsTrigger value="trust">Trust Network</TabsTrigger>
          </TabsList>

          {/* Business Entities Tab */}
          <TabsContent value="entities" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Your Business Entities
              </h2>
              <Button className="gap-2">
                <Zap className="w-4 h-4" />
                Create Entity
              </Button>
            </div>

            {overview?.entities && overview.entities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overview.entities.map((entity) => (
                  <Card key={entity.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-foreground">{entity.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {entity.entityType}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        entity.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {entity.status}
                      </span>
                    </div>
                    {entity.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {entity.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No business entities yet. Create your first entity to get started.
                </p>
                <Button className="gap-2">
                  <Zap className="w-4 h-4" />
                  Create Your First Entity
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Simulators Tab */}
          <TabsContent value="simulators" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Interactive Simulators
              </h2>
              <Button className="gap-2">
                <Zap className="w-4 h-4" />
                Start Simulator
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Business Setup Simulator",
                  description: "Learn how to structure and activate your business entities",
                  icon: <Shield className="w-8 h-8" />,
                  turns: 12,
                },
                {
                  title: "Financial Management Simulator",
                  description: "Master the LuvLedger system and asset allocation",
                  icon: <DollarSign className="w-8 h-8" />,
                  turns: 12,
                },
                {
                  title: "Entity Operations Simulator",
                  description: "Understand multi-level trust and operational workflows",
                  icon: <Users className="w-8 h-8" />,
                  turns: 12,
                },
              ].map((sim, i) => (
                <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="text-accent mb-4">{sim.icon}</div>
                  <h3 className="font-bold text-foreground mb-2">{sim.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {sim.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {sim.turns} turns
                    </span>
                    <Button size="sm">Start</Button>
                  </div>
                </Card>
              ))}
            </div>

            {overview?.certificatesCount && overview.certificatesCount > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-foreground mb-4">Your Certificates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overview.certificates?.map((cert) => (
                    <Card key={cert.id} className="p-4 border-l-4 border-l-accent">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {cert.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Issued {new Date(cert.issuedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* LuvLedger Tab */}
          <TabsContent value="ledger" className="space-y-4 mt-6">
            <h2 className="text-xl font-bold text-foreground">
              LuvLedger - Automated Asset Management
            </h2>

            {overview?.accounts && overview.accounts.length > 0 ? (
              <div className="space-y-4">
                {overview.accounts.map((account) => (
                  <Card key={account.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-foreground">
                          {account.accountName}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {account.accountType} Account
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {account.balance}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {account.allocationPercentage}% allocation
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Transactions
                      </Button>
                      <Button variant="outline" size="sm">
                        Manage Allocation
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No LuvLedger accounts yet. Create a business entity to initialize your accounts.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Trust Network Tab */}
          <TabsContent value="trust" className="space-y-4 mt-6">
            <h2 className="text-xl font-bold text-foreground">
              Multi-Level Trust Network
            </h2>

            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Trust Hierarchy
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your multi-level trust structure enables secure delegation of authority and resource management across your business entities and collective relationships.
                  </p>
                </div>
              </div>
            </Card>

            {overview?.trusts && overview.trusts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overview.trusts.map((trust) => (
                  <Card key={trust.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-foreground">
                        Trust Level {trust.trustLevel}
                      </h3>
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Relationship ID: {trust.id}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No trust relationships established yet.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
