import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Send,
  Eye,
  BarChart3,
  ArrowUpDown,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { LazyStreamdown } from "@/components/LazyStreamdown";

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  in_progress: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  resolved: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  needs_review: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  open: <Clock className="w-3.5 h-3.5" />,
  in_progress: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  resolved: <CheckCircle2 className="w-3.5 h-3.5" />,
  needs_review: <AlertTriangle className="w-3.5 h-3.5" />,
  closed: <XCircle className="w-3.5 h-3.5" />,
};

export default function AdminSupportLog() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [closeOnReply, setCloseOnReply] = useState(false);

  // Queries
  const { data: stats } = trpc.supportTickets.adminStats.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "owner",
  });

  const { data: ticketList, refetch: refetchList } = trpc.supportTickets.adminList.useQuery(
    {
      status: statusFilter as any,
      priority: priorityFilter as any,
      limit: 50,
    },
    { enabled: user?.role === "admin" || user?.role === "owner" }
  );

  const { data: ticketDetail, refetch: refetchDetail } = trpc.supportTickets.getMessages.useQuery(
    { ticketId: selectedTicketId || 0 },
    { enabled: !!selectedTicketId }
  );

  // Mutations
  const adminReply = trpc.supportTickets.adminReply.useMutation({
    onSuccess: () => {
      toast.success(closeOnReply ? "Reply sent and ticket closed" : "Reply sent");
      setAdminReplyText("");
      setCloseOnReply(false);
      refetchDetail();
      refetchList();
    },
    onError: (error) => toast.error(error.message),
  });

  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="w-6 h-6 text-orange-600" />
          Support Log
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor escalated support tickets and AI Support Agent resolutions
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Total</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Open</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
            <p className="text-[10px] text-muted-foreground uppercase">In Progress</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.needsReview}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Needs Review</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Resolved</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Closed</p>
          </Card>
          <Card className="p-3 text-center border-red-200 dark:border-red-800">
            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Critical</p>
          </Card>
          <Card className="p-3 text-center border-orange-200 dark:border-orange-800">
            <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
            <p className="text-[10px] text-muted-foreground uppercase">High</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="needs_review">Needs Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          {ticketList?.total || 0} tickets
        </span>
      </div>

      {/* Ticket List */}
      <div className="space-y-2">
        {!ticketList?.tickets?.length ? (
          <Card className="p-12 text-center">
            <Wrench className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No support tickets found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tickets appear here when members escalate from Q&A agents
            </p>
          </Card>
        ) : (
          ticketList.tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setSelectedTicketId(ticket.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {statusIcons[ticket.status] || <Clock className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{ticket.subject}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[ticket.status]}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>#{ticket.id}</span>
                    <span>{(ticket as any).userName || (ticket as any).userEmail || `User #${ticket.userId}`}</span>
                    <span>from {ticket.sourceAgentType}</span>
                    {ticket.category && <span className="capitalize">{ticket.category}</span>}
                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              Ticket #{selectedTicketId}
              {ticketDetail?.ticket && (
                <>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[ticketDetail.ticket.priority]}`}>
                    {ticketDetail.ticket.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ticketDetail.ticket.status]}`}>
                    {ticketDetail.ticket.status.replace("_", " ")}
                  </span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {ticketDetail && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Ticket metadata */}
              <div className="text-xs text-muted-foreground space-y-1 pb-3 border-b">
                <p><strong>Subject:</strong> {ticketDetail.ticket.subject}</p>
                <p><strong>Source:</strong> {ticketDetail.ticket.sourceAgentType} agent</p>
                {ticketDetail.ticket.sourcePage && (
                  <p><strong>Page:</strong> {ticketDetail.ticket.sourcePage}</p>
                )}
                {ticketDetail.ticket.category && (
                  <p><strong>Category:</strong> {ticketDetail.ticket.category}</p>
                )}
                <p><strong>Created:</strong> {new Date(ticketDetail.ticket.createdAt).toLocaleString()}</p>
                {ticketDetail.ticket.resolvedAt && (
                  <p><strong>Resolved:</strong> {new Date(ticketDetail.ticket.resolvedAt).toLocaleString()}</p>
                )}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 py-3">
                <div className="space-y-3">
                  {ticketDetail.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" :
                        msg.role === "system" ? "justify-center" : "justify-start"
                      }`}
                    >
                      {msg.role === "system" ? (
                        <div className="max-w-[90%] bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground italic">
                          {msg.content}
                        </div>
                      ) : (
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <div>
                              <p className="text-[10px] font-medium text-orange-600 mb-1 flex items-center gap-1">
                                <Wrench className="w-2.5 h-2.5" /> AI Support Agent
                              </p>
                              <LazyStreamdown>{msg.content}</LazyStreamdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Admin reply */}
              {ticketDetail.ticket.status !== "closed" && (
                <div className="pt-3 border-t space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Admin Response</p>
                  <div className="flex gap-2">
                    <Input
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="Add a note or resolution..."
                      className="flex-1 h-9 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && adminReplyText.trim() && selectedTicketId) {
                          e.preventDefault();
                          adminReply.mutate({
                            ticketId: selectedTicketId,
                            message: adminReplyText,
                            closeTicket: closeOnReply,
                          });
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (selectedTicketId && adminReplyText.trim()) {
                          adminReply.mutate({
                            ticketId: selectedTicketId,
                            message: adminReplyText,
                            closeTicket: closeOnReply,
                          });
                        }
                      }}
                      disabled={!adminReplyText.trim() || adminReply.isPending}
                      size="sm"
                      className="gap-1"
                    >
                      {adminReply.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Send
                    </Button>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={closeOnReply}
                      onChange={(e) => setCloseOnReply(e.target.checked)}
                      className="rounded"
                    />
                    Close ticket after sending
                  </label>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
