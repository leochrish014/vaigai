import re as _re2,json as _json
_B=(REPO/'frontend'/'assistant'/'brain.js').read_text(encoding='utf-8')
BRAIN_JS=_re2.sub(r"if\s*\(typeof module\s*!==\s*'undefined'\)\s*module\.exports\s*=\s*VaigaiBrain;\s*$",'',_B)
WA_CAT='const CAT='+_json.dumps([{'k':p['k'],'n':p['n'],'nt':p['nt'],'u':p['u'],'p':p['p'],'d':p['d'],'dt':p['dt'],'sku':'VGM-'+p['k'].upper()+'-'+p['u'].replace(' ','')} for p in PR],ensure_ascii=False)+";\nconst WORD={carton:'vaigai fresh',badam:'badam',ghee:'ghee',curd:'curd',butter:'butter',hero:'glass bottle'};\n"
WA_BUILD="""const trunc=(s,n)=>{s=String(s);return s.length>n?s.slice(0,n-1)+'…':s};
const waText=(to,body)=>({messaging_product:'whatsapp',to:'91'+to,type:'text',text:{body:trunc(body,3800)}});
const waButtons=(to,body,chips)=>({messaging_product:'whatsapp',to:'91'+to,type:'interactive',interactive:{type:'button',body:{text:trunc(body,1000)},action:{buttons:chips.slice(0,3).map(c=>({type:'reply',reply:{id:trunc('say:'+c[1],256),title:trunc(c[0],20)}}))}}});
const waList=(to,body,ix,lang)=>({messaging_product:'whatsapp',to:'91'+to,type:'interactive',interactive:{type:'list',body:{text:trunc(body,1000)},action:{button:trunc(lang==='ta'?'சேர்':'Add to basket',20),sections:[{title:trunc(lang==='ta'?'பொருட்கள்':'Products',24),rows:ix.slice(0,10).map(i=>({id:'add:'+i,title:trunc(lang==='ta'?CAT[i].nt:CAT[i].n,24),description:trunc('₹'+CAT[i].p+' · '+CAT[i].u,72)}))}]}}});
"""
CODE['wa_sig']=BRAIN_JS.split("const esc=")[0][:0]+"""const w=$('WhatsApp Message Webhook').first().json;const sig=String((w.headers||{})['x-hub-signature-256']||'');const exp='sha256='+String($json.expected||'');
let d=sig.length===exp.length?0:1;for(let i=0;i<Math.min(sig.length,exp.length);i++)d|=sig.charCodeAt(i)^exp.charCodeAt(i);
return [{json:{ok:d===0&&sig.length>10}}];"""
CODE['wa_parse']="""const body=($('WhatsApp Message Webhook').first().json.body)||{};
const ch=(((body.entry||[])[0]||{}).changes||[])[0],val=(ch&&ch.value)||{},m=(val.messages||[])[0];
if(!m)return [];
const from=String(m.from||'').replace(/\\D/g,'').slice(-10);if(!/^[6-9]\\d{9}$/.test(from))return [];
let text='';if(m.type==='text')text=(m.text&&m.text.body)||'';else if(m.type==='interactive'){const r=(m.interactive&&(m.interactive.button_reply||m.interactive.list_reply))||{};text=String(r.id||'')}
const prof=((val.contacts||[])[0]||{}).profile||{};
return [{json:{from,msg_id:String(m.id||''),type:m.type,text:String(text).replace(/[\\u0000-\\u001f]/g,' ').slice(0,400),name:String(prof.name||'')}}];"""
CODE['wa_brain']=BRAIN_JS+"\n"+WA_CAT+WA_BUILD+"""
const cfg=$('Config (messages)').first().json,p=$('Parse WhatsApp event').first().json;
const row=$input.all().map(i=>i.json).find(r=>r&&String(r.phone)===p.from)||{};
if(row.last_msg_id&&row.last_msg_id===p.msg_id)return [];
let st={mode:null},basket={};try{st=JSON.parse(row.state_json||'{"mode":null}')}catch(e){}try{basket=JSON.parse(row.basket_json||'{}')}catch(e){}
if(row.updated_at&&Date.now()-Date.parse(row.updated_at)>1800000)st={mode:null};
let lang=row.lang==='ta'?'ta':'en';
const mk=to=>({json:{to,payloads:[],order:null,lead:null,ai:null}});
if(p.type!=='text'&&p.type!=='interactive'){const o=mk(p.from);o.json.payloads=[waText(p.from,lang==='ta'?'தற்போது உரைச் செய்திகளை மட்டும் படிக்க முடியும். உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்.':'I can read text messages for now. Please type your question.')];o.json.session={phone:p.from,state_json:JSON.stringify(st),basket_json:JSON.stringify(basket),lang,updated_at:new Date().toISOString(),last_msg_id:p.msg_id};return [o]}
let text=p.text;if(text.indexOf('say:')===0)text=text.slice(4);else if(text.indexOf('add:')===0){const i=parseInt(text.slice(4),10);text=CAT[i]?'add 1 '+WORD[CAT[i].k]:'products'}
const brain=VaigaiBrain.create({cat:CAT,getBasket:()=>Object.keys(basket).filter(k=>basket[k]>0).map(k=>({i:+k,q:basket[k]})),knownPhone:p.from});
const out=brain.respond(text,st,lang);if(out.lang==='ta')lang='ta';
const bl=()=>Object.keys(basket).filter(k=>basket[k]>0).map(k=>basket[k]+' x '+CAT[+k].n).join(', ');
let order=null,lead=null,handoff=false,statusId='';
(out.a||[]).forEach(a=>{if(a.type==='add')basket[a.i]=Math.min(99,(basket[a.i]||0)+Math.max(1,a.q|0));else if(a.type==='remove')delete basket[a.i];else if(a.type==='clear')basket={};else if(a.type==='lang')lang=a.v==='ta'?'ta':'en';else if(a.type==='submit_order')order=a.order;else if(a.type==='submit_lead')lead=a.lead;else if(a.type==='whatsapp')handoff=true;else if(a.type==='status')statusId=a.id||''});
const yy=new Date(Date.now()+330*60000).toISOString().slice(2,10).replace(/-/g,'');const ref='LD-'+yy+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
let msgs=out.m.map(m=>m.t==='text'?{t:'text',x:m.x.replace('{ref}',ref)}:m);
if(handoff){lead={type:'handoff',phone:p.from,detail:'Customer asked for a person on WhatsApp',lang,basket:bl()};msgs=[{t:'text',x:lang==='ta'?'எங்கள் குழுவுக்குத் தெரிவித்துவிட்டேன். இங்கேயே விரைவில் பதிலளிப்பார்கள்.':'I have alerted our team. They will reply to you here shortly.'}]}
if(statusId||out.intent==='status'){lead={type:'other',phone:p.from,detail:'Order status request '+statusId,lang,basket:''};msgs=[{t:'text',x:lang==='ta'?'ஆர்டர் '+statusId+' நிலையை குழு சரிபார்த்து இங்கேயே தெரிவிக்கும்.':'I have asked our team to check order '+statusId+' and reply here.'}]}
if(lead){lead.lead_id=lead.lead_id||ref;lead.source={utm:{},page:'whatsapp'};lead.session_id='wa_'+p.from}
if(order){order.session_id='wa_'+p.from;order.source={page:'whatsapp',utm:{}};order.payment='cod'}
const ai=(out.intent==='unknown'&&!st.mode&&!out.st.mode&&String(cfg.ai_fallback)==='yes')?{message:p.text.slice(0,400),lang,basket:Object.keys(basket).filter(k=>basket[k]>0).map(k=>({sku:CAT[+k].sku,name:CAT[+k].n,qty:basket[k],price:CAT[+k].p})),session_id:'wa_'+p.from}:null;
const P=[];if(!ai)for(const m of msgs){if(m.t==='text')P.push({k:'text',body:m.x});else if(m.t==='products'){const rows=m.i.length>1?m.i:m.i;P.push({k:'list',ix:m.i,body:lang==='ta'?'சேர்க்க தட்டுங்கள்:':'Tap to add:'})}else if(m.t==='chips'){const last=[...P].reverse().find(x=>x.k==='text');if(last){last.k='buttons';last.chips=m.c}else P.push({k:'buttons',body:lang==='ta'?'தேர்ந்தெடுங்கள்:':'Choose an option:',chips:m.c})}}
const payloads=P.map(x=>x.k==='text'?waText(p.from,x.body):x.k==='buttons'?waButtons(p.from,x.body,x.chips):x.ix.length===1?waButtons(p.from,(lang==='ta'?CAT[x.ix[0]].nt:CAT[x.ix[0]].n)+' ('+CAT[x.ix[0]].u+') ₹'+CAT[x.ix[0]].p,[[lang==='ta'?'சேர்':'Add to basket','add 1 '+WORD[CAT[x.ix[0]].k]]]):waList(p.from,x.body,x.ix,lang));
const sess={phone:p.from,state_json:JSON.stringify(out.st&&out.st.mode?out.st:{mode:null}),basket_json:JSON.stringify(basket),lang,updated_at:new Date().toISOString(),last_msg_id:p.msg_id};
return [{json:{to:p.from,payloads,order,lead,ai,session:sess}}];"""
CODE['wa_explode']="return ($input.first().json.payloads||[]).map(p=>({json:p}));"
CODE['wa_order_confirm']=WA_BUILD+CAT_JS+"""
const to=$('Bot Brain').first().json.to,r=$input.first().json,lang=$('Bot Brain').first().json.session.lang;
const body=r&&r.ok&&r.order_id?(lang==='ta'?'ஆர்டர் '+r.order_id+' பதிவானது. மொத்தம் ₹'+r.total+'. டெலிவரி: '+(r.delivery_date||'நாளை')+'. டெலிவரியில் பணம். நன்றி!':'Your order '+r.order_id+' is placed. Total ₹'+r.total+'. Delivery: '+(r.delivery_date||'tomorrow')+'. Pay on delivery. Thank you!'):(lang==='ta'?'மன்னிக்கவும், ஆர்டரை பதிவு செய்ய முடியவில்லை. எங்கள் குழு உங்களை தொடர்பு கொள்ளும்.':'Sorry, I could not place the order automatically. Our team will contact you here.');
return [{json:waText(to,body)}];"""
CODE['wa_ai_reply']=WA_BUILD+CAT_JS+"""
const bb=$('Bot Brain').first().json,to=bb.to,lang=bb.ai?bb.ai.lang:'en',r=$input.first().json;
let reply=String(r.reply||'').trim();if(!reply)reply=lang==='ta'?'மன்னிக்கவும், இப்போது பதிலளிக்க முடியவில்லை. எங்கள் குழு உதவும்.':'Sorry, I could not answer that right now. Our team will help you here.';
const chips=(Array.isArray(r.quick_replies)?r.quick_replies:[]).slice(0,3).map(q=>[String(q),String(q)]);
const out=[{json:chips.length?waButtons(to,reply,chips):waText(to,reply)}];
(r.actions||[]).forEach(a=>{if(a.type==='show_products'&&Array.isArray(a.skus)){const ix=a.skus.map(s=>Object.keys(CATALOG).indexOf(s)).filter(i=>i>=0);if(ix.length)out.push({json:{messaging_product:'whatsapp',to:'91'+to,type:'text',text:{body:ix.map(i=>'• '+Object.values(CATALOG)[i].n+' ('+Object.values(CATALOG)[i].u+') ₹'+Object.values(CATALOG)[i].p).join('\\n')}}})}});
return out;"""
WA_COLS=['phone','state_json','basket_json','lang','updated_at','last_msg_id']
