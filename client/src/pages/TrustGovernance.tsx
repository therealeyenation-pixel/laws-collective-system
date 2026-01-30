import { useState, useEffect } from "react";
import { MeetingWidget } from "@/components/widgets/MeetingWidget";
import { ChatWidget } from "@/components/widgets/ChatWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { NewsBanner } from "@/components/NewsBanner";
import { WeatherWidget } from "@/components/WeatherWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Users,
  TrendingUp,
  PieChart,
  Shield,
  GraduationCap,
  FileText,
  ArrowRight,
  ArrowLeft,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  Landmark,
  Heart,
  Leaf,
  Wind,
  Droplets,
  User,
  DollarSign,
  Calendar,
  Target,
  BookOpen,
  Upload,
  Download,
  Eye,
  Lock,
  Plus,
  Wallet,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

// Trust allocation policy from business plan
const allocationPolicy = [
  { category: "Operating Reserve", percentage: 20, color: "bg-blue-500", description: "Emergency fund, operating capital" },
  { category: "Wealth Building", percentage: 30, color: "bg-emerald-500", description: "Long-term investments, asset acquisition" },
  { category: "Entity Reinvestment", percentage: 30, color: "bg-amber-500", description: "Capital for subsidiary operations" },
  { category: "Family Distributions", percentage: 10, color: "bg-purple-500", description: "Current generation support" },
  { category: "Community Impact", percentage: 10, color: "bg-rose-500", description: "Charitable activities, community programs" },
];

// Subsidiary entities with allocation percentages
const subsidiaryEntities = [
  {
    id: "luvonpurpose",
    name: "LuvOnPurpose Autonomous Wealth System LLC",
    type: "LLC",
    state: "Delaware",
    allocation: 40,
    function: "Platform operations, technology",
    ein: "Pending",
    status: "active",
    controlNumber: "10252584",
  },
  {
    id: "temple",
    name: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
    type: "508(c)(1)(a)",
    state: "Georgia",
    allocation: 30,
    function: "Education, training, charitable",
    ein: "Pending",
    status: "active",
    controlNumber: "25132958",
  },
  {
    id: "realeyenation",
    name: "Real-Eye-Nation LLC",
    type: "LLC",
    state: "Georgia",
    allocation: 20,
    function: "Media, content, truth documentation",
    ein: "84-4976416",
    status: "active",
    controlNumber: "20031738",
  },
  {
    id: "laws",
    name: "The L.A.W.S. Collective, LLC",
    type: "LLC",
    state: "Delaware",
    allocation: 10,
    function: "Community programs, membership",
    ein: "39-3122993",
    status: "active",
    controlNumber: "10251122",
  },
];

// Family members and roles
const familyMembers = [
  { name: "LaShanna Russell", role: "Founder/CEO", department: "Trust Governance", status: "active", certifications: ["Financial Literacy", "Business Operations", "Family Governance"] },
  { name: "Craig", role: "House Member", department: "Finance, Outreach support", status: "active", certifications: ["Financial Literacy"] },
  { name: "Amber", role: "House Member", department: "Operations support", status: "onboarding", certifications: [] },
  { name: "Essence", role: "House Member", department: "Creative support", status: "onboarding", certifications: [] },
  { name: "Amandes", role: "House Member", department: "Administrative support", status: "onboarding", certifications: [] },
  { name: "Cornelius", role: "Education Manager", department: "Education Department, Justice Advisor", status: "active", certifications: ["Financial Literacy", "Education"] },
];

// L.A.W.S. Framework principles
const lawsFramework = [
  { letter: "L", name: "Land", icon: Leaf, description: "Reconnection with roots, stability, and physical assets", color: "text-green-600" },
  { letter: "A", name: "Air", icon: Wind, description: "Education, knowledge, and communication", color: "text-sky-600" },
  { letter: "W", name: "Water", icon: Droplets, description: "Healing, balance, and healthy decision-making", color: "text-blue-600" },
  { letter: "S", name: "Self", icon: User, description: "Purpose, skills, and financial literacy", color: "text-purple-600" },
];

