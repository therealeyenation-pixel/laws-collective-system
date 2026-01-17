import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Users, UserPlus, Building2, Briefcase, CheckCircle2, Clock, Heart, GraduationCap, Shield } from "lucide-react";

const FAMILY_MEMBERS = [
  { id: "shanna", name: "Shanna Russell", role: "Founder / Matriarch", departments: ["Business", "Outreach"], businessEntity: "Purpose Proposal Group", status: "active", credentials: ["Business Degree", "Government Contracting Experience", "ULC Ordination"], boardRole: "Founder + Business Director" },
  { id: "craig", name: "Craig", role: "House Member", departments: ["Finance", "Outreach"], businessEntity: "TBD", status: "pending", credentials: [], boardRole: "Board Member" },
  { id: "amber", name: "Amber", role: "House Member", departments: ["Health", "Outreach"], businessEntity: "TBD", status: "pending", credentials: [], boardRole: "Board Member" },
  { id: "essence", name: "Essence", role: "House Member", departments: ["Design", "IT", "Outreach"], businessEntity: "TBD", status: "pending", credentials: [], boardRole: "Board Member" },
  { id: "amandes", name: "Amandes", role: "House Member", departments: ["Media", "IT", "Outreach"], businessEntity: "FreeLife Media", status: "active", credentials: [], boardRole: "Board Member" },
  { id: "cornelius", name: "Cornelius", role: "Education/Training Manager", departments: ["Education", "Training", "Legal", "Justice", "Outreach"], businessEntity: "TBD", status: "pending", credentials: ["Masters in Education", "Masters in Criminal Justice"], boardRole: "Board Member (Education/Training & Legal/Justice)", supportsLegal: true },
  { id: "contracts-mgr", name: "TBD - Contracts Manager", role: "Department Manager", departments: ["Contracts", "Outreach"], businessEntity: "TBD", status: "open", credentials: [], boardRole: "Board Member (Contracts)" },
  { id: "grants-mgr", name: "TBD - Grants Manager", role: "Department Manager", departments: ["Grants", "Outreach"], businessEntity: "TBD", status: "open", credentials: [], boardRole: "Board Member (Grants)" },
  { id: "legal-mgr", name: "TBD - Legal Manager", role: "Department Manager", departments: ["Legal", "Justice", "Outreach"], businessEntity: "TBD", status: "open", credentials: [], boardRole: "Board Member (Legal/Justice)", justiceAdvisor: "Cornelius" },
  { id: "property-mgr", name: "TBD - Property & Assets Manager", role: "Department Manager", departments: ["Property & Assets Management", "Outreach"], businessEntity: "TBD", status: "lined_up", credentials: [], boardRole: "Board Member" },
  { id: "realestate-mgr", name: "TBD - Real Estate Manager", role: "Department Manager", departments: ["Real Estate", "Outreach"], businessEntity: "TBD", status: "lined_up", credentials: [], boardRole: "Board Member" },
  { id: "ops-admin-mgr", name: "TBD - Operations & Administration Manager", role: "Department Manager", departments: ["Operations & Administration", "Outreach"], businessEntity: "TBD", status: "lined_up", credentials: [], boardRole: "Board Member" },
  { id: "qaqc-mgr", name: "TBD - QA/QC Manager", role: "Department Manager", departments: ["QA/QC", "Outreach"], businessEntity: "TBD", status: "open", credentials: [], boardRole: "Board Member (QA/QC)" },
  // Strategic Partners
  { id: "sweet-miracles", name: "Twin Sister (Sweet Miracles)", role: "Strategic Partner", departments: ["Outreach", "Justice"], businessEntity: "Sweet Miracles", status: "active", credentials: ["Nonprofit", "Elder Abuse Prevention"], boardRole: "Honorary Advisory Member (Non-Voting)" },
];

const DEPARTMENTS = [
  { id: "business", name: "Business", description: "Strategic direction, business development, entity management" },
  { id: "contracts", name: "Contracts", description: "Contract management, negotiations, compliance" },
  { id: "grants", name: "Grants", description: "Grant writing, applications, funding management" },
  { id: "property-assets", name: "Property & Assets Management", description: "Property management, asset tracking, inventory" },
  { id: "real-estate", name: "Real Estate", description: "Real estate transactions, property acquisition, land management" },
  { id: "ops-admin", name: "Operations & Administration", description: "Operations, systems administration, simulator management" },
  { id: "outreach", name: "Outreach", description: "Community engagement, external relations, partnerships" },
  { id: "qaqc", name: "QA/QC", description: "Quality assurance, quality control, standards compliance" },
  { id: "health", name: "Health", description: "Wellness programs, healthcare coordination" },
  { id: "design", name: "Design", description: "Visual design, branding, creative services" },
  { id: "it", name: "IT", description: "Technology, systems, infrastructure, support" },
  { id: "media", name: "Media", description: "Content creation, social media, communications" },
  { id: "finance", name: "Finance", description: "Accounting, budgeting, financial management" },
  { id: "legal", name: "Legal/Justice", description: "Legal affairs, compliance, contracts review, advocacy, reentry support, mentorship programs" },
  { id: "education", name: "Education/Training", description: "Training simulators, Academy curriculum, educational content, certificate management" },
];

