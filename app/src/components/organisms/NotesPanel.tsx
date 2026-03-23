import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Check, Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Minus, Undo2, Redo2 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import { fetchNotes, saveNote } from "../../lib/api";
import type { Note } from "../../lib/types";

type SaveStatus = "idle" | "saving" | "saved";

interface NotesPanelProps {
  articleId: number;
}

export function NotesPanel({ articleId }: NotesPanelProps) {
  const [_notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<number | undefined>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeNoteIdRef = useRef<number | undefined>(undefined);
  activeNoteIdRef.current = activeNoteId;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Start typing notes...",
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
      Markdown,
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none min-h-[150px] p-3",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const markdown = (ed.storage as any).markdown?.getMarkdown?.() ?? ed.getHTML();
      if (markdown.trim()) {
        debouncedSave(markdown, activeNoteIdRef.current);
      }
    },
  });

  // Set content when initial data loads
  useEffect(() => {
    if (editor && initialContent !== null && !loaded) {
      editor.commands.setContent(initialContent);
      setLoaded(true);
    }
  }, [editor, initialContent, loaded]);

  // Fetch notes
  useEffect(() => {
    if (!articleId) return;
    let cancelled = false;

    async function load() {
      const data = await fetchNotes(articleId);
      if (!cancelled && data.length > 0) {
        setNotes(data);
        setActiveNoteId(data[0].id);
        setInitialContent(data[0].content);
      } else if (!cancelled) {
        setInitialContent("");
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

  return (
    <div className="flex flex-col h-full bg-bg border-l border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
            title="Bold (Cmd+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
            title="Italic (Cmd+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleCode().run()}
            active={editor?.isActive("code")}
            title="Inline code"
          >
            <Code className="w-3.5 h-3.5" />
          </ToolbarButton>

          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
            title="Bullet list"
          >
            <List className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList")}
            title="Numbered list"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editor?.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            <Minus className="w-3.5 h-3.5" />
          </ToolbarButton>

          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-label font-mono text-text-muted tracking-wider">
              <Loader2 className="w-3 h-3 animate-spin" />
              SAVING
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-label font-mono text-accent/70 tracking-wider">
              <Check className="w-3 h-3" />
              SAVED
            </span>
          )}
          {lastSaved && saveStatus === "idle" && (
            <span className="text-label font-mono text-text-muted tracking-wider">
              {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Bubble menu (appears on text selection) */}
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="flex items-center gap-0.5 bg-bg-raised border border-border-emphasis rounded-md shadow-lg p-1">
            <BubbleButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
            >
              <Bold className="w-3 h-3" />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
            >
              <Italic className="w-3 h-3" />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
            >
              <Strikethrough className="w-3 h-3" />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive("code")}
            >
              <Code className="w-3 h-3" />
            </BubbleButton>
          </div>
        </BubbleMenu>
      )}

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Notes label */}
      <div className="px-3 py-1.5 border-t border-border shrink-0">
        <span className="text-label font-mono text-text-muted tracking-wider">
          NOTES · MARKDOWN
        </span>
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-all duration-[var(--transition-fast)] cursor-pointer ${
        active
          ? "bg-accent/15 text-accent"
          : disabled
            ? "text-text-faint cursor-not-allowed"
            : "text-text-muted hover:text-text-secondary hover:bg-surface-hover"
      }`}
    >
      {children}
    </button>
  );
}

function BubbleButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-1 rounded transition-all duration-[var(--transition-fast)] cursor-pointer ${
        active
          ? "bg-accent/20 text-accent"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
      }`}
    >
      {children}
    </button>
  );
}
