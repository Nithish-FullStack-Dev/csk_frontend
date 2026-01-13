"use client";

import { useEditor, EditorContent } from "@tiptap/react"
import Toolbar from "./Toolbar";
import { extensions } from "./extensions";

type Props = {
  isBigEditor?: boolean;
  content?: string;
  onChange: (html: string) => void;
};

const editorClassName = [
  "prose",
  "prose-neutral",
  "dark:prose-invert",
  "max-w-none",
  "px-4",
  "py-4",
  "min-h-[320px]",
  "focus:outline-none",

  "prose-p:text-[15.5px]",
  "prose-p:leading-[1.85]",

  "prose-h1:text-[34px]",
  "prose-h1:font-semibold",
  "prose-h1:tracking-tight",
  "prose-h1:mb-6",

  "prose-h2:text-[26px]",
  "prose-h2:font-semibold",
  "prose-h2:tracking-tight",
  "prose-h2:mb-4",

  "prose-h3:text-[20px]",
  "prose-h3:font-medium",
  "prose-h3:mb-3",

  "prose-strong:font-semibold",
  "prose-a:text-blue-600",
  "dark:prose-a:text-blue-400",

  "prose-code:bg-gray-100",
  "dark:prose-code:bg-gray-800",
  "prose-code:px-1",
  "prose-code:rounded",
].join(" ");

export default function RichTextEditor({ isBigEditor = false, content, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content,
    editorProps: {
      attributes: {
        class: editorClassName,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    isBigEditor ? (
      <div className="relative  w-full">
      <Toolbar editor={editor} isBigEditor={true} />
      <div className="mt-4 rounded-xl min-h-[73vh] h-auto border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 shadow-sm">
      <EditorContent editor={editor} />
      </div>
      </div>
    ) : (
      <div className={`w-full rounded-xl min-h-[220px] h-auto border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d0d0d] shadow-sm`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      </div>
    )
  );
}
