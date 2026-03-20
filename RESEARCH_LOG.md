# Research Log — RESEARCH_LOG.md

Audit trail of all research sessions: what was investigated, what was found, what was added, what was blocked.

---

## Session 001 — Initial Seed + Layer 1
**Date**: March 2026
**Approach**: Anchor on swyx → mine AIE conference speaker lists → cross-reference Latent Space episode archive
**Sources consulted**:
- AIE World's Fair 2025 speaker list (June, SF — 3,000 attendees)
- AIE Summit 2025 speaker list (NYC, Agents at Work theme)
- AIE Code Summit Nov 2025 speaker list (NYC, Nov 19-22)
- Latent Space podcast archive (latent.space — ~179 episodes through Feb 2026)
- swyx.io and swyx X profile

**Nodes added**: swyx (anchor), alessio, simon, harrison, hamel, shreya, eugene, jason, jeremy, dex, sasha, beyang, yegge, leerob, catasta, eno, brennan, lance
**Nodes removed during session**: Greg Kamradt — did not appear in any 2025 conference source; moved to ring 2 candidate (not yet in candidates table)
**Edges added**: 19 swyx-anchor edges + 17 layer-1 internal edges
**Blockers encountered**: X rate limits prevented direct verification of several INFERRED edges — logged in HUMAN_TODO.md

---

## Session 002 — Layer 2 Snowball
**Date**: March 2026
**Approach**: Run independent snowball passes from the 5 highest-connectivity non-anchor nodes (Simon, Harrison, Hamel, Lee Robinson/Cursor orbit, Beyang/Sourcegraph orbit)
**Sources consulted**:
- simonwillison.net/tags/ — full tag page (most-cited external people, by tag count)
- simonwillison.net/tags/ai-assisted-programming/ — confirmed Andrej Karpathy (39 citations), Steve Yegge
- simonwillison.net/tags/context-engineering/ — confirmed dbreunig citation
- simonwillison.net/tags/ai-agents/ — confirmed Matt Webb "context plumbing" coin
- Chip Huyen's "AI Engineering" book acknowledgments page (github.com/chiphuyen/aie-book) — confirmed Hamel Husain, Jeremy Howard, Lance Martin, Nathan Lambert as reviewers/cited figures
- Latent Space 2025 AI Engineering Reading List (latent.space/p/2025-papers) — confirmed Nathan Lambert, Chip Huyen, Lilian Weng placement
- SAIL Live #6 Feb 2026 — confirmed Nathan Lambert + swyx + Sebastian Raschka

**Layer 2 nodes added**: chip (Chip Huyen), dbreunig (David Breunig), nathan (Nathan Lambert), karpathy (Andrej Karpathy)
**Edges added**: 11 layer-2 edges (mix of VERIFIED and INFERRED)

**Candidates surfaced but not yet added** (added to GRAPH_NODES.md candidates table):
- Naman Jain (@naman_jain_) — Cursor / LiveCodeBench
- Itamar Friedman (@itamarfriedman) — Qodo, multi-year AIE Top Speaker
- John Yang (@john_b_yang) — SWE-bench creator, LS NeurIPS 2025 episode
- Matt Webb (@genmon) — "context plumbing" coinage, cited by Simon
- Sebastian Raschka (@rasbt) — SAIL Live #6, needs application-layer focus check

**Blockers encountered**:
- X rate limits — could not verify 12 INFERRED edges directly → added to HUMAN_TODO.md
- Matt Webb's blog (interconnected.org) — insufficient index results to assess volume/frequency → added to HUMAN_TODO.md

---

