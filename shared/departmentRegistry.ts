/**
 * Department Registry — Single Source of Truth
 * 
 * Central mapping that connects L.A.W.S. Collective departments to their:
 * - Manager (founding family member)
 * - Simulator/workshop type(s)
 * - Certificate type(s)
 * - Entity affiliation
 * - Dashboard route
 * 
 * This registry is the backbone of the education-first activation architecture.
 * All department dashboards, simulators, certificates, and LuvLedger entries
 * reference this registry for consistency.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DepartmentManager {
  name: string;
  title: string;
  entity: string;
}

export interface SimulatorMapping {
  type: string;           // matches simulatorCompletion.simulatorType
  label: string;          // human-readable name
  certificateType: string; // maps to certificate issuance type
  route: string;          // frontend route to the simulator
}

export interface DepartmentEntry {
  id: string;                    // unique department key
  name: string;                  // display name
  description: string;           // what this department does
  entity: string;                // legal entity affiliation
  manager: DepartmentManager;
  simulators: SimulatorMapping[];
  certificateTypes: string[];    // all certificate types this dept can issue
  dashboardRoute: string;        // route to department dashboard
  color: string;                 // brand color for UI consistency
  icon: string;                  // lucide icon name
}

// ─── Registry ────────────────────────────────────────────────────────────────

export const DEPARTMENT_REGISTRY: DepartmentEntry[] = [
  {
    id: "business",
    name: "Business",
    description: "Business formation, entity creation, and operational management",
    entity: "The L.A.W.S. Collective LLC",
    manager: {
      name: "LaShanna Russell",
      title: "CEO / Business Manager",
      entity: "The L.A.W.S. Collective LLC",
    },
    simulators: [
      {
        type: "business",
        label: "Business Formation Workshop",
        certificateType: "simulator_completion",
        route: "/business-simulator",
      },
    ],
    certificateTypes: ["simulator_completion", "contractor_certification"],
    dashboardRoute: "/business-dashboard",
    color: "#1a5c1a",
    icon: "Building2",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Financial management, grant writing, and funding acquisition",
    entity: "The L.A.W.S. Collective LLC",
    manager: {
      name: "Craig Russell",
      title: "Finance Manager",
      entity: "The L.A.W.S. Collective LLC",
    },
    simulators: [
      {
        type: "grants",
        label: "Grant Writing Workshop",
        certificateType: "simulator_completion",
        route: "/grant-simulator",
      },
    ],
    certificateTypes: ["simulator_completion"],
    dashboardRoute: "/finance-dashboard",
    color: "#2563eb",
    icon: "DollarSign",
  },
  {
    id: "education",
    name: "Education",
    description: "Academy curriculum, K-12 programs, certification courses, and training modules",
    entity: "508-LuvOnPurpose Academy and Outreach",
    manager: {
      name: "Cornelius D. Christopher",
      title: "Education Manager",
      entity: "508-LuvOnPurpose Academy and Outreach",
    },
    simulators: [
      {
        type: "other",
        label: "L.A.W.S. Foundation Course",
        certificateType: "course_completion",
        route: "/course-dashboard",
      },
    ],
    certificateTypes: [
      "course_completion",
      "mastery_certificate",
      "house_graduation",
      "language_mastery",
      "stem_mastery",
      "sovereign_diploma",
    ],
    dashboardRoute: "/education-dashboard",
    color: "#7c3aed",
    icon: "GraduationCap",
  },
  {
    id: "legal",
    name: "Legal & Contracts",
    description: "Contract management, legal compliance, and proposal development",
    entity: "The L.A.W.S. Collective LLC",
    manager: {
      name: "LaShanna Russell",
      title: "CEO / Legal Oversight",
      entity: "The L.A.W.S. Collective LLC",
    },
    simulators: [
      {
        type: "contracts",
        label: "Contracts Workshop",
        certificateType: "simulator_completion",
        route: "/contracts-simulator",
      },
      {
        type: "proposals",
        label: "Proposal Writing Workshop",
        certificateType: "simulator_completion",
        route: "/proposal-simulator",
      },
    ],
    certificateTypes: ["simulator_completion"],
    dashboardRoute: "/contracts-dashboard",
    color: "#dc2626",
    icon: "Gavel",
  },
  {
    id: "health",
    name: "Health",
    description: "Health and wellness programs, healing cycles, and emotional resilience",
    entity: "The L.A.W.S. Collective LLC",
    manager: {
      name: "Amber S. Hunter",
      title: "Health Manager",
      entity: "The L.A.W.S. Collective LLC",
    },
    simulators: [],
    certificateTypes: ["member_credential"],
    dashboardRoute: "/health-dashboard",
    color: "#ec4899",
    icon: "Heart",
  },
  {
    id: "media",
    name: "Media",
    description: "Media production, content creation, and performing arts (Real-Eye-Nation)",
    entity: "Real-Eye-Nation",
    manager: {
      name: "Amandes Pearsall IV",
      title: "Media Manager",
      entity: "Real-Eye-Nation",
    },
    simulators: [
      {
        type: "real_eye_nation",
        label: "Real-Eye-Nation Workshop",
        certificateType: "simulator_completion",
        route: "/media-simulator",
      },
    ],
    certificateTypes: ["simulator_completion"],
    dashboardRoute: "/design-dashboard",
    color: "#f59e0b",
    icon: "Video",
  },
  {
    id: "design",
    name: "Design & IT",
    description: "System design, IT infrastructure, and creative direction",
    entity: "Real-Eye-Nation",
    manager: {
      name: "Essence Hunter",
      title: "Design Manager",
      entity: "Real-Eye-Nation",
    },
    simulators: [],
    certificateTypes: [],
    dashboardRoute: "/it-dashboard",
    color: "#06b6d4",
    icon: "Cpu",
  },
  {
    id: "hr",
    name: "Human Resources",
    description: "Recruitment, onboarding, employee-to-contractor transitions, and staffing",
    entity: "The L.A.W.S. Collective LLC",
    manager: {
      name: "TBD",
      title: "HR Manager",
      entity: "The L.A.W.S. Collective LLC",
    },
    simulators: [],
    certificateTypes: ["internship_completion", "contractor_certification"],
    dashboardRoute: "/hr-dashboard",
    color: "#8b5cf6",
    icon: "Users",
  },
  {
    id: "property_assets",
    name: "Property & Assets",
    description: "Property management, asset tracking, and portfolio oversight",
    entity: "The L.A.W.S. Collective LLC",
    manager: {
      name: "TBD",
      title: "Property & Assets Manager",
      entity: "The L.A.W.S. Collective LLC",
    },
    simulators: [],
    certificateTypes: [],
    dashboardRoute: "/asset-management-dashboard",
    color: "#059669",
    icon: "Home",
  },
  {
    id: "outreach",
    name: "Outreach & Marketing",
    description: "Community outreach, donor relations, and marketing strategy",
    entity: "508-LuvOnPurpose Academy and Outreach",
    manager: {
      name: "TBD",
      title: "Outreach Manager",
      entity: "508-LuvOnPurpose Academy and Outreach",
    },
    simulators: [],
    certificateTypes: [],
    dashboardRoute: "/donor-dashboard",
    color: "#d97706",
    icon: "Megaphone",
  },
];

// ─── Lookup Helpers ──────────────────────────────────────────────────────────

/**
 * Get a department by its ID
 */
