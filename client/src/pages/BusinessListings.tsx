import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Search,
  Plus,
  FileText,
  Scale,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Link2,
  Eye,
  Briefcase,
  Globe,
  Phone,
  Mail,
  FileSignature,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Internal entities (auto-populated from system)
const internalEntities = [
  {
    id: "the-508",
    name: "The 508",
    type: "Trust",
    state: "GA",
    ein: "Pending",
    status: "active",
    formationDate: "2024-01-15",
    complianceStatus: "current",
    nextFiling: "2026-04-01",
    filingType: "Annual Registration",
    agreements: 2,
    contracts: 0,
    description: "Family trust for asset protection and generational wealth transfer",
  },
  {
    id: "luvonpurpose-aws",
    name: "LuvOnPurpose Autonomous Wealth System LLC",
    type: "LLC",
    state: "DE",
    ein: "Pending",
    status: "active",
    formationDate: "2024-02-01",
    complianceStatus: "current",
    nextFiling: "2026-06-01",
    filingType: "Franchise Tax",
    agreements: 3,
    contracts: 1,
    description: "Technology platform for autonomous wealth building and financial automation",
  },
  {
    id: "laws-collective",
    name: "The L.A.W.S. Collective, LLC",
    type: "LLC",
    state: "GA",
    ein: "39-3122993",
    status: "active",
    formationDate: "2023-06-15",
    complianceStatus: "current",
    nextFiling: "2026-04-01",
    filingType: "Annual Registration",
    agreements: 5,
    contracts: 3,
    description: "Public-facing operating company for education, business development, and community support",
  },
  {
    id: "real-eye-nation",
    name: "Real-Eye-Nation LLC",
    type: "LLC",
    state: "GA",
    ein: "84-4976416",
    status: "active",
    formationDate: "2022-08-20",
    complianceStatus: "current",
    nextFiling: "2026-04-01",
    filingType: "Annual Registration",
    agreements: 2,
    contracts: 4,
    description: "Media production company for creative services, documentary production, and design",
  },
];

// Sample external businesses for search
const externalBusinesses = [
  {
    id: "ext-1",
    name: "Atlanta Web Design Co.",
    type: "Vendor",
    category: "Design Services",
    location: "Atlanta, GA",
    phone: "(404) 555-0123",
    email: "contact@atlwebdesign.com",
    website: "atlwebdesign.com",
    hasContract: true,
    contractId: "CNT-2024-001",
  },
  {
    id: "ext-2",
    name: "Southern Legal Partners",
    type: "Partner",
    category: "Legal Services",
    location: "Atlanta, GA",
    phone: "(404) 555-0456",
    email: "info@southernlegal.com",
    website: "southernlegal.com",
    hasContract: false,
    contractId: null,
  },
  {
    id: "ext-3",
    name: "Community Foundation of GA",
    type: "Partner",
    category: "Nonprofit",
    location: "Atlanta, GA",
    phone: "(404) 555-0789",
    email: "grants@cfga.org",
    website: "cfga.org",
    hasContract: false,
    contractId: null,
  },
  {
    id: "ext-4",
    name: "Print Solutions Inc.",
    type: "Vendor",
    category: "Print Services",
    location: "Decatur, GA",
    phone: "(404) 555-0321",
    email: "orders@printsolutions.com",
    website: "printsolutions.com",
    hasContract: true,
    contractId: "CNT-2024-003",
  },
];

