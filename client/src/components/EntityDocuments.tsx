import { useState } from "react";
import {
  FileText,
  Upload,
  Building2,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Folder,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface EntityDocument {
  id: string;
  name: string;
  type: "articles_of_organization" | "ein_letter" | "operating_agreement" | "certificate" | "annual_report" | "other";
  status: "verified" | "pending" | "missing";
  uploadDate?: string;
  fileUrl?: string;
  notes?: string;
}

interface Entity {
  id: string;
  name: string;
  shortName: string;
  type: string;
  state: string;
  status: string;
  ein?: string;
  controlNumber?: string;
  formationDate?: string;
  documents: EntityDocument[];
}

const documentTypeLabels: Record<string, string> = {
  articles_of_organization: "Articles of Organization",
  ein_letter: "EIN Confirmation Letter",
  operating_agreement: "Operating Agreement",
  certificate: "Certificate of Formation",
  annual_report: "Annual Report",
  other: "Other Document",
};

const documentTypeIcons: Record<string, string> = {
  articles_of_organization: "📜",
  ein_letter: "📋",
  operating_agreement: "📑",
  certificate: "🏆",
  annual_report: "📊",
  other: "📄",
};

// Entity data with formation documents
const entities: Entity[] = [
  {
    id: "trust",
    name: "Calea Freeman Family Trust",
    shortName: "98 Trust",
    type: "Foreign Grantor Trust",
    state: "Jamaica",
    status: "Active",
    ein: "98-6109577",
    formationDate: "03/04/2019",
    documents: [
      { id: "trust-1", name: "SS-4 Application (EIN)", type: "ein_letter", status: "verified", uploadDate: "2022-07-08", fileUrl: "/documents/formation/Calea_Freeman_Trust_EIN.pdf" },
      { id: "trust-2", name: "Trust Declaration", type: "articles_of_organization", status: "pending" },
      { id: "trust-3", name: "Trust Agreement", type: "operating_agreement", status: "missing" },
    ],
  },
  {
    id: "luvonpurpose",
    name: "LuvOnPurpose Autonomous Wealth System LLC",
    shortName: "LuvOnPurpose LLC",
    type: "Delaware LLC",
    state: "Delaware",
    status: "Active",
    controlNumber: "10252584",
    formationDate: "07/08/2025",
    documents: [
      { id: "lop-1", name: "Certificate of Formation", type: "certificate", status: "verified", uploadDate: "2025-07-08", fileUrl: "/documents/formation/LuvOnPurpose_LLC_Certificate.pdf" },
      { id: "lop-2", name: "EIN Confirmation Letter", type: "ein_letter", status: "missing" },
      { id: "lop-3", name: "Operating Agreement", type: "operating_agreement", status: "pending" },
    ],
  },
  {
    id: "laws",
    name: "The L.A.W.S. Collective, LLC",
    shortName: "L.A.W.S. Collective",
    type: "Delaware LLC",
    state: "Delaware",
    status: "Active",
    ein: "39-3122993",
    controlNumber: "10251122",
    formationDate: "07/07/2025",
    documents: [
      { id: "laws-1", name: "Certificate of Formation", type: "certificate", status: "verified", uploadDate: "2025-07-07", fileUrl: "/documents/formation/LAWS_Collective_LLC_Certificate.pdf" },
      { id: "laws-2", name: "EIN Confirmation Letter", type: "ein_letter", status: "verified", uploadDate: "2025-07-07", fileUrl: "/documents/formation/LAWS_Collective_EIN.pdf" },
      { id: "laws-3", name: "Operating Agreement", type: "operating_agreement", status: "pending" },
    ],
  },
  {
    id: "realeye",
    name: "Real-Eye-Nation LLC",
    shortName: "Real-Eye-Nation",
    type: "Georgia LLC",
    state: "Georgia",
    status: "Active",
    ein: "84-4976416",
    controlNumber: "20031738",
    formationDate: "03/03/2020",
    documents: [
      { id: "ren-1", name: "Articles of Organization", type: "articles_of_organization", status: "verified", uploadDate: "2020-03-03", fileUrl: "/documents/formation/RealEyeNation_LLC_Articles.pdf" },
      { id: "ren-2", name: "EIN Confirmation Letter", type: "ein_letter", status: "verified", uploadDate: "2020-03-04" },
      { id: "ren-3", name: "Operating Agreement", type: "operating_agreement", status: "verified", uploadDate: "2020-03-03" },
    ],
  },
  {
    id: "temple",
    name: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
    shortName: "508 Temple",
    type: "Georgia Nonprofit Corporation",
    state: "Georgia",
    status: "Active",
    controlNumber: "25132958",
    formationDate: "07/04/2025",
    documents: [
      { id: "temple-1", name: "Articles of Incorporation", type: "articles_of_organization", status: "verified", uploadDate: "2025-07-04" },
      { id: "temple-2", name: "EIN Confirmation Letter", type: "ein_letter", status: "missing" },
      { id: "temple-3", name: "Bylaws", type: "operating_agreement", status: "pending" },
    ],
  },
];

export default function EntityDocuments() {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<string>("other");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "missing":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "missing":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getEntityCompleteness = (entity: Entity) => {
    const total = entity.documents.length;
    const verified = entity.documents.filter((d) => d.status === "verified").length;
    return Math.round((verified / total) * 100);
  };

  const handleUpload = () => {
    toast.success("Document uploaded successfully");
    setShowUploadModal(false);
  };

  if (selectedEntity) {
    return (
      <div className="space-y-6">
        {/* Back Button and Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedEntity(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{selectedEntity.name}</h2>
            <p className="text-sm text-gray-600">
              {selectedEntity.type} • {selectedEntity.state} • {selectedEntity.status}
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>

        {/* Entity Details Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">EIN</p>
              <p className="font-medium text-gray-900">{selectedEntity.ein || "Pending"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Control Number</p>
              <p className="font-medium text-gray-900">{selectedEntity.controlNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Formation Date</p>
              <p className="font-medium text-gray-900">{selectedEntity.formationDate || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Document Completeness</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full transition-all"
                    style={{ width: `${getEntityCompleteness(selectedEntity)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {getEntityCompleteness(selectedEntity)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Formation Documents</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {selectedEntity.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{documentTypeIcons[doc.type]}</span>
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">{documentTypeLabels[doc.type]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.uploadDate && (
                    <span className="text-sm text-gray-500">
                      Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                    </span>
                  )}
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      doc.status
                    )}`}
                  >
                    {getStatusIcon(doc.status)}
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                  {doc.status === "verified" && doc.fileUrl && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View document"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <a 
                        href={doc.fileUrl}
                        download
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download document"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </a>
                    </div>
                  )}
                  {doc.status === "missing" && (
                    <button
                      onClick={() => {
                        setUploadDocType(doc.type);
                        setShowUploadModal(true);
                      }}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                    >
                      Upload
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {Object.entries(documentTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select File
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Add any notes about this document..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                >
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Entity Documents</h2>
          <p className="text-gray-600">
            Manage formation documents for all business entities
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{entities.length}</p>
              <p className="text-sm text-gray-500">Total Entities</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {entities.reduce(
                  (acc, e) => acc + e.documents.filter((d) => d.status === "verified").length,
                  0
                )}
              </p>
              <p className="text-sm text-gray-500">Verified Documents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {entities.reduce(
                  (acc, e) => acc + e.documents.filter((d) => d.status === "pending").length,
                  0
                )}
              </p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {entities.reduce(
                  (acc, e) => acc + e.documents.filter((d) => d.status === "missing").length,
                  0
                )}
              </p>
              <p className="text-sm text-gray-500">Missing Documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map((entity) => (
          <div
            key={entity.id}
            onClick={() => setSelectedEntity(entity)}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Folder className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{entity.shortName}</h3>
                  <p className="text-xs text-gray-500">{entity.type}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  entity.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {entity.status}
              </span>
            </div>

            {/* Document Status Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Document Completeness</span>
                <span className="font-medium text-gray-900">
                  {getEntityCompleteness(entity)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    getEntityCompleteness(entity) === 100
                      ? "bg-green-600"
                      : getEntityCompleteness(entity) >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${getEntityCompleteness(entity)}%` }}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                {entity.documents.filter((d) => d.status === "verified").length}
              </span>
              <span className="flex items-center gap-1 text-yellow-600">
                <Clock className="w-4 h-4" />
                {entity.documents.filter((d) => d.status === "pending").length}
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                {entity.documents.filter((d) => d.status === "missing").length}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
