import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Download, Trash2, Pencil, FileText, AlertTriangle } from 'lucide-react';
import { DOC_CATEGORIES, expiryStatus, type ExpiryStatus } from '@/lib/companyDocuments';

type Doc = {
  id: string; category: string; doc_type: string | null; title: string; worker_id: string | null;
  issuer: string | null; document_number: string | null; issue_date: string | null; expiry_date: string | null;
  file_path: string | null; file_name: string | null; notes: string | null; created_at: string;
};
const EMPTY = { category: 'societari', doc_type: '', title: '', worker_id: '', issuer: '', document_number: '', issue_date: '', expiry_date: '', notes: '' };
const STATUS: Record<ExpiryStatus, { label: string; cls: string }> = {
  none: { label: 'Senza scadenza', cls: 'bg-muted text-muted-foreground' },
  valid: { label: 'Valido', cls: 'bg-emerald-100 text-emerald-800' },
  expiring: { label: 'In scadenza', cls: 'bg-amber-100 text-amber-800' },
  expired: { label: 'Scaduto', cls: 'bg-red-100 text-red-800' },
};
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('it-IT') : '—');

export default function AdminDocumenti() {
  const { isAdmin, loading } = useAdminAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [workers, setWorkers] = useState<{ id: string; name: string }[]>([]);
  const [cat, setCat] = useState<string>('all');
  const [statusF, setStatusF] = useState<string>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from('company_documents').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message); else setDocs((data || []) as Doc[]);
  };
  useEffect(() => {
    if (!isAdmin) return;
    load();
    supabase.from('workers' as any).select('*').then(({ data }) => setWorkers(((data || []) as any[]).map((w) => ({ id: w.id, name: w.full_name || [w.first_name, w.last_name].filter(Boolean).join(' ') || w.name || 'Operaio' }))));
  }, [isAdmin]);

  const workerName = (id: string | null) => workers.find((w) => w.id === id)?.name;
  const filtered = useMemo(() => docs.filter((d) =>
    (cat === 'all' || d.category === cat) &&
    (statusF === 'all' || expiryStatus(d.expiry_date) === statusF) &&
    (!q || [d.title, d.doc_type, d.issuer, d.document_number, workerName(d.worker_id)].join(' ').toLowerCase().includes(q.toLowerCase()))
  ), [docs, cat, statusF, q, workers]);
  const counts = useMemo(() => {
    const c = { expired: 0, expiring: 0 };
    docs.forEach((d) => { const s = expiryStatus(d.expiry_date); if (s === 'expired') c.expired++; if (s === 'expiring') c.expiring++; });
    return c;
  }, [docs]);

  if (loading) return null;
  if (!isAdmin) return <div className="p-8 text-muted-foreground">Accesso riservato agli amministratori.</div>;

  const openNew = () => { setEditId(null); setForm({ ...EMPTY, category: cat === 'all' ? 'societari' : cat }); setFile(null); setOpen(true); };
  const openEdit = (d: Doc) => {
    setEditId(d.id); setFile(null);
    setForm({ category: d.category, doc_type: d.doc_type || '', title: d.title, worker_id: d.worker_id || '', issuer: d.issuer || '', document_number: d.document_number || '', issue_date: d.issue_date || '', expiry_date: d.expiry_date || '', notes: d.notes || '' });
    setOpen(true);
  };

  const save = async () => {
    const title = form.title.trim() || form.doc_type.trim();
    if (!title) return toast.error('Inserisci un titolo o scegli il tipo di documento');
    if (!editId && !file) return toast.error('Carica il file del documento');
    setSaving(true);
    try {
      let fileFields: { file_path?: string; file_name?: string } = {};
      if (file) {
        const path = `${form.category}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, '_')}`;
        const { error } = await supabase.storage.from('company-documents').upload(path, file);
        if (error) throw error;
        fileFields = { file_path: path, file_name: file.name };
      }
      const row = {
        category: form.category, doc_type: form.doc_type || null, title, worker_id: form.worker_id || null,
        issuer: form.issuer || null, document_number: form.document_number || null,
        issue_date: form.issue_date || null, expiry_date: form.expiry_date || null, notes: form.notes || null, ...fileFields,
      };
      const old = editId ? docs.find((d) => d.id === editId) : null;
      const { error } = editId
        ? await supabase.from('company_documents').update(row).eq('id', editId)
        : await supabase.from('company_documents').insert(row);
      if (error) throw error;
      if (old?.file_path && fileFields.file_path) await supabase.storage.from('company-documents').remove([old.file_path]);
      toast.success('Documento salvato');
      setOpen(false); load();
    } catch (e: any) { toast.error(e.message || 'Errore'); }
    finally { setSaving(false); }
  };

  const download = async (d: Doc) => {
    if (!d.file_path) return;
    const { data, error } = await supabase.storage.from('company-documents').createSignedUrl(d.file_path, 120);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, '_blank');
  };
  const remove = async (d: Doc) => {
    if (!confirm(`Eliminare "${d.title}"?`)) return;
    if (d.file_path) await supabase.storage.from('company-documents').remove([d.file_path]);
    const { error } = await supabase.from('company_documents').delete().eq('id', d.id);
    if (error) return toast.error(error.message);
    toast.success('Documento eliminato'); load();
  };

  const curCat = DOC_CATEGORIES.find((c) => c.key === form.category);
  const catLabel = (k: string) => DOC_CATEGORIES.find((c) => c.key === k)?.label || k;
  const personal = form.category === 'formazione' || form.category === 'sanitari';

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Documenti aziendali</h1>
          <p className="text-sm text-muted-foreground">Visure, DURC, DVR, certificazioni, corsi, visite mediche e altro, con scadenze.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Carica documento</Button>
      </div>

      {(counts.expired > 0 || counts.expiring > 0) && (
        <div className="flex flex-wrap gap-3">
          {counts.expired > 0 && <button onClick={() => setStatusF('expired')} className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"><AlertTriangle className="h-4 w-4" />{counts.expired} scaduti</button>}
          {counts.expiring > 0 && <button onClick={() => setStatusF('expiring')} className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800"><AlertTriangle className="h-4 w-4" />{counts.expiring} in scadenza entro 30 giorni</button>}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={cat === 'all' ? 'default' : 'outline'} onClick={() => setCat('all')}>Tutti ({docs.length})</Button>
        {DOC_CATEGORIES.map((c) => (
          <Button key={c.key} size="sm" variant={cat === c.key ? 'default' : 'outline'} onClick={() => setCat(c.key)}>
            {c.label} ({docs.filter((d) => d.category === c.key).length})
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Cerca per nome, ente, numero, operaio…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="expired">Scaduti</SelectItem>
            <SelectItem value="expiring">In scadenza</SelectItem>
            <SelectItem value="valid">Validi</SelectItem>
            <SelectItem value="none">Senza scadenza</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-3">Documento</th><th className="p-3">Categoria</th><th className="p-3">Intestato a</th><th className="p-3">Rilascio</th><th className="p-3">Scadenza</th><th className="p-3">Stato</th><th className="p-3 text-right">Azioni</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nessun documento. Premi "Carica documento" per iniziare.</td></tr>}
            {filtered.map((d) => {
              const s = STATUS[expiryStatus(d.expiry_date)];
              return (
                <tr key={d.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-start gap-2"><FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div><div className="font-medium">{d.title}</div>
                        <div className="text-xs text-muted-foreground">{[d.doc_type !== d.title ? d.doc_type : null, d.issuer, d.document_number && `n. ${d.document_number}`].filter(Boolean).join(' · ')}</div></div></div>
                  </td>
                  <td className="p-3">{catLabel(d.category)}</td>
                  <td className="p-3">{workerName(d.worker_id) || 'Azienda'}</td>
                  <td className="p-3">{fmt(d.issue_date)}</td>
                  <td className="p-3">{fmt(d.expiry_date)}</td>
                  <td className="p-3"><Badge className={s.cls} variant="outline">{s.label}</Badge></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" onClick={() => download(d)} disabled={!d.file_path} title="Apri"><Download className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(d)} title="Modifica"><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(d)} title="Elimina"><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Modifica documento' : 'Carica documento'}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v, doc_type: '' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DOC_CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label>Tipo</Label>
                {curCat && curCat.types.length > 0 ? (
                  <Select value={form.doc_type || undefined} onValueChange={(v) => setForm({ ...form, doc_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Scegli…" /></SelectTrigger>
                    <SelectContent>{curCat.types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                ) : <Input value={form.doc_type} onChange={(e) => setForm({ ...form, doc_type: e.target.value })} />}
              </div>
            </div>
            <div><Label>Titolo</Label><Input placeholder={form.doc_type || 'Es. Visura camerale 2026'} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Intestato a {personal && <span className="text-muted-foreground">(operaio)</span>}</Label>
              <Select value={form.worker_id || 'company'} onValueChange={(v) => setForm({ ...form, worker_id: v === 'company' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="company">Azienda</SelectItem>{workers.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Ente / rilasciato da</Label><Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} /></div>
              <div><Label>Numero / protocollo</Label><Input value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} /></div>
              <div><Label>Data rilascio</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
              <div><Label>Data scadenza</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
            </div>
            <div><Label>File {editId && <span className="text-muted-foreground">(lascia vuoto per mantenere quello attuale)</span>}</Label>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
            <div><Label>Note</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={save} disabled={saving}>{saving ? 'Salvataggio…' : 'Salva'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
