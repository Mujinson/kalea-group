import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GRAPH = "https://graph.facebook.com/v21.0";

async function g(path: string, token: string) {
  const sep = path.includes("?") ? "&" : "?";
  const r = await fetch(`${GRAPH}/${path}${sep}access_token=${encodeURIComponent(token)}`);
  const body = await r.json();
  if (!r.ok) throw new Error(`[${r.status}] ${JSON.stringify(body)}`);
  return body;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const token = Deno.env.get("META_PAGE_ACCESS_TOKEN");
    const pageId = Deno.env.get("META_PAGE_ID");
    if (!token || !pageId) throw new Error("META_PAGE_ACCESS_TOKEN / META_PAGE_ID non configurati");

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: row } = await sb.from("app_settings").select("value").eq("key", "social_latest_posts").maybeSingle();
    const current: Record<string, any> = (row?.value as any) || {};
    const errors: string[] = [];

    // Facebook
    try {
      const fb = await g(`${pageId}/posts?fields=permalink_url,full_picture,message&limit=5`, token);
      const p = (fb.data || []).find((x: any) => x.full_picture) || fb.data?.[0];
      if (p) current.facebook = { postUrl: p.permalink_url, imageUrl: p.full_picture, caption: (p.message || "").slice(0, 100) };
    } catch (e) { errors.push("facebook " + (e as Error).message); }

    // Instagram (business account linked to the page)
    try {
      const page = await g(`${pageId}?fields=instagram_business_account`, token);
      const igId = page.instagram_business_account?.id;
      if (igId) {
        const ig = await g(`${igId}/media?fields=permalink,media_url,thumbnail_url,caption,media_type&limit=1`, token);
        const m = ig.data?.[0];
        if (m) current.instagram = {
          postUrl: m.permalink,
          imageUrl: m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url,
          caption: (m.caption || "").slice(0, 100),
        };
      } else errors.push("instagram: nessun account business collegato alla pagina");
    } catch (e) { errors.push("instagram " + (e as Error).message); }

    await sb.from("app_settings").upsert({ key: "social_latest_posts", value: current }, { onConflict: "key" });
    if (errors.length) console.error(errors);
    return new Response(JSON.stringify({ ok: true, errors, data: current }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
