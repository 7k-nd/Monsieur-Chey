export function normalizeTicketToken(rawToken: string): string {
  const value = rawToken.trim();
  const ticketPathMatch = value.match(/(?:^|\/)billet\/([^/?#]+)/i);

  if (ticketPathMatch) {
    try {
      return decodeURIComponent(ticketPathMatch[1]).trim();
    } catch {
      return ticketPathMatch[1].trim();
    }
  }

  try {
    const url = new URL(value);
    const queryToken =
      url.searchParams.get('token') ||
      url.searchParams.get('qr') ||
      url.searchParams.get('code');
    return (queryToken || value).trim();
  } catch {
    return value;
  }
}
