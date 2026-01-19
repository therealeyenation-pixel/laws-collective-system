import DemographicGrants from "@/components/DemographicGrants";
import DashboardLayout from "@/components/DashboardLayout";

export default function DemographicGrantsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Demographic-Specific Grants
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore funding opportunities designed for women, minorities, veterans, and seniors
          </p>
        </div>
        <DemographicGrants />
      </div>
    </DashboardLayout>
  );
}