const ONBOARDING_STEPS = [
  { id: 1, name: "Personal Information", description: "Basic contact and identity details" },
  { id: 2, name: "Department Assignment", description: "Primary and secondary department roles" },
  { id: 3, name: "Business Entity Link", description: "Connect to business entity or create new" },
  { id: 4, name: "Credentials & Training", description: "Upload certifications, complete training" },
  { id: 5, name: "System Access", description: "Account creation and permissions" },
  { id: 6, name: "Organization Agreement", description: "Review and sign membership agreement" },
];

export default function FamilyOnboarding() {
  const [activeTab, setActiveTab] = useState("members");
  const [showOnboardDialog, setShowOnboardDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof FAMILY_MEMBERS[0] | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [newMemberData, setNewMemberData] = useState({ name: "", email: "", phone: "", relationship: "", primaryDepartment: "" });

  const handleStartOnboarding = (member: typeof FAMILY_MEMBERS[0]) => {
    setSelectedMember(member);
    setOnboardingStep(1);
    setShowOnboardDialog(true);
  };

  const handleNextStep = () => {
    if (onboardingStep < ONBOARDING_STEPS.length) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      toast.success(selectedMember?.name + " onboarding complete!");
      setShowOnboardDialog(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case "pending": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
      case "open": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Open Position</Badge>;
      case "lined_up": return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Lined Up</Badge>;
      case "partner": return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">Strategic Partner</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeMembers = FAMILY_MEMBERS.filter(m => m.status === "active");
  const pendingMembers = FAMILY_MEMBERS.filter(m => m.status === "pending");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Family Onboarding</h1>
            <p className="text-muted-foreground">Manage family member roles, departments, and business assignments</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2"><UserPlus className="w-4 h-4" />Add Family Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
                <DialogDescription>Add a new family member to the house</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={newMemberData.name} onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })} placeholder="Enter full name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={newMemberData.email} onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })} placeholder="email@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" value={newMemberData.phone} onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })} placeholder="(555) 555-5555" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Select value={newMemberData.relationship} onValueChange={(v) => setNewMemberData({ ...newMemberData, relationship: v })}>
                    <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="extended">Extended Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Department</Label>
                  <Select value={newMemberData.primaryDepartment} onValueChange={(v) => setNewMemberData({ ...newMemberData, primaryDepartment: v })}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button onClick={() => toast.success("Family member added")}>Add Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><Users className="w-6 h-6 text-primary" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{FAMILY_MEMBERS.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{activeMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10"><Clock className="w-6 h-6 text-amber-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10"><Building2 className="w-6 h-6 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Departments</p>
                  <p className="text-2xl font-bold">{DEPARTMENTS.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="members">Family Members</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="entities">Business Entities</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {FAMILY_MEMBERS.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{member.name}</h3>
                            {member.role === "Founder / Matriarch" && (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                <Heart className="w-3 h-3 mr-1" />Founder
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {member.departments.map((dept, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{dept}</Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            <span>{member.businessEntity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(member.status)}
                        {member.status === "pending" && (
                          <Button size="sm" onClick={() => handleStartOnboarding(member)}>
                            Start Onboarding
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4 mt-4">
            <Card className="mb-4 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm"><strong>Note:</strong> All departments support <Badge variant="outline">Outreach</Badge> as the community-facing arm of the organization.</p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEPARTMENTS.map((dept) => {
                const assignedMembers = FAMILY_MEMBERS.filter(m => 
                  m.departments.some(d => d.toLowerCase() === dept.name.toLowerCase())
                );
                return (
                  <Card key={dept.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                      <CardDescription>{dept.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Assigned:</p>
                        {assignedMembers.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {assignedMembers.map(m => (
                              <Badge key={m.id} variant="secondary">{m.name}</Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No members assigned</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="entities" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Family Business Entities</CardTitle>
                <CardDescription>Business entities assigned to family members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Calea Freeman Family Trust", member: "Trust - Owner Only", focus: "Holding Entity, Asset Protection", status: "active" },
                    { name: "Real-Eye-Nation LLC", member: "Shanna Russell", focus: "Operations, Business", status: "active" },
                    { name: "Purpose Proposal Group", member: "Shanna Russell", focus: "Contracts, Grants, Business", status: "active" },
                    { name: "FreeLife Media", member: "Amandes", focus: "Media, IT, Outreach", status: "active" },
                    { name: "TBD - Health Entity", member: "Amber", focus: "Health, Outreach", status: "pending" },
                    { name: "TBD - Design/IT Entity", member: "Essence", focus: "Design, IT, Outreach", status: "pending" },
                    { name: "TBD - Finance Entity", member: "Craig", focus: "Finance, Outreach", status: "pending" },
                    { name: "TBD - Education/Training Entity", member: "Cornelius", focus: "Education, Training, Outreach (supports Legal/Justice)", status: "pending" },
                  ].map((entity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{entity.name}</h4>
                          <p className="text-sm text-muted-foreground">{entity.member} - {entity.focus}</p>
                        </div>
                      </div>
                      <Badge variant={entity.status === "active" ? "default" : "outline"}>
                        {entity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credentials" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Credentials & Certifications</CardTitle>
                <CardDescription>Track family member qualifications and training</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Universal Life Church Ordination</h4>
                        <p className="text-sm text-muted-foreground">La Shanna Keeyon Russell - Good Standing</p>
                        <p className="text-xs text-muted-foreground mt-1">Verified: February 24, 2025 | No Expiration</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Universal Life Church Ordination</h4>
                        <p className="text-sm text-muted-foreground">Luv On Purpose (Organization) - Good Standing</p>
                        <p className="text-xs text-muted-foreground mt-1">Verified: February 18, 2025 | No Expiration</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Business Degree</h4>
                        <p className="text-sm text-muted-foreground">Shanna Russell</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Government Contracting Experience</h4>
                        <p className="text-sm text-muted-foreground">Shanna Russell</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showOnboardDialog} onOpenChange={setShowOnboardDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Onboarding: {selectedMember?.name}</DialogTitle>
              <DialogDescription>
                Step {onboardingStep} of {ONBOARDING_STEPS.length}: {ONBOARDING_STEPS[onboardingStep - 1]?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Progress value={(onboardingStep / ONBOARDING_STEPS.length) * 100} className="mb-6" />
              
              <div className="space-y-4">
                {onboardingStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input defaultValue={selectedMember?.name} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="email@example.com" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input type="tel" placeholder="(555) 555-5555" />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input placeholder="Street address" />
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Departments</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember?.departments.map((dept, idx) => (
                          <Badge key={idx} variant="secondary">{dept}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Additional Departments</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {DEPARTMENTS.map(dept => (
                          <div key={dept.id} className="flex items-center gap-2">
                            <Checkbox id={dept.id} />
                            <label htmlFor={dept.id} className="text-sm">{dept.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Business Entity</Label>
                      <p className="text-sm text-muted-foreground">Current: {selectedMember?.businessEntity}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Action</Label>
                      <Select defaultValue="existing">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="existing">Link to Existing Entity</SelectItem>
                          <SelectItem value="new">Create New Entity</SelectItem>
                          <SelectItem value="later">Assign Later</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {onboardingStep === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Upload Credentials</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <p className="text-sm text-muted-foreground">Drag and drop files or click to upload</p>
                        <Button variant="outline" className="mt-4">Select Files</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Required Training</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox id="training1" />
                          <label htmlFor="training1" className="text-sm">Membership Agreement Review</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="training2" />
                          <label htmlFor="training2" className="text-sm">Financial Systems Overview</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="training3" />
                          <label htmlFor="training3" className="text-sm">Department Orientation</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === 5 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>System Access Level</Label>
                      <Select defaultValue="member">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                          <SelectItem value="member">Member (Standard Access)</SelectItem>
                          <SelectItem value="manager">Manager (Department Admin)</SelectItem>
                          <SelectItem value="admin">Admin (Full Access)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox id="perm1" defaultChecked />
                          <label htmlFor="perm1" className="text-sm">View Dashboard</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="perm2" defaultChecked />
                          <label htmlFor="perm2" className="text-sm">Access Documents</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="perm3" />
                          <label htmlFor="perm3" className="text-sm">Manage Finances</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="perm4" />
                          <label htmlFor="perm4" className="text-sm">Admin Settings</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === 6 && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-primary/5">
                      <h4 className="font-semibold mb-2">Membership Agreement</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        By completing this onboarding, {selectedMember?.name} agrees to uphold the values and 
                        responsibilities of the House, including maintaining confidentiality, contributing to 
                        assigned departments, and supporting the collective mission.
                      </p>
                      <div className="flex items-center gap-2">
                        <Checkbox id="covenant" />
                        <label htmlFor="covenant" className="text-sm">I have read and agree to the Membership Agreement</label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOnboardDialog(false)}>Cancel</Button>
              {onboardingStep > 1 && (
                <Button variant="outline" onClick={() => setOnboardingStep(onboardingStep - 1)}>Previous</Button>
              )}
              <Button onClick={handleNextStep}>
                {onboardingStep === ONBOARDING_STEPS.length ? "Complete Onboarding" : "Next Step"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
