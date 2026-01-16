import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Download,
  Eye,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";

// Revenue split configuration
const PLATFORM_SPLIT = {
  platform: 30, // HuBaRu/Platform fee
  operations: 70, // LuvOnPurpose operations
};

const INTERNAL_SPLIT = {
  root: 60, // Root House (Trust)
  circulation: 40, // Circulation Pool (Houses)
};

// Partner revenue shares
const PARTNER_SPLITS: Record<string, { partner: number; luvonpurpose: number; description: string }> = {
  "sweet_miracles": { partner: 30, luvonpurpose: 70, description: "Sweet Miracles - Outreach Partnership" },
  "standard": { partner: 0, luvonpurpose: 100, description: "Standard internal operations" },
};

// Mock revenue data
const MOCK_REVENUE_STREAMS = [
  { id: 1, source: "House Bundle Sales", amount: 5550, period: "Jan 2026", partner: null, status: "processed" },
  { id: 2, source: "Academy Course Fees", amount: 2400, period: "Jan 2026", partner: null, status: "processed" },
  { id: 3, source: "Outreach Program - Elder Rights", amount: 3200, period: "Jan 2026", partner: "sweet_miracles", status: "pending" },
  { id: 4, source: "Grant Administration Fee", amount: 1500, period: "Jan 2026", partner: null, status: "processed" },
  { id: 5, source: "Consulting Services", amount: 4000, period: "Jan 2026", partner: null, status: "processed" },
  { id: 6, source: "Joint Community Workshop", amount: 1800, period: "Jan 2026", partner: "sweet_miracles", status: "processed" },
];

const MOCK_DISTRIBUTIONS = [
  { id: 1, recipient: "Root House (Trust)", amount: 5880, type: "root_allocation", date: "2026-01-15", status: "completed" },
  { id: 2, recipient: "Circulation Pool", amount: 3920, type: "circulation", date: "2026-01-15", status: "completed" },
  { id: 3, recipient: "Sweet Miracles", amount: 1500, type: "partner_share", date: "2026-01-15", status: "completed" },
  { id: 4, recipient: "Platform Fee (HuBaRu)", amount: 2940, type: "platform_fee", date: "2026-01-15", status: "completed" },
];

