/**
 * Feed checker — fetches RSS/Atom/blog feeds for all people in the graph
 * and inserts new articles into the database.
 *
 * Usage:  bun pipeline/check-feeds.ts
 */

import sql from "../api/src/db";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; InfluenceBot/1.0)",
  },
});

async function checkFeeds() {
  console.log(`[${new Date().toISOString()}] Starting feed check...`);

  // Get all feeds that aren't X/Twitter
  const feeds = await sql`
    SELECT f.id, f.person_id, f.url, f.source_type, f.last_checked_at,
           p.inbound
    FROM feeds f
    JOIN people p ON f.person_id = p.id
    ORDER BY f.last_checked_at ASC NULLS FIRST
  `;

  let totalChecked = 0;
  let totalNew = 0;
  let totalErrors = 0;

  for (const feed of feeds) {
    let feedNewCount = 0;

    try {
      console.log(`  Checking: ${feed.url}`);
      const result = await parser.parseURL(feed.url);
      totalChecked++;

      for (const item of result.items || []) {
        const url = item.link;
        const title = item.title;
        if (!url || !title) continue;

        // Check if article already exists
        const existing = await sql`
          SELECT id FROM articles WHERE url = ${url} LIMIT 1
        `;

        if (existing.length === 0) {
          // New article!
          const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
          await sql`
            INSERT INTO articles (url, title, author_id, published_at, influence_score, status)
            VALUES (${url}, ${title}, ${feed.person_id}, ${publishedAt}, ${feed.inbound || 0}, 'unread')
            ON CONFLICT (url) DO NOTHING
          `;
          feedNewCount++;
          totalNew++;
          console.log(`    + NEW: ${title}`);
        }
      }

      // Update feed's last_checked_at and clear errors
      await sql`
        UPDATE feeds
        SET last_checked_at = NOW(), error_count = 0, last_error = NULL,
            last_found_at = CASE WHEN ${feedNewCount} > 0 THEN NOW() ELSE last_found_at END
        WHERE id = ${feed.id}
      `;
    } catch (err: any) {
      totalErrors++;
      console.error(`    ERROR: ${feed.url} — ${err.message}`);

      // Track error count
      await sql`
        UPDATE feeds
        SET last_checked_at = NOW(),
            error_count = error_count + 1,
            last_error = ${err.message?.slice(0, 500) || "Unknown error"}
        WHERE id = ${feed.id}
      `;
    }
  }

  console.log(
    `\nDone. Checked: ${totalChecked}, New articles: ${totalNew}, Errors: ${totalErrors}`
  );
  await sql.end();
  process.exit(0);
}

checkFeeds();
