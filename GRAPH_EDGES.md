# Graph Edge Registry — GRAPH_EDGES.md

Last updated: March 2026
Total edges: 74
Weight scale: 1 (weak/inferred) → 3 (strong/verified/frequent)

Edge types:
- **COLLAB** — actively co-create content, courses, or products together
- **PLATFORM** — one person has given the other a stage (podcast, conference)
- **CITES** — regular documented citation or amplification
- **DISCOURSE** — substantive public engagement (debate, response, builds-on)
- **ORG** — work at the same organization
- **INFERRED** — relationship suspected from co-occurrence but not directly verified

---

| Source | Target | Weight | Type | Label | Verified |
|---|---|---|---|---|---|
| swyx | alessio | 3 | COLLAB | Co-hosts Latent Space | YES |
| swyx | simon | 2.5 | PLATFORM+CITES | Recurring LS guest · AIE keynote best-of-conference 2025 | YES |
| swyx | harrison | 2.5 | PLATFORM+DISCOURSE | LS guest · AIE Summit · LangChain community | YES |
| swyx | hamel | 2 | PLATFORM+DISCOURSE | AIE speaker · evals community | YES |
| swyx | shreya | 2 | PLATFORM | AIE speaker · evals overlap | YES |
| swyx | eugene | 2 | CITES | LS about page endorsement | YES |
| swyx | jason | 2 | DISCOURSE | Evals community discourse | YES |
| swyx | jeremy | 2 | PLATFORM | LS guest · Answer.ai | YES |
| swyx | dex | 2 | PLATFORM+DISCOURSE | AIE Summit · coined context engineering | YES |
| swyx | sasha | 1.5 | PLATFORM | AIE World's Fair 2025 keynote | YES |
| swyx | beyang | 1.5 | PLATFORM | 3x AIE Top Speaker | YES |
| swyx | yegge | 1.5 | PLATFORM | AIE Code Summit · IDE talk | YES |
| swyx | leerob | 1.5 | PLATFORM | AIE Code Summit · Cursor | YES |
| swyx | catasta | 1.5 | PLATFORM | AIE Code Summit · Replit | YES |
| swyx | brennan | 1.5 | PLATFORM | AIE Code Summit · OpenHands | YES |
| swyx | lance | 2 | PLATFORM | Dedicated LS episode on context engineering | YES |
| swyx | chip | 2 | CITES | LS reading list · cited for context + agents | YES |
| swyx | nathan | 1.5 | COLLAB | SAIL Live collab Feb 2026 | YES |
| swyx | karpathy | 1.5 | DISCOURSE | Community discourse · vibe coding era | INFERRED |
| hamel | shreya | 3 | COLLAB | Co-teach AI Evals for Engineers course | YES |
| harrison | shreya | 2 | COLLAB | Research co-author (paper) | YES |
| harrison | hamel | 2 | DISCOURSE | LangSmith evals collaboration | YES |
| harrison | lance | 2.5 | ORG+COLLAB | LangChain colleagues · LS episode | YES |
| harrison | dex | 1.5 | DISCOURSE | Context / harness engineering discourse | INFERRED |
| simon | hamel | 2 | CITES | Cites & amplifies regularly on blog | YES |
| simon | eugene | 1.5 | CITES | Mutual amplification | YES |
| simon | karpathy | 2 | CITES | 39 Karpathy citations on blog 2025-2026 | YES |
| simon | chip | 1.5 | CITES | Cited in AI engineering discourse | YES |
| simon | dbreunig | 1.5 | CITES | Cites context engineering analysis | YES |
| hamel | jason | 1.5 | DISCOURSE | Evals community discourse | YES |
| hamel | chip | 1.5 | CITES | Acknowledged in AI Engineering book | YES |
| eugene | shreya | 1.5 | DISCOURSE | Evals research overlap | YES |
| eugene | chip | 1.5 | DISCOURSE | Peer practitioner writing community | INFERRED |
| jason | chip | 1.5 | DISCOURSE | AI engineering discourse overlap | INFERRED |
| alessio | harrison | 1.5 | PLATFORM+DISCOURSE | LS · agent architecture | YES |
| beyang | yegge | 2 | ORG+COLLAB | Sourcegraph colleagues · IDE thesis | YES |
| sasha | leerob | 1.5 | PLATFORM | AIE Code Summit · Cursor Composer talk | YES |
| brennan | beyang | 1 | DISCOURSE | Open source coding agent ecosystem | INFERRED |
| eno | brennan | 1 | DISCOURSE | Production coding agent discourse | INFERRED |
| catasta | eno | 1 | DISCOURSE | Autonomous agent design discourse | INFERRED |
| dbreunig | lance | 2.5 | CITES | 'How Contexts Fail' cited in Lance's LS episode | YES |
| dbreunig | dex | 1.5 | DISCOURSE | Context engineering term overlap | INFERRED |
| nathan | hamel | 1.5 | DISCOURSE | Evals / post-training practitioner overlap | INFERRED |
| nathan | chip | 1 | DISCOURSE | AI engineering evals overlap | INFERRED |
| karpathy | yegge | 1.5 | DISCOURSE | AI-assisted dev discourse · vibe coding era | INFERRED |
| karpathy | leerob | 1 | DISCOURSE | Coding agent ecosystem | INFERRED |
| chip | harrison | 1.5 | DISCOURSE | AI engineering ecosystem | INFERRED |
| simon | carlini | 2 | CITES | 18 tagged posts on simonwillison.net | YES |
| simon | geoffrey | 2 | CITES | 12 tagged posts · malleable software discourse | YES |
| simon | max | 1.5 | CITES | Cited AI agent coding skepticism | YES |
| simon | jesse | 1.5 | CITES | Cited parallel agent workflow patterns | YES |
| harrison | spolu | 2 | DISCOURSE | Co-appeared on The Generalist · agent infra discourse | YES |
| harrison | atai | 1.5 | DISCOURSE | AG-UI protocol adopted by LangChain | YES |
| harrison | addy | 1.5 | DISCOURSE | Context engineering framing overlap | INFERRED |
| chip | charlesfrye | 1.5 | CITES | Acknowledged in AI Engineering book | YES |
| chip | omar | 1.5 | CITES | DSPy featured in AI Engineering book | YES |
| chip | charlespacker | 1 | CITES | MemGPT discussed in AI Engineering book | YES |
| chip | maxime | 1 | CITES | Acknowledged in AI Engineering book | YES |
| chip | mark | 1 | CITES | Acknowledged in AI Engineering book | YES |
| hamel | charlesfrye | 2.5 | COLLAB | Co-authored 'Year of Building with LLMs' | YES |
| hamel | bryan | 2.5 | COLLAB | Co-authored 'Year of Building with LLMs' | YES |
| hamel | isaac | 2 | COLLAB | Co-authored Devin review at Answer.AI | YES |
| hamel | phillip | 1.5 | CITES | Featured Honeycomb as eval case study | YES |
| eugene | charlesfrye | 2 | COLLAB | Co-authored 'Year of Building with LLMs' | YES |
| eugene | bryan | 2 | COLLAB | Co-authored 'Year of Building with LLMs' | YES |
| jason | charlesfrye | 2 | COLLAB | Co-authored 'Year of Building with LLMs' | YES |
| jason | bryan | 2 | COLLAB | Co-authored 'Year of Building with LLMs' | YES |
| shreya | charlesfrye | 2 | COLLAB | Co-authored 'Year of Building with LLMs' | YES |
| shreya | bryan | 2 | COLLAB | Co-authored 'Year of Building with LLMs' | YES |
| charlesfrye | bryan | 2.5 | COLLAB | Co-authored 'Year of Building with LLMs' | YES |
| sasha | omar | 1.5 | DISCOURSE | DSPy ecosystem collaboration | YES |
| jeremy | isaac | 1.5 | ORG | Answer.AI colleagues | YES |
| swyx | bryan | 1.5 | PLATFORM | LS guest · Notebooks = Chat++ | YES |
| bryan | dex | 1 | CITES | Humanloop LLM eval interview | YES |

---

## Edges Flagged for Verification

The following INFERRED edges should be upgraded to VERIFIED or downgraded/removed when the human has X/Twitter access:

- harrison ↔ dex — check if they've engaged directly on context engineering framing
- eugene ↔ chip — check for direct mentions or co-citation
- jason ↔ chip — check for direct discourse
- brennan ↔ beyang — check for co-appearance or direct engagement
- eno ↔ brennan — check for co-appearance at AIE Code Summit or direct engagement
- catasta ↔ eno — check for direct discourse
- dbreunig ↔ dex — check if Dex has cited or engaged with dbreunig's work
- nathan ↔ hamel — check for direct discourse on evals
- nathan ↔ chip — check for direct discourse
- karpathy ↔ yegge — check for direct engagement on vibe coding / IDE discourse
- karpathy ↔ leerob — check for direct engagement on Cursor / coding agents
- chip ↔ harrison — check for direct engagement
