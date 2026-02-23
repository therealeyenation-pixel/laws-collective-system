import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Search,
  Shield,
  Building2,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Stamp,
} from "lucide-react";
import { toast } from "sonner";

interface DBATrademarkCourseProps {
  onComplete: (data: any, tokens: number) => void;
  onClose: () => void;
  connectedEntity?: { name: string; type: string };
}

interface CourseData {
  // Module 1: DBA Basics
  needsDBA: boolean;
  dbaReason: string;
  businessState: string;
  
  // Module 2: Name Search
  proposedDBAName: string;
  nameSearchResults: {
    stateAvailable: boolean;
    domainAvailable: boolean;
    socialAvailable: boolean;
    conflicts: string[];
  } | null;
  
  // Module 3: DBA Filing
  dbaFilingType: string;
  countyName: string;
  filingFee: string;
  publicationRequired: boolean;
  
  // Module 4: Trademark Fundamentals
  trademarkType: string;
  goodsServicesClass: string;
  goodsServicesDescription: string;
  
  // Module 5: Trademark Search
  trademarkSearchResults: {
    exactMatch: boolean;
    similarMarks: string[];
    riskLevel: string;
  } | null;
  
  // Module 6: Trademark Application
  applicationType: string;
  specimenType: string;
  specimenDescription: string;
  firstUseDate: string;
  firstCommerceDate: string;
}

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

const TRADEMARK_CLASSES = [
  { value: "025", label: "Class 25 - Clothing" },
  { value: "035", label: "Class 35 - Advertising & Business Services" },
  { value: "041", label: "Class 41 - Education & Entertainment" },
  { value: "042", label: "Class 42 - Computer & Scientific Services" },
  { value: "009", label: "Class 9 - Software & Electronics" },
  { value: "036", label: "Class 36 - Financial Services" },
  { value: "044", label: "Class 44 - Medical & Health Services" },
  { value: "043", label: "Class 43 - Food & Hospitality Services" },
];

