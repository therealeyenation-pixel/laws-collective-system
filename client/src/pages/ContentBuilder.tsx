/**
 * AI Content Builder
 * 
 * Department Managers use this tool to create and customize training content
 * for their department's simulators and academy courses.
 * 
 * Features:
 * - Department selection (filtered to departments with simulators)
 * - AI-assisted content generation (lessons, quizzes, exercises, resources, video scripts)
 * - Content preview and editing
 * - Save to department training library
 * - Links content to specific simulators
 * 
 * This is the primary tool for founding members during their initial
 * two-year employee period to build out training models.
 */

import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Sparkles,
  Save,
  FileText,
  BookOpen,
  HelpCircle,
  Dumbbell,
  Link2,
  Video,
  Building2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { LazyStreamdown } from "@/components/LazyStreamdown";

const CONTENT_TYPES = [
  { value: "lesson", label: "Lesson", icon: BookOpen, description: "Structured learning module with objectives and key takeaways" },
  { value: "quiz", label: "Quiz", icon: HelpCircle, description: "Assessment questions to test knowledge retention" },
  { value: "exercise", label: "Exercise", icon: Dumbbell, description: "Hands-on practice activity with step-by-step guidance" },
  { value: "resource", label: "Resource", icon: Link2, description: "Reference material, links, and supplementary content" },
  { value: "video_script", label: "Video Script", icon: Video, description: "Script for training video or presentation" },
] as const;

