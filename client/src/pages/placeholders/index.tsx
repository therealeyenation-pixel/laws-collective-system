import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Construction, ArrowLeft, Clock, FileText, Users, Building2, 
  Shield, Settings, Package, BarChart3, Clipboard, Heart,
  GraduationCap, Palette, Music, DollarSign, ShoppingCart,
  FileCheck, Truck, MapPin, FolderKanban, CheckCircle, Scale,
  Monitor, Eye, Wrench
} from "lucide-react";
import { useLocation } from "wouter";
import { ReactNode } from "react";

interface PlaceholderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

function PlaceholderPage({ title, description, icon }: PlaceholderProps) {
  const [, setLocation] = useLocation();
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-6">
            {icon || <Construction className="w-16 h-16 text-amber-500" />}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {description || "This feature is currently under development."}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
            <Clock className="w-4 h-4" /> <span>Coming Soon</span>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setLocation("/dashboard")}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Department Documents Pages
export const BusinessDocuments = () => <PlaceholderPage title="Business Documents" description="Access business templates, policies, and department files." icon={<FileText className="w-16 h-16 text-blue-500" />} />;
export const HealthDocuments = () => <PlaceholderPage title="Health Documents" description="Access health department templates and policies." icon={<Heart className="w-16 h-16 text-red-500" />} />;
export const EducationDocuments = () => <PlaceholderPage title="Education Documents" description="Access education department curriculum and materials." icon={<GraduationCap className="w-16 h-16 text-purple-500" />} />;
export const DesignDocuments = () => <PlaceholderPage title="Design Documents" description="Access design assets, brand guidelines, and templates." icon={<Palette className="w-16 h-16 text-pink-500" />} />;
export const MediaDocuments = () => <PlaceholderPage title="Media Documents" description="Access media production files and content guidelines." icon={<Music className="w-16 h-16 text-orange-500" />} />;
export const FinanceDocuments = () => <PlaceholderPage title="Finance Documents" description="Access financial reports, policies, and templates." icon={<DollarSign className="w-16 h-16 text-green-500" />} />;
export const HRDocuments = () => <PlaceholderPage title="HR Documents" description="Access HR policies, employee handbooks, and forms." icon={<Users className="w-16 h-16 text-blue-500" />} />;
export const OperationsDocuments = () => <PlaceholderPage title="Operations Documents" description="Access operational procedures and guidelines." icon={<Wrench className="w-16 h-16 text-gray-500" />} />;
export const ProcurementDocuments = () => <PlaceholderPage title="Procurement Documents" description="Access procurement policies and vendor documents." icon={<ShoppingCart className="w-16 h-16 text-amber-500" />} />;
export const ContractsDocuments = () => <PlaceholderPage title="Contracts Documents" description="Access contract templates and legal documents." icon={<FileCheck className="w-16 h-16 text-indigo-500" />} />;
export const PurchasingDocuments = () => <PlaceholderPage title="Purchasing Documents" description="Access purchasing policies and order forms." icon={<Truck className="w-16 h-16 text-teal-500" />} />;
export const PropertyDocuments = () => <PlaceholderPage title="Property Documents" description="Access property management documents and records." icon={<Building2 className="w-16 h-16 text-slate-500" />} />;
export const RealEstateDocuments = () => <PlaceholderPage title="Real Estate Documents" description="Access real estate contracts and property files." icon={<MapPin className="w-16 h-16 text-red-500" />} />;
export const ProjectControlsDocuments = () => <PlaceholderPage title="Project Controls Documents" description="Access project documentation and reports." icon={<FolderKanban className="w-16 h-16 text-violet-500" />} />;
export const QAQCDocuments = () => <PlaceholderPage title="QA/QC Documents" description="Access quality assurance standards and checklists." icon={<CheckCircle className="w-16 h-16 text-green-500" />} />;
export const LegalDocuments = () => <PlaceholderPage title="Legal Documents" description="Access legal templates and compliance documents." icon={<Scale className="w-16 h-16 text-amber-600" />} />;
export const ITDocuments = () => <PlaceholderPage title="IT Documents" description="Access IT policies and technical documentation." icon={<Monitor className="w-16 h-16 text-cyan-500" />} />;
export const PlatformDocuments = () => <PlaceholderPage title="Platform Documents" description="Access platform administration guides." icon={<Settings className="w-16 h-16 text-gray-600" />} />;
export const GrantsDocuments = () => <PlaceholderPage title="Grants Documents" description="Access grant applications and funding documents." icon={<FileText className="w-16 h-16 text-emerald-500" />} />;

