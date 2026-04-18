import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bot, Send, Loader2, Sparkles, MessageSquare, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { Streamdown } from "streamdown";

// Map agent types to display names and descriptions
const AGENT_INFO: Record<string, { name: string; description: string; department: string }> = {
  hr: { name: "HR Agent", description: "Human resources, onboarding, performance reviews, and employee management", department: "HR & People" },
  finance: { name: "Finance Agent", description: "Financial management, payroll, banking, revenue sharing, and budgeting", department: "Finance" },
  legal: { name: "Legal Agent", description: "Legal compliance, contracts review, regulatory guidance, and governance", department: "Legal/Compliance" },
  marketing: { name: "Marketing Agent", description: "Marketing strategy, campaigns, lead tracking, and outreach optimization", department: "Marketing" },
  operations: { name: "Operations Agent", description: "Operating procedures, workflow optimization, and process management", department: "Operations" },
  procurement: { name: "Procurement Agent", description: "Vendor management, RFP generation, and procurement catalog", department: "Procurement" },
  contracts: { name: "Contracts Agent", description: "Contract management, contractor agreements, and compliance tracking", department: "Contracts" },
  property: { name: "Property Agent", description: "Property management, asset tracking, and software licenses", department: "Property" },
  real_estate: { name: "Real Estate Agent", description: "Real estate operations, property listings, and market analysis", department: "Real Estate" },
  project_controls: { name: "Project Controls Agent", description: "Project management, progress reporting, and resource allocation", department: "Project Controls" },
  qaqc: { name: "QA/QC Agent", description: "Quality standards, audits, procedures, and compliance verification", department: "QA/QC" },
  it: { name: "IT Agent", description: "System administration, security, technology infrastructure, and troubleshooting", department: "IT" },
  education: { name: "Education Agent", description: "Curriculum development, instructor management, and educational programs", department: "Education" },
  health: { name: "Health Agent", description: "Wellness programs, health initiatives, and employee wellbeing", department: "Health" },
  media: { name: "Media Agent", description: "Content creation, media production, and publishing workflows", department: "Media" },
  design: { name: "Design Agent", description: "Brand assets, creative projects, and design system management", department: "Design" },
  business: { name: "Business Agent", description: "Business strategy, formation, planning, and development", department: "Business" },
  purchasing: { name: "Purchasing Agent", description: "Purchase orders, inventory management, and vendor relations", department: "Purchasing" },
  // Public Q&A agents
  academy_qa: { name: "Academy Guide", description: "Academy courses, simulators, certifications, and enrollment guidance", department: "L.A.W.S. Academy" },
  house_qa: { name: "House Guide", description: "House activation, trust architecture, and wealth system navigation", department: "Autonomous Wealth System" },
  system_qa: { name: "System Guide", description: "General system navigation, features overview, and getting started help", department: "System" },
  tech_support: { name: "Technical Support", description: "Escalated technical issues, account problems, and platform troubleshooting", department: "Support" },
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AgentChat() {
  const { user, loading: authLoading } = useAuth();
  const [, params] = useRoute("/agent/:type");
  const [, navigate] = useLocation();
  const agentType = params?.type || "";
  const info = AGENT_INFO[agentType];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Suggested prompts
  const suggestedPrompts = useMemo(() => {
    const prompts: Record<string, string[]> = {
      hr: ["Show me the onboarding checklist", "How do I submit a performance review?", "What positions are open?"],
      finance: ["Show me the current budget overview", "How do I submit a purchase request?", "What are the payroll deadlines?"],
      legal: ["Review our compliance status", "What contracts are expiring soon?", "Explain our governance structure"],
      marketing: ["What campaigns are active?", "Show me lead tracking metrics", "Help me draft a marketing plan"],
      operations: ["What are our standard procedures?", "Show me the workflow status", "Help optimize a process"],
      it: ["Check system security status", "Help me troubleshoot an issue", "What software licenses do we have?"],
      business: ["Help me create a business plan", "Show SWOT analysis template", "What entities are active?"],
      academy_qa: ["What courses are available?", "How do I use the simulators?", "Tell me about scholarships"],
      house_qa: ["How do I activate my House?", "Explain the token sequence", "What is the trust structure?"],
      system_qa: ["Give me a system overview", "How do I get started?", "What features are available?"],
      tech_support: ["I'm having a technical issue", "My page won't load", "I can't access a feature"],
    };
    return prompts[agentType] || ["How can you help me?", "What can you do?", "Show me what's available"];
  }, [agentType]);

  const chatMutation = trpc.agents.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      if (data.conversationId) setConversationId(data.conversationId);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || chatMutation.isPending) return;
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    chatMutation.mutate({
      agentType,
      message: msg,
      conversationId: conversationId ?? undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setConversationId(null);
  };

  if (authLoading) return <DashboardLayoutSkeleton />;

  if (!info) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Bot className="h-16 w-16 text-muted-foreground/40" />
          <h2 className="text-xl font-semibold text-foreground">Agent Not Found</h2>
          <p className="text-muted-foreground">The agent type "{agentType}" does not exist.</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-foreground truncate">{info.name}</h1>
              <p className="text-xs text-muted-foreground truncate">{info.department}</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={handleClear} title="Clear conversation">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">{info.name}</h2>
                <p className="text-sm text-muted-foreground max-w-md">{info.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestedPrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSend(prompt)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1.5" />
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background px-4 py-3">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${info.name} anything...`}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px] max-h-[120px]"
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || chatMutation.isPending}
              className="shrink-0 h-11 w-11 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
