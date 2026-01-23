import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LayoutDashboard, LogOut, PanelLeft, Users, Shield, Coins, 
  BookOpen, GraduationCap, Rocket, FileText, Bot, Share2, Building2, 
  DollarSign, Home, Settings, PieChart, Gavel, Globe2, ArrowLeft, Play, 
  Gift, Calculator, RefreshCw, BarChart3, ClipboardList, Briefcase, 
  UserCircle, UserPlus, FolderKanban, Award, Music, Palette, Package, 
  Gamepad2, ChevronRight, ShoppingCart, FileSignature, FolderOpen,
  CreditCard, Heart, Landmark, FileCheck, Truck, Building, MapPin, Eye,
  Crown, Scale, Layers, CheckCircle, AlertTriangle, Monitor, Search,
  Wrench, Clipboard, Video, MessageSquare, Download, ClipboardCheck
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { NotificationCenter } from "./NotificationCenter";
import { WhatsNewButton } from "./WhatsNew";

// Access levels: user (member), staff, admin, owner
type AccessLevel = "user" | "staff" | "admin" | "owner";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  minRole: AccessLevel;
}

interface SubCategory {
  icon: any;
  label: string;
  minRole: AccessLevel;
  items: MenuItem[];
}

interface MenuCategory {
  icon: any;
  label: string;
  minRole: AccessLevel;
  items?: MenuItem[];
  subCategories?: SubCategory[];
  defaultOpen?: boolean;
}

// Role hierarchy for permission checking
const roleHierarchy: Record<AccessLevel, number> = {
  user: 1,
  staff: 2,
  admin: 3,
  owner: 4,
};

