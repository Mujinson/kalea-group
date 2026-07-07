## Plan: Enable `url_passthrough` for Google Consent Mode

Since Google Ads campaigns are planned, the `url_passthrough` parameter in the Consent Mode configuration must be set to `true`. This allows Google to pass click identifiers (e.g., GCLID) through page URLs when consent is missing, improving attribution for ad traffic.

### Change
- **File**: `index.html`
- **Line**: ~38 (inside the `gtag('consent', 'default', ...)` object)
- **Edit**: Change `url_passthrough: false` → `url_passthrough: true`

No other code changes are required.