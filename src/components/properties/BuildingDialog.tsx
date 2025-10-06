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
}

export const BuildingDialog = ({
  open,
  onOpenChange,
  building,
  mode,
}: BuildingDialogProps) => {
  const [formData, setFormData] = useState({
    projectName: building?.projectName || "",
    location: building?.location || "",
    propertyType: building?.propertyType || "Apartment Complex",
    totalUnits: building?.totalUnits || 1,
    constructionStatus: building?.constructionStatus || "Planned",
    completionDate: building?.completionDate || "",
    description: building?.description || "",
    municipalPermission: building?.municipalPermission || false,
    googleMapsLocation: building?.googleMapsLocation || "",
    thumbnailUrl: building?.thumbnailUrl || "",
    brochureUrl: building?.brochureUrl || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, this would save to the database
    toast.success(
      mode === "add"
        ? "Building created successfully"
        : "Building updated successfully"
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Building" : "Edit Building"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) =>
                  setFormData({ ...formData, propertyType: value as any })
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
                  <SelectItem value="Land Parcel">Land Parcel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="constructionStatus">Construction Status</Label>
              <Select
                value={formData.constructionStatus}
                onValueChange={(value) =>
                  setFormData({ ...formData, constructionStatus: value as any })
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

          <div className="space-y-2">
            <Label htmlFor="totalUnits">Total Units *</Label>
            <Input
              id="totalUnits"
              type="number"
              min={1}
              step={1}
              value={formData.totalUnits}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalUnits: Math.max(
                    1,
                    Math.floor(Number(e.target.value) || 1)
                  ),
                })
              }
              required
            />
            <p className="text-sm text-muted-foreground">
              Units will be auto-created when saving. Display-only counts shown
              elsewhere.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="completionDate">Completion Date</Label>
            <Input
              id="completionDate"
              type="date"
              value={formData.completionDate}
              onChange={(e) =>
                setFormData({ ...formData, completionDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) =>
                setFormData({ ...formData, thumbnailUrl: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleMapsLocation">Google Maps URL</Label>
            <Input
              id="googleMapsLocation"
              value={formData.googleMapsLocation}
              onChange={(e) =>
                setFormData({ ...formData, googleMapsLocation: e.target.value })
              }
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brochure">Project Brochure (PDF)</Label>
            <input
              id="brochure"
              type="file"
              accept="application/pdf"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.type !== "application/pdf") {
                  toast.error("Please upload a PDF file");
                  return;
                }
                const url = URL.createObjectURL(file);
                setFormData({ ...formData, brochureUrl: url });
                toast.success("Brochure uploaded successfully");
              }}
            />
            {formData.brochureUrl && (
              <p className="text-sm text-muted-foreground">
                ✓ Brochure uploaded (shareable to enquirers)
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="municipalPermission"
              checked={formData.municipalPermission}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, municipalPermission: checked })
              }
            />
            <Label htmlFor="municipalPermission">
              Municipal Permission Obtained
            </Label>
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
              {mode === "add" ? "Create Building" : "Update Building"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
