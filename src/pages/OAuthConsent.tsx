import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";

// Local typed wrapper for the beta `supabase.auth.oauth` namespace.
type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthNs }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/admin/login?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) return setError(error.message);
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        setError(e?.message ?? "Unable to load authorization request");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauth.approveAuthorization(authorizationId)
        : await oauth.denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        return setError(error.message);
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        return setError("No redirect returned by the authorization server.");
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "Failed to complete authorization");
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F0EA] px-6">
        <div className="max-w-md bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[#1E1B4B] mb-2">Authorization error</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F0EA]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1E1B4B]" />
      </main>
    );
  }

  const clientName = details.client?.name ?? "an application";
  const scopes: string[] = details.scopes ?? details.scope?.split(" ") ?? [];

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F0EA] px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#1E1B4B] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#1E1B4B]">Connect {clientName}</h1>
            <p className="text-xs text-muted-foreground">Kalēa CRM authorization</p>
          </div>
        </div>

        <p className="text-sm text-foreground/80 mb-4">
          <strong>{clientName}</strong> is requesting access to your Kalēa CRM account. It will be able
          to use the tools this app exposes over MCP as you, with your permissions.
        </p>

        {scopes.length > 0 && (
          <ul className="text-xs text-muted-foreground list-disc pl-5 mb-6 space-y-1">
            {scopes.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Deny
          </Button>
          <Button
            className="flex-1 bg-[#1E1B4B] hover:bg-[#1E1B4B]/90"
            disabled={busy}
            onClick={() => decide(true)}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
          </Button>
        </div>
      </div>
    </main>
  );
}
