export type PdfVerticalBlock = {
  top: number;
  bottom: number;
};

export type PdfPageSlice = [number, number];

// html2canvas can draw font glyphs a few pixels outside their DOM line box.
// Keep a real safety zone on both sides of every page boundary.
const CUT_GAP_PX = 2;
const BOUNDARY_GUARD_PX = 2;
const EPSILON_PX = 0.5;

/**
 * Splits the captured document without crossing text lines or protected blocks.
 * Heights are expressed in the preview's CSS pixels; following pages can be
 * shorter to reserve their top margin.
 */
export function paginateQuotePdf({
  totalHeight,
  firstPageHeight,
  followingPageHeight,
  blocks,
}: {
  totalHeight: number;
  firstPageHeight: number;
  followingPageHeight: number;
  blocks: PdfVerticalBlock[];
}): PdfPageSlice[] {
  const sortedBlocks = blocks
    .filter((block) =>
      Number.isFinite(block.top) &&
      Number.isFinite(block.bottom) &&
      block.bottom > block.top
    )
    .sort((a, b) => a.top - b.top || a.bottom - b.bottom);

  const slices: PdfPageSlice[] = [];
  let start = 0;

  while (start < totalHeight - EPSILON_PX) {
    const maxHeight = slices.length === 0 ? firstPageHeight : followingPageHeight;
    const idealCut = Math.min(start + maxHeight, totalHeight);
    let cut = idealCut;

    if (idealCut < totalHeight) {
      // Moving a cut upwards can reveal another block crossing the new cut.
      // Repeat until the boundary is clear. Oversized blocks are handled by
      // their individual text-line rectangles instead of being kept together.
      for (let guard = 0; guard <= sortedBlocks.length; guard += 1) {
        const crossing = sortedBlocks.find((block) =>
          block.top > start + EPSILON_PX &&
          block.top < cut + BOUNDARY_GUARD_PX &&
          block.bottom > cut - BOUNDARY_GUARD_PX &&
          block.bottom - block.top < maxHeight * 0.95
        );
        if (!crossing) break;

        const safeCut = crossing.top - CUT_GAP_PX;
        if (safeCut <= start + EPSILON_PX) break;
        cut = safeCut;
      }
    }

    // A single unbreakable object taller than a page is the only case where a
    // geometric cut is unavoidable. Normal text never takes this fallback,
    // because every rendered text line is included among the blocks.
    if (cut <= start + EPSILON_PX) cut = idealCut;
    slices.push([start, cut]);
    start = cut;
  }

  return slices;
}

/** Returns one vertical rectangle per rendered text line, including long divs. */
export function collectQuotePdfTextLines(
  root: HTMLElement,
  baseRect: DOMRect,
): PdfVerticalBlock[] {
  const document = root.ownerDocument;
  const walker = document.createTreeWalker(root, 4); // NodeFilter.SHOW_TEXT
  const blocks: PdfVerticalBlock[] = [];
  const seen = new Set<string>();
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (!node.textContent?.trim()) continue;
    const parent = node.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) continue;

    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.width <= 0 || rect.height <= 0) continue;
      const top = rect.top - baseRect.top;
      const bottom = rect.bottom - baseRect.top;
      const key = `${Math.round(top * 4)}:${Math.round(bottom * 4)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      blocks.push({ top, bottom });
    }
    range.detach();
  }

  return blocks;
}
