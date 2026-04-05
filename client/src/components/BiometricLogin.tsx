import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, Scan, Key, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { biometricAuthService, BiometricCapabilities } from "@/services/biometricAuthService";
import { trpc } from "@/lib/trpc";

interface BiometricLoginProps {
  userId?: string;
  onSuccess?: () => void;
  onFallback?: () => void;
  className?: string;
}

export function BiometricLogin({ userId, onSuccess, onFallback, className }: BiometricLoginProps) {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);

  // Check for stored user ID if not provided
  const storedUserId = typeof window !== 'undefined' 
    ? localStorage.getItem('biometric_user_id') 
    : null;
  const effectiveUserId = userId || storedUserId || '';

  useEffect(() => {
    checkBiometricAvailability();
  }, [effectiveUserId]);

  const checkBiometricAvailability = async () => {
    const caps = await biometricAuthService.checkCapabilities();
    setCapabilities(caps);

    if (effectiveUserId) {
      const credentials = biometricAuthService.getCredentials(effectiveUserId);
      setHasCredentials(credentials.length > 0);
    }
  };

  const handleBiometricLogin = async () => {
    if (!effectiveUserId) {
      toast.error("Please enter your email first to use biometric login");
      onFallback?.();
      return;
    }

    setIsAuthenticating(true);

    try {
      const result = await biometricAuthService.authenticate(effectiveUserId);

      if (result.success) {
        toast.success("Biometric authentication successful!");
        // Store user ID for future biometric logins
        localStorage.setItem('biometric_user_id', effectiveUserId);
        onSuccess?.();
      } else {
        toast.error(result.message);
        if (result.message.includes('No biometric credentials')) {
          onFallback?.();
        }
      }
    } catch (error) {
      toast.error("Biometric authentication failed");
      onFallback?.();
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Don't render if biometrics not available
  if (!capabilities?.available) {
    return null;
  }

  // Don't render if no credentials registered for this user
  if (effectiveUserId && !hasCredentials) {
    return null;
  }

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full mt-4 h-12"
        onClick={handleBiometricLogin}
        disabled={isAuthenticating}
      >
        {isAuthenticating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            {capabilities.fingerprint ? (
              <Fingerprint className="w-5 h-5 mr-2" />
            ) : capabilities.faceRecognition ? (
              <Scan className="w-5 h-5 mr-2" />
            ) : (
              <Key className="w-5 h-5 mr-2" />
            )}
            Sign in with Biometrics
          </>
        )}
      </Button>

      {capabilities.platformAuthenticator && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          Use your device's fingerprint or face recognition
        </p>
      )}
    </div>
  );
}

// Compact biometric button for inline use
export function BiometricLoginButton({ 
  userId, 
  onSuccess, 
  size = 'default' 
}: { 
  userId?: string; 
  onSuccess?: () => void;
  size?: 'default' | 'sm' | 'lg';
}) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, [userId]);

  const checkAvailability = async () => {
    const caps = await biometricAuthService.checkCapabilities();
    if (caps.available && userId) {
      const credentials = biometricAuthService.getCredentials(userId);
      setIsAvailable(credentials.length > 0);
    }
  };

  const handleClick = async () => {
    if (!userId) return;
    
    setIsAuthenticating(true);
    try {
      const result = await biometricAuthService.authenticate(userId);
      if (result.success) {
        toast.success("Authenticated!");
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isAvailable) return null;

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleClick}
      disabled={isAuthenticating}
    >
      {isAuthenticating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Fingerprint className="w-4 h-4" />
      )}
    </Button>
  );
}

// Quick biometric verification for sensitive actions
export function BiometricVerification({
  onVerified,
  onCancel,
  title = "Verify Your Identity",
  description = "Use biometrics to confirm this action"
}: {
  onVerified: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);

  useEffect(() => {
    checkCapabilities();
  }, []);

  const checkCapabilities = async () => {
    const caps = await biometricAuthService.checkCapabilities();
    setCapabilities(caps);
  };

  const handleVerify = async () => {
    const userId = localStorage.getItem('biometric_user_id');
    if (!userId) {
      toast.error("No biometric credentials found");
      onCancel();
      return;
    }

    setIsVerifying(true);
    try {
      const result = await biometricAuthService.authenticate(userId);
      if (result.success) {
        onVerified();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!capabilities?.available) {
    // Fall back to password verification
    onCancel();
    return null;
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="pt-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Fingerprint className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4 mr-2" />
                Verify
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default BiometricLogin;