export function getDepartment(departmentId: string): DepartmentEntry | undefined {
  return DEPARTMENT_REGISTRY.find((d) => d.id === departmentId);
}

/**
 * Get the department that owns a specific simulator type
 */
export function getDepartmentBySimulatorType(simulatorType: string): DepartmentEntry | undefined {
  return DEPARTMENT_REGISTRY.find((d) =>
    d.simulators.some((s) => s.type === simulatorType)
  );
}

/**
 * Get the manager who signs certificates for a simulator type
 */
export function getSigningManager(simulatorType: string): DepartmentManager | undefined {
  const dept = getDepartmentBySimulatorType(simulatorType);
  return dept?.manager;
}

/**
 * Get the simulator mapping for a given type
 */
export function getSimulatorMapping(simulatorType: string): SimulatorMapping | undefined {
  for (const dept of DEPARTMENT_REGISTRY) {
    const sim = dept.simulators.find((s) => s.type === simulatorType);
    if (sim) return sim;
  }
  return undefined;
}

/**
 * Get all departments with active simulators
 */
export function getDepartmentsWithSimulators(): DepartmentEntry[] {
  return DEPARTMENT_REGISTRY.filter((d) => d.simulators.length > 0);
}

/**
 * Get all simulator types across all departments
 */
export function getAllSimulatorTypes(): string[] {
  return DEPARTMENT_REGISTRY.flatMap((d) => d.simulators.map((s) => s.type));
}

