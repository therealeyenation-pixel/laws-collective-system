import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function LegalSimulator() {
  return (
    <ComingSoonSimulator
      title="Legal Simulator"
      department="Legal/Compliance"
      description="Practice legal document management, compliance tracking, and regulatory requirements in a simulated environment."
      plannedFeatures={[
        "Legal document workflows",
        "Compliance tracking and alerts",
        "Regulatory requirement management",
        "Contract review simulation",
        "Legal risk assessment"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/legal"
    />
  );
}
