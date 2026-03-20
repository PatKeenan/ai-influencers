# Project Quick Reference — QUICK_REF.md

A fast onboarding document. Read this first in any new session before touching other files.

---

## What This Project Is

A living intelligence map of ~20-30 key practitioners in AI engineering. It powers:
1. A **graph visualization** (React + D3, see `influence-graph.jsx`) showing who influences who
2. A **daily digest** (pipeline not yet built) surfacing what these people are writing about

The four tracked domains: **Context Engineering · Evaluations · Agent Orchestration · AI-Assisted Dev**

---

## File Map

| File | Purpose | Edit frequency |
|---|---|---|
| `PROJECT_INSTRUCTIONS.md` | System prompt / rules for the AI | Rarely — only if mission changes |
| `QUICK_REF.md` | This file — onboarding and cheatsheet | Occasionally |
| `GRAPH_NODES.md` | Full registry of all nodes with metadata | Every time a node is added or verified |
| `GRAPH_EDGES.md` | Full registry of all edges with type/weight | Every time an edge is added or verified |
| `HUMAN_TODO.md` | Blocked tasks queued for human action | Frequently — AI adds, human resolves |
| `RESEARCH_LOG.md` | Audit trail of research sessions | Every session |
| `influence-graph.jsx` | The actual visualization component | When nodes/edges change |

---

## Current State (March 2026)

- **37 nodes** — Layer 0 (1 anchor), Layer 1 (17), Layer 2 (19)
- **74 edges** — 59 VERIFIED, 15 INFERRED (need human X access to confirm)
- **5 candidates** pending activity verification (in GRAPH_NODES.md)
- **3 open tasks** in HUMAN_TODO.md
- **Digest pipeline**: not yet started

---

## The Three Node Rules (Never Violate)

1. **Active** — must have posted original content within 4 months. If unverifiable → HUMAN_TODO
2. **Original thinkers** — synthesizers, builders, framers. Not aggregators.
3. **Application layer** — AI engineering/product/tooling. Not pure ML research.

---

## How to Add a New Node

1. Confirm they pass all three rules (two independent sources minimum)
2. Add full entry to `GRAPH_NODES.md`
3. Identify edges to existing nodes, add to `GRAPH_EDGES.md`
4. Add to `PEOPLE` array in `influence-graph.jsx`
5. Add edges to `EDGES` array in `influence-graph.jsx`
6. Log the session in `RESEARCH_LOG.md`
7. If anything was unverifiable, add to `HUMAN_TODO.md` before closing

---

## When to Stop and Ask the Human

- X/Twitter fetch fails or returns no results → add to HUMAN_TODO, don't guess
- Can't confirm last post date → add to HUMAN_TODO as VERIFY ACTIVITY
- Two sources disagree on someone's role or affiliation → add to HUMAN_TODO as CONFLICTING INFO
- A candidate looks promising but doesn't clearly pass the 3 rules → add to HUMAN_TODO, don't add to graph
- An edge feels right but can't be directly evidenced → mark INFERRED in GRAPH_EDGES.md, add to HUMAN_TODO for verification

---

## Snowball Methodology

When expanding the graph, start from the highest-connectivity nodes and mine:
1. **simonwillison.net/tags/** — tag counts reveal who Simon engages with most
2. **Latent Space episode notes** — always link everyone mentioned
3. **Conference speaker lists** — AIE World's Fair, AIE Summit, AIE Code Summit
4. **Book acknowledgments** — Chip Huyen's "AI Engineering" reviewers, swyx's recommended reading lists
5. **Course materials** — Hamel + Shreya's AI Evals course guest lecturers
6. **GitHub co-contributors** — LangChain, OpenHands, Instructor repos

---

## Key Relationships to Know

| Relationship | Strength | Type |
|---|---|---|
| swyx ↔ alessio | 3 | Co-hosts Latent Space — every episode |
| hamel ↔ shreya | 3 | Co-teach AI Evals course together |
| harrison ↔ lance | 2.5 | LangChain colleagues + LS context engineering episode |
| dbreunig → lance | 2.5 | "How Contexts Fail" is the backbone of Lance's LS episode |
| simon ↔ karpathy | 2 | Simon's most-cited external voice (39 tags) |
| harrison ↔ shreya | 2 | Co-authored research paper |

---

## Ingestion Pipeline (Future Work)

When ready to build:
- Stack: Cloudflare Workflows cron → RSS/X/GitHub/Substack/YouTube
- Processing: Entity extraction, topic modeling, novelty scoring  
- Output: Daily digest email + graph layer 2 (idea/concept nodes)
- Feeds per person are tracked in `GRAPH_NODES.md` under the `feeds` field
- Start with static RSS (every node has a feed listed) before tackling X API
