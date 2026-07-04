import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listLeads from "./tools/list-leads";
import listQuotes from "./tools/list-quotes";
import listCustomers from "./tools/list-customers";
import listSites from "./tools/list-sites";
import createLead from "./tools/create-lead";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "kalea-crm-mcp",
  title: "Kalēa CRM",
  version: "0.1.0",
  instructions:
    "Access the Kalēa CRM: leads, quotes (preventivi), customers, and construction sites (cantieri). Read-only queries plus lead creation. All requests run as the signed-in user with RLS enforced.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listLeads, listQuotes, listCustomers, listSites, createLead],
});
