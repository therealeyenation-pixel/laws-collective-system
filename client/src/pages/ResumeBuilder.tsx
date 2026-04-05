import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import CompetencyBasedResume from "@/components/CompetencyBasedResume";
import {
  FileText,
  Users,
  Award,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Trash2,
  Download,
  ExternalLink,
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
 * Now with database persistence for resumes
 */

// Family members with position assignments
const familyMembers = [
  { id: "craig", name: "Craig Freeman", position: "Financial Manager", entity: "98 Trust" },
  { id: "calea", name: "CALEA Freeman", position: "Executive Director", entity: "Temple of Alkebulan" },
  { id: "amber", name: "Amber S. Hunter", position: "Health Manager", entity: "The L.A.W.S. Collective" },
  { id: "calvin", name: "Calvin Freeman", position: "Technology Director", entity: "Real-Eye Technologies" },
  { id: "cameron", name: "Cameron Freeman", position: "Operations Coordinator", entity: "The L.A.W.S. Collective" },
  { id: "caleb", name: "Caleb Freeman", position: "Media Production Lead", entity: "Real-Eye Technologies" },
  { id: "chloe", name: "Chloe Freeman", position: "Academy Coordinator", entity: "Divine STEM Academy" },
];

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState("builder");
  const [selectedMember, setSelectedMember] = useState<string>("");

  // tRPC queries and mutations
  const resumesQuery = trpc.offerPackages.getAllResumes.useQuery();
  const statsQuery = trpc.offerPackages.getStats.useQuery();
  const utils = trpc.useUtils();

  const saveResumeMutation = trpc.offerPackages.saveResume.useMutation({
    onSuccess: (data) => {
      utils.offerPackages.getAllResumes.invalidate();
      utils.offerPackages.getStats.invalidate();
      toast.success(data.updated ? "Resume updated" : "Resume saved");
    },
    onError: (error) => {
      toast.error(`Failed to save resume: ${error.message}`);
    },
  });

  const deleteResumeMutation = trpc.offerPackages.deleteResume.useMutation({
    onSuccess: () => {
      utils.offerPackages.getAllResumes.invalidate();
      utils.offerPackages.getStats.invalidate();
      toast.success("Resume deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete resume: ${error.message}`);
    },
  });

  const selectedPerson = familyMembers.find(m => m.id === selectedMember);
  const savedResumes = resumesQuery.data || [];

  // Get existing resume for selected member
  const existingResume = selectedMember && selectedMember !== "new"
    ? savedResumes.find((r: any) => r.familyMemberId === selectedMember)
    : null;

  const handleSaveResume = (data: any) => {
    const familyMemberId = selectedMember && selectedMember !== "new" 
      ? selectedMember 
      : `custom_${Date.now()}`;
    
    saveResumeMutation.mutate({
      familyMemberId,
      fullName: data.fullName,
      title: data.title,
      email: data.email || "",
      phone: data.phone,
      location: data.location,
      summary: data.summary,
      qualificationType: data.qualificationType || "demonstrated",
      education: data.education,
      certifications: data.certifications,
      competencyEvidence: data.competencyEvidence,
      skills: data.skills,
      references: data.references,
      developmentPlan: data.developmentPlan,
      status: "draft",
    });
  };

  const handleGenerateResume = (data: any) => {
    const familyMemberId = selectedMember && selectedMember !== "new" 
      ? selectedMember 
      : `custom_${Date.now()}`;
    
    saveResumeMutation.mutate({
      familyMemberId,
      fullName: data.fullName,
      title: data.title,
      email: data.email || "",
      phone: data.phone,
      location: data.location,
      summary: data.summary,
      qualificationType: data.qualificationType || "demonstrated",
      education: data.education,
      certifications: data.certifications,
      competencyEvidence: data.competencyEvidence,
      skills: data.skills,
      references: data.references,
      developmentPlan: data.developmentPlan,
      status: "complete",
    });
  };

  const handleDeleteResume = (id: number) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      deleteResumeMutation.mutate({ id });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" /> {status === "approved" ? "Approved" : "Complete"}</Badge>;
      case "draft":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Draft</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const getQualificationBadge = (type: string) => {
    switch (type) {
      case "demonstrated":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Demonstrated</Badge>;
      case "traditional":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Traditional</Badge>;
      case "hybrid":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Hybrid</Badge>;
      default:
        return null;
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsQuery.data?.totalResumes || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Resumes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsQuery.data?.completeResumes || 0}</p>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsQuery.data?.demonstratedCompetency || 0}</p>
                  <p className="text-sm text-muted-foreground">Demonstrated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsQuery.data?.traditionalCredentials || 0}</p>
                  <p className="text-sm text-muted-foreground">Traditional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              candidateName={selectedPerson?.name || existingResume?.fullName || ""}
              positionTitle={selectedPerson?.position || existingResume?.title || ""}
              existingData={existingResume}
              onSave={handleSaveResume}
              onGenerate={handleGenerateResume}
              isSaving={saveResumeMutation.isPending}
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
                {resumesQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {familyMembers.map((member) => {
                      const resume = savedResumes.find((r: any) => r.familyMemberId === member.id);
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
                              <>
                                {getStatusBadge(resume.status)}
                                {getQualificationBadge(resume.qualificationType)}
                              </>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Resumes Tab */}
          <TabsContent value="saved" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Saved Resumes</CardTitle>
                <CardDescription>
                  View and manage all resumes stored in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resumesQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : savedResumes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No resumes saved yet</p>
                    <p className="text-sm">Create your first resume in the Build Resume tab</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedResumes.map((resume: any) => (
                      <div
                        key={resume.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {resume.fullName?.split(" ").map((n: string) => n[0]).join("") || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{resume.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {resume.title || "No title"} • Updated {new Date(resume.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(resume.status)}
                          {getQualificationBadge(resume.qualificationType)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const member = familyMembers.find(m => m.id === resume.familyMemberId);
                              setSelectedMember(member ? member.id : "new");
                              setActiveTab("builder");
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteResume(resume.id)}
                            disabled={deleteResumeMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
