import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function MarketingDocuments() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketing Documents</h1>
          <p className="text-muted-foreground mt-1">Store and manage marketing collateral, brand assets, and campaign materials</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Construction className="w-5 h-5 text-amber-500" />
              Under Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This module is currently being built out as part of the Marketing department.
              Full functionality will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
