import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function PurchasingSimulator() {
  return (
    <ComingSoonSimulator
      title="Purchasing Simulator"
      department="Purchasing"
      description="Practice inventory management, purchase order processing, and supplier coordination in a simulated environment."
      plannedFeatures={[
        "Inventory tracking and management",
        "Purchase order workflows",
        "Supplier coordination tools",
        "Cost analysis and optimization",
        "Reorder point calculations"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/purchasing"
    />
  );
}
