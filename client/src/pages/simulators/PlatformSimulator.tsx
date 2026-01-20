import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function PlatformSimulator() {
  return (
    <ComingSoonSimulator
      title="Platform Simulator"
      department="Platform Admin"
      description="Practice platform administration, user management, and system configuration in a simulated environment."
      plannedFeatures={[
        "User management workflows",
        "System configuration tools",
        "Platform settings management",
        "Access control simulation",
        "System monitoring tools"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/platform-admin"
    />
  );
}
