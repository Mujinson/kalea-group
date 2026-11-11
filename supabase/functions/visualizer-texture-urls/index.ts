import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", ...corsHeaders },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const requested = Array.isArray(body?.paths) ? body.paths : [];
    if (requested.length > 100) return json({ error: "Too many paths" }, 400);

    const paths = [...new Set(requested.filter((p: unknown): p is string =>
      typeof p === "string" &&
      p.length <= 300 &&
      !p.includes("..") &&
      /^[a-z0-9-]+\/[a-z0-9._-]+$/i.test(p)
    ))];
    if (!paths.length) return json({ urls: [] });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Only textures currently published in the public visualizer can be signed.
    const { data: published, error: publishedError } = await admin
      .from("floor_visualizer_textures")
      .select("texture_url")
      .eq("enabled", true)
      .in("texture_url", paths);
    if (publishedError) return json({ error: "Unable to load textures" }, 500);

    const allowed = (published ?? []).map((row) => row.texture_url).filter(Boolean) as string[];
    if (!allowed.length) return json({ urls: [] });

    const { data, error } = await admin.storage
      .from("visualizer-textures")
      .createSignedUrls(allowed, 86400);
    if (error) return json({ error: "Unable to sign textures" }, 500);

    return json({ urls: (data ?? []).map((item) => ({ path: item.path, signedUrl: item.signedUrl })) });
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
});
