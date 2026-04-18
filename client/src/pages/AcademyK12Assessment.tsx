import { useState, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trophy,
  Brain,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";

export default function AcademyK12Assessment() {
  const params = useParams<{ id: string }>();
  const assessmentId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const { data: assessment, isLoading } = trpc.academyK12.getAssessmentById.useQuery(
    { id: assessmentId },
    { enabled: assessmentId > 0 }
  );

  const submitAssessment = trpc.academyK12.submitAssessment.useMutation({
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
      setSubmitting(false);
    },
    onError: (err) => {
      toast.error("Failed to submit: " + err.message);
      setSubmitting(false);
    },
  });

  const questions = useMemo(() => {
    if (!assessment?.questions) return [];
    try {
      if (typeof assessment.questions === "string") return JSON.parse(assessment.questions);
      return assessment.questions;
    } catch { return []; }
  }, [assessment]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const handleAnswer = useCallback((questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  }, []);

  const handleSubmit = () => {
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    // Format answers for submission - match backend schema: { questionId, answer }
    const formattedAnswers = questions.map((q: any, idx: number) => ({
      questionId: q.id || `q${idx + 1}`,
      answer: answers[idx],
    }));
    submitAssessment.mutate({
      assessmentId,
      answers: formattedAnswers,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!assessment) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center py-20">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Assessment not found</h3>
          <Link href="/academy/k12/my-learning">
            <Button variant="outline" className="mt-4">Back to My Learning</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Results View
  if (showResults && results) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${
              results.percentageScore >= 90 ? "text-yellow-500" :
              results.percentageScore >= 70 ? "text-blue-500" :
              results.percentageScore >= 50 ? "text-amber-500" :
              "text-red-500"
            }`} />
            <h1 className="text-3xl font-bold text-foreground mb-2">Assessment Complete</h1>
            <p className="text-muted-foreground">{assessment.title}</p>
          </div>

          {/* Score Card */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card border rounded-xl p-5 text-center">
              <p className={`text-4xl font-bold ${
                results.percentageScore >= 90 ? "text-green-600" :
                results.percentageScore >= 70 ? "text-blue-600" :
                results.percentageScore >= 50 ? "text-amber-600" :
                "text-red-600"
              }`}>
                {results.percentageScore}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Score</p>
            </div>
            <div className="bg-card border rounded-xl p-5 text-center">
              <p className="text-4xl font-bold text-foreground">{results.scoredAnswers?.filter((a: any) => a.isCorrect).length || 0}/{questions.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Correct</p>
            </div>
            <div className="bg-card border rounded-xl p-5 text-center">
              <Badge className={`text-lg px-3 py-1 ${
                results.percentageScore >= 90 ? "bg-green-100 text-green-800" :
                results.percentageScore >= 70 ? "bg-blue-100 text-blue-800" :
                results.percentageScore >= 50 ? "bg-amber-100 text-amber-800" :
                "bg-red-100 text-red-800"
              }`}>
                {results.percentageScore >= 90 ? "Mastery" : results.percentageScore >= 70 ? "Proficient" : results.percentageScore >= 50 ? "Developing" : "Foundational"}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">Level</p>
            </div>
          </div>

          {/* Feedback */}
          {results.aiFeedback && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-5 border border-blue-200 mb-6">
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Personalized Feedback
              </h3>
              <p className="text-sm text-muted-foreground">{results.aiFeedback}</p>
            </div>
          )}

          {/* Recommendations */}
          {results.recommendedNextSteps && results.recommendedNextSteps.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-5 border border-amber-200 mb-6">
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-600" />
                Next Steps
              </h3>
              <ul className="space-y-2">
                {results.recommendedNextSteps.map((rec: any, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-1 text-amber-600 flex-shrink-0" />
                    {typeof rec === 'string' ? rec : rec.reason || JSON.stringify(rec)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Question Review */}
          <div className="space-y-3 mb-6">
            <h3 className="font-bold text-foreground">Question Review</h3>
            {questions.map((q: any, idx: number) => {
              const scored = results.scoredAnswers?.find((a: any) => a.questionId === (q.id || `q${idx + 1}`));
              const userAnswer = answers[idx];
              const isCorrect = scored?.isCorrect ?? (userAnswer === q.correctAnswer);
              return (
                <div key={idx} className={`border rounded-lg p-4 ${isCorrect ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium text-foreground">{q.stem || q.question}</p>
                  </div>
                  <div className="ml-6 space-y-1 text-xs">
                    <p className={isCorrect ? "text-green-700" : "text-red-700"}>
                      Your answer: {userAnswer}
                    </p>
                    {!isCorrect && (
                      <p className="text-green-700">Correct answer: {q.correctAnswer}</p>
                    )}
                    {q.explanation && (
                      <p className="text-muted-foreground mt-1">{q.explanation}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Link href="/academy/k12/my-learning">
              <Button variant="outline">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to My Learning
              </Button>
            </Link>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                setAnswers({});
                setCurrentQuestionIndex(0);
                setShowResults(false);
                setResults(null);
              }}
            >
              Retake Assessment
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Assessment Taking View
  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">{assessment.title}</h1>
            <p className="text-sm text-muted-foreground">
              {assessment.assessmentType === "adaptive" ? "Adaptive Assessment" : "Unit Assessment"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {answeredCount}/{totalQuestions} answered
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2 mb-6">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="bg-card border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-xs capitalize">
                {currentQuestion.type || "multiple_choice"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>

            <h2 className="text-lg font-semibold text-foreground mb-6">{currentQuestion.stem || currentQuestion.question}</h2>

            {/* Multiple Choice Options */}
            {currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option: string, oi: number) => {
                  const isSelected = answers[currentQuestionIndex] === option;
                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(currentQuestionIndex, option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                          : "border-border hover:border-amber-300 hover:bg-accent/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isSelected ? "border-amber-500 bg-amber-500 text-white" : "border-muted-foreground/30"
                        }`}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="text-sm text-foreground">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer */}
            {currentQuestion.type === "short_answer" && (
              <textarea
                className="w-full border rounded-lg p-3 text-sm bg-background text-foreground min-h-[100px]"
                placeholder="Type your answer here..."
                value={answers[currentQuestionIndex] || ""}
                onChange={(e) => handleAnswer(currentQuestionIndex, e.target.value)}
              />
            )}

            {/* Difficulty indicator */}
            {currentQuestion.difficulty && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Difficulty:</span>
                <Badge variant="outline" className={`text-xs ${
                  currentQuestion.difficulty === "hard" ? "bg-red-50 text-red-700 border-red-200" :
                  currentQuestion.difficulty === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-green-50 text-green-700 border-green-200"
                }`}>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {/* Question dots */}
          <div className="flex gap-1 flex-wrap justify-center max-w-[300px]">
            {questions.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx === currentQuestionIndex
                    ? "bg-amber-500"
                    : answers[idx]
                    ? "bg-green-500"
                    : "bg-secondary"
                }`}
              />
            ))}
          </div>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!allAnswered || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-1" />
                  Submit Assessment
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
