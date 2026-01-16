import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Globe2,
  Building2,
  FileText,
  DollarSign,
  Shield,
  CheckCircle2,
  Circle,
  MapPin,
  Landmark,
  Scale,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Download,
  ExternalLink,
} from "lucide-react";

// International registration checklist by region
const registrationChecklists = {
  europe: {
    name: "European Union",
    flag: "🇪🇺",
    requirements: [
      { id: "eu-1", task: "Research target EU member state business laws", category: "Research" },
      { id: "eu-2", task: "Choose business structure (SE, branch, subsidiary)", category: "Structure" },
      { id: "eu-3", task: "Register with local Chamber of Commerce", category: "Registration" },
      { id: "eu-4", task: "Obtain VAT registration number", category: "Tax" },
      { id: "eu-5", task: "Open EU business bank account", category: "Banking" },
      { id: "eu-6", task: "Register for GDPR compliance", category: "Compliance" },
      { id: "eu-7", task: "Appoint local legal representative", category: "Legal" },
      { id: "eu-8", task: "File annual accounts with local registry", category: "Reporting" },
    ],
  },
  uk: {
    name: "United Kingdom",
    flag: "🇬🇧",
    requirements: [
      { id: "uk-1", task: "Register with Companies House", category: "Registration" },
      { id: "uk-2", task: "Obtain UK business bank account", category: "Banking" },
      { id: "uk-3", task: "Register for Corporation Tax with HMRC", category: "Tax" },
      { id: "uk-4", task: "Register for VAT (if applicable)", category: "Tax" },
      { id: "uk-5", task: "Appoint UK-resident director (recommended)", category: "Structure" },
      { id: "uk-6", task: "Register for PAYE if hiring UK employees", category: "Employment" },
      { id: "uk-7", task: "Obtain necessary licenses/permits", category: "Compliance" },
      { id: "uk-8", task: "File confirmation statement annually", category: "Reporting" },
    ],
  },
  canada: {
    name: "Canada",
    flag: "🇨🇦",
    requirements: [
      { id: "ca-1", task: "Register federally or provincially", category: "Registration" },
      { id: "ca-2", task: "Obtain Business Number (BN) from CRA", category: "Tax" },
      { id: "ca-3", task: "Register for GST/HST", category: "Tax" },
      { id: "ca-4", task: "Open Canadian business bank account", category: "Banking" },
      { id: "ca-5", task: "Register for provincial sales tax (if applicable)", category: "Tax" },
      { id: "ca-6", task: "Obtain import/export permits", category: "Trade" },
      { id: "ca-7", task: "Register trademarks with CIPO", category: "IP" },
      { id: "ca-8", task: "File annual corporate returns", category: "Reporting" },
    ],
  },
  mexico: {
    name: "Mexico",
    flag: "🇲🇽",
    requirements: [
      { id: "mx-1", task: "Register with SAT (tax authority)", category: "Tax" },
      { id: "mx-2", task: "Obtain RFC (tax ID number)", category: "Tax" },
      { id: "mx-3", task: "Register with Public Registry of Commerce", category: "Registration" },
      { id: "mx-4", task: "Open Mexican business bank account", category: "Banking" },
      { id: "mx-5", task: "Register with IMSS for employee benefits", category: "Employment" },
      { id: "mx-6", task: "Obtain necessary permits (SEMARNAT, etc.)", category: "Compliance" },
      { id: "mx-7", task: "Register trademarks with IMPI", category: "IP" },
      { id: "mx-8", task: "File monthly/annual tax declarations", category: "Reporting" },
    ],
  },
  caribbean: {
    name: "Caribbean Region",
    flag: "🌴",
    requirements: [
      { id: "cb-1", task: "Choose jurisdiction (Cayman, BVI, Bahamas, etc.)", category: "Research" },
      { id: "cb-2", task: "Register with local Registrar of Companies", category: "Registration" },
      { id: "cb-3", task: "Appoint registered agent", category: "Structure" },
      { id: "cb-4", task: "Open offshore business bank account", category: "Banking" },
      { id: "cb-5", task: "Obtain business license", category: "Compliance" },
      { id: "cb-6", task: "Register for economic substance requirements", category: "Compliance" },
      { id: "cb-7", task: "File annual returns", category: "Reporting" },
      { id: "cb-8", task: "Maintain beneficial ownership register", category: "Compliance" },
    ],
  },
  africa: {
    name: "Africa",
    flag: "🌍",
    requirements: [
      { id: "af-1", task: "Research target country business laws", category: "Research" },
      { id: "af-2", task: "Register with local business registry", category: "Registration" },
      { id: "af-3", task: "Obtain tax identification number", category: "Tax" },
      { id: "af-4", task: "Open local business bank account", category: "Banking" },
      { id: "af-5", task: "Register for VAT/GST", category: "Tax" },
      { id: "af-6", task: "Obtain necessary sector licenses", category: "Compliance" },
      { id: "af-7", task: "Register with investment promotion agency", category: "Investment" },
      { id: "af-8", task: "Comply with local content requirements", category: "Compliance" },
    ],
  },
  asia: {
    name: "Asia Pacific",
    flag: "🌏",
    requirements: [
      { id: "ap-1", task: "Research target country FDI regulations", category: "Research" },
      { id: "ap-2", task: "Choose business structure (WFOE, JV, Rep Office)", category: "Structure" },
      { id: "ap-3", task: "Register with local business authority", category: "Registration" },
      { id: "ap-4", task: "Obtain business license/permit", category: "Compliance" },
      { id: "ap-5", task: "Open local business bank account", category: "Banking" },
      { id: "ap-6", task: "Register for local taxes", category: "Tax" },
      { id: "ap-7", task: "Appoint local director/representative", category: "Structure" },
      { id: "ap-8", task: "File annual compliance reports", category: "Reporting" },
    ],
  },
};

