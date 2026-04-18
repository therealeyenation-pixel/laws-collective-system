import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  Loader2,
  HelpCircle,
  Plus,
  Trash2,
  X,
  Minimize2,
  Maximize2,
  GraduationCap,
  Home,
  Compass,
  Wrench,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { LazyStreamdown } from "@/components/LazyStreamdown";

const qaIcons: Record<string, React.ReactNode> = {
  academy_qa: <GraduationCap className="w-4 h-4" />,
  house_qa: <Home className="w-4 h-4" />,
  system_qa: <Compass className="w-4 h-4" />,
};

const qaColors: Record<string, string> = {
  academy_qa: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  house_qa: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  system_qa: "bg-sky-500/10 text-sky-600 border-sky-500/20",
};

const qaLabels: Record<string, string> = {
  academy_qa: "Academy Guide",
  house_qa: "House Guide",
  system_qa: "System Guide",
};

const qaDescriptions: Record<string, string> = {
  academy_qa: "Ask me about courses, simulators, certificates, and learning paths.",
  house_qa: "Ask me about your House journey, activation steps, and business formation.",
  system_qa: "Ask me about the system, features, navigation, and the L.A.W.S. framework.",
};

const qaQuickPrompts: Record<string, string[]> = {
  academy_qa: [
    "What courses are available?",
    "How do simulators work?",
    "How do I earn a certificate?",
    "What's my next learning step?",
  ],
  house_qa: [
    "What is a House?",
    "What are the activation steps?",
    "How do I link a business?",
    "Where am I in my journey?",
  ],
  system_qa: [
    "What is the L.A.W.S. framework?",
    "How do I navigate the system?",
    "What features are available?",
    "How do I get started?",
  ],
};

const priorityColors: Record<string, string> = {
  critical: "text-red-600 bg-red-50",
  high: "text-orange-600 bg-orange-50",
  medium: "text-yellow-600 bg-yellow-50",
  low: "text-blue-600 bg-blue-50",
};

const statusIcons: Record<string, React.ReactNode> = {
  open: <Clock className="w-3 h-3" />,
  in_progress: <Loader2 className="w-3 h-3 animate-spin" />,
  resolved: <CheckCircle2 className="w-3 h-3" />,
  needs_review: <AlertTriangle className="w-3 h-3" />,
  closed: <CheckCircle2 className="w-3 h-3" />,
};

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

