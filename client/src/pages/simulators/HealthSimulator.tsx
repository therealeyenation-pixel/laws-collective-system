import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function HealthSimulator() {
  return (
    <ComingSoonSimulator
      title="Health Simulator"
      department="Health"
      description="Practice wellness program management, health benefits administration, and employee wellness initiatives in a risk-free environment."
      plannedFeatures={[
        "Wellness program design and implementation",
        "Health benefits cost analysis",
        "Employee wellness tracking",
        "Health initiative ROI calculator",
        "Compliance training modules"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/health"
    />
  );
}