// Supported currencies for multi-currency tracking
const supportedCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "🇲🇽" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭" },
  { code: "XOF", name: "West African CFA", symbol: "CFA", flag: "🌍" },
  { code: "JMD", name: "Jamaican Dollar", symbol: "J$", flag: "🇯🇲" },
  { code: "TTD", name: "Trinidad Dollar", symbol: "TT$", flag: "🇹🇹" },
  { code: "BBD", name: "Barbados Dollar", symbol: "Bds$", flag: "🇧🇧" },
  { code: "KYD", name: "Cayman Dollar", symbol: "CI$", flag: "🇰🇾" },
];

// Compliance templates
const complianceTemplates = [
  {
    id: "fbar",
    name: "FBAR (FinCEN 114)",
    description: "Report of Foreign Bank and Financial Accounts - Required for US persons with foreign accounts exceeding $10,000",
    category: "US Reporting",
    required: true,
  },
  {
    id: "fatca",
    name: "FATCA Form 8938",
    description: "Statement of Specified Foreign Financial Assets - Required for US taxpayers with foreign assets above threshold",
    category: "US Reporting",
    required: true,
  },
  {
    id: "form5471",
    name: "Form 5471",
    description: "Information Return of US Persons With Respect to Certain Foreign Corporations",
    category: "US Reporting",
    required: true,
  },
  {
    id: "form8865",
    name: "Form 8865",
    description: "Return of US Persons With Respect to Certain Foreign Partnerships",
    category: "US Reporting",
    required: false,
  },
  {
    id: "transferpricing",
    name: "Transfer Pricing Documentation",
    description: "Documentation supporting intercompany pricing between related entities",
    category: "International Tax",
    required: true,
  },
  {
    id: "permanentestablishment",
    name: "Permanent Establishment Analysis",
    description: "Analysis to determine if foreign activities create taxable presence",
    category: "International Tax",
    required: true,
  },
  {
    id: "taxtreaty",
    name: "Tax Treaty Benefits Claim",
    description: "Forms to claim reduced withholding under applicable tax treaties",
    category: "International Tax",
    required: false,
  },
  {
    id: "aml",
    name: "AML/KYC Policy",
    description: "Anti-Money Laundering and Know Your Customer compliance policy",
    category: "Compliance",
    required: true,
  },
  {
    id: "gdpr",
    name: "GDPR Compliance Framework",
    description: "Data protection policy for EU operations and EU customer data",
    category: "Data Privacy",
    required: false,
  },
  {
    id: "sanctions",
    name: "Sanctions Screening Policy",
    description: "Policy for screening transactions against OFAC and other sanctions lists",
    category: "Compliance",
    required: true,
  },
];

