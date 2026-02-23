import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  BookOpen, 
  Shield, 
  GraduationCap, 
  CheckSquare, 
  FileCode, 
  ClipboardList,
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface DepartmentProceduresProps {
  department: string;
  title?: string;
  description?: string;
  showCategories?: boolean;
  showSearch?: boolean;
  compact?: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  sop: <ClipboardList className="w-4 h-4" />,
  manual: <BookOpen className="w-4 h-4" />,
  policy: <Shield className="w-4 h-4" />,
  guide: <FileText className="w-4 h-4" />,
  training: <GraduationCap className="w-4 h-4" />,
  checklist: <CheckSquare className="w-4 h-4" />,
  template: <FileCode className="w-4 h-4" />,
  form: <FileText className="w-4 h-4" />,
};

const categoryLabels: Record<string, string> = {
  sop: "SOPs",
  manual: "Manuals",
  policy: "Policies",
  guide: "Guides",
  training: "Training",
  checklist: "Checklists",
  template: "Templates",
  form: "Forms",
};

export function DepartmentProcedures({ 
  department, 
  title = "Department Documents",
  description = "Procedures, policies, and guides for this department",
  showCategories = true,
  showSearch = true,
  compact = false
}: DepartmentProceduresProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);

  const { data: procedures, isLoading } = trpc.procedures.getByDepartment.useQuery({
    department,
    includeCompanyWide: true,
  });

  const acknowledgeMutation = trpc.procedures.acknowledge.useMutation({
    onSuccess: () => {
      toast.success("Procedure acknowledged successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to acknowledge procedure");
    },
  });

  const filteredProcedures = procedures?.filter((proc: any) => {
    const matchesSearch = !searchQuery || 
      proc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || proc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Group by category
  const groupedProcedures = filteredProcedures.reduce((acc: Record<string, any[]>, proc: any) => {
    const cat = proc.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(proc);
    return acc;
  }, {});

  const categories = Object.keys(categoryLabels);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredProcedures.slice(0, 10).map((proc: any) => (
                <div 
                  key={proc.id} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedProcedure(proc)}
                >
                  <div className="flex items-center gap-2">
                    {categoryIcons[proc.category] || <FileText className="w-4 h-4" />}
                    <span className="text-sm font-medium">{proc.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[proc.category] || proc.category}
                  </Badge>
                </div>
              ))}
              {filteredProcedures.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No documents found for this department
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {showSearch && (
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {showCategories ? (
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="mb-4 flex-wrap h-auto gap-1">
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="gap-1">
                    {categoryIcons[cat]}
                    {categoryLabels[cat]}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-6">
                  {Object.entries(groupedProcedures).map(([category, procs]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        {categoryIcons[category]}
                        {categoryLabels[category] || category}
                        <Badge variant="secondary" className="ml-2">{(procs as any[]).length}</Badge>
                      </h3>
                      <div className="grid gap-3">
                        {(procs as any[]).map((proc) => (
                          <ProcedureCard 
                            key={proc.id} 
                            procedure={proc} 
                            onView={() => setSelectedProcedure(proc)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {categories.map((cat) => (
                <TabsContent key={cat} value={cat}>
                  <div className="grid gap-3">
                    {filteredProcedures
                      .filter((p: any) => p.category === cat)
                      .map((proc: any) => (
                        <ProcedureCard 
                          key={proc.id} 
                          procedure={proc} 
                          onView={() => setSelectedProcedure(proc)}
                        />
                      ))}
                    {filteredProcedures.filter((p: any) => p.category === cat).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No {categoryLabels[cat]?.toLowerCase()} found
                      </p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="grid gap-3">
              {filteredProcedures.map((proc: any) => (
                <ProcedureCard 
                  key={proc.id} 
                  procedure={proc} 
                  onView={() => setSelectedProcedure(proc)}
                />
              ))}
              {filteredProcedures.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No documents found
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Procedure Detail Dialog */}
      <Dialog open={!!selectedProcedure} onOpenChange={() => setSelectedProcedure(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedProcedure && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {categoryIcons[selectedProcedure.category]}
                  <DialogTitle>{selectedProcedure.title}</DialogTitle>
                </div>
                <DialogDescription>
                  {selectedProcedure.documentNumber && (
                    <span className="mr-2">#{selectedProcedure.documentNumber}</span>
                  )}
                  Version {selectedProcedure.version || "1.0"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedProcedure.description && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedProcedure.description}</p>
                  </div>
                )}

                {selectedProcedure.content && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Content</h4>
                    <div className="prose prose-sm max-w-none bg-muted/50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{selectedProcedure.content}</pre>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t">
                  {selectedProcedure.fileUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedProcedure.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  )}
                  
                  {selectedProcedure.isRequired && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        acknowledgeMutation.mutate({
                          procedureId: selectedProcedure.id,
                          version: selectedProcedure.version || "1.0",
                        });
                      }}
                      disabled={acknowledgeMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Acknowledge
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span>Category: {categoryLabels[selectedProcedure.category] || selectedProcedure.category}</span>
                  {selectedProcedure.department && <span>Department: {selectedProcedure.department}</span>}
                  {selectedProcedure.effectiveDate && (
                    <span>Effective: {new Date(selectedProcedure.effectiveDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProcedureCard({ procedure, onView }: { procedure: any; onView: () => void }) {
  return (
    <div 
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onView}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          {categoryIcons[procedure.category] || <FileText className="w-4 h-4" />}
        </div>
        <div>
          <h4 className="font-medium">{procedure.title}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {procedure.documentNumber && <span>#{procedure.documentNumber}</span>}
            <span>v{procedure.version || "1.0"}</span>
            {procedure.isRequired && (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{categoryLabels[procedure.category] || procedure.category}</Badge>
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default DepartmentProcedures;
