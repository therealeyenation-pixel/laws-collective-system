import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import VolunteerTracker from "@/components/VolunteerTracker";
import { Card } from "@/components/ui/card";
import { Heart, Globe, Home, Users, Award, BookOpen } from "lucide-react";

export default function VolunteerPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Volunteer Program
            </h1>
            <p className="text-muted-foreground mt-1">
              Track domestic and international volunteer opportunities
            </p>
          </div>
        </div>

        {/* Program Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-start gap-3">
              <Home className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">Domestic Volunteering</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Local community engagement through financial literacy, mentorship,
                  business development, and re-entry support programs.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">International Volunteering</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Global impact through Jamaica-based programs, African diaspora
                  connections, and international development initiatives.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-purple-500 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">Grant Matching</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Volunteer hours can be used as in-kind match for grant applications,
                  valued at $31.80/hour (Independent Sector rate).
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Entity Alignment */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Entity Volunteer Alignment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-background rounded-lg">
              <p className="font-medium text-foreground">Temple of Deliverance</p>
              <p className="text-muted-foreground">
                Faith-based community service, spiritual mentorship, family support
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="font-medium text-foreground">Divine STEM Academy</p>
              <p className="text-muted-foreground">
                Youth education, STEM workshops, financial literacy training
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="font-medium text-foreground">The L.A.W.S. Collective</p>
              <p className="text-muted-foreground">
                Workforce development, re-entry support, skills training
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="font-medium text-foreground">Real-Eye Productions</p>
              <p className="text-muted-foreground">
                Documentary workshops, storytelling training, media literacy
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="font-medium text-foreground">98 Trust (Jamaica)</p>
              <p className="text-muted-foreground">
                International programs, Caribbean development, diaspora connections
              </p>
            </div>
          </div>
        </Card>

        {/* Benefits Section */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Why Track Volunteer Hours?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>
                  <strong>Grant Applications:</strong> Many funders require or prefer
                  organizations with documented community engagement
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>
                  <strong>In-Kind Match:</strong> Volunteer hours can count toward
                  matching requirements for federal and foundation grants
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>
                  <strong>Impact Reporting:</strong> Quantify community impact for
                  annual reports and stakeholder communications
                </span>
              </li>
            </ul>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>
                  <strong>Network Building:</strong> Connect with partner organizations
                  and potential collaborators
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>
                  <strong>Skill Development:</strong> Build expertise in areas aligned
                  with organizational mission
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>
                  <strong>Tax Documentation:</strong> Track volunteer mileage and
                  expenses for potential deductions
                </span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Volunteer Tracker Component */}
        <VolunteerTracker />
      </div>
    </DashboardLayout>
  );
}
