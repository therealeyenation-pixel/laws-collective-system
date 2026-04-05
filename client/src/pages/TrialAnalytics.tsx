import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  Users,
  Clock,
  Star,
  MessageSquare,
  TrendingUp,
  Eye,
  Search,
  Download,
  RefreshCw,
  Mail,
  Building2,
  Calendar,
  BarChart3,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export default function TrialAnalytics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch analytics data
  const { data: analytics, isLoading, refetch } = trpc.trial.getAnalytics.useQuery();
  const { data: users } = trpc.trial.listUsers.useQuery({ search: searchTerm });
  const { data: feedback } = trpc.trial.listFeedback.useQuery({});

  const navItems = [
    { label: "Overview", href: "/admin/trial-analytics", icon: BarChart3 },
    { label: "Users", href: "/admin/trial-analytics?tab=users", icon: Users },
    { label: "Feedback", href: "/admin/trial-analytics?tab=feedback", icon: MessageSquare },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Trial Analytics" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Trial Analytics" navItems={navItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Trial Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor trial user engagement and feedback
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Trial Users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analytics?.activeUsers || 0} active in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg. Session Time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round((analytics?.avgSessionDuration || 0) / 60)}m
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.totalSessions || 0} total sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Avg. Rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(analytics?.avgRating || 0).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.totalFeedback || 0} feedback items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Conversion Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {((analytics?.conversionRate || 0) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Trial to member conversion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="features">Feature Usage</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Top Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Explored Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.topFeatures?.map((feature: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{feature.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${(feature.count / (analytics?.topFeatures?.[0]?.count || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">
                            {feature.count}
                          </span>
                        </div>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground">No data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Signups */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Signups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.recentSignups?.map((user: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant="secondary">
                          {format(new Date(user.createdAt), "MMM d")}
                        </Badge>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground">No signups yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.recentFeedback?.map((item: any, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            item.feedbackType === "bug_report" ? "destructive" :
                            item.feedbackType === "suggestion" ? "default" :
                            "secondary"
                          }>
                            {item.feedbackType.replace("_", " ")}
                          </Badge>
                          {item.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{item.rating}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      {item.comment && (
                        <p className="text-sm text-muted-foreground">{item.comment}</p>
                      )}
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No feedback yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Signed Up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          {user.organization || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.totalSessions || 0}</TableCell>
                      <TableCell>
                        {Math.round((user.totalTimeSpentSeconds || 0) / 60)}m
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No trial users yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Follow-up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant={
                          item.feedbackType === "bug_report" ? "destructive" :
                          item.feedbackType === "suggestion" ? "default" :
                          "secondary"
                        }>
                          {item.feedbackType.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {item.rating}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.comment || "-"}
                      </TableCell>
                      <TableCell>{item.featureName || "-"}</TableCell>
                      <TableCell>{item.userName || "Anonymous"}</TableCell>
                      <TableCell>
                        {format(new Date(item.createdAt), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell>
                        {item.wantsResponse ? (
                          <Badge variant="outline">Requested</Badge>
                        ) : "-"}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No feedback yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Feature Usage Tab */}
          <TabsContent value="features" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics?.featureBreakdown?.map((feature: any, index: number) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{feature.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{feature.totalExplorations}</div>
                    <p className="text-xs text-muted-foreground">
                      {feature.uniqueUsers} unique users
                    </p>
                  </CardContent>
                </Card>
              )) || (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  No feature usage data yet
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
