#!/usr/bin/env python3
"""Module 8 designed cards — HTML/CSS -> Playwright PNG. All content is real run data."""
import os
from playwright.sync_api import sync_playwright

OUT = os.path.abspath("../images")
BASE = """<meta charset="utf-8"><style>
body { margin:0; background:#0d1117; font-family:Helvetica,Arial,sans-serif; color:#c9d1d9; padding:28px; }
.card { background:#161b22; border:1px solid #30363d; border-radius:12px; overflow:hidden; }
.bar { background:#21262d; padding:10px 16px; display:flex; gap:8px; align-items:center; }
.dot { width:12px; height:12px; border-radius:50%; }
.bar .t { color:#8b949e; font-size:15px; margin-left:8px; font-family:Menlo,monospace; }
pre { margin:0; padding:22px 26px; font-family:Menlo,'SF Mono',monospace; font-size:21px; line-height:1.65; }
.dim{color:#8b949e} .blue{color:#6cc7ff} .green{color:#7ee787} .red{color:#ff7b72} .yellow{color:#e3b341}
.cap { color:#8b949e; font-size:16px; margin-top:14px; text-align:center; }
</style>"""

CARDS = {}
# ── 3. Fan-out timing — measured, with the honest variance line
CARDS["card-timing.png"] = (960, BASE + """
<div class="card"><div class="bar">
<span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span>
<span class="t">same two web searches, measured 4 rounds</span></div>
<pre><span class="dim"># sequential — one after the other</span>
market <span class="yellow">9.7s</span> → audience <span class="yellow">10.0s</span>        total <span class="red">19.7s</span>

<span class="dim"># Promise.all — in flight together</span>
market <span class="yellow">12.9s</span> ‖ audience <span class="yellow">7.9s</span>        total <span class="green">12.9s</span>

<span class="dim"># the honest print: parallel won 3 rounds of 4</span>
the fan-out's total = its <span class="blue">slowest branch</span></pre></div>
<div class="cap">Fan out when steps don't touch — and know the ceiling is the slowest branch, not half.</div>
""")

# ── 4. Grounded vs invented — the unconnected wire, both runs real
CARDS["card-grounded-vs-invented.png"] = (1180, BASE + """
<style>
.two { display:flex; gap:20px; }
.panel { flex:1; border-radius:12px; padding:22px 24px; }
.bad { background:#1c1214; border:1px solid #6e2a33; }
.good { background:#101a14; border:1px solid #2a6e42; }
.hd { font-size:20px; font-weight:bold; margin-bottom:2px; }
.bad .hd{color:#ff7b72} .good .hd{color:#7ee787}
.sub { color:#8b949e; font-size:15px; margin-bottom:14px; }
.panel ul { margin:0 0 0 20px; padding:0; font-size:17px; line-height:1.55; }
.panel li { margin:7px 0; }
.src { color:#8b949e; font-size:14.5px; margin-top:14px; border-top:1px solid #30363d; padding-top:10px; }
b { color:#fff; }
</style>
<div class="two">
<div class="panel bad"><div class="hd">✗ wire disconnected</div>
<div class="sub">same schema, same model — research fetched, never interpolated</div>
<ul>
<li>Invents a <b>wellness brand</b>: “Wear What Grounds You.” “A Spring Reset, Worn Well.”</li>
<li>Positioning built on “feeling grounded, present, and confident” — <b>none of it is Muse</b></li>
<li>No error, no warning — the pipeline completed</li>
<li>The typed <b>facts</b> field confessed: “No market-research materials were included”</li>
</ul>
<div class="src">run: scripts/unconnected-wire.ts · 2026-07-28</div></div>
<div class="panel good"><div class="hd">✓ wire connected</div>
<div class="sub">one line changed: the research interpolated into the prompt</div>
<ul>
<li>“<b>One Piece. Three Spring Plans.</b>” — built on repeat-wear demand</li>
<li>Facts cite <b>McKinsey / Business of Fashion</b>, <b>Wallpaper*</b>, <b>Pinterest Predicts 2026</b></li>
<li>Names the real <b>ASOS Muse Assembly</b> spring launch</li>
<li>Judge passed it on grounds a client could check</li>
</ul>
<div class="src">run: create_brief, runs id 18 · 2026-07-28</div></div>
</div>
<div class="cap">An unconnected wire doesn't error — the model fills the gap. The typed joint is what told the truth.</div>
""")

