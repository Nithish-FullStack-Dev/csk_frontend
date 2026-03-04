// src\components\properties\CsvInnerPlotUploader.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  openPlotId: string;
}

export default function CsvInnerPlotUploader({
  open,
  onOpenChange,
  openPlotId,
}: Props) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("openPlotId", openPlotId);

      await axios.post(
        `${import.meta.env.VITE_URL}/api/innerPlot/csv-upload`,
        formData,
        { withCredentials: true },
      );
    },
    onSuccess: async () => {
      toast.success("CSV uploaded successfully");

      await queryClient.invalidateQueries({
        queryKey: ["inner-plots", openPlotId],
      });

      await queryClient.refetchQueries({
        queryKey: ["inner-plots", openPlotId],
      });

      onOpenChange(false);
    },

    onError: () => toast.error("CSV upload failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-lg font-semibold">
              Upload Inner Plot CSV
            </DialogTitle>
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => {
                const link = document.createElement("a");
                link.href = "/CSV-bulk-plot.csv";
                link.download = "CSV-bulk-plot.csv";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Download Template
            </Button>
          </div>
        </DialogHeader>

        <Input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <Button onClick={() => mutation.mutate()} disabled={!file}>
          Upload CSV
        </Button>
      </DialogContent>
    </Dialog>
  );
}
