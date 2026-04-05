import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Award,
  ChevronRight,
  Map,
  Wind,
  Droplets,
  Heart,
  Lock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const moduleIcons: Record<string, React.ReactNode> = {
  land: <Map className="w-5 h-5" />,
  air: <Wind className="w-5 h-5" />,
  water: <Droplets className="w-5 h-5" />,
  self: <Heart className="w-5 h-5" />,
};

export default function CourseDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [purchaseId, setPurchaseId] = useState<number | null>(null);
  const [accessVerified, setAccessVerified] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Get products to show course structure
  const { data: products } = trpc.courseCheckout.getProducts.useQuery();
  const course = products?.courses.find((c) => c.id === "laws_foundation_course");

  // Check access with email
  const checkAccess = trpc.courseCheckout.checkCourseAccess.useQuery(
    { email, courseId: "laws_foundation_course" },
    { enabled: !!email && email.includes("@") }
  );

  // Get user purchases if logged in
  const { data: userPurchases } = trpc.courseCheckout.getUserPurchases.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Get progress once we have purchaseId
  const { data: progressData, refetch: refetchProgress } = trpc.courseCheckout.getCourseProgress.useQuery(
    { purchaseId: purchaseId!, email },
    { enabled: !!purchaseId && !!email }
  );

  // Get completion status
  const { data: completionData } = trpc.courseCheckout.getCourseCompletion.useQuery(
    { purchaseId: purchaseId!, email },
    { enabled: !!purchaseId && !!email && progressData?.isComplete }
  );

  // Mark lesson complete mutation
  const markComplete = trpc.courseCheckout.markLessonComplete.useMutation({
    onSuccess: (data) => {
      refetchProgress();
      if (data.courseComplete) {
        toast.success("Congratulations! You've completed the course!");
      } else if (!data.alreadyCompleted) {
        toast.success("Lesson completed!");
      }
    },
  });

  // Auto-detect purchase from user email
  useEffect(() => {
    if (isAuthenticated && user?.email && userPurchases?.courses) {
      const coursePurchase = userPurchases.courses.find(
        (p) => p.productId === "laws_foundation_course" && p.accessGranted
      );
      if (coursePurchase) {
        setEmail(user.email);
        setPurchaseId(coursePurchase.id);
        setAccessVerified(true);
      }
    }
  }, [isAuthenticated, user, userPurchases]);

  // Handle email verification
  const handleVerifyAccess = () => {
    if (checkAccess.data?.hasAccess) {
      setAccessVerified(true);
      // Find purchase ID - in real app would have an endpoint for this
      toast.success("Access verified! Loading your course...");
    } else {
      toast.error("No course access found for this email. Please purchase the course first.");
    }
  };

  const handleMarkComplete = (moduleId: string, lessonIndex: number, lessonTitle: string) => {
    if (!purchaseId || !email) return;
    markComplete.mutate({
      purchaseId,
      email,
      moduleId,
      lessonIndex,
      lessonTitle,
    });
  };

  const isLessonComplete = (moduleId: string, lessonIndex: number) => {
    return progressData?.progress.some(
      (p) => p.moduleId === moduleId && p.lessonIndex === lessonIndex && p.completed
    );
  };

  const getModuleProgress = (moduleId: string) => {
    if (!progressData || !course) return { completed: 0, total: 5 };
    const module = course.modules.find((m) => m.id === moduleId);
    const completed = progressData.progress.filter(
      (p) => p.moduleId === moduleId && p.completed
    ).length;
    return { completed, total: module?.lessons.length || 5 };
  };

  // Show access verification if not verified
  if (!accessVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-12">
        <div className="container max-w-lg mx-auto px-4">
          <Card className="p-8">
            <div className="text-center mb-6">
              <Award className="w-16 h-16 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold text-foreground">Access Your Course</h1>
              <p className="text-muted-foreground mt-2">
                Enter the email you used to purchase the L.A.W.S. Foundation Course
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full mt-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <Button
                onClick={handleVerifyAccess}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!email || !email.includes("@")}
              >
                Access Course
              </Button>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Don't have access yet?{" "}
                  <button
                    onClick={() => setLocation("/products")}
                    className="text-primary hover:underline"
                  >
                    Purchase the course
                  </button>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Course completion celebration
  if (completionData?.isComplete && !completionData.completion?.upsellOffered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Award className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Congratulations! 🎉
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                You've completed the L.A.W.S. Foundation Course
              </p>
            </div>

            <div className="bg-secondary/30 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Your Certificate of Completion
              </h2>
              <p className="text-muted-foreground mb-4">
                You've mastered the 4-pillar framework for building generational wealth
              </p>
              <Button variant="outline" className="gap-2">
                <Award className="w-4 h-4" />
                Download Certificate
              </Button>
            </div>

            {/* Upsell Section */}
            <div className="border-t border-border pt-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Ready for the Next Step?
              </h2>
              <p className="text-muted-foreground mb-6">
                Take your wealth-building journey further with personalized guidance
              </p>

              <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-foreground">
                      {completionData.upsellProduct?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {completionData.upsellProduct?.description}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-2xl font-bold text-primary">
                        {completionData.upsellProduct?.priceFormatted}
                      </span>
                      <Button
                        onClick={() => setLocation("/products?tab=consulting")}
                        className="bg-primary hover:bg-primary/90 gap-2"
                      >
                        Book Your Session
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <p className="text-sm text-muted-foreground mt-4">
                Or continue exploring your course materials below
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold">L.A.W.S. Foundation Course</h1>
          <p className="text-primary-foreground/80 mt-1">
            Master the 4-pillar framework for building generational wealth
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Your Progress</span>
              <span>{progressData?.percentComplete || 0}% Complete</span>
            </div>
            <Progress value={progressData?.percentComplete || 0} className="h-2" />
            <p className="text-xs text-primary-foreground/60 mt-1">
              {progressData?.completedLessons || 0} of {progressData?.totalLessons || 20} lessons completed
            </p>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Course Modules</h2>
            
            {course?.modules.map((module, idx) => {
              const progress = getModuleProgress(module.id);
              const isModuleComplete = progress.completed === progress.total;
              
              return (
                <Card
                  key={module.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedModule === module.id
                      ? "ring-2 ring-primary border-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedModule(module.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isModuleComplete
                          ? "bg-green-100 text-green-600"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isModuleComplete ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        moduleIcons[module.id]
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm">
                        {module.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {progress.completed}/{progress.total} lessons • {module.duration}
                      </p>
                      <Progress
                        value={(progress.completed / progress.total) * 100}
                        className="h-1 mt-2"
                      />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2">
            {selectedModule ? (
              <Card className="p-6">
                {(() => {
                  const module = course?.modules.find((m) => m.id === selectedModule);
                  if (!module) return null;

                  return (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          {moduleIcons[module.id]}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-foreground">
                            {module.title}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIdx) => {
                          const completed = isLessonComplete(module.id, lessonIdx);

                          return (
                            <div
                              key={lessonIdx}
                              className={`flex items-center gap-4 p-4 rounded-lg border ${
                                completed
                                  ? "bg-green-50 border-green-200"
                                  : "bg-background border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {completed ? (
                                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                                ) : (
                                  <Circle className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-foreground">
                                  Lesson {lessonIdx + 1}: {lesson}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  ~30 minutes
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => toast.info("Video player coming soon!")}
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  Watch
                                </Button>
                                {!completed && (
                                  <Button
                                    size="sm"
                                    className="gap-1 bg-primary hover:bg-primary/90"
                                    onClick={() =>
                                      handleMarkComplete(module.id, lessonIdx, lesson)
                                    }
                                    disabled={markComplete.isPending}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <PlayCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-foreground">
                  Select a Module to Begin
                </h2>
                <p className="text-muted-foreground mt-2">
                  Click on any module from the left to view its lessons
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
