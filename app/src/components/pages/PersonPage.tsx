import { useParams, useNavigate } from "react-router";
import { ArrowLeft, ExternalLink, BookOpen } from "lucide-react";
import { DOMAINS, getDomColor } from "../../lib/constants";
import { useGraphData } from "../../hooks/useGraphData";
import { findArticleByUrl } from "../../lib/api";
import type { DomainKey } from "../../lib/types";

export function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { people, edges: allEdges, loading } = useGraphData();
  const person = people.find((p) => p.id === id);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-sm font-mono text-text-muted tracking-wider">LOADING...</div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <p className="text-text-muted text-sm font-mono">Person not found: {id}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-accent text-sm font-mono hover:text-accent-hover transition-colors cursor-pointer"
        >
          &larr; Back to Graph
        </button>
      </div>
    );
  }

  const edges = allEdges.filter((e) => e.source === person.id || e.target === person.id);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Back button */}
      <div className="sticky top-0 bg-bg/90 backdrop-blur-sm border-b border-border z-raised">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-3 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          GRAPH
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-label font-mono text-text-muted tracking-[0.15em] mb-2">
            LAYER {person.layer === 0 ? "0 — ANCHOR" : person.layer}
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-1">{person.name}</h1>
          {person.fullName !== person.name && (
            <p className="text-base text-text-secondary">{person.fullName}</p>
          )}
        </div>

        {/* Domain badges */}
        <div className="flex gap-2 flex-wrap mb-6">
          {person.domains.map((d: DomainKey) => (
            <span
              key={d}
              className="text-label font-mono px-2.5 py-1 tracking-wider rounded-sm border"
              style={{
                background: `${DOMAINS[d].color}18`,
                borderColor: `${DOMAINS[d].color}50`,
                color: DOMAINS[d].color,
              }}
            >
              {DOMAINS[d].label.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Role */}
        <div className="text-base text-accent/80 leading-relaxed mb-6">{person.role}</div>

        {/* Description */}
        <div className="text-base text-text-secondary leading-relaxed mb-6 pb-6 border-b border-border-subtle">
          {person.description}
        </div>

        {/* Find them */}
        <div className="mb-6 pb-6 border-b border-border-subtle">
          <h2 className="text-label font-mono text-text-muted tracking-[0.12em] mb-3 uppercase">Find Them</h2>
          <a
            href={`https://x.com/${person.handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-accent hover:text-accent-hover transition-colors"
          >
            {person.handle}
          </a>
          <div className="text-sm text-text-muted mt-1">{person.platform}</div>
        </div>

        {/* Reading list */}
        {person.reading && person.reading.length > 0 && (
          <div className="mb-6 pb-6 border-b border-border-subtle">
            <h2 className="text-label font-mono text-text-muted tracking-[0.12em] mb-4 uppercase">
              Reading ({person.reading.length})
            </h2>
            <div className="flex flex-col gap-2">
              {person.reading.map((r, i) => (
                <PersonReadingLink key={i} url={r.url} title={r.title} />
              ))}
            </div>
          </div>
        )}

        {/* Edges / Connections */}
        <div className="mb-8">
          <h2 className="text-label font-mono text-text-muted tracking-[0.12em] mb-4 uppercase">
            Connections ({edges.length})
          </h2>
          <div className="flex flex-col gap-2">
            {edges.map((e, i) => {
              const oid = e.source === person.id ? e.target : e.source;
              const other = people.find((p) => p.id === oid);
              const dir = e.source === person.id ? "→" : "←";
              return (
                <button
                  key={i}
                  onClick={() => navigate(`/person/${oid}`)}
                  className="flex items-start gap-3 p-3 rounded-md border border-border hover:border-border-emphasis bg-bg-raised/50 hover:bg-bg-raised transition-all duration-[var(--transition-base)] cursor-pointer text-left w-full"
                >
                  <div
                    className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
                    style={{ background: `${getDomColor(other?.domains || ["context"])}80` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-muted text-xs">{dir}</span>
                      <span className="text-sm text-text-primary font-medium">{other?.name}</span>
                      <span className="text-label text-text-muted font-mono ml-auto">
                        w:{e.weight}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted mt-0.5 block">{e.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-lg border border-border bg-bg-raised/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">{person.inbound}</div>
            <div className="text-label font-mono text-text-muted tracking-wider mt-1">INBOUND</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">{edges.length}</div>
            <div className="text-label font-mono text-text-muted tracking-wider mt-1">EDGES</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">{person.domains.length}</div>
            <div className="text-label font-mono text-text-muted tracking-wider mt-1">DOMAINS</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonReadingLink({ url, title }: { url: string; title: string }) {
  const navigate = useNavigate();
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const article = await findArticleByUrl(url);
    if (article) {
      navigate(`/read/${article.id}`);
    } else {
      window.open(url, "_blank");
    }
  };
  return (
    <button
      onClick={handleClick}
      className="flex items-start gap-2 p-3 rounded-md border border-border hover:border-border-emphasis bg-bg-raised/50 hover:bg-bg-raised transition-all duration-[var(--transition-base)] group no-underline cursor-pointer text-left w-full"
    >
      <BookOpen className="w-3.5 h-3.5 text-text-muted group-hover:text-accent shrink-0 mt-0.5" />
      <span className="text-sm text-accent group-hover:text-accent-hover flex-1 leading-snug">
        {title}
      </span>
      <ExternalLink
        className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); window.open(url, "_blank"); }}
      />
    </button>
  );
}
