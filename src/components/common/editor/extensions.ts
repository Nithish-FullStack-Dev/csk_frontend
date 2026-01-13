import StarterKit from "@tiptap/starter-kit";
import {TextStyle} from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

import {Table} from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Highlight from "@tiptap/extension-highlight";

export const extensions = [
  StarterKit.configure({
    bulletList: false,
    orderedList: false,
    listItem: false,
  }),

  Highlight.configure({
    multicolor: true,
  }),

  BulletList,
  OrderedList,
  ListItem,

  TaskList.configure({
    HTMLAttributes: {
      class: "task-list",
    },
  }),

  TaskItem.configure({
    nested: true,
  }),

  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: "editor-table",
    },
  }),
  TableRow,
  TableHeader,
  TableCell,

  TextStyle,
  Color,
  Underline,
  FontFamily,
  TextAlign.configure({
  types: ["heading", "paragraph"],
  defaultAlignment: "left",
}),
  Link,
  Placeholder,
];
