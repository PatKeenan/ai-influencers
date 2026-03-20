# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A living intelligence map of influential AI engineering practitioners across four domains: Context Engineering, Evaluations, Agent Orchestration, and AI-Assisted Dev. It powers an interactive force-directed graph visualization and will eventually power a daily content digest.

## Commands

```bash
# Install dependencies (from app/)
cd app && bun install

# Dev server
cd app && bun run dev

# Build
cd app && bun run build

# Lint
cd app && bun run lint
```

## Architecture

The project has two layers:

1. **Research data** (root directory) — Markdown files tracking people, relationships, and research:
   - `GRAPH_NODES.md` — node registry with metadata (role, domains, handles, feeds)
   - `GRAPH_EDGES.md` — edge registry with type, weight, and verification status
   - `RESEARCH_LOG.md` — audit trail of research sessions
   - `HUMAN_TODO.md` — tasks blocked on human action (X access, login walls, etc.)
   - `graph.jsx` — legacy standalone graph component (not used by the app)

2. **Visualization app** (`app/`) — Vite + React 19 + TypeScript + D3:
   - `app/src/graph-data.json` — the canonical data file consumed by the app (people + edges arrays)
   - `app/src/App.tsx` — single-component app: D3 force simulation, domain/layer filters, click-to-dossier panel, responsive mobile layout
   - Uses React Compiler via `babel-plugin-react-compiler`

## Graph Update Protocol

When adding or modifying nodes/edges, update ALL of these in sync:

1. `GRAPH_NODES.md` — structured metadata
2. `GRAPH_EDGES.md` — edge definitions
3. `app/src/graph-data.json` — the app's data source (people + edges arrays)
4. `RESEARCH_LOG.md` — log the research source

## Node Rules (Hard Constraints)

1. **Active** — must have posted/published within 4 months. If unverifiable, add to `HUMAN_TODO.md`.
2. **Original thinkers** — synthesizers, builders, framers. Not aggregators.
3. **Application layer** — AI engineering/product/tooling. Not pure ML research.
4. Cross-reference across at least two independent sources before adding a node.

## Human-AI Collaboration

When hitting access walls (X/Twitter rate limits, login-gated pages, unverifiable activity), do NOT skip — add a structured task to `HUMAN_TODO.md` with priority, what was attempted, what's needed, and how to feed back the result. See `PROJECT_INSTRUCTIONS.md` for the exact format.

## Resources

You have access to several MCO servers to help you with your work:

1. linear-server: use this for creating, updating, and collaborating on linear issues or if you need to gather context about previous work outside of git.
2. claude-in-chrome: use this for navigating the browser, taking screenshots, mock user testing, etc. For quick visual prototyping, alter the css using javascript in the browser prior to moving to code. This helps cut down on the feedback loop for quick iterations/experiments.

- Linear Project Id: influence-dc9f2d2e48f1

## Rules

- **NEVER** commit changes directly to the main branch. Always create a new branch and associate it with an issue in linear.
- - **NEVER** take on to big of a task in one pull request. You must always break down larger tasks into smaller ones with a parent branch and child branches. You must associate related issues with each other as well. Always reference other issues or PR's in your pull request comments so we can stay organized.
- **NEVER** create a new pattern without first seeing which ones already exist. If the pattern you create is not in use and does not conflict with existing ones, you must document it in the docs/patterns directory with the description of the pattern and how to use it. You must also provide few shot examples of how to use the pattern properly and how to avoid common pitfalls. The patterns directory should be organized by domain/layer.
- **ALWAYS** ask for clarification from the human whenever you are unsure about a certain direction or decision that could benefit from human input. Treat the human like the CEO of the company concerned only with direction and not the day to day operations.
- **ALWAYS** create a pull request and associate it with the issue when you are ready for your changes to be reviewed.
- **ALWAYS** provide a detailed description of your changes in the pull request.
- **ALWAYS** move linear issues to "In Review" after creating a pull request. If changes or comments are requested, you must update the linear issue back to "In Progress" and update the pull request accordingly.
- **ALWAYS** provide evidence of your work on the Pull Request. If asked to alter designs or UI elements, you must provide a screenshot on the Pull Request.
- **ALWAYS** use agent teams when possible with defined roles and responsibilities
- **ALWAYS** create skills for repetitive tasks that might be useful for other agents. If no skills exist, you must use Anthropic's skill builder skill to learn how to create them.

!IMPORTANT
Since you are an AI agent leading this project and organizing/orchestrating teams of assistants, it's important you have the ability to communicate with the team - future and current. You have a private file that is only accessible to you and other coding agents that might work on this project. Treat that file similar to slack or discord and read it/updated it at all times so any new agent can quickly get up to speed, ask question, share ideas, and get feedback from the team. You have free reign for how you tell your subordinates to communicate with each other and how you want to communicate with them using that private file. [PRIVATE FILE](./.claude/PRIVATE_AGENT_COMMUNICATIONS.log).

- FINALLY, **HAVE FUN**!
