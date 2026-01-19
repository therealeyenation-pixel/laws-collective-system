import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Heart,
  Globe,
  MapPin,
  Clock,
  Calendar,
  Users,
  Award,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Building2,
  Plane,
  Home,
  Star,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface VolunteerOpportunity {
  id: string;
  name: string;
  organization: string;
  location: string;
  region: "domestic" | "international";
  country?: string;
  description: string;
  skills: string[];
  commitment: string;
  schedule: string;
  status: "available" | "applied" | "accepted" | "completed";
  hoursLogged: number;
  impactMetrics?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  entity?: string;
}

interface VolunteerStats {
  totalHours: number;
  domesticHours: number;
  internationalHours: number;
  opportunitiesCompleted: number;
  currentOpportunities: number;
}

const defaultOpportunities: VolunteerOpportunity[] = [
  // Domestic Opportunities
  {
    id: "vol-001",
    name: "Youth Financial Literacy Workshop Facilitator",
    organization: "Junior Achievement Georgia",
    location: "Atlanta, GA",
    region: "domestic",
    description: "Teach financial literacy concepts to middle and high school students using hands-on activities and real-world scenarios.",
    skills: ["Financial literacy", "Teaching", "Public speaking"],
    commitment: "4-8 hours/month",
    schedule: "Weekday afternoons",
    status: "available",
    hoursLogged: 0,
  },
  {
    id: "vol-002",
    name: "Re-Entry Program Mentor",
    organization: "Georgia Department of Community Supervision",
    location: "Atlanta, GA",
    region: "domestic",
    description: "Mentor individuals transitioning from incarceration, providing guidance on employment, housing, and life skills.",
    skills: ["Mentoring", "Counseling", "Career guidance"],
    commitment: "2-4 hours/week",
    schedule: "Flexible",
    status: "available",
    hoursLogged: 0,
  },
  {
    id: "vol-003",
    name: "Small Business Development Advisor",
    organization: "SCORE Atlanta",
    location: "Atlanta, GA",
    region: "domestic",
    description: "Provide free business mentoring to aspiring entrepreneurs and small business owners.",
    skills: ["Business planning", "Marketing", "Financial management"],
    commitment: "4-6 hours/month",
    schedule: "Flexible",
    status: "available",
    hoursLogged: 0,
  },
  {
    id: "vol-004",
    name: "Community Garden Coordinator",
    organization: "Atlanta Community Food Bank",
    location: "Atlanta, GA",
    region: "domestic",
    description: "Help coordinate community garden activities, teaching sustainable agriculture and nutrition.",
    skills: ["Gardening", "Project management", "Community organizing"],
    commitment: "4-8 hours/week (seasonal)",
    schedule: "Weekends",
    status: "available",
    hoursLogged: 0,
  },
  {
    id: "vol-005",
    name: "Documentary Film Workshop Instructor",
    organization: "Atlanta Film Society",
    location: "Atlanta, GA",
    region: "domestic",
    description: "Teach documentary filmmaking techniques to underserved youth, including storytelling, camera work, and editing.",
    skills: ["Filmmaking", "Video editing", "Storytelling"],
    commitment: "6-10 hours/month",
    schedule: "Saturdays",
    status: "available",
    hoursLogged: 0,
  },
  // International Opportunities
  {
    id: "vol-int-001",
    name: "Youth Entrepreneurship Program",
    organization: "Jamaica Youth Business Trust",
    location: "Kingston, Jamaica",
    region: "international",
    country: "Jamaica",
    description: "Support young Jamaican entrepreneurs with business planning, mentorship, and access to resources.",
    skills: ["Business development", "Mentoring", "Cross-cultural communication"],
    commitment: "2-week program + remote follow-up",
    schedule: "Annual program (July)",
    status: "available",
    hoursLogged: 0,
  },
  {
    id: "vol-int-002",
    name: "Financial Literacy for Women",
    organization: "Women's Resource and Outreach Centre",
    location: "Kingston, Jamaica",
    region: "international",
    country: "Jamaica",
    description: "Conduct financial literacy workshops for women in underserved communities, focusing on savings, budgeting, and micro-enterprise.",
    skills: ["Financial education", "Women's empowerment", "Workshop facilitation"],
    commitment: "1-2 weeks on-site",
    schedule: "Quarterly programs",
    status: "available",
    hoursLogged: 0,
  },
  {
    id: "vol-int-003",
    name: "Tech Skills Training",
    organization: "iCreate Jamaica",
    location: "Kingston, Jamaica",
    region: "international",
    country: "Jamaica",
    description: "Teach digital skills including coding, web development, and digital marketing to young adults.",
    skills: ["Technology", "Teaching", "Curriculum development"],
    commitment: "2-4 weeks",
    schedule: "Summer programs",
    status: "available",
    hoursLogged: 0,
  },
  {
    id: "vol-int-004",
    name: "Community Development Project",
    organization: "Peace Corps Response",
    location: "Various African Countries",
    region: "international",
    country: "Africa",
    description: "Short-term volunteer assignments supporting community development, education, and economic empowerment.",
    skills: ["Project management", "Community organizing", "Cross-cultural skills"],
    commitment: "3-12 months",
    schedule: "Year-round",
    status: "available",
    hoursLogged: 0,
  },
  {
    id: "vol-int-005",
    name: "Documentary Storytelling Workshop",
    organization: "Firelight Media International",
    location: "Various Locations",
    region: "international",
    country: "Global",
    description: "Lead documentary storytelling workshops for emerging filmmakers in developing countries.",
    skills: ["Documentary filmmaking", "Teaching", "Cross-cultural communication"],
    commitment: "1-2 weeks per workshop",
    schedule: "Multiple programs annually",
    status: "available",
    hoursLogged: 0,
  },
];

