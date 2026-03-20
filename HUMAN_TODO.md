# Human To-Do Queue — HUMAN_TODO.md

This file is maintained by the AI. When a task can't be completed autonomously — due to auth walls, rate limits, fetch failures, or needing human judgment — it gets added here instead of being dropped.

**How this works:**
1. AI adds a task below with full context
2. Human completes the task and pastes result back into the relevant file
3. Human marks the task `[DONE]` and notes which file was updated
4. AI picks up from there in the next session

Priority levels: 🔴 HIGH (blocks graph accuracy) · 🟡 MEDIUM (improves confidence) · 🟢 LOW (nice to have)

---

## Open Tasks

---

### 🟡 [VERIFY EDGES] — 12 INFERRED edges need X/Twitter confirmation
**Blocked by**: X rate limits / auth wall on direct tweet lookup
**What was attempted**: Web search for direct engagement between these pairs — results were inconclusive or unavailable
**What's needed**: For each pair below, check if they've directly @-mentioned, quote-tweeted, or replied to each other in 2024-2025. A single confirmed interaction upgrades the edge from INFERRED → VERIFIED.

Pairs to check (all in `GRAPH_EDGES.md`, marked INFERRED):
- harrison ↔ dex (context/harness engineering discourse)
- eugene ↔ chip (peer citation)
- jason ↔ chip (AI engineering discourse)
- brennan ↔ beyang (open source agent ecosystem)
- eno ↔ brennan (production coding agent discourse)
- catasta ↔ eno (autonomous agent design)
- dbreunig ↔ dex (context engineering term)
- nathan ↔ hamel (evals overlap)
- nathan ↔ chip (AI engineering evals)
- karpathy ↔ yegge (vibe coding / IDE discourse)
- karpathy ↔ leerob (Cursor / coding agents)
- chip ↔ harrison (AI engineering ecosystem)

**How to feed back**: Update the Verified column in `GRAPH_EDGES.md` from INFERRED → YES or remove the edge. Note the specific tweet/post as evidence if found.

---

### 🟡 [VERIFY ACTIVITY] — 5 candidate nodes need last-post-date check
**Blocked by**: X rate limits; some blogs don't expose date metadata cleanly in search results
**What was attempted**: Web search for recent posts — couldn't confirm dates with certainty for these specific handles
**What's needed**: Visit each profile and confirm they've posted original content within the last 4 months (since ~November 2025). Copy their most recent post date and a one-line summary of the post topic.

Candidates (from `GRAPH_NODES.md` — Candidates Under Consideration table):
- @naman_jain_ (Naman Jain — Cursor / LiveCodeBench)
- @itamarfriedman (Itamar Friedman — Qodo)
- @john_b_yang (John Yang — SWE-bench)
- @genmon (Matt Webb — coined "context plumbing")
- @rasbt (Sebastian Raschka — appeared SAIL Live #6 Feb 2026 with swyx)

**How to feed back**: For each person, add a row to the Candidates table in `GRAPH_NODES.md` with last verified date and a note. If they pass the 4-month rule AND write original content (not just retweets), flag as "READY TO ADD" so the AI can research and add them to the graph in the next session.

---

### 🟢 [RESEARCH CANDIDATE] — Matt Webb (@genmon)
**Blocked by**: Limited web presence — blog is at interconnected.org, not well-indexed
**What was attempted**: Found that Simon Willison cited Matt Webb coining "context plumbing" (Nov 2025). One additional Simon cite. Could not verify ongoing volume of AI engineering content.
**What's needed**: Visit interconnected.org and check: (1) how frequently he posts on AI engineering topics, (2) whether it's original synthesis vs. reaction content, (3) last post date
**Context**: If he's actively writing original AI engineering content, he'd connect into the context engineering cluster. The "context plumbing" concept is genuinely distinct from "context engineering" and worth tracking.
**How to feed back**: Add findings as a comment in the Candidates table in `GRAPH_NODES.md`

---

## Completed Tasks

*None yet — this file was just created.*

---

## How to Add a Task (for the AI)

When adding a new blocked task, use this template:

```
### [PRIORITY EMOJI] [TASK TYPE] — [Person or Source Name]
**Blocked by**: [specific technical reason]
**What was attempted**: [what the AI tried before giving up]
**What's needed**: [exactly what the human should do — be specific]
**Context**: [why this matters to the graph or digest]
**How to feed back**: [which file to update, which field]
```

Task types: VERIFY EDGES · VERIFY ACTIVITY · RESEARCH CANDIDATE · FEED BROKEN · CONFLICTING INFO · LOGIN REQUIRED · SCRAPE NEEDED
