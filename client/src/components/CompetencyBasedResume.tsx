import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Users,
  TrendingUp,
  CheckCircle,
  Target,
} from "lucide-react";

/**
 * Competency-Based Resume Generator
 * 
 * Creates professional resumes that emphasize demonstrated competency
 * over traditional credentials - equally credible qualification pathway
 */

interface CompetencyEvidence {
  id: string;
  category: string;
  description: string;
  outcome: string;
  timeframe: string;
  verifiable: boolean;
  verificationSource?: string;
}

interface SkillAssessment {
  skill: string;
  level: "foundational" | "proficient" | "advanced" | "expert";
  evidence: string;
}

interface CharacterReference {
  name: string;
  relationship: string;
  yearsKnown: number;
  contactInfo: string;
  attestation: string;
}

interface CompetencyResumeData {
  // Personal Info
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  
  // Professional Summary
  summary: string;
  
  // Qualification Type
  qualificationType: "traditional" | "demonstrated" | "hybrid";
  
  // Traditional Credentials (if applicable)
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
    active: boolean;
  }>;
  
  // Demonstrated Competency Evidence
  competencyEvidence: CompetencyEvidence[];
  
  // Skills Assessment
  skills: SkillAssessment[];
  
  // Character References
  references: CharacterReference[];
  
  // Development Plan
  developmentPlan: string;
}

const competencyCategories = [
  { value: "fiscal_stewardship", label: "Fiscal Stewardship", icon: TrendingUp },
  { value: "market_research", label: "Market Research & Analysis", icon: Target },
  { value: "project_management", label: "Project Management", icon: Briefcase },
  { value: "leadership", label: "Leadership & Team Building", icon: Users },
  { value: "problem_solving", label: "Problem Solving", icon: CheckCircle },
  { value: "communication", label: "Communication & Negotiation", icon: Star },
  { value: "technical", label: "Technical Skills", icon: Award },
  { value: "operational", label: "Operational Excellence", icon: Target },
  { value: "strategic", label: "Strategic Planning", icon: TrendingUp },
  { value: "customer_service", label: "Customer/Client Relations", icon: Users },
];

const skillLevels = [
  { value: "foundational", label: "Foundational", description: "Basic understanding, can perform with guidance" },
  { value: "proficient", label: "Proficient", description: "Solid capability, works independently" },
  { value: "advanced", label: "Advanced", description: "Deep expertise, can mentor others" },
  { value: "expert", label: "Expert", description: "Recognized authority, drives innovation" },
];

interface CompetencyBasedResumeProps {
  candidateName?: string;
  positionTitle?: string;
  existingData?: any;
  isSaving?: boolean;
  onGenerate?: (data: CompetencyResumeData) => void;
  onSave?: (data: CompetencyResumeData) => void;
}

