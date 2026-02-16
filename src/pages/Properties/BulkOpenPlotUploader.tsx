import { useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CsvRow {
  extentSqYards: number;
  facing: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectName: string;
}

export default function BulkOpenPlotUploader({
  open,
  onOpenChange,
  projectName,
}: Props) {
  const queryClient = useQueryClient();

  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [plotType, setPlotType] = useState("Residential");
  const [approval, setApproval] = useState("DTCP");
  const [gated, setGated] = useState("false");

  const parseCsv = (file: File) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data);
        setFileName(file.name);
      },
      error: () => toast.error("CSV parsing failed"),
    });
  };

  const bulkMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([Papa.unparse(rows)], { type: "text/csv" }),
      );
      formData.append("projectName", projectName);
      formData.append("plotType", plotType);
      formData.append("approval", approval);
      formData.append("isGatedCommunity", gated);

      await axios.post(
        `${import.meta.env.VITE_URL}/api/openPlot/bulkCreate`,
        formData,
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      toast.success("Bulk plots created");
      queryClient.invalidateQueries({ queryKey: ["openPlots"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Bulk creation failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Open Plots</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) parseCsv(file);
                }}
              />

              {fileName && <p className="text-sm">{fileName}</p>}

              <div className="grid grid-cols-3 gap-4">
                <Select value={plotType} onValueChange={setPlotType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={approval} onValueChange={setApproval}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DTCP">DTCP</SelectItem>
                    <SelectItem value="HMDA">HMDA</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={gated} onValueChange={setGated}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Gated</SelectItem>
                    <SelectItem value="false">Open</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {rows.length > 0 && (
            <Card>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th>Extent</th>
                      <th>Facing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b">
                        <td>{r.extentSqYards}</td>
                        <td>{r.facing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => bulkMutation.mutate()}
            disabled={bulkMutation.isPending || rows.length === 0}
          >
            Generate Plots
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
