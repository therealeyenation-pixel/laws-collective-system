import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Calendar,
  ExternalLink,
  Target,
  FileText,
  Users,
  Heart,
  Shield,
  Accessibility,
  Sparkles,
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
  fitScore?: number;
  notes: string;
}

interface DedicatedSection {
  title: string;
  description: string;
  grants: Grant[];
}

interface GrantData {
  lastUpdated: string;
  dedicatedGrantSections?: {
    womenFocused?: DedicatedSection;
    minorityFocused?: DedicatedSection;
    veteranFocused?: DedicatedSection;
    elderlyFocused?: DedicatedSection;
  };
}

const sectionConfig = {
  womenFocused: {
    icon: <Users className="w-5 h-5" />,
    color: "pink",
    bgGradient: "from-pink-500/10 to-rose-500/10",
    borderColor: "border-pink-500/20",
    badgeColor: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  },
  minorityFocused: {
    icon: <Sparkles className="w-5 h-5" />,
    color: "purple",
    bgGradient: "from-purple-500/10 to-violet-500/10",
    borderColor: "border-purple-500/20",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
  veteranFocused: {
    icon: <Shield className="w-5 h-5" />,
    color: "blue",
    bgGradient: "from-blue-500/10 to-indigo-500/10",
    borderColor: "border-blue-500/20",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  elderlyFocused: {
    icon: <Heart className="w-5 h-5" />,
    color: "orange",
    bgGradient: "from-orange-500/10 to-amber-500/10",
    borderColor: "border-orange-500/20",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  },
};

export default function DemographicGrants() {
  const [grantData, setGrantData] = useState<GrantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>("womenFocused");

  useEffect(() => {
    fetch("/grant_opportunities.json")
      .then((res) => res.json())
      .then((data) => {
        setGrantData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading grant data:", err);
        toast.error("Failed to load grant opportunities");
        setLoading(false);
      });
  }, []);

  const handleApplyNow = (grant: Grant) => {
    localStorage.setItem(
      "selectedGrant",
      JSON.stringify({
        ...grant,
        selectedAt: new Date().toISOString(),
      })
    );
    toast.success(`Grant "${grant.name}" selected for application`);
    window.location.href = "/grant-simulator";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!grantData?.dedicatedGrantSections) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Unable to load demographic grant sections
      </div>
    );
  }

  const sections = grantData.dedicatedGrantSections;
  const availableSections = Object.entries(sections).filter(
    ([_, section]) => section && section.grants.length > 0
  );

  const renderGrantCard = (grant: Grant, sectionKey: string) => {
    const config = sectionConfig[sectionKey as keyof typeof sectionConfig];
    
    return (
      <Card
        key={grant.id}
        className={`p-4 hover:shadow-md transition-shadow border-l-4 ${config.borderColor}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{grant.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">{grant.funder}</p>
          </div>
          {grant.fitScore && (
            <Badge className={config.badgeColor}>
              {grant.fitScore}% Fit
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-medium">{grant.amount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{grant.deadline}</span>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm text-muted-foreground">
            <strong>Focus:</strong> {grant.focus}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Eligibility:</strong> {grant.eligibility}
          </p>
        </div>

        <div className="mt-3 p-2 bg-secondary/30 rounded text-xs text-muted-foreground">
          <Target className="w-3 h-3 inline mr-1" />
          {grant.notes}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => handleApplyNow(grant)}
            className="gap-1"
          >
            <FileText className="w-4 h-4" />
            Start Application
          </Button>
          {grant.url && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(grant.url, "_blank")}
              className="gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Learn More
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" />
          Demographic-Specific Grant Opportunities
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Explore grants specifically designed for women, minorities, veterans, and seniors. 
          These opportunities are curated to help underrepresented groups access funding 
          for business development, community programs, and creative projects.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {sections.womenFocused?.grants.length || 0} Women-Focused
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {sections.minorityFocused?.grants.length || 0} Minority-Focused
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {sections.veteranFocused?.grants.length || 0} Veteran-Focused
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {sections.elderlyFocused?.grants.length || 0} Senior-Focused
          </Badge>
        </div>
      </Card>

      {/* Section Tabs */}
      <Tabs value={selectedSection} onValueChange={setSelectedSection}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="womenFocused" className="flex items-center gap-1 text-xs">
            <Users className="w-4 h-4" />
            Women
          </TabsTrigger>
          <TabsTrigger value="minorityFocused" className="flex items-center gap-1 text-xs">
            <Sparkles className="w-4 h-4" />
            Minority
          </TabsTrigger>
          <TabsTrigger value="veteranFocused" className="flex items-center gap-1 text-xs">
            <Shield className="w-4 h-4" />
            Veterans
          </TabsTrigger>
          <TabsTrigger value="elderlyFocused" className="flex items-center gap-1 text-xs">
            <Heart className="w-4 h-4" />
            Seniors
          </TabsTrigger>
        </TabsList>

        {availableSections.map(([key, section]) => {
          const config = sectionConfig[key as keyof typeof sectionConfig];
          if (!section) return null;

          return (
            <TabsContent key={key} value={key} className="space-y-4 mt-4">
              {/* Section Header */}
              <Card className={`p-4 bg-gradient-to-r ${config.bgGradient} ${config.borderColor}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-${config.color}-500/20`}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{section.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  </div>
                  <Badge className="ml-auto" variant="secondary">
                    {section.grants.length} Grants
                  </Badge>
                </div>
              </Card>

              {/* Grant List */}
              <div className="grid gap-4">
                {section.grants.map((grant) => renderGrantCard(grant, key))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Tips Section */}
      <Card className="p-4 bg-secondary/30">
        <h4 className="font-semibold text-foreground mb-2">
          💡 Application Tips
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            • <strong>Stack your eligibility:</strong> If you qualify for multiple categories 
            (e.g., woman + minority + veteran), apply to grants in all applicable categories.
          </li>
          <li>
            • <strong>Monthly grants:</strong> Some grants like Amber Grant accept applications 
            monthly - apply every month for better chances.
          </li>
          <li>
            • <strong>Certification matters:</strong> Get certified (WBENC for women, NMSDC for 
            minorities) to unlock corporate contracts and additional funding.
          </li>
          <li>
            • <strong>Tell your story:</strong> Many demographic-specific grants value personal 
            narrative - share your journey authentically.
          </li>
        </ul>
      </Card>

      {/* Last Updated */}
      <p className="text-xs text-muted-foreground text-center">
        Grant database last updated: {grantData.lastUpdated}
      </p>
    </div>
  );
}
