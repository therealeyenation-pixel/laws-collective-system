/**
 * Signature Capture Service
 * Phase 59: E-signature capture, hash generation, timestamp recording
 */

import * as crypto from 'crypto';

export type SignatureType = 'typed' | 'drawn' | 'uploaded';

export interface SignatureData {
  signatureId: string;
  type: SignatureType;
  data: string; // Base64 for drawn/uploaded, plain text for typed
  signerId: string;
  signerName: string;
  signerEmail: string;
  documentId: string;
  documentName: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  hash: string;
  verified: boolean;
}

export interface SignatureRequest {
  requestId: string;
  documentId: string;
  documentName: string;
  requesterId: string;
  requesterName: string;
  signers: SignerInfo[];
  status: 'pending' | 'partial' | 'completed' | 'expired' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  message?: string;
}

export interface SignerInfo {
  signerId: string;
  name: string;
  email: string;
  order: number;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: Date;
  signatureId?: string;
}

export interface HouseActivationGate {
  gateId: string;
  houseName: string;
  requiredSignatures: string[];
  collectedSignatures: string[];
  status: 'pending' | 'activated' | 'failed';
  activatedAt?: Date;
}

export function generateSignatureHash(
  signatureData: string,
  signerId: string,
  documentId: string,
  timestamp: Date
): string {
  const dataToHash = `${signatureData}|${signerId}|${documentId}|${timestamp.toISOString()}`;
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
}

export function createSignature(
  type: SignatureType,
  data: string,
  signerId: string,
  signerName: string,
  signerEmail: string,
  documentId: string,
  documentName: string,
  ipAddress: string,
  userAgent: string
): SignatureData {
  const timestamp = new Date();
  const hash = generateSignatureHash(data, signerId, documentId, timestamp);

  return {
    signatureId: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    data,
    signerId,
    signerName,
    signerEmail,
    documentId,
    documentName,
    timestamp,
    ipAddress,
    userAgent,
    hash,
    verified: true
  };
}

export function verifySignature(signature: SignatureData): boolean {
  const expectedHash = generateSignatureHash(
    signature.data,
    signature.signerId,
    signature.documentId,
    signature.timestamp
  );
  return signature.hash === expectedHash;
}

export function createSignatureRequest(
  documentId: string,
  documentName: string,
  requesterId: string,
  requesterName: string,
  signers: Array<{ id: string; name: string; email: string }>,
  expirationDays: number = 30,
  message?: string
): SignatureRequest {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);

  return {
    requestId: `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    documentId,
    documentName,
    requesterId,
    requesterName,
    signers: signers.map((s, idx) => ({
      signerId: s.id,
      name: s.name,
      email: s.email,
      order: idx + 1,
      status: 'pending' as const
    })),
    status: 'pending',
    createdAt: now,
    expiresAt,
    message
  };
}

export function updateSignatureRequestStatus(request: SignatureRequest): SignatureRequest {
  const signedCount = request.signers.filter(s => s.status === 'signed').length;
  const totalSigners = request.signers.length;

  let status: SignatureRequest['status'] = 'pending';
  if (signedCount === totalSigners) {
    status = 'completed';
  } else if (signedCount > 0) {
    status = 'partial';
  } else if (new Date() > request.expiresAt) {
    status = 'expired';
  }

  return {
    ...request,
    status,
    completedAt: status === 'completed' ? new Date() : undefined
  };
}

export function recordSignerSignature(
  request: SignatureRequest,
  signerId: string,
  signatureId: string
): SignatureRequest {
  const updatedSigners = request.signers.map(s => {
    if (s.signerId === signerId) {
      return {
        ...s,
        status: 'signed' as const,
        signedAt: new Date(),
        signatureId
      };
    }
    return s;
  });

  return updateSignatureRequestStatus({
    ...request,
    signers: updatedSigners
  });
}

export function createHouseActivationGate(
  houseName: string,
  requiredDocuments: string[]
): HouseActivationGate {
  return {
    gateId: `gate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    houseName,
    requiredSignatures: requiredDocuments,
    collectedSignatures: [],
    status: 'pending'
  };
}

