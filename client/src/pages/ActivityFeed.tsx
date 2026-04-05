import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Activity, Bell, Search, Filter, RefreshCw, CheckCircle, Clock,
  Plus, Edit, Trash2, ThumbsUp, ThumbsDown, UserPlus, MessageSquare,
  Upload, Download, Share2, LogIn, DollarSign, ArrowRightLeft, Flag,
  AlertTriangle, Settings, Eye, EyeOff, BarChart3, Users, TrendingUp
} from "lucide-react";
import {
  activityFeedService,
  Activity as ActivityItem,
  ActivityFilter,
  ActivityGroup,
  ActivityStats,
  ACTIVITY_MODULES,
  ACTIVITY_TYPE_CONFIG,
  ActivityType,
} from "@/services/activityFeedService";

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  Plus: <Plus className="w-4 h-4" />,
  Edit: <Edit className="w-4 h-4" />,
  Trash2: <Trash2 className="w-4 h-4" />,
  CheckCircle: <CheckCircle className="w-4 h-4" />,
  ThumbsUp: <ThumbsUp className="w-4 h-4" />,
  ThumbsDown: <ThumbsDown className="w-4 h-4" />,
  UserPlus: <UserPlus className="w-4 h-4" />,
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  Upload: <Upload className="w-4 h-4" />,
  Download: <Download className="w-4 h-4" />,
  Share2: <Share2 className="w-4 h-4" />,
  LogIn: <LogIn className="w-4 h-4" />,
  DollarSign: <DollarSign className="w-4 h-4" />,
  ArrowRightLeft: <ArrowRightLeft className="w-4 h-4" />,
  Flag: <Flag className="w-4 h-4" />,
  AlertTriangle: <AlertTriangle className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [groupedActivities, setGroupedActivities] = useState<ActivityGroup[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'grouped'>('timeline');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [filter, setFilter] = useState<ActivityFilter>({
    modules: [],
    types: [],
    importance: [],
    search: '',
    unreadOnly: false,
  });

  useEffect(() => {
    loadData();
    
    // Subscribe to updates
    const unsubscribe = activityFeedService.subscribe(() => {
      loadData();
    });

    return () => {
      unsubscribe();
      activityFeedService.stopPolling();
    };
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      activityFeedService.startPolling(30000);
    } else {
      activityFeedService.stopPolling();
    }
  }, [autoRefresh]);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = () => {
    setActivities(activityFeedService.getActivities(filter));
    setGroupedActivities(activityFeedService.getGroupedActivities(filter));
    setStats(activityFeedService.getStats());
    setLoading(false);
  };

  const handleMarkAsRead = (activityId: string) => {
    activityFeedService.markAsRead(activityId);
    loadData();
  };

  const handleMarkAllAsRead = () => {
    activityFeedService.markAllAsRead();
    toast.success("All activities marked as read");
    loadData();
  };

  const toggleModuleFilter = (moduleId: string) => {
    setFilter(prev => ({
      ...prev,
      modules: prev.modules?.includes(moduleId)
        ? prev.modules.filter(m => m !== moduleId)
        : [...(prev.modules || []), moduleId],
    }));
  };

  const toggleTypeFilter = (type: ActivityType) => {
    setFilter(prev => ({
      ...prev,
      types: prev.types?.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...(prev.types || []), type],
    }));
  };

  const getImportanceBadge = (importance: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      low: { variant: "secondary", className: "" },
      medium: { variant: "outline", className: "" },
      high: { variant: "default", className: "bg-amber-500" },
      critical: { variant: "destructive", className: "" },
    };
    return config[importance] || config.low;
  };

  const renderActivityItem = (activity: ActivityItem) => {
    const typeConfig = ACTIVITY_TYPE_CONFIG[activity.type];
    const icon = iconMap[typeConfig.icon] || <Activity className="w-4 h-4" />;
    
    return (
      <div
        key={activity.id}
        className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
          activity.isRead ? 'bg-muted/30' : 'bg-muted/70 border-l-4 border-l-primary'
        }`}
        onClick={() => !activity.isRead && handleMarkAsRead(activity.id)}
      >
        <Avatar className="w-10 h-10">
          <AvatarFallback className={`bg-${typeConfig.color}-100 text-${typeConfig.color}-600`}>
            {activity.userName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{activity.userName}</span>
            <Badge variant="outline" className="gap-1 text-xs">
              {icon}
              {typeConfig.label}
            </Badge>
            {!activity.isRead && (
              <Badge variant="default" className="text-xs">New</Badge>
            )}
          </div>
          
          <p className="text-sm text-foreground">{activity.description}</p>
          
          {activity.entityName && (
            <p className="text-sm text-muted-foreground mt-1">
              → {activity.entityName}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activityFeedService.formatRelativeTime(activity.timestamp)}
            </span>
            <Badge variant="secondary" className="text-xs">
              {ACTIVITY_MODULES.find(m => m.id === activity.module)?.name || activity.module}
            </Badge>
            <Badge {...getImportanceBadge(activity.importance)} className="text-xs">
              {activity.importance}
            </Badge>
          </div>
        </div>
        
        {!activity.isRead && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead(activity.id);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activity Feed</h1>
            <p className="text-muted-foreground mt-1">
              Real-time activity stream across all modules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="auto-refresh"
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            </div>
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today</p>
                    <p className="text-2xl font-bold">{stats.totalToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold">{stats.totalThisWeek}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unread</p>
                    <p className="text-2xl font-bold">{stats.unreadCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Most Active</p>
                    <p className="text-lg font-bold truncate">
                      {stats.mostActiveUsers[0]?.userName || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {(filter.modules?.length || filter.types?.length) ? (
                  <Badge variant="secondary" className="ml-1">
                    {(filter.modules?.length || 0) + (filter.types?.length || 0)}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Modules</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ACTIVITY_MODULES.map(module => (
                      <Badge
                        key={module.id}
                        variant={filter.modules?.includes(module.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleModuleFilter(module.id)}
                      >
                        {module.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Activity Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(ACTIVITY_TYPE_CONFIG).slice(0, 8).map(([type, config]) => (
                      <Badge
                        key={type}
                        variant={filter.types?.includes(type as ActivityType) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTypeFilter(type as ActivityType)}
                      >
                        {config.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filter.unreadOnly}
                    onCheckedChange={(c) => setFilter({ ...filter, unreadOnly: !!c })}
                    id="unread-only"
                  />
                  <Label htmlFor="unread-only" className="text-sm cursor-pointer">
                    Unread only
                  </Label>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setFilter({ modules: [], types: [], importance: [], search: '', unreadOnly: false })}
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              className="rounded-r-none"
            >
              Timeline
            </Button>
            <Button
              variant={viewMode === 'grouped' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grouped')}
              className="rounded-l-none"
            >
              Grouped
            </Button>
          </div>
        </div>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Stream</CardTitle>
            <CardDescription>
              {activities.length} activities {filter.unreadOnly ? '(unread only)' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {viewMode === 'timeline' ? (
                <div className="space-y-3">
                  {activities.length > 0 ? (
                    activities.map(renderActivityItem)
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No activities match your filters</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedActivities.length > 0 ? (
                    groupedActivities.map(group => (
                      <div key={group.date}>
                        <div className="sticky top-0 bg-background py-2 mb-3">
                          <h3 className="text-sm font-semibold text-muted-foreground">
                            {group.date === new Date().toDateString() ? 'Today' :
                             group.date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' :
                             group.date}
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {group.activities.map(renderActivityItem)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No activities match your filters</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
