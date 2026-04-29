// src\components\properties\BulkInnerPlotGenerator.tsx
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
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "../ui/label";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  openPlotId: string;
}

export default function BulkInnerPlotGenerator({
  open,
  onOpenChange,
  openPlotId,
}: Props) {
  const queryClient = useQueryClient();

  const [totalPlots, setTotalPlots] = useState(10);
  const [area, setArea] = useState<number>(0);
  const [facing, setFacing] = useState<string>("East");
  const [plotType, setPlotType] = useState<string>("Residential");
  const [status, setStatus] = useState<string>("Available");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!totalPlots || !area) {
        toast.error("Total plots and area are required");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_URL}/api/innerPlot/generate-bulk`,
        {
          openPlotId,
          totalPlots,
          area,
          facing,
          plotType,
          status,
        },
        { withCredentials: true },
      );
    },
    onSuccess: async () => {
      toast.success("Inner plots generated successfully");

      await queryClient.invalidateQueries({
        queryKey: ["inner-plots", openPlotId],
      });

      await queryClient.refetchQueries({
        queryKey: ["inner-plots", openPlotId],
      });

      onOpenChange(false);
    },

    onError: () => toast.error("Bulk generation failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Bulk Generate Inner Plots</DialogTitle>
        </DialogHeader>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totalPlots">
              Total Plots (existing plots + number of plots need to add)
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="Total plots (ex: 200)"
              value={totalPlots}
              onChange={(e) => setTotalPlots(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plotArea">Plot Area (Sq.Yards / Sq.Ft)</Label>
            <Input
              type="number"
              min={0}
              placeholder="Plot area"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Facing</Label>
            <Select value={facing} onValueChange={setFacing}>
              <SelectTrigger>
                <SelectValue placeholder="Facing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="North">North</SelectItem>
                <SelectItem value="South">South</SelectItem>
                <SelectItem value="East">East</SelectItem>
                <SelectItem value="West">West</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Plot Type</Label>
            <Select value={plotType} onValueChange={setPlotType}>
              <SelectTrigger>
                <SelectValue placeholder="Plot Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Road">Road</SelectItem>
                <SelectItem value="OpenSpace">Open Space</SelectItem>
                <SelectItem value="WasteLand">Waste Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !totalPlots || !area}
          >
            Generate Plots
          </Button>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
