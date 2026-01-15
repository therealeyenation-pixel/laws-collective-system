import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Megaphone,
  Search,
  TrendingUp,
  Mic,
  MicOff,
  Calendar,
  Play,
  Pause,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

const botIcons: Record<string, React.ReactNode> = {
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
  custom: <Sparkles className="w-5 h-5" />,
};

const botColors: Record<string, string> = {
  operations: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  support: "bg-green-500/10 text-green-500 border-green-500/20",
  education: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  analytics: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  guardian: "bg-red-500/10 text-red-500 border-red-500/20",
  finance: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  media: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  outreach: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  seo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  engagement: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  custom: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
};

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export default function Bots() {
  const [selectedBot, setSelectedBot] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showScheduledTasks, setShowScheduledTasks] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const { data: bots, isLoading: botsLoading, refetch: refetchBots } = trpc.bots.getAll.useQuery();
  const { data: conversations, refetch: refetchConversations } = trpc.bots.getConversations.useQuery(
    { botId: selectedBot || undefined },
    { enabled: !!selectedBot }
  );
  const { data: messageHistory, refetch: refetchMessages } = trpc.bots.getMessages.useQuery(
    { conversationId: conversationId || 0 },
    { enabled: !!conversationId }
  );

  const initializeBots = trpc.bots.initializeSystemBots.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchBots();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const startConversation = trpc.bots.startConversation.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages([]);
      refetchConversations();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendMessage = trpc.bots.chat.useMutation({
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

  const deleteConversation = trpc.bots.deleteConversation.useMutation({
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

  const { data: scheduledTasks, refetch: refetchTasks } = trpc.bots.getScheduledTasks.useQuery();
  
  const initializeTasks = trpc.bots.initializeDefaultTasks.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchTasks();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const runTask = trpc.bots.runScheduledTask.useMutation({
    onSuccess: (data) => {
      toast.success("Task completed");
      refetchTasks();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleTask = trpc.bots.toggleScheduledTask.useMutation({
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

  const handleSelectBot = (botId: number) => {
    setSelectedBot(botId);
    setConversationId(null);
    setMessages([]);
  };

  const handleStartNewConversation = () => {
    if (!selectedBot) return;
    const bot = bots?.find((b) => b.id === selectedBot);
    startConversation.mutate({
      botId: selectedBot,
      title: `Chat with ${bot?.name || "Bot"}`,
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

  const selectedBotData = bots?.find((b) => b.id === selectedBot);

  if (botsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // No bots yet - show initialization
  if (!bots || bots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-6">
        <div className="text-center space-y-4">
          <Bot className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">AI Assistants</h2>
          <p className="text-muted-foreground max-w-md">
            Initialize the AI bot system to get intelligent assistants for operations,
            support, education, analytics, governance, finance, and media.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => initializeBots.mutate()}
          disabled={initializeBots.isPending}
          className="gap-2"
        >
          {initializeBots.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Initialize AI Bots
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Bot Selection Sidebar */}
      <Card className="w-64 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Assistants
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* Scheduled Tasks Toggle */}
            <button
              onClick={() => setShowScheduledTasks(!showScheduledTasks)}
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
            {bots.map((bot) => (
              <button
                key={bot.id}
                onClick={() => handleSelectBot(bot.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  selectedBot === bot.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    botColors[bot.type]
                  }`}
                >
                  {bot.avatar || botIcons[bot.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{bot.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {bot.type}
                  </p>
                </div>
                {selectedBot === bot.id && (
                  <ChevronRight className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {showScheduledTasks ? (
          <Card className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Scheduled Bot Tasks
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
              {!scheduledTasks || scheduledTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Scheduled Tasks</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Initialize default tasks to set up automated reports and audits
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledTasks.map((task) => {
                    const taskBot = bots?.find(b => b.id === task.botId);
                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border ${
                          task.isActive ? "bg-card" : "bg-muted/50 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              botColors[taskBot?.type || "custom"]
                            }`}>
                              {taskBot?.avatar || botIcons[taskBot?.type || "custom"]}
                            </div>
                            <div>
                              <h3 className="font-medium">{task.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {task.schedule}
                                </span>
                                <span className="capitalize px-2 py-0.5 bg-muted rounded">
                                  {task.taskType.replace("_", " ")}
                                </span>
                                {task.lastRunAt && (
                                  <span>
                                    Last run: {new Date(task.lastRunAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => runTask.mutate({ taskId: task.id })}
                              disabled={runTask.isPending}
                              title="Run now"
                            >
                              {runTask.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant={task.isActive ? "outline" : "secondary"}
                              size="sm"
                              onClick={() => toggleTask.mutate({ taskId: task.id, isActive: !task.isActive })}
                              title={task.isActive ? "Pause" : "Resume"}
                            >
                              {task.isActive ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </Card>
        ) : !selectedBot ? (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Select a Bot</h3>
              <p className="text-muted-foreground">
                Choose an AI assistant from the sidebar to start chatting
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Bot Header */}
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg ${
                      botColors[selectedBotData?.type || "custom"]
                    }`}
                  >
                    {selectedBotData?.avatar || botIcons[selectedBotData?.type || "custom"]}
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedBotData?.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedBotData?.description}
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
  );
}
