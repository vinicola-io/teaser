export function formURL(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const u = new URL(value.trim());
    if (u.protocol !== "https:" || u.username || u.password || u.port)
      return null;
    const short =
      u.hostname === "forms.gle" && /^\/[A-Za-z0-9_-]+\/?$/.test(u.pathname);
    const response =
      u.hostname === "docs.google.com" &&
      /^\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[A-Za-z0-9_-]+\/viewform\/?$/.test(
        u.pathname,
      );
    return short || response ? u.href : null;
  } catch {
    return null;
  }
}
export function normalizeSettings(value = {}) {
  const settings = value && typeof value === "object" ? value : {};
  const contact = typeof settings.contactEmail === "string" ? settings.contactEmail.trim() : "";
  return {
    researchUrl: formURL(settings.researchUrl),
    newsletterUrl: formURL(settings.newsletterUrl),
    contactEmail: typeof settings.contactEmail === "string" && settings.contactEmail.length <= 254 && /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,63}$/.test(contact) ? contact : "",
  };
}

// Exact normalized public settings, not an authentication or cryptographic signature.
export function configSignature(settings) {
  return JSON.stringify(normalizeSettings(settings));
}
