import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Circle,
  Lock,
  Home,
  BookOpen,
  FileText,
  Shield,
  Scale,
  Crown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PostActivationProgressProps {
  onStartCourse: (courseId: string) => void;
}

const courseIcons: Record<string, React.ReactNode> = {
  trust: <Shield className="w-5 h-5" />,
  contracts: <Scale className="w-5 h-5" />,
  dba: <FileText className="w-5 h-5" />,
  grants: <Sparkles className="w-5 h-5" />,
  blockchain: <BookOpen className="w-5 h-5" />,
};

const courseTokens: Record<string, number> = {
  trust: 150,
  contracts: 120,
  dba: 100,
  grants: 100,
  blockchain: 200,
};

const courseScrolls: Record<string, string[]> = {
  trust: ["Scroll 21", "Scroll 22", "Scroll 23"],
  contracts: ["Scroll 26", "Scroll 27", "Scroll 28"],
  dba: ["Scroll 24", "Scroll 25"],
  grants: ["Scroll 29", "Scroll 30"],
  blockchain: ["Scroll 31", "Scroll 32", "Scroll 33", "Scroll 34", "Scroll 35"],
};

export default function PostActivationProgress({ onStartCourse }: PostActivationProgressProps) {
  const { data: houseData } = trpc.houseLedger.getMyHouseLedger.useQuery();
  const { data: progressData } = trpc.houseLedger.getPostActivationProgress.useQuery();

  if (!houseData?.house || !progressData) {
    return null; // Don't show if no house is activated or data not loaded
  }

  const courses = progressData.courses;
  const completedCourses = courses.filter(c => c.completed).length;
  const totalCourses = courses.length;
  const overallProgress = (completedCourses / totalCourses) * 100;
  
  const totalTokensEarned = courses.reduce((sum, c) => 
    c.completed ? sum + (courseTokens[c.id] || 0) : sum, 0);
  const totalTokensAvailable = Object.values(courseTokens).reduce((a, b) => a + b, 0);

  const getStatus = (course: typeof courses[0]) => {
    if (course.completed) return "completed";
    if (course.progress > 0) return "in_progress";
    // Check if blockchain is locked (requires trust completion)
    if (course.id === "blockchain") {
      const trustCourse = courses.find(c => c.id === "trust");
      if (!trustCourse?.completed) return "locked";
    }
    return "available";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Circle className="w-5 h-5 text-amber-500 fill-amber-200" />;
      case "available":
        return <Circle className="w-5 h-5 text-emerald-600" />;
      case "locked":
        return <Lock className="w-5 h-5 text-stone-400" />;
      default:
        return <Circle className="w-5 h-5 text-stone-400" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-stone-50 to-emerald-50/30 border-emerald-200/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Home className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">Post-Activation Progress</h3>
            <p className="text-sm text-stone-600">
              {houseData.house.name} • Continue building your wealth structure
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-700">{completedCourses}/{totalCourses}</div>
          <div className="text-xs text-stone-500">Courses Complete</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-stone-600">Overall Progress</span>
          <span className="font-medium text-emerald-700">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2 bg-stone-200" />
        <div className="flex justify-between text-xs text-stone-500 mt-1">
          <span>{totalTokensEarned} LUV earned</span>
          <span>{totalTokensAvailable - totalTokensEarned} LUV remaining</span>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {courses.map((course) => {
          const status = getStatus(course);
          const tokens = courseTokens[course.id] || 100;
          const scrolls = courseScrolls[course.id] || [];
          
          return (
            <div
              key={course.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                status === "locked"
                  ? "bg-stone-100/50 border-stone-200 opacity-60"
                  : status === "completed"
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-stone-200 hover:border-emerald-300 hover:shadow-sm cursor-pointer"
              }`}
              onClick={() => status !== "locked" && status !== "completed" && onStartCourse(course.id)}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(status)}
              </div>

              {/* Course Icon */}
              <div className={`p-2 rounded-lg ${
                status === "completed" ? "bg-green-100 text-green-700" :
                status === "locked" ? "bg-stone-200 text-stone-500" :
                "bg-emerald-100 text-emerald-700"
              }`}>
                {courseIcons[course.id] || <BookOpen className="w-5 h-5" />}
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-stone-800 truncate">{course.name}</h4>
                  {status === "in_progress" && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                      {course.progress}%
                    </span>
                  )}
                  {course.required && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 truncate">{course.description}</p>
                {scrolls.length > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Unlocks: {scrolls.join(", ")}
                  </p>
                )}
                {course.unlocksToken && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    Token: {course.unlocksToken}
                  </p>
                )}
              </div>

              {/* Tokens & Action */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-emerald-700">
                    {tokens} LUV
                  </div>
                  <div className="text-xs text-stone-500">
                    {status === "completed" ? "Earned" : "Available"}
                  </div>
                </div>
                {status !== "locked" && status !== "completed" && (
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Token Unlock Status */}
      <div className="mt-6 p-4 bg-stone-100/50 rounded-lg">
        <h4 className="font-semibold text-stone-700 mb-3">Token Progression</h4>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(progressData.tokensUnlocked).map(([token, unlocked]) => (
            <div
              key={token}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                unlocked
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-stone-200 text-stone-500 border border-stone-300"
              }`}
            >
              {unlocked ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              {token}
            </div>
          ))}
        </div>
      </div>

      {/* Crown Eligibility */}
      {completedCourses === totalCourses && (
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-600" />
            <div>
              <h4 className="font-bold text-amber-800">Crown Eligibility Achieved!</h4>
              <p className="text-sm text-amber-700">
                All post-activation courses complete. You may now apply for Crown of Completion.
              </p>
            </div>
            <Button className="ml-auto bg-amber-600 hover:bg-amber-700 text-white">
              Apply for Crown
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
