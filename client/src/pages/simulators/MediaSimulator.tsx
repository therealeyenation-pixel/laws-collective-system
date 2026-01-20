import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function MediaSimulator() {
  return (
    <ComingSoonSimulator
      title="Media Simulator"
      department="Media"
      description="Practice content calendar management, social media strategy, and media production workflows in a simulated environment."
      plannedFeatures={[
        "Content calendar planning",
        "Social media campaign simulation",
        "Media production scheduling",
        "Audience engagement analytics",
        "Cross-platform content strategy"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/media"
    />
  );
}
