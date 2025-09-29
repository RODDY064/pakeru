import { sha256 } from 'js-sha256';
import { Base64 } from 'js-base64';

export function signData(data: string, secret: string): string {
  const hmac = sha256.hmac.create(secret);
  hmac.update(data);
  return hmac.hex();
}

// Function to create signed cookie
export function encodeAuthSyncCookie(payload: any): string {
  const secret = process.env.NEXT_PUBLIC_SYNC_AUTH_SECRET;
  if (!secret) throw new Error("Auth secret not found");
  
  const json = JSON.stringify(payload);
  const encodedData = Base64.encodeURI(json);
  const signature = signData(encodedData, secret);
  
  return `${encodedData}.${signature}`;
}

// Function to decode signed cookie
export function decodeAuthSyncCookie(signedCookie: string): any | null {
  try {
    const authSecret = process.env.NEXT_PUBLIC_SYNC_AUTH_SECRET;
    if (!authSecret) return null;
    
 
    let rawCookie = signedCookie;
    let parts = rawCookie.split(".");
    

    if (parts.length !== 2) {
      rawCookie = decodeURIComponent(signedCookie);
      parts = rawCookie.split(".");
    }
    
    if (parts.length !== 2) {
      console.error("Invalid signed cookie format");
      return null;
    }
    
    const [encodedData, signature] = parts;
    const expectedSignature = signData(encodedData, authSecret);
    
    if (signature !== expectedSignature) {
      console.warn("Cookie signature mismatch - potentially tampered");
      return null;
    }
    
    const decodedJson = Base64.decode(encodedData);
    return JSON.parse(decodedJson);
  } catch (err) {
    console.error("Error decoding auth-sync cookie:", err);
    return null;
  }
}
