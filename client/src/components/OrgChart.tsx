import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  Users, 
  Building2,
  Crown,
  Shield,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrgNode {
  id: string;
  title: string;
  name?: string;
  department: string;
  entity: string;
  tier: "tier1_executive" | "tier2_identified" | "tier3_open" | "tier4_coordinator";
  status: "filled" | "identified" | "open" | "recruiting";
  children?: OrgNode[];
}

const orgData: OrgNode = {
  id: "ceo",
  title: "Chief Executive Officer",
  name: "Cornelius Christopher",
  department: "Executive",
  entity: "LuvOnPurpose Autonomous Wealth System LLC",
  tier: "tier1_executive",
  status: "filled",
  children: [
    {
      id: "business-manager",
      title: "Business Manager",
      name: "Technical Oversight",
      department: "Business Management",
      entity: "The L.A.W.S. Collective, LLC",
      tier: "tier1_executive",
      status: "filled",
      children: [
        {
          id: "ops-coordinator-business",
          title: "Business Operations Coordinator",
          department: "Business Management",
          entity: "The L.A.W.S. Collective, LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "cfo",
      title: "Chief Financial Officer",
      name: "Amber Christopher",
      department: "Finance",
      entity: "The L.A.W.S. Collective, LLC",
      tier: "tier1_executive",
      status: "filled",
      children: [
        {
          id: "finance-ops-coordinator",
          title: "Finance Operations Coordinator",
          department: "Finance",
          entity: "The L.A.W.S. Collective, LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "lead-ops-coordinator",
      title: "Lead Operations Coordinator",
      department: "Operations",
      entity: "The L.A.W.S. Collective, LLC",
      tier: "tier4_coordinator",
      status: "recruiting",
      children: [
        {
          id: "ops-coordinator-hr",
          title: "HR Operations Coordinator",
          department: "Human Resources",
          entity: "The L.A.W.S. Collective, LLC",
          tier: "tier4_coordinator",
          status: "open"
        },
        {
          id: "ops-coordinator-qaqc",
          title: "QA/QC Operations Coordinator",
          department: "Quality Assurance",
          entity: "The L.A.W.S. Collective, LLC",
          tier: "tier4_coordinator",
          status: "open"
        },
        {
          id: "ops-coordinator-purchasing",
          title: "Purchasing Operations Coordinator",
          department: "Purchasing",
          entity: "The L.A.W.S. Collective, LLC",
          tier: "tier4_coordinator",
          status: "open"
        },
        {
          id: "ops-coordinator-operations",
          title: "Operations Coordinator",
          department: "Operations",
          entity: "LuvOnPurpose Autonomous Wealth System LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "procurement-manager",
      title: "Procurement Manager",
      department: "Procurement",
      entity: "The L.A.W.S. Collective, LLC",
      tier: "tier2_identified",
      status: "identified",
      children: [
        {
          id: "ops-coordinator-procurement",
          title: "Procurement Operations Coordinator",
          department: "Procurement",
          entity: "The L.A.W.S. Collective, LLC",
          tier: "tier4_coordinator",
          status: "open"
        },
        {
          id: "purchasing-manager",
          title: "Purchasing Manager",
          department: "Purchasing",
          entity: "The L.A.W.S. Collective, LLC",
          tier: "tier3_open",
          status: "open"
        },
        {
          id: "contracts-manager",
          title: "Contracts Manager",
          department: "Contracts",
          entity: "The L.A.W.S. Collective, LLC",
          tier: "tier2_identified",
          status: "identified",
          children: [
            {
              id: "ops-coordinator-contracts",
              title: "Contracts Operations Coordinator",
              department: "Contracts",
              entity: "The L.A.W.S. Collective, LLC",
              tier: "tier4_coordinator",
              status: "open"
            }
          ]
        }
      ]
    },
    {
      id: "education-director",
      title: "Education Director",
      name: "Cornelius Christopher",
      department: "Education",
      entity: "508-LuvOnPurpose Academy and Outreach",
      tier: "tier1_executive",
      status: "filled",
      children: [
        {
          id: "ops-coordinator-education",
          title: "Education Operations Coordinator",
          department: "Education",
          entity: "508-LuvOnPurpose Academy and Outreach",
          tier: "tier4_coordinator",
          status: "open"
        },
        {
          id: "academy-instructor",
          title: "Academy Instructor",
          department: "Education",
          entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "design-manager",
      title: "Design Manager",
      department: "Design & Creative",
      entity: "Real-Eye-Nation, LLC",
      tier: "tier2_identified",
      status: "identified",
      children: [
        {
          id: "ops-coordinator-design",
          title: "Design Operations Coordinator",
          department: "Design & Creative",
          entity: "Real-Eye-Nation, LLC",
          tier: "tier4_coordinator",
          status: "open"
        },
        {
          id: "ops-coordinator-media",
          title: "Media Operations Coordinator",
          department: "Media Production",
          entity: "Real-Eye-Nation, LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "hr-manager",
      title: "HR Manager",
      department: "Human Resources",
      entity: "The L.A.W.S. Collective, LLC",
      tier: "tier3_open",
      status: "open"
    },
    {
      id: "qaqc-manager",
      title: "QA/QC Manager",
      department: "Quality Assurance",
      entity: "The L.A.W.S. Collective, LLC",
      tier: "tier3_open",
      status: "open"
    }
  ]
};

const getTierColor = (tier: OrgNode["tier"]) => {
  switch (tier) {
    case "tier1_executive": return "bg-amber-500/10 text-amber-700 border-amber-500/30";
    case "tier2_identified": return "bg-blue-500/10 text-blue-700 border-blue-500/30";
    case "tier3_open": return "bg-purple-500/10 text-purple-700 border-purple-500/30";
    case "tier4_coordinator": return "bg-green-500/10 text-green-700 border-green-500/30";
  }
};

const getTierLabel = (tier: OrgNode["tier"]) => {
  switch (tier) {
    case "tier1_executive": return "Executive";
    case "tier2_identified": return "Identified";
    case "tier3_open": return "Open";
    case "tier4_coordinator": return "Coordinator";
  }
};

const getStatusBadge = (status: OrgNode["status"]) => {
  switch (status) {
    case "filled": return <Badge className="bg-green-500/10 text-green-700 border-green-500/30">Filled</Badge>;
    case "identified": return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/30">Candidate Identified</Badge>;
    case "open": return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30">Open Position</Badge>;
    case "recruiting": return <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/30">Actively Recruiting</Badge>;
  }
};

const getTierIcon = (tier: OrgNode["tier"]) => {
  switch (tier) {
    case "tier1_executive": return <Crown className="w-4 h-4" />;
    case "tier2_identified": return <Shield className="w-4 h-4" />;
    case "tier3_open": return <Briefcase className="w-4 h-4" />;
    case "tier4_coordinator": return <User className="w-4 h-4" />;
  }
};

interface OrgNodeCardProps {
  node: OrgNode;
  level: number;
  isLast?: boolean;
}

function OrgNodeCard({ node, level, isLast }: OrgNodeCardProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative">
      {/* Connector line */}
      {level > 0 && (
        <div className="absolute left-0 top-0 w-6 h-full">
          <div className="absolute left-0 top-0 w-6 h-6 border-l-2 border-b-2 border-border rounded-bl-lg" />
          {!isLast && <div className="absolute left-0 top-6 w-0.5 h-full bg-border" />}
        </div>
      )}
      
      <div className={cn("relative", level > 0 && "ml-6")}>
        <Card className={cn(
          "mb-2 transition-all hover:shadow-md",
          node.status === "filled" && "border-green-500/30",
          node.status === "identified" && "border-blue-500/30",
          node.status === "open" && "border-amber-500/30",
          node.status === "recruiting" && "border-purple-500/30"
        )}>
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
              {!hasChildren && <div className="w-6" />}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("p-1 rounded", getTierColor(node.tier))}>
                    {getTierIcon(node.tier)}
                  </span>
                  <h4 className="font-semibold text-sm">{node.title}</h4>
                  {getStatusBadge(node.status)}
                </div>
                
                {node.name && (
                  <p className="text-sm text-foreground mt-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {node.name}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {node.entity}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Children */}
        {hasChildren && expanded && (
          <div className="ml-3 pl-3 border-l-2 border-border">
            {node.children!.map((child, idx) => (
              <OrgNodeCard 
                key={child.id} 
                node={child} 
                level={level + 1}
                isLast={idx === node.children!.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrgChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Organization Structure
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={getTierColor("tier1_executive")}>
            <Crown className="w-3 h-3 mr-1" />
            Executive (Tier 1)
          </Badge>
          <Badge className={getTierColor("tier2_identified")}>
            <Shield className="w-3 h-3 mr-1" />
            Identified (Tier 2)
          </Badge>
          <Badge className={getTierColor("tier3_open")}>
            <Briefcase className="w-3 h-3 mr-1" />
            Open Manager (Tier 3)
          </Badge>
          <Badge className={getTierColor("tier4_coordinator")}>
            <User className="w-3 h-3 mr-1" />
            Coordinator (Tier 4)
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <OrgNodeCard node={orgData} level={0} />
      </CardContent>
    </Card>
  );
}
