# Webhook contract (all endpoints under `https://YOUR-N8N-HOST/webhook`)

Auth headers: `x-vaigai-key` (public site key), `x-vaigai-token` (customer session), `x-vaigai-admin` (admin key). Responses are JSON; errors use HTTP 400/401/429 with `{ok:false,error}`.

| Method + path | Workflow | Auth | Request → response |
|---|---|---|---|
| POST `/vaigai-assistant` | 01 | key | `{session_id,message,lang,basket[],context{},history[]}` → `{reply,lang,actions[],quick_replies[]}` (actions whitelisted: add_to_basket, remove_from_basket, clear_basket, show_products, start_checkout, collect_callback, open_whatsapp, handoff, scroll_to, set_language, set_theme) |
| POST `/vaigai-order` | 02 | key | `{order_id?,items[{sku,qty}],customer{name,phone},address,area?,pincode?,slot,payment:'online'|'cod',lang,session_id,source{page,utm}}` → `{ok,order_id,total,delivery_date,status,payment_required}`; prices are ignored and recomputed |
| GET `/vaigai-order-status?id=` | 02 | key | → `{found,status,delivery_date,total}` (no personal data) |
| POST `/vaigai-lead` | 04 | key | `{type:callback|bulk|complaint|subscription|handoff,phone,detail,basket,lang,session_id,source}` → `{ok,lead_id}`; complaint/bulk/handoff are high priority (15 min SLA) |
| POST `/vaigai-feedback` | 05 | key | `{order_id,rating 1-5,comment,phone}` → `{ok}`; rating ≤ 2 creates a high-priority lead |
| POST `/vaigai-pay-create` | 06 | key | `{order_id}` → `{ok,key_id,razorpay_order_id,amount,currency,description,prefill}` (only for `online_pending` orders) |
| POST `/vaigai-pay-verify` | 06 | key | `{order_id,razorpay_order_id,razorpay_payment_id,razorpay_signature}` → `{ok,invoice_no,invoice_url,total}`; HMAC-SHA256 of `order_id|payment_id` must match |
| POST `/vaigai-razorpay-webhook` | 06 | HMAC header | Razorpay `payment.captured` → idempotent invoice creation |
| GET `/vaigai-invoice?id=&t=` | 06 | secret token | → invoice JSON (phone masked) or `{found:false}` |
| POST `/vaigai-otp-request` | 07 | key | `{phone}` → `{ok,expires_in}`; max 3 per 10 min |
| POST `/vaigai-otp-verify` | 07 | key | `{phone,otp}` → `{ok,token}` (30 days); 5 wrong tries lock the code |
| GET `/vaigai-account` | 07 | token | → `{ok,customer,orders[≤15],subscriptions[]}` |
| POST `/vaigai-sub-update` | 07 | token | `{sub_id,action:pause|resume|cancel|skip,date?}` (skip cut-off 9 PM IST the day before, max 60 days ahead) |
| POST `/vaigai-admin` | 08 | admin | `{action:list_orders|list_leads|list_stock|order_update|lead_update|stock_set,...}` |
| GET/POST `/vaigai-whatsapp` | 09 | Meta verify token / `X-Hub-Signature-256` | Meta webhook (verification handshake and inbound messages) |
