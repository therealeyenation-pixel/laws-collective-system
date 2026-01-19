import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import CompetencyBasedResume from "@/components/CompetencyBasedResume";
import {
  FileText,
  Users,
  Award,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

/**
 * Resume Builder - HR Management
 * 
 * Build professional resumes for family members with support for:
 * - Traditional credentials (degrees, certifications)
 * - Demonstrated competency (equally credible pathway)
 * - Hybrid qualifications
 * 
 * Integrates with position assignments and contingency offers
 */

// Family members with position assignments
const familyMembers = [
  { id: "craig", name: "Craig Freeman", position: "Financial Manager", entity: "98 Trust", hasResume: false },
  { id: "calea", name: "CALEA Freeman", position: "Executive Director", entity: "Temple of Alkebulan", hasResume: false },
  { id: "amber", name: "Amber S. Hunter", position: "Health Manager", entity: "L.A.W.S. Collective", hasResume: false },
  { id: "calvin", name: "Calvin Freeman", position: "Technology Director", entity: "Real-Eye Technologies", hasResume: false },
  { id: "cameron", name: "Cameron Freeman", position: "Operations Coordinator", entity: "L.A.W.S. Collective", hasResume: false },
  { id: "caleb", name: "Caleb Freeman", position: "Media Production Lead", entity: "Real-Eye Technologies", hasResume: false },
  { id: "chloe", name: "Chloe Freeman", position: "Academy Coordinator", entity: "Divine STEM Academy", hasResume: false },
];

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState("builder");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [savedResumes, setSavedResumes] = useState<any[]>([]);

  const selectedPerson = familyMembers.find(m => m.id === selectedMember);

  const handleSaveResume = (data: any) => {
    const existing = savedResumes.findIndex(r => r.fullName === data.fullName);
    if (existing >= 0) {
      const updated = [...savedResumes];
      updated[existing] = { ...data, savedAt: new Date().toISOString(), status: "draft" };
      setSavedResumes(updated);
    } else {
      setSavedResumes([...savedResumes, { ...data, savedAt: new Date().toISOString(), status: "draft" }]);
    }
  };

  const handleGenerateResume = (data: any) => {
    const existing = savedResumes.findIndex(r => r.fullName === data.fullName);
    if (existing >= 0) {
      const updated = [...savedResumes];
      updated[existing] = { ...data, savedAt: new Date().toISOString(), status: "complete" };
      setSavedResumes(updated);
    } else {
      setSavedResumes([...savedResumes, { ...data, savedAt: new Date().toISOString(), status: "complete" }]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Complete</Badge>;
      case "draft":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Draft</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resume Builder</h1>
          <p className="text-muted-foreground mt-1">
            Build professional resumes with traditional credentials or demonstrated competency
          </p>
        </div>

        {/* Info Banner */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Demonstrated Competency = Equally Credible Qualification
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  This system recognizes proven capability as an equally valid qualification pathway. 
                  Family members can document their demonstrated competency with measurable outcomes 
                  instead of traditional degrees or certifications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder" className="gap-2">
              <FileText className="w-4 h-4" />
              Build Resume
            </TabsTrigger>
            <TabsTrigger value="family" className="gap-2">
              <Users className="w-4 h-4" />
              Family Members
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Saved Resumes ({savedResumes.length})
            </TabsTrigger>
          </TabsList>

          {/* Resume Builder Tab */}
          <TabsContent value="builder" className="space-y-4 mt-6">
            {/* Family Member Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Family Member</CardTitle>
                <CardDescription>
                  Choose a family member to pre-populate their position information, or start fresh
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Family Member (Optional)</Label>
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select family member or start fresh" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Start Fresh (New Person)</SelectItem>
                        {familyMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedPerson && (
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Entity:</strong> {selectedPerson.entity}</p>
                      <p><strong>Position:</strong> {selectedPerson.position}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resume Builder Component */}
            <CompetencyBasedResume
              candidateName={selectedPerson?.name || ""}
              positionTitle={selectedPerson?.position || ""}
              onSave={handleSaveResume}
              onGenerate={handleGenerateResume}
            />
          </TabsContent>

          {/* Family Members Tab */}
          <TabsContent value="family" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Family Member Resume Status</CardTitle>
                <CardDescription>
                  Track resume completion for all assigned family members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {familyMembers.map((member) => {
                    const resume = savedResumes.find(r => r.fullName === member.name);
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.position} • {member.entity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {resume ? (
                            getStatusBadge(resume.status)
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              No Resume
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMember(member.id);
                              setActiveTab("builder");
                            }}
                          >
                            {resume ? "Edit" : "Create"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {savedResumes.filter(r => r.status === "complete").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Complete Resumes</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-600">
                      {savedResumes.filter(r => r.status === "draft").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Drafts</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {familyMembers.length - savedResumes.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Saved Resumes Tab */}
          <TabsContent value="saved" className="space-y-4 mt-6">
            {savedResumes.length > 0 ? (
              <div className="space-y-3">
                {savedResumes.map((resume, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{resume.fullName}</p>
                            <p className="text-sm text-muted-foreground">{resume.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Qualification: {resume.qualificationType === "demonstrated" ? "Demonstrated Competency" : 
                                resume.qualificationType === "traditional" ? "Traditional Credentials" : "Hybrid"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(resume.status)}
                          <div className="text-right text-xs text-muted-foreground">
                            <p>Last saved</p>
                            <p>{new Date(resume.savedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Resume Summary */}
                      <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Competency Evidence</p>
                          <p className="font-medium">{resume.competencyEvidence?.length || 0} items</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Skills</p>
                          <p className="font-medium">{resume.skills?.length || 0} listed</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">References</p>
                          <p className="font-medium">{resume.references?.length || 0} provided</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Development Plan</p>
                          <p className="font-medium">{resume.developmentPlan ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No saved resumes yet</p>
                    <p className="text-sm">Create a resume using the Build Resume tab</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setActiveTab("builder")}
                    >
                      Build First Resume
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
