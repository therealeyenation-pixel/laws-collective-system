import { useState, useEffect, createContext, useContext } from "react";
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
  Briefcase,
  Maximize2,
  Minimize2,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

interface OrgNode {
  id: string;
  title: string;
  name?: string;
  department: string;
  entity: string;
  tier: "tier1_executive" | "tier2_identified" | "tier3_open" | "tier4_coordinator";
  status: "filled" | "identified" | "open" | "recruiting";
  children?: OrgNode[];
  employeeId?: number; // Link to database employee
}

// Context for expand/collapse all
interface OrgChartContextType {
  expandAll: boolean;
  collapseAll: boolean;
  resetTrigger: number;
}

const OrgChartContext = createContext<OrgChartContextType>({
  expandAll: false,
  collapseAll: false,
  resetTrigger: 0
});

// Build org data from employees
function buildOrgDataFromEmployees(employees: any[]): OrgNode {
  // Find CEO/Matriarch
  const ceo = employees.find(e => 
    e.positionLevel === "executive" && 
    (e.jobTitle?.toLowerCase().includes("ceo") || 
     e.jobTitle?.toLowerCase().includes("chief executive") ||
     e.jobTitle?.toLowerCase().includes("matriarch"))
  );

  // Find managers
  const managers = employees.filter(e => e.positionLevel === "manager");
  
  // Build children nodes for CEO
  const ceoChildren: OrgNode[] = managers.map(manager => {
    // Find coordinators who report to this manager
    const coordinators = employees.filter(e => 
      e.reportsTo === manager.id && 
      (e.positionLevel === "coordinator" || e.positionLevel === "lead" || e.positionLevel === "specialist")
    );

    return {
      id: `manager-${manager.id}`,
      title: manager.jobTitle,
      name: `${manager.firstName} ${manager.lastName}`,
      department: manager.department,
      entity: manager.entityName || "The L.A.W.S. Collective LLC",
      tier: "tier1_executive" as const,
      status: "filled" as const,
      employeeId: manager.id,
      children: coordinators.map(coord => ({
        id: `coord-${coord.id}`,
        title: coord.jobTitle,
        name: `${coord.firstName} ${coord.lastName}`,
        department: coord.department,
        entity: coord.entityName || "The L.A.W.S. Collective LLC",
        tier: "tier4_coordinator" as const,
        status: "filled" as const,
        employeeId: coord.id
      }))
    };
  });

  return {
    id: "ceo",
    title: ceo ? ceo.jobTitle : "Chief Executive Officer",
    name: ceo ? `${ceo.firstName} ${ceo.lastName}` : "LaShanna Russell",
    department: "Executive",
    entity: ceo?.entityName || "The L.A.W.S. Collective LLC",
    tier: "tier1_executive",
    status: "filled",
    employeeId: ceo?.id,
    children: ceoChildren.length > 0 ? ceoChildren : undefined
  };
}

