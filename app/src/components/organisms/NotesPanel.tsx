import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchNotes, saveNote } from "../../lib/api";
import type { Note } from "../../lib/types";

type SaveStatus = "idle" | "saving" | "saved";

interface NotesPanelProps {
  articleId: number;
}

export function NotesPanel({ articleId }: NotesPanelProps) {
  const [_notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [activeNoteId, setActiveNoteId] = useState<number | undefined>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch notes
  useEffect(() => {
    if (!articleId) return;
    let cancelled = false;

    async function load() {
      const data = await fetchNotes(articleId);
      if (!cancelled && data.length > 0) {
        setNotes(data);
        setNoteContent(data[0].content);
        setActiveNoteId(data[0].id);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [articleId]);

  // Auto-save with debounce
  const debouncedSave = useCallback(
    (content: string, noteId?: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus("saving");

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const saved = await saveNote(articleId, content, noteId);
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
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("idle");
        }
      }, 1000);
    },
    [articleId]
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

  return (
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
}
