// GA4 analytics helper.
// Reads Measurement ID from VITE_GA4_MEASUREMENT_ID (.env). If empty, all
// calls are no-ops so the site works fine without GA configured.
// Consent Mode v2 defaults are set in index.html; updates come from
// src/lib/consent.ts. gtag.js respects them automatically.

const MEASUREMENT_ID = (import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined)?.trim() || "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function initAnalytics(): void {
  if (initialized || typeof window === "undefined" || !MEASUREMENT_ID) return;
  initialized = true;

  // Ensure dataLayer + gtag shim exist (index.html already creates them).
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }

  // gtag.js is loaded from index.html; only inject if missing (fallback).
  const already = document.querySelector(
    `script[src*="googletagmanager.com/gtag/js"]`
  );
  if (!already) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(s);
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, { send_page_view: false });
  }
}

export function trackPageView(path: string, title?: string): void {
  if (!MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: title ?? document.title,
    send_to: MEASUREMENT_ID,
  });
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

/**
 * GA4 recommended Key Event for lead-gen forms.
 * https://support.google.com/analytics/answer/9267735
 */
export function trackGenerateLead(params: {
  source: string;        // e.g. "contact_form", "partner_form", "lead_capture_dialog"
  method?: string;       // e.g. "email"
  value?: number;        // optional monetary value
  currency?: string;     // required if value is set
  [extra: string]: unknown;
}): void {
  trackEvent("generate_lead", {
    currency: params.currency ?? "EUR",
    value: params.value ?? 0,
    ...params,
  });
}
