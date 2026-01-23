import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Users,
  DollarSign,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  Calculator,
  History,
  Settings,
  Plus,
  Eye,
} from "lucide-react";

export default function FoundingMemberBonus() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showDistributeDialog, setShowDistributeDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<any>(null);
  
  // Form states
  const [newMemberUserId, setNewMemberUserId] = useState("");
  const [newMemberNumber, setNewMemberNumber] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  
  // Queries
  const { data: summary, refetch: refetchSummary } = trpc.foundingMemberBonus.getBonusSummary.useQuery();
  const { data: members, refetch: refetchMembers } = trpc.foundingMemberBonus.getFoundingMembers.useQuery({ status: 'all' });
  const { data: pools } = trpc.foundingMemberBonus.getBonusPools.useQuery();
  const { data: distributions, refetch: refetchDistributions } = trpc.foundingMemberBonus.getDistributionHistory.useQuery({ limit: 20 });
  
  // Preview query
  const { data: preview, refetch: refetchPreview } = trpc.foundingMemberBonus.calculateBonusPreview.useQuery(
    {
      poolId: pools?.[0]?.id || 1,
      periodStart: periodStart ? new Date(periodStart).getTime() : Date.now() - 90 * 24 * 60 * 60 * 1000,
      periodEnd: periodEnd ? new Date(periodEnd).getTime() : Date.now(),
    },
    { enabled: showPreviewDialog && !!pools?.[0] }
  );
  
  // Mutations
  const addMember = trpc.foundingMemberBonus.addFoundingMember.useMutation({
    onSuccess: () => {
      toast.success("Founding member added successfully");
      setShowAddMemberDialog(false);
      refetchMembers();
      refetchSummary();
    },
    onError: (err) => toast.error(err.message),
  });
  
  const createDistribution = trpc.foundingMemberBonus.createDistribution.useMutation({
    onSuccess: (data) => {
      toast.success(`Distribution created! $${data.totalDistributed.toFixed(2)} distributed to ${data.eligibleMembers} members`);
      setShowDistributeDialog(false);
      refetchDistributions();
      refetchSummary();
    },
    onError: (err) => toast.error(err.message),
  });
  
  const updateMemberStatus = trpc.foundingMemberBonus.updateFoundingMemberStatus.useMutation({
    onSuccess: () => {
      toast.success("Member status updated");
      refetchMembers();
    },
    onError: (err) => toast.error(err.message),
  });
  
  const updatePaymentStatus = trpc.foundingMemberBonus.updatePaymentStatus.useMutation({
    onSuccess: () => {
      toast.success("Payment status updated");
      refetchDistributions();
    },
    onError: (err) => toast.error(err.message),
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      deceased: "destructive",
      transferred: "outline",
      pending: "secondary",
      paid: "default",
      processing: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Founding Member Bonus</h1>
            <p className="text-muted-foreground mt-1">
              Manage founding member distributions from service revenue
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreviewDialog(true)}>
              <Calculator className="w-4 h-4 mr-2" />
              Preview Distribution
            </Button>
            <Button onClick={() => setShowDistributeDialog(true)}>
              <DollarSign className="w-4 h-4 mr-2" />
              Create Distribution
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary?.totalDistributedAllTime || 0)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Founding Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.activeFoundingMembers || 0}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Distributions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalDistributions || 0}</div>
              <p className="text-xs text-muted-foreground">Total distributions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary?.pendingPaymentsAmount || 0)}</div>
              <p className="text-xs text-muted-foreground">{summary?.pendingPaymentsCount || 0} payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="distributions">
              <History className="w-4 h-4 mr-2" />
              Distributions
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Last Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Last Distribution</CardTitle>
                  <CardDescription>Most recent bonus distribution details</CardDescription>
                </CardHeader>
                <CardContent>
                  {summary?.lastDistribution ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{formatDate(summary.lastDistribution.distribution_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Distributed</span>
                        <span className="font-medium">{formatCurrency(Number(summary.lastDistribution.total_distributed))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Members</span>
                        <span className="font-medium">{summary.lastDistribution.eligible_members}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Per Member</span>
                        <span className="font-medium text-green-600">{formatCurrency(Number(summary.lastDistribution.per_member_amount))}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No distributions yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Pool Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Bonus Pool</CardTitle>
                  <CardDescription>Current pool configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  {pools?.[0] ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pool Name</span>
                        <span className="font-medium">{pools[0].pool_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Source Percentage</span>
                        <span className="font-medium">{pools[0].source_percentage}% of L.A.W.S. share</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frequency</span>
                        <span className="font-medium capitalize">{pools[0].distribution_frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        {getStatusBadge(pools[0].is_active ? 'active' : 'inactive')}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No pool configured</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Founding Members</h3>
              <Button onClick={() => setShowAddMemberDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
            
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members?.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">#{member.member_number}</TableCell>
                      <TableCell>{member.user_name || 'N/A'}</TableCell>
                      <TableCell>{member.user_email || 'N/A'}</TableCell>
                      <TableCell>{formatDate(member.joined_date)}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={member.status}
                          onValueChange={(value) => updateMemberStatus.mutate({ id: member.id, status: value as any })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="deceased">Deceased</SelectItem>
                            <SelectItem value="transferred">Transferred</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!members || members.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No founding members registered
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Distributions Tab */}
          <TabsContent value="distributions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribution History</CardTitle>
                <CardDescription>Past bonus distributions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Revenue Base</TableHead>
                      <TableHead>Pool Contribution</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Per Member</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions?.map((dist: any) => (
                      <TableRow key={dist.id}>
                        <TableCell>{formatDate(dist.distribution_date)}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(dist.period_start)} - {formatDate(dist.period_end)}
                        </TableCell>
                        <TableCell>{formatCurrency(Number(dist.total_revenue_base))}</TableCell>
                        <TableCell>{formatCurrency(Number(dist.pool_contribution))}</TableCell>
                        <TableCell>{dist.eligible_members}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(Number(dist.per_member_amount))}
                        </TableCell>
                        <TableCell>{getStatusBadge(dist.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDistribution(dist)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!distributions || distributions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No distributions yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pool Settings</CardTitle>
                <CardDescription>Configure bonus pool parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pools?.[0] && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Source Percentage</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Percentage of L.A.W.S. 60% share allocated to bonus pool
                        </p>
                        <Input
                          type="number"
                          value={pools[0].source_percentage}
                          disabled
                          className="w-32"
                        />
                      </div>
                      <div>
                        <Label>Distribution Frequency</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          How often bonuses are distributed
                        </p>
                        <Select value={pools[0].distribution_frequency} disabled>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="semi_annually">Semi-Annually</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Distribution Formula</h4>
                      <p className="text-sm text-muted-foreground">
                        Service Revenue × 60% (L.A.W.S. Share) × {pools[0].source_percentage}% = Bonus Pool
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Bonus Pool ÷ Active Founding Members = Per Member Amount
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Member Dialog */}
        <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Founding Member</DialogTitle>
              <DialogDescription>Register a new founding member for bonus distributions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User ID</Label>
                <Input
                  type="number"
                  value={newMemberUserId}
                  onChange={(e) => setNewMemberUserId(e.target.value)}
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <Label>Member Number</Label>
                <Input
                  type="number"
                  value={newMemberNumber}
                  onChange={(e) => setNewMemberNumber(e.target.value)}
                  placeholder="Enter member number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>Cancel</Button>
              <Button
                onClick={() => addMember.mutate({
                  userId: parseInt(newMemberUserId),
                  memberNumber: parseInt(newMemberNumber),
                  joinedDate: Date.now(),
                })}
                disabled={!newMemberUserId || !newMemberNumber}
              >
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Distribution Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Distribution Preview</DialogTitle>
              <DialogDescription>Preview bonus calculation before distributing</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Period Start</Label>
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Period End</Label>
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
              
              {preview && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span>Total Service Revenue</span>
                    <span className="font-medium">{formatCurrency(preview.totalServiceRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>L.A.W.S. Share (60%)</span>
                    <span className="font-medium">{formatCurrency(preview.lawsShare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus Pool ({preview.bonusPercentage}%)</span>
                    <span className="font-medium">{formatCurrency(preview.poolContribution)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span>Eligible Members</span>
                    <span className="font-medium">{preview.eligibleMembers}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Per Member Amount</span>
                    <span className="font-bold text-green-600">{formatCurrency(preview.perMemberAmount)}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>Close</Button>
              <Button onClick={() => refetchPreview()}>Recalculate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Distribution Dialog */}
        <Dialog open={showDistributeDialog} onOpenChange={setShowDistributeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Distribution</DialogTitle>
              <DialogDescription>Distribute bonuses to founding members</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Period Start</Label>
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Period End</Label>
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This will create payment records for all active founding members and record the distribution to LuvLedger.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDistributeDialog(false)}>Cancel</Button>
              <Button
                onClick={() => createDistribution.mutate({
                  poolId: pools?.[0]?.id || 1,
                  periodStart: new Date(periodStart).getTime(),
                  periodEnd: new Date(periodEnd).getTime(),
                })}
                disabled={!periodStart || !periodEnd || createDistribution.isPending}
              >
                {createDistribution.isPending ? "Processing..." : "Create Distribution"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
