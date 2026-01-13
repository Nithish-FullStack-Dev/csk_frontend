import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  CheckSquare,
  Undo,
  Redo,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LinkIcon,
  Highlighter
} from "lucide-react";
import { IconSelect } from "./IconSelect";
import { useState } from "react";

export default function Toolbar({ isBigEditor = false, editor }: { isBigEditor?: boolean, editor: Editor }) {
  const [color, setColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#fef08a"); // soft yellow
  /* -------- CURRENT STATES -------- */

  const headingIcon =
    editor.isActive("heading", { level: 1 }) ? <Heading1 size={16} /> :
    editor.isActive("heading", { level: 2 }) ? <Heading2 size={16} /> :
    editor.isActive("heading", { level: 3 }) ? <Heading3 size={16} /> :
    <Pilcrow size={16} />;

  const alignIcon =
    editor.isActive({ textAlign: "center" }) ? <AlignCenter size={16} /> :
    editor.isActive({ textAlign: "right" }) ? <AlignRight size={16} /> :
    <AlignLeft size={16} />;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-800 ${isBigEditor ? "rounded-lg dark:bg-gray-800 bg-gray-100" : "bg-gray-50 dark:bg-[#0f0f0f] rounded-t-xl"}`}>

      {/* Heading Select */}
      <IconSelect
        value={headingIcon}
        options={[
          { icon: <Pilcrow size={16} />, onClick: () => editor.chain().focus().setParagraph().run() },
          { icon: <Heading1 size={16} />, onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
          { icon: <Heading2 size={16} />, onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
          { icon: <Heading3 size={16} />, onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        ]}
      />

      {/* Formatting */}
      <Group>
        <ToolButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline size={16} />
        </ToolButton>
      </Group>

      {/* Lists */}
      <Group>
        <ToolButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <CheckSquare size={16} />
        </ToolButton>
      </Group>

      {/* Alignment Select */}
      <IconSelect
        value={alignIcon}
        options={[
          { icon: <AlignLeft size={16} />, onClick: () => editor.chain().focus().setTextAlign("left").run() },
          { icon: <AlignCenter size={16} />, onClick: () => editor.chain().focus().setTextAlign("center").run() },
          { icon: <AlignRight size={16} />, onClick: () => editor.chain().focus().setTextAlign("right").run() },
        ]}
      />

      <Group>
<ToolButton
  active={editor.isActive("highlight")}
  onClick={() => {
    const isActive = editor.isActive("highlight");

    if (isActive) {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor
        .chain()
        .focus()
        .setHighlight({ color: highlightColor })
        .run();
    }
  }}
>
  <Highlighter size={16} />
</ToolButton>


  {/* Highlight Color Picker */}
  <div className="relative">
<input
  type="color"
  value={highlightColor}
  onChange={(e) => {
    const color = e.target.value;
    setHighlightColor(color);

    editor
      .chain()
      .focus()
      .setHighlight({ color })
      .run();
  }}
  className="absolute inset-0 opacity-0 cursor-pointer"
/>

    <div
      className="h-6 w-6 rounded-full border border-gray-300 dark:border-gray-700"
      style={{ backgroundColor: highlightColor }}
    />
  </div>
</Group>


      <Group>
        <ToolButton
          onClick={() => {
            const url = prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <LinkIcon size={16} />
        </ToolButton>
      </Group>

      {/* Color */}
      <div className="relative">
        <input
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            editor.chain().focus().setColor(e.target.value).run();
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div
          className="h-6 w-6 rounded-full border border-gray-300 dark:border-gray-700"
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="flex-1" />

      {/* Undo / Redo */}
      <Group>
        <ToolButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={16} />
        </ToolButton>
      </Group>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 mr-2 last:border-none last:pr-0 last:mr-0">
      {children}
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 w-8 rounded-md flex items-center justify-center transition ${
        active
          ? "bg-gray-900 text-white dark:bg-white dark:text-black"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );
}
