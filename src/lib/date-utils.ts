export function parseSafeDate(dateString: string | undefined | null, endOfDay: boolean = false): Date | null {
  if (!dateString) return null;
  
  try {
    let dStr = dateString.trim();
    if (dStr.includes('/')) {
      const parts = dStr.split('/');
      if (parts.length === 3) {
        dStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    
    // Add time component safely
    if (dStr.length === 10) {
      dStr = endOfDay ? `${dStr}T23:59:59` : `${dStr}T00:00:00`;
    }
    
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch (e) {
    return null;
  }
}

export function isOfferActive(validFrom?: string, validUntil?: string): boolean {
  const now = new Date();
  
  if (validFrom) {
    const start = parseSafeDate(validFrom, false);
    if (start && start > now) return false;
  }
  
  if (validUntil) {
    const end = parseSafeDate(validUntil, true);
    if (end && end < now) return false;
  }
  
  return true;
}
