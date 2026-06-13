/**
 * Host detection helpers.
 * crm.kalea.space serves ONLY the CRM (no public site routes).
 */
export const CRM_HOSTNAMES = new Set<string>([
  "crm.kalea.space",
]);

export function isCrmHost(): boolean {
  if (typeof window === "undefined") return false;
  return (
    CRM_HOSTNAMES.has(window.location.hostname) ||
    /^\/crm\.kalea\.space(\/|$)/.test(window.location.pathname)
  );
}
