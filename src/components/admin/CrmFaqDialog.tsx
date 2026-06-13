import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, BookOpen } from 'lucide-react';

export type FaqRole = 'admin' | 'commerciale';

interface FaqItem {
  q: string;
  a: string;
  roles: FaqRole[];
}

interface Section {
  title: string;
  items: FaqItem[];
}

const SECTIONS: Section[] = [
  {
    title: 'Primi passi',
    items: [
      { roles: ['admin', 'commerciale'], q: 'Come accedo al CRM?', a: "Vai su /admin/login e accedi con la tua email aziendale. Se sei un commerciale vedrai solo i tuoi Lead, Clienti e Cantieri in base al territorio assegnato. Se sei admin vedrai tutto." },
      { roles: ['admin', 'commerciale'], q: 'Cosa significano le icone in alto a destra?', a: "App = torna alla Dashboard. Campanella = notifiche (nuovi lead, appuntamenti, attività). Punto di domanda = questo FAQ. Ingranaggio = Impostazioni. Freccia = Esci. Avatar = il tuo profilo." },
      { roles: ['admin', 'commerciale'], q: 'Come cerco velocemente qualcosa?', a: "Premi ⌘K (Mac) o Ctrl+K (Windows), oppure clicca la barra 'Cerca…' in alto. Puoi cercare Lead, Clienti, Cantieri, Preventivi e saltare tra le pagine." },
    ],
  },
  {
    title: 'Lead',
    items: [
      { roles: ['admin', 'commerciale'], q: 'Da dove arrivano i Lead?', a: "Dal chatbot del sito, dal form contatti, dal form 'Diventa Partner', dalle landing e dagli import manuali. Puoi anche crearli a mano da /admin/leads con 'Nuovo Lead'." },
      { roles: ['admin', 'commerciale'], q: 'Come gestisco la pipeline di un Lead?', a: "Apri il Lead e cambia lo stato (Nuovo → Contattato → Qualificato → Vinto/Perso). Lo stato aggiorna automaticamente le KPI in Dashboard e nelle statistiche di vendita." },
      { roles: ['admin'], q: 'Come assegno un Lead a un commerciale?', a: "Apri il Lead → sezione 'Assegnato a' → scegli il commerciale. Il commerciale lo vedrà nelle sue liste e nella sua Dashboard." },
      { roles: ['admin', 'commerciale'], q: 'Quando un Lead diventa Cliente?', a: "Quando lo stato passa a 'Vinto' viene creato (o collegato) il Cliente. Il profilo Cliente è permanente: anche se chiudi un'opportunità il Cliente resta nello storico." },
    ],
  },
  {
    title: 'Clienti',
    items: [
      { roles: ['admin', 'commerciale'], q: 'Posso eliminare un cliente?', a: "No: i profili Cliente sono permanenti per mantenere lo storico fiscale e commerciale. Puoi archiviarlo o cambiare lo stato (Attivo, Inattivo, Opportunità)." },
      { roles: ['admin', 'commerciale'], q: 'Cosa vedo nella scheda Cliente?', a: "Anagrafica, contatti, indirizzi, cantieri associati, preventivi, fatture, attività, mappa e timeline. Tutto è collegato: aprendo un preventivo torni al cliente in 1 click." },
    ],
  },
  {
    title: 'Preventivi',
    items: [
      { roles: ['admin', 'commerciale'], q: 'Come creo un preventivo?', a: "Vai su /admin/preventivi → 'Nuovo Preventivo'. Devi associarlo a un Lead o a un Cliente. Aggiungi righe SOLO dal Catalogo Prodotti (Articoli, Accessori, Servizi) — non sono ammesse righe libere." },
      { roles: ['admin', 'commerciale'], q: 'Come esporto il PDF?', a: "Apri il preventivo → 'Esporta PDF'. Il PDF è brandizzato Kalēa®. Puoi attivare 'Nascondi prezzi' per condividere solo la distinta tecnica." },
      { roles: ['admin'], q: 'Perché il sistema mi blocca un prezzo?', a: "L'anti-perdita confronta il prezzo di vendita con il costo del listino fornitore attivo. Se il margine va sotto soglia il preventivo viene segnalato. Puoi sbloccarlo solo da admin." },
    ],
  },
  {
    title: 'Cantieri',
    items: [
      { roles: ['admin', 'commerciale'], q: 'Come apro un cantiere?', a: "Da /admin/cantieri → 'Nuovo Cantiere'. Collegalo a un Cliente e (opzionale) a un Preventivo accettato. Puoi gestire posa, materiali, foto, log ore e checklist." },
      { roles: ['admin', 'commerciale'], q: 'Gli operai cosa vedono?', a: "Gli operai NON entrano nel CRM: vengono reindirizzati a /cantieri-app dove vedono solo i cantieri assegnati, le foto e i log ore. Niente prezzi, niente clienti." },
      { roles: ['admin'], q: 'Dove finiscono le foto cantiere?', a: "Nel bucket 'site-media'. Le vedi nella scheda Cantiere → tab Media, e nella pagina /admin/media filtrate per cantiere." },
    ],
  },
  {
    title: 'Appuntamenti & Calendario',
    items: [
      { roles: ['admin', 'commerciale'], q: 'Chi vede i miei appuntamenti?', a: "I commerciali vedono i propri + quelli del proprio team. Gli admin vedono tutto. Gli appuntamenti collegati a un Cliente o Cantiere compaiono anche nella scheda corrispondente." },
      { roles: ['admin', 'commerciale'], q: 'Come pianifico una visita?', a: "Da /admin/appuntamenti → 'Nuovo Appuntamento'. Collega Lead/Cliente/Cantiere così tutto resta tracciato nella timeline." },
    ],
  },
  {
    title: 'Statistiche & Dashboard',
    items: [
      { roles: ['admin', 'commerciale'], q: 'Cosa vedo in Dashboard?', a: "KPI YTD e All Time: Fatturato, Margine, Lead, Conversioni, Opportunità, Cantieri attivi. Tutti i numeri sono calcolati in tempo reale dalle tabelle (lead, clienti, preventivi, vendite, costi)." },
      { roles: ['admin'], q: 'Come funziona il Margine?', a: "Margine = Ricavi – Costi (listino + costi fissi del periodo). Lo vedi in Dashboard, in Statistiche e su ogni Preventivo." },
      { roles: ['admin'], q: 'Cos\u2019è il KPI Opportunità?', a: "Somma dei Lead in stato Qualificato + Clienti in stato Opportunità. È il portafoglio commerciale potenziale." },
    ],
  },
  {
    title: 'Permessi & Ruoli',
    items: [
      { roles: ['admin'], q: 'Quali ruoli esistono?', a: "Admin (vede e modifica tutto), Commerciale (solo i propri Lead/Clienti/Cantieri + team), Operaio (solo /cantieri-app)." },
      { roles: ['admin'], q: 'Dove gestisco utenti e territori?', a: "Impostazioni → Utenti & Territori. Assegni ruolo, regione/provincia e team. Le viste si filtrano automaticamente." },
    ],
  },
  {
    title: 'Risoluzione problemi',
    items: [
      { roles: ['admin', 'commerciale'], q: 'Non vedo un Lead/Cliente che dovrei vedere', a: "Verifica: 1) sei loggato con l'account giusto, 2) il record è assegnato a te o al tuo territorio, 3) non ha filtri attivi nella lista. Se sei admin e non lo vedi avvisaci." },
      { roles: ['admin', 'commerciale'], q: 'Il PDF preventivo non si genera', a: "Ricarica la pagina, riprova. Se persiste apri Impostazioni → Diagnostica e segnala. Spesso è un campo obbligatorio mancante (cliente, validità, righe)." },
      { roles: ['admin', 'commerciale'], q: 'Una pagina è lenta', a: "Usa i filtri per ridurre i risultati (per stato, periodo, commerciale). Le liste sono ottimizzate ma carichi >5000 record vanno filtrati." },
    ],
  },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role?: FaqRole;
}

