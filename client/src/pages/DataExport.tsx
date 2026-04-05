import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  HardDrive,
  Calendar,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { dataExportService, EXPORTABLE_MODULES, ExportResult, ModuleExportConfig } from "@/services/dataExportService";
import { format } from "date-fns";

export default function DataExportPage() {
  const [modules, setModules] = useState<ModuleExportConfig[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportHistory, setExportHistory] = useState<ExportResult[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadModules();
    loadHistory();
  }, []);

  const loadModules = () => {
    const mods = dataExportService.getExportableModules();
    setModules(mods);
  };

  const loadHistory = () => {
    setExportHistory(dataExportService.getExportHistory());
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectAllModules = () => {
    setSelectedModules(modules.map(m => m.id));
  };

  const deselectAllModules = () => {
    setSelectedModules([]);
  };

  const handleExport = async () => {
    if (selectedModules.length === 0) {
      toast.error("Please select at least one module to export");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await dataExportService.generateExport({
        format: exportFormat,
        modules: selectedModules,
        includeMetadata,
        includeAttachments,
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      toast.success(`Export complete: ${result.filename}`);
      loadHistory();

      // Simulate download
      setTimeout(() => {
        toast.info("Download started", { description: result.filename });
      }, 500);
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    setExportProgress(0);

    const progressInterval = setInterval(() => {
      setExportProgress(prev => Math.min(prev + 5, 90));
    }, 300);

    try {
      const result = await dataExportService.exportAll(exportFormat);
      clearInterval(progressInterval);
      setExportProgress(100);

      toast.success("Full system export complete", { description: result.filename });
      loadHistory();
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }

    setIsImporting(true);

    try {
      const validation = await dataExportService.validateImportFile(importFile);
      
      if (!validation.valid) {
        toast.error("Invalid file", { description: validation.errors[0] });
        return;
      }

      const result = await dataExportService.importData(importFile, {
        overwrite: false,
        validate: true,
      });

      if (result.success) {
        toast.success(`Import complete: ${result.recordsImported} records imported`);
        if (result.warnings.length > 0) {
          toast.warning(result.warnings[0]);
        }
      }
    } catch (error) {
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
      setImportFile(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalRecords = modules.reduce((sum, m) => sum + m.estimatedRecords, 0);
  const selectedRecords = modules
    .filter(m => selectedModules.includes(m.id))
    .reduce((sum, m) => sum + m.estimatedRecords, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Database className="w-8 h-8 text-primary" />
              Data Export & Import
            </h1>
            <p className="text-muted-foreground mt-1">
              Export your data for backup, migration, or offline access
            </p>
          </div>
          <Button onClick={handleExportAll} disabled={isExporting} variant="outline">
            <Package className="w-4 h-4 mr-2" />
            Export Everything
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{modules.length}</p>
                  <p className="text-xs text-muted-foreground">Modules</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <HardDrive className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedModules.length}</p>
                  <p className="text-xs text-muted-foreground">Selected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{exportHistory.length}</p>
                  <p className="text-xs text-muted-foreground">Exports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="export" className="space-y-4">
          <TabsList>
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="w-4 h-4 mr-2" />
              Export History
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Module Selection */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Select Modules</CardTitle>
                      <CardDescription>Choose which data to include in the export</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={selectAllModules}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAllModules}>
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {modules.map((module) => (
                        <div
                          key={module.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedModules.includes(module.id)
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleModule(module.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedModules.includes(module.id)}
                              onCheckedChange={() => toggleModule(module.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{module.name}</p>
                                <Badge variant="outline">
                                  {module.estimatedRecords.toLocaleString()} records
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {module.description}
                              </p>
                              <div className="flex gap-1 mt-2">
                                {module.tables.slice(0, 3).map((table) => (
                                  <Badge key={table} variant="secondary" className="text-xs">
                                    {table}
                                  </Badge>
                                ))}
                                {module.tables.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{module.tables.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Export Options */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={exportFormat === 'json' ? 'default' : 'outline'}
                          onClick={() => setExportFormat('json')}
                          className="justify-start"
                        >
                          <FileJson className="w-4 h-4 mr-2" />
                          JSON
                        </Button>
                        <Button
                          variant={exportFormat === 'csv' ? 'default' : 'outline'}
                          onClick={() => setExportFormat('csv')}
                          className="justify-start"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          CSV
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="metadata"
                          checked={includeMetadata}
                          onCheckedChange={(c) => setIncludeMetadata(c as boolean)}
                        />
                        <Label htmlFor="metadata">Include metadata</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="attachments"
                          checked={includeAttachments}
                          onCheckedChange={(c) => setIncludeAttachments(c as boolean)}
                        />
                        <Label htmlFor="attachments">Include file attachments</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Export Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Modules selected</span>
                        <span className="font-medium">{selectedModules.length} / {modules.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Records to export</span>
                        <span className="font-medium">{selectedRecords.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Estimated size</span>
                        <span className="font-medium">
                          {formatBytes(selectedRecords * (exportFormat === 'json' ? 500 : 200))}
                        </span>
                      </div>
                    </div>

                    {isExporting && (
                      <div className="space-y-2">
                        <Progress value={exportProgress} />
                        <p className="text-xs text-center text-muted-foreground">
                          Exporting... {exportProgress}%
                        </p>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={handleExport}
                      disabled={isExporting || selectedModules.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isExporting ? 'Exporting...' : 'Export Selected'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Data Portability</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Your exported data can be imported into any compatible system or used for offline backup.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <CardDescription>
                  Restore data from a previous export or migrate from another system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Upload Export File</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports JSON and ZIP files from previous exports
                  </p>
                  <input
                    type="file"
                    accept=".json,.zip"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="import-file"
                  />
                  <Label htmlFor="import-file" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>Select File</span>
                    </Button>
                  </Label>
                  {importFile && (
                    <div className="mt-4 p-3 bg-muted rounded-lg inline-block">
                      <p className="text-sm font-medium">{importFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(importFile.size)}
                      </p>
                    </div>
                  )}
                </div>

                {importFile && (
                  <div className="flex justify-center">
                    <Button onClick={handleImport} disabled={isImporting}>
                      {isImporting ? 'Importing...' : 'Start Import'}
                    </Button>
                  </div>
                )}

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-100">Important</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Importing data will add records to your existing data. Duplicate records will be skipped. 
                        Consider creating a backup before importing large datasets.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Export History</CardTitle>
                <CardDescription>Previous exports and their download links</CardDescription>
              </CardHeader>
              <CardContent>
                {exportHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No exports yet</p>
                    <p className="text-sm">Your export history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exportHistory.map((exp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium">{exp.filename}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(exp.exportedAt, 'MMM d, yyyy h:mm a')}
                              </span>
                              <span>{formatBytes(exp.size)}</span>
                              <span>{exp.recordCount.toLocaleString()} records</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
