import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Video,
  Plus,
  Calendar,
  Users,
  Clock,
  PlayCircle,
  StopCircle,
  UserPlus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function Conference() {
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);

  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("10");

  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionStart, setSessionStart] = useState("");
  const [sessionEnd, setSessionEnd] = useState("");

  const { data: rooms, refetch: refetchRooms } = trpc.conference.getRooms.useQuery();
  const { data: upcomingSessions } = trpc.conference.getUpcomingSessions.useQuery();
  const { data: sessionParticipants } = trpc.conference.getParticipants.useQuery(
    { sessionId: selectedSession || 0 },
    { enabled: !!selectedSession }
  );

  const { mutate: createRoom, isPending: isCreatingRoom } = trpc.conference.createRoom.useMutation({
    onSuccess: () => {
      toast.success("Conference room created");
      setShowRoomForm(false);
      setRoomName("");
      setRoomDescription("");
      setRoomCapacity("10");
      refetchRooms();
    },
    onError: (error) => {
      toast.error(`Failed to create room: ${error.message}`);
    },
  });

  const { mutate: scheduleSession, isPending: isScheduling } = trpc.conference.scheduleSession.useMutation({
    onSuccess: () => {
      toast.success("Conference session scheduled");
      setShowSessionForm(false);
      setSessionTitle("");
      setSessionDescription("");
      setSessionTopic("");
      setSessionStart("");
      setSessionEnd("");
      refetchRooms();
    },
    onError: (error) => {
      toast.error(`Failed to schedule session: ${error.message}`);
    },
  });

  const { mutate: startSession } = trpc.conference.startSession.useMutation({
    onSuccess: () => {
      toast.success("Conference session started");
      refetchRooms();
    },
    onError: (error) => {
      toast.error(`Failed to start session: ${error.message}`);
    },
  });

  const { mutate: endSession } = trpc.conference.endSession.useMutation({
    onSuccess: () => {
      toast.success("Conference session ended");
      refetchRooms();
    },
    onError: (error) => {
      toast.error(`Failed to end session: ${error.message}`);
    },
  });

  const handleCreateRoom = () => {
    if (!roomName.trim() || !roomCapacity) {
      toast.error("Please fill in room name and capacity");
      return;
    }
    createRoom({
      name: roomName,
      description: roomDescription,
      capacity: parseInt(roomCapacity),
    });
  };

  const handleScheduleSession = () => {
    if (!selectedRoom || !sessionTitle.trim() || !sessionStart || !sessionEnd) {
      toast.error("Please fill in all required fields");
      return;
    }
    scheduleSession({
      roomId: selectedRoom,
      title: sessionTitle,
      description: sessionDescription,
      topic: sessionTopic,
      startTime: new Date(sessionStart),
      endTime: new Date(sessionEnd),
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Conference Rooms</h1>
            </div>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => setShowRoomForm(true)}
            >
              <Plus className="w-5 h-5" />
              Create Room
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Create Room Form */}
        {showRoomForm && (
          <Card className="mb-8 p-6 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Create Conference Room</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Room Name
                </label>
                <Input
                  placeholder="e.g., Board Room A"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Room description..."
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg min-h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Capacity
                </label>
                <Input
                  type="number"
                  placeholder="Number of participants"
                  value={roomCapacity}
                  onChange={(e) => setRoomCapacity(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleCreateRoom}
                  disabled={isCreatingRoom}
                >
                  {isCreatingRoom ? "Creating..." : "Create Room"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRoomForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Conference Rooms */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Available Rooms</h2>
          {rooms && rooms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card key={room.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground text-lg">{room.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(room.status)}`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{room.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Users className="w-4 h-4" />
                    Capacity: {room.capacity}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedRoom(room.id);
                      setShowSessionForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Session
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No conference rooms yet</p>
            </Card>
          )}
        </div>

        {/* Schedule Session Form */}
        {showSessionForm && selectedRoom && (
          <Card className="mb-8 p-6 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Schedule Conference Session</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Session Title
                </label>
                <Input
                  placeholder="e.g., Q4 Board Meeting"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Topic
                </label>
                <Input
                  placeholder="Main topic"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Session description..."
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg min-h-20"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={sessionStart}
                    onChange={(e) => setSessionStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={sessionEnd}
                    onChange={(e) => setSessionEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleScheduleSession}
                  disabled={isScheduling}
                >
                  {isScheduling ? "Scheduling..." : "Schedule Session"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowSessionForm(false);
                    setSelectedRoom(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Upcoming Sessions */}
        {upcomingSessions && upcomingSessions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming Sessions</h2>
            <div className="space-y-3">
              {upcomingSessions.map((item: any) => {
                const session = item.conference_sessions;
                return (
                  <Card key={session.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-lg">{session.title}</h3>
                        <p className="text-sm text-muted-foreground">{session.topic}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(session.status)}`}>
                        {session.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.startTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(session.startTime).toLocaleTimeString()} -{" "}
                        {new Date(session.endTime).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {session.status === "scheduled" && (
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => startSession({ sessionId: session.id })}
                        >
                          <PlayCircle className="w-4 h-4" />
                          Start
                        </Button>
                      )}
                      {session.status === "active" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => endSession({ sessionId: session.id })}
                        >
                          <StopCircle className="w-4 h-4" />
                          End
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => setSelectedSession(session.id)}
                      >
                        <Users className="w-4 h-4" />
                        Participants
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
