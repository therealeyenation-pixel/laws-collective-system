import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Globe2, MapPin, FileText, CheckCircle, Clock, AlertCircle,
  Building2, Search, Plus, Download, ExternalLink, Calendar,
  DollarSign, User, Shield, ChevronRight, Info, Plane, Flag,
  Scale, Briefcase, Languages, Landmark
} from "lucide-react";

// International country requirements
const COUNTRIES = [
  {
    code: "JM",
    name: "Jamaica",
    region: "Caribbean",
    currency: "JMD",
    registrationOptions: ["Foreign Company", "Local Subsidiary"],
    requirements: {
      apostille: true,
      localDirector: false,
      localAgent: true,
      minimumCapital: 0,
      processingDays: 14,
      annualFiling: true,
    },
    fees: {
      registration: 15000, // JMD
      annual: 5000,
      registeredAgent: 25000,
    },
    authority: "Companies Office of Jamaica (COJ)",
    website: "https://www.orcjamaica.com",
    notes: "Foreign companies must register within 30 days of commencing business in Jamaica.",
  },
  {
    code: "UK",
    name: "United Kingdom",
    region: "Europe",
    currency: "GBP",
    registrationOptions: ["Overseas Company", "UK Subsidiary"],
    requirements: {
      apostille: true,
      localDirector: false,
      localAgent: true,
      minimumCapital: 0,
      processingDays: 5,
      annualFiling: true,
    },
    fees: {
      registration: 71,
      annual: 13,
      registeredAgent: 150,
    },
    authority: "Companies House",
    website: "https://www.gov.uk/register-as-an-overseas-company",
    notes: "Must file annual accounts and confirmation statement.",
  },
  {
    code: "CA",
    name: "Canada",
    region: "North America",
    currency: "CAD",
    registrationOptions: ["Extra-Provincial Registration", "Canadian Subsidiary"],
    requirements: {
      apostille: false,
      localDirector: true,
      localAgent: true,
      minimumCapital: 0,
      processingDays: 7,
      annualFiling: true,
    },
    fees: {
      registration: 200,
      annual: 40,
      registeredAgent: 500,
    },
    authority: "Provincial Registries",
    website: "https://www.ic.gc.ca/eic/site/cd-dgc.nsf/eng/home",
    notes: "Registration required in each province where business is conducted.",
  },
  {
    code: "MX",
    name: "Mexico",
    region: "North America",
    currency: "MXN",
    registrationOptions: ["Branch Office", "Mexican Subsidiary (S.A. de C.V.)"],
    requirements: {
      apostille: true,
      localDirector: false,
      localAgent: true,
      minimumCapital: 50000,
      processingDays: 30,
      annualFiling: true,
    },
    fees: {
      registration: 5000,
      annual: 2000,
      registeredAgent: 15000,
    },
    authority: "Secretaría de Economía",
    website: "https://www.gob.mx/se",
    notes: "Notarized documents must be translated to Spanish by certified translator.",
  },
  {
    code: "GH",
    name: "Ghana",
    region: "Africa",
    currency: "GHS",
    registrationOptions: ["External Company", "Ghanaian Subsidiary"],
    requirements: {
      apostille: true,
      localDirector: true,
      localAgent: true,
      minimumCapital: 500000, // USD equivalent for foreign companies
      processingDays: 21,
      annualFiling: true,
    },
    fees: {
      registration: 2500,
      annual: 500,
      registeredAgent: 1000,
    },
    authority: "Registrar General's Department",
    website: "https://rgd.gov.gh",
    notes: "Foreign companies in certain sectors require GIPC registration.",
  },
  {
    code: "NG",
    name: "Nigeria",
    region: "Africa",
    currency: "NGN",
    registrationOptions: ["Foreign Company", "Nigerian Subsidiary"],
    requirements: {
      apostille: true,
      localDirector: true,
      localAgent: true,
      minimumCapital: 10000000, // NGN
      processingDays: 14,
      annualFiling: true,
    },
    fees: {
      registration: 50000,
      annual: 20000,
      registeredAgent: 100000,
    },
    authority: "Corporate Affairs Commission (CAC)",
    website: "https://www.cac.gov.ng",
    notes: "Expatriate quota required for foreign employees.",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    region: "Middle East",
    currency: "AED",
    registrationOptions: ["Free Zone Company", "Mainland Company", "Branch Office"],
    requirements: {
      apostille: true,
      localDirector: false,
      localAgent: true,
      minimumCapital: 0,
      processingDays: 7,
      annualFiling: true,
    },
    fees: {
      registration: 15000,
      annual: 10000,
      registeredAgent: 5000,
    },
    authority: "Department of Economic Development / Free Zone Authority",
    website: "https://www.economy.gov.ae",
    notes: "Free zones offer 100% foreign ownership; mainland may require local sponsor.",
  },
  {
    code: "SG",
    name: "Singapore",
    region: "Asia",
    currency: "SGD",
    registrationOptions: ["Branch Office", "Singapore Subsidiary", "Representative Office"],
    requirements: {
      apostille: false,
      localDirector: true,
      localAgent: true,
      minimumCapital: 1,
      processingDays: 1,
      annualFiling: true,
    },
    fees: {
      registration: 315,
      annual: 60,
      registeredAgent: 1000,
    },
    authority: "Accounting and Corporate Regulatory Authority (ACRA)",
    website: "https://www.acra.gov.sg",
    notes: "One of the easiest countries for foreign business registration.",
  },
];

