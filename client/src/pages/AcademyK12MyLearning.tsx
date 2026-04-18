import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  Trophy,
  Target,
  Clock,
  ChevronRight,
  Loader2,
  BarChart3,
  Star,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

const levelBandLabels: Record<string, string> = {
  early_elementary: "K-2",
  upper_elementary: "3-5",
  middle_school: "6-8",
  high_school_intro: "9-10",
  high_school_adv: "11-12",
  certification: "Cert",
};

export default function AcademyK12MyLearning() {
  const { user } = useAuth();
  const { data: progress, isLoading } = trpc.academyK12.getMyProgress.useQuery(undefined, { enabled: !!user });
  const { data: assessmentResults } = trpc.academyK12.getMyAssessmentResults.useQuery(undefined, { enabled: !!user });

  const totalLessonsCompleted = progress?.length || 0;
  const totalAssessments = assessmentResults?.length || 0;
  const avgScore = totalAssessments > 0
    ? Math.round((assessmentResults?.reduce((sum: number, r: any) => sum + (r.score || 0), 0) || 0) / totalAssessments)
    : 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Learning</h1>
              <p className="text-sm text-muted-foreground">Track your progress across the K-12 curriculum</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Lessons Completed</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalLessonsCompleted}</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Assessments Taken</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalAssessments}</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-muted-foreground">Average Score</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">Mastery Level</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {avgScore >= 90 ? "Expert" : avgScore >= 70 ? "Proficient" : avgScore >= 50 ? "Developing" : "Beginner"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : totalLessonsCompleted === 0 && totalAssessments === 0 ? (
          <div className="text-center py-16 border rounded-xl bg-card">
            <Star className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Start Your Learning Journey</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Browse our K-12 curriculum, pick a subject that interests you, and begin your self-paced education. 
              Your progress will be tracked here automatically.
            </p>
            <Link href="/academy/k12">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Subjects
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recent Assessment Results */}
            {assessmentResults && assessmentResults.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recent Assessment Results
                </h2>
                <div className="space-y-2">
                  {assessmentResults.slice(0, 10).map((result: any) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                      <div>
                        <p className="font-medium text-foreground text-sm">Assessment #{result.assessmentId}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.completedAt || result.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            result.score >= 90 ? "text-green-600" :
                            result.score >= 70 ? "text-amber-600" :
                            "text-red-600"
                          }`}>
                            {result.score}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {result.correctCount}/{result.totalQuestions} correct
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          result.masteryLevel === "mastery" ? "bg-green-50 text-green-700 border-green-200" :
                          result.masteryLevel === "proficient" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          result.masteryLevel === "developing" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {result.masteryLevel || "In Progress"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue Learning CTA */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-amber-200">
              <h3 className="font-bold text-foreground mb-2">Continue Learning</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pick up where you left off or explore new subjects in our comprehensive curriculum.
              </p>
              <Link href="/academy/k12">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse All Subjects
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
