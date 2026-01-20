import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function DesignSimulator() {
  return (
    <ComingSoonSimulator
      title="Design Simulator"
      department="Design"
      description="Practice brand asset management, design project workflows, and creative team collaboration in a simulated environment."
      plannedFeatures={[
        "Brand asset creation and management",
        "Design project workflow simulation",
        "Client feedback integration",
        "Design system development",
        "Creative brief processing"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/design"
    />
  );
}
