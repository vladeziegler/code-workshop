SCOUT_URL="${SCOUT_URL:?export SCOUT_URL=https://muse-scout-<you>.vercel.app}"
# usage: sh curl-wire.sh ["your question"] ["conversation-id"]
Q="${1:-What happened in AI news today? Two lines, with sources.}"
CONV="${2:-}"
BODY=$(python3 -c 'import json,sys; q=sys.argv[1]; c=sys.argv[2]; b={"messages":[{"id":"m1","role":"user","parts":[{"type":"text","text":q}]}]}; c and b.update(id=c); print(json.dumps(b))' "$Q" "$CONV")
curl -sS -N -X POST "$SCOUT_URL/api/chat" \
  -H 'content-type: application/json' \
  -d "$BODY"
