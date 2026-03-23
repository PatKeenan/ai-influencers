import { useNavigate } from "react-router";
import { ExternalLink, BookOpen, Eye, EyeOff, Archive } from "lucide-react";
import { DOMAINS } from "../../lib/constants";
import type { Article, DomainKey } from "../../lib/types";

interface ArticleCardProps {
  article: Article;
  onStatusChange: (id: number, status: Article["status"]) => void;
  onCategoryChange: (id: number, category: string) => void;
}

const CATEGORIES = ["Valuable", "Reference", "Tool", "Skip"] as const;

export function ArticleCard({ article, onStatusChange, onCategoryChange }: ArticleCardProps) {
  const navigate = useNavigate();
  const primaryDomain = article.author_domains?.[0] as DomainKey | undefined;
  const domainConfig = primaryDomain ? DOMAINS[primaryDomain] : null;

  return (
    <div className="p-4 rounded-md border border-border hover:border-border-emphasis bg-bg-raised/50 hover:bg-bg-raised transition-all duration-[var(--transition-base)]">
      {/* Top row: title + influence score */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(`/read/${article.id}`)}
            className="text-sm text-accent hover:text-accent-hover transition-colors leading-snug inline-flex items-start gap-1.5 no-underline group cursor-pointer text-left bg-transparent p-0 border-0"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50 group-hover:opacity-100" />
            <span className="group-hover:underline">{article.title}</span>
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-label text-text-muted hover:text-accent transition-colors no-underline mt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open original</span>
          </a>
        </div>

        {article.influence_score != null && (
          <span className="shrink-0 text-label font-mono px-2 py-0.5 rounded-sm bg-accent/10 border border-accent/25 text-accent tracking-wider">
            {article.influence_score}
          </span>
        )}
      </div>

      {/* Author row */}
      <div className="flex items-center gap-2 mt-2">
        {domainConfig && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: domainConfig.color }}
          />
        )}
        <span className="text-xs text-text-secondary">
          {article.author_name || article.author_id}
        </span>

        {/* Domain badges */}
        {article.author_domains && article.author_domains.length > 0 && (
          <div className="flex gap-1.5 ml-1">
            {article.author_domains.map((d) => {
              const dc = DOMAINS[d];
              if (!dc) return null;
              return (
                <span
                  key={d}
                  className="text-label font-mono px-1.5 py-0 tracking-wider rounded-sm border"
                  style={{
                    background: `${dc.color}18`,
                    borderColor: `${dc.color}70`,
                    color: dc.color,
                    fontSize: "10px",
                    lineHeight: "18px",
                  }}
                >
                  {dc.short}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
        {article.status === "unread" && (
          <button
            onClick={() => onStatusChange(article.id, "read")}
            className="flex items-center gap-1.5 px-2.5 py-1 text-label font-mono tracking-wider text-text-muted hover:text-text-secondary bg-surface-hover/30 hover:bg-surface-hover border border-border rounded-sm transition-all duration-[var(--transition-base)] cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            MARK READ
          </button>
        )}

        {article.status === "read" && (
          <>
            <button
              onClick={() => onStatusChange(article.id, "unread")}
              className="flex items-center gap-1.5 px-2.5 py-1 text-label font-mono tracking-wider text-text-muted hover:text-text-secondary bg-surface-hover/30 hover:bg-surface-hover border border-border rounded-sm transition-all duration-[var(--transition-base)] cursor-pointer"
            >
              <EyeOff className="w-3 h-3" />
              UNREAD
            </button>
            <button
              onClick={() => onStatusChange(article.id, "archived")}
              className="flex items-center gap-1.5 px-2.5 py-1 text-label font-mono tracking-wider text-text-muted hover:text-text-secondary bg-surface-hover/30 hover:bg-surface-hover border border-border rounded-sm transition-all duration-[var(--transition-base)] cursor-pointer"
            >
              <Archive className="w-3 h-3" />
              ARCHIVE
            </button>

            {/* Category selector */}
            <div className="flex items-center gap-1.5 ml-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(article.id, cat)}
                  className={`px-2 py-1 text-label font-mono tracking-wider rounded-sm border transition-all duration-[var(--transition-base)] cursor-pointer ${
                    article.category === cat
                      ? "bg-surface-active border-border-strong text-text-secondary"
                      : "bg-surface-hover/30 border-border text-text-muted hover:text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </>
        )}

        {article.status === "archived" && (
          <button
            onClick={() => onStatusChange(article.id, "unread")}
            className="flex items-center gap-1.5 px-2.5 py-1 text-label font-mono tracking-wider text-text-muted hover:text-text-secondary bg-surface-hover/30 hover:bg-surface-hover border border-border rounded-sm transition-all duration-[var(--transition-base)] cursor-pointer"
          >
            <EyeOff className="w-3 h-3" />
            UNARCHIVE
          </button>
        )}
      </div>
    </div>
  );
}
