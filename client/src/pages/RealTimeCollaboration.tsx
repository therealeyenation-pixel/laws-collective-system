import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  MessageSquare,
  FileText,
  CheckSquare,
  Table,
  FormInput,
  Send,
  Check,
  Clock,
  Eye,
  Edit3,
  Trash2,
  MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  realTimeCollaborationService,
  CollaborationSession,
  Collaborator,
  Comment,
  DocumentChange
} from "@/services/realTimeCollaborationService";

const DOCUMENT_TYPES = [
  { value: 'document', label: 'Document', icon: <FileText className="w-4 h-4" /> },
  { value: 'task', label: 'Task', icon: <CheckSquare className="w-4 h-4" /> },
  { value: 'spreadsheet', label: 'Spreadsheet', icon: <Table className="w-4 h-4" /> },
  { value: 'form', label: 'Form', icon: <FormInput className="w-4 h-4" /> }
];

export default function RealTimeCollaborationPage() {
  const { user } = useAuth();
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [changes, setChanges] = useState<DocumentChange[]>([]);
  const [newComment, setNewComment] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [documentType, setDocumentType] = useState<'document' | 'task' | 'spreadsheet' | 'form'>('document');

  useEffect(() => {
    // Set up presence listener
    const unsubscribe = realTimeCollaborationService.onPresenceChange((collabs) => {
      setCollaborators(collabs);
    });

    return () => {
      unsubscribe();
      if (user?.id) {
        realTimeCollaborationService.leaveSession(user.id.toString());
      }
    };
  }, [user]);

  const handleJoinSession = () => {
    if (!documentId || !user) {
      toast.error("Please enter a document ID");
      return;
    }

    const newSession = realTimeCollaborationService.joinSession(
      documentId,
      documentType,
      user.id.toString(),
      user.name || 'Unknown User'
    );
    setSession(newSession);
    setCollaborators(newSession.collaborators);
    setComments(realTimeCollaborationService.getComments(newSession.id));
    setChanges(realTimeCollaborationService.getRecentChanges(newSession.id));
    toast.success("Joined collaboration session");
  };

  const handleLeaveSession = () => {
    if (user?.id) {
      realTimeCollaborationService.leaveSession(user.id.toString());
      setSession(null);
      setCollaborators([]);
      setComments([]);
      setChanges([]);
      toast.info("Left collaboration session");
    }
  };

  const handleAddComment = () => {
    if (!session || !newComment.trim() || !user) return;

    const comment = realTimeCollaborationService.addComment({
      sessionId: session.id,
      userId: user.id.toString(),
      userName: user.name || 'Unknown',
      content: newComment
    });
    setComments([comment, ...comments]);
    setNewComment('');
    toast.success("Comment added");
  };

  const handleResolveComment = (commentId: string) => {
    realTimeCollaborationService.resolveComment(commentId);
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, resolved: true } : c
    ));
  };

  const handleSimulateChange = () => {
    if (!session || !user) return;

    const change = realTimeCollaborationService.broadcastChange({
      sessionId: session.id,
      userId: user.id.toString(),
      userName: user.name || 'Unknown',
      type: 'update',
      path: '/content/paragraph/1',
      value: 'Updated text content',
      previousValue: 'Original text'
    });
    setChanges([change, ...changes]);
  };

  const stats = realTimeCollaborationService.getCollaborationStats();

  const getStatusColor = (status: Collaborator['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Real-Time Collaboration</h1>
            <p className="text-muted-foreground mt-1">
              Collaborate with team members in real-time on documents and tasks
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeSessions}</p>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCollaborators}</p>
                  <p className="text-sm text-muted-foreground">Collaborators</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalChanges}</p>
                  <p className="text-sm text-muted-foreground">Total Changes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalComments}</p>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unresolvedComments}</p>
                  <p className="text-sm text-muted-foreground">Unresolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!session ? (
          /* Join Session */
          <Card>
            <CardHeader>
              <CardTitle>Join Collaboration Session</CardTitle>
              <CardDescription>
                Enter a document ID to start collaborating with your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Document ID</Label>
                  <Input
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="e.g., doc_12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <div className="flex gap-2">
                    {DOCUMENT_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant={documentType === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDocumentType(type.value as any)}
                      >
                        {type.icon}
                        <span className="ml-1">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleJoinSession} className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Join Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Active Session */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {DOCUMENT_TYPES.find(t => t.value === session.documentType)?.icon}
                      {session.documentId}
                    </CardTitle>
                    <CardDescription>
                      Session started {session.createdAt.toLocaleString()}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleLeaveSession}>
                    Leave Session
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="editor">
                  <TabsList>
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="changes">Changes ({changes.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="editor" className="mt-4">
                    {/* Simulated Editor Area */}
                    <div className="border rounded-lg p-4 min-h-[300px] bg-muted/20 relative">
                      <Textarea
                        className="w-full h-[250px] resize-none"
                        placeholder="Start typing to collaborate..."
                      />
                      
                      {/* Presence Cursors */}
                      {collaborators.filter(c => c.userId !== user?.id?.toString() && c.cursor).map((collab) => (
                        <div
                          key={collab.id}
                          className="absolute pointer-events-none"
                          style={{
                            left: collab.cursor?.x || 0,
                            top: collab.cursor?.y || 0
                          }}
                        >
                          <div 
                            className="w-0.5 h-5"
                            style={{ backgroundColor: collab.color }}
                          />
                          <div 
                            className="text-xs px-1 rounded text-white"
                            style={{ backgroundColor: collab.color }}
                          >
                            {collab.userName}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button onClick={handleSimulateChange}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Simulate Change
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="changes" className="mt-4">
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-2">
                        {changes.map((change) => (
                          <div key={change.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {change.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{change.userName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {change.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Changed <code className="bg-muted px-1 rounded">{change.path}</code>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {change.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {changes.length === 0 && (
                          <div className="text-center text-muted-foreground py-8">
                            No changes recorded yet
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Collaborators */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Collaborators ({collaborators.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {collaborators.map((collab) => (
                      <div key={collab.id} className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8" style={{ borderColor: collab.color, borderWidth: 2 }}>
                            <AvatarFallback style={{ backgroundColor: collab.color + '20' }}>
                              {collab.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div 
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(collab.status)}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {collab.userName}
                            {collab.userId === user?.id?.toString() && (
                              <span className="text-muted-foreground ml-1">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {collab.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Comments ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add Comment */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <Button size="icon" onClick={handleAddComment}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  <ScrollArea className="h-[250px]">
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div 
                          key={comment.id} 
                          className={`p-3 rounded-lg ${comment.resolved ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted/50'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {comment.userName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{comment.userName}</span>
                            </div>
                            {!comment.resolved && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleResolveComment(comment.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm mt-2">{comment.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {comment.createdAt.toLocaleString()}
                            </span>
                            {comment.resolved && (
                              <Badge variant="outline" className="text-xs text-green-600">
                                Resolved
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                          No comments yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
