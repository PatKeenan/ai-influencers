/**
 * Seed script — populates the Influence Map database from graph-data.json.
 *
 * Usage:  bun db/seed.ts
 *
 * Idempotent: uses ON CONFLICT to upsert rows.
 */

import postgres from "postgres";
import graphData from "../app/src/graph-data.json";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://influence:influence@localhost:5432/influence";

const sql = postgres(DATABASE_URL);

interface ReadingItem {
  title: string;
  url: string;
}

interface Person {
  id: string;
  name: string;
  fullName: string;
  layer: number;
  domains: string[];
  role: string;
  handle: string;
  platform: string;
  description: string;
  inbound: number;
  anchor?: boolean;
  reading?: ReadingItem[];
}

interface Edge {
  source: string;
  target: string;
  weight: number;
  label: string;
}

async function seed() {
  const people = graphData.people as Person[];
  const edges = graphData.edges as Edge[];

  console.log(`Seeding ${people.length} people...`);

  // Insert people
  for (const p of people) {
    // Convert domains array to Postgres text[] literal: '{context,evals}'
    const domainsLiteral = `{${p.domains.join(",")}}`;
    await sql`
      INSERT INTO people (id, name, full_name, layer, domains, role, handle, platform, description, inbound, anchor)
      VALUES (
        ${p.id},
        ${p.name},
        ${p.fullName},
        ${p.layer},
        ${domainsLiteral}::text[],
        ${p.role},
        ${p.handle},
        ${p.platform},
        ${p.description},
        ${p.inbound},
        ${p.anchor ?? false}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        full_name = EXCLUDED.full_name,
        layer = EXCLUDED.layer,
        domains = EXCLUDED.domains,
        role = EXCLUDED.role,
        handle = EXCLUDED.handle,
        platform = EXCLUDED.platform,
        description = EXCLUDED.description,
        inbound = EXCLUDED.inbound,
        anchor = EXCLUDED.anchor,
        updated_at = NOW()
    `;
  }
  console.log("  People done.");

  console.log(`Seeding ${edges.length} edges...`);

  // Insert edges
  for (const e of edges) {
    await sql`
      INSERT INTO edges (source, target, weight, label)
      VALUES (${e.source}, ${e.target}, ${e.weight}, ${e.label})
      ON CONFLICT (source, target) DO UPDATE SET
        weight = EXCLUDED.weight,
        label = EXCLUDED.label
    `;
  }
  console.log("  Edges done.");

  // Insert reading list items as articles
  const articlesData: { url: string; title: string; authorId: string }[] = [];
  for (const p of people) {
    if (p.reading && p.reading.length > 0) {
      for (const r of p.reading) {
        articlesData.push({ url: r.url, title: r.title, authorId: p.id });
      }
    }
  }

  console.log(`Seeding ${articlesData.length} articles from reading lists...`);

  for (const a of articlesData) {
    await sql`
      INSERT INTO articles (url, title, author_id)
      VALUES (${a.url}, ${a.title}, ${a.authorId})
      ON CONFLICT (url) DO UPDATE SET
        title = EXCLUDED.title,
        author_id = EXCLUDED.author_id,
        updated_at = NOW()
    `;
  }
  console.log("  Articles done.");

  console.log("Seed complete.");
  await sql.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
