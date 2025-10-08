// src/components/properties/FloorDialog.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloorUnit } from "@/types/building";
import { toast } from "sonner";

interface FloorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floor?: FloorUnit;
  buildingId: string;
  mode: "add" | "edit";
  onSave: (data: FloorUnit, mode: "add" | "edit") => void;
}

export const FloorDialog = ({
  open,
  onOpenChange,
  floor,
  buildingId,
  mode,
  onSave,
}: FloorDialogProps) => {
  const [formData, setFormData] = useState<FloorUnit>({
    id: floor?.id || Date.now().toString(),
    buildingId,
    floorNumber: floor?.floorNumber || 1,
    unitType: floor?.unitType || "",
    totalSubUnits: floor?.totalSubUnits || 1,
    availableSubUnits: floor?.availableSubUnits || 1,
  });

  useEffect(() => {
    if (floor) setFormData({ ...floor });
    else
      setFormData({
        id: Date.now().toString(),
        buildingId,
        floorNumber: 1,
        unitType: "",
        totalSubUnits: 1,
        availableSubUnits: 1,
      });
  }, [floor, buildingId, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, mode);
    toast.success(mode === "add" ? "Floor created" : "Floor updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Floor/Unit" : "Edit Floor/Unit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floorNumber">Floor Number *</Label>
              <Input
                id="floorNumber"
                type="number"
                min={1}
                value={formData.floorNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    floorNumber: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitType">Unit Type *</Label>
              <Input
                id="unitType"
                value={formData.unitType}
                onChange={(e) =>
                  setFormData({ ...formData, unitType: e.target.value })
                }
                placeholder="e.g., 2 BHK"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalSubUnits">Total Sub-Units *</Label>
              <Input
                id="totalSubUnits"
                type="number"
                min={1}
                value={formData.totalSubUnits}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalSubUnits: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableSubUnits">Available Sub-Units</Label>
              <Input
                id="availableSubUnits"
                type="number"
                min={0}
                value={formData.availableSubUnits}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    availableSubUnits: Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === "add" ? "Create Floor/Unit" : "Update Floor/Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
