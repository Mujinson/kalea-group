import {useMemo,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Link} from 'react-router-dom';
import {supabase} from '@/integrations/supabase/client';
import {useRealtimeSubscription} from '@/hooks/useRealtimeSubscription';
import {KpiCard} from '@/components/admin/crm-ui';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Dialog,DialogContent,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {Checkbox} from '@/components/ui/checkbox';
import {AlertTriangle,RefreshCw,Wallet,Plus,Users} from 'lucide-react';
import {toast} from 'sonner';
import {calculateProfit,costOccurrences,money,type CostSource,type ProfitJob} from '@/lib/companyProfit';
import {fmtEur,fmtDateIt} from '@/lib/finance';
import {loadProfitData,PROFIT_TABLES} from './profitData';
import ProfitCostDialog from './ProfitCostDialog';
import ProfitPayrollDialog from './ProfitPayrollDialog';
import {SupplierInvoiceDialog} from '@/components/admin/fornitori/SupplierInvoiceDialog';

export default function CompanyProfitBlock(){
 const now=new Date().toISOString().slice(0,10),[from,setFrom]=useState(`${now.slice(0,4)}-01-01`),[to,setTo]=useState(now),[mode,setMode]=useState('forecast'),[detail,setDetail]=useState(''),[selected,setSelected]=useState<CostSource|null>(null),[job,setJob]=useState<ProfitJob|null>(null),[payrollOpen,setPayrollOpen]=useState(false),[invoiceOpen,setInvoiceOpen]=useState(false);
 const {data,error,isLoading,refetch}=useQuery({queryKey:['company-profit'],queryFn:loadProfitData});
 useRealtimeSubscription({tables:[...PROFIT_TABLES],onDataChange:()=>{void refetch();}});
 const calc=useMemo(()=>{
 if(!data||from>to)return null;
 const period=calculateProfit(data.jobs,data.sources,data.allocations,from,to);
 // Forecast jobs use lifetime costs, not only invoices falling in the filter period.
 const lifetime=calculateProfit(data.jobs,data.sources.filter(s=>!s.frequency||s.frequency==='una_tantum'),data.allocations,'2000-01-01','2100-12-31');
 const forecastRows=lifetime.rows.filter(j=>j.date>=from&&j.date<=to);
 const forecastRevenue=money(forecastRows.reduce((s,j)=>s+j.revenue,0)),forecastCost=money(forecastRows.reduce((s,j)=>s+j.forecastCost,0));
 const bills=data.invoices.filter(i=>i.invoice_date>=from&&i.invoice_date<=to);
 const actualRevenue=money(bills.reduce((s,i)=>s+Number(i.subtotal||0),0));
 const activeMonths:{worker:any;month:string;amount:number;confirmed:boolean}[]=[];
 const cursor=new Date(`${from.slice(0,7)}-01T12:00:00Z`);
 while(cursor.toISOString().slice(0,10)<=to){const m=cursor.toISOString().slice(0,7),end=new Date(Date.UTC(cursor.getUTCFullYear(),cursor.getUTCMonth()+1,0)).toISOString().slice(0,10);
 for(const w of data.workers){const existing=data.payroll.find(p=>p.worker_id===w.id&&p.month===`${m}-01`);if(!existing&&(w.status!=='attivo'||!w.hire_date||w.hire_date>end))continue;
 const amount=existing?Number(existing.amount):3997;
 const occurrence=costOccurrences({key:'payroll',label:'payroll',amount,date:`${m}-01`,frequency:'mensile',category:'labor',verified:true},from,to).find(o=>o.date.slice(0,7)===m);
 if(occurrence)activeMonths.push({worker:w,month:m,amount:occurrence.amount,confirmed:!!existing?.confirmed});}
 cursor.setUTCMonth(cursor.getUTCMonth()+1);}
 const payroll=money(activeMonths.reduce((s,p)=>s+p.amount,0));
 const payrollEvidence=period.costs.filter(c=>['stipendi','contributi_tasse'].includes(c.category));
 const jobLabor=money(period.costs.filter(c=>c.scope==='job').reduce((s,c)=>s+c.labor,0));
 const payrollRecorded=money(payrollEvidence.reduce((s,c)=>s+c.amount,0));
 // Reconciliation is explicit: payroll evidence is displayed separately until marked duplicate of another source.
 // When payroll and existing salary/tax sources coexist, withhold definitive company profit.
 const payrollConflict=payroll>0&&payrollRecorded>0;
 const jobCost=money(period.costs.filter(c=>c.scope==='job'&&!['stipendi','contributi_tasse'].includes(c.category)).reduce((s,c)=>s+c.amount,0));
 const general=money(period.costs.filter(c=>c.scope==='general'&&!['stipendi','contributi_tasse'].includes(c.category)).reduce((s,c)=>s+c.amount,0));
 const companyCost=money(jobCost+general+Math.max(0,payroll-jobLabor)+(payroll===0?payrollRecorded:0));
 const warnings=[...period.warnings];
 if(period.unassigned.length)warnings.push(`${period.unassigned.length} costi da attribuire`);
 if(period.costs.some(c=>!c.verified&&c.scope!=='inventory'))warnings.push('Importi netti da verificare');
 if(activeMonths.some(p=>!p.confirmed))warnings.push('Costo mensile operai stimato');
 if(data.workers.some(w=>w.status==='attivo'&&!w.hire_date))warnings.push('Operai senza data di assunzione: registra il costo mensile');
 if(payrollConflict)warnings.push('Stipendi/contributi e costo mensile operai da riconciliare');
 if(jobLabor>payroll&&payroll>0)warnings.push('Manodopera attribuita superiore al costo mensile');
 if(bills.some(i=>!i.jobKey))warnings.push('Fatture clienti senza lavoro collegato');
 const actualRows=period.rows.map(j=>{const revenue=money(bills.filter(i=>i.jobKey===j.key).reduce((s,i)=>s+Number(i.subtotal||0),0));const costs=period.costs.filter(c=>c.jobKey===j.key&&c.scope==='job');return {...j,revenue,forecastCost:money(costs.reduce((s,c)=>s+c.amount,0)),profit:money(revenue-costs.reduce((s,c)=>s+c.amount,0))};}).filter(j=>j.revenue||j.forecastCost);
 const rowWarnings=forecastRows.some(j=>j.warnings.length>0);
 const forecastProfit=money(forecastRevenue-forecastCost);
 return {period,lifetime,forecastRows,forecastRevenue,forecastCost,forecastProfit,actualRevenue,jobCost,general,payroll,companyCost,actualRows,bills,activeMonths,warnings,rowWarnings,payrollConflict};
 },[data,from,to]);
 const complete=async(j:ProfitJob,checked:boolean)=>{if(!j.quoteId)return;const {error}=await supabase.from('profit_job_closures').upsert({quote_id:j.quoteId,costs_complete:checked,updated_at:new Date().toISOString()});if(error)return toast.error(error.message);toast.success('Chiusura costi aggiornata');void refetch();setJob(null);};
 const snapshot=async(j:ProfitJob)=>{if(!j.quoteId||!data)return;const q=await supabase.from('quotes').select('quote_data').eq('id',j.quoteId).single();if(q.error)return toast.error(q.error.message);const d=(q.data.quote_data||{}) as any;const {error}=await supabase.from('quotes').update({quote_data:{...d,contabilita:{...d.contabilita,snapshot:{...j.estimate,capturedAt:new Date().toISOString()}}}}).eq('id',j.quoteId);if(error)return toast.error(error.message);toast.success('Stima storica confermata');void refetch();setJob(null);};
 if(error)return <section className="space-y-3"><h2 className="text-lg font-semibold">Utile aziendale</h2><p className="text-crm-danger">Dati economici non disponibili: {(error as Error).message}</p><Button variant="outline" onClick={()=>refetch()}>Riprova</Button></section>;
 const rows=mode==='forecast'?calc?.forecastRows||[]:calc?.actualRows||[];
 const profit=mode==='forecast'?calc?.forecastProfit||0:money((calc?.actualRevenue||0)-(calc?.jobCost||0));
 const totalProfit=mode==='forecast'?money(profit-(calc?.general||0)):money((calc?.actualRevenue||0)-(calc?.companyCost||0));
 const incomplete=!calc||calc.warnings.length>0||mode==='forecast'&&calc.rowWarnings;
 return <section className="space-y-4 text-crm-ink">
 <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Utile aziendale</h2><p className="text-xs text-crm-ink-muted">Netto IVA · prima delle imposte sull’utile{incomplete?' · dati incompleti':''}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={()=>setInvoiceOpen(true)}><Plus className="h-4 w-4 mr-1"/>Fattura acquisto</Button><Button variant="outline" size="sm" onClick={()=>setPayrollOpen(true)}><Users className="h-4 w-4 mr-1"/>Costi operai</Button><Button variant="outline" size="icon" title="Aggiorna utili" aria-label="Aggiorna utili" onClick={()=>refetch()}><RefreshCw className="h-4 w-4"/></Button></div></div>
 <div className="flex flex-wrap gap-3 items-end"><Tabs value={mode} onValueChange={setMode}><TabsList className="h-auto flex-wrap"><TabsTrigger value="forecast">Previsione lavori vinti</TabsTrigger><TabsTrigger value="actual">Consuntivo del periodo</TabsTrigger></TabsList></Tabs><div><Label>Dal</Label><Input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></div><div><Label>Al</Label><Input type="date" value={to} onChange={e=>setTo(e.target.value)}/></div></div>
 {from>to&&<p className="text-crm-danger">Intervallo date non valido</p>}
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
 <KpiCard label={mode==='forecast'?'Ricavi netti lavori vinti':'Ricavi netti fatturati'} value={fmtEur(mode==='forecast'?calc?.forecastRevenue:calc?.actualRevenue)} onClick={()=>setDetail('revenue')} loading={isLoading}/>
 <KpiCard label={mode==='forecast'?'Costi previsti aggiornati':'Costi lavori registrati'} value={fmtEur(mode==='forecast'?calc?.forecastCost:calc?.jobCost)} onClick={()=>setDetail('costs')} loading={isLoading}/>
 <KpiCard label="Utile medio per lavoro" value={fmtEur(rows.length?profit/rows.length:0)} hint={`${rows.length} lavori · ${((mode==='forecast'?calc?.forecastRevenue:calc?.actualRevenue)?profit/Number(mode==='forecast'?calc?.forecastRevenue:calc?.actualRevenue)*100:0).toFixed(1)}% margine`} tone={profit<0?'danger':'success'} onClick={()=>setDetail('jobs')} loading={isLoading}/>
 <KpiCard label={mode==='forecast'?'Utile totale previsto':'Utile gestionale totale'} value={calc?.payrollConflict&&mode==='actual'?'Da riconciliare':fmtEur(totalProfit)} hint={mode==='forecast'?'Dopo spese generali · manodopera prevista nei lavori':incomplete?'Provvisorio · verifiche aperte':'Dopo spese generali e costo mensile operai'} tone={totalProfit<0?'danger':'success'} onClick={()=>setDetail('company')} loading={isLoading} icon={<Wallet className="w-4 h-4"/>}/>
 </div>
 {calc&&<div className="flex flex-wrap gap-3 text-xs text-crm-ink-muted"><Button variant="link" size="sm" onClick={()=>setDetail('company')}>Spese generali {fmtEur(calc.general)}</Button><Button variant="link" size="sm" onClick={()=>setPayrollOpen(true)}>Costo mensile operai {fmtEur(calc.payroll)}</Button><Button variant="link" size="sm" onClick={()=>setDetail('sources')}>Costi da attribuire {fmtEur(calc.period.unassigned.reduce((s,c)=>s+c.amount,0))}</Button></div>}
 {calc&&(calc.warnings.length>0||calc.rowWarnings)&&<div className="border-l-2 border-crm-warning bg-crm-warning-soft p-3 text-sm flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0 text-crm-warning mt-0.5"/><div className="min-w-0">{Array.from(new Set([...calc.warnings,...(mode==='forecast'&&calc.rowWarnings?['Lavori con costi previsti incompleti o non definitivi']:[])])).map(w=><p key={w} className="break-words">{w}</p>)}</div></div>}
 <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-crm-ink-muted text-xs border-b border-crm-border"><tr><th className="p-3 text-left">Lavoro</th><th className="p-3 text-right">Ricavo netto</th><th className="p-3 text-right">Previsto iniziale</th><th className="p-3 text-right">Costi registrati</th><th className="p-3 text-right">Utile {mode==='forecast'?'previsto':'registrato'}</th><th className="p-3 text-right">Margine</th></tr></thead><tbody>{rows.map(j=><tr key={j.key} className="border-b border-crm-border"><td className="p-3 min-w-48"><Button variant="link" className="p-0 h-auto text-left whitespace-normal" onClick={()=>setJob(j)}>{j.label}</Button><p className="text-xs text-crm-ink-muted">{j.complete?'Costi chiusi':j.warnings[0]||'Provvisorio'}</p></td><td className="p-3 text-right whitespace-nowrap">{fmtEur(j.revenue)}</td><td className="p-3 text-right whitespace-nowrap">{fmtEur(j.estimate.total)}</td><td className="p-3 text-right whitespace-nowrap">{fmtEur(j.actual)}</td><td className={`p-3 text-right whitespace-nowrap font-semibold ${j.profit<0?'text-crm-danger':'text-crm-success'}`}>{fmtEur(j.profit)}</td><td className="p-3 text-right">{j.revenue?(j.profit/j.revenue*100).toFixed(1):'—'}%</td></tr>)}</tbody></table>{!rows.length&&!isLoading&&<p className="py-6 text-sm text-crm-ink-muted">Nessun lavoro nel periodo</p>}</div>
 <Button variant="outline" onClick={()=>setDetail('sources')}>Attribuzione e riconciliazione costi</Button>
 {detail&&data&&calc&&<Dialog open onOpenChange={o=>{if(!o)setDetail('');}}><DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{{revenue:'Ricavi netti',costs:'Costi dei lavori',company:'Utile aziendale · dettaglio',jobs:'Utile per lavoro',sources:'Attribuzione e riconciliazione costi'}[detail]}</DialogTitle></DialogHeader>
 {detail==='company'&&<div className="space-y-2 text-sm"><p>Ricavi {fmtEur(mode==='forecast'?calc.forecastRevenue:calc.actualRevenue)}</p><p>Costi lavori {fmtEur(mode==='forecast'?calc.forecastCost:calc.jobCost)}</p><p>Spese generali {fmtEur(calc.general)}</p>{mode==='actual'&&<p>Costo mensile operai {fmtEur(calc.payroll)} · la manodopera già attribuita ai lavori non viene sottratta due volte</p>}<p className="font-semibold">{calc.payrollConflict&&mode==='actual'?'Totale sospeso: riconciliare stipendi e contributi':`Utile ${fmtEur(totalProfit)}${incomplete?' · provvisorio':''}`}</p><Button variant="outline" onClick={()=>setDetail('sources')}>Verifica costi</Button></div>}
 {detail==='revenue'&&(mode==='forecast'?rows.map(j=><div key={j.key} className="flex justify-between gap-3 border-b border-crm-border p-2 text-sm"><span>{j.label}</span><span>{fmtEur(j.revenue)}</span></div>):calc.bills.map(i=><div key={i.id} className="flex justify-between gap-3 border-b border-crm-border p-2 text-sm"><span>Fattura {i.invoice_number} · {fmtDateIt(i.invoice_date)}</span><span>{fmtEur(i.subtotal)}</span></div>))}
 {(detail==='sources'||detail==='costs'||detail==='company')&&<div className="space-y-1">{data.sources.filter(s=>detail==='sources'||calc.period.costs.some(c=>c.key===s.key)).map(s=><div key={s.key} className="flex flex-wrap items-center gap-3 border-b border-crm-border py-2 text-sm"><div className="flex-1 min-w-40"><p>{s.label}</p><p className="text-xs text-crm-ink-muted">{fmtDateIt(s.date)} · {s.frequency&&s.frequency!=='una_tantum'?s.frequency+' · ':''}{data.allocations.filter(a=>a.source_key===s.key).length?'Attribuito / riconciliato':s.scope==='general'?'Spesa generale':s.jobKey?'Collegato al lavoro':'Da attribuire'}</p></div><span>{fmtEur(s.amount)}</span><Button variant="outline" size="sm" onClick={()=>setSelected(s)}>Attribuisci</Button></div>)}</div>}
 {detail==='jobs'&&rows.map(j=><Button variant="ghost" className="w-full justify-between h-auto whitespace-normal" key={j.key} onClick={()=>setJob(j)}><span>{j.label}</span><span>{fmtEur(j.profit)}</span></Button>)}
 <div className="flex flex-wrap gap-3"><Link className="text-sm text-crm-primary" to="/admin/costi">Costi generali</Link><Link className="text-sm text-crm-primary" to="/admin/fornitori">Fornitori</Link></div>
 </DialogContent></Dialog>}
 {job&&data&&calc&&<Dialog open onOpenChange={o=>{if(!o)setJob(null);}}><DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{job.label}</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-3 text-sm"><p>Netto concordato {fmtEur(data.jobs.find(j=>j.key===job.key)?.revenue)}</p><p>Costi previsti {fmtEur(job.estimate.total)}</p><p>Costi registrati {fmtEur(job.actual)}</p><p>Quota prevista sostituita {fmtEur(job.replacement)}</p><p>Utile {fmtEur(job.profit)}</p></div>{job.warnings.map(w=><p key={w} className="text-sm text-crm-warning">{w}</p>)}
 {(mode==='forecast'?calc.lifetime:calc.period).costs.filter(c=>c.jobKey===job.key).map((c,i)=><div key={`${c.key}-${i}`} className="flex items-center gap-3 border-b border-crm-border py-2 text-sm"><span className="flex-1">{c.label} · {fmtDateIt(c.date)}</span><span>{fmtEur(c.amount)}</span><Button variant="outline" size="sm" onClick={()=>{const s=data.sources.find(s=>s.key===c.key);if(s)setSelected(s);}}>Verifica</Button></div>)}
 {job.quoteId&&<><Label className="flex items-center gap-2"><Checkbox checked={job.complete} onCheckedChange={v=>complete(job,v===true)}/>Tutti i costi del lavoro sono stati registrati</Label>{!job.estimate.capturedAt&&<Button variant="outline" onClick={()=>snapshot(job)}>Conferma e fissa la stima storica</Button>}<Link className="text-crm-primary text-sm" to={`/admin/preventivi/modifica?edit=${job.quoteId}`}>Apri preventivo e contabilità interna</Link></>}
 </DialogContent></Dialog>}
 {selected&&data&&<ProfitCostDialog key={selected.key} source={selected} sources={data.sources} jobs={data.jobs} allocations={data.allocations} onClose={()=>setSelected(null)} onSaved={()=>{void refetch();}}/>}
 {payrollOpen&&data&&<ProfitPayrollDialog data={data} onClose={()=>setPayrollOpen(false)} onSaved={()=>{void refetch();}}/>}
 <SupplierInvoiceDialog open={invoiceOpen} onOpenChange={o=>{setInvoiceOpen(o);if(!o)void refetch();}}/>
 </section>;
}
