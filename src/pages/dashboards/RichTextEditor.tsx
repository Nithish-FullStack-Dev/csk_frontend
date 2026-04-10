import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

const RichTextEditor = ({ value, onChange }: any) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return (
    <div className="border rounded-md p-2 min-h-[150px]">
      <EditorContent editor={editor} />
    </div>
  );
};
