/**
 * Member Credential System Service
 * Phase 145: Unique member IDs, QR credentials, access tiers
 */

export type AccessTier = 'guest' | 'member' | 'certified' | 'house_owner' | 'elder' | 'founder';
export type EntryPath = 'game' | 'academy' | 'direct' | 'employment' | 'legacy';

export interface MemberCredential {
  credentialId: string;
  memberId: string;
  userId: string;
  displayName: string;
  entryPath: EntryPath;
  accessTier: AccessTier;
  houseId?: string;
  houseName?: string;
  achievements: Achievement[];
  issuedAt: Date;
  expiresAt?: Date;
  qrCode: string;
  barcode: string;
  verificationHash: string;
}

export interface Achievement {
  achievementId: string;
  name: string;
  category: 'game' | 'academy' | 'business' | 'community' | 'leadership';
  earnedAt: Date;
  description: string;
}

export interface CredentialVerification {
  isValid: boolean;
  credential?: MemberCredential;
  verifiedAt: Date;
  verificationMethod: 'qr' | 'barcode' | 'manual';
  message: string;
}

const ACCESS_TIER_PERMISSIONS: Record<AccessTier, string[]> = {
  guest: ['view_public_content', 'play_demo_games'],
  member: ['view_public_content', 'play_all_games', 'access_academy', 'join_discussions'],
  certified: ['view_public_content', 'play_all_games', 'access_academy', 'join_discussions', 'create_content', 'mentor_members'],
  house_owner: ['view_public_content', 'play_all_games', 'access_academy', 'join_discussions', 'create_content', 'mentor_members', 'manage_house', 'access_wealth_system'],
  elder: ['view_public_content', 'play_all_games', 'access_academy', 'join_discussions', 'create_content', 'mentor_members', 'manage_house', 'access_wealth_system', 'governance_voting', 'arbitration'],
  founder: ['all_permissions', 'system_administration', 'policy_creation']
};

const ENTRY_PATH_REQUIREMENTS: Record<EntryPath, string[]> = {
  game: ['Complete L.A.W.S. Quest all realms', 'Achieve Sovereignty status'],
  academy: ['Complete certification program', 'Pass final assessment'],
  direct: ['Complete S.W.A.L. onboarding journey', 'Pass all realm assessments'],
  employment: ['Active W-2 or 1099 status', 'Complete employee onboarding'],
  legacy: ['Verified bloodline connection', 'House owner sponsorship']
};

export function generateMemberId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  const checksum = calculateChecksum(timestamp + random);
  return `LAWS-${timestamp}-${random}-${checksum}`;
}

function calculateChecksum(input: string): string {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += input.charCodeAt(i) * (i + 1);
  }
  return (sum % 100).toString().padStart(2, '0');
}

export function generateQRCode(credential: MemberCredential): string {
  const data = {
    id: credential.memberId,
    name: credential.displayName,
    tier: credential.accessTier,
    house: credential.houseName || 'None',
    issued: credential.issuedAt.toISOString(),
    hash: credential.verificationHash
  };
  return `LAWS-QR:${Buffer.from(JSON.stringify(data)).toString('base64')}`;
}

export function generateBarcode(memberId: string): string {
  const numericId = memberId.replace(/[^0-9A-Z]/g, '').slice(0, 12);
  let code = '';
  for (let i = 0; i < numericId.length; i++) {
    const char = numericId[i];
    const value = char >= '0' && char <= '9' ? parseInt(char) : char.charCodeAt(0) - 55;
    code += value.toString().padStart(2, '0');
  }
  const checkDigit = code.split('').reduce((sum, d) => sum + parseInt(d), 0) % 10;
  return code + checkDigit;
}

export function generateVerificationHash(credential: Partial<MemberCredential>): string {
  const data = `${credential.memberId}|${credential.userId}|${credential.displayName}|${credential.accessTier}|${credential.issuedAt?.toISOString()}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

export function issueMemberCredential(
  userId: string,
  displayName: string,
  entryPath: EntryPath,
  accessTier: AccessTier,
  houseId?: string,
  houseName?: string
): MemberCredential {
  const memberId = generateMemberId();
  const issuedAt = new Date();
  
  const partialCredential: Partial<MemberCredential> = {
    memberId,
    userId,
    displayName,
    accessTier,
    issuedAt
  };
  
  const verificationHash = generateVerificationHash(partialCredential);
  
  const credential: MemberCredential = {
    credentialId: `cred-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    memberId,
    userId,
    displayName,
    entryPath,
    accessTier,
    houseId,
    houseName,
    achievements: [],
    issuedAt,
    qrCode: '',
    barcode: generateBarcode(memberId),
    verificationHash
  };
  
  credential.qrCode = generateQRCode(credential);
  
  return credential;
}