// International registration checklist
const INTL_CHECKLIST = [
  { id: "research", label: "Research country-specific requirements", category: "preparation", required: true },
  { id: "entity-type", label: "Choose registration type (branch vs subsidiary)", category: "preparation", required: true },
  { id: "name-check", label: "Check name availability in target country", category: "preparation", required: true },
  { id: "articles", label: "Certified copy of formation documents", category: "documents", required: true },
  { id: "good-standing", label: "Certificate of Good Standing", category: "documents", required: true },
  { id: "apostille", label: "Apostille/Legalization of documents", category: "documents", required: false },
  { id: "translation", label: "Certified translation (if required)", category: "documents", required: false },
  { id: "resolution", label: "Board resolution authorizing foreign registration", category: "documents", required: true },
  { id: "poa", label: "Power of Attorney for local agent", category: "documents", required: true },
  { id: "local-agent", label: "Appoint local registered agent", category: "agent", required: true },
  { id: "local-director", label: "Appoint local director (if required)", category: "agent", required: false },
  { id: "local-address", label: "Obtain local registered address", category: "agent", required: true },
  { id: "bank-account", label: "Open local bank account", category: "banking", required: false },
  { id: "tax-registration", label: "Register for local taxes", category: "tax", required: true },
  { id: "work-permits", label: "Apply for work permits (if sending employees)", category: "permits", required: false },
  { id: "industry-license", label: "Obtain industry-specific licenses", category: "permits", required: false },
];

interface InternationalRegistration {
  id: string;
  countryCode: string;
  entityName: string;
  registrationType: string;
  status: "planning" | "in_progress" | "completed" | "active" | "dormant";
  startDate?: string;
  completionDate?: string;
  localAgent?: string;
  localDirector?: string;
  checklist: Record<string, boolean>;
  notes?: string;
}

