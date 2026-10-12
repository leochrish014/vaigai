#!/usr/bin/env bash
# Quick checks for your n8n webhooks. Usage: ./test-webhooks.sh https://your-n8n-host YOUR_KEY
H=${1:-http://localhost:5678}; K=${2:-dev-key}
j='Content-Type: application/json'
echo "-- assistant";curl -s -X POST "$H/webhook/vaigai-assistant" -H "$j" -H "x-vaigai-key: $K" -d '{"session_id":"t1","message":"ghee evlo?","lang":"en","basket":[],"context":{},"history":[]}';echo
echo "-- order";curl -s -X POST "$H/webhook/vaigai-order" -H "$j" -H "x-vaigai-key: $K" -d '{"order_id":"VGM-250110-TEST","items":[{"sku":"VGM-CURD-400g","qty":2}],"customer":{"name":"Test","phone":"9876543210"},"address":"12 Main St, Anna Nagar, Madurai 625020","slot":"By 5:30 AM"}';echo
echo "-- lead";curl -s -X POST "$H/webhook/vaigai-lead" -H "$j" -H "x-vaigai-key: $K" -d '{"type":"callback","phone":"9123456789","detail":"please call"}';echo
echo "-- status";curl -s "$H/webhook/vaigai-order-status?id=VGM-250110-TEST" -H "x-vaigai-key: $K";echo
echo "-- feedback";curl -s -X POST "$H/webhook/vaigai-feedback" -H "$j" -H "x-vaigai-key: $K" -d '{"order_id":"VGM-250110-TEST","rating":5,"comment":"great"}';echo
echo "-- unauthorised (expect 401)";curl -s -o /dev/null -w "%{http_code}\n" -X POST "$H/webhook/vaigai-lead" -H "$j" -H "x-vaigai-key: wrong" -d '{}'
