import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Scale,
  Calculator,
  Shield,
  DollarSign,
  FileText,
  Download,
  Plus,
  Trash2,
  Info,
} from "lucide-react";

interface ServiceLine {
  id: string;
  category: string;
  service: string;
  description: string;
  estimatedCost: number;
  frequency: string;
  grantCategory: string;
  fundable: boolean;
  notes: string;
}

const PROFESSIONAL_SERVICES = [
  // Legal Services
  { category: "Legal", service: "Business Attorney - Entity Formation", grantCategory: "Capacity Building", fundable: true, typicalCost: 2500 },
  { category: "Legal", service: "Business Attorney - Contract Templates", grantCategory: "Capacity Building", fundable: true, typicalCost: 1500 },
  { category: "Legal", service: "Business Attorney - Compliance Review", grantCategory: "Technical Assistance", fundable: true, typicalCost: 2000 },
  { category: "Legal", service: "Trust Attorney - Trust Formation", grantCategory: "Organizational Development", fundable: true, typicalCost: 5000 },
  { category: "Legal", service: "Nonprofit Attorney - 501(c)(3) Filing", grantCategory: "Capacity Building", fundable: true, typicalCost: 3500 },
  { category: "Legal", service: "IP Attorney - Trademark Registration", grantCategory: "Technical Assistance", fundable: true, typicalCost: 1500 },
  
  // Accounting/Financial Services
  { category: "Financial", service: "CPA - Tax Strategy & Planning", grantCategory: "Capacity Building", fundable: true, typicalCost: 3000 },
  { category: "Financial", service: "CPA - Annual Tax Preparation", grantCategory: "Operational Costs", fundable: true, typicalCost: 2000 },
  { category: "Financial", service: "CPA - Audit Preparation", grantCategory: "Capacity Building", fundable: true, typicalCost: 4000 },
  { category: "Financial", service: "Bookkeeper - Monthly Services", grantCategory: "Operational Costs", fundable: true, typicalCost: 500 },
  { category: "Financial", service: "Financial Advisor - Investment Strategy", grantCategory: "Technical Assistance", fundable: true, typicalCost: 2500 },
  { category: "Financial", service: "Grant Writer - Application Support", grantCategory: "Capacity Building", fundable: true, typicalCost: 3000 },
  
  // Insurance Services
  { category: "Insurance", service: "Insurance Agent - Policy Procurement", grantCategory: "Operational Costs", fundable: false, typicalCost: 0 },
  { category: "Insurance", service: "Insurance Premiums - General Liability", grantCategory: "Operational Costs", fundable: true, typicalCost: 2400 },
  { category: "Insurance", service: "Insurance Premiums - D&O Coverage", grantCategory: "Operational Costs", fundable: true, typicalCost: 1800 },
  { category: "Insurance", service: "Insurance License Reinstatement", grantCategory: "Professional Development", fundable: true, typicalCost: 500 },
  
  // Professional Development
  { category: "Development", service: "Professional Certification - Accounting", grantCategory: "Professional Development", fundable: true, typicalCost: 1200 },
  { category: "Development", service: "Professional Certification - Project Management", grantCategory: "Professional Development", fundable: true, typicalCost: 800 },
  { category: "Development", service: "Continuing Education Credits", grantCategory: "Professional Development", fundable: true, typicalCost: 600 },
  { category: "Development", service: "Industry Conference Attendance", grantCategory: "Professional Development", fundable: true, typicalCost: 1500 },
  
  // Consulting Services
  { category: "Consulting", service: "Business Consultant - Strategic Planning", grantCategory: "Technical Assistance", fundable: true, typicalCost: 5000 },
  { category: "Consulting", service: "HR Consultant - Policy Development", grantCategory: "Capacity Building", fundable: true, typicalCost: 3000 },
  { category: "Consulting", service: "IT Consultant - Systems Setup", grantCategory: "Technical Assistance", fundable: true, typicalCost: 4000 },
  { category: "Consulting", service: "Marketing Consultant - Brand Strategy", grantCategory: "Technical Assistance", fundable: true, typicalCost: 3500 },
];

const GRANT_CATEGORIES = [
  { name: "Capacity Building", description: "Professional services, infrastructure, organizational development" },
  { name: "Technical Assistance", description: "Consulting, specialized expertise, system implementation" },
  { name: "Operational Costs", description: "Ongoing expenses, insurance, bookkeeping" },
  { name: "Professional Development", description: "Training, certifications, continuing education" },
  { name: "Organizational Development", description: "Governance, compliance, structural improvements" },
];

