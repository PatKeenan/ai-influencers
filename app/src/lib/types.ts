/** Domain identifiers for the four AI engineering verticals */
export type DomainKey = "context" | "evals" | "orchestration" | "aidev";

/** Domain metadata for display and filtering */
export interface DomainConfig {
  label: string;
  color: string;
  short: string;
}

/** A reading list entry attached to a person */
export interface ReadingItem {
  title: string;
  url: string;
}

/** A person node in the influence graph */
export interface Person {
  id: string;
  name: string;
  fullName: string;
  layer: number;
  domains: DomainKey[];
  role: string;
  handle: string;
  platform: string;
  description: string;
  inbound: number;
  anchor?: boolean;
  reading?: ReadingItem[];
}

/** An edge connecting two people in the graph */
export interface Edge {
  source: string;
  target: string;
  weight: number;
  label: string;
}

/** The full graph data structure */
export interface GraphData {
  people: Person[];
  edges: Edge[];
}
