// src/components/properties/BuildingDialog.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Building } from "@/types/building";
import { toast } from "sonner";

interface BuildingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  building?: Building;
  mode: "add" | "edit";
  onSave: (data: Partial<Building>) => void;
}

export const BuildingDialog = ({
  open,
  onOpenChange,
  building,
  mode,
  onSave,
}: BuildingDialogProps) => {
  const [formData, setFormData] = useState<Partial<Building>>({
    projectName: "",
    location: "",
    propertyType: "Apartment Complex",
    totalUnits: 0,
    availableUnits: 0,
    soldUnits: 0,
    constructionStatus: "Planned",
    completionDate: "",
    description: "",
    municipalPermission: false,
    thumbnailUrl: "",
    brochureUrl: null,
    googleMapsLocation: undefined,
  });

  useEffect(() => {
    if (building) setFormData({ ...building });
    else
      setFormData({
        projectName: "",
        location: "",
        propertyType: "Apartment Complex",
        totalUnits: 0,
        availableUnits: 0,
        soldUnits: 0,
        constructionStatus: "Planned",
        completionDate: "",
        description: "",
        municipalPermission: false,
        thumbnailUrl: "",
        brochureUrl: null,
        googleMapsLocation: undefined,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.location) {
      toast.error("Please fill required fields");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Building" : "Edit Building"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project Name *</Label>
              <Input
                value={formData.projectName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Location *</Label>
              <Input
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Property Type</Label>
              <Select
                value={String(formData.propertyType || "Apartment Complex")}
                onValueChange={(v) =>
                  setFormData({ ...formData, propertyType: v as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment Complex">
                    Apartment Complex
                  </SelectItem>
                  <SelectItem value="Villa Complex">Villa Complex</SelectItem>
                  <SelectItem value="Plot Development">
                    Plot Development
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Construction Status</Label>
              <Select
                value={String(formData.constructionStatus || "Planned")}
                onValueChange={(v) =>
                  setFormData({ ...formData, constructionStatus: v as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Under Construction">
                    Under Construction
                  </SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Total Units *</Label>
              <Input
                type="number"
                min={1}
                value={String(formData.totalUnits || 0)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalUnits: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div>
              <Label>Available Units</Label>
              <Input
                type="number"
                min={0}
                value={String(formData.availableUnits || 0)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    availableUnits: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Sold Units</Label>
              <Input
                type="number"
                min={0}
                value={String(formData.soldUnits || 0)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    soldUnits: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label>Completion Date</Label>
            <Input
              type="date"
              value={formData.completionDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, completionDate: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Thumbnail URL</Label>
            <Input
              value={formData.thumbnailUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, thumbnailUrl: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div>
            <Label>Project Brochure (PDF)</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.type !== "application/pdf") {
                    toast.error("Only PDF allowed");
                    return;
                  }
                  const url = URL.createObjectURL(file);
                  setFormData((p) => ({ ...p, brochureUrl: url }));
                  toast.success("Brochure uploaded");
                }
              }}
            />
            {formData.brochureUrl && (
              <p className="text-sm text-muted-foreground mt-1">
                ✓ Brochure uploaded and ready to share
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={!!formData.municipalPermission}
              onCheckedChange={(v) =>
                setFormData({ ...formData, municipalPermission: !!v })
              }
            />
            <Label>Municipal Permission Obtained</Label>
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
              {mode === "add" ? "Create" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
