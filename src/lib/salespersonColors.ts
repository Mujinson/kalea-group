// Unique color palette for salespeople - each gets a distinct, visually appealing color
const SALESPERSON_COLORS = [
  { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' }, // Indigo
  { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }, // Amber
  { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' }, // Emerald
  { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8' }, // Pink
  { bg: '#E0E7FF', text: '#3730A3', border: '#C7D2FE' }, // Blue
  { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' }, // Red
  { bg: '#CCFBF1', text: '#0F766E', border: '#99F6E4' }, // Teal
  { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE' }, // Violet
  { bg: '#FFF7ED', text: '#C2410C', border: '#FDBA74' }, // Orange
  { bg: '#ECFDF5', text: '#047857', border: '#6EE7B7' }, // Green
  { bg: '#FDF2F8', text: '#9D174D', border: '#F9A8D4' }, // Rose
  { bg: '#EFF6FF', text: '#1D4ED8', border: '#93C5FD' }, // Sky blue
  { bg: '#FFFBEB', text: '#92400E', border: '#FCD34D' }, // Yellow
  { bg: '#F0FDF4', text: '#15803D', border: '#86EFAC' }, // Lime
  { bg: '#FAF5FF', text: '#6B21A8', border: '#D8B4FE' }, // Purple
];

/**
 * Get a consistent color for a salesperson based on their ID.
 * The same ID always returns the same color.
 */
export function getSalespersonColor(id: string): { bg: string; text: string; border: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % SALESPERSON_COLORS.length;
  return SALESPERSON_COLORS[index];
}

/**
 * Get inline style for a salesperson badge
 */
export function getSalespersonBadgeStyle(id: string): React.CSSProperties {
  const color = getSalespersonColor(id);
  return {
    backgroundColor: color.bg,
    color: color.text,
    borderColor: color.border,
    borderWidth: '1px',
    borderStyle: 'solid',
  };
}