# ── 8. The agent's four parameters
CARDS["card-agent-anatomy.png"] = (960, BASE + ANNO + """
<div class="card"><div class="bar">
<span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span>
<span class="t">lib/agent.ts</span></div>
<pre>new ToolLoopAgent({
  <span class="blue">model</span>: openai("gpt-5.6-terra"),        <span class="mk">──①</span>
  <span class="blue">instructions</span>: "You are Muse Studio…",  <span class="mk">──②</span>
  <span class="blue">tools</span>: { web_search, create_brief },   <span class="mk">──③</span>
  <span class="blue">stopWhen</span>: isStepCount(8),              <span class="mk">──④</span>
})</pre>
<div class="legend">
<div class="lg"><span class="n">①</span><span class="w">model</span><span class="t2">which vendor answers <em>· swapping providers is one line</em></span></div>
<div class="lg"><span class="n">②</span><span class="w">instructions</span><span class="t2">the job description <em>· sent every step, not once</em></span></div>
<div class="lg"><span class="n">③</span><span class="w">tools</span><span class="t2">what it can DO <em>· each one a typed function you wrote</em></span></div>
<div class="lg"><span class="n">④</span><span class="w">stopWhen</span><span class="t2">the budget, in code <em>· leave it out and you get 20</em></span></div>
</div></div>
<div class="cap">A model, a job description, a set of abilities, and a budget. That is the whole definition.</div>
""")

# ── 9. The tool's four parameters
CARDS["card-tool-anatomy.png"] = (960, BASE + ANNO + """
<div class="card"><div class="bar">
<span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span>
<span class="t">exercises/03-tool.ts</span></div>
<pre>tool({
  <span class="blue">description</span>: "List the most recent runs this      <span class="mk">──①</span>
    system has logged. Use whenever the user asks
    what happened, what ran, or for history.",
  <span class="blue">inputSchema</span>: z.object({ limit: z.number() }),   <span class="mk">──②</span>
  <span class="blue">execute</span>: async ({ limit }) =&gt; { …your code… }   <span class="mk">──③</span>
})</pre>
<div class="legend">
<div class="lg"><span class="n">①</span><span class="w">description</span><span class="t2">how the model decides whether to call it <em>· it never sees your code, only this</em></span></div>
<div class="lg"><span class="n">②</span><span class="w">inputSchema</span><span class="t2">the arguments the model fills in <em>· checked before your function runs</em></span></div>
<div class="lg"><span class="n">③</span><span class="w">execute</span><span class="t2">your function. Anything can go in here <em>· a database, an API, a whole workflow</em></span></div>
</div></div>
<div class="cap">Three parts. The middle one is types you already know; the first one is where the actual work is.</div>
""")

# ── 10. The memory mechanism + the measured cost of it
CARDS["card-memory-array.png"] = (960, BASE + ANNO + """
<div class="card"><div class="bar">
<span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span>
<span class="t">npm run ex 22 — the whole mechanism, then its bill</span></div>
<pre>messages.push({ role: "user", content: text });
const r = await agent.generate({ <span class="blue">messages</span> });
messages.push(...r.steps.at(-1).response.messages);   <span class="mk">──①</span>

<span class="dim">turn 1</span>  2 msgs   <span class="yellow">37</span> input tokens
<span class="dim">turn 2</span>  4 msgs   <span class="yellow">76</span>
<span class="dim">turn 3</span>  6 msgs   <span class="yellow">107</span>
<span class="dim">turn 4</span>  8 msgs   <span class="yellow">138</span>   <span class="green">"people who commute by bike in cold cities"</span>
<span class="dim">control</span> 0 msgs   <span class="yellow">35</span>    <span class="red">"I don't have any earlier message…"</span></pre>
<div class="legend">
<div class="lg"><span class="n">①</span><span class="w">the whole trick</span><span class="t2">append what it said, so the next turn can read it <em>· forget this line and you get amnesia that looks like it works</em></span></div>
</div></div>
<div class="cap">The model is stateless. Memory is you re-sending the conversation — and paying for it again every turn.</div>
""")

# ═══════════════════════════════════════════════════════════════════════════
# Two-panel cards
# ═══════════════════════════════════════════════════════════════════════════

