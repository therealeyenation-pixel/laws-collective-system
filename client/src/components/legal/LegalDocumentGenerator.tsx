import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Eye,
  Send,
  CheckCircle,
  Clock,
  Building,
  Users,
  Shield,
  Scale,
  Home,
  DollarSign,
  Heart,
  Briefcase,
  Search,
  Filter,
  Plus,
  History,
  Star,
} from "lucide-react";

interface DocumentTemplate {
  id: string;
  name: string;
  category: "business" | "trust" | "estate" | "contract" | "real-estate" | "family";
  description: string;
  fields: string[];
  icon: React.ReactNode;
  popular: boolean;
}

interface GeneratedDocument {
  id: string;
  templateId: string;
  name: string;
  createdAt: Date;
  status: "draft" | "pending-signature" | "signed" | "executed";
}

const documentTemplates: DocumentTemplate[] = [
  // Business Documents
  {
    id: "articles-incorporation",
    name: "Articles of Incorporation",
    category: "business",
    description: "Official document to form a corporation with the state",
    fields: ["corporationName", "registeredAgent", "incorporators", "shares"],
    icon: <Building className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "llc-operating-agreement",
    name: "LLC Operating Agreement",
    category: "business",
    description: "Defines ownership and operating procedures for an LLC",
    fields: ["llcName", "members", "capitalContributions", "profitDistribution"],
    icon: <Briefcase className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "bylaws",
    name: "Corporate Bylaws",
    category: "business",
    description: "Rules governing the internal management of a corporation",
    fields: ["corporationName", "boardSize", "meetingSchedule", "officers"],
    icon: <Scale className="w-5 h-5" />,
    popular: false,
  },
  {
    id: "shareholder-agreement",
    name: "Shareholder Agreement",
    category: "business",
    description: "Agreement between shareholders on company governance",
    fields: ["shareholders", "votingRights", "transferRestrictions", "buyoutTerms"],
    icon: <Users className="w-5 h-5" />,
    popular: false,
  },
  // Trust Documents
  {
    id: "revocable-trust",
    name: "Revocable Living Trust",
    category: "trust",
    description: "Flexible trust that can be modified during grantor's lifetime",
    fields: ["grantorName", "trusteeName", "beneficiaries", "assets"],
    icon: <Shield className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "irrevocable-trust",
    name: "Irrevocable Trust",
    category: "trust",
    description: "Permanent trust for asset protection and tax planning",
    fields: ["grantorName", "trusteeName", "beneficiaries", "trustPurpose"],
    icon: <Shield className="w-5 h-5" />,
    popular: false,
  },
  {
    id: "family-trust",
    name: "Family Trust",
    category: "trust",
    description: "Trust for managing family assets across generations",
    fields: ["familyName", "trustees", "beneficiaries", "distributionRules"],
    icon: <Heart className="w-5 h-5" />,
    popular: true,
  },
  // Estate Documents
  {
    id: "last-will",
    name: "Last Will and Testament",
    category: "estate",
    description: "Legal document specifying asset distribution after death",
    fields: ["testatorName", "executor", "beneficiaries", "bequests"],
    icon: <FileText className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "power-of-attorney",
    name: "Power of Attorney",
    category: "estate",
    description: "Authorizes someone to act on your behalf",
    fields: ["principalName", "agentName", "powers", "effectiveDate"],
    icon: <Scale className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "healthcare-directive",
    name: "Healthcare Directive",
    category: "estate",
    description: "Specifies medical treatment preferences",
    fields: ["patientName", "healthcareAgent", "treatmentPreferences"],
    icon: <Heart className="w-5 h-5" />,
    popular: false,
  },
  // Contract Documents
  {
    id: "service-agreement",
    name: "Service Agreement",
    category: "contract",
    description: "Contract for providing professional services",
    fields: ["providerName", "clientName", "services", "compensation", "term"],
    icon: <Briefcase className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    category: "contract",
    description: "Protects confidential information between parties",
    fields: ["disclosingParty", "receivingParty", "confidentialInfo", "term"],
    icon: <Shield className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "independent-contractor",
    name: "Independent Contractor Agreement",
    category: "contract",
    description: "Agreement for hiring independent contractors",
    fields: ["companyName", "contractorName", "services", "payment", "term"],
    icon: <Users className="w-5 h-5" />,
    popular: false,
  },
  // Real Estate Documents
  {
    id: "lease-agreement",
    name: "Residential Lease Agreement",
    category: "real-estate",
    description: "Rental agreement between landlord and tenant",
    fields: ["landlordName", "tenantName", "propertyAddress", "rent", "term"],
    icon: <Home className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "purchase-agreement",
    name: "Real Estate Purchase Agreement",
    category: "real-estate",
    description: "Contract for buying or selling real property",
    fields: ["sellerName", "buyerName", "propertyAddress", "purchasePrice"],
    icon: <DollarSign className="w-5 h-5" />,
    popular: false,
  },
  // Family Documents
  {
    id: "prenuptial-agreement",
    name: "Prenuptial Agreement",
    category: "family",
    description: "Agreement between future spouses regarding assets",
    fields: ["party1Name", "party2Name", "assets", "debts"],
    icon: <Heart className="w-5 h-5" />,
    popular: false,
  },
];

