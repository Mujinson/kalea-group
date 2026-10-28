import { isQuoteWon } from './quoteStatus';
import { computeAccounting, DEFAULT_EXTRAS, type AccRow } from './quoteAccounting';
import { computeCrew, DEFAULT_CREW_SETTINGS } from './crewCosts';

export const money = (v: unknown) => Math.round((Number(v) || 0) * 100) / 100;
export type Estimate = { total: number; labor: number; known: boolean; capturedAt?: string };
export function accountingSnapshot(rows: AccRow[], extras: any, discount: number, trip: any, settings: any): Estimate {
 const crew = trip?.enabled ? computeCrew({ days: 1, workers: 1, vans: 1, ...trip }, settings || DEFAULT_CREW_SETTINGS) : null;
 const acc = computeAccounting(rows, { ...DEFAULT_EXTRAS, ...extras }, discount, 0, crew?.total || 0);
 return { total: money(acc.totalCost), labor: money(crew?.labor || 0), known: rows.length > 0 && rows.every(r => r.supplierPrice > 0) && acc.totalCost > 0, capturedAt: new Date().toISOString() };
}
export function legacyEstimate(q: any, products: any[], settings: any): Estimate {
 const d = q.quote_data || {}, a = d.contabilita || {}, c = d.calc || {};
 if (a.snapshot) return a.snapshot;
 const rows: AccRow[] = [];
 const push = (key: string, qta: number, cost: number, client: number) => { if(qta > 0) rows.push({key,desc:key,qta,unita:'',supplierPrice:cost,supplierDiscountPct:0,clientUnit:client,...a.overrides?.[key]}); };
 if(d.prodotto) push('mat', Number(c.mqOrd || 0), Number(c.costoMatMq || 0), 0);
 if(c.costoPosaTot) push('posa', 1, Number(c.costoPosaTot), 0);
 if(c.costoTappTot) push('tapp', 1, Number(c.costoTappTot), 0);
 if(c.costoTrasporto) push('trasp', 1, Number(c.costoTrasporto), 0);
 if(c.costoTrasfertaTot) push('trasf', 1, Number(c.costoTrasfertaTot), 0);
 (d.righeMat || []).filter((r: any)=>!r.__adjustment).forEach((r: any)=>push(`rm-${r.id}`,Number(r.qta||0)*(1+Number(r.sfridoPct||0)/100),Number(r.costoUn||0),0));
 (d.wcSel?.accessories||[]).forEach((r: any,i:number)=>push(`wca-${i}`,Number(r.qta||0),Number(r.costoUn||0),0));
 ['articoli','accessori','servizi'].forEach(kind=>(d.catalog?.[kind]||[]).forEach((l:any)=>{
 const p=products.find(p=>p.id===l.catalog_id);
 rows.push({key:`cat-${l.id}`,desc:l.name,qta:Number(l.quantity||0),unita:l.unit,supplierPrice:Number(p?.list_price||p?.net_cost||p?.purchase_price||0),supplierDiscountPct:p?.list_price?Number(p.supplier_discount_percentage||0):0,clientUnit:Number(l.unit_price||0)*(1-Number(l.discount_pct||0)/100),...a.overrides?.[`cat-${l.id}`]});
 }));
 // Reward must use the accepted net, not the incomplete line reconstruction.
 const extras = {...DEFAULT_EXTRAS,...a.extras,rewardEnabled:false};
 const s=accountingSnapshot(rows,extras,Number(d.sconto||0),a.crewTrip,settings);
 s.total=money(s.total+(a.extras?.rewardEnabled?Number(c.prezzoNetto||0)*Number(a.extras.rewardPct||0)/100:0));
 delete s.capturedAt;
 return s;
}
export type CostSource={ key:string; label:string; amount:number; date:string; jobKey?:string; category:string; verified:boolean; frequency?:string; scope?:string; labor?:number };
export type Allocation={id?:string;source_key:string;scope:string;quote_id?:string|null;sale_id?:string|null;category:string;amount:number;replaced_estimate:number;competence_date:string;duplicate_of?:string|null;net_verified:boolean;note?:string|null};
export type ProfitJob={key:string;quoteId?:string;saleId?:string;label:string;date:string;revenue:number;estimate:Estimate;complete:boolean;actual:number;replacement:number;forecastCost:number;profit:number;warnings:string[]};
export function buildJobs(quotes:any[],sales:any[],products:any[],settings:any,closures:any[]):ProfitJob[]{
 const out:ProfitJob[]=[]; const usedSales=new Set<string>();
 for(const q of quotes.filter(q=>isQuoteWon(q.status))){
 const sale=sales.find(s=>s.quote_id===q.id||s.id===q.converted_sale_id); if(sale)usedSales.add(sale.id);
 const net=q.quote_data?.calc?.prezzoNetto;
 const revenue=net!=null?money(net):q.total_amount!=null&&q.vat_amount!=null?money(q.total_amount-q.vat_amount):0;
 out.push({key:`quote:${q.id}`,quoteId:q.id,saleId:sale?.id,label:[q.quote_number,q.quote_data?.cliente?.nome||q.customer_name||q.title].filter(Boolean).join(' · '),date:(q.accepted_date||q.created_at||'').slice(0,10),revenue,estimate:legacyEstimate(q,products,settings),complete:closures.some(c=>c.quote_id===q.id&&c.costs_complete),actual:0,replacement:0,forecastCost:0,profit:0,warnings:net==null?['Netto da verificare']:[]});
 }
 for(const s of sales){if(usedSales.has(s.id))continue;out.push({key:`sale:${s.id}`,saleId:s.id,label:s.customer_name||'Vendita',date:(s.sale_date||s.created_at||'').slice(0,10),revenue:money(s.subtotal_amount),estimate:{total:0,labor:0,known:false},complete:false,actual:0,replacement:0,forecastCost:0,profit:0,warnings:['Vendita senza collegamento: verificare eventuale doppione']});}
 return out;
}
export function costOccurrences(source:CostSource,from:string,to:string):{date:string;amount:number}[]{
 const months:Record<string,number>={mensile:1,trimestrale:3,semestrale:6,annuale:12};
 const interval=months[source.frequency||''];
 if(!interval)return source.date>=from&&source.date<=to?[{date:source.date,amount:source.amount}]:[];
 // Monthly competence, spreading quarterly/yearly expenses over their covered months.
 const start=new Date(`${source.date.slice(0,7)}-01T12:00:00Z`), end=new Date(`${to}T23:59:59Z`), result=[];
 if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime()))return [];
 const cursor=new Date(start);
 while(cursor<=end){const y=cursor.getUTCFullYear(),m=cursor.getUTCMonth();const first=new Date(Date.UTC(y,m,1)),last=new Date(Date.UTC(y,m+1,0));
 const f=new Date(`${from}T00:00:00Z`),t=new Date(`${to}T00:00:00Z`);
 const a=Math.max(first.getTime(),f.getTime()),b=Math.min(last.getTime(),t.getTime());
 if(b>=a){const days=Math.round((b-a)/86400000)+1;result.push({date:new Date(a).toISOString().slice(0,10),amount:money(source.amount/interval*days/last.getUTCDate())});}
 cursor.setUTCMonth(cursor.getUTCMonth()+1);}
 return result;
}
export function calculateProfit(jobs:ProfitJob[],sources:CostSource[],allocations:Allocation[],from:string,to:string){
 const rows=jobs.map(j=>({...j,warnings:[...j.warnings]})); const costs:{key:string;label:string;amount:number;date:string;scope:string;jobKey?:string;category:string;verified:boolean;replacement:number;labor:number}[]=[];
 const sourceKeys=new Set(sources.map(s=>s.key)); const warnings:string[]=[];
 for(const source of sources){
 const alloc=allocations.filter(a=>a.source_key===source.key);
 if(alloc.some(a=>a.scope==='duplicate')){const target=alloc.find(a=>a.scope==='duplicate')?.duplicate_of;if(target&&sourceKeys.has(target))continue;warnings.push(`${source.label}: giustificativo collegato a una fonte mancante`);}
 const total=money(alloc.filter(a=>a.scope!=='duplicate').reduce((s,a)=>s+money(a.amount),0));
 if(total>source.amount+0.01)warnings.push(`${source.label}: ripartizione superiore al costo aggiornato`);
 for(const a of alloc.filter(a=>a.scope!=='duplicate')){
 const job=rows.find(j=>a.quote_id===j.quoteId&&a.quote_id||a.sale_id===j.saleId&&a.sale_id);
 const share={...source,amount:money(a.amount),date:a.competence_date};
 for(const occurrence of costOccurrences(share,from,to))costs.push({...occurrence,key:source.key,label:source.label,scope:a.scope,jobKey:job?.key,category:a.category,verified:a.net_verified,replacement:money(a.replaced_estimate),labor:a.category==='labor'?occurrence.amount:money((source.labor||0)*(a.amount/source.amount))});
 }
 const remaining=Math.max(0,money(source.amount-total));
 if(remaining>0)for(const occurrence of costOccurrences({...source,amount:remaining},from,to))costs.push({...occurrence,key:source.key,label:source.label,scope:source.scope|| (source.jobKey?'job':'unassigned'),jobKey:source.jobKey,category:source.category,verified:source.verified,replacement:0,labor:money((source.labor||0)*remaining/(source.amount||1))});
 }
 for(const j of rows){const jobCosts=costs.filter(c=>c.scope==='job'&&c.jobKey===j.key);j.actual=money(jobCosts.reduce((s,c)=>s+c.amount,0));j.replacement=money(jobCosts.reduce((s,c)=>s+c.replacement,0));
 j.forecastCost=j.complete?j.actual:money(j.actual+Math.max(0,j.estimate.total-j.replacement));j.profit=money(j.revenue-j.forecastCost);
 if(!j.estimate.known&&!j.complete)j.warnings.push('Costi preventivati incompleti');
 if(!j.estimate.capturedAt&&!j.complete)j.warnings.push('Stima storica da confermare');
 if(!j.complete)j.warnings.push('Costi non definitivi');
 if(jobCosts.some(c=>!c.verified))j.warnings.push('Netto spese da verificare');
 if(j.replacement>j.estimate.total)j.warnings.push('Quota sostituita oltre la stima');
 }
 const filtered=rows.filter(j=>j.date>=from&&j.date<=to);const revenue=money(filtered.reduce((s,j)=>s+j.revenue,0)),cost=money(filtered.reduce((s,j)=>s+j.forecastCost,0));
 const general=money(costs.filter(c=>c.scope==='general').reduce((s,c)=>s+c.amount,0));
 const unassigned=costs.filter(c=>c.scope==='unassigned'||c.scope==='job'&&!c.jobKey);
 return {rows,filtered,costs,revenue,cost,general,profit:money(revenue-cost),average:filtered.length?money((revenue-cost)/filtered.length):0,margin:revenue?((revenue-cost)/revenue)*100:0,unassigned,warnings};
}