export default function InternationalRegistration() {
  const [activeTab, setActiveTab] = useState("countries");
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  const [selectedCountryDetails, setSelectedCountryDetails] = useState<typeof COUNTRIES[0] | null>(null);
  
  const [registrations, setRegistrations] = useState<InternationalRegistration[]>([
    {
      id: "1",
      countryCode: "JM",
      entityName: "LuvOnPurpose Jamaica Ltd",
      registrationType: "Local Subsidiary",
      status: "planning",
      checklist: {
        "research": true,
        "entity-type": true,
        "name-check": false,
      },
    },
  ]);

  const regions = [...new Set(COUNTRIES.map(c => c.region))];

  const filteredCountries = COUNTRIES.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === "all" || country.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "planning":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Planning</Badge>;
      case "dormant":
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Dormant</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateProgress = (reg: InternationalRegistration) => {
    const total = INTL_CHECKLIST.filter(i => i.required).length;
    const completed = INTL_CHECKLIST.filter(i => i.required && reg.checklist[i.id]).length;
    return Math.round((completed / total) * 100);
  };

  const handleViewCountry = (country: typeof COUNTRIES[0]) => {
    setSelectedCountryDetails(country);
    setShowCountryDialog(true);
  };

  const handleAddRegistration = () => {
    if (!selectedCountry) {
      toast.error("Please select a country");
      return;
    }

    const country = COUNTRIES.find(c => c.code === selectedCountry);
    if (!country) return;

    const newReg: InternationalRegistration = {
      id: Date.now().toString(),
      countryCode: selectedCountry,
      entityName: `New ${country.name} Entity`,
      registrationType: country.registrationOptions[0],
      status: "planning",
      checklist: {},
    };

    setRegistrations([...registrations, newReg]);
    setShowAddDialog(false);
    setSelectedCountry("");
    toast.success(`Added ${country.name} registration`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Globe2 className="w-7 h-7 text-emerald-500" />
              International Business Registration
            </h1>
            <p className="text-muted-foreground">
              Register your business to operate in other countries
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New International Registration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add International Registration</DialogTitle>
                <DialogDescription>
                  Start the process to register your business in another country
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Target Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center gap-2">
                            <Flag className="w-4 h-4" />
                            {country.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCountry && (() => {
                  const country = COUNTRIES.find(c => c.code === selectedCountry);
                  if (!country) return null;
                  return (
                    <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
                      <p className="font-medium">{country.name} Overview</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Registration Authority:</span>
                        <span>{country.authority}</span>
                        <span className="text-muted-foreground">Processing Time:</span>
                        <span>{country.requirements.processingDays} days</span>
                        <span className="text-muted-foreground">Local Director Required:</span>
                        <span>{country.requirements.localDirector ? "Yes" : "No"}</span>
                        <span className="text-muted-foreground">Apostille Required:</span>
                        <span>{country.requirements.apostille ? "Yes" : "No"}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-1">Registration Options:</p>
                        <div className="flex flex-wrap gap-2">
                          {country.registrationOptions.map(opt => (
                            <Badge key={opt} variant="outline">{opt}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRegistration}>
                  Start Registration
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="countries">Country Requirements</TabsTrigger>
            <TabsTrigger value="tracker">My Registrations</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
          </TabsList>

          {/* Countries Tab */}
          <TabsContent value="countries" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>Country Requirements Database</CardTitle>
                    <CardDescription>
                      Requirements for registering foreign businesses
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Processing</TableHead>
                      <TableHead>Local Director</TableHead>
                      <TableHead>Apostille</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCountries.map(country => (
                      <TableRow key={country.code}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4 text-muted-foreground" />
                            {country.name}
                          </div>
                        </TableCell>
                        <TableCell>{country.region}</TableCell>
                        <TableCell>{country.requirements.processingDays} days</TableCell>
                        <TableCell>
                          {country.requirements.localDirector ? (
                            <Badge variant="outline" className="bg-amber-500/10">Required</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {country.requirements.apostille ? (
                            <Badge variant="outline">Required</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewCountry(country)}
                          >
                            View Details
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracker Tab */}
          <TabsContent value="tracker" className="space-y-4">
            {registrations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Globe2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No international registrations yet</p>
                  <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Registration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {registrations.map(reg => {
                  const country = COUNTRIES.find(c => c.code === reg.countryCode);
                  return (
                    <Card key={reg.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Flag className="w-5 h-5 text-muted-foreground" />
                              <h3 className="font-semibold">{reg.entityName}</h3>
                              {getStatusBadge(reg.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {country?.name || reg.countryCode}
                              </span>
                              <Badge variant="outline">{reg.registrationType}</Badge>
                              {reg.localAgent && (
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {reg.localAgent}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Manage
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{calculateProgress(reg)}%</span>
                          </div>
                          <Progress value={calculateProgress(reg)} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>International Registration Checklist</CardTitle>
                <CardDescription>
                  General steps for registering a business internationally
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {["preparation", "documents", "agent", "banking", "tax", "permits"].map(category => (
                    <div key={category}>
                      <h3 className="font-semibold capitalize mb-3 flex items-center gap-2">
                        {category === "preparation" && <Search className="w-4 h-4" />}
                        {category === "documents" && <FileText className="w-4 h-4" />}
                        {category === "agent" && <User className="w-4 h-4" />}
                        {category === "banking" && <Landmark className="w-4 h-4" />}
                        {category === "tax" && <Scale className="w-4 h-4" />}
                        {category === "permits" && <Shield className="w-4 h-4" />}
                        {category}
                      </h3>
                      <div className="space-y-2 ml-6">
                        {INTL_CHECKLIST.filter(item => item.category === category).map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                            <Checkbox id={item.id} />
                            <label htmlFor={item.id} className="text-sm flex items-center gap-2">
                              {item.label}
                              {item.required && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Key Considerations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Branch vs Subsidiary
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li><strong>Branch:</strong> Extension of parent company, parent liable for all obligations</li>
                    <li><strong>Subsidiary:</strong> Separate legal entity, limited liability protection</li>
                  </ul>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Document Requirements
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Apostille required for countries in the Hague Convention</li>
                    <li>Embassy legalization for non-Hague countries</li>
                    <li>Certified translations often required</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    Tax Treaties
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Check if a tax treaty exists between the US and target country to avoid double taxation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Country Details Dialog */}
        <Dialog open={showCountryDialog} onOpenChange={setShowCountryDialog}>
          <DialogContent className="max-w-2xl">
            {selectedCountryDetails && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5" />
                    {selectedCountryDetails.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedCountryDetails.region} • {selectedCountryDetails.authority}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-6 py-4">
                    <div>
                      <h4 className="font-medium mb-3">Registration Options</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCountryDetails.registrationOptions.map(opt => (
                          <Badge key={opt} variant="secondary">{opt}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Requirements</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">Processing Time</p>
                          <p className="font-medium">{selectedCountryDetails.requirements.processingDays} days</p>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">Local Director</p>
                          <p className="font-medium">{selectedCountryDetails.requirements.localDirector ? "Required" : "Not Required"}</p>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">Apostille</p>
                          <p className="font-medium">{selectedCountryDetails.requirements.apostille ? "Required" : "Not Required"}</p>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">Local Agent</p>
                          <p className="font-medium">{selectedCountryDetails.requirements.localAgent ? "Required" : "Not Required"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Estimated Fees ({selectedCountryDetails.currency})</h4>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Registration Fee</TableCell>
                            <TableCell className="text-right font-medium">
                              {selectedCountryDetails.fees.registration.toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Annual Fee</TableCell>
                            <TableCell className="text-right font-medium">
                              {selectedCountryDetails.fees.annual.toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Registered Agent (est.)</TableCell>
                            <TableCell className="text-right font-medium">
                              {selectedCountryDetails.fees.registeredAgent.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {selectedCountryDetails.notes && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-2">Important Notes</h4>
                        <p className="text-sm text-muted-foreground">{selectedCountryDetails.notes}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button variant="outline" asChild>
                    <a href={selectedCountryDetails.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Official Website
                    </a>
                  </Button>
                  <Button onClick={() => {
                    setSelectedCountry(selectedCountryDetails.code);
                    setShowCountryDialog(false);
                    setShowAddDialog(true);
                  }}>
                    Start Registration
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
