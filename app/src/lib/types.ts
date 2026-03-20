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

/** An article in the news feed */
export interface Article {
  id: number;
  url: string;
  title: string;
  author_id: string;
  author_name?: string;
  author_domains?: DomainKey[];
  published_at: string | null;
  status: "unread" | "read" | "archived";
  category: string | null;
  influence_score: number | null;
  created_at: string;
}

/** The full graph data structure */
export interface GraphData {
  people: Person[];
  edges: Edge[];
}
