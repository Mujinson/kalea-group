import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  ArrowLeft, Play, Square, Camera, MessageSquare, Send, Loader2,
  MapPin, Phone, Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'lavoro' | 'foto' | 'chat';

const OperaioCantiereDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const [tab, setTab] = useState<Tab>('lavoro');
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('construction_sites')
        .select('id,title,address,city,product_model,status,contact_name,contact_surname,contact_phone,start_date,end_date')
        .eq('id', id)
        .maybeSingle();
      setSite(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#1E1B4B]" />
      </div>
    );
  }
  if (!site) {
    return (
      <div className="p-4">
        <button onClick={() => navigate(-1)} className="text-[#1E1B4B] flex items-center gap-1 text-[14px]">
          <ArrowLeft className="w-4 h-4" /> Indietro
        </button>
        <div className="mt-4 bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258]">
          Cantiere non trovato.
        </div>
      </div>
    );
  }

  const place = [site.address, site.city].filter(Boolean).join(', ');
  const cliente = [site.contact_name, site.contact_surname].filter(Boolean).join(' ');

  return (
    <div className="pb-4">
      {/* header */}
      <div className="bg-white border-b border-[#E5E2DD] p-4">
        <button onClick={() => navigate(-1)} className="text-[#8C7B6B] flex items-center gap-1 text-[13px] mb-2">
          <ArrowLeft className="w-4 h-4" /> Indietro
        </button>
        <h1 className="text-[20px] font-semibold text-[#1E1B4B]">{site.title}</h1>
        {cliente && <p className="text-[13px] text-[#6B6258] mt-1">{cliente}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {place && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md bg-[#F5F0EA] text-[#8B6F4E]"
            >
              <MapPin className="w-3 h-3" /> {place}
            </a>
          )}
          {site.contact_phone && (
            <a
              href={`tel:${site.contact_phone}`}
              className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md bg-[#1E1B4B] text-white"
            >
              <Phone className="w-3 h-3" /> {site.contact_phone}
            </a>
          )}
        </div>
      </div>

      {/* tabs */}
      <div className="grid grid-cols-3 bg-white border-b border-[#E5E2DD] sticky top-0 z-10">
        {(['lavoro', 'foto', 'chat'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-12 text-[13px] font-medium capitalize transition-colors ${
              tab === t ? 'text-[#1E1B4B] border-b-2 border-[#1E1B4B]' : 'text-[#8C7B6B]'
            }`}
          >
            {t === 'lavoro' ? 'Ore' : t === 'foto' ? 'Foto' : 'Chat'}
          </button>
        ))}
      </div>

      {tab === 'lavoro' && <LavoroTab siteId={site.id} userId={user?.id} />}
      {tab === 'foto' && <FotoTab siteId={site.id} userId={user?.id} />}
      {tab === 'chat' && <ChatTab siteId={site.id} user={user} />}
    </div>
  );
};

// ============== TAB: Lavoro (clock in/out) ==============
const LavoroTab = ({ siteId, userId }: { siteId: string; userId?: string }) => {
  const [activeLog, setActiveLog] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('site_work_logs')
      .select('id,work_date,start_time,end_time,hours_worked,notes')
      .eq('site_id', siteId)
      .eq('worker_user_id', userId)
      .order('work_date', { ascending: false })
      .limit(20);
    setLogs(data || []);
    setActiveLog((data || []).find((l: any) => l.start_time && !l.end_time) || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [siteId, userId]);

  const startWork = async () => {
    if (!userId) return;
    setBusy(true);
    const now = new Date();
    const { error } = await supabase.from('site_work_logs').insert({
      site_id: siteId,
      worker_user_id: userId,
      work_date: now.toISOString().slice(0, 10),
      start_time: now.toTimeString().slice(0, 8),
      hours_worked: 0,
    });
    if (error) toast.error(error.message); else { toast.success('Inizio turno registrato'); await load(); }
    setBusy(false);
  };

  const stopWork = async () => {
    if (!activeLog) return;
    setBusy(true);
    const end = new Date();
    const start = new Date(`${activeLog.work_date}T${activeLog.start_time}`);
    const hrs = Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
    const { error } = await supabase
      .from('site_work_logs')
      .update({ end_time: end.toTimeString().slice(0, 8), hours_worked: Number(hrs.toFixed(2)) })
      .eq('id', activeLog.id);
    if (error) toast.error(error.message); else { toast.success('Fine turno registrata'); await load(); }
    setBusy(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-xl border border-[#E5E2DD] p-5 text-center space-y-3">
        {activeLog ? (
          <>
            <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">In corso</p>
            <p className="text-[22px] font-semibold text-[#1E1B4B]">
              dalle {new Date(`${activeLog.work_date}T${activeLog.start_time}`).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <button
              onClick={stopWork} disabled={busy}
              className="w-full h-[56px] rounded-xl bg-[#DC2626] text-white font-semibold text-[16px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Square className="w-5 h-5" /> Termina turno
            </button>
          </>
        ) : (
          <>
            <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">Pronto a iniziare</p>
            <button
              onClick={startWork} disabled={busy}
              className="w-full h-[56px] rounded-xl bg-[#16A34A] text-white font-semibold text-[16px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-5 h-5" /> Inizia turno
            </button>
          </>
        )}
      </div>

      <div>
        <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider mb-2">Ultimi turni</p>
        {loading && <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin inline text-[#1E1B4B]" /></div>}
        {!loading && logs.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E5E2DD] p-4 text-center text-[#6B6258] text-[13px]">
            Nessun turno registrato.
          </div>
        )}
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="bg-white rounded-lg border border-[#E5E2DD] p-3 flex justify-between text-[13px]">
              <span className="text-[#1E1B4B]">{new Date(l.work_date).toLocaleDateString('it-IT')}</span>
              <span className="text-[#6B6258]">
                {l.end_time ? `${Number(l.hours_worked).toFixed(1)} h` : 'in corso'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============== TAB: Foto pre/post posa ==============
const FotoTab = ({ siteId, userId }: { siteId: string; userId?: string }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_media')
      .select('id,file_url,file_name,description,file_type,created_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(60);
    setPhotos(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [siteId]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>, phase: 'pre' | 'post') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userId) return;
    setUploading(true);
    try {
      const path = `${siteId}/${phase}-${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, '_')}`;
      const { error: upErr } = await supabase.storage.from('site-media').upload(path, file, {
        cacheControl: '3600', upsert: false,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('site-media').getPublicUrl(path);
      const { error: insErr } = await supabase.from('site_media').insert({
        site_id: siteId,
        file_url: pub.publicUrl,
        file_name: file.name,
        file_type: file.type || 'image/jpeg',
        description: phase, // store phase in description (pre|post)
        file_size: file.size,
      });
      if (insErr) throw insErr;
      toast.success(`Foto ${phase}-posa caricata`);
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Errore upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="h-[80px] rounded-xl border-2 border-dashed border-[#1E1B4B]/30 bg-white flex flex-col items-center justify-center text-[#1E1B4B] cursor-pointer">
          <Camera className="w-6 h-6 mb-1" />
          <span className="text-[12px] font-medium">Foto PRE</span>
          <input
            type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => onUpload(e, 'pre')} disabled={uploading}
          />
        </label>
        <label className="h-[80px] rounded-xl border-2 border-dashed border-[#16A34A]/40 bg-white flex flex-col items-center justify-center text-[#16A34A] cursor-pointer">
          <Camera className="w-6 h-6 mb-1" />
          <span className="text-[12px] font-medium">Foto POST</span>
          <input
            type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => onUpload(e, 'post')} disabled={uploading}
          />
        </label>
      </div>

      {uploading && (
        <div className="text-center text-[12px] text-[#6B6258] flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Caricamento…
        </div>
      )}

      {loading && <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin inline text-[#1E1B4B]" /></div>}
      {!loading && photos.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258] text-[13px] flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 text-[#8C7B6B]" />
          Nessuna foto ancora.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {photos.map((p) => (
          <a key={p.id} href={p.file_url} target="_blank" rel="noreferrer" className="relative aspect-square rounded-lg overflow-hidden bg-[#F5F0EA]">
            <img src={p.file_url} alt={p.description || p.file_name || ''} className="w-full h-full object-cover" loading="lazy" />
            {(p.description === 'pre' || p.description === 'post') && (
              <span className={`absolute top-1 left-1 text-[10px] uppercase px-1.5 py-0.5 rounded-md text-white ${
                p.description === 'post' ? 'bg-[#16A34A]' : 'bg-[#1E1B4B]'
              }`}>
                {p.description}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

// ============== TAB: Chat cantiere ==============
const ChatTab = ({ siteId, user }: { siteId: string; user: any }) => {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_chat_messages')
      .select('id,user_id,user_name,message,created_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: true })
      .limit(200);
    setMsgs(data || []);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  useEffect(() => { load(); }, [siteId]);

  // realtime
  useEffect(() => {
    const ch = supabase
      .channel(`site_chat_${siteId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'site_chat_messages', filter: `site_id=eq.${siteId}` },
        (payload) => {
          setMsgs((prev) => [...prev, payload.new as any]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [siteId]);

  const send = async () => {
    const t = text.trim();
    if (!t || !user?.id) return;
    setSending(true);
    const name = (user.user_metadata?.full_name as string) || (user.email || '').split('@')[0];
    const { error } = await supabase.from('site_chat_messages').insert({
      site_id: siteId, user_id: user.id, user_name: name, message: t,
    });
    if (error) toast.error(error.message);
    else setText('');
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-260px)] min-h-[400px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && <div className="text-center"><Loader2 className="w-5 h-5 animate-spin inline text-[#1E1B4B]" /></div>}
        {!loading && msgs.length === 0 && (
          <div className="text-center text-[13px] text-[#6B6258] flex flex-col items-center gap-2 pt-8">
            <MessageSquare className="w-8 h-8 text-[#8C7B6B]" />
            Nessun messaggio. Inizia tu!
          </div>
        )}
        {msgs.map((m) => {
          const mine = m.user_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-2xl px-3 py-2 ${
                mine ? 'bg-[#1E1B4B] text-white' : 'bg-white border border-[#E5E2DD] text-[#1E1B4B]'
              }`}>
                {!mine && m.user_name && (
                  <div className="text-[11px] font-medium text-[#8B6F4E] mb-0.5">{m.user_name}</div>
                )}
                <div className="text-[14px] whitespace-pre-wrap break-words">{m.message}</div>
                <div className={`text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-[#8C7B6B]'}`}>
                  {new Date(m.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-[#E5E2DD] bg-white flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Scrivi un messaggio…"
          className="flex-1 h-[44px] px-3 rounded-lg border border-[#E5E2DD] text-[14px] bg-[#F5F0EA] focus:outline-none focus:border-[#1E1B4B]"
        />
        <button
          onClick={send} disabled={sending || !text.trim()}
          className="h-[44px] px-4 rounded-lg bg-[#1E1B4B] text-white disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default OperaioCantiereDetail;
