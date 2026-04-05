import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Bell,
  BellRing,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  ExternalLink,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface Grant {
  id: string;
  name: string;
  funder: string;
  amount: string;
  deadline: string;
  focus: string;
  eligibility: string;
  url: string;
  fitScore: number;
  notes: string;
  demographics?: string[];
}

interface TrackedDeadline {
  grantId: string;
  grantName: string;
  funder: string;
  entity: string;
  entityName: string;
  deadline: string;
  deadlineDate: Date | null;
  reminders: number[]; // Days before deadline to remind (e.g., [30, 14, 7])
  notes: string;
  status: "upcoming" | "approaching" | "urgent" | "passed" | "rolling";
  url: string;
}

interface GrantData {
  entities: Record<
    string,
    {
      entityName: string;
      grants: Grant[];
    }
  >;
}

const STORAGE_KEY = "grant_deadline_reminders";

const parseDeadline = (
  deadline: string
): { date: Date | null; isRolling: boolean } => {
  const lowerDeadline = deadline.toLowerCase();

  // Check for rolling/ongoing deadlines
  if (
    lowerDeadline.includes("rolling") ||
    lowerDeadline.includes("ongoing") ||
    lowerDeadline.includes("open")
  ) {
    return { date: null, isRolling: true };
  }

  // Check for quarterly deadlines
  if (lowerDeadline.includes("quarterly")) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Find next quarter end
    const quarterEnds = [2, 5, 8, 11]; // March, June, September, December
    for (const month of quarterEnds) {
      if (month >= currentMonth) {
        return {
          date: new Date(currentYear, month, month === 2 ? 31 : 30),
          isRolling: false,
        };
      }
    }
    // Next year Q1
    return { date: new Date(currentYear + 1, 2, 31), isRolling: false };
  }

  // Check for monthly deadlines
  if (lowerDeadline.includes("monthly")) {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { date: lastDay, isRolling: false };
  }

  // Check for annual cycle
  if (
    lowerDeadline.includes("annual") ||
    lowerDeadline.includes("yearly") ||
    lowerDeadline.includes("solicitation")
  ) {
    // Default to 6 months from now for annual cycles
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    return { date: futureDate, isRolling: false };
  }

  // Try to parse specific dates
  const dateMatch = deadline.match(
    /(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?/i
  );
  if (dateMatch) {
    const [, month, day, year] = dateMatch;
    const months: Record<string, number> = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const monthNum = months[month.toLowerCase()];
    if (monthNum !== undefined) {
      const yearNum = year ? parseInt(year) : new Date().getFullYear();
      return { date: new Date(yearNum, monthNum, parseInt(day)), isRolling: false };
    }
  }

  // Check for Spring/Summer/Fall/Winter
  const now = new Date();
  const currentYear = now.getFullYear();
  if (lowerDeadline.includes("spring")) {
    return { date: new Date(currentYear, 4, 31), isRolling: false }; // May 31
  }
  if (lowerDeadline.includes("summer")) {
    return { date: new Date(currentYear, 7, 31), isRolling: false }; // August 31
  }
  if (lowerDeadline.includes("fall") || lowerDeadline.includes("autumn")) {
    return { date: new Date(currentYear, 10, 30), isRolling: false }; // November 30
  }
  if (lowerDeadline.includes("winter")) {
    return { date: new Date(currentYear + 1, 1, 28), isRolling: false }; // February 28
  }

  return { date: null, isRolling: false };
};

