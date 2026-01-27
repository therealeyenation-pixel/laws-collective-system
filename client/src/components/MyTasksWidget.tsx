import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { 
  FileText, FileSignature, Clock, AlertCircle, CheckCircle, 
  Loader2, ChevronRight, Bell, Calendar, ExternalLink
} from "lucide-react";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { Link } from "wouter";

interface MyTasksWidgetProps {
  compact?: boolean;
  maxItems?: number;
}

export function MyTasksWidget({ compact = false, maxItems = 5 }: MyTasksWidgetProps) {
  const [activeTab, setActiveTab] = useState<"all" | "articles" | "signatures">("all");

  // Queries
  const { data: assignedArticles, isLoading: loadingArticles } = 
    trpc.articleSignature.getMyAssignedArticles.useQuery({ status: "pending" });

  const { data: signatureRequests, isLoading: loadingSignatures } = 
    trpc.articleSignature.getMySignatureRequests.useQuery({ type: "received" });

  const { data: notificationCounts } = 
    trpc.assignmentNotifications.getNotificationCounts.useQuery();

  const isLoading = loadingArticles || loadingSignatures;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-500 bg-red-500/10";
      case "high": return "text-orange-500 bg-orange-500/10";
      case "normal": return "text-blue-500 bg-blue-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const getDueDateLabel = (dueDate: Date | string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    
    if (isPast(date) && !isToday(date)) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
    }
    if (isToday(date)) {
      return <Badge className="bg-orange-500 text-xs">Due Today</Badge>;
    }
    if (isTomorrow(date)) {
      return <Badge className="bg-yellow-500 text-xs">Due Tomorrow</Badge>;
    }
    return <span className="text-xs text-muted-foreground">{formatDistanceToNow(date, { addSuffix: true })}</span>;
  };

  const pendingArticles = assignedArticles?.filter((a: any) => 
    a.assignment.status === "pending" || a.assignment.status === "in_progress"
  ) || [];

  const pendingSignatures = (signatureRequests as any[])?.filter((s: any) => 
    s.signer?.status === "pending" || s.signer?.status === "notified" || s.signer?.status === "viewed"
  ) || [];

  const allTasks = [
    ...pendingArticles.map((a: any) => ({
      type: "article" as const,
      id: a.assignment.id,
      title: a.article.title,
      priority: a.assignment.priority,
      dueDate: a.assignment.dueDate,
      status: a.assignment.status,
      createdAt: a.assignment.createdAt,
    })),
    ...pendingSignatures.map((s: any) => ({
      type: "signature" as const,
      id: s.signer?.id || s.request?.id,
      title: s.request?.documentTitle || "Document",
      priority: "normal",
      dueDate: s.request?.expiresAt,
      status: s.signer?.status || "pending",
      createdAt: s.request?.createdAt,
    })),
  ].sort((a, b) => {
    // Sort by priority first, then by due date
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
    if (aPriority !== bPriority) return aPriority - bPriority;
    
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  const displayTasks = activeTab === "all" 
    ? allTasks 
    : activeTab === "articles" 
      ? allTasks.filter(t => t.type === "article")
      : allTasks.filter(t => t.type === "signature");

  const limitedTasks = displayTasks.slice(0, maxItems);

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4" />
              My Tasks
            </CardTitle>
            {notificationCounts && notificationCounts.total > 0 && (
              <Badge variant="destructive" className="text-xs">
                {notificationCounts.total}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : allTasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>All caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {limitedTasks.map((task, idx) => (
                <div 
                  key={`${task.type}-${task.id}-${idx}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className={`p-1.5 rounded ${getPriorityColor(task.priority)}`}>
                    {task.type === "article" ? (
                      <FileText className="w-3.5 h-3.5" />
                    ) : (
                      <FileSignature className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2">
                      {getDueDateLabel(task.dueDate)}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
              {allTasks.length > maxItems && (
                <Link href="/my-tasks">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View all {allTasks.length} tasks
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              My Tasks
            </CardTitle>
            <CardDescription>
              Articles to read and documents to sign
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {notificationCounts && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="gap-1">
                  <FileText className="w-3 h-3" />
                  {notificationCounts.articles}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <FileSignature className="w-3 h-3" />
                  {notificationCounts.signatures}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">
              All ({allTasks.length})
            </TabsTrigger>
            <TabsTrigger value="articles">
              Articles ({pendingArticles.length})
            </TabsTrigger>
            <TabsTrigger value="signatures">
              Signatures ({pendingSignatures.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : displayTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending tasks</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {displayTasks.map((task, idx) => (
                    <div 
                      key={`${task.type}-${task.id}-${idx}`}
                      className="flex items-start gap-4 p-3 rounded-lg border hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)}`}>
                        {task.type === "article" ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <FileSignature className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {task.type === "article" ? "Article to read" : "Document to sign"}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`capitalize ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {getDueDateLabel(task.dueDate)}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {task.createdAt && formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default MyTasksWidget;
