import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  DollarSign,
  Calendar,
  ExternalLink,
  Target,
  FileText,
  Clock,
  AlertCircle,
  Users,
  Heart,
  Shield,
  Globe,
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
  region?: string;
  country?: string;
}

interface EntityGrants {
  entityName: string;
  entityType: string;
  ein: string;
  state: string;
  grantCategories: string[];
  grants: Grant[];
  grantMakingOpportunities?: Array<{
    id: string;
    name: string;
    description: string;
    suggestedAmount: string;
    frequency: string;
  }>;
}

interface DemographicCategory {
  label: string;
  description: string;
  icon: string;
}

interface GrantData {
  lastUpdated: string;
  demographicCategories: Record<string, DemographicCategory>;
  entities: Record<string, EntityGrants>;
  dedicatedGrantSections?: {
    womenFocused?: { title: string; description: string; grants: Grant[] };
    minorityFocused?: { title: string; description: string; grants: Grant[] };
    veteranFocused?: { title: string; description: string; grants: Grant[] };
    elderlyFocused?: { title: string; description: string; grants: Grant[] };
  };
  applicationStrategy: {
    rule: string;
    priorityOrder: string[];
    reasoning: string;
    demographicStrategy?: string;
  };
}

const demographicIcons: Record<string, React.ReactNode> = {
  women: <Users className="w-4 h-4 text-pink-500" />,
  minority: <Users className="w-4 h-4 text-purple-500" />,
  veteran: <Shield className="w-4 h-4 text-blue-500" />,
  elderly: <Heart className="w-4 h-4 text-orange-500" />,
  lgbtq: <Heart className="w-4 h-4 text-rainbow" />,
  disabled: <Heart className="w-4 h-4 text-teal-500" />,
  general: <Globe className="w-4 h-4 text-green-500" />,
};

