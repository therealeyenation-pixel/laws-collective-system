import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  FileText, Users, Search, Send, Calendar, Clock, AlertCircle,
  CheckCircle, XCircle, Loader2, Plus, Filter, UserPlus, Mail
} from "lucide-react";
import { format } from "date-fns";

interface SelectedUser {
  id: number;
  name: string;
  email: string;
}

export default function ArticleAssignment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("published");

  // Queries
  const { data: articles, isLoading: loadingArticles } = trpc.articleSignature.listArticles.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });

  const { data: searchResults, isLoading: searchingUsers } = trpc.articleSignature.searchUsers.useQuery(
    { query: userSearchQuery, limit: 10 },
    { enabled: userSearchQuery.length >= 2 }
  );

  const { data: assignments, isLoading: loadingAssignments, refetch: refetchAssignments } = 
    trpc.articleSignature.getMyAssignedArticles.useQuery();

  // Mutations
  const assignMutation = trpc.articleSignature.assignArticle.useMutation({
    onSuccess: (result) => {
      toast.success(`Article assigned to ${result.count} user(s)`);
      setShowAssignDialog(false);
      setSelectedArticles([]);
      setSelectedUsers([]);
      setMessage("");
      setDueDate("");
      refetchAssignments();
    },
    onError: (error) => {
      toast.error(`Failed to assign: ${error.message}`);
    },
  });

  const handleSelectArticle = (articleId: number, checked: boolean) => {
    if (checked) {
      setSelectedArticles([...selectedArticles, articleId]);
    } else {
      setSelectedArticles(selectedArticles.filter(id => id !== articleId));
    }
  };

  const handleSelectAllArticles = (checked: boolean) => {
    if (checked && articles) {
      setSelectedArticles(articles.map(a => a.id));
    } else {
      setSelectedArticles([]);
    }
  };

  const handleAddUser = (user: { id: number; name: string; email: string }) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserSearchQuery("");
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleAssign = () => {
    if (selectedArticles.length === 0) {
      toast.error("Please select at least one article");
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    // Assign each article to all selected users
    selectedArticles.forEach(articleId => {
      assignMutation.mutate({
        articleId,
        assignedToUserIds: selectedUsers.map(u => u.id),
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        message: message || undefined,
      });
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-500">High</Badge>;
      case "normal":
        return <Badge variant="secondary">Normal</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "overdue":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredArticles = articles?.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Article Assignment</h1>
            <p className="text-muted-foreground">Assign articles to users for required reading</p>
          </div>
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button disabled={selectedArticles.length === 0}>
                <Send className="w-4 h-4 mr-2" />
                Assign Selected ({selectedArticles.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assign Articles</DialogTitle>
                <DialogDescription>
                  Assign {selectedArticles.length} article(s) to users for required reading
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* User Search */}
                <div className="space-y-2">
                  <Label>Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {searchingUsers && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </div>
                  )}
                  {searchResults && searchResults.length > 0 && (
                    <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                      {searchResults.map(user => (
                        <div
                          key={user.id}
                          className="p-2 hover:bg-secondary/50 cursor-pointer flex items-center justify-between"
                          onClick={() => handleAddUser(user)}
                        >
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <UserPlus className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Users ({selectedUsers.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map(user => (
                        <Badge key={user.id} variant="secondary" className="gap-1">
                          {user.name}
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            className="ml-1 hover:text-destructive"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label>Due Date (Optional)</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label>Message (Optional)</Label>
                  <Textarea
                    placeholder="Add a message for the assigned users..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssign} 
                  disabled={selectedUsers.length === 0 || assignMutation.isPending}
                >
                  {assignMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Assign & Notify
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Articles Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Available Articles
            </CardTitle>
            <CardDescription>
              Select articles to assign for required reading
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingArticles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredArticles && filteredArticles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedArticles.length === filteredArticles.length}
                        onCheckedChange={handleSelectAllArticles}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Read Time</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map(article => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedArticles.includes(article.id)}
                          onCheckedChange={(checked) => handleSelectArticle(article.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.category || "General"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={article.status === "published" ? "default" : "secondary"}>
                          {article.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {article.isRequired ? (
                          <Badge className="bg-red-500">Required</Badge>
                        ) : (
                          <span className="text-muted-foreground">Optional</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {article.estimatedReadTime ? `${article.estimatedReadTime} min` : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {article.createdAt ? format(new Date(article.createdAt), "MMM d, yyyy") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No articles found</p>
                <p className="text-sm">Create articles in the content management section</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Assignments
            </CardTitle>
            <CardDescription>
              Track assigned articles and their completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAssignments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : assignments && assignments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Assigned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((item: any) => (
                    <TableRow key={item.assignment.id}>
                      <TableCell className="font-medium">{item.article.title}</TableCell>
                      <TableCell>{getPriorityBadge(item.assignment.priority)}</TableCell>
                      <TableCell>{getStatusBadge(item.assignment.status)}</TableCell>
                      <TableCell>
                        {item.assignment.dueDate 
                          ? format(new Date(item.assignment.dueDate), "MMM d, yyyy")
                          : "-"
                        }
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.assignment.createdAt 
                          ? format(new Date(item.assignment.createdAt), "MMM d, yyyy")
                          : "-"
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No assignments yet</p>
                <p className="text-sm">Select articles above and assign them to users</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
