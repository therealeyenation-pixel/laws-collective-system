import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home, ClipboardList, FileText, Users, DollarSign, Bell, Settings,
  ChevronRight, Plus, Search, Calendar, TrendingUp, CheckCircle,
  Clock, AlertTriangle, Menu, X, BarChart3, Briefcase, GraduationCap
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

interface TaskSummary {
  id: string;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

export default function MobileDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Quick actions for mobile
  const quickActions: QuickAction[] = [
    { id: "task", label: "New Task", icon: <Plus className="w-5 h-5" />, path: "/my-tasks", color: "bg-blue-500" },
    { id: "document", label: "Upload Doc", icon: <FileText className="w-5 h-5" />, path: "/document-vault", color: "bg-green-500" },
    { id: "expense", label: "Log Expense", icon: <DollarSign className="w-5 h-5" />, path: "/finance", color: "bg-purple-500" },
    { id: "meeting", label: "Schedule", icon: <Calendar className="w-5 h-5" />, path: "/company-calendar", color: "bg-orange-500" },
  ];

  // Sample task data
  const [tasks] = useState<TaskSummary[]>([
    { id: "1", title: "Review Q4 Budget Proposal", dueDate: "Today", priority: "high", status: "pending" },
    { id: "2", title: "Complete Training Module", dueDate: "Tomorrow", priority: "medium", status: "in_progress" },
    { id: "3", title: "Submit Expense Report", dueDate: "Jan 30", priority: "low", status: "pending" },
    { id: "4", title: "Team Performance Review", dueDate: "Jan 31", priority: "high", status: "pending" },
  ]);

  // Sample notifications
  const [notifications] = useState<NotificationItem[]>([
    { id: "1", title: "Task Assigned", message: "New task: Review contract draft", time: "5m ago", read: false, type: "info" },
    { id: "2", title: "Approval Required", message: "Budget request needs your approval", time: "1h ago", read: false, type: "warning" },
    { id: "3", title: "Task Completed", message: "Training module marked complete", time: "2h ago", read: true, type: "success" },
  ]);

  // Swipe gesture handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - next tab
      const tabs = ["overview", "tasks", "notifications"];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    }
    if (isRightSwipe) {
      // Swipe right - previous tab
      const tabs = ["overview", "tasks", "notifications"];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-500 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress": return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              Welcome, {user?.name || "User"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/global-search")}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Actions Floating Button */}
      <button
        onClick={() => setShowQuickActions(!showQuickActions)}
        className={cn(
          "fixed right-4 bottom-24 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all",
          showQuickActions ? "bg-red-500 rotate-45" : "bg-primary"
        )}
      >
        {showQuickActions ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Quick Actions Menu */}
      {showQuickActions && (
        <div className="fixed right-4 bottom-40 z-50 flex flex-col gap-3 items-end">
          {quickActions.map((action, index) => (
            <Link
              key={action.id}
              href={action.path}
              onClick={() => setShowQuickActions(false)}
              className="flex items-center gap-2 animate-in slide-in-from-right"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="bg-background shadow-md px-3 py-1 rounded-full text-sm font-medium">
                {action.label}
              </span>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", action.color)}>
                {action.icon}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Main Content with Swipe */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4" style={{ width: "calc(100% - 2rem)" }}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-4 space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80">Open Tasks</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <ClipboardList className="w-8 h-8 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80">Completed</p>
                      <p className="text-2xl font-bold">48</p>
                    </div>
                    <CheckCircle className="w-8 h-8 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80">Documents</p>
                      <p className="text-2xl font-bold">156</p>
                    </div>
                    <FileText className="w-8 h-8 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80">Approvals</p>
                      <p className="text-2xl font-bold">5</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Tasks Completed</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Training Progress</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Document Reviews</span>
                      <span>90%</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-4 gap-2">
                {[
                  { icon: <Briefcase className="w-5 h-5" />, label: "Business", path: "/business" },
                  { icon: <GraduationCap className="w-5 h-5" />, label: "Training", path: "/training-hub" },
                  { icon: <BarChart3 className="w-5 h-5" />, label: "Reports", path: "/reporting-center" },
                  { icon: <Users className="w-5 h-5" />, label: "Team", path: "/team-tasks" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.path}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">My Tasks</h2>
              <Link href="/my-tasks">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Card key={task.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(task.status)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                              {task.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Notifications</h2>
              <Button variant="ghost" size="sm">
                Mark All Read
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={cn(
                      "overflow-hidden transition-colors",
                      !notification.read && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          notification.type === "warning" ? "bg-yellow-500" :
                          notification.type === "success" ? "bg-green-500" : "bg-blue-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: <Home className="w-5 h-5" />, label: "Home", path: "/" },
            { icon: <ClipboardList className="w-5 h-5" />, label: "Tasks", path: "/my-tasks" },
            { icon: <FileText className="w-5 h-5" />, label: "Docs", path: "/document-vault" },
            { icon: <BarChart3 className="w-5 h-5" />, label: "Reports", path: "/reporting-center" },
            { icon: <Menu className="w-5 h-5" />, label: "More", path: "/dashboard" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className="flex flex-col items-center gap-1 px-3 py-1 text-muted-foreground hover:text-primary transition-colors"
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
