import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  Download,
  Eye,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

type EntityType = 'real_eye_nation' | 'laws_collective' | 'luvonpurpose_aws' | '508_academy';
type TemplateType = 'federal_nea' | 'federal_usda' | 'federal_sba' | 'foundation_ford' | 'foundation_kellogg' | 'foundation_macarthur' | 'generic';

interface BudgetItem {
  category: string;
  description: string;
  amount: number;
  justification: string;
}

const entityLabels: Record<EntityType, string> = {
  real_eye_nation: 'Real-Eye-Nation LLC',
  laws_collective: 'L.A.W.S. Collective LLC',
  luvonpurpose_aws: 'LuvOnPurpose AWS LLC',
  '508_academy': '508-LuvOnPurpose Academy'
};

export default function GrantExport() {
  const [selectedEntity, setSelectedEntity] = useState<EntityType | ''>('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | ''>('');
  const [activeTab, setActiveTab] = useState('configure');
  const [previewContent, setPreviewContent] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantTitle: '',
    projectTitle: '',
    projectStartDate: '',
    projectEndDate: '',
    projectSummary: '',
    requestedAmount: 0,
    customNeedStatement: '',
  });
  
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [useAutoNeedStatement, setUseAutoNeedStatement] = useState(true);

  // Queries
  const { data: templates } = trpc.grantExport.getTemplates.useQuery();
  const { data: entityTemplates } = trpc.grantExport.getTemplatesForEntity.useQuery(
    { entityType: selectedEntity as EntityType },
    { enabled: !!selectedEntity }
  );
  const { data: prefilledData } = trpc.grantExport.getPrefilledData.useQuery(
    { entityType: selectedEntity as EntityType, templateType: selectedTemplate as TemplateType },
    { enabled: !!selectedEntity && !!selectedTemplate }
  );
  const { data: checklist } = trpc.grantExport.getChecklist.useQuery(
    { templateType: selectedTemplate as TemplateType },
    { enabled: !!selectedTemplate }
  );

  // Mutations
  const generateApplication = trpc.grantExport.generateApplication.useMutation();
  const exportMarkdown = trpc.grantExport.exportToMarkdown.useMutation();
  const exportJSON = trpc.grantExport.exportToJSON.useMutation();
  const validateApplication = trpc.grantExport.validateApplication.useMutation();

  // Update form when prefilled data changes
  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({
        ...prev,
        requestedAmount: prefilledData.suggestedAmount || 0,
      }));
    }
  }, [prefilledData]);

  const handleEntityChange = (value: string) => {
    setSelectedEntity(value as EntityType);
    setSelectedTemplate('');
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value as TemplateType);
  };

  const addBudgetItem = () => {
    setBudgetItems([...budgetItems, {
      category: '',
      description: '',
      amount: 0,
      justification: ''
    }]);
  };

  const updateBudgetItem = (index: number, field: keyof BudgetItem, value: string | number) => {
    const updated = [...budgetItems];
    updated[index] = { ...updated[index], [field]: value };
    setBudgetItems(updated);
  };

  const removeBudgetItem = (index: number) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== index));
  };

  const handlePreview = async () => {
    if (!selectedEntity || !selectedTemplate || !prefilledData) {
      toast.error('Please select an entity and template first');
      return;
    }

    try {
      const result = await exportMarkdown.mutateAsync({
        entityType: selectedEntity as EntityType,
        templateType: selectedTemplate as TemplateType,
        applicantName: formData.applicantName || 'Grant Applicant',
        applicantTitle: formData.applicantTitle || 'Executive Director',
        organizationName: prefilledData.organizationName,
        organizationAddress: prefilledData.organizationAddress,
        organizationPhone: prefilledData.organizationPhone,
        organizationEmail: prefilledData.organizationEmail,
        organizationWebsite: prefilledData.organizationWebsite,
        einNumber: prefilledData.einNumber,
        requestedAmount: formData.requestedAmount || prefilledData.suggestedAmount,
        projectTitle: formData.projectTitle || 'Grant Project',
        projectStartDate: formData.projectStartDate || new Date().toISOString().split('T')[0],
        projectEndDate: formData.projectEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        projectSummary: formData.projectSummary,
        customNeedStatement: useAutoNeedStatement ? undefined : formData.customNeedStatement,
        budgetItems: budgetItems.length > 0 ? budgetItems : [],
      });

      setPreviewContent(result.markdown);
      setActiveTab('preview');
      toast.success('Application preview generated');
    } catch (error) {
      toast.error('Failed to generate preview');
    }
  };

  const handleExportMarkdown = async () => {
    if (!previewContent) {
      await handlePreview();
    }
    
    const blob = new Blob([previewContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grant-application-${selectedEntity}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown file downloaded');
  };

  const handleExportJSON = async () => {
    if (!selectedEntity || !selectedTemplate || !prefilledData) {
      toast.error('Please select an entity and template first');
      return;
    }

    try {
      const result = await exportJSON.mutateAsync({
        entityType: selectedEntity as EntityType,
        templateType: selectedTemplate as TemplateType,
        applicantName: formData.applicantName || 'Grant Applicant',
        applicantTitle: formData.applicantTitle || 'Executive Director',
        organizationName: prefilledData.organizationName,
        organizationAddress: prefilledData.organizationAddress,
        organizationPhone: prefilledData.organizationPhone,
        organizationEmail: prefilledData.organizationEmail,
        organizationWebsite: prefilledData.organizationWebsite,
        einNumber: prefilledData.einNumber,
        requestedAmount: formData.requestedAmount || prefilledData.suggestedAmount,
        projectTitle: formData.projectTitle || 'Grant Project',
        projectStartDate: formData.projectStartDate || new Date().toISOString().split('T')[0],
        projectEndDate: formData.projectEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        projectSummary: formData.projectSummary,
        customNeedStatement: useAutoNeedStatement ? undefined : formData.customNeedStatement,
        budgetItems: budgetItems.length > 0 ? budgetItems : [],
      });

      const blob = new Blob([result.json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grant-application-${selectedEntity}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('JSON file downloaded');
    } catch (error) {
      toast.error('Failed to export JSON');
    }
  };

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Grant Application Export</h1>
            <p className="text-muted-foreground mt-1">
              Generate submission-ready grant applications with auto-populated need statements
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportJSON} disabled={!selectedEntity || !selectedTemplate}>
              <FileJson className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button onClick={handleExportMarkdown} disabled={!selectedEntity || !selectedTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Export Markdown
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Configure Tab */}
          <TabsContent value="configure" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Entity Selection */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Select Entity
                </h3>
                <Select value={selectedEntity} onValueChange={handleEntityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an entity..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_eye_nation">Real-Eye-Nation LLC</SelectItem>
                    <SelectItem value="laws_collective">L.A.W.S. Collective LLC</SelectItem>
                    <SelectItem value="luvonpurpose_aws">LuvOnPurpose AWS LLC</SelectItem>
                    <SelectItem value="508_academy">508-LuvOnPurpose Academy</SelectItem>
                  </SelectContent>
                </Select>

                {prefilledData && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p><strong>Organization:</strong> {prefilledData.organizationName}</p>
                    <p><strong>Tax Status:</strong> {prefilledData.taxStatus}</p>
                    <p><strong>EIN:</strong> {prefilledData.einNumber}</p>
                    <p className="text-muted-foreground">{prefilledData.missionStatement}</p>
                  </div>
                )}
              </Card>

              {/* Template Selection */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Select Template
                </h3>
                <Select 
                  value={selectedTemplate} 
                  onValueChange={handleTemplateChange}
                  disabled={!selectedEntity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a grant template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTemplates?.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {prefilledData && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p><strong>Max Funding:</strong> ${prefilledData.maxFunding.toLocaleString()}</p>
                    <p><strong>Deadline:</strong> {prefilledData.deadlineInfo}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prefilledData.requiredDocuments.map((doc, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{doc}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Project Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Project Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Applicant Name</Label>
                  <Input
                    value={formData.applicantName}
                    onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Applicant Title</Label>
                  <Input
                    value={formData.applicantTitle}
                    onChange={(e) => setFormData({ ...formData, applicantTitle: e.target.value })}
                    placeholder="Executive Director"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Title</Label>
                  <Input
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    placeholder="Community Development Initiative"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requested Amount</Label>
                  <Input
                    type="number"
                    value={formData.requestedAmount}
                    onChange={(e) => setFormData({ ...formData, requestedAmount: parseInt(e.target.value) || 0 })}
                    placeholder="500000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Start Date</Label>
                  <Input
                    type="date"
                    value={formData.projectStartDate}
                    onChange={(e) => setFormData({ ...formData, projectStartDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project End Date</Label>
                  <Input
                    type="date"
                    value={formData.projectEndDate}
                    onChange={(e) => setFormData({ ...formData, projectEndDate: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Project Summary</Label>
                  <Textarea
                    value={formData.projectSummary}
                    onChange={(e) => setFormData({ ...formData, projectSummary: e.target.value })}
                    placeholder="Brief description of the project..."
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            {/* Need Statement */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Need Statement</h3>
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  id="autoNeed"
                  checked={useAutoNeedStatement}
                  onCheckedChange={(checked) => setUseAutoNeedStatement(checked as boolean)}
                />
                <Label htmlFor="autoNeed">Use auto-populated need statement from entity profile</Label>
              </div>
              
              {!useAutoNeedStatement && (
                <Textarea
                  value={formData.customNeedStatement}
                  onChange={(e) => setFormData({ ...formData, customNeedStatement: e.target.value })}
                  placeholder="Enter custom need statement..."
                  rows={6}
                />
              )}

              {useAutoNeedStatement && prefilledData?.needStatement && (
                <div className="p-4 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-2">Auto-populated Need Statement:</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {prefilledData.needStatement.substring(0, 500)}...
                  </p>
                </div>
              )}
            </Card>

            <div className="flex justify-end">
              <Button onClick={handlePreview} disabled={!selectedEntity || !selectedTemplate}>
                <Eye className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>
            </div>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Budget Line Items
                </h3>
                <Button variant="outline" size="sm" onClick={addBudgetItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {budgetItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No budget items added. A default budget will be generated based on the entity type.</p>
                  <Button variant="outline" className="mt-4" onClick={addBudgetItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Budget Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgetItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 p-4 border rounded-lg">
                      <div className="col-span-2 space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={item.category}
                          onValueChange={(value) => updateBudgetItem(index, 'category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Personnel">Personnel</SelectItem>
                            <SelectItem value="Equipment">Equipment</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Facilities">Facilities</SelectItem>
                            <SelectItem value="Programs">Programs</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Admin">Administrative</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3 space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateBudgetItem(index, 'description', e.target.value)}
                          placeholder="Line item description"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateBudgetItem(index, 'amount', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-4 space-y-2">
                        <Label>Justification</Label>
                        <Input
                          value={item.justification}
                          onChange={(e) => updateBudgetItem(index, 'justification', e.target.value)}
                          placeholder="Why is this needed?"
                        />
                      </div>
                      <div className="col-span-1 flex items-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBudgetItem(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span className="font-semibold">Total Budget:</span>
                    <span className="text-xl font-bold">${totalBudget.toLocaleString()}</span>
                  </div>

                  {formData.requestedAmount > 0 && totalBudget !== formData.requestedAmount && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">
                        Budget total (${totalBudget.toLocaleString()}) does not match requested amount (${formData.requestedAmount.toLocaleString()})
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Application Checklist
              </h3>

              {!selectedTemplate ? (
                <p className="text-muted-foreground">Select a template to see the required checklist.</p>
              ) : (
                <div className="space-y-3">
                  {checklist?.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox id={`check-${index}`} />
                      <div className="flex-1">
                        <Label htmlFor={`check-${index}`} className="font-medium">
                          {item.item}
                          {item.required && <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Application Preview</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportJSON}>
                    <FileJson className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                  <Button size="sm" onClick={handleExportMarkdown}>
                    <Download className="w-4 h-4 mr-2" />
                    Markdown
                  </Button>
                </div>
              </div>

              {!previewContent ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No preview generated yet.</p>
                  <Button variant="outline" className="mt-4" onClick={handlePreview}>
                    Generate Preview
                  </Button>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
                    {previewContent}
                  </pre>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
