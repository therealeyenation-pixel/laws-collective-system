import { useState } from "react";
import EntityGrants from "@/components/EntityGrants";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  DollarSign,
  Calendar,
  Target,
  TrendingUp,
  Plus,
  ExternalLink,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Building2,
  Users,
  Heart,
  Sparkles,
  RefreshCw,
} from "lucide-react";

// Grant data for display before database is ready
const staticGrants = [
  {
    id: 1,
    name: "Amber Grant",
    funderName: "WomensNet",
    funderType: "foundation",
    description: "Monthly $10,000 grants to women-owned businesses. Monthly winners eligible for $50,000 annual grant.",
    minAmount: "10000",
    maxAmount: "50000",
    eligibilityRequirements: "Women-owned business in US or Canada. No time in business requirement.",
    isRolling: true,
    applicationUrl: "https://ambergrantsforwomen.com/",
    priority: "high",
    status: "eligible",
    focusAreas: ["women_owned", "small_business"],
    notes: "Apply monthly. Easy application process. $15 application fee.",
  },
  {
    id: 2,
    name: "Women Founders Grant",
    funderName: "Women Founders Grant",
    funderType: "foundation",
    description: "Monthly $5,000 grant to women-owned businesses.",
    minAmount: "5000",
    maxAmount: "5000",
    eligibilityRequirements: "18+ years old, US-based, 51% women-owned and operated.",
    isRolling: true,
    applicationUrl: "https://womenfoundersgrant.com/",
    priority: "high",
    status: "eligible",
    focusAreas: ["women_owned"],
    notes: "Deadline: last day of each month.",
  },
  {
    id: 3,
    name: "HerRise Microgrant",
    funderName: "Yva Jourdan Foundation / HerSuiteSpot",
    funderType: "foundation",
    description: "Monthly $1,000 grants for under-resourced women entrepreneurs including women of color.",
    minAmount: "1000",
    maxAmount: "1000",
    eligibilityRequirements: "51% woman owned, less than $1 million gross revenue.",
    isRolling: true,
    applicationUrl: "https://hersuitespot.com/herrise-microgrant/",
    priority: "high",
    status: "eligible",
    focusAreas: ["women_owned", "minority_owned"],
    notes: "Monthly applications accepted.",
  },
  {
    id: 4,
    name: "IFundWomen Universal Application",
    funderName: "IFundWomen",
    funderType: "corporate",
    description: "Submit one application and get matched to grants from enterprise partners like Visa, Neutrogena, American Express.",
    eligibilityRequirements: "Women-owned business.",
    isRolling: true,
    applicationUrl: "https://ifundwomen.com/",
    priority: "high",
    status: "eligible",
    focusAreas: ["women_owned"],
    notes: "Submit once, get matched automatically when new partner grants become available.",
  },
  {
    id: 5,
    name: "NAACP Powershift Entrepreneur Grant",
    funderName: "NAACP",
    funderType: "foundation",
    description: "Grants for Black entrepreneurs to support business growth.",
    minAmount: "25000",
    maxAmount: "25000",
    eligibilityRequirements: "Black entrepreneurs.",
    isRolling: true,
    applicationUrl: "https://naacp.org/find-resources/grants",
    priority: "high",
    status: "eligible",
    focusAreas: ["minority_owned", "black_owned"],
    notes: "Rolling deadline.",
  },
  {
    id: 6,
    name: "Wish Local Empowerment Program",
    funderName: "Wish",
    funderType: "corporate",
    description: "Grants for Black-owned small businesses.",
    minAmount: "500",
    maxAmount: "2000",
    eligibilityRequirements: "Black-owned, fewer than 20 employees, annual revenue under $1 million.",
    isRolling: true,
    applicationUrl: "https://www.wish.com/local",
    priority: "medium",
    status: "eligible",
    focusAreas: ["minority_owned", "black_owned", "small_business"],
    notes: "Rolling deadline.",
  },
  {
    id: 7,
    name: "Hustler's Microgrant",
    funderName: "Hustler's Microgrant",
    funderType: "foundation",
    description: "Monthly $1,000 grant for passionate entrepreneurs.",
    minAmount: "1000",
    maxAmount: "1000",
    eligibilityRequirements: "Small business owners across the US.",
    isRolling: true,
    applicationUrl: "https://hustlersmicrogrant.com/",
    priority: "medium",
    status: "eligible",
    focusAreas: ["small_business"],
    notes: "Rolling monthly deadline.",
  },
  {
    id: 8,
    name: "Freed Fellowship Grant",
    funderName: "Freed Fellowship",
    funderType: "foundation",
    description: "Monthly $500 micro-grant. Monthly recipients eligible for $2,500 annual grant.",
    minAmount: "500",
    maxAmount: "2500",
    eligibilityRequirements: "Small business owners. Women and minority entrepreneurs encouraged.",
    isRolling: true,
    applicationUrl: "https://freedfellowship.com/",
    priority: "medium",
    status: "eligible",
    focusAreas: ["small_business", "women_owned", "minority_owned"],
    notes: "Rolling applications accepted.",
  },
  {
    id: 9,
    name: "Awesome Foundation Grant",
    funderName: "Awesome Foundation",
    funderType: "community",
    description: "Monthly $1,000 microgrants for awesome projects.",
    minAmount: "1000",
    maxAmount: "1000",
    eligibilityRequirements: "Individuals, groups, businesses, startups with awesome ideas.",
    isRolling: true,
    applicationUrl: "https://www.awesomefoundation.org/",
    priority: "medium",
    status: "eligible",
    focusAreas: ["community", "innovation"],
    notes: "Funded by independently-run local chapters.",
  },
  {
    id: 10,
    name: "EmpowHER Grants",
    funderName: "Boundless Futures Foundation",
    funderType: "foundation",
    description: "Up to $25,000 for female founders addressing societal issues.",
    minAmount: "0",
    maxAmount: "25000",
    eligibilityRequirements: "Business established within last 3 years, addresses poverty/hunger, sustainability, or strong communities.",
    applicationUrl: "https://boundlessfuturesfoundation.org/empowher-grants/",
    priority: "medium",
    status: "researching",
    focusAreas: ["women_owned", "social_impact"],
    notes: "Quarterly applications. Reimbursement model.",
  },
  {
    id: 11,
    name: "Black Ambition Prize",
    funderName: "Black Ambition",
    funderType: "foundation",
    description: "Up to $1 million for businesses with Black or Hispanic/Latinx founding team.",
    minAmount: "0",
    maxAmount: "1000000",
    eligibilityRequirements: "Business with Black or Hispanic/Latinx founding team member.",
    applicationUrl: "https://www.blackambitionprize.com/",
    priority: "low",
    status: "researching",
    focusAreas: ["minority_owned", "black_owned", "innovation"],
    notes: "Annual competition. Very competitive.",
  },
  {
    id: 12,
    name: "Instrumentl Faith-Based Grants Database",
    funderName: "Various Foundations",
    funderType: "religious",
    description: "100+ grants for faith-based organizations. Median grant $10K, total $3.2M available.",
    typicalAmount: "10000",
    eligibilityRequirements: "Religious organizations, faith-based nonprofits.",
    applicationUrl: "https://www.instrumentl.com/browse-grants/faith-based-grants",
    priority: "medium",
    status: "researching",
    focusAreas: ["faith_based", "community", "education"],
    notes: "Use Instrumentl platform to search and match. 14-day free trial available.",
  },
];

