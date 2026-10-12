OTP_COLS=['otp_id','phone','otp_hash','created_at','expires_at','attempts','used']
SESS_COLS=['token','phone','created_at','expires_at']
SAFE_EQ="const safeEq=(a,b)=>{a=String(a);b=String(b);if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0};\nconst normPh=s=>{const d=String(s||'').replace(/\\D/g,'');const t=d.slice(-10);return /^[6-9]\\d{9}$/.test(t)?t:''};\n"
CODE['otp_rate']=SAFE_EQ+"""const b=$('OTP Request Webhook').first().json.body||{};const ph=normPh(b.phone);
if(!ph)return [{json:{ok:false,response:{ok:false,error:'valid 10 digit mobile required'}}}];
const now=Date.now();const recent=$input.all().map(i=>i.json).filter(r=>r&&String(r.phone)===ph&&Date.parse(r.created_at)>now-600000);
if(recent.length>=3)return [{json:{ok:false,response:{ok:false,error:'too many requests, please try after 10 minutes'}}}];
return [{json:{ok:true,phone:ph}}];"""
CODE['otp_derive']="""const rnd=String($json.rnd||'');const otp=String(parseInt(rnd.slice(0,8),16)%1000000).padStart(6,'0');const phone=$('Check OTP rate').first().json.phone;
return [{json:{phone,otp,otp_id:'OT'+rnd.slice(8,16),hmac_value:otp+'|'+phone}}];"""
CODE['otp_row']="""const d=$('Derive OTP').first().json,now=Date.now();
return [{json:{ok:true,otp:d.otp,phone:d.phone,row:{otp_id:d.otp_id,phone:d.phone,otp_hash:$json.expected,created_at:new Date(now).toISOString(),expires_at:new Date(now+300000).toISOString(),attempts:0,used:'no'},response:{ok:true,expires_in:300}}}];"""
CODE['otp_verify']=SAFE_EQ+"""const b=$('OTP Verify Webhook').first().json.body||{};const ph=normPh(b.phone),hash=$('Hash submitted OTP').first().json.expected;
if(!ph||!/^\\d{6}$/.test(String(b.otp||'')))return [{json:{ok:false,response:{ok:false,error:'enter the 6 digit code'}}}];
const rows=$input.all().map(i=>i.json).filter(r=>r&&String(r.phone)===ph&&String(r.used).toLowerCase()!=='yes').sort((a,c)=>Date.parse(c.created_at)-Date.parse(a.created_at));const r=rows[0];
if(!r||Date.parse(r.expires_at)<Date.now())return [{json:{ok:false,response:{ok:false,error:'code expired, please request a new one'}}}];
const at=+r.attempts||0;if(at>=5)return [{json:{ok:false,response:{ok:false,error:'too many wrong attempts, please request a new code'}}}];
if(!safeEq(String(r.otp_hash),String(hash)))return [{json:{ok:false,upd:{otp_id:r.otp_id,attempts:at+1,used:'no'},response:{ok:false,error:'wrong code'}}}];
return [{json:{ok:true,phone:ph,upd:{otp_id:r.otp_id,attempts:at,used:'yes'}}}];"""
CODE['session_row']="""const ph=$('Verify OTP').first().json.phone,now=Date.now();
return [{json:{row:{token:$json.token,phone:ph,created_at:new Date(now).toISOString(),expires_at:new Date(now+30*86400000).toISOString()},response:{ok:true,token:$json.token}}}];"""
def check_session(web):
    return SAFE_EQ+"const w=$('"+web+"').first().json;const tok=String((w.headers||{})['x-vaigai-token']||'');\nconst s=tok.length>=16?$input.all().map(i=>i.json).find(r=>r&&r.token&&safeEq(r.token,tok)&&Date.parse(r.expires_at)>Date.now()):null;\nif(!s)return [{json:{ok:false,response:{ok:false,error:'session expired, please log in again'}}}];\nreturn [{json:{ok:true,phone:String(s.phone)}}];"
CODE['check_session_account']=check_session('Account Webhook')
CODE['check_session_sub']=check_session('Sub Update Webhook')
CODE['build_account']="""const me=$('Check session (account)').first().json.phone;
const orders=$('Read Orders (account)').all().map(i=>i.json).filter(r=>r&&String(r.phone)===me).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)).slice(0,15);
const subs=$input.all().map(i=>i.json).filter(r=>r&&String(r.phone)===me&&String(r.status||'').toLowerCase()!=='cancelled');
const name=(orders[0]&&orders[0].customer_name)||(subs[0]&&subs[0].customer_name)||'';
return [{json:{response:{ok:true,customer:{name:String(name),phone:me.slice(0,2)+'XXXXXX'+me.slice(-2)},orders:orders.map(o=>({order_id:o.order_id,created_at:o.created_at,status:o.status,items:o.items,total:+o.total,payment:o.payment,delivery_date:o.delivery_date,invoice_no:o.invoice_no||'',items_json:o.items_json,address:o.address,area:o.area,pincode:o.pincode,slot:o.slot})),subscriptions:subs.map(s=>({sub_id:s.sub_id,status:s.status,items:s.items,frequency:s.frequency,slot:s.slot,skip_dates:s.skip_dates||'',address:s.address}))}}}];"""
CODE['apply_sub_change']="""const IST=()=>new Date(Date.now()+330*60000);const ymd=d=>d.toISOString().slice(0,10);const add=(d,n)=>{const x=new Date(d);x.setUTCDate(x.getUTCDate()+n);return x};
const me=$('Check session (sub)').first().json.phone,b=$('Sub Update Webhook').first().json.body||{};
const s=$input.all().map(i=>i.json).find(r=>r&&String(r.sub_id)===String(b.sub_id)&&String(r.phone)===me);
const bad=m=>[{json:{ok:false,response:{ok:false,error:m}}}];
if(!s)return bad('subscription not found');
const st=String(s.status||'').toLowerCase();const act=String(b.action||'');
if(st==='cancelled')return bad('subscription is cancelled');
let status=st,skips=String(s.skip_dates||'').split(',').map(x=>x.trim()).filter(Boolean);
if(act==='pause')status='paused';else if(act==='resume')status='active';else if(act==='cancel')status='cancelled';
else if(act==='skip'){const d=String(b.date||'');if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(d)||isNaN(Date.parse(d)))return bad('choose a valid date');
 const now=IST(),first=ymd(add(now,now.getUTCHours()>=21?2:1)),last=ymd(add(now,60));if(d<first)return bad('too late to skip that day (cut-off 9 PM the day before)');if(d>last)return bad('you can skip up to 60 days ahead');
 if(skips.indexOf(d)<0)skips.push(d);skips.sort();}
else return bad('unknown action');
return [{json:{ok:true,upd:{sub_id:s.sub_id,status,skip_dates:skips.join(',')},response:{ok:true,sub_id:s.sub_id,status,skip_dates:skips.join(',')}}}];"""
