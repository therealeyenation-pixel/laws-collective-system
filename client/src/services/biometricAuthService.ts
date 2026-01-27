// Biometric Authentication Service
// WebAuthn-based fingerprint/face recognition authentication

export interface BiometricCredential {
  id: string;
  name: string;
  type: 'fingerprint' | 'face' | 'platform' | 'cross-platform';
  createdAt: Date;
  lastUsed?: Date;
  deviceInfo: string;
}

export interface BiometricRegistrationResult {
  success: boolean;
  credential?: BiometricCredential;
  message: string;
}

export interface BiometricAuthResult {
  success: boolean;
  credentialId?: string;
  message: string;
}

export interface BiometricCapabilities {
  available: boolean;
  platformAuthenticator: boolean;
  fingerprint: boolean;
  faceRecognition: boolean;
  crossPlatform: boolean;
}

class BiometricAuthService {
  private readonly CREDENTIALS_KEY = 'biometric_credentials';
  private readonly RP_NAME = 'LuvOnPurpose';
  private readonly RP_ID = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // Check if WebAuthn is available
  async checkCapabilities(): Promise<BiometricCapabilities> {
    const capabilities: BiometricCapabilities = {
      available: false,
      platformAuthenticator: false,
      fingerprint: false,
      faceRecognition: false,
      crossPlatform: false
    };

    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return capabilities;
    }

    capabilities.available = true;

    try {
      // Check for platform authenticator (built-in biometrics)
      const platformAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      capabilities.platformAuthenticator = platformAvailable;
      
      // Platform authenticators typically support fingerprint or face
      if (platformAvailable) {
        capabilities.fingerprint = true;
        capabilities.faceRecognition = true;
      }

      // Cross-platform authenticators (security keys)
      capabilities.crossPlatform = true;
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
    }