export function addAchievement(
  credential: MemberCredential,
  name: string,
  category: Achievement['category'],
  description: string
): MemberCredential {
  const achievement: Achievement = {
    achievementId: `ach-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
    name,
    category,
    earnedAt: new Date(),
    description
  };
  
  return {
    ...credential,
    achievements: [...credential.achievements, achievement]
  };
}

export function upgradeAccessTier(
  credential: MemberCredential,
  newTier: AccessTier
): MemberCredential {
  const tierOrder: AccessTier[] = ['guest', 'member', 'certified', 'house_owner', 'elder', 'founder'];
  const currentIndex = tierOrder.indexOf(credential.accessTier);
  const newIndex = tierOrder.indexOf(newTier);
  
  if (newIndex <= currentIndex) {
    return credential;
  }
  
  const updated = {
    ...credential,
    accessTier: newTier,
    verificationHash: ''
  };
  updated.verificationHash = generateVerificationHash(updated);
  updated.qrCode = generateQRCode(updated);
  
  return updated;
}

export function verifyCredential(
  qrCodeOrBarcode: string,
  storedCredentials: MemberCredential[]
): CredentialVerification {
  const verifiedAt = new Date();
  
  if (qrCodeOrBarcode.startsWith('LAWS-QR:')) {
    try {
      const data = JSON.parse(Buffer.from(qrCodeOrBarcode.slice(8), 'base64').toString());
      const credential = storedCredentials.find(c => c.memberId === data.id);
      
      if (!credential) {
        return { isValid: false, verifiedAt, verificationMethod: 'qr', message: 'Credential not found' };
      }
      
      if (credential.verificationHash !== data.hash) {
        return { isValid: false, verifiedAt, verificationMethod: 'qr', message: 'Hash mismatch - credential may be tampered' };
      }
      
      if (credential.expiresAt && credential.expiresAt < verifiedAt) {
        return { isValid: false, credential, verifiedAt, verificationMethod: 'qr', message: 'Credential expired' };
      }
      
      return { isValid: true, credential, verifiedAt, verificationMethod: 'qr', message: 'Credential verified successfully' };
    } catch {
      return { isValid: false, verifiedAt, verificationMethod: 'qr', message: 'Invalid QR code format' };
    }
  }
  
  const credential = storedCredentials.find(c => c.barcode === qrCodeOrBarcode);
  if (!credential) {
    return { isValid: false, verifiedAt, verificationMethod: 'barcode', message: 'Credential not found' };
  }
  
  if (credential.expiresAt && credential.expiresAt < verifiedAt) {
    return { isValid: false, credential, verifiedAt, verificationMethod: 'barcode', message: 'Credential expired' };
  }
  
  return { isValid: true, credential, verifiedAt, verificationMethod: 'barcode', message: 'Credential verified successfully' };
}

export function getPermissions(tier: AccessTier): string[] {
  return ACCESS_TIER_PERMISSIONS[tier] || [];
}

export function hasPermission(credential: MemberCredential, permission: string): boolean {
  const permissions = getPermissions(credential.accessTier);
  return permissions.includes('all_permissions') || permissions.includes(permission);
}

export function getEntryPathRequirements(path: EntryPath): string[] {
  return ENTRY_PATH_REQUIREMENTS[path] || [];
}

export function generateCredentialCard(credential: MemberCredential): string {
  const tierColors: Record<AccessTier, string> = {
    guest: 'Gray',
    member: 'Bronze',
    certified: 'Silver',
    house_owner: 'Gold',
    elder: 'Platinum',
    founder: 'Diamond'
  };
  
  return `
╔══════════════════════════════════════════════════════════════╗
║                    L.A.W.S. COLLECTIVE                       ║
║                    MEMBER CREDENTIAL                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Member ID: ${credential.memberId.padEnd(44)}║
║                                                              ║
║  Name: ${credential.displayName.padEnd(49)}║
║  Tier: ${credential.accessTier.toUpperCase().padEnd(49)}║
║  Color: ${tierColors[credential.accessTier].padEnd(48)}║
║                                                              ║
║  House: ${(credential.houseName || 'Not Assigned').padEnd(48)}║
║  Entry Path: ${credential.entryPath.toUpperCase().padEnd(43)}║
║                                                              ║
║  Issued: ${credential.issuedAt.toLocaleDateString().padEnd(47)}║
║  Achievements: ${credential.achievements.length.toString().padEnd(41)}║
║                                                              ║
║  Barcode: ${credential.barcode.padEnd(46)}║
║                                                              ║
║  Verification: ${credential.verificationHash.padEnd(41)}║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;
}

export const memberCredentials = {
  generateMemberId,
  generateQRCode,
  generateBarcode,
  generateVerificationHash,
  issueMemberCredential,
  addAchievement,
  upgradeAccessTier,
  verifyCredential,
  getPermissions,
  hasPermission,
  getEntryPathRequirements,
  generateCredentialCard,
  ACCESS_TIER_PERMISSIONS,
  ENTRY_PATH_REQUIREMENTS
};
