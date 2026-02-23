import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  ExternalLink,
  FileText,
  DollarSign,
  Scale,
  Briefcase,
  GraduationCap,
  Shield,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface GovernmentActionsWidgetProps {
  department?: string;
  entity?: string;
  showStats?: boolean;
  maxItems?: number;
}

const actionTypeIcons: Record<string, React.ReactNode> = {
  regulatory_change: <Scale className="w-4 h-4" />,
  grant_announcement: <DollarSign className="w-4 h-4" />,
  tax_update: <FileText className="w-4 h-4" />,
  licensing_requirement: <GraduationCap className="w-4 h-4" />,
  labor_law: <Briefcase className="w-4 h-4" />,
  nonprofit_compliance: <Shield className="w-4 h-4" />,
  filing_deadline: <Calendar className="w-4 h-4" />,
  policy_change: <Building2 className="w-4 h-4" />,
  enforcement_action: <AlertTriangle className="w-4 h-4" />,
  guidance_update: <FileText className="w-4 h-4" />,
};

const actionTypeLabels: Record<string, string> = {
  regulatory_change: "Regulatory Change",
  grant_announcement: "Grant Announcement",
  tax_update: "Tax Update",
  licensing_requirement: "Licensing",
  labor_law: "Labor Law",
  nonprofit_compliance: "Nonprofit Compliance",
  filing_deadline: "Filing Deadline",
  policy_change: "Policy Change",
  enforcement_action: "Enforcement",
  guidance_update: "Guidance Update",
};

const impactColors: Record<string, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-500 text-white",
  informational: "bg-gray-500 text-white",
};

const swotIcons: Record<string, React.ReactNode> = {
  strength: <TrendingUp className="w-4 h-4 text-green-500" />,
  weakness: <TrendingDown className="w-4 h-4 text-red-500" />,
  opportunity: <Target className="w-4 h-4 text-blue-500" />,
  threat: <AlertCircle className="w-4 h-4 text-orange-500" />,
};

const complianceStatusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  in_progress: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
  compliant: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  non_compliant: <XCircle className="w-4 h-4 text-red-500" />,
  not_applicable: <span className="w-4 h-4 text-gray-400">N/A</span>,
};