export default function CompetencyBasedResume({
  candidateName = "",
  positionTitle = "",
  existingData,
  isSaving = false,
  onGenerate,
  onSave,
}: CompetencyBasedResumeProps) {
  const [resumeData, setResumeData] = useState<CompetencyResumeData>({
    fullName: candidateName,
    title: positionTitle,
    email: "",
    phone: "",
    location: "",
    summary: "",
    qualificationType: "demonstrated",
    education: [],
    certifications: [],
    competencyEvidence: [],
    skills: [],
    references: [],
    developmentPlan: "",
  });

  // Load existing data when provided
  useEffect(() => {
    if (existingData) {
      setResumeData({
        fullName: existingData.fullName || candidateName,
        title: existingData.title || positionTitle,
        email: existingData.email || "",
        phone: existingData.phone || "",
        location: existingData.location || "",
        summary: existingData.summary || "",
        qualificationType: existingData.qualificationType || "demonstrated",
        education: existingData.education || [],
        certifications: existingData.certifications || [],
        competencyEvidence: existingData.competencyEvidence || [],
        skills: existingData.skills || [],
        references: existingData.references || [],
        developmentPlan: existingData.developmentPlan || "",
      });
    } else if (candidateName || positionTitle) {
      setResumeData(prev => ({
        ...prev,
        fullName: candidateName || prev.fullName,
        title: positionTitle || prev.title,
      }));
    }
  }, [existingData, candidateName, positionTitle]);

  const addCompetencyEvidence = () => {
    setResumeData({
      ...resumeData,
      competencyEvidence: [
        ...resumeData.competencyEvidence,
        {
          id: Date.now().toString(),
          category: "",
          description: "",
          outcome: "",
          timeframe: "",
          verifiable: true,
          verificationSource: "",
        },
      ],
    });
  };

  const updateCompetencyEvidence = (id: string, field: keyof CompetencyEvidence, value: any) => {
    setResumeData({
      ...resumeData,
      competencyEvidence: resumeData.competencyEvidence.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  };

  const removeCompetencyEvidence = (id: string) => {
    setResumeData({
      ...resumeData,
      competencyEvidence: resumeData.competencyEvidence.filter((e) => e.id !== id),
    });
  };

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [
        ...resumeData.skills,
        { skill: "", level: "proficient", evidence: "" },
      ],
    });
  };

  const updateSkill = (index: number, field: keyof SkillAssessment, value: any) => {
    const newSkills = [...resumeData.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setResumeData({ ...resumeData, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((_, i) => i !== index),
    });
  };

  const addReference = () => {
    setResumeData({
      ...resumeData,
      references: [
        ...resumeData.references,
        { name: "", relationship: "", yearsKnown: 0, contactInfo: "", attestation: "" },
      ],
    });
  };

  const updateReference = (index: number, field: keyof CharacterReference, value: any) => {
    const newRefs = [...resumeData.references];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setResumeData({ ...resumeData, references: newRefs });
  };

  const removeReference = (index: number) => {
    setResumeData({
      ...resumeData,
      references: resumeData.references.filter((_, i) => i !== index),
    });
  };

  const generateResumeDocument = () => {
    // Validate required fields
    if (!resumeData.fullName || !resumeData.title) {
      toast.error("Please fill in name and position title");
      return;
    }

    if (resumeData.qualificationType !== "traditional" && resumeData.competencyEvidence.length === 0) {
      toast.error("Please add at least one competency evidence item");
      return;
    }

    // Generate HTML document
    const html = generateResumeHTML(resumeData);
    
    // Create download
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resumeData.fullName.replace(/\s+/g, "_")}_Competency_Resume.html`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Resume generated successfully");
    onGenerate?.(resumeData);
  };

  const generateResumeHTML = (data: CompetencyResumeData): string => {
    const qualificationLabel = data.qualificationType === "traditional" 
      ? "Traditional Credentials" 
      : data.qualificationType === "demonstrated" 
        ? "Demonstrated Competency" 
        : "Hybrid Qualifications";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.fullName} - ${data.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; max-width: 8.5in; margin: 0 auto; padding: 0.5in; }
    .header { text-align: center; border-bottom: 2px solid #1a365d; padding-bottom: 1rem; margin-bottom: 1.5rem; }
    .name { font-size: 2rem; font-weight: bold; color: #1a365d; }
    .title { font-size: 1.2rem; color: #4a5568; margin-top: 0.25rem; }
    .contact { font-size: 0.9rem; color: #718096; margin-top: 0.5rem; }
    .qualification-badge { display: inline-block; background: #1a365d; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; margin-top: 0.5rem; }
    .section { margin-bottom: 1.5rem; }
    .section-title { font-size: 1.1rem; font-weight: bold; color: #1a365d; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary { font-style: italic; color: #4a5568; }
    .evidence-item { margin-bottom: 1rem; padding: 0.75rem; background: #f7fafc; border-left: 3px solid #1a365d; }
    .evidence-category { font-weight: bold; color: #1a365d; }
    .evidence-outcome { color: #2d3748; margin-top: 0.25rem; }
    .evidence-meta { font-size: 0.85rem; color: #718096; margin-top: 0.25rem; }
    .skill-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0; }
    .skill-name { font-weight: 500; }
    .skill-level { color: #1a365d; font-weight: bold; }
    .skill-evidence { font-size: 0.85rem; color: #718096; }
    .reference { margin-bottom: 1rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    .reference-name { font-weight: bold; }
    .reference-relationship { color: #718096; font-size: 0.9rem; }
    .reference-attestation { font-style: italic; margin-top: 0.5rem; color: #4a5568; }
    .development-plan { background: #edf2f7; padding: 1rem; border-radius: 0.5rem; }
    .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.8rem; color: #a0aec0; text-align: center; }
    @media print { body { padding: 0.25in; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${data.fullName}</div>
    <div class="title">${data.title}</div>
    <div class="contact">${[data.email, data.phone, data.location].filter(Boolean).join(" | ")}</div>
    <div class="qualification-badge">${qualificationLabel}</div>
  </div>

  ${data.summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <p class="summary">${data.summary}</p>
  </div>
  ` : ""}

  ${data.competencyEvidence.length > 0 ? `
  <div class="section">
    <div class="section-title">Demonstrated Competency Evidence</div>
    ${data.competencyEvidence.map(e => `
    <div class="evidence-item">
      <div class="evidence-category">${competencyCategories.find(c => c.value === e.category)?.label || e.category}</div>
      <div>${e.description}</div>
      <div class="evidence-outcome"><strong>Outcome:</strong> ${e.outcome}</div>
      <div class="evidence-meta">${e.timeframe}${e.verifiable ? ` | Verifiable via: ${e.verificationSource}` : ""}</div>
    </div>
    `).join("")}
  </div>
  ` : ""}

  ${data.skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills Assessment</div>
    ${data.skills.map(s => `
    <div class="skill-item">
      <div>
        <span class="skill-name">${s.skill}</span>
        <div class="skill-evidence">${s.evidence}</div>
      </div>
      <span class="skill-level">${skillLevels.find(l => l.value === s.level)?.label || s.level}</span>
    </div>
    `).join("")}
  </div>
  ` : ""}

  ${data.education.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${data.education.map(e => `
    <div style="margin-bottom: 0.5rem;">
      <strong>${e.degree} in ${e.field}</strong><br>
      ${e.institution} | ${e.year}
    </div>
    `).join("")}
  </div>
  ` : ""}

  ${data.certifications.length > 0 ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    ${data.certifications.map(c => `
    <div style="margin-bottom: 0.25rem;">
      <strong>${c.name}</strong> - ${c.issuer} (${c.year}) ${c.active ? "✓ Active" : ""}
    </div>
    `).join("")}
  </div>
  ` : ""}

  ${data.references.length > 0 ? `
  <div class="section">
    <div class="section-title">Character References</div>
    ${data.references.map(r => `
    <div class="reference">
      <div class="reference-name">${r.name}</div>
      <div class="reference-relationship">${r.relationship} | Known ${r.yearsKnown} years</div>
      <div class="reference-attestation">"${r.attestation}"</div>
    </div>
    `).join("")}
  </div>
  ` : ""}

  ${data.developmentPlan ? `
  <div class="section">
    <div class="section-title">Professional Development Plan</div>
    <div class="development-plan">${data.developmentPlan}</div>
  </div>
  ` : ""}

  <div class="footer">
    Generated ${new Date().toLocaleDateString()} | Qualification Type: ${qualificationLabel}
  </div>
</body>
</html>`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Competency-Based Resume Builder
          </CardTitle>
          <CardDescription>
            Create a professional resume that emphasizes demonstrated competency as an equally credible qualification pathway
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Qualification Type Selection */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <Label className="text-base font-semibold">Qualification Pathway</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select how qualifications will be documented - all pathways are equally credible
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={resumeData.qualificationType === "traditional" ? "default" : "outline"}
                className="h-auto py-3 flex-col"
                onClick={() => setResumeData({ ...resumeData, qualificationType: "traditional" })}
              >
                <GraduationCap className="w-5 h-5 mb-1" />
                <span className="text-sm">Traditional</span>
                <span className="text-xs text-muted-foreground">Degrees & Certs</span>
              </Button>
              <Button
                variant={resumeData.qualificationType === "demonstrated" ? "default" : "outline"}
                className="h-auto py-3 flex-col"
                onClick={() => setResumeData({ ...resumeData, qualificationType: "demonstrated" })}
              >
                <Star className="w-5 h-5 mb-1" />
                <span className="text-sm">Demonstrated</span>
                <span className="text-xs text-muted-foreground">Proven Results</span>
              </Button>
              <Button
                variant={resumeData.qualificationType === "hybrid" ? "default" : "outline"}
                className="h-auto py-3 flex-col"
                onClick={() => setResumeData({ ...resumeData, qualificationType: "hybrid" })}
              >
                <Award className="w-5 h-5 mb-1" />
                <span className="text-sm">Hybrid</span>
                <span className="text-xs text-muted-foreground">Both Types</span>
              </Button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={resumeData.fullName}
                onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                placeholder="Full legal name"
              />
            </div>
            <div className="space-y-2">
              <Label>Position Title *</Label>
              <Input
                value={resumeData.title}
                onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                placeholder="e.g., Financial Manager"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={resumeData.email}
                onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={resumeData.phone}
                onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Location</Label>
              <Input
                value={resumeData.location}
                onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                placeholder="City, State"
              />
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-2">
            <Label>Professional Summary</Label>
            <Textarea
              value={resumeData.summary}
              onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
              placeholder="Brief overview of qualifications and value proposition..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Demonstrated Competency Evidence */}
      {(resumeData.qualificationType === "demonstrated" || resumeData.qualificationType === "hybrid") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Demonstrated Competency Evidence
            </CardTitle>
            <CardDescription>
              Document specific examples of proven capability with measurable outcomes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resumeData.competencyEvidence.map((evidence, index) => (
              <div key={evidence.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Evidence #{index + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCompetencyEvidence(evidence.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Competency Category</Label>
                    <Select
                      value={evidence.category}
                      onValueChange={(v) => updateCompetencyEvidence(evidence.id, "category", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {competencyCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeframe</Label>
                    <Input
                      value={evidence.timeframe}
                      onChange={(e) => updateCompetencyEvidence(evidence.id, "timeframe", e.target.value)}
                      placeholder="e.g., 2020-Present, 5+ years"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description of Competency</Label>
                  <Textarea
                    value={evidence.description}
                    onChange={(e) => updateCompetencyEvidence(evidence.id, "description", e.target.value)}
                    placeholder="Describe the specific competency demonstrated..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Measurable Outcome / Result</Label>
                  <Textarea
                    value={evidence.outcome}
                    onChange={(e) => updateCompetencyEvidence(evidence.id, "outcome", e.target.value)}
                    placeholder="What was the result? Include numbers, percentages, or specific achievements..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verification Source (Optional)</Label>
                  <Input
                    value={evidence.verificationSource}
                    onChange={(e) => updateCompetencyEvidence(evidence.id, "verificationSource", e.target.value)}
                    placeholder="e.g., Bank statements, family attestation, project records"
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addCompetencyEvidence} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Competency Evidence
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Skills Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Skills Assessment
          </CardTitle>
          <CardDescription>
            Rate skills with supporting evidence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resumeData.skills.map((skill, index) => (
            <div key={index} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={skill.skill}
                  onChange={(e) => updateSkill(index, "skill", e.target.value)}
                  placeholder="Skill name"
                  className="flex-1"
                />
                <Select
                  value={skill.level}
                  onValueChange={(v) => updateSkill(index, "level", v)}
                >
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {skillLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => removeSkill(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Input
                value={skill.evidence}
                onChange={(e) => updateSkill(index, "evidence", e.target.value)}
                placeholder="Evidence supporting this skill level..."
                className="text-sm"
              />
            </div>
          ))}
          <Button variant="outline" onClick={addSkill} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Skill
          </Button>
        </CardContent>
      </Card>

      {/* Character References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Character References
          </CardTitle>
          <CardDescription>
            Attestations from those who can verify competency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resumeData.references.map((ref, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Reference #{index + 1}</Badge>
                <Button variant="ghost" size="sm" onClick={() => removeReference(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={ref.name}
                    onChange={(e) => updateReference(index, "name", e.target.value)}
                    placeholder="Reference name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input
                    value={ref.relationship}
                    onChange={(e) => updateReference(index, "relationship", e.target.value)}
                    placeholder="e.g., Family member, Colleague"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Years Known</Label>
                  <Input
                    type="number"
                    value={ref.yearsKnown}
                    onChange={(e) => updateReference(index, "yearsKnown", Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Attestation Statement</Label>
                <Textarea
                  value={ref.attestation}
                  onChange={(e) => updateReference(index, "attestation", e.target.value)}
                  placeholder="What can this person attest to regarding the candidate's competency?"
                  rows={2}
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addReference} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Reference
          </Button>
        </CardContent>
      </Card>

      {/* Development Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Professional Development Plan
          </CardTitle>
          <CardDescription>
            Outline plans for continued growth (demonstrates good governance)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={resumeData.developmentPlan}
            onChange={(e) => setResumeData({ ...resumeData, developmentPlan: e.target.value })}
            placeholder="Describe plans for continued learning, certifications to pursue, skills to develop..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button 
          variant="outline" 
          onClick={() => onSave?.(resumeData)} 
          className="gap-2"
          disabled={isSaving}
        >
          <FileText className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
        <Button 
          onClick={generateResumeDocument} 
          className="gap-2"
          disabled={isSaving}
        >
          <Download className="w-4 h-4" />
          {isSaving ? "Saving..." : "Generate Resume"}
        </Button>
      </div>
    </div>
  );
}