interface TicketMessage {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

interface PublicQAAgentProps {
  /** The public Q&A agent type: "academy_qa", "house_qa", or "system_qa" */
  agentType: "academy_qa" | "house_qa" | "system_qa";
  /** Optional custom label override */
  label?: string;
  /** Optional page context string describing what the user is currently viewing */
  pageContext?: string;
}

type ViewMode = "qa" | "escalation-form" | "ticket-chat" | "my-tickets";

/**
 * PublicQAAgent — A sandboxed, read-only Q&A chat panel for all authenticated members.
 * These agents can only answer questions — they cannot modify data or access internal systems.
 * Includes an escalation path to the AI Support Agent for issues the Q&A agent can't resolve.
 */
export function PublicQAAgent({ agentType, label, pageContext }: PublicQAAgentProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Escalation state
  const [viewMode, setViewMode] = useState<ViewMode>("qa");
  const [escalationSubject, setEscalationSubject] = useState("");
  const [escalationMessage, setEscalationMessage] = useState("");
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [ticketInput, setTicketInput] = useState("");
  const [isEscalating, setIsEscalating] = useState(false);
  const [isSendingTicket, setIsSendingTicket] = useState(false);

  // Fetch all agents and find the public Q&A agent matching this type
  const { data: agents } = trpc.agents.getAll.useQuery();
  const agent = agents?.find((a) => a.type === agentType && a.isPublic);

  // Conversations for this agent
  const { data: conversations, refetch: refetchConversations } =
    trpc.agents.getConversations.useQuery(
      { agentId: agent?.id || undefined },
      { enabled: !!agent?.id && isOpen }
    );

  // Message history for current conversation
  const { data: messageHistory, refetch: refetchMessages } =
    trpc.agents.getMessages.useQuery(
      { conversationId: conversationId || 0 },
      { enabled: !!conversationId }
    );

  // Support ticket queries
  const { data: myTickets, refetch: refetchTickets } =
    trpc.supportTickets.myTickets.useQuery(
      undefined,
      { enabled: isOpen && (viewMode === "my-tickets" || viewMode === "ticket-chat") }
    );

  const { data: ticketData, refetch: refetchTicketMessages } =
    trpc.supportTickets.getMessages.useQuery(
      { ticketId: activeTicketId || 0 },
      { enabled: !!activeTicketId && viewMode === "ticket-chat" }
    );

  // Mutations
  const startConversation = trpc.agents.startConversation.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages([]);
      refetchConversations();
    },
    onError: (error) => toast.error(error.message),
  });

  const sendMessage = trpc.agents.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: data.message,
          createdAt: new Date(),
        },
      ]);
      setIsSending(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSending(false);
    },
  });

  const deleteConversation = trpc.agents.deleteConversation.useMutation({
    onSuccess: () => {
      toast.success("Conversation deleted");
      setConversationId(null);
      setMessages([]);
      refetchConversations();
    },
    onError: (error) => toast.error(error.message),
  });

  // Support ticket mutations
  const createTicket = trpc.supportTickets.create.useMutation({
    onSuccess: (data) => {
      setActiveTicketId(data.ticketId);
      setTicketMessages([
        {
          id: Date.now() - 1,
          role: "user",
          content: escalationMessage,
          createdAt: new Date(),
        },
        {
          id: Date.now(),
          role: "assistant",
          content: data.message,
          createdAt: new Date(),
        },
      ]);
      setViewMode("ticket-chat");
      setIsEscalating(false);
      setEscalationSubject("");
      setEscalationMessage("");
      toast.success("Issue escalated to Support Agent");
      if (data.priority === "critical" || data.priority === "high") {
        toast.info(`Priority assessed as ${data.priority.toUpperCase()}`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setIsEscalating(false);
    },
  });

  const chatTicket = trpc.supportTickets.chat.useMutation({
    onSuccess: (data) => {
      setTicketMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: data.message,
          createdAt: new Date(),
        },
      ]);
      setIsSendingTicket(false);
      if (data.isResolved) {
        toast.success("The Support Agent has resolved your issue!");
      }
      if (data.needsReview) {
        toast.info("This issue has been flagged for owner review.");
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSendingTicket(false);
    },
  });

  const closeTicket = trpc.supportTickets.close.useMutation({
    onSuccess: () => {
      toast.success("Ticket closed");
      setActiveTicketId(null);
      setTicketMessages([]);
      setViewMode("qa");
      refetchTickets();
    },
    onError: (error) => toast.error(error.message),
  });

  // Sync message history
  useEffect(() => {
    if (messageHistory) setMessages(messageHistory as Message[]);
  }, [messageHistory]);

  // Sync ticket messages
  useEffect(() => {
    if (ticketData?.messages) {
      setTicketMessages(
        ticketData.messages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
            createdAt: new Date(m.createdAt),
          }))
      );
    }
  }, [ticketData]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ticketMessages]);

  const handleStartNewConversation = () => {
    if (!agent) return;
    startConversation.mutate({
      agentId: agent.id,
      title: `Q&A with ${qaLabels[agentType] || agent.name}`,
    });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !conversationId || isSending) return;
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputMessage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);
    sendMessage.mutate({ conversationId, message: inputMessage, pageContext });
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (viewMode === "ticket-chat") {
        handleSendTicketMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleEscalate = () => {
    // Pre-fill the escalation form with context from the current conversation
    const lastMessages = messages.slice(-6);
    const subject = lastMessages.length > 0
      ? `Issue from ${qaLabels[agentType]}: ${messages.find(m => m.role === "user")?.content?.slice(0, 80) || "General issue"}`
      : `Issue escalated from ${qaLabels[agentType]}`;
    setEscalationSubject(subject);
    setViewMode("escalation-form");
  };

  const handleSubmitEscalation = () => {
    if (!escalationMessage.trim()) {
      toast.error("Please describe your issue");
      return;
    }
    setIsEscalating(true);

    // Gather last few messages from Q&A conversation as context
    const originalContext = messages.slice(-6).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    createTicket.mutate({
      subject: escalationSubject || `Issue from ${qaLabels[agentType]}`,
      message: escalationMessage,
      sourceAgentType: agentType,
      sourcePage: pageContext,
      originalContext: originalContext.length > 0 ? originalContext : undefined,
    });
  };

  const handleSendTicketMessage = () => {
    if (!ticketInput.trim() || !activeTicketId || isSendingTicket) return;
    const userMsg: TicketMessage = {
      id: Date.now(),
      role: "user",
      content: ticketInput,
      createdAt: new Date(),
    };
    setTicketMessages((prev) => [...prev, userMsg]);
    setIsSendingTicket(true);
    chatTicket.mutate({ ticketId: activeTicketId, message: ticketInput });
    setTicketInput("");
  };

  const agentName = label || qaLabels[agentType] || "Q&A Guide";
  const colorClass = qaColors[agentType] || qaColors.system_qa;
  const icon = qaIcons[agentType] || <HelpCircle className="w-4 h-4" />;
  const description = qaDescriptions[agentType] || "";
  const quickPrompts = qaQuickPrompts[agentType] || [];

  // Available to ALL authenticated users
  if (!user) return null;

  // If agents haven't been initialized or this Q&A agent doesn't exist yet
  if (!agents || agents.length === 0 || !agent) return null;

  // Collapsed state — floating button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className={`rounded-full shadow-lg gap-2 min-h-[56px] px-5 ${colorClass} border hover:shadow-xl transition-all`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{agentName}</span>
        </Button>
      </div>
    );
  }

  // Open state — chat panel
  const panelHeight = isExpanded ? "h-[80vh]" : "h-[450px]";

  // Determine header based on view mode
  const getHeaderContent = () => {
    switch (viewMode) {
      case "escalation-form":
        return { title: "Escalate to Support", subtitle: "AI Support Agent", icon: <Wrench className="w-4 h-4" />, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" };
      case "ticket-chat":
        return { title: "Support Agent", subtitle: `Ticket #${activeTicketId}`, icon: <Wrench className="w-4 h-4" />, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" };
      case "my-tickets":
        return { title: "My Support Tickets", subtitle: "View escalated issues", icon: <Wrench className="w-4 h-4" />, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" };
      default:
        return { title: agentName, subtitle: "Q&A Assistant", icon: agent.avatar ? <span className="text-base">{agent.avatar}</span> : icon, color: colorClass };
    }
  };

  const header = getHeaderContent();

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] ${panelHeight} flex flex-col`}>
      <Card className="flex flex-col h-full shadow-2xl border overflow-hidden">
        {/* Header */}
        <div className={`flex items-center gap-3 p-3 border-b ${header.color} bg-opacity-50`}>
          {viewMode !== "qa" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              onClick={() => {
                if (viewMode === "ticket-chat") {
                  setViewMode("my-tickets");
                } else {
                  setViewMode("qa");
                }
              }}
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          )}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${header.color}`}>
            {header.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{header.title}</p>
            <p className="text-xs text-muted-foreground truncate">{header.subtitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => { setIsOpen(false); setIsExpanded(false); }}
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* ===== VIEW: Q&A (default) ===== */}
        {viewMode === "qa" && (
          <>
            {/* Conversation pills */}
            {conversations && conversations.length > 0 && (
              <div className="p-2 border-b bg-muted/30 overflow-x-auto">
                <div className="flex gap-1.5 items-center">
                  {conversations.slice(0, 5).map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setConversationId(conv.id);
                        refetchMessages();
                      }}
                      className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs transition-colors ${
                        conversationId === conv.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border hover:bg-muted"
                      }`}
                    >
                      {conv.title?.slice(0, 20) || "Q&A"}
                    </button>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={handleStartNewConversation}
                    disabled={startConversation.isPending}
                    title="New conversation"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Chat body */}
            <div className="flex-1 overflow-hidden">
              {!conversationId ? (
                <ScrollArea className="h-full p-3">
                  <div className="space-y-4">
                    {/* Welcome */}
                    <div className="text-center space-y-2 pt-2">
                      <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-lg ${colorClass}`}>
                        {agent.avatar ? <span className="text-2xl">{agent.avatar}</span> : icon}
                      </div>
                      <h3 className="font-semibold text-sm">{agentName}</h3>
                      <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
                        {description}
                      </p>
                    </div>

                    {/* Quick prompts */}
                    {quickPrompts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Try asking</p>
                        <div className="flex flex-wrap gap-1.5">
                          {quickPrompts.map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                handleStartNewConversation();
                                setTimeout(() => setInputMessage(prompt), 200);
                              }}
                              className="px-2.5 py-1.5 rounded-full border bg-background hover:bg-muted text-xs transition-all"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Start button */}
                    <div className="pt-1">
                      <Button
                        onClick={handleStartNewConversation}
                        disabled={startConversation.isPending}
                        size="sm"
                        className="w-full gap-2"
                      >
                        {startConversation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        Ask a Question
                      </Button>
                    </div>

                    {/* My Tickets link */}
                    {myTickets && myTickets.length > 0 && (
                      <button
                        onClick={() => setViewMode("my-tickets")}
                        className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 pt-1 transition-colors"
                      >
                        <Wrench className="w-3 h-3" />
                        View my support tickets ({myTickets.length})
                      </button>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <ScrollArea className="h-full p-3">
                  <div className="space-y-3">
                    {messages.length === 0 && quickPrompts.length > 0 && (
                      <div className="space-y-3 py-2">
                        <p className="text-center text-muted-foreground text-xs">Try one of these:</p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {quickPrompts.slice(0, 3).map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => setInputMessage(prompt)}
                              className="px-2.5 py-1.5 rounded-full border bg-background hover:bg-muted text-xs transition-all"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <LazyStreamdown>{msg.content}</LazyStreamdown>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isSending && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl px-3 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Input area + escalation button */}
            {conversationId && (
              <div className="p-2.5 border-t bg-background">
                <div className="flex gap-1.5">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question..."
                    disabled={isSending}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isSending}
                    size="icon"
                    className="min-w-[36px] h-9"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  {/* Escalation button */}
                  {messages.length >= 2 && (
                    <button
                      onClick={handleEscalate}
                      className="text-[10px] text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
                    >
                      <Wrench className="w-3 h-3" />
                      Need more help? Escalate to Support Agent
                    </button>
                  )}
                  <button
                    onClick={() => deleteConversation.mutate({ conversationId })}
                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== VIEW: Escalation Form ===== */}
        {viewMode === "escalation-form" && (
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-lg bg-orange-500/10 text-orange-600">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm">Escalate to AI Support Agent</h3>
                  <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
                    The Support Agent has elevated access to diagnose and resolve technical issues, account problems, and platform errors.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Subject</label>
                    <Input
                      value={escalationSubject}
                      onChange={(e) => setEscalationSubject(e.target.value)}
                      placeholder="Brief description of the issue"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Describe your issue</label>
                    <textarea
                      value={escalationMessage}
                      onChange={(e) => setEscalationMessage(e.target.value)}
                      placeholder="What's happening? What did you expect? Any error messages?"
                      className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {messages.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      Your recent Q&A conversation will be included as context for the Support Agent.
                    </p>
                  )}

                  <Button
                    onClick={handleSubmitEscalation}
                    disabled={isEscalating || !escalationMessage.trim()}
                    size="sm"
                    className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isEscalating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wrench className="w-3.5 h-3.5" />
                    )}
                    {isEscalating ? "Connecting to Support Agent..." : "Submit to Support Agent"}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* ===== VIEW: Ticket Chat ===== */}
        {viewMode === "ticket-chat" && activeTicketId && (
          <>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-3">
                <div className="space-y-3">
                  {/* Ticket status banner */}
                  {ticketData?.ticket && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${priorityColors[ticketData.ticket.priority] || "bg-muted"}`}>
                      {statusIcons[ticketData.ticket.status]}
                      <span className="font-medium capitalize">{ticketData.ticket.priority} Priority</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="capitalize">{ticketData.ticket.status.replace("_", " ")}</span>
                    </div>
                  )}

                  {ticketMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div>
                            <p className="text-[10px] font-medium text-orange-600 mb-1 flex items-center gap-1">
                              <Wrench className="w-2.5 h-2.5" /> Support Agent
                            </p>
                            <LazyStreamdown>{msg.content}</LazyStreamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isSendingTicket && (
                    <div className="flex justify-start">
                      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-2xl px-3 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Ticket input */}
            {ticketData?.ticket?.status !== "closed" && ticketData?.ticket?.status !== "resolved" && (
              <div className="p-2.5 border-t bg-background">
                <div className="flex gap-1.5">
                  <Input
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Follow up with Support Agent..."
                    disabled={isSendingTicket}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    onClick={handleSendTicketMessage}
                    disabled={!ticketInput.trim() || isSendingTicket}
                    size="icon"
                    className="min-w-[36px] h-9 bg-orange-600 hover:bg-orange-700"
                  >
                    {isSendingTicket ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex justify-end mt-1">
                  <button
                    onClick={() => closeTicket.mutate({ ticketId: activeTicketId })}
                    className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Close ticket
                  </button>
                </div>
              </div>
            )}

            {/* Resolved/closed banner */}
            {(ticketData?.ticket?.status === "closed" || ticketData?.ticket?.status === "resolved") && (
              <div className="p-3 border-t bg-green-50 dark:bg-green-950/20 text-center">
                <p className="text-xs text-green-700 dark:text-green-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  This ticket has been {ticketData.ticket.status}
                </p>
              </div>
            )}
          </>
        )}

        {/* ===== VIEW: My Tickets ===== */}
        {viewMode === "my-tickets" && (
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-3">
              <div className="space-y-2">
                {!myTickets || myTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <Wrench className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No support tickets yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      If the Q&A agent can't help, you can escalate to the Support Agent.
                    </p>
                  </div>
                ) : (
                  myTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => {
                        setActiveTicketId(ticket.id);
                        setViewMode("ticket-chat");
                      }}
                      className="w-full text-left p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {statusIcons[ticket.status] || <Clock className="w-3 h-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ticket.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColors[ticket.priority] || "bg-muted"}`}>
                              {ticket.priority}
                            </span>
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {ticket.status.replace("_", " ")}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </Card>
    </div>
  );
}