const hasAccess = (userRole: AccessLevel | undefined, requiredRole: AccessLevel): boolean => {
  if (!userRole) return false;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

const menuCategories: MenuCategory[] = [
  // TRUST - Top Level Governance
  {
    icon: Crown,
    label: "Trust",
    minRole: "admin",
    defaultOpen: false,
    items: [
      { icon: Shield, label: "Trust Governance", path: "/trust-governance", minRole: "owner" },
      { icon: CheckCircle, label: "Owner Action List", path: "/owner-actions", minRole: "owner" },
      { icon: Scale, label: "Trust Structure", path: "/trust-structure", minRole: "admin" },
      { icon: Eye, label: "Entity Structure", path: "/entity-structure", minRole: "admin" },
      { icon: Layers, label: "System Overview", path: "/system-overview", minRole: "owner" },
      { icon: Settings, label: "Owner Setup", path: "/owner-setup", minRole: "owner" },
      { icon: Building2, label: "House Management", path: "/houses", minRole: "admin" },
    ]
  },

  // L.A.W.S. ACADEMY - Education Entity
  {
    icon: GraduationCap,
    label: "L.A.W.S. Academy",
    minRole: "user",
    defaultOpen: false,
    items: [
      { icon: GraduationCap, label: "Academy Dashboard", path: "/academy", minRole: "user" },
      { icon: Gamepad2, label: "Game Center", path: "/game-center", minRole: "user" },
      { icon: Play, label: "Business Simulator", path: "/business-simulator", minRole: "user" },
      { icon: FileText, label: "Business Plan Simulator", path: "/business-plan-simulator", minRole: "user" },
      { icon: BookOpen, label: "Grant Simulator", path: "/grant-simulator", minRole: "user" },
      { icon: Calculator, label: "Tax Simulator", path: "/tax-simulator", minRole: "user" },
      { icon: FileText, label: "Proposal Simulator", path: "/proposal-simulator", minRole: "staff" },
      { icon: GraduationCap, label: "Scholarships", path: "/scholarships", minRole: "staff" },
      { icon: Rocket, label: "Specialist Tracks", path: "/specialist-tracks", minRole: "staff" },
      { icon: BookOpen, label: "Training Content", path: "/training-content", minRole: "admin" },
    ]
  },

  // REAL EYE - Media/Creative Entity
  {
    icon: Eye,
    label: "Real Eye",
    minRole: "staff",
    defaultOpen: false,
    items: [
      { icon: Eye, label: "Real Eye Dashboard", path: "/real-eye-dashboard", minRole: "staff" },
      { icon: Palette, label: "Design Department", path: "/design-department", minRole: "staff" },
      { icon: Music, label: "Creative Enterprise", path: "/creative-enterprise", minRole: "staff" },
      { icon: Share2, label: "Social Media", path: "/social-media", minRole: "staff" },
    ]
  },

  // L.A.W.S. COLLECTIVE - Operating Company with Departments
  {
    icon: Building2,
    label: "L.A.W.S. Collective",
    minRole: "staff",
    defaultOpen: true,
    subCategories: [
      // Dashboards
      {
        icon: LayoutDashboard,
        label: "Dashboards",
        minRole: "staff",
        items: [
          { icon: Briefcase, label: "Executive Dashboard", path: "/executive-dashboard", minRole: "admin" },
          { icon: LayoutDashboard, label: "Business Dashboard", path: "/dashboard", minRole: "staff" },
          { icon: BarChart3, label: "Operations Dashboard", path: "/operations-dashboard", minRole: "staff" },
        ]
      },
      // Communications & Meetings
      {
        icon: Video,
        label: "Communications",
        minRole: "user",
        items: [
          { icon: Video, label: "Meetings", path: "/meetings", minRole: "user" },
          { icon: MessageSquare, label: "Team Chat", path: "/meetings?tab=chat", minRole: "user" },
          { icon: Download, label: "Downloads", path: "/downloads", minRole: "user" },
        ]
      },
      // Business Department (LaShanna K. Russell - CEO) - Ground Zero
      {
        icon: Briefcase,
        label: "Business",
        minRole: "user",
        items: [
          { icon: Briefcase, label: "Business Dashboard", path: "/dept/business", minRole: "user" },
          { icon: Play, label: "Business Simulator", path: "/business-simulator", minRole: "user" },
          { icon: FileText, label: "Business Plans", path: "/business-plans", minRole: "user" },
          { icon: Building2, label: "Business Formation", path: "/business-formation", minRole: "user" },
          { icon: FileText, label: "Operating Agreements", path: "/operating-agreements", minRole: "user" },
          { icon: BarChart3, label: "SWOT Analysis", path: "/swot-analysis", minRole: "user" },
          { icon: Building2, label: "Organization Setup", path: "/genesis", minRole: "admin" },
          { icon: Building2, label: "Business Setup", path: "/business-setup", minRole: "admin" },
          { icon: FileText, label: "Upload Business Plan", path: "/business-plan-upload", minRole: "admin" },
          { icon: Gavel, label: "Board Meetings", path: "/board-meetings", minRole: "admin" },
          { icon: Globe2, label: "International Business", path: "/international-business", minRole: "admin" },
          { icon: Landmark, label: "Foundation", path: "/foundation", minRole: "admin" },
          { icon: Users, label: "Team", path: "/business-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/business-documents", minRole: "staff" },
        ]
      },
      // Health Department (Amber S. Hunter)
      {
        icon: Heart,
        label: "Health",
        minRole: "staff",
        items: [
          { icon: Heart, label: "Health Dashboard", path: "/dept/health", minRole: "staff" },
          { icon: Users, label: "Wellness Programs", path: "/wellness-programs", minRole: "staff" },
          { icon: Play, label: "Health Simulator", path: "/health-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/health-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/health-documents", minRole: "staff" },
        ]
      },
      // Education Department (Cornelius Christopher)
      {
        icon: GraduationCap,
        label: "Education",
        minRole: "staff",
        items: [
          { icon: GraduationCap, label: "Education Dashboard", path: "/dept/education", minRole: "staff" },
          { icon: BookOpen, label: "Curriculum", path: "/curriculum", minRole: "staff" },
          { icon: Users, label: "Instructors", path: "/instructors", minRole: "staff" },
          { icon: Play, label: "Education Simulator", path: "/education-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/education-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/education-documents", minRole: "staff" },
        ]
      },
      // Design Department (Essence M. Hunter)
      {
        icon: Palette,
        label: "Design",
        minRole: "staff",
        items: [
          { icon: Palette, label: "Design Dashboard", path: "/dept/design", minRole: "staff" },
          { icon: Palette, label: "Brand Assets", path: "/brand-assets", minRole: "staff" },
          { icon: Play, label: "Design Simulator", path: "/design-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/design-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/design-documents", minRole: "staff" },
        ]
      },
      // Media Department (Amandes Pearsall IV)
      {
        icon: Music,
        label: "Media",
        minRole: "staff",
        items: [
          { icon: Music, label: "Media Dashboard", path: "/dept/media", minRole: "staff" },
          { icon: Share2, label: "Content Calendar", path: "/content-calendar", minRole: "staff" },
          { icon: Play, label: "Media Simulator", path: "/media-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/media-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/media-documents", minRole: "staff" },
        ]
      },
// Finance Department (Craig Russell)
      {
        icon: DollarSign,
        label: "Finance",
        minRole: "staff",
        items: [
          { icon: DollarSign, label: "Finance Dashboard", path: "/dept/finance", minRole: "staff" },
          { icon: DollarSign, label: "Financial Automation", path: "/financial-automation", minRole: "staff" },
          { icon: Coins, label: "Banking & Credit", path: "/banking", minRole: "staff" },
          { icon: PieChart, label: "Revenue Sharing", path: "/revenue-sharing", minRole: "admin" },
          { icon: CreditCard, label: "Pricing", path: "/pricing", minRole: "admin" },
          { icon: Play, label: "Finance Simulator", path: "/finance-simulator", minRole: "staff" },
          { icon: Clipboard, label: "Timekeeping", path: "/dept/finance/timekeeping", minRole: "staff" },
          { icon: Share2, label: "External Integrations", path: "/dept/finance/integrations", minRole: "staff" },
          { icon: FileText, label: "Grant Labor Reports", path: "/dept/finance/grant-labor-reports", minRole: "staff" },
          { icon: DollarSign, label: "Payroll", path: "/dept/finance/payroll", minRole: "staff" },
          { icon: Users, label: "Team", path: "/finance-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/finance-documents", minRole: "staff" },
        ]
      },
      // HR & People
      {
        icon: Users,
        label: "HR & People",
        minRole: "staff",
        items: [
          { icon: Users, label: "HR Dashboard", path: "/dept/hr", minRole: "staff" },
          { icon: ClipboardCheck, label: "Performance Reviews", path: "/performance-reviews", minRole: "staff" },
          { icon: Users, label: "HR Management", path: "/hr-management", minRole: "staff" },
          { icon: Users, label: "Employee Directory", path: "/employees", minRole: "staff" },
          { icon: Users, label: "Position Management", path: "/positions", minRole: "staff" },
          { icon: UserPlus, label: "Position Requisitions", path: "/requisitions", minRole: "staff" },
          { icon: UserPlus, label: "Onboarding", path: "/onboarding", minRole: "staff" },
          { icon: Users, label: "Family Onboarding", path: "/family-onboarding", minRole: "admin" },
          { icon: Award, label: "Resume Builder", path: "/resume-builder", minRole: "staff" },
          { icon: FileSignature, label: "Offer Letters", path: "/offer-letters", minRole: "staff" },
          { icon: Play, label: "HR Simulator", path: "/hr-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/hr-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/hr-documents", minRole: "staff" },
        ]
      },
      // Operations Department (Open)
      {
        icon: Wrench,
        label: "Operations",
        minRole: "staff",
        items: [
          { icon: Wrench, label: "Operations Dashboard", path: "/dept/operations", minRole: "staff" },
          { icon: FileText, label: "Operating Procedures", path: "/procedures", minRole: "staff" },
          { icon: Play, label: "Operations Simulator", path: "/operations-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/operations-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/operations-documents", minRole: "staff" },
        ]
      },
      // Procurement Department (Maia Rylandlesesene)
      {
        icon: ShoppingCart,
        label: "Procurement",
        minRole: "staff",
        items: [
          { icon: ShoppingCart, label: "Procurement Dashboard", path: "/dept/procurement", minRole: "staff" },
          { icon: ShoppingCart, label: "Purchase Requests", path: "/purchase-requests", minRole: "staff" },
          { icon: FileText, label: "RFP Generator", path: "/rfp-generator", minRole: "staff" },
          { icon: Package, label: "Procurement Catalog", path: "/procurement-catalog", minRole: "staff" },
          { icon: Search, label: "Vendor Management", path: "/vendor-management", minRole: "staff" },
          { icon: Play, label: "Procurement Simulator", path: "/procurement-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/procurement-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/procurement-documents", minRole: "staff" },
        ]
      },
      // Contracts Department (Roshonda Parker)
      {
        icon: FileCheck,
        label: "Contracts",
        minRole: "staff",
        items: [
          { icon: FileCheck, label: "Contracts Dashboard", path: "/dept/contracts", minRole: "staff" },
          { icon: FileCheck, label: "Contract Management", path: "/contract-management", minRole: "staff" },
          { icon: FileText, label: "Contractor Agreements", path: "/contractor-agreements", minRole: "staff" },
          { icon: Play, label: "Contracts Simulator", path: "/contracts-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/contracts-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/contracts-documents", minRole: "staff" },
        ]
      },
      // Purchasing Department (Latisha Cox)
      {
        icon: Truck,
        label: "Purchasing",
        minRole: "staff",
        items: [
          { icon: Truck, label: "Purchasing Dashboard", path: "/dept/purchasing", minRole: "staff" },
          { icon: Package, label: "Inventory", path: "/inventory", minRole: "staff" },
          { icon: Play, label: "Purchasing Simulator", path: "/purchasing-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/purchasing-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/purchasing-documents", minRole: "staff" },
        ]
      },
      // Property Department (Talbert Cox)
      {
        icon: Building,
        label: "Property",
        minRole: "staff",
        items: [
          { icon: Building, label: "Property Dashboard", path: "/dept/property", minRole: "staff" },
          { icon: Building, label: "Property Management", path: "/dept/property/management", minRole: "staff" },
          { icon: Package, label: "Software Licenses", path: "/software-licenses", minRole: "staff" },
          { icon: Clipboard, label: "Asset Tracking", path: "/asset-tracking", minRole: "staff" },
          { icon: Play, label: "Property Simulator", path: "/property-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/property-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/property-documents", minRole: "staff" },
        ]
      },
      // Real Estate Department (Kenneth Coleman, Treiva Hunter)
      {
        icon: MapPin,
        label: "Real Estate",
        minRole: "staff",
        items: [
          { icon: MapPin, label: "Real Estate Dashboard", path: "/dept/real-estate", minRole: "staff" },
          { icon: Building2, label: "Properties", path: "/properties", minRole: "staff" },
          { icon: Play, label: "Real Estate Simulator", path: "/real-estate-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/real-estate-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/real-estate-documents", minRole: "staff" },
        ]
      },
      // Project Controls Department (Christopher Battle Sr.)
      {
        icon: FolderKanban,
        label: "Project Controls",
        minRole: "staff",
        items: [
          { icon: FolderKanban, label: "Project Controls Dashboard", path: "/dept/project-controls", minRole: "staff" },
          { icon: FolderKanban, label: "Project Controls", path: "/project-controls", minRole: "staff" },
          { icon: BarChart3, label: "Progress Reporting", path: "/progress-reporting", minRole: "staff" },
          { icon: Play, label: "Project Controls Simulator", path: "/project-controls-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/project-controls-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/project-controls-documents", minRole: "staff" },
        ]
      },
      // QA/QC Department (Open)
      {
        icon: CheckCircle,
        label: "QA/QC",
        minRole: "staff",
        items: [
          { icon: CheckCircle, label: "QA/QC Dashboard", path: "/dept/qaqc", minRole: "staff" },
          { icon: ClipboardList, label: "Quality Standards", path: "/quality-standards", minRole: "staff" },
          { icon: FileText, label: "Procedures", path: "/procedures", minRole: "staff" },
          { icon: FileCheck, label: "Audits", path: "/audits", minRole: "staff" },
          { icon: Play, label: "QA/QC Simulator", path: "/qaqc-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/qaqc-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/qaqc-documents", minRole: "staff" },
        ]
      },
      // Legal/Compliance Department (Open)
      {
        icon: Scale,
        label: "Legal/Compliance",
        minRole: "staff",
        items: [
          { icon: Scale, label: "Legal Dashboard", path: "/dept/legal", minRole: "staff" },
          { icon: AlertTriangle, label: "Compliance", path: "/compliance", minRole: "staff" },
          { icon: Gavel, label: "Legal Documents", path: "/legal-documents", minRole: "staff" },
          { icon: Play, label: "Legal Simulator", path: "/legal-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/legal-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/legal-documents", minRole: "staff" },
        ]
      },
      // IT Department (Amandes Pearsall IV)
      {
        icon: Monitor,
        label: "IT",
        minRole: "staff",
        items: [
          { icon: Monitor, label: "IT Dashboard", path: "/dept/it", minRole: "staff" },
          { icon: Settings, label: "System Administration", path: "/system-admin", minRole: "staff" },
          { icon: Shield, label: "Security Center", path: "/security-center", minRole: "staff" },
          { icon: Play, label: "IT Simulator", path: "/it-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/it-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/it-documents", minRole: "staff" },
        ]
      },
      // Platform Administration (Open)
      {
        icon: Settings,
        label: "Platform Admin",
        minRole: "admin",
        items: [
          { icon: Settings, label: "Platform Dashboard", path: "/dept/platform-admin", minRole: "admin" },
          { icon: FileText, label: "Document Admin", path: "/admin/documents", minRole: "admin" },
          { icon: Settings, label: "System Settings", path: "/system-settings", minRole: "admin" },
          { icon: Users, label: "User Management", path: "/user-management", minRole: "admin" },
          { icon: Play, label: "Platform Simulator", path: "/platform-simulator", minRole: "admin" },
          { icon: Users, label: "Team", path: "/platform-team", minRole: "admin" },
          { icon: FolderOpen, label: "Documents", path: "/platform-documents", minRole: "admin" },
          { icon: FileText, label: "Changelog", path: "/changelog", minRole: "admin" },
        ]
      },
      // Grants & Funding
      {
        icon: Gift,
        label: "Grants & Funding",
        minRole: "staff",
        items: [
          { icon: Gift, label: "Grants Dashboard", path: "/grants-dashboard", minRole: "staff" },
          { icon: Gift, label: "Grant Management", path: "/grants", minRole: "staff" },
          { icon: Gift, label: "Grant Tracking", path: "/grant-tracking", minRole: "staff" },
          { icon: FileText, label: "Grant Documents", path: "/grant-documents", minRole: "staff" },
          { icon: Play, label: "Grants Simulator", path: "/grants-simulator", minRole: "staff" },
          { icon: Users, label: "Team", path: "/grants-team", minRole: "staff" },
          { icon: FolderOpen, label: "Documents", path: "/grants-documents", minRole: "staff" },
        ]
      },
      // Communication
      {
        icon: MessageSquare,
        label: "Communication",
        minRole: "user",
        items: [
          { icon: MessageSquare, label: "Chat", path: "/chat", minRole: "user" },
          { icon: Video, label: "Meetings", path: "/meetings", minRole: "user" },
        ]
      },
      // Documents
      {
        icon: FolderOpen,
        label: "Documents",
        minRole: "staff",
        items: [
          { icon: FileText, label: "Document Vault", path: "/vault", minRole: "staff" },
        ]
      },
      // AI & Automation
      {
        icon: Bot,
        label: "AI & Automation",
        minRole: "staff",
        items: [
          { icon: Bot, label: "Agents", path: "/agents", minRole: "staff" },
        ]
      },

    ]
  },

  // MY ACCOUNT - Personal
  {
    icon: UserCircle,
    label: "My Account",
    minRole: "user",
    defaultOpen: false,
    items: [
      { icon: UserCircle, label: "My Profile", path: "/my-profile", minRole: "user" },
      { icon: Home, label: "My House", path: "/house", minRole: "user" },
      { icon: Rocket, label: "Getting Started", path: "/getting-started", minRole: "user" },
    ]
  },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = getLoginUrl();
    return <DashboardLayoutSkeleton />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout, refreshSession } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const userRole = (user?.role as AccessLevel) || "user";
  const isMobile = useIsMobile();
  
  // Track which categories and subcategories are open
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuCategories.forEach(cat => {
      if (cat.defaultOpen) initial[cat.label] = true;
    });
    return initial;
  });
  const [openSubCategories, setOpenSubCategories] = useState<Record<string, boolean>>({});

  // Get all items for finding active menu
  const getAllItems = (): MenuItem[] => {
    const items: MenuItem[] = [];
    menuCategories.forEach(cat => {
      if (cat.items) items.push(...cat.items);
      if (cat.subCategories) {
        cat.subCategories.forEach(sub => items.push(...sub.items));
      }
    });
    return items;
  };

  // Find active menu item for mobile header
  const activeMenuItem = getAllItems().find(item => item.path === location);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const toggleCategory = (label: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const toggleSubCategory = (label: string) => {
    setOpenSubCategories(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  // Check if category has active item
  const categoryHasActiveItem = (cat: MenuCategory): boolean => {
    if (cat.items?.some(item => item.path === location)) return true;
    if (cat.subCategories?.some(sub => sub.items.some(item => item.path === location))) return true;
    return false;
  };

  // Check if subcategory has active item
  const subCategoryHasActiveItem = (sub: SubCategory): boolean => {
    return sub.items.some(item => item.path === location);
  };

  // Filter categories based on user role
  const filteredCategories = menuCategories
    .filter(cat => hasAccess(userRole, cat.minRole))
    .map(cat => ({
      ...cat,
      items: cat.items?.filter(item => hasAccess(userRole, item.minRole)),
      subCategories: cat.subCategories
        ?.filter(sub => hasAccess(userRole, sub.minRole))
        .map(sub => ({
          ...sub,
          items: sub.items.filter(item => hasAccess(userRole, item.minRole))
        }))
        .filter(sub => sub.items.length > 0)
    }))
    .filter(cat => (cat.items && cat.items.length > 0) || (cat.subCategories && cat.subCategories.length > 0));

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">
                    Navigation
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {filteredCategories.map(category => {
                const isOpen = openCategories[category.label] ?? false;
                const hasActiveItem = categoryHasActiveItem(category);
                
                return (
                  <Collapsible
                    key={category.label}
                    open={isOpen}
                    onOpenChange={() => toggleCategory(category.label)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={category.label}
                          className={`h-10 transition-all font-semibold ${hasActiveItem ? "bg-accent" : ""}`}
                        >
                          <category.icon className={`h-4 w-4 ${hasActiveItem ? "text-primary" : ""}`} />
                          <span>{category.label}</span>
                          <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {/* Direct items (for Trust, Academy, Real Eye, My Account) */}
                          {category.items?.map(item => {
                            const isActive = location === item.path;
                            return (
                              <SidebarMenuSubItem key={item.path}>
                                <SidebarMenuSubButton
                                  isActive={isActive}
                                  onClick={() => setLocation(item.path)}
                                  className="h-9"
                                >
                                  <item.icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : ""}`} />
                                  <span>{item.label}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                          
                          {/* SubCategories (for L.A.W.S. Collective departments) */}
                          {category.subCategories?.map(subCat => {
                            const subIsOpen = openSubCategories[subCat.label] ?? false;
                            const subHasActive = subCategoryHasActiveItem(subCat);
                            
                            return (
                              <Collapsible
                                key={subCat.label}
                                open={subIsOpen}
                                onOpenChange={() => toggleSubCategory(subCat.label)}
                              >
                                <SidebarMenuSubItem>
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton
                                      className={`h-9 font-medium ${subHasActive ? "bg-accent/50" : ""}`}
                                    >
                                      <subCat.icon className={`h-3.5 w-3.5 ${subHasActive ? "text-primary" : ""}`} />
                                      <span>{subCat.label}</span>
                                      <ChevronRight className={`ml-auto h-3 w-3 transition-transform duration-200 ${subIsOpen ? "rotate-90" : ""}`} />
                                    </SidebarMenuSubButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="pl-4 space-y-1 py-1">
                                      {subCat.items.map(item => {
                                        const isActive = location === item.path;
                                        return (
                                          <button
                                            key={item.path}
                                            onClick={() => setLocation(item.path)}
                                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                                              isActive 
                                                ? "bg-primary/10 text-primary font-medium" 
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                            }`}
                                          >
                                            <item.icon className="h-3 w-3" />
                                            <span>{item.label}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </CollapsibleContent>
                                </SidebarMenuSubItem>
                              </Collapsible>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-9 w-9 border shrink-0">
                      <AvatarFallback className="text-xs font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-medium truncate leading-none">
                        {user?.name || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1.5">
                        {user?.email || "-"}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={refreshSession}
                    className="cursor-pointer"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Refresh Session</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => window.location.href = getLoginUrl()}
                className="flex items-center gap-3 rounded-lg px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Sign In</span>
              </button>
            )}
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.history.back()}
                className="h-9 w-9 rounded-lg bg-background flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WhatsNewButton />
              <NotificationCenter />
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