// Fallback static org data (used when no employees in database)
const staticOrgData: OrgNode = {
  id: "ceo",
  title: "Chief Executive Officer",
  name: "LaShanna Russell",
  department: "Executive",
  entity: "The L.A.W.S. Collective LLC",
  tier: "tier1_executive",
  status: "filled",
  children: [
    {
      id: "finance-manager",
      title: "Finance Manager",
      name: "Craig Russell",
      department: "Finance",
      entity: "The L.A.W.S. Collective LLC",
      tier: "tier1_executive",
      status: "filled",
      children: [
        {
          id: "finance-ops-coordinator",
          title: "Finance Operations Coordinator",
          department: "Finance",
          entity: "The L.A.W.S. Collective LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "education-manager",
      title: "Education Manager",
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
          entity: "508-LuvOnPurpose Academy and Outreach",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "health-manager",
      title: "Health Manager",
      name: "Amber Hunter",
      department: "Health",
      entity: "The L.A.W.S. Collective LLC",
      tier: "tier1_executive",
      status: "filled",
      children: [
        {
          id: "health-ops-coordinator",
          title: "Health Operations Coordinator",
          department: "Health",
          entity: "The L.A.W.S. Collective LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "media-manager",
      title: "Media Manager / Creative Director",
      name: "Amandes Pearsall IV",
      department: "Media",
      entity: "Real-Eye-Nation",
      tier: "tier1_executive",
      status: "filled",
      children: [
        {
          id: "media-ops-coordinator",
          title: "Media Operations Coordinator",
          department: "Media",
          entity: "Real-Eye-Nation",
          tier: "tier4_coordinator",
          status: "open"
        },
        {
          id: "content-creator",
          title: "Content Creator",
          department: "Media",
          entity: "Real-Eye-Nation",
          tier: "tier4_coordinator",
          status: "recruiting"
        }
      ]
    },
    {
      id: "design-manager",
      title: "Design Manager / Design Lead",
      name: "Essence Hunter",
      department: "Design",
      entity: "Real-Eye-Nation",
      tier: "tier1_executive",
      status: "filled",
      children: [
        {
          id: "design-ops-coordinator",
          title: "Design Operations Coordinator",
          department: "Design",
          entity: "Real-Eye-Nation",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "hr-manager",
      title: "HR Manager",
      department: "Human Resources",
      entity: "The L.A.W.S. Collective LLC",
      tier: "tier3_open",
      status: "open",
      children: [
        {
          id: "hr-ops-coordinator",
          title: "HR Operations Coordinator",
          department: "Human Resources",
          entity: "The L.A.W.S. Collective LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "operations-manager",
      title: "Operations Manager",
      department: "Operations",
      entity: "The L.A.W.S. Collective LLC",
      tier: "tier3_open",
      status: "open",
      children: [
        {
          id: "operations-coordinator",
          title: "Operations Coordinator",
          department: "Operations",
          entity: "The L.A.W.S. Collective LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "platform-admin",
      title: "Platform Administrator",
      department: "Technology",
      entity: "The L.A.W.S. Collective LLC",
      tier: "tier3_open",
      status: "open",
      children: [
        {
          id: "tech-ops-coordinator",
          title: "Technology Operations Coordinator",
          department: "Technology",
          entity: "The L.A.W.S. Collective LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "qaqc-manager",
      title: "QA/QC Manager",
      department: "Quality Assurance",
      entity: "The L.A.W.S. Collective LLC",
      tier: "tier3_open",
      status: "open",
      children: [
        {
          id: "qaqc-ops-coordinator",
          title: "QA/QC Operations Coordinator",
          department: "Quality Assurance",
          entity: "The L.A.W.S. Collective LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "procurement-manager",
      title: "Procurement Manager (Oversight)",
      department: "Procurement",
      entity: "The L.A.W.S. Collective LLC",
      tier: "tier2_identified",
      status: "identified",
      children: [
        {
          id: "procurement-ops-coordinator",
          title: "Procurement Operations Coordinator",
          department: "Procurement",
          entity: "The L.A.W.S. Collective LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "purchasing-manager",
      title: "Purchasing Manager",
      department: "Purchasing",
      entity: "The L.A.W.S. Collective LLC",
      tier: "tier2_identified",
      status: "identified",
      children: [
        {
          id: "purchasing-ops-coordinator",
          title: "Purchasing Operations Coordinator",
          department: "Purchasing",
          entity: "The L.A.W.S. Collective LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "contracts-manager",
      title: "Contracts Manager",
      department: "Contracts",
      entity: "The L.A.W.S. Collective LLC",
      tier: "tier2_identified",
      status: "identified",
      children: [
        {
          id: "contracts-ops-coordinator",
          title: "Contracts Operations Coordinator",
          department: "Contracts",
          entity: "The L.A.W.S. Collective LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "legal-manager",
      title: "Legal Manager",
      department: "Legal",
      entity: "The L.A.W.S. Collective LLC",
      tier: "tier3_open",
      status: "open",
      children: [
        {
          id: "legal-ops-coordinator",
          title: "Legal Operations Coordinator",
          department: "Legal",
          entity: "The L.A.W.S. Collective LLC",
          tier: "tier4_coordinator",
          status: "open"
        }
      ]
    },
    {
      id: "realestate-manager",
      title: "Real Estate Manager",
      department: "Real Estate",
      entity: "The L.A.W.S. Collective LLC",
      tier: "tier2_identified",
      status: "identified",
      children: [
        {
          id: "realestate-ops-coordinator",
          title: "Real Estate Operations Coordinator",
          department: "Real Estate",
          entity: "The L.A.W.S. Collective LLC",
          tier: "tier4_coordinator",
          status: "identified"
        }
      ]
    }
  ]
};

const getTierColor = (tier: OrgNode["tier"]) => {
  switch (tier) {
    case "tier1_executive": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case "tier2_identified": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "tier3_open": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "tier4_coordinator": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

const getStatusBadge = (status: OrgNode["status"]) => {
  switch (status) {
    case "filled": return <Badge className="bg-green-500/10 text-green-700 border-green-500/30">Filled</Badge>;
    case "identified": return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/30">Identified</Badge>;
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
  const context = useContext(OrgChartContext);
  
  // Expand by default: level 0-1 always, plus Purchasing Manager and Contracts Manager
  const shouldExpandByDefault = level < 2 || node.id === "purchasing-manager" || node.id === "contracts-manager";
  const [expanded, setExpanded] = useState(shouldExpandByDefault);
  const hasChildren = node.children && node.children.length > 0;

  // Handle expand/collapse all
  useEffect(() => {
    if (context.expandAll) {
      setExpanded(true);
    }
  }, [context.expandAll, context.resetTrigger]);

  useEffect(() => {
    if (context.collapseAll) {
      setExpanded(level < 1); // Keep CEO expanded
    }
  }, [context.collapseAll, context.resetTrigger, level]);

  const isOpenPosition = node.status === "open" || node.status === "recruiting";

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
                
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    {node.entity}
                  </span>
                  
                  {/* Apply Now button for open positions */}
                  {isOpenPosition && (
                    <Link href={`/careers?position=${encodeURIComponent(node.title)}`}>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-6 text-xs gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        Apply Now
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
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
  const [expandAll, setExpandAll] = useState(false);
  const [collapseAll, setCollapseAll] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Fetch employees from database
  const { data: employees, isLoading } = trpc.employees.getAll.useQuery({
    status: "active"
  });

  // Build org data from employees or use static fallback
  const orgData = employees && employees.length > 0 
    ? buildOrgDataFromEmployees(employees)
    : staticOrgData;

  const handleExpandAll = () => {
    setCollapseAll(false);
    setExpandAll(true);
    setResetTrigger(prev => prev + 1);
  };

  const handleCollapseAll = () => {
    setExpandAll(false);
    setCollapseAll(true);
    setResetTrigger(prev => prev + 1);
  };

  return (
    <OrgChartContext.Provider value={{ expandAll, collapseAll, resetTrigger }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Organization Structure
            </CardTitle>
            
            {/* Expand/Collapse All buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpandAll}
                className="gap-1"
              >
                <Maximize2 className="w-4 h-4" />
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCollapseAll}
                className="gap-1"
              >
                <Minimize2 className="w-4 h-4" />
                Collapse All
              </Button>
            </div>
          </div>
          
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <OrgNodeCard node={orgData} level={0} />
          )}
        </CardContent>
      </Card>
    </OrgChartContext.Provider>
  );
}
