import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
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
  Filter
} from "lucide-react";

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
  financial_statement: "bg-purple-100 text-purple-800",
  legal_document: "bg-red-100 text-red-800",
  contract: "bg-orange-100 text-orange-800",
  certificate: "bg-yellow-100 text-yellow-800",
  report: "bg-gray-100 text-gray-800",
  template: "bg-indigo-100 text-indigo-800",
  other: "bg-slate-100 text-slate-800",
};

export default function DocumentVault() {
  const [activeTab, setActiveTab] = useState<"documents" | "folders" | "create">("documents");
  const [selectedType, setSelectedType] = useState<DocumentType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    },
  });

  const deleteDocumentMutation = trpc.documentVault.deleteDocument.useMutation({
    onSuccess: () => {
      refetchDocs();
    },
  });

  const seedDocumentsMutation = trpc.documentVault.seedDocuments.useMutation({
    onSuccess: (data) => {
      if (data.count > 0) {
        refetchDocs();
      }
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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Secure Document Vault</h1>
            <p className="text-gray-600">Private storage for business plans, grants, and sensitive documents</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lock className="w-5 h-5 text-purple-600" />
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocumentType | "all")}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "folders"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Folders
            </button>
          </nav>
        </div>

        {/* Documents List */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            {docsLoading ? (
              <div className="text-center py-12 text-gray-500">Loading documents...</div>
            ) : !documents || documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
                <p className="text-gray-500 mb-4">Initialize your vault with business plans and grant templates</p>
                <button
                  onClick={() => seedDocumentsMutation.mutate()}
                  disabled={seedDocumentsMutation.isPending}
                  className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
                >
                  {seedDocumentsMutation.isPending ? "Creating Documents..." : "Initialize Document Vault"}
                </button>
              </div>
            ) : filteredDocuments && filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{doc.description || "No description"}</p>
                        <div className="flex items-center gap-2 mt-2">
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
                              Blockchain verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteDocumentMutation.mutate({ documentId: doc.id })}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                <p className="text-gray-500 mb-4">Create your first document to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Document
                </button>
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
              <div className="col-span-full text-center py-12">
                <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
                <p className="text-gray-500">Organize your documents with folders</p>
              </div>
            )}
          </div>
        )}

        {/* Create Document Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Create New Document</h2>
                <p className="text-gray-600 text-sm mt-1">Add a new document to your secure vault</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter document title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Brief description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <select
                      value={newDocument.documentType}
                      onChange={(e) => setNewDocument({ ...newDocument, documentType: e.target.value as DocumentType })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                    placeholder="Enter document content (Markdown supported)"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDocument}
                  disabled={!newDocument.title || createDocumentMutation.isPending}
                  className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
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
