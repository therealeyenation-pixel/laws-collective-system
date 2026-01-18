import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import EntityDocuments from "../components/EntityDocuments";
import { trpc } from "../lib/trpc";
import { 
  FileText, 
  Folder, 
  Plus, 
  Lock, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Clock,
  Shield,
  Search,
  Filter,
  X,
  Save,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";

type DocumentType = "business_plan" | "grant_application" | "financial_statement" | "legal_document" | "contract" | "certificate" | "report" | "template" | "other";

const documentTypeLabels: Record<DocumentType, string> = {
  business_plan: "Business Plan",
  grant_application: "Grant Application",
  financial_statement: "Financial Statement",
  legal_document: "Legal Document",
  contract: "Contract",
  certificate: "Certificate",
  report: "Report",
  template: "Template",
  other: "Other",
};

const documentTypeColors: Record<DocumentType, string> = {
  business_plan: "bg-blue-100 text-blue-800",
  grant_application: "bg-green-100 text-green-800",
  financial_statement: "bg-emerald-100 text-emerald-800",
  legal_document: "bg-red-100 text-red-800",
  contract: "bg-orange-100 text-orange-800",
  certificate: "bg-yellow-100 text-yellow-800",
  report: "bg-gray-100 text-gray-800",
  template: "bg-indigo-100 text-indigo-800",
  other: "bg-slate-100 text-slate-800",
};

interface Document {
  id: number;
  title: string;
  description: string | null;
  documentType: string;
  content: string | null;
  status: string;
  accessLevel: string;
  version: number;
  blockchainHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function DocumentVault() {
  const [activeTab, setActiveTab] = useState<"documents" | "folders" | "entities">("documents");
  const [selectedType, setSelectedType] = useState<DocumentType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newDocument, setNewDocument] = useState({
    title: "",
    description: "",
    documentType: "business_plan" as DocumentType,
    content: "",
    status: "draft" as "draft" | "final" | "archived",
    accessLevel: "owner_only" as "owner_only" | "entity_members" | "authorized_users" | "public",
  });

  const { data: documents, isLoading: docsLoading, refetch: refetchDocs } = trpc.documentVault.getDocuments.useQuery();
  const { data: folders, isLoading: foldersLoading } = trpc.documentVault.getFolders.useQuery();
  const { data: stats } = trpc.documentVault.getStats.useQuery();

  const createDocumentMutation = trpc.documentVault.createDocument.useMutation({
    onSuccess: () => {
      setShowCreateModal(false);
      setNewDocument({
        title: "",
        description: "",
        documentType: "business_plan",
        content: "",
        status: "draft",
        accessLevel: "owner_only",
      });
      refetchDocs();
      toast.success("Document created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create document");
    },
  });

  const updateDocumentMutation = trpc.documentVault.updateDocument.useMutation({
    onSuccess: () => {
      setEditingDocument(null);
      setEditContent("");
      refetchDocs();
      toast.success("Document updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update document");
    },
  });

  const deleteDocumentMutation = trpc.documentVault.deleteDocument.useMutation({
    onSuccess: () => {
      refetchDocs();
      toast.success("Document deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete document");
    },
  });

  const seedDocumentsMutation = trpc.documentVault.seedDocuments.useMutation({
    onSuccess: (data) => {
      if (data.count > 0) {
        refetchDocs();
        toast.success(`Created ${data.count} documents`);
      } else {
        toast.info("Documents already exist");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to seed documents");
    },
  });

  const filteredDocuments = documents?.filter(doc => {
    const matchesType = selectedType === "all" || doc.documentType === selectedType;
    const matchesSearch = searchQuery === "" || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch && doc.status !== "archived";
  });

  const handleCreateDocument = () => {
    if (!newDocument.title) return;
    createDocumentMutation.mutate(newDocument);
  };

  const handleViewDocument = (doc: Document) => {
    setViewingDocument(doc);
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setEditContent(doc.content || "");
  };

  const handleSaveEdit = () => {
    if (!editingDocument) return;
    updateDocumentMutation.mutate({
      documentId: editingDocument.id,
      content: editContent,
    });
  };

  const handleSignDocument = (doc: Document) => {
    toast.info("Document signing feature coming soon");
  };

  const handleDownloadDocument = (doc: Document) => {
    const content = doc.content || `# ${doc.title}\n\n${doc.description || "No content available."}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Document downloaded");
  };

  const handleDeleteDocument = (doc: Document) => {
    if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      deleteDocumentMutation.mutate({ documentId: doc.id });
    }
  };

  // Document Viewer Modal
  if (viewingDocument) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setViewingDocument(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{viewingDocument.title}</h1>
                <p className="text-sm text-gray-600">{viewingDocument.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSignDocument(viewingDocument)}
                  className="p-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  title="Sign this document digitally"
                >
                  <Shield className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleEditDocument(viewingDocument)}
                  className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDownloadDocument(viewingDocument)}
                  className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Meta */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${documentTypeColors[viewingDocument.documentType as DocumentType]}`}>
                {documentTypeLabels[viewingDocument.documentType as DocumentType]}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                viewingDocument.status === "final" ? "bg-green-100 text-green-800" :
                viewingDocument.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {viewingDocument.status}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                <Lock className="w-4 h-4" />
                {viewingDocument.accessLevel.replace("_", " ")}
              </span>
              {viewingDocument.blockchainHash && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                  <Shield className="w-4 h-4" />
                  Verified
                </span>
              )}
            </div>

            {/* Document Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="prose prose-green max-w-none">
                {viewingDocument.content ? (
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                    {viewingDocument.content}
                  </pre>
                ) : (
                  <p className="text-gray-500 italic">No content available for this document.</p>
                )}
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
              <span>Version {viewingDocument.version}</span>
              <span>Last updated: {new Date(viewingDocument.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Document Editor Modal
  if (editingDocument) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setEditingDocument(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Editing: {editingDocument.title}</h1>
                <p className="text-sm text-gray-600">Make changes and save</p>
              </div>
              <button
                onClick={handleSaveEdit}
                disabled={updateDocumentMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {updateDocumentMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-[60vh] p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm resize-none"
                placeholder="Enter document content..."
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Vault</h1>
            <p className="text-gray-600">Secure storage for business plans and documents</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-3 rounded-lg hover:bg-green-800 transition-colors min-h-[48px]"
          >
            <Plus className="w-5 h-5" />
            New Document
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalDocuments || 0}</p>
                <p className="text-sm text-gray-600">Documents</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Folder className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalFolders || 0}</p>
                <p className="text-sm text-gray-600">Folders</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.byStatus?.final || 0}</p>
                <p className="text-sm text-gray-600">Finalized</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Lock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.byType?.business_plan || 0}</p>
                <p className="text-sm text-gray-600">Business Plans</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocumentType | "all")}
              className="border border-gray-200 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              {Object.entries(documentTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab("documents")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "documents"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Documents
            </button>
<button
              onClick={() => setActiveTab("folders")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "folders"
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Folders
            </button>
            <button
              onClick={() => setActiveTab("entities")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "entities"
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Entity Documents
            </button>
          </nav>
        </div>

        {/* Documents List */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            {docsLoading ? (
              <div className="text-center py-12 text-gray-500">Loading documents...</div>
            ) : !documents || documents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
                <p className="text-gray-500 mb-6">Initialize your vault with business plans and grant templates</p>
                <button
                  onClick={() => seedDocumentsMutation.mutate()}
                  disabled={seedDocumentsMutation.isPending}
                  className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 min-h-[48px]"
                >
                  {seedDocumentsMutation.isPending ? "Creating Documents..." : "Seed Business Plans & Templates"}
                </button>
              </div>
            ) : filteredDocuments && filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div 
                      className="flex items-start gap-4 flex-1 cursor-pointer"
                      onClick={() => handleViewDocument(doc as Document)}
                    >
                      <div className="p-3 bg-gray-100 rounded-lg shrink-0">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 hover:text-green-700">{doc.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.description || "No description"}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${documentTypeColors[doc.documentType as DocumentType]}`}>
                            {documentTypeLabels[doc.documentType as DocumentType]}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doc.status === "final" ? "bg-green-100 text-green-800" :
                            doc.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {doc.status}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Lock className="w-3 h-3" />
                            {doc.accessLevel.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </span>
                          <span>Version {doc.version}</span>
                          {doc.blockchainHash && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Shield className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleViewDocument(doc as Document); }}
                        className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors"
                        title="View document"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditDocument(doc as Document); }}
                        className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-100 active:bg-green-200 transition-colors"
                        title="Edit document"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownloadDocument(doc as Document); }}
                        className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 active:bg-emerald-200 transition-colors"
                        title="Download document"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc as Document); }}
                        className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matching documents</h3>
                <p className="text-gray-500">Try adjusting your search or filter</p>
              </div>
            )}
          </div>
        )}

        {/* Folders List */}
        {activeTab === "folders" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {foldersLoading ? (
              <div className="col-span-full text-center py-12 text-gray-500">Loading folders...</div>
            ) : folders && folders.length > 0 ? (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: folder.color || "#F3F4F6" }}>
                      <Folder className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{folder.name}</h3>
                      <p className="text-xs text-gray-500">{folder.description || "No description"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
                <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
                <p className="text-gray-500">Organize your documents with folders</p>
              </div>
            )}
          </div>
        )}

        {/* Entity Documents Tab */}
        {activeTab === "entities" && (
          <EntityDocuments />
        )}

        {/* Create Document Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create New Document</h2>
                  <p className="text-gray-600 text-sm mt-1">Add a new document to your secure vault</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter document title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Brief description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <select
                      value={newDocument.documentType}
                      onChange={(e) => setNewDocument({ ...newDocument, documentType: e.target.value as DocumentType })}
                      className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {Object.entries(documentTypeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                    <select
                      value={newDocument.accessLevel}
                      onChange={(e) => setNewDocument({ ...newDocument, accessLevel: e.target.value as any })}
                      className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="owner_only">Owner Only</option>
                      <option value="entity_members">Entity Members</option>
                      <option value="authorized_users">Authorized Users</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newDocument.content}
                    onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                    rows={10}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                    placeholder="Enter document content..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDocument}
                  disabled={!newDocument.title || createDocumentMutation.isPending}
                  className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 min-h-[48px]"
                >
                  {createDocumentMutation.isPending ? "Creating..." : "Create Document"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
