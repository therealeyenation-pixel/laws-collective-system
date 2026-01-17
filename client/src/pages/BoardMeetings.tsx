import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Users,
  FileText,
  Vote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Download,
  Eye,
  Gavel,
} from "lucide-react";
import { toast } from "sonner";

// Board members with voting rights
const BOARD_MEMBERS = [
  { id: 1, name: "Shanna Russell", role: "Founder", department: "Business", hasVote: true, attendance: 100 },
  { id: 2, name: "Amber", role: "Board Member", department: "Health", hasVote: true, attendance: 90 },
  { id: 3, name: "Essence", role: "Board Member", department: "Design, IT", hasVote: true, attendance: 85 },
  { id: 4, name: "Amandes", role: "Board Member", department: "Media", hasVote: true, attendance: 95 },
  { id: 5, name: "Craig", role: "Board Member", department: "Finance", hasVote: true, attendance: 88 },
  { id: 6, name: "Cornelius", role: "Education/Training Manager", department: "Education, Training, Legal, Justice", hasVote: true, attendance: 92 },
  { id: 7, name: "Twin Sister", role: "Honorary Advisor", department: "Sweet Miracles (Partner)", hasVote: false, attendance: 75 },
];

// Mock meetings data
const MOCK_MEETINGS = [
  {
    id: 1,
    title: "Q1 2026 Strategic Planning",
    date: "2026-01-20",
    time: "10:00 AM",
    status: "scheduled",
    type: "quarterly",
    attendees: [1, 2, 3, 4, 5, 6, 7],
    agenda: ["Financial Review", "Department Updates", "New Initiatives", "Partner Programs"],
    location: "Virtual - Zoom",
  },
  {
    id: 2,
    title: "Emergency Budget Review",
    date: "2026-01-10",
    time: "2:00 PM",
    status: "completed",
    type: "emergency",
    attendees: [1, 2, 5, 6],
    agenda: ["Budget Reallocation", "Grant Funding Update"],
    location: "Virtual - Zoom",
    minutes: "Approved reallocation of $5,000 from reserves to Outreach programs.",
  },
  {
    id: 3,
    title: "Monthly Operations Review",
    date: "2026-01-05",
    time: "11:00 AM",
    status: "completed",
    type: "monthly",
    attendees: [1, 2, 3, 4, 5, 6],
    agenda: ["Operations Update", "Hiring Decisions", "Policy Review"],
    location: "Virtual - Zoom",
    minutes: "Approved hiring for Operations & Administration position. Reviewed DBA status.",
  },
];

// Mock voting records
const MOCK_VOTES = [
  {
    id: 1,
    meetingId: 2,
    motion: "Approve $5,000 reallocation from reserves to Outreach programs",
    proposedBy: "Craig",
    secondedBy: "Amber",
    votesFor: 4,
    votesAgainst: 0,
    abstentions: 0,
    result: "passed",
    date: "2026-01-10",
    voters: [
      { memberId: 1, vote: "for" },
      { memberId: 2, vote: "for" },
      { memberId: 5, vote: "for" },
      { memberId: 6, vote: "for" },
    ],
  },
  {
    id: 2,
    meetingId: 3,
    motion: "Approve hiring for Operations & Administration Manager position",
    proposedBy: "Shanna Russell",
    secondedBy: "Essence",
    votesFor: 5,
    votesAgainst: 0,
    abstentions: 1,
    result: "passed",
    date: "2026-01-05",
    voters: [
      { memberId: 1, vote: "for" },
      { memberId: 2, vote: "for" },
      { memberId: 3, vote: "for" },
      { memberId: 4, vote: "abstain" },
      { memberId: 5, vote: "for" },
      { memberId: 6, vote: "for" },
    ],
  },
  {
    id: 3,
    meetingId: 3,
    motion: "Approve Sweet Miracles NPO as Strategic Outreach Partner",
    proposedBy: "Shanna Russell",
    secondedBy: "Cornelius",
    votesFor: 6,
    votesAgainst: 0,
    abstentions: 0,
    result: "passed",
    date: "2026-01-05",
    voters: [
      { memberId: 1, vote: "for" },
      { memberId: 2, vote: "for" },
      { memberId: 3, vote: "for" },
      { memberId: 4, vote: "for" },
      { memberId: 5, vote: "for" },
      { memberId: 6, vote: "for" },
    ],
    note: "Member #7 (Sweet Miracles representative) recused from vote due to conflict of interest",
  },
];

