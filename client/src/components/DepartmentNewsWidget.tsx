import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Newspaper,
  Building2,
  Calendar,
  ExternalLink,
  AlertTriangle,
  TrendingUp,
  FileText,
  Clock,
  BookOpen,
  Scale,
  DollarSign,
  Briefcase,
  Shield,
  GraduationCap,
  Globe,
  Landmark,
  Users,
  Megaphone,
  Cpu,
  Heart,
  Home,
  Gavel,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

// Department configuration with relevant topics and government agencies
const DEPARTMENT_CONFIG: Record<string, {
  name: string;
  icon: React.ReactNode;
  topics: string[];
  agencies: string[];
  keywords: string[];
  color: string;
}> = {
  finance: {
    name: "Finance",
    icon: <DollarSign className="w-4 h-4" />,
    topics: ["Tax Law", "Financial Regulations", "Banking", "Securities", "Accounting Standards"],
    agencies: ["IRS", "SEC", "FASB", "Treasury", "FDIC", "OCC"],
    keywords: ["tax", "financial", "accounting", "audit", "revenue", "budget", "fiscal"],
    color: "bg-green-500",
  },
  legal: {
    name: "Legal",
    icon: <Scale className="w-4 h-4" />,
    topics: ["Court Decisions", "Legislation", "Regulatory Changes", "Compliance", "Contracts"],
    agencies: ["DOJ", "FTC", "State Courts", "Federal Courts", "USPTO"],
    keywords: ["legal", "law", "court", "ruling", "regulation", "compliance", "contract"],
    color: "bg-purple-500",
  },
  hr: {
    name: "Human Resources",
    icon: <Users className="w-4 h-4" />,
    topics: ["Labor Law", "Employment Regulations", "Benefits", "Workplace Safety", "DEI"],
    agencies: ["DOL", "EEOC", "OSHA", "NLRB", "WHD"],
    keywords: ["employment", "labor", "workforce", "benefits", "workplace", "hiring", "termination"],
    color: "bg-blue-500",
  },
  operations: {
    name: "Operations",
    icon: <Briefcase className="w-4 h-4" />,
    topics: ["Industry Regulations", "Supply Chain", "Quality Standards", "Environmental"],
    agencies: ["EPA", "OSHA", "FDA", "DOT", "CPSC"],
    keywords: ["operations", "supply chain", "logistics", "manufacturing", "quality", "safety"],
    color: "bg-orange-500",
  },
  grants: {
    name: "Grants & Funding",
    icon: <FileText className="w-4 h-4" />,
    topics: ["Grant Announcements", "Funding Opportunities", "RFPs", "Foundation News"],
    agencies: ["NEA", "NEH", "NSF", "NIH", "USDA", "HUD", "DOE"],
    keywords: ["grant", "funding", "foundation", "nonprofit", "philanthropy", "award", "rfp"],
    color: "bg-teal-500",
  },
  education: {
    name: "Education & Academy",
    icon: <GraduationCap className="w-4 h-4" />,
    topics: ["Education Policy", "Accreditation", "Training Standards", "Certification"],
    agencies: ["DOE", "State Education Depts", "Accreditation Bodies"],
    keywords: ["education", "training", "accreditation", "certification", "curriculum", "learning"],
    color: "bg-indigo-500",
  },
  it: {
    name: "Information Technology",
    icon: <Cpu className="w-4 h-4" />,
    topics: ["Cybersecurity", "Data Privacy", "Tech Policy", "AI Regulations"],
    agencies: ["CISA", "FCC", "NIST", "FTC Privacy"],
    keywords: ["cybersecurity", "data privacy", "technology", "AI", "software", "digital", "cloud"],
    color: "bg-cyan-500",
  },
  marketing: {
    name: "Marketing & Communications",
    icon: <Megaphone className="w-4 h-4" />,
    topics: ["Advertising Regulations", "Consumer Protection", "Social Media Policy"],
    agencies: ["FTC", "FCC", "State AGs"],
    keywords: ["advertising", "marketing", "consumer", "brand", "media", "communications"],
    color: "bg-pink-500",
  },
  health: {
    name: "Health & Wellness",
    icon: <Heart className="w-4 h-4" />,
    topics: ["Healthcare Regulations", "HIPAA", "Mental Health Policy", "Wellness Programs"],
    agencies: ["HHS", "CMS", "FDA", "CDC", "SAMHSA"],
    keywords: ["health", "healthcare", "medical", "wellness", "HIPAA", "mental health"],
    color: "bg-red-500",
  },
  realestate: {
    name: "Real Estate & Property",
    icon: <Home className="w-4 h-4" />,
    topics: ["Property Law", "Zoning", "Housing Regulations", "Environmental Compliance"],
    agencies: ["HUD", "EPA", "Local Zoning", "State Real Estate Commissions"],
    keywords: ["property", "real estate", "housing", "zoning", "land use", "construction"],
    color: "bg-amber-500",
  },
  compliance: {
    name: "Compliance",
    icon: <Shield className="w-4 h-4" />,
    topics: ["Regulatory Updates", "Audit Requirements", "Reporting Deadlines", "Risk Management"],
    agencies: ["All Federal Agencies", "State Regulators", "Industry Bodies"],
    keywords: ["compliance", "audit", "regulatory", "risk", "reporting", "governance"],
    color: "bg-slate-500",
  },
  international: {
    name: "International Operations",
    icon: <Globe className="w-4 h-4" />,
    topics: ["Trade Policy", "International Law", "Export Controls", "Foreign Regulations"],
    agencies: ["State Dept", "Commerce", "USTR", "CBP", "OFAC"],
    keywords: ["international", "trade", "export", "import", "foreign", "global"],
    color: "bg-violet-500",
  },
  investment: {
    name: "Investments",
    icon: <TrendingUp className="w-4 h-4" />,
    topics: ["Securities Regulations", "Investment Policy", "Market Updates", "Fiduciary Rules"],
    agencies: ["SEC", "FINRA", "CFTC", "Federal Reserve"],
    keywords: ["investment", "securities", "market", "portfolio", "fiduciary", "asset"],
    color: "bg-emerald-500",
  },
  procurement: {
    name: "Procurement",
    icon: <BarChart3 className="w-4 h-4" />,
    topics: ["Procurement Regulations", "Contract Requirements", "Vendor Compliance"],
    agencies: ["GSA", "OMB", "State Procurement Offices"],
    keywords: ["procurement", "vendor", "contract", "purchasing", "bid", "rfp"],
    color: "bg-lime-500",
  },
};

