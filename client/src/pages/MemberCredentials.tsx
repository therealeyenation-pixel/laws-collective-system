import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  QrCode, 
  Download, 
  Shield, 
  Star,
  Award,
  Users,
  Clock,
  CheckCircle2,
  Barcode,
  Copy,
  Printer,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

type AccessTier = 'guest' | 'member' | 'certified' | 'house_owner' | 'elder' | 'founder';
type EntryPath = 'game' | 'academy' | 'direct' | 'employment' | 'legacy';

interface MemberCredential {
  id: string;
  memberId: string;
  name: string;
  tier: AccessTier;
  entryPath: EntryPath;
  joinDate: string;
  achievements: string[];
  verificationHash: string;
}

const TIER_INFO: Record<AccessTier, { name: string; color: string; permissions: string[]; nextTier?: AccessTier }> = {
  guest: {
    name: 'Guest',
    color: 'bg-gray-500',
    permissions: ['View public content', 'Play demo games', 'Browse academy catalog'],
    nextTier: 'member'
  },
  member: {
    name: 'Member',
    color: 'bg-blue-500',
    permissions: ['Full game access', 'Academy courses', 'Community forums', 'Basic documents'],
    nextTier: 'certified'
  },
  certified: {
    name: 'Certified Member',
    color: 'bg-green-500',
    permissions: ['All member permissions', 'Advanced courses', 'Mentorship program', 'Business tools'],
    nextTier: 'house_owner'
  },
  house_owner: {
    name: 'House Owner',
    color: 'bg-purple-500',
    permissions: ['All certified permissions', 'House management', 'Family invitations', 'Trust documents'],
    nextTier: 'elder'
  },
  elder: {
    name: 'Elder',
    color: 'bg-amber-500',
    permissions: ['All house owner permissions', 'Community governance', 'Voting rights', 'Advisory role'],
    nextTier: 'founder'
  },
  founder: {
    name: 'Founder',
    color: 'bg-red-500',
    permissions: ['Full system access', 'Administrative controls', 'Legacy planning', 'All governance rights']
  }
};

const ENTRY_PATH_INFO: Record<EntryPath, { name: string; description: string }> = {
  game: { name: 'Game Path', description: 'Entered through L.A.W.S. Quest completion' },
  academy: { name: 'Academy Path', description: 'Completed academy certification program' },
  direct: { name: 'Direct Application', description: 'Applied directly to the organization' },
  employment: { name: 'Employment Path', description: 'Joined through employment relationship' },
  legacy: { name: 'Legacy Path', description: 'Family member or inherited membership' }
};

const SAMPLE_ACHIEVEMENTS = [
  'Quest Chapter 1 Complete',
  'Academy Graduate',
  'First Business Formation',
  'Community Contributor',
  'Mentor Badge'
];

