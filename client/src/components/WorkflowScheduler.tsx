import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ScheduledWorkflow {
  id: string;
  name: string;
  nextRun: Date;
  frequency: "once" | "daily" | "weekly" | "monthly" | "custom";
  enabled: boolean;
  lastRun?: Date;
  status: "scheduled" | "running" | "completed" | "failed";
  retryCount: number;
}

export function WorkflowScheduler() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workflows, setWorkflows] = useState<ScheduledWorkflow[]>([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState<Set<string>>(
    new Set()
  );
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const getWorkflowsForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return workflows.filter(
      (w) =>
        w.nextRun.getDate() === day &&
        w.nextRun.getMonth() === currentDate.getMonth() &&
        w.nextRun.getFullYear() === currentDate.getFullYear()
    );
  };

  const toggleWorkflowSelection = (workflowId: string) => {
    const newSelected = new Set(selectedWorkflows);
    if (newSelected.has(workflowId)) {
      newSelected.delete(workflowId);
    } else {
      newSelected.add(workflowId);
    }
    setSelectedWorkflows(newSelected);
  };

  const bulkReschedule = useCallback(() => {
    if (selectedWorkflows.size === 0) {
      toast.error("No workflows selected");
      return;
    }

    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7); // Reschedule to next week

    setWorkflows((prev) =>
      prev.map((w) =>
        selectedWorkflows.has(w.id) ? { ...w, nextRun: newDate } : w
      )
    );

    toast.success(`Rescheduled ${selectedWorkflows.size} workflows`);
    setSelectedWorkflows(new Set());
  }, [selectedWorkflows, currentDate]);

  const bulkEnable = useCallback(() => {
    if (selectedWorkflows.size === 0) {
      toast.error("No workflows selected");
      return;
    }

    setWorkflows((prev) =>
      prev.map((w) =>
        selectedWorkflows.has(w.id) ? { ...w, enabled: true } : w
      )
    );

    toast.success(`Enabled ${selectedWorkflows.size} workflows`);
    setSelectedWorkflows(new Set());
  }, [selectedWorkflows]);

  const bulkDisable = useCallback(() => {
    if (selectedWorkflows.size === 0) {
      toast.error("No workflows selected");
      return;
    }

    setWorkflows((prev) =>
      prev.map((w) =>
        selectedWorkflows.has(w.id) ? { ...w, enabled: false } : w
      )
    );

    toast.success(`Disabled ${selectedWorkflows.size} workflows`);
    setSelectedWorkflows(new Set());
  }, [selectedWorkflows]);

  const bulkDelete = useCallback(() => {
    if (selectedWorkflows.size === 0) {
      toast.error("No workflows selected");
      return;
    }

    if (!confirm(`Delete ${selectedWorkflows.size} workflows?`)) {
      return;
    }

    setWorkflows((prev) =>
      prev.filter((w) => !selectedWorkflows.has(w.id))
    );

    toast.success(`Deleted ${selectedWorkflows.size} workflows`);
    setSelectedWorkflows(new Set());
  }, [selectedWorkflows]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "running":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calendarDays = [];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Workflow Scheduler</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
            >
              Calendar
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedWorkflows.size > 0 && (
          <div className="bg-blue-50 p-3 rounded mb-4 space-y-2">
            <p className="text-sm font-medium">
              {selectedWorkflows.size} workflow(s) selected
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={bulkReschedule} variant="outline">
                <Clock className="w-4 h-4 mr-1" />
                Reschedule
              </Button>
              <Button size="sm" onClick={bulkEnable} variant="outline">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Enable
              </Button>
              <Button size="sm" onClick={bulkDisable} variant="outline">
                <AlertCircle className="w-4 h-4 mr-1" />
                Disable
              </Button>
              <Button
                size="sm"
                onClick={bulkDelete}
                variant="outline"
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button size="sm" variant="outline" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <Button size="sm" variant="outline" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-24 p-2 border rounded ${
                  day ? "bg-white" : "bg-gray-50"
                }`}
              >
                {day && (
                  <>
                    <div className="font-semibold text-sm mb-1">{day}</div>
                    <div className="space-y-1">
                      {getWorkflowsForDate(day).map((wf) => (
                        <div
                          key={wf.id}
                          className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(wf.status)}`}
                          onClick={() => toggleWorkflowSelection(wf.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedWorkflows.has(wf.id)}
                            onChange={() => toggleWorkflowSelection(wf.id)}
                            className="mr-1"
                          />
                          {wf.name}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="p-6">
          <div className="space-y-2">
            {workflows.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No scheduled workflows
              </p>
            ) : (
              workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedWorkflows.has(wf.id)}
                    onChange={() => toggleWorkflowSelection(wf.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{wf.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Next run: {wf.nextRun.toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(wf.status)}>
                    {wf.status}
                  </Badge>
                  <Badge variant={wf.enabled ? "default" : "secondary"}>
                    {wf.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
