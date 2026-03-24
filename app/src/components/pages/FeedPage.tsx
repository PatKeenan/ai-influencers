import { useEffect, useState, useCallback } from "react";
import { Rss, ArrowDownWideNarrow, Calendar } from "lucide-react";
import graphData from "../../graph-data.json";
import type { Article, GraphData, DomainKey } from "../../lib/types";
import { ArticleCard } from "../molecules/ArticleCard";

type StatusFilter = "all" | "unread" | "read" | "archived";
type SortMode = "influence" | "date";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "unread", label: "UNREAD" },
  { key: "read", label: "READ" },
  { key: "archived", label: "ARCHIVED" },
];

/** Build articles from the static graph-data.json as a fallback */
function buildArticlesFromStaticData(): Article[] {
  const data = graphData as GraphData;
  const articles: Article[] = [];
  let id = 1;
  for (const person of data.people) {
    if (person.reading) {
      for (const r of person.reading) {
        articles.push({
          id: id++,
          url: r.url,
          title: r.title,
          author_id: person.id,
          author_name: person.name,
          author_domains: person.domains as DomainKey[],
          published_at: null,
          status: "unread",
          category: null,
          influence_score: person.inbound,
          created_at: new Date().toISOString(),
        });
      }
    }
  }
  return articles.sort((a, b) => (b.influence_score || 0) - (a.influence_score || 0));
}

export function FeedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("unread");
  const [sortMode, setSortMode] = useState<SortMode>("influence");
  const [usingApi, setUsingApi] = useState(false);

  // Fetch articles from API, fallback to static data
  useEffect(() => {
    let cancelled = false;

    async function fetchArticles() {
      try {
        const res = await fetch("/api/articles?sort=influence");
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          // Map API camelCase fields to our Article interface
          const mapped: Article[] = data.map((a: Record<string, unknown>) => ({
            id: a.id as number,
            url: a.url as string,
            title: a.title as string,
            author_id: a.authorId as string,
            author_name: a.authorName as string | undefined,
            author_domains: undefined,
            published_at: (a.publishedAt as string) || null,
            status: (a.status as Article["status"]) || "unread",
            category: (a.category as string) || null,
            influence_score: (a.influenceScore as number) || null,
            created_at: (a.createdAt as string) || new Date().toISOString(),
          }));
          // Enrich with domain data from static graph data
          const data2 = graphData as GraphData;
          const domainMap = new Map(data2.people.map((p) => [p.id, p.domains as DomainKey[]]));
          for (const m of mapped) {
            m.author_domains = domainMap.get(m.author_id);
          }
          setArticles(mapped);
          setUsingApi(true);
        } else {
          throw new Error("Empty response");
        }
      } catch {
        if (!cancelled) {
          setArticles(buildArticlesFromStaticData());
          setUsingApi(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchArticles();
    return () => { cancelled = true; };
  }, []);

  // Sort articles
  const sortedArticles = [...articles].sort((a, b) => {
    if (sortMode === "influence") {
      return (b.influence_score || 0) - (a.influence_score || 0);
    }
    // date sort
    const da = a.published_at || a.created_at;
    const db = b.published_at || b.created_at;
    return db.localeCompare(da);
  });

  // Filter articles
  const filteredArticles =
    statusFilter === "all"
      ? sortedArticles
      : sortedArticles.filter((a) => a.status === statusFilter);

  // Status change handler
  const handleStatusChange = useCallback(
    async (id: number, newStatus: Article["status"]) => {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );

      if (usingApi) {
        try {
          await fetch(`/api/articles/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          });
        } catch {
          // API unavailable — local state already updated
        }
      }
    },
    [usingApi]
  );

  // Category change handler
  const handleCategoryChange = useCallback(
    async (id: number, category: string) => {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, category: a.category === category ? null : category }
            : a
        )
      );

      if (usingApi) {
        try {
          const current = articles.find((a) => a.id === id);
          const newCat = current?.category === category ? null : category;
          await fetch(`/api/articles/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: newCat }),
          });
        } catch {
          // API unavailable — local state already updated
        }
      }
    },
    [usingApi, articles]
  );

  // Count by status for tab badges
  const counts = {
    all: articles.length,
    unread: articles.filter((a) => a.status === "unread").length,
    read: articles.filter((a) => a.status === "read").length,
    archived: articles.filter((a) => a.status === "archived").length,
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Rss className="w-8 h-8 text-accent/40 animate-pulse" />
        <p className="text-sm text-text-muted mt-4 font-mono tracking-wider">LOADING FEED...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 md:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text-primary mb-1">News Feed</h1>
          <p className="text-sm text-text-tertiary">
            Articles from influential AI engineers, ranked by influence score.
          </p>
        </div>

        {/* Filter tabs + sort controls */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {/* Status filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-2.5 py-1.5 text-label font-mono tracking-wider rounded-sm border transition-all duration-[var(--transition-base)] cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-surface-active border-border-strong text-text-secondary"
                    : "bg-surface-hover/30 border-border text-text-muted hover:text-text-secondary hover:bg-surface-hover"
                }`}
              >
                {tab.label}
                {counts[tab.key] > 0 && (
                  <span className="ml-1.5 text-text-muted">{counts[tab.key]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Sort controls */}
          <div className="flex gap-1.5 ml-auto">
            <button
              onClick={() => setSortMode("influence")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-label font-mono tracking-wider rounded-sm border transition-all duration-[var(--transition-base)] cursor-pointer ${
                sortMode === "influence"
                  ? "bg-surface-active border-border-strong text-text-secondary"
                  : "bg-surface-hover/30 border-border text-text-muted hover:text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <ArrowDownWideNarrow className="w-3 h-3" />
              INFLUENCE
            </button>
            <button
              onClick={() => setSortMode("date")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-label font-mono tracking-wider rounded-sm border transition-all duration-[var(--transition-base)] cursor-pointer ${
                sortMode === "date"
                  ? "bg-surface-active border-border-strong text-text-secondary"
                  : "bg-surface-hover/30 border-border text-text-muted hover:text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <Calendar className="w-3 h-3" />
              DATE
            </button>
          </div>
        </div>

        {/* Article list */}
        {filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
              <Rss className="w-6 h-6 text-accent/40" />
            </div>
            <p className="text-sm text-text-tertiary">
              No articles match the current filter.
            </p>
            {statusFilter !== "all" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="mt-3 text-xs text-accent hover:text-accent-hover font-mono tracking-wider transition-colors cursor-pointer"
              >
                SHOW ALL
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-label font-mono text-text-muted tracking-[0.12em] mb-1 uppercase">
              {filteredArticles.length} Article{filteredArticles.length !== 1 ? "s" : ""}
            </div>
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onStatusChange={handleStatusChange}
                onCategoryChange={handleCategoryChange}
              />
            ))}
          </div>
        )}

        {/* Data source indicator */}
        {!usingApi && (
          <div className="mt-6 text-center">
            <span className="text-label font-mono text-text-muted tracking-wider">
              STATIC DATA MODE
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
