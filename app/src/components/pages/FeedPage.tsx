import { Rss } from "lucide-react";

export function FeedPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
        <Rss className="w-8 h-8 text-accent/50" />
      </div>
      <h1 className="text-2xl font-semibold text-text-primary mb-2">News Feed</h1>
      <p className="text-sm text-text-tertiary max-w-md leading-relaxed">
        Articles from the most influential AI engineers, sorted by influence score and recency.
        Coming soon.
      </p>
      <div className="mt-6 px-4 py-2 rounded-md bg-surface-hover border border-border text-xs font-mono text-text-muted tracking-wider">
        PAT-19 · IN BACKLOG
      </div>
    </div>
  );
}
