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
  name: "list_leads",
  title: "List leads",
  description: "List recent leads from the Kalēa CRM. Optional filters: status, pipeline_stage, search (matches name/email/city), limit (default 25, max 100).",
  inputSchema: {
    status: z.string().optional().describe("Filter by lead status (e.g. 'nuovo', 'qualificato')."),
    pipeline_stage: z.string().optional().describe("Filter by pipeline stage (e.g. 'cold', 'warm', 'hot')."),
    search: z.string().optional().describe("Search term matched against name, email or city."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, pipeline_stage, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = sb(ctx).from("leads")
      .select("id, name, email, phone, city, province, status, pipeline_stage, source, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (status) q = q.eq("status", status);
    if (pipeline_stage) q = q.eq("pipeline_stage", pipeline_stage);
    if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `${data?.length ?? 0} leads\n\n${JSON.stringify(data, null, 2)}` }],
      structuredContent: { leads: data ?? [] },
    };
  },
});
