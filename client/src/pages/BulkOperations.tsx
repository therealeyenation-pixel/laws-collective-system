import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Trash2,
  Eye,
  RefreshCw,
  Users,
  FileText as DocIcon,
  DollarSign,
  Building2,
  Award,
  ClipboardList,
  Contact,
  Package,
} from "lucide-react";
import {
  bulkOperationsService,
  DataType,
  ExportFormat,
  ImportJob,
  ExportJob,
  ValidationResult,
} from "@/services/bulkOperationsService";

const dataTypeConfig: Record<DataType, { label: string; icon: React.ReactNode }> = {
  employees: { label: 'Employees', icon: <Users className="w-4 h-4" /> },
  documents: { label: 'Documents', icon: <DocIcon className="w-4 h-4" /> },
  transactions: { label: 'Transactions', icon: <DollarSign className="w-4 h-4" /> },
  entities: { label: 'Entities', icon: <Building2 className="w-4 h-4" /> },
  grants: { label: 'Grants', icon: <Award className="w-4 h-4" /> },
  tasks: { label: 'Tasks', icon: <ClipboardList className="w-4 h-4" /> },
  contacts: { label: 'Contacts', icon: <Contact className="w-4 h-4" /> },
  assets: { label: 'Assets', icon: <Package className="w-4 h-4" /> },
};