TWO = """<style>
.two { display:flex; gap:20px; }
.pan { flex:1; background:#161b22; border:1px solid #30363d; border-radius:12px; padding:20px 22px; }
.pan .h { font-size:18px; color:#6cc7ff; font-weight:bold; margin-bottom:3px; }
.pan .sh { color:#8b949e; font-size:14.5px; margin-bottom:14px; }
.pan code, .mono { font-family:Menlo,'SF Mono',monospace; font-size:16px; }
.pan ul { margin:0 0 0 19px; padding:0; font-size:16.5px; line-height:1.6; }
.pan li { margin:7px 0; }
.pan b { color:#fff; }
.k2 { font-family:Menlo,monospace; font-size:17px; color:#e3b341; }
</style>"""

# ── 11. What the type system buys you
CARDS["card-types-async.png"] = (1180, BASE + TWO + """
<div class="two">
<div class="pan"><div class="h">types — checked before it runs</div>
<div class="sh">Python you know · TypeScript today</div>
<pre style="padding:0;font-size:17px;line-height:1.75"><span class="dim">def f(x: int) -&gt; str:</span>
<span class="blue">function f(x: number): string</span>

<span class="dim">list[str]</span>          <span class="blue">string[]</span>
<span class="dim">dict</span>               <span class="blue">Record&lt;string, T&gt;</span>
<span class="dim">Optional[str]</span>      <span class="blue">string | null</span></pre>
<ul><li>The <b>editor</b> catches the typo, not the model</li>
<li><b>Nothing</b> is checked at runtime — types vanish at build</li></ul></div>

<div class="pan"><div class="h">async / await — the same word</div>
<div class="sh">and one genuinely new thing</div>
<pre style="padding:0;font-size:17px;line-height:1.75"><span class="dim">await f()</span>            <span class="blue">await f()</span>
<span class="dim">asyncio.gather(a, b)</span>  <span class="blue">Promise.all([a, b])</span></pre>
<ul><li><b>await</b> = "wait here, let other work continue"</li>
<li><b>Promise.all</b> = two model calls in flight at once — that's Part 3's fan-out, and it is the only new idea on this slide</li></ul></div>
</div>
<div class="cap">You already write both of these in Python. Today they wear different clothes.</div>
""")

# ── 12. Pydantic → Zod (translation, not a lesson)
CARDS["card-pydantic-zod.png"] = (1210, BASE + """
<style>
.map { display:flex; align-items:stretch; gap:0; }
.col { flex:1; background:#161b22; border:1px solid #30363d; border-radius:10px;
       padding:20px 24px; font-family:Menlo,'SF Mono',monospace; font-size:17px; line-height:2.0; }
.hd2 { font-family:Helvetica,Arial,sans-serif; font-size:13.5px; letter-spacing:2px;
       color:#6cc7ff; text-transform:uppercase; margin-bottom:10px; }
.mid { display:flex; flex-direction:column; justify-content:center; color:#4a5a72;
       font-size:22px; padding:44px 14px; gap:22px; }
b { color:#fff; }
</style>
<div class="map">
<div class="col"><div class="hd2">Module 7 — Pydantic</div>
<span class="blue">class</span> <b>CampaignBrief</b>(BaseModel):
  campaign: <span class="green">str</span>
  headlines: <span class="green">list[str]</span>
  facts: <span class="green">list[str]</span>
<span class="dim">…parse(text_format=CampaignBrief)</span></div>
<div class="mid"><div>⟶</div><div>⟶</div><div>⟶</div><div>⟶</div><div>⟶</div></div>
<div class="col"><div class="hd2">Today — Zod</div>
<span class="blue">const</span> <b>CampaignBrief</b> = z.object({
  campaign: <span class="green">z.string()</span>,
  headlines: <span class="green">z.array(z.string()).length(3)</span>,
  facts: <span class="green">z.array(z.string()).min(1)</span>,
})
<span class="dim">output: Output.object({ schema })</span></div>
</div>
<div class="cap">Same idea, one session later: .describe() steers the model · .length(3) catches it when steering fails.</div>
""")

