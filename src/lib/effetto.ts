/**
 * Riduce una lista di finiture in un'unica parola "effetto":
 * Legno, Pietra, Marmo, Cemento, Metallo, Resina, Tinta unita.
 * Fallback: defaultLabel (es. "Legno") o prima finitura capitalizzata.
 */
export function effettoFromFiniture(
  finiture: string[] = [],
  collectionName: string = "",
  defaultLabel: string = "Legno"
): string {
  const haystack = [collectionName, ...finiture].join(" ").toLowerCase();

  const map: Array<[RegExp, string]> = [
    [/marmo|marble|calacatta|carrara|orobico|bardiglio/, "Marmo"],
    [/cement|spatolat|grezzo/, "Cemento"],
    [/metall|acciai|brunit|corten/, "Metallo"],
    [/resin/, "Resina"],
    [/pietra|stone|granigli|terranova|portoghese|distria|carnica/, "Pietra"],
    [/legno|wood|rover|querci|noce|teak|faggio|oak|spina/, "Legno"],
    [/tinta|pittura|paint/, "Tinta unita"],
    [/geometric|pattern|3d|modular/, "Geometrico"],
  ];

  for (const [re, label] of map) {
    if (re.test(haystack)) return label;
  }
  return defaultLabel;
}

/**
 * Estrae lo spessore (es. "5,5 mm", "10 mm") dalla lista formats.
 * Cerca voci che iniziano con "Spessore". Fallback su defaultLabel.
 */
export function spessoreFromFormats(
  formats: string[] = [],
  defaultLabel: string = "—"
): string {
  const sp = formats.find((f) => /spessore/i.test(f));
  if (sp) {
    // "Spessore 5,5 mm" -> "5,5 mm"; "Spessore tecnico" -> "Tecnico"
    const cleaned = sp.replace(/^\s*spessore\s*/i, "").trim();
    return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : sp;
  }
  // Cerca pattern "X mm" dentro le voci
  for (const f of formats) {
    const m = f.match(/(\d+([.,]\d+)?\s*mm)/i);
    if (m) return m[1];
  }
  return defaultLabel;
}

/**
 * Restituisce i formati "doga/tile/spina", escludendo le voci che descrivono
 * solo lo spessore. Se nessun formato di doga è disponibile, ritorna l'intera lista.
 */
export function formatiFromFormats(formats: string[] = []): string {
  const doghe = formats.filter((f) => !/^\s*spessore\b/i.test(f));
  return (doghe.length ? doghe : formats).join(" · ");
}
