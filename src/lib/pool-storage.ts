const PREFIX = "pool-member:";

function normalizeCode(inviteCode: string): string {
  return inviteCode.toUpperCase();
}

export function getGuestMemberId(inviteCode: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(`${PREFIX}${normalizeCode(inviteCode)}`);
}

export function setGuestMemberId(inviteCode: string, memberId: string): void {
  localStorage.setItem(`${PREFIX}${normalizeCode(inviteCode)}`, memberId);
}

export function clearGuestMemberId(inviteCode: string): void {
  localStorage.removeItem(`${PREFIX}${normalizeCode(inviteCode)}`);
}
