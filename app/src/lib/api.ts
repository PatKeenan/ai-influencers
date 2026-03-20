import type { Person, Edge, GraphData, ArticleContent, Note } from "./types";
import graphDataFallback from "../graph-data.json";

const API_BASE = "/api";

async function fetchWithFallback<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch {
    console.warn(`API unavailable, using static fallback for ${url}`);
    return fallback;
  }
}

export async function fetchGraphData(): Promise<GraphData> {
  return fetchWithFallback("/graph", graphDataFallback as GraphData);
}

export async function fetchPerson(id: string): Promise<{ person: Person; edges: Edge[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/people/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Fallback to static data
    const data = graphDataFallback as GraphData;
    const person = data.people.find(p => p.id === id);
    if (!person) return null;
    const edges = data.edges.filter(e => e.source === id || e.target === id);
    return { person: person as Person, edges: edges as Edge[] };
  }
}

export async function fetchArticles(params?: { status?: string; sort?: string; limit?: number; offset?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const res = await fetch(`${API_BASE}/articles?${searchParams}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function updateArticle(id: number, updates: { status?: string; category?: string }) {
  const res = await fetch(`${API_BASE}/articles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchArticleContent(id: number): Promise<ArticleContent> {
  const res = await fetch(`${API_BASE}/articles/${id}/content`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchNotes(articleId: number): Promise<Note[]> {
  const res = await fetch(`${API_BASE}/articles/${articleId}/notes`);
  if (!res.ok) return [];
  return res.json();
}

export async function saveNote(articleId: number, content: string, noteId?: number): Promise<Note> {
  if (noteId) {
    const res = await fetch(`${API_BASE}/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    return res.json();
  }
  const res = await fetch(`${API_BASE}/articles/${articleId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function deleteNote(noteId: number): Promise<void> {
  await fetch(`${API_BASE}/notes/${noteId}`, { method: "DELETE" });
}
