// Ambient declaration for Node-style process.env used in MCP tool handlers.
// The tools ship into a Deno Edge Function at build time, but the TS source
// is checked under the Vite/React project, which doesn't have @types/node.
declare const process: { env: Record<string, string | undefined> };
