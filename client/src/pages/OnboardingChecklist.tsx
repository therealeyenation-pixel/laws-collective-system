import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { DepartmentOnboardingChecklist } from "@/components/DepartmentOnboardingChecklist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ClipboardCheck, Users } from "lucide-react";
import { Link, useSearch } from "wouter";

const departments = [
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" },
  { value: "legal", label: "Legal" },
  { value: "it", label: "Information Technology" },
  { value: "operations", label: "Operations" },
  { value: "marketing", label: "Marketing" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "media", label: "Media" },
  { value: "procurement", label: "Procurement" },
  { value: "contracts", label: "Contracts" },
  { value: "property", label: "Property" },
  { value: "purchasing", label: "Purchasing" },
  { value: "qaqc", label: "QA/QC" },
  { value: "real estate", label: "Real Estate" },
  { value: "project controls", label: "Project Controls" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "platform admin", label: "Platform Admin" },
];

export default function OnboardingChecklist() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const departmentParam = params.get("department") || "";

  const [selectedDepartment, setSelectedDepartment] = useState(departmentParam);

  // Update selected department when URL param changes
  useEffect(() => {
    if (departmentParam) {
      setSelectedDepartment(departmentParam);
    }
  }, [departmentParam]);

  // Find the department label
  const departmentLabel = departments.find(
    (d) => d.value.toLowerCase() === selectedDepartment.toLowerCase()
  )?.label || selectedDepartment;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/employee-directory">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6" />
                Onboarding Checklist
              </h1>
              <p className="text-muted-foreground">
                Complete all required tasks for new employee onboarding
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/employee-directory">
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Employee Directory
              </Button>
            </Link>
          </div>
        </div>

        {/* Department Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Department</CardTitle>
            <CardDescription>
              Choose a department to view its specific onboarding checklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Onboarding Checklist */}
        {selectedDepartment ? (
          <DepartmentOnboardingChecklist
            department={departmentLabel}
            showProgress={true}
          />
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select a Department
                </h3>
                <p className="text-muted-foreground">
                  Choose a department above to view its onboarding checklist
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
