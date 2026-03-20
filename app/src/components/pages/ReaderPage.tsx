import { useParams, useNavigate } from "react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ExternalLink, FileText, StickyNote, Loader2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import { fetchArticleContent, fetchNotes, saveNote } from "../../lib/api";
import { useIsMobile } from "../../hooks/useIsMobile";
import type { ArticleContent, Note } from "../../lib/types";

type MobileTab = "article" | "notes";
type SaveStatus = "idle" | "saving" | "saved";

export function ReaderPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const id = Number(articleId);

  // Article state
  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [articleLoading, setArticleLoading] = useState(true);
  const [articleError, setArticleError] = useState<string | null>(null);

  // Notes state
  const [_notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [activeNoteId, setActiveNoteId] = useState<number | undefined>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Mobile tab
  const [mobileTab, setMobileTab] = useState<MobileTab>("article");

  // Debounce ref
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteContentRef = useRef(noteContent);
  noteContentRef.current = noteContent;

  // Fetch article content
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setArticleLoading(true);
      setArticleError(null);
      try {
        const data = await fetchArticleContent(id);
        if (!cancelled) setArticle(data);
      } catch (err) {
        if (!cancelled) setArticleError(err instanceof Error ? err.message : "Failed to load article");
      } finally {
        if (!cancelled) setArticleLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  // Fetch notes
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      const data = await fetchNotes(id);
      if (!cancelled && data.length > 0) {
        setNotes(data);
        setNoteContent(data[0].content);
        setActiveNoteId(data[0].id);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  // Auto-save with debounce
  const debouncedSave = useCallback(
    (content: string, noteId?: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus("saving");

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const saved = await saveNote(id, content, noteId);
          setActiveNoteId(saved.id);
          setNotes((prev) => {
            const exists = prev.find((n) => n.id === saved.id);
            if (exists) {
              return prev.map((n) => (n.id === saved.id ? saved : n));
            }
            return [...prev, saved];
          });
          setSaveStatus("saved");
          setLastSaved(new Date());
          // Reset to idle after 2 seconds
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("idle");
        }
      }, 1000);
    },
    [id]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleNoteChange = (value: string) => {
    setNoteContent(value);
    if (value.trim()) {
      debouncedSave(value, activeNoteId);
    }
  };

  // Handle tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Outdent: remove leading two spaces from current line
        const beforeCursor = noteContent.substring(0, start);
        const lineStart = beforeCursor.lastIndexOf("\n") + 1;
        const linePrefix = noteContent.substring(lineStart, start);
        if (linePrefix.startsWith("  ")) {
          const newContent = noteContent.substring(0, lineStart) + noteContent.substring(lineStart + 2);
          setNoteContent(newContent);
          const newPos = Math.max(lineStart, start - 2);
          requestAnimationFrame(() => {
            textarea.selectionStart = newPos;
            textarea.selectionEnd = newPos;
          });
          debouncedSave(newContent, activeNoteId);
        }
      } else {
        // Indent: insert two spaces
        const newContent = noteContent.substring(0, start) + "  " + noteContent.substring(end);
        setNoteContent(newContent);
        requestAnimationFrame(() => {
          textarea.selectionStart = start + 2;
          textarea.selectionEnd = start + 2;
        });
        debouncedSave(newContent, activeNoteId);
      }
    }
  };

  /** Sanitize extracted HTML to prevent XSS */
  function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target"],
    });
  }

  const articlePanel = (
    <div className="flex-1 overflow-y-auto bg-bg-raised">
      {articleLoading ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
          <Loader2 className="w-6 h-6 text-accent/50 animate-spin" />
          <span className="text-sm font-mono text-text-muted tracking-wider">EXTRACTING CONTENT...</span>
        </div>
      ) : articleError ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 p-6">
          <FileText className="w-8 h-8 text-text-muted" />
          <p className="text-sm text-text-tertiary text-center">Could not extract article content.</p>
          {article?.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors font-mono"
            >
              OPEN ORIGINAL
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      ) : article?.content ? (
        <div className="p-6 md:p-8">
          <article
            className="max-w-none text-text-secondary leading-relaxed
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-text-primary [&_h1]:mb-4 [&_h1]:mt-8
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary [&_h2]:mb-3 [&_h2]:mt-6
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mb-2 [&_h3]:mt-5
              [&_p]:mb-4 [&_p]:text-base [&_p]:leading-relaxed
              [&_a]:text-accent [&_a]:hover:text-accent-hover [&_a]:transition-colors [&_a]:underline
              [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc
              [&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal
              [&_li]:mb-1 [&_li]:text-base
              [&_blockquote]:border-l-2 [&_blockquote]:border-accent/30 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-text-tertiary [&_blockquote]:italic
              [&_code]:bg-bg-overlay [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-accent/80
              [&_pre]:bg-bg-overlay [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:mb-4
              [&_pre_code]:bg-transparent [&_pre_code]:p-0
              [&_img]:max-w-full [&_img]:rounded-md [&_img]:my-4
              [&_hr]:border-border [&_hr]:my-6
              [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
              [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:text-left [&_th]:text-text-primary [&_th]:bg-bg-overlay
              [&_td]:border [&_td]:border-border [&_td]:p-2"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 p-6">
          <FileText className="w-8 h-8 text-text-muted" />
          <p className="text-sm text-text-tertiary text-center">Content not yet extracted.</p>
          {article?.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors font-mono"
            >
              OPEN ORIGINAL
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );

  const notesPanel = (
    <div className="flex flex-col h-full bg-bg border-l border-border p-4 overflow-hidden">
      {/* Notes header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-label font-mono text-text-muted tracking-[0.12em] uppercase">NOTES</h2>
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-label font-mono text-text-muted tracking-wider">
              <Loader2 className="w-3 h-3 animate-spin" />
              SAVING...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-label font-mono text-accent/70 tracking-wider">
              <Check className="w-3 h-3" />
              SAVED
            </span>
          )}
        </div>
      </div>

      {/* Last saved timestamp */}
      {lastSaved && (
        <div className="text-label font-mono text-text-muted tracking-wider mb-3">
          Last saved {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Editor */}
      <textarea
        value={noteContent}
        onChange={(e) => handleNoteChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start typing notes... (Markdown supported)"
        className="flex-1 min-h-[150px] bg-bg-raised/50 border border-border rounded-md p-3 font-mono text-sm text-text-secondary resize-none focus:outline-none focus:border-border-emphasis transition-colors placeholder:text-text-muted"
      />

      {/* Preview */}
      {noteContent.trim() && (
        <div className="mt-3 flex-1 overflow-y-auto">
          <div className="text-label font-mono text-text-muted tracking-[0.12em] uppercase mb-2">PREVIEW</div>
          <div
            className="text-sm text-text-secondary leading-relaxed
              [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-text-primary [&_h1]:mb-2 [&_h1]:mt-4
              [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-primary [&_h2]:mb-2 [&_h2]:mt-3
              [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mb-1 [&_h3]:mt-2
              [&_p]:mb-2 [&_p]:text-sm
              [&_a]:text-accent [&_a]:hover:text-accent-hover [&_a]:underline
              [&_ul]:mb-2 [&_ul]:pl-5 [&_ul]:list-disc
              [&_ol]:mb-2 [&_ol]:pl-5 [&_ol]:list-decimal
              [&_li]:mb-0.5 [&_li]:text-sm
              [&_blockquote]:border-l-2 [&_blockquote]:border-accent/30 [&_blockquote]:pl-3 [&_blockquote]:my-2 [&_blockquote]:text-text-tertiary [&_blockquote]:italic
              [&_code]:bg-bg-overlay [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-accent/80
              [&_pre]:bg-bg-overlay [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:mb-2
              [&_pre_code]:bg-transparent [&_pre_code]:p-0
              [&_hr]:border-border [&_hr]:my-3
              [&_table]:w-full [&_table]:border-collapse [&_table]:mb-2 [&_table]:text-xs
              [&_th]:border [&_th]:border-border [&_th]:p-1.5 [&_th]:text-left [&_th]:text-text-primary [&_th]:bg-bg-overlay
              [&_td]:border [&_td]:border-border [&_td]:p-1.5"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{noteContent}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="sticky top-0 bg-bg/90 backdrop-blur-sm border-b border-border z-raised shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/feed")}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            FEED
          </button>

          <div className="flex-1 min-w-0">
            {article && (
              <h1 className="text-sm text-text-primary font-medium truncate">
                {article.title}
              </h1>
            )}
          </div>

          {article?.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-label font-mono tracking-wider text-text-muted hover:text-text-secondary bg-surface-hover/30 hover:bg-surface-hover border border-border rounded-sm transition-all duration-[var(--transition-base)] shrink-0"
            >
              ORIGINAL
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Mobile tab toggle */}
        {isMobile && (
          <div className="flex border-t border-border">
            <button
              onClick={() => setMobileTab("article")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-label font-mono tracking-wider transition-all duration-[var(--transition-base)] cursor-pointer ${
                mobileTab === "article"
                  ? "text-accent border-b-2 border-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              ARTICLE
            </button>
            <button
              onClick={() => setMobileTab("notes")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-label font-mono tracking-wider transition-all duration-[var(--transition-base)] cursor-pointer ${
                mobileTab === "notes"
                  ? "text-accent border-b-2 border-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              NOTES
            </button>
          </div>
        )}
      </div>

      {/* Content area */}
      {isMobile ? (
        <div className="flex-1 overflow-hidden">
          {mobileTab === "article" ? articlePanel : (
            <div className="h-full">{notesPanel}</div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[70%] overflow-y-auto">{articlePanel}</div>
          <div className="w-[30%] min-w-[280px]">{notesPanel}</div>
        </div>
      )}
    </div>
  );
}