export default function BusinessListings() {
  const [activeTab, setActiveTab] = useState("internal");
  const [searchQuery, setSearchQuery] = useState("");
  const [externalSearch, setExternalSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Filter internal entities
  const filteredInternal = internalEntities.filter((entity) => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || entity.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Filter external businesses
  const filteredExternal = externalBusinesses.filter((business) => {
    return (
      business.name.toLowerCase().includes(externalSearch.toLowerCase()) ||
      business.category.toLowerCase().includes(externalSearch.toLowerCase()) ||
      business.location.toLowerCase().includes(externalSearch.toLowerCase())
    );
  });

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "due-soon":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateContract = (businessId: string, businessName: string) => {
    toast.success(`Creating contract for ${businessName}...`);
    // Navigate to contract creation with pre-filled business info
  };

  const handleViewAgreements = (entityId: string) => {
    toast.info("Opening agreements...");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Business Listings</h1>
            <p className="text-muted-foreground mt-1">
              Internal entities and external business directory
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.info("Syncing with Business Simulator...")}>
              <Building2 className="w-4 h-4 mr-2" />
              Sync Entities
            </Button>
            <Button onClick={() => toast.info("Add external business...")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Business
            </Button>
            <Button variant="secondary" onClick={() => window.open("/business-simulator", "_blank")}>
              <Eye className="w-4 h-4 mr-2" />
              Try Demo
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => window.location.href = "/pricing"}>
              <DollarSign className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="internal">Internal Entities</TabsTrigger>
            <TabsTrigger value="external">External Directory</TabsTrigger>
          </TabsList>

          {/* Internal Entities Tab */}
          <TabsContent value="internal" className="space-y-4 mt-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search internal entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "trust" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("trust")}
                >
                  Trusts
                </Button>
                <Button
                  variant={filterType === "llc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("llc")}
                >
                  LLCs
                </Button>
              </div>
            </div>

            {/* Info Banner */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Auto-Updated:</strong> This list automatically updates when businesses complete 
                      formation in the Business Simulator. Each entity links to its operating agreements, 
                      contracts, and compliance status.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Entity Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredInternal.map((entity) => (
                <Card key={entity.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{entity.name}</CardTitle>
                        <CardDescription className="mt-1">{entity.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{entity.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Entity Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{entity.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>EIN: {entity.ein}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Formed: {entity.formationDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getComplianceColor(entity.complianceStatus)}>
                          {entity.complianceStatus === "current" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {entity.complianceStatus === "due-soon" && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {entity.complianceStatus}
                        </Badge>
                      </div>
                    </div>

                    {/* Next Filing */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Next Filing</p>
                      <p className="text-sm font-medium">{entity.filingType} - {entity.nextFiling}</p>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        className="flex items-center gap-1 text-primary hover:underline"
                        onClick={() => handleViewAgreements(entity.id)}
                      >
                        <Scale className="w-4 h-4" />
                        {entity.agreements} Agreements
                      </button>
                      <button
                        className="flex items-center gap-1 text-primary hover:underline"
                        onClick={() => toast.info("Opening contracts...")}
                      >
                        <FileSignature className="w-4 h-4" />
                        {entity.contracts} Contracts
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.info("Opening entity details...")}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.info("Opening compliance...")}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Compliance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* External Directory Tab */}
          <TabsContent value="external" className="space-y-4 mt-4">
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors, partners, contractors..."
                  value={externalSearch}
                  onChange={(e) => setExternalSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* External Business Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExternal.map((business) => (
                <Card key={business.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{business.name}</CardTitle>
                      <Badge variant={business.type === "Vendor" ? "default" : "secondary"}>
                        {business.type}
                      </Badge>
                    </div>
                    <CardDescription>{business.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{business.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{business.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-primary">{business.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={`https://${business.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {business.website}
                        </a>
                      </div>
                    </div>

                    {/* Contract Status */}
                    <div className="pt-2 border-t">
                      {business.hasContract ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Active Contract</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => toast.info(`Opening ${business.contractId}...`)}>
                            <Link2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleCreateContract(business.id, business.name)}
                        >
                          <FileSignature className="w-4 h-4 mr-2" />
                          Create Contract
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add New External Business */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Add External Business</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add vendors, partners, or contractors to your directory
                  </p>
                  <Button onClick={() => toast.info("Opening add business form...")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{internalEntities.length}</p>
                <p className="text-sm text-muted-foreground">Internal Entities</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{externalBusinesses.length}</p>
                <p className="text-sm text-muted-foreground">External Partners</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {externalBusinesses.filter((b) => b.hasContract).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">
                  {internalEntities.reduce((sum, e) => sum + e.agreements, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Agreements</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
