import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Users, Shield, Coins, Activity, BookOpen, GraduationCap, Rocket, FileText, Bot, Share2, Building2, DollarSign, Home, Settings, PieChart, Gavel, Globe2, ArrowLeft, Play, Gift, Calculator, RefreshCw, BarChart3, ClipboardList, Briefcase, UserCircle, UserPlus, FolderKanban } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { NotificationCenter } from "./NotificationCenter";

// Access levels: user (member), staff, admin, owner
type AccessLevel = "user" | "staff" | "admin" | "owner";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  minRole: AccessLevel;
  category?: string;
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

const menuItems: MenuItem[] = [
  // Member Level - Personal Journey
  { icon: UserCircle, label: "My Profile", path: "/my-profile", minRole: "user", category: "Personal" },
  { icon: Home, label: "My House", path: "/house", minRole: "user", category: "Personal" },
  { icon: Rocket, label: "Getting Started", path: "/getting-started", minRole: "user", category: "Personal" },
  { icon: GraduationCap, label: "Learning Center", path: "/academy", minRole: "user", category: "Personal" },
  { icon: Play, label: "Business Simulator", path: "/business-simulator", minRole: "user", category: "Learning" },
  { icon: FileText, label: "Business Plan Simulator", path: "/business-plan-simulator", minRole: "user", category: "Learning" },
  { icon: BookOpen, label: "Grant Simulator", path: "/grant-simulator", minRole: "user", category: "Learning" },
  { icon: Calculator, label: "Tax Simulator", path: "/tax-simulator", minRole: "user", category: "Learning" },
  
  // Staff Level - Operations & Management
  { icon: LayoutDashboard, label: "Business Dashboard", path: "/dashboard", minRole: "staff", category: "Management" },
  { icon: DollarSign, label: "Financial Automation", path: "/financial-automation", minRole: "staff", category: "Management" },
  { icon: Coins, label: "Banking & Credit", path: "/banking", minRole: "staff", category: "Management" },
  { icon: Users, label: "HR Management", path: "/hr-management", minRole: "staff", category: "Management" },
  { icon: ClipboardList, label: "HR Dashboard", path: "/hr-dashboard", minRole: "staff", category: "Management" },
  { icon: Users, label: "Employee Directory", path: "/employees", minRole: "staff", category: "Management" },
  { icon: UserPlus, label: "Onboarding", path: "/onboarding", minRole: "staff", category: "Management" },
  { icon: FileText, label: "Operating Procedures", path: "/procedures", minRole: "staff", category: "Management" },
  { icon: FolderKanban, label: "Project Controls", path: "/project-controls", minRole: "staff", category: "Management" },
  { icon: BarChart3, label: "Operations Dashboard", path: "/operations-dashboard", minRole: "staff", category: "Management" },
  { icon: Users, label: "Position Management", path: "/positions", minRole: "staff", category: "Management" },
  { icon: Gift, label: "Grant Management", path: "/grants", minRole: "staff", category: "Management" },
  { icon: FileText, label: "Document Vault", path: "/vault", minRole: "staff", category: "Management" },
  { icon: Bot, label: "Agents", path: "/agents", minRole: "staff", category: "Management" },
  { icon: Share2, label: "Social Media", path: "/social-media", minRole: "staff", category: "Management" },
  { icon: FileText, label: "Proposal Simulator", path: "/proposal-simulator", minRole: "staff", category: "Management" },
  { icon: FileText, label: "RFP Generator", path: "/rfp-generator", minRole: "staff", category: "Management" },
  
  // Admin Level - Entity & Business Operations
  { icon: Building2, label: "Organization Setup", path: "/genesis", minRole: "admin", category: "Administration" },
  { icon: Building2, label: "Foundation", path: "/foundation", minRole: "admin", category: "Administration" },
  { icon: FileText, label: "Upload Business Plan", path: "/business-plan-upload", minRole: "admin", category: "Administration" },
  { icon: Building2, label: "Business Formation", path: "/business-formation", minRole: "admin", category: "Administration" },
  { icon: Building2, label: "Business Setup", path: "/business-setup", minRole: "admin", category: "Administration" },
  { icon: Users, label: "Family Onboarding", path: "/family-onboarding", minRole: "admin", category: "Administration" },
  { icon: PieChart, label: "Revenue Sharing", path: "/revenue-sharing", minRole: "admin", category: "Administration" },
  { icon: Gavel, label: "Board Meetings", path: "/board-meetings", minRole: "admin", category: "Administration" },
  { icon: Globe2, label: "International Business", path: "/international-business", minRole: "admin", category: "Administration" },
  { icon: DollarSign, label: "Pricing", path: "/pricing", minRole: "admin", category: "Administration" },
  
  // Owner Level - Trust & Governance
  { icon: Briefcase, label: "Executive Dashboard", path: "/executive-dashboard", minRole: "admin", category: "Governance" },
  { icon: Settings, label: "Owner Setup", path: "/owner-setup", minRole: "owner", category: "Governance" },
  { icon: Shield, label: "System Overview", path: "/system-overview", minRole: "owner", category: "Governance" },
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
  const filteredMenuItems = menuItems.filter(item => hasAccess(userRole, item.minRole));
  const activeMenuItem = filteredMenuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

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
              {filteredMenuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
            <NotificationCenter />
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