export default function CrmFaqDialog({ open, onOpenChange, role = 'admin' }: Props) {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<FaqRole>(role);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter(
        (it) =>
          it.roles.includes(tab) &&
          (!needle || it.q.toLowerCase().includes(needle) || it.a.toLowerCase().includes(needle))
      ),
    })).filter((s) => s.items.length > 0);
  }, [q, tab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5" /> Guida CRM Kalēa®
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Domande frequenti su come usare il CRM, sia per admin che per commerciali.
          </p>
        </DialogHeader>

        <div className="px-6 py-3 border-b flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="inline-flex rounded-md border p-0.5 bg-muted/40">
            {(['admin', 'commerciale'] as FaqRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setTab(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-[5px] transition-colors ${
                  tab === r ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 'admin' ? 'Admin / Ufficio' : 'Commerciale'}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca una domanda…"
              className="pl-8 h-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {filtered.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">
              Nessuna domanda trovata. Prova con altre parole chiave.
            </div>
          )}
          {filtered.map((section) => (
            <div key={section.title} className="mb-5">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground mb-2">
                {section.title}
              </div>
              <Accordion type="single" collapsible className="border rounded-lg divide-y">
                {section.items.map((it, idx) => (
                  <AccordionItem key={idx} value={`${section.title}-${idx}`} className="border-0 px-3">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline py-3 text-left">
                      {it.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-3">
                      {it.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
