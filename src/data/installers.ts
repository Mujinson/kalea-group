// ============================================================================
// POSATORI CERTIFICATI — elenco delle squadre
// ----------------------------------------------------------------------------
// PER INSERIRE LE FOTO REALI DEI TUOI POSATORI:
//   1. copia l'immagine in src/assets/ (es. posatore-mattia.jpg)
//   2. aggiungi l'import qui sotto
//   3. cambia il campo "photo" della scheda che vuoi aggiornare
// Le foto attuali sono immagini segnaposto già presenti nel sito:
// servono solo a mostrare l'impaginazione della pagina.
// ============================================================================

import photoBuild from "@/assets/card-builders.webp";
import photoSite from "@/assets/discover/clients-imprese.jpg";
import photoStudio from "@/assets/discover/clients-architetti.jpg";
import photoDetail from "@/assets/realizzazione-cucina-floor-focus.jpg";
import photoPrivate from "@/assets/discover/clients-privati.jpg";
import photoContinuity from "@/assets/value-continuous-system.jpg";

export type InstallerSpecialty = "decking" | "cladding" | "parquet";

export interface Installer {
  id: string;
  /** Nome che compare nella scheda: sostituiscilo con il nome reale. */
  name: string;
  /** Foto del posatore. */
  photo: string;
  /** Settore di specializzazione (etichetta tradotta in pagina). */
  specialty: InstallerSpecialty;
  /** Anni di esperienza in posa. */
  years: number;
  /** Zona / squadra, mostrato in piccolo sotto la specialità. */
  base: string;
}

export const installers: Installer[] = [
  {
    id: "01",
    name: "Squadra Alzano",
    photo: photoBuild,
    specialty: "parquet",
    years: 12,
    base: "Lombardia",
  },
  {
    id: "02",
    name: "Squadra Esterna",
    photo: photoSite,
    specialty: "decking",
    years: 9,
    base: "Nord Italia",
  },
  {
    id: "03",
    name: "Squadra Facce",
    photo: photoStudio,
    specialty: "cladding",
    years: 8,
    base: "Centro Italia",
  },
  {
    id: "04",
    name: "Squadra Dettaglio",
    photo: photoDetail,
    specialty: "parquet",
    years: 11,
    base: "Lombardia",
  },
  {
    id: "05",
    name: "Squadra Superfici",
    photo: photoPrivate,
    specialty: "decking",
    years: 7,
    base: "Nord Italia",
  },
  {
    id: "06",
    name: "Squadra Continuità",
    photo: photoContinuity,
    specialty: "cladding",
    years: 10,
    base: "Tutta Italia",
  },
];
