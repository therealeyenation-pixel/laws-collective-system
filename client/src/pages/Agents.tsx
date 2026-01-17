import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Bot,
  MessageSquare,
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
  ChevronRight,
  ChevronLeft,
  Megaphone,
  Search,
  TrendingUp,
  Mic,
  MicOff,
  Calendar,
  Play,
  Pause,
  Clock,
  Users,
  ClipboardCheck,
  ShoppingCart,
  Heart,
  Palette,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

const agentIcons: Record<string, React.ReactNode> = {
  operations: <Settings className="w-5 h-5" />,
  support: <HelpCircle className="w-5 h-5" />,
  education: <BookOpen className="w-5 h-5" />,
  analytics: <BarChart3 className="w-5 h-5" />,
  guardian: <Shield className="w-5 h-5" />,
  finance: <DollarSign className="w-5 h-5" />,
  media: <Film className="w-5 h-5" />,
  outreach: <Megaphone className="w-5 h-5" />,
  seo: <Search className="w-5 h-5" />,
  engagement: <TrendingUp className="w-5 h-5" />,
  hr: <Users className="w-5 h-5" />,
  qaqc: <ClipboardCheck className="w-5 h-5" />,
  purchasing: <ShoppingCart className="w-5 h-5" />,
  health: <Heart className="w-5 h-5" />,
  design: <Palette className="w-5 h-5" />,
  custom: <Sparkles className="w-5 h-5" />,
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

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showScheduledTasks, setShowScheduledTasks] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const { data: agents, isLoading: agentsLoading, refetch: refetchAgents } = trpc.agents.getAll.useQuery();
  const { data: conversations, refetch: refetchConversations } = trpc.agents.getConversations.useQuery(
    { agentId: selectedAgent || undefined },
    { enabled: !!selectedAgent, retry: false }
  );
  const { data: messageHistory, refetch: refetchMessages } = trpc.agents.getMessages.useQuery(
    { conversationId: conversationId || 0 },
    { enabled: !!conversationId, retry: false }
  );

  const initializeAgents = trpc.agents.initializeSystemAgents.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchAgents();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const startConversation = trpc.agents.startConversation.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages([]);
      setMobileView("chat");
      refetchConversations();
    },
    onError: (error) => {
      toast.error(error.message);
    },
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
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: scheduledTasks, refetch: refetchTasks } = trpc.agents.getScheduledTasks.useQuery(undefined, {
    retry: false,
  });
  
  // Get the selected agent's type for topics and prompts
  const selectedAgentData = agents?.find((a) => a.id === selectedAgent);
  const { data: topics } = trpc.agents.getTopics.useQuery(
    { agentType: selectedAgentData?.type || "custom" },
    { enabled: !!selectedAgentData }
  );
  const { data: prompts } = trpc.agents.getPrompts.useQuery(
    { agentType: selectedAgentData?.type || "custom" },
    { enabled: !!selectedAgentData }
  );
  
  const initializeTasks = trpc.agents.initializeDefaultTasks.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchTasks();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const runTask = trpc.agents.runScheduledTask.useMutation({
    onSuccess: (data) => {
      toast.success("Task completed");
      refetchTasks();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleTask = trpc.agents.toggleScheduledTask.useMutation({
    onSuccess: () => {
      refetchTasks();
    },
  });

  // Voice input setup
  useEffect(() => {
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

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Please enable it in your browser settings.");
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input is not supported in this browser");
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

  useEffect(() => {
    if (messageHistory) {
      setMessages(messageHistory as Message[]);
    }
  }, [messageHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectAgent = (agentId: number) => {
    setSelectedAgent(agentId);
    setConversationId(null);
    setMessages([]);
    setShowScheduledTasks(false);
    setMobileView("chat");
  };

  const handleStartNewConversation = () => {
    if (!selectedAgent) return;
    const agent = agents?.find((b) => b.id === selectedAgent);
    startConversation.mutate({
      agentId: selectedAgent,
      title: `Chat with ${agent?.name || "Agent"}`,
    });
  };

  const handleSelectConversation = (convId: number) => {
    setConversationId(convId);
    refetchMessages();
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
    sendMessage.mutate({
      conversationId,
      message: inputMessage,
    });
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToList = () => {
    setMobileView("list");
    setSelectedAgent(null);
    setConversationId(null);
    setShowScheduledTasks(false);
  };

  if (agentsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // No agents yet - show initialization
  if (!agents || agents.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-6 p-4">
          <div className="text-center space-y-4">
            <Bot className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Agents</h2>
            <p className="text-muted-foreground max-w-md">
              Initialize the agent system to get intelligent agents for operations,
              support, education, analytics, governance, finance, and media.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => initializeAgents.mutate()}
            disabled={initializeAgents.isPending}
            className="gap-2 min-h-[48px]"
          >
            {initializeAgents.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Initialize Agents
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Mobile: Show agent list
  const renderBotList = () => (
    <div className="p-4 space-y-2">
      {/* Scheduled Tasks Toggle */}
      <button
        onClick={() => {
          setShowScheduledTasks(true);
          setSelectedAgent(null);
          setMobileView("chat");
        }}
        className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors bg-white border border-gray-200 hover:border-amber-300 min-h-[64px]"
      >
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-amber-500/10">
          <Calendar className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium">Scheduled Tasks</p>
          <p className="text-sm text-muted-foreground">
            {scheduledTasks?.length || 0} tasks
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>

      <div className="border-b my-4" />

      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => handleSelectAgent(agent.id)}
          className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors bg-white border border-gray-200 hover:border-primary/30 min-h-[64px]"
        >
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              agentColors[agent.type]
            }`}
          >
            {agent.avatar || agentIcons[agent.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">{agent.name}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {agent.type}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      ))}
    </div>
  );

  // Mobile: Show scheduled tasks
  const renderScheduledTasks = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center gap-3">
        <button
          onClick={handleBackToList}
          className="p-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            Scheduled Tasks
          </h2>
          <p className="text-sm text-muted-foreground">
            Automated reports and actions
          </p>
        </div>
      </div>

      {/* Tasks List */}
      <ScrollArea className="flex-1 p-4">
        {(!scheduledTasks || scheduledTasks.length === 0) ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No scheduled tasks yet</p>
            <Button
              onClick={() => initializeTasks.mutate()}
              disabled={initializeTasks.isPending}
              className="gap-2 min-h-[48px]"
            >
              {initializeTasks.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Initialize Default Tasks
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledTasks.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{task.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{task.schedule}</span>
                      <span className={`px-2 py-0.5 rounded ${
                        task.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {task.isActive ? "Active" : "Paused"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleTask.mutate({ taskId: task.id, isActive: !task.isActive })}
                      className="min-w-[44px] min-h-[44px]"
                    >
                      {task.isActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => runTask.mutate({ taskId: task.id })}
                      disabled={runTask.isPending}
                      className="min-w-[44px] min-h-[44px]"
                    >
                      {runTask.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 text-green-600" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // Mobile: Show chat interface
  const renderChat = () => (
    <div className="flex flex-col h-full">
      {/* Agent Header */}
      <div className="p-4 border-b bg-white flex items-center gap-3">
        <button
          onClick={handleBackToList}
          className="p-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            agentColors[selectedAgentData?.type || "custom"]
          }`}
        >
          {selectedAgentData?.avatar || agentIcons[selectedAgentData?.type || "custom"]}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{selectedAgentData?.name}</h2>
          <p className="text-xs text-muted-foreground truncate">
            {selectedAgentData?.description}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartNewConversation}
          disabled={startConversation.isPending}
          className="gap-1 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New</span>
        </Button>
      </div>

      {/* Conversations Pills */}
      {conversations && conversations.length > 0 && (
        <div className="p-2 border-b bg-gray-50 overflow-x-auto">
          <div className="flex gap-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-full text-sm transition-colors min-h-[40px] ${
                  conversationId === conv.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border hover:bg-gray-100"
                }`}
              >
                {conv.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        {!conversationId ? (
          <div className="flex-1 overflow-y-auto h-full p-4">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Welcome Section */}
              <div className="text-center space-y-2">
                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${agentColors[selectedAgentData?.type || "custom"]}`}>
                  {selectedAgentData?.avatar || agentIcons[selectedAgentData?.type || "custom"]}
                </div>
                <h2 className="text-xl font-bold">{selectedAgentData?.name}</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  {selectedAgentData?.description}
                </p>
              </div>

              {/* Topics Section */}
              {topics && topics.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Topics to Explore</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleStartNewConversation();
                          setTimeout(() => setInputMessage(topic.title), 100);
                        }}
                        className="flex items-start gap-3 p-3 rounded-xl border bg-white hover:bg-gray-50 hover:border-primary/30 transition-all text-left group"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${agentColors[selectedAgentData?.type || "custom"]}`}>
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">{topic.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{topic.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Prompts Section */}
              {prompts && prompts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Try Asking</h3>
                  <div className="flex flex-wrap gap-2">
                    {prompts.slice(0, 6).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleStartNewConversation();
                          setTimeout(() => {
                            setInputMessage(prompt);
                          }, 100);
                        }}
                        className="px-4 py-2 rounded-full border bg-white hover:bg-gray-50 hover:border-primary/30 text-sm transition-all hover:shadow-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Start Button */}
              <div className="text-center pt-4">
                <Button
                  onClick={handleStartNewConversation}
                  disabled={startConversation.isPending}
                  size="lg"
                  className="gap-2 min-h-[48px]"
                >
                  <Plus className="w-4 h-4" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.length === 0 && prompts && prompts.length > 0 && (
                <div className="space-y-4 py-4">
                  <p className="text-center text-muted-foreground text-sm">Try one of these to get started:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {prompts.slice(0, 4).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputMessage(prompt);
                        }}
                        className="px-3 py-2 rounded-full border bg-white hover:bg-gray-50 hover:border-primary/30 text-sm transition-all"
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
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-100"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Streamdown>{msg.content}</Streamdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Message Input */}
      {conversationId && (
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Button
              onClick={toggleVoiceInput}
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className={`min-w-[48px] min-h-[48px] ${isListening ? "animate-pulse" : ""}`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Type a message..."}
              disabled={isSending}
              className="flex-1 min-h-[48px]"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              size="icon"
              className="min-w-[48px] min-h-[48px]"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          {isListening && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              🎤 Listening... Speak now
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] flex flex-col md:flex-row md:gap-4 md:p-4">
        {/* Mobile View */}
        <div className="md:hidden h-full">
          {mobileView === "list" ? (
            <div className="h-full overflow-y-auto bg-gray-50">
              <div className="p-4 border-b bg-white">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Bot className="w-6 h-6" />
                  Agents
                </h1>
              </div>
              {renderBotList()}
            </div>
          ) : showScheduledTasks ? (
            renderScheduledTasks()
          ) : selectedAgent ? (
            renderChat()
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Select an agent to start</p>
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex md:flex-1 md:gap-4">
          {/* Agent Selection Sidebar */}
          <Card className="w-64 flex-shrink-0 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Agents
              </h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {/* Scheduled Tasks Toggle */}
                <button
                  onClick={() => {
                    setShowScheduledTasks(true);
                    setSelectedAgent(null);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors mb-2 ${
                    showScheduledTasks
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      : "hover:bg-muted border border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/10">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Scheduled Tasks</p>
                    <p className="text-xs text-muted-foreground">
                      {scheduledTasks?.length || 0} tasks
                    </p>
                  </div>
                </button>
                <div className="border-b mb-2" />
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      handleSelectAgent(agent.id);
                      setShowScheduledTasks(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedAgent === agent.id && !showScheduledTasks
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        agentColors[agent.type]
                      }`}
                    >
                      {agent.avatar || agentIcons[agent.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{agent.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {agent.type}
                      </p>
                    </div>
                    {selectedAgent === agent.id && !showScheduledTasks && (
                      <ChevronRight className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Main Chat Area - Desktop */}
          <div className="flex-1 flex flex-col">
            {showScheduledTasks ? (
              <Card className="flex-1 flex flex-col p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Scheduled Agent Tasks
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Automated reports and actions that run on schedule
                    </p>
                  </div>
                  {(!scheduledTasks || scheduledTasks.length === 0) && (
                    <Button
                      onClick={() => initializeTasks.mutate()}
                      disabled={initializeTasks.isPending}
                      className="gap-2"
                    >
                      {initializeTasks.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Initialize Default Tasks
                    </Button>
                  )}
                </div>
                <ScrollArea className="flex-1">
                  {scheduledTasks && scheduledTasks.length > 0 ? (
                    <div className="space-y-3">
                      {scheduledTasks.map((task) => (
                        <Card key={task.id} className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium">{task.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {task.schedule}
                                </span>
                                <span className={`px-2 py-0.5 rounded ${
                                  task.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                }`}>
                                  {task.isActive ? "Active" : "Paused"}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleTask.mutate({ taskId: task.id, isActive: !task.isActive })}
                              >
                                {task.isActive ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => runTask.mutate({ taskId: task.id })}
                                disabled={runTask.isPending}
                              >
                                Run Now
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No scheduled tasks yet</p>
                    </div>
                  )}
                </ScrollArea>
              </Card>
            ) : !selectedAgent ? (
              <Card className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">Select an Agent</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Choose an agent from the sidebar to start chatting
                  </p>
                </div>
              </Card>
            ) : (
              <>
                {/* Agent Header */}
                <Card className="p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg ${
                          agentColors[selectedAgentData?.type || "custom"]
                        }`}
                      >
                        {selectedAgentData?.avatar || agentIcons[selectedAgentData?.type || "custom"]}
                      </div>
                      <div>
                        <h2 className="font-semibold">{selectedAgentData?.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedAgentData?.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartNewConversation}
                      disabled={startConversation.isPending}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New Chat
                    </Button>
                  </div>
                </Card>

                <div className="flex-1 flex gap-4">
                  {/* Conversations List */}
                  <Card className="w-48 flex-shrink-0 flex flex-col">
                    <div className="p-3 border-b">
                      <p className="text-sm font-medium">Conversations</p>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-2 space-y-1">
                        {conversations?.length === 0 && (
                          <p className="text-xs text-muted-foreground p-2">
                            No conversations yet
                          </p>
                        )}
                        {conversations?.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv.id)}
                            className={`w-full flex items-center justify-between p-2 rounded text-left text-sm transition-colors ${
                              conversationId === conv.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            }`}
                          >
                            <span className="truncate flex-1">{conv.title}</span>
                            {conversationId === conv.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversation.mutate({ conversationId: conv.id });
                                }}
                                className="p-1 hover:bg-destructive/10 rounded"
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </button>
                            )}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>

                  {/* Chat Messages */}
                  <Card className="flex-1 flex flex-col">
                    {!conversationId ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Start a new conversation or select an existing one
                          </p>
                          <Button
                            onClick={handleStartNewConversation}
                            disabled={startConversation.isPending}
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Start Chatting
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ScrollArea className="flex-1 p-4">
                          <div className="space-y-4">
                            {messages.length === 0 && (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                  Send a message to start the conversation
                                </p>
                              </div>
                            )}
                            {messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${
                                  msg.role === "user" ? "justify-end" : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-lg p-3 ${
                                    msg.role === "user"
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  {msg.role === "assistant" ? (
                                    <Streamdown>{msg.content}</Streamdown>
                                  ) : (
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isSending && (
                              <div className="flex justify-start">
                                <div className="bg-muted rounded-lg p-3">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 border-t">
                          <div className="flex gap-2">
                            <Button
                              onClick={toggleVoiceInput}
                              variant={isListening ? "destructive" : "outline"}
                              size="icon"
                              className={isListening ? "animate-pulse" : ""}
                              title={isListening ? "Stop listening" : "Voice input"}
                            >
                              {isListening ? (
                                <MicOff className="w-4 h-4" />
                              ) : (
                                <Mic className="w-4 h-4" />
                              )}
                            </Button>
                            <Input
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyPress={handleKeyPress}
                              placeholder={isListening ? "Listening..." : "Type or speak your message..."}
                              disabled={isSending}
                              className="flex-1"
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={!inputMessage.trim() || isSending}
                              size="icon"
                            >
                              {isSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          {isListening && (
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              🎤 Listening... Speak now
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
