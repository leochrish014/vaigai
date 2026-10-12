# ---------- 6. Payments and GST invoices ----------
CFGN='Config'
pc=webhook('Pay Create Webhook',[0,200],'vaigai-pay-create');c1=config([220,200]);k1=keyif([440,200]);u1=respond('Unauthorized',[660,380],'{"ok":false,"error":"unauthorized"}',401)
ro=sheet('Read Orders (create)',[660,200],'Orders','read');fp=code('Find Payable Order',[880,200],CODE['pay_find_order']);ok1=ifnode('Payable?',[1100,200],'={{ $json.ok }}','boolean','true');bad1=respond('Respond Not Payable',[1320,360],"={{ JSON.stringify($json.response) }}",400)
rz=node('Razorpay: create order','n8n-nodes-base.httpRequest',[1320,140],{'method':'POST','url':'https://api.razorpay.com/v1/orders','authentication':'genericCredentialType','genericAuthType':'httpBasicAuth','sendBody':True,'specifyBody':'json','jsonBody':"={{ JSON.stringify({amount:$json.amount,currency:'INR',receipt:$json.order_id,notes:{order_id:$json.order_id} }) }}",'options':{}},4.2,{'httpBasicAuth':{'id':'','name':'Razorpay (key id + secret)'}})
sh=code('Shape Checkout Options',[1540,140],CODE['pay_shape']);r1=respond('Respond Checkout Options',[1760,140],"={{ JSON.stringify($json.response) }}")
# verify (browser) route
CFGN='Config (verify)'
pv=webhook('Pay Verify Webhook',[0,640],'vaigai-pay-verify');c2=config([220,640],'Config (verify)');k2=keyif([440,640],'Key OK? (verify)');u2=respond('Unauthorized (verify)',[660,820],'{"ok":false,"error":"unauthorized"}',401)
h1=crypto_hmac('HMAC signature',[660,640],"={{ $json.body.razorpay_order_id + '|' + $json.body.razorpay_payment_id }}","={{ $('Config (verify)').first().json.razorpay_key_secret }}");cm=code('Compare signature',[880,640],CODE['pay_compare']);ok2=ifnode('Signature valid?',[1100,640],'={{ $json.ok }}','boolean','true');bad2=respond('Respond Invalid Signature',[1320,820],"={{ JSON.stringify($json.response) }}",400)
# razorpay server webhook route
CFGN='Config (webhook)'
pw=node('Razorpay Webhook','n8n-nodes-base.webhook',[0,1060],{'httpMethod':'POST','path':'vaigai-razorpay-webhook','responseMode':'responseNode','options':{'rawBody':True}},2,webhookId=uid());c3=config([220,1060],'Config (webhook)')
h2=crypto_hmac('HMAC webhook body',[440,1060],'',"={{ $('Config (webhook)').first().json.razorpay_webhook_secret }}",True);ev=code('Check webhook event',[660,1060],CODE['rzp_event']);ok3=ifnode('Captured and valid?',[880,1060],'={{ $json.ok }}','boolean','true');ign=respond('Respond Ignored',[1100,1220],'{"ok":true,"ignored":true}')
# shared invoicing chain
CFGN='Config (invoice)'
mt=crypto_token('Make invoice token',[1320,880]);c4=config([1320,1000],'Config (invoice)') if False else None
ro2=sheet('Read Orders (pay)',[1540,880],'Orders','read');ri=sheet('Read Invoices',[1760,880],'Invoices','read');bi=code('Build Invoice',[1980,880],CODE['build_invoice'])
bi['parameters']['jsCode']=bi['parameters']['jsCode'].replace("$('Config (invoice)')","$('Config (verify)')")
need=ifnode('Invoice needed?',[2200,880],'={{ $json.invoice_needed }}','boolean','true')
ai=sheet('Append invoice',[2420,800],'Invoices','append',(INV_COLS,'$json.inv'));uo=sheet_update('Mark order paid',[2640,800],'Orders',['order_id','payment','payment_id','paid_at','invoice_no'],'order_id','$("Build Invoice").first().json.order_update')
rf=respond('Respond Paid + Invoice',[2860,880],"={{ JSON.stringify($('Build Invoice').first().json.response) }}")
# invoice view
CFGN='Config (invoice view)'
iw=webhook('Invoice Webhook',[0,1500],'vaigai-invoice','GET');ri2=sheet('Read Invoices (view)',[220,1500],'Invoices','read');fi=code('Find Invoice',[440,1500],CODE['find_invoice']);ri3=respond('Respond Invoice',[660,1500],"={{ JSON.stringify($json) }}")
for nn in (ro2,ri,bi):pass
n6=note("PAYMENTS AND GST INVOICES\nRazorpay: create an account, copy Key Id + Key Secret, add an HTTP Basic Auth credential (user = Key Id, password = Key Secret) to 'Razorpay: create order', and set razorpay_key_id, razorpay_key_secret in each Config node (configure.js does it). Add a Razorpay webhook to /webhook/vaigai-razorpay-webhook for payment.captured with razorpay_webhook_secret.\nGST: confirm HSN codes and rates with your CA in InvoiceEngine (Code nodes 'Build Invoice' and 'Find Invoice'), and set your GSTIN, FSSAI number and address. Invoice numbers run VGM/FY/000001 per financial year.\nSheets tabs needed: Orders (new columns), Invoices (see sheets/Invoices.csv).",[0,-120],760,300)
nodes=[pc,c1,k1,u1,ro,fp,ok1,bad1,rz,sh,r1,pv,c2,k2,u2,h1,cm,ok2,bad2,pw,c3,h2,ev,ok3,ign,mt,ro2,ri,bi,need,ai,uo,rf,iw,ri2,fi,ri3,n6]
cn=[LNK(pc['name'],c1['name']),LNK(c1['name'],k1['name']),LNK(k1['name'],ro['name'],0),LNK(k1['name'],u1['name'],1),LNK(ro['name'],fp['name']),LNK(fp['name'],ok1['name']),LNK(ok1['name'],rz['name'],0),LNK(ok1['name'],bad1['name'],1),LNK(rz['name'],sh['name']),LNK(sh['name'],r1['name']),
 LNK(pv['name'],c2['name']),LNK(c2['name'],k2['name']),LNK(k2['name'],h1['name'],0),LNK(k2['name'],u2['name'],1),LNK(h1['name'],cm['name']),LNK(cm['name'],ok2['name']),LNK(ok2['name'],mt['name'],0),LNK(ok2['name'],bad2['name'],1),
 LNK(pw['name'],c3['name']),LNK(c3['name'],h2['name']),LNK(h2['name'],ev['name']),LNK(ev['name'],ok3['name']),LNK(ok3['name'],mt['name'],0),LNK(ok3['name'],ign['name'],1),
 LNK(mt['name'],ro2['name']),LNK(ro2['name'],ri['name']),LNK(ri['name'],bi['name']),LNK(bi['name'],need['name']),LNK(need['name'],ai['name'],0),LNK(need['name'],rf['name'],1),LNK(ai['name'],uo['name']),LNK(uo['name'],rf['name']),
 LNK(iw['name'],ri2['name']),LNK(ri2['name'],fi['name']),LNK(fi['name'],ri3['name'])]
save('06-vaigai-payments-invoices.json',wf('Vaigai 06 · Payments (Razorpay) and GST invoices',nodes,cn))
