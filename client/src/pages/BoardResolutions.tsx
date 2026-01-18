import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Gavel,
  DollarSign,
  Users,
  Building2,
  Landmark,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
} from "lucide-react";

/**
 * Board Resolutions Generator
 * 
 * Generates formal board resolutions for:
 * - Grant Authorization
 * - Contract Approval
 * - Officer Appointments
 * - Bank Authorization
 */

export default function BoardResolutions() {
  const [activeTab, setActiveTab] = useState("grant");
  const [generatedResolution, setGeneratedResolution] = useState<any>(null);

  // Common form state
  const [entityName, setEntityName] = useState("L.A.W.S. Collective, LLC");
  const [entityType, setEntityType] = useState("LLC");
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingLocation, setMeetingLocation] = useState("Virtual Meeting");
  const [boardMembers, setBoardMembers] = useState([
    { name: "", title: "Member", present: true },
  ]);

  // Grant Authorization state
  const [grantName, setGrantName] = useState("");
  const [grantorName, setGrantorName] = useState("");
  const [maxAmount, setMaxAmount] = useState(0);
  const [grantPurpose, setGrantPurpose] = useState("");
  const [authorizedSigners, setAuthorizedSigners] = useState([
    { name: "", title: "" },
  ]);

  // Bank Authorization state
  const [bankName, setBankName] = useState("");
  const [accountTypes, setAccountTypes] = useState(["Business Checking"]);
  const [signatureRequirements, setSignatureRequirements] = useState("Any one authorized signer");

  // Officer Appointment state
  const [appointments, setAppointments] = useState([
    { name: "", position: "", responsibilities: "" },
  ]);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  const generateGrantAuthMutation = trpc.boardResolutions.generateGrantAuthorization.useMutation({
    onSuccess: (data) => {
      setGeneratedResolution(data);
      toast.success("Grant authorization resolution generated");
    },
    onError: (error) => {
      toast.error(`Failed to generate: ${error.message}`);
    },
  });

  const generateBankAuthMutation = trpc.boardResolutions.generateBankAuthorization.useMutation({
    onSuccess: (data) => {
      setGeneratedResolution(data);
      toast.success("Bank authorization resolution generated");
    },
    onError: (error) => {
      toast.error(`Failed to generate: ${error.message}`);
    },
  });

  const generateOfficerAppointmentMutation = trpc.boardResolutions.generateOfficerAppointment.useMutation({
    onSuccess: (data) => {
      setGeneratedResolution(data);
      toast.success("Officer appointment resolution generated");
    },
    onError: (error) => {
      toast.error(`Failed to generate: ${error.message}`);
    },
  });

  const handleGenerateGrantAuth = () => {
    generateGrantAuthMutation.mutate({
      entityName,
      entityType,
      grantName,
      grantorName,
      maxAmount,
      purpose: grantPurpose,
      authorizedSigners: authorizedSigners.filter(s => s.name),
      meetingDate,
      meetingLocation,
      boardMembers: boardMembers.filter(m => m.name),
    });
  };

  const handleGenerateBankAuth = () => {
    generateBankAuthMutation.mutate({
      entityName,
      entityType,
      bankName,
      accountTypes,
      authorizedSigners: authorizedSigners.filter(s => s.name),
      signatureRequirements,
      meetingDate,
      meetingLocation,
      boardMembers: boardMembers.filter(m => m.name),
    });
  };

  const handleGenerateOfficerAppointment = () => {
    generateOfficerAppointmentMutation.mutate({
      entityName,
      entityType,
      appointments: appointments.filter(a => a.name && a.position),
      effectiveDate,
      meetingDate,
      meetingLocation,
      boardMembers: boardMembers.filter(m => m.name),
    });
  };

  const addBoardMember = () => {
    setBoardMembers([...boardMembers, { name: "", title: "Member", present: true }]);
  };

  const removeBoardMember = (index: number) => {
    setBoardMembers(boardMembers.filter((_, i) => i !== index));
  };

  const addAuthorizedSigner = () => {
    setAuthorizedSigners([...authorizedSigners, { name: "", title: "" }]);
  };

  const removeAuthorizedSigner = (index: number) => {
    setAuthorizedSigners(authorizedSigners.filter((_, i) => i !== index));
  };

  const addAppointment = () => {
    setAppointments([...appointments, { name: "", position: "", responsibilities: "" }]);
  };

  const removeAppointment = (index: number) => {
    setAppointments(appointments.filter((_, i) => i !== index));
  };

  const renderResolutionDocument = (resolution: any) => {
    if (!resolution) return null;

    return (
      <Card className="mt-6">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{resolution.documentTitle}</CardTitle>
              <CardDescription>{resolution.subtitle}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 max-w-3xl mx-auto">
          {/* Meeting Info */}
          <div className="text-sm text-muted-foreground border-b pb-4">
            <p><strong>Meeting Date:</strong> {resolution.meetingInfo.date}</p>
            <p><strong>Location:</strong> {resolution.meetingInfo.location}</p>
            <p><strong>Quorum:</strong> {resolution.meetingInfo.quorumMet ? "Present" : "Not Present"}</p>
            <p><strong>Members Present:</strong> {resolution.meetingInfo.membersPresent.join(", ")}</p>
          </div>

          {/* Recitals */}
          <div>
            <h4 className="font-semibold mb-3">RECITALS</h4>
            <div className="space-y-2 text-sm">
              {resolution.recitals.map((recital: string, i: number) => (
                <p key={i} className="pl-4">{recital}</p>
              ))}
            </div>
          </div>

          {/* Resolutions */}
          <div>
            <h4 className="font-semibold mb-3">NOW, THEREFORE, BE IT</h4>
            <div className="space-y-3 text-sm">
              {resolution.resolutions.map((res: string, i: number) => (
                <p key={i} className="pl-4 whitespace-pre-line">{res}</p>
              ))}
            </div>
          </div>

          {/* Certification */}
          <div className="border-t pt-6 mt-8">
            <h4 className="font-semibold mb-3">CERTIFICATION</h4>
            <p className="text-sm mb-6">{resolution.certification.text}</p>
            
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <div className="border-b border-foreground mb-2 h-8"></div>
                <p className="text-sm text-muted-foreground">Secretary Signature</p>
              </div>
              <div>
                <div className="border-b border-foreground mb-2 h-8"></div>
                <p className="text-sm text-muted-foreground">Date</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-4">
            Generated: {new Date(resolution.generatedAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Board Resolutions</h1>
          <p className="text-muted-foreground">
            Generate formal board resolutions for corporate actions
          </p>
        </div>

        {/* Common Entity Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Entity & Meeting Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Entity Name</Label>
                <Input
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="Company Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LLC">LLC</SelectItem>
                    <SelectItem value="Corporation">Corporation</SelectItem>
                    <SelectItem value="Nonprofit">Nonprofit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Meeting Date</Label>
                <Input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Meeting Location</Label>
                <Input
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="Virtual Meeting"
                />
              </div>
            </div>

            {/* Board Members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Board Members / Members Present</Label>
                <Button variant="outline" size="sm" onClick={addBoardMember} className="gap-1">
                  <Plus className="w-3 h-3" /> Add Member
                </Button>
              </div>
              <div className="space-y-2">
                {boardMembers.map((member, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => {
                        const updated = [...boardMembers];
                        updated[index].name = e.target.value;
                        setBoardMembers(updated);
                      }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Title"
                      value={member.title}
                      onChange={(e) => {
                        const updated = [...boardMembers];
                        updated[index].title = e.target.value;
                        setBoardMembers(updated);
                      }}
                      className="w-40"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBoardMember(index)}
                      disabled={boardMembers.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="grant" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Grant Authorization
            </TabsTrigger>
            <TabsTrigger value="bank" className="gap-2">
              <Landmark className="w-4 h-4" />
              Bank Authorization
            </TabsTrigger>
            <TabsTrigger value="officers" className="gap-2">
              <Users className="w-4 h-4" />
              Officer Appointments
            </TabsTrigger>
            <TabsTrigger value="contract" className="gap-2">
              <FileText className="w-4 h-4" />
              Contract Approval
            </TabsTrigger>
          </TabsList>

          {/* Grant Authorization */}
          <TabsContent value="grant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grant Application Authorization</CardTitle>
                <CardDescription>
                  Authorize the organization to apply for and accept grant funding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Grant Name</Label>
                    <Input
                      value={grantName}
                      onChange={(e) => setGrantName(e.target.value)}
                      placeholder="e.g., Community Development Block Grant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grantor Name</Label>
                    <Input
                      value={grantorName}
                      onChange={(e) => setGrantorName(e.target.value)}
                      placeholder="e.g., U.S. Department of Housing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Amount</Label>
                    <Input
                      type="number"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Grant Purpose</Label>
                  <Textarea
                    value={grantPurpose}
                    onChange={(e) => setGrantPurpose(e.target.value)}
                    placeholder="Describe how the grant funds will be used..."
                    rows={3}
                  />
                </div>

                {/* Authorized Signers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Authorized Signers</Label>
                    <Button variant="outline" size="sm" onClick={addAuthorizedSigner} className="gap-1">
                      <Plus className="w-3 h-3" /> Add Signer
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {authorizedSigners.map((signer, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          placeholder="Name"
                          value={signer.name}
                          onChange={(e) => {
                            const updated = [...authorizedSigners];
                            updated[index].name = e.target.value;
                            setAuthorizedSigners(updated);
                          }}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Title"
                          value={signer.title}
                          onChange={(e) => {
                            const updated = [...authorizedSigners];
                            updated[index].title = e.target.value;
                            setAuthorizedSigners(updated);
                          }}
                          className="w-40"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAuthorizedSigner(index)}
                          disabled={authorizedSigners.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateGrantAuth}
                  disabled={generateGrantAuthMutation.isPending}
                  className="gap-2"
                >
                  {generateGrantAuthMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Gavel className="w-4 h-4" />
                  )}
                  Generate Resolution
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Authorization */}
          <TabsContent value="bank" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bank Account Authorization</CardTitle>
                <CardDescription>
                  Authorize opening bank accounts and designate signers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., Chase Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Signature Requirements</Label>
                    <Select value={signatureRequirements} onValueChange={setSignatureRequirements}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any one authorized signer">Any one authorized signer</SelectItem>
                        <SelectItem value="Any two authorized signers">Any two authorized signers</SelectItem>
                        <SelectItem value="Two signers for amounts over $5,000">Two signers for amounts over $5,000</SelectItem>
                        <SelectItem value="Two signers for amounts over $10,000">Two signers for amounts over $10,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Business Checking", "Business Savings", "Money Market", "Certificate of Deposit"].map((type) => (
                      <Badge
                        key={type}
                        variant={accountTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (accountTypes.includes(type)) {
                            setAccountTypes(accountTypes.filter(t => t !== type));
                          } else {
                            setAccountTypes([...accountTypes, type]);
                          }
                        }}
                      >
                        {accountTypes.includes(type) && <CheckCircle className="w-3 h-3 mr-1" />}
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Authorized Signers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Authorized Signers</Label>
                    <Button variant="outline" size="sm" onClick={addAuthorizedSigner} className="gap-1">
                      <Plus className="w-3 h-3" /> Add Signer
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {authorizedSigners.map((signer, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          placeholder="Name"
                          value={signer.name}
                          onChange={(e) => {
                            const updated = [...authorizedSigners];
                            updated[index].name = e.target.value;
                            setAuthorizedSigners(updated);
                          }}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Title"
                          value={signer.title}
                          onChange={(e) => {
                            const updated = [...authorizedSigners];
                            updated[index].title = e.target.value;
                            setAuthorizedSigners(updated);
                          }}
                          className="w-40"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAuthorizedSigner(index)}
                          disabled={authorizedSigners.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateBankAuth}
                  disabled={generateBankAuthMutation.isPending}
                  className="gap-2"
                >
                  {generateBankAuthMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Gavel className="w-4 h-4" />
                  )}
                  Generate Resolution
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Officer Appointments */}
          <TabsContent value="officers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Officer Appointments</CardTitle>
                <CardDescription>
                  Appoint officers to serve the organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-48"
                  />
                </div>

                {/* Appointments */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Officer Appointments</Label>
                    <Button variant="outline" size="sm" onClick={addAppointment} className="gap-1">
                      <Plus className="w-3 h-3" /> Add Officer
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {appointments.map((appointment, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            placeholder="Name"
                            value={appointment.name}
                            onChange={(e) => {
                              const updated = [...appointments];
                              updated[index].name = e.target.value;
                              setAppointments(updated);
                            }}
                          />
                          <Select
                            value={appointment.position}
                            onValueChange={(value) => {
                              const updated = [...appointments];
                              updated[index].position = value;
                              setAppointments(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Position" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="President">President</SelectItem>
                              <SelectItem value="Vice President">Vice President</SelectItem>
                              <SelectItem value="Secretary">Secretary</SelectItem>
                              <SelectItem value="Treasurer">Treasurer</SelectItem>
                              <SelectItem value="Chief Executive Officer">CEO</SelectItem>
                              <SelectItem value="Chief Operating Officer">COO</SelectItem>
                              <SelectItem value="Chief Financial Officer">CFO</SelectItem>
                              <SelectItem value="Managing Member">Managing Member</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Responsibilities (optional)"
                            value={appointment.responsibilities}
                            onChange={(e) => {
                              const updated = [...appointments];
                              updated[index].responsibilities = e.target.value;
                              setAppointments(updated);
                            }}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAppointment(index)}
                          disabled={appointments.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateOfficerAppointment}
                  disabled={generateOfficerAppointmentMutation.isPending}
                  className="gap-2"
                >
                  {generateOfficerAppointmentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Gavel className="w-4 h-4" />
                  )}
                  Generate Resolution
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contract Approval */}
          <TabsContent value="contract" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contract Approval</CardTitle>
                <CardDescription>
                  Approve entering into specific contracts or agreements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Contract approval resolution generator coming soon. Use the Grant Authorization 
                  template as a starting point for now.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Generated Resolution Display */}
        {generatedResolution && renderResolutionDocument(generatedResolution)}
      </div>
    </DashboardLayout>
  );
}
