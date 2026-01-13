"use client";

import { useState, useRef, useEffect } from "react";

export function IconSelect({
  value,
  options,
}: {
  value: React.ReactNode;
  options: { icon: React.ReactNode; onClick: () => void }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 rounded-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
      >
        {value}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] shadow-md p-1 flex gap-1">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                opt.onClick();
                setOpen(false);
              }}
              className="h-8 w-8 rounded-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              {opt.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
