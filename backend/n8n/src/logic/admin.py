STOCK_COLS=['stock_id','sku','date','capacity','produced','notes']
ORDER_STATUSES="['received','confirmed','out_for_delivery','delivered','cancelled','needs_review','failed']"
CODE['admin_orders']="""const b=$('Admin Webhook').first().json.body||{};const from=String(b.date_from||''),to=String(b.date_to||from),st=String(b.status||'');
const rows=$input.all().map(i=>i.json).filter(r=>r&&r.order_id).filter(r=>{const d=String(r.delivery_date||'').slice(0,10);return (!from||d>=from)&&(!to||d<=to)&&(!st||String(r.status)===st)}).sort((a,c)=>String(c.created_at).localeCompare(String(a.created_at))).slice(0,300);
return [{json:{response:{ok:true,count:rows.length,orders:rows.map(r=>({order_id:r.order_id,created_at:r.created_at,status:r.status,customer_name:r.customer_name,phone:String(r.phone),address:r.address,area:r.area,pincode:r.pincode,slot:r.slot,delivery_date:String(r.delivery_date||'').slice(0,10),items:r.items,items_json:r.items_json,total:+r.total,payment:r.payment,invoice_no:r.invoice_no||'',rider:r.rider||'',notes:r.notes||'',collected_inr:r.collected_inr||''}))}}}];"""
CODE['admin_leads']="""const rows=$input.all().map(i=>i.json).filter(r=>r&&r.lead_id).sort((a,c)=>String(c.created_at).localeCompare(String(a.created_at))).slice(0,200);
return [{json:{response:{ok:true,count:rows.length,leads:rows.map(r=>({lead_id:r.lead_id,created_at:r.created_at,type:r.type,priority:r.priority,status:r.status,phone:String(r.phone),detail:r.detail,basket:r.basket,sla_minutes:+r.sla_minutes||0,assignee:r.assignee||'',note:r.note||''}))}}}];"""
CODE['admin_stock']="""const rows=$input.all().map(i=>i.json).filter(r=>r&&r.stock_id);
return [{json:{response:{ok:true,stock:rows.map(r=>({stock_id:r.stock_id,sku:r.sku,date:String(r.date).slice(0,10),capacity:+r.capacity||0,produced:+r.produced||0,notes:r.notes||''}))}}}];"""
CODE['admin_order_update']=CAT_JS+"""
const b=$('Admin Webhook').first().json.body||{};const OK="""+ORDER_STATUSES+""";const clean=s=>String(s==null?'':s).replace(/[\\u0000-\\u001f]/g,' ').trim();const safe=s=>/^[=+\\-@]/.test(s)?"'"+s:s;
const id=clean(b.order_id).toUpperCase().slice(0,30),status=clean(b.status);
if(!id||OK.indexOf(status)<0)return [{json:{ok:false,response:{ok:false,error:'valid order id and status required'}}}];
const upd={order_id:id,status,rider:safe(clean(b.rider).slice(0,40)),notes:safe(clean(b.notes).slice(0,300)),delivered_at:status==='delivered'?new Date().toISOString():'',collected_inr:status==='delivered'&&b.collected_inr!==undefined?String(Math.max(0,Math.min(100000,Math.round(+b.collected_inr||0)))):''};
return [{json:{ok:true,upd,response:{ok:true,order_id:id,status}}}];"""
CODE['admin_lead_update']="""const b=$('Admin Webhook').first().json.body||{};const OK=['new','contacted','resolved','closed'];const clean=s=>String(s==null?'':s).replace(/[\\u0000-\\u001f]/g,' ').trim();const safe=s=>/^[=+\\-@]/.test(s)?"'"+s:s;
const id=clean(b.lead_id).toUpperCase().slice(0,30),status=clean(b.status);
if(!id||OK.indexOf(status)<0)return [{json:{ok:false,response:{ok:false,error:'valid lead id and status required'}}}];
return [{json:{ok:true,upd:{lead_id:id,status,assignee:safe(clean(b.assignee).slice(0,40)),note:safe(clean(b.note).slice(0,300)),updated_at:new Date().toISOString()},response:{ok:true,lead_id:id,status}}}];"""
CODE['admin_stock_set']=CAT_JS+"""
const b=$('Admin Webhook').first().json.body||{};const sku=String(b.sku||''),date=String(b.date||'');
if(!CATALOG[sku]||!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)||isNaN(Date.parse(date)))return [{json:{ok:false,response:{ok:false,error:'valid sku and date required'}}}];
const n=v=>Math.max(0,Math.min(100000,Math.round(+v||0)));const clean=s=>String(s==null?'':s).replace(/[\\u0000-\\u001f]/g,' ').trim();const safe=s=>/^[=+\\-@]/.test(s)?"'"+s:s;
const upd={stock_id:sku+'|'+date,sku,date,capacity:n(b.capacity),produced:n(b.produced),notes:safe(clean(b.notes).slice(0,200))};
return [{json:{ok:true,upd,response:{ok:true,stock_id:upd.stock_id}}}];"""
