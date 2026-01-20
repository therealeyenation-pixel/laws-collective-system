import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function ProcurementSimulator() {
  return (
    <ComingSoonSimulator
      title="Procurement Simulator"
      department="Procurement"
      description="Practice vendor management, purchase request processing, and RFP creation in a simulated environment."
      plannedFeatures={[
        "Vendor evaluation and selection",
        "Purchase request workflows",
        "RFP/RFQ creation and management",
        "Contract negotiation simulation",
        "Supplier relationship management"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/procurement"
    />
  );
}
