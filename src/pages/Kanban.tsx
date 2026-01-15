/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  Paperclip,
  User,
  Calendar,
  Flag,
  X,
  Plus,
  Search,
  Send,
  AlertCircle,
  Tag,
  Edit2,
  Trash2,
  Save,
  SquarePen,
  Download,
  Eye,
  LucideLoader2,
  LucideLoader,
  LucideXCircle,
  BellElectric,
} from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";
import { Toaster, toast } from "react-hot-toast";
import RichTextEditor from "@/components/common/editor/Editor";
import RenderRichText from "@/components/common/editor/Render";
import { htmlToText } from "@/components/common/editor/htmlToText";

interface Comment {
  id: string;
  user: { id: string; name: string; image: string };
  content: string;
  createdAt: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeAvatar: string;
  priority: "low" | "medium" | "high";
  projectId?: string;
  Project: { name: string; id: string };
  dueDate: string;
  tags: string[];
  comments: Comment[];
  attachments: Array<{
    id: string;
    originalName: string;
    name: string;
    size: string;
    type: string;
    url: string;
  }>;
  status: "assigned" | "in-progress" | "completed" | "on-hold";
}

const priorityClasses = {
  low: "dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 bg-blue-50 text-blue-700 border-blue-200",
  medium:
    "dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30 bg-yellow-50 text-yellow-700 border-yellow-200",
  high: "dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30 bg-red-50 text-red-700 border-red-200",
} as const;

type NewTaskShape = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  tags: string[];
  status: "assigned" | "in-progress" | "completed" | "on-hold";
  attachments: File[] | null;
  projectId: string;
};