const statusColors: Record<string, string> = {
  researching: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  eligible: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  not_eligible: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  applying: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  submitted: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const focusAreaIcons: Record<string, React.ReactNode> = {
  women_owned: <Users className="w-3 h-3" />,
  minority_owned: <Users className="w-3 h-3" />,
  black_owned: <Users className="w-3 h-3" />,
  small_business: <Building2 className="w-3 h-3" />,
  faith_based: <Heart className="w-3 h-3" />,
  community: <Users className="w-3 h-3" />,
  innovation: <Sparkles className="w-3 h-3" />,
  social_impact: <Target className="w-3 h-3" />,
  education: <FileText className="w-3 h-3" />,
};

export default function GrantManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedGrant, setSelectedGrant] = useState<typeof staticGrants[0] | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter grants
  const filteredGrants = staticGrants.filter(grant => {
    const matchesSearch = grant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.funderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || grant.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || grant.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate stats
  const stats = {
    total: staticGrants.length,
    eligible: staticGrants.filter(g => g.status === "eligible").length,
    highPriority: staticGrants.filter(g => g.priority === "high").length,
    rolling: staticGrants.filter(g => g.isRolling).length,
  };

  const formatAmount = (min?: string, max?: string) => {
    if (!min && !max) return "Varies";
    if (min === max) return `$${parseInt(min || "0").toLocaleString()}`;
    if (!min) return `Up to $${parseInt(max || "0").toLocaleString()}`;
    if (!max) return `$${parseInt(min).toLocaleString()}+`;
    return `$${parseInt(min).toLocaleString()} - $${parseInt(max).toLocaleString()}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grant Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage grant opportunities for your entities
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Grant Opportunity
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="by-entity" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="by-entity">By Entity (No Duplicates)</TabsTrigger>
            <TabsTrigger value="all-grants">All Grant Database</TabsTrigger>
          </TabsList>

          <TabsContent value="by-entity">
            <EntityGrants />
          </TabsContent>

          <TabsContent value="all-grants">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Opportunities</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Eligible</p>
                  <p className="text-2xl font-bold">{stats.eligible}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold">{stats.highPriority}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rolling Deadlines</p>
                  <p className="text-2xl font-bold">{stats.rolling}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search grants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="eligible">Eligible</SelectItem>
                  <SelectItem value="researching">Researching</SelectItem>
                  <SelectItem value="applying">Applying</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Grant Opportunities</CardTitle>
            <CardDescription>
              {filteredGrants.length} grants found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grant Name</TableHead>
                  <TableHead>Funder</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrants.map((grant) => (
                  <TableRow key={grant.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedGrant(grant)}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{grant.name}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {grant.focusAreas?.slice(0, 3).map((area) => (
                            <Badge key={area} variant="outline" className="text-xs gap-1">
                              {focusAreaIcons[area]}
                              {area.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{grant.funderName}</TableCell>
                    <TableCell>{formatAmount(grant.minAmount, grant.maxAmount)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[grant.status]}>
                        {grant.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[grant.priority || "medium"]}>
                        {grant.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {grant.isRolling ? (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <RefreshCw className="w-3 h-3" />
                          Rolling
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">TBD</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (grant.applicationUrl) {
                            window.open(grant.applicationUrl, "_blank");
                          }
                        }}
                        className="gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Apply
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Grant Detail Dialog */}
        <Dialog open={!!selectedGrant} onOpenChange={() => setSelectedGrant(null)}>
          <DialogContent className="max-w-2xl">
            {selectedGrant && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedGrant.name}</DialogTitle>
                  <DialogDescription>{selectedGrant.funderName}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge className={statusColors[selectedGrant.status]}>
                      {selectedGrant.status.replace(/_/g, " ")}
                    </Badge>
                    <Badge className={priorityColors[selectedGrant.priority || "medium"]}>
                      {selectedGrant.priority} priority
                    </Badge>
                    {selectedGrant.isRolling && (
                      <Badge variant="outline" className="gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Rolling Deadline
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Amount</h4>
                    <p className="text-2xl font-bold text-primary">
                      {formatAmount(selectedGrant.minAmount, selectedGrant.maxAmount)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedGrant.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Eligibility Requirements</h4>
                    <p className="text-muted-foreground">{selectedGrant.eligibilityRequirements}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Focus Areas</h4>
                    <div className="flex gap-2 flex-wrap">
                      {selectedGrant.focusAreas?.map((area) => (
                        <Badge key={area} variant="secondary" className="gap-1">
                          {focusAreaIcons[area]}
                          {area.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedGrant.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-muted-foreground">{selectedGrant.notes}</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedGrant(null)}>
                    Close
                  </Button>
                  {selectedGrant.applicationUrl && (
                    <Button
                      onClick={() => window.open(selectedGrant.applicationUrl, "_blank")}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Apply Now
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Grant Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Grant Opportunity</DialogTitle>
              <DialogDescription>
                Add a new grant opportunity to track
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Grant Name</Label>
                  <Input id="name" placeholder="Enter grant name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="funder">Funder Name</Label>
                  <Input id="funder" placeholder="Enter funder name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Minimum Amount</Label>
                  <Input id="minAmount" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Maximum Amount</Label>
                  <Input id="maxAmount" type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter grant description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eligibility">Eligibility Requirements</Label>
                <Textarea id="eligibility" placeholder="Enter eligibility requirements" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Application URL</Label>
                  <Input id="url" placeholder="https://..." />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success("Grant opportunity added (demo mode)");
                setIsAddDialogOpen(false);
              }}>
                Add Grant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Eligibility Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Your Eligibility Categories</CardTitle>
            <CardDescription>
              Based on your entities, you may qualify for these grant categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-pink-500" />
                  <h4 className="font-semibold">Women-Owned</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Grants for businesses 51%+ owned by women
                </p>
                <Badge variant="secondary">
                  {staticGrants.filter(g => g.focusAreas?.includes("women_owned")).length} grants available
                </Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <h4 className="font-semibold">Minority/Black-Owned</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Grants for minority and Black entrepreneurs
                </p>
                <Badge variant="secondary">
                  {staticGrants.filter(g => g.focusAreas?.includes("minority_owned") || g.focusAreas?.includes("black_owned")).length} grants available
                </Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold">Faith-Based (508)</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Grants for religious and faith-based organizations
                </p>
                <Badge variant="secondary">
                  {staticGrants.filter(g => g.focusAreas?.includes("faith_based")).length} grants available
                </Badge>
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
