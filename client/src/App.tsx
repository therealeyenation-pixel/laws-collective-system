import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SystemDashboard from "./pages/SystemDashboard";
import AcademyDashboard from "./pages/AcademyDashboard";
import DocumentVault from "./pages/DocumentVault";
import Agents from "./pages/Agents";
import SocialMedia from "./pages/SocialMedia";
import FoundationDashboard from "./pages/FoundationDashboard";
import FinancialAutomation from "./pages/FinancialAutomation";
import HouseDashboard from "./pages/HouseDashboard";
import OwnerHouseSetup from "./pages/OwnerHouseSetup";
import GenesisCeremony from "./pages/GenesisCeremony";
import Landing from "./pages/Landing";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { Shield } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading, user } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading completes, show sign-in prompt instead of redirect
  // This prevents redirect loops on mobile
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-6 max-w-md">
          <Shield className="w-16 h-16 mx-auto text-amber-500" />
          <h1 className="text-2xl font-bold">Sign In Required</h1>
          <p className="text-muted-foreground">
            Please sign in to access this page and manage your business.
          </p>
          <button
            onClick={() => window.location.href = getLoginUrl()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="block mx-auto text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  // Public routes: Landing page, Academy, and Dashboard (for viewing courses)
  // Protected routes: Trust System, Document Vault, Agents, Social Media
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/academy" component={AcademyDashboard} />
      {/* Dashboard is now public so users can view and take courses */}
      <Route path="/dashboard" component={Dashboard} />
      {/* Protected routes - require authentication */}
      <Route path="/system">{() => <ProtectedRoute component={SystemDashboard} />}</Route>
      <Route path="/vault">{() => <ProtectedRoute component={DocumentVault} />}</Route>
      <Route path="/agents">{() => <ProtectedRoute component={Agents} />}</Route>
      <Route path="/social-media">{() => <ProtectedRoute component={SocialMedia} />}</Route>
      <Route path="/foundation">{() => <ProtectedRoute component={FoundationDashboard} />}</Route>
      <Route path="/financial-automation">{() => <ProtectedRoute component={FinancialAutomation} />}</Route>
      <Route path="/house">{() => <ProtectedRoute component={HouseDashboard} />}</Route>
      <Route path="/owner-setup">{() => <ProtectedRoute component={OwnerHouseSetup} />}</Route>
      <Route path="/genesis">{() => <ProtectedRoute component={GenesisCeremony} />}</Route>
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