// Market expansion phases
const expansionPhases = [
  {
    phase: 1,
    name: "Market Research & Validation",
    duration: "2-4 weeks",
    tasks: [
      "Identify target market demographics",
      "Analyze competitor landscape",
      "Assess regulatory environment",
      "Evaluate market entry barriers",
      "Conduct customer discovery interviews",
      "Validate product-market fit",
    ],
  },
  {
    phase: 2,
    name: "Legal & Structural Setup",
    duration: "4-8 weeks",
    tasks: [
      "Choose optimal business structure",
      "Register business entity",
      "Obtain necessary licenses",
      "Set up banking relationships",
      "Establish accounting systems",
      "Engage local legal counsel",
    ],
  },
  {
    phase: 3,
    name: "Operational Launch",
    duration: "4-6 weeks",
    tasks: [
      "Hire local team or representatives",
      "Set up local office/operations",
      "Establish supply chain",
      "Configure payment processing",
      "Launch marketing campaigns",
      "Begin customer acquisition",
    ],
  },
  {
    phase: 4,
    name: "Scale & Optimize",
    duration: "Ongoing",
    tasks: [
      "Monitor KPIs and metrics",
      "Optimize operations",
      "Expand product/service offerings",
      "Build strategic partnerships",
      "Reinvest profits for growth",
      "Plan additional market expansion",
    ],
  },
];

