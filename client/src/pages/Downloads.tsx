import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Download,
  FileText,
  FileCode,
  FileSpreadsheet,
  File,
  Search,
  FolderOpen,
  Calendar,
  Clock,
  Filter,
  BookOpen,
  Shield,
  Scale,
  DollarSign,
  Users,
  Building2,
  Briefcase,
  GraduationCap,
  Heart,
  Truck,
  FileSignature,
} from "lucide-react";

// Document categories with their documents
const documentCategories = [
  {
    id: "policies",
    name: "Policies & Procedures",
    icon: Shield,
    description: "Official policies and standard operating procedures",
    documents: [
      { id: 1, name: "Employee Handbook", type: "pdf", size: "2.4 MB", category: "HR", updatedAt: "2024-01-15", version: "3.2" },
      { id: 2, name: "Code of Conduct", type: "pdf", size: "1.1 MB", category: "HR", updatedAt: "2024-01-10", version: "2.0" },
      { id: 3, name: "Data Privacy Policy", type: "pdf", size: "890 KB", category: "Legal", updatedAt: "2024-01-08", version: "1.5" },
      { id: 4, name: "Information Security Policy", type: "pdf", size: "1.5 MB", category: "IT", updatedAt: "2024-01-05", version: "2.1" },
      { id: 5, name: "Travel & Expense Policy", type: "pdf", size: "750 KB", category: "Finance", updatedAt: "2024-01-03", version: "1.8" },
    ],
  },
  {
    id: "legal",
    name: "Legal Documents",
    icon: Scale,
    description: "Legal templates and compliance documents",
    documents: [
      { id: 6, name: "Operating Agreement Template", type: "docx", size: "156 KB", category: "Legal", updatedAt: "2024-01-12", version: "1.0" },
      { id: 7, name: "NDA Template", type: "docx", size: "89 KB", category: "Legal", updatedAt: "2024-01-11", version: "2.3" },
      { id: 8, name: "Service Agreement Template", type: "docx", size: "124 KB", category: "Legal", updatedAt: "2024-01-09", version: "1.4" },
      { id: 9, name: "Independent Contractor Agreement", type: "docx", size: "98 KB", category: "Legal", updatedAt: "2024-01-07", version: "1.2" },
      { id: 10, name: "Trust Formation Documents", type: "pdf", size: "3.2 MB", category: "Trust", updatedAt: "2024-01-01", version: "1.0" },
    ],
  },
  {
    id: "financial",
    name: "Financial Templates",
    icon: DollarSign,
    description: "Financial forms, templates, and reports",
    documents: [
      { id: 11, name: "Budget Template", type: "xlsx", size: "245 KB", category: "Finance", updatedAt: "2024-01-14", version: "2.5" },
      { id: 12, name: "Expense Report Template", type: "xlsx", size: "78 KB", category: "Finance", updatedAt: "2024-01-13", version: "1.3" },
      { id: 13, name: "Invoice Template", type: "xlsx", size: "56 KB", category: "Finance", updatedAt: "2024-01-10", version: "1.1" },
      { id: 14, name: "Grant Budget Template", type: "xlsx", size: "189 KB", category: "Grants", updatedAt: "2024-01-08", version: "1.0" },
      { id: 15, name: "Financial Statement Template", type: "xlsx", size: "312 KB", category: "Finance", updatedAt: "2024-01-05", version: "2.0" },
    ],
  },
  {
    id: "hr",
    name: "HR & Personnel",
    icon: Users,
    description: "Human resources forms and documents",
    documents: [
      { id: 16, name: "Job Application Form", type: "pdf", size: "125 KB", category: "HR", updatedAt: "2024-01-15", version: "1.2" },
      { id: 17, name: "Onboarding Checklist", type: "pdf", size: "89 KB", category: "HR", updatedAt: "2024-01-12", version: "2.0" },
      { id: 18, name: "Performance Review Template", type: "docx", size: "67 KB", category: "HR", updatedAt: "2024-01-10", version: "1.5" },
      { id: 19, name: "Time Off Request Form", type: "pdf", size: "45 KB", category: "HR", updatedAt: "2024-01-08", version: "1.0" },
      { id: 20, name: "Benefits Enrollment Guide", type: "pdf", size: "2.1 MB", category: "HR", updatedAt: "2024-01-05", version: "2024" },
    ],
  },
  {
    id: "business",
    name: "Business Operations",
    icon: Briefcase,
    description: "Business planning and operations documents",
    documents: [
      { id: 21, name: "Business Plan Template", type: "docx", size: "234 KB", category: "Business", updatedAt: "2024-01-14", version: "3.0" },
      { id: 22, name: "SWOT Analysis Template", type: "xlsx", size: "78 KB", category: "Business", updatedAt: "2024-01-12", version: "1.2" },
      { id: 23, name: "Project Charter Template", type: "docx", size: "89 KB", category: "Projects", updatedAt: "2024-01-10", version: "1.5" },
      { id: 24, name: "Meeting Minutes Template", type: "docx", size: "45 KB", category: "Business", updatedAt: "2024-01-08", version: "1.0" },
      { id: 25, name: "Strategic Plan Template", type: "pptx", size: "1.8 MB", category: "Business", updatedAt: "2024-01-05", version: "2.0" },
    ],
  },
  {
    id: "training",
    name: "Training Materials",
    icon: GraduationCap,
    description: "Educational and training resources",
    documents: [
      { id: 26, name: "Financial Literacy Guide", type: "pdf", size: "4.5 MB", category: "Training", updatedAt: "2024-01-15", version: "1.0" },
      { id: 27, name: "Grant Writing Handbook", type: "pdf", size: "3.2 MB", category: "Training", updatedAt: "2024-01-12", version: "2.1" },
      { id: 28, name: "Business Formation Guide", type: "pdf", size: "2.8 MB", category: "Training", updatedAt: "2024-01-10", version: "1.5" },
      { id: 29, name: "Tax Preparation Guide", type: "pdf", size: "5.1 MB", category: "Training", updatedAt: "2024-01-08", version: "2024" },
      { id: 30, name: "L.A.W.S. Framework Overview", type: "pdf", size: "1.9 MB", category: "Training", updatedAt: "2024-01-05", version: "1.0" },
    ],
  },
];

