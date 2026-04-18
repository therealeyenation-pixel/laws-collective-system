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

interface Message {
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

/**
 * PublicQAAgent — A sandboxed, read-only Q&A chat panel for all authenticated members.
 * These agents can only answer questions — they cannot modify data or access internal systems.
 * Available to all authenticated users regardless of role.
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

  // Sync message history
  useEffect(() => {
    if (messageHistory) setMessages(messageHistory as Message[]);
  }, [messageHistory]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      handleSendMessage();
    }
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

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] ${panelHeight} flex flex-col`}>
      <Card className="flex flex-col h-full shadow-2xl border overflow-hidden">
        {/* Header */}
        <div className={`flex items-center gap-3 p-3 border-b ${colorClass} bg-opacity-50`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
            {agent.avatar ? <span className="text-base">{agent.avatar}</span> : icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{agentName}</p>
            <p className="text-xs text-muted-foreground truncate">Q&A Assistant</p>
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

        {/* Input area */}
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
            {conversationId && (
              <div className="flex justify-end mt-1">
                <button
                  onClick={() => deleteConversation.mutate({ conversationId })}
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete conversation
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
