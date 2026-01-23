import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { ContractSummaryWidget } from "@/components/ContractSummaryWidget";
import { MeetingWidget } from "@/components/widgets/MeetingWidget";
import { ChatWidget } from "@/components/widgets/ChatWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Users,
  Wallet,
  Building2,
  FileText,
  Crown,
  Shield,
  Sparkles,
  Gift,
  Heart,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Circle,
  Lock,
  Unlock,
  DollarSign,
  Landmark,
  GraduationCap,
  AlertTriangle,
  Briefcase,
  Palette,
  Vote,
  ArrowRight,
  RefreshCw,
  Loader2,
} from "lucide-react";

// Token icons mapping
const TOKEN_ICONS: Record<string, React.ReactNode> = {
  MIRROR: <Shield className="w-5 h-5" />,
  GIFT: <Gift className="w-5 h-5" />,
  SPARK: <Sparkles className="w-5 h-5" />,
  HOUSE: <Home className="w-5 h-5" />,
  CROWN: <Crown className="w-5 h-5" />,
};

// Fund icons mapping
const FUND_ICONS: Record<string, React.ReactNode> = {
  land_acquisition: <Landmark className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  emergency: <AlertTriangle className="w-5 h-5" />,
  business_development: <Briefcase className="w-5 h-5" />,
  cultural_preservation: <Palette className="w-5 h-5" />,
  discretionary: <Vote className="w-5 h-5" />,
};

