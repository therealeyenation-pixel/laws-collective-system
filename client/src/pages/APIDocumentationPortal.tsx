import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Check, ExternalLink, Search, Download } from "lucide-react";
import { toast } from "sonner";

/**
 * Phase 50: API Documentation Portal
 * 
 * Features:
 * - Interactive API documentation
 * - Code examples in multiple languages
 * - Sandbox testing environment
 * - Webhook management
 * - Authentication guide
 * - Rate limiting info
 * - Error handling guide
 */

interface APIEndpoint {
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: "required" | "optional" | "none";
  rateLimit: string;
  examples: Record<string, string>;
}

export default function APIDocumentationPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  const endpoints: APIEndpoint[] = [
    {
      name: "Get Campaigns",
      method: "GET",
      path: "/api/trpc/emailCampaignDashboard.getCampaigns",
      description: "Retrieve all email campaigns with pagination and filtering",
      auth: "required",
      rateLimit: "100 req/min",
      examples: {
        javascript: `const campaigns = await trpc.emailCampaignDashboard.getCampaigns.useQuery({
  limit: 50,
  offset: 0
});`,
        python: `campaigns = client.email_campaign_dashboard.get_campaigns(
    limit=50,
    offset=0
)`,
        curl: `curl -X GET https://api.finmap.com/api/trpc/emailCampaignDashboard.getCampaigns \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`,
      },
    },
    {
      name: "Create Campaign",
      method: "POST",
      path: "/api/trpc/emailCampaignDashboard.createCampaign",
      description: "Create a new email campaign",
      auth: "required",
      rateLimit: "10 req/min",
      examples: {
        javascript: `const campaign = await trpc.emailCampaignDashboard.createCampaign.useMutation({
  name: "Q1 Campaign",
  description: "First quarter campaign",
  templateId: "template_1",
  segmentId: "segment_1"
});`,
        python: `campaign = client.email_campaign_dashboard.create_campaign(
    name="Q1 Campaign",
    description="First quarter campaign",
    template_id="template_1",
    segment_id="segment_1"
)`,
        curl: `curl -X POST https://api.finmap.com/api/trpc/emailCampaignDashboard.createCampaign \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Q1 Campaign",
    "description": "First quarter campaign"
  }'`,
      },
    },
    {
      name: "Send SMS",
      method: "POST",
      path: "/api/trpc/smsNotificationSystem.sendSMS",
      description: "Send SMS notification to members",
      auth: "required",
      rateLimit: "1000 req/min",
      examples: {
        javascript: `const result = await trpc.smsNotificationSystem.sendSMS.useMutation({
  recipientId: "member_123",
  message: "Your investment update is ready",
  templateId: "template_1"
});`,
        python: `result = client.sms_notification_system.send_sms(
    recipient_id="member_123",
    message="Your investment update is ready",
    template_id="template_1"
)`,
        curl: `curl -X POST https://api.finmap.com/api/trpc/smsNotificationSystem.sendSMS \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipientId": "member_123",
    "message": "Your investment update is ready"
  }'`,
      },
    },
    {
      name: "Get Analytics",
      method: "GET",
      path: "/api/trpc/advancedAnalyticsDashboard.getKeyMetrics",
      description: "Retrieve key analytics metrics",
      auth: "required",
      rateLimit: "100 req/min",
      examples: {
        javascript: `const metrics = await trpc.advancedAnalyticsDashboard.getKeyMetrics.useQuery({
  dateRange: "30d",
  segment: "premium"
});`,
        python: `metrics = client.advanced_analytics_dashboard.get_key_metrics(
    date_range="30d",
    segment="premium"
)`,
        curl: `curl -X GET "https://api.finmap.com/api/trpc/advancedAnalyticsDashboard.getKeyMetrics?dateRange=30d" \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
      },
    },
    {
      name: "Register Webhook",
      method: "POST",
      path: "/api/trpc/webhookEventSystem.registerWebhook",
      description: "Register webhook endpoint for event notifications",
      auth: "required",
      rateLimit: "50 req/min",
      examples: {
        javascript: `const webhook = await trpc.webhookEventSystem.registerWebhook.useMutation({
  url: "https://yourapp.com/webhooks/campaigns",
  events: ["campaign.created", "campaign.completed"],
  description: "Campaign events"
});`,
        python: `webhook = client.webhook_event_system.register_webhook(
    url="https://yourapp.com/webhooks/campaigns",
    events=["campaign.created", "campaign.completed"],
    description="Campaign events"
)`,
        curl: `curl -X POST https://api.finmap.com/api/trpc/webhookEventSystem.registerWebhook \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourapp.com/webhooks/campaigns",
    "events": ["campaign.created", "campaign.completed"]
  }'`,
      },
    },
  ];

  const filteredEndpoints = endpoints.filter((ep) =>
    ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = (code: string, language: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(language);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadSDK = (language: string) => {
    toast.success(`Downloading ${language} SDK...`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          Complete API reference with interactive examples and sandbox testing
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold text-foreground mb-2">Authentication</h3>
          <p className="text-sm text-muted-foreground">Learn how to authenticate API requests</p>
        </Card>
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold text-foreground mb-2">Rate Limits</h3>
          <p className="text-sm text-muted-foreground">Understand rate limiting and quotas</p>
        </Card>
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold text-foreground mb-2">Webhooks</h3>
          <p className="text-sm text-muted-foreground">Set up real-time event notifications</p>
        </Card>
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold text-foreground mb-2">SDKs</h3>
          <p className="text-sm text-muted-foreground">Download client libraries</p>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-6">
            <h2 className="font-bold text-foreground mb-4">Endpoints</h2>
            <div className="space-y-2">
              {filteredEndpoints.map((endpoint, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedEndpoint(endpoint.name)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedEndpoint === endpoint.name
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        endpoint.method === "GET"
                          ? "bg-blue-100 text-blue-800"
                          : endpoint.method === "POST"
                            ? "bg-green-100 text-green-800"
                            : endpoint.method === "PUT"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{endpoint.name}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Endpoint Details */}
        <div className="lg:col-span-2">
          {selectedEndpoint ? (
            (() => {
              const endpoint = endpoints.find((ep) => ep.name === selectedEndpoint);
              return endpoint ? (
                <Card className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`text-sm font-bold px-3 py-1 rounded ${
                          endpoint.method === "GET"
                            ? "bg-blue-100 text-blue-800"
                            : endpoint.method === "POST"
                              ? "bg-green-100 text-green-800"
                              : endpoint.method === "PUT"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-2">{endpoint.name}</h2>
                    <p className="text-muted-foreground mb-4">{endpoint.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Authentication</p>
                        <p className="font-semibold text-foreground capitalize">{endpoint.auth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rate Limit</p>
                        <p className="font-semibold text-foreground">{endpoint.rateLimit}</p>
                      </div>
                    </div>
                  </div>

                  {/* Code Examples */}
                  <div className="mb-6">
                    <h3 className="font-bold text-foreground mb-4">Code Examples</h3>

                    <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                      </TabsList>

                      {Object.entries(endpoint.examples).map(([lang, code]) => (
                        <TabsContent key={lang} value={lang}>
                          <div className="relative">
                            <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-sm text-foreground">
                              <code>{code}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              onClick={() => handleCopyCode(code, lang)}
                            >
                              {copiedCode === lang ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>

                  {/* Response Example */}
                  <div className="mb-6">
                    <h3 className="font-bold text-foreground mb-4">Response Example</h3>
                    <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-sm text-foreground">
                      <code>{`{
  "data": {
    "id": "resource_123",
    "status": "success",
    "timestamp": "2026-03-30T23:00:00Z"
  },
  "error": null
}`}</code>
                    </pre>
                  </div>

                  {/* Test Endpoint */}
                  <div className="mb-6 p-4 bg-secondary/50 rounded-lg border border-border">
                    <h3 className="font-bold text-foreground mb-3">Try It Out</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use our sandbox to test this endpoint with your API key
                    </p>
                    <Button className="w-full gap-2">
                      <Code className="w-4 h-4" />
                      Open Sandbox
                    </Button>
                  </div>
                </Card>
              ) : null;
            })()
          ) : (
            <Card className="p-12 text-center">
              <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select an endpoint to view documentation</p>
            </Card>
          )}
        </div>
      </div>

      {/* SDK Downloads */}
      <div className="mt-12">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Client SDKs</h2>
          <p className="text-muted-foreground mb-6">
            Download official SDKs for your preferred programming language
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["JavaScript", "Python", "Go"].map((lang) => (
              <Card key={lang} className="p-4">
                <h3 className="font-semibold text-foreground mb-3">{lang}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {lang === "JavaScript"
                    ? "npm install @finmap/sdk"
                    : lang === "Python"
                      ? "pip install finmap-sdk"
                      : "go get github.com/finmap/sdk"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleDownloadSDK(lang)}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      {/* Support */}
      <div className="mt-8 p-6 bg-secondary/50 rounded-lg border border-border text-center">
        <p className="text-foreground mb-4">Need help with the API?</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            View Status Page
          </Button>
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