# ── 13. Where each thing attaches
CARDS["card-callback-attach.png"] = (1180, BASE + TWO + """
<div class="two">
<div class="pan"><div class="h">on the constructor — what the agent IS</div>
<div class="sh">fixed when you build it</div>
<pre style="padding:0;font-size:16.5px;line-height:1.85">new ToolLoopAgent({
  <span class="blue">model</span>, <span class="blue">instructions</span>, <span class="blue">tools</span>,
  <span class="blue">stopWhen</span>,
  <span class="blue">toolsContext</span>, <span class="blue">runtimeContext</span>,
})</pre>
<ul><li>Context is <b>constructor-only</b> on an agent — when it varies per request, you build the agent per request</li></ul></div>

<div class="pan"><div class="h">on the call — what you WATCH</div>
<div class="sh">chosen per invocation</div>
<pre style="padding:0;font-size:16.5px;line-height:1.85">agent.generate({
  <span class="blue">prompt</span>, <span class="blue">messages</span>,
  <span class="blue">onStart</span>, <span class="blue">onStepEnd</span>,
  <span class="blue">onToolExecutionEnd</span>, <span class="blue">onEnd</span>,
})</pre>
<ul><li>One agent, three observers: a script that <b>prints</b>, a route that <b>writes a runs row</b>, a test that <b>asserts ≤3 steps</b> — no if-statements inside the agent</li></ul></div>
</div>
<div class="cap">What it is, versus what you're watching. The split is why one definition serves every caller.</div>
""")

# ── 14. Blind vs ticketed — both columns from the run of npm run ex 31
CARDS["card-blind-vs-ticket.png"] = (1180, BASE + """
<style>
.two { display:flex; gap:20px; }
.panel { flex:1; border-radius:12px; padding:22px 24px; }
.bad { background:#1c1214; border:1px solid #6e2a33; }
.good { background:#101a14; border:1px solid #2a6e42; }
.hd { font-size:20px; font-weight:bold; margin-bottom:2px; }
.bad .hd{color:#ff7b72} .good .hd{color:#7ee787}
.sub { color:#8b949e; font-size:15px; margin-bottom:14px; }
.panel ul { margin:0 0 0 20px; padding:0; font-size:16.5px; line-height:1.55; }
.panel li { margin:7px 0; }
.src { color:#8b949e; font-size:14.5px; margin-top:14px; border-top:1px solid #30363d; padding-top:10px; font-family:Menlo,monospace; }
b { color:#fff; }
</style>
<div class="two">
<div class="panel bad"><div class="hd">✗ the id was discarded</div>
<div class="sub">start_research returns { started: true }</div>
<ul>
<li>Answered the research question <b>immediately</b> — from memory</li>
<li>Its own worker finished <b>30.9s later</b>. The answer predates the research</li>
<li>Asked "is it done?" → <b>tools used: none</b>. Nothing to check, so it improvised</li>
<li>Nothing errored. Nobody could tell</li>
</ul>
<div class="src">job a29ca9e7 · npm run ex 31</div></div>
<div class="panel good"><div class="hd">✓ the id came back</div>
<div class="sub">start_research returns { job_id } + check_research</div>
<ul>
<li>"Research started (job id: <b>faa509f4</b>)"</li>
<li>Asked at 0s → <b>check_research</b> → "Status: pending"</li>
<li>Asked again at 25s → "Status: <b>ok</b>" + the findings it actually read</li>
<li>Declined to invent, because it had a cheaper way to be right</li>
</ul>
<div class="src">job faa509f4 · finished 15.4s</div></div>
</div>
<div class="cap">Same background work, same instant reply. A job id is the difference between reporting status and performing confidence.</div>
""")

# ═══════════════════════════════════════════════════════════════════════════
# Pattern diagrams — expansions of the shorthand inside the spine strip
# ═══════════════════════════════════════════════════════════════════════════

DIAG = """<style>
.row { display:flex; align-items:center; justify-content:center; }
.bx { border:1.5px solid #34435a; border-radius:10px; color:#aeb8c6; padding:13px 17px;
      text-align:center; font-size:16.5px; letter-spacing:0.5px; }
.bx .s { font-size:12.5px; color:#8b949e; letter-spacing:0; margin-top:4px; line-height:1.35; }
.bx.model { border-color:#6cc7ff; color:#6cc7ff; }
.bx.out { border-color:#7ee787; color:#7ee787; }
.bx.warn { border-color:#e3b341; color:#e3b341; }
.arr { color:#4a5a72; font-size:22px; padding:0 13px; }
.stack { display:flex; flex-direction:column; gap:12px; }
.note { text-align:center; color:#8b949e; font-size:14.5px; margin-top:12px; }
.note b { color:#6cc7ff; }
</style>"""