// Simulated news/government activity data
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  publishedAt: Date;
  category: "government" | "industry" | "regulatory" | "announcement";
  agency?: string;
  impactLevel: "critical" | "high" | "medium" | "low" | "informational";
  deadline?: Date;
  departments: string[];
  isRead?: boolean;
}

// Generate department-specific mock news
const generateDepartmentNews = (department: string): NewsItem[] => {
  const config = DEPARTMENT_CONFIG[department];
  if (!config) return [];

  const baseNews: NewsItem[] = [
    {
      id: `${department}-1`,
      title: `New ${config.topics[0]} Requirements Effective Q2 2026`,
      summary: `${config.agencies[0]} has announced updated requirements affecting ${config.name.toLowerCase()} operations. Organizations must comply by June 30, 2026.`,
      source: config.agencies[0],
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      category: "regulatory",
      agency: config.agencies[0],
      impactLevel: "high",
      deadline: new Date("2026-06-30"),
      departments: [department],
    },
    {
      id: `${department}-2`,
      title: `Industry Update: ${config.topics[1]} Best Practices Released`,
      summary: `A comprehensive guide to ${config.topics[1].toLowerCase()} has been published, providing updated guidance for ${config.name.toLowerCase()} professionals.`,
      source: "Industry Association",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      category: "industry",
      impactLevel: "medium",
      departments: [department],
    },
    {
      id: `${department}-3`,
      title: `${config.agencies[1] || config.agencies[0]} Issues Guidance on ${config.topics[2] || config.topics[0]}`,
      summary: `New interpretive guidance clarifies compliance expectations for ${config.keywords[0]} and ${config.keywords[1]} activities.`,
      source: config.agencies[1] || config.agencies[0],
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      category: "government",
      agency: config.agencies[1] || config.agencies[0],
      impactLevel: "medium",
      departments: [department],
    },
    {
      id: `${department}-4`,
      title: `Upcoming Deadline: ${config.topics[0]} Annual Filing`,
      summary: `Reminder: Annual ${config.keywords[2]} reporting deadline is approaching. Ensure all documentation is prepared.`,
      source: config.agencies[0],
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      category: "announcement",
      agency: config.agencies[0],
      impactLevel: "critical",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      departments: [department],
    },
    {
      id: `${department}-5`,
      title: `Legislative Watch: Proposed Changes to ${config.topics[3] || config.topics[0]} Law`,
      summary: `Congress is considering legislation that could significantly impact ${config.name.toLowerCase()} requirements. Track this development closely.`,
      source: "Congressional Record",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      category: "government",
      impactLevel: "high",
      departments: [department],
    },
  ];

  return baseNews;
};