// Department Team Pages
export const BusinessTeam = () => <PlaceholderPage title="Business Team" description="View business department team members and roles." icon={<Users className="w-16 h-16 text-blue-500" />} />;
export const HealthTeam = () => <PlaceholderPage title="Health Team" description="View health department team members." icon={<Users className="w-16 h-16 text-red-500" />} />;
export const EducationTeam = () => <PlaceholderPage title="Education Team" description="View education department instructors and staff." icon={<Users className="w-16 h-16 text-purple-500" />} />;
export const DesignTeam = () => <PlaceholderPage title="Design Team" description="View design department artists and creators." icon={<Users className="w-16 h-16 text-pink-500" />} />;
export const MediaTeam = () => <PlaceholderPage title="Media Team" description="View media production team members." icon={<Users className="w-16 h-16 text-orange-500" />} />;
export const FinanceTeam = () => <PlaceholderPage title="Finance Team" description="View finance department team members." icon={<Users className="w-16 h-16 text-green-500" />} />;
export const HRTeam = () => <PlaceholderPage title="HR Team" description="View HR department team members." icon={<Users className="w-16 h-16 text-blue-500" />} />;
export const OperationsTeam = () => <PlaceholderPage title="Operations Team" description="View operations team members." icon={<Users className="w-16 h-16 text-gray-500" />} />;
export const ProcurementTeam = () => <PlaceholderPage title="Procurement Team" description="View procurement team members." icon={<Users className="w-16 h-16 text-amber-500" />} />;
export const ContractsTeam = () => <PlaceholderPage title="Contracts Team" description="View contracts team members." icon={<Users className="w-16 h-16 text-indigo-500" />} />;
export const PurchasingTeam = () => <PlaceholderPage title="Purchasing Team" description="View purchasing team members." icon={<Users className="w-16 h-16 text-teal-500" />} />;
export const PropertyTeam = () => <PlaceholderPage title="Property Team" description="View property management team." icon={<Users className="w-16 h-16 text-slate-500" />} />;
export const RealEstateTeam = () => <PlaceholderPage title="Real Estate Team" description="View real estate team members." icon={<Users className="w-16 h-16 text-red-500" />} />;
export const ProjectControlsTeam = () => <PlaceholderPage title="Project Controls Team" description="View project controls team members." icon={<Users className="w-16 h-16 text-violet-500" />} />;
export const QAQCTeam = () => <PlaceholderPage title="QA/QC Team" description="View quality assurance team members." icon={<Users className="w-16 h-16 text-green-500" />} />;
export const LegalTeam = () => <PlaceholderPage title="Legal Team" description="View legal and compliance team members." icon={<Users className="w-16 h-16 text-amber-600" />} />;
export const ITTeam = () => <PlaceholderPage title="IT Team" description="View IT department team members." icon={<Users className="w-16 h-16 text-cyan-500" />} />;
export const PlatformTeam = () => <PlaceholderPage title="Platform Team" description="View platform administration team." icon={<Users className="w-16 h-16 text-gray-600" />} />;
export const GrantsTeam = () => <PlaceholderPage title="Grants Team" description="View grants and funding team members." icon={<Users className="w-16 h-16 text-emerald-500" />} />;

