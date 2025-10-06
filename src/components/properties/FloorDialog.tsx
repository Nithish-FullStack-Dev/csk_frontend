import { useState } from "react";
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
}

export const FloorDialog = ({
  open,
  onOpenChange,
  floor,
  buildingId,
  mode,
}: FloorDialogProps) => {
  const [formData, setFormData] = useState({
    floorNumber: floor?.floorNumber || 1,
    unitType: floor?.unitType || "",
    totalSubUnits: floor?.totalSubUnits || 1,
    availableSubUnits: floor?.availableSubUnits || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, this would save to the database
    toast.success(
      mode === "add"
        ? "Floor/Unit created successfully"
        : "Floor/Unit updated successfully"
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
                step={1}
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
                placeholder="e.g., 2 BHK, 3 BHK, Penthouse"
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
                step={1}
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
                step={1}
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
              type="button"
              variant="outline"
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
