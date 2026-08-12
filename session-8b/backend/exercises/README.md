# Muse Scout — exercise ladder

Each exercise proves one claim from the session, from a terminal. Run with
`npm run ex <number>` (extra args pass through). `SCOUT_URL` defaults to
`http://localhost:3000`; export your deployed URL to run against production.

```bash
export SCOUT_URL=https://muse-scout-<you>.vercel.app
```

| # | File | Proves | Run |
|---|---|---|---|
| 01 | `01-tui-local.ts` | The whole agent is a library — no server anywhere | `npm run tui` |
| 02 | `02-wire-reader.ts` | The plug is bytes: every UIMessage chunk, labeled + timed | `npm run ex 02` |
| 03 | `03-shared-memory.ts` | State lives behind the socket: join a browser conversation by id | `npm run ex 03 <conversation-id>` |
| 04 | `04-job-poller.ts` | The claim ticket is interface: redeem a job id from a script | `npm run ex 04 <job-id>` |
| 05 | `05-foreign-parts.ts` | `data-*` parts are self-describing — dump a richer socket's stages | `npm run ex 05 <muse-url>` |

The clients that contain *no agent code at all* live in `../../clients/`:
`curl-wire.sh` (the raw bytes) and `tui-remote.ts` (a full terminal UI whose
package.json has no `@ai-sdk/openai` and no key).

## Things that will bite you

1. **`data: [DONE]`** — the stream ends with a terminator that is not JSON.
   Skip it before parsing (every parser here does).
2. **New Vercel projects ship with Deployment Protection ON** — your first
   curl gets a 302 to an SSO page, not a stream. Dashboard → Deployment
   Protection → off. The platform fronts your socket.
3. **CORS errors live in the browser console**, not the response body — and
   curl will keep succeeding while every browser fails. Curl is not a browser.
4. **A proxy that `await`s the body has un-streamed your stream.** Measured
   here: 0.55s vs 38.9s to first byte, same agent, same answer. If you must
   relay, pipe: `new Response(upstream.body)`.
5. **`NEXT_PUBLIC_` vars inline at BUILD time.** Set them before the build;
   after changing one, redeploy — a restart does nothing.
6. **The conversation id is client-minted.** A new id is a new conversation —
   that's the sidebar's "New chat", not a bug. Any plug that presents the
   same id gets the same history.
7. **Don't write to the database per token.** Stream to the eye, checkpoint
   to the database (the deep-dive worker writes once, at the end; the UI
   polls every 2s).
