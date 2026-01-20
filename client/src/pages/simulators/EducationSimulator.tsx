import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function EducationSimulator() {
  return (
    <ComingSoonSimulator
      title="Education Simulator"
      department="Education"
      description="Practice curriculum development, instructor management, and educational program design in a simulated environment."
      plannedFeatures={[
        "Curriculum design and planning",
        "Course creation workflows",
        "Student progress tracking",
        "Instructor scheduling",
        "Educational assessment tools"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/education"
    />
  );
}
