const WHATSAPP_SHARE_ENDPOINT = "https://wa.me/?text=";

export type PoolShareInput = {
  inviteCode: string;
  fixtureTitle: string;
  poolTitle?: string | null;
  origin: string;
};

export type PoolWhatsAppShare = {
  text: string;
  poolUrl: string;
  href: string;
};

export function poolAbsoluteUrl(inviteCode: string, origin: string): string {
  return `${origin.replace(/\/$/, "")}/pools/${encodeURIComponent(inviteCode)}`;
}

export function poolShareText(input: PoolShareInput): string {
  const poolUrl = poolAbsoluteUrl(input.inviteCode, input.origin);
  const title = input.poolTitle?.trim() || `${input.fixtureTitle} tips`;
  return `Join my ${title} pool\n${input.fixtureTitle}\n${poolUrl}`;
}

export function poolWhatsAppHref(text: string): string {
  return `${WHATSAPP_SHARE_ENDPOINT}${encodeURIComponent(text)}`;
}

export function buildPoolWhatsAppShare(input: PoolShareInput): PoolWhatsAppShare {
  const text = poolShareText(input);
  return {
    text,
    poolUrl: poolAbsoluteUrl(input.inviteCode, input.origin),
    href: poolWhatsAppHref(text),
  };
}
