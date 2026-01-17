import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Target,
  Users,
  DollarSign,
  Heart,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Your existing entities
const entities = [
  { id: "real-eye-nation", name: "Real-Eye-Nation LLC", type: "llc" as const, ein: "84-4976416" },
  { id: "calea-trust", name: "Calea Freeman Family Trust", type: "trust" as const, ein: "98-6109577" },
  { id: "luvonpurpose", name: "LuvOnPurpose Autonomous Wealth System LLC", type: "llc" as const, ein: null },
  { id: "laws-collective", name: "The L.A.W.S. Collective, LLC", type: "llc" as const, ein: "39-3122993" },
  { id: "508-academy", name: "LuvOnPurpose Outreach Temple and Academy Society, Inc.", type: "nonprofit_508" as const, ein: null },
];

type EntityType = "llc" | "corporation" | "trust" | "nonprofit_508" | "nonprofit_501c3" | "collective" | "sole_proprietorship";

interface ExtractedData {
  missionStatement?: string | null;
  visionStatement?: string | null;
  organizationDescription?: string | null;
  yearFounded?: number | null;
  productsServices?: string | null;
  uniqueValueProposition?: string | null;
  targetMarket?: string | null;
  marketSize?: string | null;
  competitiveAdvantage?: string | null;
  teamSize?: number | null;
  teamDescription?: string | null;
  startupCosts?: string | null;
  monthlyOperatingCosts?: string | null;
  projectedRevenueYear1?: string | null;
  projectedRevenueYear2?: string | null;
  projectedRevenueYear3?: string | null;
  fundingNeeded?: string | null;
  fundingPurpose?: string | null;
  socialImpact?: string | null;
  communityBenefit?: string | null;
}

export default function BusinessPlanUpload() {
  const [selectedEntity, setSelectedEntity] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseComplete, setParseComplete] = useState(false);

  const parseMutation = trpc.businessPlanParser.parseDocument.useMutation({
    onSuccess: (data) => {
      setExtractedData(data.extractedData);
      setParseComplete(true);
      toast.success(data.updated ? "Business plan updated!" : "Business plan created!");
    },
    onError: (error) => {
      toast.error("Failed to parse document: " + error.message);
    },
  });

  const selectedEntityData = entities.find(e => e.id === selectedEntity);

  const handleParse = async () => {
    if (!selectedEntity || !documentContent.trim()) {
      toast.error("Please select an entity and paste your business plan content");
      return;
    }

    setIsParsing(true);
    try {
      await parseMutation.mutateAsync({
        documentContent,
        entityName: selectedEntityData?.name || "",
        entityType: (selectedEntityData?.type || "llc") as EntityType,
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setDocumentContent(content);
      toast.success("File loaded! Click 'Parse with AI' to extract data.");
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Business Plan</h1>
          <p className="text-muted-foreground mt-1">
            Upload or paste your business plan and AI will extract key information for grant applications
          </p>
        </div>

        {/* Instructions */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">How it works</p>
                <ol className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-decimal list-inside">
                  <li>Select which entity this business plan is for</li>
                  <li>Upload a text file or paste your business plan content</li>
                  <li>Click "Parse with AI" to extract key information</li>
                  <li>Review the extracted data and it will auto-populate in Grant Simulator</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Select Entity
                </CardTitle>
                <CardDescription>Choose which business this plan is for</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an entity..." />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        <div className="flex items-center gap-2">
                          <span>{entity.name}</span>
                          {entity.ein && (
                            <Badge variant="outline" className="text-xs">EIN: {entity.ein}</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Business Plan Content
                </CardTitle>
                <CardDescription>Upload a file or paste your business plan text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file-upload" className="block mb-2">Upload File (TXT, MD)</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt,.md,.text"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste content</span>
                  </div>
                </div>
                <Textarea
                  placeholder="Paste your business plan content here...

Include sections like:
- Mission Statement
- Vision Statement
- Products/Services
- Target Market
- Financial Projections
- Funding Needs
- Team Description"
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {documentContent.length.toLocaleString()} characters
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={handleParse}
              disabled={!selectedEntity || !documentContent.trim() || isParsing}
              className="w-full gap-2"
              size="lg"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Parsing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Parse with AI
                </>
              )}
            </Button>
          </div>

          {/* Extracted Data Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {parseComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Target className="w-5 h-5" />
                  )}
                  Extracted Data
                </CardTitle>
                <CardDescription>
                  {parseComplete 
                    ? "Data extracted and saved! This will auto-populate in Grant Simulator."
                    : "Extracted information will appear here after parsing"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!extractedData ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No data extracted yet</p>
                    <p className="text-sm mt-1">Upload and parse a business plan to see results</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Mission & Vision */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        Mission Statement
                      </Label>
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        {extractedData.missionStatement || <span className="text-muted-foreground italic">Not found</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Vision Statement</Label>
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        {extractedData.visionStatement || <span className="text-muted-foreground italic">Not found</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Organization Description</Label>
                      <div className="p-3 bg-muted rounded-lg text-sm max-h-32 overflow-y-auto">
                        {extractedData.organizationDescription || <span className="text-muted-foreground italic">Not found</span>}
                      </div>
                    </div>

                    {/* Products & Market */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Year Founded
                        </Label>
                        <div className="p-3 bg-muted rounded-lg text-sm">
                          {extractedData.yearFounded || <span className="text-muted-foreground italic">Not found</span>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Team Size
                        </Label>
                        <div className="p-3 bg-muted rounded-lg text-sm">
                          {extractedData.teamSize || <span className="text-muted-foreground italic">Not found</span>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Products/Services</Label>
                      <div className="p-3 bg-muted rounded-lg text-sm max-h-24 overflow-y-auto">
                        {extractedData.productsServices || <span className="text-muted-foreground italic">Not found</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Market</Label>
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        {extractedData.targetMarket || <span className="text-muted-foreground italic">Not found</span>}
                      </div>
                    </div>

                    {/* Financials */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        Funding Needed
                      </Label>
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        {extractedData.fundingNeeded || <span className="text-muted-foreground italic">Not found</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Funding Purpose</Label>
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        {extractedData.fundingPurpose || <span className="text-muted-foreground italic">Not found</span>}
                      </div>
                    </div>

                    {/* Social Impact */}
                    {(extractedData.socialImpact || extractedData.communityBenefit) && (
                      <>
                        <div className="space-y-2">
                          <Label>Social Impact</Label>
                          <div className="p-3 bg-muted rounded-lg text-sm">
                            {extractedData.socialImpact || <span className="text-muted-foreground italic">Not found</span>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Community Benefit</Label>
                          <div className="p-3 bg-muted rounded-lg text-sm">
                            {extractedData.communityBenefit || <span className="text-muted-foreground italic">Not found</span>}
                          </div>
                        </div>
                      </>
                    )}

                    {parseComplete && (
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium">Data saved successfully!</span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          This data will automatically populate when you use the Grant Simulator for {selectedEntityData?.name}.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
