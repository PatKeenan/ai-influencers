import { Hono } from "hono";
import { cors } from "hono/cors";
import { extract } from "@extractus/article-extractor";
import sql from "./db";

const app = new Hono();

// Enable CORS for the frontend dev server
app.use("/*", cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));

// ---------- Health ----------

app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ---------- Graph (matches graph-data.json shape) ----------

app.get("/api/graph", async (c) => {
  const people = await sql`
    SELECT id, name, full_name AS "fullName", layer, domains, role, handle,
           platform, description, inbound, anchor
    FROM people
    ORDER BY inbound DESC
  `;

  // Attach reading lists from articles table
  const articles = await sql`
    SELECT author_id, title, url FROM articles ORDER BY author_id, id
  `;
  const readingByAuthor = new Map<string, { title: string; url: string }[]>();
  for (const a of articles) {
    const list = readingByAuthor.get(a.author_id) ?? [];
    list.push({ title: a.title, url: a.url });
    readingByAuthor.set(a.author_id, list);
  }

  const peopleWithReading = people.map((p) => ({
    ...p,
    reading: readingByAuthor.get(p.id) ?? [],
  }));

  const edges = await sql`
    SELECT source, target, weight, label FROM edges
  `;

  return c.json({ people: peopleWithReading, edges });
});

// ---------- People ----------

app.get("/api/people", async (c) => {
  const people = await sql`
    SELECT id, name, full_name AS "fullName", layer, domains, role, handle,
           platform, description, inbound, anchor,
           created_at AS "createdAt", updated_at AS "updatedAt"
    FROM people
    ORDER BY inbound DESC
  `;
  return c.json(people);
});

app.get("/api/people/:id", async (c) => {
  const { id } = c.req.param();

  const [person] = await sql`
    SELECT id, name, full_name AS "fullName", layer, domains, role, handle,
           platform, description, inbound, anchor,
           created_at AS "createdAt", updated_at AS "updatedAt"
    FROM people
    WHERE id = ${id}
  `;

  if (!person) {
    return c.json({ error: "Person not found" }, 404);
  }

  const edges = await sql`
    SELECT source, target, weight, label
    FROM edges
    WHERE source = ${id} OR target = ${id}
  `;

  const reading = await sql`
    SELECT id, url, title, status, category, influence_score AS "influenceScore"
    FROM articles
    WHERE author_id = ${id}
    ORDER BY id
  `;

  return c.json({ ...person, edges, reading });
});

// ---------- Articles ----------

app.get("/api/articles", async (c) => {
  const status = c.req.query("status");
  const sort = c.req.query("sort") ?? "influence";
  const limit = parseInt(c.req.query("limit") ?? "50", 10);
  const offset = parseInt(c.req.query("offset") ?? "0", 10);

  let orderClause: string;
  switch (sort) {
    case "date":
      orderClause = "published_at DESC NULLS LAST";
      break;
    case "influence":
    default:
      orderClause = "influence_score DESC NULLS LAST, published_at DESC NULLS LAST";
      break;
  }

  const articles = status
    ? await sql`
        SELECT a.id, a.url, a.title, a.author_id AS "authorId",
               p.name AS "authorName",
               a.published_at AS "publishedAt", a.status, a.category,
               a.influence_score AS "influenceScore",
               a.created_at AS "createdAt", a.updated_at AS "updatedAt"
        FROM articles a
        LEFT JOIN people p ON a.author_id = p.id
        WHERE a.status = ${status}
        ORDER BY ${sql.unsafe(orderClause)}
        LIMIT ${limit} OFFSET ${offset}
      `
    : await sql`
        SELECT a.id, a.url, a.title, a.author_id AS "authorId",
               p.name AS "authorName",
               a.published_at AS "publishedAt", a.status, a.category,
               a.influence_score AS "influenceScore",
               a.created_at AS "createdAt", a.updated_at AS "updatedAt"
        FROM articles a
        LEFT JOIN people p ON a.author_id = p.id
        ORDER BY ${sql.unsafe(orderClause)}
        LIMIT ${limit} OFFSET ${offset}
      `;

  return c.json(articles);
});

