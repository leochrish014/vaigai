# WhatsApp message templates to submit (Meta Business Manager, category: UTILITY)

Messages your business starts (order confirmation, reminders, feedback) must use approved templates. Submit these five, language English (add Tamil versions too).

| Template name | Body text | Variables |
|---|---|---|
| order_confirmation | Thank you for ordering from Vaigai Milk. Order {{1}}: {{2}}. Total {{3}}. Delivery on {{4}}. We will confirm on WhatsApp shortly. | order id, items, total, delivery date |
| lead_received | Thanks for contacting Vaigai Milk. Your reference is {{1}}. Our team will reach you shortly. | lead id |
| delivery_reminder | Vaigai Milk reminder: {{1}} will be delivered on {{2}} by 5:30 AM. Reply SKIP to pause this delivery. | items, date |
| feedback_request | Hi {{1}}, how was your Vaigai Milk order {{2}}? Reply with a rating from 1 (poor) to 5 (excellent). | name, order id |
| renewal_reminder (optional) | Hi {{1}}, your Vaigai Milk plan renews on {{2}}. Reply YES to continue. | name, date |

Replies (SKIP, 1 to 5, YES) arrive through your WhatsApp Cloud API webhook. Point that webhook to an n8n trigger of your own, or reply manually at first; ratings can be posted to the /vaigai-feedback webhook.