const mockGeneratedDocuments: GeneratedDocument[] = [
  {
    id: "doc-001",
    templateId: "llc-operating-agreement",
    name: "The L.A.W.S. Collective LLC Operating Agreement",
    createdAt: new Date("2025-01-15"),
    status: "executed",
  },
  {
    id: "doc-002",
    templateId: "revocable-trust",
    name: "CALEA Family Trust",
    createdAt: new Date("2025-01-18"),
    status: "signed",
  },
  {
    id: "doc-003",
    templateId: "service-agreement",
    name: "Consulting Services Agreement",
    createdAt: new Date("2025-01-22"),
    status: "pending-signature",
  },
  {
    id: "doc-004",
    templateId: "nda",
    name: "Confidentiality Agreement - Project Alpha",
    createdAt: new Date("2025-01-24"),
    status: "draft",
  },
];

export function LegalDocumentGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formData, setFormData] = useState<Record<string, string>>({});

  const filteredTemplates = documentTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateDocument = () => {
    if (!selectedTemplate) return;
    
    const missingFields = selectedTemplate.fields.filter((f) => !formData[f]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    toast.success(`Document generated: ${selectedTemplate.name}`);
    setSelectedTemplate(null);
    setFormData({});
  };

  const getStatusBadge = (status: GeneratedDocument["status"]) => {
    switch (status) {
      case "executed":
        return <Badge className="bg-green-100 text-green-800">Executed</Badge>;
      case "signed":
        return <Badge className="bg-blue-100 text-blue-800">Signed</Badge>;
      case "pending-signature":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Signature</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "business": return <Building className="w-4 h-4" />;
      case "trust": return <Shield className="w-4 h-4" />;
      case "estate": return <FileText className="w-4 h-4" />;
      case "contract": return <Briefcase className="w-4 h-4" />;
      case "real-estate": return <Home className="w-4 h-4" />;
      case "family": return <Heart className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Legal Document Generator</h2>
          <p className="text-muted-foreground">Create professional legal documents from templates</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Document
        </Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <History className="w-4 h-4" />
            My Documents
          </TabsTrigger>
          <TabsTrigger value="popular" className="gap-2">
            <Star className="w-4 h-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          {selectedTemplate ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                  ← Back to Templates
                </Button>
                <Badge className="capitalize">{selectedTemplate.category}</Badge>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {selectedTemplate.icon}
                    </div>
                    <div>
                      <CardTitle>{selectedTemplate.name}</CardTitle>
                      <CardDescription>{selectedTemplate.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTemplate.fields.map((field) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field} className="capitalize">
                        {field.replace(/([A-Z])/g, " $1").trim()} *
                      </Label>
                      {field.includes("description") || field.includes("terms") ? (
                        <Textarea
                          id={field}
                          placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim().toLowerCase()}`}
                          value={formData[field] || ""}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          rows={4}
                        />
                      ) : (
                        <Input
                          id={field}
                          placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim().toLowerCase()}`}
                          value={formData[field] || ""}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1 gap-2" onClick={handleGenerateDocument}>
                      <FileText className="w-4 h-4" />
                      Generate Document
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="estate">Estate</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {template.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          {template.popular && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="w-3 h-3" />
                              Popular
                            </Badge>
                          )}
                          <Badge variant="outline" className="capitalize">
                            {getCategoryIcon(template.category)}
                            <span className="ml-1">{template.category}</span>
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Documents</CardTitle>
              <CardDescription>View and manage your generated documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGeneratedDocuments.map((doc) => {
                  const template = documentTemplates.find((t) => t.id === doc.templateId);
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {template?.icon || <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {template?.name} • Created {doc.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(doc.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        {doc.status === "draft" && (
                          <Button variant="ghost" size="sm">
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTemplates.filter((t) => t.popular).map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LegalDocumentGenerator;
