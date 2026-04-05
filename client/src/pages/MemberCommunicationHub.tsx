import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Mail,
  MessageSquare,
  Bell,
  Send,
  Plus,
  Search,
  Settings,
  Archive,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function MemberCommunicationHub() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock conversations data
  const conversations = [
    {
      id: "conv_1",
      member: "Sarah Johnson",
      lastMessage: "Thanks for the investment tips!",
      timestamp: "2 hours ago",
      unread: 2,
      channel: "email",
      status: "active",
    },
    {
      id: "conv_2",
      member: "Michael Chen",
      lastMessage: "Can you help with compliance questions?",
      timestamp: "4 hours ago",
      unread: 0,
      channel: "sms",
      status: "active",
    },
    {
      id: "conv_3",
      member: "Emma Davis",
      lastMessage: "Received the campaign notification",
      timestamp: "1 day ago",
      unread: 0,
      channel: "push",
      status: "archived",
    },
  ];

  // Mock broadcast campaigns
  const campaigns = [
    {
      id: "camp_1",
      name: "Q1 Investment Opportunities",
      channel: "email",
      status: "sent",
      recipients: 2500,
      openRate: 0.35,
      clickRate: 0.08,
      sentAt: "2 days ago",
    },
    {
      id: "camp_2",
      name: "Compliance Update Reminder",
      channel: "sms",
      status: "scheduled",
      recipients: 1800,
      scheduledFor: "Tomorrow 9:00 AM",
    },
    {
      id: "camp_3",
      name: "New Feature Announcement",
      channel: "push",
      status: "in_progress",
      recipients: 3200,
      sent: 2100,
      openRate: 0.42,
    },
  ];

  // Mock message templates
  const templates = [
    {
      id: "tpl_1",
      name: "Welcome New Member",
      channel: "email",
      preview: "Welcome to our community! Get started with...",
      usageCount: 450,
    },
    {
      id: "tpl_2",
      name: "Payment Confirmation",
      channel: "sms",
      preview: "Your payment of {{amount}} has been confirmed...",
      usageCount: 1200,
    },
    {
      id: "tpl_3",
      name: "Compliance Alert",
      channel: "push",
      preview: "Important: {{compliance_type}} update required...",
      usageCount: 320,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Communication Hub</h1>
              <p className="text-muted-foreground mt-1">
                Unified messaging across email, SMS, and push notifications
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Message
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inbox" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Mail className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="mt-6 space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversation List */}
              <div className="lg:col-span-1">
                <Card className="divide-y">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedConversation === conv.id
                          ? "bg-accent/10 border-l-4 border-l-accent"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{conv.member}</h3>
                        {conv.unread > 0 && (
                          <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {conv.channel === "email" && <Mail className="w-3 h-3" />}
                          {conv.channel === "sms" && <MessageSquare className="w-3 h-3" />}
                          {conv.channel === "push" && <Bell className="w-3 h-3" />}
                          {conv.channel}
                        </span>
                        <span>{conv.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>

              {/* Conversation Detail */}
              <div className="lg:col-span-2">
                {selectedConversation ? (
                  <Card className="flex flex-col h-[500px]">
                    {/* Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {conversations.find((c) => c.id === selectedConversation)?.member}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {conversations.find((c) => c.id === selectedConversation)?.channel}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3 max-w-xs">
                          <p className="text-sm text-foreground">
                            Hi! I wanted to thank you for the investment tips in the last campaign.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">2:30 PM</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-accent rounded-lg p-3 max-w-xs">
                          <p className="text-sm text-accent-foreground">
                            You're welcome! Glad they were helpful. Let me know if you have questions.
                          </p>
                          <p className="text-xs text-accent-foreground/70 mt-1">2:35 PM</p>
                        </div>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t flex gap-2">
                      <Input placeholder="Type a message..." />
                      <Button size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="flex items-center justify-center h-[500px]">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a conversation to view details</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="mt-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Broadcast Campaigns</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize mt-1">
                        {campaign.channel}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        campaign.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {campaign.status === "sent" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {campaign.status === "scheduled" && <Clock className="w-3 h-3 inline mr-1" />}
                      {campaign.status === "in_progress" && (
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                      )}
                      {campaign.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Recipients</p>
                      <p className="text-lg font-semibold text-foreground">
                        {campaign.recipients.toLocaleString()}
                      </p>
                    </div>

                    {campaign.status === "sent" && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Open Rate</p>
                            <p className="text-sm font-semibold text-foreground">
                              {(campaign.openRate * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Click Rate</p>
                            <p className="text-sm font-semibold text-foreground">
                              {(campaign.clickRate * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Sent {campaign.sentAt}</p>
                      </>
                    )}

                    {campaign.status === "scheduled" && (
                      <p className="text-xs text-muted-foreground">
                        Scheduled for {campaign.scheduledFor}
                      </p>
                    )}

                    {campaign.status === "in_progress" && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Progress: {campaign.sent}/{campaign.recipients}
                        </p>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-accent h-2 rounded-full"
                            style={{
                              width: `${(campaign.sent / campaign.recipients) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Message Templates</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </div>

            <div className="space-y-3">
              {templates.map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{template.name}</h3>
                        <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                          {template.channel}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.preview}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Used {template.usageCount} times
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        Use
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-6">
            <Card className="p-6 max-w-2xl">
              <h2 className="text-xl font-semibold mb-6">Communication Preferences</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Channel Preferences</h3>
                  <div className="space-y-3">
                    {["Email", "SMS", "Push Notifications"].map((channel) => (
                      <div key={channel} className="flex items-center justify-between p-3 bg-muted rounded">
                        <label className="text-sm font-medium text-foreground">{channel}</label>
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Compliance Settings</h3>
                  <div className="space-y-3">
                    {["GDPR Compliant", "CCPA Compliant", "TCPA Compliant"].map((compliance) => (
                      <div key={compliance} className="flex items-center justify-between p-3 bg-muted rounded">
                        <label className="text-sm font-medium text-foreground">{compliance}</label>
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Frequency Caps</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-foreground">Max emails per week</label>
                      <Input type="number" defaultValue="5" className="mt-2" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Max SMS per month</label>
                      <Input type="number" defaultValue="10" className="mt-2" />
                    </div>
                  </div>
                </div>

                <Button className="w-full">Save Preferences</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
