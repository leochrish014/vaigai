# Vaigai AI Assistant + n8n automation: build and QA report

## 1. What was built
| Part | Description |
|---|---|
| Website assistant | Chat widget inside the site: product cards with Add buttons, basket control, delivery check, recommendations, daily-plan estimates, safe order / callback / complaint / bulk flows, order status, WhatsApp handoff, site controls (language, theme), voice input, quick replies, English / Tamil / Tanglish, light and dark, phone full-screen sheet |
| Offline brain | Works with no server. Intent rules, entity extraction (products, quantities in digits and Tamil / Tanglish words, pincode, phone, area), guarded dialogue flows |
| AI mode | If a webhook is set, free-text questions go to an n8n AI agent; deterministic flows (checkout, callbacks, complaints, status) stay local and safe; any failure falls back to the offline brain |
| n8n workflows (5) | 01 AI agent with 5 read-only tools; 02 orders + status (server-side pricing, Sheets, WhatsApp, Telegram); 03 daily plan, route sheet, capacity alerts, morning pending check; 04 leads with priority, SLA alerts and 15-minute escalation; 05 subscription order creation, reminders, feedback requests, low-rating auto-callback |
| Extras | Sheet templates (6 tabs), config helper that fills all Config nodes, webhook test script, local mock of the webhooks, WhatsApp template list, README |

## 2. Test results
| Suite | Checks | Result |
|---|---|---|
| Brain: 60+ phrases across English, Tamil, Tanglish; entities; full order, callback, complaint, bulk and subscription flows; cancel; fuzz (empty, 5000 chars, script tags, emoji); quantity cap; no fake offers; medical guard | 113 | 113 pass |
| Assistant UI in a real browser: open, focus, greeting, cards, Add button updates site basket, natural-language add, basket total, delivery, invalid phone, full checkout, WhatsApp fallback link, Tamil reply, callback lead, theme and language actions, XSS text not executed, Esc closes and returns focus, all controls 44 px+, phone full-screen sheet with page scroll lock | 43 | 43 pass |
| Webhook mode against the local mock: AI reply and action executed, quick replies, show_products, start_checkout hand-over, order POST with server total and id, order / assistant / lead payload contents, status lookup, lead POST, server down fallback, wrong key (401) fallback | included in the 43 | pass |
| n8n workflows: valid JSON, unique ids, real connections, every node reachable, every webhook branch answers, expressions balanced, no secrets, syntax of all Code nodes | 90 | 90 pass |
| n8n logic (Code nodes and tools run with fixed dates): reply sanitiser (fake SKU, unknown actions, qty caps, fence recovery, Tamil fallback), tool answers, server-side pricing, IST cut-off (9 PM), uncovered area to needs_review, formula-injection neutralised, status without personal data, delivery plan and capacity alert, overdue-lead window (escalate once), subscription rules (paused, skipped, weekday, ended, bad SKU), feedback rules | included in the 90 | pass |
| Site regression after adding the assistant: 26 layout runs, 14 Tamil runs, 53/56 SEO static (3 are your placeholders), 20/21 dynamic (1 lab-only speed warning) | 120 | no new failures |

## 3. Defects found by testing and fixed
1. Phone parser stripped a leading "91" from real numbers such as 9123456789 (callback leads would have failed). Fixed.
2. "daily 1 milk monthly cost" was read as a price question instead of a plan. Fixed.
3. Empty-basket checkout left a half state. Fixed.
4. In AI mode, "call me back" and order numbers went to the LLM instead of the safe local flows. Fixed: deterministic intents always run locally.
5. Latest chat message could be partly hidden under the quick-reply chips. Fixed.
6. Expressions with `}}` inside WhatsApp bodies could break n8n's parser. Fixed.
7. Spreadsheet formula injection (a name like =HYPERLINK(...)) would have run in Google Sheets. Fixed in orders, leads and feedback.

## 4. Honest limits
- The n8n files could not be imported into a running n8n here (no n8n or internet in the test environment). They match the standard node schema, are fully validated structurally and logically, and the Code nodes were executed. After import, re-select credentials; if n8n flags a node version, re-pick the same options.
- No real LLM was called. The agent prompt, tools and output validator are tested; answer quality depends on the model you choose. Run 30 to 50 real questions in staging and tune the prompt.
- WhatsApp business-initiated messages need approved templates (list included). Customer replies need your own WhatsApp webhook.
- Voice input uses the browser's speech recognition: best in Chrome and Edge on Android and desktop; limited on iPhone Safari; Tamil recognition needs Chrome. Typing always works.
- Prices, areas, pincode range, hours and FAQ answers are sample data to confirm.

## 5. Suggested next steps
1. Import into a staging n8n, set config, run `test-webhooks.sh`, place 5 real test orders end to end.
2. Review the first week of conversations (enable the logging node) and add the questions the brain missed.
3. Add a small staff view over the Orders and Leads sheets (Looker Studio or a Google Sheet filter view).
4. Phase 2: WhatsApp inbound bot on the same agent, payment links, Tamil voice replies.
