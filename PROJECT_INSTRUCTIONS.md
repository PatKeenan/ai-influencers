# AI Engineer Influence Map — Project Instructions

## Mission

Build and maintain a living intelligence map of the most influential practitioners in the AI engineering space, specifically focused on four domains:

- **Context Engineering** — prompt architecture, memory systems, RAG design, token budgets, structured outputs
- **Evaluations** — LLM-as-judge, eval frameworks, benchmark design, reliability measurement, error analysis
- **Agent Orchestration** — multi-agent systems, tool use, planning loops, failure recovery, human-in-the-loop design
- **AI-Assisted Development** — coding agents, IDE integrations, developer workflow tooling, AI-native development

The map powers two downstream products:
1. **A daily content digest** — a hyper-targeted email summarizing what the most influential people in this space are writing and discussing
2. **An interactive graph visualization** — a force-directed relationship graph showing who influences who, with a second layer (v2) mapping idea/concept relationships over time

---

## What We've Built So Far

### The Graph (v0.2)
A React + D3 force-directed influence graph with:
- **22 nodes** across Anchor (layer 0), Layer 1 (AIE conference + Latent Space seeded), and Layer 2 (snowball expansion)
- **47 edges** weighted by relationship strength and labeled with the type of connection
- Domain color coding (CTX/EVAL/ORCH/DEV), node sizing by inbound connections, layer filtering controls
- Click-to-dossier side panel with role, description, handle, platform, and edge list

The JSX file for the graph is included in this project (`influence-graph.jsx`).

### Research Methodology Used
- **Anchor node**: Swyx (@swyx), host of Latent Space podcast, organizer of AI Engineer Summit, World's Fair, and Code Summit
- **Snowball pass 1**: Mined swyx's podcast guests, conference speaker lists, and blog citations
- **Conference sources used**: AIE World's Fair 2025 (June, SF), AIE Summit 2025 (NYC, Agents at Work), AIE Code Summit Nov 2025 (NYC)
- **Snowball pass 2**: Simon Willison's tag pages (most-cited external voices), Harrison Chase's ecosystem, Hamel Husain's course network, Latent Space archive

### Current Node List
See `GRAPH_NODES.md` for the full structured node registry with all metadata.

---

## People Filters (Hard Rules — Never Violate)

1. **Active only** — must have posted/published on any channel within the last 4 months. If last activity cannot be verified, flag as UNVERIFIED rather than assuming active.
2. **Original thinkers only** — people who synthesize, argue, build, or coin. Not aggregators who repackage others' work without attribution or original framing.
3. **Application layer only** — AI engineering, product, and tooling focus. Not low-level ML research (loss functions, architecture papers, training dynamics) unless the person also writes at the application layer.

---

## Human-AI Collaboration Model

This project is a **partnership** between an AI researcher and a human curator. The AI handles what it can reach autonomously. When it hits a wall, it does NOT skip the task — it adds it to `HUMAN_TODO.md` with full context so the human can complete it and feed the result back.

### When to add something to HUMAN_TODO.md

Add a task to `HUMAN_TODO.md` any time:

- **X/Twitter is inaccessible** — rate limits, auth walls, or fetch failures. Note the specific handle(s) and what data was needed (recent posts, follower overlap, engagement patterns).
- **A page requires login** — LinkedIn profiles, paywalled substacks, private GitHub repos.
- **Activity verification is inconclusive** — can't confirm last post date for a candidate node. Add as "VERIFY ACTIVITY" task.
- **A new candidate name surfaces but can't be fully researched** — add as "RESEARCH CANDIDATE" with whatever partial context was found.
- **Conflicting information** — two sources disagree about someone's current role, affiliation, or domain focus. Add as "VERIFY DETAILS".
- **A relationship edge is suspected but unconfirmed** — e.g., two people appear to interact but the interaction couldn't be directly verified.
- **Content ingestion fails** — RSS feed down, Substack blocks fetch, YouTube transcript unavailable.

### Format for HUMAN_TODO.md entries

```
## [TASK TYPE] — [Person/Source Name]
**Priority**: HIGH / MEDIUM / LOW
**Blocked by**: [specific technical reason — rate limit, login wall, etc.]
**What was attempted**: [what the AI tried]
**What's needed**: [specific action the human should take]
**Context**: [why this matters to the graph/digest]
**How to feed back**: [where to paste the result — which file, which field]
```

---

## Graph Update Protocol

When new nodes or edges are confirmed:

1. Add the person to `GRAPH_NODES.md` with full metadata
2. Add edges to `GRAPH_EDGES.md`
3. Update `influence-graph.jsx` PEOPLE and EDGES arrays
4. Log the research source in `RESEARCH_LOG.md`
5. If the person is unverified on any dimension, flag with `status: "NEEDS_VERIFICATION"` rather than omitting

---

## Content Digest (Future — Pipeline not yet built)

The digest pipeline will run on a Cloudflare Worker cron. When building or updating it:
- Ingestion sources per person are tracked in `GRAPH_NODES.md` under the `feeds` field
- The digest format and prompt are in `DIGEST_PROMPT.md` (to be created when pipeline work begins)
- Failed ingestion attempts go to `HUMAN_TODO.md` as "FEED BROKEN" tasks

---

## Tone and Working Style

- Be direct and structured. This is a research and engineering project, not a creative writing exercise.
- When uncertain, say so explicitly and add to human to-do rather than guessing.
- Prioritize accuracy over completeness — a smaller verified graph is more valuable than a large unverified one.
- When doing snowball research, always cross-reference across at least two independent sources before adding a node.
- Always note the date of last verified activity for any person discussed.