const formatConfig: Record<ExportFormat, { label: string; icon: React.ReactNode }> = {
  csv: { label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
  xlsx: { label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
  json: { label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
};

export default function BulkOperations() {
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [stats, setStats] = useState(bulkOperationsService.getStatistics());
  
  // Import dialog state
  const [importDialog, setImportDialog] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState<DataType>('employees');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  
  // Export dialog state
  const [exportDialog, setExportDialog] = useState(false);
  const [exportDataType, setExportDataType] = useState<DataType>('employees');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState(false);
  
  // Preview dialog
  const [previewJob, setPreviewJob] = useState<ImportJob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setImportJobs(bulkOperationsService.getImportJobs());
    setExportJobs(bulkOperationsService.getExportJobs());
    setStats(bulkOperationsService.getStatistics());
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationResult(null);

    // Read and validate file
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const { rows } = bulkOperationsService.parseCSV(content);
      const validation = bulkOperationsService.validateImport(selectedDataType, rows);
      setValidationResult(validation);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!selectedFile || !validationResult) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const { rows } = bulkOperationsService.parseCSV(content);
        await bulkOperationsService.createImportJob(selectedDataType, selectedFile.name, rows);
        toast.success('Import completed successfully');
        setImportDialog(false);
        setSelectedFile(null);
        setValidationResult(null);
        loadData();
      };
      reader.readAsText(selectedFile);
    } catch (error) {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await bulkOperationsService.createExportJob(exportDataType, exportFormat);
      toast.success('Export completed');
      setExportDialog(false);
      loadData();
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = (dataType: DataType) => {
    bulkOperationsService.downloadTemplate(dataType);
    toast.success('Template downloaded');
  };

  const handleDeleteImportJob = (id: string) => {
    bulkOperationsService.deleteImportJob(id);
    loadData();
    toast.success('Import job deleted');
  };

  const handleDeleteExportJob = (id: string) => {
    bulkOperationsService.deleteExportJob(id);
    loadData();
    toast.success('Export job deleted');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'processing':
      case 'validating':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6" />
              Bulk Import/Export
            </h1>
            <p className="text-muted-foreground">
              Import and export data in bulk using CSV, Excel, or JSON formats
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setExportDialog(true)}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={() => setImportDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Imports</div>
            <div className="text-2xl font-bold">{stats.totalImports}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Successful</div>
            <div className="text-2xl font-bold text-green-600">{stats.successfulImports}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Records Imported</div>
            <div className="text-2xl font-bold">{stats.totalRecordsImported}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Records Exported</div>
            <div className="text-2xl font-bold">{stats.totalRecordsExported}</div>
          </Card>
        </div>

        {/* Templates Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Download Templates</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Download CSV templates with the correct column headers for each data type
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(dataTypeConfig) as DataType[]).map(type => (
              <Button
                key={type}
                variant="outline"
                className="justify-start"
                onClick={() => handleDownloadTemplate(type)}
              >
                {dataTypeConfig[type].icon}
                <span className="ml-2">{dataTypeConfig[type].label}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Jobs Tabs */}
        <Tabs defaultValue="imports" className="w-full">
          <TabsList>
            <TabsTrigger value="imports">Import History ({importJobs.length})</TabsTrigger>
            <TabsTrigger value="exports">Export History ({exportJobs.length})</TabsTrigger>
          </TabsList>

          {/* Import Jobs */}
          <TabsContent value="imports" className="mt-4">
            {importJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No import jobs yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by importing data from a CSV file
                </p>
                <Button onClick={() => setImportDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {importJobs.map(job => (
                  <Card key={job.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {dataTypeConfig[job.dataType].icon}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{job.fileName}</span>
                            {getStatusBadge(job.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {dataTypeConfig[job.dataType].label} • {job.totalRows} rows • 
                            {new Date(job.startedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === 'completed' && (
                          <span className="text-sm text-green-600">
                            {job.successRows} imported
                          </span>
                        )}
                        {job.errors.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewJob(job)}
                          >
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="ml-1">{job.errors.length} errors</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteImportJob(job.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {['processing', 'validating'].includes(job.status) && (
                      <Progress
                        value={(job.processedRows / job.totalRows) * 100}
                        className="h-1 mt-3"
                      />
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Export Jobs */}
          <TabsContent value="exports" className="mt-4">
            {exportJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <Download className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No export jobs yet</h3>
                <p className="text-muted-foreground mb-4">
                  Export your data to CSV, Excel, or JSON format
                </p>
                <Button onClick={() => setExportDialog(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {exportJobs.map(job => (
                  <Card key={job.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {dataTypeConfig[job.dataType].icon}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {dataTypeConfig[job.dataType].label} Export
                            </span>
                            <Badge variant="outline">{job.format.toUpperCase()}</Badge>
                            {getStatusBadge(job.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {job.totalRecords} records • {new Date(job.startedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === 'completed' && job.fileName && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExportJob(job.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Import Dialog */}
        <Dialog open={importDialog} onOpenChange={setImportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Data</DialogTitle>
              <DialogDescription>
                Upload a CSV file to import data into the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Data Type Selection */}
              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select
                  value={selectedDataType}
                  onValueChange={(v) => {
                    setSelectedDataType(v as DataType);
                    setSelectedFile(null);
                    setValidationResult(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(dataTypeConfig) as DataType[]).map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {dataTypeConfig[type].icon}
                          {dataTypeConfig[type].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>CSV File</Label>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadTemplate(selectedDataType)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Template
                  </Button>
                </div>
              </div>

              {/* Validation Results */}
              {validationResult && (
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Validation Results</h4>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Rows</div>
                      <div className="font-semibold">{validationResult.totalRows}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Valid Rows</div>
                      <div className="font-semibold text-green-600">{validationResult.validRows}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                      <div className="font-semibold text-red-600">{validationResult.errors.length}</div>
                    </div>
                  </div>

                  {validationResult.errors.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-red-600 mb-1">Errors:</h5>
                      <div className="max-h-32 overflow-y-auto text-sm">
                        {validationResult.errors.slice(0, 5).map((error, i) => (
                          <div key={i} className="text-red-600">
                            Row {error.row}: {error.message} ({error.field})
                          </div>
                        ))}
                        {validationResult.errors.length > 5 && (
                          <div className="text-muted-foreground">
                            ...and {validationResult.errors.length - 5} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-amber-600 mb-1">Warnings:</h5>
                      <div className="max-h-20 overflow-y-auto text-sm">
                        {validationResult.warnings.slice(0, 3).map((warning, i) => (
                          <div key={i} className="text-amber-600">
                            Row {warning.row}: {warning.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  {validationResult.preview.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-1">Preview (first 5 rows):</h5>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(validationResult.preview[0]).map(key => (
                                <TableHead key={key} className="text-xs">{key}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {validationResult.preview.map((row, i) => (
                              <TableRow key={i}>
                                {Object.values(row).map((val, j) => (
                                  <TableCell key={j} className="text-xs">{String(val)}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!validationResult?.isValid || importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {validationResult?.validRows || 0} Rows
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={exportDialog} onOpenChange={setExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Data</DialogTitle>
              <DialogDescription>
                Export data to CSV, Excel, or JSON format
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select
                  value={exportDataType}
                  onValueChange={(v) => setExportDataType(v as DataType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(dataTypeConfig) as DataType[]).map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {dataTypeConfig[type].icon}
                          {dataTypeConfig[type].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={exportFormat}
                  onValueChange={(v) => setExportFormat(v as ExportFormat)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(formatConfig) as ExportFormat[]).map(format => (
                      <SelectItem key={format} value={format}>
                        <div className="flex items-center gap-2">
                          {formatConfig[format].icon}
                          {formatConfig[format].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={exporting}>
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Error Preview Dialog */}
        <Dialog open={!!previewJob} onOpenChange={() => setPreviewJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Errors</DialogTitle>
              <DialogDescription>
                {previewJob?.errors.length} errors found in {previewJob?.fileName}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewJob?.errors.map((error, i) => (
                    <TableRow key={i}>
                      <TableCell>{error.row}</TableCell>
                      <TableCell>{error.field}</TableCell>
                      <TableCell className="max-w-32 truncate">{error.value || '-'}</TableCell>
                      <TableCell className="text-red-600">{error.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button onClick={() => setPreviewJob(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