export function GovernmentActionsWidget({
  department,
  entity,
  showStats = true,
  maxItems = 5,
}: GovernmentActionsWidgetProps) {
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: stats } = trpc.governmentActions.getStats.useQuery(undefined, {
    enabled: showStats,
  });

  const { data: upcomingActions, isLoading: loadingUpcoming } = trpc.governmentActions.list.useQuery({
    upcomingDeadlinesOnly: true,
    limit: maxItems,
    department,
    entity,
  });

  const { data: allActions, isLoading: loadingAll } = trpc.governmentActions.list.useQuery({
    limit: maxItems * 2,
    department,
    entity,
  });

  const { data: actionDetail } = trpc.governmentActions.getById.useQuery(
    { id: selectedAction?.action?.id },
    { enabled: !!selectedAction?.action?.id }
  );

  const getDaysUntilDeadline = (deadline: Date | null) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const days = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const renderActionCard = (item: any) => {
    const action = item.action;
    const agency = item.agency;
    const daysUntil = getDaysUntilDeadline(action.deadline);
    const isOverdue = daysUntil !== null && daysUntil < 0;
    const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;

    return (
      <div
        key={action.id}
        className={`p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
          isOverdue ? "border-red-500 bg-red-50 dark:bg-red-950/20" :
          isUrgent ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" :
          "border-border"
        }`}
        onClick={() => setSelectedAction(item)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="mt-0.5">
              {actionTypeIcons[action.actionType] || <FileText className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-2">{action.title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {agency && (
                  <Badge variant="outline" className="text-xs">
                    {agency.code || agency.name}
                  </Badge>
                )}
                <Badge className={`text-xs ${impactColors[action.impactLevel]}`}>
                  {action.impactLevel}
                </Badge>
                {action.swotCategory && (
                  <span className="flex items-center gap-1">
                    {swotIcons[action.swotCategory]}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            {action.deadline && (
              <div className={`text-xs ${isOverdue ? "text-red-600" : isUrgent ? "text-orange-600" : "text-muted-foreground"}`}>
                {isOverdue ? (
                  <span className="font-semibold">OVERDUE</span>
                ) : (
                  <>
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                  </>
                )}
              </div>
            )}
            <div className="mt-1">
              {complianceStatusIcons[action.complianceStatus]}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Government Actions
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <a href="/government-actions-admin">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showStats && stats && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-2xl font-bold">{stats.totalActions}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-2 bg-orange-100 dark:bg-orange-950/30 rounded">
                <p className="text-2xl font-bold text-orange-600">{stats.upcomingDeadlines}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
              <div className="text-center p-2 bg-red-100 dark:bg-red-950/30 rounded">
                <p className="text-2xl font-bold text-red-600">{stats.overdueActions}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
              <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-950/30 rounded">
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingCompliance}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="upcoming" className="flex-1">
                <Clock className="w-4 h-4 mr-1" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1">
                <FileText className="w-4 h-4 mr-1" />
                All Active
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-3 space-y-2">
              {loadingUpcoming ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : upcomingActions && upcomingActions.length > 0 ? (
                upcomingActions.map(renderActionCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming deadlines in the next 30 days</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-3 space-y-2">
              {loadingAll ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : allActions && allActions.length > 0 ? (
                allActions.map(renderActionCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No government actions tracked</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAction?.action?.actionType && actionTypeIcons[selectedAction.action.actionType]}
              {selectedAction?.action?.title}
            </DialogTitle>
          </DialogHeader>

          {actionDetail && (
            <div className="space-y-4">
              {/* Agency and Type */}
              <div className="flex flex-wrap gap-2">
                {actionDetail.agency && (
                  <Badge variant="outline">
                    {actionDetail.agency.name}
                  </Badge>
                )}
                <Badge>
                  {actionTypeLabels[actionDetail.action.actionType]}
                </Badge>
                <Badge className={impactColors[actionDetail.action.impactLevel]}>
                  {actionDetail.action.impactLevel} impact
                </Badge>
                {actionDetail.action.swotCategory && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {swotIcons[actionDetail.action.swotCategory]}
                    {actionDetail.action.swotCategory}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {actionDetail.action.description && (
                <div>
                  <h4 className="font-semibold mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{actionDetail.action.description}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                {actionDetail.action.effectiveDate && (
                  <div>
                    <h4 className="font-semibold text-sm">Effective Date</h4>
                    <p className="text-sm">{format(new Date(actionDetail.action.effectiveDate), "MMM d, yyyy")}</p>
                  </div>
                )}
                {actionDetail.action.deadline && (
                  <div>
                    <h4 className="font-semibold text-sm">Deadline</h4>
                    <p className="text-sm">
                      {format(new Date(actionDetail.action.deadline), "MMM d, yyyy")}
                      <span className="text-muted-foreground ml-1">
                        ({formatDistanceToNow(new Date(actionDetail.action.deadline), { addSuffix: true })})
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Compliance Status */}
              <div>
                <h4 className="font-semibold mb-1">Compliance Status</h4>
                <div className="flex items-center gap-2">
                  {complianceStatusIcons[actionDetail.action.complianceStatus]}
                  <span className="capitalize">{actionDetail.action.complianceStatus.replace("_", " ")}</span>
                </div>
                {actionDetail.action.complianceNotes && (
                  <p className="text-sm text-muted-foreground mt-1">{actionDetail.action.complianceNotes}</p>
                )}
              </div>

              {/* Estimated Impact */}
              {(actionDetail.action.estimatedCost || actionDetail.action.estimatedTimeHours) && (
                <div className="grid grid-cols-2 gap-4">
                  {actionDetail.action.estimatedCost && (
                    <div>
                      <h4 className="font-semibold text-sm">Estimated Cost</h4>
                      <p className="text-sm">${Number(actionDetail.action.estimatedCost).toLocaleString()}</p>
                    </div>
                  )}
                  {actionDetail.action.estimatedTimeHours && (
                    <div>
                      <h4 className="font-semibold text-sm">Estimated Time</h4>
                      <p className="text-sm">{actionDetail.action.estimatedTimeHours} hours</p>
                    </div>
                  )}
                </div>
              )}

              {/* Source Link */}
              {actionDetail.action.sourceUrl && (
                <div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={actionDetail.action.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Source
                    </a>
                  </Button>
                </div>
              )}

              {/* Compliance Tasks */}
              {actionDetail.tasks && actionDetail.tasks.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Compliance Tasks</h4>
                  <div className="space-y-2">
                    {actionDetail.tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                        {task.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                          {task.title}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            Due: {format(new Date(task.dueDate), "MMM d")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GovernmentActionsWidget;