export default function RevenueSharing() {
  const [selectedPeriod, setSelectedPeriod] = useState("jan_2026");
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcAmount, setCalcAmount] = useState("");
  const [calcPartner, setCalcPartner] = useState("standard");

  // Calculate totals
  const totalRevenue = MOCK_REVENUE_STREAMS.reduce((sum, r) => sum + r.amount, 0);
  const partnerRevenue = MOCK_REVENUE_STREAMS.filter(r => r.partner).reduce((sum, r) => sum + r.amount, 0);
  const internalRevenue = totalRevenue - partnerRevenue;

  // Calculate splits
  const platformFee = Math.round(totalRevenue * (PLATFORM_SPLIT.platform / 100));
  const operationsPool = totalRevenue - platformFee;
  const rootAllocation = Math.round(operationsPool * (INTERNAL_SPLIT.root / 100));
  const circulationPool = operationsPool - rootAllocation;

  // Partner calculations
  const partnerPayouts = MOCK_REVENUE_STREAMS
    .filter(r => r.partner)
    .reduce((sum, r) => {
      const split = PARTNER_SPLITS[r.partner!];
      return sum + Math.round(r.amount * (split.partner / 100));
    }, 0);

  const calculateSplit = (amount: number, partnerKey: string) => {
    const numAmount = parseFloat(amount.toString()) || 0;
    const split = PARTNER_SPLITS[partnerKey] || PARTNER_SPLITS.standard;
    
    const partnerShare = Math.round(numAmount * (split.partner / 100));
    const luvShare = numAmount - partnerShare;
    const platformFee = Math.round(luvShare * (PLATFORM_SPLIT.platform / 100));
    const operations = luvShare - platformFee;
    const root = Math.round(operations * (INTERNAL_SPLIT.root / 100));
    const circulation = operations - root;

    return { partnerShare, luvShare, platformFee, operations, root, circulation };
  };

  const handleExport = () => {
    toast.success("Revenue report exported to CSV");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Revenue Sharing Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track 70/30 splits, partner distributions, and internal allocations
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calculator className="w-4 h-4 mr-2" />
                  Split Calculator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Revenue Split Calculator</DialogTitle>
                  <DialogDescription>
                    Calculate how revenue will be distributed across partners and pools
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Revenue Amount ($)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Revenue Type</Label>
                    <Select value={calcPartner} onValueChange={setCalcPartner}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Internal Operations (100% LuvOnPurpose)</SelectItem>
                        <SelectItem value="sweet_miracles">Sweet Miracles Partnership (70/30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {calcAmount && (
                    <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                      <h4 className="font-semibold">Distribution Breakdown</h4>
                      {(() => {
                        const calc = calculateSplit(parseFloat(calcAmount), calcPartner);
                        return (
                          <div className="space-y-2 text-sm">
                            {calc.partnerShare > 0 && (
                              <div className="flex justify-between">
                                <span>Partner Share (30%):</span>
                                <span className="font-medium">${calc.partnerShare.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>LuvOnPurpose Share:</span>
                              <span className="font-medium">${calc.luvShare.toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between text-muted-foreground">
                                <span>→ Platform Fee (30%):</span>
                                <span>${calc.platformFee.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>→ Operations Pool (70%):</span>
                                <span>${calc.operations.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between">
                                <span>→→ Root House (60%):</span>
                                <span className="font-medium text-green-600">${calc.root.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>→→ Circulation Pool (40%):</span>
                                <span className="font-medium text-blue-600">${calc.circulation.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Root House Allocation</CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${rootAllocation.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">60% of operations pool</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Circulation Pool</CardTitle>
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${circulationPool.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">40% for House distributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Partner Payouts</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${partnerPayouts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Sweet Miracles NPO share</p>
            </CardContent>
          </Card>
        </div>

        {/* Split Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Flow Visualization</CardTitle>
            <CardDescription>How revenue flows through the 70/30 split structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-4">
              {/* Total Revenue */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <div>
                    <DollarSign className="w-8 h-8 mx-auto text-primary" />
                    <div className="text-lg font-bold">${totalRevenue.toLocaleString()}</div>
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium">Total Revenue</p>
              </div>

              <ArrowRight className="w-8 h-8 text-muted-foreground hidden lg:block" />
              <ArrowDownRight className="w-8 h-8 text-muted-foreground lg:hidden" />

              {/* Platform Split */}
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto">
                    <div>
                      <div className="text-lg font-bold text-orange-600">${platformFee.toLocaleString()}</div>
                      <div className="text-xs">30%</div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">Platform Fee</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                    <div>
                      <div className="text-lg font-bold text-green-600">${operationsPool.toLocaleString()}</div>
                      <div className="text-xs">70%</div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">Operations</p>
                </div>
              </div>

              <ArrowRight className="w-8 h-8 text-muted-foreground hidden lg:block" />
              <ArrowDownRight className="w-8 h-8 text-muted-foreground lg:hidden" />

              {/* Internal Split */}
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto">
                    <div>
                      <div className="text-lg font-bold text-emerald-600">${rootAllocation.toLocaleString()}</div>
                      <div className="text-xs">60%</div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">Root House</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto">
                    <div>
                      <div className="text-lg font-bold text-blue-600">${circulationPool.toLocaleString()}</div>
                      <div className="text-xs">40%</div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">Circulation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Details */}
        <Tabs defaultValue="streams" className="space-y-4">
          <TabsList>
            <TabsTrigger value="streams">Revenue Streams</TabsTrigger>
            <TabsTrigger value="distributions">Distributions</TabsTrigger>
            <TabsTrigger value="partners">Partner Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="streams">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Streams</CardTitle>
                <CardDescription>All incoming revenue with source and partner attribution</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_REVENUE_STREAMS.map((stream) => (
                      <TableRow key={stream.id}>
                        <TableCell className="font-medium">{stream.source}</TableCell>
                        <TableCell>${stream.amount.toLocaleString()}</TableCell>
                        <TableCell>{stream.period}</TableCell>
                        <TableCell>
                          {stream.partner ? (
                            <Badge variant="secondary">
                              {stream.partner === "sweet_miracles" ? "Sweet Miracles" : stream.partner}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Internal</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stream.status === "processed" ? "default" : "outline"}>
                            {stream.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distributions">
            <Card>
              <CardHeader>
                <CardTitle>Distribution History</CardTitle>
                <CardDescription>Completed and pending distributions to pools and partners</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_DISTRIBUTIONS.map((dist) => (
                      <TableRow key={dist.id}>
                        <TableCell className="font-medium">{dist.recipient}</TableCell>
                        <TableCell>
                          <span className={
                            dist.type === "root_allocation" ? "text-green-600" :
                            dist.type === "circulation" ? "text-blue-600" :
                            dist.type === "partner_share" ? "text-purple-600" :
                            "text-orange-600"
                          }>
                            ${dist.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {dist.type.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{dist.date}</TableCell>
                        <TableCell>
                          <Badge variant="default">{dist.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners">
            <Card>
              <CardHeader>
                <CardTitle>Partner Accounts</CardTitle>
                <CardDescription>Strategic partners with revenue sharing agreements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sweet Miracles Partner Card */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Sweet Miracles, NPO</h3>
                        <p className="text-sm text-muted-foreground">Elderly Abuse Prevention & Advocacy</p>
                        <div className="flex gap-2 mt-2">
                          <Badge>Outreach Partner</Badge>
                          <Badge variant="outline">Justice Collaboration</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">$1,500</div>
                        <p className="text-sm text-muted-foreground">Total Earned (YTD)</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue Split</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={30} className="h-2 flex-1" />
                          <span className="text-sm font-medium">30%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Board Status</p>
                        <p className="font-medium">Honorary Advisory (Non-Voting)</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Joint Programs</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Elder Rights Workshops</Badge>
                        <Badge variant="secondary">Community Outreach</Badge>
                        <Badge variant="secondary">Advocacy Training</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Add Partner Button */}
                  <Button variant="outline" className="w-full" onClick={() => toast.info("Partner onboarding coming soon")}>
                    <Users className="w-4 h-4 mr-2" />
                    Add Strategic Partner
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
