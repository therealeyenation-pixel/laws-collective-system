import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Home,
  Building2,
  Users,
  DollarSign,
  ArrowDown,
  ArrowRight,
  GitBranch,
  Layers,
  Shield,
  Crown,
  Wallet,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

/**
 * Trust Structure Visualization
 * 
 * Shows the hierarchical relationship between Houses, Trusts,
 * and the flow of distributions through the ecosystem.
 * 
 * KEY CONCEPTS:
 * - Root House: The founding House that activates the entire system
 * - Child Houses: Houses that branch from the Root or other Houses
 * - Distribution Flow: 60/40 Inter-House, 70/30 Intra-House
 * - Inheritance: How wealth flows to future generations
 */

interface HouseNode {
  id: number;
  name: string;
  status: string;
  tier: string;
  pathway: string;
  children: HouseNode[];
  isExpanded?: boolean;
}

export default function TrustVisualization() {
  const [selectedView, setSelectedView] = useState("hierarchy");
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);

  // Fetch hierarchy data (using getAllHouses since getHierarchy doesn't exist)
  const { data: allHouses } = trpc.houseManagement.getAllHouses.useQuery({ limit: 100, offset: 0 });
  const { data: dashboard } = trpc.houseManagement.getDashboard.useQuery();

  // Build tree structure from flat data
  const treeData = useMemo(() => {
    if (!allHouses || allHouses.length === 0) return null;
    
    // For now, create a sample structure with the first house as root
    const rootHouse: HouseNode = {
      id: 1,
      name: "Root House (L.A.W.S. Collective)",
      status: "active",
      tier: "partner",
      pathway: "founder",
      isExpanded: true,
      children: allHouses.slice(0, 5).map((h: any, idx: number) => ({
        id: h.id || idx + 2,
        name: h.name || `House ${idx + 2}`,
        status: h.status || "template",
        tier: h.distributionTier || "observer",
        pathway: h.activationPathway || "employee_transition",
        isExpanded: false,
        children: [],
      })),
    };
    
    return rootHouse;
  }, [allHouses]);

  // Tier colors
  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      observer: "bg-gray-200 text-gray-700",
      participant: "bg-blue-200 text-blue-700",
      contributor: "bg-green-200 text-green-700",
      partner: "bg-purple-200 text-purple-700",
    };
    return colors[tier] || colors.observer;
  };

  // Status colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      template: "border-dashed border-gray-400",
      forming: "border-dashed border-blue-400",
      pending_activation: "border-solid border-amber-400",
      active: "border-solid border-green-500",
      suspended: "border-solid border-red-400",
    };
    return colors[status] || colors.template;
  };

  // Pathway icons
  const getPathwayIcon = (pathway: string) => {
    const icons: Record<string, React.ReactNode> = {
      founder: <Crown className="w-4 h-4 text-amber-500" />,
      employee_transition: <Users className="w-4 h-4 text-blue-500" />,
      business_first: <Building2 className="w-4 h-4 text-green-500" />,
      external_partner: <Shield className="w-4 h-4 text-purple-500" />,
      community_member: <Users className="w-4 h-4 text-teal-500" />,
      family_branch: <Home className="w-4 h-4 text-orange-500" />,
    };
    return icons[pathway] || <Home className="w-4 h-4" />;
  };

  // Recursive tree node component
  const TreeNode = ({ node, depth = 0 }: { node: HouseNode; depth?: number }) => {
    const [isExpanded, setIsExpanded] = useState(node.isExpanded || false);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="relative">
        {/* Connection line from parent */}
        {depth > 0 && (
          <div 
            className="absolute left-0 top-0 w-6 h-8 border-l-2 border-b-2 border-border rounded-bl-lg"
            style={{ marginLeft: -24 }}
          />
        )}
        
        {/* Node */}
        <div 
          className={`
            p-4 rounded-lg border-2 mb-2 cursor-pointer transition-all
            hover:shadow-md ${getStatusColor(node.status)}
            ${selectedHouseId === node.id ? 'ring-2 ring-primary' : ''}
          `}
          onClick={() => setSelectedHouseId(node.id)}
          style={{ marginLeft: depth * 32 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasChildren && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                  className="p-1 hover:bg-muted rounded"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
              {getPathwayIcon(node.pathway)}
              <div>
                <p className="font-medium text-sm">{node.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{node.pathway.replace(/_/g, " ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTierColor(node.tier)}`}>
                {node.tier}
              </span>
            </div>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="ml-8">
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trust Structure</h1>
            <p className="text-muted-foreground">
              Visualize House hierarchy and distribution flows
            </p>
          </div>
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hierarchy">House Hierarchy</SelectItem>
              <SelectItem value="distribution">Distribution Flow</SelectItem>
              <SelectItem value="inheritance">Inheritance Map</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList>
            <TabsTrigger value="hierarchy" className="gap-2">
              <GitBranch className="w-4 h-4" />
              Hierarchy
            </TabsTrigger>
            <TabsTrigger value="distribution" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="inheritance" className="gap-2">
              <Layers className="w-4 h-4" />
              Inheritance
            </TabsTrigger>
          </TabsList>

          {/* Hierarchy View */}
          <TabsContent value="hierarchy" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Tree View */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">House Hierarchy</CardTitle>
                    <CardDescription>
                      Click on a House to view details. Dashed borders indicate template/forming status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {treeData ? (
                      <TreeNode node={treeData} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No Houses in the system yet.</p>
                        <p className="text-sm">The Root House will appear here once created.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Legend & Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Legend</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Status</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-dashed border-gray-400 rounded" />
                          <span className="text-sm">Template (Placeholder)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-dashed border-blue-400 rounded" />
                          <span className="text-sm">Forming</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-solid border-amber-400 rounded" />
                          <span className="text-sm">Pending Activation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-solid border-green-500 rounded" />
                          <span className="text-sm">Active</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Pathways</p>
                      <div className="space-y-2">
                        {[
                          { pathway: "founder", label: "Founder/Root" },
                          { pathway: "employee_transition", label: "Employee Transition" },
                          { pathway: "business_first", label: "Business-First" },
                          { pathway: "external_partner", label: "External Partner" },
                          { pathway: "family_branch", label: "Family Branch" },
                        ].map((item) => (
                          <div key={item.pathway} className="flex items-center gap-2">
                            {getPathwayIcon(item.pathway)}
                            <span className="text-sm">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Houses</span>
                        <span className="font-medium">{dashboard?.statusCounts?.reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active</span>
                        <span className="font-medium text-green-600">{dashboard?.statusCounts?.find((s: any) => s.status === "active")?.count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Templates</span>
                        <span className="font-medium text-gray-600">{dashboard?.statusCounts?.find((s: any) => s.status === "template")?.count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Business-First</span>
                        <span className="font-medium text-blue-600">{dashboard?.pathwayCounts?.find((p: any) => p.activationPathway === "business_first")?.count || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Distribution Flow View */}
          <TabsContent value="distribution" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Inter-House Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Inter-House Distribution (60/40)
                  </CardTitle>
                  <CardDescription>
                    Revenue flowing between Houses in the ecosystem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Visual Flow */}
                    <div className="relative p-6 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <DollarSign className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-sm font-medium">Revenue</p>
                          <p className="text-xs text-muted-foreground">Platform Fees</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-muted-foreground" />
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Home className="w-8 h-8 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium">60%</p>
                          <p className="text-xs text-muted-foreground">Source House</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-muted-foreground" />
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Shield className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="text-sm font-medium">40%</p>
                          <p className="text-xs text-muted-foreground">Collective Pool</p>
                        </div>
                      </div>
                    </div>

                    {/* Applied To */}
                    <div>
                      <p className="text-sm font-medium mb-2">Applied To:</p>
                      <div className="flex flex-wrap gap-2">
                        {["Subscriptions", "Tool Usage", "Training", "Marketplace", "API Access"].map((item) => (
                          <Badge key={item} variant="secondary">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Intra-House Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowDown className="w-5 h-5" />
                    Intra-House Distribution (70/30)
                  </CardTitle>
                  <CardDescription>
                    Revenue distribution within a single House
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Visual Flow */}
                    <div className="relative p-6 bg-muted/30 rounded-lg">
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Home className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-sm font-medium">House Revenue</p>
                        </div>
                        <ArrowDown className="w-6 h-6 text-muted-foreground" />
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <TrendingUp className="w-6 h-6 text-amber-600" />
                            </div>
                            <p className="text-sm font-medium">70%</p>
                            <p className="text-xs text-muted-foreground">Operations</p>
                          </div>
                          <div className="text-center">
                            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Wallet className="w-6 h-6 text-purple-600" />
                            </div>
                            <p className="text-sm font-medium">30%</p>
                            <p className="text-xs text-muted-foreground">Inheritance</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Applied To */}
                    <div>
                      <p className="text-sm font-medium mb-2">Applied To:</p>
                      <div className="flex flex-wrap gap-2">
                        {["Referral Commissions", "Internal Revenue", "House-Specific Income"].map((item) => (
                          <Badge key={item} variant="secondary">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribution by Tier</CardTitle>
                <CardDescription>
                  Houses receive distributions based on their tier, not their business revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { tier: "Observer", multiplier: "0x", desc: "Training not complete", color: "bg-gray-100" },
                    { tier: "Participant", multiplier: "1x", desc: "Base distribution", color: "bg-blue-100" },
                    { tier: "Contributor", multiplier: "1.5x", desc: "Voluntary contributions", color: "bg-green-100" },
                    { tier: "Partner", multiplier: "2x", desc: "24+ months, significant contribution", color: "bg-purple-100" },
                  ].map((item) => (
                    <div key={item.tier} className={`p-4 rounded-lg ${item.color}`}>
                      <p className="font-bold text-2xl">{item.multiplier}</p>
                      <p className="font-medium">{item.tier}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inheritance Map View */}
          <TabsContent value="inheritance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inheritance Flow</CardTitle>
                <CardDescription>
                  How wealth transfers to future generations through the 30% inheritance allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Inheritance Flow Diagram */}
                  <div className="p-6 bg-muted/30 rounded-lg">
                    <div className="flex flex-col items-center gap-6">
                      {/* Current Generation */}
                      <div className="text-center">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Crown className="w-10 h-10 text-primary" />
                        </div>
                        <p className="font-medium">Current Generation</p>
                        <p className="text-sm text-muted-foreground">Active House Members</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <ArrowDown className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm font-medium bg-purple-100 px-3 py-1 rounded">30% Inheritance</span>
                        <ArrowDown className="w-6 h-6 text-muted-foreground" />
                      </div>

                      {/* Inheritance Pool */}
                      <div className="w-full max-w-md p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-center mb-4">
                          <Wallet className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <p className="font-medium">House Inheritance Pool</p>
                          <p className="text-sm text-muted-foreground">Accumulated for future generations</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Accumulation Period</p>
                            <p className="font-medium">Continuous</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Distribution Trigger</p>
                            <p className="font-medium">Generational Transfer</p>
                          </div>
                        </div>
                      </div>

                      <ArrowDown className="w-6 h-6 text-muted-foreground" />

                      {/* Next Generation */}
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Users className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="font-medium">Heirs</p>
                          <p className="text-xs text-muted-foreground">Direct descendants</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Home className="w-8 h-8 text-blue-600" />
                          </div>
                          <p className="font-medium">New Houses</p>
                          <p className="text-xs text-muted-foreground">Family branches</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inheritance Rules */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Eligibility Requirements</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Complete required training modules</li>
                        <li>• Maintain active House membership</li>
                        <li>• Meet minimum participation thresholds</li>
                        <li>• Designated by current House head</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Distribution Options</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Lump sum at generational transfer</li>
                        <li>• Structured payments over time</li>
                        <li>• Seed funding for new House</li>
                        <li>• Education/training fund</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business-First Note */}
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Building2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-800 dark:text-green-200">
                      Business-First House Inheritance
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      For Business-First Houses, the inheritance pool is funded by platform usage fees, 
                      NOT by their existing business revenue. Their business remains independent and can 
                      be passed down through their own succession planning, separate from the L.A.W.S. 
                      ecosystem inheritance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
