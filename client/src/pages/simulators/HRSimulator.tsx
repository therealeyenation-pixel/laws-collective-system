import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function HRSimulator() {
  return (
    <ComingSoonSimulator
      title="HR Simulator"
      department="HR & People"
      description="Practice recruitment, onboarding, employee management, and HR compliance in a simulated environment."
      plannedFeatures={[
        "Recruitment workflow simulation",
        "Interview scheduling and management",
        "Onboarding process design",
        "Performance review workflows",
        "HR compliance training"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/hr"
    />
  );
}
