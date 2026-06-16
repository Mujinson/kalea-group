import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date();
  const yyyy = today.toISOString().slice(0, 10);
  const startOfDay = `${yyyy}T00:00:00Z`;
  const endOfDay = `${yyyy}T23:59:59Z`;

  // All users that could receive digest = anyone with a role (admin/commerciale/ibrido/operaio)
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("user_id, role");

  const usersMap = new Map<string, Set<string>>();
  (userRoles || []).forEach((r: any) => {
    if (!usersMap.has(r.user_id)) usersMap.set(r.user_id, new Set());
    usersMap.get(r.user_id)!.add(r.role);
  });

  const notifications: any[] = [];

  for (const [userId, roles] of usersMap.entries()) {
    const parts: string[] = [];

    // Appointments today
    const { count: aptCount } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("start_at", startOfDay)
      .lte("start_at", endOfDay);
    if (aptCount && aptCount > 0) parts.push(`${aptCount} appuntament${aptCount === 1 ? "o" : "i"}`);

    // Lead nuovi non contattati assegnati
    if (roles.has("commerciale") || roles.has("ibrido") || roles.has("admin")) {
      const { count: leadCount } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("assigned_user_id", userId)
        .in("status", ["nuovo", "new"]);
      if (leadCount && leadCount > 0) parts.push(`${leadCount} lead da contattare`);
    }

    // Cantieri attivi assegnati
    if (roles.has("operaio") || roles.has("ibrido")) {
      const { data: sw } = await supabase
        .from("site_workers")
        .select("site_id, construction_sites!inner(status)")
        .eq("user_id", userId);
      const activeSites = (sw || []).filter((r: any) =>
        ["attivo", "in_corso", "active"].includes(r.construction_sites?.status)
      );
      if (activeSites.length > 0) parts.push(`${activeSites.length} cantier${activeSites.length === 1 ? "e" : "i"} attivi`);
    }

    if (parts.length === 0) continue;

    notifications.push({
      user_id: userId,
      type: "daily_digest",
      title: "Buongiorno ☀️ Ecco la tua giornata",
      body: parts.join(" · "),
      link: "/app",
    });
  }

  if (notifications.length > 0) {
    const { error } = await supabase.from("notifications").insert(notifications);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response(
    JSON.stringify({ sent: notifications.length, total_users: usersMap.size }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