interface DepartmentNewsWidgetProps {
  department: string;
  showHeader?: boolean;
  maxItems?: number;
  compact?: boolean;
}

const impactColors: Record<string, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-500 text-white",
  informational: "bg-gray-500 text-white",
};

const categoryIcons: Record<string, React.ReactNode> = {
  government: <Landmark className="w-4 h-4" />,
  industry: <Building2 className="w-4 h-4" />,
  regulatory: <Gavel className="w-4 h-4" />,
  announcement: <Megaphone className="w-4 h-4" />,
};

export function DepartmentNewsWidget({
  department,
  showHeader = true,
  maxItems = 5,
  compact = false,
}: DepartmentNewsWidgetProps) {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "government" | "deadlines">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const config = DEPARTMENT_CONFIG[department] || DEPARTMENT_CONFIG.compliance;
  const news = generateDepartmentNews(department);

  const filteredNews = news.filter(item => {
    if (activeTab === "government") return item.category === "government" || item.category === "regulatory";
    if (activeTab === "deadlines") return !!item.deadline;
    return true;
  }).slice(0, maxItems);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const days = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const renderNewsItem = (item: NewsItem) => {
    const daysUntil = item.deadline ? getDaysUntilDeadline(item.deadline) : null;
    const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
    const isOverdue = daysUntil !== null && daysUntil < 0;

    return (
      <div
        key={item.id}
        className={`p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
          isOverdue ? "border-red-500 bg-red-50 dark:bg-red-950/20" :
          isUrgent ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" :
          "border-border"
        }`}
        onClick={() => setSelectedNews(item)}
      >
        <div className="flex items-start gap-3">
          <div className={`p-1.5 rounded ${config.color} text-white shrink-0`}>
            {categoryIcons[item.category]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-2">{item.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {item.source}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(item.publishedAt, { addSuffix: true })}
              </span>
              <Badge className={`text-xs ${impactColors[item.impactLevel]}`}>
                {item.impactLevel}
              </Badge>
            </div>
            {item.deadline && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${
                isOverdue ? "text-red-600" : isUrgent ? "text-orange-600" : "text-muted-foreground"
              }`}>
                <Clock className="w-3 h-3" />
                {isOverdue ? (
                  <span className="font-semibold">OVERDUE by {Math.abs(daysUntil!)} days</span>
                ) : (
                  <span>Deadline: {format(item.deadline, "MMM d, yyyy")} ({daysUntil} days)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {filteredNews.slice(0, 3).map(renderNewsItem)}
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <a href={`/department-news/${department}`}>View All News</a>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card>
        {showHeader && (
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className={`p-1.5 rounded ${config.color} text-white`}>
                  {config.icon}
                </div>
                {config.name} News & Updates
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
        )}
        <CardContent>
          {/* Topics & Agencies */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium mb-2">Tracking:</p>
            <div className="flex flex-wrap gap-1">
              {config.agencies.slice(0, 4).map((agency, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {agency}
                </Badge>
              ))}
              {config.topics.slice(0, 2).map((topic, i) => (
                <Badge key={`t-${i}`} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                <Newspaper className="w-4 h-4 mr-1" />
                All
              </TabsTrigger>
              <TabsTrigger value="government" className="flex-1">
                <Landmark className="w-4 h-4 mr-1" />
                Gov't
              </TabsTrigger>
              <TabsTrigger value="deadlines" className="flex-1">
                <Calendar className="w-4 h-4 mr-1" />
                Deadlines
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-3">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-2">
                  {filteredNews.length > 0 ? (
                    filteredNews.map(renderNewsItem)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No news items in this category</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNews && categoryIcons[selectedNews.category]}
              {selectedNews?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedNews?.source} • {selectedNews && formatDistanceToNow(selectedNews.publishedAt, { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>

          {selectedNews && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={impactColors[selectedNews.impactLevel]}>
                  {selectedNews.impactLevel} impact
                </Badge>
                <Badge variant="outline">
                  {selectedNews.category}
                </Badge>
                {selectedNews.agency && (
                  <Badge variant="secondary">
                    <Building2 className="w-3 h-3 mr-1" />
                    {selectedNews.agency}
                  </Badge>
                )}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">{selectedNews.summary}</p>
              </div>

              {selectedNews.deadline && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-sm">Compliance Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedNews.deadline, "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`/articles?source=${selectedNews.source}`}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Related Articles
                  </a>
                </Button>
                {selectedNews.sourceUrl && (
                  <Button variant="outline" asChild>
                    <a href={selectedNews.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Source
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DepartmentNewsWidget;
