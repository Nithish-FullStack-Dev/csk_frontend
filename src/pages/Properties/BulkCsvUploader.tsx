// src\pages\Properties\BulkCsvUploader.tsx
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
import { Upload, FileSpreadsheet } from "lucide-react";

interface CsvRow {
  floorNumber: number;
  unitType: string;
  unitCount: number;
  sqft: number;
  facing: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  buildingId: string;
}

const VALID_FACING = [
  "North",
  "East",
  "West",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

export default function BulkCsvUploader({
  open,
  onOpenChange,
  buildingId,
}: Props) {
  const queryClient = useQueryClient();

  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");

  const parseCsv = (file: File) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed = result.data.map((r) => ({
          floorNumber: Number(r.floorNumber),
          unitType: r.unitType,
          unitCount: Number(r.unitCount),
          sqft: Number(r.sqft),
          facing: r.facing,
        }));

        setRows(parsed);
        setFileName(file.name);
      },
      error: () => toast.error("CSV parsing failed"),
    });
  };

  const validateRows = () => {
    for (const row of rows) {
      if (!row.floorNumber || !row.unitType || !row.unitCount)
        return "Missing required fields";

      if (!VALID_FACING.includes(row.facing))
        return `Invalid facing for floor ${row.floorNumber}`;
    }
    return null;
  };

  const createFloor = async (payload: any) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_URL}/api/floor/createFloor`,
      payload,
      { withCredentials: true },
    );
    return data.data;
  };

  const createUnit = async (payload: FormData) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_URL}/api/unit/createUnit`,
      payload,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data.data;
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const validationError = validateRows();
      if (validationError) throw new Error(validationError);

      const grouped: Record<number, CsvRow[]> = {};

      rows.forEach((r) => {
        if (!grouped[r.floorNumber]) grouped[r.floorNumber] = [];
        grouped[r.floorNumber].push(r);
      });

      for (const floorNumber of Object.keys(grouped)) {
        const mix = grouped[Number(floorNumber)];

        const floorRes = await createFloor({
          buildingId,
          floorNumber: Number(floorNumber),
          unitType: "Mixed",
          totalSubUnits: mix.reduce((a, b) => a + b.unitCount, 0),
          availableSubUnits: mix.reduce((a, b) => a + b.unitCount, 0),
        });

        const floorId = floorRes._id;

        for (const unit of mix) {
          for (let i = 1; i <= unit.unitCount; i++) {
            const formData = new FormData();
            formData.append("buildingId", buildingId);
            formData.append("floorId", floorId);
            formData.append("plotNo", `${floorNumber}-${unit.unitType}-${i}`);
            formData.append("unitType", unit.unitType);
            formData.append("extent", unit.sqft.toString());
            formData.append("villaFacing", unit.facing);
            formData.append("bulk", "true"); // IMPORTANT

            await createUnit(formData);
          }
        }
      }
    },
    onSuccess: () => {
      toast.success("CSV imported successfully");
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
      onOpenChange(false);
    },
    onError: (err: any) => toast.error(err.message || "CSV generation failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload CSV – Floors & Units</DialogTitle>
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

              {fileName && (
                <div className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4" />
                  {fileName}
                </div>
              )}
            </CardContent>
          </Card>

          {rows.length > 0 && (
            <Card>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th>Floor</th>
                      <th>Type</th>
                      <th>Count</th>
                      <th>Sqft</th>
                      <th>Facing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b">
                        <td>{r.floorNumber}</td>
                        <td>{r.unitType}</td>
                        <td>{r.unitCount}</td>
                        <td>{r.sqft}</td>
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
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || rows.length === 0}
          >
            {generateMutation.isPending ? "Generating..." : "Generate from CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
