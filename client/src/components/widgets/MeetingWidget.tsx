import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Link } from "wouter";

interface MeetingWidgetProps {
  entityType: "house" | "trust" | "business";
  entityId: number;
  entityName?: string;
  limit?: number;
  showCreateButton?: boolean;
}

export function MeetingWidget({
  entityType,
  entityId,
  entityName,
  limit = 5,
  showCreateButton = true,
}: MeetingWidgetProps) {
  const getMeetingsQuery = () => {
    if (entityType === "house") {
      return trpc.meetings.getHouseMeetings.useQuery({ houseId: entityId, limit });
    } else if (entityType === "trust") {
      return trpc.meetings.getTrustMeetings.useQuery({ trustId: entityId, limit });
    } else {
      return trpc.meetings.getBusinessMeetings.useQuery({ businessId: entityId, limit });
    }
  };

  const { data: meetings, isLoading } = getMeetingsQuery();

  const getStatusBadge = (status: string, scheduledAt: Date) => {
    const now = new Date();
    const meetingTime = new Date(scheduledAt);
    
    if (status === "completed") {
      return <Badge variant="secondary">Completed</Badge>;
    } else if (status === "in_progress") {
      return <Badge className="bg-green-500">Live</Badge>;
    } else if (meetingTime < now) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else {
      return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Video className="h-5 w-5" />
          Upcoming Meetings
        </CardTitle>
        {showCreateButton && (
          <Link
            href={`/meetings?create=true&entityType=${entityType}&entityId=${entityId}&entityName=${encodeURIComponent(entityName || "")}`}
          >
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="h-4 w-4" />
              Schedule
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !meetings || meetings.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No upcoming meetings</p>
            {showCreateButton && (
              <Link
                href={`/meetings?create=true&entityType=${entityType}&entityId=${entityId}`}
              >
                <Button variant="link" className="mt-2">
                  Schedule a meeting
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting: any) => (
              <Link key={meeting.id} href={`/meetings?id=${meeting.id}`}>
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{meeting.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(meeting.scheduledAt), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(meeting.scheduledAt), "h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(meeting.status, meeting.scheduledAt)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {meeting.maxParticipants || 10}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            <Link href={`/meetings?entityType=${entityType}&entityId=${entityId}`}>
              <Button variant="ghost" className="w-full mt-2">
                View All Meetings
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MeetingWidget;
