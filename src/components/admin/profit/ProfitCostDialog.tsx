import {useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {Dialog,DialogContent,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select,SelectTrigger,SelectContent,SelectValue,SelectItem} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {Trash2,Plus} from 'lucide-react';
import {toast} from 'sonner';
import {fmtEur} from '@/lib/finance';
import type {CostSource,ProfitJob,Allocation} from '@/lib/companyProfit';
export default function ProfitCostDialog({source,sources,jobs,allocations,onClose,onSaved}:{source:CostSource;sources:CostSource[];jobs:ProfitJob[];allocations:Allocation[];onClose:()=>void;onSaved:()=>void}){
 const existing=allocations.filter(a=>a.source_key===source.key);
 const remaining=Math.max(0,source.amount-existing.reduce((s,a)=>s+Number(a.amount),0));
 const [scope,setScope]=useState('job'),[job,setJob]=useState(source.jobKey||''),[category,setCategory]=useState(source.category),[amount,setAmount]=useState(String(remaining)),[replacement,setReplacement]=useState('0'),[date,setDate]=useState(source.date),[duplicate,setDuplicate]=useState(''),[verified,setVerified]=useState(source.verified),[note,setNote]=useState(''),[saving,setSaving]=useState(false);
 const save=async()=>{
 const j=jobs.find(j=>j.key===job); if(!Number(amount)||Number(amount)>remaining+0.01)return toast.error('Importo oltre il residuo disponibile');
 if(scope==='job'&&!j)return toast.error('Seleziona il lavoro');if(scope==='duplicate'&&!duplicate)return toast.error('Seleziona il costo già registrato');
 if(!date)return toast.error('Inserisci la data di competenza');
 if(scope==='duplicate'&&(existing.length>0||Number(amount)!==source.amount))return toast.error('Riconcilia l’intero documento senza altre attribuzioni');
 setSaving(true);const {error}=await supabase.from('profit_cost_allocations').insert({source_key:source.key,scope,quote_id:scope==='job'?j?.quoteId:null,sale_id:scope==='job'?j?.saleId:null,category,amount:Number(amount),replaced_estimate:scope==='job'?Number(replacement):0,competence_date:date,duplicate_of:scope==='duplicate'?duplicate:null,net_verified:verified,note});setSaving(false);
 if(error)return toast.error(error.message);toast.success('Costo attribuito');onSaved();setAmount('0');
 };
 const remove=async(id?:string)=>{if(!id)return;const {error}=await supabase.from('profit_cost_allocations').delete().eq('id',id);if(error)return toast.error(error.message);onSaved();};
 return <Dialog open onOpenChange={open=>{if(!open)onClose();}}><DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{source.label}</DialogTitle></DialogHeader>
 <div className="flex flex-wrap gap-4 text-sm"><span>Netto {fmtEur(source.amount)}</span><span>Da attribuire {fmtEur(remaining)}</span></div>
 <div className="space-y-2">{existing.map(a=><div key={a.id} className="flex items-center gap-3 border-b border-crm-border py-2 text-sm"><span className="flex-1 break-words">{a.scope==='job'?jobs.find(j=>j.quoteId===a.quote_id||j.saleId===a.sale_id)?.label||'Lavoro':a.scope==='inventory'?'Magazzino':a.scope==='duplicate'?'Già registrato':'Spesa generale'} · {fmtEur(a.amount)}{a.replaced_estimate>0?` · quota prevista sostituita ${fmtEur(a.replaced_estimate)}`:''}</span><Button variant="ghost" size="icon" aria-label="Rimuovi attribuzione" title="Rimuovi attribuzione" onClick={()=>remove(a.id)}><Trash2 className="h-4 w-4"/></Button></div>)}</div>
 <div className="grid gap-3 sm:grid-cols-2">
 <div><Label>Destinazione</Label><Select value={scope} onValueChange={setScope}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="job">Lavoro</SelectItem><SelectItem value="general">Spesa generale</SelectItem><SelectItem value="inventory">Magazzino</SelectItem><SelectItem value="duplicate">Costo già registrato</SelectItem><SelectItem value="payroll_evidence">Incluso nel costo mensile operai</SelectItem></SelectContent></Select></div>
 {scope==='job'&&<div><Label>Lavoro</Label><Select value={job} onValueChange={setJob}><SelectTrigger><SelectValue placeholder="Seleziona"/></SelectTrigger><SelectContent>{jobs.map(j=><SelectItem key={j.key} value={j.key}>{j.label}</SelectItem>)}</SelectContent></Select></div>}
 {scope==='duplicate'&&<div><Label>Costo originale / giustificativo</Label><Select value={duplicate} onValueChange={setDuplicate}><SelectTrigger><SelectValue placeholder="Seleziona"/></SelectTrigger><SelectContent>{sources.filter(s=>s.key!==source.key&&!allocations.some(a=>a.source_key===s.key&&a.scope==='duplicate')).map(s=><SelectItem key={s.key} value={s.key}>{s.label} · {fmtEur(s.amount)}</SelectItem>)}</SelectContent></Select></div>}
 <div><Label>Quota netta (€)</Label><Input type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/></div>
 <div><Label>Competenza</Label><Input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
 <div><Label>Categoria</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Array.from(new Set([category,'materials','labor','fuel','tolls','meals','hotel','other','stipendi','contributi_tasse'])).map(c=><SelectItem key={c} value={c}>{{materials:'Materiali',labor:'Manodopera',fuel:'Gasolio',tolls:'Pedaggi',meals:'Pasti',hotel:'Albergo',other:'Altri',stipendi:'Stipendi',contributi_tasse:'Contributi e tasse'}[c]||c}</SelectItem>)}</SelectContent></Select></div>
 {scope==='job'&&<div><Label>Quota preventivata sostituita (€)</Label><Input type="number" min="0" step="0.01" value={replacement} onChange={e=>setReplacement(e.target.value)}/></div>}
 <div className="sm:col-span-2"><Label>Note</Label><Input value={note} onChange={e=>setNote(e.target.value)}/></div>
 <Label className="flex gap-2 items-center sm:col-span-2"><Checkbox checked={verified} onCheckedChange={v=>setVerified(v===true)}/>Importo netto verificato</Label>
 </div><Button disabled={saving||remaining<=0} onClick={save}><Plus className="w-4 h-4 mr-2"/>Aggiungi attribuzione</Button>
 </DialogContent></Dialog>;
}
