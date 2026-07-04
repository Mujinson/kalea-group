import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_construction_sites",
  title: "List construction sites",
  description: "List Kalēa construction sites (cantieri). Optional filters: status, priority, search (matches title/project_name/city), limit (default 25, max 100).",
  inputSchema: {
    status: z.string().optional(),
    priority: z.string().optional(),
    search: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, priority, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = sb(ctx).from("construction_sites")
      .select("id, title, project_name, status, priority, city, province, planned_start_date, planned_end_date, customer_id, salesperson_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (status) q = q.eq("status", status);
    if (priority) q = q.eq("priority", priority);
    if (search) q = q.or(`title.ilike.%${search}%,project_name.ilike.%${search}%,city.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `${data?.length ?? 0} sites\n\n${JSON.stringify(data, null, 2)}` }],
      structuredContent: { sites: data ?? [] },
    };
  },
});