export const NewTaskModal: React.FC<{
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  newTask: NewTaskShape;
  assignee: string;
  setNewTask: (t: NewTaskShape) => void;
  handleSubmit: () => void;
  handleAddTag: (tag: string) => void;
  handleRemoveTag: (tag: string) => void;
  projectsLoading: boolean;
  projects: { id: string; name: string }[];
}> = ({
  isOpen,
  onClose,
  mode,
  isLoading,
  assignee,
  newTask,
  setNewTask,
  handleSubmit,
  handleAddTag,
  handleRemoveTag,
  projectsLoading,
  projects,
}) => {
  if (!isOpen) return null;

  const removeAttachment = (index: number) => {
    setNewTask((prev) => {
      if (!prev.attachments) return prev;

      const updated = prev.attachments.filter((_, i) => i !== index);

      return {
        ...prev,
        attachments: updated.length ? updated : null,
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* <Toaster position="top-right" /> */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-[#0a0a0a] flex flex-col pr-2 py-2">
        <div className="sticky top-0 z-10 border-b px-6 py-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center justify-between ">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === "edit" ? "Edit Task" : "Create New Task"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Task Title *
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              placeholder="Enter task title..."
              className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-[#111] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Describe Your Task
            </label>

            <RichTextEditor
              content={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Assignee
              </label>
              <div className="flex items-center gap-2 pl-1">
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-900 dark:text-white font-medium">
                  {assignee || "Loading..."}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="date"
                  value={newTask.dueDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg border bg-white dark:bg-[#111] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setNewTask({ ...newTask, priority })}
                    className={`flex-1 px-4 py-3 rounded-lg border font-medium capitalize transition-all ${
                      newTask.priority === priority
                        ? priority === "low"
                          ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/50"
                          : priority === "medium"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/50"
                          : "bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/50"
                        : "bg-white dark:bg-[#111] border-gray-300 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-700"
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    status: e.target.value as Task["status"],
                  })
                }
                className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-[#111] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Project *
            </label>

            <select
              value={newTask.projectId}
              disabled={projectsLoading}
              onChange={(e) =>
                setNewTask({ ...newTask, projectId: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-[#111]
      border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white
      focus:outline-none focus:ring-2 focus:ring-blue-500
      disabled:opacity-60"
            >
              <option value="">
                {projectsLoading ? "Loading projects..." : "Select a project"}
              </option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div> */}

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {newTask.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tags (press Enter)..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
              className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-[#111] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
             border-gray-300 bg-gray-50
             dark:border-gray-800 dark:bg-[#111]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files || []);
              if (!files.length) return;

              setNewTask((prev) => {
                const existing = prev.attachments ?? [];

                return {
                  ...prev,
                  attachments: [...existing, ...files],
                };
              });
            }}
            onClick={() => document.getElementById("task-file-input")?.click()}
          >
            <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-600" />

            <p className="text-sm mb-1 text-gray-600 dark:text-gray-400">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-600">
              PDF, DOC, Images up to 10MB each
            </p>

            <input
              id="task-file-input"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;

                setNewTask((prev) => {
                  const existing = prev.attachments ?? [];

                  return {
                    ...prev,
                    attachments: [...existing, ...files],
                  };
                });

                e.target.value = "";
              }}
            />
          </div>

          {newTask.attachments?.length > 0 && (
            <div className="mt-3 space-y-2">
              {newTask.attachments.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between text-sm px-4 pr-3 py-3.5 rounded-lg bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-800 dark:text-white text-gray-900"
                >
                  <span className="truncate max-w-[80%]">{file.name}</span>

                  <button type="button" onClick={() => removeAttachment(index)}>
                    <LucideXCircle size={18} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={isLoading ? () => {} : handleSubmit}
              disabled={
                isLoading ||
                !newTask.title.trim() ||
                !newTask.description.trim() ||
                !newTask.dueDate
              }
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-lg font-medium transition-colors grid place-items-center"
            >
              {isLoading ? (
                <LucideLoader className="animate-spin text-white" size={24} />
              ) : mode === "edit" ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SidePanel: React.FC<{
  selectedTask: Task | null;
  onClose: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  commentText: string;
  setCommentText: (v: string) => void;
  handleAddComment: () => void;
  handleReport: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  message: string;
  setMessage: (v: string) => void;
  loading: boolean;
  reportCount: number;
  reportMessages: { message: string }[];
  reportsLoading: boolean;
  currentUserId: string;
  handleEditComment: (commentId: string, newContent: string) => void;
  handleDeleteComment: (commentId: string) => void;
}> = ({
  selectedTask,
  onClose,
  onEditTask,
  onDeleteTask,
  commentText,
  setCommentText,
  handleAddComment,
  reportsLoading,
  loading,
  open,
  setOpen,
  message,
  setMessage,
  handleReport,
  reportCount,
  reportMessages,
  currentUserId,
  handleEditComment,
  handleDeleteComment,
}) => {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [deleteComment, setDeleteComment] = useState<{
    id: string;
    author: string;
  } | null>(null);

  if (!selectedTask) return null;

  // const handleAttachmentDelete = async (id: string) => {
  //   const res = await fetch("/api/kanban/task")
  // }

  const startEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const saveEdit = (commentId: string) => {
    if (editContent.trim()) {
      handleEditComment(commentId, editContent.trim());
      setEditingCommentId(null);
      setEditContent("");
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "image":
        return "🖼️";
      case "figma":
        return "🎨";
      case "zip":
        return "📦";
      case "json":
        return "📋";
      default:
        return "📎";
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex justify-end">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="w-[600px] h-full bg-white dark:bg-[#0a0a0a] shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 border-b px-6 py-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Task Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTask.title}
                </h1>
                <span
                  className={`px-2 py-1 rounded-lg text-sm font-medium border ${
                    priorityClasses[selectedTask.priority]
                  }`}
                >
                  <Flag className="w-3 h-3 inline mr-1" />
                  {selectedTask.priority}
                </span>
              </div>
              <div className="flex  items-center ">
                <div>
                  <button
                    className=" px-3 py-1.5 rounded-md"
                    onClick={() => {
                      if (!selectedTask) return;
                      onEditTask(selectedTask);
                    }}
                  >
                    <SquarePen
                      size={19}
                      className="text-gray-400 hover:text-blue-600"
                    />
                  </button>
                </div>
                <div>
                  <button
                    className="  px-3 py-1.5 rounded-md"
                    onClick={() => setConfirmDelete(selectedTask)}
                  >
                    <Trash2
                      size={19}
                      className="text-gray-400 hover:text-red-700"
                    />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Task ID: #{selectedTask.id}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Explaination
            </h3>
            <RenderRichText html={selectedTask.description} />
            {/* <p className="text-gray-400 dark:text-gray-200">{selectedTask.description}</p> */}
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#111]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Assignee
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-blue-400 to-green-400 text-white dark:from-blue-500 dark:to-green-500">
                  {selectedTask.assignee.charAt(0)}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedTask.assignee}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Due Date
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(selectedTask.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tags
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedTask.tags.length > 0 ? (
                  selectedTask.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 ml-4 ">
                    No Tags Provided
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Attachments
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedTask.attachments.length} files
              </span>
            </div>
          </div>
          {selectedTask?.Project && (
            <div className="w-full h-16 rounded-lg dark:bg-[#111] bg-gray-50 flex justify-start px-4 items-center">
              <p className="text-base">
                Project:{" "}
                <span className="font-semibold">
                  {selectedTask.Project.name}
                </span>
              </p>
            </div>
          )}

          <div className="p-4 rounded-xl border bg-red-50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-red-700 dark:text-red-400">
                  {reportMessages.length === 0
                    ? "Report an Issue"
                    : `${reportMessages.length} issue${
                        reportMessages.length > 1 ? "s" : ""
                      } reported`}
                </h3>
                <p className="text-sm mb-3 text-red-600/70 dark:text-red-300/70">
                  {reportCount === 0
                    ? "Found a problem? Let us know and we'll help resolve it."
                    : "Issue reported. Team will review soon."}
                </p>
                {/* Reports Section */}
                {reportsLoading ? (
                  <div className="text-sm text-red-700 dark:text-red-300 mb-3">
                    Loading reports...
                  </div>
                ) : reportMessages.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {reportMessages.map((msg, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 rounded-md  text-red-700 dark:text-red-300 border"
                      >
                        {msg.message}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    No issues reported for this task.
                  </div>
                )}

                <button
                  onClick={() => setOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300"
                >
                  Report Issue
                </button>
              </div>
            </div>
          </div>

          {open && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-[#111] w-full max-w-md p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Report an Issue</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <textarea
                  className="w-full h-32 p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-black outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Describe the issue here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedTask.attachments.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Paperclip className="w-5 h-5" />
                  Attachments ({selectedTask.attachments.length})
                </h3>
              </div>
              <div className="space-y-2">
                {selectedTask.attachments?.map((file, id) => (
                  <div
                    key={file.id ?? id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200 hover:border-gray-300 dark:bg-[#111] dark:border-gray-800 dark:hover:border-gray-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-gray-900 dark:text-white">
                          {file.originalName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {file.size}
                        </p>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-sm px-3 py-1 rounded-md"
                    >
                      <Eye className="hover:text-blue-400" size={20} />
                    </a>
                    <button
                      onClick={async () => {
                        const res = await fetch(file.url);
                        const blob = await res.blob();

                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.title = file.name;
                        a.download = file.name;
                        a.click();

                        URL.revokeObjectURL(a.href);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-sm py-1 rounded-md"
                    >
                      <Download className="hover:text-green-300" size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ENHANCED COMMENTS SECTION */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageSquare className="w-5 h-5" />
              Comments ({selectedTask?.comments?.length})
            </h3>

            <div className="space-y-4 mb-4">
              {selectedTask.comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 pt-3 rounded-xl bg-gray-50 dark:bg-[#111] group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-green-400 to-teal-400 text-white dark:from-green-500 dark:to-teal-500 mt-2">
                      {comment.user?.image ? (
                        <div className="w-full h-full overflow-hidden rounded-full border border-blue-600">
                          <img
                            src={comment.user.image}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <p>{comment.user.name.charAt(0)}</p>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-full flex justify-start items-start flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {comment.user.name}
                          </span>
                        </div>

                        {/* EDIT/DELETE BUTTONS - Only show if current user is the author */}
                        {comment.user.id === currentUserId && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingCommentId === comment.id ? (
                              <>
                                <button
                                  onClick={() => saveEdit(comment.id)}
                                  className="p-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400"
                                  title="Save"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(comment)}
                                  className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteComment({
                                      id: comment.id,
                                      author: comment.user.name,
                                    })
                                  }
                                  className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* COMMENT CONTENT OR EDIT TEXTAREA */}
                      {editingCommentId === comment.id ? (
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white"
                          rows={3}
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 dark:bg-[#111] dark:border-gray-800">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE TASK MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#111] rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-red-600 mb-2">Delete Task</h3>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-5">
              Are you sure you want to delete
              <span className="font-semibold"> “{confirmDelete.title}”</span>?
              <br />
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>

              <button
                disabled={deleting}
                onClick={() => {
                  if (!selectedTask) return;
                  onDeleteTask(selectedTask.id);
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Delete Modal */}
      {deleteComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-red-600">Delete Comment</h2>

            <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this comment by{" "}
              <strong>{deleteComment.author}</strong>? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3 mt-5">
              {/* Cancel */}
              <button
                onClick={() => setDeleteComment(null)}
                className="
            px-4 py-2 rounded-md border
            text-gray-700 dark:text-gray-300
            bg-white dark:bg-gray-800
            hover:bg-gray-100 dark:hover:bg-gray-700
            hover:border-gray-400
            transition-all duration-200
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-gray-400/50
          "
              >
                Cancel
              </button>

              {/* Delete */}
              <button
                onClick={async () => {
                  await handleDeleteComment(deleteComment.id);
                  setDeleteComment(null);
                }}
                className="
            px-4 py-2 rounded-md
            bg-red-600 text-white
            hover:bg-red-700
            transition-all duration-200
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-red-500/60
          "
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KanbanBoard: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [reportMessages, setReportMessages] = useState<{ message: string }[]>(
    []
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState(String);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [commentText, setCommentText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskShape>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    tags: [],
    status: "assigned",
    attachments: null,
    projectId: "",
  });

  const [assigne, setAssigne] = useState<string>("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("__ME__");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [taskemployee, settaskemployee] = useState<any>(null);
  const [taskMode, setTaskMode] = useState<"create" | "edit">("create");
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [transition, setTransition] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const res = await fetch("/api/project"); // your projects API
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchAdmin = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/loginuser/", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.user) {
        setAssigne(data.user.name);
      }
    } catch (err) {
      console.error("Failed to load Me", err);
      toast.error("Failed to load Me");
    }
  };

  // const fetchUserRole = async () => {
  //   const res = await fetch("http://localhost:3000/api/loginuser/", {
  //     credentials: "include",
  //   });

  //   if (!res.ok) {
  //     console.error("API failed", res.status);
  //     return;
  //   }

  //   const data = await res.json();

  //   console.log("current user", data.user);

  //   const currentUser = data.user;

  //   setCurrentUser(currentUser);

  //   const role = currentUser.role?.toUpperCase();
  //   setUserRole(role);

  //   if (role === "ADMIN") {
  //     fetchEmployees();
  //   }
  // };

  // const fetchEmployees = async () => {
  //   const res = await fetch("http://localhost:3000/api/user/getUsers", {
  //     credentials: "include", // in case it becomes protected later
  //   });

  //   const data = await res.json();

  //   console.log("ALL USERS", data.users);

  //   setEmployees(data.users);
  // };

  const fetchUserRole = async () => {
    const res = await fetch("http://localhost:3000/api/loginuser/", {
      credentials: "include",
    });

    const data = await res.json();
    const user = data.user;
    console.log(user);

    setCurrentUser(user);

    const role = user.role?.toUpperCase();
    setUserRole(role);
    setSelectedRole(role);

    if (role === "ADMIN") {
      fetchEmployees();
    }
  };

  const fetchEmployees = async () => {
    const res = await fetch("http://localhost:3000/api/user/getUsers", {
      credentials: "include",
    });

    const data = await res.json();
    setEmployees(data.users);
    console.log(data.users);

    // const uniqueRoles = [
    //   ...new Set(
    //     data.users.map((u: any) => u.role?.toUpperCase()).filter(Boolean)
    //   ),
    // ];
    //     const rolesFromUsers = data.users
    //       .map((u: any) => u.role?.toUpperCase())
    //       .filter((r): r is string => Boolean(r));

    //     const allRoles = new Set<string>(rolesFromUsers);

    //     // 🔑 Force-add the logged-in user’s role (ADMIN)
    //     if (currentUser && currentUser.role) {
    //       allRoles.add(currentUser.role.toUpperCase());
    //     }
    // console.log(roles, allRoles, "ALL ROLES");

    //     setRoles(Array.from(allRoles));
  };

  const fetchTasks = async (employeeName?: string) => {
    try {
      setTasksLoading(true);

      const url = new URL("http://localhost:3000/api/kanban/tasks", window.location.origin);

      if (employeeName && employeeName !== "__ME__") {
        url.searchParams.set("employeeId", employeeName);
      }

      const res = await fetch(url.toString(), {
        credentials: "include",
      });

      const data = await res.json();

      setTasks(data.tasks ?? []);
    } catch (err) {
      console.error("Kanban Fetch Error:", err);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const columns = [
    { id: "on-hold", title: "On Hold", icon: BellElectric, color: "orange" },
    { id: "assigned", title: "Assigned", icon: User, color: "blue" },
    { id: "in-progress", title: "In Progress", icon: Clock, color: "yellow" },
    { id: "completed", title: "Completed", icon: CheckCircle2, color: "green" },
  ];

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleUpdateTask = async () => {
    if (!taskToEdit) return;

    try {
      setTransition(true);
      const formData = new FormData();
      formData.append("id", taskToEdit.id);
      formData.append("title", newTask.title.trim());
      formData.append("description", newTask.description.trim());
      formData.append("assignee", assigne);
      formData.append("priority", newTask.priority);
      formData.append("dueDate", newTask.dueDate);
      formData.append("status", newTask.status);
      formData.append("tags", newTask.tags.join(","));
      formData.append("projectId", newTask.projectId);

      if (newTask.attachments?.length) {
        newTask.attachments.forEach((file) => {
          formData.append("attachment", file);
        });
      }

      const res = await fetch("http://localhost:3000/api/kanban/tasks", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Update failed");
        return;
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === data.task.id ? data.task : t))
      );

      setSelectedTask(data.task);
      setShowNewTaskModal(false);
      setTaskMode("create");
      setTaskToEdit(null);
      toast.success("Task updated");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setTransition(false);
    }
  };

  const handleSubmitTask = async () => {
    if (taskMode === "edit") {
      await handleUpdateTask();
    } else {
      await handleCreateTask();
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskMode("edit");
    setTaskToEdit(task);

    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate.split("T")[0],
      tags: task.tags,
      status: task.status,
      attachments: null,
      projectId: task?.Project?.id || "",
    });

    setShowNewTaskModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch("http://localhost:3000/api/kanban/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete task");
        return;
      }

      toast.success("Task deleted successfully");

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTask(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: Task["status"]) => {
    if (!draggedTask) return;

    const prevTasks = [...tasks];

    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggedTask.id ? { ...task, status: newStatus } : task
      )
    );

    try {
      const res = await fetch("http://localhost:3000/api/kanban/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draggedTask.id,
          status: newStatus,
        }),
        credentials: "include" ,
      });

      if (draggedTask.projectId && newStatus === "completed") {
        await fetch("/api/project/work-done", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: draggedTask.projectId,
            taskId: draggedTask.id,
            title: draggedTask.title,
            description: draggedTask.description,
            priority: draggedTask.priority,
            dueDate: draggedTask.dueDate,
            tags: draggedTask.tags,
            userId: currentUser.id,
          }),
        });
      }

      if (
        draggedTask.projectId &&
        draggedTask.status === "completed" &&
        newStatus !== "completed"
      ) {
        await fetch(`/api/project/work-done?taskId=${draggedTask.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!res.ok) {
        throw new Error("Failed to update");
      }
    } catch (err) {
      console.error("API Update Failed:", err);
      setTasks(prevTasks);
    }

    setDraggedTask(null);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTask) return;

    try {
      const res = await fetch("/api/kanban/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText,
          taskId: selectedTask.id,
        }),
      });

      const data = await res.json();

      if (data.success && data.comment) {
        const newComment = data.comment;

        setTasks(
          tasks.map((task) =>
            task.id === selectedTask.id
              ? { ...task, comments: [...(task.comments || []), newComment] }
              : task
          )
        );

        setSelectedTask({
          ...selectedTask,
          comments: [...(selectedTask.comments || []), newComment],
        });

        setCommentText("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    if (!selectedTask) return;

    try {
      const res = await fetch("/api/kanban/comment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          content: newContent,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const updatedComments = selectedTask.comments.map((c) =>
          c.id === commentId ? { ...c, content: newContent } : c
        );

        setTasks(
          tasks.map((task) =>
            task.id === selectedTask.id
              ? { ...task, comments: updatedComments }
              : task
          )
        );

        setSelectedTask({
          ...selectedTask,
          comments: updatedComments,
        });
      }
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedTask) return;

    try {
      const res = await fetch("/api/kanban/comment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });

      const data = await res.json();

      if (data.success) {
        const updatedComments = selectedTask.comments.filter(
          (c) => c.id !== commentId
        );

        setTasks(
          tasks.map((task) =>
            task.id === selectedTask.id
              ? { ...task, comments: updatedComments }
              : task
          )
        );

        setSelectedTask({
          ...selectedTask,
          comments: updatedComments,
        });
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const fetchReports = async (taskId: string) => {
    try {
      setReportsLoading(true);
      setReportMessages([]);

      const res = await fetch(`/api/kanban/report?taskId=${taskId}`);
      const data = await res.json();

      if (data.success) {
        setReportCount(data.count || 0);
        setReportMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    console.log("this is called create");

    if (!newTask.title.trim()) return;

    try {
      setTransition(true);
      const formData = new FormData();
      const assigneeName = assigne || "Unassigned";
      const userId = taskemployee || currentUser._id || "";

      formData.append("title", newTask.title.trim());
      formData.append("description", newTask.description.trim());
      formData.append("assignee", assigneeName);
      formData.append("userId", userId);
      formData.append(
        "assigneeAvatar",
        assigneeName !== "Unassigned"
          ? assigneeName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : ""
      );
      formData.append("priority", newTask.priority);
      formData.append("dueDate", newTask.dueDate);
      formData.append("status", newTask.status);
      formData.append("tags", newTask.tags.join(","));

      if (newTask.attachments?.length) {
        newTask.attachments.forEach((file) => {
          formData.append("attachment", file);
        });
      }

      const res = await fetch("http://localhost:3000/api/kanban/tasks/create", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Create Task Error:", data);
        return;
      }

      setTasks((prev) => [...prev, data.task]);

      setShowNewTaskModal(false);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        tags: [],
        status: "assigned",
        attachments: null,
        projectId: "",
      });
    } catch (error) {
      console.error("Create Task Exception:", error);
    } finally {
      setTransition(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !newTask.tags.includes(tag.trim())) {
      setNewTask({ ...newTask, tags: [...newTask.tags, tag.trim()] });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTask({
      ...newTask,
      tags: newTask.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleReport = async () => {
    if (!message.trim() || !selectedTask) {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/kanban/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          taskId: selectedTask.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setReportCount((prev) => prev + 1);
        toast.success("Report submitted successfully");
        setMessage("");
        setOpen(false);
        await fetchReports(selectedTask.id);
      } else {
        toast.error(data.error || "Failed to send report");
      }
    } catch (err) {
      console.error("Report error:", err);
      toast.error("Something went wrongg");
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTasksByStatus = (status: Task["status"]) =>
    filteredTasks.filter((task) => task.status === status);

  const filteredEmployees = selectedRole
    ? employees.filter((u) => u.role?.toUpperCase() === selectedRole)
    : employees;

  useEffect(() => {
    if (!selectedRole || selectedRole === userRole) return;

    const first = filteredEmployees[0];
    if (first) {
      setSelectedEmployee(first.employeeId);
    }
  }, [selectedRole, filteredEmployees, userRole]);

  useEffect(() => {
    console.log("iman called fetch task useeffect");
    
    if (selectedEmployee === "__ME__") {
      console.log("useee",currentUser?._id);
      
      fetchTasks(currentUser?._id);
      settaskemployee(currentUser?._id);
    } else {
      fetchTasks(selectedEmployee);
      settaskemployee(selectedEmployee);
    }
  }, [selectedEmployee]);

  useEffect(() => {
    if (!selectedTask) return;
    fetchReports(selectedTask.id);
  }, [selectedTask?.id]);

  useEffect(() => {
    if (!selectedTaskId) return;

    const task = tasks.find((t) => t.id === selectedTaskId);
    if (task) {
      setSelectedTask(task);
    }
  }, [tasks, selectedTaskId]);

  useEffect(() => {
    fetchAdmin();
    fetchUserRole();
    fetchTasks();
    console.log("its called");
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    console.log(currentUser._id, "this is user");
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const roleSet = new Set<string>();

    // roles from all employees
    employees.forEach((u) => {
      if (u.role) roleSet.add(u.role.toUpperCase());
    });

    // force-add current user's role (critical for ADMIN)
    if (currentUser?.role) {
      roleSet.add(currentUser.role.toUpperCase());
    }

    setRoles([...roleSet]);
  }, [employees, currentUser]);

  return (
    <MainLayout>
      <div className="min-h-screen transition-colors duration-200">
        <Toaster position="top-right" />
        <div className="border-b">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kanban Board
              </h1>

              <div className="flex items-center gap-3">
                {userRole === "ADMIN" && (
                  <div className="flex items-center gap-3">
                    {/* ROLE SELECT */}
                    <select
                      value={selectedRole || ""}
                      onChange={(e) => {
                        const role = e.target.value;
                        setSelectedRole(role);

                        // if switching away from own role, select first employee of that role
                        if (role !== userRole) {
                          setSelectedEmployee("");
                        } else {
                          setSelectedEmployee("__ME__");
                        }
                      }}
                      className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {roles.map((role, i) => (
                        <option key={i} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>

                    {/* EMPLOYEE SELECT */}
                    <select
                      value={selectedEmployee || ""}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {/* Placeholder when no employee selected */}
                      <option value="" disabled>
                        Choose…
                      </option>

                      {selectedRole === userRole && (
                        <option value="__ME__">My Tasks</option>
                      )}

                      {filteredEmployees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                  />
                </div>

                <button
                  onClick={() => {
                    setShowNewTaskModal(true);
                    if (currentUser) {
                      setNewTask((prev) => ({
                        ...prev,
                        assignee: currentUser.name,
                        assigneeAvatar: currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase(),
                      }));
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 py-6">
          {tasksLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading tasks...
                </p>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tasks found
              </h3>
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {columns.map((column) => {
                const Icon = column.icon;
                const columnTasks = getTasksByStatus(
                  column.id as Task["status"]
                );

                return (
                  <div key={column.id} className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${
                            column.color === "blue"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                              : column.color === "yellow"
                              ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400"
                              : column.color === "orange"
                              ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                              : "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {column.title}
                        </h2>
                      </div>
                      <h2 className="font-medium text-base text-gray-600 dark:text-white mr-4">
                        {" "}
                        {columnTasks.length}
                      </h2>
                    </div>

                    <div
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(column.id as Task["status"])}
                      className={`flex-1 space-y-3 min-h-[200px] p-1 rounded-lg ${
                        draggedTask && draggedTask.status !== column.id
                          ? "bg-gray-100/50 dark:bg-gray-800/30"
                          : ""
                      }`}
                    >
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          onClick={() => setSelectedTaskId(task.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all bg-white dark:bg-gray-800/[0.5] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 ${
                            draggedTask?.id === task.id ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-gray-600 dark:text-white line-clamp-2">
                              {task.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-medium border ${
                                priorityClasses[task.priority]
                              } flex-shrink-0 ml-2`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <p className="text-sm mb-3 line-clamp-2 text-gray-600 dark:text-gray-400">
                            {htmlToText(task.description)}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {task.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {task.comments?.length}
                                </span>
                              </div>
                              {task.attachments.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Paperclip className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {task.attachments.length}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-gradient-to-br from-blue-500 to-green-500 text-white">
                                {task.assignee.charAt(0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <SidePanel
          selectedTask={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          commentText={commentText}
          setCommentText={setCommentText}
          handleAddComment={handleAddComment}
          reportsLoading={reportsLoading}
          loading={loading}
          open={open}
          setOpen={setOpen}
          message={message}
          setMessage={setMessage}
          handleReport={handleReport}
          reportCount={reportCount}
          reportMessages={reportMessages}
          currentUserId={currentUser?.id || ""}
          handleEditComment={handleEditComment}
          handleDeleteComment={handleDeleteComment}
        />

        <NewTaskModal
          isOpen={showNewTaskModal}
          assignee={assigne}
          onClose={() => {
            setShowNewTaskModal(false);
            setTaskMode("create");
            setTaskToEdit(null);
          }}
          mode={taskMode}
          newTask={newTask}
          setNewTask={setNewTask}
          handleSubmit={handleSubmitTask}
          handleAddTag={handleAddTag}
          handleRemoveTag={handleRemoveTag}
          projectsLoading={projectsLoading}
          projects={projects}
          isLoading={transition}
        />
      </div>
    </MainLayout>
  );
};

export default KanbanBoard;
