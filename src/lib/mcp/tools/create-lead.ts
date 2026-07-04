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
  name: "create_lead",
  title: "Create lead",
  description: "Create a new lead in the Kalēa CRM. Requires at least name and email.",
  inputSchema: {
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    company_name: z.string().optional(),
    interest: z.string().optional().describe("Product / service of interest."),
    notes: z.string().optional(),
    source: z.string().optional().describe("Lead source, e.g. 'mcp', 'website'. Defaults to 'mcp'."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx).from("leads").insert({
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone ?? null,
      city: input.city ?? null,
      province: input.province ?? null,
      company_name: input.company_name ?? null,
      interest: input.interest ?? null,
      notes: input.notes ?? null,
      source: input.source ?? "mcp",
      status: "nuovo",
      pipeline_stage: "warm",
    }).select().single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Lead created: ${data.id}` }],
      structuredContent: { lead: data },
    };
  },
});
