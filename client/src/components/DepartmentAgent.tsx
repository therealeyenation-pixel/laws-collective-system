import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  Shield,
  BookOpen,
  BarChart3,
  DollarSign,
  Film,
  HelpCircle,
  Settings,
  Plus,
  Trash2,
  Megaphone,
  Search,
  TrendingUp,
  Mic,
  MicOff,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Users,
  ClipboardCheck,
  ShoppingCart,
  Heart,
  Palette,
  GraduationCap,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { LazyStreamdown } from "@/components/LazyStreamdown";
import { AGENT_TO_DEPARTMENT } from "../../../shared/departmentRegistry";

const agentIcons: Record<string, React.ReactNode> = {
  operations: <Settings className="w-4 h-4" />,
  support: <HelpCircle className="w-4 h-4" />,
  education: <BookOpen className="w-4 h-4" />,
  analytics: <BarChart3 className="w-4 h-4" />,
  guardian: <Shield className="w-4 h-4" />,
  finance: <DollarSign className="w-4 h-4" />,
  media: <Film className="w-4 h-4" />,
  outreach: <Megaphone className="w-4 h-4" />,
  seo: <Search className="w-4 h-4" />,
  engagement: <TrendingUp className="w-4 h-4" />,
  hr: <Users className="w-4 h-4" />,
  qaqc: <ClipboardCheck className="w-4 h-4" />,
  purchasing: <ShoppingCart className="w-4 h-4" />,
  health: <Heart className="w-4 h-4" />,
  design: <Palette className="w-4 h-4" />,
  custom: <Sparkles className="w-4 h-4" />,
};

const agentColors: Record<string, string> = {
  operations: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  support: "bg-green-500/10 text-green-500 border-green-500/20",
  education: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  analytics: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  guardian: "bg-red-500/10 text-red-500 border-red-500/20",
  finance: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  media: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
  outreach: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  seo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  engagement: "bg-green-500/10 text-green-500 border-green-500/20",
  hr: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  qaqc: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  purchasing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  health: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  design: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  custom: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
};

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

interface DepartmentAgentProps {
  /** The agent type to load (e.g., "finance", "hr", "operations") */
  agentType: string;
  /** Optional custom label override */
  label?: string;
}

/**
 * DepartmentAgent — A self-contained, collapsible AI agent chat panel
 * designed to be embedded directly within any department dashboard.
 * Each department owns its own agent instance.
 */
export function DepartmentAgent({ agentType, label }: DepartmentAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Fetch all agents and find the one matching this department's type
  const { data: agents } = trpc.agents.getAll.useQuery();
  const agent = agents?.find((a) => a.type === agentType);

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

  // Topics and prompts for this agent type
  const { data: topics } = trpc.agents.getTopics.useQuery(
    { agentType },
    { enabled: isOpen && !!agent }
  );
  const { data: prompts } = trpc.agents.getPrompts.useQuery(
    { agentType },
    { enabled: isOpen && !!agent }
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

  // Workshop mode
  const startWorkshop = trpc.agents.startWorkshopSession.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content: data.welcomeMessage,
          createdAt: new Date(),
        },
      ]);
      refetchConversations();
      toast.success(`Workshop started: ${data.departmentName} Department`);
    },
    onError: (error) => toast.error(error.message),
  });

  // Voice input setup
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInputMessage(transcript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied.");
        }
      };
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [isOpen]);

  // Sync message history
  useEffect(() => {
    if (messageHistory) setMessages(messageHistory as Message[]);
  }, [messageHistory]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleStartNewConversation = () => {
    if (!agent) return;
    startConversation.mutate({
      agentId: agent.id,
      title: `Chat with ${agent.name}`,
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
    sendMessage.mutate({ conversationId, message: inputMessage });
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartWorkshop = () => {
    if (!agent) return;
    const deptId = AGENT_TO_DEPARTMENT[agentType];
    if (!deptId) {
      toast.error("No department workshop linked to this agent");
      return;
    }
    startWorkshop.mutate({ agentId: agent.id, agentType });
  };

  const agentName = label || agent?.name || `${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent`;
  const colorClass = agentColors[agentType] || agentColors.custom;
  const icon = agentIcons[agentType] || agentIcons.custom;

  // If agents haven't been initialized yet, show nothing
  if (!agents || agents.length === 0) return null;
  // If this specific agent type doesn't exist, show nothing
  if (!agent) return null;

  // Collapsed state — floating button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className={`rounded-full shadow-lg gap-2 min-h-[56px] px-5 ${colorClass} border hover:shadow-xl transition-all`}
        >
          <Bot className="w-5 h-5" />
          <span className="hidden sm:inline">{agentName}</span>
          <span className="sm:hidden">Agent</span>
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
            {agent.avatar || icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{agentName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {agent.description?.slice(0, 60)}...
            </p>
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
                  {conv.title?.slice(0, 20) || "Chat"}
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
                    {agent.avatar || icon}
                  </div>
                  <h3 className="font-semibold text-sm">{agentName}</h3>
                  <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
                    {agent.description}
                  </p>
                </div>

                {/* Quick prompts */}
                {prompts && prompts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Try asking</p>
                    <div className="flex flex-wrap gap-1.5">
                      {prompts.slice(0, 4).map((prompt, idx) => (
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

                {/* Topics */}
                {topics && topics.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Topics</p>
                    <div className="space-y-1.5">
                      {topics.slice(0, 3).map((topic, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleStartNewConversation();
                            setTimeout(() => setInputMessage(topic.title), 200);
                          }}
                          className="w-full flex items-start gap-2 p-2 rounded-lg border bg-background hover:bg-muted transition-all text-left"
                        >
                          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium">{topic.title}</p>
                            <p className="text-[10px] text-muted-foreground line-clamp-1">{topic.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  {AGENT_TO_DEPARTMENT[agentType] && (
                    <Button
                      onClick={handleStartWorkshop}
                      disabled={startWorkshop.isPending}
                      size="sm"
                      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {startWorkshop.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <GraduationCap className="w-3.5 h-3.5" />
                      )}
                      Workshop Mode
                    </Button>
                  )}
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
                    Start Conversation
                  </Button>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-full p-3">
              <div className="space-y-3">
                {messages.length === 0 && prompts && prompts.length > 0 && (
                  <div className="space-y-3 py-2">
                    <p className="text-center text-muted-foreground text-xs">Try one of these:</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {prompts.slice(0, 3).map((prompt, idx) => (
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
              <Button
                onClick={toggleVoiceInput}
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className={`min-w-[36px] h-9 ${isListening ? "animate-pulse" : ""}`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Type a message..."}
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
            {isListening && (
              <p className="text-[10px] text-muted-foreground mt-1 text-center">
                🎤 Listening... Speak now
              </p>
            )}
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
