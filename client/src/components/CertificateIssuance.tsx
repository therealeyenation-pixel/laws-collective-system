import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Award,
  FileText,
  Send,
  CheckCircle,
  Clock,
  User,
  Building,
  GraduationCap,
  Shield,
  Sparkles,
  Download,
  Eye,
  History,
  Settings,
} from "lucide-react";

interface CertificateTemplate {
  id: string;
  name: string;
  type: "completion" | "achievement" | "membership" | "license" | "award";
  description: string;
  fields: string[];
  icon: React.ReactNode;
}

interface IssuedCertificate {
  id: string;
  templateId: string;
  recipientName: string;
  recipientEmail: string;
  issuedAt: Date;
  status: "pending" | "issued" | "revoked";
  certificateNumber: string;
}

const certificateTemplates: CertificateTemplate[] = [
  {
    id: "course-completion",
    name: "Course Completion",
    type: "completion",
    description: "Issued upon completing a L.A.W.S. Academy course",
    fields: ["courseName", "completionDate", "grade"],
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    id: "business-license",
    name: "Business License",
    type: "license",
    description: "Official business license for L.A.W.S. entities",
    fields: ["businessName", "licenseType", "validUntil"],
    icon: <Building className="w-5 h-5" />,
  },
  {
    id: "house-membership",
    name: "House Membership",
    type: "membership",
    description: "Certificate of membership in a L.A.W.S. House",
    fields: ["houseName", "membershipLevel", "joinDate"],
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: "achievement-award",
    name: "Achievement Award",
    type: "award",
    description: "Recognition for special achievements",
    fields: ["achievementName", "category", "awardDate"],
    icon: <Award className="w-5 h-5" />,
  },
  {
    id: "token-certification",
    name: "Token Certification",
    type: "achievement",
    description: "Certification for token milestones (MIRROR, GIFT, SPARK, etc.)",
    fields: ["tokenType", "milestone", "earnedDate"],
    icon: <Sparkles className="w-5 h-5" />,
  },
];

const mockIssuedCertificates: IssuedCertificate[] = [
  {
    id: "cert-001",
    templateId: "course-completion",
    recipientName: "John Smith",
    recipientEmail: "john@example.com",
    issuedAt: new Date("2025-01-15"),
    status: "issued",
    certificateNumber: "LAWS-CC-2025-001",
  },
  {
    id: "cert-002",
    templateId: "house-membership",
    recipientName: "Sarah Johnson",
    recipientEmail: "sarah@example.com",
    issuedAt: new Date("2025-01-20"),
    status: "issued",
    certificateNumber: "LAWS-HM-2025-002",
  },
  {
    id: "cert-003",
    templateId: "achievement-award",
    recipientName: "Michael Brown",
    recipientEmail: "michael@example.com",
    issuedAt: new Date("2025-01-22"),
    status: "pending",
    certificateNumber: "LAWS-AA-2025-003",
  },
];

export function CertificateIssuance() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [issuedCertificates] = useState<IssuedCertificate[]>(mockIssuedCertificates);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCustomFields({});
  };

  const handleFieldChange = (field: string, value: string) => {
    setCustomFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleIssueCertificate = () => {
    if (!selectedTemplate || !recipientName || !recipientEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    const template = certificateTemplates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    // Check if all custom fields are filled
    const missingFields = template.fields.filter((f) => !customFields[f]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    toast.success(`Certificate issued to ${recipientName}`);
    
    // Reset form
    setSelectedTemplate("");
    setRecipientName("");
    setRecipientEmail("");
    setCustomFields({});
  };

  const getStatusBadge = (status: IssuedCertificate["status"]) => {
    switch (status) {
      case "issued":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Issued</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "revoked":
        return <Badge className="bg-red-100 text-red-800">Revoked</Badge>;
    }
  };

  const selectedTemplateData = certificateTemplates.find((t) => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Certificate Issuance</h2>
          <p className="text-muted-foreground">Issue and manage official L.A.W.S. certificates</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      <Tabs defaultValue="issue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="issue" className="gap-2">
            <FileText className="w-4 h-4" />
            Issue Certificate
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            Issued Certificates
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Award className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issue" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Template</CardTitle>
                <CardDescription>Choose a certificate template to issue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {certificateTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleTemplateChange(template.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedTemplate === template.id ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <Badge variant="outline" className="mt-2 capitalize">{template.type}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certificate Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Certificate Details</CardTitle>
                <CardDescription>
                  {selectedTemplateData
                    ? `Issuing: ${selectedTemplateData.name}`
                    : "Select a template to continue"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="recipientName"
                      placeholder="Enter recipient's full name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="recipient@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>

                {selectedTemplateData && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3">Template Fields</h4>
                      {selectedTemplateData.fields.map((field) => (
                        <div key={field} className="space-y-2 mb-3">
                          <Label htmlFor={field} className="capitalize">
                            {field.replace(/([A-Z])/g, " $1").trim()} *
                          </Label>
                          <Input
                            id={field}
                            placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim().toLowerCase()}`}
                            value={customFields[field] || ""}
                            onChange={(e) => handleFieldChange(field, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional information to include..."
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <Button
                  className="w-full gap-2"
                  onClick={handleIssueCertificate}
                  disabled={!selectedTemplate}
                >
                  <Send className="w-4 h-4" />
                  Issue Certificate
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issued Certificates</CardTitle>
              <CardDescription>View and manage all issued certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issuedCertificates.map((cert) => {
                  const template = certificateTemplates.find((t) => t.id === cert.templateId);
                  return (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {template?.icon || <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{cert.recipientName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {template?.name} • {cert.certificateNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Issued: {cert.issuedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(cert.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificateTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {template.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="capitalize">{template.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Required Fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.fields.map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs capitalize">
                          {field.replace(/([A-Z])/g, " $1").trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CertificateIssuance;
