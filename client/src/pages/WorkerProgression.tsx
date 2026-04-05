import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { 
  Users, 
  Award, 
  TrendingUp, 
  Star, 
  BookOpen, 
  Briefcase,
  Home,
  Crown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  GraduationCap,
  Shield,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

// Stage configuration with icons and colors
const STAGES = [
  { key: 'w2_employee', label: 'W-2 Employee', icon: Users, color: 'bg-blue-500', description: 'Entry level - learning the ropes' },
  { key: 'senior_employee', label: 'Senior Employee', icon: Star, color: 'bg-indigo-500', description: 'Demonstrated competence' },
  { key: 'contractor', label: 'Contractor', icon: Briefcase, color: 'bg-purple-500', description: 'Independent contractor' },
  { key: 'certified_contractor', label: 'Certified Contractor', icon: Award, color: 'bg-amber-500', description: 'Premium certifications achieved' },
  { key: 'business_owner', label: 'Business Owner', icon: Home, color: 'bg-emerald-500', description: 'Own business established' },
  { key: 'house_member', label: 'House Member', icon: Crown, color: 'bg-rose-500', description: 'Full House membership' },
];

// Premium tier badges
const PREMIUM_TIERS = {
  standard: { label: 'Standard', color: 'bg-slate-500' },
  premium: { label: 'Premium', color: 'bg-amber-500' },
  elite: { label: 'Elite', color: 'bg-gradient-to-r from-amber-400 to-rose-500' },
};

export default function WorkerProgression() {
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);
  
  // Fetch data
  const { data: progressions, isLoading: loadingProgressions } = trpc.workerProgression.getAllProgressions.useQuery({
    stage: selectedStage as any,
  });
  
  const { data: dashboard, isLoading: loadingDashboard } = trpc.workerProgression.getProgressionDashboard.useQuery();
  
  const { data: certifications } = trpc.workerProgression.getCertifications.useQuery({});
  
  const { data: badges } = trpc.workerProgression.getBadges.useQuery();
  
  // Mutations
  const updateReadiness = trpc.workerProgression.updateReadinessScore.useMutation({
    onSuccess: () => {
      toast.success("Readiness score updated");
    },
  });
  
  const advanceStage = trpc.workerProgression.advanceStage.useMutation({
    onSuccess: (data) => {
      toast.success(`Worker advanced to ${data.newStage}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Calculate stage counts from dashboard
  const stageCounts = dashboard?.stageCounts?.reduce((acc: Record<string, number>, item: any) => {
    acc[item.currentStage] = Number(item.count);
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Worker Progression System</h1>
            <p className="text-muted-foreground mt-1">
              Premium pathway: Employee → Contractor → Business Owner → House Member
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {STAGES.map(stage => (
                  <SelectItem key={stage.key} value={stage.key}>{stage.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progression Pipeline */}
        <Card className="bg-gradient-to-br from-background to-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Progression Pipeline
            </CardTitle>
            <CardDescription>
              Track workers through each stage of their journey to ownership
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 md:gap-0 md:flex-nowrap items-center justify-between">
              {STAGES.map((stage, index) => {
                const StageIcon = stage.icon;
                const count = stageCounts[stage.key] || 0;
                return (
                  <div key={stage.key} className="flex items-center">
                    <div 
                      className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                        selectedStage === stage.key ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedStage(stage.key)}
                    >
                      <div className={`w-12 h-12 rounded-full ${stage.color} flex items-center justify-center mb-2`}>
                        <StageIcon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{stage.label}</span>
                      <span className="text-2xl font-bold text-foreground">{count}</span>
                      <span className="text-xs text-muted-foreground">{stage.description}</span>
                    </div>
                    {index < STAGES.length - 1 && (
                      <ChevronRight className="w-6 h-6 text-muted-foreground mx-2 hidden md:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ready for Advancement</p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboard?.eligibleForAdvancement || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Certifications</p>
                  <p className="text-2xl font-bold text-foreground">
                    {certifications?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Excellence Badges</p>
                  <p className="text-2xl font-bold text-foreground">
                    {badges?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Workers</p>
                  <p className="text-2xl font-bold text-foreground">
                    {progressions?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="workers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-4">
            {loadingProgressions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : progressions && progressions.length > 0 ? (
              <div className="grid gap-4">
                {progressions.map((worker: any) => {
                  const stage = STAGES.find(s => s.key === worker.currentStage);
                  const StageIcon = stage?.icon || Users;
                  return (
                    <Card key={worker.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Worker Info */}
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-full ${stage?.color || 'bg-gray-500'} flex items-center justify-center`}>
                              <StageIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {worker.userName || `Worker #${worker.userId}`}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {stage?.label} • {worker.departmentName || 'No Department'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {worker.workerType === 'w2_employee' ? 'W-2' : '1099'}
                                </Badge>
                                {worker.nextStageEligible && (
                                  <Badge className="bg-emerald-500 text-xs">
                                    Ready for Advancement
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quality Metrics */}
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground">Quality</p>
                              <p className="text-lg font-bold text-foreground">
                                {Number(worker.qualityScore || 0).toFixed(0)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">On-Time</p>
                              <p className="text-lg font-bold text-foreground">
                                {Number(worker.onTimeDeliveryRate || 0).toFixed(0)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Satisfaction</p>
                              <p className="text-lg font-bold text-foreground">
                                {Number(worker.clientSatisfactionScore || 0).toFixed(0)}%
                              </p>
                            </div>
                          </div>

                          {/* Readiness Score */}
                          <div className="w-full md:w-48">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Readiness</span>
                              <span className="text-sm font-medium text-foreground">
                                {worker.readinessScore}%
                              </span>
                            </div>
                            <Progress value={worker.readinessScore} className="h-2" />
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateReadiness.mutate({ progressionId: worker.id })}
                              disabled={updateReadiness.isPending}
                            >
                              <Target className="w-4 h-4 mr-1" />
                              Update
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="default" size="sm">
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    {worker.userName || `Worker #${worker.userId}`}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Progression details and career pathway
                                  </DialogDescription>
                                </DialogHeader>
                                <WorkerDetailView worker={worker} />
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Workers Found</h3>
                  <p className="text-muted-foreground">
                    Workers will appear here once they are enrolled in the progression system.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certifications?.map((cert: any) => (
                <Card key={cert.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          cert.premiumTier === 'elite' ? 'bg-gradient-to-r from-amber-400 to-rose-500' :
                          cert.premiumTier === 'premium' ? 'bg-amber-500' : 'bg-slate-500'
                        }`}>
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{cert.name}</CardTitle>
                          <CardDescription className="text-xs">{cert.code}</CardDescription>
                        </div>
                      </div>
                      <Badge className={PREMIUM_TIERS[cert.premiumTier as keyof typeof PREMIUM_TIERS]?.color}>
                        {PREMIUM_TIERS[cert.premiumTier as keyof typeof PREMIUM_TIERS]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {cert.description || 'No description available'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {cert.requiredTrainingHours}h training
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {cert.requiredPracticeHours}h practice
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <Badge variant="outline" className="capitalize">
                        {cert.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">
                        Valid for {cert.validityMonths} months
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!certifications || certifications.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Certifications</h3>
                    <p className="text-muted-foreground">
                      Certifications will be displayed here once created.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {badges?.map((badge: any) => (
                <Card key={badge.id} className="hover:shadow-md transition-shadow text-center">
                  <CardContent className="pt-6">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                      badge.tier === 'platinum' ? 'bg-gradient-to-r from-slate-300 to-slate-500' :
                      badge.tier === 'gold' ? 'bg-gradient-to-r from-amber-300 to-amber-500' :
                      badge.tier === 'silver' ? 'bg-gradient-to-r from-slate-200 to-slate-400' :
                      'bg-gradient-to-r from-amber-600 to-amber-800'
                    }`}>
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground">{badge.name}</h3>
                    <Badge variant="outline" className="mt-2 capitalize">
                      {badge.tier}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      {badge.description || badge.category}
                    </p>
                    {badge.tokenReward > 0 && (
                      <div className="mt-3 flex items-center justify-center gap-1 text-amber-500">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">+{badge.tokenReward} tokens</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!badges || badges.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Badges</h3>
                    <p className="text-muted-foreground">
                      Excellence badges will be displayed here once created.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="recent" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Recent Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.recentCertifications && dashboard.recentCertifications.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.recentCertifications.map((cert: any) => (
                        <div key={cert.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                          <Shield className="w-5 h-5 text-emerald-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {cert.certificationName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Worker #{cert.userId}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {new Date(cert.earnedAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent certifications
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Recent Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.recentBadges && dashboard.recentBadges.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.recentBadges.map((badge: any) => (
                        <div key={badge.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {badge.badgeName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Worker #{badge.userId} • {badge.tier}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {new Date(badge.earnedAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent badges
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Worker Detail View Component
function WorkerDetailView({ worker }: { worker: any }) {
  const { data: certifications } = trpc.workerProgression.getWorkerCertifications.useQuery({
    progressionId: worker.id,
  });
  
  const { data: badges } = trpc.workerProgression.getWorkerBadges.useQuery({
    progressionId: worker.id,
  });
  
  const { data: events } = trpc.workerProgression.getProgressionEvents.useQuery({
    progressionId: worker.id,
    limit: 10,
  });

  const stage = STAGES.find(s => s.key === worker.currentStage);
  const currentIndex = STAGES.findIndex(s => s.key === worker.currentStage);

  return (
    <div className="space-y-6 mt-4">
      {/* Progression Journey */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Progression Journey</h4>
        <div className="flex items-center gap-2">
          {STAGES.map((s, index) => {
            const StageIcon = s.icon;
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div key={s.key} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? s.color : isCurrent ? s.color : 'bg-muted'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <StageIcon className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-muted-foreground'}`} />
                  )}
                </div>
                {index < STAGES.length - 1 && (
                  <div className={`w-8 h-1 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Blockers */}
      {worker.nextStageBlockers && JSON.parse(worker.nextStageBlockers || '[]').length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Requirements for Next Stage</h4>
          <ul className="space-y-1">
            {JSON.parse(worker.nextStageBlockers).map((blocker: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {blocker}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Certifications */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Certifications</h4>
        {certifications && certifications.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert: any) => (
              <Badge key={cert.id} variant="secondary" className="gap-1">
                <GraduationCap className="w-3 h-3" />
                {cert.certificationName}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No certifications earned yet</p>
        )}
      </div>

      {/* Badges */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Excellence Badges</h4>
        {badges && badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge: any) => (
              <Badge key={badge.id} className={`gap-1 ${
                badge.tier === 'platinum' ? 'bg-slate-400' :
                badge.tier === 'gold' ? 'bg-amber-400' :
                badge.tier === 'silver' ? 'bg-slate-300' :
                'bg-amber-700'
              }`}>
                <Award className="w-3 h-3" />
                {badge.badgeName}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No badges earned yet</p>
        )}
      </div>

      {/* Recent Events */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Recent Activity</h4>
        {events && events.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {events.map((event: any) => (
              <div key={event.id} className="text-sm flex items-start gap-2 p-2 rounded bg-secondary/30">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <div className="flex-1">
                  <p className="text-foreground">{event.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        )}
      </div>
    </div>
  );
}
