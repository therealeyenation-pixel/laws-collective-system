import ComingSoonSimulator from "@/components/ComingSoonSimulator";

export default function FinanceSimulator() {
  return (
    <ComingSoonSimulator
      title="Finance Simulator"
      department="Finance"
      description="Practice financial planning, budgeting, revenue analysis, and financial reporting in a risk-free simulated environment."
      plannedFeatures={[
        "Budget planning and forecasting",
        "Revenue and expense tracking",
        "Financial statement preparation",
        "Cash flow management",
        "Investment analysis tools"
      ]}
      estimatedRelease="Q2 2026"
      backPath="/dept/finance"
    />
  );
}
