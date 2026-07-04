import { defineTool } from "@lovable.dev/mcp-js";
import { sb } from "../sb";
import { z } from "zod";

export default defineTool({
  name: "list_quotes",
  title: "List quotes",
  description: "List Kalēa quotes (preventivi). Optional filters: status (draft/sent/accepted/converted/rejected/expired), search (matches quote_number / client_name), limit (default 25, max 100).",
  inputSchema: {
    status: z.string().optional(),
    search: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = sb(ctx).from("quotes")
      .select("id, quote_number, client_name, status, total_amount, vat_amount, vat_included, valid_until, created_at, created_by")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (status) q = q.eq("status", status);
    if (search) q = q.or(`quote_number.ilike.%${search}%,client_name.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `${data?.length ?? 0} quotes\n\n${JSON.stringify(data, null, 2)}` }],
      structuredContent: { quotes: data ?? [] },
    };
  },
});
