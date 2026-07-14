/**
 * CRM Design System — Monday/Linear premium SaaS look.
 *
 * All CRM screens should compose from these primitives + the shadcn
 * components themed via the `.admin-theme` scope in `src/index.css`.
 * Never hardcode colors: use `var(--crm-*)` or the `crm.*` Tailwind
 * tokens defined in `tailwind.config.ts`.
 */
export { StatusPill } from "./StatusPill";
export type { StatusTone } from "./StatusPill";
export { KpiCard } from "./KpiCard";
export type { KpiTone } from "./KpiCard";
export { PageHeader, PageTab } from "./PageHeader";
export { CrmToolbar, ToolbarSearch, ToolbarButton } from "./Toolbar";
export { CrmEmptyState } from "./EmptyState";
