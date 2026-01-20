import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function GrantsSimulator() {
  return (
    <ComingSoonSimulator
      title="Grants Simulator"
      department="Grants & Funding"
      description="Practice grant application, tracking, and reporting workflows in a simulated environment."
      plannedFeatures={[
        "Grant application workflows",
        "Funding opportunity tracking",
        "Grant reporting tools",
        "Budget management simulation",
        "Compliance tracking"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/grants-dashboard"
    />
  );
}