export default function VolunteerTracker() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [newOpportunity, setNewOpportunity] = useState<Partial<VolunteerOpportunity>>({
    region: "domestic",
    status: "available",
    hoursLogged: 0,
    skills: [],
  });

  useEffect(() => {
    const saved = localStorage.getItem("volunteerOpportunities");
    if (saved) {
      setOpportunities(JSON.parse(saved));
    } else {
      setOpportunities(defaultOpportunities);
      localStorage.setItem("volunteerOpportunities", JSON.stringify(defaultOpportunities));
    }
  }, []);

  const saveOpportunities = (updated: VolunteerOpportunity[]) => {
    setOpportunities(updated);
    localStorage.setItem("volunteerOpportunities", JSON.stringify(updated));
  };

  const calculateStats = (): VolunteerStats => {
    return {
      totalHours: opportunities.reduce((sum, o) => sum + o.hoursLogged, 0),
      domesticHours: opportunities
        .filter((o) => o.region === "domestic")
        .reduce((sum, o) => sum + o.hoursLogged, 0),
      internationalHours: opportunities
        .filter((o) => o.region === "international")
        .reduce((sum, o) => sum + o.hoursLogged, 0),
      opportunitiesCompleted: opportunities.filter((o) => o.status === "completed").length,
      currentOpportunities: opportunities.filter(
        (o) => o.status === "applied" || o.status === "accepted"
      ).length,
    };
  };

  const stats = calculateStats();

  const filteredOpportunities = opportunities.filter((opp) => {
    if (regionFilter !== "all" && opp.region !== regionFilter) return false;
    if (statusFilter !== "all" && opp.status !== statusFilter) return false;
    if (activeTab === "domestic" && opp.region !== "domestic") return false;
    if (activeTab === "international" && opp.region !== "international") return false;
    if (activeTab === "active" && !["applied", "accepted"].includes(opp.status)) return false;
    if (activeTab === "completed" && opp.status !== "completed") return false;
    return true;
  });

  const handleAddOpportunity = () => {
    if (!newOpportunity.name || !newOpportunity.organization) {
      toast.error("Please fill in required fields");
      return;
    }

    const opportunity: VolunteerOpportunity = {
      id: `vol-custom-${Date.now()}`,
      name: newOpportunity.name || "",
      organization: newOpportunity.organization || "",
      location: newOpportunity.location || "",
      region: newOpportunity.region as "domestic" | "international",
      country: newOpportunity.country,
      description: newOpportunity.description || "",
      skills: newOpportunity.skills || [],
      commitment: newOpportunity.commitment || "",
      schedule: newOpportunity.schedule || "",
      status: "available",
      hoursLogged: 0,
    };

    saveOpportunities([...opportunities, opportunity]);
    setNewOpportunity({
      region: "domestic",
      status: "available",
      hoursLogged: 0,
      skills: [],
    });
    setIsAddDialogOpen(false);
    toast.success("Volunteer opportunity added");
  };

  const handleUpdateStatus = (id: string, status: VolunteerOpportunity["status"]) => {
    const updated = opportunities.map((o) =>
      o.id === id ? { ...o, status } : o
    );
    saveOpportunities(updated);
    toast.success(`Status updated to ${status}`);
  };

  const handleLogHours = (id: string, hours: number) => {
    const updated = opportunities.map((o) =>
      o.id === id ? { ...o, hoursLogged: o.hoursLogged + hours } : o
    );
    saveOpportunities(updated);
    toast.success(`${hours} hours logged`);
  };

  const handleDelete = (id: string) => {
    const updated = opportunities.filter((o) => o.id !== id);
    saveOpportunities(updated);
    toast.success("Opportunity removed");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-blue-500";
      case "applied":
        return "bg-yellow-500";
      case "accepted":
        return "bg-green-500";
      case "completed":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <AlertCircle className="w-4 h-4" />;
      case "applied":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <Award className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalHours}</p>
              <p className="text-xs text-muted-foreground">Total Hours</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.domesticHours}</p>
              <p className="text-xs text-muted-foreground">Domestic Hours</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="flex items-center gap-3">
            <Plane className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.internationalHours}</p>
              <p className="text-xs text-muted-foreground">International Hours</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.opportunitiesCompleted}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.currentOpportunities}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="domestic">🇺🇸 Domestic</SelectItem>
                <SelectItem value="international">🌍 International</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Volunteer Opportunity</DialogTitle>
                <DialogDescription>
                  Add a new volunteer opportunity to track
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Opportunity Name *</Label>
                  <Input
                    id="name"
                    value={newOpportunity.name || ""}
                    onChange={(e) =>
                      setNewOpportunity({ ...newOpportunity, name: e.target.value })
                    }
                    placeholder="e.g., Youth Mentorship Program"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="organization">Organization *</Label>
                  <Input
                    id="organization"
                    value={newOpportunity.organization || ""}
                    onChange={(e) =>
                      setNewOpportunity({ ...newOpportunity, organization: e.target.value })
                    }
                    placeholder="e.g., Local Community Center"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="region">Region</Label>
                    <Select
                      value={newOpportunity.region}
                      onValueChange={(value) =>
                        setNewOpportunity({
                          ...newOpportunity,
                          region: value as "domestic" | "international",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">Domestic</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newOpportunity.location || ""}
                      onChange={(e) =>
                        setNewOpportunity({ ...newOpportunity, location: e.target.value })
                      }
                      placeholder="e.g., Atlanta, GA"
                    />
                  </div>
                </div>
                {newOpportunity.region === "international" && (
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={newOpportunity.country || ""}
                      onChange={(e) =>
                        setNewOpportunity({ ...newOpportunity, country: e.target.value })
                      }
                      placeholder="e.g., Jamaica"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newOpportunity.description || ""}
                    onChange={(e) =>
                      setNewOpportunity({ ...newOpportunity, description: e.target.value })
                    }
                    placeholder="Describe the volunteer opportunity..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="commitment">Time Commitment</Label>
                    <Input
                      id="commitment"
                      value={newOpportunity.commitment || ""}
                      onChange={(e) =>
                        setNewOpportunity({ ...newOpportunity, commitment: e.target.value })
                      }
                      placeholder="e.g., 4 hours/week"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="schedule">Schedule</Label>
                    <Input
                      id="schedule"
                      value={newOpportunity.schedule || ""}
                      onChange={(e) =>
                        setNewOpportunity({ ...newOpportunity, schedule: e.target.value })
                      }
                      placeholder="e.g., Weekends"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={newOpportunity.skills?.join(", ") || ""}
                    onChange={(e) =>
                      setNewOpportunity({
                        ...newOpportunity,
                        skills: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    placeholder="e.g., Teaching, Mentoring, Public Speaking"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddOpportunity}>Add Opportunity</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Opportunities Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({opportunities.length})</TabsTrigger>
          <TabsTrigger value="domestic">
            Domestic ({opportunities.filter((o) => o.region === "domestic").length})
          </TabsTrigger>
          <TabsTrigger value="international">
            International ({opportunities.filter((o) => o.region === "international").length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({opportunities.filter((o) => ["applied", "accepted"].includes(o.status)).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({opportunities.filter((o) => o.status === "completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredOpportunities.length === 0 ? (
            <Card className="p-8 text-center">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No volunteer opportunities found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add Your First Opportunity
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOpportunities.map((opp) => (
                <Card key={opp.id} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            opp.region === "international"
                              ? "bg-green-500/10"
                              : "bg-blue-500/10"
                          }`}
                        >
                          {opp.region === "international" ? (
                            <Globe className="w-5 h-5 text-green-500" />
                          ) : (
                            <Home className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{opp.name}</h3>
                            <Badge
                              className={`${getStatusColor(opp.status)} text-white flex items-center gap-1`}
                            >
                              {getStatusIcon(opp.status)}
                              {opp.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3" />
                            {opp.organization}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {opp.location}
                            {opp.country && ` (${opp.country})`}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {opp.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {opp.skills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {opp.commitment}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {opp.schedule}
                            </span>
                            {opp.hoursLogged > 0 && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Star className="w-3 h-3" />
                                {opp.hoursLogged} hours logged
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {opp.status === "available" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(opp.id, "applied")}
                        >
                          Apply
                        </Button>
                      )}
                      {opp.status === "applied" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(opp.id, "accepted")}
                        >
                          Mark Accepted
                        </Button>
                      )}
                      {opp.status === "accepted" && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Log Hours
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Log Volunteer Hours</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label>Hours to Log</Label>
                                  <Input
                                    type="number"
                                    id={`hours-${opp.id}`}
                                    placeholder="Enter hours"
                                    min="0.5"
                                    step="0.5"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() => {
                                    const input = document.getElementById(
                                      `hours-${opp.id}`
                                    ) as HTMLInputElement;
                                    const hours = parseFloat(input?.value || "0");
                                    if (hours > 0) {
                                      handleLogHours(opp.id, hours);
                                    }
                                  }}
                                >
                                  Log Hours
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(opp.id, "completed")}
                          >
                            Complete
                          </Button>
                        </>
                      )}
                      {opp.status === "completed" && (
                        <Badge variant="secondary" className="justify-center">
                          <Award className="w-3 h-3 mr-1" />
                          {opp.hoursLogged} hrs
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(opp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Impact Summary */}
      {stats.totalHours > 0 && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Volunteer Impact Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Contribution</p>
              <p className="text-lg font-bold text-foreground">
                {stats.totalHours} volunteer hours
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimated Value</p>
              <p className="text-lg font-bold text-green-600">
                ${(stats.totalHours * 31.8).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Based on Independent Sector rate ($31.80/hr)
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Grant Application Value</p>
              <p className="text-xs text-muted-foreground">
                Volunteer hours demonstrate community engagement and can be used as
                in-kind match for grant applications.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
