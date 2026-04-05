import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Play,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Timer,
  AlertTriangle,
  History,
  Settings,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

export default function SystemJobsAdmin() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // Fetch available jobs
  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = trpc.systemJobs.getAvailableJobs.useQuery();

  // Fetch job history
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = trpc.systemJobs.getJobHistory.useQuery({
    jobName: selectedJob || undefined,
    limit: 20,
  });

  // Run job mutation
  const runJobMutation = trpc.systemJobs.runJob.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Job completed successfully`, {
          description: `Processed in ${result.duration}ms`,
        });
      } else {
        toast.error(`Job failed`, {
          description: result.errors.join(", "),
        });
      }
      refetchJobs();
      refetchHistory();
    },
    onError: (error) => {
      toast.error("Failed to run job", {
        description: error.message,
      });
    },
  });

  const handleRunJob = (jobName: string) => {
    runJobMutation.mutate({ jobName });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case "running":
        return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Running</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCronSchedule = (cron: string) => {
    // Parse common cron patterns
    const parts = cron.split(" ");
    if (parts.length === 5) {
      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
      
      if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
        return `Daily at ${hour}:${minute.padStart(2, "0")}`;
      }
      if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return `Weekly on ${days[parseInt(dayOfWeek)]} at ${hour}:${minute.padStart(2, "0")}`;
      }
    }
    return cron;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">System Jobs</h1>
            <p className="text-muted-foreground">
              Manage and monitor automated system tasks
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              refetchJobs();
              refetchHistory();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Available Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Available Jobs
            </CardTitle>
            <CardDescription>
              Scheduled system tasks that can be run manually or automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.name}
                    className={`p-4 rounded-lg border ${
                      selectedJob === job.name
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } transition-colors cursor-pointer`}
                    onClick={() => setSelectedJob(selectedJob === job.name ? null : job.name)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {job.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </h3>
                          {job.isRunning ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Running
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              Ready
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {job.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatCronSchedule(job.recommendedSchedule)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Cron: {job.recommendedSchedule}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRunJob(job.name);
                        }}
                        disabled={job.isRunning || runJobMutation.isPending}
                      >
                        {runJobMutation.isPending && runJobMutation.variables?.jobName === job.name ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Run Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No scheduled jobs configured</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Execution History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Execution History
              {selectedJob && (
                <Badge variant="secondary" className="ml-2">
                  Filtered: {selectedJob.replace(/_/g, " ")}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Recent job executions and their results
              {selectedJob && (
                <Button
                  variant="link"
                  size="sm"
                  className="ml-2 p-0 h-auto"
                  onClick={() => setSelectedJob(null)}
                >
                  Clear filter
                </Button>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : history && history.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.jobName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(log.startedAt), "MMM d, yyyy HH:mm")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.startedAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.completedAt ? (
                          <span className="flex items-center gap-1 text-sm">
                            <Timer className="w-3 h-3" />
                            {new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()}ms
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.error ? (
                          <span className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertTriangle className="w-3 h-3" />
                            {log.error.substring(0, 50)}...
                          </span>
                        ) : log.result ? (
                          <span className="text-sm text-muted-foreground">
                            {JSON.stringify(log.result).substring(0, 50)}...
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No execution history yet</p>
                <p className="text-sm">Run a job to see its execution history here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common job management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => handleRunJob("signature_expiration_notifications")}
                disabled={runJobMutation.isPending}
              >
                <Clock className="w-6 h-6 text-primary" />
                <span className="font-medium">Process Expiring Signatures</span>
                <span className="text-xs text-muted-foreground">
                  Send notifications for expiring signatures
                </span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => {
                  refetchJobs();
                  refetchHistory();
                  toast.success("Data refreshed");
                }}
              >
                <RefreshCw className="w-6 h-6 text-primary" />
                <span className="font-medium">Refresh Status</span>
                <span className="text-xs text-muted-foreground">
                  Update job status and history
                </span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => toast.info("Feature coming soon", { description: "External scheduler integration" })}
              >
                <Calendar className="w-6 h-6 text-primary" />
                <span className="font-medium">Configure Schedule</span>
                <span className="text-xs text-muted-foreground">
                  Set up external cron scheduler
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>External Scheduler Setup</CardTitle>
            <CardDescription>
              Instructions for setting up automatic job execution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">API Endpoint</h4>
              <code className="text-sm bg-background px-2 py-1 rounded">
                POST /api/trpc/systemJobs.runSignatureExpirationJob
              </code>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Recommended Cron Schedule</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Set up a cron job or scheduled task to call the API endpoint:
              </p>
              <code className="text-sm bg-background px-2 py-1 rounded block">
                0 8 * * * curl -X POST https://your-domain.com/api/trpc/systemJobs.runSignatureExpirationJob
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                This runs daily at 8:00 AM
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Supported Platforms</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AWS EventBridge / CloudWatch Events</li>
                <li>• Vercel Cron Jobs</li>
                <li>• GitHub Actions (scheduled workflows)</li>
                <li>• Linux crontab</li>
                <li>• Uptime monitoring services (e.g., UptimeRobot)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
