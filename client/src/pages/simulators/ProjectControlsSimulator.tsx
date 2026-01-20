import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function ProjectControlsSimulator() {
  return (
    <ComingSoonSimulator
      title="Project Controls Simulator"
      department="Project Controls"
      description="Practice project tracking, progress reporting, and resource management in a simulated environment."
      plannedFeatures={[
        "Project timeline management",
        "Progress tracking and reporting",
        "Resource allocation tools",
        "Budget tracking and forecasting",
        "Risk assessment simulation"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/project-controls"
    />
  );
}
