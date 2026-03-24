import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Search, X, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { NoteWithArticle, DomainKey } from "../../lib/types";
import { fetchAllNotes } from "../../lib/api";
import { DOMAINS } from "../../lib/constants";

type GroupMode = "timeline" | "person" | "domain" | "category";

const GROUP_TABS: { key: GroupMode; label: string }[] = [
  { key: "timeline", label: "TIMELINE" },
  { key: "person", label: "BY PERSON" },
  { key: "domain", label: "BY DOMAIN" },
  { key: "category", label: "BY CATEGORY" },
];

const CATEGORY_ORDER = ["Valuable", "Reference", "Tool", "Skip", "Uncategorized"];

const DOMAIN_KEY_MAP: Record<string, DomainKey> = {
  context: "context",
  evals: "evals",
  orchestration: "orchestration",
  aidev: "aidev",
};

/** Format a date as relative time ("2 hours ago", "3 days ago") */
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  return `${diffMonth}mo ago`;
}

function NoteCard({ note }: { note: NoteWithArticle }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const lines = note.content.split("\n");
  const isLong = lines.length > 4;
  const preview = isLong && !expanded ? lines.slice(0, 4).join("\n") : note.content;

  const domains = note.authorDomains || [];

  return (
    <div className="p-3 rounded-md border border-border hover:border-border-emphasis bg-bg-raised/50 hover:bg-bg-raised transition-all duration-[var(--transition-base)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <button
          onClick={() => navigate(`/read/${note.articleId}`)}
          className="text-sm font-medium text-text-primary hover:text-accent transition-colors duration-[var(--transition-base)] text-left cursor-pointer truncate"
        >
          {note.articleTitle}
        </button>
        <button
          onClick={() => navigate(`/read/${note.articleId}`)}
          className="shrink-0 flex items-center gap-1 px-2 py-0.5 text-label font-mono tracking-wider text-text-muted hover:text-accent border border-border rounded-sm hover:border-border-emphasis transition-all duration-[var(--transition-base)] cursor-pointer"
        >
          <ExternalLink className="w-3 h-3" />
          OPEN
        </button>
      </div>

      {/* Author + domain badges */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-text-tertiary">by {note.authorName}</span>
        {domains.map((d) => {
          const key = DOMAIN_KEY_MAP[d];
          if (!key || !DOMAINS[key]) return null;
          return (
            <span
              key={d}
              className="text-label font-mono px-2 py-0.5 tracking-wider rounded-sm border"
              style={{
                background: `${DOMAINS[key].color}18`,
                borderColor: `${DOMAINS[key].color}70`,
                color: DOMAINS[key].color,
              }}
            >
              {DOMAINS[key].short}
            </span>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-border-subtle mb-2" />

      {/* Note content */}
      <div className="text-sm text-text-secondary prose prose-invert prose-sm max-w-none [&_p]:mb-1 [&_ul]:mb-1 [&_ol]:mb-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_code]:text-xs [&_code]:bg-surface-hover [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
        <ReactMarkdown>{preview}</ReactMarkdown>
      </div>

      {/* Show more/less toggle */}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-1 text-xs text-text-muted hover:text-text-tertiary font-mono tracking-wider transition-colors cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              SHOW LESS
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              SHOW MORE
            </>
          )}
        </button>
      )}

      {/* Footer: timestamp + category */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-text-muted font-mono tracking-wider">
          {relativeTime(note.updatedAt)}
        </span>
        {note.articleCategory && (
          <>
            <span className="text-text-muted">·</span>
            <span className="text-label font-mono tracking-wider text-text-tertiary">
              {note.articleCategory}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function NotebookPage() {
  const [notes, setNotes] = useState<NoteWithArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupMode, setGroupMode] = useState<GroupMode>("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search input
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
  }, []);

  // Fetch notes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const data = await fetchAllNotes(
        debouncedQuery ? { q: debouncedQuery } : undefined
      );
      if (!cancelled) {
        setNotes(data);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Sort notes reverse chronological
  const sortedNotes = useMemo(
    () =>
      [...notes].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [notes]
  );

  // Group notes based on mode
  const grouped = useMemo(() => {
    if (groupMode === "timeline") return null;

    const map = new Map<string, NoteWithArticle[]>();

    for (const note of sortedNotes) {
      let keys: string[];

      if (groupMode === "person") {
        keys = [note.authorName];
      } else if (groupMode === "domain") {
        const domains = note.authorDomains || [];
        keys = domains.length > 0 ? [domains[0]] : ["unknown"];
      } else {
        // category
        keys = [note.articleCategory || "Uncategorized"];
      }

      for (const key of keys) {
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(note);
      }
    }

    // Sort groups
    if (groupMode === "category") {
      const sorted = new Map<string, NoteWithArticle[]>();
      for (const cat of CATEGORY_ORDER) {
        const items = map.get(cat);
        if (items && items.length > 0) sorted.set(cat, items);
      }
      // Any remaining categories
      for (const [key, items] of map) {
        if (!sorted.has(key) && items.length > 0) sorted.set(key, items);
      }
      return sorted;
    }

    if (groupMode === "domain") {
      const domainOrder: string[] = ["context", "evals", "orchestration", "aidev", "unknown"];
      const sorted = new Map<string, NoteWithArticle[]>();
      for (const d of domainOrder) {
        const items = map.get(d);
        if (items && items.length > 0) sorted.set(d, items);
      }
      return sorted;
    }

    // person: sort by number of notes descending
    const entries = [...map.entries()].sort((a, b) => b[1].length - a[1].length);
    return new Map(entries);
  }, [sortedNotes, groupMode]);

  // Render group heading
  function renderGroupHeading(key: string) {
    if (groupMode === "person") {
      // Find domains from first note in group
      const groupNotes = grouped?.get(key);
      const domains = groupNotes?.[0]?.authorDomains || [];
      return (
        <div className="flex items-center gap-2 mb-2 mt-6 first:mt-0">
          <span className="text-lg font-medium text-text-primary">{key}</span>
          {domains.map((d) => {
            const dk = DOMAIN_KEY_MAP[d];
            if (!dk || !DOMAINS[dk]) return null;
            return (
              <span
                key={d}
                className="text-label font-mono px-2 py-0.5 tracking-wider rounded-sm border"
                style={{
                  background: `${DOMAINS[dk].color}18`,
                  borderColor: `${DOMAINS[dk].color}70`,
                  color: DOMAINS[dk].color,
                }}
              >
                {DOMAINS[dk].short}
              </span>
            );
          })}
          <span className="text-xs text-text-muted font-mono ml-auto">
            {grouped?.get(key)?.length || 0}
          </span>
        </div>
      );
    }

    if (groupMode === "domain") {
      const dk = DOMAIN_KEY_MAP[key];
      const domain = dk ? DOMAINS[dk] : null;
      return (
        <div className="flex items-center gap-2 mb-2 mt-6 first:mt-0">
          {domain ? (
            <>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: domain.color }}
              />
              <span className="text-lg font-medium text-text-primary">
                {domain.label}
              </span>
            </>
          ) : (
            <span className="text-lg font-medium text-text-primary">Unknown</span>
          )}
          <span className="text-xs text-text-muted font-mono ml-auto">
            {grouped?.get(key)?.length || 0}
          </span>
        </div>
      );
    }

    // category
    return (
      <div className="flex items-center gap-2 mb-2 mt-6 first:mt-0">
        <span className="text-lg font-medium text-text-primary">{key}</span>
        <span className="text-xs text-text-muted font-mono ml-auto">
          {grouped?.get(key)?.length || 0}
        </span>
      </div>
    );
  }

  if (loading && notes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <BookOpen className="w-8 h-8 text-accent/40 animate-pulse" />
        <p className="text-sm text-text-muted mt-4 font-mono tracking-wider">
          LOADING NOTES...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 md:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Notebook</h1>
          <p className="text-sm text-text-tertiary">
            {debouncedQuery
              ? `${sortedNotes.length} result${sortedNotes.length !== 1 ? "s" : ""} for '${debouncedQuery}'`
              : `${sortedNotes.length} note${sortedNotes.length !== 1 ? "s" : ""} across all articles.`}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-9 py-2 bg-bg-raised border border-border rounded-md text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:border-border-emphasis transition-all duration-[var(--transition-base)]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setDebouncedQuery("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Group toggle tabs */}
        <div className="flex gap-1.5 flex-wrap mb-6">
          {GROUP_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setGroupMode(tab.key)}
              className={`px-2.5 py-1.5 text-label font-mono tracking-wider rounded-sm border transition-all duration-[var(--transition-base)] cursor-pointer ${
                groupMode === tab.key
                  ? "bg-surface-active border-border-strong text-text-secondary"
                  : "bg-surface-hover/30 border-border text-text-muted hover:text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notes list */}
        {sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-accent/40" />
            </div>
            <p className="text-sm text-text-tertiary">
              {debouncedQuery
                ? `No notes matching '${debouncedQuery}'`
                : "No notes yet. Open an article from the Feed and start writing."}
            </p>
            {debouncedQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedQuery("");
                }}
                className="mt-3 text-xs text-accent hover:text-accent-hover font-mono tracking-wider transition-colors cursor-pointer"
              >
                CLEAR SEARCH
              </button>
            )}
          </div>
        ) : groupMode === "timeline" ? (
          <div className="flex flex-col gap-2">
            <div className="text-label font-mono text-text-muted tracking-[0.12em] mb-1 uppercase">
              {sortedNotes.length} Note{sortedNotes.length !== 1 ? "s" : ""}
            </div>
            {sortedNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {grouped &&
              [...grouped.entries()].map(([key, groupNotes]) => (
                <div key={key}>
                  {renderGroupHeading(key)}
                  <div className="flex flex-col gap-2">
                    {groupNotes.map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
