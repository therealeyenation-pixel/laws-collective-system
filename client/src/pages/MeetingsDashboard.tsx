import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSSE, useTypingIndicator, ChatEvent } from "@/hooks/useSSE";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Settings,
  MessageSquare,
  Send,
  Paperclip,
  MoreVertical,
  Copy,
  ExternalLink,
  Monitor,
  Hand,
  Smile,
  Search,
  ChevronRight,
  Circle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Reply,
  CornerDownRight,
  X,
  MessageCircle,
} from "lucide-react";

// Meeting status badge colors
const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_progress: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

// Presence status colors
const presenceColors: Record<string, string> = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  busy: "bg-red-500",
  offline: "bg-gray-400",
};

export default function MeetingsDashboard() {
  const [activeTab, setActiveTab] = useState("meetings");
  const [showNewMeetingDialog, setShowNewMeetingDialog] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [activeMeetingId, setActiveMeetingId] = useState<number | null>(null);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState<Map<number, { userId: number; userName: string }>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Reply state for message threading
  const [replyingTo, setReplyingTo] = useState<{
    id: number;
    content: string;
    senderName: string | null;
  } | null>(null);
  const [showThreadView, setShowThreadView] = useState(false);
  const [threadParentId, setThreadParentId] = useState<number | null>(null);

  // Form state for new meeting
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60,
    isRecorded: false,
    waitingRoomEnabled: false,
  });

  // Queries - MUST be defined before useCallback hooks that reference them
  const { data: upcomingMeetings, refetch: refetchUpcoming } = trpc.meetings.upcoming.useQuery({ limit: 10 });
  const { data: meetingsList, refetch: refetchMeetings } = trpc.meetings.list.useQuery({ limit: 20 });
  const { data: meetingStats } = trpc.meetings.stats.useQuery();
  const { data: chatsList, refetch: refetchChats } = trpc.chat.list.useQuery({ limit: 50 });
  const { data: unreadCount } = trpc.chat.getUnreadCount.useQuery();
  const { data: activeMeeting } = trpc.meetings.getById.useQuery(
    { id: activeMeetingId! },
    { enabled: !!activeMeetingId }
  );
  const { data: activeChat, refetch: refetchActiveChat } = trpc.chat.getById.useQuery(
    { id: activeChatId!, messageLimit: 100 },
    { enabled: !!activeChatId }
  );

  // SSE event handlers - defined after queries so refetch functions are available
  const handleNewMessage = useCallback((event: ChatEvent) => {
    // If the message is for the active chat, refetch messages
    if (event.chatId === activeChatId) {
      refetchActiveChat();
    }
    // Also refetch chat list to update last message preview
    refetchChats();
  }, [activeChatId, refetchActiveChat, refetchChats]);

  const handleTyping = useCallback((event: ChatEvent) => {
    const { userId, userName, isTyping, chatId } = event.data as {
      userId: number;
      userName: string;
      isTyping: boolean;
      chatId?: number;
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

  const handlePresence = useCallback((event: ChatEvent) => {
    // Could update online status indicators
    refetchChats();
  }, [refetchChats]);

  // Connect to SSE
  const { isConnected, connectionError } = useSSE({
    onMessage: handleNewMessage,
    onTyping: handleTyping,
    onPresence: handlePresence,
    enabled: activeTab === "chat",
  });

  // Typing indicator
  const sendTypingMutation = trpc.chat.sendTypingIndicator.useMutation();
  const sendTyping = useCallback((chatId: number, isTyping: boolean) => {
    sendTypingMutation.mutate({ chatId, isTyping });
  }, [sendTypingMutation]);
  
  const { startTyping, stopTyping } = useTypingIndicator(activeChatId, sendTyping);

  // Mutations
  const createMeeting = trpc.meetings.create.useMutation({
    onSuccess: () => {
      toast.success("Meeting scheduled successfully");
      setShowNewMeetingDialog(false);
      setNewMeeting({
        title: "",
        description: "",
        scheduledAt: "",
        duration: 60,
        isRecorded: false,
        waitingRoomEnabled: false,
      });
      refetchUpcoming();
      refetchMeetings();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const joinMeeting = trpc.meetings.join.useMutation({
    onSuccess: (data) => {
      toast.success("Joining meeting...");
      setShowVideoCall(true);
      // In production, this would open the Daily.co room
      if (data.roomUrl) {
        window.open(data.roomUrl, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const startMeeting = trpc.meetings.start.useMutation({
    onSuccess: (data) => {
      toast.success("Meeting started");
      setShowVideoCall(true);
      refetchMeetings();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const endMeeting = trpc.meetings.end.useMutation({
    onSuccess: () => {
      toast.success("Meeting ended");
      setShowVideoCall(false);
      setActiveMeetingId(null);
      refetchMeetings();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageInput("");
      setReplyingTo(null); // Clear reply state after sending
      refetchActiveChat();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Query for thread replies
  const { data: threadData, refetch: refetchThread } = trpc.chat.getThreadReplies.useQuery(
    { messageId: threadParentId! },
    { enabled: !!threadParentId && showThreadView }
  );

  // Get reply counts for messages in active chat
  const messageIds = activeChat?.messages?.map(m => m.id) || [];
  const { data: replyCounts } = trpc.chat.getReplyCountsBatch.useQuery(
    { messageIds },
    { enabled: messageIds.length > 0 }
  );

  const markAsRead = trpc.chat.markAsRead.useMutation();

  const updatePresence = trpc.chat.updatePresence.useMutation();

  // File upload mutations
  const uploadAttachment = trpc.chat.uploadAttachment.useMutation();
  const sendMessageWithAttachment = trpc.chat.sendMessageWithAttachment.useMutation({
    onSuccess: () => {
      refetchActiveChat();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update presence on mount
  useEffect(() => {
    updatePresence.mutate({ status: "online" });
    
    // Update presence periodically
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

  const handleCreateMeeting = () => {
    if (!newMeeting.title || !newMeeting.scheduledAt) {
      toast.error("Please fill in required fields");
      return;
    }
    createMeeting.mutate({
      ...newMeeting,
      scheduledAt: new Date(newMeeting.scheduledAt).toISOString(),
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

  // Handle reply to a message
  const handleReply = (message: { id: number; content: string; senderName: string | null }) => {
    setReplyingTo({
      id: message.id,
      content: message.content.length > 100 ? message.content.substring(0, 100) + "..." : message.content,
      senderName: message.senderName,
    });
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragging(false);
      }
      return newCount;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    if (!activeChatId) {
      toast.error("Please select a chat first");
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Process each file
    for (const file of files) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 25MB.`);
        continue;
      }

      try {
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          
          // Upload the file
          const result = await uploadAttachment.mutateAsync({
            chatId: activeChatId,
            fileName: file.name,
            fileData: base64,
            mimeType: file.type || "application/octet-stream",
            fileSize: file.size,
          });

          // Send message with attachment
          sendMessageWithAttachment.mutate({
            chatId: activeChatId,
            content: `Shared a file: ${file.name}`,
            attachmentUrl: result.url,
            attachmentName: result.fileName,
            attachmentType: result.mimeType,
            attachmentSize: result.fileSize,
          });

          toast.success(`File ${file.name} uploaded successfully`);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  // Open thread view for a message
  const handleViewThread = (messageId: number) => {
    setThreadParentId(messageId);
    setShowThreadView(true);
  };

  // Close thread view
  const handleCloseThread = () => {
    setShowThreadView(false);
    setThreadParentId(null);
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold">Meetings & Chat</h1>
            <p className="text-muted-foreground">
              Video conferencing and team communication
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showNewMeetingDialog} onOpenChange={setShowNewMeetingDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule New Meeting</DialogTitle>
                  <DialogDescription>
                    Create a video meeting and invite participants
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Meeting Title *</Label>
                    <Input
                      id="title"
                      placeholder="Weekly Team Sync"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Meeting agenda and notes..."
                      value={newMeeting.description}
                      onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Date & Time *</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={newMeeting.scheduledAt}
                        onChange={(e) => setNewMeeting({ ...newMeeting, scheduledAt: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (min)</Label>
                      <Select
                        value={newMeeting.duration.toString()}
                        onValueChange={(v) => setNewMeeting({ ...newMeeting, duration: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Record Meeting</Label>
                      <p className="text-xs text-muted-foreground">Save recording for later</p>
                    </div>
                    <Switch
                      checked={newMeeting.isRecorded}
                      onCheckedChange={(v) => setNewMeeting({ ...newMeeting, isRecorded: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Waiting Room</Label>
                      <p className="text-xs text-muted-foreground">Admit participants manually</p>
                    </div>
                    <Switch
                      checked={newMeeting.waitingRoomEnabled}
                      onCheckedChange={(v) => setNewMeeting({ ...newMeeting, waitingRoomEnabled: v })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewMeetingDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateMeeting} disabled={createMeeting.isPending}>
                    {createMeeting.isPending ? "Creating..." : "Schedule Meeting"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{meetingStats?.upcoming || 0}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Video className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{meetingStats?.completed || 0}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{meetingStats?.totalMinutes || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadCount?.totalUnread || 0}</p>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        {/* Live Ticker and Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <LiveTicker department="meetings" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList>
              <TabsTrigger value="meetings">
                <Video className="w-4 h-4 mr-2" />
                Meetings
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
                {unreadCount?.totalUnread ? (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount.totalUnread}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>

            {/* Meetings Tab */}
            <TabsContent value="meetings" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Meetings */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Upcoming Meetings</CardTitle>
                    <CardDescription>Your scheduled video calls</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingMeetings && upcomingMeetings.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingMeetings.map((meeting) => (
                          <div
                            key={meeting.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Video className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{meeting.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(meeting.scheduledAt)} • {meeting.duration} min
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Host: {meeting.hostName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={statusColors[meeting.status]}>
                                {meeting.status.replace("_", " ")}
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setActiveMeetingId(meeting.id);
                                  joinMeeting.mutate({ id: meeting.id });
                                }}
                              >
                                Join
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No upcoming meetings</p>
                        <Button
                          variant="link"
                          onClick={() => setShowNewMeetingDialog(true)}
                        >
                          Schedule your first meeting
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setShowNewMeetingDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => {
                        createMeeting.mutate({
                          title: "Instant Meeting",
                          scheduledAt: new Date().toISOString(),
                          duration: 60,
                        });
                      }}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Start Instant Meeting
                    </Button>
                    <Separator />
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Video Provider</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Currently using Daily.co for video meetings
                      </p>
                      <Badge variant="outline">Daily.co</Badge>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Teams Integration</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Microsoft Teams integration available
                      </p>
                      <Button variant="outline" size="sm" disabled>
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* All Meetings List */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>All Meetings</CardTitle>
                    <CardDescription>Complete meeting history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {meetingsList?.meetings && meetingsList.meetings.length > 0 ? (
                      <div className="space-y-2">
                        {meetingsList.meetings.map((meeting) => (
                          <div
                            key={meeting.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Badge className={statusColors[meeting.status]}>
                                {meeting.status.replace("_", " ")}
                              </Badge>
                              <div>
                                <h4 className="font-medium">{meeting.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(meeting.scheduledAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${window.location.origin}/meetings/${meeting.id}`
                                  );
                                  toast.success("Meeting link copied");
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveMeetingId(meeting.id)}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">
                        No meetings found
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="mt-4 h-[calc(100vh-400px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                {/* Chat List */}
                <Card className="lg:col-span-1 flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Conversations</CardTitle>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search chats..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[400px]">
                      {chatsList?.chats && chatsList.chats.length > 0 ? (
                        <div className="space-y-1 p-2">
                          {chatsList.chats.map((chat) => (
                            <button
                              key={chat.id}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                                activeChatId === chat.id
                                  ? "bg-primary/10"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => setActiveChatId(chat.id)}
                            >
                              <Avatar>
                                <AvatarFallback>
                                  {getInitials(chat.displayName || chat.name || "?")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium truncate">
                                    {chat.displayName || chat.name}
                                  </h4>
                                  {chat.unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-2">
                                      {chat.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {chat.lastMessagePreview || "No messages yet"}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No conversations yet</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Chat Window */}
                <Card 
                  className="lg:col-span-2 flex flex-col relative"
                  ref={chatAreaRef}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {/* Drag overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg z-50 flex items-center justify-center">
                      <div className="text-center">
                        <Paperclip className="w-12 h-12 mx-auto mb-2 text-primary" />
                        <p className="text-lg font-medium text-primary">Drop files here</p>
                        <p className="text-sm text-muted-foreground">Files will be shared in this chat</p>
                      </div>
                    </div>
                  )}
                  {activeChatId && activeChat ? (
                    <>
                      <CardHeader className="pb-2 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(activeChat.name || "Chat")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">
                                {activeChat.name || "Direct Message"}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {activeChat.participants.length} participants
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Video className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-[300px] p-4">
                          <div className="space-y-4">
                            {activeChat.messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex gap-3 ${
                                  message.contentType === "system"
                                    ? "justify-center"
                                    : ""
                                }`}
                              >
                                {message.contentType === "system" ? (
                                  <p className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                    {message.content}
                                  </p>
                                ) : (
                                  <>
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback className="text-xs">
                                        {getInitials(message.senderName || "?")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 group">
                                      {/* Reply context if this is a reply */}
                                      {message.replyToId && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 pl-2 border-l-2 border-muted">
                                          <CornerDownRight className="w-3 h-3" />
                                          <span>Replying to a message</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                          {message.senderName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {formatTime(message.createdAt)}
                                        </span>
                                        {message.isEdited && (
                                          <span className="text-xs text-muted-foreground">
                                            (edited)
                                          </span>
                                        )}
                                        {/* Reply button - appears on hover */}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => handleReply(message)}
                                        >
                                          <Reply className="w-3 h-3 mr-1" />
                                          Reply
                                        </Button>
                                      </div>
                                      <p className={`text-sm ${
                                        message.isDeleted ? "text-muted-foreground italic" : ""
                                      }`}>
                                        {message.content}
                                      </p>
                                      {/* Thread indicator if message has replies */}
                                      {replyCounts?.counts[message.id] && replyCounts.counts[message.id] > 0 && (
                                        <button
                                          className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                          onClick={() => handleViewThread(message.id)}
                                        >
                                          <MessageCircle className="w-3 h-3" />
                                          {replyCounts.counts[message.id]} {replyCounts.counts[message.id] === 1 ? 'reply' : 'replies'}
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        </ScrollArea>
                      </CardContent>
                      <div className="p-4 border-t">
                        {/* Typing indicator */}
                        {typingUsers.size > 0 && (
                          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <span className="flex gap-0.5">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                            <span>
                              {Array.from(typingUsers.values()).map(u => u.userName).join(', ')}
                              {typingUsers.size === 1 ? ' is' : ' are'} typing...
                            </span>
                          </div>
                        )}
                        {/* Connection status */}
                        {connectionError && (
                          <div className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {connectionError}
                          </div>
                        )}
                        {/* Reply preview */}
                        {replyingTo && (
                          <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded-md">
                            <div className="flex-1 border-l-2 border-primary pl-2">
                              <p className="text-xs font-medium text-primary">
                                Replying to {replyingTo.senderName || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {replyingTo.content}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setReplyingTo(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <Input
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => {
                              setMessageInput(e.target.value);
                              if (e.target.value) startTyping();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                stopTyping();
                                handleSendMessage();
                              }
                            }}
                            onBlur={stopTyping}
                          />
                          <Button variant="ghost" size="sm">
                            <Smile className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim() || sendMessage.isPending}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="font-medium mb-2">Select a conversation</h3>
                        <p className="text-sm">
                          Choose a chat from the list to start messaging
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Thread View Dialog */}
      <Dialog open={showThreadView} onOpenChange={setShowThreadView}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Thread
            </DialogTitle>
            <DialogDescription>
              View and reply to this conversation thread
            </DialogDescription>
          </DialogHeader>
          {threadData && (
            <div className="space-y-4">
              {/* Parent message */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Original message</p>
                <p className="text-sm">{threadData.parentMessage.content}</p>
              </div>
              
              {/* Replies */}
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {threadData.replies.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No replies yet. Be the first to reply!
                    </p>
                  ) : (
                    threadData.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(reply.senderName || "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{reply.senderName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              {/* Reply input */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Input
                  placeholder="Reply to thread..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && messageInput.trim() && activeChatId) {
                      e.preventDefault();
                      sendMessage.mutate({
                        chatId: activeChatId,
                        content: messageInput.trim(),
                        replyToId: threadParentId || undefined,
                      }, {
                        onSuccess: () => {
                          setMessageInput("");
                          refetchThread();
                        },
                      });
                    }
                  }}
                />
                <Button
                  size="sm"
                  disabled={!messageInput.trim() || sendMessage.isPending}
                  onClick={() => {
                    if (messageInput.trim() && activeChatId) {
                      sendMessage.mutate({
                        chatId: activeChatId,
                        content: messageInput.trim(),
                        replyToId: threadParentId || undefined,
                      }, {
                        onSuccess: () => {
                          setMessageInput("");
                          refetchThread();
                        },
                      });
                    }
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
