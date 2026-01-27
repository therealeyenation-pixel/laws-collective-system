import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Fingerprint, 
  Scan, 
  Smartphone,
  Laptop,
  Key,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Shield,
  AlertTriangle,
  RefreshCw,
  Clock,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  biometricAuthService, 
  BiometricCredential, 
  BiometricCapabilities 
} from "@/services/biometricAuthService";

export default function BiometricSettingsPage() {
  const { user } = useAuth();
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [credentials, setCredentials] = useState<BiometricCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<string | null>(null);
  const [newCredentialName, setNewCredentialName] = useState("");
  const [editName, setEditName] = useState("");
  const [selectedType, setSelectedType] = useState<'platform' | 'cross-platform'>('platform');

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const caps = await biometricAuthService.checkCapabilities();
      setCapabilities(caps);
      
      if (user?.id) {
        const creds = biometricAuthService.getCredentials(user.id.toString());
        setCredentials(creds);
      }
    } catch (error) {
      console.error('Error loading biometric data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user?.id || !user?.email || !newCredentialName) {
      toast.error("Please enter a name for this credential");
      return;
    }

    setIsRegistering(true);
    try {
      const result = await biometricAuthService.registerCredential(
        user.id.toString(),
        user.email,
        newCredentialName,
        selectedType
      );

      if (result.success) {
        toast.success("Biometric credential registered successfully");
        setIsRegisterOpen(false);
        setNewCredentialName("");
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to register biometric credential");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!user?.id) return;

    setIsAuthenticating(true);
    try {
      const result = await biometricAuthService.authenticate(user.id.toString());

      if (result.success) {
        toast.success("Biometric authentication successful!");
        loadData(); // Refresh to show updated last used time
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Biometric authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRemove = (credentialId: string) => {
    if (!user?.id) return;

    const success = biometricAuthService.removeCredential(user.id.toString(), credentialId);
    if (success) {
      toast.success("Credential removed");
      loadData();
    } else {
      toast.error("Failed to remove credential");
    }
  };

  const handleRename = (credentialId: string) => {
    if (!user?.id || !editName) return;

    const success = biometricAuthService.renameCredential(
      user.id.toString(),
      credentialId,
      editName
    );

    if (success) {
      toast.success("Credential renamed");
      setEditingCredential(null);
      setEditName("");
      loadData();
    } else {
      toast.error("Failed to rename credential");
    }
  };

  const getCredentialIcon = (type: BiometricCredential['type']) => {
    switch (type) {
      case 'fingerprint':
        return <Fingerprint className="w-5 h-5" />;
      case 'face':
        return <Scan className="w-5 h-5" />;
      case 'platform':
        return <Smartphone className="w-5 h-5" />;
      case 'cross-platform':
        return <Key className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getCredentialTypeBadge = (type: BiometricCredential['type']) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      fingerprint: "default",
      face: "default",
      platform: "secondary",
      'cross-platform': "outline"
    };
    
    const labels: Record<string, string> = {
      fingerprint: "Fingerprint",
      face: "Face Recognition",
      platform: "Platform",
      'cross-platform': "Security Key"
    };

    return (
      <Badge variant={variants[type] || "secondary"}>
        {labels[type] || type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Biometric Authentication</h1>
            <p className="text-muted-foreground mt-1">
              Use fingerprint or face recognition for secure login
            </p>
          </div>
          {capabilities?.available && (
            <Button onClick={() => setIsRegisterOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Biometric
            </Button>
          )}
        </div>

        {/* Capabilities Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Device Capabilities
            </CardTitle>
            <CardDescription>
              Biometric authentication features available on this device
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!capabilities?.available ? (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  WebAuthn is not supported in this browser. Please use a modern browser like Chrome, Firefox, Safari, or Edge.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${capabilities.platformAuthenticator ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Smartphone className={`w-5 h-5 ${capabilities.platformAuthenticator ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Platform Auth</p>
                    <p className="text-xs text-muted-foreground">
                      {capabilities.platformAuthenticator ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${capabilities.fingerprint ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Fingerprint className={`w-5 h-5 ${capabilities.fingerprint ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Fingerprint</p>
                    <p className="text-xs text-muted-foreground">
                      {capabilities.fingerprint ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${capabilities.faceRecognition ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Scan className={`w-5 h-5 ${capabilities.faceRecognition ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Face Recognition</p>
                    <p className="text-xs text-muted-foreground">
                      {capabilities.faceRecognition ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${capabilities.crossPlatform ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Key className={`w-5 h-5 ${capabilities.crossPlatform ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Security Keys</p>
                    <p className="text-xs text-muted-foreground">
                      {capabilities.crossPlatform ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registered Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Registered Credentials
            </CardTitle>
            <CardDescription>
              Manage your biometric authentication methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            {credentials.length === 0 ? (
              <div className="text-center py-8">
                <Fingerprint className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-foreground mb-2">No Biometric Credentials</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a biometric credential to enable passwordless login
                </p>
                {capabilities?.available && (
                  <Button onClick={() => setIsRegisterOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Biometric
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {credentials.map((credential) => (
                  <div
                    key={credential.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getCredentialIcon(credential.type)}
                      </div>
                      <div>
                        {editingCredential === credential.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-8 w-48"
                              autoFocus
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleRename(credential.id)}
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingCredential(null);
                                setEditName("");
                              }}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{credential.name}</p>
                              {getCredentialTypeBadge(credential.type)}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Laptop className="w-3 h-3" />
                                {credential.deviceInfo}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Added {credential.createdAt.toLocaleDateString()}
                              </span>
                              {credential.lastUsed && (
                                <span>
                                  Last used {credential.lastUsed.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {editingCredential !== credential.id && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCredential(credential.id);
                            setEditName(credential.name);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRemove(credential.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Authentication */}
        {credentials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Authentication</CardTitle>
              <CardDescription>
                Verify your biometric credentials are working correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleAuthenticate}
                disabled={isAuthenticating}
                className="w-full md:w-auto"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Test Biometric Login
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Biometric Authentication Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-medium mb-2">Register</h4>
                <p className="text-sm text-muted-foreground">
                  Add your fingerprint or face recognition as an authentication method
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-medium mb-2">Secure Storage</h4>
                <p className="text-sm text-muted-foreground">
                  Your biometric data never leaves your device - only a secure key is stored
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-medium mb-2">Quick Login</h4>
                <p className="text-sm text-muted-foreground">
                  Use your biometric instead of entering a 2FA code for faster, secure access
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Register Dialog */}
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register Biometric Credential</DialogTitle>
              <DialogDescription>
                Add a new fingerprint or face recognition for authentication
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Credential Name</Label>
                <Input
                  placeholder="e.g., MacBook Pro Touch ID"
                  value={newCredentialName}
                  onChange={(e) => setNewCredentialName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Give this credential a name to identify it later
                </p>
              </div>

              <div className="space-y-2">
                <Label>Authenticator Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedType === 'platform'
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedType('platform')}
                    disabled={!capabilities?.platformAuthenticator}
                  >
                    <Smartphone className="w-6 h-6 mb-2" />
                    <p className="font-medium">Platform</p>
                    <p className="text-xs text-muted-foreground">
                      Built-in fingerprint or face recognition
                    </p>
                  </button>
                  <button
                    type="button"
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedType === 'cross-platform'
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedType('cross-platform')}
                  >
                    <Key className="w-6 h-6 mb-2" />
                    <p className="font-medium">Security Key</p>
                    <p className="text-xs text-muted-foreground">
                      External USB or NFC security key
                    </p>
                  </button>
                </div>
              </div>

              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  You'll be prompted to verify your identity using your device's biometric sensor.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRegisterOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRegister} disabled={isRegistering || !newCredentialName}>
                {isRegistering ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Register
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
