import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote,
  Link2, ImagePlus, Undo2, Redo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadBlogBodyImage } from "@/lib/admin/uploadBlogImage";
import { getBlogImageUrl } from "@/lib/admin/uploadBlogImage";
import { NotAnImageError } from "@/lib/images/optimizeImage";

type Props = {
  value: string;
  onChange: (html: string) => void;
  /** Minimum editor height. The body is the main working area. */
  minHeight?: string;
};

const ToolbarButton = ({
  active,
  onClick,
  label,
  children,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant={active ? "secondary" : "ghost"}
        size="icon"
        className="h-9 w-9"
        onClick={onClick}
        aria-label={label}
        disabled={disabled}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom">{label}</TooltipContent>
  </Tooltip>
);

export default function RichTextEditor({ value, onChange, minHeight = "560px" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ HTMLAttributes: { class: "post-image" } }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "post-body focus:outline-none px-5 py-5",
        style: `min-height:${minHeight}`,
      },
      handleDrop: () => false,
    },
  });

  // Keep the editor in sync when a post loads after mount.
  useEffect(() => {
    if (!editor) return;
    if (value && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value === "" ? "" : undefined]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  const handleFile = async (file: File | undefined, posAtDrop?: number) => {
    if (!file || !editor) return;
    setUploading(true);
    setProgress(0);
    try {
      const path = await uploadBlogBodyImage(file, setProgress);
      const chain = editor.chain().focus();
      if (typeof posAtDrop === "number") chain.setTextSelection(posAtDrop);
      chain.setImage({ src: getBlogImageUrl(path) }).run();
    } catch (e) {
      toast.error(
        e instanceof NotAnImageError ? e.message : `Upload failed: ${(e as Error).message}`,
      );
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  /** Dropping an image file anywhere in the editor inserts it at the drop point. */
  const onDrop = (e: React.DragEvent) => {
    const file = Array.from(e.dataTransfer.files ?? []).find((f) => f.type.startsWith("image/"));
    setDragOver(false);
    if (!file || !editor) return;
    e.preventDefault();
    const coords = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
    void handleFile(file, coords?.pos);
  };

  if (!editor) return null;

  return (
    <div
      className={cn(
        "relative border rounded-md bg-card overflow-hidden transition-colors duration-300",
        dragOver ? "border-ink/60" : "border-line",
      )}
      onDragOver={(e) => {
        if (!Array.from(e.dataTransfer.types ?? []).includes("Files")) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragOver(false);
      }}
      onDrop={onDrop}
    >
      <div className="sticky top-0 z-10 flex flex-nowrap items-center gap-1 overflow-x-auto [&>*]:shrink-0 sm:flex-wrap border-b border-line px-2 py-1.5 bg-sand/80 backdrop-blur">
        <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <span className="w-px h-5 bg-line mx-1" />
        <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <span className="w-px h-5 bg-line mx-1" />
        <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <span className="w-px h-5 bg-line mx-1" />
        <ToolbarButton
          label={uploading ? "Uploading image…" : "Insert image (or drag one in)"}
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </ToolbarButton>
        <span className="flex-1" />
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <EditorContent editor={editor} />

      {dragOver && !uploading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-sand/70">
          <span className="text-xs uppercase tracking-[0.14em] text-ink">Drop image to insert</span>
        </div>
      )}

      {uploading && (
        <div className="border-t border-line bg-sand/60 px-4 py-3 space-y-2">
          <p className="flex items-center gap-2 text-xs text-stone">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Optimising and uploading image… {Math.round(progress)}%
          </p>
          <Progress value={progress} className="h-1" />
        </div>
      )}
    </div>
  );
}
