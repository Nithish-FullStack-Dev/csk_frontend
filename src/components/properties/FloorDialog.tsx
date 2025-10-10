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
  isSaving?: boolean;
}

export const FloorDialog = ({
  open,
  onOpenChange,
  floor,
  buildingId,
  mode,
  onSave,
  isSaving = false,
}: FloorDialogProps) => {
  const [formData, setFormData] = useState<FloorUnit>({
    buildingId,
    floorNumber: 1,
    unitType: "",
    totalSubUnits: 1,
    availableSubUnits: 1,
    priceRange: undefined,
  });

  useEffect(() => {
    if (floor) {
      setFormData({
        ...floor,
        buildingId,
        priceRange: floor.priceRange || undefined,
      });
    } else {
      resetForm();
    }
  }, [floor, buildingId, open]);

  const resetForm = () => {
    setFormData({
      buildingId,
      floorNumber: 1,
      unitType: "",
      totalSubUnits: 1,
      availableSubUnits: 1,
      priceRange: undefined,
    });
  };

  const validateForm = () => {
    if (!formData.unitType.trim()) {
      toast.error("Unit Type is required");
      return false;
    }
    if (formData.floorNumber < 1) {
      toast.error("Floor Number must be at least 1");
      return false;
    }
    if (formData.totalSubUnits < 1) {
      toast.error("Total Sub-Units must be at least 1");
      return false;
    }
    if (formData.availableSubUnits > formData.totalSubUnits) {
      toast.error("Available Sub-Units cannot exceed Total Sub-Units");
      return false;
    }
    if (
      formData.priceRange &&
      (formData.priceRange.min < 0 ||
        formData.priceRange.max < 0 ||
        formData.priceRange.min > formData.priceRange.max)
    ) {
      toast.error(
        "Price Range must have valid min and max values (min <= max)"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave(
      {
        ...formData,
        // _id: floor?._id || "",
      },
      mode
    );
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh]">
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
                placeholder="e.g., 2 BHK, 3 BHK"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceMin">Price Range Min</Label>
              <Input
                id="priceMin"
                type="number"
                min={0}
                value={formData.priceRange?.min || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priceRange: {
                      min: Number(e.target.value) || 0,
                      max: formData.priceRange?.max || 0,
                    },
                  })
                }
                placeholder="e.g., 500000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceMax">Price Range Max</Label>
              <Input
                id="priceMax"
                type="number"
                min={0}
                value={formData.priceRange?.max || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priceRange: {
                      min: formData.priceRange?.min || 0,
                      max: Number(e.target.value) || 0,
                    },
                  })
                }
                placeholder="e.g., 1000000"
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
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : mode === "add"
                ? "Create Floor/Unit"
                : "Update Floor/Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
