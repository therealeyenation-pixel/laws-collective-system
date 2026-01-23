import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, Download, ExternalLink, CheckCircle, Clock, 
  AlertCircle, DollarSign, Calendar, Building2, Shield,
  Upload, Image, FileCheck, Folder
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TrademarkApplication {
  id: string;
  name: string;
  owner: string;
  state: string;
  classes: { code: string; name: string; fee: number }[];
  status: "draft" | "ready" | "filed" | "pending" | "registered";
  documentPath: string;
  specimens: { classCode: string; uploaded: boolean; file?: string }[];
  filingDate?: string;
  serialNumber?: string;
}

const trademarkApplications: TrademarkApplication[] = [
  {
    id: "laws-collective",
    name: "L.A.W.S. COLLECTIVE",
    owner: "LuvOnPurpose Autonomous Wealth System, LLC",
    state: "Delaware",
    classes: [
      { code: "035", name: "Advertising and Business", fee: 250 },
      { code: "041", name: "Education and Entertainment", fee: 250 },
      { code: "045", name: "Legal and Security", fee: 250 },
    ],
    status: "ready",
    documentPath: "/documents/trademark-laws-collective.md",
    specimens: [
      { classCode: "035", uploaded: false },
      { classCode: "041", uploaded: false },
      { classCode: "045", uploaded: false },
    ],
  },
  {
    id: "luvonpurpose",
    name: "LUVONPURPOSE",
    owner: "LuvOnPurpose Autonomous Wealth System, LLC",
    state: "Delaware",
    classes: [
      { code: "035", name: "Advertising and Business", fee: 250 },
      { code: "036", name: "Insurance and Financial", fee: 250 },
      { code: "041", name: "Education and Entertainment", fee: 250 },
      { code: "042", name: "Science and Technology", fee: 250 },
    ],
    status: "ready",
    documentPath: "/documents/trademark-luvonpurpose.md",
    specimens: [
      { classCode: "035", uploaded: false },
      { classCode: "036", uploaded: false },
      { classCode: "041", uploaded: false },
      { classCode: "042", uploaded: false },
    ],
  },
  {
    id: "real-eye-nation",
    name: "REAL-EYE-NATION",
    owner: "LuvOnPurpose Autonomous Wealth System, LLC",
    state: "Delaware",
    classes: [
      { code: "035", name: "Advertising and Business", fee: 250 },
      { code: "036", name: "Insurance and Financial", fee: 250 },
      { code: "041", name: "Education and Entertainment", fee: 250 },
      { code: "045", name: "Legal and Security", fee: 250 },
    ],
    status: "ready",
    documentPath: "/documents/trademark-real-eye-nation.md",
    specimens: [
      { classCode: "035", uploaded: false },
      { classCode: "036", uploaded: false },
      { classCode: "041", uploaded: false },
      { classCode: "045", uploaded: false },
    ],
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-700", icon: <FileText className="w-3 h-3" /> },
  ready: { label: "Ready to File", color: "bg-blue-100 text-blue-700", icon: <FileCheck className="w-3 h-3" /> },
  filed: { label: "Filed", color: "bg-purple-100 text-purple-700", icon: <Clock className="w-3 h-3" /> },
  pending: { label: "Pending Review", color: "bg-amber-100 text-amber-700", icon: <AlertCircle className="w-3 h-3" /> },
  registered: { label: "Registered", color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
};

export default function TrademarkDocuments() {
  const [selectedApp, setSelectedApp] = useState<TrademarkApplication | null>(null);

  const totalFees = trademarkApplications.reduce(
    (sum, app) => sum + app.classes.reduce((s, c) => s + c.fee, 0),
    0
  );

  const handleDownloadDocument = (path: string, name: string) => {
    window.open(path, "_blank");
    toast.success(`Opening ${name} filing guide`);
  };

  const handleDownloadChecklist = () => {
    window.open("/documents/trademark-filing-checklist.md", "_blank");
    toast.success("Opening master filing checklist");
  };

  const handleUploadSpecimen = (appId: string, classCode: string) => {
    toast.info("Specimen upload feature coming soon");
  };

  const getSpecimenProgress = (app: TrademarkApplication) => {
    const uploaded = app.specimens.filter(s => s.uploaded).length;
    return (uploaded / app.specimens.length) * 100;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Trademark Documents</h1>
            <p className="text-muted-foreground">
              USPTO trademark filing guides and specimen management
            </p>
          </div>
          <Button onClick={handleDownloadChecklist}>
            <Download className="w-4 h-4 mr-2" />
            Master Checklist
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trademarkApplications.length}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${totalFees.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Filing Fees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Folder className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {trademarkApplications.reduce((sum, app) => sum + app.classes.length, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Image className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {trademarkApplications.reduce((sum, app) => sum + app.specimens.filter(s => s.uploaded).length, 0)}/
                    {trademarkApplications.reduce((sum, app) => sum + app.specimens.length, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Specimens Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications */}
        <Tabs defaultValue="applications" className="w-full">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="specimens">Specimen Collection</TabsTrigger>
            <TabsTrigger value="timeline">Filing Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4 mt-4">
            {trademarkApplications.map((app) => (
              <Card key={app.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        {app.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <span className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {app.owner} ({app.state})
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className={statusConfig[app.status].color}>
                      {statusConfig[app.status].icon}
                      <span className="ml-1">{statusConfig[app.status].label}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Classes */}
                  <div>
                    <p className="text-sm font-medium mb-2">Trademark Classes</p>
                    <div className="flex flex-wrap gap-2">
                      {app.classes.map((cls) => (
                        <Badge key={cls.code} variant="outline" className="py-1">
                          Class {cls.code}: {cls.name} (${cls.fee})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Specimen Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Specimen Collection</span>
                      <span className="font-medium">
                        {app.specimens.filter(s => s.uploaded).length}/{app.specimens.length}
                      </span>
                    </div>
                    <Progress value={getSpecimenProgress(app)} className="h-2" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDocument(app.documentPath, app.name)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Filing Guide
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApp(app)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Manage Specimens
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("https://www.uspto.gov/trademarks/apply", "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      USPTO TEAS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="specimens" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Specimen Requirements</CardTitle>
                <CardDescription>
                  Upload specimens showing each mark in actual use with goods/services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Specimen Guidelines
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• JPG format, maximum 5MB per file</li>
                    <li>• Mark must be clearly visible</li>
                    <li>• Must show mark in actual use with goods/services</li>
                    <li>• Cannot be digitally altered or mockups</li>
                    <li>• Website screenshots should show full URL</li>
                  </ul>
                </div>

                {trademarkApplications.map((app) => (
                  <div key={app.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{app.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {app.specimens.map((specimen) => {
                        const classInfo = app.classes.find(c => c.code === specimen.classCode);
                        return (
                          <div
                            key={specimen.classCode}
                            className={`border rounded-lg p-3 ${
                              specimen.uploaded
                                ? "bg-green-50 border-green-200"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">
                                  Class {specimen.classCode}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {classInfo?.name}
                                </p>
                              </div>
                              {specimen.uploaded ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUploadSpecimen(app.id, specimen.classCode)}
                                >
                                  <Upload className="w-4 h-4 mr-1" />
                                  Upload
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Filing Timeline
                </CardTitle>
                <CardDescription>
                  Recommended filing schedule and important deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Timeline */}
                  <div className="relative">
                    {[
                      { phase: "Pre-Filing", duration: "1-2 weeks", tasks: ["Complete trademark search", "Gather specimens", "Review filing guides"], status: "current" },
                      { phase: "Filing", duration: "1 day", tasks: ["Submit TEAS Plus applications", "Pay filing fees ($2,750 total)"], status: "upcoming" },
                      { phase: "Examination", duration: "3-6 months", tasks: ["USPTO assigns examining attorney", "Respond to any Office Actions"], status: "upcoming" },
                      { phase: "Publication", duration: "30 days", tasks: ["Mark published in Official Gazette", "Opposition period"], status: "upcoming" },
                      { phase: "Registration", duration: "2-3 months", tasks: ["Registration certificate issued", "Begin using ® symbol"], status: "upcoming" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.status === "current" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {idx + 1}
                          </div>
                          {idx < 4 && <div className="w-0.5 h-full bg-muted mt-2" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{item.phase}</h4>
                            <Badge variant="outline">{item.duration}</Badge>
                            {item.status === "current" && (
                              <Badge className="bg-primary">Current</Badge>
                            )}
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {item.tasks.map((task, i) => (
                              <li key={i}>• {task}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Post-Registration Maintenance */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Post-Registration Maintenance
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">
                          Section 8 Declaration
                        </p>
                        <p className="text-blue-600 dark:text-blue-400">
                          Due between years 5-6 after registration
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">
                          Section 9 Renewal
                        </p>
                        <p className="text-blue-600 dark:text-blue-400">
                          Due every 10 years after registration
                        </p>
                      </div>
                    </div>
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