CARDS["diagram-router.png"] = (1250, BASE + DIAG + """
<div class="row">
<div class="bx">REQUEST</div>
<div class="arr">→</div>
<div class="bx model">CLASSIFY<div class="s">Output.object · z.enum</div></div>
<div class="arr">→</div>
<div class="bx warn">"full-kit"<div class="s">one string</div></div>
<div class="arr">→</div>
<div class="stack">
<div class="bx">research<div class="s">1 call</div></div>
<div class="bx">brief<div class="s">~4 calls</div></div>
<div class="bx out">full-kit<div class="s">~5 calls + 70s image</div></div>
</div>
</div>
<div class="note">The model returns a <b>label</b>. A <b>switch you wrote</b> picks the branch — it cannot reach past that switch.</div>
<div class="cap">Routing is a cost decision before it is an architecture decision.</div>
""")

CARDS["diagram-parallel.png"] = (1250, BASE + DIAG + """
<div class="row">
<div class="bx">REQUEST</div>
<div class="arr">→</div>
<div class="stack">
<div class="bx model">MARKET<div class="s">own instructions · own schema<br>trends · pricePosition · risk</div></div>
<div class="bx model">AUDIENCE<div class="s">own instructions · own schema<br>tensions · languageToAvoid</div></div>
<div class="bx model">COMPETITIVE<div class="s">own instructions · own schema<br>claimedTerritory · whiteSpace</div></div>
</div>
<div class="arr">→</div>
<div class="bx out">SYNTHESISE<div class="s">the only call that sees all three</div></div>
</div>
<div class="note">Different <b>instructions</b> and a different <b>Output schema</b> per branch. Same call three times is not specialists — it's retries.</div>
<div class="cap">A fan-out is a design for disagreement. If the branches can't contradict each other, you didn't need three.</div>
""")

CARDS["diagram-orchestrator.png"] = (1250, BASE + DIAG + """
<div class="row">
<div class="bx model">PLANNER<div class="s">Output.object · angles[].max(4)</div></div>
<div class="arr">→</div>
<div class="bx warn">a typed plan<div class="s">{ label, question, kind } × n</div></div>
<div class="arr">→</div>
<div class="stack">
<div class="bx model">worker<div class="s">kind: market</div></div>
<div class="bx model">worker<div class="s">kind: culture</div></div>
<div class="bx model">worker<div class="s">kind: competitive</div></div>
</div>
<div class="arr">→</div>
<div class="bx out">SYNTHESIS</div>
</div>
<div class="note">You didn't choose the width — the model did. <b>.max(4) in the schema</b> is the only thing between you and a $40 request.</div>
<div class="cap">Orchestrator-worker: the plan picks which specialist runs, not just what it researches.</div>
""")

CARDS["diagram-evaluator.png"] = (1250, BASE + DIAG + """
<style>.back { display:flex; justify-content:center; align-items:center; margin-top:14px; color:#e3b341; font-size:15px; }
.back .l { border:1px dashed #6b5a2e; border-radius:8px; padding:7px 16px; }</style>
<div class="row">
<div class="bx model">DRAFT ONCE<div class="s">outside the loop</div></div>
<div class="arr">→</div>
<div class="bx model">EVALUATE<div class="s">scores, not a verdict<br>specificity · grounding · audience</div></div>
<div class="arr">⇄</div>
<div class="bx warn">YOUR THRESHOLD<div class="s">briefIsGoodEnough() — plain code</div></div>
<div class="arr">→</div>
<div class="bx out">SHIP<div class="s">or: budget spent · plateau</div></div>
</div>
<div class="back"><div class="l">↩ issues + suggestions → the next draft &nbsp;·&nbsp; max 3 rounds &nbsp;·&nbsp; stop early if the score stops rising</div></div>
<div class="cap">The model scores it. Your code decides when to stop. Ask a model "is this good enough?" and you've handed it the stopping decision.</div>
""")

