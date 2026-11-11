import logoUrl from "@/assets/logo.png";

export async function exportRender(glCanvas: HTMLCanvasElement, productName: string): Promise<Blob> {
  const w = glCanvas.width, h = glCanvas.height, bar = Math.round(Math.max(48, h * 0.07));
  const c = document.createElement("canvas");
  c.width = w; c.height = h + bar;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(glCanvas, 0, 0);
  ctx.fillStyle = "#F7F1E7"; ctx.fillRect(0, h, w, bar);
  const logo = new Image();
  await new Promise<void>((r) => { logo.onload = () => r(); logo.onerror = () => r(); logo.src = logoUrl; });
  if (logo.naturalWidth) {
    const lh = bar * 0.55, lw = (logo.naturalWidth / logo.naturalHeight) * lh;
    ctx.drawImage(logo, w - lw - bar * 0.3, h + (bar - lh) / 2, lw, lh);
  }
  ctx.fillStyle = "#333333";
  ctx.font = `600 ${Math.round(bar * 0.32)}px system-ui, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText(`${productName} · Kalēa – Surface System®`, bar * 0.3, h + bar / 2);
  return await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/png"));
}
