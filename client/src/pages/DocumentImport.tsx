import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Scan,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Download,
  Trash2,
  Eye,
  FileSpreadsheet,
  Settings,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import { ocrImportService, OCRResult, ImportTemplate } from "@/services/ocrImportService";
import { format } from "date-fns";

export default function DocumentImportPage() {
  const [results, setResults] = useState<OCRResult[]>([]);
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<OCRResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setResults(ocrImportService.getResults());
    setTemplates(ocrImportService.getTemplates());
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  }, [selectedTemplate]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const result = await ocrImportService.processFile(files[i], selectedTemplate || undefined);
        setUploadProgress(((i + 1) / files.length) * 100);
        
        if (result.status === 'completed') {
          toast.success(`Processed: ${result.fileName}`);
        } else {
          toast.error(`Failed: ${result.fileName}`);
        }
      }
      
      loadData();
    } catch (error) {
      toast.error("Processing failed");
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteResult = (id: string) => {
    const updatedResults = results.filter(r => r.id !== id);
    localStorage.setItem('ocr_results', JSON.stringify(updatedResults));
    setResults(updatedResults);
    if (selectedResult?.id === id) {
      setSelectedResult(null);
    }
    toast.success("Result deleted");
  };

  const handleExportResults = () => {
    const csv = [
      ['File Name', 'Type', 'Status', 'Confidence', 'Extracted Text', 'Processed At'].join(','),
      ...results.map(r => [
        r.fileName,
        r.fileType,
        r.status,
        Math.round(r.confidence * 100) + '%',
        `"${r.extractedText.replace(/"/g, '""').substring(0, 500)}"`,
        r.processedAt ? format(r.processedAt, 'yyyy-MM-dd HH:mm') : '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr-results-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Scan className="w-8 h-8 text-primary" />
              Document Import & OCR
            </h1>
            <p className="text-muted-foreground mt-1">
              Scan documents, extract text with OCR, and import data into the system
            </p>
          </div>
          {results.length > 0 && (
            <Button variant="outline" onClick={handleExportResults}>
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Drag and drop files or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Import Template (Optional)</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="">Auto-detect document type</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
                  onChange={handleFileSelect}
                />
                
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  {dragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports PDF, PNG, JPG, TIFF, BMP
                </p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                  disabled={isProcessing}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </div>

              {/* Progress */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing documents...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Import Templates
              </CardTitle>
              <CardDescription>
                Pre-configured extraction rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {template.fields.length} fields
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.documentType}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
            <CardDescription>
              Previously processed documents ({results.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No documents processed yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload documents to extract text and data
                </p>
              </div>
            ) : (
              <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="detail">Detail View</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {results.map(result => (
                        <div
                          key={result.id}
                          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedResult?.id === result.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedResult(result)}
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <h4 className="font-medium">{result.fileName}</h4>
                              <p className="text-xs text-muted-foreground">
                                {result.processedAt 
                                  ? format(result.processedAt, 'PPp')
                                  : 'Processing...'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(result.status)}>
                              {result.status}
                            </Badge>
                            {result.status === 'completed' && (
                              <Badge variant="outline">
                                {Math.round(result.confidence * 100)}% confidence
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResult(result.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="detail">
                  {selectedResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{selectedResult.fileName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {(selectedResult.fileSize / 1024).toFixed(1)} KB • {selectedResult.fileType}
                          </p>
                        </div>
                        <Badge className={getStatusColor(selectedResult.status)}>
                          {selectedResult.status}
                        </Badge>
                      </div>

                      {selectedResult.extractedData.documentType && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">
                            <strong>Detected Type:</strong> {selectedResult.extractedData.documentType}
                          </p>
                        </div>
                      )}

                      {/* Extracted Data */}
                      {selectedResult.extractedData.amounts && selectedResult.extractedData.amounts.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Extracted Amounts</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedResult.extractedData.amounts.map((amount, idx) => (
                              <Badge key={idx} variant="outline">
                                ${amount.value.toLocaleString()} {amount.currency}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extracted Text */}
                      <div>
                        <h4 className="font-medium mb-2">Extracted Text</h4>
                        <ScrollArea className="h-[200px] border rounded-lg p-4">
                          <pre className="text-sm whitespace-pre-wrap font-mono">
                            {selectedResult.extractedText}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Eye className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">
                        Select a document to view details
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
