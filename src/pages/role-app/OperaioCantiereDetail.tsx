import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  ArrowLeft, Play, Square, Camera, MessageSquare, Send, Loader2,
  MapPin, Phone, Image as ImageIcon, Wrench, ListChecks, AlertTriangle,
  Mail, MessageCircle, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { haversineMeters, getCurrentPosition } from '@/lib/geo';
import SiteIssueSheet from '@/components/role-app/SiteIssueSheet';
import { differenceInDays } from 'date-fns';

type Tab = 'lavoro' | 'foto' | 'chat' | 'info' | 'attrezzi' | 'checklist';

const formatExactTime = (time?: string | null) => {
  if (!time) return '—';
  return time.split('.')[0].slice(0, 8);
};

const formatDuration = (h?: number | null) => {
  if (h == null || isNaN(h)) return '—';
  if (h < 0.1) {
    const s = Math.round(h * 3600);
    return `${s} s`;
  }
  if (h < 1) {
    const m = h * 60;
    if (m < 10) return `${m.toFixed(1)} min`;
    return `${Math.round(m)} min`;
  }
  return `${h.toFixed(2)} h`;
};

const PRIORITY_STYLE: Record<string, string> = {
  bassa: 'bg-slate-200 text-slate-700',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-amber-100 text-amber-800',
  urgente: 'bg-red-100 text-red-700',
};

const OperaioCantiereDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const [tab, setTab] = useState<Tab>('lavoro');
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [issueOpen, setIssueOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('construction_sites')
        .select('*')
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
  const endRef = site.planned_end_date || site.end_date;
  const daysLeft = endRef ? differenceInDays(new Date(endRef), new Date()) : null;
  const priorityClass = PRIORITY_STYLE[site.priority || 'media'];

  return (
    <div className="pb-24">
      {/* header */}
      <div className="bg-white border-b border-[#E5E2DD] p-4">
        <button onClick={() => navigate(-1)} className="text-[#8C7B6B] flex items-center gap-1 text-[13px] mb-2">
          <ArrowLeft className="w-4 h-4" /> Indietro
        </button>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-[20px] font-semibold text-[#1E1B4B]">{site.title}</h1>
            {cliente && <p className="text-[13px] text-[#6B6258] mt-1">{cliente}</p>}
          </div>
          <div className="flex flex-col items-end gap-1">
            {site.priority && <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${priorityClass}`}>{site.priority}</span>}
            {site.status && <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#1E1B4B]/10 text-[#1E1B4B]">{site.status}</span>}
          </div>
        </div>

        {daysLeft !== null && (
          <p className={`text-[12px] mt-2 ${daysLeft < 0 ? 'text-red-600' : 'text-[#6B6258]'}`}>
            {daysLeft < 0 ? `In ritardo di ${Math.abs(daysLeft)} giorni` : `${daysLeft} giorni residui`}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          {place && (
            <a
              href={
                site.latitude && site.longitude
                  ? `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`
              }
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md bg-[#F5F0EA] text-[#8B6F4E]"
            >
              <MapPin className="w-3 h-3" /> {place}
            </a>
          )}
          {site.contact_phone && (
            <>
              <a href={`tel:${site.contact_phone}`} className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md bg-[#1E1B4B] text-white">
                <Phone className="w-3 h-3" /> Chiama
              </a>
              <a
                href={`https://wa.me/${site.contact_phone.replace(/\D/g, '')}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md bg-[#25D366] text-white"
              >
                <MessageCircle className="w-3 h-3" /> WhatsApp
              </a>
            </>
          )}
          {site.contact_email && (
            <a href={`mailto:${site.contact_email}`} className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md bg-white border border-[#E5E2DD] text-[#1E1B4B]">
              <Mail className="w-3 h-3" /> Email
            </a>
          )}
          <button
            onClick={() => setIssueOpen(true)}
            className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md bg-[#DC2626] text-white ml-auto"
          >
            <AlertTriangle className="w-3 h-3" /> Segnala
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="grid grid-cols-6 bg-white border-b border-[#E5E2DD] sticky top-0 z-10 text-[11px]">
        {([
          { k: 'lavoro', l: 'Ore' },
          { k: 'foto', l: 'Foto' },
          { k: 'info', l: 'Info' },
          { k: 'attrezzi', l: 'Attrezzi' },
          { k: 'checklist', l: 'Check' },
          { k: 'chat', l: 'Chat' },
        ] as { k: Tab; l: string }[]).map(({ k, l }) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`h-11 font-medium transition-colors ${
              tab === k ? 'text-[#1E1B4B] border-b-2 border-[#1E1B4B]' : 'text-[#8C7B6B]'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'lavoro' && <LavoroTab site={site} userId={user?.id} />}
      {tab === 'foto' && <FotoTab siteId={site.id} userId={user?.id} />}
      {tab === 'info' && <InfoTab site={site} />}
      {tab === 'attrezzi' && <AttrezziTab siteId={site.id} />}
      {tab === 'checklist' && <ChecklistTab siteId={site.id} userId={user?.id} />}
      {tab === 'chat' && <ChatTab siteId={site.id} user={user} />}




      <SiteIssueSheet open={issueOpen} onOpenChange={setIssueOpen} siteId={site.id} user={user} />
    </div>
  );
};

// ============== TAB: Lavoro (clock in/out + GPS) ==============
const LavoroTab = ({ site, userId }: { site: any; userId?: string }) => {
  const [activeLog, setActiveLog] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const siteId = site.id;

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('site_work_logs')
      .select('id,work_date,start_time,end_time,hours_worked,notes,start_distance_m,end_distance_m')
      .eq('site_id', siteId)
      .eq('worker_user_id', userId)
      .order('work_date', { ascending: false })
      .limit(30);
    setLogs(data || []);
    setActiveLog((data || []).find((l: any) => l.start_time && !l.end_time) || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [siteId, userId]);

  const tryGps = async (): Promise<{ lat: number | null; lon: number | null; dist: number | null }> => {
    if (!site.latitude || !site.longitude) return { lat: null, lon: null, dist: null };
    try {
      const pos = await getCurrentPosition();
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const dist = haversineMeters(lat, lon, Number(site.latitude), Number(site.longitude));
      return { lat, lon, dist };
    } catch {
      toast.info("Posizione non disponibile — turno avviato senza GPS");
      return { lat: null, lon: null, dist: null };
    }
  };

  const startWork = async () => {
    if (!userId) return;
    setBusy(true);
    const gps = await tryGps();
    const now = new Date();
    const { error } = await supabase.from('site_work_logs').insert({
      site_id: siteId,
      worker_user_id: userId,
      work_date: now.toISOString().slice(0, 10),
      start_time: now.toTimeString().slice(0, 8),
      hours_worked: 0,
      start_latitude: gps.lat,
      start_longitude: gps.lon,
      start_distance_m: gps.dist,
    });
    if (error) toast.error(error.message); else { toast.success('Inizio turno registrato'); await load(); }
    setBusy(false);
  };

  const stopWork = async () => {
    if (!activeLog) return;
    setBusy(true);
    const gps = await tryGps();
    const end = new Date();
    const start = new Date(`${activeLog.work_date}T${activeLog.start_time}`);
    const hrs = Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
    const { data, error } = await supabase
      .from('site_work_logs')
      .update({
        end_time: end.toTimeString().slice(0, 8),
        hours_worked: Number(hrs.toFixed(2)),
        end_latitude: gps.lat,
        end_longitude: gps.lon,
        end_distance_m: gps.dist,
      })
      .eq('id', activeLog.id)
      .select('id,end_time')
      .maybeSingle();
    if (error) toast.error(error.message);
    else if (!data) toast.error('Impossibile aggiornare il turno (permessi mancanti)');
    else {
      toast.success('Fine turno registrata');
      setActiveLog(null);
      await load();
    }
    setBusy(false);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const totalHours = logs.reduce((s, l) => s + Number(l.hours_worked || 0), 0);
  const todayHours = logs.filter((l) => l.work_date === todayStr).reduce((s, l) => s + Number(l.hours_worked || 0), 0);
  const est = Number(site.estimated_hours || 0);
  const residueH = est ? Math.max(0, est - totalHours) : null;

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-xl border border-[#E5E2DD] p-5 text-center space-y-3">
        {activeLog ? (
          <>
            <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">In corso</p>
            <p className="text-[22px] font-semibold text-[#1E1B4B]">
              dalle {formatExactTime(activeLog.start_time)}
            </p>
            {activeLog.start_distance_m != null && (
              <p className="text-[11px] text-[#8C7B6B]">GPS: {activeLog.start_distance_m} m dal cantiere</p>
            )}
            <button
              onClick={stopWork} disabled={busy}
              className="w-full h-[56px] rounded-xl bg-[#DC2626] text-white font-semibold text-[16px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5" />} Termina turno
            </button>
          </>
        ) : (
          <>
            <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">Pronto a iniziare</p>
            <button
              onClick={startWork} disabled={busy}
              className="w-full h-[56px] rounded-xl bg-[#16A34A] text-white font-semibold text-[16px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />} Inizia turno
            </button>
          </>
        )}
      </div>

      {/* Riepilogo */}
      <div className="grid grid-cols-3 gap-2">
        <SummaryBox label="Totale" value={`${totalHours.toFixed(2)} h`} />
        <SummaryBox label="Oggi" value={`${todayHours.toFixed(2)} h`} />
        <SummaryBox label="Residue" value={residueH == null ? '—' : `${residueH.toFixed(1)} h`} />
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
            <div key={l.id} className="bg-white rounded-lg border border-[#E5E2DD] p-3 flex flex-col gap-2 text-[13px] sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[#1E1B4B] font-medium">{new Date(l.work_date).toLocaleDateString('it-IT')}</span>
              <span className="text-[#6B6258] flex flex-wrap gap-x-3 gap-y-1 sm:justify-end">
                <span>Inizio {formatExactTime(l.start_time)}</span>
                <span>Fine {formatExactTime(l.end_time)}</span>
                <span>{l.end_time ? formatDuration(Number(l.hours_worked)) : 'in corso'}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SummaryBox = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white rounded-lg border border-[#E5E2DD] p-3 text-center">
    <p className="text-[10px] uppercase tracking-wider text-[#8C7B6B]">{label}</p>
    <p className="text-[16px] font-semibold text-[#1E1B4B] mt-1">{value}</p>
  </div>
);

// ============== TAB: Foto pre/durante/post ==============
const FotoTab = ({ siteId, userId }: { siteId: string; userId?: string }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_media')
      .select('id,file_url,file_name,description,file_type,created_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(120);
    setPhotos(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [siteId]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>, phase: 'pre' | 'during' | 'post') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userId) return;
    setUploading(true);
    try {
      const path = `${siteId}/${phase}-${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, '_')}`;
      const { error: upErr } = await supabase.storage.from('site-media').upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('site-media').getPublicUrl(path);
      const { error: insErr } = await supabase.from('site_media').insert({
        site_id: siteId, file_url: pub.publicUrl, file_name: file.name,
        file_type: file.type || 'image/jpeg', description: phase, file_size: file.size,
      });
      if (insErr) throw insErr;
      toast.success(`Foto caricata`);
      await load();
    } catch (err: any) { toast.error(err.message || 'Errore upload'); }
    finally { setUploading(false); }
  };

  const phaseColor = (p?: string) => p === 'post' ? 'bg-[#16A34A]' : p === 'during' ? 'bg-[#F59E0B]' : 'bg-[#1E1B4B]';

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(['pre', 'during', 'post'] as const).map((p) => (
          <label key={p} className={`h-[80px] rounded-xl border-2 border-dashed bg-white flex flex-col items-center justify-center cursor-pointer ${
            p === 'post' ? 'border-[#16A34A]/40 text-[#16A34A]' : p === 'during' ? 'border-[#F59E0B]/40 text-[#F59E0B]' : 'border-[#1E1B4B]/30 text-[#1E1B4B]'
          }`}>
            <Camera className="w-6 h-6 mb-1" />
            <span className="text-[12px] font-medium uppercase">{p === 'pre' ? 'Prima' : p === 'during' ? 'Durante' : 'Fine'}</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onUpload(e, p)} disabled={uploading} />
          </label>
        ))}
      </div>

      {uploading && <div className="text-center text-[12px] text-[#6B6258] flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Caricamento…</div>}
      {loading && <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin inline text-[#1E1B4B]" /></div>}
      {!loading && photos.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258] text-[13px] flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 text-[#8C7B6B]" /> Nessuna foto ancora.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {photos.map((p) => (
          <a key={p.id} href={p.file_url} target="_blank" rel="noreferrer" className="relative aspect-square rounded-lg overflow-hidden bg-[#F5F0EA]">
            <img src={p.file_url} alt={p.description || p.file_name || ''} className="w-full h-full object-cover" loading="lazy" />
            {['pre', 'during', 'post'].includes(p.description) && (
              <span className={`absolute top-1 left-1 text-[10px] uppercase px-1.5 py-0.5 rounded-md text-white ${phaseColor(p.description)}`}>
                {p.description === 'during' ? 'durante' : p.description}
              </span>
            )}
            <span className="absolute bottom-1 right-1 text-[9px] px-1 py-0.5 rounded bg-black/50 text-white">
              {new Date(p.created_at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

// ============== TAB: Info (sola lettura) ==============
const InfoTab = ({ site }: { site: any }) => {
  const [accessories, setAccessories] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: a } = await supabase.from('site_accessories' as any).select('*').eq('site_id', site.id);
      setAccessories((a as any[]) || []);
      const { data: att } = await supabase.from('site_attachments' as any).select('*').eq('site_id', site.id);
      setAttachments((att as any[]) || []);
    })();
  }, [site.id]);

  const yn = (v?: boolean | null) => v == null ? '—' : v ? 'SÌ' : 'NO';

  return (
    <div className="p-4 space-y-4 text-[13px]">
      <Block title="Pavimento">
        <Row k="Tipologia" v={site.floor_type} />
        <Row k="Marca" v={site.floor_brand} />
        <Row k="Modello" v={site.floor_model} />
        <Row k="Colore" v={site.floor_color} />
        <Row k="Spessore" v={site.floor_thickness} />
        <Row k="MQ da posare" v={site.floor_sqm} />
        <Row k="Lotto" v={site.floor_lot} />
        {site.floor_tech_notes && <Row k="Note tecniche" v={site.floor_tech_notes} />}
      </Block>

      {site.worker_notes && (
        <Block title="Note per gli operai">
          <p className="whitespace-pre-wrap text-[#1E1B4B]">{site.worker_notes}</p>
        </Block>
      )}

      <Block title="Accessori">
        {accessories.length === 0 && <p className="text-[#8C7B6B]">Nessuno.</p>}
        {accessories.map((a) => (
          <div key={a.id} className="flex justify-between border-b last:border-0 py-1">
            <span>{a.product_name || a.type}{a.notes ? ` — ${a.notes}` : ''}</span>
            {a.quantity != null && <span className="font-medium">{a.quantity}{a.unit ? ` ${a.unit}` : ''}</span>}
          </div>
        ))}
      </Block>


      <Block title="Caratteristiche cantiere">
        <Row k="Piano" v={site.building_floor} />
        <Row k="Ascensore" v={yn(site.has_elevator)} />
        <Row k="Accesso" v={site.access_difficulty} />
        <Row k="Parcheggio" v={yn(site.parking_available)} />
        <Row k="Distanza parch." v={site.parking_distance_m ? `${site.parking_distance_m} m` : null} />
        <Row k="ZTL" v={yn(site.ztl_zone)} />
        <Row k="Permessi" v={yn(site.permits_required)} />
        <Row k="Corrente" v={yn(site.electricity_available)} />
        <Row k="Acqua" v={yn(site.water_available)} />
        <Row k="Abitato" v={yn(site.inhabited)} />
        <Row k="Tipo intervento" v={site.construction_type} />
        {site.logistics_notes && <Row k="Note" v={site.logistics_notes} />}
      </Block>

      {attachments.length > 0 && (
        <Block title="Allegati">
          {attachments.map((a) => (
            <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" className="flex justify-between items-center border-b last:border-0 py-2">
              <span className="truncate">{a.category ? `[${a.category}] ` : ''}{a.file_name}</span>
              <span className="text-[#1E1B4B] text-[12px]">Apri</span>
            </a>
          ))}
        </Block>
      )}
    </div>
  );
};

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-[#E5E2DD] p-4">
    <p className="text-[11px] uppercase tracking-wider text-[#8C7B6B] mb-2">{title}</p>
    <div className="space-y-1">{children}</div>
  </div>
);
const Row = ({ k, v }: { k: string; v?: any }) => (
  (v == null || v === '') ? null : (
    <div className="flex justify-between gap-3">
      <span className="text-[#6B6258]">{k}</span>
      <span className="text-[#1E1B4B] font-medium text-right">{String(v)}</span>
    </div>
  )
);

// ============== TAB: Attrezzi (checklist portato/mancante locale) ==============
const AttrezziTab = ({ siteId }: { siteId: string }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const storageKey = `site-equipment-brought:${siteId}`;
  const [brought, setBrought] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_equipment' as any).select('*').eq('site_id', siteId).order('created_at');
      setItems((data as any[]) || []);
      setLoading(false);
    })();
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setBrought(JSON.parse(raw));
    } catch {}
  }, [siteId]);

  const toggle = (id: string) => {
    const next = { ...brought, [id]: !brought[id] };
    setBrought(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-[#1E1B4B]" /></div>;

  return (
    <div className="p-4 space-y-2">
      {items.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258] text-[13px] flex flex-col items-center gap-2">
          <Wrench className="w-8 h-8 text-[#8C7B6B]" /> Nessuna attrezzatura richiesta.
        </div>
      )}
      {items.map((it) => {
        const ok = brought[it.id];
        return (
          <button
            key={it.id}
            onClick={() => toggle(it.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left ${
              ok ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-[#E5E2DD]'
            }`}
          >
            <span className="text-[14px] text-[#1E1B4B] font-medium">{it.type}</span>
            <span className={`text-[12px] px-2 py-1 rounded-md ${ok ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
              {ok ? 'Portato' : 'Mancante'}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ============== TAB: Checklist lavori ==============
const ChecklistTab = ({ siteId, userId }: { siteId: string; userId?: string }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from('site_checklist_items' as any).select('*').eq('site_id', siteId).order('sort_order');
    setItems((data as any[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [siteId]);

  const toggle = async (it: any) => {
    if (!userId) return;
    setBusyId(it.id);
    const patch = it.completed_at
      ? { completed_at: null, completed_by: null }
      : { completed_at: new Date().toISOString(), completed_by: userId };
    const { error } = await supabase.from('site_checklist_items' as any).update(patch).eq('id', it.id);
    if (error) toast.error(error.message);
    else await load();
    setBusyId(null);
  };

  const done = items.filter((i) => i.completed_at).length;
  const progress = items.length ? Math.round((done / items.length) * 100) : 0;

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-[#1E1B4B]" /></div>;

  return (
    <div className="p-4 space-y-3">
      {items.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258] text-[13px] flex flex-col items-center gap-2">
          <ListChecks className="w-8 h-8 text-[#8C7B6B]" /> Nessuna checklist configurata.
        </div>
      )}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-3">
          <div className="flex justify-between text-[12px] text-[#6B6258] mb-1">
            <span>Avanzamento</span><span className="font-semibold text-[#1E1B4B]">{progress}% — {done}/{items.length}</span>
          </div>
          <div className="h-2 rounded-full bg-[#F5F0EA] overflow-hidden">
            <div className="h-full bg-[#16A34A] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => toggle(it)}
            disabled={busyId === it.id}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left ${
              it.completed_at ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-[#E5E2DD]'
            }`}
          >
            {it.completed_at
              ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              : <span className="w-5 h-5 rounded-full border-2 border-[#8C7B6B]/50 flex-shrink-0" />
            }
            <span className={`text-[14px] flex-1 ${it.completed_at ? 'line-through text-[#8C7B6B]' : 'text-[#1E1B4B]'}`}>{it.label}</span>
          </button>
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
    <div className="flex flex-col h-[calc(100vh-300px)] min-h-[400px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && <div className="text-center"><Loader2 className="w-5 h-5 animate-spin inline text-[#1E1B4B]" /></div>}
        {!loading && msgs.length === 0 && (
          <div className="text-center text-[13px] text-[#6B6258] flex flex-col items-center gap-2 pt-8">
            <MessageSquare className="w-8 h-8 text-[#8C7B6B]" /> Nessun messaggio. Inizia tu!
          </div>
        )}
        {msgs.map((m) => {
          const mine = m.user_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-2xl px-3 py-2 ${mine ? 'bg-[#1E1B4B] text-white' : 'bg-white border border-[#E5E2DD] text-[#1E1B4B]'}`}>
                {!mine && m.user_name && <div className="text-[11px] font-medium text-[#8B6F4E] mb-0.5">{m.user_name}</div>}
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
        <button onClick={send} disabled={sending || !text.trim()} className="h-[44px] px-4 rounded-lg bg-[#1E1B4B] text-white disabled:opacity-50">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default OperaioCantiereDetail;