app.patch("/api/articles/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const body = await c.req.json();

  const allowedFields = ["status", "category", "influence_score"];
  const updates: Record<string, unknown> = {};

  if (body.status) updates.status = body.status;
  if (body.category !== undefined) updates.category = body.category;
  if (body.influenceScore !== undefined)
    updates.influence_score = body.influenceScore;

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "No valid fields to update" }, 400);
  }

  const [updated] = await sql`
    UPDATE articles SET
      ${sql(updates)},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, url, title, status, category,
              influence_score AS "influenceScore",
              updated_at AS "updatedAt"
  `;

  if (!updated) {
    return c.json({ error: "Article not found" }, 404);
  }

  return c.json(updated);
});

// ---------- Article Content Extraction ----------

app.get("/api/articles/:id/content", async (c) => {
  const id = parseInt(c.req.param("id"), 10);

  const [article] = await sql`
    SELECT id, url, title, extracted_content AS "extractedContent",
           extracted_at AS "extractedAt"
    FROM articles
    WHERE id = ${id}
  `;

  if (!article) {
    return c.json({ error: "Article not found" }, 404);
  }

  // Return cached content if available
  if (article.extractedContent) {
    return c.json({
      id: article.id,
      title: article.title,
      url: article.url,
      content: article.extractedContent,
      extracted_at: article.extractedAt,
    });
  }

  // Extract content from the URL
  try {
    const result = await extract(article.url);

    if (!result || !result.content) {
      return c.json({
        id: article.id,
        title: article.title,
        url: article.url,
        content: null,
        error: "Could not extract content",
      });
    }

    // Cache the extracted content
    const [updated] = await sql`
      UPDATE articles SET
        extracted_content = ${result.content},
        extracted_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING extracted_at AS "extractedAt"
    `;

    return c.json({
      id: article.id,
      title: result.title ?? article.title,
      url: article.url,
      content: result.content,
      extracted_at: updated.extractedAt,
    });
  } catch {
    return c.json({
      id: article.id,
      title: article.title,
      url: article.url,
      content: null,
      error: "Could not extract content",
    });
  }
});

// ---------- Notes ----------

app.get("/api/articles/:id/notes", async (c) => {
  const articleId = parseInt(c.req.param("id"), 10);

  // Verify article exists
  const [article] = await sql`
    SELECT id FROM articles WHERE id = ${articleId}
  `;

  if (!article) {
    return c.json({ error: "Article not found" }, 404);
  }

  const notes = await sql`
    SELECT id, article_id AS "articleId", content,
           created_at AS "createdAt", updated_at AS "updatedAt"
    FROM notes
    WHERE article_id = ${articleId}
    ORDER BY created_at ASC
  `;

  return c.json(notes);
});

app.post("/api/articles/:id/notes", async (c) => {
  const articleId = parseInt(c.req.param("id"), 10);
  const body = await c.req.json();

  // Verify article exists
  const [article] = await sql`
    SELECT id FROM articles WHERE id = ${articleId}
  `;

  if (!article) {
    return c.json({ error: "Article not found" }, 404);
  }

  const content = body.content ?? "";

  const [note] = await sql`
    INSERT INTO notes (article_id, content)
    VALUES (${articleId}, ${content})
    RETURNING id, article_id AS "articleId", content,
              created_at AS "createdAt", updated_at AS "updatedAt"
  `;

  return c.json(note, 201);
});

app.put("/api/notes/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const body = await c.req.json();

  if (body.content === undefined) {
    return c.json({ error: "content is required" }, 400);
  }

  const [note] = await sql`
    UPDATE notes SET
      content = ${body.content},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, article_id AS "articleId", content,
              created_at AS "createdAt", updated_at AS "updatedAt"
  `;

  if (!note) {
    return c.json({ error: "Note not found" }, 404);
  }

  return c.json(note);
});

app.delete("/api/notes/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);

  const [note] = await sql`
    DELETE FROM notes WHERE id = ${id} RETURNING id
  `;

  if (!note) {
    return c.json({ error: "Note not found" }, 404);
  }

  return c.json({ success: true });
});

// ---------- Start ----------

const port = parseInt(process.env.PORT ?? "3001", 10);

export default {
  port,
  fetch: app.fetch,
};

console.log(`Influence API running on http://localhost:${port}`);
