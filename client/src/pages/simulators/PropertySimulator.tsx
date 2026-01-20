import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function PropertySimulator() {
  return (
    <ComingSoonSimulator
      title="Property Simulator"
      department="Property"
      description="Practice asset tracking, software license management, and property administration in a simulated environment."
      plannedFeatures={[
        "Asset tracking and inventory",
        "Software license management",
        "Equipment lifecycle tracking",
        "Depreciation calculations",
        "Property maintenance scheduling"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/property"
    />
  );
}