// Feature Pages
export const AssetTracking = () => <PlaceholderPage title="Asset Tracking" description="Track and manage company assets, equipment, and inventory." icon={<Package className="w-16 h-16 text-blue-500" />} />;
export const Audits = () => <PlaceholderPage title="Audits" description="Manage internal and external audits, compliance reviews." icon={<Clipboard className="w-16 h-16 text-amber-500" />} />;
export const BrandAssets = () => <PlaceholderPage title="Brand Assets" description="Access logos, color palettes, typography, and brand guidelines." icon={<Palette className="w-16 h-16 text-pink-500" />} />;
export const BusinessPlans = () => <PlaceholderPage title="Business Plans" description="View and manage business plans and strategic documents." icon={<FileText className="w-16 h-16 text-blue-500" />} />;
export const Compliance = () => <PlaceholderPage title="Compliance" description="Monitor regulatory compliance and manage compliance tasks." icon={<Shield className="w-16 h-16 text-green-500" />} />;
export const ContentCalendar = () => <PlaceholderPage title="Content Calendar" description="Plan and schedule content across all media channels." icon={<BarChart3 className="w-16 h-16 text-purple-500" />} />;
export const Curriculum = () => <PlaceholderPage title="Curriculum" description="Manage educational curriculum and course materials." icon={<GraduationCap className="w-16 h-16 text-purple-500" />} />;
export const GrantsDashboard = () => <PlaceholderPage title="Grants Dashboard" description="Overview of all grant applications and funding status." icon={<DollarSign className="w-16 h-16 text-emerald-500" />} />;
export const Instructors = () => <PlaceholderPage title="Instructors" description="Manage instructor profiles and teaching assignments." icon={<GraduationCap className="w-16 h-16 text-indigo-500" />} />;
export const Inventory = () => <PlaceholderPage title="Inventory" description="Track inventory levels and manage stock." icon={<Package className="w-16 h-16 text-teal-500" />} />;
export const OperatingAgreements = () => <PlaceholderPage title="Operating Agreements" description="Manage LLC operating agreements and partnership documents." icon={<FileCheck className="w-16 h-16 text-blue-600" />} />;
export const ProgressReporting = () => <PlaceholderPage title="Progress Reporting" description="Track project progress and generate status reports." icon={<BarChart3 className="w-16 h-16 text-violet-500" />} />;
export const Properties = () => <PlaceholderPage title="Properties" description="Manage real estate properties and listings." icon={<Building2 className="w-16 h-16 text-slate-500" />} />;
export const QualityStandards = () => <PlaceholderPage title="Quality Standards" description="Define and manage quality standards and metrics." icon={<CheckCircle className="w-16 h-16 text-green-500" />} />;
export const RealEyeDashboard = () => <PlaceholderPage title="Real Eye Dashboard" description="Media and creative enterprise overview and analytics." icon={<Eye className="w-16 h-16 text-purple-500" />} />;
export const SecurityCenter = () => <PlaceholderPage title="Security Center" description="Manage security policies, access controls, and monitoring." icon={<Shield className="w-16 h-16 text-red-500" />} />;
export const SWOTAnalysis = () => <PlaceholderPage title="SWOT Analysis" description="Create and manage strategic SWOT analyses." icon={<BarChart3 className="w-16 h-16 text-blue-500" />} />;
export const SystemAdmin = () => <PlaceholderPage title="System Administration" description="Manage system settings and configurations." icon={<Settings className="w-16 h-16 text-gray-600" />} />;
export const SystemSettings = () => <PlaceholderPage title="System Settings" description="Configure platform-wide settings and preferences." icon={<Settings className="w-16 h-16 text-gray-600" />} />;
export const UserManagement = () => <PlaceholderPage title="User Management" description="Manage user accounts, roles, and permissions." icon={<Users className="w-16 h-16 text-blue-500" />} />;
export const VendorManagement = () => <PlaceholderPage title="Vendor Management" description="Manage vendor relationships and contracts." icon={<ShoppingCart className="w-16 h-16 text-amber-500" />} />;
export const WellnessPrograms = () => <PlaceholderPage title="Wellness Programs" description="Manage employee wellness initiatives and programs." icon={<Heart className="w-16 h-16 text-red-500" />} />;