export default function HouseDashboard() {
  const { isAuthenticated } = useAuth();
  const [selectedHouseId, setSelectedHouseId] = useState<number | undefined>();

  // Fetch complete dashboard data
  const { data: dashboard, isLoading, refetch } = trpc.houseDashboard.getDashboard.useQuery(
    { houseId: selectedHouseId },
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please sign in to access your House Dashboard.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboard || !dashboard.hasHouse) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>No House Found</CardTitle>
              <CardDescription>
                Complete the Business Workshop to activate your House and access this dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = "/academy"}>
                Go to Academy
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Extract data from dashboard response
  const house = dashboard.house;
  const financial = dashboard.financial;
  const heirs = dashboard.heirs;
  const funds = dashboard.communityFunds;
  const assets = dashboard.assets;
  const tokens = dashboard.tokens;
  const splitRules = dashboard.splitRules;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Home className="w-8 h-8 text-primary" />
              {house?.name || "My House"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Registry ID: {house?.registryId} | Established {house?.activatedAt ? new Date(house.activatedAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Token Progression Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                    {tokens?.sequence?.map((token, index) => (
                  <div key={token} className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${
                      tokens.currentToken === token
                        ? "bg-primary text-primary-foreground"
                        : index < (tokens.sequence?.indexOf(tokens.currentToken as typeof token) ?? 0)
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {TOKEN_ICONS[token]}
                    </div>
                    <span className={`text-sm font-medium ${
                      tokens.currentToken === token ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {token}
                    </span>
                    {index < (tokens.sequence?.length ?? 0) - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground ml-2" />
                    )}
                  </div>
                ))}
              </div>
              <Badge variant={tokens?.crownActivated ? "default" : "secondary"}>
                {tokens?.crownActivated ? "Crown Achieved" : `Current: ${tokens?.currentToken}`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="heirs">Bloodline</TabsTrigger>
            <TabsTrigger value="funds">Community</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* LuvLedger Balance */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">LuvLedger Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(financial?.ledgerAccount?.currentBalance ?? 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reserve: ${(financial?.totals?.reserveAccumulated ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              {/* Total Heirs */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Designated Heirs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{heirs?.heirs?.length ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {heirs?.heirs?.filter((h: any) => h.vestingStatus === 'fully_vested').length ?? 0} fully vested
                  </p>
                </CardContent>
              </Card>

              {/* Community Funds */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Community Funds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(funds?.totalBalance ?? 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across {funds?.funds?.length ?? 0} funds
                  </p>
                </CardContent>
              </Card>

              {/* Total Assets */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${((assets?.realEstate?.totalValue ?? 0) + (assets?.businessEntities?.count ?? 0) * 10000).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {assets?.realEstate?.count ?? 0} properties, {assets?.businessEntities?.count ?? 0} entities
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contract Summary Widget */}
            <ContractSummaryWidget className="" />

            {/* Meeting & Chat Widgets */}
            {house?.id && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MeetingWidget
                  entityType="house"
                  entityId={house.id}
                  entityName={house.name}
                />
                <ChatWidget
                  entityType="house"
                  entityId={house.id}
                  entityName={house.name}
                />
              </div>
            )}

            {/* House Identity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  House Identity (Mirror)
                </CardTitle>
                <CardDescription>Your sovereign identity and lineage documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Founder</p>
                    <p className="font-medium">{house?.founder?.name ?? "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">House Motto</p>
                    <p className="font-medium italic">"{house?.motto || "Not yet established"}"</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={house?.status === "active" ? "default" : "secondary"}>
                      {house?.status}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">L.A.W.S. Framework Alignment</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {house?.lawsFramework && Object.entries(house.lawsFramework).map(([key, pillar]) => (
                      <div key={key} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{(pillar as { name: string; description: string }).name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financial?.recentTransactions?.slice(0, 5).map((tx: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        {tx.type === "income" || tx.type === "deposit" ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`font-medium ${tx.type === "income" || tx.type === "deposit" ? "text-green-500" : "text-red-500"}`}>
                        {tx.type === "income" || tx.type === "deposit" ? "+" : "-"}${tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {(!financial?.recentTransactions || financial.recentTransactions.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No recent transactions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            {/* Split Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 70/30 Treasury Split */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Treasury Split (70/30)
                  </CardTitle>
                  <CardDescription>Revenue distribution between House and Ancestral Treasury</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>House Retention</span>
                      <span className="font-medium">{splitRules?.treasury?.ENTITY_SHARE ?? 70}%</span>
                    </div>
                    <Progress value={splitRules?.treasury?.ENTITY_SHARE ?? 70} className="h-3" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ancestral Treasury</span>
                      <span className="font-medium">{splitRules?.treasury?.PLATFORM_FEE ?? 30}%</span>
                    </div>
                    <Progress value={splitRules?.treasury?.PLATFORM_FEE ?? 30} className="h-3 bg-muted" />
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    Total contributed to Treasury: <span className="font-medium text-foreground">${(financial?.totals?.platformFeesReceived ?? 0).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* 60/40 House Split */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    House Split (60/40)
                  </CardTitle>
                  <CardDescription>Internal allocation between Reserve and Community Share</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reserve Fund (Non-Shareable)</span>
                      <span className="font-medium">{splitRules?.houseInternal?.RESERVE ?? 60}%</span>
                    </div>
                    <Progress value={splitRules?.houseInternal?.RESERVE ?? 60} className="h-3" />
                    <p className="text-xs text-muted-foreground">
                      Balance: ${(financial?.totals?.reserveAccumulated ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Community Share (Heir Distribution)</span>
                      <span className="font-medium">{splitRules?.houseInternal?.COMMUNITY ?? 40}%</span>
                    </div>
                    <Progress value={splitRules?.houseInternal?.COMMUNITY ?? 40} className="h-3 bg-muted" />
                    <p className="text-xs text-muted-foreground">
                      Balance: ${(financial?.totals?.communityShareDistributed ?? 0).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* LuvLedger Details */}
            <Card>
              <CardHeader>
                <CardTitle>LuvLedger Account</CardTitle>
                <CardDescription>Complete financial overview with blockchain verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <p className="text-xl font-bold">${(financial?.ledgerAccount?.currentBalance ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Reserve (60%)</p>
                    <p className="text-xl font-bold">${(financial?.totals?.reserveAccumulated ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Shareable (40%)</p>
                    <p className="text-xl font-bold">${(financial?.totals?.communityShareDistributed ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Platform Fees</p>
                    <p className="text-xl font-bold">${(financial?.totals?.platformFeesReceived ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {financial?.recentTransactions?.map((tx: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {tx.type === "income" || tx.type === "deposit" ? (
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.type === "income" || tx.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "income" || tx.type === "deposit" ? "+" : "-"}${tx.amount.toLocaleString()}
                        </p>
                        <Badge variant="outline" className="text-xs">{tx.type}</Badge>
                      </div>
                    </div>
                  ))}
                  {(!financial?.recentTransactions || financial.recentTransactions.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Heirs/Bloodline Tab */}
          <TabsContent value="heirs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Bloodline Inheritance
                </CardTitle>
                <CardDescription>
                  Designated heirs receive automatic distributions from the 40% Community Share
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold">{heirs?.heirs?.length ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Total Heirs</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold">{heirs?.heirs?.filter((h: any) => h.vestingStatus === 'fully_vested').length ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Fully Vested</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold">${(heirs?.heirs?.reduce((sum: number, h: any) => sum + (h.totalDistributed || 0), 0) ?? 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Distributed</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  {heirs?.heirs?.map((heir: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Heart className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{heir.name}</p>
                            <p className="text-sm text-muted-foreground">{heir.relationship}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{heir.percentage}%</p>
                          <Badge variant={heir.isLocked ? "default" : "secondary"}>
                            {heir.isLocked ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
                            {heir.isLocked ? "Locked" : "Unlocked"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Vesting Progress</span>
                          <span>{heir.vestingProgress ?? 0}%</span>
                        </div>
                        <Progress value={heir.vestingProgress ?? 0} className="h-2" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Accumulated</p>
                          <p className="font-medium">${(heir.accumulatedBalance ?? 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Distributed</p>
                          <p className="font-medium">${(heir.totalDistributed ?? 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Next Milestone</p>
                          <p className="font-medium">{heir.nextMilestone || "Complete"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(!heirs?.heirs || heirs.heirs.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No heirs designated yet</p>
                    <Button variant="outline" className="mt-3">Add Heir</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Funds Tab */}
          <TabsContent value="funds" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Community Share Funds
                </CardTitle>
                <CardDescription>
                  The 40% Community Share is allocated across designated purpose funds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {funds?.funds?.map((fund: any, index: number) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {FUND_ICONS[fund.type] || <DollarSign className="w-5 h-5" />}
                          </div>
                          <Badge variant="outline">{fund.allocationPercentage}%</Badge>
                        </div>
                        <CardTitle className="text-base">{fund.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">${(fund.balance ?? 0).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {fund.disbursementCount ?? 0} disbursements
                        </p>
                        <Progress value={funds?.totalBalance ? (fund.balance / funds.totalBalance) * 100 : 0} className="h-2 mt-3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {(!funds?.funds || funds.funds.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No community funds configured yet</p>
                )}

                <Separator className="my-6" />

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Community Funds</p>
                    <p className="text-2xl font-bold">${(funds?.totalBalance ?? 0).toLocaleString()}</p>
                  </div>
                  <Button variant="outline">Request Disbursement</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Real Estate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Real Estate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{assets?.realEstate?.count ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Properties</p>
                  <Separator className="my-3" />
                  <p className="text-lg font-medium">${(assets?.realEstate?.totalValue ?? 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </CardContent>
              </Card>

              {/* Business Entities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Business Entities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{assets?.businessEntities?.count ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Active Entities</p>
                  <Separator className="my-3" />
                  <p className="text-lg font-medium">{assets?.businessEntities?.entities?.length ?? 0} registered</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </CardContent>
              </Card>

              {/* Document Vault */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document Vault
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{assets?.documentVault?.documentCount ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <Separator className="my-3" />
                  <Progress 
                    value={assets?.documentVault?.storageLimit ? ((assets?.documentVault?.storageUsed ?? 0) / assets.documentVault.storageLimit) * 100 : 0} 
                    className="h-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round((assets?.documentVault?.storageUsed ?? 0) / 1024 / 1024)}MB / {Math.round((assets?.documentVault?.storageLimit ?? 0) / 1024 / 1024)}MB
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Token Progression Journey
                </CardTitle>
                <CardDescription>
                  Progress through the sovereign token sequence to achieve the Crown of Completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {tokens?.sequence?.map((token, index) => {
                    const isActive = tokens.currentToken === token;
                    const isComplete = index < (tokens.sequence?.indexOf(tokens.currentToken as typeof token) ?? 0);

                    return (
                      <div key={token} className={`p-4 rounded-lg border-2 ${
                        isActive ? "border-primary bg-primary/5" : 
                        isComplete ? "border-green-500 bg-green-500/5" : 
                        "border-muted"
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${
                            isActive ? "bg-primary text-primary-foreground" :
                            isComplete ? "bg-green-500 text-white" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {isComplete ? <CheckCircle2 className="w-6 h-6" /> : TOKEN_ICONS[token]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-lg">{token}</h3>
                              <Badge variant={isComplete ? "default" : isActive ? "secondary" : "outline"}>
                                {isComplete ? "Complete" : isActive ? "In Progress" : "Pending"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {getTokenDescription(token)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-6" />

                {/* Post-Activation Courses */}
                <div>
                  <h3 className="font-bold mb-4">Post-Activation Courses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tokens?.postActivationProgress?.courses?.map((course: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        {course.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{course.courseName}</p>
                          <p className="text-xs text-muted-foreground">{course.courseType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {tokens?.postActivationProgress && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Crown Progress</span>
                        <span>{tokens.postActivationProgress.percentage}%</span>
                      </div>
                      <Progress value={tokens.postActivationProgress.percentage} className="h-3" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function getTokenDescription(token: string): string {
  const descriptions: Record<string, string> = {
    MIRROR: "Self-reflection and identity establishment - understand your roots and document your lineage",
    GIFT: "Generosity and community building - share knowledge and resources with others",
    SPARK: "Innovation and creation - develop business ideas and entrepreneurial skills",
    HOUSE: "Foundation and stability - establish your House with proper legal structure",
    CROWN: "Achievement and legacy - complete all requirements and receive the Crown of Completion",
  };
  return descriptions[token] || "";
}