const getDeadlineStatus = (
  deadline: TrackedDeadline
): "upcoming" | "approaching" | "urgent" | "passed" | "rolling" => {
  if (!deadline.deadlineDate) return "rolling";

  const now = new Date();
  const daysUntil = Math.ceil(
    (deadline.deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntil < 0) return "passed";
  if (daysUntil <= 7) return "urgent";
  if (daysUntil <= 14) return "approaching";
  return "upcoming";
};

const getDaysUntil = (date: Date | null): number | null => {
  if (!date) return null;
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export default function GrantDeadlineReminder() {
  const [grantData, setGrantData] = useState<GrantData | null>(null);
  const [trackedDeadlines, setTrackedDeadlines] = useState<TrackedDeadline[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [selectedGrant, setSelectedGrant] = useState<string>("");
  const [customDeadline, setCustomDeadline] = useState<string>("");
  const [customNotes, setCustomNotes] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Load grant data and saved deadlines
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/grant_opportunities.json");
        const data = await response.json();
        setGrantData(data);

        // Load saved deadlines from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Restore Date objects
          const restored = parsed.map((d: TrackedDeadline) => ({
            ...d,
            deadlineDate: d.deadlineDate ? new Date(d.deadlineDate) : null,
          }));
          setTrackedDeadlines(restored);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load grant data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save deadlines to localStorage whenever they change
  useEffect(() => {
    if (trackedDeadlines.length > 0 || !loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trackedDeadlines));
    }
  }, [trackedDeadlines, loading]);

  // Check for reminders on load
  useEffect(() => {
    if (trackedDeadlines.length === 0) return;

    const urgentDeadlines = trackedDeadlines.filter((d) => {
      const status = getDeadlineStatus(d);
      return status === "urgent" || status === "approaching";
    });

    if (urgentDeadlines.length > 0) {
      toast.warning(
        `You have ${urgentDeadlines.length} grant deadline(s) approaching!`,
        {
          duration: 5000,
          action: {
            label: "View",
            onClick: () => setFilterStatus("urgent"),
          },
        }
      );
    }
  }, [trackedDeadlines.length]);

  const handleAddDeadline = () => {
    if (!selectedEntity || !selectedGrant || !grantData) {
      toast.error("Please select an entity and grant");
      return;
    }

    const entity = grantData.entities[selectedEntity];
    const grant = entity.grants.find((g) => g.id === selectedGrant);

    if (!grant) {
      toast.error("Grant not found");
      return;
    }

    // Check if already tracked
    if (trackedDeadlines.some((d) => d.grantId === grant.id)) {
      toast.error("This grant is already being tracked");
      return;
    }

    const { date, isRolling } = customDeadline
      ? { date: new Date(customDeadline), isRolling: false }
      : parseDeadline(grant.deadline);

    const newDeadline: TrackedDeadline = {
      grantId: grant.id,
      grantName: grant.name,
      funder: grant.funder,
      entity: selectedEntity,
      entityName: entity.entityName,
      deadline: customDeadline || grant.deadline,
      deadlineDate: date,
      reminders: [30, 14, 7],
      notes: customNotes || grant.notes,
      status: isRolling ? "rolling" : "upcoming",
      url: grant.url,
    };

    setTrackedDeadlines([...trackedDeadlines, newDeadline]);
    setShowAddDialog(false);
    setSelectedEntity("");
    setSelectedGrant("");
    setCustomDeadline("");
    setCustomNotes("");
    toast.success(`Now tracking "${grant.name}" deadline`);
  };

  const handleRemoveDeadline = (grantId: string) => {
    setTrackedDeadlines(trackedDeadlines.filter((d) => d.grantId !== grantId));
    toast.success("Deadline removed from tracking");
  };

  const filteredDeadlines = useMemo(() => {
    let filtered = [...trackedDeadlines];

    // Update status for each deadline
    filtered = filtered.map((d) => ({
      ...d,
      status: getDeadlineStatus(d),
    }));

    // Apply filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((d) => d.status === filterStatus);
    }

    // Sort by deadline date (nulls/rolling at end)
    filtered.sort((a, b) => {
      if (!a.deadlineDate && !b.deadlineDate) return 0;
      if (!a.deadlineDate) return 1;
      if (!b.deadlineDate) return -1;
      return a.deadlineDate.getTime() - b.deadlineDate.getTime();
    });

    return filtered;
  }, [trackedDeadlines, filterStatus]);

  const statusCounts = useMemo(() => {
    const counts = { urgent: 0, approaching: 0, upcoming: 0, rolling: 0, passed: 0 };
    trackedDeadlines.forEach((d) => {
      const status = getDeadlineStatus(d);
      counts[status]++;
    });
    return counts;
  }, [trackedDeadlines]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "urgent":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            Urgent
          </Badge>
        );
      case "approaching":
        return (
          <Badge className="bg-orange-500 gap-1">
            <BellRing className="w-3 h-3" />
            Approaching
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Upcoming
          </Badge>
        );
      case "rolling":
        return (
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Rolling
          </Badge>
        );
      case "passed":
        return (
          <Badge variant="outline" className="text-muted-foreground gap-1">
            <Clock className="w-3 h-3" />
            Passed
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Grant Deadline Reminders
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track upcoming grant deadlines and get notified before they pass
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Track Deadline
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Grant Deadline to Track</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Entity</Label>
                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {grantData &&
                      Object.entries(grantData.entities)
                        .filter(([key]) => key !== "calea_freeman_trust")
                        .map(([key, entity]) => (
                          <SelectItem key={key} value={key}>
                            {entity.entityName}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEntity && grantData && (
                <div className="space-y-2">
                  <Label>Select Grant</Label>
                  <Select value={selectedGrant} onValueChange={setSelectedGrant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a grant" />
                    </SelectTrigger>
                    <SelectContent>
                      {grantData.entities[selectedEntity].grants.map((grant) => (
                        <SelectItem key={grant.id} value={grant.id}>
                          {grant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedGrant && (
                <>
                  <div className="space-y-2">
                    <Label>Custom Deadline (optional)</Label>
                    <Input
                      type="date"
                      value={customDeadline}
                      onChange={(e) => setCustomDeadline(e.target.value)}
                      placeholder="Leave empty to use grant's deadline"
                    />
                    <p className="text-xs text-muted-foreground">
                      Override the grant's default deadline if you have specific
                      information
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Input
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="Add any notes about this application"
                    />
                  </div>
                </>
              )}

              <Button
                onClick={handleAddDeadline}
                className="w-full"
                disabled={!selectedEntity || !selectedGrant}
              >
                Add to Tracking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card
          className={`p-3 cursor-pointer transition-all ${filterStatus === "urgent" ? "ring-2 ring-destructive" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "urgent" ? "all" : "urgent")}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium">Urgent</span>
          </div>
          <p className="text-2xl font-bold text-destructive mt-1">
            {statusCounts.urgent}
          </p>
          <p className="text-xs text-muted-foreground">Within 7 days</p>
        </Card>

        <Card
          className={`p-3 cursor-pointer transition-all ${filterStatus === "approaching" ? "ring-2 ring-orange-500" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "approaching" ? "all" : "approaching")}
        >
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Approaching</span>
          </div>
          <p className="text-2xl font-bold text-orange-500 mt-1">
            {statusCounts.approaching}
          </p>
          <p className="text-xs text-muted-foreground">8-14 days</p>
        </Card>

        <Card
          className={`p-3 cursor-pointer transition-all ${filterStatus === "upcoming" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "upcoming" ? "all" : "upcoming")}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-primary mt-1">
            {statusCounts.upcoming}
          </p>
          <p className="text-xs text-muted-foreground">15+ days</p>
        </Card>

        <Card
          className={`p-3 cursor-pointer transition-all ${filterStatus === "rolling" ? "ring-2 ring-accent" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "rolling" ? "all" : "rolling")}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Rolling</span>
          </div>
          <p className="text-2xl font-bold text-accent mt-1">
            {statusCounts.rolling}
          </p>
          <p className="text-xs text-muted-foreground">No deadline</p>
        </Card>

        <Card
          className={`p-3 cursor-pointer transition-all ${filterStatus === "all" ? "ring-2 ring-border" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">All</span>
          </div>
          <p className="text-2xl font-bold mt-1">{trackedDeadlines.length}</p>
          <p className="text-xs text-muted-foreground">Total tracked</p>
        </Card>
      </div>

      {/* Deadline List */}
      {filteredDeadlines.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground">
            {trackedDeadlines.length === 0
              ? "No Deadlines Tracked Yet"
              : "No Deadlines Match Filter"}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {trackedDeadlines.length === 0
              ? "Start tracking grant deadlines to get reminded before they pass"
              : "Try adjusting your filter to see more deadlines"}
          </p>
          {trackedDeadlines.length === 0 && (
            <Button
              className="mt-4"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Track Your First Deadline
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDeadlines.map((deadline) => {
            const daysUntil = getDaysUntil(deadline.deadlineDate);
            const status = getDeadlineStatus(deadline);

            return (
              <Card
                key={deadline.grantId}
                className={`p-4 ${
                  status === "urgent"
                    ? "border-l-4 border-l-destructive"
                    : status === "approaching"
                      ? "border-l-4 border-l-orange-500"
                      : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">
                            {deadline.grantName}
                          </h3>
                          {getStatusBadge(status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {deadline.funder}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          For: {deadline.entityName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {deadline.deadlineDate
                            ? deadline.deadlineDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : deadline.deadline}
                        </span>
                      </div>
                      {daysUntil !== null && (
                        <p
                          className={`text-sm font-medium ${
                            daysUntil <= 7
                              ? "text-destructive"
                              : daysUntil <= 14
                                ? "text-orange-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          {daysUntil < 0
                            ? `${Math.abs(daysUntil)} days ago`
                            : daysUntil === 0
                              ? "Today!"
                              : `${daysUntil} days left`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(deadline.url, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDeadline(deadline.grantId)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>

                {deadline.notes && (
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    {deadline.notes}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Tips */}
      <Card className="p-4 bg-accent/5 border-accent/20">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          Deadline Reminder Tips
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>• Start applications at least 30 days before the deadline</li>
          <li>• Have all documents ready 14 days before submission</li>
          <li>• Submit 7 days early to allow for technical issues</li>
          <li>• Rolling deadlines are ongoing - apply when ready</li>
        </ul>
      </Card>
    </div>
  );
}
