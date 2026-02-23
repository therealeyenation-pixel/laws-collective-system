import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  LogIn, 
  Crown, 
  MessageSquare, 
  Send,
  Play,
  Settings,
  RefreshCw,
  Clock,
  CheckCircle,
  Circle,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MultiplayerLobbyProps {
  gameType: "community-builder" | "laws-quest";
  onGameStart?: (roomId: string) => void;
}

export function MultiplayerLobby({ gameType, onGameStart }: MultiplayerLobbyProps) {
  const [activeTab, setActiveTab] = useState<"browse" | "create" | "room">("browse");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [lastMessageTime, setLastMessageTime] = useState(0);

  // Queries
  const { data: rooms, refetch: refetchRooms, isLoading: loadingRooms } = trpc.multiplayer.listRooms.useQuery(
    { gameType, status: "waiting" },
    { refetchInterval: 5000 }
  );

  const { data: currentRoom, refetch: refetchRoom } = trpc.multiplayer.getRoom.useQuery(
    { roomId: currentRoomId! },
    { enabled: !!currentRoomId, refetchInterval: 2000 }
  );

  const { data: messages } = trpc.multiplayer.getMessages.useQuery(
    { roomId: currentRoomId!, since: lastMessageTime },
    { enabled: !!currentRoomId, refetchInterval: 1000 }
  );

  // Mutations
  const createRoom = trpc.multiplayer.createRoom.useMutation({
    onSuccess: (data) => {
      setCurrentRoomId(data.room.id);
      setActiveTab("room");
      toast.success("Room created!");
    },
    onError: (error) => toast.error(error.message),
  });

  const joinRoom = trpc.multiplayer.joinRoom.useMutation({
    onSuccess: (data) => {
      setCurrentRoomId(data.room.id);
      setActiveTab("room");
      toast.success(data.message);
    },
    onError: (error) => toast.error(error.message),
  });

  const leaveRoom = trpc.multiplayer.leaveRoom.useMutation({
    onSuccess: () => {
      setCurrentRoomId(null);
      setActiveTab("browse");
      toast.success("Left room");
    },
    onError: (error) => toast.error(error.message),
  });

  const startGame = trpc.multiplayer.startGame.useMutation({
    onSuccess: (data) => {
      toast.success("Game started!");
      onGameStart?.(data.room.id);
    },
    onError: (error) => toast.error(error.message),
  });

  const sendMessage = trpc.multiplayer.sendMessage.useMutation({
    onSuccess: () => {
      setChatMessage("");
      refetchRoom();
    },
    onError: (error) => toast.error(error.message),
  });

  const heartbeat = trpc.multiplayer.heartbeat.useMutation();

  // Heartbeat to maintain connection
  useEffect(() => {
    if (!currentRoomId) return;
    
    const interval = setInterval(() => {
      heartbeat.mutate({ roomId: currentRoomId });
    }, 10000);

    return () => clearInterval(interval);
  }, [currentRoomId]);

  // Update last message time
  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestTime = Math.max(...messages.map(m => m.timestamp));
      if (latestTime > lastMessageTime) {
        setLastMessageTime(latestTime);
      }
    }
  }, [messages]);

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }
    createRoom.mutate({
      name: newRoomName,
      gameType,
      maxPlayers: 6,
      settings: {
        turnTimeLimit: 120,
        votingRequired: true,
        minPlayersToStart: 2,
      },
    });
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !currentRoomId) return;
    sendMessage.mutate({ roomId: currentRoomId, message: chatMessage });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "disconnected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Multiplayer Lobby
          <Badge variant="outline" className="ml-2">
            {gameType === "community-builder" ? "Community Builder" : "L.A.W.S. Quest"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse" disabled={!!currentRoomId}>
              Browse Rooms
            </TabsTrigger>
            <TabsTrigger value="create" disabled={!!currentRoomId}>
              Create Room
            </TabsTrigger>
            <TabsTrigger value="room" disabled={!currentRoomId}>
              Current Room
            </TabsTrigger>
          </TabsList>

          {/* Browse Rooms */}
          <TabsContent value="browse" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {rooms?.length || 0} rooms available
              </p>
              <Button variant="outline" size="sm" onClick={() => refetchRooms()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {loadingRooms ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : rooms && rooms.length > 0 ? (
              <div className="space-y-2">
                {rooms.map((room) => (
                  <Card key={room.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{room.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Host: {room.hostName} • {room.playerCount}/{room.maxPlayers} players
                        </p>
                      </div>
                      <Button 
                        onClick={() => joinRoom.mutate({ roomId: room.id })}
                        disabled={joinRoom.isPending}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No rooms available</p>
                <p className="text-sm">Create a new room to start playing!</p>
              </div>
            )}
          </TabsContent>

          {/* Create Room */}
          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Room Name</label>
                <Input
                  placeholder="Enter room name..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Players</label>
                  <p className="text-sm text-muted-foreground">6 players</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Turn Time Limit</label>
                  <p className="text-sm text-muted-foreground">2 minutes</p>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleCreateRoom}
                disabled={createRoom.isPending}
              >
                {createRoom.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Room
              </Button>
            </div>
          </TabsContent>

          {/* Current Room */}
          <TabsContent value="room" className="space-y-4">
            {currentRoom && (
              <>
                {/* Room Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{currentRoom.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentRoom.playerCount}/{currentRoom.maxPlayers} players • 
                      Status: {currentRoom.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {currentRoom.status === "waiting" && 
                     currentRoom.players.find(p => p.role === "host")?.id === currentRoom.hostId && (
                      <Button 
                        onClick={() => startGame.mutate({ roomId: currentRoomId! })}
                        disabled={currentRoom.playerCount < 2 || startGame.isPending}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Game
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => leaveRoom.mutate({ roomId: currentRoomId! })}
                    >
                      Leave Room
                    </Button>
                  </div>
                </div>

                {/* Players List */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Players</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="space-y-2">
                      {currentRoom.players.map((player) => (
                        <div key={player.id} className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {player.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span 
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(player.status)}`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium flex items-center gap-2">
                              {player.name}
                              {player.role === "host" && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {player.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Chat */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="h-48 overflow-y-auto space-y-2 mb-3 p-2 bg-muted/30 rounded">
                      {currentRoom.chat.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`text-sm ${msg.type === "system" ? "text-muted-foreground italic" : ""}`}
                        >
                          {msg.type !== "system" && (
                            <span className="font-medium">{msg.playerName}: </span>
                          )}
                          {msg.message}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button 
                        size="icon" 
                        onClick={handleSendMessage}
                        disabled={sendMessage.isPending}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Waiting Message */}
                {currentRoom.status === "waiting" && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    <p>Waiting for host to start the game...</p>
                    <p className="text-sm">
                      {currentRoom.playerCount < 2 
                        ? "Need at least 2 players to start" 
                        : "Ready to start!"}
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default MultiplayerLobby;
