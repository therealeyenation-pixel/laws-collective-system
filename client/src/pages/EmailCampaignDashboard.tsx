import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail, Send, BarChart3, Settings, Plus, Eye,
  ArrowUpRight, Clock, Users, Zap, FileText,
  Download, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function EmailCampaignDashboard() {
  const [activeTab, setActiveTab] = useState("campaigns");

  const { data: campaigns, isLoading: campaignsLoading } = trpc.emailCampaignDashboard.getCampaigns.useQuery({
    page: 1,
    limit: 20,
  });
  const { data: analytics } = trpc.emailCampaignDashboard.getCampaignAnalytics.useQuery();
  const { data: templates } = trpc.emailCampaignAutomation.getEmailTemplates.useQuery();
  const { data: workflows } = trpc.emailCampaignAutomation.getAutomationWorkflows.useQuery();
  const { data: segments } = trpc.emailCampaignAutomation.getMemberSegments.useQuery();

  const updateStatus = trpc.emailCampaignDashboard.updateCampaignStatus.useMutation({
    onSuccess: () => toast.success("Campaign status updated"),
    onError: () => toast.error("Failed to update status"),
  });

  const exportCSV = trpc.emailCampaignDashboard.exportCampaignAsCSV.useMutation({
    onSuccess: (data) => {
      toast.success("CSV exported");
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
    },
    onError: () => toast.error("Export failed"),
  });

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage campaigns, templates, and automation workflows
          </p>
        </div>
        <Button className="gap-2" onClick={() => toast.info("Campaign builder coming soon")}>
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.overview?.totalSent?.toLocaleString() ?? "—"}
                </p>
              </div>
              <Send className="w-8 h-8 text-primary/30" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Open Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.overview?.avgOpenRate ?? "—"}%
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500/30" />
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">Industry avg: 21%</span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Click Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.overview?.avgClickRate ?? "—"}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500/30" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold text-foreground">
                  {workflows?.filter((w: any) => w.status === "active").length ?? 0}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500/30" />
            </div>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns" className="gap-2">
            <Mail className="w-4 h-4" /> Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="w-4 h-4" /> Templates
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Zap className="w-4 h-4" /> Automation
          </TabsTrigger>
          <TabsTrigger value="segments" className="gap-2">
            <Users className="w-4 h-4" /> Segments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4 mt-4">
          {campaignsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns?.campaigns?.length ? (
            <div className="space-y-3">
              {campaigns.campaigns.map((campaign: any) => (
                <Card key={campaign.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          campaign.status === "sent" ? "bg-green-500/10 text-green-500" :
                          campaign.status === "draft" ? "bg-muted text-muted-foreground" :
                          campaign.status === "scheduled" ? "bg-blue-500/10 text-blue-500" :
                          "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{campaign.subject}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {campaign.recipientCount?.toLocaleString()} recipients
                        </span>
                        {campaign.openRate !== undefined && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {campaign.openRate}% opened
                          </span>
                        )}
                        {campaign.clickRate !== undefined && (
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> {campaign.clickRate}% clicked
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {campaign.sentAt || campaign.scheduledAt || "Draft"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {campaign.status === "draft" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus.mutate({ campaignId: campaign.id, status: "scheduled" })}
                        >
                          <Send className="w-3 h-3 mr-1" /> Schedule
                        </Button>
                      )}
                      {campaign.status === "sent" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportCSV.mutate({ campaignId: campaign.id })}
                        >
                          <Download className="w-3 h-3 mr-1" /> Export
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Mail className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-foreground">No campaigns yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Create your first email campaign to get started</p>
              <Button className="mt-4 gap-2" onClick={() => toast.info("Campaign builder coming soon")}>
                <Plus className="w-4 h-4" /> Create Campaign
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          {templates?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template: any) => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{template.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      template.status === "active" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                    }`}>
                      {template.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => toast.info("Template editor coming soon")}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.info("Preview coming soon")}>
                      <Eye className="w-3 h-3 mr-1" /> Preview
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-foreground">No templates yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Create reusable email templates</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="automation" className="space-y-4 mt-4">
          {workflows?.length ? (
            <div className="space-y-3">
              {workflows.map((workflow: any) => (
                <Card key={workflow.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Zap className={`w-5 h-5 ${workflow.status === "active" ? "text-yellow-500" : "text-muted-foreground"}`} />
                        <div>
                          <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Trigger: {workflow.trigger} | {workflow.steps?.length ?? 0} steps
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        workflow.status === "active" ? "bg-green-500/10 text-green-500" :
                        workflow.status === "paused" ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {workflow.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info("Workflow editor coming soon")}
                      >
                        <Settings className="w-3 h-3 mr-1" /> Configure
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Zap className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-foreground">No automation workflows</h3>
              <p className="text-sm text-muted-foreground mt-1">Set up automated email sequences</p>
              <Button className="mt-4 gap-2" onClick={() => toast.info("Workflow builder coming soon")}>
                <Plus className="w-4 h-4" /> Create Workflow
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="segments" className="space-y-4 mt-4">
          {segments?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segments.map((segment: any) => (
                <Card key={segment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{segment.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{segment.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{segment.memberCount?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">members</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {segment.criteria?.map((c: string, i: number) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-foreground">No segments defined</h3>
              <p className="text-sm text-muted-foreground mt-1">Create audience segments for targeted campaigns</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );
}
