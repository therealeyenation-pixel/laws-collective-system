import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Shield,
  Heart,
  Scale,
  Lock,
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  Building2,
  FileSignature,
  Map,
  Wind,
  Droplets,
  Sparkles,
  Pen,
  Check,
} from "lucide-react";
import { ESignatureCapture } from "@/components/ESignatureCapture";
import { useAuth } from "@/_core/hooks/useAuth";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming", "District of Columbia"
];

export default function ProtectionLayer() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [generatedDocument, setGeneratedDocument] = useState<{ html: string; url: string; documentType?: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<{
    type: "drawn" | "typed";
    data: string;
    name: string;
    timestamp: number;
  } | null>(null);
  const [documentSigned, setDocumentSigned] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState<string | null>(null);
  const [bundleDocuments, setBundleDocuments] = useState<Array<{ name: string; html: string; url: string; documentType: string }>>([]);
  const [bundleForm, setBundleForm] = useState({
    principalName: user?.name || "",
    principalAddress: "",
    principalCity: "",
    principalState: "",
    principalZip: "",
    principalDOB: "",
    agentName: "",
    agentAddress: "",
    agentCity: "",
    agentState: "",
    agentZip: "",
    agentPhone: "",
    agentRelationship: "",
    businessName: "",
    businessPurpose: "",
    members: [{ name: user?.name || "", ownershipPercentage: 100, capitalContribution: "$1,000" }],
    beneficiaries: [{ name: "", relationship: "", percentage: 100 }],
    state: "",
    county: "",
    executionDate: new Date().toISOString().split('T')[0],
  });

  const [healthcarePOAForm, setHealthcarePOAForm] = useState({
    principalName: "",
    principalAddress: "",
    principalCity: "",
    principalState: "",
    principalZip: "",
    principalDOB: "",
    agentName: "",
    agentAddress: "",
    agentCity: "",
    agentState: "",
    agentZip: "",
    agentPhone: "",
    agentRelationship: "",
    alternateAgentName: "",
    powers: {
      consentToTreatment: true,
      refuseTreatment: true,
      accessMedicalRecords: true,
      hireDischargeProviders: true,
      admitToFacility: true,
      authorizeRelease: true,
      makeDNRDecisions: false,
      organDonation: false,
      mentalHealthTreatment: true,
      experimentalTreatment: false,
    },
    effectiveImmediately: false,
    effectiveUponIncapacity: true,
    state: "",
    county: "",
    executionDate: new Date().toISOString().split('T')[0],
  });

  const signDocument = trpc.electronicSignature.sign.useMutation({
    onSuccess: (data) => {
      setDocumentSigned(true);
      toast.success(`Document signed! Verification code: ${data.verificationCode}`);
    },
    onError: (error) => {
      toast.error(`Failed to sign: ${error.message}`);
    },
  });

  const handleSignDocument = (signature: {
    type: "drawn" | "typed";
    data: string;
    name: string;
    timestamp: number;
  }) => {
    setSignatureData(signature);
    setShowSignature(false);
    
    // Sign the document with the electronic signature system
    if (generatedDocument) {
      signDocument.mutate({
        documentType: generatedDocument.documentType || "protection_layer_document",
        documentId: Date.now(), // Use timestamp as unique ID for generated documents
        documentTitle: generatedDocument.documentType?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Protection Layer Document",
        signatureStatement: `I, ${signature.name}, hereby sign this document electronically on ${new Date(signature.timestamp).toLocaleString()}.`,
        requiresAnnualReAck: false,
      });
    }
  };

  const generateHealthcarePOA = trpc.protectionLayer.generateHealthcarePOA.useMutation({
    onSuccess: (data) => {
      setGeneratedDocument({ html: data.html, url: data.url, documentType: "healthcare_poa" });
      setShowPreview(true);
      setDocumentSigned(false);
      setSignatureData(null);
      toast.success("Healthcare Power of Attorney generated!");
    },
    onError: (error) => {
      toast.error(`Failed to generate: ${error.message}`);
    },
  });

  const handleGenerateHealthcarePOA = () => {
    if (!healthcarePOAForm.principalName || !healthcarePOAForm.agentName) {
      toast.error("Please fill in required fields");
      return;
    }
    generateHealthcarePOA.mutate(healthcarePOAForm);
  };

  const generateBundle = trpc.protectionLayer.generateBundle.useMutation({
    onSuccess: (data) => {
      setBundleDocuments(data.documents);
      setShowBundleModal(null);
      toast.success(`${data.totalDocuments} documents generated successfully!`);
    },
    onError: (error) => {
      toast.error(`Failed to generate bundle: ${error.message}`);
    },
  });

  const handleGenerateBundle = (bundleType: string) => {
    if (!bundleForm.principalName || !bundleForm.state || !bundleForm.county) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate bundle-specific requirements
    if (bundleType === "business_starter" && !bundleForm.businessName) {
      toast.error("Please enter a business name");
      return;
    }

    if ((bundleType === "family_protection" || bundleType === "healthcare_complete") && !bundleForm.agentName) {
      toast.error("Please enter an agent name");
      return;
    }

    if (bundleType === "asset_protection" && bundleForm.beneficiaries[0]?.name === "") {
      toast.error("Please add at least one beneficiary");
      return;
    }

    generateBundle.mutate({
      bundleType: bundleType as "business_starter" | "family_protection" | "healthcare_complete" | "asset_protection",
      ...bundleForm,
    });
  };

  const resetBundleForm = () => {
    setBundleForm({
      principalName: user?.name || "",
      principalAddress: "",
      principalCity: "",
      principalState: "",
      principalZip: "",
      principalDOB: "",
      agentName: "",
      agentAddress: "",
      agentCity: "",
      agentState: "",
      agentZip: "",
      agentPhone: "",
      agentRelationship: "",
      businessName: "",
      businessPurpose: "",
      members: [{ name: user?.name || "", ownershipPercentage: 100, capitalContribution: "$1,000" }],
      beneficiaries: [{ name: "", relationship: "", percentage: 100 }],
      state: "",
      county: "",
      executionDate: new Date().toISOString().split('T')[0],
    });
    setBundleDocuments([]);
  };

  const documentCategories = [
    {
      id: "healthcare",
      title: "Healthcare & Estate",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      description: "Protect your health decisions and family legacy",
      lawsPillar: "Self",
      documents: [
        { code: "healthcare_poa", name: "Healthcare Power of Attorney", ready: true },
        { code: "living_will", name: "Living Will / Advance Directive", ready: true },
        { code: "hipaa_authorization", name: "HIPAA Authorization", ready: true },
        { code: "financial_poa", name: "Durable Financial Power of Attorney", ready: true },
      ],
    },
    {
      id: "dispute",
      title: "Dispute Resolution",
      icon: Scale,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Navigate conflicts through private channels",
      lawsPillar: "Water",
      documents: [
        { code: "arbitration_agreement", name: "Private Arbitration Agreement", ready: true },
        { code: "mediation_agreement", name: "Mediation Agreement", ready: false },
        { code: "settlement_agreement", name: "Settlement Agreement", ready: false },
      ],
    },
    {
      id: "privacy",
      title: "Privacy & Asset Protection",
      icon: Lock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Shield your identity and assets strategically",
      lawsPillar: "Land",
      documents: [
        { code: "privacy_trust", name: "Privacy Trust", ready: false },
        { code: "nominee_agreement", name: "Nominee Agreement", ready: false },
        { code: "registered_agent", name: "Registered Agent Agreement", ready: false },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Protection Layer
            </h1>
            <p className="text-muted-foreground mt-1">
              Legal instruments to navigate and protect across all planes of existence
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-green-900/20 via-blue-900/20 to-purple-900/20 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Map className="w-5 h-5 text-green-500" />
                </div>
                <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                  <Wind className="w-5 h-5 text-sky-500" />
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-500" />
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">L.A.W.S. Protection Framework</h3>
                <p className="text-sm text-muted-foreground">
                  Master the instruments that allow you to move fluidly through all systems
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-green-500" />
                <span><strong>Land:</strong> Property & Asset Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-sky-500" />
                <span><strong>Air:</strong> Knowledge & Communication</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span><strong>Water:</strong> Flow & Dispute Resolution</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span><strong>Self:</strong> Healthcare & Personal Agency</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bundles">Document Bundles</TabsTrigger>
            <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
            <TabsTrigger value="dispute">Dispute</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {documentCategories.map((category) => (
                <Card 
                  key={category.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setActiveTab(category.id)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-2`}>
                      <category.icon className={`w-6 h-6 ${category.color}`} />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      {category.title}
                      <Badge variant="outline">{category.lawsPillar}</Badge>
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.documents.map((doc) => (
                        <div key={doc.code} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{doc.name}</span>
                          {doc.ready ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-muted-foreground/50" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">10</p>
                      <p className="text-sm text-muted-foreground">Document Templates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-sm text-muted-foreground">Ready to Generate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-sm text-muted-foreground">Protection Categories</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">4</p>
                      <p className="text-sm text-muted-foreground">L.A.W.S. Pillars</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bundles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  Document Bundles
                </CardTitle>
                <CardDescription>
                  Generate multiple related documents at once with shared information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Starter Bundle */}
                  <Card className="border-2 border-sky-500/20 hover:border-sky-500/40 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-sky-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Business Starter Bundle</CardTitle>
                          <Badge variant="outline" className="mt-1">Air Pillar</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Essential documents for starting a new business entity
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>LLC Operating Agreement</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>DBA Registration</span>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => { resetBundleForm(); setShowBundleModal("business_starter"); }}>
                        Generate Bundle
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Family Protection Bundle */}
                  <Card className="border-2 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Family Protection Bundle</CardTitle>
                          <Badge variant="outline" className="mt-1">Self Pillar</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Complete healthcare and financial protection for your family
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Healthcare Power of Attorney</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Living Will</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Financial Power of Attorney</span>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => { resetBundleForm(); setShowBundleModal("family_protection"); }}>
                        Generate Bundle
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Healthcare Complete Bundle */}
                  <Card className="border-2 border-red-500/20 hover:border-red-500/40 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <Heart className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Healthcare Complete Bundle</CardTitle>
                          <Badge variant="outline" className="mt-1">Self Pillar</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        All healthcare-related legal documents in one package
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Healthcare Power of Attorney</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Living Will</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>HIPAA Authorization</span>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => { resetBundleForm(); setShowBundleModal("healthcare_complete"); }}>
                        Generate Bundle
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Asset Protection Bundle */}
                  <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Asset Protection Bundle</CardTitle>
                          <Badge variant="outline" className="mt-1">Land Pillar</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Trust structures for privacy and asset protection
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Privacy Trust</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Revocable Living Trust</span>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => { resetBundleForm(); setShowBundleModal("asset_protection"); }}>
                        Generate Bundle
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Generated Bundle Documents */}
                {bundleDocuments.length > 0 && (
                  <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Generated Documents ({bundleDocuments.length})
                    </h4>
                    <div className="space-y-2">
                      {bundleDocuments.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-background rounded border">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="font-medium">{doc.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setGeneratedDocument({ html: doc.html, url: doc.url, documentType: doc.documentType });
                                setShowPreview(true);
                                setDocumentSigned(false);
                                setSignatureData(null);
                              }}
                            >
                              Preview
                            </Button>
                            <Button size="sm" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="healthcare" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Healthcare Power of Attorney
                </CardTitle>
                <CardDescription>
                  Designate a trusted person to make healthcare decisions on your behalf
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Your Information (Principal)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Legal Name *</Label>
                      <Input
                        value={healthcarePOAForm.principalName}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, principalName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={healthcarePOAForm.principalDOB}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, principalDOB: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Street Address *</Label>
                      <Input
                        value={healthcarePOAForm.principalAddress}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, principalAddress: e.target.value })}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input
                        value={healthcarePOAForm.principalCity}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, principalCity: e.target.value })}
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Select
                        value={healthcarePOAForm.principalState}
                        onValueChange={(value) => setHealthcarePOAForm({ ...healthcarePOAForm, principalState: value, state: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP Code *</Label>
                      <Input
                        value={healthcarePOAForm.principalZip}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, principalZip: e.target.value })}
                        placeholder="90001"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Healthcare Agent Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Agent's Full Name *</Label>
                      <Input
                        value={healthcarePOAForm.agentName}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, agentName: e.target.value })}
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship *</Label>
                      <Input
                        value={healthcarePOAForm.agentRelationship}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, agentRelationship: e.target.value })}
                        placeholder="Spouse, Child, Sibling, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Agent's Address *</Label>
                      <Input
                        value={healthcarePOAForm.agentAddress}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, agentAddress: e.target.value })}
                        placeholder="456 Oak Avenue"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Agent's City *</Label>
                      <Input
                        value={healthcarePOAForm.agentCity}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, agentCity: e.target.value })}
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Agent's State *</Label>
                      <Select
                        value={healthcarePOAForm.agentState}
                        onValueChange={(value) => setHealthcarePOAForm({ ...healthcarePOAForm, agentState: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Agent's ZIP Code *</Label>
                      <Input
                        value={healthcarePOAForm.agentZip}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, agentZip: e.target.value })}
                        placeholder="90001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Agent's Phone *</Label>
                      <Input
                        value={healthcarePOAForm.agentPhone}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, agentPhone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>County *</Label>
                      <Input
                        value={healthcarePOAForm.county}
                        onChange={(e) => setHealthcarePOAForm({ ...healthcarePOAForm, county: e.target.value })}
                        placeholder="Los Angeles County"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Powers Granted to Agent</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(healthcarePOAForm.powers).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) =>
                            setHealthcarePOAForm({
                              ...healthcarePOAForm,
                              powers: { ...healthcarePOAForm.powers, [key]: checked as boolean },
                            })
                          }
                        />
                        <Label htmlFor={key} className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">When Does This Take Effect?</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="effectiveImmediately"
                        checked={healthcarePOAForm.effectiveImmediately}
                        onCheckedChange={(checked) =>
                          setHealthcarePOAForm({
                            ...healthcarePOAForm,
                            effectiveImmediately: checked as boolean,
                            effectiveUponIncapacity: !(checked as boolean),
                          })
                        }
                      />
                      <Label htmlFor="effectiveImmediately">Effective Immediately</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="effectiveUponIncapacity"
                        checked={healthcarePOAForm.effectiveUponIncapacity}
                        onCheckedChange={(checked) =>
                          setHealthcarePOAForm({
                            ...healthcarePOAForm,
                            effectiveUponIncapacity: checked as boolean,
                            effectiveImmediately: !(checked as boolean),
                          })
                        }
                      />
                      <Label htmlFor="effectiveUponIncapacity">Effective Only Upon Incapacity (Recommended)</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleGenerateHealthcarePOA}
                    disabled={generateHealthcarePOA.isPending}
                    className="flex-1"
                  >
                    {generateHealthcarePOA.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileSignature className="w-4 h-4 mr-2" />
                        Generate Healthcare POA
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Living Will
                    <Badge variant="outline">Ready</Badge>
                  </CardTitle>
                  <CardDescription>
                    Specify your wishes for end-of-life medical treatment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => toast.info("Living Will form - expand Healthcare tab for full form")}>
                    Create Living Will
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    HIPAA Authorization
                    <Badge variant="outline">Ready</Badge>
                  </CardTitle>
                  <CardDescription>
                    Authorize release of your medical information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => toast.info("HIPAA Authorization - expand Healthcare tab for full form")}>
                    Create HIPAA Authorization
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Financial Power of Attorney
                    <Badge variant="outline">Ready</Badge>
                  </CardTitle>
                  <CardDescription>
                    Grant authority over your financial matters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => toast.info("Financial POA - expand Healthcare tab for full form")}>
                    Create Financial POA
                  </Button>
                </CardContent>
              </Card>

              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Guardian Nomination
                    <Badge variant="secondary">Coming Soon</Badge>
                  </CardTitle>
                  <CardDescription>
                    Nominate guardians for minor children
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dispute" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-500" />
                  Private Arbitration Agreement
                  <Badge variant="outline">Ready</Badge>
                </CardTitle>
                <CardDescription>
                  Establish private dispute resolution channels outside of traditional court systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Private arbitration allows parties to resolve disputes efficiently through a neutral third party, 
                    maintaining confidentiality and avoiding the public nature of court proceedings. This is a standard 
                    legal instrument used by sophisticated businesses and families.
                  </p>
                  <Button onClick={() => toast.info("Arbitration Agreement generator ready - full form coming soon")}>
                    Create Arbitration Agreement
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle className="text-lg">L.A.W.S. Member Dispute Protocol</CardTitle>
                  <CardDescription>
                    Internal dispute resolution for The The L.A.W.S. Collective members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle className="text-lg">Mediation Agreement</CardTitle>
                  <CardDescription>
                    Agreement to attempt mediation before arbitration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-500" />
                  Privacy & Asset Protection
                </CardTitle>
                <CardDescription>
                  Strategic instruments for protecting your identity and assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Privacy protection instruments allow you to separate your personal identity from your business 
                    and asset holdings. These are standard legal structures used by sophisticated families and 
                    businesses to maintain privacy while operating within all legal frameworks.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="opacity-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Privacy Trust</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Hold assets anonymously through a trust structure
                        </p>
                        <Button variant="outline" className="w-full" disabled>
                          Coming Soon
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="opacity-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Nominee Agreement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Designate a nominee for public records
                        </p>
                        <Button variant="outline" className="w-full" disabled>
                          Coming Soon
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Document Preview</DialogTitle>
              <DialogDescription>
                Review your generated document, sign electronically, then download
              </DialogDescription>
            </DialogHeader>
            {generatedDocument && (
              <div className="space-y-4">
                <div 
                  className="border rounded-lg p-4 bg-white text-black max-h-[50vh] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: generatedDocument.html }}
                />
                
                {/* Signature Status */}
                {signatureData && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Document Signed</p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Signed by {signatureData.name} on {new Date(signatureData.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {signatureData.type === "drawn" && (
                      <div className="mt-3 p-2 bg-white rounded border">
                        <img src={signatureData.data} alt="Signature" className="h-12 mx-auto" />
                      </div>
                    )}
                    {signatureData.type === "typed" && (
                      <div className="mt-3 p-2 bg-white rounded border text-center">
                        <p className="text-xl" style={{ fontFamily: "cursive" }}>{signatureData.data}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-4">
                  {!signatureData ? (
                    <Button 
                      onClick={() => setShowSignature(true)} 
                      className="flex-1"
                      variant="default"
                    >
                      <Pen className="w-4 h-4 mr-2" />
                      Sign Document Electronically
                    </Button>
                  ) : (
                    <Button asChild className="flex-1">
                      <a href={generatedDocument.url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download Signed Document
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* E-Signature Capture Dialog */}
        <ESignatureCapture
          open={showSignature}
          onOpenChange={setShowSignature}
          onSign={handleSignDocument}
          signerName={user?.name || ""}
          documentTitle={generatedDocument?.documentType?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Protection Layer Document"}
        />

        {/* Bundle Form Modals */}
        <Dialog open={showBundleModal === "business_starter"} onOpenChange={(open) => !open && setShowBundleModal(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-500" />
                Business Starter Bundle
              </DialogTitle>
              <DialogDescription>
                Generate LLC Operating Agreement and DBA Registration documents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Business Name *</Label>
                  <Input
                    value={bundleForm.businessName}
                    onChange={(e) => setBundleForm({ ...bundleForm, businessName: e.target.value })}
                    placeholder="Your Business LLC"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Business Purpose</Label>
                  <Input
                    value={bundleForm.businessPurpose}
                    onChange={(e) => setBundleForm({ ...bundleForm, businessPurpose: e.target.value })}
                    placeholder="General business operations"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Owner/Member Name *</Label>
                  <Input
                    value={bundleForm.principalName}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalName: e.target.value })}
                    placeholder="Your full legal name"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={bundleForm.principalAddress}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalAddress: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={bundleForm.principalCity}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalCity: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Select value={bundleForm.state} onValueChange={(v) => setBundleForm({ ...bundleForm, state: v })}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>County *</Label>
                  <Input
                    value={bundleForm.county}
                    onChange={(e) => setBundleForm({ ...bundleForm, county: e.target.value })}
                    placeholder="County"
                  />
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input
                    value={bundleForm.principalZip}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalZip: e.target.value })}
                    placeholder="12345"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => handleGenerateBundle("business_starter")}
                  disabled={generateBundle.isPending}
                >
                  {generateBundle.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Generate Bundle
                </Button>
                <Button variant="outline" onClick={() => setShowBundleModal(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showBundleModal === "family_protection"} onOpenChange={(open) => !open && setShowBundleModal(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Family Protection Bundle
              </DialogTitle>
              <DialogDescription>
                Generate Healthcare POA, Living Will, and Financial POA documents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Principal Information</h4>
                <p className="text-sm text-purple-600 dark:text-purple-400">The person these documents protect</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Your Full Legal Name *</Label>
                  <Input
                    value={bundleForm.principalName}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalName: e.target.value })}
                    placeholder="Your full legal name"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={bundleForm.principalAddress}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalAddress: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={bundleForm.principalCity}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalCity: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Select value={bundleForm.state} onValueChange={(v) => setBundleForm({ ...bundleForm, state: v })}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>County *</Label>
                  <Input
                    value={bundleForm.county}
                    onChange={(e) => setBundleForm({ ...bundleForm, county: e.target.value })}
                    placeholder="County"
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={bundleForm.principalDOB}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalDOB: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Agent Information</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">The person who will make decisions on your behalf</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Agent Full Name *</Label>
                  <Input
                    value={bundleForm.agentName}
                    onChange={(e) => setBundleForm({ ...bundleForm, agentName: e.target.value })}
                    placeholder="Agent's full legal name"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Agent Address</Label>
                  <Input
                    value={bundleForm.agentAddress}
                    onChange={(e) => setBundleForm({ ...bundleForm, agentAddress: e.target.value })}
                    placeholder="Agent's address"
                  />
                </div>
                <div>
                  <Label>Agent Phone</Label>
                  <Input
                    value={bundleForm.agentPhone}
                    onChange={(e) => setBundleForm({ ...bundleForm, agentPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input
                    value={bundleForm.agentRelationship}
                    onChange={(e) => setBundleForm({ ...bundleForm, agentRelationship: e.target.value })}
                    placeholder="Spouse, Child, Sibling, etc."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => handleGenerateBundle("family_protection")}
                  disabled={generateBundle.isPending}
                >
                  {generateBundle.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Generate Bundle
                </Button>
                <Button variant="outline" onClick={() => setShowBundleModal(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showBundleModal === "healthcare_complete"} onOpenChange={(open) => !open && setShowBundleModal(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Healthcare Complete Bundle
              </DialogTitle>
              <DialogDescription>
                Generate Healthcare POA, Living Will, and HIPAA Authorization documents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Your Information</h4>
                <p className="text-sm text-red-600 dark:text-red-400">The person these healthcare documents protect</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Your Full Legal Name *</Label>
                  <Input
                    value={bundleForm.principalName}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalName: e.target.value })}
                    placeholder="Your full legal name"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={bundleForm.principalAddress}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalAddress: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={bundleForm.principalCity}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalCity: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Select value={bundleForm.state} onValueChange={(v) => setBundleForm({ ...bundleForm, state: v })}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>County *</Label>
                  <Input
                    value={bundleForm.county}
                    onChange={(e) => setBundleForm({ ...bundleForm, county: e.target.value })}
                    placeholder="County"
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={bundleForm.principalDOB}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalDOB: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Healthcare Agent</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">The person who will make healthcare decisions for you</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Agent Full Name *</Label>
                  <Input
                    value={bundleForm.agentName}
                    onChange={(e) => setBundleForm({ ...bundleForm, agentName: e.target.value })}
                    placeholder="Agent's full legal name"
                  />
                </div>
                <div>
                  <Label>Agent Phone</Label>
                  <Input
                    value={bundleForm.agentPhone}
                    onChange={(e) => setBundleForm({ ...bundleForm, agentPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input
                    value={bundleForm.agentRelationship}
                    onChange={(e) => setBundleForm({ ...bundleForm, agentRelationship: e.target.value })}
                    placeholder="Spouse, Child, etc."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => handleGenerateBundle("healthcare_complete")}
                  disabled={generateBundle.isPending}
                >
                  {generateBundle.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Generate Bundle
                </Button>
                <Button variant="outline" onClick={() => setShowBundleModal(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showBundleModal === "asset_protection"} onOpenChange={(open) => !open && setShowBundleModal(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Asset Protection Bundle
              </DialogTitle>
              <DialogDescription>
                Generate Privacy Trust and Revocable Living Trust documents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Grantor Information</h4>
                <p className="text-sm text-green-600 dark:text-green-400">The person creating the trusts</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Your Full Legal Name *</Label>
                  <Input
                    value={bundleForm.principalName}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalName: e.target.value })}
                    placeholder="Your full legal name"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={bundleForm.principalAddress}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalAddress: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={bundleForm.principalCity}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalCity: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Select value={bundleForm.state} onValueChange={(v) => setBundleForm({ ...bundleForm, state: v })}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>County *</Label>
                  <Input
                    value={bundleForm.county}
                    onChange={(e) => setBundleForm({ ...bundleForm, county: e.target.value })}
                    placeholder="County"
                  />
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input
                    value={bundleForm.principalZip}
                    onChange={(e) => setBundleForm({ ...bundleForm, principalZip: e.target.value })}
                    placeholder="12345"
                  />
                </div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">Primary Beneficiary</h4>
                <p className="text-sm text-amber-600 dark:text-amber-400">Who will benefit from the trust</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Beneficiary Name *</Label>
                  <Input
                    value={bundleForm.beneficiaries[0]?.name || ""}
                    onChange={(e) => setBundleForm({
                      ...bundleForm,
                      beneficiaries: [{ ...bundleForm.beneficiaries[0], name: e.target.value }]
                    })}
                    placeholder="Beneficiary's full legal name"
                  />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input
                    value={bundleForm.beneficiaries[0]?.relationship || ""}
                    onChange={(e) => setBundleForm({
                      ...bundleForm,
                      beneficiaries: [{ ...bundleForm.beneficiaries[0], relationship: e.target.value }]
                    })}
                    placeholder="Spouse, Child, etc."
                  />
                </div>
                <div>
                  <Label>Percentage</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={bundleForm.beneficiaries[0]?.percentage || 100}
                    onChange={(e) => setBundleForm({
                      ...bundleForm,
                      beneficiaries: [{ ...bundleForm.beneficiaries[0], percentage: parseInt(e.target.value) || 100 }]
                    })}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => handleGenerateBundle("asset_protection")}
                  disabled={generateBundle.isPending}
                >
                  {generateBundle.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Generate Bundle
                </Button>
                <Button variant="outline" onClick={() => setShowBundleModal(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
