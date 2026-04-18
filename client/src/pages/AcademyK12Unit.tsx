import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Play,
  FileText,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import { Link, useParams } from "wouter";

const levelBandLabels: Record<string, string> = {
  early_elementary: "Kindergarten - 2nd Grade",
  upper_elementary: "3rd - 5th Grade",
  middle_school: "6th - 8th Grade",
  high_school_intro: "9th - 10th Grade",
  high_school_adv: "11th - 12th Grade",
  certification: "Certification Level",
};

const contentTypeIcons: Record<string, React.ReactNode> = {
  instruction: <BookOpen className="w-4 h-4" />,
  practice: <Target className="w-4 h-4" />,
  exploration: <Lightbulb className="w-4 h-4" />,
  project: <FileText className="w-4 h-4" />,
  discussion: <MessageSquare className="w-4 h-4" />,
  lab: <Play className="w-4 h-4" />,
  reading: <BookOpen className="w-4 h-4" />,
  simulation: <Play className="w-4 h-4" />,
};

export default function AcademyK12Unit() {
  const params = useParams<{ id: string }>();
  const unitId = parseInt(params.id || "0");
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const { data: unit, isLoading: unitLoading } = trpc.academyK12.getUnitById.useQuery({ id: unitId }, { enabled: unitId > 0 });
  const { data: lessons, isLoading: lessonsLoading } = trpc.academyK12.getLessonsByUnit.useQuery({ unitId }, { enabled: unitId > 0 });
  const { data: lessonDetail } = trpc.academyK12.getLessonById.useQuery({ id: selectedLessonId! }, { enabled: !!selectedLessonId });

  const currentLessonIndex = lessons?.findIndex((l: any) => l.id === selectedLessonId) ?? -1;
  const canGoPrev = currentLessonIndex > 0;
  const canGoNext = currentLessonIndex >= 0 && currentLessonIndex < (lessons?.length ?? 0) - 1;

  if (unitLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!unit) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center py-20">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Unit not found</h3>
          <Link href="/academy/k12">
            <Button variant="outline" className="mt-4">Back to Subjects</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const objectives = (() => {
    try {
      if (typeof unit.learningObjectives === "string") return JSON.parse(unit.learningObjectives);
      return unit.learningObjectives || [];
    } catch { return []; }
  })();

  const standards = (() => {
    try {
      if (typeof unit.standardsCovered === "string") return JSON.parse(unit.standardsCovered);
      return unit.standardsCovered || [];
    } catch { return []; }
  })();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/academy/k12">
            <span className="hover:text-foreground cursor-pointer">K-12 Curriculum</span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{unit.title}</span>
        </div>

        {/* Unit Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800 mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">{unit.title}</h1>
          <p className="text-muted-foreground mb-4">{unit.description}</p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              {levelBandLabels[unit.levelBand as string] || unit.levelBand}
            </Badge>
            {unit.estimatedHours && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                ~{unit.estimatedHours} hours
              </Badge>
            )}
            {unit.humanReviewed && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Educator Reviewed
              </Badge>
            )}
          </div>

          {/* Learning Objectives */}
          {objectives.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-700">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                <Target className="w-4 h-4" />
                Learning Objectives
              </h3>
              <ul className="grid sm:grid-cols-2 gap-1">
                {objectives.map((obj: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Standards */}
          {standards.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {standards.map((std: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs bg-white/50">
                  {std}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Two-column: Lesson List + Lesson Viewer */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lesson List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Lessons ({lessons?.length || 0})
            </h2>
            {lessonsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading lessons...
              </div>
            ) : !lessons?.length ? (
              <div className="p-4 text-center border rounded-lg">
                <p className="text-sm text-muted-foreground">No lessons available yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Content is being generated by AI and reviewed by educators.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {lessons.map((lesson: any, idx: number) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                      selectedLessonId === lesson.id
                        ? "bg-amber-100 dark:bg-amber-900/30 border border-amber-300"
                        : "hover:bg-accent/10 border border-transparent"
                    }`}
                  >
                    <span className="text-xs font-mono text-muted-foreground mt-0.5 w-5 text-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {contentTypeIcons[lesson.contentType] || <BookOpen className="w-3 h-3" />}
                          {lesson.contentType}
                        </span>
                        {lesson.estimatedMinutes && (
                          <span className="text-xs text-muted-foreground">
                            {lesson.estimatedMinutes}min
                          </span>
                        )}
                        {lesson.humanReviewed && (
                          <Sparkles className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lesson Viewer */}
          <div className="lg:col-span-2">
            {!selectedLessonId ? (
              <div className="border rounded-xl p-12 text-center bg-card">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Lesson</h3>
                <p className="text-muted-foreground">Choose a lesson from the list to begin learning.</p>
              </div>
            ) : !lessonDetail ? (
              <div className="border rounded-xl p-12 text-center bg-card">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-4" />
                <p className="text-muted-foreground">Loading lesson content...</p>
              </div>
            ) : (
              <div className="border rounded-xl bg-card overflow-hidden">
                {/* Lesson Header */}
                <div className="p-6 border-b bg-gradient-to-r from-amber-50/50 to-transparent">
                  <h2 className="text-xl font-bold text-foreground mb-1">{lessonDetail.title}</h2>
                  <p className="text-sm text-muted-foreground">{lessonDetail.summary}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant="outline" className="text-xs">
                      {contentTypeIcons[lessonDetail.contentType] || <BookOpen className="w-3 h-3" />}
                      <span className="ml-1 capitalize">{lessonDetail.contentType}</span>
                    </Badge>
                    {lessonDetail.estimatedMinutes && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{lessonDetail.estimatedMinutes} min
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Blocks */}
                <div className="p-6 space-y-6">
                  {(() => {
                    const blocks = (() => {
                      try {
                        if (typeof lessonDetail.contentBlocks === "string") return JSON.parse(lessonDetail.contentBlocks);
                        return lessonDetail.contentBlocks || [];
                      } catch { return []; }
                    })();

                    return blocks.map((block: any, idx: number) => {
                      if (block.type === "key_concept") {
                        return (
                          <div key={idx} className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-l-4 border-blue-500">
                            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              {block.data?.title || "Key Concept"}
                            </h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200">{block.data?.content}</p>
                          </div>
                        );
                      }
                      if (block.type === "text") {
                        return (
                          <p key={idx} className="text-foreground leading-relaxed">{block.data?.content}</p>
                        );
                      }
                      if (block.type === "practice_problem") {
                        return (
                          <div key={idx} className="space-y-3">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                              <Target className="w-4 h-4 text-amber-600" />
                              Practice Problems
                            </h3>
                            {(block.data?.problems || []).map((prob: any, pi: number) => (
                              <PracticeProblem key={pi} problem={prob} index={pi} />
                            ))}
                          </div>
                        );
                      }
                      if (block.type === "real_world_connection") {
                        return (
                          <div key={idx} className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border-l-4 border-green-500">
                            <h3 className="font-bold text-green-900 dark:text-green-300 mb-2">
                              🌍 {block.data?.title || "Real-World Connection"}
                            </h3>
                            <p className="text-sm text-green-800 dark:text-green-200">{block.data?.content}</p>
                          </div>
                        );
                      }
                      if (block.type === "discussion_prompt") {
                        return (
                          <div key={idx} className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border-l-4 border-purple-500">
                            <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Discussion
                            </h3>
                            <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">{block.data?.prompt}</p>
                            {block.data?.guiding_questions && (
                              <ul className="space-y-1">
                                {block.data.guiding_questions.map((q: string, qi: number) => (
                                  <li key={qi} className="text-xs text-purple-700 dark:text-purple-300 flex items-start gap-1">
                                    <span>•</span> {q}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      }
                      return null;
                    });
                  })()}

                  {/* Vocabulary Terms */}
                  {(() => {
                    const vocab = (() => {
                      try {
                        if (typeof lessonDetail.vocabularyTerms === "string") return JSON.parse(lessonDetail.vocabularyTerms);
                        return lessonDetail.vocabularyTerms || [];
                      } catch { return []; }
                    })();
                    if (!vocab.length) return null;
                    return (
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200">
                        <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
                          📖 Vocabulary
                        </h3>
                        <div className="space-y-2">
                          {vocab.map((v: any, vi: number) => (
                            <div key={vi}>
                              <span className="font-semibold text-sm text-foreground">{v.term}</span>
                              <span className="text-sm text-muted-foreground"> — {v.definition}</span>
                              {v.example && (
                                <p className="text-xs text-muted-foreground italic ml-4">Example: {v.example}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Human Notes (Educator Perspective) */}
                  {lessonDetail.humanNotes && lessonDetail.humanNotes.length > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 border border-emerald-200">
                      <h3 className="font-bold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Educator Perspective
                      </h3>
                      {lessonDetail.humanNotes.map((note: any) => (
                        <div key={note.id} className="mb-3 last:mb-0">
                          <p className="text-sm text-emerald-800 dark:text-emerald-200">{note.content}</p>
                          {note.authorName && (
                            <p className="text-xs text-emerald-600 mt-1">— {note.authorName}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="p-4 border-t flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canGoPrev}
                    onClick={() => {
                      if (canGoPrev && lessons) {
                        setSelectedLessonId(lessons[currentLessonIndex - 1].id);
                      }
                    }}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Lesson {currentLessonIndex + 1} of {lessons?.length || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canGoNext}
                    onClick={() => {
                      if (canGoNext && lessons) {
                        setSelectedLessonId(lessons[currentLessonIndex + 1].id);
                      }
                    }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Practice Problem Component with show/hide answer
function PracticeProblem({ problem, index }: { problem: any; index: number }) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="bg-card border rounded-lg p-4">
      <p className="text-sm font-medium text-foreground mb-2">
        <span className="text-amber-600 font-bold mr-1">Q{index + 1}.</span>
        {problem.question}
      </p>
      <div className="flex gap-2 mt-2">
        {problem.hint && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowHint(!showHint)}>
            <Lightbulb className="w-3 h-3 mr-1" />
            {showHint ? "Hide Hint" : "Show Hint"}
          </Button>
        )}
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowAnswer(!showAnswer)}>
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </Button>
      </div>
      {showHint && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
          💡 Hint: {problem.hint}
        </p>
      )}
      {showAnswer && (
        <p className="text-xs text-green-600 dark:text-green-400 mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded">
          ✅ Answer: {problem.answer}
        </p>
      )}
    </div>
  );
}
