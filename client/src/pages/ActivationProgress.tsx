import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { PublicQAAgent } from "@/components/PublicQAAgent";
import {
  CheckCircle2,
  Circle,
  Building2,
  FileText,
  DollarSign,
  Handshake,
  Eye,
  BookOpen,
  Loader2,
  Rocket,
  Shield,
  Award,
  ArrowRight,
  Lock,
  Unlock,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const SIMULATOR_CONFIG = [
  {
    type: "business",
    label: "Business Workshop",
    description: "Form your business entity (LLC, Trust, S-Corp, etc.)",
    icon: Building2,
    route: "/business-simulator",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    type: "grants",
    label: "Grant Writing Workshop",
    description: "Learn to write winning grant proposals for funding",
    icon: DollarSign,
    route: "/grant-simulator",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    type: "proposals",
    label: "Proposals Workshop",
    description: "Master business proposals and RFP responses",
    icon: FileText,
    route: "/proposal-simulator",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    type: "contracts",
    label: "Contracts Workshop",
    description: "Understand contracts, negotiation, and compliance",
    icon: Handshake,
    route: "/contracts-simulator",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    type: "real_eye_nation",
    label: "Real-Eye-Nation Workshop",
    description: "Vision, strategy, and real-world application",
    icon: Eye,
    route: "/business-plan-simulator",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    type: "other",
    label: "Additional Workshop",
    description: "Complete any additional training module",
    icon: BookOpen,
    route: "/course-dashboard",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
  },
];

export default function ActivationProgress() {
  const { user } = useAuth();
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  const progressQuery = trpc.systemActivation.getProgress.useQuery(undefined, {
    enabled: !!user,
  });

  const buildStatusQuery = trpc.systemActivation.getBuildStatus.useQuery(undefined, {
    enabled: !!user,
  });

  const activateMutation = trpc.systemActivation.activateBuild.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        setShowActivateDialog(false);
        progressQuery.refetch();
        buildStatusQuery.refetch();
      } else {
        toast.error(data.error || "Activation failed");
      }
      setIsActivating(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsActivating(false);
    },
  });

  const handleActivate = () => {
    if (!businessName.trim() || !businessType) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsActivating(true);
    activateMutation.mutate({ businessName, businessType });
  };

  const progress = progressQuery.data;
  const buildStatus = buildStatusQuery.data;
  const completedCount = progress?.completedCount ?? 0;
  const totalRequired = progress?.totalRequired ?? 6;
  const progressPercent = totalRequired > 0 ? (completedCount / totalRequired) * 100 : 0;
  const isActivated = progress?.isActivated || buildStatus?.hasBuild;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                System Activation
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete all workshops to activate your personalized build
              </p>
            </div>
          </div>
        </div>

        {/* Overall Progress Card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Activation Progress</CardTitle>
                <CardDescription>
                  {isActivated
                    ? "Your build is activated and linked to the master system"
                    : `${completedCount} of ${totalRequired} workshops completed`}
                </CardDescription>
              </div>
              <Badge
                variant={isActivated ? "default" : progress?.readyForActivation ? "default" : "secondary"}
                className={isActivated ? "bg-green-600" : progress?.readyForActivation ? "bg-amber-600" : ""}
              >
                {isActivated ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" /> Activated
                  </>
                ) : progress?.readyForActivation ? (
                  <>
                    <Unlock className="w-3 h-3 mr-1" /> Ready to Activate
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 mr-1" /> In Progress
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={progressPercent} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{completedCount} completed</span>
                <span>{totalRequired - completedCount} remaining</span>
              </div>
            </div>

            {/* Activate Button */}
            {progress?.readyForActivation && !isActivated && (
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">All workshops completed!</p>
                      <p className="text-sm text-muted-foreground">
                        You're ready to activate your personalized build
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setShowActivateDialog(true)} className="gap-2">
                    <Rocket className="w-4 h-4" />
                    Activate My Build
                  </Button>
                </div>
              </div>
            )}

            {/* Activated Status */}
            {isActivated && buildStatus?.build && (
              <div className="mt-6 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-foreground">Build Activated</p>
                    <p className="text-sm text-muted-foreground">
                      {buildStatus.build.businessName} ({buildStatus.build.businessType}) — Linked to master build via LuvLedger
                    </p>
                    {buildStatus.linkage && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Linkage ID: {buildStatus.linkage.luvledgerEntryId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simulator Cards Grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Education Workshops
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SIMULATOR_CONFIG.map((sim) => {
              const simulatorData = progress?.simulators?.find(
                (s) => s.type === sim.type
              );
              const isCompleted = simulatorData?.completed ?? false;
              const score = simulatorData?.score;
              const Icon = sim.icon;

              return (
                <Card
                  key={sim.type}
                  className={`transition-all hover:shadow-md ${
                    isCompleted ? "border-green-500/30 bg-green-500/5" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${sim.bgColor}`}>
                        <Icon className={`w-5 h-5 ${sim.color}`} />
                      </div>
                      {isCompleted ? (
                        <Badge variant="default" className="bg-green-600 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Circle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-2">{sim.label}</CardTitle>
                    <CardDescription className="text-xs">
                      {sim.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isCompleted && score !== null && score !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-semibold">{score}%</span>
                        </div>
                        <Progress value={score} className="h-1.5" />
                      </div>
                    )}
                    <Button
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => (window.location.href = sim.route)}
                    >
                      {isCompleted ? (
                        <>Review Workshop</>
                      ) : (
                        <>
                          Start Workshop
                          <ChevronRight className="w-3 h-3" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How Activation Works</CardTitle>
            <CardDescription>
              The education-first approach ensures you're prepared before your build goes live
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  step: 1,
                  title: "Complete Workshops",
                  desc: "Finish all 6 education workshops to learn the system",
                  icon: BookOpen,
                },
                {
                  step: 2,
                  title: "Earn Certificates",
                  desc: "Receive certificates for each completed workshop",
                  icon: Award,
                },
                {
                  step: 3,
                  title: "Activate Build",
                  desc: "Your personalized build is cloned from the master system",
                  icon: Rocket,
                },
                {
                  step: 4,
                  title: "Linked via LuvLedger",
                  desc: "Your build is permanently linked to the master for updates",
                  icon: Shield,
                },
              ].map((item) => (
                <div key={item.step} className="text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Step {item.step}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activation Dialog */}
        <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Activate Your Build
              </DialogTitle>
              <DialogDescription>
                Your personalized system will be cloned from the master build and linked via LuvLedger. This creates your own House within the sovereign system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business / House Name</Label>
                <Input
                  id="businessName"
                  placeholder="Enter your business or house name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Entity Type</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="s_corp">S Corporation</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="508c1a">508(c)(1)(A)</SelectItem>
                    <SelectItem value="collective">Collective</SelectItem>
                    <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowActivateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleActivate}
                disabled={isActivating || !businessName.trim() || !businessType}
                className="gap-2"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Activate Build
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    
      <PublicQAAgent agentType="system_qa" label="System Guide" />
    </DashboardLayout>
  );
}
