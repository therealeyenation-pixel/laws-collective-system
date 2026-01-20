import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function ITSimulator() {
  return (
    <ComingSoonSimulator
      title="IT Simulator"
      department="IT"
      description="Practice system administration, security management, and IT infrastructure planning in a simulated environment."
      plannedFeatures={[
        "System administration workflows",
        "Security incident response",
        "IT infrastructure planning",
        "Help desk ticket simulation",
        "Network management tools"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/it"
    />
  );
}
