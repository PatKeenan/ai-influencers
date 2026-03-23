import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, FileText, StickyNote, Loader2, Monitor, BookOpen } from "lucide-react";
import DOMPurify from "dompurify";
import { fetchArticleContent } from "../../lib/api";
import { useIsMobile } from "../../hooks/useIsMobile";
import { NotesPanel } from "../organisms/NotesPanel";
import type { ArticleContent } from "../../lib/types";

type MobileTab = "article" | "notes";
type ReaderMode = "iframe" | "reader";

const READER_MODE_KEY = "influence:reader-mode";

function getStoredMode(): ReaderMode {
  try {
    const stored = localStorage.getItem(READER_MODE_KEY);
    if (stored === "iframe" || stored === "reader") return stored;
  } catch { /* ignore */ }
  return "iframe";
}

export function IframeReaderPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const id = Number(articleId);

  // Article state
  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [articleLoading, setArticleLoading] = useState(true);
  const [articleError, setArticleError] = useState<string | null>(null);

  // Iframe state
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Mobile tab
  const [mobileTab, setMobileTab] = useState<MobileTab>("article");

  // Reader mode toggle
  const [readerMode, setReaderMode] = useState<ReaderMode>(getStoredMode);

  // Fetch article content (needed for title, url, and extracted content fallback)
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

  // Reset iframe state when article changes
  useEffect(() => {
    setIframeLoaded(false);
    setIframeError(false);
  }, [article?.url]);

  const toggleReaderMode = () => {
    const next: ReaderMode = readerMode === "iframe" ? "reader" : "iframe";
    setReaderMode(next);
    try {
      localStorage.setItem(READER_MODE_KEY, next);
    } catch { /* ignore */ }
  };

  /** Sanitize extracted HTML to prevent XSS — uses DOMPurify for safe rendering */
  function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target"],
    });
  }

  const proxyUrl = article?.url
    ? `/api/proxy?url=${encodeURIComponent(article.url)}`
    : null;

  // Iframe article panel
  const iframePanel = (
    <div className="flex-1 overflow-hidden bg-bg-raised relative">
      {/* Loading spinner */}
      {!iframeLoaded && !iframeError && proxyUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
          <Loader2 className="w-6 h-6 text-accent/50 animate-spin" />
          <span className="text-sm font-mono text-text-muted tracking-wider">LOADING ORIGINAL...</span>
        </div>
      )}

      {/* Iframe error fallback */}
      {iframeError && (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 p-6">
          <FileText className="w-8 h-8 text-text-muted" />
          <p className="text-sm text-text-tertiary text-center">Could not load the original page in the reader.</p>
          {article?.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors font-mono"
            >
              OPEN IN NEW TAB
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* No URL */}
      {!proxyUrl && !articleLoading && (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 p-6">
          <FileText className="w-8 h-8 text-text-muted" />
          <p className="text-sm text-text-tertiary text-center">No URL available for this article.</p>
        </div>
      )}

      {/* Article loading */}
      {articleLoading && (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
          <Loader2 className="w-6 h-6 text-accent/50 animate-spin" />
          <span className="text-sm font-mono text-text-muted tracking-wider">LOADING...</span>
        </div>
      )}

      {/* The iframe */}
      {proxyUrl && !iframeError && !articleLoading && (
        <iframe
          src={proxyUrl}
          className={`w-full h-full border-0 ${iframeLoaded ? "opacity-100" : "opacity-0"}`}
          sandbox="allow-same-origin allow-scripts allow-popups"
          title={article?.title ?? "Article"}
          onLoad={() => setIframeLoaded(true)}
          onError={() => setIframeError(true)}
        />
      )}
    </div>
  );

  // Extracted content panel (reader mode fallback)
  const extractedPanel = (
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

  const articlePanel = readerMode === "iframe" ? iframePanel : extractedPanel;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="sticky top-0 bg-bg/90 backdrop-blur-sm border-b border-border z-raised shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Back button */}
          <button
            onClick={() => navigate("/feed")}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            FEED
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            {article && (
              <h1 className="text-sm text-text-primary font-medium truncate">
                {article.title}
              </h1>
            )}
          </div>

          {/* Reader mode toggle */}
          <button
            onClick={toggleReaderMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-label font-mono tracking-wider border rounded-sm transition-all duration-[var(--transition-base)] cursor-pointer shrink-0 ${
              readerMode === "iframe"
                ? "text-accent bg-accent/15 border-accent/30 hover:bg-accent/25"
                : "text-text-muted bg-surface-hover/30 border-border hover:text-text-secondary hover:bg-surface-hover"
            }`}
            title={readerMode === "iframe" ? "Switch to extracted reader" : "Switch to iframe reader"}
          >
            {readerMode === "iframe" ? (
              <>
                <Monitor className="w-3 h-3" />
                IFRAME
              </>
            ) : (
              <>
                <BookOpen className="w-3 h-3" />
                READER
              </>
            )}
          </button>

          {/* Open original */}
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
            <div className="h-full">
              <NotesPanel articleId={id} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[70%] overflow-hidden flex flex-col border-r border-border shadow-[2px_0_8px_rgba(0,0,0,0.3)]">
            {articlePanel}
          </div>
          <div className="w-[30%] min-w-[280px]">
            <NotesPanel articleId={id} />
          </div>
        </div>
      )}
    </div>
  );
}
