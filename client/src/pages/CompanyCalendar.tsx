import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CompanyCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: coreHours } = trpc.companyCalendar.getCoreHours.useQuery();
  const { data: events } = trpc.companyCalendar.getEvents.useQuery();
  const { data: attendanceSummary } = trpc.companyCalendar.getAttendanceSummary.useQuery();

  const createEvent = trpc.companyCalendar.createEvent.useMutation({
    onSuccess: () => {
      toast.success("Event created successfully");
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const checkIn = trpc.companyCalendar.checkIn.useMutation({
    onSuccess: () => {
      toast.success("Checked in successfully");
    },
  });

  // Generate calendar days for the month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(selectedDate);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      team_meeting: "bg-blue-100 text-blue-800",
      department_meeting: "bg-purple-100 text-purple-800",
      all_hands: "bg-green-100 text-green-800",
      training: "bg-yellow-100 text-yellow-800",
      planning: "bg-orange-100 text-orange-800",
      one_on_one: "bg-pink-100 text-pink-800",
      external: "bg-gray-100 text-gray-800",
      other: "bg-slate-100 text-slate-800",
    };
    return colors[type] || colors.other;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Company Calendar</h1>
            <p className="text-muted-foreground mt-1">
              Schedule meetings and track attendance
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createEvent.mutate({
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    eventType: formData.get("eventType") as any,
                    startTime: formData.get("startTime") as string,
                    endTime: formData.get("endTime") as string,
                    location: formData.get("location") as string,
                    meetingLink: formData.get("meetingLink") as string,
                    isMandatory: formData.get("isMandatory") === "true",
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select name="eventType" defaultValue="team_meeting">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team_meeting">Team Meeting</SelectItem>
                      <SelectItem value="department_meeting">Department Meeting</SelectItem>
                      <SelectItem value="all_hands">All Hands</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="planning">Planning Session</SelectItem>
                      <SelectItem value="one_on_one">One-on-One</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" name="startTime" type="datetime-local" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" name="endTime" type="datetime-local" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingLink">Meeting Link (Zoom/Teams)</Label>
                  <Input id="meetingLink" name="meetingLink" placeholder="https://zoom.us/j/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" defaultValue="Remote" />
                </div>
                <input type="hidden" name="isMandatory" value="true" />
                <Button type="submit" className="w-full" disabled={createEvent.isPending}>
                  {createEvent.isPending ? "Creating..." : "Create Event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Core Hours Banner */}
        {coreHours && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    Startup Phase Meeting Schedule
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {coreHours.coreHours.weekdays.days.join(", ")} {coreHours.coreHours.weekdays.startTime} - {coreHours.coreHours.weekdays.endTime} CT | 
                    {" "}{coreHours.coreHours.weekend.day} {coreHours.coreHours.weekend.startTime} - {coreHours.coreHours.weekend.endTime} CT
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <CardTitle>
                    {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                  </CardTitle>
                  <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                  >
                    Month
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                  {/* Calendar days */}
                  {days.map((day, index) => (
                    <div
                      key={index}
                      className={`min-h-[100px] border rounded-md p-1 ${
                        day ? "bg-background hover:bg-accent/50 cursor-pointer" : "bg-muted/30"
                      } ${
                        day?.toDateString() === new Date().toDateString()
                          ? "border-primary border-2"
                          : ""
                      }`}
                    >
                      {day && (
                        <>
                          <div className="text-sm font-medium">{day.getDate()}</div>
                          {/* Show events for this day */}
                          {events?.filter((event) => {
                            const eventDate = new Date(event.startTime);
                            return eventDate.toDateString() === day.toDateString();
                          }).slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded mt-1 truncate ${getEventTypeColor(event.eventType)}`}
                            >
                              {event.title}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Events */}
          <TabsContent value="upcoming" className="mt-6">
            <div className="space-y-4">
              {events?.map((event) => (
                <Card key={event.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(event.startTime).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.attendeeCount} attendees
                            </span>
                            {event.meetingLink && (
                              <a
                                href={event.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <Video className="w-4 h-4" />
                                Join Meeting
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getEventTypeColor(event.eventType)}>
                          {event.eventType.replace("_", " ")}
                        </Badge>
                        {event.isMandatory && (
                          <Badge variant="destructive">Mandatory</Badge>
                        )}
                        <Button
                          size="sm"
                          onClick={() => checkIn.mutate({ eventId: event.id })}
                        >
                          Check In
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Attendance Report */}
          <TabsContent value="attendance" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{attendanceSummary?.overallRate || 0}%</p>
                      <p className="text-sm text-muted-foreground">Overall Attendance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{attendanceSummary?.employees?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Team Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{events?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Scheduled Meetings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Team Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-center py-3 px-4">Attended</th>
                        <th className="text-center py-3 px-4">Total</th>
                        <th className="text-center py-3 px-4">Rate</th>
                        <th className="text-center py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceSummary?.employees?.map((employee) => (
                        <tr key={employee.userId} className="border-b">
                          <td className="py-3 px-4 font-medium">{employee.name}</td>
                          <td className="text-center py-3 px-4">{employee.meetingsAttended}</td>
                          <td className="text-center py-3 px-4">{employee.meetingsTotal}</td>
                          <td className="text-center py-3 px-4">{employee.attendanceRate}%</td>
                          <td className="text-center py-3 px-4">
                            {employee.attendanceRate >= 90 ? (
                              <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                            ) : employee.attendanceRate >= 75 ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