export default function BoardMeetings() {
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [showNewVote, setShowNewVote] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<typeof MOCK_MEETINGS[0] | null>(null);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    type: "monthly",
    location: "Virtual - Zoom",
    agenda: "",
  });

  const upcomingMeetings = MOCK_MEETINGS.filter(m => m.status === "scheduled");
  const pastMeetings = MOCK_MEETINGS.filter(m => m.status === "completed");

  const handleCreateMeeting = () => {
    toast.success("Meeting scheduled successfully");
    setShowNewMeeting(false);
    setNewMeeting({ title: "", date: "", time: "", type: "monthly", location: "Virtual - Zoom", agenda: "" });
  };

  const handleExportMinutes = (meetingId: number) => {
    toast.success("Meeting minutes exported to PDF");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVoteResultBadge = (result: string) => {
    switch (result) {
      case "passed":
        return <Badge className="bg-green-600">Passed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "tabled":
        return <Badge variant="secondary">Tabled</Badge>;
      default:
        return <Badge variant="outline">{result}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Board Meetings</h1>
            <p className="text-muted-foreground mt-1">
              Governance meetings, voting records, and decision tracking
            </p>
          </div>
          <Dialog open={showNewMeeting} onOpenChange={setShowNewMeeting}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Board Meeting</DialogTitle>
                <DialogDescription>
                  Create a new board meeting with agenda items
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Meeting Title</Label>
                  <Input
                    placeholder="e.g., Q1 Strategic Planning"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newMeeting.time}
                      onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Meeting Type</Label>
                  <Select
                    value={newMeeting.type}
                    onValueChange={(v) => setNewMeeting({ ...newMeeting, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Operations</SelectItem>
                      <SelectItem value="quarterly">Quarterly Review</SelectItem>
                      <SelectItem value="annual">Annual Meeting</SelectItem>
                      <SelectItem value="emergency">Emergency Session</SelectItem>
                      <SelectItem value="special">Special Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Virtual - Zoom"
                    value={newMeeting.location}
                    onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Agenda Items (one per line)</Label>
                  <Textarea
                    placeholder="Financial Review&#10;Department Updates&#10;New Business"
                    value={newMeeting.agenda}
                    onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewMeeting(false)}>Cancel</Button>
                <Button onClick={handleCreateMeeting}>Schedule Meeting</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Board Members</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{BOARD_MEMBERS.filter(m => m.hasVote).length}</div>
              <p className="text-xs text-muted-foreground">
                +1 Honorary Advisor (non-voting)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
              <p className="text-xs text-muted-foreground">
                Next: {upcomingMeetings[0]?.date || "None scheduled"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Votes This Year</CardTitle>
              <Vote className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_VOTES.length}</div>
              <p className="text-xs text-muted-foreground">
                {MOCK_VOTES.filter(v => v.result === "passed").length} passed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(BOARD_MEMBERS.reduce((sum, m) => sum + m.attendance, 0) / BOARD_MEMBERS.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Voting members</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="meetings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="votes">Voting Records</TabsTrigger>
            <TabsTrigger value="members">Board Members</TabsTrigger>
          </TabsList>

          <TabsContent value="meetings">
            <div className="space-y-4">
              {/* Upcoming Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>Scheduled board meetings requiring attendance</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingMeetings.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Meeting</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Attendees</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingMeetings.map((meeting) => (
                          <TableRow key={meeting.id}>
                            <TableCell className="font-medium">{meeting.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {meeting.date} at {meeting.time}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{meeting.type}</Badge>
                            </TableCell>
                            <TableCell>{meeting.location}</TableCell>
                            <TableCell>{meeting.attendees.length} invited</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedMeeting(meeting)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No upcoming meetings scheduled</p>
                  )}
                </CardContent>
              </Card>

              {/* Past Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle>Past Meetings</CardTitle>
                  <CardDescription>Completed meetings with minutes and decisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Meeting</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Decisions</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastMeetings.map((meeting) => (
                        <TableRow key={meeting.id}>
                          <TableCell className="font-medium">{meeting.title}</TableCell>
                          <TableCell>{meeting.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{meeting.type}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(meeting.status)}</TableCell>
                          <TableCell>
                            {MOCK_VOTES.filter(v => v.meetingId === meeting.id).length} votes recorded
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedMeeting(meeting)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleExportMinutes(meeting.id)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="votes">
            <Card>
              <CardHeader>
                <CardTitle>Voting Records</CardTitle>
                <CardDescription>All motions and their outcomes with vote counts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Motion</TableHead>
                      <TableHead>Proposed By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>For/Against/Abstain</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_VOTES.map((vote) => (
                      <TableRow key={vote.id}>
                        <TableCell className="font-medium max-w-xs">{vote.motion}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{vote.proposedBy}</div>
                            <div className="text-muted-foreground">2nd: {vote.secondedBy}</div>
                          </div>
                        </TableCell>
                        <TableCell>{vote.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-medium">{vote.votesFor}</span>
                            <span>/</span>
                            <span className="text-red-600 font-medium">{vote.votesAgainst}</span>
                            <span>/</span>
                            <span className="text-muted-foreground">{vote.abstentions}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getVoteResultBadge(vote.result)}</TableCell>
                        <TableCell className="max-w-xs text-sm text-muted-foreground">
                          {vote.note || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Board Members</CardTitle>
                <CardDescription>Current board composition and voting rights</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Voting Rights</TableHead>
                      <TableHead>Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {BOARD_MEMBERS.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          <Badge variant={member.role === "Founder" ? "default" : "outline"}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.department}</TableCell>
                        <TableCell>
                          {member.hasVote ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Yes</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <AlertCircle className="w-4 h-4" />
                              <span>Advisory Only</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${member.attendance}%` }}
                              />
                            </div>
                            <span className="text-sm">{member.attendance}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Gavel className="w-4 h-4" />
                    Governance Rules
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Founder maintains 60% minimum authority (Majority Control)</li>
                    <li>• All voting members have equal vote weight (1 vote each)</li>
                    <li>• Honorary Advisors may attend and speak but cannot vote</li>
                    <li>• Members must recuse from votes involving their affiliated entities</li>
                    <li>• Quorum requires majority of voting members present</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Meeting Detail Dialog */}
        <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedMeeting?.title}</DialogTitle>
              <DialogDescription>
                {selectedMeeting?.date} at {selectedMeeting?.time}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                {getStatusBadge(selectedMeeting?.status || "")}
                <Badge variant="outline">{selectedMeeting?.type}</Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p>{selectedMeeting?.location}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Agenda</Label>
                <ul className="list-disc list-inside mt-1">
                  {selectedMeeting?.agenda.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              {selectedMeeting?.minutes && (
                <div>
                  <Label className="text-muted-foreground">Minutes Summary</Label>
                  <p className="mt-1 text-sm">{selectedMeeting.minutes}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Attendees ({selectedMeeting?.attendees.length})</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMeeting?.attendees.map((id) => {
                    const member = BOARD_MEMBERS.find(m => m.id === id);
                    return member ? (
                      <Badge key={id} variant="secondary">{member.name}</Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
