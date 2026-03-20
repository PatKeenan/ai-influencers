import type { DomainKey, DomainConfig } from "./types";

export const APP_VERSION = "v0.3";

/** Domain configuration — colors, labels, and abbreviations */
export const DOMAINS: Record<DomainKey, DomainConfig> = {
  context: { label: "Context Engineering", color: "#00d4ff", short: "CTX" },
  evals: { label: "Evaluations", color: "#f5c542", short: "EVAL" },
  orchestration: { label: "Agent Orchestration", color: "#d966ff", short: "ORCH" },
  aidev: { label: "AI-Assisted Dev", color: "#4dff91", short: "DEV" },
};

/** Get the primary domain color for a person's domain list */
export function getDomColor(domains: string[]): string {
  return DOMAINS[domains[0] as DomainKey]?.color || "#aaa";
}

/** Layer label colors for graph node text */
export const LAYER_LABEL_COLORS: Record<number, string> = {
  0: "#e8f4ff",
  1: "rgba(180,205,225,0.85)",
  2: "rgba(140,175,200,0.65)",
};
