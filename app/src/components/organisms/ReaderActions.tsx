import { useState } from "react";
import { ChevronDown, Eye, Archive, ArrowLeft, ArrowRight } from "lucide-react";
import type { Article } from "../../lib/types";

const CATEGORIES = ["Valuable", "Reference", "Tool", "Skip"] as const;

interface ReaderActionsProps {
  articleId: number;
  currentStatus: Article["status"];
  currentCategory: string | null;
  onStatusChange: (status: Article["status"]) => void;
  onCategoryChange: (category: string) => void;
  // Navigation
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function ReaderActions({
  currentStatus,
  currentCategory,
  onStatusChange,
  onCategoryChange,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: ReaderActionsProps) {
  const [actionsOpen, setActionsOpen] = useState(false);

  const statusLabel = currentStatus.toUpperCase();

  return (
    <div className="shrink-0">
      {/* Accordion header */}
      <button
        onClick={() => setActionsOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-border cursor-pointer bg-transparent hover:bg-surface-hover/30 transition-all duration-[var(--transition-base)]"
      >
        <span className="text-label font-mono text-text-faint tracking-[0.12em] uppercase">
          ACTIONS
        </span>
        <span className="text-label font-mono px-1.5 py-0.5 rounded-sm bg-accent/10 border border-accent/25 text-accent tracking-wider">
          {statusLabel}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-muted ml-auto transition-transform duration-[var(--transition-base)] ${
            actionsOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accordion body */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          actionsOpen ? "max-h-[200px]" : "max-h-0"
        }`}
      >
        <div className="px-3 pb-3 space-y-3">
          {/* Status row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onStatusChange(currentStatus === "read" ? "unread" : "read")
              }
              className="flex items-center gap-1.5 px-2.5 py-1 text-label font-mono tracking-wider text-text-muted hover:text-text-secondary bg-surface-hover/30 hover:bg-surface-hover border border-border rounded-sm transition-all duration-[var(--transition-base)] cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              {currentStatus === "read" ? "UNREAD" : "MARK READ"}
            </button>
            <button
              onClick={() =>
                onStatusChange(
                  currentStatus === "archived" ? "unread" : "archived"
                )
              }
              className="flex items-center gap-1.5 px-2.5 py-1 text-label font-mono tracking-wider text-text-muted hover:text-text-secondary bg-surface-hover/30 hover:bg-surface-hover border border-border rounded-sm transition-all duration-[var(--transition-base)] cursor-pointer"
            >
              <Archive className="w-3 h-3" />
              {currentStatus === "archived" ? "UNARCHIVE" : "ARCHIVE"}
            </button>
          </div>

          {/* Category label */}
          <div className="text-label font-mono text-text-faint tracking-[0.12em] uppercase">
            CATEGORIZE
          </div>

          {/* Category row */}
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-2 py-1 text-label font-mono tracking-wider rounded-sm border transition-all duration-[var(--transition-base)] cursor-pointer ${
                  currentCategory === cat
                    ? "bg-accent/10 text-accent border-accent/30"
                    : "bg-surface-hover/30 border-border text-text-muted hover:text-text-secondary hover:bg-surface-hover"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation — always visible */}
      <div className="border-t border-border px-3 py-3 space-y-2">
        {/* Position indicator */}
        <div className="text-center">
          <span className="text-label font-mono text-text-muted tracking-wider">
            {currentIndex + 1} OF {totalCount} UNREAD
          </span>
        </div>

        {/* Prev / Next buttons */}
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-label font-mono tracking-wider rounded-sm border transition-all duration-[var(--transition-base)] ${
              hasPrev
                ? "text-text-muted hover:text-text-secondary bg-surface-hover/30 hover:bg-surface-hover border-border cursor-pointer"
                : "text-text-faint bg-transparent border-border/50 cursor-not-allowed"
            }`}
          >
            <ArrowLeft className="w-3 h-3" />
            PREV
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-label font-mono tracking-wider rounded-sm border transition-all duration-[var(--transition-base)] ${
              hasNext
                ? "text-accent bg-accent/15 border-accent/30 hover:bg-accent/25 cursor-pointer"
                : "text-text-faint bg-transparent border-border/50 cursor-not-allowed"
            }`}
          >
            NEXT
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
