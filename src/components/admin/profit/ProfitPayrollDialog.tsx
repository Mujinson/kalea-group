import {useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {Dialog,DialogContent,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {toast} from 'sonner';
import type {ProfitData} from './profitData';
export default function ProfitPayrollDialog({data,onClose,onSaved}:{data:ProfitData;onClose:()=>void;onSaved:()=>void}){
 const [worker,setWorker]=useState(''),[month,setMonth]=useState(new Date().toISOString().slice(0,7)),[amount,setAmount]=useState('3997'),[confirmed,setConfirmed]=useState(false),[saving,setSaving]=useState(false);
 const choose=(id:string,m:string)=>{setWorker(id);setMonth(m);const existing=data.payroll.find(p=>p.worker_id===id&&p.month===`${m}-01`);setAmount(String(existing?.amount??3997));setConfirmed(existing?.confirmed??false);};
 const save=async()=>{if(!worker||!month||Number(amount)<0)return toast.error('Controlla operaio, mese e importo');setSaving(true);const {error}=await supabase.from('profit_payroll_months').upsert({worker_id:worker,month:`${month}-01`,amount:Number(amount),confirmed},{onConflict:'worker_id,month'});setSaving(false);if(error)return toast.error(error.message);toast.success('Costo mensile salvato');onSaved();};
 return <Dialog open onOpenChange={o=>{if(!o)onClose();}}><DialogContent><DialogHeader><DialogTitle>Costo mensile operai</DialogTitle></DialogHeader><Label>Operaio</Label><Select value={worker} onValueChange={id=>choose(id,month)}><SelectTrigger><SelectValue placeholder="Seleziona"/></SelectTrigger><SelectContent>{data.workers.map(w=><SelectItem key={w.id} value={w.id}>{w.first_name} {w.last_name}</SelectItem>)}</SelectContent></Select><Label>Mese</Label><Input type="month" value={month} onChange={e=>choose(worker,e.target.value)}/><Label>Costo aziendale fisso (€)</Label><Input type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/><Label className="flex gap-2 items-center"><Checkbox checked={confirmed} onCheckedChange={v=>setConfirmed(v===true)}/>Costo effettivo verificato</Label><Button onClick={save} disabled={saving}>Salva costo mensile</Button></DialogContent></Dialog>;
}
