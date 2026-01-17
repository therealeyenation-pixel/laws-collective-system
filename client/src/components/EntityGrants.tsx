import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  DollarSign,
  Calendar,
  ExternalLink,
  Target,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
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

interface GrantData {
  lastUpdated: string;
  entities: Record<string, EntityGrants>;
  applicationStrategy: {
    rule: string;
    priorityOrder: string[];
    reasoning: string;
  };
}

export default function EntityGrants() {
  const [grantData, setGrantData] = useState<GrantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<string>("luvonpurpose_temple");

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

  const handleApplyNow = (grant: Grant, entityName: string) => {
    // Store selected grant for application
    localStorage.setItem("selectedGrant", JSON.stringify({
      ...grant,
      applyingEntity: entityName,
      selectedAt: new Date().toISOString()
    }));
    toast.success(`Grant "${grant.name}" selected for ${entityName}`);
    // Navigate to grant application page
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

  const entityKeys = Object.keys(grantData.entities);
  const currentEntity = grantData.entities[selectedEntity];

  return (
    <div className="space-y-6">
      {/* Strategy Banner */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground">Application Strategy</h3>
            <p className="text-sm text-muted-foreground mt-1">{grantData.applicationStrategy.rule}</p>
            <p className="text-xs text-muted-foreground mt-2">{grantData.applicationStrategy.reasoning}</p>
          </div>
        </div>
      </Card>

      {/* Entity Tabs */}
      <Tabs value={selectedEntity} onValueChange={setSelectedEntity}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="luvonpurpose_temple" className="text-xs">Temple/508</TabsTrigger>
          <TabsTrigger value="laws_collective" className="text-xs">L.A.W.S.</TabsTrigger>
          <TabsTrigger value="real_eye_nation" className="text-xs">Real-Eye</TabsTrigger>
          <TabsTrigger value="luvonpurpose_aws" className="text-xs">LAWS, LLC</TabsTrigger>
          <TabsTrigger value="calea_freeman_trust" className="text-xs">Trust</TabsTrigger>
        </TabsList>

        {entityKeys.map((entityKey) => {
          const entity = grantData.entities[entityKey];
          return (
            <TabsContent key={entityKey} value={entityKey} className="space-y-4 mt-4">
              {/* Entity Header */}
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{entity.entityName}</h2>
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
                    {entity.grants.length} Opportunities
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
              {entityKey === "calea_freeman_trust" && entity.grantMakingOpportunities ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-accent" />
                    Grant-Making Opportunities (Trust as Funder)
                  </h3>
                  {entity.grantMakingOpportunities.map((opp) => (
                    <Card key={opp.id} className="p-4">
                      <h4 className="font-semibold text-foreground">{opp.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{opp.description}</p>
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
              ) : (
                <div className="space-y-3">
                  {entity.grants
                    .sort((a, b) => b.fitScore - a.fitScore)
                    .map((grant) => (
                      <Card key={grant.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground">{grant.name}</h4>
                              <div className={`px-2 py-0.5 rounded text-xs text-white ${getFitScoreColor(grant.fitScore)}`}>
                                {grant.fitScore}% - {getFitScoreLabel(grant.fitScore)}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{grant.funder}</p>
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
                            onClick={() => handleApplyNow(grant, entity.entityName)}
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
