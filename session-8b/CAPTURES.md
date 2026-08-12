# Session 8b — capture map (all from the real build run, 2026-08-05)

Generator scripts live in `captures/` (`drive_ui.py`, `drive_prod.py`,
`drive_job.py`, `drive_muse.py`, `drive_prod_muse.py` — Playwright, python3.11
framework build). Slide numbers refer to SLIDES.md.

| File | What it shows | Slide |
|---|---|---|
| `step01-tui-local-transcript.txt` | local TUI: web_search waiting→executing→done, sourced Seahawks answer | 7 |
| `step03-beat1-302-headers.txt` | fresh project: 302 → vercel.com/sso-api (Deployment Protection) | 11 |
| `step03-raw-wire.txt` | full raw SSE stream from deployed scout (reasoning, 2 searches, sources, finish) | 12 |
| `step03-tui-remote-transcript.txt` | remote TUI against deployed scout, keyless package | 13 |
| `step04-vercel-logs-follow.txt` | `vercel logs --follow`: the `[scout] step 0 · {tokens} · stop` line from prod | 14 |
| `ui-empty.png` / `ui-typed.png` | console empty state + composer | 15 |
| `ui-cors-blocked.png` | Act 1: "Failed to fetch" banner, curl working elsewhere | 18 |
| `step05-naive-proxy-timing.txt` | 38.9s vs 0.55s first byte | 19 |
| `step05-preflight-ok.txt` | preflight 204 with the three CORS headers | 20 |
| `ui-streaming.png` / `ui-final.png` | localhost console streaming from deployed scout; chips + source cards | 21 |
| `step06-beat3-broken-mid.png` | env var missing: console POSTs to itself, 404 HTML in banner | 23 |
| `step06-prod-working.png` | deployed console → deployed scout, sourced answer | 24 |
| `step08-ticket-queued.png` | ticket card seconds after ask | 28 |
| `step08-ticket-done.png` | full page: 3 conversations in sidebar, deep_dive ✓, ticket done + report | 26, 29 |
| `step08-curl-ticket.txt` | same job id redeemed via curl | 29 |
| `step09-stages-running.png` | muse stage rail live: router ✓ · fan-out running · create_brief running | 33 (alt) |
| `step09-muse-final.png` | the money shot: judge ✗ "Draft 1 rejected · spec 2 · ground 5 · aud 4", redraft running | 2, 33 |
| `step10-prod-muse.png` | prod console driving deployed muse-studio (chips + ticket; stage rail pending muse redeploy) | 35 |

Staleness rule: if any code or copy on these screens changes, the capture is
retaken before the deck ships — file names stay stable.