// Succession requirements
const successionRequirements = [
  { requirement: "Demonstrated commitment to family values", status: "ongoing" },
  { requirement: "Financial Literacy certification through Academy", status: "required" },
  { requirement: "Business Operations certification", status: "required" },
  { requirement: "Family Governance training completion", status: "required" },
  { requirement: "Approval by Family Council", status: "required" },
  { requirement: "Minimum 2 years active participation", status: "required" },
];

// Implementation timeline
const implementationTimeline = [
  { phase: "Establishment", timeline: "Year 1", milestones: "Formal Trust document, Trustee designation, initial funding", status: "in-progress" },
  { phase: "Activation", timeline: "Year 2", milestones: "Operating entity transfers, governance implementation", status: "pending" },
  { phase: "Operations", timeline: "Years 3-5", milestones: "Full operations, first distributions, wealth building begins", status: "pending" },
  { phase: "Maturity", timeline: "Years 5+", milestones: "Sustainable operations, next generation preparation", status: "pending" },
];

// Trust documents
const trustDocuments = [
  { name: "Trust Agreement", type: "Legal", status: "draft", date: "2024-01-15", confidential: true },
  { name: "Operating Agreement - LAWS, LLC", type: "Entity", status: "active", date: "2024-02-01", confidential: true },
  { name: "Operating Agreement - L.A.W.S. Collective", type: "Entity", status: "active", date: "2024-02-01", confidential: true },
  { name: "Bylaws - Temple/Academy", type: "Entity", status: "active", date: "2024-02-15", confidential: true },
  { name: "Operating Agreement - Real-Eye-Nation", type: "Entity", status: "active", date: "2024-02-01", confidential: true },
  { name: "Family Governance Charter", type: "Governance", status: "draft", date: "2024-03-01", confidential: false },
  { name: "Succession Plan", type: "Governance", status: "draft", date: "2024-03-15", confidential: true },
  { name: "Distribution Policy", type: "Financial", status: "draft", date: "2024-04-01", confidential: true },
];

// Default beneficiaries (fallback when database is empty or unavailable)
const defaultBeneficiaries = [
  { id: 1, name: "LaShanna Russell", relationship: "Founder/Trustee", status: "primary", percentage: 40, notes: "Managing beneficiary" },
  { id: 2, name: "Craig", relationship: "House Member", status: "primary", percentage: 10, notes: "Finance lead" },
  { id: 3, name: "Amber", relationship: "House Member", status: "contingent", percentage: 13, notes: "Operations" },
  { id: 4, name: "Essence", relationship: "House Member", status: "contingent", percentage: 13, notes: "Creative" },
  { id: 5, name: "Amandes", relationship: "House Member", status: "contingent", percentage: 13, notes: "Media" },
  { id: 6, name: "Future Generations", relationship: "Descendants", status: "remainder", percentage: 11, notes: "Reserved for future beneficiaries" },
];

type Beneficiary = {
  id: number;
  name: string;
  relationship: string;
  status: string;
  percentage: number;
  notes: string;
};

// Distribution history (sample)
const distributionHistory = [
  { id: "D001", date: "2024-12-01", type: "Operating", amount: 0, recipient: "All Entities", status: "pending", notes: "Initial funding pending" },
];

// Map database relationship to UI display
const relationshipMap: Record<string, string> = {
  "child": "Child",
  "grandchild": "Grandchild",
  "great_grandchild": "Great Grandchild",
  "spouse": "Spouse",
  "sibling": "Sibling",
  "niece_nephew": "Niece/Nephew",
  "cousin": "Cousin",
  "adopted": "Adopted",
  "guardian_ward": "Guardian Ward",
  "other": "Other",
  "House Member": "House Member",
  "Founder/Trustee": "Founder/Trustee",
  "Descendants": "Descendants",
};

// Map UI relationship to database enum
const uiToDbRelationship: Record<string, string> = {
  "House Member": "other",
  "Spouse": "spouse",
  "Child": "child",
  "Grandchild": "grandchild",
  "Sibling": "sibling",
  "Descendants": "other",
  "Founder/Trustee": "other",
  "Other": "other",
};

