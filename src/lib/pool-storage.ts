const storageKey = (inviteCode: string) =>
  `pool-member:${inviteCode.toUpperCase()}`;

export function getPoolMemberId(inviteCode: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(storageKey(inviteCode));
}

export function savePoolMemberId(inviteCode: string, poolMemberId: string): void {
  localStorage.setItem(storageKey(inviteCode), poolMemberId);
}

export function clearPoolMemberId(inviteCode: string): void {
  localStorage.removeItem(storageKey(inviteCode));
}