CARDS["diagram-delegation.png"] = (1250, BASE + DIAG + """
<style>.wrap { border:1.5px dashed #4a5a72; border-radius:12px; padding:14px 16px 10px; }
.wl { color:#8b949e; font-size:12.5px; text-align:center; margin-top:8px; }</style>
<div class="row">
<div class="bx model">MAIN AGENT<div class="s">creative lead · knows how to delegate</div></div>
<div class="arr">→</div>
<div class="wrap">
<div class="row">
<div class="bx">research<div class="s">a tool…</div></div>
<div class="arr">→</div>
<div class="bx model">RESEARCH AGENT<div class="s">own instructions · own tools<br>own stopWhen(6)</div></div>
</div>
<div class="wl">…whose execute() is another agent's .generate()</div>
</div>
<div class="arr">→</div>
<div class="bx out">a summary<div class="s">the only thing the parent ever sees</div></div>
</div>
<div class="note">Measured: the child spent <b>44,854 tokens</b> researching. The parent's context saw <b>2,310</b> — just the summary.</div>
<div class="cap">Delegate when a step deserves its own instructions, its own tools, and its own budget.</div>
""")

# ═══════════════════════════════════════════════════════════════════════════
# State and jobs
# ═══════════════════════════════════════════════════════════════════════════

CARDS["diagram-memory.png"] = (1250, BASE + TWO + """
<div class="two">
<div class="pan"><div class="h">conversations — short-term</div>
<div class="sh">the message array, saved verbatim</div>
<pre style="padding:0;font-size:16px;line-height:1.8"><span class="blue">id</span>          text  primary key
<span class="blue">messages</span>    jsonb ModelMessage[]
<span class="blue">updated_at</span>  timestamptz</pre>
<ul><li>Complete, in order, exactly what was said</li>
<li><b>Re-sent in full every turn</b> — your biggest input-token line</li>
<li>Grows without bound → prune or summarise (<span class="k2">pruneMessages()</span>)</li></ul></div>

<div class="pan"><div class="h">memories — long-term</div>
<div class="sh">facts the agent chose to keep</div>
<pre style="padding:0;font-size:16px;line-height:1.8"><span class="blue">conversation_id</span>  text
<span class="blue">fact</span>             text
<span class="blue">created_at</span>       timestamptz</pre>
<ul><li>One line per thing that mattered</li>
<li>Cheap enough to inject into instructions <b>forever</b></li>
<li>Survives the transcript being thrown away</li></ul></div>
</div>
<div class="cap">The transcript is what was said. The memories are what mattered. Production systems need both.</div>
""")

CARDS["diagram-live-vs-queued.png"] = (1250, BASE + DIAG + """
<style>.lane { display:flex; align-items:center; margin:0 0 16px; }
.tag { width:118px; font-size:13px; letter-spacing:1.5px; color:#8b949e; }
.tag.a { color:#ff7b72; } .tag.b { color:#7ee787; }</style>
<div class="lane"><div class="tag a">LIVE CALL</div>
<div class="row">
<div class="bx">request</div><div class="arr">→</div>
<div class="bx warn">await the work<div class="s">60–80s</div></div><div class="arr">→</div>
<div class="bx" style="border-color:#6e2a33;color:#ff7b72">✗ 504 at 25s<div class="s">FUNCTION_INVOCATION_TIMEOUT</div></div>
</div></div>
<div class="lane"><div class="tag b">QUEUED JOB</div>
<div class="row">
<div class="bx">request</div><div class="arr">→</div>
<div class="bx">insert <b>jobs</b><div class="s">intent</div></div><div class="arr">→</div>
<div class="bx out">job_id back<div class="s">0.4s measured</div></div><div class="arr">→</div>
<div class="bx">after() works<div class="s">writes <b>runs</b> — fact</div></div><div class="arr">→</div>
<div class="bx out">check reads <b>runs</b><div class="s">never the queue</div></div>
</div></div>
<div class="note">Same work, same model. The difference is <b>what comes back, and when</b>.</div>
<div class="cap">A queue row says "pending" forever after a worker dies. The ledger can only tell you what happened.</div>
""")

