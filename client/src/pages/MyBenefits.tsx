import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  Gift,
  GraduationCap,
  Loader2,
  Shield,
  Sparkles,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const benefitTypeLabels: Record<string, string> = {
  full_tuition: "Full Tuition Coverage",
  partial_tuition: "Partial Tuition Coverage",
  materials_only: "Materials Coverage",
  priority_enrollment: "Priority Enrollment",
};

const benefitStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  eligible: { label: "Eligible", color: "text-green-600 bg-green-50", icon: <CheckCircle2 className="w-4 h-4" /> },
  enrolled: { label: "Enrolled", color: "text-blue-600 bg-blue-50", icon: <BookOpen className="w-4 h-4" /> },
  graduated: { label: "Graduated", color: "text-purple-600 bg-purple-50", icon: <GraduationCap className="w-4 h-4" /> },
  expired: { label: "Expired", color: "text-gray-500 bg-gray-50", icon: <Clock className="w-4 h-4" /> },
  revoked: { label: "Revoked", color: "text-red-600 bg-red-50", icon: <XCircle className="w-4 h-4" /> },
};

const founderRoleLabels: Record<string, string> = {
  primary_founder: "Primary Founder",
  co_founder: "Co-Founder",
  charter_member: "Charter Member",
  founding_investor: "Founding Investor",
};

const applicationStatusConfig: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "text-yellow-600 bg-yellow-50" },
  under_review: { label: "Under Review", color: "text-blue-600 bg-blue-50" },
  approved: { label: "Approved", color: "text-green-600 bg-green-50" },
  rejected: { label: "Rejected", color: "text-red-600 bg-red-50" },
  waitlisted: { label: "Waitlisted", color: "text-orange-600 bg-orange-50" },
  withdrawn: { label: "Withdrawn", color: "text-gray-500 bg-gray-50" },
};

