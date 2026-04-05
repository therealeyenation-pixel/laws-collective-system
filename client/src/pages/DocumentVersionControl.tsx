import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GitBranch, 
  Clock, 
  User, 
  FileText, 
  RotateCcw,
  GitCompare,
  Plus,
  Minus,
  Edit3,
  Search,
  Tag,
  BarChart3,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  documentVersionService, 
  DocumentVersion, 
  VersionHistory,
  VersionDiff 
} from "@/services/documentVersionService";

export default function DocumentVersionControlPage() {
  const { user } = useAuth();
  const [documentId, setDocumentId] = useState("");
  const [history, setHistory] = useState<VersionHistory | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [compareVersionA, setCompareVersionA] = useState<number | null>(null);
  const [compareVersionB, setCompareVersionB] = useState<number | null>(null);
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false);
  const [rollbackReason, setRollbackReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadDocumentHistory = () => {
    if (!documentId) {
      toast.error("Please enter a document ID");
      return;
    }
    const docHistory = documentVersionService.getVersionHistory(documentId);
    setHistory(docHistory);
    if (docHistory.versions.length > 0) {
      setSelectedVersion(docHistory.versions[docHistory.versions.length - 1]);
    }
    toast.success(`Loaded ${docHistory.totalVersions} versions`);
  };

  const handleCompare = () => {
    if (!documentId || compareVersionA === null || compareVersionB === null) {
      toast.error("Please select two versions to compare");
      return;
    }
    const comparison = documentVersionService.compareVersions(documentId, compareVersionA, compareVersionB);
    setDiff(comparison);
  };

  const handleRollback = () => {
    if (!selectedVersion || !user) return;
    
    const result = documentVersionService.rollback(
      documentId,
      selectedVersion.versionNumber,
      user.id.toString(),
      user.name || 'Unknown User',
      rollbackReason
    );

    if (result.success) {
      toast.success(result.message);
      loadDocumentHistory();
      setIsRollbackDialogOpen(false);
      setRollbackReason("");
    } else {
      toast.error(result.message);
    }
  };

  const handleAddAnnotation = (versionNumber: number, annotation: string) => {
    if (documentVersionService.addAnnotation(documentId, versionNumber, annotation)) {
      toast.success("Annotation added");
      loadDocumentHistory();
    }
  };

  const filteredVersions = history?.versions.filter(v =>
    v.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.createdByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const stats = documentId ? documentVersionService.getVersionStats(documentId) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Document Version Control</h1>
            <p className="text-muted-foreground mt-1">
              Track changes, compare versions, and rollback documents
            </p>
          </div>
        </div>

        {/* Document Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Document ID</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="Enter document ID to view version history"
                  />
                  <Button onClick={loadDocumentHistory}>
                    <GitBranch className="w-4 h-4 mr-2" />
                    Load History
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {history && (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <GitBranch className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalVersions}</p>
                        <p className="text-sm text-muted-foreground">Total Versions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Edit3 className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalChanges}</p>
                        <p className="text-sm text-muted-foreground">Total Changes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold truncate">
                          {stats.mostActiveEditor?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">Most Active Editor</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.averageChangesPerVersion.toFixed(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">Avg Changes/Version</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Tabs defaultValue="history">
              <TabsList>
                <TabsTrigger value="history">
                  <Clock className="w-4 h-4 mr-2" />
                  Version History
                </TabsTrigger>
                <TabsTrigger value="compare">
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare Versions
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              {/* Version History Tab */}
              <TabsContent value="history" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Version List */}
                  <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Versions</CardTitle>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search versions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-2">
                          {filteredVersions.map((version) => (
                            <div
                              key={version.id}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedVersion?.id === version.id
                                  ? 'bg-primary/10 border border-primary'
                                  : 'bg-muted/50 hover:bg-muted'
                              }`}
                              onClick={() => setSelectedVersion(version)}
                            >
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">v{version.versionNumber}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {version.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm font-medium mt-2 line-clamp-1">
                                {version.comment || 'No comment'}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <User className="w-3 h-3" />
                                {version.createdByName}
                              </div>
                              <div className="flex gap-1 mt-2">
                                {version.changes.filter(c => c.type === 'added').length > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                    +{version.changes.filter(c => c.type === 'added').length}
                                  </Badge>
                                )}
                                {version.changes.filter(c => c.type === 'removed').length > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                    -{version.changes.filter(c => c.type === 'removed').length}
                                  </Badge>
                                )}
                                {version.changes.filter(c => c.type === 'modified').length > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                    ~{version.changes.filter(c => c.type === 'modified').length}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Version Details */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>
                            {selectedVersion ? `Version ${selectedVersion.versionNumber}` : 'Select a Version'}
                          </CardTitle>
                          <CardDescription>
                            {selectedVersion?.comment || 'View version details and content'}
                          </CardDescription>
                        </div>
                        {selectedVersion && selectedVersion.versionNumber !== history.currentVersion && (
                          <Dialog open={isRollbackDialogOpen} onOpenChange={setIsRollbackDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Rollback to This Version
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Rollback to Version {selectedVersion.versionNumber}</DialogTitle>
                                <DialogDescription>
                                  This will create a new version with the content from version {selectedVersion.versionNumber}.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Reason for Rollback</Label>
                                  <Textarea
                                    value={rollbackReason}
                                    onChange={(e) => setRollbackReason(e.target.value)}
                                    placeholder="Explain why you're rolling back..."
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRollbackDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleRollback}>
                                  Confirm Rollback
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedVersion ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Created By</p>
                              <p className="font-medium">{selectedVersion.createdByName}</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Created At</p>
                              <p className="font-medium">
                                {selectedVersion.createdAt.toLocaleString()}
                              </p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Size</p>
                              <p className="font-medium">
                                {(selectedVersion.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Hash</p>
                              <p className="font-medium font-mono text-sm">
                                {selectedVersion.contentHash}
                              </p>
                            </div>
                          </div>

                          {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedVersion.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div>
                            <Label className="mb-2 block">Changes in This Version</Label>
                            <ScrollArea className="h-[200px] border rounded-lg p-3">
                              {selectedVersion.changes.map((change, i) => (
                                <div key={i} className="flex items-start gap-2 py-1">
                                  {change.type === 'added' && (
                                    <Plus className="w-4 h-4 text-green-500 mt-0.5" />
                                  )}
                                  {change.type === 'removed' && (
                                    <Minus className="w-4 h-4 text-red-500 mt-0.5" />
                                  )}
                                  {change.type === 'modified' && (
                                    <Edit3 className="w-4 h-4 text-yellow-500 mt-0.5" />
                                  )}
                                  <div className="flex-1 text-sm">
                                    {change.lineNumber && (
                                      <span className="text-muted-foreground">
                                        Line {change.lineNumber}:
                                      </span>
                                    )}
                                    {change.type === 'modified' ? (
                                      <div>
                                        <div className="text-red-600 line-through">{change.oldValue}</div>
                                        <div className="text-green-600">{change.newValue}</div>
                                      </div>
                                    ) : (
                                      <span className={change.type === 'added' ? 'text-green-600' : 'text-red-600'}>
                                        {change.newValue || change.oldValue}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </ScrollArea>
                          </div>

                          <div>
                            <Label className="mb-2 block">Content Preview</Label>
                            <ScrollArea className="h-[200px] border rounded-lg">
                              <pre className="p-3 text-sm whitespace-pre-wrap">
                                {selectedVersion.content}
                              </pre>
                            </ScrollArea>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                          Select a version to view details
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Compare Tab */}
              <TabsContent value="compare" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Compare Versions</CardTitle>
                    <CardDescription>
                      Select two versions to see the differences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label>Version A (Older)</Label>
                        <Select
                          value={compareVersionA?.toString() || ""}
                          onValueChange={(v) => setCompareVersionA(parseInt(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select version" />
                          </SelectTrigger>
                          <SelectContent>
                            {history.versions.map((v) => (
                              <SelectItem key={v.id} value={v.versionNumber.toString()}>
                                v{v.versionNumber} - {v.createdAt.toLocaleDateString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label>Version B (Newer)</Label>
                        <Select
                          value={compareVersionB?.toString() || ""}
                          onValueChange={(v) => setCompareVersionB(parseInt(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select version" />
                          </SelectTrigger>
                          <SelectContent>
                            {history.versions.map((v) => (
                              <SelectItem key={v.id} value={v.versionNumber.toString()}>
                                v{v.versionNumber} - {v.createdAt.toLocaleDateString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleCompare}>
                          <GitCompare className="w-4 h-4 mr-2" />
                          Compare
                        </Button>
                      </div>
                    </div>

                    {diff && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex gap-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            +{diff.additions} additions
                          </Badge>
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            -{diff.deletions} deletions
                          </Badge>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            ~{diff.modifications} modifications
                          </Badge>
                        </div>

                        <ScrollArea className="h-[400px] border rounded-lg">
                          <div className="p-4 font-mono text-sm">
                            {diff.changes.map((line, i) => (
                              <div
                                key={i}
                                className={`py-0.5 px-2 ${
                                  line.type === 'added' ? 'bg-green-100 dark:bg-green-900/30' :
                                  line.type === 'removed' ? 'bg-red-100 dark:bg-red-900/30' :
                                  line.type === 'modified' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                  ''
                                }`}
                              >
                                <span className="text-muted-foreground w-8 inline-block">
                                  {line.lineNumber}
                                </span>
                                {line.type === 'modified' ? (
                                  <>
                                    <span className="text-red-600 line-through">{line.oldContent}</span>
                                    <span className="mx-2">→</span>
                                    <span className="text-green-600">{line.newContent}</span>
                                  </>
                                ) : (
                                  <span className={
                                    line.type === 'added' ? 'text-green-600' :
                                    line.type === 'removed' ? 'text-red-600' :
                                    ''
                                  }>
                                    {line.type === 'added' && '+ '}
                                    {line.type === 'removed' && '- '}
                                    {line.newContent || line.oldContent}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Version Timeline</CardTitle>
                    <CardDescription>
                      Visual history of document changes over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-6">
                        {documentVersionService.getVersionTimeline(documentId).map(({ date, versions }) => (
                          <div key={date}>
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{date}</span>
                              <Badge variant="outline">{versions.length} versions</Badge>
                            </div>
                            <div className="ml-6 border-l-2 border-muted pl-4 space-y-3">
                              {versions.map((version) => (
                                <div
                                  key={version.id}
                                  className="relative p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                                  onClick={() => {
                                    setSelectedVersion(version);
                                  }}
                                >
                                  <div className="absolute -left-6 top-4 w-3 h-3 bg-primary rounded-full" />
                                  <div className="flex items-center justify-between">
                                    <Badge>v{version.versionNumber}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {version.createdAt.toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-2">{version.comment || 'No comment'}</p>
                                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <User className="w-3 h-3" />
                                    {version.createdByName}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
