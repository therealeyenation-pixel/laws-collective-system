import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Smartphone, 
  Key, 
  Copy, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Trash2,
  QrCode,
  Lock,
  Unlock
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { twoFactorAuthService, TwoFactorSetup, TwoFactorStatus } from "@/services/twoFactorAuthService";

export default function TwoFactorSetupPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");

  useEffect(() => {
    if (user?.id) {
      loadStatus();
    }
  }, [user?.id]);

  const loadStatus = () => {
    if (!user?.id) return;
    const currentStatus = twoFactorAuthService.getStatus(user.id.toString());
    setStatus(currentStatus);
    if (currentStatus.enabled) {
      setActiveTab("manage");
    }
  };

  const handleStartSetup = async () => {
    if (!user?.id || !user?.email) return;
    setIsLoading(true);
    try {
      const setupData = await twoFactorAuthService.generateSetup(
        user.id.toString(),
        user.email
      );
      setSetup(setupData);
      toast.success("2FA setup initiated. Scan the QR code with your authenticator app.");
    } catch (error) {
      toast.error("Failed to start 2FA setup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!user?.id || !verificationCode) return;
    setIsLoading(true);
    try {
      const result = await twoFactorAuthService.enable2FA(
        user.id.toString(),
        verificationCode
      );
      if (result.success) {
        toast.success("2FA enabled successfully!");
        setSetup(null);
        setVerificationCode("");
        loadStatus();
        setActiveTab("manage");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to enable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user?.id || !verificationCode) return;
    setIsLoading(true);
    try {
      const result = await twoFactorAuthService.disable2FA(
        user.id.toString(),
        verificationCode
      );
      if (result.success) {
        toast.success("2FA disabled successfully");
        setVerificationCode("");
        loadStatus();
        setActiveTab("setup");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!user?.id || !verificationCode) return;
    setIsLoading(true);
    try {
      const result = await twoFactorAuthService.regenerateBackupCodes(
        user.id.toString(),
        verificationCode
      );
      if (result.success && result.codes) {
        setSetup(prev => prev ? { ...prev, backupCodes: result.codes! } : null);
        toast.success("Backup codes regenerated");
        setVerificationCode("");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to regenerate backup codes");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "secret" | "codes") => {
    navigator.clipboard.writeText(text);
    if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
    toast.success("Copied to clipboard");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Two-Factor Authentication</h1>
            <p className="text-muted-foreground mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <Badge variant={status?.enabled ? "default" : "secondary"} className="text-sm">
            {status?.enabled ? (
              <><Lock className="w-3 h-3 mr-1" /> Enabled</>
            ) : (
              <><Unlock className="w-3 h-3 mr-1" /> Disabled</>
            )}
          </Badge>
        </div>

        {/* Status Card */}
        {status?.enabled && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    2FA is Active
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Enabled: {status.enabledAt?.toLocaleDateString()}</p>
                  <p>Backup codes: {status.backupCodesRemaining} remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="setup" disabled={status?.enabled}>
              <QrCode className="w-4 h-4 mr-2" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="manage" disabled={!status?.enabled}>
              <Key className="w-4 h-4 mr-2" />
              Manage
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            {!setup ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Set Up Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Use an authenticator app like Google Authenticator, Authy, or 1Password
                    to generate verification codes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-2">1</div>
                      <h4 className="font-medium">Download App</h4>
                      <p className="text-sm text-muted-foreground">
                        Install an authenticator app on your phone
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-2">2</div>
                      <h4 className="font-medium">Scan QR Code</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the app to scan the QR code we provide
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-2">3</div>
                      <h4 className="font-medium">Enter Code</h4>
                      <p className="text-sm text-muted-foreground">
                        Verify by entering the 6-digit code from the app
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleStartSetup} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    Begin Setup
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Code Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Scan QR Code</CardTitle>
                    <CardDescription>
                      Scan this code with your authenticator app
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <img 
                        src={setup.qrCodeUrl} 
                        alt="2FA QR Code" 
                        className="w-48 h-48"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Manual Entry Key</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={setup.secret} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(setup.secret, "secret")}
                        >
                          {copiedSecret ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Verification Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Verify Setup</CardTitle>
                    <CardDescription>
                      Enter the 6-digit code from your authenticator app
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Verification Code</Label>
                      <Input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="text-center text-2xl font-mono tracking-widest"
                        maxLength={6}
                      />
                    </div>
                    <Button 
                      onClick={handleEnable2FA} 
                      disabled={isLoading || verificationCode.length !== 6}
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Enable 2FA
                    </Button>
                  </CardContent>
                </Card>

                {/* Backup Codes Card */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Backup Codes
                    </CardTitle>
                    <CardDescription>
                      Save these codes in a secure place. Each code can only be used once.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="mb-4">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        These codes will only be shown once. Make sure to save them before enabling 2FA.
                      </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                      {setup.backupCodes.map((code, index) => (
                        <div 
                          key={index}
                          className="p-2 bg-muted rounded font-mono text-sm text-center"
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(setup.backupCodes.join('\n'), "codes")}
                    >
                      {copiedCodes ? (
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      Copy All Codes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Backup Codes Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Backup Codes
                  </CardTitle>
                  <CardDescription>
                    {status?.backupCodesRemaining} codes remaining
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {status && status.backupCodesRemaining < 3 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        You're running low on backup codes. Consider regenerating them.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label>Enter code to regenerate</Label>
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="text-center font-mono"
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleRegenerateBackupCodes}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate Backup Codes
                  </Button>
                </CardContent>
              </Card>

              {/* Disable 2FA */}
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="w-5 h-5" />
                    Disable 2FA
                  </CardTitle>
                  <CardDescription>
                    Remove two-factor authentication from your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Disabling 2FA will make your account less secure. Only do this if necessary.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Label>Enter code to disable</Label>
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="text-center font-mono"
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleDisable2FA}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Disable 2FA
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