# ── The agent runner, across the layers (vertical stack)
CARDS["agent-runtime.png"] = (1250, BASE + """
<style>
.lay { display:flex; align-items:center; background:#161b22; border:1px solid #30363d;
       border-radius:10px; padding:13px 18px; margin-bottom:10px; }
.lay .n2 { width:150px; font-size:13px; letter-spacing:2px; color:#6cc7ff; }
.lay .c { flex:1; font-size:16.5px; color:#aeb8c6; }
.lay .c em { color:#8b949e; font-style:normal; font-size:14px; }
.lay.hot { border-color:#6cc7ff; }
.dec { display:flex; gap:12px; margin-top:8px; }
.dec .o { flex:1; border:1.5px solid #34435a; border-radius:9px; padding:11px 13px;
          text-align:center; color:#aeb8c6; font-size:15.5px; }
.dec .o .s { display:block; font-size:12.5px; color:#8b949e; margin-top:4px; line-height:1.35; }
.dec .o.t3 { border-color:#6cc7ff; color:#6cc7ff; }
.ret { text-align:center; color:#7ee787; font-size:15px; margin-top:12px; }
</style>
<div class="lay"><div class="n2">YOU CALL IT</div><div class="c">a script · a test · the terminal UI <em>· agent.generate() · agent.stream()</em></div></div>
<div class="lay"><div class="n2">THE AGENT</div><div class="c">model + instructions + tools + stopWhen <em>· one object, defined once</em></div></div>
<div class="lay hot"><div class="n2">THE LOOP</div><div class="c">call the model → read the result → decide → repeat, <b>until stopWhen</b>
<div class="dec">
<div class="o t3">answer<span class="s">text streams back now</span></div>
<div class="o t3">call a tool<span class="s">your typed function runs</span></div>
<div class="o t3">delegate<span class="s">a tool that IS another agent</span></div>
<div class="o t3">start a job<span class="s">return a ticket, work later</span></div>
</div></div></div>
<div class="lay"><div class="n2">TOOLS</div><div class="c">typed functions you wrote <em>· a whole workflow can hide inside one of them</em></div></div>
<div class="lay"><div class="n2">CALLBACKS</div><div class="c">onStepEnd · onToolExecutionEnd <em>· watching from the side, never steering</em></div></div>
<div class="ret">↩ text and tool events stream back while the loop is still running</div>
<div class="cap">The model picks the path at runtime. That is the whole difference between an agent and a workflow.</div>
""")

# ── The architectural difference, with the measured cost of it (ex 12)
CARDS["diagram-agent-vs-workflow.png"] = (1250, BASE + DIAG + """
<style>.lane { display:flex; align-items:center; margin:0 0 18px; }
.tag { width:128px; font-size:13px; letter-spacing:1.5px; }
.tag.a { color:#8b949e; } .tag.b { color:#6cc7ff; }
.meas { text-align:center; color:#8b949e; font-size:15px; margin-top:4px; }
.meas b { color:#e3b341; }</style>
<div class="lane"><div class="tag a">WORKFLOW</div>
<div class="row">
<div class="bx">step A</div><div class="arr">→</div>
<div class="bx">step B</div><div class="arr">→</div>
<div class="bx">step C</div><div class="arr">→</div>
<div class="bx out">done<div class="s">you can draw it before it runs</div></div>
</div></div>
<div class="lane"><div class="tag b">AGENT</div>
<div class="row">
<div class="bx">a request</div><div class="arr">→</div>
<div class="bx model">THE MODEL<div class="s">decides, every step</div></div>
<div class="arr">→</div>
<div class="stack">
<div class="bx">answer</div>
<div class="bx">call a tool ↺</div>
<div class="bx">delegate ↺</div>
</div>
<div class="arr">→</div>
<div class="bx out">done<div class="s">you find out by running it</div></div>
</div></div>
<div class="meas">Measured on the same three requests: agent-routed <b>15 calls / 105.6s</b> · workflow-routed <b>6 calls / 35.0s</b> — and the agent's path changed between runs.</div>
<div class="cap">Same SDK, same model, same work. The only difference is who holds the control flow — and that is the decision you are learning to make.</div>
""")

with sync_playwright() as p:
    b = p.chromium.launch()
    for name, (width, html) in CARDS.items():
        open("_tmp.html", "w").write(html)
        # height is a floor only — full_page=True lets content set the real height.
        # Keep it low so short diagram strips don't ship with dead space below them.
        pg = b.new_page(viewport={"width": width, "height": 180}, device_scale_factor=2)
        pg.goto("file://" + os.path.abspath("_tmp.html"))
        pg.wait_for_timeout(300)
        pg.screenshot(path=f"{OUT}/{name}", full_page=True)
        pg.close()
        print("made", name)
    b.close()
os.remove("_tmp.html")
