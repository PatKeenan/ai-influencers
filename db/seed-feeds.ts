/**
 * Seed feeds — parses GRAPH_NODES.md to extract feed URLs and inserts them
 * into the feeds table.
 *
 * Usage:  bun db/seed-feeds.ts
 *
 * Idempotent: uses ON CONFLICT DO NOTHING.
 */

import { readFileSync } from "fs";
import { join } from "path";
import postgres from "postgres";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://influence:influence@localhost:5432/influence";

const sql = postgres(DATABASE_URL);

function classifyFeedUrl(url: string): string | null {
  const lower = url.toLowerCase();

  // Skip X/Twitter — can't parse without API
  if (lower.includes("x.com") || lower.includes("twitter.com")) {
    return null;
  }

  // Substack feeds
  if (lower.includes("substack.com/feed")) {
    return "substack";
  }

  // Atom feeds
  if (lower.includes("/atom") || lower.endsWith(".atom")) {
    return "atom";
  }

  // RSS feeds
  if (
    lower.includes("/feed") ||
    lower.includes("/rss") ||
    lower.endsWith(".xml") ||
    lower.includes("/feed.xml")
  ) {
    return "rss";
  }

  // Everything else is a blog URL — attempt RSS discovery later
  return "blog";
}

interface FeedEntry {
  personId: string;
  sourceType: string;
  url: string;
}

async function seedFeeds() {
  const nodesPath = join(import.meta.dir, "..", "GRAPH_NODES.md");
  const content = readFileSync(nodesPath, "utf-8");

  const feeds: FeedEntry[] = [];
  let currentPersonId: string | null = null;

  for (const line of content.split("\n")) {
    // Match person header: ### personId
    const headerMatch = line.match(/^### (\w+)/);
    if (headerMatch) {
      currentPersonId = headerMatch[1];
      continue;
    }

    // Match feeds line
    const feedsMatch = line.match(/^- \*\*Feeds\*\*:\s*(.+)/);
    if (feedsMatch && currentPersonId) {
      const urls = feedsMatch[1].split(",").map((u) => u.trim());
      for (const url of urls) {
        if (!url) continue;
        const sourceType = classifyFeedUrl(url);
        if (sourceType === null) {
          console.log(`  SKIP (X/Twitter): ${url} [${currentPersonId}]`);
          continue;
        }
        feeds.push({ personId: currentPersonId, sourceType, url });
      }
    }
  }

  console.log(`Found ${feeds.length} non-X feed URLs across all people.\n`);

  let added = 0;
  let skipped = 0;

  for (const feed of feeds) {
    const result = await sql`
      INSERT INTO feeds (person_id, source_type, url)
      VALUES (${feed.personId}, ${feed.sourceType}, ${feed.url})
      ON CONFLICT (url) DO NOTHING
      RETURNING id
    `;
    if (result.length > 0) {
      added++;
      console.log(`  + ${feed.sourceType.padEnd(10)} ${feed.url} [${feed.personId}]`);
    } else {
      skipped++;
    }
  }

  console.log(`\nDone. Added: ${added}, Already existed: ${skipped}`);
  await sql.end();
}

seedFeeds().catch((err) => {
  console.error("Seed feeds failed:", err);
  process.exit(1);
});
