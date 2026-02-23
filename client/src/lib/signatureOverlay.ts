/**
 * Signature Overlay Utility
 * Handles signature capture, storage, and PDF overlay generation
 */

export type SignatureType = 'typed' | 'drawn' | 'uploaded';

export interface SignatureData {
  type: SignatureType;
  data: string; // Base64 for drawn/uploaded, plain text for typed
  timestamp: Date;
  signerName: string;
  signerTitle?: string;
  ipAddress?: string;
}

/**
 * Convert canvas drawing to base64
 */
export const canvasToBase64 = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/png');
};

/**
 * Create typed signature as SVG
 */
export const createTypedSignature = (name: string): string => {
  const svg = `
    <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="50" font-family="cursive" font-size="32" fill="black">${name}</text>
      <line x1="10" y1="60" x2="190" y2="60" stroke="black" stroke-width="1"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate signature metadata for audit trail
 */
export const generateSignatureMetadata = (
  signerName: string,
  signerTitle?: string,
  ipAddress?: string
): Record<string, any> => {
  return {
    signerName,
    signerTitle: signerTitle || 'N/A',
    signedAt: new Date().toISOString(),
    ipAddress: ipAddress || 'unknown',
    userAgent: navigator.userAgent,
  };
};

/**
 * Create PDF signature block (text representation)
 */
export const createSignatureBlock = (
  signerName: string,
  signerTitle?: string,
  signedAt?: Date
): string => {
  const date = signedAt ? new Date(signedAt).toLocaleDateString() : new Date().toLocaleDateString();
  return `
_____________________________
${signerName}
${signerTitle ? `${signerTitle}` : ''}
Date: ${date}
  `.trim();
};

/**
 * Store signature in local storage for reuse
 */
export const saveSignatureLocally = (signature: SignatureData): void => {
  const stored = localStorage.getItem('user_signatures') || '[]';
  const signatures = JSON.parse(stored);
  signatures.push({
    ...signature,
    timestamp: signature.timestamp.toISOString(),
  });
  localStorage.setItem('user_signatures', JSON.stringify(signatures));
};

/**
 * Retrieve saved signatures from local storage
 */
export const getSavedSignatures = (): SignatureData[] => {
  const stored = localStorage.getItem('user_signatures') || '[]';
  const signatures = JSON.parse(stored);
  return signatures.map((sig: any) => ({
    ...sig,
    timestamp: new Date(sig.timestamp),
  }));
};

/**
 * Clear saved signatures
 */
export const clearSavedSignatures = (): void => {
  localStorage.removeItem('user_signatures');
};
