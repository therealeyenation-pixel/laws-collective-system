import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  FileText,
  Users,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Vote,
  Gavel,
  TrendingUp,
  Building,
  Plus,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  RefreshCw,
} from "lucide-react";

// Mock data for demonstration
const mockProposals = [
  {
    id: "prop-1",
    type: "new_investment",
    title: "Purchase Vanguard Total Stock Market ETF",
    description: "Invest $50,000 in VTI for long-term growth",
    status: "under_review",
    submittedBy: "John Smith",
    submittedAt: new Date("2026-01-20"),
    proposedAmount: 50000,
    riskLevel: "medium",
    votes: { approve: 2, reject: 0, abstain: 1 },
    requiredVotes: 5,
  },
  {
    id: "prop-2",
    type: "reallocation",
    title: "Rebalance Bond Allocation",
    description: "Reduce bond allocation from 40% to 30%",
    status: "approved",
    submittedBy: "Jane Doe",
    submittedAt: new Date("2026-01-15"),
    proposedAmount: 25000,
    riskLevel: "low",
    votes: { approve: 4, reject: 1, abstain: 0 },
    requiredVotes: 5,
  },
  {
    id: "prop-3",
    type: "liquidate",
    title: "Sell Underperforming Tech Stock",
    description: "Liquidate position in XYZ Corp due to poor performance",
    status: "draft",
    submittedBy: "Bob Johnson",
    submittedAt: new Date("2026-01-25"),
    proposedAmount: 15000,
    riskLevel: "high",
    votes: { approve: 0, reject: 0, abstain: 0 },
    requiredVotes: 5,
  },
];

const mockCommittees = [
  {
    id: "comm-1",
    name: "Investment Committee",
    description: "Oversees all investment decisions",
    members: [
      { name: "John Smith", role: "chair", votingRights: true },
      { name: "Jane Doe", role: "vice_chair", votingRights: true },
      { name: "Bob Johnson", role: "member", votingRights: true },
      { name: "Alice Williams", role: "member", votingRights: true },
      { name: "Charlie Brown", role: "advisor", votingRights: false },
    ],
    quorumRequirement: 60,
    approvalThreshold: 66,
    meetingFrequency: "monthly",
  },
];

const mockPolicies = [
  {
    id: "pol-1",
    name: "Asset Allocation Policy",
    category: "asset_allocation",
    status: "active",
    description: "Maximum 60% equities, minimum 20% fixed income",
    effectiveDate: new Date("2025-01-01"),
    violations: 0,
  },
  {
    id: "pol-2",
    name: "Concentration Limits",
    category: "concentration",
    status: "active",
    description: "No single holding exceeds 10% of portfolio",
    effectiveDate: new Date("2025-01-01"),
    violations: 1,
  },
  {
    id: "pol-3",
    name: "ESG Criteria",
    category: "esg_criteria",
    status: "active",
    description: "Exclude companies with poor environmental records",
    effectiveDate: new Date("2025-06-01"),
    violations: 0,
  },
  {
    id: "pol-4",
    name: "Prohibited Investments",
    category: "prohibited",
    status: "active",
    description: "No tobacco, weapons, or gambling companies",
    effectiveDate: new Date("2025-01-01"),
    violations: 0,
  },
];

const mockViolations = [
  {
    id: "viol-1",
    policyName: "Concentration Limits",
    severity: "warning",
    status: "open",
    description: "AAPL position at 12% exceeds 10% limit",
    detectedAt: new Date("2026-01-22"),
    ticker: "AAPL",
    currentValue: 12,
    threshold: 10,
  },
];

const mockMeetings = [
  {
    id: "meet-1",
    committeeName: "Investment Committee",
    scheduledDate: new Date("2026-02-01T14:00:00"),
    location: "Conference Room A / Zoom",
    status: "scheduled",
    agendaItems: [
      { title: "Review Q4 Performance", type: "performance_review" },
      { title: "Vote on VTI Purchase", type: "proposal_review" },
      { title: "Policy Update Discussion", type: "policy_review" },
    ],
  },
  {
    id: "meet-2",
    committeeName: "Investment Committee",
    scheduledDate: new Date("2026-01-05T14:00:00"),
    location: "Conference Room A",
    status: "completed",
    agendaItems: [
      { title: "Review Bond Reallocation", type: "proposal_review" },
      { title: "Annual Policy Review", type: "policy_review" },
    ],
  },
];