export default function MemberCredentials() {
  const [activeTab, setActiveTab] = useState('my-credential');
  const [verifyId, setVerifyId] = useState('');
  const [verificationResult, setVerificationResult] = useState<'valid' | 'invalid' | null>(null);

  // Sample credential for demo
  const [credential] = useState<MemberCredential>({
    id: 'CRED-001',
    memberId: 'LAWS-A7B-3C9-XY',
    name: 'Sample Member',
    tier: 'certified',
    entryPath: 'academy',
    joinDate: '2024-06-15',
    achievements: SAMPLE_ACHIEVEMENTS.slice(0, 3),
    verificationHash: 'a1b2c3d4e5f6g7h8i9j0'
  });

  const getTierProgress = (tier: AccessTier): number => {
    const tiers: AccessTier[] = ['guest', 'member', 'certified', 'house_owner', 'elder', 'founder'];
    const index = tiers.indexOf(tier);
    return Math.round(((index + 1) / tiers.length) * 100);
  };

  const handleVerify = () => {
    if (!verifyId.trim()) {
      toast.error('Please enter a member ID');
      return;
    }
    // Simulate verification
    if (verifyId.toUpperCase().startsWith('LAWS-')) {
      setVerificationResult('valid');
      toast.success('Credential verified successfully');
    } else {
      setVerificationResult('invalid');
      toast.error('Invalid credential');
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(credential.memberId);
    toast.success('Member ID copied to clipboard');
  };

  const handlePrint = () => {
    toast.success('Preparing credential card for printing...');
    // In a real implementation, this would open a print dialog
  };

  const handleDownloadQR = () => {
    toast.success('QR code downloaded');
    // In a real implementation, this would download the QR code image
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Member Credentials</h1>
            <p className="text-muted-foreground">Manage and verify L.A.W.S. membership credentials</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="my-credential">My Credential</TabsTrigger>
            <TabsTrigger value="verify">Verify Credential</TabsTrigger>
            <TabsTrigger value="tiers">Access Tiers</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="my-credential" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Credential Card */}
              <Card className="overflow-hidden">
                <div className={`h-2 ${TIER_INFO[credential.tier].color}`} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>L.A.W.S. Member Credential</CardTitle>
                    <Badge className={TIER_INFO[credential.tier].color}>
                      {TIER_INFO[credential.tier].name}
                    </Badge>
                  </div>
                  <CardDescription>Official membership identification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{credential.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm bg-muted px-2 py-1 rounded">{credential.memberId}</code>
                        <Button variant="ghost" size="icon" onClick={handleCopyId}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Entry Path</p>
                      <p className="font-medium">{ENTRY_PATH_INFO[credential.entryPath].name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Member Since</p>
                      <p className="font-medium">{new Date(credential.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tier Progress</p>
                    <Progress value={getTierProgress(credential.tier)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {TIER_INFO[credential.tier].nextTier 
                        ? `Next: ${TIER_INFO[TIER_INFO[credential.tier].nextTier!].name}`
                        : 'Maximum tier achieved'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
                      <Printer className="w-4 h-4" />
                      Print Card
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2" onClick={handleDownloadQR}>
                      <Download className="w-4 h-4" />
                      Download QR
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions & Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Your Permissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {TIER_INFO[credential.tier].permissions.map((perm, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {perm}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {credential.achievements.map((achievement, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 text-amber-500" />
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Barcode className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Verification Hash</p>
                        <code className="text-xs">{credential.verificationHash}</code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verify" className="mt-4">
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>Verify Member Credential</CardTitle>
                <CardDescription>Enter a member ID to verify their credential status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-id">Member ID</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="verify-id"
                      placeholder="LAWS-XXX-XXX-XX"
                      value={verifyId}
                      onChange={(e) => setVerifyId(e.target.value)}
                    />
                    <Button onClick={handleVerify}>Verify</Button>
                  </div>
                </div>

                {verificationResult && (
                  <Card className={verificationResult === 'valid' ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : 'bg-red-50 dark:bg-red-950/20 border-red-200'}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        {verificationResult === 'valid' ? (
                          <>
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <div>
                              <p className="font-semibold text-green-800 dark:text-green-200">Valid Credential</p>
                              <p className="text-sm text-green-700 dark:text-green-300">This member ID is verified and active</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-6 h-6 text-red-600" />
                            <div>
                              <p className="font-semibold text-red-800 dark:text-red-200">Invalid Credential</p>
                              <p className="text-sm text-red-700 dark:text-red-300">This member ID could not be verified</p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.entries(TIER_INFO) as [AccessTier, typeof TIER_INFO[AccessTier]][]).map(([tier, info]) => (
                <Card key={tier} className={credential.tier === tier ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{info.name}</CardTitle>
                      <div className={`w-4 h-4 rounded-full ${info.color}`} />
                    </div>
                    {credential.tier === tier && (
                      <Badge variant="outline">Current Tier</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium mb-2">Permissions:</p>
                    <ul className="space-y-1">
                      {info.permissions.map((perm, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" />
                          {perm}
                        </li>
                      ))}
                    </ul>
                    {info.nextTier && (
                      <p className="text-xs text-muted-foreground mt-4">
                        Next tier: {TIER_INFO[info.nextTier].name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLE_ACHIEVEMENTS.map((achievement, i) => {
                const earned = credential.achievements.includes(achievement);
                return (
                  <Card key={i} className={earned ? '' : 'opacity-50'}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${earned ? 'bg-amber-500/10' : 'bg-muted'}`}>
                          <Star className={`w-6 h-6 ${earned ? 'text-amber-500' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{achievement}</p>
                          <p className="text-sm text-muted-foreground">
                            {earned ? 'Earned' : 'Not yet earned'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
