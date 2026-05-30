/**
 * Riduce una lista di finiture in un'unica parola "effetto":
 * Legno, Pietra, Marmo, Cemento, Metallo, Resina, Tinta unita.
 * Fallback: prima finitura in minuscolo capitalizzata.
 */
export function effettoFromFiniture(
  finiture: string[] = [],
  collectionName: string = ""
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
  const first = finiture[0] ?? "—";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
