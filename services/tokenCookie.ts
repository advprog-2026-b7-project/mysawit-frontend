// Token is now stored as an HttpOnly cookie set by the backend.
// These stubs exist so existing imports compile without changes.

export function setTokenCookie(_token: string): void {}

export function getTokenCookie(): string | null {
  return null;
}

export function deleteTokenCookie(): void {}