## Session 003 — Top-5 Node Snowball Expansion
**Date**: March 2026
**Approach**: Deep research on the 5 highest-connectivity non-anchor nodes (Simon Willison, Harrison Chase, Chip Huyen, Hamel Husain, Andrej Karpathy). Searched X/Twitter activity, blog posts, conference appearances, book acknowledgments, and co-author networks for 2025-2026.
**Sources consulted**:
- simonwillison.net tag pages — identified Nicholas Carlini (18 tags), Geoffrey Litt (12 tags), Max Woolf, Jesse Vincent
- Harrison Chase X/LinkedIn/blog — identified Stanislas Polu (Dust, Generalist podcast), Atai Barkai (CopilotKit, AG-UI), Addy Osmani (context engineering writer)
- Chip Huyen AI Engineering book acknowledgments (github.com/chiphuyen/aie-book) — identified Charles Frye, Omar Khattab, Charles Packer, Maxime Labonne, Mark Saroufim
- Hamel Husain blog/X/courses — identified Bryan Bischof (co-author), Isaac Flath (Answer.AI), Phillip Carter (Honeycomb eval case study)
- "What We Learned from a Year of Building with LLMs" (applied-llms.org) co-author group: Eugene Yan, Jason Liu, Shreya Shankar, Hamel Husain, Bryan Bischof, Charles Frye

**Activity verification**: All 15 candidates verified active in 2025-2026. One candidate (Assaf Elovic) dropped — last confirmed activity June 2025.

**Layer 2 nodes added**: charlesfrye, omar, geoffrey, addy, carlini, bryan, mark, spolu, max, jesse, atai, charlespacker, maxime, isaac, phillip
**Edges added**: 27 new edges (24 VERIFIED, 3 INFERRED)
**Candidates dropped**: Assaf Elovic (activity gap since June 2025)

**Cross-network signal**: Charles Frye and Bryan Bischof appeared via both Chip Huyen (book) and Hamel Husain (co-author) networks — strongest cross-reference signal.

**Blockers encountered**: Karpathy research agent was interrupted — limited coverage of Karpathy's direct network. X rate limits continued to limit direct tweet verification for some INFERRED edges.

---

## Research Backlog (Next Sessions)

### Snowball Pass 3 — Cursor orbit
- Focus: Lee Robinson's direct network → who does he cite / engage with on X?
- Target handles to check: @naman_jain_, @ggerganov (llama.cpp), @mckaywrigley (Cursor team), LiveCodeBench authors
- Source to mine: Cursor's official blog (cursor.com/blog), Lee Robinson's X following/mentions

### Snowball Pass 4 — Berkeley evals cluster
- Focus: Shreya Shankar's research collaborators
- Source to mine: sh-reya.com publications page, her advisor/lab connections, DocETL GitHub contributors
- Target: Any practitioner-facing PhD students publishing on eval methodology

### Snowball Pass 5 — Cognitive Revolution / applied AI product community
- Focus: A separate social graph that overlaps at Eugene Yan and Jeremy Howard
- Source to mine: The Cognitive Revolution podcast guest list, Nathan Labenz's network
- Note: This community skews more toward AI product than AI engineering — filter carefully

### Snowball Pass 6 — Independent verification of all INFERRED edges
- **Requires human X access** — see HUMAN_TODO.md

---

## Source Quality Notes

| Source | Quality | Notes |
|---|---|---|
| AIE conference speaker lists | HIGH | Direct evidence of community recognition. Cross-conference appearance = strong signal. |
| Latent Space episode archive | HIGH | swyx curates carefully — appearing as guest = strong endorsement |
| simonwillison.net tags | HIGH | Simon is meticulous. High tag count = genuine repeated engagement, not algorithmic |
| Chip Huyen book acknowledgments | HIGH | Reviewers are explicitly chosen as domain experts |
| Web search for X posts | MEDIUM | Often returns old or algorithmically surfaced content — verify dates carefully |
| Direct X profile view | HIGH | Requires human access due to rate limits |
| GitHub contributor graphs | MEDIUM | Good for ORG edges, less useful for DISCOURSE edges |
| Conference "top speaker" lists | HIGH | AIE Top Speaker = audience vote, very high signal |
