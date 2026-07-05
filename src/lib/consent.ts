// Google Consent Mode v2 helper. The default state ("denied") is set in
// index.html BEFORE any Google tag loads. This module pushes `update` signals
// whenever the user changes their choice in the CookieConsent UI.

export interface CookiePreferences {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

type ConsentValue = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function toSignal(v: boolean): ConsentValue {
  return v ? "granted" : "denied";
}

/**
 * Push a Consent Mode v2 `update` to Google based on the user's saved
 * preferences. Safe to call before gtag.js is loaded — signals are queued
 * on window.dataLayer and consumed once the tag boots.
 */
export function updateConsent(prefs: CookiePreferences): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  const gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  window.gtag = gtag;

  const marketing = toSignal(prefs.marketing);
  const analytics = toSignal(prefs.analytics);
  const preferences = toSignal(prefs.preferences);

  gtag("consent", "update", {
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    analytics_storage: analytics,
    functionality_storage: preferences,
    personalization_storage: preferences,
    security_storage: "granted",
  });

  // Keep URLs redacted from Ads pings unless the user opted into marketing.
  gtag("set", "ads_data_redaction", prefs.marketing ? false : true);
}