/**
 * Get all departments managed by a specific person
 */
export function getDepartmentsByManager(managerName: string): DepartmentEntry[] {
  return DEPARTMENT_REGISTRY.filter((d) =>
    d.manager.name.toLowerCase().includes(managerName.toLowerCase())
  );
}

/**
 * Get the full certificate context for a simulator completion
 * Used when issuing certificates and recording on LuvLedger
 */
export function getCertificateContext(simulatorType: string) {
  const dept = getDepartmentBySimulatorType(simulatorType);
  const sim = getSimulatorMapping(simulatorType);
  
  if (!dept || !sim) return null;

  return {
    department: dept,
    simulator: sim,
    signingManager: dept.manager,
    trainingManager: getDepartment("education")?.manager ?? {
      name: "Cornelius D. Christopher",
      title: "Education Manager",
      entity: "508-LuvOnPurpose Academy and Outreach",
    },
    entity: dept.entity,
    certificateType: sim.certificateType,
  };
}

// ─── Agent Type → Department Mapping ──────────────────────────────────────────
/**
 * Maps AI agent types to their corresponding department IDs.
 * Used to wire agents to department workshops for interactive training.
 * 
 * Agent types: operations→business, finance→finance, education→education,
 * hr→hr, media→media, design→design, health→health, outreach→outreach,
 * guardian→legal, analytics→finance, support→education, seo→outreach,
 * engagement→outreach, qaqc→business, purchasing→finance
 */
export const AGENT_TO_DEPARTMENT: Record<string, string> = {
  operations: "business",
  finance: "finance",
  analytics: "finance",
  education: "education",
  support: "education",
  guardian: "legal",
  hr: "hr",
  media: "media",
  design: "design",
  health: "health",
  outreach: "outreach",
  seo: "outreach",
  engagement: "outreach",
  qaqc: "business",
  purchasing: "finance",
  custom: "business",
};

/**
 * Get the department linked to an agent type
 */
export function getDepartmentForAgent(agentType: string): DepartmentEntry | undefined {
  const deptId = AGENT_TO_DEPARTMENT[agentType];
  if (!deptId) return undefined;
  return getDepartment(deptId);
}

/**
 * Get workshop content context for an agent — used to pre-load
 * department training Q&A into agent conversations (Workshop Mode)
 */
export function getWorkshopContext(agentType: string) {
  const dept = getDepartmentForAgent(agentType);
  if (!dept) return null;
  return {
    departmentId: dept.id,
    departmentName: dept.name,
    entity: dept.entity,
    manager: dept.manager,
    simulators: dept.simulators,
    certificateTypes: dept.certificateTypes,
    dashboardRoute: dept.dashboardRoute,
    color: dept.color,
    icon: dept.icon,
  };
}

/**
 * Get department statistics summary
 */
export function getRegistryStats() {
  const totalDepartments = DEPARTMENT_REGISTRY.length;
  const filledManagers = DEPARTMENT_REGISTRY.filter((d) => d.manager.name !== "TBD").length;
  const totalSimulators = DEPARTMENT_REGISTRY.reduce((acc, d) => acc + d.simulators.length, 0);
  const totalCertTypes = new Set(DEPARTMENT_REGISTRY.flatMap((d) => d.certificateTypes)).size;

  return {
    totalDepartments,
    filledManagers,
    openManagerPositions: totalDepartments - filledManagers,
    totalSimulators,
    totalCertificateTypes: totalCertTypes,
  };
}
