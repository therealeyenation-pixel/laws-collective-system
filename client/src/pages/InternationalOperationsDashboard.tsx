import { useState, useMemo } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Globe2, 
  Building2, 
  FileText, 
  Calendar,
  Search,
  MapPin,
  Scale,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  Download,
  Filter
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function InternationalOperationsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");

  // Fetch data from international operations router
  const { data: entityTypes } = trpc.internationalOperations.getEntityTypes.useQuery();
  const { data: jurisdictions } = trpc.internationalOperations.getJurisdictions.useQuery();
  const { data: taxTreaties } = trpc.internationalOperations.getTaxTreaties.useQuery();
  const { data: complianceCalendar } = trpc.internationalOperations.getComplianceCalendar.useQuery({
    year: new Date().getFullYear(),
  });
  const { data: documentTemplates } = trpc.internationalDocumentTemplates.getTemplates.useQuery();

  // Filter entity types based on search and region
  const filteredEntityTypes = useMemo(() => {
    if (!entityTypes) return [];
    return entityTypes.filter((entity: any) => {
      const matchesSearch = searchTerm === "" || 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === "all" || entity.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [entityTypes, searchTerm, selectedRegion]);

  // Filter jurisdictions
  const filteredJurisdictions = useMemo(() => {
    if (!jurisdictions) return [];
    return jurisdictions.filter((j: any) => {
      const matchesSearch = searchTerm === "" ||
        j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === "all" || j.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [jurisdictions, searchTerm, selectedRegion]);

  // Get unique regions for filter
  const regions = useMemo(() => {
    if (!jurisdictions) return [];
    const regionSet = new Set(jurisdictions.map((j: any) => j.region));
    return Array.from(regionSet).sort();
  }, [jurisdictions]);

  // Upcoming deadlines from compliance calendar
  const upcomingDeadlines = useMemo(() => {
    if (!complianceCalendar) return [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return complianceCalendar
      .filter((item: any) => {
        const deadline = new Date(item.deadline);
        return deadline >= now && deadline <= thirtyDaysFromNow;
      })
      .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [complianceCalendar]);

  const getRegionColor = (region: string) => {
    const colors: Record<string, string> = {
      "North America": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Europe": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Asia Pacific": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Caribbean": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      "Offshore": "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
    };
    return colors[region] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const getDeadlineUrgency = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 7) return "text-red-600 dark:text-red-400";
    if (days <= 14) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Globe2 className="w-8 h-8 text-primary" />
              International Operations
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage global entities, tax treaties, and compliance requirements
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info("Export feature coming soon")}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{entityTypes?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Entity Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jurisdictions?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Jurisdictions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{taxTreaties?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Tax Treaties</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{documentTemplates?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Document Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines Alert */}
        {upcomingDeadlines.length > 0 && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Upcoming Compliance Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingDeadlines.map((deadline: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-background rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className={`w-4 h-4 ${getDeadlineUrgency(deadline.deadline)}`} />
                      <div>
                        <p className="font-medium text-sm">{deadline.name}</p>
                        <p className="text-xs text-muted-foreground">{deadline.jurisdiction}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getDeadlineUrgency(deadline.deadline)}`}>
                        {new Date(deadline.deadline).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.ceil((new Date(deadline.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entities, jurisdictions, or documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region: string) => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="entities" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="entities">Entity Types</TabsTrigger>
            <TabsTrigger value="jurisdictions">Jurisdictions</TabsTrigger>
            <TabsTrigger value="treaties">Tax Treaties</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Entity Types Tab */}
          <TabsContent value="entities" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntityTypes.map((entity: any) => (
                <Card key={entity.code} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{entity.name}</CardTitle>
                        <CardDescription>{entity.jurisdiction}</CardDescription>
                      </div>
                      <Badge className={getRegionColor(entity.region)}>{entity.region}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{entity.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Min Capital</p>
                          <p className="font-medium">{entity.minimumCapital || "None"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Corp Tax</p>
                          <p className="font-medium">{entity.corporateTaxRate || "Varies"}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {entity.features?.slice(0, 3).map((feature: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                        ))}
                        {entity.features?.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{entity.features.length - 3}</Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="w-full mt-2">
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredEntityTypes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No entity types found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          {/* Jurisdictions Tab */}
          <TabsContent value="jurisdictions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJurisdictions.map((jurisdiction: any) => (
                <Card key={jurisdiction.code} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-2xl">{jurisdiction.flag}</span>
                          {jurisdiction.name}
                        </CardTitle>
                        <CardDescription>{jurisdiction.code}</CardDescription>
                      </div>
                      <Badge className={getRegionColor(jurisdiction.region)}>{jurisdiction.region}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Currency</p>
                          <p className="font-medium">{jurisdiction.currency}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Corporate Tax</p>
                          <p className="font-medium">{jurisdiction.corporateTaxRate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">VAT/GST</p>
                          <p className="font-medium">{jurisdiction.vatRate || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Withholding Tax</p>
                          <p className="font-medium">{jurisdiction.withholdingTaxRate || "Varies"}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Key Features</p>
                        <div className="flex flex-wrap gap-1">
                          {jurisdiction.features?.map((feature: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredJurisdictions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No jurisdictions found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          {/* Tax Treaties Tab */}
          <TabsContent value="treaties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tax Treaty Network</CardTitle>
                <CardDescription>
                  Double taxation agreements and withholding rate reductions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Treaty Partners</th>
                        <th className="text-left py-3 px-4">Dividends</th>
                        <th className="text-left py-3 px-4">Interest</th>
                        <th className="text-left py-3 px-4">Royalties</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxTreaties?.map((treaty: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{treaty.country1}</span>
                              <span className="text-muted-foreground">↔</span>
                              <span className="font-medium">{treaty.country2}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{treaty.dividendRate}</td>
                          <td className="py-3 px-4">{treaty.interestRate}</td>
                          <td className="py-3 px-4">{treaty.royaltyRate}</td>
                          <td className="py-3 px-4">
                            <Badge variant={treaty.status === "active" ? "default" : "secondary"}>
                              {treaty.status === "active" ? (
                                <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                              ) : (
                                treaty.status
                              )}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(!taxTreaties || taxTreaties.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tax treaties available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentTemplates?.map((template: any) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <CardDescription>{template.jurisdiction}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Info className="w-4 h-4 mr-1" /> Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-1" /> Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {(!documentTemplates || documentTemplates.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No document templates available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  International Operations Support
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This dashboard provides an overview of international entity structures, tax treaties, 
                  and compliance requirements. For specific guidance on forming entities in foreign 
                  jurisdictions or navigating international tax obligations, consult with qualified 
                  legal and tax professionals in the relevant jurisdictions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
