/**
 * JWT token utilities
 */

interface JWTPayload {
  userId: string;
  username: string;
  isAdmin?: boolean;
  exp?: number;
  iat?: number;
}

/**
 * Decode a JWT token without verification
 * Note: This is for client-side use only. Server-side verification is still required.
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if the user is an admin based on their JWT token
 */
export function isUserAdmin(): boolean {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return false;
  }

  const payload = decodeJWT(token);
  return payload?.isAdmin === true;
}

/**
 * Check if the token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload?.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}
