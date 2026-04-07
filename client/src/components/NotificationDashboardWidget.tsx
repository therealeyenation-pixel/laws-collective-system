import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  X,
  RefreshCw,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "alert" | "broadcast" | "collaboration" | "system";
  title: string;
  body: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string[];
  severity?: "low" | "normal" | "high" | "critical";
  actionable: boolean;
}

interface CollaborationEvent {
  userId: string;
  userName: string;
  action: "joined" | "acknowledged" | "resolved";
  timestamp: Date;
}

export function NotificationDashboardWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [collaborationEvents, setCollaborationEvents] = useState<
    CollaborationEvent[]
  >([]);
  const [filter, setFilter] = useState<"all" | "unacknowledged" | "critical">(
    "all"
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedNotification, setExpandedNotification] = useState<
    string | null
  >(null);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In production, use WebSocket or tRPC subscription
      // For now, simulate with mock data
      const mockNotification: Notification = {
        id: `notif_${Date.now()}`,
        type: "alert",
        title: "System Alert",
        body: "Health check completed successfully",
        timestamp: new Date(),
        acknowledged: false,
        severity: "normal",
        actionable: false,
      };

      // Randomly add notifications (1 in 5 chance)
      if (Math.random() > 0.8) {
        setNotifications((prev) => [mockNotification, ...prev].slice(0, 20));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const acknowledgeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? {
              ...n,
              acknowledged: true,
              acknowledgedBy: ["Current User"],
            }
          : n
      )
    );
    toast.success("Notification acknowledged");
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
    toast.success("All notifications dismissed");
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unacknowledged") return !n.acknowledged;
    if (filter === "critical") return n.severity === "critical";
    return true;
  });

  const unacknowledgedCount = notifications.filter(
    (n) => !n.acknowledged
  ).length;
  const criticalCount = notifications.filter(
    (n) => n.severity === "critical"
  ).length;

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="w-4 h-4" />;
      case "broadcast":
        return <Bell className="w-4 h-4" />;
      case "collaboration":
        return <Users className="w-4 h-4" />;
      case "system":
        return <Zap className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{notifications.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Unacknowledged</div>
          <div className="text-2xl font-bold text-yellow-600">
            {unacknowledgedCount}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Critical</div>
          <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Active Users</div>
          <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === "unacknowledged" ? "default" : "outline"}
            onClick={() => setFilter("unacknowledged")}
          >
            Unacknowledged ({unacknowledgedCount})
          </Button>
          <Button
            size="sm"
            variant={filter === "critical" ? "default" : "outline"}
            onClick={() => setFilter("critical")}
          >
            Critical ({criticalCount})
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50" : ""}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            {autoRefresh ? "Live" : "Paused"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={dismissAll}
            disabled={notifications.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-muted-foreground">
              {filter === "all"
                ? "No notifications"
                : `No ${filter} notifications`}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-3 cursor-pointer transition-all ${
                expandedNotification === notification.id
                  ? "ring-2 ring-blue-500"
                  : "hover:shadow-md"
              } ${notification.acknowledged ? "opacity-75" : ""}`}
              onClick={() =>
                setExpandedNotification(
                  expandedNotification === notification.id
                    ? null
                    : notification.id
                )
              }
            >
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground mt-1">
                  {getTypeIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">
                      {notification.title}
                    </h4>
                    {notification.severity && (
                      <Badge
                        className={`text-xs ${getSeverityColor(
                          notification.severity
                        )}`}
                      >
                        {notification.severity}
                      </Badge>
                    )}
                    {notification.acknowledged && (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.body}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>

                  {expandedNotification === notification.id && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {notification.acknowledgedBy && (
                        <div>
                          <p className="text-xs font-semibold mb-1">
                            Acknowledged by:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {notification.acknowledgedBy.map((user) => (
                              <Badge key={user} variant="secondary">
                                {user}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {notification.actionable && !notification.acknowledged && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              acknowledgeNotification(notification.id);
                            }}
                            className="flex-1"
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notification.id);
                  }}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Recent Activity */}
      {collaborationEvents.length > 0 && (
        <Card className="p-3">
          <h4 className="font-semibold text-sm mb-2">Recent Activity</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {collaborationEvents.slice(0, 5).map((event, idx) => (
              <div key={idx} className="text-xs text-muted-foreground">
                <span className="font-medium">{event.userName}</span>{" "}
                {event.action} at{" "}
                {event.timestamp.toLocaleTimeString()}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