export default function ContentBuilder() {
  const { user, isAuthenticated } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSimulator, setSelectedSimulator] = useState<string>("");
  const [contentType, setContentType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  const { data: registryData } = trpc.departmentDashboard.getRegistry.useQuery();
  const saveMutation = trpc.departmentDashboard.saveTrainingContent.useMutation();

  // Filter departments that have simulators or are education
  const availableDepartments = useMemo(() => {
    if (!registryData) return [];
    return registryData.departments.filter(
      (d) => d.simulators.length > 0 || d.id === "education" || d.id === "health"
    );
  }, [registryData]);

  const selectedDeptData = useMemo(() => {
    return availableDepartments.find((d) => d.id === selectedDepartment);
  }, [availableDepartments, selectedDepartment]);

  const handleGenerate = async () => {
    if (!selectedDepartment || !contentType || !topic) {
      toast.error("Please fill in department, content type, and topic");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      // Build the AI prompt based on department context
      const dept = selectedDeptData;
      const simLabel = dept?.simulators.find((s) => s.type === selectedSimulator)?.label || "General Training";
      const contentTypeLabel = CONTENT_TYPES.find((ct) => ct.value === contentType)?.label || contentType;

      const prompt = buildContentPrompt({
        departmentName: dept?.name || selectedDepartment,
        entity: dept?.entity || "The L.A.W.S. Collective LLC",
        managerName: dept?.manager.name || "Department Manager",
        simulatorLabel: simLabel,
        contentType: contentTypeLabel,
        topic,
        title,
      });

      // Use the LLM via tRPC (we'll call a generate endpoint)
      // For now, generate a structured template that the manager can customize
      const template = generateContentTemplate({
        contentType,
        topic,
        title: title || topic,
        departmentName: dept?.name || "",
        simulatorLabel: simLabel,
      });

      setGeneratedContent(template);
      if (!title) {
        setTitle(`${contentTypeLabel}: ${topic}`);
      }
      toast.success("Content template generated. Customize it below.");
    } catch (error) {
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDepartment || !contentType || !title || !generatedContent) {
      toast.error("Please complete all fields before saving");
      return;
    }

    try {
      const result = await saveMutation.mutateAsync({
        departmentId: selectedDepartment,
        title,
        contentType: contentType as any,
        content: generatedContent,
        simulatorType: selectedSimulator || undefined,
        metadata: {
          topic,
          generatedBy: user?.name || "Manager",
          generatedAt: new Date().toISOString(),
        },
      });

      if (result.success) {
        toast.success(result.message || "Training content saved!");
        // Reset form
        setTitle("");
        setTopic("");
        setGeneratedContent("");
        setContentType("");
        setSelectedSimulator("");
      } else {
        toast.error(result.error || "Failed to save content");
      }
    } catch (error) {
      toast.error("Failed to save training content");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <p className="text-center text-muted-foreground">
            Please sign in to access the Content Builder.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  AI Content Builder
                </h1>
                <p className="text-xs text-muted-foreground">
                  Create training content for department simulators and academy courses
                </p>
              </div>
            </div>
            {selectedDeptData && (
              <Badge variant="outline" className="text-xs">
                {selectedDeptData.entity}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="create">Create Content</TabsTrigger>
            <TabsTrigger value="library">Content Library</TabsTrigger>
          </TabsList>

          {/* Create Content Tab */}
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Configuration */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Department & Simulator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Department Select */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Department
                      </label>
                      <Select
                        value={selectedDepartment}
                        onValueChange={(val) => {
                          setSelectedDepartment(val);
                          setSelectedSimulator("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: dept.color }}
                                />
                                {dept.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Simulator Select */}
                    {selectedDeptData && selectedDeptData.simulators.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Target Simulator (optional)
                        </label>
                        <Select
                          value={selectedSimulator}
                          onValueChange={setSelectedSimulator}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="General training" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Training</SelectItem>
                            {selectedDeptData.simulators.map((sim) => (
                              <SelectItem key={sim.type} value={sim.type}>
                                {sim.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Manager Info */}
                    {selectedDeptData && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Department Manager</p>
                        <p className="text-sm font-medium">{selectedDeptData.manager.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedDeptData.manager.title}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Content Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {CONTENT_TYPES.map((ct) => {
                      const Icon = ct.icon;
                      return (
                        <button
                          key={ct.value}
                          onClick={() => setContentType(ct.value)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            contentType === ct.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{ct.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {ct.description}
                          </p>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Content Generation */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Generate Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Topic / Subject
                      </label>
                      <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., LLC Formation Steps, Grant Budget Preparation, Contract Negotiation Basics"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Title (auto-generated if left blank)
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Custom title for this content piece"
                      />
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={!selectedDepartment || !contentType || !topic || isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Content Template
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Content Editor */}
                {generatedContent && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Content Editor</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSave}
                            disabled={saveMutation.isPending}
                          >
                            {saveMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-1" />
                            )}
                            Save to Library
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Generated content will appear here..."
                      />
                      {/* Preview */}
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <LazyStreamdown>{generatedContent}</LazyStreamdown>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Content Library Tab */}
          <TabsContent value="library">
            <ContentLibrary departmentId={selectedDepartment} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/**
 * Content Library component — shows saved training content
 */
function ContentLibrary({ departmentId }: { departmentId: string }) {
  const { data } = trpc.departmentDashboard.getTrainingContent.useQuery(
    { departmentId: departmentId || "education" },
    { enabled: true }
  );

  if (!data || data.content.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Content Yet</h3>
        <p className="text-sm text-muted-foreground">
          Start creating training content using the Create tab. Content saved here
          will be available for department simulators and academy courses.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {data.department && (
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold">{data.department.name} Department</h3>
          <Badge variant="outline">{data.department.manager.name}</Badge>
        </div>
      )}
      {(data.content as any[]).map((item: any) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-sm">{item.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {item.contentType}
                </Badge>
                {item.simulatorType && (
                  <Badge variant="outline" className="text-xs">
                    {item.simulatorType}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {item.status}
                </span>
              </div>
            </div>
            <CheckCircle2
              className={`w-4 h-4 ${
                item.status === "published"
                  ? "text-green-500"
                  : "text-muted-foreground/30"
              }`}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Build a structured AI prompt for content generation
 */
function buildContentPrompt(params: {
  departmentName: string;
  entity: string;
  managerName: string;
  simulatorLabel: string;
  contentType: string;
  topic: string;
  title: string;
}): string {
  return `You are creating training content for the ${params.departmentName} department of ${params.entity}.

Department Manager: ${params.managerName}
Target Simulator: ${params.simulatorLabel}
Content Type: ${params.contentType}
Topic: ${params.topic}
${params.title ? `Title: ${params.title}` : ""}

Create a comprehensive ${params.contentType.toLowerCase()} that:
1. Is relevant to the ${params.departmentName} department's focus
2. Aligns with the L.A.W.S. Collective's mission of multi-generational wealth building
3. Is practical and actionable for members going through the ${params.simulatorLabel}
4. Uses clear, accessible language
5. Includes real-world examples relevant to the community`;
}

/**
 * Generate a structured content template based on type
 */
function generateContentTemplate(params: {
  contentType: string;
  topic: string;
  title: string;
  departmentName: string;
  simulatorLabel: string;
}): string {
  const templates: Record<string, string> = {
    lesson: `# ${params.title}

## Learning Objectives
- Understand the fundamentals of ${params.topic}
- Apply key concepts to real-world scenarios within ${params.departmentName}
- Build practical skills for ${params.simulatorLabel}

## Introduction
[Introduce the topic and its relevance to the L.A.W.S. Collective mission]

## Key Concepts

### 1. [First Key Concept]
[Explanation with examples]

### 2. [Second Key Concept]
[Explanation with examples]

### 3. [Third Key Concept]
[Explanation with examples]

## Practical Application
[How this applies to the member's journey through ${params.simulatorLabel}]

## Key Takeaways
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

## Next Steps
[What the member should do after completing this lesson]

---
*${params.departmentName} Department | ${params.simulatorLabel}*`,

    quiz: `# Quiz: ${params.title}

## Instructions
Answer the following questions to test your understanding of ${params.topic}.
You need 80% or higher to pass.

---

### Question 1
[Question about ${params.topic}]

- A) [Option A]
- B) [Option B]
- C) [Option C]
- D) [Option D]

**Correct Answer:** [Letter]
**Explanation:** [Why this is correct]

---

### Question 2
[Question about ${params.topic}]

- A) [Option A]
- B) [Option B]
- C) [Option C]
- D) [Option D]

**Correct Answer:** [Letter]
**Explanation:** [Why this is correct]

---

### Question 3
[Question about ${params.topic}]

- A) [Option A]
- B) [Option B]
- C) [Option C]
- D) [Option D]

**Correct Answer:** [Letter]
**Explanation:** [Why this is correct]

---

### Question 4
[Question about ${params.topic}]

- A) [Option A]
- B) [Option B]
- C) [Option C]
- D) [Option D]

**Correct Answer:** [Letter]
**Explanation:** [Why this is correct]

---

### Question 5
[Question about ${params.topic}]

- A) [Option A]
- B) [Option B]
- C) [Option C]
- D) [Option D]

**Correct Answer:** [Letter]
**Explanation:** [Why this is correct]

---
*${params.departmentName} Department Assessment | ${params.simulatorLabel}*`,

    exercise: `# Exercise: ${params.title}

## Overview
This hands-on exercise will help you practice ${params.topic} in a real-world context.

## Prerequisites
- Completed the lesson on ${params.topic}
- Access to ${params.simulatorLabel}

## Instructions

### Step 1: [Setup]
[Detailed instructions for the first step]

### Step 2: [Core Activity]
[Detailed instructions for the main exercise]

### Step 3: [Application]
[Apply what you've learned to a scenario]

### Step 4: [Review]
[Self-assessment and reflection]

## Expected Outcomes
- [What the member should have accomplished]
- [Skills they should have practiced]

## Submission
[How to submit or record completion]

---
*${params.departmentName} Department | Hands-On Exercise*`,

    resource: `# Resource Guide: ${params.title}

## Overview
This resource guide provides supplementary materials for ${params.topic}.

## Essential Reading
1. [Resource Title] — [Brief description and link]
2. [Resource Title] — [Brief description and link]
3. [Resource Title] — [Brief description and link]

## Tools & Templates
- [Tool/Template Name] — [Description and access instructions]
- [Tool/Template Name] — [Description and access instructions]

## Video Resources
- [Video Title] — [Duration, description]
- [Video Title] — [Duration, description]

## Community Resources
- L.A.W.S. Collective Internal Resources
- Department-specific guides and documentation

## Glossary
| Term | Definition |
|------|-----------|
| [Term 1] | [Definition] |
| [Term 2] | [Definition] |
| [Term 3] | [Definition] |

---
*${params.departmentName} Department | Reference Materials*`,

    video_script: `# Video Script: ${params.title}

## Production Details
- **Department:** ${params.departmentName}
- **Simulator:** ${params.simulatorLabel}
- **Estimated Duration:** 5-8 minutes
- **Target Audience:** L.A.W.S. Collective Members

---

## INTRO (30 seconds)

**[ON SCREEN: Title Card — "${params.title}"]**

**NARRATOR:** "Welcome to the ${params.departmentName} training series. Today we're covering ${params.topic} — an essential skill for your journey through ${params.simulatorLabel}."

---

## SECTION 1: Foundation (2 minutes)

**[ON SCREEN: Key concept visual]**

**NARRATOR:** "[Introduce the first key concept of ${params.topic}]"

**[ON SCREEN: Example or demonstration]**

**NARRATOR:** "[Explain with a real-world example]"

---

## SECTION 2: Application (2 minutes)

**[ON SCREEN: Step-by-step walkthrough]**

**NARRATOR:** "[Walk through how to apply this in the simulator]"

---

## SECTION 3: Key Takeaways (1 minute)

**[ON SCREEN: Summary bullet points]**

**NARRATOR:** "Let's recap what we've covered today..."

---

## OUTRO (30 seconds)

**NARRATOR:** "Great work! You're one step closer to completing your ${params.simulatorLabel}. Head back to the simulator to put this into practice."

**[ON SCREEN: L.A.W.S. Collective logo + Next Steps]**

---
*Script by ${params.departmentName} Department | Real-Eye-Nation Production*`,
  };

  return templates[params.contentType] || templates.lesson;
}
