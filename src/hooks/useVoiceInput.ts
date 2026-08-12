import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Options = {
  /** chiamato mentre l'utente parla (testo parziale) */
  onInterim?: (text: string) => void;
  /** chiamato con il testo finale, da inviare come domanda */
  onFinal: (text: string) => void;
  /** ms di silenzio prima dell'invio automatico */
  silenceMs?: number;
};

const SILENCE_DEFAULT = 1500;

const getSpeechRecognition = (): any =>
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined;

/**
 * Input vocale: usa il riconoscimento nativo del browser (it-IT) quando disponibile,
 * altrimenti registra l'audio e lo trascrive con la edge function `voice-transcribe`.
 * L'utente non deve accorgersi di quale metodo viene usato.
 */
export function useVoiceInput({ onInterim, onFinal, silenceMs = SILENCE_DEFAULT }: Options) {
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0); // 0..1 per l'onda animata

  const recRef = useRef<any>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const silenceRef = useRef<number | null>(null);
  const finalRef = useRef('');
  const abortedRef = useRef(false);
  const cbRef = useRef({ onInterim, onFinal });
  cbRef.current = { onInterim, onFinal };

  const supported =
    typeof window !== 'undefined' &&
    (!!getSpeechRecognition() || !!navigator.mediaDevices?.getUserMedia);

  const clearSilence = () => {
    if (silenceRef.current) {
      window.clearTimeout(silenceRef.current);
      silenceRef.current = null;
    }
  };

  const teardownAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setLevel(0);
  }, []);

  const permissionError = (e: any) => {
    const name = e?.name || e?.error || '';
    if (name === 'not-allowed' || name === 'NotAllowedError' || name === 'service-not-allowed') {
      return 'Permesso microfono negato. Consentilo dalle impostazioni del browser per usare la voce.';
    }
    if (name === 'NotFoundError') return 'Nessun microfono rilevato su questo dispositivo.';
    if (name === 'no-speech') return 'Non ho sentito nulla, riprova.';
    return 'Microfono non disponibile su questo dispositivo.';
  };

  // ---- monitor livello audio (onda) + rilevamento silenzio per il fallback
  const startMeter = useCallback((stream: MediaStream, onSilence?: () => void) => {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx: AudioContext = new Ctx();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let spoke = false;
    let quietSince = performance.now();

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      setLevel(Math.min(1, rms * 6));

      const now = performance.now();
      if (rms > 0.045) {
        spoke = true;
        quietSince = now;
      } else if (spoke && onSilence && now - quietSince > silenceMs) {
        onSilence();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [silenceMs]);

  // ---- fallback: registrazione + edge function
  const startFallback = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRef.current = rec;

      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        teardownAudio();
        setListening(false);
        if (abortedRef.current || chunksRef.current.length === 0) return;
        const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' });
        if (blob.size < 1200) return;
        setTranscribing(true);
        try {
          const ext = (mime || 'audio/webm').includes('mp4') ? 'mp4' : 'webm';
          const form = new FormData();
          form.append('file', blob, `audio.${ext}`);
          const { data, error: fnErr } = await supabase.functions.invoke('voice-transcribe', { body: form });
          if (fnErr) throw fnErr;
          const text = (data as any)?.text?.trim();
          if (text) cbRef.current.onFinal(text);
          else setError('Non sono riuscito a capire, riprova.');
        } catch (e: any) {
          setError(e?.message || 'Trascrizione non riuscita.');
        } finally {
          setTranscribing(false);
        }
      };

      rec.start();
      setListening(true);
      startMeter(stream, () => { try { rec.stop(); } catch { /* già fermo */ } });
    } catch (e) {
      setError(permissionError(e));
      setListening(false);
      teardownAudio();
    }
  }, [startMeter, teardownAudio]);

  // ---- nativo: Web Speech API
  const startNative = useCallback(async () => {
    const SR = getSpeechRecognition();
    const rec = new SR();
    recRef.current = rec;
    rec.lang = 'it-IT';
    rec.continuous = true;
    rec.interimResults = true;
    finalRef.current = '';
    abortedRef.current = false;

    const submit = () => {
      clearSilence();
      try { rec.stop(); } catch { /* già fermo */ }
    };

    rec.onresult = (ev: any) => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) finalRef.current += r[0].transcript;
        else interim += r[0].transcript;
      }
      cbRef.current.onInterim?.((finalRef.current + interim).trim());
      clearSilence();
      silenceRef.current = window.setTimeout(submit, silenceMs);
    };
    rec.onerror = (ev: any) => {
      if (ev?.error === 'aborted') return;
      setError(permissionError(ev));
    };
    rec.onend = () => {
      clearSilence();
      teardownAudio();
      setListening(false);
      const text = finalRef.current.trim();
      if (!abortedRef.current && text) cbRef.current.onFinal(text);
      finalRef.current = '';
    };

    try {
      rec.start();
      setListening(true);
      setError(null);
      // stream separato solo per l'indicatore visivo (onda)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        startMeter(stream);
      } catch { /* onda non disponibile, il riconoscimento continua */ }
    } catch (e) {
      setError(permissionError(e));
      setListening(false);
    }
  }, [silenceMs, startMeter, teardownAudio]);

  const stop = useCallback(() => {
    clearSilence();
    if (recRef.current) { try { recRef.current.stop(); } catch { /* noop */ } }
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      try { mediaRef.current.stop(); } catch { /* noop */ }
    }
  }, []);

  const cancel = useCallback(() => {
    abortedRef.current = true;
    stop();
    teardownAudio();
    setListening(false);
  }, [stop, teardownAudio]);

  const start = useCallback(() => {
    setError(null);
    abortedRef.current = false;
    if (getSpeechRecognition()) void startNative();
    else void startFallback();
  }, [startNative, startFallback]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  useEffect(() => () => { cancel(); }, [cancel]);

  return { supported, listening, transcribing, error, level, start, stop, toggle, cancel, setError };
}