export default function MyBenefits() {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, refetch } = trpc.scholarships.getMyBenefits.useQuery(undefined, {
    enabled: !!user,
  });

  const claimMutation = trpc.scholarships.claimHeirBenefit.useMutation({
    onSuccess: () => {
      toast.success("Benefit claimed successfully! Your account has been linked.");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to claim benefit");
    },
  });

  if (authLoading) return <DashboardLayoutSkeleton />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Gift className="w-7 h-7 text-green-700" />
            My Benefits
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View your education benefits, heir privileges, and scholarship applications.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-700" />
          </div>
        ) : !data ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Gift className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Unable to load benefits. Please try again later.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={data.isFoundingMember ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${data.isFoundingMember ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Founding Member</p>
                      <p className="font-semibold text-foreground">
                        {data.isFoundingMember ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={data.hasHeirBenefits ? "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${data.hasHeirBenefits ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Heir Education Benefits</p>
                      <p className="font-semibold text-foreground">
                        {data.heirBenefits.length > 0 ? `${data.heirBenefits.length} Active` : "None"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={data.scholarshipApplications.length > 0 ? "border-purple-200 bg-purple-50/50 dark:bg-purple-950/20" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${data.scholarshipApplications.length > 0 ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground"}`}>
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Scholarship Applications</p>
                      <p className="font-semibold text-foreground">
                        {data.scholarshipApplications.length > 0 ? `${data.scholarshipApplications.length} Filed` : "None"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Founding Member Section */}
            {data.isFoundingMember && data.foundingMember && (
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Crown className="w-5 h-5" />
                    Founding Member Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-semibold text-foreground">{data.foundingMember.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <p className="font-semibold text-foreground">
                          {founderRoleLabels[data.foundingMember.foundingRole] || data.foundingMember.foundingRole}
                        </p>
                      </div>
                      {data.foundingMember.entityName && (
                        <div>
                          <p className="text-xs text-muted-foreground">Entity</p>
                          <p className="font-semibold text-foreground">{data.foundingMember.entityName}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Heir Education Benefit</p>
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          {data.foundingMember.heirEducationBenefit ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              Enabled ({data.foundingMember.benefitGenerations} generations)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              Not Enabled
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>
                        As a Founding Member, your heirs (up to {data.foundingMember.benefitGenerations} generations) are eligible for free Academy education through LuvOnPurpose Academy and Outreach.
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Heir Education Benefits */}
            {data.heirBenefits.length > 0 && (
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <GraduationCap className="w-5 h-5" />
                    Heir Education Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.heirBenefits.map((benefit: any) => {
                    const statusConfig = benefitStatusConfig[benefit.status] || benefitStatusConfig.eligible;
                    return (
                      <div key={benefit.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-foreground">
                              {benefitTypeLabels[benefit.benefitType] || benefit.benefitType}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Founding Member</p>
                            <p className="text-foreground">{benefit.founderName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Founder Role</p>
                            <p className="text-foreground">{founderRoleLabels[benefit.founderRole] || benefit.founderRole}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Generation</p>
                            <p className="text-foreground">
                              {benefit.generationFromFounder === 1 ? "Child (1st Gen)" :
                               benefit.generationFromFounder === 2 ? "Grandchild (2nd Gen)" :
                               benefit.generationFromFounder === 3 ? "Great-Grandchild (3rd Gen)" :
                               `Generation ${benefit.generationFromFounder}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Coverage</p>
                            <p className="text-foreground">{benefit.coveragePercentage}%</p>
                          </div>
                          {benefit.tuitionValue && (
                            <div>
                              <p className="text-xs text-muted-foreground">Tuition Value</p>
                              <p className="text-foreground">${parseFloat(benefit.tuitionValue).toLocaleString()}</p>
                            </div>
                          )}
                          {benefit.enrollmentDate && (
                            <div>
                              <p className="text-xs text-muted-foreground">Enrolled Since</p>
                              <p className="text-foreground">{new Date(benefit.enrollmentDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>

                        {/* Claim button if benefit is not yet linked to this user */}
                        {!benefit.heirUserId && benefit.status === "eligible" && (
                          <div className="pt-2 border-t">
                            <Button
                              size="sm"
                              onClick={() => claimMutation.mutate({ benefitId: benefit.id })}
                              disabled={claimMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {claimMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                              )}
                              Claim This Benefit
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">
                              Link this benefit to your account to access free Academy enrollment.
                            </p>
                          </div>
                        )}

                        {/* Academy enrollment CTA for eligible/claimed benefits */}
                        {benefit.heirUserId && benefit.status === "eligible" && (
                          <div className="pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.location.href = "/academy"}
                              className="border-green-600 text-green-700 hover:bg-green-50"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              Enroll in Academy (Free)
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">
                              Your tuition is covered. Enroll to start your learning journey.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Scholarship Applications */}
            {data.scholarshipApplications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    Scholarship Applications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.scholarshipApplications.map((app: any) => {
                    const statusCfg = applicationStatusConfig[app.reviewStatus] || applicationStatusConfig.submitted;
                    return (
                      <div key={app.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">{app.programName}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Type</p>
                            <p className="text-foreground capitalize">{app.programType?.replace(/_/g, " ")}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Applied</p>
                            <p className="text-foreground">{new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                          {app.awardAmount && (
                            <div>
                              <p className="text-xs text-muted-foreground">Award Amount</p>
                              <p className="text-foreground">${parseFloat(app.awardAmount).toLocaleString()}</p>
                            </div>
                          )}
                          {app.reviewScore !== null && app.reviewScore !== undefined && (
                            <div>
                              <p className="text-xs text-muted-foreground">Score</p>
                              <p className="text-foreground">{app.reviewScore}/100</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* No Benefits State */}
            {!data.isFoundingMember && data.heirBenefits.length === 0 && data.scholarshipApplications.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center space-y-4">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/40" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">No Benefits Found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      You don't have any heir education benefits or scholarship applications yet.
                      If you believe you're eligible as an heir of a Founding Member, please contact your system administrator.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = "/academy"}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explore Academy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = "/agent/academy_qa"}
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Ask Academy Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Footer */}
            <div className="p-4 bg-secondary/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground text-center">
                Benefits are managed by the LuvOnPurpose system. Heir education benefits extend to descendants of Founding Members
                for up to 3 generations. For questions about your benefits, contact the Academy Guide or Technical Support agent.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