export default function TrustGovernance() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Beneficiary state management
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(defaultBeneficiaries);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [newBeneficiary, setNewBeneficiary] = useState<Partial<Beneficiary>>({
    name: "",
    relationship: "",
    status: "contingent",
    percentage: 0,
    notes: ""
  });
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Database queries
  const heirsQuery = trpc.heirDistribution.getHouseHeirs.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  const designateHeirMutation = trpc.heirDistribution.designateHeir.useMutation({
    onSuccess: () => {
      heirsQuery.refetch();
      toast.success("Beneficiary added to database");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add beneficiary");
    }
  });
  
  const updateHeirMutation = trpc.heirDistribution.updateHeir.useMutation({
    onSuccess: () => {
      heirsQuery.refetch();
      toast.success("Beneficiary updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update beneficiary");
    }
  });
  
  const removeHeirMutation = trpc.heirDistribution.removeHeir.useMutation({
    onSuccess: () => {
      heirsQuery.refetch();
      toast.success("Beneficiary removed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove beneficiary");
    }
  });

  // Sync database heirs to local state
  useEffect(() => {
    if (heirsQuery.data && heirsQuery.data.heirs && heirsQuery.data.heirs.length > 0) {
      setIsDbConnected(true);
      setIsLocked(heirsQuery.data.lock?.isLocked || false);
      const dbBeneficiaries: Beneficiary[] = heirsQuery.data.heirs.map((heir: any) => ({
        id: heir.id,
        name: heir.fullName,
        relationship: relationshipMap[heir.relationship] || heir.relationship,
        status: heir.vestingStatus === "fully_vested" ? "primary" : 
                heir.vestingStatus === "partial" ? "contingent" : "remainder",
        percentage: heir.distributionPercentage,
        notes: heir.email || heir.phone || "",
      }));
      setBeneficiaries(dbBeneficiaries);
    } else if (heirsQuery.isSuccess) {
      // Database connected but no heirs - use defaults
      setIsDbConnected(true);
      setBeneficiaries(defaultBeneficiaries);
    }
  }, [heirsQuery.data, heirsQuery.isSuccess]);

  const totalAllocation = subsidiaryEntities.reduce((sum, e) => sum + e.allocation, 0);
  
  // Beneficiary CRUD operations
  const handleAddBeneficiary = async () => {
    if (!newBeneficiary.name || !newBeneficiary.relationship) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const totalWithNew = beneficiaries.reduce((sum, b) => sum + b.percentage, 0) + (newBeneficiary.percentage || 0);
    if (totalWithNew > 100) {
      toast.error("Total allocation cannot exceed 100%");
      return;
    }
    
    if (isDbConnected) {
      // Save to database
      const dbRelationship = uiToDbRelationship[newBeneficiary.relationship || ""] || "other";
      designateHeirMutation.mutate({
        fullName: newBeneficiary.name || "",
        relationship: dbRelationship as any,
        distributionPercentage: newBeneficiary.percentage || 0,
        distributionMethod: "accumulate",
      });
    } else {
      // Local state only
      const newId = Math.max(...beneficiaries.map(b => b.id), 0) + 1;
      setBeneficiaries([...beneficiaries, { ...newBeneficiary, id: newId } as Beneficiary]);
      toast.success(`${newBeneficiary.name} added as beneficiary (local only)`);
    }
    
    setNewBeneficiary({ name: "", relationship: "", status: "contingent", percentage: 0, notes: "" });
    setShowAddBeneficiary(false);
  };
  
  const handleEditBeneficiary = async () => {
    if (!editingBeneficiary) return;
    
    const otherTotal = beneficiaries.filter(b => b.id !== editingBeneficiary.id).reduce((sum, b) => sum + b.percentage, 0);
    if (otherTotal + editingBeneficiary.percentage > 100) {
      toast.error("Total allocation cannot exceed 100%");
      return;
    }
    
    if (isDbConnected && editingBeneficiary.id > 0) {
      // Update in database
      const dbRelationship = uiToDbRelationship[editingBeneficiary.relationship || ""] || "other";
      updateHeirMutation.mutate({
        heirId: editingBeneficiary.id,
        fullName: editingBeneficiary.name,
        relationship: dbRelationship as any,
        distributionPercentage: editingBeneficiary.percentage,
      });
    } else {
      // Local state only
      setBeneficiaries(beneficiaries.map(b => b.id === editingBeneficiary.id ? editingBeneficiary : b));
      toast.success("Beneficiary updated (local only)");
    }
    
    setEditingBeneficiary(null);
  };
  
  const handleDeleteBeneficiary = async (id: number) => {
    const beneficiary = beneficiaries.find(b => b.id === id);
    if (beneficiary?.status === "primary") {
      toast.error("Cannot remove primary beneficiaries. Change status first.");
      return;
    }
    
    if (isDbConnected && id > 0) {
      // Remove from database
      removeHeirMutation.mutate({ heirId: id });
    } else {
      // Local state only
      setBeneficiaries(beneficiaries.filter(b => b.id !== id));
      toast.success("Beneficiary removed (local only)");
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        {/* News Banner */}
        <NewsBanner />
        
        {/* Header with Back Button */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container max-w-7xl py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Home className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Landmark className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Trust Governance Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Calea Freeman Family Trust | EIN: 98-6109577</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/business-formation">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Building2 className="w-4 h-4" />
                    Entity Management
                  </Button>
                </Link>
                <Link href="/document-vault">
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Document Vault
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container max-w-7xl py-8 space-y-8">
          {/* Weather Widget */}
          <div className="flex justify-end">
            <WeatherWidget compact className="w-64" />
          </div>
        {/* Trust Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subsidiary Entities</p>
                  <p className="text-2xl font-bold">{subsidiaryEntities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Family Members</p>
                  <p className="text-2xl font-bold">{familyMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trust Status</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Legacy Vision</p>
                  <p className="text-2xl font-bold">100+ Years</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="allocation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="allocation" className="gap-2">
              <PieChart className="w-4 h-4" />
              Allocation
            </TabsTrigger>
            <TabsTrigger value="subsidiaries" className="gap-2">
              <Building2 className="w-4 h-4" />
              Subsidiaries
            </TabsTrigger>
            <TabsTrigger value="beneficiaries" className="gap-2">
              <Users className="w-4 h-4" />
              Beneficiaries
            </TabsTrigger>
            <TabsTrigger value="distributions" className="gap-2">
              <Wallet className="w-4 h-4" />
              Distributions
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="succession" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Succession
            </TabsTrigger>
            <TabsTrigger value="governance" className="gap-2">
              <Shield className="w-4 h-4" />
              Governance
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Allocation Tab */}
          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Allocation Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Trust Allocation Policy
                  </CardTitle>
                  <CardDescription>
                    Standard distribution of Trust assets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allocationPolicy.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span className="text-muted-foreground">{item.percentage}%</span>
                        </div>
                        <Progress value={item.percentage} className={item.color} />
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Entity Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Entity Allocation
                  </CardTitle>
                  <CardDescription>
                    Distribution to subsidiary entities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subsidiaryEntities.map((entity) => (
                      <div key={entity.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate max-w-[200px]">{entity.name}</span>
                          <span className="text-muted-foreground">{entity.allocation}%</span>
                        </div>
                        <Progress value={entity.allocation} className="bg-primary/20" />
                        <p className="text-xs text-muted-foreground">{entity.function}</p>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-semibold">
                        <span>Total Allocation</span>
                        <span>{totalAllocation}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subsidiaries Tab */}
          <TabsContent value="subsidiaries" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subsidiaryEntities.map((entity) => (
                <Card key={entity.id} className={`cursor-pointer transition-all ${selectedEntity === entity.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedEntity(selectedEntity === entity.id ? null : entity.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{entity.name}</CardTitle>
                        <CardDescription>{entity.type} | {entity.state}</CardDescription>
                      </div>
                      <Badge variant={entity.status === "active" ? "default" : "secondary"}>
                        {entity.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Allocation</span>
                        <span className="font-semibold">{entity.allocation}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Function</span>
                        <span>{entity.function}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">EIN</span>
                        <span>{entity.ein}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Control #</span>
                        <span>{entity.controlNumber}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Beneficiaries Tab */}
          <TabsContent value="beneficiaries" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Trust Beneficiaries
                          {isDbConnected && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                              Database Connected
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Current and contingent beneficiaries of the Trust
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {isDbConnected && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => heirsQuery.refetch()}
                            disabled={heirsQuery.isRefetching}
                          >
                            <RefreshCw className={`w-4 h-4 ${heirsQuery.isRefetching ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                        <Dialog open={showAddBeneficiary} onOpenChange={setShowAddBeneficiary}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-2" disabled={isLocked}>
                              <Plus className="w-4 h-4" />
                              Add Beneficiary
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Beneficiary</DialogTitle>
                              <DialogDescription>
                                Add a new beneficiary to the Trust. Total allocation cannot exceed 100%.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                  id="name"
                                  value={newBeneficiary.name}
                                  onChange={(e) => setNewBeneficiary({...newBeneficiary, name: e.target.value})}
                                  placeholder="Enter beneficiary name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="relationship">Relationship *</Label>
                                <Select
                                  value={newBeneficiary.relationship}
                                  onValueChange={(value) => setNewBeneficiary({...newBeneficiary, relationship: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="House Member">House Member</SelectItem>
                                    <SelectItem value="Spouse">Spouse</SelectItem>
                                    <SelectItem value="Child">Child</SelectItem>
                                    <SelectItem value="Grandchild">Grandchild</SelectItem>
                                    <SelectItem value="Sibling">Sibling</SelectItem>
                                    <SelectItem value="Descendants">Descendants</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                  value={newBeneficiary.status}
                                  onValueChange={(value) => setNewBeneficiary({...newBeneficiary, status: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="primary">Primary</SelectItem>
                                    <SelectItem value="contingent">Contingent</SelectItem>
                                    <SelectItem value="remainder">Remainder</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="percentage">Allocation Percentage</Label>
                                <Input
                                  id="percentage"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={newBeneficiary.percentage}
                                  onChange={(e) => setNewBeneficiary({...newBeneficiary, percentage: Number(e.target.value)})}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Current total: {beneficiaries.reduce((sum, b) => sum + b.percentage, 0)}% | 
                                  Available: {100 - beneficiaries.reduce((sum, b) => sum + b.percentage, 0)}%
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={newBeneficiary.notes}
                                  onChange={(e) => setNewBeneficiary({...newBeneficiary, notes: e.target.value})}
                                  placeholder="Additional notes about this beneficiary"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowAddBeneficiary(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddBeneficiary} disabled={designateHeirMutation.isPending}>
                                {designateHeirMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4 mr-2" />
                                )}
                                Add Beneficiary
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {heirsQuery.isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {beneficiaries.map((beneficiary) => (
                          <div key={beneficiary.id} className="p-4 border rounded-lg hover:bg-secondary/30 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="font-bold text-primary">{beneficiary.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="font-medium">{beneficiary.name}</p>
                                  <p className="text-sm text-muted-foreground">{beneficiary.relationship}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="text-right">
                                  <Badge variant={
                                    beneficiary.status === "primary" ? "default" :
                                    beneficiary.status === "contingent" ? "secondary" : "outline"
                                  }>
                                    {beneficiary.status}
                                  </Badge>
                                  <p className="text-lg font-bold text-primary mt-1">{beneficiary.percentage}%</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setEditingBeneficiary(beneficiary)}
                                    disabled={isLocked}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteBeneficiary(beneficiary.id)}
                                    disabled={isLocked || beneficiary.status === "primary"}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{beneficiary.notes}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Edit Beneficiary Dialog */}
                <Dialog open={!!editingBeneficiary} onOpenChange={(open) => !open && setEditingBeneficiary(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Beneficiary</DialogTitle>
                      <DialogDescription>
                        Update beneficiary information. Total allocation cannot exceed 100%.
                      </DialogDescription>
                    </DialogHeader>
                    {editingBeneficiary && (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Full Name *</Label>
                          <Input
                            id="edit-name"
                            value={editingBeneficiary.name}
                            onChange={(e) => setEditingBeneficiary({...editingBeneficiary, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-relationship">Relationship *</Label>
                          <Select
                            value={editingBeneficiary.relationship}
                            onValueChange={(value) => setEditingBeneficiary({...editingBeneficiary, relationship: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Founder/Trustee">Founder/Trustee</SelectItem>
                              <SelectItem value="House Member">House Member</SelectItem>
                              <SelectItem value="Spouse">Spouse</SelectItem>
                              <SelectItem value="Child">Child</SelectItem>
                              <SelectItem value="Grandchild">Grandchild</SelectItem>
                              <SelectItem value="Sibling">Sibling</SelectItem>
                              <SelectItem value="Descendants">Descendants</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-status">Status</Label>
                          <Select
                            value={editingBeneficiary.status}
                            onValueChange={(value) => setEditingBeneficiary({...editingBeneficiary, status: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="contingent">Contingent</SelectItem>
                              <SelectItem value="remainder">Remainder</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-percentage">Allocation Percentage</Label>
                          <Input
                            id="edit-percentage"
                            type="number"
                            min="0"
                            max="100"
                            value={editingBeneficiary.percentage}
                            onChange={(e) => setEditingBeneficiary({...editingBeneficiary, percentage: Number(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-notes">Notes</Label>
                          <Textarea
                            id="edit-notes"
                            value={editingBeneficiary.notes}
                            onChange={(e) => setEditingBeneficiary({...editingBeneficiary, notes: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingBeneficiary(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleEditBeneficiary} disabled={updateHeirMutation.isPending}>
                        {updateHeirMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Beneficiary Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Allocation Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Allocated</span>
                        <span className="text-2xl font-bold">{beneficiaries.reduce((sum, b) => sum + b.percentage, 0)}%</span>
                      </div>
                      <Progress value={beneficiaries.reduce((sum, b) => sum + b.percentage, 0)} />
                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Primary Beneficiaries</span>
                          <span>{beneficiaries.filter(b => b.status === "primary").length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Contingent Beneficiaries</span>
                          <span>{beneficiaries.filter(b => b.status === "contingent").length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Remainder Beneficiaries</span>
                          <span>{beneficiaries.filter(b => b.status === "remainder").length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Distribution Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>Next Distribution: Pending</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span>Total Distributed: $0</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {isLocked ? (
                          <>
                            <Lock className="w-4 h-4 text-red-500" />
                            <span>Allocations Locked</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Allocations Editable</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Distributions Tab */}
          <TabsContent value="distributions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Distribution History
                </CardTitle>
                <CardDescription>
                  Record of all Trust distributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {distributionHistory.map((dist) => (
                    <div key={dist.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={dist.status === "completed" ? "default" : "secondary"}>
                            {dist.status}
                          </Badge>
                          <span className="font-medium">{dist.type} Distribution</span>
                        </div>
                        <span className="text-lg font-bold">${dist.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{dist.date}</span>
                        <span>{dist.recipient}</span>
                      </div>
                      {dist.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{dist.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Trust Documents
                    </CardTitle>
                    <CardDescription>
                      Legal and governance documents
                    </CardDescription>
                  </div>
                  <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                          Upload a new document to the Trust vault
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Drag and drop or click to upload
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                          Cancel
                        </Button>
                        <Button>Upload</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trustDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} | {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.status === "active" ? "default" : "secondary"}>
                          {doc.status}
                        </Badge>
                        {doc.confidential && <Lock className="w-4 h-4 text-muted-foreground" />}
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Succession Tab */}
          <TabsContent value="succession" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Succession Requirements
                  </CardTitle>
                  <CardDescription>
                    Criteria for Trust leadership succession
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {successionRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">{req.requirement}</span>
                        <Badge variant={req.status === "ongoing" ? "default" : "outline"}>
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Family Council
                  </CardTitle>
                  <CardDescription>
                    Current family members and roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {familyMembers.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role} | {member.department}</p>
                        </div>
                        <Badge variant={member.status === "active" ? "default" : "secondary"}>
                          {member.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  L.A.W.S. Framework
                </CardTitle>
                <CardDescription>
                  Guiding principles for Trust governance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lawsFramework.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-full bg-secondary ${item.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-lg">{item.letter}</span>
                            <span className="font-medium ml-2">{item.name}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Implementation Timeline
                </CardTitle>
                <CardDescription>
                  Trust establishment and growth phases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {implementationTimeline.map((phase, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        phase.status === "in-progress" ? "bg-amber-100 text-amber-600" :
                        phase.status === "completed" ? "bg-emerald-100 text-emerald-600" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {phase.status === "in-progress" ? <Clock className="w-5 h-5" /> :
                         phase.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> :
                         <Calendar className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{phase.phase}</h4>
                          <Badge variant={
                            phase.status === "in-progress" ? "default" :
                            phase.status === "completed" ? "secondary" : "outline"
                          }>
                            {phase.timeline}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{phase.milestones}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </DashboardLayout>
  );
}
