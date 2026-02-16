"use client";

import { useState } from "react";
import axios from "axios";
import Papa from "papaparse";
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
    onSuccess: () => {
      toast.success("CSV uploaded successfully");
      queryClient.invalidateQueries({
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
          <DialogTitle>Upload Inner Plot CSV</DialogTitle>
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