const proposalTypeLabels: Record<string, string> = {
  new_investment: "New Investment",
  increase_position: "Increase Position",
  decrease_position: "Decrease Position",
  liquidate: "Liquidate",
  reallocation: "Reallocation",
  manager_change: "Manager Change",
  policy_change: "Policy Change",
  emergency_action: "Emergency Action",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  submitted: "bg-blue-500",
  under_review: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  implemented: "bg-purple-500",
  withdrawn: "bg-gray-400",
};

const riskColors: Record<string, string> = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  very_high: "text-red-600",
};

export default function InvestmentGovernanceDashboard() {
  const [activeTab, setActiveTab] = useState("proposals");
  const [showNewProposalDialog, setShowNewProposalDialog] = useState(false);
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<typeof mockProposals[0] | null>(null);
  const [voteType, setVoteType] = useState<string>("");
  const [voteComments, setVoteComments] = useState("");

  const handleVote = () => {
    if (!selectedProposal || !voteType) return;
    toast.success(`Vote recorded: ${voteType} for "${selectedProposal.title}"`);
    setShowVoteDialog(false);
    setSelectedProposal(null);
    setVoteType("");
    setVoteComments("");
  };

  const handleCreateProposal = () => {
    toast.success("Proposal created successfully");
    setShowNewProposalDialog(false);
  };

  const pendingProposals = mockProposals.filter(p => p.status === "under_review" || p.status === "submitted");
  const openViolations = mockViolations.filter(v => v.status === "open");
  const upcomingMeetings = mockMeetings.filter(m => m.status === "scheduled");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Governance</h1>
            <p className="text-muted-foreground">
              Manage proposals, committees, policies, and compliance
            </p>
          </div>
          <Dialog open={showNewProposalDialog} onOpenChange={setShowNewProposalDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Proposal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Investment Proposal</DialogTitle>
                <DialogDescription>
                  Submit a new investment proposal for committee review
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Proposal Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(proposalTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Risk Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="very_high">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Enter proposal title" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the investment proposal" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ticker Symbol (if applicable)</Label>
                    <Input placeholder="e.g., VTI, AAPL" />
                  </div>
                  <div className="space-y-2">
                    <Label>Proposed Amount ($)</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rationale</Label>
                  <Textarea placeholder="Explain why this investment is recommended" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Risk Factors</Label>
                  <Textarea placeholder="List potential risks (one per line)" rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewProposalDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProposal}>Create Proposal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingProposals.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting committee review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPolicies.filter(p => p.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">Governing investment decisions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Violations</CardTitle>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{openViolations.length}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="proposals" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Proposals</span>
            </TabsTrigger>
            <TabsTrigger value="committees" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Committees</span>
            </TabsTrigger>
            <TabsTrigger value="policies" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Policies</span>
            </TabsTrigger>
            <TabsTrigger value="violations" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Violations</span>
            </TabsTrigger>
            <TabsTrigger value="meetings" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Meetings</span>
            </TabsTrigger>
          </TabsList>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Investment Proposals</CardTitle>
                <CardDescription>Review and vote on pending investment proposals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={statusColors[proposal.status]}>
                              {proposal.status.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline">
                              {proposalTypeLabels[proposal.type]}
                            </Badge>
                            <span className={`text-sm font-medium ${riskColors[proposal.riskLevel]}`}>
                              {proposal.riskLevel.toUpperCase()} RISK
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg">{proposal.title}</h3>
                          <p className="text-sm text-muted-foreground">{proposal.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>By {proposal.submittedBy}</span>
                            <span>•</span>
                            <span>{proposal.submittedAt.toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="font-medium">${proposal.proposedAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-sm text-muted-foreground">
                            Votes: {proposal.votes.approve + proposal.votes.reject + proposal.votes.abstain} / {proposal.requiredVotes}
                          </div>
                          <Progress
                            value={((proposal.votes.approve + proposal.votes.reject + proposal.votes.abstain) / proposal.requiredVotes) * 100}
                            className="w-32 h-2"
                          />
                          <div className="flex gap-2 text-xs">
                            <span className="text-green-600">{proposal.votes.approve} approve</span>
                            <span className="text-red-600">{proposal.votes.reject} reject</span>
                            <span className="text-gray-600">{proposal.votes.abstain} abstain</span>
                          </div>
                          {proposal.status === "under_review" && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProposal(proposal);
                                  setShowVoteDialog(true);
                                }}
                              >
                                <Vote className="w-4 h-4 mr-1" />
                                Vote
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Committees Tab */}
          <TabsContent value="committees" className="space-y-4">
            {mockCommittees.map((committee) => (
              <Card key={committee.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        {committee.name}
                      </CardTitle>
                      <CardDescription>{committee.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{committee.meetingFrequency}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Committee Members</h4>
                      <div className="space-y-2">
                        {committee.members.map((member, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded bg-accent/50"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span>{member.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="capitalize">
                                {member.role.replace("_", " ")}
                              </Badge>
                              {member.votingRights && (
                                <Badge variant="outline" className="text-green-600">
                                  Voting
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Governance Rules</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Quorum Requirement</span>
                            <span className="font-medium">{committee.quorumRequirement}%</span>
                          </div>
                          <Progress value={committee.quorumRequirement} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Approval Threshold</span>
                            <span className="font-medium">{committee.approvalThreshold}%</span>
                          </div>
                          <Progress value={committee.approvalThreshold} className="h-2" />
                        </div>
                        <div className="p-3 bg-accent/50 rounded">
                          <p className="text-sm text-muted-foreground">
                            Decisions require at least {committee.quorumRequirement}% member participation
                            and {committee.approvalThreshold}% approval to pass.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Investment Policies</CardTitle>
                    <CardDescription>Rules governing investment decisions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={policy.status === "active" ? "default" : "secondary"}
                              className={policy.status === "active" ? "bg-green-500" : ""}
                            >
                              {policy.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {policy.category.replace("_", " ")}
                            </Badge>
                          </div>
                          <h3 className="font-semibold">{policy.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{policy.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Effective: {policy.effectiveDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {policy.violations > 0 ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {policy.violations} violation{policy.violations > 1 ? "s" : ""}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Compliant
                            </Badge>
                          )}
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4 mr-1" />
                            View Rules
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Violations Tab */}
          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Policy Violations
                    </CardTitle>
                    <CardDescription>Issues requiring attention or resolution</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Run Compliance Check
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {mockViolations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg">All Clear</h3>
                    <p className="text-muted-foreground">No policy violations detected</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockViolations.map((violation) => (
                      <div
                        key={violation.id}
                        className="border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant={violation.severity === "critical" ? "destructive" : "outline"}
                                className={violation.severity === "warning" ? "border-orange-500 text-orange-600" : ""}
                              >
                                {violation.severity}
                              </Badge>
                              <Badge variant="outline">{violation.status}</Badge>
                            </div>
                            <h3 className="font-semibold">{violation.policyName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{violation.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-muted-foreground">
                                Ticker: <span className="font-medium">{violation.ticker}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Current: <span className="font-medium text-red-600">{violation.currentValue}%</span>
                              </span>
                              <span className="text-muted-foreground">
                                Limit: <span className="font-medium">{violation.threshold}%</span>
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Detected: {violation.detectedAt.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline">
                              Resolve
                            </Button>
                            <Button size="sm" variant="ghost">
                              Waive
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Committee Meetings</CardTitle>
                    <CardDescription>Schedule and manage investment committee meetings</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Schedule Meeting
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={meeting.status === "scheduled" ? "default" : "secondary"}
                              className={meeting.status === "scheduled" ? "bg-blue-500" : ""}
                            >
                              {meeting.status}
                            </Badge>
                          </div>
                          <h3 className="font-semibold">{meeting.committeeName}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {meeting.scheduledDate.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {meeting.scheduledDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span>{meeting.location}</span>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">Agenda Items:</p>
                            <div className="space-y-1">
                              {meeting.agendaItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-xs">
                                    {idx + 1}
                                  </span>
                                  <span>{item.title}</span>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {item.type.replace("_", " ")}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {meeting.status === "scheduled" && (
                            <>
                              <Button size="sm">Start Meeting</Button>
                              <Button size="sm" variant="outline">Edit</Button>
                            </>
                          )}
                          {meeting.status === "completed" && (
                            <Button size="sm" variant="outline">
                              View Minutes
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Vote Dialog */}
        <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cast Your Vote</DialogTitle>
              <DialogDescription>
                {selectedProposal?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={voteType === "approve" ? "default" : "outline"}
                  className={voteType === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setVoteType("approve")}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant={voteType === "reject" ? "default" : "outline"}
                  className={voteType === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
                  onClick={() => setVoteType("reject")}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant={voteType === "abstain" ? "default" : "outline"}
                  className={voteType === "abstain" ? "bg-gray-600 hover:bg-gray-700" : ""}
                  onClick={() => setVoteType("abstain")}
                >
                  <MinusCircle className="w-4 h-4 mr-2" />
                  Abstain
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Comments (Optional)</Label>
                <Textarea
                  placeholder="Add any comments or rationale for your vote"
                  value={voteComments}
                  onChange={(e) => setVoteComments(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleVote} disabled={!voteType}>
                Submit Vote
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