// Get file icon based on type
const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="w-5 h-5 text-red-500" />;
    case "docx":
    case "doc":
      return <FileText className="w-5 h-5 text-blue-500" />;
    case "xlsx":
    case "xls":
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    case "pptx":
    case "ppt":
      return <FileText className="w-5 h-5 text-orange-500" />;
    case "js":
    case "ts":
    case "json":
      return <FileCode className="w-5 h-5 text-yellow-500" />;
    default:
      return <File className="w-5 h-5 text-gray-500" />;
  }
};

// Get badge color based on category
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    HR: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Legal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Finance: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    IT: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    Trust: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    Grants: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    Business: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    Projects: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    Training: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  };
  return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
};

export default function Downloads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter documents based on search and category
  const filteredCategories = documentCategories.map(category => ({
    ...category,
    documents: category.documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || category.id === selectedCategory;
      return matchesSearch && matchesCategory;
    }),
  })).filter(category => category.documents.length > 0 || selectedCategory === "all");

  // Get all documents for "all" view
  const allDocuments = documentCategories.flatMap(cat => 
    cat.documents.map(doc => ({ ...doc, categoryName: cat.name }))
  ).filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (doc: { id: number; name: string; type: string }) => {
    // In a real implementation, this would trigger an actual file download
    toast.success(`Downloading ${doc.name}.${doc.type}`);
    // Track download in analytics/history
  };

  const totalDocuments = documentCategories.reduce((sum, cat) => sum + cat.documents.length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Document Downloads</h1>
            <p className="text-muted-foreground mt-1">
              Access official documents, templates, and resources
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <FolderOpen className="w-3 h-3" />
              {totalDocuments} Documents
            </Badge>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="all">All Categories</option>
                  {documentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="gap-1">
              <FolderOpen className="w-4 h-4" />
              All
            </TabsTrigger>
            {documentCategories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-1">
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All Documents View */}
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {documentCategories.map(category => (
                <Card key={category.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <category.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.documents
                        .filter(doc => 
                          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(doc => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.type)}
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{doc.size}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {doc.updatedAt}
                                </span>
                                <span>•</span>
                                <span>v{doc.version}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getCategoryColor(doc.category)} variant="secondary">
                              {doc.category}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(doc)}
                              className="gap-1"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Individual Category Views */}
          {documentCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <category.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.documents
                      .filter(doc => 
                        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        doc.category.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            {getFileIcon(doc.type)}
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <File className="w-3 h-3" />
                                {doc.type.toUpperCase()}
                              </span>
                              <span>{doc.size}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Updated {doc.updatedAt}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Version {doc.version}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getCategoryColor(doc.category)} variant="secondary">
                            {doc.category}
                          </Badge>
                          <Button
                            onClick={() => handleDownload(doc)}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalDocuments}</p>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                  <FolderOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{documentCategories.length}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Training Guides</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                  <FileSignature className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Legal Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
