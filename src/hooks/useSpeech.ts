import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/ai-speak`;

/** Rende il testo scorrevole a voce: niente markdown, niente elenchi puntati, numeri leggibili. */
export function toSpeakable(raw: string): string {
  let t = (raw || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[*_#`>]/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1');

  // elenchi puntati/numerati → frasi separate
  t = t
    .split('\n')
    .map((line) => {
      const l = line.trim().replace(/^[-•–]\s*/, '').replace(/^\d+[.)]\s*/, '');
      if (!l) return '';
      return /[.!?:;]$/.test(l) ? l : `${l}.`;
    })
    .filter(Boolean)
    .join(' ');

  return t
    .replace(/€\s?([\d.,]+)/g, '$1 euro')
    .replace(/([\d.,]+)\s?€/g, '$1 euro')
    .replace(/(\d)\s?%/g, '$1 per cento')
    .replace(/\bmq\b/gi, 'metri quadri')
    .replace(/\bIVA\b/g, 'i.v.a.')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Spezza il testo in blocchi brevi, su confini di frase, per non superare i limiti del modello. */
function chunkForTTS(text: string, maxWords = 220): string[] {
  const words = (s: string) => (s.match(/\S+/g) ?? []).length;
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let cur = '';
  const flush = () => { if (cur.trim()) chunks.push(cur.trim()); cur = ''; };
  for (const s of sentences) {
    if (words(s) > maxWords) {
      flush();
      const w = s.match(/\S+/g) ?? [];
      for (let i = 0; i < w.length; i += maxWords) chunks.push(w.slice(i, i + maxWords).join(' '));
      continue;
    }
    if (cur && words(cur) + words(s) > maxWords) flush();
    cur += s;
  }
  flush();
  return chunks;
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const tokenRef = useRef(0);

  const stop = useCallback(() => {
    tokenRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    sourcesRef.current.forEach((s) => { try { s.stop(); } catch { /* già fermo */ } });
    sourcesRef.current = [];
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (raw: string) => {
    const text = toSpeakable(raw);
    if (!text) return;
    stop();
    const myToken = tokenRef.current;
    setError(null);
    setSpeaking(true);

    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    let ctx = ctxRef.current;
    if (!ctx || ctx.state === 'closed') {
      ctx = new Ctx({ sampleRate: 24000 });
      ctxRef.current = ctx;
    }
    if (ctx!.state === 'suspended') await ctx!.resume().catch(() => {});

    let playhead = 0;
    let pending = new Uint8Array(0);

    const play = (incoming: Uint8Array) => {
      if (tokenRef.current !== myToken) return;
      const bytes = new Uint8Array(pending.length + incoming.length);
      bytes.set(pending);
      bytes.set(incoming, pending.length);
      const usable = bytes.length - (bytes.length % 2);
      pending = bytes.slice(usable);
      if (usable === 0) return;
      const samples = new Int16Array(bytes.buffer, 0, usable / 2);
      const floats = Float32Array.from(samples, (s) => s / 32768);
      const buffer = ctx!.createBuffer(1, floats.length, 24000);
      buffer.copyToChannel(floats, 0);
      const src = ctx!.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx!.destination);
      if (playhead === 0) playhead = ctx!.currentTime + 0.05;
      else playhead = Math.max(playhead, ctx!.currentTime);
      src.start(playhead);
      playhead += buffer.duration;
      sourcesRef.current.push(src);
      src.onended = () => {
        sourcesRef.current = sourcesRef.current.filter((s) => s !== src);
      };
    };

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error('Sessione scaduta.');

      for (const chunk of chunkForTTS(text)) {
        if (tokenRef.current !== myToken) return;
        const ac = new AbortController();
        abortRef.current = ac;

        const res = await fetch(FUNCTIONS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
          },
          body: JSON.stringify({ text: chunk }),
          signal: ac.signal,
        });

        if (!res.ok || !res.body) {
          let msg = `Errore ${res.status}`;
          try { msg = (await res.json())?.error || msg; } catch { /* non JSON */ }
          throw new Error(msg);
        }

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (tokenRef.current !== myToken) { try { await reader.cancel(); } catch { /* noop */ } return; }
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data || data === '[DONE]') continue;
            let payload: any;
            try { payload = JSON.parse(data); } catch { continue; }
            if (payload?.type === 'speech.audio.delta' && payload.audio) {
              const bin = atob(payload.audio);
              const bytes = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
              play(bytes);
            }
          }
        }
      }

      // attende la fine della riproduzione programmata
      const remaining = Math.max(0, (playhead - (ctx?.currentTime ?? 0)) * 1000);
      window.setTimeout(() => {
        if (tokenRef.current === myToken) setSpeaking(false);
      }, remaining + 150);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setError(e?.message || 'Impossibile riprodurre la risposta a voce.');
      setSpeaking(false);
    }
  }, [stop]);

  useEffect(() => () => { stop(); ctxRef.current?.close().catch(() => {}); }, [stop]);

  return { speak, stop, speaking, error, setError };
}
