import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  PenLine,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ContractSummaryWidgetProps {
  houseId?: number;
  className?: string;
}

export function ContractSummaryWidget({
  houseId,
  className = "",
}: ContractSummaryWidgetProps) {
  const { data: contracts, isLoading } = trpc.houseContracts.getMyContracts.useQuery();
  const { data: expiring } = trpc.houseContracts.getExpiringSoon.useQuery({ daysAhead: 30 });
  const { data: milestones } = trpc.houseContracts.getUpcomingMilestones.useQuery({ daysAhead: 14 });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Contracts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeContracts = contracts?.filter((c) => c.status === "active") || [];
  const pendingSignature = contracts?.filter(
    (c) =>
      c.signatureStatus === "pending_internal" ||
      c.signatureStatus === "pending_counterparty"
  ) || [];
  const expiringCount = expiring?.length || 0;
  const upcomingMilestones = milestones?.slice(0, 3) || [];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Contract Summary
          </CardTitle>
          <Link href="/house-contracts">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                {activeContracts.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <PenLine className="w-4 h-4 text-amber-600" />
            <div>
              <p className="text-xs text-muted-foreground">Pending Signature</p>
              <p className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                {pendingSignature.length}
              </p>
            </div>
          </div>
        </div>

        {/* Expiring Soon Alert */}
        {expiringCount > 0 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {expiringCount} contract{expiringCount > 1 ? "s" : ""} expiring soon
              </p>
              <p className="text-xs text-red-600 dark:text-red-500">
                Within the next 30 days
              </p>
            </div>
          </div>
        )}

        {/* Upcoming Milestones */}
        {upcomingMilestones.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Upcoming Deadlines
            </p>
            <div className="space-y-1">
              {upcomingMilestones.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="truncate max-w-[150px]">
                      {item.milestone?.title || "Milestone"}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.milestone?.dueDate
                      ? new Date(item.milestone.dueDate).toLocaleDateString()
                      : "TBD"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {contracts?.length === 0 && (
          <div className="text-center py-4">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No contracts yet</p>
            <Link href="/house-contracts">
              <Button variant="link" size="sm" className="mt-1">
                Create your first contract
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
