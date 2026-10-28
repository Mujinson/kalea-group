import {useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {Dialog,DialogContent,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {toast} from 'sonner';
import {fmtEur} from '@/lib/finance';
import type {ProfitJob} from '@/lib/companyProfit';
export default function ProfitGenericCostDialog({jobs,onClose,onSaved}:{jobs:ProfitJob[];onClose:()=>void;onSaved:()=>void}){
 const [description,setDescription]=useState(''),[net,setNet]=useState(''),[vat,setVat]=useState('22'),[date,setDate]=useState(new Date().toISOString().slice(0,10)),[scope,setScope]=useState('general'),[job,setJob]=useState(''),[saving,setSaving]=useState(false);
 const save=async()=>{if(!description.trim()||Number(net)<=0||!date||scope==='job'&&!job)return toast.error('Completa descrizione, netto e destinazione');setSaving(true);
 const j=jobs.find(j=>j.key===job);
 const {data,error}=await supabase.from('variable_costs').insert({description:description.trim(),amount:Number(net),category:'altri',cost_date:date,frequency:'una_tantum',notes:`IVA ${vat}%: ${(Number(net)*Number(vat)/100).toFixed(2)} € · registrato al netto`}).select('id').single();
 if(error){setSaving(false);return toast.error(error.message);}
 const allocated=await supabase.from('profit_cost_allocations').insert({source_key:`variable:${data.id}`,scope,quote_id:j?.quoteId,sale_id:j?.saleId,amount:Number(net),competence_date:date,category:'other',net_verified:true});setSaving(false);
 if(allocated.error){toast.error('Costo salvato, attribuzione da completare: '+allocated.error.message);onSaved();return;}
 toast.success('Spesa registrata');onSaved();onClose();};
 return <Dialog open onOpenChange={o=>{if(!o)onClose();}}><DialogContent><DialogHeader><DialogTitle>Nuova spesa</DialogTitle></DialogHeader><Label>Descrizione</Label><Input value={description} onChange={e=>setDescription(e.target.value)}/><div className="grid grid-cols-2 gap-3"><div><Label>Netto (€)</Label><Input type="number" min="0" step="0.01" value={net} onChange={e=>setNet(e.target.value)}/></div><div><Label>IVA %</Label><Input type="number" min="0" max="100" value={vat} onChange={e=>setVat(e.target.value)}/></div></div><p className="text-sm">Lordo {fmtEur(Number(net)*(1+Number(vat)/100))}</p><Label>Competenza</Label><Input type="date" value={date} onChange={e=>setDate(e.target.value)}/><Label>Destinazione</Label><Select value={scope} onValueChange={setScope}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="general">Spesa generale azienda</SelectItem><SelectItem value="job">Lavoro</SelectItem><SelectItem value="inventory">Magazzino</SelectItem></SelectContent></Select>{scope==='job'&&<Select value={job} onValueChange={setJob}><SelectTrigger><SelectValue placeholder="Seleziona lavoro"/></SelectTrigger><SelectContent>{jobs.map(j=><SelectItem key={j.key} value={j.key}>{j.label}</SelectItem>)}</SelectContent></Select>}<Button disabled={saving} onClick={save}>Salva spesa</Button></DialogContent></Dialog>;
}