export function recordGateSignature(
  gate: HouseActivationGate,
  documentId: string,
  signatureId: string
): HouseActivationGate {
  if (!gate.requiredSignatures.includes(documentId)) {
    return gate;
  }

  const collectedSignatures = [...gate.collectedSignatures];
  if (!collectedSignatures.includes(signatureId)) {
    collectedSignatures.push(signatureId);
  }

  const allCollected = gate.requiredSignatures.every(docId =>
    collectedSignatures.some(sigId => sigId.includes(docId) || collectedSignatures.length >= gate.requiredSignatures.length)
  );

  return {
    ...gate,
    collectedSignatures,
    status: collectedSignatures.length >= gate.requiredSignatures.length ? 'activated' : 'pending',
    activatedAt: collectedSignatures.length >= gate.requiredSignatures.length ? new Date() : undefined
  };
}

export function checkGateStatus(gate: HouseActivationGate): {
  isActivated: boolean;
  progress: number;
  remainingDocuments: string[];
} {
  const progress = (gate.collectedSignatures.length / gate.requiredSignatures.length) * 100;
  const remainingDocuments = gate.requiredSignatures.filter(
    (_, idx) => idx >= gate.collectedSignatures.length
  );

  return {
    isActivated: gate.status === 'activated',
    progress: Math.round(progress),
    remainingDocuments
  };
}

export function validateSignatureData(
  type: SignatureType,
  data: string
): { valid: boolean; error?: string } {
  if (!data || data.trim().length === 0) {
    return { valid: false, error: 'Signature data is empty' };
  }

  if (type === 'typed') {
    if (data.length < 2) {
      return { valid: false, error: 'Typed signature must be at least 2 characters' };
    }
    if (data.length > 100) {
      return { valid: false, error: 'Typed signature must be less than 100 characters' };
    }
    return { valid: true };
  }

  if (type === 'drawn' || type === 'uploaded') {
    // Check if it's valid base64
    try {
      const decoded = Buffer.from(data, 'base64');
      if (decoded.length < 50) {
        return { valid: false, error: 'Image data is too small' };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid image data format' };
    }
  }

  return { valid: false, error: 'Unknown signature type' };
}

export function generateSignatureCertificate(signature: SignatureData): string {
  return `
ELECTRONIC SIGNATURE CERTIFICATE
================================

Certificate ID: ${signature.signatureId}
Document: ${signature.documentName} (${signature.documentId})

SIGNER INFORMATION
------------------
Name: ${signature.signerName}
Email: ${signature.signerEmail}
Signer ID: ${signature.signerId}

SIGNATURE DETAILS
-----------------
Type: ${signature.type.toUpperCase()}
Timestamp: ${signature.timestamp.toISOString()}
IP Address: ${signature.ipAddress}
User Agent: ${signature.userAgent}

VERIFICATION
------------
Hash Algorithm: SHA-256
Signature Hash: ${signature.hash}
Verified: ${signature.verified ? 'YES' : 'NO'}

This certificate confirms that the above-named individual electronically
signed the referenced document at the specified date and time. The signature
hash provides cryptographic proof of the signature's authenticity.

This electronic signature is legally binding under the Electronic Signatures
in Global and National Commerce Act (E-SIGN Act) and the Uniform Electronic
Transactions Act (UETA).
`;
}

export const signatureCapture = {
  generateSignatureHash,
  createSignature,
  verifySignature,
  createSignatureRequest,
  updateSignatureRequestStatus,
  recordSignerSignature,
  createHouseActivationGate,
  recordGateSignature,
  checkGateStatus,
  validateSignatureData,
  generateSignatureCertificate
};
