import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Download, Search, User, Mail, Phone, Calendar, 
  DollarSign, Building2, Users, Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OfferLetter {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  salary: string;
  startDate: string;
  relationship: string;
  status: "pending" | "sent" | "signed" | "declined";
  pdfPath: string;
}

const offerLetters: OfferLetter[] = [
  {
    id: "1",
    name: "Amber S. Hunter",
    title: "Health Manager",
    department: "Health",
    email: "amber@lawscollective.org",
    phone: "870-329-8264",
    salary: "$102,000",
    startDate: "2026-03-01",
    relationship: "Family",
    status: "pending",
    pdfPath: "/offer_letters/amber_s_hunter_contingency_offer.pdf"
  },
  {
    id: "2",
    name: "Essence M. Hunter",
    title: "Design Manager",
    department: "Design",
    email: "essence@lawscollective.org",
    phone: "870-329-3354",
    salary: "$102,000",
    startDate: "2026-03-01",
    relationship: "Family",
    status: "pending",
    pdfPath: "/offer_letters/essence_m_hunter_contingency_offer.pdf"
  },
  {
    id: "3",
    name: "Craig Russell",
    title: "Finance Manager",
    department: "Finance",
    email: "craig@lawscollective.org",
    phone: "870-413-9074",
    salary: "$102,000",
    startDate: "2026-03-01",
    relationship: "Family",
    status: "pending",
    pdfPath: "/offer_letters/craig_russell_contingency_offer.pdf"
  },
  {
    id: "4",
    name: "Cornelius Christopher",
    title: "Education Manager",
    department: "Education",
    email: "cornelius@lawscollective.org",
    phone: "870-794-5469",
    salary: "$102,000",
    startDate: "2026-03-01",
    relationship: "Family",
    status: "pending",
    pdfPath: "/offer_letters/cornelius_christopher_contingency_offer.pdf"
  },
  {
    id: "5",
    name: "Amandes Pearsall IV",
    title: "Media Manager",
    department: "Media",
    email: "amandes@lawscollective.org",
    phone: "870-692-6289",
    salary: "$102,000",
    startDate: "2026-03-01",
    relationship: "Family",
    status: "pending",
    pdfPath: "/offer_letters/amandes_pearsall_contingency_offer.pdf"
  },
  {
    id: "6",
    name: "Maia Rylandlesesene",
    title: "Procurement Manager",
    department: "Procurement",
    email: "",
    phone: "706-951-7486",
    salary: "$109,500",
    startDate: "2026-03-01",
    relationship: "Friend",
    status: "pending",
    pdfPath: "/offer_letters/maia_rylandlesesene_contingency_offer.pdf"
  },
  {
    id: "7",
    name: "Roshonda Parker",
    title: "Contracts Manager",
    department: "Contracts",
    email: "",
    phone: "757-572-7286",
    salary: "$106,000",
    startDate: "2026-03-01",
    relationship: "Friend",
    status: "pending",
    pdfPath: "/offer_letters/roshonda_parker_contingency_offer.pdf"
  },
  {
    id: "8",
    name: "Latisha Cox",
    title: "Purchasing Manager",
    department: "Purchasing",
    email: "",
    phone: "256-604-6176",
    salary: "$106,000",
    startDate: "2026-03-01",
    relationship: "Friend",
    status: "pending",
    pdfPath: "/offer_letters/latisha_cox_contingency_offer.pdf"
  },
  {
    id: "9",
    name: "Talbert Cox",
    title: "Property Manager",
    department: "Property",
    email: "",
    phone: "256-213-8086",
    salary: "$109,500",
    startDate: "2026-03-01",
    relationship: "Friend",
    status: "pending",
    pdfPath: "/offer_letters/talbert_cox_contingency_offer.pdf"
  },
  {
    id: "10",
    name: "Kenneth Coleman",
    title: "Real Estate Manager",
    department: "Real Estate",
    email: "",
    phone: "706-799-6987",
    salary: "$108,000",
    startDate: "2026-03-01",
    relationship: "Friend",
    status: "pending",
    pdfPath: "/offer_letters/kenneth_coleman_contingency_offer.pdf"
  },
  {
    id: "11",
    name: "Treiva Hunter",
    title: "Real Estate Manager",
    department: "Real Estate",
    email: "",
    phone: "704-953-3070",
    salary: "$108,000",
    startDate: "2026-03-02",
    relationship: "Sister-In-Law",
    status: "pending",
    pdfPath: "/offer_letters/treiva_hunter_contingency_offer.pdf"
  },
  {
    id: "12",
    name: "Christopher Battle Sr.",
    title: "Project Controls Manager",
    department: "Project Controls",
    email: "",
    phone: "501-613-9351",
    salary: "$108,000",
    startDate: "2026-03-01",
    relationship: "Brother-In-Law",
    status: "pending",
    pdfPath: "/offer_letters/christopher_battle_sr_contingency_offer.pdf"
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  signed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  declined: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const relationshipColors: Record<string, string> = {
  Family: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Friend: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Sister-In-Law": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  "Brother-In-Law": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
};

export default function OfferLetters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterRelationship, setFilterRelationship] = useState<string>("all");

  const departments = [...new Set(offerLetters.map(o => o.department))];
  const relationships = [...new Set(offerLetters.map(o => o.relationship))];

  const filteredOffers = offerLetters.filter(offer => {
    const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || offer.department === filterDepartment;
    const matchesRelationship = filterRelationship === "all" || offer.relationship === filterRelationship;
    return matchesSearch && matchesDepartment && matchesRelationship;
  });

  const totalSalary = offerLetters.reduce((sum, o) => {
    const salary = parseInt(o.salary.replace(/[$,]/g, ""));
    return sum + salary;
  }, 0);

  const handleDownload = (pdfPath: string, name: string) => {
    // In production, this would trigger a download from the server
    window.open(pdfPath, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Offer Letters</h1>
            <p className="text-muted-foreground">
              Manage contingency offer letters for manager positions
            </p>
          </div>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Create New Offer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offerLetters.length}</div>
              <p className="text-xs text-muted-foreground">Manager positions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSalary.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Annual commitment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Family Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {offerLetters.filter(o => o.relationship === "Family").length}
              </div>
              <p className="text-xs text-muted-foreground">Core team</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Start Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Mar 1</div>
              <p className="text-xs text-muted-foreground">2026 target</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, title, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterRelationship} onValueChange={setFilterRelationship}>
                  <SelectTrigger className="w-[180px]">
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Relationships</SelectItem>
                    {relationships.map(rel => (
                      <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offer Letters Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{offer.name}</CardTitle>
                    <CardDescription>{offer.title}</CardDescription>
                  </div>
                  <Badge className={relationshipColors[offer.relationship]}>
                    {offer.relationship}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{offer.department} Department</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{offer.salary}</span>
                  <span className="text-muted-foreground">/ year</span>
                </div>
                {offer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{offer.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{offer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Start: {offer.startDate}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <Badge className={statusColors[offer.status]}>
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(offer.pdfPath, offer.name)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No offer letters found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}

        {/* Additional Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
            <CardDescription>Additional HR documents and catalogs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Master Software Catalog</p>
                    <p className="text-sm text-muted-foreground">All approved software by department</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">CEO Software Access</p>
                    <p className="text-sm text-muted-foreground">Executive software overview</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
