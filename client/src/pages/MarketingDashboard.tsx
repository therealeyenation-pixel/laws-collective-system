import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Calendar,
  DollarSign,
  Eye,
  MousePointer,
  Mail,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone,
  FileText,
  Palette,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

// Marketing metrics data
const marketingMetrics = {
  leads: { current: 156, previous: 142, change: 9.9 },
  conversions: { current: 23, previous: 18, change: 27.8 },
  websiteTraffic: { current: 4520, previous: 3890, change: 16.2 },
  emailOpenRate: { current: 32.5, previous: 28.1, change: 15.7 },
  socialEngagement: { current: 1245, previous: 980, change: 27.0 },
  costPerLead: { current: 12.50, previous: 15.20, change: -17.8 },
};

// Active campaigns
const activeCampaigns = [
  {
    id: 1,
    name: "L.A.W.S. Academy Launch",
    type: "Multi-Channel",
    status: "active",
    budget: 5000,
    spent: 2340,
    leads: 45,
    startDate: "2026-01-15",
    endDate: "2026-02-15",
  },
  {
    id: 2,
    name: "Financial Literacy Workshop Series",
    type: "Email",
    status: "active",
    budget: 1500,
    spent: 890,
    leads: 28,
    startDate: "2026-01-10",
    endDate: "2026-01-31",
  },
  {
    id: 3,
    name: "Community Outreach - Atlanta",
    type: "Local",
    status: "scheduled",
    budget: 3000,
    spent: 0,
    leads: 0,
    startDate: "2026-02-01",
    endDate: "2026-02-28",
  },
];

// Lead sources
const leadSources = [
  { source: "Website", leads: 52, percentage: 33 },
  { source: "Social Media", leads: 41, percentage: 26 },
  { source: "Email Campaigns", leads: 28, percentage: 18 },
  { source: "Referrals", leads: 22, percentage: 14 },
  { source: "Events", leads: 13, percentage: 9 },
];

// Upcoming marketing tasks
const upcomingTasks = [
  { id: 1, task: "Review Q1 marketing budget", due: "2026-01-25", priority: "high" },
  { id: 2, task: "Submit design request to Real-Eye-Nation", due: "2026-01-26", priority: "medium" },
  { id: 3, task: "Approve social media content calendar", due: "2026-01-27", priority: "medium" },
  { id: 4, task: "Finalize workshop landing page copy", due: "2026-01-28", priority: "high" },
];

export default function MarketingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = "number" 
  }: { 
    title: string; 
    value: number; 
    change: number; 
    icon: any;
    format?: "number" | "currency" | "percentage";
  }) => {
    const isPositive = change >= 0;
    const formattedValue = format === "currency" 
      ? `$${value.toFixed(2)}` 
      : format === "percentage" 
        ? `${value}%` 
        : value.toLocaleString();

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{formattedValue}</p>
              <div className={`flex items-center text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(change)}% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              L.A.W.S. Collective marketing strategy and campaign management
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info("Opening marketing strategy...")}>
              <FileText className="w-4 h-4 mr-2" />
              Strategy Doc
            </Button>
            <Button onClick={() => toast.info("Creating new campaign...")}>
              <Megaphone className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Real-Eye-Nation Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Palette className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Creative Services via Real-Eye-Nation LLC</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  All design and creative work is contracted through Real-Eye-Nation LLC (GA - EIN: 84-4976416). 
                  Submit design requests through the procurement system for proper expense tracking.
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-amber-300" onClick={() => toast.info("Opening design request form...")}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Request Design
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard 
            title="Total Leads" 
            value={marketingMetrics.leads.current} 
            change={marketingMetrics.leads.change}
            icon={Users}
          />
          <MetricCard 
            title="Conversions" 
            value={marketingMetrics.conversions.current} 
            change={marketingMetrics.conversions.change}
            icon={Target}
          />
          <MetricCard 
            title="Website Traffic" 
            value={marketingMetrics.websiteTraffic.current} 
            change={marketingMetrics.websiteTraffic.change}
            icon={Eye}
          />
          <MetricCard 
            title="Email Open Rate" 
            value={marketingMetrics.emailOpenRate.current} 
            change={marketingMetrics.emailOpenRate.change}
            icon={Mail}
            format="percentage"
          />
          <MetricCard 
            title="Social Engagement" 
            value={marketingMetrics.socialEngagement.current} 
            change={marketingMetrics.socialEngagement.change}
            icon={Share2}
          />
          <MetricCard 
            title="Cost Per Lead" 
            value={marketingMetrics.costPerLead.current} 
            change={marketingMetrics.costPerLead.change}
            icon={DollarSign}
            format="currency"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="leads">Lead Sources</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Active Campaigns Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    Active Campaigns
                  </CardTitle>
                  <CardDescription>Currently running marketing campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeCampaigns.filter(c => c.status === "active").map((campaign) => (
                      <div key={campaign.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{campaign.name}</h4>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Budget Used</span>
                            <span>${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span>
                          </div>
                          <Progress value={(campaign.spent / campaign.budget) * 100} />
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Leads Generated</span>
                            <span className="font-medium">{campaign.leads}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lead Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Lead Sources
                  </CardTitle>
                  <CardDescription>Where your leads are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leadSources.map((source) => (
                      <div key={source.source}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{source.source}</span>
                          <span className="text-muted-foreground">{source.leads} leads ({source.percentage}%)</span>
                        </div>
                        <Progress value={source.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Campaigns</CardTitle>
                <CardDescription>Manage your marketing campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeCampaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {campaign.startDate} - {campaign.endDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                            {campaign.status}
                          </Badge>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Budget</p>
                          <p className="font-medium">${campaign.budget.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Spent</p>
                          <p className="font-medium">${campaign.spent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Leads</p>
                          <p className="font-medium">{campaign.leads}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Source Analysis</CardTitle>
                <CardDescription>Detailed breakdown of lead generation channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {leadSources.map((source) => (
                    <div key={source.source} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{source.source}</h4>
                        <Badge>{source.leads} leads</Badge>
                      </div>
                      <Progress value={source.percentage} className="h-3" />
                      <p className="text-sm text-muted-foreground mt-2">
                        {source.percentage}% of total lead generation
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Tasks
                </CardTitle>
                <CardDescription>Marketing tasks and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 rounded" />
                        <div>
                          <p className="font-medium">{task.task}</p>
                          <p className="text-sm text-muted-foreground">Due: {task.due}</p>
                        </div>
                      </div>
                      <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
