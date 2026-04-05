// Two-Factor Authentication Service
// Handles TOTP generation, verification, and backup codes

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  enabledAt?: Date;
  lastVerified?: Date;
  backupCodesRemaining: number;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  attemptsRemaining?: number;
}

class TwoFactorAuthService {
  private readonly TOTP_ISSUER = 'LuvOnPurpose';
  private readonly TOTP_ALGORITHM = 'SHA1';
  private readonly TOTP_DIGITS = 6;
  private readonly TOTP_PERIOD = 30;
  private readonly BACKUP_CODE_COUNT = 10;
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Generate a new 2FA secret and QR code
  async generateSetup(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    // Generate random secret (base32 encoded)
    const secret = this.generateSecret();
    
    // Generate QR code URL for authenticator apps
    const qrCodeUrl = this.generateQRCodeUrl(secret, userEmail);
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    
    // Store setup in localStorage temporarily until verified
    localStorage.setItem(`2fa_pending_${userId}`, JSON.stringify({
      secret,
      backupCodes,
      createdAt: new Date().toISOString()
    }));
    
    return { secret, qrCodeUrl, backupCodes };
  }

  // Generate random base32 secret
  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  }

  // Generate QR code URL for authenticator apps
  private generateQRCodeUrl(secret: string, email: string): string {
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(this.TOTP_ISSUER)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(this.TOTP_ISSUER)}&algorithm=${this.TOTP_ALGORITHM}&digits=${this.TOTP_DIGITS}&period=${this.TOTP_PERIOD}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
  }

  // Generate backup codes
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                   '-' + 
                   Math.random().toString(36).substring(2, 6).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Verify TOTP code
  async verifyCode(userId: string, code: string): Promise<VerificationResult> {
    // Check for lockout
    const lockoutKey = `2fa_lockout_${userId}`;
    const lockoutData = localStorage.getItem(lockoutKey);
    if (lockoutData) {
      const lockout = JSON.parse(lockoutData);
      if (Date.now() < lockout.until) {
        const remainingMinutes = Math.ceil((lockout.until - Date.now()) / 60000);
        return {
          success: false,
          message: `Account locked. Try again in ${remainingMinutes} minutes.`
        };
      }
      localStorage.removeItem(lockoutKey);
    }

    // Get stored 2FA data
    const storedData = this.get2FAData(userId);
    if (!storedData) {
      return { success: false, message: '2FA not configured' };
    }

    // Check if it's a backup code
    if (code.includes('-') && storedData.backupCodes.includes(code)) {
      // Remove used backup code
      storedData.backupCodes = storedData.backupCodes.filter((c: string) => c !== code);
      this.save2FAData(userId, storedData);
      return { success: true, message: 'Backup code accepted' };
    }

    // Verify TOTP
    const isValid = this.verifyTOTP(storedData.secret, code);
    
    if (isValid) {
      // Reset attempts on success
      localStorage.removeItem(`2fa_attempts_${userId}`);
      storedData.lastVerified = new Date().toISOString();
      this.save2FAData(userId, storedData);
      return { success: true, message: 'Code verified successfully' };
    }

    // Track failed attempts
    const attemptsKey = `2fa_attempts_${userId}`;
    const attempts = parseInt(localStorage.getItem(attemptsKey) || '0') + 1;
    localStorage.setItem(attemptsKey, attempts.toString());

    if (attempts >= this.MAX_ATTEMPTS) {
      localStorage.setItem(lockoutKey, JSON.stringify({
        until: Date.now() + this.LOCKOUT_DURATION
      }));
      localStorage.removeItem(attemptsKey);
      return {
        success: false,
        message: 'Too many failed attempts. Account locked for 15 minutes.'
      };
    }

    return {
      success: false,
      message: 'Invalid code',
      attemptsRemaining: this.MAX_ATTEMPTS - attempts
    };
  }

  // Simple TOTP verification (time-based)
  private verifyTOTP(secret: string, code: string): boolean {
    // Allow for time drift (check current and adjacent time windows)
    const timeWindows = [-1, 0, 1];
    const currentTime = Math.floor(Date.now() / 1000 / this.TOTP_PERIOD);
    
    for (const offset of timeWindows) {
      const expectedCode = this.generateTOTP(secret, currentTime + offset);
      if (expectedCode === code) {
        return true;
      }
    }
    return false;
  }

  // Generate TOTP code for a given time
  private generateTOTP(secret: string, counter: number): string {
    // Simplified TOTP generation (in production, use a proper library)
    // This is a placeholder that generates consistent codes for demo
    const hash = this.simpleHash(secret + counter.toString());
    const code = (Math.abs(hash) % 1000000).toString().padStart(6, '0');
    return code;
  }

  // Simple hash function for demo purposes
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  // Enable 2FA after initial verification
  async enable2FA(userId: string, verificationCode: string): Promise<VerificationResult> {
    const pendingKey = `2fa_pending_${userId}`;
    const pendingData = localStorage.getItem(pendingKey);
    
    if (!pendingData) {
      return { success: false, message: 'No pending 2FA setup found' };
    }

    const pending = JSON.parse(pendingData);
    const isValid = this.verifyTOTP(pending.secret, verificationCode);

    if (!isValid) {
      return { success: false, message: 'Invalid verification code' };
    }

    // Save 2FA data permanently
    this.save2FAData(userId, {
      secret: pending.secret,
      backupCodes: pending.backupCodes,
      enabled: true,
      enabledAt: new Date().toISOString(),
      lastVerified: new Date().toISOString()
    });

    // Remove pending setup
    localStorage.removeItem(pendingKey);

    return { success: true, message: '2FA enabled successfully' };
  }

  // Disable 2FA
  async disable2FA(userId: string, verificationCode: string): Promise<VerificationResult> {
    const result = await this.verifyCode(userId, verificationCode);
    
    if (!result.success) {
      return result;
    }

    localStorage.removeItem(`2fa_data_${userId}`);
    return { success: true, message: '2FA disabled successfully' };
  }

  // Get 2FA status
  getStatus(userId: string): TwoFactorStatus {
    const data = this.get2FAData(userId);
    
    if (!data || !data.enabled) {
      return {
        enabled: false,
        backupCodesRemaining: 0
      };
    }

    return {
      enabled: true,
      enabledAt: data.enabledAt ? new Date(data.enabledAt) : undefined,
      lastVerified: data.lastVerified ? new Date(data.lastVerified) : undefined,
      backupCodesRemaining: data.backupCodes?.length || 0
    };
  }

  // Regenerate backup codes
  async regenerateBackupCodes(userId: string, verificationCode: string): Promise<{ success: boolean; codes?: string[]; message: string }> {
    const result = await this.verifyCode(userId, verificationCode);
    
    if (!result.success) {
      return { success: false, message: result.message };
    }

    const data = this.get2FAData(userId);
    if (!data) {
      return { success: false, message: '2FA not configured' };
    }

    const newCodes = this.generateBackupCodes();
    data.backupCodes = newCodes;
    this.save2FAData(userId, data);

    return { success: true, codes: newCodes, message: 'Backup codes regenerated' };
  }

  // Private helper methods
  private get2FAData(userId: string): any {
    const data = localStorage.getItem(`2fa_data_${userId}`);
    return data ? JSON.parse(data) : null;
  }

  private save2FAData(userId: string, data: any): void {
    localStorage.setItem(`2fa_data_${userId}`, JSON.stringify(data));
  }
}

export const twoFactorAuthService = new TwoFactorAuthService();