export default function ProfessionalServicesBudget() {
  const [selectedServices, setSelectedServices] = useState<ServiceLine[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const addService = (service: typeof PROFESSIONAL_SERVICES[0]) => {
    const newLine: ServiceLine = {
      id: crypto.randomUUID(),
      category: service.category,
      service: service.service,
      description: "",
      estimatedCost: service.typicalCost,
      frequency: "one-time",
      grantCategory: service.grantCategory,
      fundable: service.fundable,
      notes: "",
    };
    setSelectedServices([...selectedServices, newLine]);
    toast.success(`Added ${service.service}`);
  };

  const removeService = (id: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== id));
  };

  const updateService = (id: string, field: keyof ServiceLine, value: any) => {
    setSelectedServices(selectedServices.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const totalBudget = selectedServices.reduce((sum, s) => sum + s.estimatedCost, 0);
  const fundableBudget = selectedServices.filter(s => s.fundable).reduce((sum, s) => sum + s.estimatedCost, 0);

  const budgetByCategory = GRANT_CATEGORIES.map(cat => ({
    ...cat,
    total: selectedServices.filter(s => s.grantCategory === cat.name).reduce((sum, s) => sum + s.estimatedCost, 0),
    count: selectedServices.filter(s => s.grantCategory === cat.name).length,
  }));

  const exportBudget = () => {
    const data = {
      title: "Professional Services Budget",
      generatedAt: new Date().toISOString(),
      totalBudget,
      fundableBudget,
      nonFundableBudget: totalBudget - fundableBudget,
      byCategory: budgetByCategory.filter(c => c.total > 0),
      lineItems: selectedServices,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "professional-services-budget.json";
    a.click();
    toast.success("Budget exported");
  };

  const filteredServices = filterCategory === "all" 
    ? PROFESSIONAL_SERVICES 
    : PROFESSIONAL_SERVICES.filter(s => s.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Scale className="h-6 w-6" />
            Professional Services Budget Template
          </h2>
          <p className="text-muted-foreground">
            Map professional services to grant-fundable categories
          </p>
        </div>
        <Button onClick={exportBudget} className="gap-2" disabled={selectedServices.length === 0}>
          <Download className="h-4 w-4" />
          Export Budget
        </Button>
      </div>

      {/* Grant Category Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Grant Category Reference
          </CardTitle>
          <CardDescription>
            Common grant categories that cover professional services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GRANT_CATEGORIES.map(cat => (
              <div key={cat.name} className="p-3 bg-muted rounded">
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Service Catalog */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Service Catalog
            </CardTitle>
            <CardDescription>
              Click to add services to your budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Development">Professional Development</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredServices.map((service, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => addService(service)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{service.service}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{service.category}</Badge>
                          {service.fundable ? (
                            <Badge variant="default" className="text-xs">Fundable</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Not Fundable</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${service.typicalCost.toLocaleString()}</p>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Services */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Budget Line Items
            </CardTitle>
            <CardDescription>
              {selectedServices.length} services selected
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedServices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Grant Category</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedServices.map(service => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.service}</p>
                          <Badge variant="outline" className="text-xs">{service.category}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={service.grantCategory}
                          onValueChange={(v) => updateService(service.id, "grantCategory", v)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GRANT_CATEGORIES.map(cat => (
                              <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={service.frequency}
                          onValueChange={(v) => updateService(service.id, "frequency", v)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="one-time">One-time</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={service.estimatedCost}
                          onChange={(e) => updateService(service.id, "estimatedCost", parseFloat(e.target.value) || 0)}
                          className="w-24 text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeService(service.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No services selected</p>
                <p className="text-sm">Click services from the catalog to add them</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Summary */}
      {selectedServices.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded">
                  <span className="font-medium">Total Budget</span>
                  <span className="text-xl font-bold">${totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded">
                  <span className="font-medium">Grant Fundable</span>
                  <span className="text-xl font-bold text-green-600">${fundableBudget.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <span className="font-medium">Non-Fundable</span>
                  <span className="text-xl font-bold">${(totalBudget - fundableBudget).toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((fundableBudget / totalBudget) * 100)}% of budget is potentially grant-fundable
                </p>
              </div>
            </CardContent>
          </Card>

          {/* By Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                By Grant Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetByCategory.filter(c => c.total > 0).map(cat => (
                  <div key={cat.name} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.count} items</p>
                    </div>
                    <span className="font-bold">${cat.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contingency Note for Insurance */}
      <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <Shield className="h-5 w-5" />
            Insurance License Contingency Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The <strong>Project Controls Manager</strong> position includes insurance procurement responsibilities 
            contingent on obtaining/reinstating state insurance license. License reinstatement costs 
            ($200-500 + CE credits) are grant-fundable under Professional Development. Until licensed, 
            insurance procurement will be coordinated through external licensed brokers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