    return capabilities;
  }

  // Register a new biometric credential
  async registerCredential(
    userId: string,
    userName: string,
    credentialName: string,
    preferredType: 'platform' | 'cross-platform' = 'platform'
  ): Promise<BiometricRegistrationResult> {
    try {
      const capabilities = await this.checkCapabilities();
      
      if (!capabilities.available) {
        return {
          success: false,
          message: 'WebAuthn is not supported in this browser'
        };
      }

      if (preferredType === 'platform' && !capabilities.platformAuthenticator) {
        return {
          success: false,
          message: 'Platform authenticator (fingerprint/face) is not available on this device'
        };
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create credential options
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: this.RP_NAME,
          id: this.RP_ID
        },
        user: {
          id: Uint8Array.from(userId, c => c.charCodeAt(0)),
          name: userName,
          displayName: userName
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: preferredType,
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      };

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) {
        return {
          success: false,
          message: 'Failed to create credential'
        };
      }

      // Store credential info
      const credentialData: BiometricCredential = {
        id: this.arrayBufferToBase64(credential.rawId),
        name: credentialName,
        type: this.detectCredentialType(credential),
        createdAt: new Date(),
        deviceInfo: this.getDeviceInfo()
      };

      this.saveCredential(userId, credentialData);

      return {
        success: true,
        credential: credentialData,
        message: 'Biometric credential registered successfully'
      };
    } catch (error: any) {
      console.error('Biometric registration error:', error);
      
      if (error.name === 'NotAllowedError') {
        return {
          success: false,
          message: 'Biometric registration was cancelled or denied'
        };
      }
      
      if (error.name === 'SecurityError') {
        return {
          success: false,
          message: 'Security error: Please ensure you are using HTTPS'
        };
      }

      return {
        success: false,
        message: error.message || 'Failed to register biometric credential'
      };
    }
  }

  // Authenticate using biometric
  async authenticate(userId: string): Promise<BiometricAuthResult> {
    try {
      const credentials = this.getCredentials(userId);
      
      if (credentials.length === 0) {
        return {
          success: false,
          message: 'No biometric credentials registered'
        };
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create authentication options
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: this.RP_ID,
        allowCredentials: credentials.map(cred => ({
          id: this.base64ToArrayBuffer(cred.id),
          type: 'public-key' as const,
          transports: ['internal', 'usb', 'ble', 'nfc'] as AuthenticatorTransport[]
        })),
        userVerification: 'required',
        timeout: 60000
      };

      // Get credential
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      if (!assertion) {
        return {
          success: false,
          message: 'Authentication failed'
        };
      }

      // Update last used
      const credentialId = this.arrayBufferToBase64(assertion.rawId);
      this.updateCredentialLastUsed(userId, credentialId);

      return {
        success: true,
        credentialId,
        message: 'Biometric authentication successful'
      };
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      
      if (error.name === 'NotAllowedError') {
        return {
          success: false,
          message: 'Biometric authentication was cancelled or denied'
        };
      }

      return {
        success: false,
        message: error.message || 'Biometric authentication failed'
      };
    }
  }

  // Get registered credentials for a user
  getCredentials(userId: string): BiometricCredential[] {
    const stored = localStorage.getItem(`${this.CREDENTIALS_KEY}_${userId}`);
    if (!stored) return [];
    
    return JSON.parse(stored).map((cred: any) => ({
      ...cred,
      createdAt: new Date(cred.createdAt),
      lastUsed: cred.lastUsed ? new Date(cred.lastUsed) : undefined
    }));
  }

  // Remove a credential
  removeCredential(userId: string, credentialId: string): boolean {
    const credentials = this.getCredentials(userId);
    const filtered = credentials.filter(c => c.id !== credentialId);
    
    if (filtered.length === credentials.length) return false;
    
    localStorage.setItem(
      `${this.CREDENTIALS_KEY}_${userId}`,
      JSON.stringify(filtered)
    );
    return true;
  }

  // Rename a credential
  renameCredential(userId: string, credentialId: string, newName: string): boolean {
    const credentials = this.getCredentials(userId);
    const credential = credentials.find(c => c.id === credentialId);
    
    if (!credential) return false;
    
    credential.name = newName;
    localStorage.setItem(
      `${this.CREDENTIALS_KEY}_${userId}`,
      JSON.stringify(credentials)
    );
    return true;
  }

  // Check if user has any biometric credentials
  hasCredentials(userId: string): boolean {
    return this.getCredentials(userId).length > 0;
  }

  // Get credential count
  getCredentialCount(userId: string): number {
    return this.getCredentials(userId).length;
  }

  // Private helper methods
  private saveCredential(userId: string, credential: BiometricCredential): void {
    const credentials = this.getCredentials(userId);
    credentials.push(credential);
    localStorage.setItem(
      `${this.CREDENTIALS_KEY}_${userId}`,
      JSON.stringify(credentials)
    );
  }

  private updateCredentialLastUsed(userId: string, credentialId: string): void {
    const credentials = this.getCredentials(userId);
    const credential = credentials.find(c => c.id === credentialId);
    
    if (credential) {
      credential.lastUsed = new Date();
      localStorage.setItem(
        `${this.CREDENTIALS_KEY}_${userId}`,
        JSON.stringify(credentials)
      );
    }
  }

  private detectCredentialType(credential: PublicKeyCredential): BiometricCredential['type'] {
    const response = credential.response as AuthenticatorAttestationResponse;
    
    // Try to detect based on authenticator attachment
    if (response.getTransports) {
      const transports = response.getTransports();
      if (transports.includes('internal')) {
        return 'platform';
      }
    }
    
    return 'cross-platform';
  }

  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    
    if (/iPhone|iPad|iPod/.test(ua)) {
      return 'iOS Device';
    }
    if (/Android/.test(ua)) {
      return 'Android Device';
    }
    if (/Mac/.test(ua)) {
      return 'Mac';
    }
    if (/Windows/.test(ua)) {
      return 'Windows PC';
    }
    if (/Linux/.test(ua)) {
      return 'Linux';
    }
    
    return 'Unknown Device';
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export const biometricAuthService = new BiometricAuthService();
