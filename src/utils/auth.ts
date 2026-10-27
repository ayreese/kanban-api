import * as jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: string;
}

/** How long a login lasts. Matches the frontend's 1-day auth cookie. */
export const TOKEN_TTL = "1d";

export function getAppSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Add it to your .env file (see .env.example).",
    );
  }
  return secret;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, getAppSecret(), { expiresIn: TOKEN_TTL });
}

/**
 * Reads "Bearer <token>". Returns null for a missing, malformed or expired
 * token, so the request continues as signed-out instead of failing outright.
 */
export function decodeAuthHeader(
  authHeader: string | undefined,
): AuthTokenPayload | null {
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getAppSecret());
    if (typeof payload === "object" && typeof payload.userId === "string") {
      return { userId: payload.userId };
    }
    return null;
  } catch {
    return null;
  }
}