export default function InternationalBusiness() {
  const [selectedRegion, setSelectedRegion] = useState<string>("europe");
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [selectedCurrencies, setSelectedCurrencies] = useState<Set<string>>(new Set(["USD"]));

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const toggleCurrency = (code: string) => {
    const newSelected = new Set(selectedCurrencies);
    if (code === "USD") return; // USD is always selected
    if (newSelected.has(code)) {
      newSelected.delete(code);
    } else {
      newSelected.add(code);
    }
    setSelectedCurrencies(newSelected);
    toast.success(`${code} ${newSelected.has(code) ? "added to" : "removed from"} tracked currencies`);
  };

  const currentChecklist = registrationChecklists[selectedRegion as keyof typeof registrationChecklists];
  const completedCount = currentChecklist.requirements.filter(r => completedTasks.has(r.id)).length;
  const progressPercent = (completedCount / currentChecklist.requirements.length) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Globe2 className="w-8 h-8 text-primary" />
              International Business
            </h1>
            <p className="text-muted-foreground mt-1">
              Expand your business globally with registration guidance, compliance tools, and multi-currency tracking
            </p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="registration" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="currencies">Multi-Currency</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="expansion">Expansion Plan</TabsTrigger>
          </TabsList>

          {/* Registration Tab */}
          <TabsContent value="registration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  International Business Registration
                </CardTitle>
                <CardDescription>
                  Step-by-step checklists for registering your business in different regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Region Selector */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(registrationChecklists).map(([key, region]) => (
                    <Button
                      key={key}
                      variant={selectedRegion === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRegion(key)}
                      className="gap-2"
                    >
                      <span>{region.flag}</span>
                      {region.name}
                    </Button>
                  ))}
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {currentChecklist.flag} {currentChecklist.name} Registration Progress
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {completedCount} / {currentChecklist.requirements.length} completed
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                {/* Checklist */}
                <div className="space-y-3">
                  {currentChecklist.requirements.map((req) => (
                    <div
                      key={req.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        completedTasks.has(req.id)
                          ? "bg-green-50 border-green-200"
                          : "bg-background border-border"
                      }`}
                    >
                      <Checkbox
                        checked={completedTasks.has(req.id)}
                        onCheckedChange={() => toggleTask(req.id)}
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${completedTasks.has(req.id) ? "line-through text-muted-foreground" : ""}`}>
                          {req.task}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {req.category}
                      </Badge>
                      {completedTasks.has(req.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Multi-Currency Tab */}
          <TabsContent value="currencies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Multi-Currency Tracking
                </CardTitle>
                <CardDescription>
                  Select currencies to track for your international operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {supportedCurrencies.map((currency) => (
                    <div
                      key={currency.code}
                      onClick={() => toggleCurrency(currency.code)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedCurrencies.has(currency.code)
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      } ${currency.code === "USD" ? "cursor-not-allowed opacity-75" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{currency.flag}</span>
                        <span className="font-bold">{currency.code}</span>
                        {selectedCurrencies.has(currency.code) && (
                          <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{currency.name}</p>
                      <p className="text-lg font-semibold mt-1">{currency.symbol}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Selected Currencies ({selectedCurrencies.size})</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedCurrencies).map((code) => {
                      const currency = supportedCurrencies.find(c => c.code === code);
                      return (
                        <Badge key={code} variant="default" className="gap-1">
                          {currency?.flag} {code}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Currency Exchange Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  LuvLedger will automatically track transactions in your selected currencies and provide real-time exchange rate conversions.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <Landmark className="w-6 h-6 text-primary mb-2" />
                    <h4 className="font-semibold">Bank Integrations</h4>
                    <p className="text-sm text-muted-foreground">Connect international bank accounts</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <TrendingUp className="w-6 h-6 text-primary mb-2" />
                    <h4 className="font-semibold">Real-time Rates</h4>
                    <p className="text-sm text-muted-foreground">Live exchange rate updates</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <FileText className="w-6 h-6 text-primary mb-2" />
                    <h4 className="font-semibold">Multi-currency Reports</h4>
                    <p className="text-sm text-muted-foreground">Financial reports in any currency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  International Compliance Templates
                </CardTitle>
                <CardDescription>
                  Essential compliance documents for international business operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          {template.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Template
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900">Important Notice</h4>
                      <p className="text-sm text-amber-800">
                        These templates are for guidance only. Consult with qualified tax and legal professionals 
                        before filing any international compliance documents. Requirements vary by jurisdiction 
                        and individual circumstances.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expansion Plan Tab */}
          <TabsContent value="expansion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Foreign Market Expansion Planning
                </CardTitle>
                <CardDescription>
                  A structured approach to expanding your business internationally
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {expansionPhases.map((phase, index) => (
                    <div key={phase.phase} className="relative">
                      {index < expansionPhases.length - 1 && (
                        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-border" />
                      )}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                          {phase.phase}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{phase.name}</h3>
                            <Badge variant="outline">{phase.duration}</Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-2">
                            {phase.tasks.map((task, taskIndex) => (
                              <div
                                key={taskIndex}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                              >
                                <ChevronRight className="w-4 h-4 text-primary" />
                                {task}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Resources & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <a
                    href="https://www.trade.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <Briefcase className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <h4 className="font-semibold">US Trade.gov</h4>
                      <p className="text-sm text-muted-foreground">Official US export assistance</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                  <a
                    href="https://www.sba.gov/business-guide/grow-your-business/export-products"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <Scale className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <h4 className="font-semibold">SBA Export Guide</h4>
                      <p className="text-sm text-muted-foreground">Small business export resources</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                  <a
                    href="https://www.export.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <Globe2 className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <h4 className="font-semibold">Export.gov</h4>
                      <p className="text-sm text-muted-foreground">Export market information</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                  <a
                    href="https://www.irs.gov/businesses/international-businesses"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <Landmark className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <h4 className="font-semibold">IRS International</h4>
                      <p className="text-sm text-muted-foreground">International tax guidance</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
