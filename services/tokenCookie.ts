const TOKEN_STORAGE_KEY = "mysawit_access_token";

export function setTokenCookie(token: string): void {
  if (typeof window === "undefined" || !token) return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getTokenCookie(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function deleteTokenCookie(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}
