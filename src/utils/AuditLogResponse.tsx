import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import MainLayout from "@/components/layout/MainLayout";

type OperationType = "insert" | "update" | "delete";

interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
}

interface AuditLog {
  _id: string;
  operationType: OperationType;
  database: string;
  collectionName: string;
  documentId: unknown;
  fullDocument: Record<string, unknown> | null;
  updatedFields: Record<string, unknown> | null;
  previousFields: Record<string, unknown> | null;
  removedFields: string[];
  userId: string | PopulatedUser | null;
  createdAt: string;
  updatedAt: string;
}

interface AuditLogResponse {
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

interface Filters {
  search: string;
  operationType: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  page: number;
  pageSize: number;
}

const OP_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  insert: {
    label: "INSERT",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  update: {
    label: "UPDATE",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
  delete: {
    label: "DELETE",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    border: "border-red-200",
  },
  replace: {
    label: "REPLACE",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    border: "border-blue-200",
  },
  drop: {
    label: "DROP",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
    border: "border-purple-200",
  },
  rename: {
    label: "RENAME",
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    border: "border-slate-200",
  },
};

function UserCell({ user }: { user: string | PopulatedUser | null }) {
  if (!user) {
    return <span className="italic text-slate-300">—</span>;
  }

  if (typeof user === "string") {
    return (
      <span className="text-slate-400 text-xs font-mono truncate block">
        {user}
      </span>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="text-slate-800 text-xs font-semibold truncate">
        {user.name}
      </span>
      <span className="text-slate-400 text-[11px] font-mono truncate">
        {user.email}
      </span>
    </div>
  );
}

function OpBadge({ type }: { type: string }) {
  const cfg = OP_CONFIG[type] ?? {
    label: type.toUpperCase(),
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    border: "border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest font-mono ${cfg.bg} ${cfg.text} border ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function JsonValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const [collapsed, setCollapsed] = useState(depth > 1);

  if (value === null || value === undefined) {
    return <span className="text-slate-400 italic text-xs">null</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className="text-purple-600 text-xs font-mono">{String(value)}</span>
    );
  }
  if (typeof value === "number") {
    return <span className="text-blue-600 text-xs font-mono">{value}</span>;
  }
  if (typeof value === "string") {
    return (
      <span className="text-emerald-700 text-xs font-mono break-all">
        "{value}"
      </span>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0)
      return <span className="text-slate-500 text-xs font-mono">[]</span>;
    return (
      <span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-800 text-xs font-mono transition-colors"
        >
          [{collapsed ? `…${value.length} items` : ""}
        </button>
        {!collapsed && (
          <span className="block pl-4 border-l border-slate-200 ml-1 my-0.5">
            {value.map((item, i) => (
              <span key={i} className="block my-0.5">
                <span className="text-slate-400 text-xs font-mono mr-1">
                  {i}:
                </span>
                <JsonValue value={item} depth={depth + 1} />
                {i < value.length - 1 && (
                  <span className="text-slate-400">,</span>
                )}
              </span>
            ))}
          </span>
        )}
        {!collapsed && (
          <span className="text-slate-500 text-xs font-mono">]</span>
        )}
      </span>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0)
      return <span className="text-slate-500 text-xs font-mono">{"{}"}</span>;
    return (
      <span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-800 text-xs font-mono transition-colors"
        >
          {"{"}
          {collapsed ? `…${entries.length} keys` : ""}
        </button>
        {!collapsed && (
          <span className="block pl-4 border-l border-slate-200 ml-1 my-0.5">
            {entries.map(([k, v], i) => (
              <span key={k} className="block my-0.5">
                <span className="text-amber-700 text-xs font-mono mr-1">
                  "{k}":
                </span>
                <JsonValue value={v} depth={depth + 1} />
                {i < entries.length - 1 && (
                  <span className="text-slate-400">,</span>
                )}
              </span>
            ))}
          </span>
        )}
        {!collapsed && (
          <span className="text-slate-500 text-xs font-mono">{"}"}</span>
        )}
      </span>
    );
  }
  return (
    <span className="text-slate-700 text-xs font-mono">{String(value)}</span>
  );
}

function DiffViewer({
  updated,
  previous,
  removed,
}: {
  updated: Record<string, unknown> | null;
  previous: Record<string, unknown> | null;
  removed: string[];
}) {
  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    if (updated) Object.keys(updated).forEach((k) => keys.add(k));
    if (previous) Object.keys(previous).forEach((k) => keys.add(k));
    removed.forEach((k) => keys.add(k));
    return Array.from(keys);
  }, [updated, previous, removed]);

  if (allKeys.length === 0)
    return (
      <p className="text-slate-400 text-xs italic">
        No field changes recorded.
      </p>
    );

  return (
    <div className="space-y-1.5">
      {allKeys.map((key) => {
        const isRemoved = removed.includes(key);
        const prevVal = previous?.[key];
        const newVal = updated?.[key];
        return (
          <div
            key={key}
            className={`rounded-lg overflow-hidden border ${isRemoved ? "border-red-200" : "border-slate-200"}`}
          >
            <div
              className={`px-3 py-1.5 flex items-center gap-2 ${isRemoved ? "bg-red-50" : "bg-slate-50"}`}
            >
              <span className="text-xs font-mono font-semibold text-slate-700">
                {key}
              </span>
              {isRemoved && (
                <span className="text-[10px] font-bold tracking-wider text-red-600 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded-full">
                  REMOVED
                </span>
              )}
            </div>
            {!isRemoved && (
              <div className="grid grid-cols-2 divide-x divide-slate-200">
                <div className="px-3 py-2 bg-red-50/60">
                  <p className="text-[10px] font-bold tracking-widest text-red-500 mb-1">
                    PREVIOUS
                  </p>
                  {prevVal !== undefined ? (
                    <JsonValue value={prevVal} />
                  ) : (
                    <span className="text-slate-400 text-xs italic">—</span>
                  )}
                </div>
                <div className="px-3 py-2 bg-emerald-50/60">
                  <p className="text-[10px] font-bold tracking-widest text-emerald-600 mb-1">
                    UPDATED
                  </p>
                  {newVal !== undefined ? (
                    <JsonValue value={newVal} />
                  ) : (
                    <span className="text-slate-400 text-xs italic">—</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LogRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"diff" | "document">("diff");

  const hasChanges =
    log.updatedFields || log.previousFields || log.removedFields?.length > 0;

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className={`group border-b border-slate-100 cursor-pointer transition-all duration-150 ${expanded ? "bg-slate-50" : "hover:bg-slate-50/70"}`}
      >
        <td className="px-4 py-3 w-8">
          <div
            className={`w-5 h-5 rounded flex items-center justify-center text-slate-300 transition-transform duration-200 ${expanded ? "rotate-90 text-slate-500" : "group-hover:text-slate-400"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <OpBadge type={log.operationType} />
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="text-slate-800 text-sm font-medium font-mono">
              {log.collectionName}
            </span>
            <span className="text-slate-400 text-xs font-mono">
              {log.database}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <span
            className="text-slate-500 text-xs font-mono truncate max-w-[140px] block"
            title={String(log.documentId)}
          >
            {log.documentId ? (
              String(log.documentId)
            ) : (
              <span className="italic text-slate-300">—</span>
            )}
          </span>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <UserCell user={log.userId} />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex flex-col">
            <span className="text-slate-700 text-xs font-mono">
              {new Date(log.createdAt).toLocaleDateString()}
            </span>
            <span className="text-slate-400 text-xs font-mono">
              {new Date(log.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-slate-100 bg-slate-50/80">
          <td colSpan={6} className="px-6 py-4">
            <div className="space-y-4">
              {hasChanges && log.fullDocument && (
                <div className="flex gap-1 border-b border-slate-200 pb-3">
                  {hasChanges && (
                    <button
                      onClick={() => setActiveTab("diff")}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-all ${activeTab === "diff" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-700"}`}
                    >
                      Field Diff
                    </button>
                  )}
                  {log.fullDocument && (
                    <button
                      onClick={() => setActiveTab("document")}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-all ${activeTab === "document" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-700"}`}
                    >
                      Full Document
                    </button>
                  )}
                </div>
              )}

              {!hasChanges || !log.fullDocument ? (
                hasChanges ? (
                  <DiffViewer
                    updated={log.updatedFields}
                    previous={log.previousFields}
                    removed={log.removedFields ?? []}
                  />
                ) : log.fullDocument ? (
                  <div className="bg-white rounded-lg p-4 border border-slate-200 font-mono text-xs">
                    <JsonValue value={log.fullDocument} depth={0} />
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">
                    No document data available.
                  </p>
                )
              ) : activeTab === "diff" ? (
                <DiffViewer
                  updated={log.updatedFields}
                  previous={log.previousFields}
                  removed={log.removedFields ?? []}
                />
              ) : (
                <div className="bg-white rounded-lg p-4 border border-slate-200 font-mono text-xs">
                  <JsonValue value={log.fullDocument} depth={0} />
                </div>
              )}

              {log.removedFields?.length > 0 && activeTab !== "diff" && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-slate-400 font-mono self-center">
                    Removed:
                  </span>
                  {log.removedFields.map((f) => (
                    <span
                      key={f}
                      className="text-[10px] font-mono font-bold tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function MobileCard({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${expanded ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-white"}`}
    >
      <div
        className="px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            <OpBadge type={log.operationType} />
            <span className="text-slate-800 text-sm font-mono font-semibold">
              {log.collectionName}
            </span>
            <span className="text-slate-400 text-xs font-mono">
              {log.database}
            </span>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-slate-600 text-xs font-mono">
              {new Date(log.createdAt).toLocaleDateString()}
            </p>
            <p className="text-slate-400 text-xs font-mono">
              {new Date(log.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        {log.documentId && (
          <p className="text-slate-400 text-xs font-mono mt-2 truncate">
            ID: {String(log.documentId)}
          </p>
        )}
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-200 pt-3">
          <DiffViewer
            updated={log.updatedFields}
            previous={log.previousFields}
            removed={log.removedFields ?? []}
          />
          {log.fullDocument && (
            <details className="mt-3">
              <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-800 transition-colors">
                Full Document
              </summary>
              <div className="mt-2 bg-white rounded-lg p-3 border border-slate-200 font-mono text-xs">
                <JsonValue value={log.fullDocument} depth={0} />
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton className="h-4 w-full bg-slate-100 rounded" />
        </td>
      ))}
    </tr>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path
        fillRule="evenodd"
        d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const fetchAuditLogs = async (filters: Filters): Promise<AuditLogResponse> => {
  const params: Record<string, string | number> = {
    page: filters.page,
    pageSize: filters.pageSize,
  };
  if (filters.search) params.search = filters.search;
  if (filters.operationType && filters.operationType !== "all")
    params.operationType = filters.operationType;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom.toISOString();
  if (filters.dateTo) params.dateTo = filters.dateTo.toISOString();

  const { data } = await axios.get<AuditLogResponse>(
    `${import.meta.env.VITE_URL}/api/audit/getAll`,
    { params },
  );
  return data;
};

export default function AuditLogViewer() {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    operationType: "all",
    dateFrom: undefined,
    dateTo: undefined,
    page: 1,
    pageSize: 20,
  });

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => fetchAuditLogs(filters),
    placeholderData: (prev) => prev,
  });

  const handleSearch = useCallback(() => {
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleOperationType = useCallback((val: string) => {
    setFilters((f) => ({ ...f, operationType: val, page: 1 }));
  }, []);

  const totalPages = data ? Math.ceil(data.total / filters.pageSize) : 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 text-slate-800">
        <div className="border-b border-slate-200 bg-white shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-amber-600"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="audit-title text-lg font-bold text-slate-900 tracking-tight">
                  Audit Log
                </h1>
                <p className="text-[10px] text-slate-400 tracking-widest uppercase">
                  Database Change Stream
                </p>
              </div>
            </div>
            {data && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {data.total.toLocaleString()} records
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Search collection, operation, document ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-100 font-mono text-xs h-9"
              />
              <Button
                onClick={handleSearch}
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 hover:border-amber-300 h-9 px-4 text-xs font-semibold transition-all shadow-none"
                variant="outline"
              >
                Search
              </Button>
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.operationType}
                onValueChange={handleOperationType}
              >
                <SelectTrigger className="bg-white border-slate-200 text-slate-600 focus:border-amber-400 h-9 text-xs font-mono w-36">
                  <SelectValue placeholder="Operation" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {["all", "insert", "update", "delete"].map((op) => (
                    <SelectItem
                      key={op}
                      value={op}
                      className="text-slate-700 text-xs font-mono focus:bg-slate-50 focus:text-slate-900"
                    >
                      {op === "all" ? "All Operations" : op.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white border-slate-200 text-slate-500 hover:text-slate-800 h-9 px-3 text-xs font-mono hover:bg-slate-50 hover:border-slate-300"
                  >
                    <CalendarIcon />
                    <span className="ml-2 hidden sm:inline">
                      {filters.dateFrom || filters.dateTo
                        ? `${filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : "∞"} — ${filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : "∞"}`
                        : "Date Range"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="bg-white border-slate-200 p-4 w-auto shadow-lg"
                  align="end"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400 tracking-widest uppercase font-mono mb-2">
                        From
                      </p>
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(d) =>
                          setFilters((f) => ({ ...f, dateFrom: d, page: 1 }))
                        }
                        className="text-slate-700"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 tracking-widest uppercase font-mono mb-2">
                        To
                      </p>
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(d) =>
                          setFilters((f) => ({ ...f, dateTo: d, page: 1 }))
                        }
                        className="text-slate-700"
                      />
                    </div>
                  </div>
                  {(filters.dateFrom || filters.dateTo) && (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          dateFrom: undefined,
                          dateTo: undefined,
                          page: 1,
                        }))
                      }
                      className="mt-3 w-full text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 h-7 font-mono"
                    >
                      Clear dates
                    </Button>
                  )}
                </PopoverContent>
              </Popover>

              {(filters.search ||
                filters.operationType !== "all" ||
                filters.dateFrom ||
                filters.dateTo) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchInput("");
                    setFilters({
                      search: "",
                      operationType: "all",
                      dateFrom: undefined,
                      dateTo: undefined,
                      page: 1,
                      pageSize: 20,
                    });
                  }}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-9 px-3 text-xs font-mono border border-slate-200"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {isError && (
            <div className="border border-red-200 bg-red-50 rounded-xl p-6 text-center mb-6">
              <p className="text-red-600 font-mono text-sm">
                Failed to load audit logs.
              </p>
              <p className="text-slate-500 text-xs mt-1 font-mono">
                Check API connectivity and try again.
              </p>
            </div>
          )}

          <div className="hidden md:block">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div
                className={`transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-60" : "opacity-100"}`}
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="w-8 px-4 py-3" />
                      <th className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        Operation
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        Collection
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase hidden md:table-cell">
                        Document ID
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase hidden lg:table-cell">
                        User ID
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading &&
                      [...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
                    {!isLoading && data?.data.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <p className="text-slate-400 font-mono text-sm">
                            No audit logs found.
                          </p>
                          <p className="text-slate-300 font-mono text-xs mt-1">
                            Try adjusting your filters.
                          </p>
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      data?.data.map((log) => (
                        <LogRow key={log._id} log={log} />
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {isLoading &&
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-xl p-4 space-y-2 bg-white"
                >
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-4 bg-slate-100 rounded" />
                  ))}
                </div>
              ))}
            {!isLoading &&
              data?.data.map((log) => <MobileCard key={log._id} log={log} />)}
            {!isLoading && data?.data.length === 0 && (
              <div className="border border-slate-200 rounded-xl p-10 text-center bg-white">
                <p className="text-slate-400 font-mono text-sm">
                  No audit logs found.
                </p>
              </div>
            )}
          </div>

          {data && totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-400 font-mono">
                  {(filters.page - 1) * filters.pageSize + 1}–
                  {Math.min(filters.page * filters.pageSize, data.total)} of{" "}
                  {data.total.toLocaleString()}
                </p>
                <Select
                  value={String(filters.pageSize)}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, pageSize: Number(v), page: 1 }))
                  }
                >
                  <SelectTrigger className="bg-white border-slate-200 text-slate-500 h-7 text-xs w-20 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {[10, 20, 50, 100].map((n) => (
                      <SelectItem
                        key={n}
                        value={String(n)}
                        className="text-xs font-mono text-slate-700 focus:bg-slate-50"
                      >
                        {n} / pg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  onClick={() => setFilters((f) => ({ ...f, page: 1 }))}
                  disabled={filters.page === 1}
                  className="bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 h-7 px-2 text-xs font-mono disabled:opacity-30"
                >
                  «
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: f.page - 1 }))
                  }
                  disabled={filters.page === 1}
                  className="bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 h-7 px-2 text-xs font-mono disabled:opacity-30"
                >
                  ‹
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(7, totalPages))].map((_, i) => {
                    let pg: number;
                    if (totalPages <= 7) pg = i + 1;
                    else if (filters.page <= 4) pg = i + 1;
                    else if (filters.page >= totalPages - 3)
                      pg = totalPages - 6 + i;
                    else pg = filters.page - 3 + i;
                    return (
                      <button
                        key={pg}
                        onClick={() => setFilters((f) => ({ ...f, page: pg }))}
                        className={`w-7 h-7 rounded text-xs font-mono transition-all ${filters.page === pg ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"}`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: f.page + 1 }))
                  }
                  disabled={filters.page === totalPages}
                  className="bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 h-7 px-2 text-xs font-mono disabled:opacity-30"
                >
                  ›
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: totalPages }))
                  }
                  disabled={filters.page === totalPages}
                  className="bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 h-7 px-2 text-xs font-mono disabled:opacity-30"
                >
                  »
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
