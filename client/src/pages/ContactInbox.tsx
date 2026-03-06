import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Archive,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Reply,
  MoreVertical,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactInbox() {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const { data: submissions = [], isLoading, refetch } = trpc.contact.getSubmissions.useQuery({
    status: undefined,
    limit: 100,
  });

  const { data: stats } = trpc.contact.getStats.useQuery();

  const updateStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const deleteSubmissionMutation = trpc.contact.deleteSubmission.useMutation({
    onSuccess: () => {
      toast.success("Submission deleted");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete submission");
    },
  });

  const handleMarkAsRead = (id: number) => {
    updateStatusMutation.mutate({
      submissionId: id,
      status: "read",
    });
  };

  const handleMarkAsReplied = (id: number) => {
    updateStatusMutation.mutate({
      submissionId: id,
      status: "replied",
    });
    setIsReplying(false);
    setReplyMessage("");
  };

  const handleArchive = (id: number) => {
    updateStatusMutation.mutate({
      submissionId: id,
      status: "archived",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this submission?")) {
      deleteSubmissionMutation.mutate({ submissionId: id });
    }
  };

  const handleReply = (submission: any) => {
    setSelectedSubmission(submission);
    setIsReplying(true);
  };

  const filteredSubmissions = submissions.filter((s: any) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-yellow-100 text-yellow-800";
      case "replied":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="w-4 h-4" />;
      case "read":
        return <Clock className="w-4 h-4" />;
      case "replied":
        return <CheckCircle className="w-4 h-4" />;
      case "archived":
        return <Archive className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Contact Submissions</h1>
          <p className="text-muted-foreground">Manage and respond to contact form submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-bold text-foreground">{stats?.new || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Read</p>
                <p className="text-2xl font-bold text-foreground">{stats?.read || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Replied</p>
                <p className="text-2xl font-bold text-foreground">{stats?.replied || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats?.total || 0}</p>
              </div>
              <Mail className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, subject, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-8 text-center text-muted-foreground">
              Loading submissions...
            </Card>
          ) : filteredSubmissions.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No submissions found
            </Card>
          ) : (
            filteredSubmissions.map((submission: any) => (
              <Card
                key={submission.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedSubmission(submission);
                  setIsDetailOpen(true);
                  if (submission.status === "new") {
                    handleMarkAsRead(submission.id);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{submission.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{submission.email}</p>
                    {submission.phone && (
                      <p className="text-sm text-muted-foreground mb-1">{submission.phone}</p>
                    )}
                    <p className="text-sm font-medium text-foreground mb-2">{submission.subject}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{submission.message}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReply(submission);
                      }}
                    >
                      <Reply className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchive(submission.id);
                      }}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(submission.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {new Date(submission.createdAt).toLocaleString()}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <p className="text-foreground">{selectedSubmission.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <p className="text-foreground">{selectedSubmission.email}</p>
              </div>
              {selectedSubmission.phone && (
                <div>
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <p className="text-foreground">{selectedSubmission.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">Subject</label>
                <p className="text-foreground">{selectedSubmission.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Message</label>
                <p className="text-foreground whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                  {getStatusIcon(selectedSubmission.status)}
                  {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Received</label>
                <p className="text-foreground">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplying} onOpenChange={setIsReplying}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {selectedSubmission?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">To</label>
              <p className="text-foreground">{selectedSubmission?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
              <Textarea
                placeholder="Type your reply here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReplying(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!replyMessage.trim()) {
                  toast.error("Reply message cannot be empty");
                  return;
                }
                handleMarkAsReplied(selectedSubmission.id);
                toast.success("Reply recorded. Note: Email sending is not yet configured.");
              }}
            >
              Mark as Replied
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
