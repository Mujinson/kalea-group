import { defineTool } from "@lovable.dev/mcp-js";
import { sb } from "../sb";
import { z } from "zod";

export default defineTool({
  name: "list_customers",
  title: "List customers",
  description: "List Kalēa customers. Optional filters: status, search (matches company_name / first_name / last_name / email), limit (default 25, max 100).",
  inputSchema: {
    status: z.string().optional(),
    search: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = sb(ctx).from("customers")
      .select("id, company_name, first_name, last_name, email, phone, city, province, status, total_value, total_margin, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (status) q = q.eq("status", status);
    if (search) q = q.or(`company_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `${data?.length ?? 0} customers\n\n${JSON.stringify(data, null, 2)}` }],
      structuredContent: { customers: data ?? [] },
    };
  },
});
