import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSSE, useTypingIndicator, ChatEvent } from "@/hooks/useSSE";
import { 
  MessageSquare,
  Send,
  Paperclip,
  MoreVertical,
  Search,
  Plus,
  Users,
  Circle,
  CheckCircle2,
  Reply,
  CornerDownRight,
  X,
  Hash,
  Lock,
  Settings,
  Bell,
  BellOff,
  Archive,
  Trash2,
  Pin,
  Star,
  Phone,
  Video,
  Info,
  ChevronRight,
  Smile,
  Image,
  File,
  Mic,
  AtSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Presence status colors
const presenceColors: Record<string, string> = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  busy: "bg-red-500",
  offline: "bg-gray-400",
};

// Chat type icons
const chatTypeIcons: Record<string, any> = {
  direct: MessageSquare,
  group: Users,
  channel: Hash,
};

export default function Chat() {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatType, setNewChatType] = useState<"direct" | "group" | "channel">("direct");
  const [newChatName, setNewChatName] = useState("");
  const [typingUsers, setTypingUsers] = useState<Map<number, { userId: number; userName: string }>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reply state for message threading
  const [replyingTo, setReplyingTo] = useState<{
    id: number;
    content: string;
    senderName: string | null;
  } | null>(null);
  const [showThreadView, setShowThreadView] = useState(false);
  const [threadParentId, setThreadParentId] = useState<number | null>(null);

  // Queries
  const { data: chatsList, refetch: refetchChats } = trpc.chat.list.useQuery({ limit: 50 });
  const { data: unreadCount } = trpc.chat.getUnreadCount.useQuery();
  const { data: activeChat, refetch: refetchActiveChat } = trpc.chat.getById.useQuery(
    { id: activeChatId!, messageLimit: 100 },
    { enabled: !!activeChatId }
  );

  // SSE event handlers
  const handleNewMessage = useCallback((event: ChatEvent) => {
    if (event.chatId === activeChatId) {
      refetchActiveChat();
    }
    refetchChats();
  }, [activeChatId, refetchActiveChat, refetchChats]);

  const handleTyping = useCallback((event: ChatEvent) => {
    const { userId, userName, isTyping } = event.data as {
      userId: number;
      userName: string;
      isTyping: boolean;
    };
    
    if (event.chatId === activeChatId) {
      setTypingUsers(prev => {
        const next = new Map(prev);
        if (isTyping) {
          next.set(userId, { userId, userName });
        } else {
          next.delete(userId);
        }
        return next;
      });
    }
  }, [activeChatId]);

  const handlePresence = useCallback(() => {
    refetchChats();
  }, [refetchChats]);

  // Connect to SSE
  const { isConnected } = useSSE({
    onMessage: handleNewMessage,
    onTyping: handleTyping,
    onPresence: handlePresence,
    enabled: true,
  });

  // Typing indicator
  const sendTypingMutation = trpc.chat.sendTypingIndicator.useMutation();
  const sendTyping = useCallback((chatId: number, isTyping: boolean) => {
    sendTypingMutation.mutate({ chatId, isTyping });
  }, [sendTypingMutation]);
  
  const { startTyping, stopTyping } = useTypingIndicator(activeChatId, sendTyping);

  // Mutations
  const createChat = trpc.chat.create.useMutation({
    onSuccess: (data) => {
      toast.success("Chat created");
      setShowNewChatDialog(false);
      setNewChatName("");
      setActiveChatId(data.id);
      refetchChats();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageInput("");
      setReplyingTo(null);
      refetchActiveChat();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const markAsRead = trpc.chat.markAsRead.useMutation();
  const updatePresence = trpc.chat.updatePresence.useMutation();

  // Query for thread replies
  const { data: threadData, refetch: refetchThread } = trpc.chat.getThreadReplies.useQuery(
    { messageId: threadParentId! },
    { enabled: !!threadParentId && showThreadView }
  );

  // Get reply counts for messages
  const messageIds = activeChat?.messages?.map(m => m.id) || [];
  const { data: replyCounts } = trpc.chat.getReplyCountsBatch.useQuery(
    { messageIds },
    { enabled: messageIds.length > 0 }
  );

  // Update presence on mount
  useEffect(() => {
    updatePresence.mutate({ status: "online" });
    
    const interval = setInterval(() => {
      updatePresence.mutate({ status: "online" });
    }, 60000);
    
    return () => {
      clearInterval(interval);
      updatePresence.mutate({ status: "offline" });
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  // Mark chat as read when opened
  useEffect(() => {
    if (activeChatId) {
      markAsRead.mutate({ chatId: activeChatId });
    }
  }, [activeChatId]);

  // Focus input when chat changes
  useEffect(() => {
    if (activeChatId) {
      inputRef.current?.focus();
    }
  }, [activeChatId]);

  const handleCreateChat = () => {
    if (!newChatName.trim()) {
      toast.error("Please enter a chat name");
      return;
    }
    createChat.mutate({
      name: newChatName,
      type: newChatType,
    });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChatId) return;
    sendMessage.mutate({
      chatId: activeChatId,
      content: messageInput.trim(),
      replyToId: replyingTo?.id,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReply = (message: { id: number; content: string; senderName: string | null }) => {
    setReplyingTo({
      id: message.id,
      content: message.content.length > 100 ? message.content.substring(0, 100) + "..." : message.content,
      senderName: message.senderName,
    });
    inputRef.current?.focus();
  };

  const handleViewThread = (messageId: number) => {
    setThreadParentId(messageId);
    setShowThreadView(true);
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter chats by search
  const filteredChats = chatsList?.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Group messages by date
  const groupedMessages = activeChat?.messages?.reduce((groups: any, message: any) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {}) || {};

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)] -m-6">
        {/* Sidebar - Chat List */}
        <div className="w-80 border-r bg-muted/30 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Messages</h2>
              <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="w-4 h-4" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start a New Conversation</DialogTitle>
                    <DialogDescription>
                      Create a direct message, group chat, or channel.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Chat Type</Label>
                      <Select value={newChatType} onValueChange={(v: any) => setNewChatType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Direct Message
                            </div>
                          </SelectItem>
                          <SelectItem value="group">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Group Chat
                            </div>
                          </SelectItem>
                          <SelectItem value="channel">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4" />
                              Channel
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder={newChatType === "channel" ? "e.g., general" : "e.g., Project Team"}
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateChat} disabled={createChat.isPending}>
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredChats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new chat to begin</p>
                </div>
              ) : (
                filteredChats.map((chat: any) => {
                  const ChatIcon = chatTypeIcons[chat.type] || MessageSquare;
                  const isActive = chat.id === activeChatId;
                  const hasUnread = chat.unreadCount > 0;

                  return (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isActive 
                          ? "bg-primary/10 border border-primary/20" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={isActive ? "bg-primary/20" : ""}>
                            <ChatIcon className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        {chat.type === "direct" && (
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${presenceColors.online}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium truncate ${hasUnread ? "text-foreground" : ""}`}>
                            {chat.name || "Unnamed Chat"}
                          </span>
                          {chat.lastMessageAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(chat.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage || "No messages yet"}
                          </p>
                          {hasUnread && (
                            <Badge variant="default" className="ml-2 h-5 min-w-[20px] px-1.5">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Connection Status */}
          <div className="p-3 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Circle className={`w-2 h-2 ${isConnected ? "fill-green-500 text-green-500" : "fill-red-500 text-red-500"}`} />
              {isConnected ? "Connected" : "Reconnecting..."}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeChatId && activeChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {activeChat.type === "channel" ? <Hash className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{activeChat.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {activeChat.participants?.length || 0} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Info className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pin className="w-4 h-4 mr-2" />
                        Pin Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="w-4 h-4 mr-2" />
                        Star Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BellOff className="w-4 h-4 mr-2" />
                        Mute Notifications
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                {Object.entries(groupedMessages).map(([date, messages]: [string, any]) => (
                  <div key={date}>
                    <div className="flex items-center gap-4 my-4">
                      <Separator className="flex-1" />
                      <span className="text-xs text-muted-foreground font-medium">{date}</span>
                      <Separator className="flex-1" />
                    </div>
                    {messages.map((message: any) => {
                      const replyCount = replyCounts?.find((r: any) => r.messageId === message.id)?.count || 0;
                      
                      return (
                        <div
                          key={message.id}
                          className="group flex gap-3 py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2"
                        >
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="text-xs">
                              {getInitials(message.senderName || "U")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-sm">
                                {message.senderName || "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                            {message.replyToId && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                <CornerDownRight className="w-3 h-3" />
                                <span>Replying to a message</span>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            {replyCount > 0 && (
                              <button
                                onClick={() => handleViewThread(message.id)}
                                className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                {replyCount} {replyCount === 1 ? "reply" : "replies"}
                              </button>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleReply(message)}
                            >
                              <Reply className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewThread(message.id)}>
                                  View Thread
                                </DropdownMenuItem>
                                <DropdownMenuItem>Pin Message</DropdownMenuItem>
                                <DropdownMenuItem>Copy Text</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {Array.from(typingUsers.values()).map(u => u.userName).join(", ")}{" "}
                  {typingUsers.size === 1 ? "is" : "are"} typing...
                </div>
              )}

              {/* Reply Preview */}
              {replyingTo && (
                <div className="px-4 py-2 border-t bg-muted/50 flex items-center gap-2">
                  <Reply className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Replying to {replyingTo.senderName}
                    </p>
                    <p className="text-sm truncate">{replyingTo.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setReplyingTo(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Image className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        if (e.target.value) startTyping();
                        else stopTyping();
                      }}
                      onKeyDown={handleKeyDown}
                      onBlur={stopTyping}
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <AtSign className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sendMessage.isPending}
                    className="h-9"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a chat from the sidebar or start a new conversation
                </p>
                <Button onClick={() => setShowNewChatDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Thread Panel */}
        {showThreadView && threadParentId && (
          <div className="w-96 border-l flex flex-col">
            <div className="h-16 border-b flex items-center justify-between px-4">
              <h3 className="font-semibold">Thread</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowThreadView(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              {threadData?.parent && (
                <div className="mb-4 pb-4 border-b">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(threadData.parent.senderName || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">
                          {threadData.parent.senderName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(threadData.parent.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{threadData.parent.content}</p>
                    </div>
                  </div>
                </div>
              )}
              {threadData?.replies?.map((reply: any) => (
                <div key={reply.id} className="flex gap-3 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(reply.senderName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">{reply.senderName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Reply in thread..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && activeChatId) {
                      e.preventDefault();
                      sendMessage.mutate({
                        chatId: activeChatId,
                        content: messageInput.trim(),
                        replyToId: threadParentId,
                      });
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={() => {
                    if (activeChatId && messageInput.trim()) {
                      sendMessage.mutate({
                        chatId: activeChatId,
                        content: messageInput.trim(),
                        replyToId: threadParentId,
                      });
                    }
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