export default function EntityGrants() {
  const [grantData, setGrantData] = useState<GrantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<string>("luvonpurpose_temple");
  const [demographicFilter, setDemographicFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

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

  const getFitScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-yellow-500";
    if (score >= 70) return "bg-orange-500";
    return "bg-red-500";
  };

  const getFitScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent Fit";
    if (score >= 80) return "Good Fit";
    if (score >= 70) return "Moderate Fit";
    return "Review Carefully";
  };

  const filterGrantsByDemographic = (grants: Grant[]) => {
    if (demographicFilter === "all") return grants;
    return grants.filter(
      (grant) => grant.demographics?.includes(demographicFilter)
    );
  };

  const filterGrantsByRegion = (grants: Grant[]) => {
    if (regionFilter === "all") return grants;
    if (regionFilter === "domestic") {
      return grants.filter((grant) => !grant.region || grant.region === "domestic" || grant.region === "usa");
    }
    if (regionFilter === "international") {
      return grants.filter((grant) => grant.region && grant.region !== "domestic" && grant.region !== "usa");
    }
    return grants.filter((grant) => grant.region === regionFilter || grant.country === regionFilter);
  };

  const applyAllFilters = (grants: Grant[]) => {
    let filtered = filterGrantsByDemographic(grants);
    filtered = filterGrantsByRegion(filtered);
    return filtered;
  };

  const getDemographicBadges = (demographics?: string[]) => {
    if (!demographics || demographics.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {demographics.map((demo) => (
          <Badge
            key={demo}
            variant="outline"
            className="text-xs flex items-center gap-1"
          >
            {demographicIcons[demo]}
            {grantData?.demographicCategories?.[demo]?.label || demo}
          </Badge>
        ))}
      </div>
    );
  };

  const handleApplyNow = (grant: Grant, entityName: string) => {
    localStorage.setItem(
      "selectedGrant",
      JSON.stringify({
        ...grant,
        applyingEntity: entityName,
        selectedAt: new Date().toISOString(),
      })
    );
    toast.success(`Grant "${grant.name}" selected for ${entityName}`);
    window.location.href = "/grant-simulator";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!grantData) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Unable to load grant opportunities
      </div>
    );
  }

  const entityKeys = Object.keys(grantData.entities).filter(
    (key) => key !== "calea_freeman_trust"
  );

  // Count grants by demographic
  const demographicCounts: Record<string, number> = {};
  Object.values(grantData.entities).forEach((entity) => {
    entity.grants.forEach((grant) => {
      grant.demographics?.forEach((demo) => {
        demographicCounts[demo] = (demographicCounts[demo] || 0) + 1;
      });
    });
  });

  return (
    <div className="space-y-6">
      {/* Strategy Banner */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground">
              Application Strategy
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {grantData.applicationStrategy.rule}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {grantData.applicationStrategy.reasoning}
            </p>
            {grantData.applicationStrategy.demographicStrategy && (
              <p className="text-xs text-accent mt-2 font-medium">
                💡 {grantData.applicationStrategy.demographicStrategy}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Demographic Filter */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">
              Filter by Eligibility:
            </span>
          </div>
          <Select value={demographicFilter} onValueChange={setDemographicFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Grants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grants</SelectItem>
              <SelectItem value="women">
                Women-Focused ({demographicCounts["women"] || 0})
              </SelectItem>
              <SelectItem value="minority">
                Minority-Focused ({demographicCounts["minority"] || 0})
              </SelectItem>
              <SelectItem value="veteran">
                Veteran-Focused ({demographicCounts["veteran"] || 0})
              </SelectItem>
              <SelectItem value="elderly">
                Senior/Elderly ({demographicCounts["elderly"] || 0})
              </SelectItem>
              <SelectItem value="lgbtq">
                LGBTQ+ ({demographicCounts["lgbtq"] || 0})
              </SelectItem>
              <SelectItem value="disabled">
                Disability-Focused ({demographicCounts["disabled"] || 0})
              </SelectItem>
              <SelectItem value="general">
                All-Inclusive ({demographicCounts["general"] || 0})
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Region Filter */}
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="domestic">🇺🇸 Domestic (USA)</SelectItem>
              <SelectItem value="international">🌍 International</SelectItem>
              <SelectItem value="caribbean">🌴 Caribbean</SelectItem>
              <SelectItem value="africa">🌍 Africa</SelectItem>
              <SelectItem value="europe">🇪🇺 Europe</SelectItem>
              <SelectItem value="asia">🌏 Asia</SelectItem>
              <SelectItem value="latam">🌎 Latin America</SelectItem>
              <SelectItem value="global">🌐 Global/Multi-Region</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge
            variant={demographicFilter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setDemographicFilter("all")}
          >
            All
          </Badge>
          <Badge
            variant={demographicFilter === "women" ? "default" : "outline"}
            className="cursor-pointer flex items-center gap-1"
            onClick={() => setDemographicFilter("women")}
          >
            <Users className="w-3 h-3" /> Women
          </Badge>
          <Badge
            variant={demographicFilter === "minority" ? "default" : "outline"}
            className="cursor-pointer flex items-center gap-1"
            onClick={() => setDemographicFilter("minority")}
          >
            <Users className="w-3 h-3" /> Minority
          </Badge>
          <Badge
            variant={demographicFilter === "veteran" ? "default" : "outline"}
            className="cursor-pointer flex items-center gap-1"
            onClick={() => setDemographicFilter("veteran")}
          >
            <Shield className="w-3 h-3" /> Veteran
          </Badge>
          <Badge
            variant={demographicFilter === "elderly" ? "default" : "outline"}
            className="cursor-pointer flex items-center gap-1"
            onClick={() => setDemographicFilter("elderly")}
          >
            <Heart className="w-3 h-3" /> Senior
          </Badge>
          <Badge
            variant={demographicFilter === "lgbtq" ? "default" : "outline"}
            className="cursor-pointer flex items-center gap-1"
            onClick={() => setDemographicFilter("lgbtq")}
          >
            LGBTQ+
          </Badge>
          <Badge
            variant={demographicFilter === "disabled" ? "default" : "outline"}
            className="cursor-pointer flex items-center gap-1"
            onClick={() => setDemographicFilter("disabled")}
          >
            Disability
          </Badge>
        </div>
      </Card>

      {/* Entity Tabs */}
      <Tabs value={selectedEntity} onValueChange={setSelectedEntity}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="luvonpurpose_temple" className="text-xs">
            Temple/508
          </TabsTrigger>
          <TabsTrigger value="laws_collective" className="text-xs">
            L.A.W.S.
          </TabsTrigger>
          <TabsTrigger value="real_eye_nation" className="text-xs">
            Real-Eye
          </TabsTrigger>
          <TabsTrigger value="luvonpurpose_aws" className="text-xs">
            LAWS, LLC
          </TabsTrigger>
        </TabsList>

        {entityKeys.map((entityKey) => {
          const entity = grantData.entities[entityKey];
          const filteredGrants = applyAllFilters(entity.grants);

          return (
            <TabsContent
              key={entityKey}
              value={entityKey}
              className="space-y-4 mt-4"
            >
              {/* Entity Header */}
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {entity.entityName}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {entity.entityType}
                      </span>
                      <span>EIN: {entity.ein}</span>
                      <span>{entity.state}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {filteredGrants.length} of {entity.grants.length}{" "}
                    Opportunities
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {entity.grantCategories.map((cat, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Grant Opportunities */}
              {entityKey === "calea_freeman_trust" &&
              entity.grantMakingOpportunities ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-accent" />
                    Grant-Making Opportunities (Trust as Funder)
                  </h3>
                  {entity.grantMakingOpportunities.map((opp) => (
                    <Card key={opp.id} className="p-4">
                      <h4 className="font-semibold text-foreground">
                        {opp.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {opp.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1 text-green-600">
                          <DollarSign className="w-4 h-4" />
                          {opp.suggestedAmount}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {opp.frequency}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredGrants.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No grants match the selected filter for this entity.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => { setDemographicFilter("all"); setRegionFilter("all"); }}
                  >
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredGrants
                    .sort((a, b) => b.fitScore - a.fitScore)
                    .map((grant) => (
                      <Card
                        key={grant.id}
                        className="p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-foreground">
                                {grant.name}
                              </h4>
                              <div
                                className={`px-2 py-0.5 rounded text-xs text-white ${getFitScoreColor(grant.fitScore)}`}
                              >
                                {grant.fitScore}% - {getFitScoreLabel(grant.fitScore)}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {grant.funder}
                            </p>
                            {getDemographicBadges(grant.demographics)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span>{grant.amount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>{grant.deadline}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground">
                            <strong>Focus:</strong> {grant.focus}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
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
                            onClick={() =>
                              handleApplyNow(grant, entity.entityName)
                            }
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
                              View Details
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Last Updated */}
      <p className="text-xs text-muted-foreground text-center">
        Grant database last updated: {grantData.lastUpdated}
      </p>
    </div>
  );
}
