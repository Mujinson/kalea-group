import {supabase} from '@/integrations/supabase/client';
import {fetchAllRows} from '@/lib/fetchAllRows';
import {buildJobs, type CostSource} from '@/lib/companyProfit';
import {DEFAULT_CREW_SETTINGS} from '@/lib/crewCosts';
export const PROFIT_TABLES=['quotes','sales','construction_sites','supplier_invoices','customer_invoices','fixed_costs','variable_costs','site_expenses','site_daily_costs','profit_cost_allocations','profit_job_closures','profit_payroll_months','workers'] as const;
export async function loadProfitData(){
 const results=await Promise.all(PROFIT_TABLES.map(async table=>[table,await fetchAllRows(supabase.from(table).select('*'))] as const));
 const d=Object.fromEntries(results) as Record<string,any[]>;
 const [products,settings]=await Promise.all([fetchAllRows(supabase.from('catalog_products').select('id,list_price,supplier_discount_percentage,net_cost,purchase_price')),supabase.from('crew_cost_settings').select('*').limit(1).maybeSingle()]);
 if(settings.error)throw settings.error;
 const jobs=buildJobs(d.quotes,d.sales,products,{...DEFAULT_CREW_SETTINGS,...settings.data},d.profit_job_closures);
 const jobFor=(siteId?:string,saleId?:string,quoteId?:string)=>{
 const site=d.construction_sites.find(s=>s.id===siteId);
 return jobs.find(j=>(quoteId||site?.quote_id)&&j.quoteId===(quoteId||site?.quote_id)|| (saleId||site?.sale_id)&&j.saleId===(saleId||site?.sale_id))?.key;
 };
 const sources:CostSource[]=[];
 d.supplier_invoices.filter(r=>r.status!=='annullata').forEach(r=>sources.push({key:`supplier:${r.id}`,label:`Fattura ${r.invoice_number}`,amount:Number(r.subtotal),date:r.invoice_date,jobKey:jobFor(r.site_id),category:r.category||'materials',verified:true}));
 d.fixed_costs.forEach(r=>sources.push({key:`fixed:${r.id}`,label:r.description,amount:Number(r.amount),date:r.cost_date,category:r.category,verified:false,frequency:r.frequency,scope:'general'}));
 d.variable_costs.forEach(r=>sources.push({key:`variable:${r.id}`,label:r.description,amount:Number(r.amount),date:r.cost_date,jobKey:jobFor(undefined,r.sale_id),category:r.category,verified:false,frequency:r.frequency}));
 d.site_expenses.forEach(r=>sources.push({key:`expense:${r.id}`,label:r.description,amount:Number(r.amount),date:r.expense_date||r.created_at.slice(0,10),jobKey:jobFor(r.site_id),category:r.expense_type||'other',verified:false}));
 d.site_daily_costs.filter(r=>!r.is_estimate).forEach(r=>sources.push({key:`daily:${r.id}`,label:`Giornata cantiere ${r.work_date}`,amount:Number(r.labor)+Number(r.fuel)+Number(r.tolls)+Number(r.meals)+Number(r.hotel)+Number(r.other),date:r.work_date,jobKey:jobFor(r.site_id),category:'crew',verified:false,labor:Number(r.labor)}));
 const invoices=d.customer_invoices.filter(i=>['emessa','parziale','pagata','scaduta'].includes(i.status)).map(i=>({...i,jobKey:jobFor(i.site_id,undefined,i.quote_id)}));
 return {jobs,sources,allocations:d.profit_cost_allocations,invoices,workers:d.workers.filter(w=>!w.deleted_at),payroll:d.profit_payroll_months,closures:d.profit_job_closures};
}
export type ProfitData=Awaited<ReturnType<typeof loadProfitData>>;