export default function DBATrademarkCourse({ onComplete, onClose, connectedEntity }: DBATrademarkCourseProps) {
  const [currentModule, setCurrentModule] = useState(1);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [data, setData] = useState<CourseData>({
    needsDBA: false,
    dbaReason: "",
    businessState: "",
    proposedDBAName: connectedEntity?.name || "",
    nameSearchResults: null,
    dbaFilingType: "",
    countyName: "",
    filingFee: "",
    publicationRequired: false,
    trademarkType: "",
    goodsServicesClass: "",
    goodsServicesDescription: "",
    trademarkSearchResults: null,
    applicationType: "",
    specimenType: "",
    specimenDescription: "",
    firstUseDate: "",
    firstCommerceDate: "",
  });

  const totalModules = 6;
  const progress = (completedModules.length / totalModules) * 100;

  const completeModule = () => {
    if (!completedModules.includes(currentModule)) {
      setCompletedModules([...completedModules, currentModule]);
    }
    if (currentModule < totalModules) {
      setCurrentModule(currentModule + 1);
    }
  };

  const simulateNameSearch = () => {
    // Simulate name availability search
    const conflicts: string[] = [];
    const random = Math.random();
    
    if (random < 0.3) {
      conflicts.push(`${data.proposedDBAName} LLC (Active in ${data.businessState})`);
    }
    
    setData({
      ...data,
      nameSearchResults: {
        stateAvailable: conflicts.length === 0,
        domainAvailable: Math.random() > 0.4,
        socialAvailable: Math.random() > 0.3,
        conflicts,
      },
    });
    toast.success("Name search complete");
  };

  const simulateTrademarkSearch = () => {
    // Simulate USPTO trademark search
    const random = Math.random();
    const similarMarks: string[] = [];
    let riskLevel = "Low";
    
    if (random < 0.2) {
      riskLevel = "High";
      similarMarks.push(`${data.proposedDBAName} (Reg. #1234567)`);
    } else if (random < 0.5) {
      riskLevel = "Medium";
      similarMarks.push(`${data.proposedDBAName.split(" ")[0]} Industries (Reg. #7654321)`);
    }
    
    setData({
      ...data,
      trademarkSearchResults: {
        exactMatch: random < 0.1,
        similarMarks,
        riskLevel,
      },
    });
    toast.success("Trademark search complete");
  };

  const calculateTokens = () => {
    let tokens = 50; // Base tokens
    if (data.nameSearchResults) tokens += 20;
    if (data.trademarkSearchResults) tokens += 30;
    if (data.dbaFilingType) tokens += 25;
    if (data.applicationType) tokens += 25;
    return tokens;
  };

  const handleComplete = () => {
    const tokens = calculateTokens();
    onComplete(data, tokens);
  };

  const renderModule = () => {
    switch (currentModule) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">What is a DBA?</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                A DBA ("Doing Business As") is a registered trade name that allows your business to operate 
                under a name different from its legal name. Also called a "fictitious business name" or "assumed name."
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Do you need a DBA?</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  You typically need a DBA if your business name differs from your legal entity name.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`p-4 cursor-pointer transition-all ${data.needsDBA ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-muted/50'}`}
                    onClick={() => setData({ ...data, needsDBA: true })}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 ${data.needsDBA ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium">Yes, I need a DBA</p>
                        <p className="text-xs text-muted-foreground">Operating under a different name</p>
                      </div>
                    </div>
                  </Card>
                  <Card 
                    className={`p-4 cursor-pointer transition-all ${!data.needsDBA && data.dbaReason === "no" ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-muted/50'}`}
                    onClick={() => setData({ ...data, needsDBA: false, dbaReason: "no" })}
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className={`w-5 h-5 ${!data.needsDBA && data.dbaReason === "no" ? 'text-blue-600' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium">No, using legal name</p>
                        <p className="text-xs text-muted-foreground">Business name matches entity</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div>
                <Label>Business State</Label>
                <Select value={data.businessState} onValueChange={(v) => setData({ ...data, businessState: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {data.needsDBA && (
                <div>
                  <Label>Why do you need a DBA?</Label>
                  <Textarea
                    value={data.dbaReason}
                    onChange={(e) => setData({ ...data, dbaReason: e.target.value })}
                    placeholder="e.g., Operating a retail brand under a different name than my LLC..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Name Availability Search</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Before filing a DBA, you must ensure the name is available in your state and doesn't conflict 
                with existing businesses or trademarks.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Proposed DBA Name</Label>
                <Input
                  value={data.proposedDBAName}
                  onChange={(e) => setData({ ...data, proposedDBAName: e.target.value })}
                  placeholder="Enter your desired business name"
                />
              </div>

              <Button 
                onClick={simulateNameSearch} 
                disabled={!data.proposedDBAName || !data.businessState}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Name Availability
              </Button>

              {data.nameSearchResults && (
                <div className="space-y-4 mt-4">
                  <h4 className="font-semibold">Search Results</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Card className={`p-4 ${data.nameSearchResults.stateAvailable ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {data.nameSearchResults.stateAvailable ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium">State Registry</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {data.nameSearchResults.stateAvailable ? "Available" : "Conflict found"}
                      </p>
                    </Card>

                    <Card className={`p-4 ${data.nameSearchResults.domainAvailable ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className={`w-5 h-5 ${data.nameSearchResults.domainAvailable ? 'text-green-600' : 'text-amber-600'}`} />
                        <span className="font-medium">Domain (.com)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {data.nameSearchResults.domainAvailable ? "Available" : "Taken"}
                      </p>
                    </Card>

                    <Card className={`p-4 ${data.nameSearchResults.socialAvailable ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {data.nameSearchResults.socialAvailable ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        )}
                        <span className="font-medium">Social Media</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {data.nameSearchResults.socialAvailable ? "Available" : "Partially taken"}
                      </p>
                    </Card>
                  </div>

                  {data.nameSearchResults.conflicts.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2">Conflicts Found</h5>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                        {data.nameSearchResults.conflicts.map((conflict, i) => (
                          <li key={i}>• {conflict}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">DBA Filing Requirements</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                DBA requirements vary by state. Some states require county filing, others require state-level 
                registration, and some require newspaper publication.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Filing Type for {data.businessState || "Your State"}</Label>
                <Select value={data.dbaFilingType} onValueChange={(v) => setData({ ...data, dbaFilingType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select filing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="county">County Clerk Filing</SelectItem>
                    <SelectItem value="state">State Secretary of State</SelectItem>
                    <SelectItem value="both">Both County and State</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data.dbaFilingType === "county" || data.dbaFilingType === "both" ? (
                <div>
                  <Label>County Name</Label>
                  <Input
                    value={data.countyName}
                    onChange={(e) => setData({ ...data, countyName: e.target.value })}
                    placeholder="Enter your county"
                  />
                </div>
              ) : null}

              <div>
                <Label>Estimated Filing Fee</Label>
                <Select value={data.filingFee} onValueChange={(v) => setData({ ...data, filingFee: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25-50">$25 - $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="100-150">$100 - $150</SelectItem>
                    <SelectItem value="150+">$150+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="publication"
                  checked={data.publicationRequired}
                  onChange={(e) => setData({ ...data, publicationRequired: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="publication" className="cursor-pointer">
                  Newspaper publication required in my state
                </Label>
              </div>

              {data.dbaFilingType && (
                <Card className="p-4 bg-muted/50">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Generated DBA Filing Checklist
                  </h5>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Complete DBA application form
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Pay filing fee (${data.filingFee || "TBD"})
                    </li>
                    {data.publicationRequired && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Publish in local newspaper (4 weeks)
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Receive DBA certificate
                    </li>
                  </ul>
                </Card>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Trademark Fundamentals</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                A trademark protects your brand name, logo, or slogan. Federal registration provides 
                nationwide protection and the exclusive right to use ®.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-4 text-center">
                <Stamp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <h5 className="font-semibold">™</h5>
                <p className="text-xs text-muted-foreground">Common law trademark (no registration)</p>
              </Card>
              <Card className="p-4 text-center bg-emerald-50 dark:bg-emerald-900/20">
                <Shield className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <h5 className="font-semibold">®</h5>
                <p className="text-xs text-muted-foreground">Federally registered trademark</p>
              </Card>
              <Card className="p-4 text-center">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <h5 className="font-semibold">SM</h5>
                <p className="text-xs text-muted-foreground">Service mark (for services)</p>
              </Card>
            </div>

            <div className="space-y-4">
              <div>
                <Label>What are you trademarking?</Label>
                <Select value={data.trademarkType} onValueChange={(v) => setData({ ...data, trademarkType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trademark type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wordmark">Word Mark (name only)</SelectItem>
                    <SelectItem value="logo">Design Mark (logo)</SelectItem>
                    <SelectItem value="combined">Combined (name + logo)</SelectItem>
                    <SelectItem value="slogan">Slogan/Tagline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>International Class</Label>
                <Select value={data.goodsServicesClass} onValueChange={(v) => setData({ ...data, goodsServicesClass: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class of goods/services" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADEMARK_CLASSES.map((cls) => (
                      <SelectItem key={cls.value} value={cls.value}>{cls.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description of Goods/Services</Label>
                <Textarea
                  value={data.goodsServicesDescription}
                  onChange={(e) => setData({ ...data, goodsServicesDescription: e.target.value })}
                  placeholder="Describe the specific goods or services associated with your trademark..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">USPTO Trademark Search</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Before filing, search the USPTO database (TESS) to identify potential conflicts with 
                existing registered trademarks.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm mb-2"><strong>Searching for:</strong> {data.proposedDBAName || "Your trademark"}</p>
                <p className="text-sm"><strong>Class:</strong> {TRADEMARK_CLASSES.find(c => c.value === data.goodsServicesClass)?.label || "Not selected"}</p>
              </div>

              <Button 
                onClick={simulateTrademarkSearch} 
                disabled={!data.proposedDBAName}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                Search USPTO Database
              </Button>

              {data.trademarkSearchResults && (
                <div className="space-y-4 mt-4">
                  <div className={`p-4 rounded-lg border ${
                    data.trademarkSearchResults.riskLevel === "Low" 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : data.trademarkSearchResults.riskLevel === "Medium"
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {data.trademarkSearchResults.riskLevel === "Low" ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : data.trademarkSearchResults.riskLevel === "Medium" ? (
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <div>
                        <h5 className="font-semibold">Risk Level: {data.trademarkSearchResults.riskLevel}</h5>
                        <p className="text-sm text-muted-foreground">
                          {data.trademarkSearchResults.exactMatch 
                            ? "Exact match found - registration unlikely"
                            : data.trademarkSearchResults.similarMarks.length > 0
                            ? "Similar marks found - proceed with caution"
                            : "No significant conflicts found"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {data.trademarkSearchResults.similarMarks.length > 0 && (
                    <div>
                      <h5 className="font-semibold mb-2">Similar Marks Found:</h5>
                      <ul className="text-sm space-y-1">
                        {data.trademarkSearchResults.similarMarks.map((mark, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            {mark}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Trademark Application</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                File your trademark application with the USPTO. Choose between Intent-to-Use (if not yet 
                using the mark) or Use-in-Commerce (if already using).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Application Type</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Card 
                    className={`p-4 cursor-pointer transition-all ${data.applicationType === "intent" ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-muted/50'}`}
                    onClick={() => setData({ ...data, applicationType: "intent" })}
                  >
                    <h5 className="font-semibold mb-1">Intent-to-Use (1b)</h5>
                    <p className="text-xs text-muted-foreground">
                      Planning to use the mark but haven't started yet
                    </p>
                  </Card>
                  <Card 
                    className={`p-4 cursor-pointer transition-all ${data.applicationType === "use" ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-muted/50'}`}
                    onClick={() => setData({ ...data, applicationType: "use" })}
                  >
                    <h5 className="font-semibold mb-1">Use-in-Commerce (1a)</h5>
                    <p className="text-xs text-muted-foreground">
                      Already using the mark in interstate commerce
                    </p>
                  </Card>
                </div>
              </div>

              {data.applicationType === "use" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date of First Use Anywhere</Label>
                      <Input
                        type="date"
                        value={data.firstUseDate}
                        onChange={(e) => setData({ ...data, firstUseDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Date of First Use in Commerce</Label>
                      <Input
                        type="date"
                        value={data.firstCommerceDate}
                        onChange={(e) => setData({ ...data, firstCommerceDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Specimen Type</Label>
                    <Select value={data.specimenType} onValueChange={(v) => setData({ ...data, specimenType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specimen type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product Photo/Packaging</SelectItem>
                        <SelectItem value="website">Website Screenshot</SelectItem>
                        <SelectItem value="advertising">Advertising Material</SelectItem>
                        <SelectItem value="signage">Business Signage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Specimen Description</Label>
                    <Textarea
                      value={data.specimenDescription}
                      onChange={(e) => setData({ ...data, specimenDescription: e.target.value })}
                      placeholder="Describe how the mark appears on your specimen..."
                      rows={2}
                    />
                  </div>
                </>
              )}

              {data.applicationType && (
                <Card className="p-4 bg-muted/50">
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Application Summary
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Mark:</p>
                      <p className="font-medium">{data.proposedDBAName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type:</p>
                      <p className="font-medium">{data.trademarkType === "wordmark" ? "Word Mark" : data.trademarkType === "logo" ? "Design Mark" : data.trademarkType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Class:</p>
                      <p className="font-medium">{TRADEMARK_CLASSES.find(c => c.value === data.goodsServicesClass)?.label || "Not selected"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Filing Basis:</p>
                      <p className="font-medium">{data.applicationType === "intent" ? "Intent-to-Use (1b)" : "Use-in-Commerce (1a)"}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm"><strong>Estimated Filing Fee:</strong> $250 - $350 per class (TEAS Plus/Standard)</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const moduleNames = [
    "DBA Basics",
    "Name Search",
    "DBA Filing",
    "Trademark Fundamentals",
    "Trademark Search",
    "Trademark Application",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Stamp className="w-6 h-6 text-emerald-600" />
                DBA & Trademark Workshop
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Module {currentModule}: {moduleNames[currentModule - 1]}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {moduleNames.map((name, i) => (
              <Badge
                key={i}
                variant={currentModule === i + 1 ? "default" : completedModules.includes(i + 1) ? "secondary" : "outline"}
                className={`cursor-pointer whitespace-nowrap ${
                  completedModules.includes(i + 1) ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200" : ""
                }`}
                onClick={() => setCurrentModule(i + 1)}
              >
                {completedModules.includes(i + 1) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {i + 1}. {name}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto py-6">
          {renderModule()}
        </CardContent>

        <div className="border-t p-4 flex justify-between flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => setCurrentModule(Math.max(1, currentModule - 1))}
            disabled={currentModule === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentModule === totalModules && completedModules.length >= totalModules - 1 ? (
              <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="w-4 h-4 mr-2" />
                Complete & Generate Documents
              </Button>
            ) : (
              <Button onClick={completeModule}>
                {completedModules.includes(currentModule) ? "Next" : "Complete & Continue"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
