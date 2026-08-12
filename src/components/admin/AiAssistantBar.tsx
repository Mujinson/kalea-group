import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Send, Loader2, X, ArrowUpRight, AlertCircle, RotateCcw, Mic, Square, Volume2, VolumeX, Repeat2 } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useSpeech } from '@/hooks/useSpeech';

type Ref = { etichetta: string; percorso: string };
type Turn = {
  id: string;
  domanda: string;
  risposta: string;
  riferimenti: Ref[];
  errore?: string;
  streaming?: boolean;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const ESEMPI = [
  'Quanto abbiamo incassato questo mese?',
  'Ore di Luca questa settimana',
  'Preventivo Rusconi',
  'Attrezzature mancanti al cantiere Bellagio',
];

const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/ai-assistant`;

export default function AiAssistantBar() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Risposta vocale (spenta di default, scelta ricordata)
  const [voiceReply, setVoiceReply] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem('kalea:ai-voice-reply') === '1',
  );
  const voiceReplyRef = useRef(voiceReply);
  voiceReplyRef.current = voiceReply;
  const speech = useSpeech();
  const [ultimaRisposta, setUltimaRisposta] = useState('');

  // ⌘K / Ctrl+K → focus sulla barra assistente
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = panelRef.current.scrollHeight;
  }, [turns, loading]);

  const ask = useCallback(async (text: string) => {
    const domanda = text.trim();
    if (!domanda || loading) return;
    setInput('');
    setLoading(true);
    const id = uid();

    // cronologia breve della sessione per le domande di seguito ("e il mese prima?")
    const history = turns
      .filter((t) => !t.errore)
      .slice(-4)
      .flatMap((t) => [
        { role: 'user', content: t.domanda },
        { role: 'assistant', content: t.risposta },
      ]);

    setTurns((prev) => [...prev, { id, domanda, risposta: '', riferimenti: [], streaming: true }]);

    const patch = (p: Partial<Turn>) =>
      setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error('Sessione scaduta, rientra nel CRM.');

      const res = await fetch(FUNCTIONS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
        },
        body: JSON.stringify({ message: domanda, history, stream: true }),
      });

      if (!res.ok || !res.body) {
        let msg = `Errore ${res.status}`;
        try {
          const j = await res.json();
          msg = j?.error || msg;
        } catch { /* body non JSON */ }
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      let acc = '';
      let event = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const raw of lines) {
          const line = raw.trimEnd();
          if (line.startsWith('event: ')) { event = line.slice(7).trim(); continue; }
          if (!line.startsWith('data: ')) continue;
          let payload: any;
          try { payload = JSON.parse(line.slice(6)); } catch { continue; }
          if (event === 'delta' && payload?.testo) {
            acc += payload.testo;
            patch({ risposta: acc });
          } else if (event === 'done') {
            acc = payload?.risposta || acc;
            patch({
              risposta: acc,
              riferimenti: Array.isArray(payload?.riferimenti) ? payload.riferimenti : [],
              streaming: false,
            });
          } else if (event === 'error') {
            patch({ errore: payload?.errore || 'Errore durante la risposta.', streaming: false });
          }
        }
      }
      patch({ streaming: false });
      if (acc.trim()) {
        setUltimaRisposta(acc);
        if (voiceReplyRef.current) void speech.speak(acc);
      }
    } catch (e: any) {
      patch({ errore: e?.message || 'Errore nella richiesta all\'assistente.', streaming: false });
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [loading, turns, speech]);

  const voice = useVoiceInput({
    onInterim: (t) => setInput(t),
    onFinal: (t) => { setInput(t); void ask(t); },
  });

  const attiva = turns.length > 0;

  return (
    <div className="px-3 md:px-6 pt-3 md:pt-4">
      <div className="rounded-crm bg-crm-surface border border-crm-border shadow-crm-sm overflow-hidden">
        {/* Barra domanda */}
        <form
          onSubmit={(e) => { e.preventDefault(); ask(input); }}
          className="flex items-center gap-2 h-12 px-3"
        >
          {voice.listening ? (
            <span className="w-4 h-4 shrink-0 inline-flex items-center justify-center" aria-hidden>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            </span>
          ) : (
            <Sparkles className="w-4 h-4 text-crm-primary shrink-0" />
          )}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder={
              voice.listening
                ? 'Ti ascolto… parla pure'
                : voice.transcribing
                  ? 'Sto trascrivendo…'
                  : "Chiedi all'assistente: incassi, preventivi, ore, cantieri…"
            }
            aria-label="Chiedi all'assistente AI"
            className="flex-1 h-full bg-transparent text-[13px] text-crm-ink placeholder:text-crm-ink-subtle outline-none"
          />

          {/* onda animata durante la registrazione */}
          {voice.listening && (
            <span className="hidden sm:flex items-center gap-[3px] h-4 shrink-0" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-red-500/80 transition-[height] duration-100"
                  style={{
                    height: `${4 + Math.min(14, voice.level * 22 * (i % 2 === 0 ? 1 : 0.65) + (i === 2 ? 4 : 0))}px`,
                  }}
                />
              ))}
            </span>
          )}

          {!input && !attiva && !voice.listening && (
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] rounded bg-crm-bg-soft border border-crm-border text-crm-ink-subtle font-medium">
              ⌘K
            </kbd>
          )}
          {attiva && !voice.listening && (
            <button
              type="button"
              onClick={() => { setTurns([]); setInput(''); }}
              title="Nuova conversazione"
              className="w-8 h-8 inline-flex items-center justify-center rounded-crm-sm text-crm-ink-muted hover:text-crm-ink hover:bg-crm-bg-soft transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {voice.supported && (
            <button
              type="button"
              onClick={voice.toggle}
              disabled={loading || voice.transcribing}
              title={voice.listening ? 'Ferma e invia' : 'Detta la domanda'}
              aria-label={voice.listening ? 'Ferma la registrazione e invia' : 'Detta la domanda'}
              aria-pressed={voice.listening}
              className={`w-8 h-8 inline-flex items-center justify-center rounded-crm-sm transition disabled:opacity-40 ${
                voice.listening
                  ? 'bg-red-500 text-white'
                  : 'text-crm-ink-muted hover:text-crm-ink hover:bg-crm-bg-soft'
              }`}
            >
              {voice.transcribing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : voice.listening ? (
                <Square className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Interruttore risposta vocale */}
          <button
            type="button"
            role="switch"
            aria-checked={voiceReply}
            aria-label="Risposta vocale"
            title={voiceReply ? 'Risposta vocale attiva' : 'Risposta vocale spenta'}
            onClick={() => {
              const next = !voiceReply;
              setVoiceReply(next);
              localStorage.setItem('kalea:ai-voice-reply', next ? '1' : '0');
              if (!next) speech.stop();
            }}
            className={`h-8 px-2 inline-flex items-center gap-1.5 rounded-crm-sm border transition shrink-0 ${
              voiceReply
                ? 'border-crm-primary/40 bg-crm-primary/10 text-crm-primary'
                : 'border-crm-border text-crm-ink-muted hover:text-crm-ink hover:bg-crm-bg-soft'
            }`}
          >
            {voiceReply ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden lg:inline text-[11px] font-medium">Voce</span>
          </button>

          {/* Interrompi audio / ripeti ultima risposta */}
          {speech.speaking ? (
            <button
              type="button"
              onClick={speech.stop}
              title="Interrompi audio"
              aria-label="Interrompi audio"
              className="w-8 h-8 inline-flex items-center justify-center rounded-crm-sm bg-crm-bg-soft text-crm-ink border border-crm-border hover:border-crm-border-strong transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            ultimaRisposta && (
              <button
                type="button"
                onClick={() => void speech.speak(ultimaRisposta)}
                title="Ripeti l'ultima risposta"
                aria-label="Ripeti l'ultima risposta"
                className="w-8 h-8 inline-flex items-center justify-center rounded-crm-sm text-crm-ink-muted hover:text-crm-ink hover:bg-crm-bg-soft transition"
              >
                <Repeat2 className="w-4 h-4" />
              </button>
            )
          )}

          <button
            type="submit"
            disabled={!input.trim() || loading}
            title="Invia"
            className="w-8 h-8 inline-flex items-center justify-center rounded-crm-sm text-white disabled:opacity-40 transition"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #A25DDC 100%)' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </form>

        {voice.error && (
          <div className="flex items-start gap-2 px-3 pb-2 text-[12px] text-red-600">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="flex-1">{voice.error}</span>
            <button
              type="button"
              onClick={() => voice.setError(null)}
              className="text-crm-ink-muted hover:text-crm-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}


        {/* Esempi: solo a barra vuota e senza conversazione */}
        {!attiva && (focused || input.length === 0) && (
          <div className="flex flex-wrap gap-2 px-3 pb-3 border-t border-crm-border pt-3">
            {ESEMPI.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => ask(e)}
                className="px-2.5 py-1.5 text-[12px] rounded-crm-sm bg-crm-bg-soft border border-crm-border text-crm-ink-muted hover:text-crm-ink hover:border-crm-border-strong transition"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {/* Pannello conversazione */}
        {attiva && (
          <div
            ref={panelRef}
            className="border-t border-crm-border max-h-[340px] overflow-auto px-3 py-3 space-y-4 animate-crm-fade-up"
          >
            {turns.map((t) => (
              <div key={t.id} className="space-y-2">
                <p className="text-[12px] font-medium text-crm-ink-subtle">{t.domanda}</p>

                {t.errore ? (
                  <div className="flex items-start gap-2 text-[13px] text-red-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p>{t.errore}</p>
                      <button
                        onClick={() => ask(t.domanda)}
                        className="inline-flex items-center gap-1 text-[12px] text-crm-ink-muted hover:text-crm-ink"
                      >
                        <RotateCcw className="w-3 h-3" /> Riprova
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] leading-relaxed text-crm-ink whitespace-pre-wrap">
                    {t.risposta}
                    {t.streaming && (
                      <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-crm-primary animate-pulse" />
                    )}
                  </p>
                )}

                {!t.streaming && t.riferimenti.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {t.riferimenti.map((r) => (
                      <button
                        key={r.percorso + r.etichetta}
                        onClick={() => navigate(r.percorso)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] rounded-crm-sm bg-crm-bg-soft border border-crm-border text-crm-ink hover:border-crm-border-strong transition"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        Apri {r.etichetta}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && !turns[turns.length - 1]?.risposta && (
              <p className="text-[12px] text-crm-ink-subtle inline-flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sto cercando nei dati…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
