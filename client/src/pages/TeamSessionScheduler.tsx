import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Gamepad2,
  Trophy,
  Swords,
  GraduationCap,
  Coffee,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const EVENT_TYPES = [
  { value: "team_battle", label: "Team Battle", icon: Swords, description: "Department vs Department competition" },
  { value: "house_championship", label: "House Championship", icon: Trophy, description: "House vs House competition" },
  { value: "laws_tournament", label: "L.A.W.S. Tournament", icon: Trophy, description: "System-wide competition" },
  { value: "training_session", label: "Training Session", icon: GraduationCap, description: "Skill building and onboarding" },
  { value: "casual_play", label: "Casual Play", icon: Coffee, description: "Informal team bonding" },
];

const GAMES = [
  { slug: "tic-tac-toe", name: "Tic Tac Toe" },
  { slug: "connect-four", name: "Connect Four" },
  { slug: "chess", name: "Chess" },
  { slug: "checkers", name: "Checkers" },
  { slug: "battleship", name: "Battleship" },
  { slug: "memory-match", name: "Memory Match" },
  { slug: "sudoku", name: "Sudoku" },
  { slug: "word-search", name: "Word Search" },
  { slug: "hangman", name: "Hangman" },
  { slug: "2048", name: "2048" },
];

export default function TeamSessionScheduler() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<string>("");
  const [gameSlug, setGameSlug] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>();
  const [isRequired, setIsRequired] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState("");

  const { data: upcomingEvents, refetch } = trpc.employeeGaming.getUpcomingEvents.useQuery({ limit: 20 });
  
  const createEventMutation = trpc.employeeGaming.createEvent.useMutation({
    onSuccess: () => {
      toast.success("Team event created!");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventType("");
    setGameSlug("");
    setScheduledDate("");
    setScheduledTime("");
    setDurationMinutes(60);
    setMaxParticipants(undefined);
    setIsRequired(false);
    setIsRecurring(false);
    setRecurrencePattern("");
  };

  const handleCreateEvent = () => {
    if (!title || !eventType || !scheduledDate || !scheduledTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const scheduledStart = `${scheduledDate}T${scheduledTime}:00`;
    
    createEventMutation.mutate({
      title,
      description: description || undefined,
      gameSlug: gameSlug || undefined,
      scheduledStart,
      durationMinutes,
      eventType: eventType as any,
      maxParticipants,
      isRequired,
      isRecurring,
      recurrencePattern: recurrencePattern || undefined,
    });
  };

  const getEventTypeIcon = (type: string) => {
    const eventType = EVENT_TYPES.find(e => e.value === type);
    if (eventType) {
      const Icon = eventType.icon;
      return <Icon className="w-5 h-5" />;
    }
    return <Calendar className="w-5 h-5" />;
  };

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "team_battle": return <Badge className="bg-blue-500">Team Battle</Badge>;
      case "house_championship": return <Badge className="bg-purple-500">House Championship</Badge>;
      case "laws_tournament": return <Badge className="bg-yellow-500 text-yellow-950">Tournament</Badge>;
      case "training_session": return <Badge className="bg-green-500">Training</Badge>;
      case "casual_play": return <Badge variant="secondary">Casual</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Team Session Scheduler</h1>
            <p className="text-muted-foreground">
              Schedule and manage team building gaming events
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Team Gaming Event</DialogTitle>
                <DialogDescription>
                  Schedule a new team building gaming session
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Event Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Friday Team Battle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the event..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Event Type */}
                <div className="space-y-2">
                  <Label>Event Type *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {EVENT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setEventType(type.value)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          eventType === type.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <type.icon className="w-5 h-5" />
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Game Selection */}
                <div className="space-y-2">
                  <Label htmlFor="game">Game (Optional)</Label>
                  <Select value={gameSlug} onValueChange={setGameSlug}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any game" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any game</SelectItem>
                      {GAMES.map((game) => (
                        <SelectItem key={game.slug} value={game.slug}>
                          {game.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={String(durationMinutes)} onValueChange={(v) => setDurationMinutes(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Participants */}
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants (Optional)</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="No limit"
                    value={maxParticipants || ""}
                    onChange={(e) => setMaxParticipants(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                {/* Required Attendance */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label htmlFor="required" className="cursor-pointer">Required Attendance</Label>
                    <p className="text-xs text-muted-foreground">
                      Mark this event as mandatory for employees
                    </p>
                  </div>
                  <Switch
                    id="required"
                    checked={isRequired}
                    onCheckedChange={setIsRequired}
                  />
                </div>

                {/* Recurring */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label htmlFor="recurring" className="cursor-pointer">Recurring Event</Label>
                    <p className="text-xs text-muted-foreground">
                      Repeat this event on a schedule
                    </p>
                  </div>
                  <Switch
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                </div>

                {isRecurring && (
                  <div className="space-y-2">
                    <Label htmlFor="recurrence">Recurrence Pattern</Label>
                    <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} disabled={createEventMutation.isPending}>
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar View */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="grid gap-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            {getEventTypeIcon(event.eventType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              {getEventTypeBadge(event.eventType)}
                              {event.isRequired && (
                                <Badge variant="destructive">Required</Badge>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-muted-foreground mt-1">
                                {event.description}
                              </p>
                            )}
                            <div className="flex items-center gap-6 mt-3 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {new Date(event.scheduledStart).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                {new Date(event.scheduledStart).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {" - "}
                                {new Date(event.scheduledEnd).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                {event.participantCount} attending
                                {event.maxParticipants && ` / ${event.maxParticipants} max`}
                              </span>
                              {event.gameSlug && (
                                <span className="flex items-center gap-1">
                                  <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                                  {GAMES.find(g => g.slug === event.gameSlug)?.name || event.gameSlug}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {event.userRsvpStatus === "accepted" ? (
                            <Badge className="bg-green-500">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Attending
                            </Badge>
                          ) : event.userRsvpStatus === "declined" ? (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Declined
                            </Badge>
                          ) : event.userRsvpStatus === "tentative" ? (
                            <Badge variant="secondary">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Tentative
                            </Badge>
                          ) : (
                            <Badge variant="outline">No RSVP</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Upcoming Events</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a team gaming event to get started
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  Visual calendar coming soon
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Full calendar integration in development
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Past Events</CardTitle>
                <CardDescription>
                  Review completed team gaming sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Past events will appear here after completion
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
