import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";
import {
  FileText,
  Upload,
  MessageSquare,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Scale,
  Lightbulb,
  Send,
  Loader2,
  FileUp,
  Eye,
  Download,
  History,
  Sparkles,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  Info,
  Zap,
  Star,
} from "lucide-react";

// Contract types supported
const CONTRACT_TYPES = [
  { id: "employment", label: "Employment Contract", icon: Users },
  { id: "vendor", label: "Vendor/Service Agreement", icon: FileText },
  { id: "real-estate", label: "Real Estate Lease/Purchase", icon: Scale },
  { id: "partnership", label: "Partnership Agreement", icon: Users },
  { id: "freelance", label: "Freelance/Contractor Agreement", icon: DollarSign },
  { id: "nda", label: "Non-Disclosure Agreement", icon: Shield },
  { id: "settlement", label: "Settlement Agreement", icon: Scale },
  { id: "other", label: "Other Contract Type", icon: FileText },
];

// Risk levels
const RISK_LEVELS = {
  low: { label: "Low Risk", color: "text-green-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
  medium: { label: "Medium Risk", color: "text-amber-500", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30" },
  high: { label: "High Risk", color: "text-red-500", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" },
};

interface ContractAnalysis {
  summary: string;
  keyTerms: { term: string; explanation: string; risk: "low" | "medium" | "high" }[];
  obligations: { party: string; obligation: string; deadline?: string }[];
  risks: { description: string; severity: "low" | "medium" | "high"; mitigation: string }[];
  recommendations: string[];
  overallRisk: "low" | "medium" | "high";
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface NegotiationStrategy {
  position: string;
  leverage: string[];
  weaknesses: string[];
  talkingPoints: string[];
  counterOffers: { original: string; suggested: string; rationale: string }[];
  walkAwayPoints: string[];
}

export default function ContractAgent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
  const [contractText, setContractText] = useState("");
  const [contractType, setContractType] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [strategy, setStrategy] = useState<NegotiationStrategy | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [userGoals, setUserGoals] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock analysis mutation - in production, this would call the LLM
  const analyzeContract = trpc.contracts?.analyzeContract?.useMutation?.() || {
    mutateAsync: async () => {
      // Mock analysis for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      return mockAnalysis;
    },
    isPending: false,
  };

  // Mock analysis data
  const mockAnalysis: ContractAnalysis = {
    summary: "This is a standard employment agreement with a technology company. The contract establishes an at-will employment relationship with a base salary, benefits package, and equity compensation. Key areas of concern include the non-compete clause, intellectual property assignment, and arbitration requirement.",
    keyTerms: [
      { term: "Non-Compete Clause (Section 8)", explanation: "Restricts you from working for competitors for 12 months after termination within a 50-mile radius.", risk: "high" },
      { term: "Intellectual Property Assignment (Section 5)", explanation: "All work product created during employment belongs to the company, including inventions conceived outside work hours.", risk: "medium" },
      { term: "At-Will Employment (Section 2)", explanation: "Either party can terminate the relationship at any time without cause.", risk: "low" },
      { term: "Arbitration Clause (Section 12)", explanation: "Disputes must be resolved through binding arbitration, waiving right to jury trial.", risk: "medium" },
      { term: "Confidentiality (Section 6)", explanation: "Standard NDA provisions that survive termination indefinitely.", risk: "low" },
    ],
    obligations: [
      { party: "Employee", obligation: "Maintain confidentiality of proprietary information", deadline: "Indefinite" },
      { party: "Employee", obligation: "Assign all intellectual property to company" },
      { party: "Employer", obligation: "Pay base salary of $X bi-weekly" },
      { party: "Employer", obligation: "Provide health insurance benefits after 30 days" },
      { party: "Employee", obligation: "Provide 2 weeks notice before resignation" },
    ],
    risks: [
      { description: "Broad non-compete may limit future employment opportunities", severity: "high", mitigation: "Negotiate narrower scope or shorter duration" },
      { description: "IP assignment includes personal projects", severity: "medium", mitigation: "Request carve-out for pre-existing and personal projects" },
      { description: "Arbitration waives jury trial rights", severity: "medium", mitigation: "Understand arbitration process; consider negotiating opt-out" },
    ],
    recommendations: [
      "Negotiate the non-compete clause to reduce duration from 12 to 6 months",
      "Request a carve-out in the IP clause for personal projects developed outside work hours",
      "Ask for clarification on what constitutes 'confidential information'",
      "Consider negotiating a severance package in case of termination without cause",
      "Request written confirmation of the equity vesting schedule",
    ],
    overallRisk: "medium",
  };

  const mockStrategy: NegotiationStrategy = {
    position: "You are in a moderate negotiating position. The company has extended an offer, indicating interest, but the terms contain several provisions that favor the employer significantly.",
    leverage: [
      "You have specialized skills that are in demand",
      "The company initiated contact and made the first offer",
      "Current job market favors candidates in your field",
      "You have competing offers or can obtain them",
    ],
    weaknesses: [
      "You may need the position more urgently than they need you",
      "Limited information about internal compensation bands",
      "Standard company policy may limit negotiation flexibility",
    ],
    talkingPoints: [
      "Express enthusiasm for the role while raising specific concerns",
      "Reference industry standards for non-compete clauses",
      "Highlight your unique value proposition",
      "Frame requests as mutually beneficial",
    ],
    counterOffers: [
      { original: "12-month non-compete, 50-mile radius", suggested: "6-month non-compete, 25-mile radius, or eliminate if laid off", rationale: "Industry standard is 6 months; courts often don't enforce overly broad restrictions" },
      { original: "All IP belongs to company", suggested: "Add carve-out: 'Excluding inventions developed entirely on personal time without company resources'", rationale: "Protects your side projects and pre-existing IP" },
      { original: "At-will with no severance", suggested: "2 weeks severance per year of service if terminated without cause", rationale: "Provides security and shows company confidence in the relationship" },
    ],
    walkAwayPoints: [
      "Non-compete exceeds 12 months or has no geographic limit",
      "No flexibility on IP assignment for personal projects",
      "Base salary more than 15% below market rate",
      "Refusal to provide equity vesting schedule in writing",
    ],
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return;
      }
      setUploadedFile(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  const handleAnalyze = async () => {
    if (!contractText && !uploadedFile) {
      toast.error("Please upload a contract or paste contract text");
      return;
    }
    if (!contractType) {
      toast.error("Please select a contract type");
      return;
    }

    setIsAnalyzing(true);
    try {
      // In production, this would send to the LLM
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAnalysis(mockAnalysis);
      setStrategy(mockStrategy);
      setActiveTab("analysis");
      toast.success("Contract analysis complete!");
    } catch (error) {
      toast.error("Failed to analyze contract. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      // In production, this would call the LLM with context
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(chatInput),
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateMockResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("non-compete") || lowerQuestion.includes("noncompete")) {
      return "The non-compete clause in Section 8 is quite broad. It restricts you from working for any competitor within a 50-mile radius for 12 months after leaving. This is on the aggressive end of what courts typically enforce.\n\n**Key concerns:**\n- 12 months is longer than the typical 6-month standard\n- 50-mile radius may be overly restrictive depending on your industry\n- The definition of 'competitor' is vague\n\n**Suggested response:**\n\"I'm excited about this opportunity, but I'd like to discuss the non-compete clause. Would you consider reducing the duration to 6 months, which is more aligned with industry standards? I'd also appreciate clarifying the definition of 'competitor' to ensure it's reasonable.\"";
    }
    
    if (lowerQuestion.includes("salary") || lowerQuestion.includes("compensation") || lowerQuestion.includes("pay")) {
      return "When negotiating salary, consider these approaches:\n\n1. **Research first** - Know the market rate for your role and location\n2. **Anchor high** - Start with a number 10-15% above your target\n3. **Use ranges** - \"Based on my research and experience, I'm looking for something in the $X-$Y range\"\n4. **Consider total compensation** - Salary, bonus, equity, benefits, PTO\n\n**Sample script:**\n\"Thank you for the offer. I'm very interested in this role. Based on my research and the value I'll bring, I was hoping for a base salary closer to $X. Is there flexibility in the compensation package?\"";
    }
    
    if (lowerQuestion.includes("ip") || lowerQuestion.includes("intellectual property") || lowerQuestion.includes("invention")) {
      return "The IP assignment clause (Section 5) is worth negotiating. Currently, it assigns ALL inventions to the company, even those created on personal time.\n\n**What to request:**\nA carve-out provision that excludes:\n- Pre-existing intellectual property you bring to the job\n- Inventions developed entirely on personal time, without company resources, and unrelated to company business\n\n**Sample language:**\n\"Section 5 shall not apply to any invention that (a) was developed entirely on the Employee's own time, (b) without using Company equipment, supplies, or facilities, and (c) does not relate to the Company's business or anticipated research.\"";
    }
    
    return "That's a great question about the contract. Based on my analysis, here are some key points to consider:\n\n1. **Review the specific clause** - Look at the exact language and any defined terms\n2. **Understand your leverage** - Consider what you bring to the negotiation\n3. **Prepare alternatives** - Have specific counter-proposals ready\n4. **Document everything** - Get any changes in writing\n\nWould you like me to elaborate on any specific aspect of the contract or help you draft a response?";
  };

  const getRiskBadge = (risk: "low" | "medium" | "high") => {
    const config = RISK_LEVELS[risk];
    return (
      <Badge className={`${config.bgColor} ${config.color} ${config.borderColor}`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Scale className="w-8 h-8 text-primary" />
              Contract Negotiation Agent
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered contract analysis and negotiation strategy
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <History className="w-4 h-4" />
              History
            </Button>
            <Button variant="outline" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Templates
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2" disabled={!analysis}>
              <Eye className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="strategy" className="gap-2" disabled={!strategy}>
              <Target className="w-4 h-4" />
              Strategy
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2" disabled={!analysis}>
              <MessageSquare className="w-4 h-4" />
              Q&A
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileUp className="w-5 h-5" />
                    Upload Contract
                  </CardTitle>
                  <CardDescription>
                    Upload a PDF, Word document, or image of your contract
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    {uploadedFile ? (
                      <div>
                        <p className="font-medium text-foreground">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-foreground">Click to upload</p>
                        <p className="text-sm text-muted-foreground">
                          PDF, Word, or image (max 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
                    </div>
                  </div>

                  <Textarea
                    placeholder="Paste your contract text here..."
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    className="min-h-[200px]"
                  />
                </CardContent>
              </Card>

              {/* Settings Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Analysis Settings
                  </CardTitle>
                  <CardDescription>
                    Tell us about the contract and your goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contract Type</label>
                    <Select value={contractType} onValueChange={setContractType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRACT_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Role</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee/Candidate</SelectItem>
                        <SelectItem value="employer">Employer/Company</SelectItem>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="landlord">Landlord</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Goals (Optional)</label>
                    <Textarea
                      placeholder="What are you hoping to achieve? Any specific concerns?"
                      value={userGoals}
                      onChange={(e) => setUserGoals(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!contractText && !uploadedFile)}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Contract...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze Contract
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              {[
                { icon: Eye, title: "Plain Language", desc: "Complex terms explained simply" },
                { icon: AlertTriangle, title: "Risk Assessment", desc: "Identify potential issues" },
                { icon: Target, title: "Strategy Builder", desc: "Negotiation talking points" },
                { icon: MessageSquare, title: "Interactive Q&A", desc: "Ask about any clause" },
              ].map((feature, idx) => (
                <Card key={idx} className="bg-muted/30">
                  <CardContent className="p-4 text-center">
                    <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="mt-6">
            {analysis && (
              <div className="space-y-6">
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Contract Summary
                      </CardTitle>
                      {getRiskBadge(analysis.overallRisk)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{analysis.summary}</p>
                  </CardContent>
                </Card>

                {/* Key Terms */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Key Terms Explained
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.keyTerms.map((term, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-muted/30 border">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{term.term}</h4>
                            {getRiskBadge(term.risk)}
                          </div>
                          <p className="text-sm text-muted-foreground">{term.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Identified Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.risks.map((risk, idx) => (
                        <div key={idx} className={`p-4 rounded-lg border ${RISK_LEVELS[risk.severity].bgColor} ${RISK_LEVELS[risk.severity].borderColor}`}>
                          <div className="flex items-start gap-3">
                            <AlertCircle className={`w-5 h-5 mt-0.5 ${RISK_LEVELS[risk.severity].color}`} />
                            <div>
                              <p className="font-medium text-foreground">{risk.description}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                <strong>Mitigation:</strong> {risk.mitigation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="mt-6">
            {strategy && (
              <div className="space-y-6">
                {/* Position Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Your Negotiating Position
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{strategy.position}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Your Leverage
                        </h4>
                        <ul className="space-y-2">
                          {strategy.leverage.map((item, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <h4 className="font-semibold text-amber-600 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Areas of Caution
                        </h4>
                        <ul className="space-y-2">
                          {strategy.weaknesses.map((item, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Counter-Offers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Suggested Counter-Offers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {strategy.counterOffers.map((offer, idx) => (
                        <div key={idx} className="p-4 rounded-lg border bg-muted/30">
                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">CURRENT TERM</p>
                              <p className="text-sm text-red-500 line-through">{offer.original}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">SUGGESTED COUNTER</p>
                              <p className="text-sm text-green-600 font-medium">{offer.suggested}</p>
                            </div>
                          </div>
                          <div className="pt-3 border-t">
                            <p className="text-xs font-medium text-muted-foreground mb-1">RATIONALE</p>
                            <p className="text-sm text-muted-foreground">{offer.rationale}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Talking Points */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Talking Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {strategy.talkingPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Walk-Away Points */}
                <Card className="border-red-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-500">
                      <Shield className="w-5 h-5" />
                      Walk-Away Points
                    </CardTitle>
                    <CardDescription>
                      Consider walking away if these conditions aren't met
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {strategy.walkAwayPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Ask About Your Contract
                </CardTitle>
                <CardDescription>
                  Get answers about specific clauses, terms, or negotiation strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">Start a Conversation</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ask questions about your contract, specific clauses, or negotiation strategies
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          "What does the non-compete clause mean?",
                          "How should I negotiate salary?",
                          "Is the IP clause standard?",
                        ].map((suggestion, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => setChatInput(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {message.role === "assistant" ? (
                              <Streamdown>{message.content}</Streamdown>
                            ) : (
                              <p>{message.content}</p>
                            )}
                            <p className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-4">
                            <Loader2 className="w-5 h-5 animate-spin" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about your contract..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      disabled={isChatLoading}
                    />
                    <Button onClick={handleSendMessage} disabled={isChatLoading || !chatInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
