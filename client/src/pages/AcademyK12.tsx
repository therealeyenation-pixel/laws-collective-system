import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  GraduationCap,
  Search,
  ChevronRight,
  Clock,
  Target,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";

const categoryLabels: Record<string, string> = {
  core_academic: "Core Academic",
  stem_extended: "STEM Extended",
  creative_arts: "Creative Arts",
  life_skills: "Life Skills",
  laws_framework: "L.A.W.S. Framework",
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  core_academic: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  stem_extended: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  creative_arts: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  life_skills: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  laws_framework: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

const levelBandLabels: Record<string, string> = {
  early_elementary: "K-2",
  upper_elementary: "3-5",
  middle_school: "6-8",
  high_school_intro: "9-10",
  high_school_adv: "11-12",
  certification: "Cert",
};

export default function AcademyK12() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);

  const { data: subjects, isLoading: subjectsLoading } = trpc.academyK12.getSubjects.useQuery();
  const { data: units } = trpc.academyK12.getUnitsBySubject.useQuery(
    { subjectId: expandedSubject! },
    { enabled: !!expandedSubject }
  );

  const filteredSubjects = useMemo(() => {
    if (!subjects) return [];
    return subjects.filter((s: any) => {
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || s.status === selectedCategory;
      // Use the category field - it's stored as academy_subject_category in DB but comes back as status in the enum
      return matchesSearch && matchesCategory;
    });
  }, [subjects, search, selectedCategory]);

  const groupedSubjects = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const s of (filteredSubjects || [])) {
      // The category is stored in the DB enum column
      const cat = (s as any).category || "core_academic";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    }
    return groups;
  }, [filteredSubjects]);

  const categories = ["core_academic", "stem_extended", "creative_arts", "life_skills", "laws_framework"];

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
              <h1 className="text-2xl font-bold text-foreground">K-12 Homeschool Curriculum</h1>
              <p className="text-sm text-muted-foreground">LuvOnPurpose Academy and Outreach — Self-paced, standards-aligned education</p>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 max-w-3xl">
            Explore our comprehensive curriculum across {subjects?.length || 0} subjects. Each course is AI-generated with real educational standards, 
            then reviewed and enriched by human educators with cultural perspective and lived experience. Progress at your own pace — 
            our adaptive assessments ensure you're always challenged at the right level.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                {categoryLabels[cat]}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {subjectsLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        )}

        {/* Subject Grid by Category */}
        {!subjectsLoading && Object.entries(groupedSubjects).map(([category, catSubjects]) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge className={`${categoryColors[category]?.bg || "bg-gray-50"} ${categoryColors[category]?.text || "text-gray-700"} ${categoryColors[category]?.border || "border-gray-200"} border`}>
                {categoryLabels[category] || category}
              </Badge>
              <span className="text-sm text-muted-foreground">{catSubjects.length} subject{catSubjects.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catSubjects.map((subject: any) => (
                <div
                  key={subject.id}
                  className={`rounded-xl border p-5 transition-all cursor-pointer hover:shadow-md ${
                    expandedSubject === subject.id
                      ? `ring-2 ring-amber-400 ${categoryColors[category]?.bg || "bg-white"}`
                      : "bg-card hover:bg-accent/5"
                  }`}
                  onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{subject.iconEmoji}</span>
                      <h3 className="font-bold text-foreground">{subject.name}</h3>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSubject === subject.id ? "rotate-90" : ""}`} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{subject.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {subject.gradeRange}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {subject.standardsAlignment?.split("(")[0]?.trim()}
                    </span>
                  </div>

                  {/* Expanded: Show Units */}
                  {expandedSubject === subject.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2" onClick={(e) => e.stopPropagation()}>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Units & Courses</h4>
                      {!units ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading units...
                        </div>
                      ) : units.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No units available yet. Content is being developed.</p>
                      ) : (
                        units.map((unit: any) => (
                          <Link key={unit.id} href={`/academy/k12/unit/${unit.id}`}>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-accent/10 transition-colors cursor-pointer border border-transparent hover:border-border">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{unit.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {levelBandLabels[unit.levelBand] || unit.levelBand}
                                  </Badge>
                                  {unit.estimatedHours && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {unit.estimatedHours}h
                                    </span>
                                  )}
                                  {unit.humanReviewed && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      Reviewed
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {!subjectsLoading && Object.keys(groupedSubjects).length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No subjects found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
