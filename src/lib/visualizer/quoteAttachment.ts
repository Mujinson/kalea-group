/** Hand-off of the visualizer render to the online quote form (same tab, sessionStorage). */
export interface VisualizerAttachment {
  image: string; // data:image/jpeg;base64,...
  info: { product: string; category: string; slug: string; formatCm: [number, number]; layout: string; rotation: number; scaleCm: number };
}
const KEY = "kalea_visualizer_attachment";
export const saveVisualizerAttachment = (a: VisualizerAttachment) => { try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch { /* quota */ } };
export const loadVisualizerAttachment = (): VisualizerAttachment | null => {
  try { const v = sessionStorage.getItem(KEY); return v ? JSON.parse(v) : null; } catch { return null; }
};
export const clearVisualizerAttachment = () => { try { sessionStorage.removeItem(KEY); } catch { /* */ } };
