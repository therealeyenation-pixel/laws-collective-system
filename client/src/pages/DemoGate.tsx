import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function DemoGate() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Simple passcode - can be changed
  const DEMO_PASSCODE = "LAWS2024";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passcode.toUpperCase() === DEMO_PASSCODE) {
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Incorrect passcode. Please try again.");
      setPasscode("");
    }
  };

  if (isUnlocked) {
    return <DemoShell />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Shell Demo</h1>
          <p className="text-lg text-muted-foreground">
            Enter the passcode to preview the L.A.W.S. Collective system
          </p>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-border bg-background text-foreground text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full">
            Unlock Demo
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center space-y-2 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            This is a limited preview of the L.A.W.S. Collective system.
          </p>
          <p className="text-xs text-muted-foreground">
            For full access, contact the L.A.W.S. Collective team.
          </p>
        </div>
      </div>
    </div>
  );
}

// Shell Demo Component - Limited preview of the system
function DemoShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">L.A.W.S. Collective - Demo</h1>
          <div className="text-sm text-muted-foreground">Shell Preview</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Welcome Section */}
        <section className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-foreground">Welcome to the L.A.W.S. System</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This is a limited preview of the full L.A.W.S. Collective platform. Below you can see the main sections of the system.
          </p>
        </section>

        {/* System Overview Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Dashboard */}
          <div className="bg-card border border-border rounded-lg p-8 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Business Dashboard</h3>
            <p className="text-muted-foreground">
              Manage your business entities, financial accounts, and operations in one unified dashboard.
            </p>
            <div className="pt-4 space-y-2 text-sm text-muted-foreground">
              <p>• Entity Management</p>
              <p>• Financial Overview</p>
              <p>• Operations Tracking</p>
              <p>• Performance Metrics</p>
            </div>
            <p className="text-xs text-muted-foreground italic pt-4">
              [Demo Mode - Read Only]
            </p>
          </div>

          {/* LuvLedger System */}
          <div className="bg-card border border-border rounded-lg p-8 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">LuvLedger System</h3>
            <p className="text-muted-foreground">
              Complete financial tracking and audit trail for all your business activities.
            </p>
            <div className="pt-4 space-y-2 text-sm text-muted-foreground">
              <p>• Transaction Tracking</p>
              <p>• Audit Trail</p>
              <p>• Financial Reports</p>
              <p>• Compliance Logging</p>
            </div>
            <p className="text-xs text-muted-foreground italic pt-4">
              [Demo Mode - Read Only]
            </p>
          </div>

          {/* Training Hub */}
          <div className="bg-card border border-border rounded-lg p-8 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Training Hub</h3>
            <p className="text-muted-foreground">
              Access comprehensive courses and simulators to build your business skills.
            </p>
            <div className="pt-4 space-y-2 text-sm text-muted-foreground">
              <p>• Curriculum Modules</p>
              <p>• Interactive Simulators</p>
              <p>• Progress Tracking</p>
              <p>• Certificates</p>
            </div>
            <p className="text-xs text-muted-foreground italic pt-4">
              [Demo Mode - Read Only]
            </p>
          </div>

          {/* Governance & Trust */}
          <div className="bg-card border border-border rounded-lg p-8 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Governance & Trust</h3>
            <p className="text-muted-foreground">
              Manage trust structures, approvals, and governance policies.
            </p>
            <div className="pt-4 space-y-2 text-sm text-muted-foreground">
              <p>• Trust Management</p>
              <p>• Approval Workflows</p>
              <p>• Policy Enforcement</p>
              <p>• Decision Logs</p>
            </div>
            <p className="text-xs text-muted-foreground italic pt-4">
              [Demo Mode - Read Only]
            </p>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="bg-secondary/30 rounded-lg p-8 border border-border space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Autonomous Operations</h4>
              <p className="text-sm text-muted-foreground">
                AI-driven decision making for business operations with full audit trails.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Multi-Entity Management</h4>
              <p className="text-sm text-muted-foreground">
                Manage multiple business entities with hierarchical relationships.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Token Economy</h4>
              <p className="text-sm text-muted-foreground">
                Built-in token system for rewards, incentives, and value distribution.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Offline-First Architecture</h4>
              <p className="text-sm text-muted-foreground">
                Full functionality even without internet connection.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6 py-12 border-t border-border">
          <h3 className="text-2xl font-bold text-foreground">Ready for Full Access?</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This demo provides a preview of the L.A.W.S. Collective system. To access the full platform with all features enabled, contact the L.A.W.S. Collective team.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back to Landing
            </Button>
            <Button onClick={() => window.location.href = "/"}>
              Return Home
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
